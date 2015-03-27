var render = function () {
	var delta = clock.getDelta();

    orbitControls.update(delta);
    scene.cloth.update(delta);
    stats.update(delta);
	requestAnimationFrame( render );
	renderer.render(scene.scene, scene.camera);
};

function onWindowResize() {
	scene.camera.aspect = window.innerWidth / window.innerHeight;
	scene.camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);				
	render();
}

function init() {
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
	document.body.appendChild( renderer.domElement );

	scene = new Scene();

	orbitControls = new THREE.OrbitControls(scene.camera, renderer.domElement);
	orbitControls.maxDistance = 50;

	clock = new THREE.Clock();

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	document.body.appendChild(stats.domElement);

	window.addEventListener('resize', onWindowResize, false);
}

var stats, renderer, scene, orbitControls, clock;

init();
render();