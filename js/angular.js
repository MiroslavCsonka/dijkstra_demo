// Generated by CoffeeScript 1.4.0
(function() {
  var application;

  application = angular.module("dijkstraAlgorithm", []);

  application.config([
    '$routeProvider', function($routeProvider) {
      return $routeProvider.when('/vertexes', {
        templateUrl: 'partials/vertexes.html'
      }).when('/edges', {
        templateUrl: 'partials/edges.html'
      }).when('/distance', {
        templateUrl: 'partials/distance.html'
      }).otherwise({
        redirectTo: '/vertexes'
      });
    }
  ]);

  application.factory('Graph', function() {
    return {
      width: 690,
      height: 690,
      uniqueIndex: 1,
      nodes: {},
      paths: [],
      getUniqueIndex: function() {
        return this.uniqueIndex++;
      },
      addNode: function(xParram, yParram) {
        var id, idToUse, name, node, _ref;
        idToUse = this.getUniqueIndex();
        name = "Bod " + xParram + "-" + yParram;
        _ref = this.nodes;
        for (id in _ref) {
          node = _ref[id];
          if (node.x === xParram && node.y === yParram) {
            return;
          }
        }
        return this.nodes[idToUse] = {
          id: idToUse,
          x: xParram,
          y: yParram,
          name: name
        };
      },
      removeNode: function(idParam) {
        return delete this.nodes[idParam];
      },
      addPath: function(From, To, Distance) {
        var info, path, _i, _len, _ref;
        if (From.id === To.id) {
          return;
        }
        _ref = this.paths;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          path = _ref[_i];
          if (path.from.id === From.id && path.to.id === To.id) {
            return;
          }
        }
        info = this.countDegree(From, To);
        return this.paths.push({
          from: From,
          to: To,
          distance: Distance,
          width: info.width,
          degree: info.angle
        });
      },
      countDegree: function(From, To) {
        var degrees, kvadrant, prepona, prilehla, radians, xDiff, yDiff;
        xDiff = To.x - From.x;
        yDiff = From.y - To.y;
        prepona = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
        if (xDiff > 0) {
          if (yDiff > 0) {
            kvadrant = 1;
          } else {
            kvadrant = 4;
          }
        } else {
          if (yDiff > 0) {
            kvadrant = 2;
          } else {
            kvadrant = 3;
          }
        }
        switch (kvadrant) {
          case 1:
            prilehla = To.x - From.x;
            degrees = 0;
            break;
          case 2:
            prilehla = To.x - From.x;
            degrees = 0;
            break;
          case 3:
            prilehla = From.y - To.y;
            degrees = 90;
            break;
          case 4:
            prilehla = To.y - From.y;
            degrees = 270;
        }
        radians = Math.acos(prilehla / prepona);
        degrees += Math.abs(radians * (180 / Math.PI));
        return {
          width: prepona,
          angle: degrees
        };
      }
    };
  });

  /* Controller
  */


  this.mapManageController = function($scope, Graph, $http) {
    $scope.Graph = Graph;
    $scope.distance = null;
    $scope.removeNode = function(idParam) {
      var id, path, _i, _len, _ref;
      id = parseInt(idParam);
      _ref = Graph.paths;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        path = _ref[_i];
        if (path.from.id === id || path.to.id === id) {
          this.removePath(path);
        }
      }
      return Graph.removeNode(id);
    };
    $scope.removePath = function(path) {
      var index;
      index = Graph.paths.indexOf(path);
      return Graph.paths.splice(index, 1);
    };
    $scope.addNode = function() {
      return Graph.addNode(window.event.x, window.event.y);
    };
    $scope.addPath = function(form) {
      var fromGraph, toGraph;
      fromGraph = Graph.nodes[form.from];
      toGraph = Graph.nodes[form.to];
      Graph.addPath(fromGraph, toGraph, form.distance);
      if (form.oriented != null) {
        Graph.addPath(toGraph, fromGraph, form.distance);
      }
      return delete this.form;
    };
    $scope.removePath = function(index) {
      return Graph.paths.splice(index, 1);
    };
    $scope.makeRandomPaths = function() {
      var from, id, to, _ref, _results;
      _ref = Graph.nodes;
      _results = [];
      for (id in _ref) {
        from = _ref[id];
        _results.push((function() {
          var _ref1, _results1;
          _ref1 = Graph.nodes;
          _results1 = [];
          for (id in _ref1) {
            to = _ref1[id];
            _results1.push(Graph.addPath(from, to, Math.round(Math.random() * 10) + 1));
          }
          return _results1;
        })());
      }
      return _results;
    };
    return $scope.countDistance = function(form) {
      var out, path;
      out = (function() {
        var _i, _len, _ref, _results;
        _ref = Graph.paths;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          path = _ref[_i];
          _results.push({
            from: Graph.nodes[path.from.id].name,
            to: Graph.nodes[path.to.id].name,
            distance: path.distance
          });
        }
        return _results;
      })();
      return $http({
        url: "backend.php",
        data: {
          "paths": out,
          from: Graph.nodes[form.from].name,
          to: Graph.nodes[form.to].name
        },
        method: "POST"
      }).success(function(response) {
        console.log(response);
        return $scope.response = response;
      }).error(function() {
        return $scope.response = {
          message: "Nastala chyba při vyřizování požadavku"
        };
      });
    };
  };

}).call(this);
