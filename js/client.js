class MoveableObject {
    // type -> 0 , helicopter
    // type -> 1 , fire truck
    // type -> 2,  fire fighter
    constructor(type, moveableObj) {
        this.type = type;
        this.moveableObj = moveableObj;
        this.position = moveableObj.position;
        this.x = moveableObj.position.x;
        this.y = moveableObj.position.y;
        this.z = moveableObj.position.z;
        this.rotationX = moveableObj.rotation.x;
        this.rotationY = moveableObj.rotation.y;
        this.rotationZ = moveableObj.rotation.z;
    }

    translateX(distance) {
        this.moveableObj.translateX(distance);
        this.updatePosition();
    }

    translateY(distance) {
        this.moveableObj.translateY(distance);
        this.updatePosition();
    }

    translateZ(distance) {
        this.moveableObj.translateZ(distance);
        this.updatePosition();
    }

    rotateX(rotValue) {
        this.moveableObj.rotation.x += rotValue;
        this.updatePosition();
    }

    rotateY(rotValue) {
        this.moveableObj.rotation.y += rotValue;
        this.updatePosition();
    }

    rotateZ(rotValue) {
        this.moveableObj.rotation.z += rotValue;
        this.updatePosition();
    }

    updatePosition() {
        this.position = this.moveableObj.position;
        this.x = this.moveableObj.position.x;
        this.y = this.moveableObj.position.y;
        this.z = this.moveableObj.position.z;
        this.rotationX = this.moveableObj.rotation.x;
        this.rotationY = this.moveableObj.rotation.y;
        this.rotationZ = this.moveableObj.rotation.z;
    }
}

class Fire {
    constructor(locX, locY, locZ, featureKeys) {
        this.locX = locX;
        this.locY = locY;
        this.locZ = locZ;
        this.point = 0;
        this.featureKeys = featureKeys;
        this.calculatePoint();
    }

    calculatePoint() {
        this.point = 0;
        for (let i = 0; i < this.featureKeys.length; i++) {
            this.point += fireFeatures[this.featureKeys[i]];
        }
    }
}


document.getElementById("waterFilled").style.display = "none";
document.getElementById("highFly").style.display = "none";
document.getElementById("fullAmmo").style.display = "none";
document.getElementById("highFly").innerHTML = "You fly too high get closer to the lake!";
document.getElementById("waterFilled").innerHTML = "Water Filled";
document.getElementById("fullAmmo").innerHTML = "Water Tank Full"; // Html div elements done.

const scene = new THREE.Scene();


const cameraP = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraP.position.set(25, 25, 0);
cameraP.lookAt(scene.position);


var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(cameraP, renderer.domElement);


controls.addEventListener('change', render);

const scaleMat = new THREE.Matrix4();

var movingObject;

