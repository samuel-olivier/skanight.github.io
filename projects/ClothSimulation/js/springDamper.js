function SpringDamper(particle1, particle2) {
	this.springConstant = 1;
	this.dampingFactor = 0.1;
	this.restLength = particle1.position.distanceTo(particle2.position);
	this.particle1 = particle1;
	this.particle2 = particle2;

	this.computeForces = function() {
		var e = this.particle2.position.clone().sub(this.particle1.position);
		var l = e.length();
		e.normalize();
		var v1 = this.particle1.velocity.dot(e);
		var v2 = this.particle2.velocity.dot(e);
		var f = e.clone().multiplyScalar(-this.springConstant * (this.restLength - l) - this.dampingFactor * (v1 - v2));
		this.particle1.force.add(f);
		this.particle2.force.sub(f);
	}

}