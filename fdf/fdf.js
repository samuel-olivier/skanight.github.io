var g = {};

function drawLine(x1, x2, color) {
    g.context.lineWidth = 1;
	g.context.strokeStyle = color;
	g.context.beginPath();
	g.context.moveTo(x1.x, x1.y);
	g.context.lineTo(x2.x, x2.y);
	g.context.stroke();
}

function drawRect(p, s, color) {
	g.context.fillStyle = color;
	g.context.fillRect(p.x, p.y, s.x, s.y);
}

function rotate(c, angle, p) {
	return p.clone().subtract(c).rotate(angle).add(c);
}

function project(x, y, z) {
	var p = rotate(new Victor(g.map.width / 2, g.map.height / 2), g.display.rotation, new Victor(x, y));
	
	return new Victor(g.conf.cte1 * p.x - g.conf.cte2 * p.y, -z + g.conf.cte1 * 0.5 * p.x + g.conf.cte2 * 0.5 * p.y).multiply(g.display.screenFactor).add(g.display.screenTranslation);
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
		g.display.screenFactor.subtract(new Victor(g.conf.zoomSpeed * elapsed, g.conf.zoomSpeed * elapsed));
	} else if (g.keys[40] == true) {
		g.display.screenFactor.add(new Victor(g.conf.zoomSpeed * elapsed, g.conf.zoomSpeed * elapsed));
	}
	
	if (g.display.selectedPoint != null) {
		if (g.keys[107] == true) {
			g.map.map[g.display.selectedPoint.y][g.display.selectedPoint.x] -= g.conf.pointSpeed * elapsed;
		} else if (g.keys[109] == true) {
			g.map.map[g.display.selectedPoint.y][g.display.selectedPoint.x] += g.conf.pointSpeed * elapsed;
		}
	}
	
	g.lastUpdate = currentTime;
}

function calcLine(x1, y1, x2, y2) {
	var c = "#59AEB7",
		z1 = g.map.map[y1][x1],
		z2 = g.map.map[y2][x2],
		p1 = project(x1, y1, z1),
		p2 = project(x2, y2, z2);
	
	if (g.display.selectedPoint != null && (new Victor(x1, y1).distance(g.display.selectedPoint) == 0 || new Victor(x2, y2).distance(g.display.selectedPoint) == 0)) {
		c = "#FFF";
	} else {
		c = g.context.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
		c.addColorStop(0, computeColor(z1));
		c.addColorStop(1, computeColor(z2));
	}
	drawLine(p1, p2, c);
}

function draw() {
	drawRect(new Victor(0, 0), new Victor(g.canvas.width(), g.canvas.height()), "#EDEDED");
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
			screenFactor: new Victor(30, 30),
			screenTranslation: new Victor(c.width() / 2, c.height() / 4),
			rotation: 0,
			selectedPoint: null
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
				
				if (p.distance(new Victor(event.offsetX, event.offsetY)) < g.conf.maximumGrabDistance) {
					g.display.selectedPoint = new Victor(x, y);
					return ;
				}
			}
		}
		g.display.selectedPoint = null;
	});
	
});