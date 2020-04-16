//Represents a single die
class Die {
    //Initialize with number of sides for this die
    constructor( nSides = 6 ) {
        this.sides = Math.floor(nSides)
        this.value = 0
    }
    //Roll this die n-times and return the end value
    roll( num = 1 ) {
        const randomize = ( min = 1 ) => Math.floor(Math.random() * (this.sides - min + 1)) + min
        for( var r = 0; r < Math.ceil(Number(num)); ++r ) { this.value = randomize() }
        return this.value
    }
    //Reset this die value to zero
    reset() {
        return this.value = 0
    }
}


//Represents a series of dice
class Dice {
    //Initialize with number of dice and number of sides per die
    constructor( numDice, nSides ) {
        this.sides = nSides
        //Create an array of Die
        this.dice = new Array(numDice).fill(0).map(d => new Die(nSides))
    }
    //Return array of all dice values
    values() {
        return this.dice.map(d => d.value)
    }
    //Add a new Die to dice array
    addDie( nSides ) {
        return this.dice.push(new Die(nSides))
    }
    //Remove a Die from the dice array
    remDie( index ) {
        return this.dice.splice(index,1)[0]
    }
    //Reroll all the dice with a value below the limit
    reroll( limit ) {
        return this.dice.map(d => d.value >= limit ? d.value : d.roll())
    }
    //Roll all the dice
    roll() {
        return this.dice.map(d => d.roll())
    }
    //Return the sum of all dice
    sum() {
        return this.dice.reduce((sum,d) => sum + d.value, 0)
    }
    //Return the text result of roll
    //[ "n-hits [+glitch]", "no hits", "critical glitch" ]
    result() {
        var miss = this.dice.reduce((sum,d) => sum + (d.value <= 1 ? 1 : 0),0)
        var hits = this.dice.reduce((sum,d) => sum + (d.value >= 5 ? 1 : 0),0)
        var results = []
        if( hits ) results.push(`${hits} hit${hits > 1 ? 's' : ''}`)
        if( miss >= this.dice.length / 2 ) {
            if( hits ) results.push("+glitch")
            else results.push("critical glitch")
        }         
        return results.length ? results : ['no hits']
    }
    //Draw the dice with canvas
    draw( old ) {
        //Get the values
        const result = this.dice.map(d => d.value)
        //Set the base size per die
        const size = 40
        const pad = size / 8
        //Set the canvas size for all dice
        const height = pad + size + pad
        const width  = pad + (size + pad) * result.length
        
        //Initialize a new canvas
        const Canvas = require('canvas')
        const canvas = Canvas.createCanvas(width,height)
        
        //Get a canvas context and draw background rectangle
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = `rgba(50,50,50,1)`
        ctx.fillRect(0,0,width,height)

        //Track x and y
        var x = pad
        var y = pad

        //For each die ... draw
        for( var i = 0;  i < result.length; ++i ) {
            //Set face color (grey for old - white for new)
            ctx.fillStyle = old ? `rgba(150,150,150,1)` : `rgba(250,250,250,1)`
            ctx.fillRect(x,y,size,size)
            ctx.lineWidth = 2
            ctx.strokeStyle = `rgba(180,180,180,1)`
            ctx.strokeRect(x,y,size,size)
            
            //Draw the die shading
            ctx.lineWidth = 1
            ctx.strokeStyle = `rgba(250,250,250,1)`
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x+size,y)
            ctx.lineTo(x+size,y+size)
            ctx.stroke()
            ctx.strokeStyle = `rgba(50,50,50,1)`
            ctx.beginPath()
            ctx.moveTo(x+size,y+size)
            ctx.lineTo(x,y+size)
            ctx.lineTo(x,y)
            ctx.stroke()
            
            //Function to draw dots
            const dot = ( args ) => {
                var [ dx, dy, dr ] = args
                //Draw the circle
                ctx.fillStyle = `rgba(50,50,50,1)`
                ctx.beginPath()
                ctx.arc(dx,dy,dr,0,2*Math.PI)
                ctx.closePath()
                ctx.fill()
                //Draw the highlight
                ctx.lineWidth = 1
                ctx.strokeStyle = `rgba(250,250,250,0.8)`
                ctx.beginPath()
                ctx.arc(dx,dy,dr-1.5,1,Math.PI)
                ctx.stroke()
            }

            //Dot location definitions
            const middle = {
                top : [ x+(size/2),y+(pad*2),size/10 ],
                center: [ x+(size/2),y+(size/2),size/10 ],
                bottom: [ x+(size/2),y+size-(pad*2),size/10 ]
            }
            const left = {
                top: [ x+(pad*2),y+(pad*2),size/10 ],
                center: [ x+(pad*2),y+(size/2),size/10 ],
                bottom: [ x+(pad*2),y+size-(pad*2),size/10 ]
            }
            const right = {
                top: [ x+size-(pad*2),y+(pad*2),size/10 ],
                center: [ x+size-(pad*2),y+(size/2),size/10 ],
                bottom: [ x+size-(pad*2),y+size-(pad*2),size/10 ]
            }

            //Draw the dots for this die's value
            switch( result[i] ) {
                case 1:
                    dot( middle.center )
                    break
                case 2:
                    dot( left.top )
                    dot( right.bottom )
                    break
                case 3:
                    dot( left.top )
                    dot( middle.center )
                    dot( right.bottom )
                    break
                case 4:
                    dot( left.top )
                    dot( right.top )
                    dot( left.bottom )
                    dot( right.bottom )
                    break
                case 5:
                    dot( left.top )
                    dot( right.top )
                    dot( middle.center )
                    dot( left.bottom )
                    dot( right.bottom )
                    break
                case 6:
                    dot( left.top )
                    dot( right.top )
                    dot( left.center )
                    dot( right.center )
                    dot( left.bottom )
                    dot( right.bottom )
                    break
                case 7:
                    dot( left.top )
                    dot( right.top )
                    dot( left.center )
                    dot( middle.center )
                    dot( right.center )
                    dot( left.bottom )
                    dot( right.bottom )
                    break
                case 8:
                    dot( left.top )
                    dot( right.top )
                    dot( left.center )
                    dot( middle.top )
                    dot( middle.bottom )
                    dot( right.center )
                    dot( left.bottom )
                    dot( right.bottom )
                    break
                case 9:
                    dot( left.top )
                    dot( right.top )
                    dot( left.center )
                    dot( middle.top )
                    dot( middle.center )
                    dot( middle.bottom )
                    dot( right.center )
                    dot( left.bottom )
                    dot( right.bottom )
                    break
                default:
                    //If value is greater than 9 - just draw the integer value
                    ctx.textAlign = 'center'
                    ctx.font = `bold 20px Sans`
                    ctx.fillText(result[i], x+(size/2), y+(size/2)+8)
            }
            
            //Go to next die position
            x += size+pad
        }
               
        //Return an image buffer
        return canvas.toBuffer()

    }
}

//Export the Dice and Die classes
module.exports = { Dice, Die }
