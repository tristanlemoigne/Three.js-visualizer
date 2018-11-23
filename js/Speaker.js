class Speaker{
    constructor(model){
        this.mesh = model

        this.mesh.traverse(child => {
            if(child.name === "mover_circle" || child.name === "mover_sphere"){
                child.initialPosition = {
                    x: child.position.x,
                    y: child.position.y,
                    z: child.position.z,
                }
            }
        })
    }

    get size(){
        return new THREE.Box3().setFromObject(this.mesh).getSize(new THREE.Vector3())
    }

    update(time, mediumFrequencyDatas){
        let mediumCumul = 0

        for (let i = 0; i < mediumFrequencyDatas.length; i++) {
            mediumCumul += mediumFrequencyDatas[i]
        }

        this.mediumMusicAverage = mediumCumul / mediumFrequencyDatas.length

        this.mesh.traverse(child => {
            if(child.name === "mover_circle" || child.name === "mover_sphere"){
                child.position.x = child.initialPosition.x - this.mediumMusicAverage
            }
        })

        // Animation up/down 
        this.mesh.position.y = Math.cos(time/2)* 10 + this.size.y
    }
}