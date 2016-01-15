var BoundingBox = function() {
	this.reset = function() {
		this.min = new Victor(Number.MAX_VALUE, Number.MAX_VALUE);
		this.max = new Victor(-Number.MAX_VALUE, -Number.MAX_VALUE);
	}

	this.extend = function(points) {
		for (var i = 0; i < points.length; ++i) {
			this.min.x = Math.min(this.min.x, points[i].x);
			this.max.x = Math.max(this.max.x, points[i].x);
			this.min.y = Math.min(this.min.y, points[i].y);
			this.max.y = Math.max(this.max.y, points[i].y);
		}
		return this;
	}

	this.merge = function(other) {
		this.min.x = Math.min(this.min.x, other.min.x);
		this.max.x = Math.max(this.max.x, other.max.x);
		this.min.y = Math.min(this.min.y, other.min.y);
		this.max.y = Math.max(this.max.y, other.max.y);
		return this;
	}

	this.center = function() {
		return new Victor((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2);
	}

	this.width = function() {
		return this.max.x - this.min.x;
	}

	this.height = function() {
		return this.max.y - this.min.y;
	}

	function isBetween(from, to, val) {
		return (from - val < g.conf.EPSILON && val - to < g.conf.EPSILON) ||
				(to - val < g.conf.EPSILON && val - from < g.conf.EPSILON);
	}

	this.intersect = function(a, b) {
		return (b !== null &&
				(isBetween(this.min.y, this.max.y, a * this.min.x + b) ||
				 isBetween(this.min.y, this.max.y, a * this.max.x + b))) ||;
	}

	this.reset();
}