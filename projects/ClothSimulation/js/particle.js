function Particle(mass, position) {
	this.mass = mass;
	this.position = position;
	this.velocity = new THREE.Vector3();
	this.force = new THREE.Vector3();

	this.update = function(delta) {
		if (this.mass > 0) {
			var a = this.force.clone();
			a.multiplyScalar(delta / this.mass);
			this.velocity.add(a);
			this.position.add(this.velocity.clone().multiplyScalar(delta));
		}
		this.force = new THREE.Vector3();
	}
}