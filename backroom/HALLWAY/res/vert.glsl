#version 300 es

in vec3 vertex_position;
in vec3 vertex_normal;
in vec2 vertex_uv;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 world_position;
out vec3 world_normal;
out vec2 uv;

void main()
{
    vec4 world = model * vec4(vertex_position,1.0);

    world_position = world.xyz;
    world_normal = mat3(model) * vertex_normal;
    uv = vertex_uv;

    gl_Position = projection * view * world;
}