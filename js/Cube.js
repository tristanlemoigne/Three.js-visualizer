class Cube{
    constructor(size, speed){
        this.size = size
        this.speed = speed
        this.color = 0xffffff
        this.mesh = this.draw()

        // Remy controls
        this.controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
        }
    }

    draw(){
        let geometry = new THREE.BoxGeometry(this.size, this.size, this.size)
        let material = new THREE.MeshLambertMaterial( {color: this.color} )
        let cube = new THREE.Mesh( geometry, material )

        return cube
    }

    addListeners(){
        window.addEventListener('keydown', this.onKeyDown.bind(this), false)
        window.addEventListener('keyup', this.onKeyUp.bind(this), false)
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

    update(){
        // Move forward
        if(this.controls.moveForward){
            this.sign = 1
            this.mesh.position.z += Math.cos(this.mesh.rotation.y) * this.speed
            this.mesh.position.x += Math.sin(this.mesh.rotation.y) * this.speed
        } 

        // Move backward
        if(this.controls.moveBackward){
            this.sign = -1
            this.mesh.position.z -= Math.cos(this.mesh.rotation.y) * this.speed
            this.mesh.position.x -= Math.sin(this.mesh.rotation.y) * this.speed
        } 
        
        // Move left
        if(this.controls.moveLeft){
            this.mesh.rotation.y += 0.05
        } 

        // Move right
        if(this.controls.moveRight){
            this.mesh.rotation.y -= 0.05
        } 
    }
}