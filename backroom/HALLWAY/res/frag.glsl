#version 300 es

precision highp float;

in vec2 uv;

out vec4 color;

uniform sampler2D texture_sampler;


void main(){

    color = texture(texture_sampler, uv);

}