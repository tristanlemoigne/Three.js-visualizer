"use strict"

class Personnage{
    constructor(url){
        this.url = url

        return this.draw()
    }

    draw(){
        console.log("draw pers", this.url)
    }
}

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
        this.controls = new THREE.OrbitControls(this.camera)

        // Scene settings
        this.fbxLoader = new THREE.FBXLoader()
        this.clock = new THREE.Clock()
        this.models = []
        this.mixers = []
        this.animations = []

        // Launch scene
        this.init()
    }

    init() {
        // Settings
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.camera.position.set(0, 0, 1000)
        this.controls.update()
        this.scene.background = new THREE.Color(0x0000ff)

        // Lights
        let pointLight = new THREE.PointLight(0xffffff, 1, 200)
        pointLight.position.set(0, 50, 50)
        this.scene.add(pointLight)

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)

        // Load all Meshes
        Promise.all([
            this.loadModel("assets/remy.fbx", "personnage"),
            this.loadAnimation("assets/yelling_animation.fbx", "yellingAnimation"),
            this.loadAnimation("assets/dancing_animation.fbx", "dancingAnimation"),
            this.loadAnimation("assets/walking_animation.fbx", "walkingAnimation")
        ]).then(() => {
            // Once all loaded, launch the scene
            this.launchScene()
        })
    }

    loadModel(path, id) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(path, (model) => {
                console.log("load", model)
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
        for (let key in this.models) {
            let model = this.models[key]

            if(key === "personnage"){
                let action = model.mixer.clipAction(this.animations["dancingAnimation"])
                action.play()
            }

            this.scene.add(model)
        }

        // Update raf
        this.update()
    }

    update() {
        for ( var i = 0; i < this.mixers.length; i ++ ) {
            this.mixers[ i ].update( this.clock.getDelta() )
        }

        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.update.bind(this))
    }
}

// DECLARATIONS
new App()
