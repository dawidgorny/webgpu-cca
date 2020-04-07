// import Renderer from './renderer';
// import Renderer from './boids';
import Renderer from './mnca';
// import Renderer from './test';

const canvas = document.getElementById('gfx') as HTMLCanvasElement;
canvas.width = canvas.height = 1 * 256;
const renderer = new Renderer(canvas);
renderer.start();