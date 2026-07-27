#version 300 es

in vec3 vertex_position;
in vec2 vertex_uv;

out vec2 uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;


void main(){
    gl_Position = projection * view * model * vec4(vertex_position,1.0);

    uv = vertex_uv;
}