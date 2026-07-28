// CAMERA FUNCTIONS
function getCameraTransform(camera) {
    const transform = glMatrix.mat4.create();

    glMatrix.mat4.translate(transform, transform, [camera.position[0], camera.position[1], camera.position[2]]);

    glMatrix.mat4.rotateY(transform, transform, camera.yaw);
    glMatrix.mat4.rotateX(transform, transform, camera.pitch);

    return transform;
}

function getCameraRotation(camera) {
    const rotation = glMatrix.mat4.create();

    glMatrix.mat4.rotateY(rotation, rotation, camera.yaw);
    glMatrix.mat4.rotateX(rotation, rotation, camera.pitch);

    return rotation;
}

function getCameraViewMatrix(camera) {
    const camera_view_mat = glMatrix.mat4.create();
    glMatrix.mat4.invert(camera_view_mat, getCameraTransform(camera));
    return camera_view_mat;
}

function getCameraForwardVector(camera) {
    const forward = [0, 0, -1]; // -z is into screen
    glMatrix.vec3.transformMat4(forward, forward, getCameraRotation(camera));
    return forward;
}

function getCameraRightVector(camera) {
    const right = [1, 0, 0]; // +x is right
    glMatrix.vec3.transformMat4(right, right, getCameraRotation(camera));
    return right;
}

function flattenY(vector) {
    vector[1] = 0;
    glMatrix.vec3.normalize(vector, vector);
    return vector;
}




function getCameraRay(camera, ndc_x=0, ndc_y=0) {
    // ndc = normalized device coordinates, going from -1 to 1, (0,0) is dead center of screen

    // First step is to find the inverse of projection * view (written as vp cuz of the order)
    let VP = glMatrix.mat4.create();
    glMatrix.mat4.multiply(VP, camera.projection, getCameraViewMatrix(camera));

    let inverse_VP = glMatrix.mat4.create();
    glMatrix.mat4.invert(inverse_VP, VP);

    // Now we have a way of converting screenspace into worldspace
    // Next step is generating a point at the farplane of the NDC (z=1) and the nearplane of the NDC (z=-1)
    // These 2 points give us our vector ray, and to get from NDC to worldspace we just use our funky little matrix
    let farPoint = glMatrix.vec4.fromValues(ndc_x, ndc_y, 1, 1);
    let nearPoint = glMatrix.vec4.fromValues(ndc_x, ndc_y, -1, 1);
    glMatrix.vec4.transformMat4(farPoint, farPoint, inverse_VP);
    glMatrix.vec4.transformMat4(nearPoint, nearPoint, inverse_VP);

    // need to do perspective divsion here now too. not exactly sure why but its needed.
    // why does dividing the w component do something? duhh idk im a stupid fucking idiot.
    farPoint[0] /= farPoint[3]; farPoint[1] /= farPoint[3]; farPoint[2] /= farPoint[3];
    nearPoint[0] /= nearPoint[3]; nearPoint[1] /= nearPoint[3]; nearPoint[2] /= nearPoint[3];

    // now we should be good. origin of the ray is the nearpoint, direction is normalized(farpoint-nearpoint)
    
    const origin = glMatrix.vec3.fromValues(nearPoint[0], nearPoint[1], nearPoint[2]);
    const direction = glMatrix.vec3.create();
    glMatrix.vec3.subtract(direction, farPoint, nearPoint);
    glMatrix.vec3.normalize(direction, direction);

    return {origin: origin, dir: direction}
}

function rayTriIntersection(ray, v0, v1, v2) {
    const EPSILON = 1e-6;

    const edge1 = glMatrix.vec3.create(); // vector along edge from v0 to v1
    const edge2 = glMatrix.vec3.create(); // vector along edge from v0 to v2
    glMatrix.vec3.subtract(edge1, v1, v0);
    glMatrix.vec3.subtract(edge2, v2, v0);

    const ray_cross_e2 = glMatrix.vec3.create();
    glMatrix.vec3.cross(ray_cross_e2, ray.dir, edge2);
    let det = glMatrix.vec3.dot(edge1, ray_cross_e2);
    if (Math.abs(det) < EPSILON) {
        // Parallel test, if we in here the ray is parallel to the tri normal and cant intersection
        return {intersection: false};
    }

    let inv_det = 1.0/det;

    // a is v0, b is v1, c is v2
    const s = glMatrix.vec3.create();
    glMatrix.subtract(s, ray.origin, v0);
    let u = inv_det * glMatrix.vec3.dot(s, ray_cross_e2);

    if (u < -EPSILON || u - 1 > EPSILON) {
        // outside of edge 2 bounds
        return {intersection: false};
    }

    const s_cross_e1 = glMatrix.vec3.create();
    glMatrix.vec3.cross(s_cross_e1, s, edge1);
    let v = inv_det * glMatrix.vec3.dot(ray.dir, s_cross_e1);

    if (v < -EPSILON || u + v - 1 > EPSILON) {
        // Ray passes outside edge1's bounds
        return {intersection: false};
    } 

    // The ray line intersects with the triangle
    // ompute t to find where on the ray the intersection is
    let t = inv_det * glMatrix.vec3.dot(edge2, s_cross_e1);

    if (t > EPSILON) { // Ray intersection in front of the ray
        const intersection_point = glMatrix.vec3.create();
        glMatrix.vec3.scaleAndAdd(intersection_point, ray.origin, ray.dir, t);
        return {intersection: true, point: intersection_point, dist:t, u:u, v:v};
    } else {
        // Ray intersection behind the ray
        return {intersection: false};
    }
}

function rayMeshIntersection(ray, mesh, model_transform) {
    let result = {intersection: false, intersections_data: []};

    const mesh_triCount = mesh.vertexCount/3;
    for (let i = 0; i < mesh_triCount; i++) {
        let j = 9*i; // This is just the "base index" for our triangle
        const model_v0 = glMatrix.vec4.fromValues(mesh.positions[j + 0], mesh.positions[j + 1], mesh.positions[j + 2], 1); 
        const model_v1 = glMatrix.vec4.fromValues(mesh.positions[j + 3], mesh.positions[j + 4], mesh.positions[j + 5], 1);
        const model_v2 = glMatrix.vec4.fromValues(mesh.positions[j + 6], mesh.positions[j + 7], mesh.positions[j + 8], 1);

        // switch to worldspace coords
        const world_v0 = glMatrix.vec4.create(); 
        const world_v1 = glMatrix.vec4.create(); 
        const world_v2 = glMatrix.vec4.create();
        glMatrix.vec4.transformMat4(world_v0, model_v0, model_transform);
        glMatrix.vec4.transformMat4(world_v1, model_v1, model_transform);
        glMatrix.vec4.transformMat4(world_v2, model_v2, model_transform);

        let intersection_data = rayTriIntersection(
            ray, 
            glMatrix.vec3.fromValues(world_v0[0], world_v0[1], world_v0[2]),
            glMatrix.vec3.fromValues(world_v1[0], world_v1[1], world_v2[2]),
            glMatrix.vec3.fromValues(world_v2[0], world_v2[1], world_v2[2])
        );

        if(intersection_data.intersection) {
            result.intersection = true;
            result.intersections_data.push(intersection_data);
        }
    }
    return result;
}