/// <reference path="../node_modules/@webgpu/types/index.d.ts" />

import { loadShader, createTextureFromImage, align } from './helpers'

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
    1.0,  0.0,
    0.0,  0.0,
    0.0,  1.0,
    0.0,  1.0,
    1.0,  1.0,
    1.0,  0.0
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

let rez = 900;

let t = 0;

export default class Renderer {
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
    textureBuffer: GPUBuffer;
    textureSourceBuffer: GPUBuffer;
    vertModule: GPUShaderModule;
    fragModule: GPUShaderModule;
    compModule: GPUShaderModule;
    pipeline: GPURenderPipeline;
    computePipeline: GPUComputePipeline;

    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;

    uniformBindGroup: GPUBindGroup;

    cellBuffers: Array<any>;
    cellBindGroups: Array<any>;

    outTexture: GPUTexture;
    textureSourceData: Uint8Array;
    textureData: Uint8Array;

    constructor(canvas) {
        this.canvas = canvas;
        rez = Math.round(Math.max(this.canvas.width, this.canvas.height));
        console.log(rez);
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
            console.log(this.adapter);

            // Logical Device
            this.device = await this.adapter.requestDevice();
            console.log(this.device);

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
        console.log('initializeResources');
        // Buffers
        let createBuffer = (arr: Float32Array | Uint16Array, usage: number) => {
            let desc = { size: arr.byteLength, usage };
            let [ buffer, bufferMapped ] = this.device.createBufferMapped(desc);
            ``;
            const writeArray =
                arr instanceof Uint16Array ? new Uint16Array(bufferMapped) : new Float32Array(bufferMapped);
            writeArray.set(arr);
            buffer.unmap();
            return buffer;
        };

        this.positionBuffer = createBuffer(positions, GPUBufferUsage.VERTEX);
        this.uvsBuffer = createBuffer(uvs, GPUBufferUsage.VERTEX);
        this.colorBuffer = createBuffer(colors, GPUBufferUsage.VERTEX);
        this.indexBuffer = createBuffer(indices, GPUBufferUsage.INDEX);

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

        console.log("init texture");

        //

        // this.outTexture = await createTextureFromImage(this.device, 'assets/textures/test.png', GPUTextureUsage.SAMPLED);

        this.outTexture = this.device.createTexture({
            size: { 
                width: rez, 
                height: rez, 
                depth: 1
            },
            format: "rgba8unorm",
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED,
        });

        const rowPitch = align(rez * 4, 256);
        this.textureData = new Uint8Array(rowPitch * rez);
        for (let i = 0; i < rez * rez; ++i) {
            this.textureData[4 * i + 0] = 35;
            this.textureData[4 * i + 1] = 35;
            this.textureData[4 * i + 2] = 35;
            this.textureData[4 * i + 3] = 255;
        }

        this.textureBuffer = this.device.createBuffer({
            size: this.textureData.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE
        });
        this.textureBuffer.setSubData(0, this.textureData);

        {
            const commandEncoder = this.device.createCommandEncoder({});
            commandEncoder.copyBufferToTexture({
                buffer: this.textureBuffer,
                rowPitch: rowPitch,
                imageHeight: 0,
            }, {
                texture: this.outTexture,
            }, {
                width: rez,
                height: rez,
                depth: 1,
            });

            this.device.defaultQueue.submit([commandEncoder.finish()]);
        }
    
        // 

        this.textureSourceData = new Uint8Array(rez * rez * 4);
        for (let i = 0; i < rez * rez; ++i) {
            this.textureSourceData[4 * i + 0] = 100;
            this.textureSourceData[4 * i + 1] = 150;
            this.textureSourceData[4 * i + 2] = 200;
            this.textureSourceData[4 * i + 3] = 255;
        }

        this.textureSourceBuffer = this.device.createBuffer({
            size: this.textureSourceData.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE
        });
        this.textureSourceBuffer.setSubData(0, this.textureSourceData);

        
        //

        console.log("init sampler");

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
            //   { binding: 0, visibility: GPUShaderStage.COMPUTE, type: "uniform-buffer" },
            //   { binding: 1, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" },
            //   { binding: 2, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" },
            //   { binding: 3, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" },
              { binding: 0, visibility: GPUShaderStage.COMPUTE, type: "storage-buffer" }
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

        const initialCellData = new Uint8Array(rez * rez);
        for (let i = 0; i < rez * rez; ++i) {
            initialCellData[i] = Math.round(2 * Math.random());
        }

        const cellBuffers = this.cellBuffers = new Array(2);
        this.cellBindGroups = new Array(2);
        for (let i = 0; i < 2; ++i) {
            cellBuffers[i] = this.device.createBuffer({
                size: initialCellData.byteLength,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM | GPUBufferUsage.STORAGE
            });
            cellBuffers[i].setSubData(0, initialCellData);
        }

        for (let i = 0; i < 2; ++i) {
            this.cellBindGroups[i] = this.device.createBindGroup({
            layout: computeBindGroupLayout,
            bindings: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.textureSourceBuffer,
                        offset: 0,
                        size: this.textureSourceData.byteLength,
                    },
                } 
            ]
            /*
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
                        buffer: cellBuffers[i],
                        offset: 0,
                    size: initialCellData.byteLength,
                    },
                }, {
                    binding: 2,
                    resource: {
                        buffer: cellBuffers[(i + 1) % 2],
                        offset: 0,
                        size: initialCellData.byteLength,
                    },
                }, {
                    binding: 3,
                    resource: {
                        buffer: this.textureSourceBuffer,
                        offset: 0,
                        size: this.textureSourceData.byteLength,
                    },
                }],*/
            });
        }
    }

    // Resize swapchain, frame buffer attachments
    resizeBackings() {
        console.log('resizeBackings');
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
    encodeCommands() {
        console.log('encodeCommand');

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

        

        

        {
            const commandEncoder = this.device.createCommandEncoder();

            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(this.computePipeline);
            passEncoder.setBindGroup(0, this.cellBindGroups[t % 2]);
            passEncoder.dispatch(rez, rez);
            passEncoder.endPass();

            this.queue.submit([ commandEncoder.finish() ]);
        }

        {

            const commandEncoder = this.device.createCommandEncoder(); 
        
    
            // https://github.com/gpuweb/gpuweb/issues/69#issuecomment-413919620
            // https://docs.microsoft.com/en-us/windows/win32/direct3d12/upload-and-readback-of-texture-data
            const rowPitch = align(rez * 4, 256); // Align(bitmapWidth * sizeof(DWORD), D3D12_TEXTURE_DATA_PITCH_ALIGNMENT);
           

            commandEncoder.copyBufferToBuffer(this.textureSourceBuffer,0, this.textureBuffer, 0, this.textureSourceData.byteLength);
            
            commandEncoder.copyBufferToTexture({
                buffer: this.textureBuffer,
                rowPitch, 
                imageHeight: rez
            }, {
                texture: this.outTexture
            }, {
                width: rez,
                height: rez,
                depth: 1,
            });
            

            this.queue.submit([ commandEncoder.finish() ]);
            
        }

        this.commandEncoder = this.device.createCommandEncoder();

        // Encode drawing commands
        this.passEncoder = this.commandEncoder.beginRenderPass(renderPassDesc);
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

        this.queue.submit([ this.commandEncoder.finish() ]);
    }

    render = () => {
        // console.log('render', t);
        // Acquire next image from swapchain
        this.colorTexture = this.swapchain.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

        // Write and submit commands to queue
        this.encodeCommands();

        ++t;

        // Refresh canvas
        requestAnimationFrame(this.render);
    };
}