const sunLight = new THREE.SpotLight(0xBBBBBB, 15);
sunLight.position.set(120, 400, 50);
sunLight.position.multiplyScalar(5.0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5; // default
sunLight.shadow.camera.far = 500; // default
sunLight.lookAt(new THREE.Vector3(30, 0, 0));
scene.add(sunLight);


const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0, 10, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.angle = Math.PI / 6;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
spotLight.power = 8 * Math.PI;
spotLight.lookAt(0, 0, 0);


// target to spotlight
const targetObject = new THREE.Object3D();
targetObject.position.set(0, -170, 0);
scene.add(targetObject);

spotLight.target = targetObject;
scene.add(spotLight);


const light = new THREE.AmbientLight(0xBBBBBB); // soft white light
scene.add(light);


var helicopter;
var fireTruck = null;
var fireFighter = null;
var mixer = new THREE.AnimationMixer();
var mixerFire = [new THREE.AnimationMixer(), new THREE.AnimationMixer(), new THREE.AnimationMixer(), new THREE.AnimationMixer(), new THREE.AnimationMixer()];
var objFires = [];
var objArrow = [];

// to control gui
var guiEvent;
// user score
var score = 0;
// user ammo
var ammo = 0;

var soundFire  = [];


var fireFeatures = {
    'close_the_school': -200, 'urban_fire': -150, 'crowded_urban_area': -120, 'dense_forest': -80,
    'close_the_urban': -70, 'hard_to_reach': -50, 'far_to_lake': -20, 'big_forest': -100, 'close_the_forest': -60,
    'reachable_by_fire_truck': 35, 'close_to_lake': 30, 'thin_forest': 25, 'small_forest': 30
};

var fireObjects = [
    new Fire(-45, -130, 8, ['close_the_school', 'urban_fire', 'reachable_by_fire_truck', 'crowded_urban_area']),
    new Fire(-190, -86, -4, ['dense_forest', 'reachable_by_fire_truck']),
    new Fire(-109, -95, -53, ['close_the_school', 'thin_forest', 'close_the_urban']),
    new Fire(-170, -90, -125, ['dense_forest', 'hard_to_reach', 'far_to_lake', 'big_forest']),
    new Fire(55, -130, 77, ['urban_fire', 'reachable_by_fire_truck']),
    new Fire(-100, -118, -190, ['dense_forest', 'big_forest', 'hard_to_reach']),
    new Fire(-145, -98, 155, ['far_to_lake', 'small_forest']),
    new Fire(16, -105, 155, ['dense_forest', 'small_forest', 'reachable_by_fire_truck']),
    new Fire(195, -104, -36, ['dense_forest', 'hard_to_reach', 'close_to_lake']),
    new Fire(22, -120, -162, ['dense_forest', 'big_forest', 'close_the_urban', 'reachable_by_fire_truck']),
    new Fire(130, -130, -152, ['urban_fire', 'close_the_forest', 'reachable_by_fire_truck']),
]

// to hold sorted fires.
var activeFiresOrder = []


var clock = new THREE.Clock();
var input;

var spotLightValueUpDown = 0;
var spotLightValueLeftRight = 0;
var spotLightValueUpDown2 = 0;
var spotLightValueLeftRight2 = 0;
var spotLightValueHighLow = 0;


const loader = new THREE.GLTFLoader();

// Initialization of the game.
setGui();
loadArrowObjects();
loadSkyBox();
loadMap();
loadAudio();
loadHelicopter();
initCannon();
loadFireObjects();



window.addEventListener('resize', () => {
    cameraP.aspect = window.innerWidth / window.innerHeight;
    cameraP.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);

// to see fps
const stats = Stats();
document.body.appendChild(stats.dom);


document.addEventListener('keydown', function (ev) {
    return onkey(ev, ev.key, true);
}, false);
document.addEventListener('keyup', function (ev) {
    return onkey(ev, ev.key, false);
}, false);

input = {
    left: false, right: false, forward: false, backward: false, up: false, down: false, rotClk: false, rotCntr: false,
    rotateForwFree: false, rotateBackFree: false, water: false,
    spotLightRight : false, spotLightLeft : false, spotLightUp : false, spotLightDown : false, spotLightHigh : false,
    spotLightLow : false
};

function onkey(ev, key, pressed) {
    switch (key) {
        case 'w':input.forward = pressed;ev.preventDefault();break;
        case 's':input.backward = pressed;ev.preventDefault();break;
        case 'q':input.left = pressed;ev.preventDefault();break;
        case 'e':input.right = pressed;ev.preventDefault();break;
        case 'c':input.up = pressed;ev.preventDefault();break;
        case 'v':input.down = pressed;ev.preventDefault();break;
        case 'a':input.rotCntr = pressed;ev.preventDefault();break;
        case 'd':input.rotClk = pressed;ev.preventDefault();break;
        case 'r':input.rotateForwFree = pressed;ev.preventDefault();break;
        case 'f':input.rotateBackFree = pressed;ev.preventDefault();break;
        case ' ':input.water = pressed;ev.preventDefault();break;
        case 'ArrowUp':input.spotLightUp = pressed;ev.preventDefault();break;
        case 'ArrowDown':input.spotLightDown = pressed;ev.preventDefault();break;
        case 'ArrowRight':input.spotLightRight = pressed;ev.preventDefault();break;
        case 'ArrowLeft':input.spotLightLeft = pressed;ev.preventDefault();break;
        case 'o':input.spotLightHigh = pressed;ev.preventDefault();break;
        case 'p':input.spotLightDown = pressed;ev.preventDefault();break;
    }
}

var delta = 0;
var animate = function () {
    requestAnimationFrame(animate);

    delta = clock.getDelta();  // To update helicopter and fire Animation
    mixer.update(delta);

    mixerFire[0].update(delta);
    mixerFire[1].update(delta);
    mixerFire[2].update(delta);
    mixerFire[3].update(delta);
    mixerFire[4].update(delta);

    updatePhysics();

    guiController();

    checkForWater();

    if (clock.getElapsedTime() > 10.0) {    //after 10 seconds the fire starts
        gameLogic();
    }
    updateScoreAmmo();

    cameraUpdate(cameraP);
    inputController(movingObject);

    render();
    stats.update();
};

var done = 0;       //GAME LOGIC VARIABLES
var fireCounter = 0;  //objfire counter
var indexUsed = []; // to hold which fire objects are in the scene.


function gameLogic() {
    let time = clock.getElapsedTime();
    windCheck(time); // wind simulation

    if ((time % 8.0) < 3.5 && done === 0) {  // once every 8 seconds a new fire is created.

        let randIndex = Math.floor(Math.random() * 11); // random index between 0 and 11.

        while (indexUsed.includes(randIndex)) {              //check if that position is already burning
            randIndex = Math.floor(Math.random() * 11);
        }
        indexUsed.push(randIndex);
        if (indexUsed.length === 6) {  // max number of fires must be 5.
            indexUsed.shift();
        }

        objFires[fireCounter].position.x = fireObjects[randIndex].locX;
        objFires[fireCounter].position.y = fireObjects[randIndex].locY;
        objFires[fireCounter].position.z = fireObjects[randIndex].locZ;

        for(let i=0;i<indexUsed.length;i++){
            objFires[i].position.x = fireObjects[indexUsed[i]].locX;
            objFires[i].position.y = fireObjects[indexUsed[i]].locY;
            objFires[i].position.z = fireObjects[indexUsed[i]].locZ;
        }

        fireCounter++;
        if (fireCounter === 5) {
            fireCounter = 0;
        }
        done = 1;

    }
    if ((time % 8.0) > 5 && done === 1) {
        done = 0;
    }

    arrowMovement();
    arrowChecker();
}

var windDone = 0;
var windRot = 0;

function windCheck(time) {

    if (time % 11 < 3.5 && windDone === 0) {
        windRot = Math.floor(Math.random() * 9)
        windDone = 1;
    }
    if (time % 11 > 7) {
        windDone = 0;
    }

    if (windRot === 0) {
        document.getElementById("wind").innerHTML = "Wind : East";
        movingObject.position.x += 0.05;
        cameraP.position.x += 0.05
    } else if (windRot === 1) {
        document.getElementById("wind").innerHTML = "Wind : West";
        movingObject.position.x -= 0.05;
        cameraP.position.x -= 0.05
    } else if (windRot === 2) {
        document.getElementById("wind").innerHTML = "Wind : South";
        movingObject.position.z -= 0.05;
        cameraP.position.z -= 0.05
    } else if (windRot === 3) {
        document.getElementById("wind").innerHTML = "Wind : North";
        movingObject.position.z += 0.05;
        cameraP.position.z += 0.05
    } else if (windRot === 4) {
        document.getElementById("wind").innerHTML = "Wind : Southwest";
        movingObject.position.x -= 0.04;
        movingObject.position.z -= 0.04;
        cameraP.position.x -= 0.04;
        cameraP.position.z -= 0.04;
    } else if (windRot === 5) {
        document.getElementById("wind").innerHTML = "Wind : Northwest";
        movingObject.position.x -= 0.04;
        movingObject.position.z += 0.04;
        cameraP.position.x -= 0.04;
        cameraP.position.z += 0.04;
    } else if (windRot === 6) {
        document.getElementById("wind").innerHTML = "Wind : Northeast";
        movingObject.position.x += 0.04;
        movingObject.position.z += 0.04;
        cameraP.position.x += 0.04;
        cameraP.position.z += 0.04;
    } else if (windRot === 7) {
        document.getElementById("wind").innerHTML = "Wind : Southeast";
        movingObject.position.x += 0.04;
        movingObject.position.z -= 0.04;
        cameraP.position.x += 0.04;
        cameraP.position.z -= 0.04;
    }
}


function arrowMovement() {
    objArrow[0].rotation.y  += 0.01;
    objArrow[1].rotation.y  += 0.01;
    objArrow[2].rotation.y  += 0.01;
}


function checkForWater() {
    if (helicopter.position.x > 90 && helicopter.position.x < 130 && helicopter.position.z > -25 && helicopter.position.z < 5) { //location of the lake

        if(helicopter.position.y >= -25){
            document.getElementById("highFly").style.display = "block";
        }
        else{
            document.getElementById("highFly").style.display = "none";
            if(ammo === 2){
                document.getElementById("fullAmmo").style.display = "block";
                setTimeout(function(){
                    document.getElementById("fullAmmo").style.display = "none";
                }, 2*1000);
            }
            else{
                ammo = 2;
                document.getElementById("waterFilled").style.display = "block";
                setTimeout(function(){
                    document.getElementById("waterFilled").style.display = "none";}, 2*1000);
            }
        }
    }
}


function render() {
    renderer.render(scene, cameraP);
}


function checkToPutOutFire() {

    for (let c = 0; c < 5; c++) {
        if (helicopter.position.x > (objFires[c].position.x - 15.0) && helicopter.position.x < (objFires[c].position.x + 15.0)) {
            if (helicopter.position.z > (objFires[c].position.z - 15.0) && helicopter.position.z < (objFires[c].position.z + 15.0)) {

                for (let k = 0; k < 11; k++) {
                    if (objFires[c].position.x === fireObjects[k].locX) {
                        let indexOfFire = indexUsed.indexOf(k);
                        indexUsed.splice(indexOfFire, 1);
                    }
                }

                for(let i=0; i<activeFiresOrder.length;i++){
                    if(objFires[c].position.x === activeFiresOrder[i].locX){
                        if(i === 0){
                            score += 4;
                        }
                        else if(i === 1){
                            score += 3;
                        }
                        else if(i === 2){
                            score += 2;
                        }
                        else{
                            score += 1;
                        }
                    }
                }

                objFires[c].position.x = 0;
                objFires[c].position.z = 0;
                objFires[c].position.y = -800;

                // reset all arrows before rearrange them.
                for(let i=0;i<objArrow.length;i++){
                    objArrow[i].position.x = 0;
                    objArrow[i].position.y = -800;
                    objArrow[i].position.z = 0;
                }

                arrowChecker();
                return;
            }
        }
    }
}


// If the user want to change movable object.
function changeMovableObject() {
    // helicopter to fire truck
    if(movingObject.type === 0){
        if(fireTruck === null){
            loader.load('model/low_poly_truck/scene.glb', function (gltf) {

                fireTruck = new MoveableObject(1, gltf.scene);
                fireTruck.moveableObj.position.set(-121,-145,40);
                movingObject = fireTruck;

                gltf.scene.castShadow = true;
                gltf.scene.traverse(function (node) {

                    if (node.isObject3D) {
                        node.castShadow = true;

                    }

                });

                scene.add(gltf.scene);
                cameraP.position.x = fireTruck.position.x +10;
                cameraP.position.y = fireTruck.position.y +10;
                cameraP.position.z = fireTruck.position.z;

            }, undefined, function (error) {
                console.error();

            });
        }
        else{
            movingObject = fireTruck;
        }
    }
    // fire truck to fire fighter
    else if(movingObject.type === 1){
        if(fireFighter === null){
            loader.load('model/low_poly_fire_fighter/scene.gltf', function (gltf) {

                fireFighter = new MoveableObject(2, gltf.scene);
                fireFighter.moveableObj.position.set(-129,-146,30);
                movingObject = fireFighter;

                gltf.scene.castShadow = true;
                gltf.scene.traverse(function (node) {

                    if (node.isObject3D) {
                        node.castShadow = true;
                    }

                });

                scene.add(gltf.scene);
                cameraP.position.x = fireFighter.position.x +10;
                cameraP.position.y = fireFighter.position.y +10;
                cameraP.position.z = fireFighter.position.z;

            }, undefined, function (error) {
                console.error();

            });
        }
        else{
            movingObject = fireFighter;
        }
    }
    // fire fighter to helicopter.
    else if(movingObject.type === 2){
        movingObject = helicopter;
    }

    cameraP.position.x = movingObject.position.x +10;
    cameraP.position.y = movingObject.position.y +10;
    cameraP.position.z = movingObject.position.z;
}



// sets the camera's position. Calls every frame.
function cameraUpdate(cameraP) {
    cameraP.lookAt(movingObject.position);
    controls.target.set(movingObject.position.x, movingObject.position.y, movingObject.position.z);
    spotLight.position.set(movingObject.x, movingObject.y, movingObject.z);
    targetObject.position.set(movingObject.x + spotLightValueUpDown + spotLightValueUpDown2, -210+spotLightValueHighLow, movingObject.z + spotLightValueLeftRight + spotLightValueLeftRight2);
}


function setGui() {
    const parameters = {
        'Close To School': -200, 'Urban Fire': -150, 'Crowded Urban Area': -120,
        'Dense Forest': -80, 'Close To Urban': -70, 'Hard To Reach': -50, 'Far To Lake': -20,
        'Big Forest': -100, 'Close To Forest': -60, 'Reachable By Fire Truck': 35, 'Close To Lake': 30,
        'Thin Forest': 25, 'Small Forest': 30,
        color: "#ff0000",
        opacity: 1,
        visible: true,
        material: "Phong",
    };

    var gui = new dat.GUI();

    var folder1 = gui.addFolder('Fire Features');

    guiEvent = folder1.add( parameters, 'Close To School' ).min(-200).max(0);
    folder1.add( parameters, 'Urban Fire' ).min(-200).max(0);
    folder1.add( parameters, 'Crowded Urban Area' ).min(-200).max(0);
    folder1.add( parameters, 'Dense Forest' ).min(-200).max(0);
    folder1.add( parameters, 'Close To Urban' ).min(-200).max(0);
    folder1.add( parameters, 'Hard To Reach' ).min(-200).max(0);
    folder1.add( parameters, 'Far To Lake' ).min(-200).max(0);
    folder1.add( parameters, 'Big Forest' ).min(-200).max(0);
    folder1.add( parameters, 'Close To Forest' ).min(-200).max(0);
    folder1.add( parameters, 'Reachable By Fire Truck' ).min(0).max(200);
    folder1.add( parameters, 'Close To Lake' ).min(0).max(200);
    folder1.add( parameters, 'Thin Forest' ).min(0).max(200);
    folder1.add( parameters, 'Small Forest' ).min(0).max(30);
    folder1.open();

    var changeShading = {changeShading:function (){changeShadingType()}};
    gui.add(changeShading, 'changeShading');

    var changeObject = {changeObject:function (){changeMovableObject()}};
    gui.add(changeObject, 'changeObject');

    var spotLightOpen = { spotLightOpen:function(){ if(spotLight.power === 0){spotLight.power = 8 * Math.PI;} }};
    gui.add(spotLightOpen,'spotLightOpen');

    var spotLightClose = { spotLightClose:function(){ spotLight.power = 0; }};
    gui.add(spotLightClose,'spotLightClose');

    var NightModeOpen = { NightModeOpen:function(){ sunLight.intensity = 5; scene.background = new THREE.Color(0x0000000);}};
    gui.add(NightModeOpen,'NightModeOpen');

    var NightModeClose = { NightModeClose:function(){ sunLight.intensity = 15; loadSkyBox(); }};
    gui.add(NightModeClose,'NightModeClose');

    var spotLightPowerUp = { spotLightPowerUp:function(){ if(spotLight.power != 0){spotLight.power += Math.PI} }};
    gui.add(spotLightPowerUp,'spotLightPowerUp');

    var spotLightPowerDown = { spotLightPowerDown:function(){ if(spotLight.power > 0) {spotLight.power -= Math.PI}; }};
    gui.add(spotLightPowerDown,'spotLightPowerDown');

    var deleteWater = { deleteWater:function(){ for(let i = 0;i < 10 ;i++){helper.delete(world,scene)}}};
    gui.add(deleteWater,'deleteWater');
}

function guiController(){

    fireFeatures['close_the_school'] = guiEvent.object['Close To School'];
    fireFeatures['urban_fire'] = guiEvent.object['Urban Fire'];
    fireFeatures['crowded_urban_area'] = guiEvent.object['Crowded Urban Area'];
    fireFeatures['dense_forest'] = guiEvent.object['Dense Forest'];
    fireFeatures['close_the_urban'] = guiEvent.object['Close To Urban'];
    fireFeatures['hard_to_reach'] = guiEvent.object['Hard To Reach'];
    fireFeatures['far_to_lake'] = guiEvent.object['Far To Lake'];
    fireFeatures['big_forest'] = guiEvent.object['Big Forest'];
    fireFeatures['close_the_forest'] = guiEvent.object['Close To Forest'];
    fireFeatures['reachable_by_fire_truck'] = guiEvent.object['Reachable By Fire Truck'];
    fireFeatures['close_to_lake'] = guiEvent.object['Close To Lake'];
    fireFeatures['thin_forest'] = guiEvent.object['Thin Forest'];
    fireFeatures['small_forest'] = guiEvent.object['Small Forest'];
    for(let i=0;i<fireObjects.length;i++){
        fireObjects[i].calculatePoint();
    }
    arrowChecker();
}

function updateScoreAmmo(){
    document.getElementById("scoreField").innerHTML = "Score : " +score.toString();
    document.getElementById("ammoField").innerHTML = "Ammo : " +ammo.toString();
}


// Loads 5 fire objects.
function loadFireObjects() {
    for (let i = 0; i < 5; i++) {
        //LOADING FIRE ANIMATION
        loader.load('model/low_poly_fire/scene.gltf', function (gltf) {
            gltf.scene.position.x = 0;
            gltf.scene.position.y = -800;//underground
            gltf.scene.position.z = 0;
            mixerFire[i] = new THREE.AnimationMixer(gltf.scene);
            var action = mixerFire[i].clipAction(gltf.animations[0]);
            objFires.push(gltf.scene);
            action.play();
            gltf.scene.receiveShadow = false;
            scene.add(gltf.scene);
            gltf.scene.add(soundFire[i]);
        }, undefined, function (error) {
            console.error();
        });
    }
}

function loadArrowObjects() {
    for (let i = 0; i < 3; i++) {
        //LOADING Arrow
        loader.load('model/arrow/untitled.glb', function (gltf) {
            gltf.scene.rotateZ(-Math.PI * 0.5);
            gltf.scene.scale.set(0.1 - i*0.011,0.1 - i*0.011,0.1 - i*0.011);
            gltf.scene.position.x = 0;
            gltf.scene.position.y = -800;//underground
            gltf.scene.position.z = 0;
            gltf.scene.traverse( function ( child ) {

                if ( child.isObject3D ) {
                    if(i===0){
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0xFF0000,    // red (can also use a CSS color string here)
                            flatShading: true,
                        })
                    }else if(i===1){
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0xF67C00,    // yellow (can also use a CSS color string here)
                            flatShading: true,
                        })
                    }else{
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0x1387C4,    // blue (can also use a CSS color string here)
                            flatShading: true,
                        })
                    }
                }

            } );
            objArrow.push(gltf.scene);
            gltf.scene.receiveShadow = false;
            scene.add(gltf.scene);
        }, undefined, function (error) {
            console.error();
        });
    }
}

