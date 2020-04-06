#version 450

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;

layout(location = 0) out vec2 vUV;

void main()
{
    vUV = uv;
    gl_Position = vec4(position.xyz, 1.0);
}