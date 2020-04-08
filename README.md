# WebGPU Compute Cellular Automata

Experiment implementtation of Multiple Neighborhoods Cellular Automata using WebGPU

![preview](preview.png)

![preview2](preview2.gif)

## Build and run

### Chrome Canary

This code is using WebGPU API, and was tested on Chrome Canary, since it is providing WIP, complete-enough, WebGPU implementation in a browser environment.

Install Chrome Canary.

Turn on `#enable-unsafe-webgpu` via `chrome://flags` on Chrome Canary.

### glslang

In order to compile shaders you will need `glslangValidator` in your `$PATH`.

```
brew install glslang
```

or download a release package from here:
[https://github.com/KhronosGroup/glslang](https://github.com/KhronosGroup/glslang)



### Build

```
yarn install
```

```
npm start
```

## Background

## License

MIT
