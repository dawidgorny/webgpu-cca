import Renderer from './mnca';

const canvas = document.getElementById('gfx') as HTMLCanvasElement;
canvas.width = canvas.height = 1 * 256;
const renderer = new Renderer(canvas);
renderer.start();
