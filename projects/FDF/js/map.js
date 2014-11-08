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
	
	this.setMap = function(v, l, c) {
		this.vertexes = v.slice(0);
		this.lines = l.slice(0);
		this.center = vec3.clone(c);
	}
	
	this.initializefromOBJ = function (url, afterLoad) {
		var mapThis = this;
		function loaded(data) {
			var m = K3D.parse.fromOBJ(data);	// done !
			console.log(this);
			mapThis.vertexes = [];
			mapThis.lines = [];
			var min = vec3.fromValues(10000000, 10000000, 10000000),
				max = vec3.fromValues(-10000000, -10000000, -10000000);
			for (var i = 0; i <= m.c_verts.length - 3; i += 3) {
				mapThis.vertexes.push(vec3.fromValues(m.c_verts[i], m.c_verts[i + 1], m.c_verts[i + 2]));

				min[0] = Math.min(min[0], m.c_verts[i]);
				min[1] = Math.min(min[1], m.c_verts[i + 1]);
				min[2] = Math.min(min[2], m.c_verts[i + 2]);

				max[0] = Math.max(max[0], m.c_verts[i]);
				max[1] = Math.max(max[1], m.c_verts[i + 1]);
				max[2] = Math.max(max[2], m.c_verts[i + 2]);
			}
			var doublon = {};

			function addLine(v1, v2) {
				var v1Tab = doublon[v1],
					v2Tab = doublon[v2];
				if ((v1Tab === undefined || v1Tab.indexOf(v2) < 0) && (v2Tab === undefined || v2Tab.indexOf(v1) < 0)) {
					mapThis.lines.push({
						v1: v1,
						v2: v2
					});
					if (v1Tab !== undefined) {
						doublon[v1].push(v2);
					} else {
						doublon[v1] = [v2];
					}
				}
			}

			for (var i = 0; i <= m.i_verts.length - 3; i += 3) {
				addLine(m.i_verts[i], m.i_verts[i + 1]);
				addLine(m.i_verts[i + 1], m.i_verts[i + 2]);
				addLine(m.i_verts[i + 2], m.i_verts[i]);
			}
			mapThis.center = vec3.fromValues((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
			afterLoad();
		}	
		K3D.load(url, loaded);
	}
}