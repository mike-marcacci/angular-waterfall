angular.module('waterfall', ['ngSanitize'])

.factory('waterfall', function(){
	'use strict';

	// find the distances of all upstream path
	function upstream(node){
		if(node.upstream)
			return node.upstream;

		// if this is a head node
		if(node.previous.length === 0)
			return node.upstream = [0];

		node.upstream = [];
		node.previous.forEach(function(previous){
			upstream(previous).forEach(function(distance){
				node.upstream.push(distance+1);
			});
		});
		return node.upstream;
	}

	// find the distances of all downstream path
	function downstream(node){
		if(node.downstream)
			return node.downstream;

		// if this is a tail node
		if(node.next.length === 0)
			return node.downstream = [0];

		node.downstream = [];
		node.next.forEach(function(next){
			downstream(next).forEach(function(distance){
				if(node.downstream.indexOf(distance) === -1)
					node.downstream.push(distance+1);
			});
		});
		return node.downstream;
	}

	function calculateScore(node){
		node.score = node.upstream.reduce(function(a,b){return a+b;})+node.downstream.reduce(function(a,b){return a+b;});
		node.scoreUp = node.upstream.reduce(function(a,b){return a+b;});
		node.scoreDown = node.downstream.reduce(function(a,b){return a+b;});
	}

	return function(flow, options) {
		var index = {}, key;
		var nodes = [];

		// map nodes to index
		for(key in flow){
			index[key] = {
				id: key,
				html: flow[key].html || (flow[key].title ? flow[key].title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''),
				class: flow[key].class || '',
				visible: flow[key].visible || flow[key].visible === undefined,
				next: Array.isArray(flow[key].next) ? flow[key].next.slice() : [],
				previous: []
			};
		};

		if(Object.keys(index).length === 0)
			return nodes;

		// relate nodes
		for(key in index){
			var node = index[key];
			node.next.forEach(function(id, i, list){
				// build the relationships

				var next = list[i] = index[id];
				if(next.previous)
					next.previous.push(node);
				else
					next.previous = [node]
			});

			// add node to nodes array
			nodes.push(node);
		};

		// remove hidden nodes
		if(options.hide){
			for(key in index){
				var node = index[key];

				if(!node.visible){
					node.next.forEach(function(next){
						// remove self from next nodes
						next.previous.splice(next.previous.indexOf(node), 1);

						// add next nodes to previous nodes
						node.previous.forEach(function(previous){
							if(previous.next.indexOf(next) === -1){
								previous.next.push(next)
							}
						})
					});

					node.previous.forEach(function(previous){
						// remove self from previous nodes
						previous.next.splice(previous.next.indexOf(node), 1);

						// add previous nodes to next nodes
						node.next.forEach(function(next){
							if(next.previous.indexOf(previous) === -1)
								next.previous.push(previous)
						})
					});

					// remove self from the array
					nodes.splice(nodes.indexOf(node), 1);

				}
			};
		}

		// calculate distances
		for(var i in nodes){
			var node = nodes[i];
			upstream(node);
			downstream(node);
			// calculateX(node); // calculate x
			calculateScore(node); // calculate score from total upstream and downstream
		};

		// sort by score
		nodes.sort(function(a,b){
			return a.score < b.score ? 1 : -1;
		});

		// assign y values, beginning with the lowest score
		// calculateY(nodes[0], 0);

		return nodes;
	}
})

