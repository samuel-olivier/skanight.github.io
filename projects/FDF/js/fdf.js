var g = {};

function clamp(val, min, max) {
	return Math.min(max, Math.max(min, val));
}

function drawLine(x1, x2, color) {
    g.context.lineWidth = 1;
	g.context.strokeStyle = color;
	g.context.beginPath();
	g.context.moveTo(x1[0], x1[1]);
	g.context.lineTo(x2[0], x2[1]);
	g.context.stroke();
}

function drawRect(p, s, color) {
	g.context.fillStyle = color;
	g.context.fillRect(p[0], p[1], s[0], s[1]);
}

function rotate(c, angle, pp) {
	var mat = mat2.create();
	mat2.rotate(mat, mat2.create(), angle);
	
	var p = vec2.clone(pp);
	vec2.subtract(p, p, c);
	vec2.transformMat2(p, p, mat);
	vec2.add(p, p, c);
	return p;
}

function project(v) {
	var res = g.display.camera.project(v);
	vec2.add(res, res, vec2.fromValues(0.5, 0.5));
	vec2.multiply(res, res, vec2.fromValues(g.display.screen[0], g.display.screen[1]));
	return res;
}

function computeColor(z) {
	if (g.display.gradientColor == false) {
		return "#000080";
	} else if (z < 0) {
		return "#000080";
	} else if (z < 3) {
		return "#ACE359";
	} else if (z < 5) {
		return "#696969";
	}
	return "#000";
}

function update() {
	var currentTime = new Date().getTime(),
		elapsed = (g.lastUpdate - currentTime) / 1000;

	if (g.keys[37] === true) {
		g.display.camera.changeYAngle(-g.conf.angularSpeed * elapsed);
	} else if (g.keys[39] == true) {
		g.display.camera.changeYAngle(g.conf.angularSpeed * elapsed);
	}

	if (g.keys[17] === true) {
		if (g.keys[38] === true) {
			g.display.camera.changeDistance(g.conf.zoomSpeed * elapsed);
		} else if (g.keys[40] === true) {
			g.display.camera.changeDistance(-g.conf.zoomSpeed * elapsed);
		}
	} else {
		if (g.keys[38] === true) {
			g.display.camera.changeXAngle(g.conf.angularSpeed * elapsed);
		} else if (g.keys[40] === true) {
			g.display.camera.changeXAngle(-g.conf.angularSpeed * elapsed);
		}
	} 
	
	if (g.display.selectedPoint != null) {
		if (g.keys[87] === true) {
			g.map.vertexes[g.display.selectedPoint][1] -= g.conf.pointSpeed * elapsed;
		} else if (g.keys[83] === true) {
			g.map.vertexes[g.display.selectedPoint][1] += g.conf.pointSpeed * elapsed;
		}
		if (g.keys[65] === true) {
			g.map.vertexes[g.display.selectedPoint][0] -= g.conf.pointSpeed * elapsed;
		} else if (g.keys[68] === true) {
			g.map.vertexes[g.display.selectedPoint][0] += g.conf.pointSpeed * elapsed;
		}
		if (g.keys[81] === true) {
			g.map.vertexes[g.display.selectedPoint][2] -= g.conf.pointSpeed * elapsed;
		} else if (g.keys[69] === true) {
			g.map.vertexes[g.display.selectedPoint][2] += g.conf.pointSpeed * elapsed;
		}
	}
	g.display.camera.update();
	g.lastUpdate = currentTime;
}

function calcLine(v1, v2, selected) {
	var c = "#59AEB7",
		p1 = project(v1),
		p2 = project(v2);
	
	if (selected) {
		c = "#F00";
	} else {
		c = g.context.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
		c.addColorStop(0, computeColor(v1[1]));
		c.addColorStop(1, computeColor(v2[1]));
	}
	drawLine(p1, p2, c);
}



function draw() {
	drawRect(vec2.fromValues(0, 0), vec2.fromValues(g.canvas.width(), g.canvas.height()), "#EDEDED");
	for (var i = 0; i < g.map.lines.length; ++i) {
		var l = g.map.lines[i],
			v1 = g.map.vertexes[l.v1];
			v2 = g.map.vertexes[l.v2];
		calcLine(v1, v2, g.display.selectedPoint != null && (g.display.selectedPoint == l.v1 || g.display.selectedPoint == l.v2));
	}
}

