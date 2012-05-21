(function() {
  var Component, Entity, State, System;
  var __slice = Array.prototype.slice;
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
}).call(this);
