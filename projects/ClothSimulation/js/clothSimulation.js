var clock = new THREE.Clock();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
document.body.appendChild( renderer.domElement );

var trackballControls = new THREE.TrackballControls(camera);
trackballControls.rotateSpeed = 1.0;
trackballControls.zoomSpeed = 1.0;
trackballControls.panSpeed = 1.0;
//        trackballControls.noZoom=false;
trackballControls.noPan=false;
trackballControls.staticMoving = true;
//        trackballControls.dynamicDampingFactor=0.3;

var cloth = new Cloth(1.6, 0.9, 20, 20, 0.3);
cloth.mesh.castShadow = true;
scene.add( cloth.mesh );

var planeGeometry = new THREE.PlaneGeometry( 10, 10, 1);
var planeMaterial = new THREE.MeshLambertMaterial( { color: 0x848484, side: THREE.DoubleSide } );
var plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.position.y = -2;
plane.rotation.x = Math.PI / 2;
plane.receiveShadow = true;
scene.add( plane );

camera.position.z = 3;

var light = new THREE.SpotLight( 0xC0BFAD, 1.5 );
light.position.set( 5, 20, 10 );
light.castShadow = true;
light.shadowMapWidth = 1024;
light.shadowMapHeight = 1024;

light.shadowCameraNear = 5;
light.shadowCameraFar = 100;
light.shadowCameraFov = 30;
light.shadowCameraVisible = true;
scene.add( light );

var ambientLight = new THREE.AmbientLight(0x383838);
scene.add(ambientLight);


var render = function () {
	var delta = clock.getDelta();

    trackballControls.update(delta);
    cloth.update(delta);

	requestAnimationFrame( render );
	renderer.render(scene, camera);
};

render();