$(function() {
	var c = $("#canvas");
	function resetSize() {
		c[0].width = c.width();
		c[0].height = c.height();
		g.display.screen[0] = c[0].width;
		g.display.screen[1] = c[0].height;
		g.display.camera.changeProperties(g.map.center, 0.785398163, g.display.screen[0] / g.display.screen[1]);
	}

	g = {
		canvas: c,
		context: c[0].getContext("2d"),
		conf: {
			cte1: 0.5,
			cte2: 0.5,
			angularSpeed: 0.6,
			zoomSpeed: 10,
			maximumGrabDistance: 5,
			minimumDragDistance: 2,
			pointSpeed: 1
		},
		map: new Map(),
		keys: {},
		display: {
			selectedPoint: null,
			camera: new Camera(),
			screen: vec2.fromValues(800, 450),
			startPoint: null,
			lastPoint: null,
			isDragging: false,
			gradientColor: true
		},
		lastUpdate: new Date().getTime()
	};

	g.scenes = {
		1: function(afterLoad) {
			g.map.initializefromHeightMap([
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1 ,1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1 ,-1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, -1, -2, -2, -2, -2, -2, -1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, -1, -2, -3, -3, -3, -2, -1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, -1, -2, -3, -4, -3, -2, -1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, -1, -2, -3, -3, -3, -2, -1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, -1, -2, -2, -2, -2, -2, -1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			]);
			g.display.camera.angle[0] = -0.95;
			g.display.camera.angle[1] = 4.03;
			g.display.camera.distance = 43;
			g.display.gradientColor = true;
			afterLoad();
		},
		2: function(afterLoad) {
			var map = [];
			for (var y = 0; y < 15; y++) {
				var line = [];
				for (var x = 0; x < 40; x++) {
					line.push(Math.sin((x + y) / 2) * 2);
				}
				map.push(line);
			}
			g.map.initializefromHeightMap(map);
			g.display.camera.angle[0] = -0.58;
			g.display.camera.angle[1] = 2.34;
			g.display.camera.distance = 67;
			g.display.gradientColor = true;
			afterLoad();
		},
		3: function(afterLoad) {
			var thetaNumber = 10,
				alphaNumber = 20,
				vertexes = [],
				lines = [];
			
			vertexes.push(vec3.fromValues(0, 1, 0));
			vertexes.push(vec3.fromValues(0, -1, 0));
			for (var y = 1; y < thetaNumber; ++y) {
				var theta = Math.PI / 2 - y * Math.PI / thetaNumber,
					p = vec2.fromValues(Math.cos(theta), Math.sin(theta)),
					up = vec2.fromValues(0, 1),
					proj = vec2.create();
				
				vec2.scale(proj, up, vec2.dot(p, up));
				var r = vec2.distance(proj, p);
				for (var x = 0; x < alphaNumber; ++x) {
					var alpha = 2 * x * Math.PI / alphaNumber;
					
					vertexes.push(vec3.fromValues(Math.cos(alpha) * r, p[1], Math.sin(alpha) * r));
					if (y == 1) {
						lines.push({
							v1: 0,
							v2: 2 + (y - 1) * alphaNumber + x
						});
					}
					var nextHorIdx = 2 + (y - 1) * alphaNumber + x + 1,
						nextVerIdx = 2 + y * alphaNumber + x;
					if (x == alphaNumber - 1) {
						nextHorIdx = 2 + (y - 1) * alphaNumber;
					}
					if (y == thetaNumber - 1) {
						nextVerIdx = 1;
					}
					lines.push({
						v1: 2 + (y - 1) * alphaNumber + x,
						v2: nextHorIdx,
					});
					lines.push({
						v1: 2 + (y - 1) * alphaNumber + x,
						v2: nextVerIdx
					});
				}
			}
			g.map.setMap(vertexes, lines, vec3.fromValues(0, 0, 0));
			g.display.camera.angle[0] = -0.38;
			g.display.camera.angle[1] = 2.5;
			g.display.camera.distance = 10;
			g.display.gradientColor = true;
			afterLoad();
		},
		4: function(afterLoad) {
			function afterLoadFunc() {
				g.display.camera.angle[0] = -0.58;
				g.display.camera.angle[1] = 2.34;
				g.display.camera.distance = 300;
				g.display.gradientColor = false;
				afterLoad();
			}
			g.map.initializefromOBJ("raptor.obj", afterLoadFunc);
		},

	};
	
	$("#selectScene")
	.change(function() {
		var current = g.scenes[$("#selectScene option:selected").attr('id')];
		if (typeof(current) !== 'undefined') {
			function afterLoad() {
				g.display.camera.changeProperties(g.map.center, 0.785398163, g.display.screen[0] / g.display.screen[1]);
				g.display.selectedPoint = null;
			}
			current(afterLoad);
		}
	})
	.change();
  
	setInterval(function() {
		update();
		draw();
	}, 1000 / 30);
	
	$(document)
	.keydown(function(event) {
		g.keys[event.keyCode] = true;
	})
	.keyup(function(event) {
		g.keys[event.keyCode] = false;
	});
	g.canvas
	.mouseup(function(event) {
		g.display.startPoint = null;
		g.display.lastPoint = null;
		if (g.display.isDragging == false) {
			g.display.isDragging = false;
			for (var i = 0; i < g.map.vertexes.length; ++i) {
				var p = project(g.map.vertexes[i]);
					
				if (vec2.distance(p, vec2.fromValues(event.offsetX, event.offsetY)) < g.conf.maximumGrabDistance) {
					g.display.selectedPoint = i;
					return ;
				}
			}
			g.display.selectedPoint = null;
		}
		g.display.isDragging = false;
	})
	.mousedown(function(event) {
		g.display.startPoint = vec2.fromValues(event.offsetX, event.offsetY);
	})
	.mousemove(function (event) {
		var currentPoint = vec2.fromValues(event.offsetX, event.offsetY);
		if (g.display.lastPoint == null && g.display.startPoint != null && vec2.distance(currentPoint, g.display.startPoint) >= g.conf.minimumDragDistance) {
			g.display.isDragging = true;
			g.display.lastPoint = vec2.clone(g.display.startPoint);
		}
		if (g.display.isDragging == true) {
			g.display.camera.changeYAngle((currentPoint[0] - g.display.lastPoint[0]) / 300);
			g.display.camera.changeXAngle(-(currentPoint[1] - g.display.lastPoint[1]) / 300);
			g.display.lastPoint = currentPoint;
		}
	});
	
	resetSize();
	c.resize(resetSize);
});