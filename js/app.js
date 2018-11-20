"use strict"

class App {
    constructor() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector("canvas"),
            antialias: true
        })

        // Scene
        this.scene = new THREE.Scene()

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            4000
        )

        // Controls
        this.orbitControl = new THREE.OrbitControls(this.camera)

        // Scene settings
        this.fbxLoader = new THREE.FBXLoader()
        this.clock = new THREE.Clock()
        this.models = []
        this.mixers = []
        this.animations = []
        this.sign = 1
        this.velocity = {
            x: 0.5,
            y: 0.02,
            z: 0.5
        }
        
        // Meshes settings
        this.controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
        }

        this.REMY_SPEED = 0.5

        // Launch scene
        this.init()
    }

    init() {
        // Settings
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.camera.position.set(0, 0, 200)
        this.scene.background = new THREE.Color(0x0000ff)

        // Lights
        let pointLight = new THREE.PointLight(0xffffff, 1, 200)
        pointLight.position.set(0, 50, 50)
        this.scene.add(pointLight)

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)

        // Helpers
        let axesHelper = new THREE.AxesHelper(50)
        this.scene.add(axesHelper)

        // Load all Meshes
        Promise.all([
            this.loadModel("assets/remy.fbx", "remy"),
            this.loadAnimation("assets/standing_animation.fbx", "standingAnimation"),
            this.loadAnimation("assets/walking_animation.fbx", "walkingAnimation"),
            this.loadAnimation("assets/dancing_animation.fbx", "dancingAnimation"),
            this.loadAnimation("assets/yelling_animation.fbx", "yellingAnimation"),
        ]).then(() => {
            // Once all loaded, launch the scene
            this.launchScene()
        })
    }

    loadModel(path, id) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(path, (model) => {
                model.mixer = new THREE.AnimationMixer(model)
                this.models[id] = model
                this.mixers.push(model.mixer)
                resolve()
            })
        })
    }

    loadAnimation(path, id) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(path, (mesh) => {
                this.animations[id] = mesh.animations[0]
                resolve()
            })
        })
    }

    launchScene(){
        // ground
        var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add( mesh );
                
        // Add all meshes to scene
        for(let id in this.models){
            let model = this.models[id]

            if(id === "remy"){
                model.scale.set(0.1, 0.1, 0.1)
                this.remy = model
            }

            this.scene.add(model)
        }

        // Add listeners
        window.addEventListener('keydown', this.onKeyDown.bind(this), false)
        window.addEventListener('keyup', this.onKeyUp.bind(this), false)

        // Update raf
        this.update()
    }

    onKeyDown(event){
        event.stopPropagation()

        switch ( event.keyCode ) {
            case 90: /*UP*/
            case 38: /*Z*/ 	this.controls.moveForward = true; break;

            case 40: /*DOWN*/
            case 83: /*S*/ 	this.controls.moveBackward = true; break;

            case 37: /*LEFT*/
            case 81: /*Q*/ 	this.controls.moveLeft = true; break;

            case 39: /*RIGHT*/
            case 68: /*D*/ 	this.controls.moveRight = true; break;
        }
    }

    onKeyUp(e){
        e.stopPropagation()

        switch ( event.keyCode ) {
            case 90: /*UP*/
            case 38: /*Z*/ 	this.controls.moveForward = false; break;

            case 40: /*DOWN*/
            case 83: /*Z*/ 	this.controls.moveBackward = false; break;

            case 37: /*LEFT*/
            case 81: /*Q*/ 	this.controls.moveLeft = false; break;

            case 39: /*RIGHT*/
            case 68: /*D*/ 	this.controls.moveRight = false; break;
        }
    }

    update() {
        // Playing correct animations
        if(this.controls.moveForward || this.controls.moveBackward || this.controls.moveLeft ||this.controls.moveRight){
            this.remy.mixer.clipAction(this.animations["standingAnimation"]).stop()
            this.remy.mixer.clipAction(this.animations["walkingAnimation"]).play()
        } else {
            this.remy.mixer.clipAction(this.animations["standingAnimation"]).play()
            this.remy.mixer.clipAction(this.animations["walkingAnimation"]).stop()
        }

        // Move forward
        if(this.controls.moveForward){
            this.sign = 1
            this.remy.position.z += Math.cos(this.remy.rotation.y) * this.REMY_SPEED
            this.remy.position.x += Math.sin(this.remy.rotation.y) * this.REMY_SPEED
        } 

        // Move backward
        if(this.controls.moveBackward){
            this.sign = -1
            this.remy.position.z -= Math.cos(this.remy.rotation.y) * this.REMY_SPEED
            this.remy.position.x -= Math.sin(this.remy.rotation.y) * this.REMY_SPEED
        } 
        
        // Move left
        if(this.controls.moveLeft){
            this.remy.rotation.y += 0.05
        } 

        // Move right
        if(this.controls.moveRight){
            this.remy.rotation.y -= 0.05
        } 

        // Update all mixers animations
        for ( var i = 0; i < this.mixers.length; i ++ ) {
            this.mixers[ i ].update( this.clock.getDelta() * this.sign)
        }

        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.update.bind(this))
    }
}

// DECLARATIONS
new App()