// loads sky box.
function loadSkyBox() {
    scene.background = new THREE.CubeTextureLoader()
        .setPath('model/skybox/')
        .load([
            'posx.png',
            'negx.png',
            'posy.png',
            'negy.png',
            'negz.png',
            'posz.png'
        ]);
}


// loads and scales the map.
function loadMap() {
    loader.load('model/myMap/DONEprobFINAL2.glb', function (gltf) {
        scaleMat.set
        (220.0, 0.0, 0.0, 0.0,
            0.0, 220.0, 0.0, 0.0,
            0.0, 0.0, 220.0, 0.0,
            0.0, 0.0, 0.0, 1.0);
        gltf.scene.applyMatrix4(scaleMat);
        gltf.scene.position.y = -175;

        gltf.scene.receiveShadow = true;
        gltf.scene.castShadow = true;
        gltf.scene.traverse(function (node) {

            if (node.isObject3D) {
                node.receiveShadow = true;
            }

        });
        scene.add(gltf.scene);

    }, undefined, function (error) {

        console.error();

    });
}

// loads helicopter model and assign it helicopter(MoveableObject).
var textureLoader = new THREE.TextureLoader();
var map = textureLoader.load('model/low_poly_helicopter/textures/Palette_baseColor2.png');
var material2 = new THREE.MeshPhongMaterial({map: map,flatShading:true,color:0x2b2b2b});
var material = new THREE.MeshPhongMaterial({map: map,flatShading:false,color:0x2b2b2b});
var currentMaterial = material;
var pastMaterial = material2;

