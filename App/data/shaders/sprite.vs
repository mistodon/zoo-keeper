attribute vec3 aVertPos;

void main() {
    gl_Position = vec4(aVertPos.xyz,1);
}
