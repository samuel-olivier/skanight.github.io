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

function project(x, y, z) {
	var res = g.display.camera.project(vec3.fromValues(x, y, z));
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

	if (g.keys[37] == true) {
		g.display.camera.changeYAngle(-g.conf.angularSpeed * elapsed);
	} else if (g.keys[39] == true) {
		g.display.camera.changeYAngle(g.conf.angularSpeed * elapsed);
	}

	if (g.keys[38] == true) {
		g.display.camera.changeXAngle(g.conf.angularSpeed * elapsed);
	} else if (g.keys[40] == true) {
		g.display.camera.changeXAngle(-g.conf.angularSpeed * elapsed);
	}
	
	if (g.display.selectedPoint != null) {
		if (g.keys[107] == true) {
			g.map.map[g.display.selectedPoint[1]][g.display.selectedPoint[0]] -= g.conf.pointSpeed * elapsed;
		} else if (g.keys[109] == true) {
			g.map.map[g.display.selectedPoint[1]][g.display.selectedPoint[0]] += g.conf.pointSpeed * elapsed;
		}
	}
	g.display.camera.update();
	g.lastUpdate = currentTime;
}

function calcLine(x1, z1, x2, z2) {
	var c = "#59AEB7",
		y1 = g.map.map[z1][x1],
		y2 = g.map.map[z2][x2],
		p1 = project(x1, y1, z1),
		p2 = project(x2, y2, z2);
	
	if (g.display.selectedPoint != null && (vec2.distance(vec2.fromValues(x1, z1), g.display.selectedPoint) == 0 || vec2.distance(vec2.fromValues(x2, z2), g.display.selectedPoint) == 0)) {
		c = "#FFF";
	} else {
		c = g.context.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
		c.addColorStop(0, computeColor(y1));
		c.addColorStop(1, computeColor(y2));
	}
	drawLine(p1, p2, c);
}

function draw() {
	drawRect(vec2.fromValues(0, 0), vec2.fromValues(g.canvas.width(), g.canvas.height()), "#EDEDED");
	for (var y = 1; y < g.map.height; ++y) {
		for (var x = 1; x < g.map.width; ++x) {
			calcLine(x - 1, y - 1, x, y - 1);
			calcLine(x - 1, y - 1, x - 1, y);
			if (y == g.map.height - 1) {
				calcLine(x - 1, y, x, y);
			}
			if (x == g.map.width - 1) {
				calcLine(x, y - 1, x, y);
			}
		}
	}
}

$(function() {
	var c = $("#canvas");
	function resetSize() {
		c[0].width = c.width();
		c[0].height = c.height();
		g.display.camera.changeProperties(vec3.fromValues(g.map.width / 2, 0, g.map.height / 2), 0.785398163, c.width() / c.height());
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
		map: {
			width: 20,
			height: 20,
			map: [
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
			]
		},
		keys: {},
		display: {
			selectedPoint: null,
			camera: new Camera(),
			screen: vec2.fromValues(800, 450)
		},
		lastUpdate: new Date().getTime()
	};
	
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
		for (var y = 0; y < g.map.height; ++y) {
			for (var x = 0; x < g.map.width; ++x) {
				var p = project(x, g.map.map[y][x], y);
				
				if (vec2.distance(p, vec2.fromValues(event.offsetX, event.offsetY)) < g.conf.maximumGrabDistance) {
					g.display.selectedPoint = vec2.fromValues(x, y);
					return ;
				}
			}
		}
		g.display.selectedPoint = null;
	});
	
	resetSize();
	c.resize(resetSize);
});