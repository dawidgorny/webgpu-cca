import { align, createBuffer, range } from "./helpers";
import compShaderCode from "./mnca.comp.wgsl?raw";

const vertShaderCode = `
struct VSOut {
    @builtin(position) Position: vec4<f32>,
    @location(0) texCoord: vec2<f32>
};

@vertex
fn main(@location(0) inPos: vec3<f32>,
        @location(1) inColor: vec3<f32>, 
        @location(2) inUV: vec2<f32>) -> VSOut {
    var vsOut: VSOut;
    vsOut.Position = vec4<f32>(inPos, 1.0);
    vsOut.texCoord = inUV;
    return vsOut;
}`;
const fragShaderCode = `
@group(0) @binding(0) var mainSampler: sampler;
@group(0) @binding(1) var mainTexture: texture_2d<f32>;

@fragment
fn main(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
    // return vec4<f32>(1.0, 0.0, 0.0, 1.0);
    return textureSample(mainTexture, mainSampler, texCoord);
}`;

// Position Vertex Buffer Data
const positions = new Float32Array([
    1.0, -1.0, 0.0, -1.0, -1.0, 0.0, -1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 1.0, -1.0, 0.0,
]);

const uvs = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
]);

// Color Vertex Buffer Data
const colors = new Float32Array([
    1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0,
    1.0, 0.0, 0.0,
]);

// Index Buffer Data
const indices = new Uint16Array([0, 1, 2, 3, 4, 5]);

//

let t = 0;

let t0 = performance.now();
let tp = performance.now();
let td = 0;

//

class Renderer {
    paramsNeedUpdate: boolean = false;
    isPaused: boolean = false;

    //

    seedRadius: number = 5.0;
    nstates: number = 10;
    rez: number = 100;

    mousex: number = 0;
    mousey: number = 0;
    mouse: number = 0;

    resolution: number = 100;

    //

    fpsDom: HTMLElement;

    canvas: HTMLCanvasElement;

    // API Data Structures
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    presentationFormat: GPUTextureFormat;

    // Frame Backings
    context: GPUCanvasContext;
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
    pipeline: GPURenderPipeline;

    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;

    //

    compModule: GPUShaderModule;
    computePipeline: GPUComputePipeline;

    uniformBindGroup: GPUBindGroup;
    mainBindGroup: Array<GPUBindGroup>;

    cellBufferA: GPUBuffer;
    cellBufferB: GPUBuffer;

    rowPitch: number;

    outTexture: GPUTexture;
    textureDataBuffer: GPUBuffer;

    simParamData: Float32Array;
    simParamBuffer: GPUBuffer;

