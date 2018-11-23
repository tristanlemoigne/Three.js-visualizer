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

class DiscoSphere{
    constructor(rayon, rings, segments, pointSize, pointTexture, colorArr){
        this.rayon = rayon
        this.rings = rings
        this.segments = segments
        this.pointSize = pointSize
        this.pointTexture = pointTexture
        this.colorArr = colorArr

        this.simplex = new SimplexNoise()
        this.mesh = this.draw()
    }

    get size(){
        return new THREE.Box3().setFromObject(this.mesh).getSize(new THREE.Vector3())
    }

    draw(){
        let sphere = new THREE.Group()

        for(let latitude = -Math.PI/2; latitude <= Math.PI/2; latitude+=2*Math.PI / this.rings){
            let color 

            // Blue
            if(latitude < Math.PI/6 && latitude > -Math.PI/6){
                color = this.colorArr[1]
                // this.pointSize = 1.5
                this.pointSize = 5
            }
            // White
            else if(latitude < 0){
                // this.pointSize = 3
                this.pointSize = 10
                color = this.colorArr[0]
            } 
            // Red
            else {
                // this.pointSize = 3
                this.pointSize = 10
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

        // this.mesh = sphere
        return sphere
    }

    update(noiseAmplitude, time, bassFrequencyDatas){
        // Get frequencys average
        this.noiseAmplitude = noiseAmplitude
        this.time = time

        let bassCumul = 0

        for (let i = 0; i < bassFrequencyDatas.length; i++) {
            bassCumul += bassFrequencyDatas[i]
        }

        this.bassMusicAverage = bassCumul / bassFrequencyDatas.length

        // Animation up/down
        this.mesh.position.y = Math.sin(this.time/2)* 10 + this.size.y

        // Remove Listener from children
        this.mesh.children.slice(0, -1).forEach(point => {
            // // Blue or red
            if(point.position.z > this.rayon/2 || point.position.z < -this.rayon/2){
                point.position.x += (point.initialPosition.x - point.position.x) / 5
                point.position.y += (point.initialPosition.y - point.position.y) / 5
                point.position.z += (point.initialPosition.z - point.position.z) / 5
            }

            // // White (apply noise)
            else{
                let randomPosition = {
                    x: (point.position.x + this.time) / this.noiseAmplitude,
                    y: (point.position.y + this.time) / this.noiseAmplitude,
                    y: (point.position.z + this.time) / this.noiseAmplitude
                }
        
                this.noise = this.simplex.noise2D(randomPosition.x, randomPosition.y, randomPosition.z)
                point.position.x = point.initialPosition.x + this.noise 
                point.position.y = point.initialPosition.y + this.noise 
                point.position.z = point.initialPosition.z  + this.noise/2
            }
        })
    }
}