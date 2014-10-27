function Camera(target, fovy, ratio) {
	this.eye =  mat4.create();
	this.target = vec3.clone(target);
	this.up = vec3.fromValues(0, 1, 0);
	this.angle = vec2.fromValues(0, 0);
	this.distance = 1;
	this.projection = mat4.create();
	this.mtxCache = mat4.create();
	
	mat4.perspective(this.projection, fovy, ratio, 0.001, 10000);
	
	this.update = function () {
		var  directionMatrix = mat4.create();
		mat4.rotateY(directionMatrix, directionMatrix, this.angle[1]);
		mat4.rotateX(directionMatrix, directionMatrix, this.angle[0]);
		var direction = vec3.fromValues(0, 0, 1, 0);
		vec3.transformMat4(direction, direction, directionMatrix);
		vec3.scale(direction, direction, this.distance);
		var right = vec3.create();
		vec3.cross(right, direction, this.up);
		vec3.normalize(right, right);
		var realUp = vec3.create();
		vec3.cross(realUp, direction, right);
		vec3.normalize(realUp, realUp);
		var eyePos = vec3.create();
		vec3.add(eyePos, direction, this.target);
		mat4.lookAt(this.eye, eyePos, this.target, realUp);
		mat4.multiply(this.mtxCache, this.projection, this.eye);
	}
	
	this.project = function (p) {
		vec3.transformMat4(p, p, this.mtxCache);
		// console.log(p);
		// vec3.transformMat4(p, p, this.projection);
		// console.log(p);
		// console.log("");
		return vec2.fromValues(p[0], p[1]);
	}
}