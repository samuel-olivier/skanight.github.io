function Map() {
	this.vertexes = [];
	this.lines = [];
	this.center = vec3.create();
	
	this.initializefromHeightMap = function (map) {
		this.vertexes = [];
		this.lines = [];

		for (var y = 0; y < map.length; ++y) {
			if (y == 0) {
				this.center = vec3.fromValues(map[0].length / 2, 0, map.length / 2);
			}
			for (var x = 0; x < map[y].length; ++x) {
				this.vertexes.push(vec3.fromValues(x, map[y][x], y));
			}
		}

		for (var y = 1; y < map.length; ++y) {
			for (var x = 1; x < map[y].length; ++x) {
				this.vertexes.push(vec3.fromValues(x, map[y][x], y));

				this.lines.push({
					v1: map[y - 1].length * (y - 1) + x - 1,
					v2: map[y - 1].length * (y - 1) + x
				});
				this.lines.push({
					v1: map[y - 1].length * (y - 1) + x - 1,
					v2: map[y].length * (y) + x - 1
				});
				if (x == map[y].length - 1) {
					this.lines.push({
						v1: map[y - 1].length * (y - 1) + x,
						v2: map[y].length * (y) + x
					});
				}
				if (y == map.length - 1) {
					this.lines.push({
					v1: map[y].length * (y) + x - 1,
					v2: map[y].length * (y) + x
					});
				}
			}
		}
		
	};
}