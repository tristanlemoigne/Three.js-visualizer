class DiscoSphere{
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
        let discoSphere = new THREE.Group()

        for(let latitude = -Math.PI/2; latitude <= Math.PI/2; latitude+=2*Math.PI / this.rings){
            let color 

            // White
            if(latitude < Math.PI/6 && latitude > -Math.PI/6){
                color = this.colorArr[1]
                this.pointSize = 0.7
            }
            // Blue
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
                discoSphere.add(point)
            }
        }

        return discoSphere
    }
}

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