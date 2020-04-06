/// <reference path="../node_modules/@webgpu/types/index.d.ts" />

import { loadShader, createTextureFromImage, align, createBuffer, range } from './helpers'

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
    textureSourceData: Uint8Array;
    textureData: Uint8Array;
    textureDataBuffer: GPUBuffer;

    constructor(canvas) {
        this.canvas = canvas;
        // rez = Math.round(Math.max(this.canvas.width, this.canvas.height));
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
        this.positionBuffer = createBuffer(this.device, positions, GPUBufferUsage.VERTEX);
        this.uvsBuffer = createBuffer(this.device, uvs, GPUBufferUsage.VERTEX);
        this.colorBuffer = createBuffer(this.device, colors, GPUBufferUsage.VERTEX);
        this.indexBuffer = createBuffer(this.device, indices, GPUBufferUsage.INDEX);

        console.log("positions.values.length:" + positions.values.length);
        console.log("positions.byteLength:" + positions.byteLength);

        console.log("indices.values.length:" + indices.values.length);
        console.log("indices.byteLength:" + indices.byteLength);

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

        const components = 4;
        const rowPitch = this.rowPitch = align(rez * components, 256);

        console.log("rowPitch:", rowPitch);
        console.log("rez*rez*component", (rez * rez * components));
        console.log("align rez*rez*components", (rowPitch / components) * rez);

        const textureData = new Float32Array(rowPitch * rez);

        for (let i = 0; i < rowPitch * rez * components; i += 1) {
            textureData[i] = 0.3;
        }

        for (let row = 0; row < rez; row++) {
            for (let col = 0; col < rez; col++) {
                const idx = row * rowPitch + col * components; // REMEMBER: rowPitch is already multiplied by number of components
                textureData[idx + 0] = 0.0;//Math.ceil((row / rez));
                textureData[idx + 1] = 0.0;
                textureData[idx + 2] = 0.5;// - Math.ceil((col / rez));
                textureData[idx + 3] = 1.0;
            }
        }

        this.textureDataBuffer = createBuffer(this.device, textureData,  GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE)
        console.log("textureData.byteLength: " + textureData.byteLength); 
        this.outTexture = this.device.createTexture({
            size: { 
                width: rez, 
                height: rez, 
                depth: 1
            },
            format: "rgba32float",
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.SAMPLED,
        });

        {
            const rowPitch = this.rowPitch;
            console.log(rowPitch);
            const commandEncoder = this.device.createCommandEncoder(); 
        
            commandEncoder.copyBufferToTexture({
                buffer: this.textureDataBuffer,
                rowPitch: rowPitch * Float32Array.BYTES_PER_ELEMENT , 
                imageHeight: 0
            }, {
                texture: this.outTexture
            }, {
                width: rez,
                height: rez,
                depth: 1,
            });

            this.queue.submit([ commandEncoder.finish() ]);
        }

        // this.outTexture = await createTextureFromImage(this.device, 'assets/textures/test.png', GPUTextureUsage.SAMPLED);


        // Result buffer
        this.resultBufferSize = textureData.byteLength; //Uint8Array.BYTES_PER_ELEMENT * (rowPitch * rez);
        // this.resultBufferSize = Float32Array.BYTES_PER_ELEMENT * (rowPitch * rez);

        
        console.log("this.resultBufferSize: " + this.resultBufferSize);
        this.resultBuffer = this.device.createBuffer({
            size: this.resultBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });
        
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


        //

        const simParamData = new Float32Array([
            0.04,  // varx;
            0.1   // vary;
          ]);
        const simParamBuffer = this.device.createBuffer({
        size: simParamData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        simParamBuffer.setSubData(0, simParamData);

        const cellsA = new Float32Array(rez * rez);
        const cellsB = new Float32Array(rez * rez);

        for (let i = 0; i < rez * rez; i++) {
            cellsA[i] = Math.random() * 200.0;
            cellsB[i] = Math.random() * 200.0;
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
                            buffer: simParamBuffer
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

           console.log(this.mainBindGroup)
    
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
    async encodeCommands() {
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
            passEncoder.setBindGroup(0, this.mainBindGroup[t % 2]);
            passEncoder.dispatch(rez,rez);
            passEncoder.endPass();

            this.queue.submit([ commandEncoder.finish() ]);
        }

        {
            const commandEncoder = this.device.createCommandEncoder(); 
            
            const rowPitch = this.rowPitch;

            commandEncoder.copyBufferToTexture({
                // buffer: t % 2 ? this.resultBuffer : this.textureDataBuffer,
                buffer: this.resultBuffer,
                rowPitch: rowPitch * Float32Array.BYTES_PER_ELEMENT, 
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