function loadHelicopter() {
    loader.load('model/low_poly_helicopter/scene.gltf', function (gltf) {

        mixer = new THREE.AnimationMixer(gltf.scene);
        var action = mixer.clipAction(gltf.animations[0]);
        action.play();

        scaleMat.set
        (0.004, 0.0, 0.0, 0.0,
            0.0, 0.004, 0.0, 0.0,
            0.0, 0.0, 0.004, 0.0,
            0.0, 0.0, 0.0, 1.0);
        var obj = gltf.scene;
        obj.applyMatrix4(scaleMat);
        helicopter = new MoveableObject(0, gltf.scene);
        movingObject = helicopter;

        gltf.scene.castShadow = true;

        gltf.scene.traverse(function (node) {

            if (node.isObject3D) {
                node.castShadow = true;

                node.material = material;

            }

        });

        scene.add(gltf.scene);

    }, undefined, function (error) {
        console.error();

    });
}

var sound;
// loads necessary sounds.
function loadAudio() {
    const listener = new THREE.AudioListener();
    cameraP.add(listener);
    const soundMain = new THREE.Audio(listener);
    const soundHeli = new THREE.Audio(listener);
    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('model/sounds/mainThemeMusic.ogg', function (buffer) {
        soundMain.setBuffer(buffer);
        soundMain.setLoop(true);
        soundMain.setVolume(0.06);
        soundMain.play();
        sound= soundMain;
    });

    audioLoader.load('model/sounds/heliSound.ogg', function (buffer) {
        soundHeli.setBuffer(buffer);
        soundHeli.setLoop(true);
        soundHeli.setVolume(0.025);
        soundHeli.play();
    });

    soundFire = [new THREE.PositionalAudio(listener), new THREE.PositionalAudio(listener), new THREE.PositionalAudio(listener), new THREE.PositionalAudio(listener), new THREE.PositionalAudio(listener)];

    // load a sound and set it as the PositionalAudio object's buffer
    for (let k = 0; k < 5; k++) {
        audioLoader.load('model/sounds/fireSound.ogg', function (buffer) {
            soundFire[k].setBuffer(buffer);
            soundFire[k].setLoop(true);
            soundFire[k].setRefDistance(5);
            soundFire[k].setMaxDistance(11)
            soundFire[k].setVolume(0.25);
            soundFire[k].play();
        });
    }
}

