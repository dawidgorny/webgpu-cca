#version 450

layout(set = 0, binding = 0) uniform sampler mySampler;
layout(set = 0, binding = 1) uniform texture2D myTexture;

layout(location = 0) in vec2 vUV;

// Return Output
layout (location = 0) out vec4 outFragColor;

void main()
{
    outFragColor = texture(sampler2D(myTexture, mySampler), vUV);
}
