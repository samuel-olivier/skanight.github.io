var g = {};
var toCheckX = -1;

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

function affineIntersection(a1, b1, a2, b2) {
	if ((b1 === null && b2 === null) || a1 === a2) {
		return null;
	} else if (b1 === null) {
		return new Victor(a1, a2 * a1 + b2);
	} else if (b2 === null) {
		return new Victor(a2, a1 * a2 + b1);
	}
	var y = (a2 * b1 - a1 * b2) / (a2 - a1);

	return new Victor(a1 !== 0.0 ? ((y - b1) / a1) : ((y - b2) / a2), y);
}

function findInsertionIdx(k, v) {
	for (var i = 0; i < k.length; ++i) {
		if (v <= k[i].dist) {
			return i;
		} 
	}
	return k.length;
}

function interpolate(v1, v2, delta) {
	return v1 + (v2 - v1) * delta;
}

function isInWall(inter, from, to) {
	return (inter != null &&
			((from.x - inter.x < g.conf.EPSILON && inter.x - to.x < g.conf.EPSILON) ||
		 	 (to.x - inter.x < g.conf.EPSILON && inter.x - from.x < g.conf.EPSILON)) &&
			((from.y - inter.y < g.conf.EPSILON && inter.y - to.y < g.conf.EPSILON) ||
		 	 (to.y - inter.y < g.conf.EPSILON && inter.y - from.y < g.conf.EPSILON));
}

function nearestWallDist(p, v, vLength, a, b) {
	var k = [];

	for (var i = 0; i < g.map.walls.length; ++i) {
		var wall = g.map.walls[i];

		for (var j = 0; j < wall.length - 1; ++j) {
			var from = wall[j],
				to = wall[j + 1],
				wV = new Victor(to.x - from.x, to.y - from.y),
				wA = (wV.x === 0) ? from.x : (wV.y / wV.x),
				wB = (wV.x === 0) ? null : ((to.x * from.y - from.x * to.y) / wV.x),
				inter = affineIntersection(a, b, wA, wB);

			if (isInWall(inter, from, to)) {
				var toInter = inter.clone().subtract(p);
				var dist = toInter.length();
				if (toInter.dot(v) < 0) {
					dist *= -1;
				}
				var diffX = to.x - from.x,
					diffY = to.y - from.y,
					ratio = diffX === 0 ? ((inter.y - from.y) / diffY) : ((inter.x - from.x) / diffX);
				k.splice(findInsertionIdx(k, dist), 0, {dist: dist, wallIdx: i, sectionIdx: j, ratio: ratio});
			}
		}
	}
	return k;
}

function drawWalls() {
	var cWidth = g.canvas.width(),
		cHeight = g.canvas.height();

	for (var x = 0.0; x < cWidth; ++x) {
		if (x == toCheckX) {
			toCheckX = -1;
		}
		var p1 = g.player.position,
			p2 = new Victor(g.conf.D, -g.conf.P * ((cWidth / 2.0) - x) / cWidth).rotate(g.player.orientation).add(g.player.position),
			v = p2.clone().subtract(p1),
			a = (v.x === 0) ? p1.x : (v.y / v.x),
			b = (v.x === 0) ? null : ((p2.x * p1.y - p1.x * p2.y) / v.x),
			vLength = v.length(),
			k = nearestWallDist(p1, v, vLength, a, b);
		if (k.length != 0) {
			var intersectedWalls = {};
			for (var i = k.length - 1; i >= 0; --i) {
				var current = k[i],
					interpolatedHeight = interpolate(g.map.walls[current.wallIdx][current.sectionIdx].height, g.map.walls[current.wallIdx][current.sectionIdx + 1].height, current.ratio),
					interpolatedZ = interpolate(g.map.walls[current.wallIdx][current.sectionIdx].z, g.map.walls[current.wallIdx][current.sectionIdx + 1].z, current.ratio),
					diffZ = g.player.z - interpolatedZ,
					normal = g.map.walls[current.wallIdx][current.sectionIdx].normal;
				if (current.dist > 0) {
					var cosA = (1.0 + normal.dot(g.conf.sunDirection)) / 2.0,
						factor = 1.0 - g.conf.sunFactor + cosA * g.conf.sunFactor,
						color = "rgb(" + ~~(g.conf.wallColor.r * factor) + "," + ~~(g.conf.wallColor.g * factor) + "," + ~~(g.conf.wallColor.b * factor) + ")",
						halfHeight = cHeight / (2.0 * (current.dist / (vLength / g.conf.D))),
						unitHeight = halfHeight * 2.0;
						rect = {start: cHeight / 2 + halfHeight + diffZ * unitHeight, height: -unitHeight * interpolatedHeight};
					if (v.dot(normal) >= 0) {
						intersectedWalls[current.wallIdx] = {start: rect.start + rect.height / 2, z: interpolatedZ};
						color = g.conf.insideColor;
					} else if (intersectedWalls[current.wallIdx] !== undefined) {
						var middle = rect.start + rect.height / 2; 
						drawRect(x, middle, 1, intersectedWalls[current.wallIdx].start - middle, g.conf.insideColor);
					}
					drawRect(x, rect.start, 1, rect.height, color);
				} else if (intersectedWalls[current.wallIdx] !== undefined) {
					var toScreenHeight = -intersectedWalls[current.wallIdx].start;
					if (intersectedWalls[current.wallIdx].z < g.player.z) {
						toScreenHeight += cHeight;
					}
					drawRect(x, intersectedWalls[current.wallIdx].start, 1, toScreenHeight, g.conf.insideColor);
				}

			}
		}
	
}}

function draw() {
	drawBackground();
	drawWalls();
}

function updatePlayerPosition(newPos) {
	// var d = newPos.clone().subtract(g.player.position),
	// 	k = nearestWallDist(d);
	
	// if (k == null || k.dist > 1) {
		g.player.position = newPos;
	// } else {
		// var intersection = g.player.position.clone().add(d.clone().multiply(new Victor(k.dist, k.dist))),
			// i = newPos.clone().subtract(intersection),
			// v = k.a.clone().subtract(intersection).normalize(),
			// dot = i.dot(v),
			// finalPos = intersection.add(v.multiply(new Victor(dot, dot)));
		// g.player.position = finalPos.subtract(finalPos.clone().subtract(g.player.position).normalize().multiply(new Victor(0.1, 0.1)));
		// updatePlayerPosition(intersection.add(v.multiply(new Victor(dot - 0.1, dot - 0.1))));
	// }
}

function updatePlayer(elapsed) {
	var p = g.player.position,
		look = new Victor(1, 0).rotate(g.player.orientation),
		left = new Victor(0, -1).rotate(g.player.orientation),
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
		move.add(left);
		++added;
	} else if (g.keys[39] == true) {
		move.add(left.clone().invert());
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

$(function() {
	g.canvas = $("#myCanvas");
	g.context = g.canvas[0].getContext("2d");
	
	g.conf = {
		fps: 30,
		D: 0.5,
		P: 1.0,
		skyColor: "#87CEEB",
		floorColor: "#784800",
		wallColor: {r: 240, g: 55, b: 55},
		sunFactor: 0.3,
		sunDirection: new Victor(2.0, 1.0).normalize(),
		insideColor: "#888888",
		EPSILON: 0.00001
	};
	
	g.map = {
		walls: [
			[
				{x: 4.2, y: -4.0, z: 1.0, height: 1.0, normal: new Victor(-1.0, 0.0)},
				{x: 4.2, y: 4.0, z: 1.0, height: 3.0, normal: new Victor(0.0, 1.0)},
				{x: 5.0, y: 4.0, z: 1.0, height: 3.0, normal: new Victor(1.0, 0.0)},
				{x: 5.0, y: -4.0, z: 1.0, height: 1.0, normal: new Victor(0.0, -1.0)},
				{x: 4.2, y: -4.0, z: 1.0, height: 1.0}
			],
			[
				{x: 4.2, y: -4.0, z: 0.0, height: 1.0, normal: new Victor(-1.0, 0.0)},
				{x: 4.2, y: -3.0, z: 0.0, height: 1.0, normal: new Victor(0.0, 1.0)},
				{x: 5.0, y: -3.0, z: 0.0, height: 1.0, normal: new Victor(1.0, 0.0)},
				{x: 5.0, y: -4.0, z: 0.0, height: 1.0, normal: new Victor(0.0, -1.0)},
				{x: 4.2, y: -4.0, z: 0.0, height: 1.0}
			],
			[
				{x: 4.2, y: 3.0, z: 0.0, height: 1.0, normal: new Victor(-1.0, 0.0)},
				{x: 4.2, y: 4.0, z: 0.0, height: 1.0, normal: new Victor(0.0, 1.0)},
				{x: 5.0, y: 4.0, z: 0.0, height: 1.0, normal: new Victor(1.0, 0.0)},
				{x: 5.0, y: 3.0, z: 0.0, height: 1.0, normal: new Victor(0.0, -1.0)},
				{x: 4.2, y: 3.0, z: 0.0, height: 1.0}
			]
		]
	};
	
	g.player = {
		position: new Victor(0.1, 0.1),
		z: 0.0,
		orientation: 0.0,
		moveSpeed: 2.0,
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

	$("#myCanvas").click(function(event) {
		toCheckX = event.offsetX;
	});
});