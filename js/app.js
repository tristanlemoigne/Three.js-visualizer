"use strict"
class App {
    constructor() {
        // Disco settings
        this.DISCOSPHERE_SCALE = 1.3
        this.POINT_SIZE = 8
        this.POINTS_SCALE = 1.1
        this.SPHERE_RAY = 10
        this.SPHERE_RINGS = 62
        this.SPHERE_SEGMENTS = 64
        this.COLOR_ARR = [0xff0000, 0x00d2ff, 0xff0000]
        this.time = 0

        this.NOISE_AMPLITUDE = 20
        this.TIME_SPEED = .07

        // Remy settings
        this.REMY_SPEED = 0.55
        this.REMY_SCALE = 0.1

        // Volume settings
        this.VOLUME_RAY = 2
        this.VOLUME_REDUCTION = 1.5

        // Loaders settings
        this.modelsArr = []
        this.texturesArr = []
        this.animationsArr = []
        this.mixersArr = []
        this.buffersArr = {}

        // Music settings
        this.positionnalMusics = {}

         // Remy controls
         this.controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
        }

        // Load all elements
        this.loadAll()
    }

    static map(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
    }

    loadAll(){
        Promise.all([
            this.loadModel("assets/models/remy.fbx", "remy"),
            this.loadModel("assets/models/speaker2.fbx", "speaker"),
            this.loadTexture("assets/textures/disc.png", "particle"),
            this.loadTexture("assets/textures/ground4.jpg", "parquet"),
            this.loadAnimation("assets/animations/standing_animation.fbx", "standingAnimation"),
            this.loadAnimation("assets/animations/walking_animation.fbx", "walkingAnimation"),
            this.loadAnimation("assets/animations/dancing_animation.fbx", "dancingAnimation"),
            this.loadAnimation("assets/animations/yelling_animation.fbx", "yellingAnimation"),
            this.loadSound("assets/musics/bassMusic.mp3", "bassMusic"),
            this.loadSound("assets/musics/highMusic.mp3", "mediumMusic")
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
                if(id === "remy"){
                    this.mixersArr.push(model.mixer)
                }
                resolve()
            })
        })
    }

    loadTexture(path, id) {
        return new Promise((resolve, reject) => {
           new THREE.TextureLoader().load(path, (texture) => {
               if(id === "parquet"){
                texture.repeat.set( 10, 10)
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                       
                }
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
        // this.scene.background = new THREE.Color(0zx0000ff)

        // Audio Listener
        this.listener = new THREE.AudioListener()
        this.listener.rotation.y = Math.PI

        // Camera officielle
        this.camera = new THREE.PerspectiveCamera(
            100,
            window.innerWidth / window.innerHeight,
            100,
            4000
        )
        this.camera.rotation.y = Math.PI
        this.camera.position.set(-100, 350, -250)
        // this.scene.add(this.camera)
        
        // Camera test
        this.cameraTest = new THREE.PerspectiveCamera(
            100,
            window.innerWidth / window.innerHeight,
            1,
            2000
        )
        this.cameraTest.position.set(0, 500, 200)
        
        this.helper = new THREE.CameraHelper( this.camera );
        // this.scene.add( this.helper )

        // Controls
        // this.orbitControl = new THREE.OrbitControls(this.cameraTest)

        // Helpers
        let axesHelper = new THREE.AxesHelper(10)
        // this.scene.add(axesHelper)

        // Plane
        let planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000)
        let planeMaterial = new THREE.MeshPhongMaterial({transparent: true, color: 0x999999, depthWrite: false, side: THREE.DoubleSide, map: this.texturesArr.parquet })
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial)
        // this.plane.receiveShadow = trues
        this.plane.rotation.x = - Math.PI / 2
        this.scene.add(this.plane)

        // Disco sphere
        this.discoSphere = new DiscoSphere(this.SPHERE_RAY, this.SPHERE_RINGS, this.SPHERE_SEGMENTS, this.POINT_SIZE, this.texturesArr.particle, this.COLOR_ARR)
        this.discoSphere.mesh.scale.set(this.DISCOSPHERE_SCALE, this.DISCOSPHERE_SCALE, 2 * this.DISCOSPHERE_SCALE)
        this.discoSphere.mesh.position.y += this.discoSphere.size.y / 2
        this.discoSphere.mesh.position.z = -200
        this.discoSphere.mesh.position.x = 150
        this.discoSphere.mesh.rotation.y = Math.PI/4
        this.scene.add(this.discoSphere.mesh)

        // Speaker
        this.speaker = new Speaker(this.modelsArr.speaker)
        this.speaker.mesh.scale.set(this.REMY_SCALE, this.REMY_SCALE, this.REMY_SCALE)
        this.speaker.mesh.position.y += this.speaker.size.y / 2
        this.speaker.mesh.position.z = -200
        this.speaker.mesh.position.x = -150
        this.speaker.mesh.rotation.y = 3 * Math.PI/4
        this.scene.add(this.speaker.mesh)

        // Remy
        this.remy = new Remy(this.modelsArr.remy, this.REMY_SPEED, this.mixersArr, this.animationsArr)
        this.remy.addListeners()
        this.remy.mesh.scale.set(this.REMY_SCALE, this.REMY_SCALE, this.REMY_SCALE)
        this.remy.mesh.rotation.y = Math.PI
        this.remy.mesh.add(this.camera)
        this.remy.mesh.add(this.listener)
        this.scene.add(this.remy.mesh)

          // Lights
          let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
          this.scene.add(ambientLight)
  
          this.speakerLight = new THREE.PointLight(0xffffff, 1, 500)
          this.speakerLight.position.set(this.speaker.mesh.position.x, 20, this.speaker.mesh.position.z)
          this.scene.add(this.speakerLight)
  
          this.discoLight = new THREE.PointLight(0xffffff, 1, 500)
          this.discoLight.position.set(this.discoSphere.mesh.position.x, 20, this.discoSphere.mesh.position.z)
          this.scene.add(this.discoLight)
  
          this.remyLight = new THREE.PointLight(0xffffff, 1, 500)
          this.remyLight.position.set(0, 50, 10)
          this.remy.mesh.add(this.remyLight)
  
        // Musics
        this.launchPositionnalMusics(this.buffersArr, this.listener, () => {
            // Add bass music to disco sphere
            this.discoSphere.mesh.add(this.positionnalMusics.bassMusic)
            this.speaker.mesh.add(this.positionnalMusics.mediumMusic)

            // Bass music Analyser
            let bassMusicAnalyser= new TheSound(this.buffersArr.bassMusic, 0, 0, false)
            bassMusicAnalyser.loop = true
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

            // Bass music Analyser
            this.bassMusicAnalyser = new TheSound(this.buffersArr.bassMusic, 0, 0, false)
            this.bassMusicAnalyser.play()
            this.bassMusicAnalyser.volume = 0

            // Bass music Analyser
            this.mediumMusicAnalyser = new TheSound(this.buffersArr.mediumMusic, 0, 0, false)
            this.mediumMusicAnalyser.play()
            this.mediumMusicAnalyser.volume = 0
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
            positionnalMusic.setLoop(true)
            positionnalMusic.play()

            if(key === "bassMusic"){
                positionnalMusic.setVolume(0.2)
            }

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
        // Update disco
        this.time += this.TIME_SPEED
        this.bassFrequencyDatas = this.bassMusicAnalyser.getSpectrum()
        this.discoSphere.update(this.NOISE_AMPLITUDE, this.time, this.bassFrequencyDatas)

        // Update Speaker
        this.mediumFrequencyDatas = this.mediumMusicAnalyser.getSpectrum()
        this.speaker.update(this.time, this.mediumFrequencyDatas)

        // Update Remy
        this.remy.update(this.discoSphere.mesh.position, this.speaker.mesh.position, this.discoSphere.bassMusicAverage, this.speaker.mediumMusicAverage)

        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.update.bind(this))
    }
}

// DECLARATIONS
new App()
