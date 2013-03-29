application = angular.module("dijkstraAlgorithm", []);
application.config [
										 '$routeProvider', ($routeProvider) ->
												$routeProvider
													.when('/vertexes', {templateUrl : 'partials/vertexes.html'})
													.when('/edges', {templateUrl : 'partials/edges.html'})
													.when('/distance', {templateUrl : 'partials/distance.html'})
													.otherwise({redirectTo : '/vertexes'})
									 ]


application.factory 'Graph', ->
	{
	width : 690
	height : 690
	uniqueIndex : 1
	nodes :
		{}
	paths : []
	getUniqueIndex : ->
		@uniqueIndex++

	addNode : (xParram, yParram) ->
		idToUse = @getUniqueIndex()
		name = "Bod #{xParram}-#{yParram}"
		for id,node of @nodes
			if node.x is xParram and node.y is yParram then return ## V jednom bodě [x,y] může být maximálně jeden bod
		@nodes[idToUse] =
			id : idToUse
			x : xParram
			y : yParram
			name : name

	removeNode : (idParam)->
		delete @nodes[idParam]

	addPath : (From, To, Distance) ->
		if From.id is To.id
			return
		for path in @paths
			if path.from.id is From.id and path.to.id is To.id then return ## od jedoho do druhého bodu může vést maximálně jedna cesta

		info = @countDegree(From, To)
		@paths.push({
								from : From
								to : To
								distance : Distance
								width : info.width
								degree : info.angle
								})

	countDegree : (From, To)->
		xDiff = To.x - From.x
		yDiff = From.y - To.y
		prepona = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))
		if xDiff > 0
			if yDiff > 0
				kvadrant = 1
			else
				kvadrant = 4
		else
			if yDiff > 0
				kvadrant = 2
			else
				kvadrant = 3
		switch kvadrant
			when 1
				prilehla =  To.x - From.x
				degrees = 0
			when 2
				prilehla = To.x - From.x
				degrees = 0
			when 3
				prilehla = From.y - To.y
				degrees = 90
			when 4
				prilehla = To.y - From.y
				degrees = 270
		radians = Math.acos(prilehla / prepona)
		degrees += Math.abs(radians * (180 / Math.PI))
		return width : prepona, angle : degrees
	}

### Controller ###
@mapManageController = ($scope, Graph, $http) ->
	$scope.Graph = Graph
	$scope.distance = null

	$scope.removeNode = (idParam) ->
		id = parseInt(idParam)
		for path in Graph.paths
			if path.from.id is id or path.to.id is id
				@removePath(path)

		Graph.removeNode(id)

	$scope.removePath = (path) ->
		index = Graph.paths.indexOf(path)
		Graph.paths.splice(index, 1)

	$scope.addNode = ->
		Graph.addNode window.event.x, window.event.y

	$scope.addPath = (form) ->
		fromGraph = Graph.nodes[form.from]
		toGraph = Graph.nodes[form.to]
		Graph.addPath fromGraph, toGraph, form.distance
		if form.oriented?
			Graph.addPath toGraph, fromGraph, form.distance
		delete @form

	$scope.removePath = (index)->
		Graph.paths.splice(index, 1);

	$scope.makeRandomPaths = ->
		for id,from of Graph.nodes
			for id,to of Graph.nodes
				Graph.addPath(from, to, Math.round(Math.random() * 10))

	$scope.countDistance = (form) ->
		out = for path in Graph.paths
			{
			from : Graph.nodes[path.from.id].name
			to : Graph.nodes[path.to.id].name
			distance : path.distance
			}
		$http({
					url : "backend.php"
					data :
						"paths" :  out
						from: Graph.nodes[form.from].name
						to: Graph.nodes[form.to].name
					method : "POST"
					}).success (response) ->
							console.log response
							$scope.response = response
						.error ->
							$scope.response =
								message: "Nastala chyba při vyřizování požadavku"

