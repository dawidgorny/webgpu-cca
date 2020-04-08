import Renderer from './mnca';

let size: number = parseInt(window.location.hash.substr(1));
size = size > 9 ? size : 256;

const canvas = document.getElementById('gfx') as HTMLCanvasElement;
canvas.width = canvas.height = size;
const renderer = new Renderer(canvas);
renderer.start();
