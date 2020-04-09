/// <reference path="../node_modules/@webgpu/types/index.d.ts" />

import * as Tweakpane from 'tweakpane'
import { loadShader, align, createBuffer, range } from './helpers'

// Position Vertex Buffer Data
const positions = new Float32Array([
    1.0, -1.0, 0.0,
   -1.0, -1.0, 0.0,
   -1.0,  1.0, 0.0,
   -1.0,  1.0, 0.0,
    1.0,  1.0, 0.0,
    1.0, -1.0, 0.0
]);

const uvs = new Float32Array([
    1.0,  1.0,
    0.0,  1.0,
    0.0,  0.0,
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0
]);

// Color Vertex Buffer Data
const colors = new Float32Array([
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0, 
    0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 
    1.0, 0.0, 0.0 
]);

// Index Buffer Data
const indices = new Uint16Array([ 0, 1, 2, 3, 4, 5 ]);

let t = 0;

let t0 = performance.now();
let tp = performance.now();
let td = 0;

export default class Renderer {

    seedRadius: number = 5.0;
    nstates: number = 10;
    rez: number = 100;

    mousex: number = 0;
    mousey: number = 0;
    mouse: number = 0;

    //

    resolution: number = 100;

    canvas: HTMLCanvasElement;

    // API Data Structures
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    // Frame Backings
    swapchain: GPUSwapChain;
    colorTexture: GPUTexture;
    colorTextureView: GPUTextureView;
    depthTexture: GPUTexture;
    depthTextureView: GPUTextureView;

    // Resources
    positionBuffer: GPUBuffer;
    uvsBuffer: GPUBuffer;
    colorBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    vertModule: GPUShaderModule;
    fragModule: GPUShaderModule;
    compModule: GPUShaderModule;
    pipeline: GPURenderPipeline;
    computePipeline: GPUComputePipeline;

    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;

    uniformBindGroup: GPUBindGroup;
    mainBindGroup: Array<GPUBindGroup>;

    cellBufferA: GPUBuffer;
    cellBufferB: GPUBuffer;

    rowPitch: number;

    resultBufferSize: number;
    resultBuffer: GPUBuffer;

    outTexture: GPUTexture;
    textureDataBuffer: GPUBuffer;

    simParamData: Float32Array;
    simParamBuffer: GPUBuffer;

    pane: Tweakpane;

    fpsDom: HTMLElement;

