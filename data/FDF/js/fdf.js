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
	if (z < 0) {
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
		g.display.camera.changeProperties(g.map.center, 0.785398163, c.width() / c.height());
		g.display.screen[0] = c[0].width;
		g.display.screen[1] = c[0].height;
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
			pointSpeed: 1
		},
		map: new Map(),
		keys: {},
		display: {
			selectedPoint: null,
			camera: new Camera(),
			screen: vec2.fromValues(800, 450)
		},
		lastUpdate: new Date().getTime()
	};

	g.scenes = {
		1: function() {
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
		},
		2: function() {
			g.map.initializefromHeightMap([])
		}
	};
	
	$("#selectScene").change(function() {
		var current = g.scenes[$("#selectScene option:selected").attr('id')];
		if (typeof(current) !== 'undefined') {
			current();
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
	g.canvas.mouseup(function(event) {
		for (var i = 0; i < g.map.vertexes.length; ++i) {
			var p = project(g.map.vertexes[i]);
				
			if (vec2.distance(p, vec2.fromValues(event.offsetX, event.offsetY)) < g.conf.maximumGrabDistance) {
				g.display.selectedPoint = i;
				return ;
			}
		}
		g.display.selectedPoint = null;
	});
	
	resetSize();
	c.resize(resetSize);
});