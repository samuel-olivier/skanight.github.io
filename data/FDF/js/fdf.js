var g = {};

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
	// var p = vec3.fromValues(x, y, z);
	// g.display.camera.project(p);
	// var res = vec2.fromValues(g.conf.cte1 * p[0] - g.conf.cte2 * p[1], -p[2] + g.conf.cte1 * 0.5 * p[0] + g.conf.cte2 * 0.5 * p[1]);
	// var p = rotate(vec2.fromValues(g.map.width / 2, g.map.height / 2), g.display.rotation, vec2.fromValues(p3D[0], p3D[1])),
		// res = vec2.fromValues(g.conf.cte1 * p[0] - g.conf.cte2 * p[1], -p3D[2] + g.conf.cte1 * 0.5 * p[0] + g.conf.cte2 * 0.5 * p[1]);
	
	// vec2.multiply(res, res, g.display.screenFactor);
	// vec2.add(res, res, g.display.screenTranslation);
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
		g.display.rotation += g.conf.angularSpeed * elapsed;
	} else if (g.keys[39] == true) {
		g.display.rotation -= g.conf.angularSpeed * elapsed;
	}

	if (g.keys[38] == true) {
		vec2.subtract(g.display.screenFactor, g.display.screenFactor, vec2.fromValues(g.conf.zoomSpeed * elapsed, g.conf.zoomSpeed * elapsed));
	} else if (g.keys[40] == true) {
		vec2.add(g.display.screenFactor, g.display.screenFactor, vec2.fromValues(g.conf.zoomSpeed * elapsed, g.conf.zoomSpeed * elapsed));
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

function calcLine(x1, y1, x2, y2) {
	var c = "#59AEB7",
		z1 = g.map.map[y1][x1],
		z2 = g.map.map[y2][x2],
		p1 = project(x1, y1, z1),
		p2 = project(x2, y2, z2);
	
	if (g.display.selectedPoint != null && (vec2.distance(vec2.fromValues(x1, y1), g.display.selectedPoint) == 0 || vec2.distance(vec2.fromValues(x2, y2), g.display.selectedPoint) == 0)) {
		c = "#FFF";
	} else {
		c = g.context.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
		c.addColorStop(0, computeColor(z1));
		c.addColorStop(1, computeColor(z2));
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
	}
	resetSize();

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
			screenFactor: vec2.fromValues(30, 30),
			screenTranslation: vec2.fromValues(c.width() / 2, c.height() / 4),
			rotation: 0,
			selectedPoint: null,
			camera: new Camera(vec3.fromValues(10, 10, 0), 0.785398163, c.width() / c.height())
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
				var p = project(x, y, g.map.map[y][x]);
				
				if (vec2.distance(p, vec2.fromValues(event.offsetX, event.offsetY)) < g.conf.maximumGrabDistance) {
					g.display.selectedPoint = vec2.fromValues(x, y);
					return ;
				}
			}
		}
		g.display.selectedPoint = null;
	});
	$(document).mousemove(function(e) {
	
	});
	
	c.resize(resetSize);
});