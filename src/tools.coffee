log = (strings...) ->
  console.log(strings...)
  
loadShader = (fname) ->
  shaderURL = "/data/shaders/"+fname
  req = new XMLHttpRequest()
  req.open("GET",shaderURL,false)
  req.send()
  shaderCode = req.responseText
  ext = fname[fname.length-2..]
  
  gl = window.globals.gl
  if ext == "vs"
    shader = gl.createShader(gl.VERTEX_SHADER)
  else
    shader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(shader, shaderCode)
  gl.compileShader(shader)
  
  if not gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    log "Shader compilation error: " + gl.getShaderInfoLog(shader)
    return null
  
  else
    return shader

createProgram = (vertShader, fragShader) ->
  if typeof vertShader == "string"
    vertShader = loadShader(vertShader)
  if typeof fragShader == "string"
    fragShader = loadShader(fragShader)
  
  gl = window.globals.gl
  shaderProg = gl.createProgram()
  gl.attachShader(shaderProg, vertShader)
  gl.attachShader(shaderProg, fragShader)
  gl.linkProgram(shaderProg)
  
  if not gl.getProgramParameter(shaderProg, gl.LINK_STATUS)
    log "Error linking shader program."
  
  return shaderProg
