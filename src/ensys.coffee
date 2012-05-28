all = (bools) ->
  if bools.length is 0
    return true
  else
    return bools[0] and all bools[1..]

any = (bools) ->
  if bools.length is 0
    return false
  else
    return bools[0] or any bools[1..]

class State
  constructor: ->
    @nextID = 0
    @entities = []
    @keyEntities = {}
    @updateList = {}
    
    @systems = []
    @events = []
    @nextState = null
    
  draw: (context) ->
  
  tick: (delta) ->
  
  addSystem: (sys) ->
    @systems.push sys
    sys.world = this
    return sys
    
  makeEntity: (name = null) ->
    eNum = @nextID
    @nextID += 1
    e = new Entity(this,eNum,name)
    @entities.push(e)
    if name
      @keyEntities[name] = e
    return e
  
  cleanUp: ->
    deadList = (e for e in @entities when e.dead)
    @entities =  (e for e in @entities when not e.dead)
    sys.forgetEntity(e) for sys in @systems for e in deadList
  
  addEvent: (event) ->
    @events.push(event)
  
  clearEvents: ->
    @events = []
  
  updateAll: ->
    e.update for id, e of @updateList
    

class Entity
  constructor: (@world, @eID, @name) ->
    @comps = {}
    @dead = false
    
  addComp: (comp) ->
    @comps[comp.name] = comp
    @world.updateList[@eID] = this
    
  addComps: (comps...) ->
    @addComp c for c in comps
  
  getComp: (compName) ->
    return @comps[compName]
  
  hasComp: (compName) ->
    return @comps.hasOwnProperty compName
  
  update: ->
    for sys in @world.systems
      if all (@hasComp(c) for c in sys.comps)
        sys.addEntity(this)
    delete @world.updateList[@eID]


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

class GroupSystem extends System
  constructor: (requiredComps...) ->
    @world = null
    @groups = {}
    @comps = requiredComps
  
  execute: (delta) ->
    for group in @groups
      @processEntity(e, group, delta) for id, e of @entities
      
  processEntity: (e, group, delta) ->
  
  getGroup: (entity) ->
    return "entities"
  
  addEntity: (e) ->
    group = getGroup(e)
    if not @groups[group]
      @groups[group] = {}
    @groups[group][e.eID] = e
  
  forgetEntity: (e) ->
    group = getGroup(e)
    if @groups[group]
      delete @groups[group][e.eID]

class Component
  constructor: ->
    @name = "Component"
