"use strict"

class Point {
    constructor(size, texture, color) {
        this.size = size
        this.texture = texture
        this.color = color

        return this.draw()
    }

    draw() {
        let geometry = new THREE.Geometry()
        geometry.vertices.push(new THREE.Vector3())
        let material = new THREE.PointsMaterial( {color: this.color, transparent: true, size: this.size, map: this.texture} )
        material.needsUpdate = true

        let point = new THREE.Points( geometry, material )
        return point
    }
}

class Sphere{
    constructor(rayon, rings, segments, pointSize, pointTexture, colorArr){
        this.rayon = rayon
        this.rings = rings
        this.segments = segments
        this.pointSize = pointSize
        this.pointTexture = pointTexture
        this.colorArr = colorArr

        return this.draw()
    }

    draw(){
        let sphere = new THREE.Group()

        for(let latitude = -Math.PI/2; latitude <= Math.PI/2; latitude+=2*Math.PI / this.rings){
            let color 

            // Blue
            if(latitude < Math.PI/6 && latitude > -Math.PI/6){
                color = this.colorArr[1]
                this.pointSize = 0.7
            }
            // White
            else if(latitude < 0){
                this.pointSize = 2
                color = this.colorArr[0]
            } 
            // Red
            else {
                this.pointSize = 2
                color = this.colorArr[2]
            }

            for(let longitude = -Math.PI; longitude <= Math.PI; longitude+= 2 * Math.PI / this.segments){
                let point = new Point(this.pointSize, this.pointTexture, color)

                let position = {
                    x: this.rayon * Math.cos(latitude) * Math.cos(longitude),
                    y: this.rayon * Math.cos(latitude) * Math.sin(longitude),
                    z: this.rayon * Math.sin(latitude)
                }
                point.initialPosition = position
                point.position.copy(position)
                sphere.add(point)
            }
        }

        return sphere
    }
}

class App {
    constructor() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector("canvas"),
            antialias: true
        })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        // Scene
        this.scene = new THREE.Scene()

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        this.camera.position.set(0, 0, 10)

        // Controls
        this.controls = new THREE.OrbitControls(this.camera)
        this.controls.update()

        // Helpers
        this.axeseHelpers = new THREE.AxesHelper(10)
        this.scene.add(this.axeseHelpers)
        
        // Settings 
        this.time = 0
        this.simplex = new SimplexNoise()

        // Meshes
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

        // Launch scene
        this.music = new Sound("assets/sound.mp3", 120, 0, this.init.bind(this), true)

        // this.init()
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min +1)) + min;
    }

    init() {
        // Lights
        let pointLight = new THREE.PointLight(0xffffff, 1, 200)
        pointLight.position.set(0, 50, 50)
        this.scene.add(pointLight)

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)

        // Mesh
        this.sphere = new Sphere(this.SPHERE_RAY, this.SPHERE_RINGS, this.SPHERE_SEGMENTS, this.POINT_SIZE, this.POINT_TEXTURE, this.COLOR_ARR)
        this.sphere.scale.z = 2
        this.scene.add(this.sphere)

        // Sound
        this.music.play()
        // this.basses = this.music.createKick({
        //     frequency: [190, 256], 
        //     threshold: 15, 
        //     decay: 3, 
        //     onKick: this.onKick.bind(this), 
        //     offKick: this.offKick.bind(this)
        // })

        // this.basses.on()

        this.kick = this.music.createKick({
            frequency: [30, 40], 
            threshold: 150, 
            decay: 2, 
            onKick: this.onKick.bind(this), 
            offKick: this.offKick.bind(this)
        }).on()

        // Animations
        this.update()
    }

    onKick(){
        this.sphere.children.forEach(point => {
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
        this.time += this.NOISE_SPEED 
        // let frequencyArr = this.music.getSpectrum()
        // let whiteLength = this.SPHERE_SEGMENTS * Math.round(this.SPHERE_RINGS / this.COLOR_ARR.length)

        this.sphere.children.forEach(point => {
            // Blue or red
            if(point.position.z > this.SPHERE_RAY/2 || point.position.z < -this.SPHERE_RAY/2){
                point.position.x += (point.initialPosition.x - point.position.x) / 5
                point.position.y += (point.initialPosition.y - point.position.y) / 5
                point.position.z += (point.initialPosition.z - point.position.z) / 5
            }

            // White (apply noise)
            else{
                let randomPosition = {
                    x: (point.position.x + this.time) / this.NOISE_AMPLITUDE,
                    y: (point.position.y + this.time) / this.NOISE_AMPLITUDE,
                    y: (point.position.z + this.time) / this.NOISE_AMPLITUDE
                }
        
                this.noise = this.simplex.noise2D(randomPosition.x, randomPosition.y, randomPosition.z)
                point.position.x = point.initialPosition.x + this.noise 
                point.position.y = point.initialPosition.y + this.noise 
                point.position.z = point.initialPosition.z  + this.noise/2
            }
        })


        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.update.bind(this))
    }
}

// DECLARATIONS
new App()
