#version 300 es

precision highp float;

#define MAX_LIGHTS 16

in vec3 world_position;
in vec3 world_normal;
in vec2 uv;

uniform sampler2D texture_sampler;

uniform int num_lights;

uniform vec3 light_position[MAX_LIGHTS];
uniform vec3 light_colour[MAX_LIGHTS];
uniform float light_intensity[MAX_LIGHTS];

out vec4 out_colour;

void main()
{
    vec3 normal = normalize(world_normal);

    vec3 tex = texture(texture_sampler, uv).rgb;

    // Ambient lighting
    vec3 lighting = vec3(0.08);

    for (int i = 0; i < MAX_LIGHTS; i++)
    {
        if (i >= num_lights)
            break;

        vec3 light_dir = normalize(light_position[i] - world_position);

        float diffuse = max(dot(normal, light_dir), 0.0);

        float distance = length(light_position[i] - world_position);

        float attenuation =
            light_intensity[i] /
            (1.0 + 0.2 * distance + 0.05 * distance * distance);

        lighting +=
            light_colour[i] *
            diffuse *
            attenuation;
    }

    out_colour = vec4(tex * lighting, 1.0);
}