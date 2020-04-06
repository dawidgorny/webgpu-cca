/// <reference path="../node_modules/@webgpu/types/index.d.ts" />

// https://github.com/austinEng/webgpu-samples

import { loadShader } from './helpers'

const numParticles = 15000;
let t = 0;

export default class Renderer {
    canvas: HTMLCanvasElement;

    // API Data Structures
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    swapchain: GPUSwapChain;

    renderPassDescriptor: GPURenderPassDescriptor;

    computePipeline: GPUComputePipeline;

    compModule: GPUShaderModule;

    particleBuffers: Array<any>;
    particleBindGroups: Array<any>;

    verticesBuffer: GPUBuffer;

    renderPipeline: GPURenderPipeline;
    vertModule: GPUShaderModule;
    fragModule: GPUShaderModule;


    constructor(canvas) {
        this.canvas = canvas;
    }

    // Start the rendering engine
    async start() {
        if (await this.initializeAPI()) {
            await this.initializeResources();
            this.render();
        }
    }

    // Initialize WebGPU
    async initializeAPI(): Promise<boolean> {
        try {
            const entry: GPU = navigator.gpu;
            if (!entry) {
                return false;
            }
            this.adapter = await entry.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.defaultQueue;
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }


    async initializeResources() {
        const context: GPUCanvasContext = this.canvas.getContext('gpupresent') as any;

        this.swapchain = context.configureSwapChain({
            device: this.device,
            format: "bgra8unorm"
          });

        const depthTexture = this.device.createTexture({
            size: { width: this.canvas.width, height: this.canvas.height, depth: 1 },
            format: "depth24plus-stencil8",
            usage: GPUTextureUsage.OUTPUT_ATTACHMENT
        });

        this.renderPassDescriptor = {
            colorAttachments: [{
                attachment: undefined,  // Assigned later
                loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            }],
            depthStencilAttachment: {
                attachment: depthTexture.createView(),
                depthLoadValue: 1.0,
                depthStoreOp: "store",
                stencilLoadValue: 0,
                stencilStoreOp: "store",
            }
        };

        // Compute pipeline
        
        try {
            const csmDesc: any = { 
                code: await loadShader('/assets/shaders/boids.comp.spv') 
            };
            this.compModule = this.device.createShaderModule(csmDesc);
        } catch (e) {
            console.error(e);
        }

        const computeBindGroupLayout = this.device.createBindGroupLayout({
            bindings: [
              { binding: 0, visibility: GPUShaderStage.COMPUTE, type: "uniform-buffer" },
              { binding: 1, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" },
              { binding: 2, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" },
            ],
        });

        const computePipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [computeBindGroupLayout],
        });

        this.computePipeline = this.device.createComputePipeline({
            layout: computePipelineLayout,
            computeStage: {
              module: this.compModule,
              entryPoint: "main"
            },
        });

        //

        const simParamData = new Float32Array([
            0.04,  // deltaT;
            0.1,   // rule1Distance;
            0.025, // rule2Distance;
            0.025, // rule3Distance;
            0.02,  // rule1Scale;
            0.05,  // rule2Scale;
            0.005  // rule3Scale;
          ]);
          const simParamBuffer = this.device.createBuffer({
            size: simParamData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
          });
          simParamBuffer.setSubData(0, simParamData);

        const initialParticleData = new Float32Array(numParticles * 4);
        for (let i = 0; i < numParticles; ++i) {
            initialParticleData[4 * i + 0] = 2 * (Math.random() - 0.5);
            initialParticleData[4 * i + 1] = 2 * (Math.random() - 0.5);
            initialParticleData[4 * i + 2] = 2 * (Math.random() - 0.5) * 0.1;
            initialParticleData[4 * i + 3] = 2 * (Math.random() - 0.5) * 0.1;
        }

        const particleBuffers = this.particleBuffers = new Array(2);
        const particleBindGroups = this.particleBindGroups = new Array(2);
        for (let i = 0; i < 2; ++i) {
            particleBuffers[i] = this.device.createBuffer({
            size: initialParticleData.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE
            });
            particleBuffers[i].setSubData(0, initialParticleData);
        }

        for (let i = 0; i < 2; ++i) {
            particleBindGroups[i] = this.device.createBindGroup({
            layout: computeBindGroupLayout,
            bindings: [{
                binding: 0,
                resource: {
                buffer: simParamBuffer,
                offset: 0,
                size: simParamData.byteLength
                },
            }, {
                binding: 1,
                resource: {
                buffer: particleBuffers[i],
                offset: 0,
                size: initialParticleData.byteLength,
                },
            }, {
                binding: 2,
                resource: {
                buffer: particleBuffers[(i + 1) % 2],
                offset: 0,
                size: initialParticleData.byteLength,
                },
            }],
            });
        }

        //

        const vertexBufferData = new Float32Array([-0.01, -0.02, 0.01, -0.02, 0.00, 0.02]);
        this.verticesBuffer = this.device.createBuffer({
            size: vertexBufferData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.verticesBuffer.setSubData(0, vertexBufferData);

        //

        try {
            const vsmDesc: any = { 
                code: await loadShader('/assets/shaders/boids.vert.spv') 
            };
            this.vertModule = this.device.createShaderModule(vsmDesc);
        } catch (e) {
            console.error(e);
        }

        try {
            const fsmDesc: any = { 
                code: await loadShader('/assets/shaders/boids.frag.spv') 
            };
            this.fragModule = this.device.createShaderModule(fsmDesc);
        } catch (e) {
            console.error(e);
        }

        this.renderPipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [] }),
        
            vertexStage: {
              module: this.vertModule,
              entryPoint: "main"
            },
            fragmentStage: {
              module: this.fragModule,
              entryPoint: "main"
            },
        
            primitiveTopology: "triangle-list",
        
            depthStencilState: {
              depthWriteEnabled: true,
              depthCompare: "less",
              format: "depth24plus-stencil8",
            },
        
            vertexState: {
              vertexBuffers: [{
                // instanced particles buffer
                arrayStride: 4 * 4,
                stepMode: "instance",
                attributes: [{
                  // instance position
                  shaderLocation: 0,
                  offset: 0,
                  format: "float2"
                }, {
                  // instance velocity
                  shaderLocation: 1,
                  offset: 2 * 4,
                  format: "float2"
                }],
              }, {
                // vertex buffer
                arrayStride: 2 * 4,
                stepMode: "vertex",
                attributes: [{
                  // vertex positions
                  shaderLocation: 2,
                  offset: 0,
                  format: "float2"
                }],
              }],
            },
        
            colorStates: [{
              format: "bgra8unorm",
            }],
        });
    }


    render = () => {
       
        this.renderPassDescriptor.colorAttachments[0].attachment = this.swapchain.getCurrentTexture().createView();

        const commandEncoder = this.device.createCommandEncoder({});
        {
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(this.computePipeline);
            passEncoder.setBindGroup(0, this.particleBindGroups[t % 2]);
            passEncoder.dispatch(numParticles);
            passEncoder.endPass();
        }
        {
        const passEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);
            passEncoder.setPipeline(this.renderPipeline);
            passEncoder.setVertexBuffer(0, this.particleBuffers[(t + 1) % 2]);
            passEncoder.setVertexBuffer(1, this.verticesBuffer);
            passEncoder.draw(3, numParticles, 0, 0);
            passEncoder.endPass();
        }
        this.device.defaultQueue.submit([commandEncoder.finish()]);

        ++t;

        // ➿ Refresh canvas
        requestAnimationFrame(this.render);
    };
}