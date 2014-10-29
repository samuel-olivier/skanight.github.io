function Camera() {
	this.eye =  mat4.create();
	this.target = vec3.create();
	this.up = vec3.fromValues(0, 1, 0);
	this.angle = vec2.fromValues(0, 0);
	this.distance = 50;
	this.projection = mat4.create();
	this.mtxCache = mat4.create();
	this.needUpdate = true;
	
	this.update = function () {
		if (this.needUpdate == true) {
			var  directionMatrix = mat4.create();
			mat4.rotateY(directionMatrix, directionMatrix, this.angle[1]);
			mat4.rotateX(directionMatrix, directionMatrix, this.angle[0]);
			var direction = vec3.fromValues(0, 0, 1);
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
			this.needUpdate = false;
		}
	};
	
	this.project = function (p) {
		var p4 = vec4.fromValues(p[0], p[1], p[2], 1.0)
		vec4.transformMat4(p4, p4, this.mtxCache);
		return vec2.fromValues(p4[0] / p4[3], p4[1] / p4[3]);
	};
	
	this.changeProperties = function(target, fovy, ratio) {
		this.target = vec3.clone(target);
		mat4.perspective(this.projection, fovy, ratio, 0.001, 10000);
		this.needUpdate = true;
	};
	
	this.changeXAngle = function(val) {
		this.angle[0] = clamp(this.angle[0] + val, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
		this.needUpdate = true;
	}
	this.changeYAngle = function(val) {
		this.angle[1] += val;
		this.needUpdate = true;
	}
}