"use strict"
class App {
    constructor() {
        // Disco settings
        this.DISCOSPHERE_SCALE = 1
        this.POINT_SIZE = 2
        this.POINTS_SCALE = 1.1
        this.SPHERE_RAY = 10
        this.SPHERE_RINGS = 62
        this.SPHERE_SEGMENTS = 64
        this.COLOR_ARR = [0x00d2ff, 0xffffff, 0x00d2ff]
        this.discoTime = 0

        this.NOISE_AMPLITUDE = 20
        this.NOISE_SPEED = .07

        // Remy settings
        this.REMY_SPEED = 0.55
        this.REMY_SCALE = 0.1

        // Volume settings
        this.VOLUME_RAY = 5
        this.VOLUME_REDUCTION = 1.5

        // Loaders settings
        this.modelsArr = []
        this.texturesArr = []
        this.animationsArr = []
        this.mixersArr = []
        this.buffersArr = {}

        // Music settings
        this.positionnalMusics = {}

        // Load all elements
        this.loadAll()
    }

    loadAll(){
        Promise.all([
            this.loadModel("assets/models/remy.fbx", "remy"),
            this.loadTexture("assets/textures/disc.png", "particle"),
            this.loadAnimation("assets/animations/standing_animation.fbx", "standingAnimation"),
            this.loadAnimation("assets/animations/walking_animation.fbx", "walkingAnimation"),
            this.loadAnimation("assets/animations/dancing_animation.fbx", "dancingAnimation"),
            this.loadAnimation("assets/animations/yelling_animation.fbx", "yellingAnimation"),
            this.loadSound("assets/musics/bassMusic.mp3", "bassMusic")
        ]).then(() => {
            // Once all loaded, launch the scene
            this.initScene()
        })
    }

    loadModel(path, id) {
        return new Promise((resolve, reject) => {
           new THREE.FBXLoader().load(path, (model) => {
                model.mixer = new THREE.AnimationMixer(model)
                this.modelsArr[id] = model
                this.mixersArr.push(model.mixer)
                resolve()
            })
        })
    }

    loadTexture(path, id) {
        return new Promise((resolve, reject) => {
           new THREE.TextureLoader().load(path, (texture) => {
                this.texturesArr[id] = texture
                resolve()
            })
        })
    }

    loadAnimation(path, id) {
        return new Promise((resolve, reject) => {
            new THREE.FBXLoader().load(path, (mesh) => {
                this.animationsArr[id] = mesh.animations[0]
                resolve()
            })
        })
    }

    loadSound(path, id){
        return new Promise((resolve, reject) => {
            new THREE.AudioLoader().load(path, (buffer) => {
                this.buffersArr[id] = buffer
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

        // Audio Listener
        this.listener = new THREE.AudioListener()

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            4000
        )
        this.camera.position.set(0, 20, 100)

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
        this.discoSphere = new DiscoSphere(this.SPHERE_RAY, this.SPHERE_RINGS, this.SPHERE_SEGMENTS, this.POINT_SIZE, this.texturesArr.particle, this.COLOR_ARR)
        this.discoSphere.mesh.scale.set(this.DISCOSPHERE_SCALE, this.DISCOSPHERE_SCALE, 2 * this.DISCOSPHERE_SCALE)
        this.discoSphere.mesh.position.z = 50
        this.scene.add(this.discoSphere.mesh)

        // Remy
        // this.remy = new Remy(this.modelsArr.remy, this.REMY_SPEED, this.mixersArr, this.animationsArr)
        // this.remy.addListeners()
        // this.remy.mesh.scale.set(this.REMY_SCALE, this.REMY_SCALE, this.REMY_SCALE)
        // this.scene.add(this.remy.mesh)

        // Cube
        this.cube = new Cube(10, 1)
        this.cube.addListeners()
        this.cube.mesh.add(this.camera)
        this.cube.mesh.add(this.listener)
        this.scene.add(this.cube.mesh)

        this.launchPositionnalMusics(this.buffersArr, this.listener, () => {
            // Add bass music to disco sphere
            this.discoSphere.mesh.add(this.positionnalMusics.bassMusic)

            // Bass music Analyser
            let bassMusicAnalyser= new TheSound(this.buffersArr.bassMusic, 120, 0, true)
            bassMusicAnalyser.play()
            bassMusicAnalyser.volume = 0

            let basses = bassMusicAnalyser.createKick({
                frequency: [190, 256], 
                threshold: 15, 
                decay: 3, 
                onKick: this.onKick.bind(this), 
                offKick: this.offKick.bind(this)
            })
            basses.on()
        })

        // Raf loop()
        this.update()
    }

    launchPositionnalMusics(arr, listener, callback){
        for (let key in arr) {
            let buffer = arr[key]

            let positionnalMusic = new THREE.PositionalAudio(listener)
            positionnalMusic.setBuffer(buffer)
            positionnalMusic.setRefDistance(this.VOLUME_RAY)
            positionnalMusic.setRolloffFactor(this.VOLUME_REDUCTION)
            positionnalMusic.play()

            this.positionnalMusics[key] = positionnalMusic
        }
        callback()
    }

    onKick(){
        this.discoSphere.mesh.children.slice(0, -1).forEach(point => {
            // Move blue and red
            if(point.position.z > this.SPHERE_RAY/2 || point.position.z < -this.SPHERE_RAY/2){
                point.position.x = point.position.x * this.POINTS_SCALE 
                point.position.y = point.position.y * this.POINTS_SCALE  
                point.position.z = point.position.z * this.POINTS_SCALE 
            } 
        })
    }

    offKick(){}


    update() {
        this.discoTime += this.NOISE_SPEED
        this.discoSphere.update(this.NOISE_AMPLITUDE, this.discoTime)

        // this.remy.update()
        this.cube.update()

        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.update.bind(this))
    }
}

// DECLARATIONS
new App()
