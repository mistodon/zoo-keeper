class SpriteSystem extends System
  constructor: ->
    super("Position","Appearance")
    gl = window.globals.gl
    @vertBuffer = gl.createBuffer()
    @program = createProgram("sprite.vs","sprite.fs")
    @vertPos = gl.getAttribLocation(@program, "aVertPos")
    @colour = gl.getUniformLocation(@program, "uColour")
    
    gl.bindBuffer(gl.ARRAY_BUFFER, @vertBuffer)
    vertices = [
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0,
         0.5,  0.5, 0.0,
        -0.5,  0.5, 0.0,
      ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  
  processEntity: (e, delta) ->
    gl = window.globals.gl
    gl.useProgram(@program)
    
    gl.enableVertexAttribArray(@vertPos)
    gl.bindBuffer(gl.ARRAY_BUFFER, @vertBuffer)
    gl.vertexAttribPointer(@vertPos, 3, gl.Float, false, 0, 0)
    gl.uniform4f(@colour,1.0,1.0,1.0,1.0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