    constructor(canvas) {
        this.fpsDom = document.getElementById("fps");
        this.canvas = canvas;
        this.resolution = this.rez = Math.round(Math.max(this.canvas.width, this.canvas.height));

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            let rect = this.canvas.getBoundingClientRect();
            this.mousex = e.clientX - rect.left;
            this.mousey = e.clientY - rect.top;
        });
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.mouse = 1;
        });
        document.body.addEventListener("mouseup", (e: MouseEvent) => {
            this.mouse = 0;
        });

        this.pane = new Tweakpane();
        const f1 = this.pane.addFolder({ title: 'Resolution' });
        f1.addInput(this, 'resolution', { min: 10, max: 2048, step: 1 });
        f1.addButton({
            title: 'Apply (reload)',
          }).on('click', (value) => {
            window.location.hash = "#" + this.resolution;
            window.location.reload();
          });
        const f2 = this.pane.addFolder({ title: 'Simulation' });
        f2.addInput(this, 'nstates', { min: 0, max: 50, step: 1 });
        f2.addInput(this, 'seedRadius', { min: 1, max: 20, step: 0.1 });
    }

    // Start the rendering engine
    async start() {
        if (await this.initializeAPI()) {
            this.resizeBackings();
            await this.initializeResources();
            this.render();
        }
    }

    // Initialize WebGPU
    async initializeAPI(): Promise<boolean> {
        try {
            // Entry to WebGPU
            const entry: GPU = navigator.gpu;
            if (!entry) {
                return false;
            }

            // Physical Device Adapter
            this.adapter = await entry.requestAdapter();

            // Logical Device
            this.device = await this.adapter.requestDevice();

            // Queue
            this.queue = this.device.defaultQueue;
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

    // Initialize resources to render triangle (buffers, shaders, pipeline)
    async initializeResources() {
        // Buffers
        this.positionBuffer = createBuffer(this.device, positions, GPUBufferUsage.VERTEX);
        this.uvsBuffer = createBuffer(this.device, uvs, GPUBufferUsage.VERTEX);
        this.colorBuffer = createBuffer(this.device, colors, GPUBufferUsage.VERTEX);
        this.indexBuffer = createBuffer(this.device, indices, GPUBufferUsage.INDEX);

        try {
            const vsmDesc: any = { code: await loadShader('/assets/shaders/mnca.vert.spv') };
            this.vertModule = this.device.createShaderModule(vsmDesc);
        } catch (e) {
            console.error(e);
        }
        
        try {
            const fsmDesc: any = { code: await loadShader('/assets/shaders/mnca.frag.spv') };
            this.fragModule = this.device.createShaderModule(fsmDesc);
        } catch (e) {
            console.error(e);
        }

        // Graphics Pipeline

        // Input Assembly
        const positionAttribDesc: GPUVertexAttributeDescriptor = {
            shaderLocation: 0, // [[attribute(0)]]
            offset: 0,
            format: 'float3'
        };
        const uvsAttribDesc: GPUVertexAttributeDescriptor = {
            shaderLocation: 1, // [[attribute(1)]]
            offset: 0,
            format: 'float2'
        };
        const colorAttribDesc: GPUVertexAttributeDescriptor = {
            shaderLocation: 2, // [[attribute(2)]]
            offset: 0,
            format: 'float3'
        };

        const positionBufferDesc: GPUVertexBufferLayoutDescriptor = {
            attributes: [ positionAttribDesc ],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: 'vertex'
        };
        const uvsBufferDesc: GPUVertexBufferLayoutDescriptor = {
            attributes: [ uvsAttribDesc ],
            arrayStride: 4 * 2, // sizeof(float) * 2
            stepMode: 'vertex'
        };
        const colorBufferDesc: GPUVertexBufferLayoutDescriptor = {
            attributes: [ colorAttribDesc ],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: 'vertex'
        };

        const vertexState: GPUVertexStateDescriptor = {
            indexFormat: 'uint16',
            vertexBuffers: [ positionBufferDesc, uvsBufferDesc, colorBufferDesc ]
        };

        // Depth
        const depthStencilState: GPUDepthStencilStateDescriptor = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus-stencil8'
        };

        const bindGroupLayout = this.device.createBindGroupLayout({
            bindings: [{
                // Sampler
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                type: "sampler"
            }, {
                // Texture view
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                type: "sampled-texture",
                textureComponentType: "float"
            }]
        });
        const pipelineLayoutDesc = { bindGroupLayouts: [bindGroupLayout] };
        const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        // Shader Stages
        const vertexStage = {
            module: this.vertModule,
            entryPoint: 'main'
        };
        const fragmentStage = {
            module: this.fragModule,
            entryPoint: 'main'
        };

        // Color/Blend State
        const colorState: GPUColorStateDescriptor = {
            format: 'bgra8unorm',
            alphaBlend: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add'
            },
            colorBlend: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add'
            },
            writeMask: GPUColorWrite.ALL
        };

        // Rasterization
        const rasterizationState: GPURasterizationStateDescriptor = {
            frontFace: 'cw',
            cullMode: 'back'
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout,

            vertexStage,
            fragmentStage,

            primitiveTopology: 'triangle-list',
            colorStates: [ colorState ],
            depthStencilState,
            vertexState,
            rasterizationState
        };
        this.pipeline = this.device.createRenderPipeline(pipelineDesc);

        //
        const components = 4;
        const rowPitch = this.rowPitch = align(this.rez * components, 256);

        const textureData = new Float32Array(rowPitch * this.rez);

        for (let i = 0; i < rowPitch * this.rez * components; i += 1) {
            textureData[i] = 0.3;
        }

        for (let row = 0; row < this.rez; row++) {
            for (let col = 0; col < this.rez; col++) {
                const idx = row * rowPitch + col * components; // REMEMBER: rowPitch is already multiplied by number of components
                textureData[idx + 0] = 0.1;
                textureData[idx + 1] = 0.1;
                textureData[idx + 2] = 0.1;
                textureData[idx + 3] = 1.0;
            }
        }

        this.textureDataBuffer = createBuffer(this.device, textureData,  GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE)
        this.outTexture = this.device.createTexture({
            size: { 
                width: this.rez, 
                height: this.rez, 
                depth: 1
            },
            format: "rgba32float",
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED,
        });

        {
            const commandEncoder = this.device.createCommandEncoder(); 
        
            commandEncoder.copyBufferToTexture({
                buffer: this.textureDataBuffer,
                rowPitch: this.rowPitch * Float32Array.BYTES_PER_ELEMENT, 
                imageHeight: 0
            }, {
                texture: this.outTexture
            }, {
                width: this.rez,
                height: this.rez,
                depth: 1,
            });

            this.queue.submit([ commandEncoder.finish() ]);
        }

        // Result buffer
        this.resultBufferSize = textureData.byteLength;
        
        this.resultBuffer = this.device.createBuffer({
            size: this.resultBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });
        
        //

        const sampler = this.device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
        });

        this.uniformBindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            bindings: [{
                binding: 0,
                resource: sampler,
            }, {
                binding: 1,
                resource: this.outTexture.createView(),
            }],
        });


        //

        this.simParamData = new Float32Array([
            this.seedRadius, 
            this.nstates,
            this.rez, 
            this.rowPitch, 
            this.mousex,
            this.mousey,
            this.mouse
          ]);
        this.simParamBuffer = this.device.createBuffer({
        size: this.simParamData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.simParamBuffer.setSubData(0, this.simParamData);

        const cellsA = new Float32Array(this.rez * this.rez);
        const cellsB = new Float32Array(this.rez * this.rez);

        for (let i = 0; i < this.rez * this.rez; i++) {
            const v = 0; // Math.random() * this.nstates; // Random initial state
            cellsA[i] = v;
            cellsB[i] = v;
        }

        this.cellBufferA = createBuffer(this.device, cellsA,  GPUBufferUsage.STORAGE)
        this.cellBufferB = createBuffer(this.device, cellsB,  GPUBufferUsage.STORAGE)

        // Compute pipeline
        
        try {
            const csmDesc: any = { 
                code: await loadShader('/assets/shaders/mnca.comp.spv') 
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
                { binding: 3, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" }
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

        this.mainBindGroup = range(0,2).map((val, idx) => this.device.createBindGroup({
                layout: computeBindGroupLayout,
                bindings: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.simParamBuffer
                        },
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer: idx % 2 ? this.cellBufferA : this.cellBufferB 
                        },
                    },
                    {
                        binding: 2,
                        resource: {
                            buffer: idx % 2 ? this.cellBufferB : this.cellBufferA 
                        },
                    },
                    {
                        binding: 3,
                        resource: {
                            buffer: this.resultBuffer
                        },
                    } 
                ]
            })
        );
    }

    // Resize swapchain, frame buffer attachments
    resizeBackings() {
        // Swapchain
        if (!this.swapchain) {
            const context: GPUCanvasContext = this.canvas.getContext('gpupresent') as any;
            const swapChainDesc: GPUSwapChainDescriptor = {
                device: this.device,
                format: 'bgra8unorm',
                usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC
            };
            this.swapchain = context.configureSwapChain(swapChainDesc);
        }

        // Depth Backing
        const depthSize = {
            width: this.canvas.width,
            height: this.canvas.height,
            depth: 1
        };

        const depthTextureDesc: GPUTextureDescriptor = {
            size: depthSize,
            arrayLayerCount: 1,
            mipLevelCount: 1,
            sampleCount: 1,
            dimension: '2d',
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.COPY_SRC
        };

        this.depthTexture = this.device.createTexture(depthTextureDesc);
        this.depthTextureView = this.depthTexture.createView();
    }

    // Write commands to send to the GPU
    async encodeCommands() {
        let colorAttachment: GPURenderPassColorAttachmentDescriptor = {
            attachment: this.colorTextureView,
            loadValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: 'store'
        };

        const depthAttachment: GPURenderPassDepthStencilAttachmentDescriptor = {
            attachment: this.depthTextureView,
            depthLoadValue: 1,
            depthStoreOp: 'store',
            stencilLoadValue: 'load',
            stencilStoreOp: 'store'
        };

        const renderPassDesc: GPURenderPassDescriptor = {
            colorAttachments: [ colorAttachment ],
            depthStencilAttachment: depthAttachment
        };
        
        const commandEncoder = this.device.createCommandEncoder(); 

        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(this.computePipeline);
        passEncoder.setBindGroup(0, this.mainBindGroup[t % 2]);
        passEncoder.dispatch(this.rez, this.rez);
        passEncoder.endPass();
        
        commandEncoder.copyBufferToTexture({
            buffer: this.resultBuffer,
            rowPitch: this.rowPitch * Float32Array.BYTES_PER_ELEMENT, 
            imageHeight: this.rez
        }, {
            texture: this.outTexture
        }, {
            width: this.rez,
            height: this.rez,
            depth: 1,
        });

        // Encode drawing commands
        this.passEncoder = commandEncoder.beginRenderPass(renderPassDesc);
        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setBindGroup(0, this.uniformBindGroup);
        this.passEncoder.setViewport(0, 0, this.canvas.width, this.canvas.height, 0, 1);
        this.passEncoder.setScissorRect(0, 0, this.canvas.width, this.canvas.height);
        this.passEncoder.setVertexBuffer(0, this.positionBuffer);
        this.passEncoder.setVertexBuffer(1, this.uvsBuffer);
        this.passEncoder.setVertexBuffer(2, this.colorBuffer);
        this.passEncoder.setIndexBuffer(this.indexBuffer);
        this.passEncoder.drawIndexed(6, 1, 0, 0, 0);
        this.passEncoder.endPass();

        this.queue.submit([ commandEncoder.finish() ]);
    }

    render = () => {
        // Benchmark
        let t1 = performance.now();
        td = (td + (t1 - t0)) / 2.0;
        if (t1 - tp > 1000.0) {
            tp = t1;
            td = (t1 - t0);
            this.fpsDom.innerText = (1000.0 / td).toFixed(2) + " fps (avg)";
        }
        t0 = t1;

        // Acquire next image from swapchain
        this.colorTexture = this.swapchain.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

        // Write and submit commands to queue
        this.encodeCommands();

        this.simParamData[0] = this.seedRadius;
        this.simParamData[1] = this.nstates;
        this.simParamData[2] = this.rez;
        this.simParamData[3] = this.rowPitch;
        this.simParamData[4] = this.mousex;
        this.simParamData[5] = this.mousey;
        this.simParamData[6] = this.mouse;
        this.simParamBuffer.setSubData(0, this.simParamData);

        ++t;

        // Refresh canvas
        requestAnimationFrame(this.render);
    };
}