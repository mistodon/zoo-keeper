class Game
  constructor: ->
    @states = {
      "game":GameState,
    }
    @activeState = new GameState()
  
  tick: ->
    @activeState.cleanUp()
    @activeState.tick 30
    
  draw: ->
    gl = window.globals.gl
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
    @activeState.draw()
    
  run: ->
    next = @activeState.nextState
    if next
      @activeState = new @states[next]()
    
    @tick()
    @draw()

class GameState extends State
  constructor: ->
    super()
    @frames = 0
  
  draw: ->
    #Do nothing
  
  tick: ->
    log("Game ticking...")
    
