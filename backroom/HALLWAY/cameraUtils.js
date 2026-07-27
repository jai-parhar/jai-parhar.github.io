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