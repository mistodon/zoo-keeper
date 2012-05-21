animFrame = window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null

window.beginGame = (canvasID) ->
  window.globals = {}
  canvas = document.getElementById canvasID
  initWebGL canvas
  
  game = new Game()
  mainloop = () ->
    game.run()
    animFrame mainloop
  animFrame mainloop

initWebGL = (canvas) ->
  gl = null
  try
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  catch error
  
  if not gl
    alert("Unable to initialize WebGL.")
  else
    log "WebGL initialized."
  
  gl.clearColor(0.3, 0.3, 1.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  window.globals.gl = gl
