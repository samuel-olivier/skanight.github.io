function Cloth(width, height, segmentNumberX, segmentNumberY, weight) {
	this.width = width;
	this.height = height;
	this.segmentNumberX = segmentNumberX;
	this.segmentNumberY = segmentNumberY;
	this.geometry = null;
	this.material = null;
	this.mesh = null;
	this.particles = [];
	this.springDampers = [];
	this.weight = weight;
	this.iterationNumber = 20;
	this.gravity = new THREE.Vector3(0, -9.81, 0);
	this.wind = new THREE.Vector3(0, 0, 0);
	this.density = 1.2;
	this.dragCoef = 1.2;

	this.coordToIndex = function(x, y) {
		return y * (this.segmentNumberX + 1) + x;
	}

	this.applyGravity = function(delta) {
		for (var i = 0; i < this.particles.length; i++) {
			var particle = this.particles[i];
			particle.force.add(this.gravity.clone().multiplyScalar(particle.mass));
		};
	}

	this.applySpringDampers = function(delta) {
		for (var i = 0; i < this.springDampers.length; i++) {
			this.springDampers[i].computeForces();
		};
	}

	this.applyAerodynamicForces = function(delta) {
		for (var i = 0; i < this.geometry.faces.length; ++i) {
			var face = this.geometry.faces[i],
				particle1 = this.particles[face.a],
				particle2 = this.particles[face.b],
				particle3 = this.particles[face.c];
				ns = particle2.position.clone().sub(particle1.position).cross(particle3.position.clone().sub(particle1.position)),
				v = particle1.velocity.clone().add(particle2.velocity).add(particle3.velocity);
				v.divideScalar(3);
				v.sub(this.wind);
				var f = ns.clone().multiplyScalar(-this.density * this.dragCoef * v.length() * v.dot(ns) / (12 * ns.length()));
				particle1.force.add(f);
				particle2.force.add(f);
				particle3.force.add(f);
		}
	}

	this.updateParticles = function(delta) {
		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].update(delta);
		};
	}

	this.update = function(delta) {
		if (delta > 1 / 20) {
			delta = 1 / 60;
		}
		delta /= this.iterationNumber;
		for (var iteration = 0; iteration < this.iterationNumber; ++iteration) {
			this.applyGravity(delta);
			this.applySpringDampers(delta);
			this.applyAerodynamicForces(delta);
			this.updateParticles(delta);
		}
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
		this.geometry.verticesNeedUpdate = true;
		this.geometry.normalsNeedUpdate = true;
	}

	this.init = function() {
		var segmentWidth = this.width / this.segmentNumberX,
			segmentHeight = this.height / this.segmentNumberY;
		var particleWeight = this.weight / (this.segmentNumberX * this.segmentNumberY);
		this.geometry = new THREE.Geometry();
		for (var x = 0; x <= this.segmentNumberX; ++x) {
			for (var y = 0; y <= this.segmentNumberY; ++y) {
				var vertex = new THREE.Vector3(-this.width / 2 + x * segmentWidth, this.height / 2 - y * segmentHeight, 0);
				this.geometry.vertices.push(vertex);
				this.particles.push(new Particle(y == 0 ? 0 : particleWeight, vertex));
			}
		}
		var w = this.segmentNumberX + 1;
		for (var x = 0; x < this.segmentNumberX; ++x) {
			for (var y = 0; y < this.segmentNumberY; ++y) {
				var tl = this.coordToIndex(x, y),
					tr = this.coordToIndex(x + 1, y),
					br = this.coordToIndex(x + 1, y + 1),
					bl = this.coordToIndex(x, y + 1);
				this.geometry.faces.push(
						new THREE.Face3(tl, tr, br),
						new THREE.Face3(tl, br, bl)
					);
				this.springDampers.push(
						new SpringDamper(this.particles[tl], this.particles[tr]),
						new SpringDamper(this.particles[tl], this.particles[bl]),
						new SpringDamper(this.particles[tr], this.particles[bl]),
						new SpringDamper(this.particles[tl], this.particles[br])
					);
				if (x == this.segmentNumberX - 1) {
					this.springDampers.push(new SpringDamper(this.particles[tr], this.particles[br]));
				}
				if (y == this.segmentNumberY - 1) {
					this.springDampers.push(new SpringDamper(this.particles[bl], this.particles[br]));
				}
			}
		}
		this.material = new THREE.MeshLambertMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
		this.mesh = new THREE.Mesh( this.geometry, this.material );
	}

	this.init();
}