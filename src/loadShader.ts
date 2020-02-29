export let loadShader = (shaderPath: string) =>
    fetch(new Request(shaderPath), { method: 'GET', mode: 'cors' }).then((res) =>
        res.arrayBuffer().then((arr) => new Uint32Array(arr))
    );