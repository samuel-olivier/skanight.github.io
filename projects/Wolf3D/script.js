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

function isInWall(inter, wall) {
	return ((inter.x >= wall.from.x && inter.x <= wall.to.x) || (inter.x >= wall.to.x && inter.x <= wall.from.x)) &&
			((inter.y >= wall.from.y && inter.y <= wall.to.y) || (inter.y >= wall.to.y && inter.y <= wall.from.y));
}

function nearestWallDist(p, v, vLength, a, b) {
	var k = [];

	for (var i = 0; i < g.map.walls.length; ++i) {
		var wall = g.map.walls[i],
			wV = new Victor(wall.to.x - wall.from.x, wall.to.y - wall.from.y),
			wA = (wV.x === 0) ? wall.from.x : (wV.y / wV.x),
			wB = (wV.x === 0) ? null : ((wall.to.x * wall.from.y - wall.from.x * wall.to.y) / wV.x),
			inter = affineIntersection(a, b, wA, wB);

		if (inter !== null) {
			var toInter = inter.clone().subtract(p);
			if (toInter.dot(v) >= 0) {
				var dist = toInter.length();

				if (isInWall(inter, wall)) {
					var diffX = wall.to.x - wall.from.x,
						diffY = wall.to.y - wall.from.y,
						ratio = diffX === 0 ? ((inter.y - wall.from.y) / diffY) : ((inter.x - wall.from.x) / diffX);
					k.splice(findInsertionIdx(k, dist), 0, {dist: dist, wall: wall, ratio: ratio});
				}
			}
		}
	}
	return k;
}

function drawWalls() {
	var cWidth = g.canvas.width(),
		cHeight = g.canvas.height();

	for (var x = 0.0; x < cWidth; ++x) {
		if (x === cWidth / 2.0) {
			x = x;
		}
		var p1 = g.player.position,
			p2 = new Victor(g.conf.D, -g.conf.P * ((cWidth / 2.0) - x) / cWidth).rotate(g.player.orientation).add(g.player.position),
			v = p2.clone().subtract(p1),
			a = (v.x === 0) ? p1.x : (v.y / v.x),
			b = (v.x === 0) ? null : ((p2.x * p1.y - p1.x * p2.y) / v.x),
			vLength = v.length(),
			k = nearestWallDist(p1, v, vLength, a, b);
		if (k.length != 0) {
			for (var i = k.length - 1; i >= 0; --i) {
				var current = k[i],
					halfHeight = cHeight / (2.0 * (current.dist / (vLength / g.conf.D))),
					unitHeight = halfHeight * 2.0;
					color = "#CE2E12",
					interpolatedHeight = interpolate(current.wall.from.height, current.wall.to.height, current.ratio),
					interpolatedZ = interpolate(current.wall.from.z, current.wall.to.z, current.ratio),
					diffZ = g.player.z - interpolatedZ;
				if (v.dot(current.wall.normal) >= 0) {
					color = "#888888";
				}
				drawRect(x, cHeight / 2 + halfHeight + diffZ * unitHeight, 1, -unitHeight * interpolatedHeight, color);
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
		floorColor: "#784800"
	};
	
	g.map = {
		walls: [
			{from: {x: 3.0, y: -1.0, z: 1.0, height: 1.0}, to: {x: 3.0, y: 1.0, z: 1.0, height: 1.0}, normal: new Victor(-1.0, 0.0)},
			{from: {x: 4.0, y: -1.0, z: 1.0, height: 1.0}, to: {x: 4.0, y: 1.0, z: 1.0, height: 1.0}, normal: new Victor(1.0, 0.0)},
			{from: {x: 3.0, y: -1.0, z: 1.0, height: 1.0}, to: {x: 4.0, y: -1.0, z: 1.0, height: 1.0}, normal: new Victor(0.0, -1.0)},
			{from: {x: 3.0, y: 1.0, z: 1.0, height: 1.0}, to: {x: 4.0, y: 1.0, z: 1.0, height: 1.0}, normal: new Victor(0.0, 1.0)}
		]
	};
	
	g.player = {
		position: new Victor(0.0, 0.0),
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
});