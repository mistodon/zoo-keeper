class State
  constructor: ->
    @nextID = 0
    @entities = []
    @systems = []
    @keyEntities = {}
    @nextState = null
    
  draw: (context) ->
  
  tick: (delta) ->
  
  addSystem: (sys) ->
    @systems.push sys
    sys.world = this
    return sys
    
  makeEntity: (name) ->
    eNum = @nextID
    @nextID += 1
    e = new Entity eNum
    @entities.push(e)
    if name
      @keyEntities[name] = e
    return e
    
  updateEntity: (e) ->
    @updateSystemFor sys, e for sys in @systems
    
  updateSystemFor: (sys, e) ->
    matches = (e.hasComp(c) for c in sys.comps)
    if all matches
      sys.addEntity(e)
  
  cleanUp: ->
    deadList = (e for e in @entities when e.dead)
    @entities =  (e for e in @entities when not e.dead)
    sys.forgetEntity(e) for sys in @systems for e in deadList
    

class Entity
  constructor: (@eID) ->
    @comps = {}
    @dead = false
    
  addComp: (comp) ->
    @comps[comp.name] = comp
    
  addComps: (comps...) ->
    @addComp c for c in comps
  
  getComp: (compName) ->
    return @comps[compName]
  
  hasComp: (compName) ->
    return @comps.hasOwnProperty compName


class System
  constructor: (requiredComps...) ->
    @world = null
    @entities = {}
    @comps = requiredComps
  
  execute: (delta) ->
    @processEntity(e, delta) for id, e of @entities
  
  processEntity: (e, delta) ->
  
  addEntity: (e) ->
    @entities[e.eID] = e
    
  forgetEntity: (e) ->
    delete @entities[e.eID]


class Component
  constructor: ->
    @name = "Component"
