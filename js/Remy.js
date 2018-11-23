class Remy{
    constructor(model, speed, mixers, animations){
        this.mesh = model
        this.speed = speed
        this.mixers = mixers
        this.animations = animations

        // Remy controls
        this.controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
        }

        this.isMoving = false
        // Animations settings
        this.clock = new THREE.Clock()
        this.sign = 1
    }

    addListeners(){
        window.addEventListener('keydown', this.onKeyDown.bind(this), false)
        window.addEventListener('keyup', this.onKeyUp.bind(this), false)
    }

    onKeyDown(event){
        event.stopPropagation()
        // this.isMoving = true

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
        // this.isMoving = false

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

    update(discoPosition, speakerPosition, discoAverage, speakerAverage){
        // Playing correct animations
        let distanceSpeakerRemy = Math.sqrt(Math.pow(speakerPosition.x - this.mesh.position.x, 2) + Math.pow(speakerPosition.y - this.mesh.position.y, 2) + Math.pow(speakerPosition.z - this.mesh.position.z, 2))
        let distanceDiscoRemy = Math.sqrt(Math.pow(discoPosition.x - this.mesh.position.x, 2) + Math.pow(discoPosition.y - this.mesh.position.y, 2) + Math.pow(discoPosition.z - this.mesh.position.z, 2))

        if(this.controls.moveForward || this.controls.moveBackward || this.controls.moveLeft ||this.controls.moveRight){
            this.isMoving = true
        } else {
            this.isMoving = false
        }

        if(this.isMoving){
            // Default
            this.mesh.mixer.clipAction(this.animations["walkingAnimation"]).play()
            this.mesh.mixer.clipAction(this.animations["yellingAnimation"]).stop()
            this.mesh.mixer.clipAction(this.animations["dancingAnimation"]).stop()
        } else {
            // Dance
            if((distanceDiscoRemy < 70 && discoAverage > 60) || distanceSpeakerRemy < 70 && speakerAverage > 70){
                this.mesh.mixer.clipAction(this.animations["dancingAnimation"]).play()
                this.mesh.mixer.clipAction(this.animations["yellingAnimation"]).stop()
                this.mesh.mixer.clipAction(this.animations["walkingAnimation"]).stop()
            } else {
                this.mesh.mixer.clipAction(this.animations["yellingAnimation"]).play()
                this.mesh.mixer.clipAction(this.animations["walkingAnimation"]).stop()
                this.mesh.mixer.clipAction(this.animations["dancingAnimation"]).stop()
            }
        }

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

         // Update all mixers animations
        this.mixers[0].update( this.clock.getDelta() * this.sign)
    }
}