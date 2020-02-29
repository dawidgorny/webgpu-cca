// import Renderer from './renderer';
import Renderer from './boids';

const canvas = document.getElementById('gfx') as HTMLCanvasElement;
canvas.width = canvas.height = 900;
const renderer = new Renderer(canvas);
renderer.start();