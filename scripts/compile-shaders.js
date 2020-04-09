const path = require("path");
const exec = require("child_process").exec;
const { spawn } = require('child_process');

const SRC_DIR = path.join(__dirname, "../shaders");
const OUT_DIR = path.join(__dirname, "../assets/shaders");

function compileShader(srcPath, outPath) {
    // exec(`glslangValidator -V "${srcPath}" -o "${outPath}"`, {stdio: 'inherit'});
    spawn('glslangValidator', ['-V', srcPath, '-o', outPath], {stdio: 'inherit'})
        .on('error', (err) => {
            console.error('Failed to compile: ' + srcPath);
        });
}

compileShader(path.join(SRC_DIR, "mnca.frag"), path.join(OUT_DIR, "mnca.frag.spv"));
compileShader(path.join(SRC_DIR, "mnca.vert"), path.join(OUT_DIR, "mnca.vert.spv"));
compileShader(path.join(SRC_DIR, "mnca.comp"), path.join(OUT_DIR, "mnca.comp.spv"));
