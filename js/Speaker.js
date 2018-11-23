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

    update(mediumFrequencyDatas){
        let mediumCumul = 0

        for (let i = 0; i < mediumFrequencyDatas.length; i++) {
            mediumCumul += mediumFrequencyDatas[i]
        }

        let mediumAverage = mediumCumul / mediumFrequencyDatas.length

        this.mesh.traverse(child => {
            if(child.name === "mover_circle" || child.name === "mover_sphere"){
                child.position.x = child.initialPosition.x - mediumAverage
            }
        })
    }
}