(function() {
  var Appearance, Component, Entity, Game, GameState, Position, SpriteSystem, State, System, animFrame, createProgram, initWebGL, loadShader, log;
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
  State = (function() {
    function State() {
      this.nextID = 0;
      this.entities = [];
      this.systems = [];
      this.keyEntities = {};
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
      eNum = this.nextID;
      this.nextID += 1;
      e = new Entity(eNum);
      this.entities.push(e);
      if (name) {
        this.keyEntities[name] = e;
      }
      return e;
    };
    State.prototype.updateEntity = function(e) {
      var sys, _i, _len, _ref, _results;
      _ref = this.systems;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sys = _ref[_i];
        _results.push(this.updateSystemFor(sys, e));
      }
      return _results;
    };
    State.prototype.updateSystemFor = function(sys, e) {
      var c, matches;
      matches = (function() {
        var _i, _len, _ref, _results;
        _ref = sys.comps;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(e.hasComp(c));
        }
        return _results;
      })();
      if (all(matches)) {
        return sys.addEntity(e);
      }
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
    return State;
  })();
  Entity = (function() {
    function Entity(eID) {
      this.eID = eID;
      this.comps = {};
      this.dead = false;
    }
    Entity.prototype.addComp = function(comp) {
      return this.comps[comp.name] = comp;
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
      SpriteSystem.__super__.constructor.call(this, "Position", "Appearance");
    }
    SpriteSystem.prototype.processEntity = function(e, delta) {};
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
      var p;
      GameState.__super__.constructor.call(this);
      p = createProgram("sprite.vs", "sprite.fs");
    }
    GameState.prototype.draw = function() {};
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
