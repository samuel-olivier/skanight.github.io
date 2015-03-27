function Scene() {
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	this.camera.position.z = 3;

	this.cloth = new Cloth(1.6, 0.9, 20, 20, 0.3);
	this.cloth.mesh.castShadow = true;
	this.scene.add( this.cloth.mesh );

	var planeGeometry = new THREE.PlaneGeometry( 10, 10, 1);
	var planeMaterial = new THREE.MeshLambertMaterial( { color: 0x848484, side: THREE.DoubleSide } );
	this.plane = new THREE.Mesh( planeGeometry, planeMaterial );
	this.plane.position.y = -2;
	this.plane.rotation.x = Math.PI / 2;
	this.plane.receiveShadow = true;
	this.scene.add( this.plane );


	this.light = new THREE.SpotLight( 0xC0BFAD, 1.5 );
	this.light.position.set( 5, 20, 10 );
	this.light.castShadow = true;
	this.light.shadowMapWidth = 1024;
	this.light.shadowMapHeight = 1024;

	this.light.shadowCameraNear = 5;
	this.light.shadowCameraFar = 100;
	this.light.shadowCameraFov = 30;
	// this.light.shadowCameraVisible = true;
	this.scene.add( this.light );

	this.ambientLight = new THREE.AmbientLight(0x383838);
	this.scene.add(this.ambientLight);
}