    constructor(canvas) {
        this.canvas = canvas;
        this.fpsDom = document.getElementById("fps");
        this.resolution = this.rez = Math.round(
            Math.max(this.canvas.width, this.canvas.height)
        );

        this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
            let rect = this.canvas.getBoundingClientRect();
            this.mousex = ((e.clientX - rect.left) / rect.width) * this.rez;
            this.mousey = ((e.clientY - rect.top) / rect.height) * this.rez;
            if (this.mouse) {
                this.paramsNeedUpdate = true;
            }
        });
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
            this.mouse = 1;
            this.paramsNeedUpdate = true;
        });
        document.body.addEventListener("mouseup", (e: MouseEvent) => {
            this.mouse = 0;
            this.paramsNeedUpdate = true;
        });
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
            // 🏭 Entry to WebGPU
            const entry: GPU = navigator.gpu;
            if (!entry) {
                return false;
            }

            // 🔌 Physical Device Adapter
            this.adapter = await entry.requestAdapter();

            // 💻 Logical Device
            this.device = await this.adapter.requestDevice();

            // 📦 Queue
            this.queue = this.device.queue;
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

    // Initialize resources to render triangle (buffers, shaders, pipeline)
    async initializeResources() {
        // Buffers
        this.positionBuffer = createBuffer(
            this.device,
            positions,
            GPUBufferUsage.VERTEX
        );
        this.uvsBuffer = createBuffer(this.device, uvs, GPUBufferUsage.VERTEX);
        this.colorBuffer = createBuffer(
            this.device,
            colors,
            GPUBufferUsage.VERTEX
        );
        this.indexBuffer = createBuffer(
            this.device,
            indices,
            GPUBufferUsage.INDEX
        );

        // Shaders
        const vsmDesc = {
            code: vertShaderCode,
        };
        this.vertModule = this.device.createShaderModule(vsmDesc);

        const fsmDesc = {
            code: fragShaderCode,
        };
        this.fragModule = this.device.createShaderModule(fsmDesc);

        // const compDesc = {
        // code: compShaderCode,
        // };
        // this.compModule = this.device.createShaderModule(compDesc);

        // Graphics Pipeline

        // Input Assembly
        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0, // [[location(0)]]
            offset: 0,
            format: "float32x3",
        };
        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1, // [[location(1)]]
            offset: 0,
            format: "float32x3",
        };
        const uvsAttribDesc: GPUVertexAttribute = {
            shaderLocation: 2, // [[attribute(1)]]
            offset: 0,
            format: "float32x2",
        };
        const positionBufferDesc: GPUVertexBufferLayout = {
            attributes: [positionAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: "vertex",
        };
        const uvsBufferDesc: GPUVertexBufferLayout = {
            attributes: [uvsAttribDesc],
            arrayStride: 4 * 2, // sizeof(float) * 2
            stepMode: "vertex",
        };
        const colorBufferDesc: GPUVertexBufferLayout = {
            attributes: [colorAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: "vertex",
        };

        // Depth
        const depthStencil: GPUDepthStencilState = {
            depthWriteEnabled: true,
            depthCompare: "less",
            format: "depth24plus-stencil8",
        };

        // Uniform Data

        const sampler = this.device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    // Sampler
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {},
                },
                {
                    // Texture view
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {},
                },
            ],
        });

        const pipelineLayoutDesc = { bindGroupLayouts: [bindGroupLayout] };
        const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        // Shader Stages
        const vertex: GPUVertexState = {
            module: this.vertModule,
            entryPoint: "main",
            buffers: [positionBufferDesc, colorBufferDesc, uvsBufferDesc],
        };

        // 🌀 Color/Blend State
        const colorState: GPUColorTargetState = {
            format: this.presentationFormat,
            writeMask: GPUColorWrite.ALL,
        };

        const fragment: GPUFragmentState = {
            module: this.fragModule,
            entryPoint: "main",
            targets: [colorState],
        };

        // Rasterization
        const primitive: GPUPrimitiveState = {
            frontFace: "cw",
            cullMode: "none",
            topology: "triangle-list",
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout,

            vertex,
            fragment,

            primitive,
            depthStencil,
        };
        this.pipeline = this.device.createRenderPipeline(pipelineDesc);

        //

        const components = 4;
        const rowPitch = (this.rowPitch = align(this.rez * components, 256));
        // this.rez = rowPitch / components;

        const textureData = new Float32Array(rowPitch * this.rez);

        for (let i = 0; i < rowPitch * this.rez; i += 1) {
            textureData[i] = 0.0;
        }

        for (let row = 0; row < this.rez; row++) {
            for (let col = 0; col < this.rez; col++) {
                const idx = row * rowPitch + col * components; // REMEMBER: rowPitch is already multiplied by number of components
                textureData[idx + 0] = 0.1; // b
                textureData[idx + 1] = 0.1;
                textureData[idx + 2] = 0.1;
                textureData[idx + 3] = 1.0;
            }
        }

        this.textureDataBuffer = createBuffer(
            this.device,
            textureData,
            GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE
        );
        this.outTexture = this.device.createTexture({
            size: {
                width: this.rez,
                height: this.rez,
            },
            format: "rgba8unorm",
            usage:
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.STORAGE_BINDING |
                GPUTextureUsage.TEXTURE_BINDING,
        });

        {
            const commandEncoder = this.device.createCommandEncoder();

            commandEncoder.copyBufferToTexture(
                {
                    buffer: this.textureDataBuffer,
                    bytesPerRow: this.rowPitch * Float32Array.BYTES_PER_ELEMENT,
                    rowsPerImage: this.rez,
                },
                {
                    texture: this.outTexture,
                },
                {
                    width: this.rez,
                    height: this.rez,
                    depthOrArrayLayers: 1,
                }
            );

            this.queue.submit([commandEncoder.finish()]);
        }

        //

        this.uniformBindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: sampler,
                },
                {
                    binding: 1,
                    resource: this.outTexture.createView(),
                },
            ],
        });

        //

        this.simParamData = new Float32Array([
            this.seedRadius,
            this.nstates,
            this.rez,
            this.rowPitch,
            this.mousex,
            this.mousey,
            this.mouse,
        ]);
        this.simParamBuffer = this.device.createBuffer({
            size: this.simParamData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(this.simParamBuffer.getMappedRange()).set(
            this.simParamData
        );
        this.simParamBuffer.unmap();

        const cellsA = new Float32Array(this.rez * this.rez);
        const cellsB = new Float32Array(this.rez * this.rez);

        for (let i = 0; i < this.rez * this.rez; i++) {
            const v = 0; //Math.random() * this.nstates; // Random initial state
            cellsA[i] = v;
            cellsB[i] = v;
        }

        this.cellBufferA = createBuffer(
            this.device,
            cellsA,
            GPUBufferUsage.STORAGE
        );
        this.cellBufferB = createBuffer(
            this.device,
            cellsB,
            GPUBufferUsage.STORAGE
        );

        // Compute pipeline

        try {
            const csmDesc: any = {
                code: compShaderCode,
            };
            this.compModule = this.device.createShaderModule(csmDesc);
        } catch (e) {
            console.error(e);
        }

        const computeBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform",
                    },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage",
                    },
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "storage",
                    },
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    storageTexture: {
                        format: "rgba8unorm",
                        access: "write-only",
                    },
                },
            ],
        });

        const computePipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [computeBindGroupLayout],
        });

        this.computePipeline = this.device.createComputePipeline({
            layout: computePipelineLayout,
            compute: {
                module: this.compModule,
                entryPoint: "main",
            },
        });

        //

        this.mainBindGroup = range(0, 2).map((val, idx) =>
            this.device.createBindGroup({
                layout: computeBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.simParamBuffer,
                        },
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer:
                                idx % 2 ? this.cellBufferA : this.cellBufferB,
                        },
                    },
                    {
                        binding: 2,
                        resource: {
                            buffer:
                                idx % 2 ? this.cellBufferB : this.cellBufferA,
                        },
                    },
                    {
                        binding: 3,
                        resource: this.outTexture.createView(),
                    },
                ],
            })
        );
    }

    // Resize swapchain, frame buffer attachments
    resizeBackings() {
        // Swapchain
        if (!this.context) {
            this.context = this.canvas.getContext("webgpu");
            this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

            const canvasConfig: GPUCanvasConfiguration = {
                device: this.device,
                format: this.presentationFormat,
                alphaMode: "opaque",
                usage:
                    GPUTextureUsage.RENDER_ATTACHMENT |
                    GPUTextureUsage.COPY_SRC,
            };
            this.context.configure(canvasConfig);
        }

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [this.canvas.width, this.canvas.height, 1],
            dimension: "2d",
            format: "depth24plus-stencil8",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        };

        this.depthTexture = this.device.createTexture(depthTextureDesc);
        this.depthTextureView = this.depthTexture.createView();
    }

    // Write commands to send to the GPU
    encodeCommands() {
        let colorAttachment: GPURenderPassColorAttachment = {
            view: this.colorTextureView,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear",
            storeOp: "store",
        };

        const depthAttachment: GPURenderPassDepthStencilAttachment = {
            view: this.depthTextureView,
            depthClearValue: 1,
            depthLoadOp: "clear",
            depthStoreOp: "store",
            stencilLoadOp: "load",
            stencilStoreOp: "store",
        };

        const renderPassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment],
            depthStencilAttachment: depthAttachment,
        };

        const commandEncoder = this.device.createCommandEncoder();

        if (!this.isPaused) {
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(this.computePipeline);
            passEncoder.setBindGroup(0, this.mainBindGroup[t % 2]);
            passEncoder.dispatchWorkgroups(this.rez, this.rez);
            passEncoder.end();
        }

        // Encode drawing commands
        this.passEncoder = commandEncoder.beginRenderPass(renderPassDesc);
        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setBindGroup(0, this.uniformBindGroup);
        this.passEncoder.setViewport(
            0,
            0,
            this.canvas.width,
            this.canvas.height,
            0,
            1
        );
        this.passEncoder.setScissorRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        this.passEncoder.setVertexBuffer(0, this.positionBuffer);
        this.passEncoder.setVertexBuffer(1, this.colorBuffer);
        this.passEncoder.setVertexBuffer(2, this.uvsBuffer);
        this.passEncoder.setIndexBuffer(this.indexBuffer, "uint16");
        this.passEncoder.drawIndexed(6, 1);
        this.passEncoder.end();

        this.queue.submit([commandEncoder.finish()]);
    }

    render = () => {
        // Benchmark
        let t1 = performance.now();
        td = (td + (t1 - t0)) / 2.0;
        if (t1 - tp > 1000.0) {
            tp = t1;
            td = t1 - t0;
            this.fpsDom.innerText = (1000.0 / td).toFixed(2) + " fps (avg)";
        }
        t0 = t1;

        // Acquire next image from context
        this.colorTexture = this.context.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

        // Write and submit commands to queue
        this.encodeCommands();

        if (this.paramsNeedUpdate) {
            this.paramsNeedUpdate = false;

            this.simParamData[0] = this.seedRadius;
            this.simParamData[1] = this.nstates;
            this.simParamData[2] = this.rez;
            this.simParamData[3] = this.rowPitch;
            this.simParamData[4] = this.mousex;
            this.simParamData[5] = this.mousey;
            this.simParamData[6] = this.mouse;

            let upload = this.device.createBuffer({
                size: this.simParamData.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC,
                mappedAtCreation: true,
            });
            new Float32Array(upload.getMappedRange()).set(this.simParamData);
            upload.unmap();

            let commandEncoder = this.device.createCommandEncoder();
            commandEncoder.copyBufferToBuffer(
                upload,
                0,
                this.simParamBuffer,
                0,
                this.simParamData.byteLength
            );
            this.queue.submit([commandEncoder.finish()]);
        }
        //

        ++t;

        // Refresh canvas
        requestAnimationFrame(this.render);
    };
}

export default Renderer;