var world,shapeMaterial,body,shape,timeStep=1/60,helper,mesh;
function initCannon() {             //CANNON JS

    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0,-9.82,0);

    helper = new CannonHelper(scene,world)

    for (var i = 0; i < fireObjects.length; i++) {
        let shape;
        shape = new CANNON.Box(new CANNON.Vec3(4,4,1));
        const boxMaterial = new CANNON.Material;
        const boxBody = new CANNON.Body({mass: 0, material: boxMaterial});
        boxBody.addShape(shape);
        boxBody.position.set(fireObjects[i].locX, fireObjects[i].locY-20, fireObjects[i].locZ);
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), - Math.PI/2  - 0.01);
        world.add(boxBody);
        helper.addVisual(boxBody, 0x08c5ff)
    }
}

function updatePhysics() {
    // Step the physics world
    world.step(timeStep);
    helper.update();
}

function arrowChecker(){
    var fires = [];
    for (let i = 0; i < indexUsed.length; i++) {
        fires.push(fireObjects[indexUsed[i]]);
    }
    activeFiresOrder = quickSort(fires);

    for (let i = 0; i < activeFiresOrder.length; i++) {
        if(i===3){break;}
        objArrow[i].position.x = activeFiresOrder[i].locX;
        objArrow[i].position.y = activeFiresOrder[i].locY + 10;
        objArrow[i].position.z = activeFiresOrder[i].locZ;
    }
}


