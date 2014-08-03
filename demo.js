angular.module('demo', ['waterfall','ui.ace']).controller('controller', function($scope){

	$scope.flow = {
		"2e360108d95f3cda2e7467d3": {
			class: 'active',
			title: "<b>Application</b>",
			visible: true,
			next: [
				"9dcd650c0544dd3dc82fd87a"
			]
		},
		"9dcd650c0544dd3dc82fd87a": {
			html: "Contact Reviewers",
			visible: false,
			next: [
				"e882df32df91f89f9a8324dc",
			]
		},
		"e882df32df91f89f9a8324dc": {
			html: "Approval",
			visible: true,
			next: [
				"01c4ce41a83eab1aa8e37508",
				"2cb9719ab7b2ccecf228e90b"
			]
		},
		"01c4ce41a83eab1aa8e37508": {
			html: "<b>External</b> Review",
			visible: true,
			next: [
				"7a8b9b622827dced9060dd67"
			]
		},
		"2cb9719ab7b2ccecf228e90b": {
			html: "Rejected",
			visible: true,
			next: []
		},
		"7a8b9b622827dced9060dd67": {
			html: "Board Review",
			visible: true,
			next: [
				"ebcf121a5107f9e0be547d5d",
				"ddf1573d5943978fc47c2e86",
				"73d6a11b3c13e868bb9fb284"
			]
		},
		"73d6a11b3c13e868bb9fb284": {
			html: "Rejected",
			visible: true,
			next: []
		},
		"ebcf121a5107f9e0be547d5d": {
			html: "Funds Awarded",
			visible: true,
			next: [
				"aac2d5537a8e52a0d811cab2"
			]
		},
		"ddf1573d5943978fc47c2e86": {
			html: "Review & Resubmit",
			visible: true,
			next: [
				"9366681c7e013ab4c205ba95"
			]
		},
		"9366681c7e013ab4c205ba95": {
			html: "Set Board Meeting",
			visible: false,
			next: [
				"c3920332b5814bc317656fd4"
			]
		},
		"c3920332b5814bc317656fd4": {
			html: "Board Re-Review",
			visible: true,
			next: [
				"ebcf121a5107f9e0be547d5d",
				"a6118a4991705414ce20ec0e"
			]
		},
		"a6118a4991705414ce20ec0e": {
			html: "Rejected",
			visible: true,
			next: []
		},
		"aac2d5537a8e52a0d811cab2": {
			html: "Progress Reports",
			visible: true,
			next: [
				"92db6fbaa744c0270cf01b1f"
			]
		},
		"92db6fbaa744c0270cf01b1f": {
			html: "Final Report",
			visible: true,
			next: []
		}
	};

	$scope.options = {}

	$scope.flowString = '$scope.flow = ' + JSON.stringify($scope.flow, null, 2);
	$scope.optionsString = '$scope.options = {\n'
		+'	"hide": true,\n'
		+'	"node": {\n'
		+'		"width": 180,\n'
		+'		"height": 30,\n'
		+'		"margin": {\n'
		+'			"x": 20,\n'
		+'			"y": 10\n'
		+'		},\n'
		+'		"onclick": function(node){\n'
		+'			console.log(node);\n'
		+'		}\n'
		+'	}\n'
		+'}';

	$scope.$watch('flowString', function(flowString){
		try {
			eval(flowString);
		} catch(e){}
	});

	$scope.$watch('optionsString', function(optionsString){
		try {
			eval(optionsString);
		} catch(e){}
	});

	$scope.test = JSON.stringify($scope.flow, null, 2);


});
