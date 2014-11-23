var g = {};

function drawLine(x1, y1, x2, y2, color) {
	g.context.strokeStyle = color;
	g.context.fillStyle = color;
	g.context.beginPath();
	g.context.moveTo(x1, y1);
	g.context.lineTo(x2, y2);
	g.context.closePath();
	g.context.stroke();
}

function drawPixel(x, y, color) {
	drawLine(x, y, x, y, color);
}

function drawRect(x, y, width, height, color) {
	g.context.fillStyle = color;
	g.context.fillRect(x, y, width, height);
}

function drawPixel(x, y, color) {
	drawRect(x, y, 1, 1, color)
}

function drawBackground() {
	drawRect(0, 0, g.canvas.width(), g.canvas.height() / 2, g.conf.skyColor);
	drawRect(0, g.canvas.height() / 2, g.canvas.width(), g.canvas.height() / 2, g.conf.floorColor);
}

function intersect(o, d, a, b, k, side) {
	var v1 = o.clone().subtract(a),
		v2 = b.clone().subtract(a),
		v3 = Victor(-d.y, d.x);
	
	var t1 = v2.cross(v1) / v2.dot(v3);
	var t2 = v1.dot(v3) / v2.dot(v3);

	if (t1 > 0 && t2 >= 0 && t2 <= 1) {
		return (k == null || k.dist > t1) ? {dist: t1, side: side, a: a, b: b, t2: t2} : k;
	}
	return k;
}

function nearestWallDist(d) {
	var k = null,
		o = g.player.position;
	for (var y = 0; y < g.map.height; ++y) {
		for (var x = 0; x < g.map.width; ++x) {
			if (g.map.tiles[y][x] != 0) {
				k = intersect(o, d, Victor(x, y), Victor(x + 1, y), k, 1);
				k = intersect(o, d, Victor(x, y), Victor(x, y + 1), k, 2);
				k = intersect(o, d, Victor(x + 1, y + 1), Victor(x + 1, y), k, 3);
				k = intersect(o, d, Victor(x + 1, y + 1), Victor(x, y + 1), k, 4);
			}
		}
	}
	return k;
}

function updatePlayerPosition(newPos) {
	var d = newPos.clone().subtract(g.player.position),
		k = nearestWallDist(d);
	
	if (k == null || k.dist > 1) {
		g.player.position = newPos;
	// } else {
		// var intersection = g.player.position.clone().add(d.clone().multiply(new Victor(k.dist, k.dist))),
			// i = newPos.clone().subtract(intersection),
			// v = k.a.clone().subtract(intersection).normalize(),
			// dot = i.dot(v),
			// finalPos = intersection.add(v.multiply(new Victor(dot, dot)));
		// g.player.position = finalPos.subtract(finalPos.clone().subtract(g.player.position).normalize().multiply(new Victor(0.1, 0.1)));
		// updatePlayerPosition(intersection.add(v.multiply(new Victor(dot - 0.1, dot - 0.1))));
	}
}

function updatePlayer(elapsed) {
	var p = g.player.position,
		look = new Victor(0, 1).rotate(g.player.orientation),
		left = new Victor(-look.y, look.x),
		move = new Victor(0, 0),
		distance = g.player.moveSpeed * elapsed,
		added = 1;
		
	if (g.keys[38] == true) {
		move.add(look);
	} else if (g.keys[40] == true) {
		move.add(look.clone().invert());
	} else {
		added = 0;
	}
	
	if (g.keys[37] == true) {
		move.add(left.clone().invert());
		++added;
	} else if (g.keys[39] == true) {
		move.add(left);
		++added;
	}
	if (added >= 1) {
		move.normalize();
	}
	move.multiply(new Victor(distance, distance));
	updatePlayerPosition(g.player.position.clone().add(move));
	
	if (g.keys[65] == true) {
		g.player.orientation -= g.player.turnSpeed * elapsed;
	} else if (g.keys[68] == true) {
		g.player.orientation += g.player.turnSpeed * elapsed;
	}

}

function update() {
	var elapsed = 0;
	
	if (g.lastUpdate > 0) {
		elapsed = (new Date().getTime() - g.lastUpdate) / 1000;
	}

	updatePlayer(elapsed);
	
	g.lastUpdate = new Date().getTime();
}

function drawWalls() {
	var cWidth = g.canvas.width(),
		cHeight = g.canvas.height(),
		screenWidth = 2 * Math.atan(g.conf.hFOV / 2);
	for (var x = 0; x < cWidth; ++x) {
		var p = (-screenWidth / 2) + screenWidth * (cWidth - x) / cWidth,
			d = new Victor(p, 1).normalize().rotate(g.player.orientation),
			k = nearestWallDist(d);

		if (k != null) {
			var halfHeight = 0.5 * cHeight / (k.dist * 0.9);
			var color = "#CE2E12";
			if (k.side == 2) {
				color = "#ED4D31";
			} else if (k.side == 3) {
				color = "#71190A";
			} else {
				color = "#A9260F";
			}
			drawRect(x, cHeight / 2 - halfHeight, 1, 2 * halfHeight, color);
			// drawLine(x, cHeight / 2 - halfHeight, x, cHeight / 2 + halfHeight, color);
			// for (var y = cHeight / 2 - halfHeight; y < cHeight / 2 + halfHeight; ++y) {
			// 	drawPixel(x, y, color);
			// }
		}
	}
}

function draw() {
	drawBackground();
	drawWalls();
}

$(function() {
	g.canvas = $("#myCanvas");
	g.context = g.canvas[0].getContext("2d");
	
	g.conf = {
		fps: 30,
		hFOV: 1.98967535,
		skyColor: "#87CEEB",
		floorColor: "#784800"
	};
	
	g.map = {
		width: 10,
		height: 8,
		tiles: [
			[1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 1, 0, 0, 1, 1, 1, 1],
			[1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		]
	};
	
	g.player = {
		position: new Victor(1.5, 1.5),
		orientation: 0.0,
		moveSpeed: 2,
		turnSpeed: 2.5
	};

	setInterval(function() {
		update();
		draw();
	}, 1000 / g.conf.fps);
	
	g.keys = {};
	
	$(document).keydown(function(event) {
		g.keys[event.keyCode] = true;
	});

	$(document).keyup(function(event) {
		g.keys[event.keyCode] = false;
	});
});