// Sort fireObjects by point.
function quickSort(fireArray) {
    if (fireArray.length <= 1) {
        return fireArray;
    } else {
        var leftArr = [];
        var rightArr = [];
        var newArr = [];
        var pivot = fireArray.pop();      //  Take a pivot value
        var length = fireArray.length;
        for (var i = 0; i < length; i++) {
            if (fireArray[i].point <= pivot.point) {    // using pivot value start comparing
                leftArr.push(fireArray[i]);
            } else {
                rightArr.push(fireArray[i]);
            }
        }
        return newArr.concat(quickSort(leftArr), pivot, quickSort(rightArr));
    }
}

function changeShadingType(){
    movingObject.moveableObj.traverse(function (node) {
        if (node.isObject3D) {
            node.castShadow = true;
            node.material = pastMaterial;
        }
    });
    var temp = currentMaterial;
    currentMaterial = pastMaterial;
    pastMaterial = temp;
}

function sprayWater(){
    let shape;
    shape = new CANNON.Sphere(0.5);
    const waterMaterial = new CANNON.Material;
    const waterBody = new CANNON.Body({mass:5,material:waterMaterial});
    waterBody.addShape(shape);
    waterBody.position.set(movingObject.x + (Math.random() *8)- 4,movingObject.y-10+ (Math.random() * 9),movingObject.z + (Math.random() * 8) -4);
    waterBody.linearDamping = 0.3;
    world.add(waterBody);
    helper.addVisual(waterBody , 0x08c5ff)
}

