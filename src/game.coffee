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
    gl.viewport(0, 0, 800, 480)
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
    @spriteSys = @addSystem(new SpriteSystem())
    
    e0 = @makeEntity("Steve")
    e0.addComps(new Position(0,0,0), new Appearance("steven.png"))
    e0.update()
  
  draw: ->
    @spriteSys.execute(30)
  
  tick: ->
    
