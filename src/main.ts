import "./style.css";
import Renderer from "./mnca";
import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

let size: number = parseInt(window.location.hash.substr(1));
size = size > 9 ? size : 256;

const canvas = document.getElementById("gfx") as HTMLCanvasElement;
canvas.width = canvas.height = size;
const renderer = new Renderer(canvas);
renderer.start();

const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);
const f1 = pane.addFolder({ title: "Resolution" });
f1.addInput(renderer, "resolution", { min: 10, max: 2048, step: 1 });
f1.addButton({
    title: "Apply (reload)",
}).on("click", (value) => {
    window.location.hash = "#" + renderer.resolution;
    window.location.reload();
});
const f2 = pane.addFolder({ title: "Simulation" });
f2.addInput(renderer, "nstates", { min: 0, max: 50, step: 1 });
f2.addInput(renderer, "seedRadius", { min: 1, max: 20, step: 0.1 });

function resize() {
    if (
        document.documentElement.clientWidth >
        document.documentElement.clientHeight
    ) {
        canvas.style.width = "auto";
        canvas.style.height = "90%";
    } else {
        canvas.style.width = "90%";
        canvas.style.height = "auto";
    }
}
window.addEventListener("resize", resize);
resize();