.directive('waterfall', ['waterfall', function(waterfall) {
	return {
		restrict: 'A',
		template: ''
			+'<svg class="waterfall" ng-attr-width="{{width}}" ng-attr-height="{{height}}">\n'
			+'	<g ng-attr-transform="translate({{options.node.width / -2 + options.node.margin.x}}, {{height - options.node.height}})">\n'
			+'		<g ng-repeat="node in nodes" ng-class="node.class" ng-attr-transform="translate({{node.x}}, {{node.y}})" ng-click="options.node.onclick(node)">\n'
			+'			<foreignObject\n'
			+'				ng-attr-width="{{options.node.width}}"\n'
			+'				ng-attr-height="{{options.node.height}}"\n'
			+'				ng-attr-rx="{{options.node.radius}}"\n'
			+'				ng-attr-ry="{{options.node.radius}}"\n'
			+'			>\n'
			+'				<div ng-attr-style="\n'
			+'					width: {{options.node.width}}px;\n'
			+'					height: {{options.node.height}}px;\n'
			+'				" ng-bind-html="node.html"></div>\n'
			+'			</foreignObject>\n'
			+'		</g>\n'
			+'		<path\n'
			+'			ng-repeat="link in links"\n'
			+'			ng-attr-d="\n'
			+'				M {{link.source.x}} {{link.source.y}}\n'
			+'				Q {{link.q1[0][0]}} {{link.q1[0][1]}},\n'
			+'					{{link.q1[1][0]}} {{link.q1[1][1]}}\n'
			+'				Q {{link.q2[0][0]}} {{link.q2[0][1]}},\n'
			+'					{{link.q2[1][0]}} {{link.q2[1][1]}}\n'
			+'				T {{link.target.x}} {{link.target.y}}"\n'
			+'		/>\n'
			+'	</g>\n'
			+'</svg>\n',
		require: 'ngModel',
		scope: {
			flow: '=ngModel',
			opts: '=waterfall'
		},
		controller: function($scope, $element, $attrs, $parse) {

			function calculateX(node){
				node.x = (Math.max.apply(Math, node.upstream) + 0.5) * ($scope.options.node.width + $scope.options.node.margin.x * 2);

				// calculate canvas width
				$scope.width = Math.max($scope.width, node.x);
			}

			function calculateY(node, level, n){
				if(node.level != null)
					return;

				node.level = level;
				node.y = -level * ($scope.options.node.height + $scope.options.node.margin.y * 2);

				node.next.sort(function(a,b){
					// put tail nodes on top
					if(a.scoreDown === 0)
						return 1;
					if(b.scoreDown === 0)
						return -1;

					// upstream sort
					return a.scoreUp < b.scoreUp ? 1 : -1;
				}).forEach(function(next, index){
					calculateY(next, level+index, node);
				});

				node.previous.sort(function(a,b){
					// put head nodes on top
					if(a.scoreUp === 0)
						return 1;
					if(b.scoreUp === 0)
						return -1;

					// downstream sort
					return a.scoreDown < b.scoreDown ? 1 : -1;
				}).forEach(function(previous, index){
					calculateY(previous, level+index, node)
				});

				// calculate canvas height
				$scope.height = Math.max($scope.height, -node.y);
			}

			// set options
			$scope.$watch('opts', function(options) {
				$scope.options = {
					hide: options && typeof options.hide !== 'undefined' ? options.hide : true,
					node: {
						width: options && options.node && typeof options.node.width !== 'undefined' ? options.node.width : 180,
						height: options && options.node && typeof options.node.height !== 'undefined' ? options.node.height : 30,
						onclick: options && options.node && typeof options.node.onclick !== 'undefined' ? options.node.onclick : null,
						margin: {
							x: options && options.node && options.node.margin && typeof options.node.margin.x !== 'undefined' ? options.node.margin.x : 20,
							y: options && options.node && options.node.margin && typeof options.node.margin.y !== 'undefined' ? options.node.margin.y : 10
						}
					}
				}
			});

			// build the waterfall
			$scope.$watch('flow', function(flow) {

				if(!$scope.options)
					return;

				$scope.nodes = waterfall(flow, $scope.options);
				$scope.links = [];

				$scope.width = 0;
				$scope.height = 0;

				// calculate x values
				for(i in $scope.nodes){
					calculateX($scope.nodes[i]);
				}

				// assign y values, beginning with the lowest score
				calculateY($scope.nodes[0], 0);

				// build links
				for(i in $scope.nodes){
					var node = $scope.nodes[i];
					node.next.forEach(function(next){
						var l = {
							source: {
								x: node.x + $scope.options.node.width,
								y: node.y + $scope.options.node.height / 2
							},
							target: {
								x: next.x,
								y: next.y + $scope.options.node.height / 2
							}
						}

						var offset = Math.min(Math.abs(l.target.y - l.source.y), $scope.options.node.margin.x) * ((l.target.y - l.source.y < 0) ? 1 : -1);

						// the x middle
						var c = (l.source.x + l.target.x) / 2;

						// bezier points and handles
						l.q1 = [ [c, l.source.y], [c, l.source.y - offset] ];
						l.q2 = [ [c, l.target.y + 2 * offset], [c, l.target.y + offset] ];

						$scope.links.push(l);
					})
				}

				// pad the canvas
				$scope.width += $scope.options.node.width;
				$scope.height += $scope.options.node.height;
			}, true);

		}
	};
}]);