function inputController(moveableObj) {
    let transVal = 0.38;
    if (cameraP.position.distanceTo(movingObject.position) < 25.0) {
        transVal = 0;
    }
    if (input.forward === true) {
        // By default translate object no matter what type it is.
        // But rotate if it is helicopter type.
        moveableObj.translateX(-0.38);
        cameraP.translateZ(-transVal);
        if (moveableObj.type === 0){
            if (moveableObj.rotationZ < 0.25) {
                moveableObj.rotateZ(0.006);
            }
            if(spotLightValueUpDown2 < 5.0){
                spotLightValueUpDown2 += 0.1;
            }
        }
    }
    if (input.forward === false) {
        if(moveableObj.type === 0){
            if (moveableObj.rotationZ > 0.0) {
                moveableObj.rotateZ(-0.008);
            }
            if(spotLightValueUpDown2 > 0){
                spotLightValueUpDown2 -= 0.1;
            }
        }
    }
    if (input.backward === true) {
        moveableObj.translateX(+0.38);
        cameraP.translateZ(transVal);
        if (moveableObj.type === 0){
            if (moveableObj.rotationZ > -0.25) {
                moveableObj.rotateZ(-0.006);
            }
            if(spotLightValueUpDown2 > -5.0){
                spotLightValueUpDown2 -= 0.1;
            }
        }
    }
    if (input.backward === false) {
        if(moveableObj.type === 0){
            if (moveableObj.rotationZ < 0.0) {
                moveableObj.rotateZ(0.008);
            }
            if(spotLightValueUpDown2 < 0){
                spotLightValueUpDown2 += 0.1;
            }
        }
    }
    if (input.left === true) {
        moveableObj.translateZ(+0.38);
        cameraP.translateX(-transVal);
        if(moveableObj.type === 0){
            if (moveableObj.rotationX < 0.22) {
                moveableObj.rotateX(0.006);
            }
            if(spotLightValueLeftRight2 > -5.0){
                spotLightValueLeftRight2 -= 0.1;
            }
        }
    }
    if (input.left === false) {
        if(moveableObj.type === 0){
            if (moveableObj.rotationX > 0.0) {
                moveableObj.rotateX(-0.008);
            }
            if(spotLightValueLeftRight2 < 0){
                spotLightValueLeftRight2 += 0.1;
            }
        }
    }
    if (input.right === true) {
        moveableObj.translateZ(-0.38);
        cameraP.translateX(transVal);
        if(moveableObj.type === 0){
            if (moveableObj.rotationX > -0.22) {
                moveableObj.rotateX(-0.006);
            }
            if(spotLightValueLeftRight2 < 5.0){
                spotLightValueLeftRight2 += 0.1;
            }
        }
    }
    if (input.right === false) {
        if(moveableObj.type === 0){
            if (moveableObj.rotationX < 0.0) {
                moveableObj.rotateX(0.008);
            }
            if(spotLightValueLeftRight2 > 0){
                spotLightValueLeftRight2 -= 0.1;
            }
        }
    }
    if (input.rotClk === true) {
        moveableObj.rotateY(-0.05);
    }
    if (input.rotCntr === true) {
        moveableObj.rotateY(0.05);
    }
    if (input.up === true) {
        moveableObj.translateY(0.4);
        cameraP.translateY(0.4);
    }
    if (input.down === true) {
        moveableObj.translateY(-0.525);
        cameraP.translateY(-0.525);
    }
    if (input.rotateForwFree === true) {
        moveableObj.rotateZ(0.025);
    }
    if (input.rotateBackFree === true) {
        moveableObj.rotateZ(-0.025);
    }
    if (input.water === true) {
        if (ammo > 0) {
            ammo -= 1;
            for(let i =0; i<90 ; i++){
                sprayWater();
            }
            checkToPutOutFire();
        }
        input.water = false;
    }
    if(input.spotLightUp === true){
        spotLightValueUpDown -= 1.0;
    }
    if(input.spotLightDown === true){
        spotLightValueUpDown += 1.0;
    }
    if(input.spotLightRight === true){
        spotLightValueLeftRight -= 1.0;
    }
    if(input.spotLightLeft === true){
        spotLightValueLeftRight += 1.0;
    }
    if(input.spotLightHigh === true){
        spotLightValueHighLow += 1.0;
    }
    if(input.spotLightLow === true){
        spotLightValueHighLow -= 1.0;
    }
    //INPUT SYSTEM DONE
}

animate();
