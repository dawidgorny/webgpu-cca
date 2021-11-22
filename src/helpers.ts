export let loadShader = (shaderPath: string) =>
    fetch(new Request(shaderPath), { method: "GET", mode: "cors" }).then(
        (res) => res.arrayBuffer().then((arr) => new Uint32Array(arr))
    );

export function align(size: number, alignTo: number): number {
    return Math.ceil(size / alignTo) * alignTo;
}

// https://github.com/austinEng/webgpu-samples

let displayedNotSupportedError = false;
export function checkWebGPUSupport() {
    if (!navigator.gpu) {
        document.getElementById("not-supported").style.display = "block";
        if (!displayedNotSupportedError) {
            alert(
                "WebGPU not supported! Please visit webgpu.io to see the current implementation status."
            );
        }
        displayedNotSupportedError = true;
    }
    return !!navigator.gpu;
}
export function createBuffer(
    device: GPUDevice,
    arr: Float32Array | Uint16Array | Uint8Array,
    usage: number
) {
    let desc = { size: arr.byteLength, usage, mappedAtCreation: true };
    let buffer = device.createBuffer(desc);
    ``;
    let writeArray =
        arr instanceof Uint16Array
            ? new Uint16Array(buffer.getMappedRange())
            : arr instanceof Uint8Array
            ? new Uint8Array(buffer.getMappedRange())
            : new Float32Array(buffer.getMappedRange());
    writeArray.set(arr);
    buffer.unmap();
    return buffer;
}

export function range(start: number, end: number) {
    return Array.from({ length: end - start }, (v, k) => k + start);
}
