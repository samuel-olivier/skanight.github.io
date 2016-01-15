var AABBNode = function(intersectFunction) {
	this.boundingBox = new BoundingBox();
	this.walls = null;
	this.child1 = null;
	this.child2 = null;
	this.intersectFunction = intersectFunction;

	this.generate = function(walls) {
		this.boundingBox.reset();

		for (var i = 0; i < walls.length; ++i) {
			this.boundingBox.extend(walls[i]);
		}
		if (walls.length < 2) {
			this.walls = walls;
			return this;
		}
		var splitAxis = 'x';
		if (this.boundingBox.height() > this.boundingBox.width()) {
			splitAxis = 'y';
		}
		var split = this.boundingBox.center()[splitAxis];
		var t1 = [],
			t2 = [];
		for (var i = 0; i < walls.length; ++i) {
			var bb = new BoundingBox().extend(walls[i]);

			if (bb.center[splitAxis] < split) {
				t1.push(walls[i]);
			} else {
				t2.push(walls[i]);
			}
		}
		if (t1.length == 0 || t2.length == 0) {
			t2 = walls.slice(0);
			t2.sort(function(w1, w2) {
				return new BoundingBox().extend(w1).center[splitAxis] < new BoundingBox().extend(w2).center[splitAxis];
			});
			t1 = t2.splice(0, t2.length / 2);
		}
		this.child1 = new AABBNode().generate(t1);
		this.child2 = new AABBNode().generate(t2);
		return this;
	}

	this.intersect = function(a, b, k) {
		if (this.boundingBox.intersect(a, b)) {
			if (this.child1 != null) {
				this.child1.intersect(a, b, k);
			}
			if (this.child2 != null) {
				this.child2.intersect(a, b, k);
			}
			if (this.walls != null) {
				for (var i = 0; i < this.walls.length; ++i) {
					this.intersectFunction(a, b, this.walls[i], k);
				}
			}
		}
		return k;
	}
}

var AABBTree = function()
{
	this.root = null;

	this.generate = function(walls) {
		this.root = new AABBNode().generate(walls);
		return this;
	}

	this.intersect = function(p, v) {
		if (this.root != null) {
			var a = (v.x === 0) ? p.x : (v.y / v.x),
				b = (v.x === 0) ? null : ((p.x * p.y - p.x * p.y) / v.x),
				k = [];

			this.root.intersect(a, b, k);
			return k;
		}
		return [];
	}
}