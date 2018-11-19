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
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1500
        )

        // Controls
        this.orbitControl = new THREE.OrbitControls(this.camera)

        // Scene settings
        this.fbxLoader = new THREE.FBXLoader()
        this.clock = new THREE.Clock()
        this.models = []
        this.mixers = []
        this.animations = []
        
        // Meshes settings
        this.controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false
        }

        // Launch scene
        this.init()
    }

    init() {
        // Settings
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.camera.position.set(0, 0, 1000)
        this.scene.background = new THREE.Color(0x0000ff)

        // Lights
        let pointLight = new THREE.PointLight(0xffffff, 1, 200)
        pointLight.position.set(0, 50, 50)
        this.scene.add(pointLight)

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)

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
        // Add all meshes to scene
        for(let id in this.models){
            let model = this.models[id]

            if(id === "remy"){
                // for(let key in this.animations){
                //     let animation = this.animations[key]
                //     model.mixer.clipAction(animation)
                // }
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

    onKeyDown(e){
        e.stopPropagation()

        switch ( event.keyCode ) {
            case 38: /*UP*/
            case 90: /*Z*/ 	this.controls.moveForward = true; break;
        }
    }

    onKeyUp(e){
        e.stopPropagation()

        switch ( event.keyCode ) {
            case 38: /*UP*/
            case 90: /*Z*/ 	this.controls.moveForward = false; break;
        }
    }

    update() {
        if(this.controls.moveForward){
            this.remy.mixer.clipAction(this.animations["walkingAnimation"]).play()
            this.remy.mixer.clipAction(this.animations["standingAnimation"]).stop()
        } else {
            this.remy.mixer.clipAction(this.animations["standingAnimation"]).play()
            this.remy.mixer.clipAction(this.animations["walkingAnimation"]).stop()
        }

        // Update all mixers animations
        for ( var i = 0; i < this.mixers.length; i ++ ) {
            this.mixers[ i ].update( this.clock.getDelta() )
        }

        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.update.bind(this))
    }
}

// DECLARATIONS
new App()
