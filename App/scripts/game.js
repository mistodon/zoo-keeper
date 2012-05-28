(function() {
  var Appearance, Component, Entity, Game, GameState, GroupSystem, Position, SpriteSystem, State, System, all, animFrame, any, createProgram, initWebGL, loadShader, log;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  log = function() {
    var strings;
    strings = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log.apply(console, strings);
  };
  loadShader = function(fname) {
    var ext, gl, req, shader, shaderCode, shaderURL;
    shaderURL = "/data/shaders/" + fname;
    req = new XMLHttpRequest();
    req.open("GET", shaderURL, false);
    req.send();
    shaderCode = req.responseText;
    ext = fname.slice(fname.length - 2);
    gl = window.globals.gl;
    if (ext === "vs") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    gl.shaderSource(shader, shaderCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      log("Shader compilation error: " + gl.getShaderInfoLog(shader));
      return null;
    } else {
      return shader;
    }
  };
  createProgram = function(vertShader, fragShader) {
    var gl, shaderProg;
    if (typeof vertShader === "string") {
      vertShader = loadShader(vertShader);
    }
    if (typeof fragShader === "string") {
      fragShader = loadShader(fragShader);
    }
    gl = window.globals.gl;
    shaderProg = gl.createProgram();
    gl.attachShader(shaderProg, vertShader);
    gl.attachShader(shaderProg, fragShader);
    gl.linkProgram(shaderProg);
    if (!gl.getProgramParameter(shaderProg, gl.LINK_STATUS)) {
      log("Error linking shader program.");
    }
    return shaderProg;
  };
  all = function(bools) {
    if (bools.length === 0) {
      return true;
    } else {
      return bools[0] && all(bools.slice(1));
    }
  };
  any = function(bools) {
    if (bools.length === 0) {
      return false;
    } else {
      return bools[0] || any(bools.slice(1));
    }
  };
  State = (function() {
    function State() {
      this.nextID = 0;
      this.entities = [];
      this.keyEntities = {};
      this.updateList = {};
      this.systems = [];
      this.events = [];
      this.nextState = null;
    }
    State.prototype.draw = function(context) {};
    State.prototype.tick = function(delta) {};
    State.prototype.addSystem = function(sys) {
      this.systems.push(sys);
      sys.world = this;
      return sys;
    };
    State.prototype.makeEntity = function(name) {
      var e, eNum;
      if (name == null) {
        name = null;
      }
      eNum = this.nextID;
      this.nextID += 1;
      e = new Entity(this, eNum, name);
      this.entities.push(e);
      if (name) {
        this.keyEntities[name] = e;
      }
      return e;
    };
    State.prototype.cleanUp = function() {
      var deadList, e, sys, _i, _len, _results;
      deadList = (function() {
        var _i, _len, _ref, _results;
        _ref = this.entities;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          if (e.dead) {
            _results.push(e);
          }
        }
        return _results;
      }).call(this);
      this.entities = (function() {
        var _i, _len, _ref, _results;
        _ref = this.entities;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e = _ref[_i];
          if (!e.dead) {
            _results.push(e);
          }
        }
        return _results;
      }).call(this);
      _results = [];
      for (_i = 0, _len = deadList.length; _i < _len; _i++) {
        e = deadList[_i];
        _results.push((function() {
          var _j, _len2, _ref, _results2;
          _ref = this.systems;
          _results2 = [];
          for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
            sys = _ref[_j];
            _results2.push(sys.forgetEntity(e));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    State.prototype.addEvent = function(event) {
      return this.events.push(event);
    };
    State.prototype.clearEvents = function() {
      return this.events = [];
    };
    State.prototype.updateAll = function() {
      var e, id, _ref, _results;
      _ref = this.updateList;
      _results = [];
      for (id in _ref) {
        e = _ref[id];
        _results.push(e.update);
      }
      return _results;
    };
    return State;
  })();
  Entity = (function() {
    function Entity(world, eID, name) {
      this.world = world;
      this.eID = eID;
      this.name = name;
      this.comps = {};
      this.dead = false;
    }
    Entity.prototype.addComp = function(comp) {
      this.comps[comp.name] = comp;
      return this.world.updateList[this.eID] = this;
    };
    Entity.prototype.addComps = function() {
      var c, comps, _i, _len, _results;
      comps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = comps.length; _i < _len; _i++) {
        c = comps[_i];
        _results.push(this.addComp(c));
      }
      return _results;
    };
    Entity.prototype.getComp = function(compName) {
      return this.comps[compName];
    };
    Entity.prototype.hasComp = function(compName) {
      return this.comps.hasOwnProperty(compName);
    };
    Entity.prototype.update = function() {
      var c, sys, _i, _len, _ref;
      _ref = this.world.systems;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sys = _ref[_i];
        if (all((function() {
          var _j, _len2, _ref2, _results;
          _ref2 = sys.comps;
          _results = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            c = _ref2[_j];
            _results.push(this.hasComp(c));
          }
          return _results;
        }).call(this))) {
          sys.addEntity(this);
        }
      }
      return delete this.world.updateList[this.eID];
    };
    return Entity;
  })();
  System = (function() {
    function System() {
      var requiredComps;
      requiredComps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.world = null;
      this.entities = {};
      this.comps = requiredComps;
    }
    System.prototype.execute = function(delta) {
      var e, id, _ref, _results;
      _ref = this.entities;
      _results = [];
      for (id in _ref) {
        e = _ref[id];
        _results.push(this.processEntity(e, delta));
      }
      return _results;
    };
    System.prototype.processEntity = function(e, delta) {};
    System.prototype.addEntity = function(e) {
      return this.entities[e.eID] = e;
    };
    System.prototype.forgetEntity = function(e) {
      return delete this.entities[e.eID];
    };
    return System;
  })();
  GroupSystem = (function() {
    __extends(GroupSystem, System);
    function GroupSystem() {
      var requiredComps;
      requiredComps = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.world = null;
      this.groups = {};
      this.comps = requiredComps;
    }
    GroupSystem.prototype.execute = function(delta) {
      var e, group, id, _i, _len, _ref, _results;
      _ref = this.groups;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        group = _ref[_i];
        _results.push((function() {
          var _ref2, _results2;
          _ref2 = this.entities;
          _results2 = [];
          for (id in _ref2) {
            e = _ref2[id];
            _results2.push(this.processEntity(e, group, delta));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    GroupSystem.prototype.processEntity = function(e, group, delta) {};
    GroupSystem.prototype.getGroup = function(entity) {
      return "entities";
    };
    GroupSystem.prototype.addEntity = function(e) {
      var group;
      group = getGroup(e);
      if (!this.groups[group]) {
        this.groups[group] = {};
      }
      return this.groups[group][e.eID] = e;
    };
    GroupSystem.prototype.forgetEntity = function(e) {
      var group;
      group = getGroup(e);
      if (this.groups[group]) {
        return delete this.groups[group][e.eID];
      }
    };
    return GroupSystem;
  })();
  Component = (function() {
    function Component() {
      this.name = "Component";
    }
    return Component;
  })();
  Position = (function() {
    __extends(Position, Component);
    function Position(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.name = "Position";
    }
    return Position;
  })();
  Appearance = (function() {
    __extends(Appearance, Component);
    function Appearance(image) {
      this.image = image;
      this.name = "Appearance";
    }
    return Appearance;
  })();
  SpriteSystem = (function() {
    __extends(SpriteSystem, System);
    function SpriteSystem() {
      var gl, vertices;
      SpriteSystem.__super__.constructor.call(this, "Position", "Appearance");
      gl = window.globals.gl;
      this.vertBuffer = gl.createBuffer();
      this.program = createProgram("sprite.vs", "sprite.fs");
      this.vertPos = gl.getAttribLocation(this.program, "aVertPos");
      this.colour = gl.getUniformLocation(this.program, "uColour");
      gl.enableVertexAttribArray(this.vertPos);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
      vertices = [0.5, 0.5, -1.0, -0.5, 0.5, -1.0, 0.5, -0.5, -1.0, -0.5, -0.5, -1.0];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }
    SpriteSystem.prototype.processEntity = function(e, delta) {
      var gl;
      gl = window.globals.gl;
      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
      gl.vertexAttribPointer(this.vertPos, 3, gl.Float, false, 0, 0);
      gl.uniform4f(this.colour, 1.0, 1.0, 1.0, 1.0);
      return gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    return SpriteSystem;
  })();
  Game = (function() {
    function Game() {
      this.states = {
        "game": GameState
      };
      this.activeState = new GameState();
    }
    Game.prototype.tick = function() {
      this.activeState.cleanUp();
      return this.activeState.tick(30);
    };
    Game.prototype.draw = function() {
      var gl;
      gl = window.globals.gl;
      gl.viewport(0, 0, 800, 480);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      return this.activeState.draw();
    };
    Game.prototype.run = function() {
      var next;
      next = this.activeState.nextState;
      if (next) {
        this.activeState = new this.states[next]();
      }
      this.tick();
      return this.draw();
    };
    return Game;
  })();
  GameState = (function() {
    __extends(GameState, State);
    function GameState() {
      var e0;
      GameState.__super__.constructor.call(this);
      this.spriteSys = this.addSystem(new SpriteSystem());
      e0 = this.makeEntity("Steve");
      e0.addComps(new Position(0, 0, 0), new Appearance("steven.png"));
      e0.update();
    }
    GameState.prototype.draw = function() {
      return this.spriteSys.execute(30);
    };
    GameState.prototype.tick = function() {};
    return GameState;
  })();
  animFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || null;
  window.beginGame = function(canvasID) {
    var canvas, game, mainloop;
    window.globals = {};
    canvas = document.getElementById(canvasID);
    initWebGL(canvas);
    game = new Game();
    mainloop = function() {
      game.run();
      return animFrame(mainloop);
    };
    return animFrame(mainloop);
  };
  initWebGL = function(canvas) {
    var gl;
    gl = null;
    try {
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (error) {

    }
    if (!gl) {
      alert("Unable to initialize WebGL.");
    } else {
      log("WebGL initialized.");
    }
    gl.clearColor(0.3, 0.3, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    return window.globals.gl = gl;
  };
}).call(this);
