"use strict"

class Mesh {
    constructor() {
        this.size = 1
        this.color = 0xffffff
    }

    draw() {
        let geometry = new THREE.BoxGeometry(this.size, this.size, this.size)
        let material = new THREE.MeshLambertMaterial({ color: this.color })

        return new THREE.Mesh(geometry, material)
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
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )

        // Controls
        this.controls = new THREE.OrbitControls(this.camera)

        // Launch scene
        this.init()
    }

    init() {
        // Settings
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.camera.position.set(0, 0, 10)
        this.controls.update()

        // Lights
        let pointLight = new THREE.PointLight(0xffffff, 1, 200)
        pointLight.position.set(0, 50, 50)
        this.scene.add(pointLight)

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)

        // Mesh
        this.mesh = new Mesh().draw()
        this.scene.add(this.mesh)

        // Animations
        this.update()
    }

    update() {
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.update.bind(this))
    }
}

// DECLARATIONS
new App()
