"use strict"
class App {
    constructor() {
        // Disco sphere settings
        this.DISCOSPHERE_SCALE = 1
        this.POINT_SIZE = 2
        this.POINT_TEXTURE = new THREE.TextureLoader().load("assets/disc.png")
        this.POINTS_SCALE = 1.1
        this.SPHERE_RAY = 10
        this.SPHERE_RINGS = 62
        this.SPHERE_SEGMENTS = 64
        // this.COLOR_ARR = [0x0000ff, 0xffffff, 0xff0000]
        this.COLOR_ARR = [0x00d2ff, 0xffffff, 0x00d2ff]

        this.NOISE_AMPLITUDE = 20
        this.NOISE_SPEED = .07

        // Remy settings
        this.remyTime = 0
        this.REMY_SPEED = 0.55
        this.REMY_SCALE = 0.1

        // Models settings
        this.models = []
        this.mixers = []
        this.animations = []

        // Load all elements
        this.loadAll()
    }

    loadAll(){
        Promise.all([
            this.loadModel("assets/remy.fbx", "remy"),
            this.loadAnimation("assets/standing_animation.fbx", "standingAnimation"),
            this.loadAnimation("assets/walking_animation.fbx", "walkingAnimation"),
            this.loadAnimation("assets/dancing_animation.fbx", "dancingAnimation"),
            this.loadAnimation("assets/yelling_animation.fbx", "yellingAnimation")
        ]).then(() => {
            // Once all loaded, launch the scene
            this.initScene()
        })
    }

    loadModel(path, id) {
        return new Promise((resolve, reject) => {
           new THREE.FBXLoader().load(path, (model) => {
                model.mixer = new THREE.AnimationMixer(model)
                this.models[id] = model
                this.mixers.push(model.mixer)
                resolve()
            })
        })
    }

    loadAnimation(path, id) {
        return new Promise((resolve, reject) => {
            new THREE.FBXLoader().load(path, (mesh) => {
                this.animations[id] = mesh.animations[0]
                resolve()
            })
        })
    }

    initScene() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector("canvas"),
            antialias: true
        })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        // Scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x0000ff)

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            4000
        )
        this.camera.position.set(0, 50, 200)
        this.camera.lookAt(this.scene.position)

        // Controls
        this.orbitControl = new THREE.OrbitControls(this.camera)

        // Lights
        let pointLight = new THREE.PointLight(0xffffff, 1, 100)
        pointLight.position.set(0, 50, 0)
        this.scene.add(pointLight)

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)

        // Helpers
        let axesHelper = new THREE.AxesHelper(10)
        this.scene.add(axesHelper)

        // Plane
        let planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000)
        let planeMaterial = new THREE.MeshPhongMaterial({color: 0x999999, depthWrite: false, side: THREE.DoubleSide })
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial)
        // this.plane.receiveShadow = true
        this.plane.rotation.x = - Math.PI / 2
        this.scene.add(this.plane)

        // Disco sphere
        this.discoSphere = new DiscoSphere(this.SPHERE_RAY, this.SPHERE_RINGS, this.SPHERE_SEGMENTS, this.POINT_SIZE, this.POINT_TEXTURE, this.COLOR_ARR)
        this.discoSphere.mesh.scale.set(this.DISCOSPHERE_SCALE, this.DISCOSPHERE_SCALE, 2 * this.DISCOSPHERE_SCALE)
        this.scene.add(this.discoSphere.mesh)

        // Remy
        // this.remy = new Remy(this.models.remy, this.REMY_SPEED, this.mixers, this.animations)
        // this.remy.addListeners()
        // this.remy.mesh.scale.set(this.REMY_SCALE, this.REMY_SCALE, this.REMY_SCALE)
        // this.scene.add(this.remy.mesh)

        // Raf loop()
        this.update()
    }

    update() {
        // this.remy.update()
        this.remyTime += this.NOISE_SPEED
        this.discoSphere.update(this.NOISE_AMPLITUDE, this.remyTime)

        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.update.bind(this))
    }
}

// DECLARATIONS
new App()
