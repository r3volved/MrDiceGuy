//Get the config file and pull out all the config items
var { TIMEOUT, NUMDIC, NUMSIDES, REROLL, token, prefix } = require(`${__dirname}/config.json`)

//This will hold the bot's invite link after it connects to Discord
var invite = ""

//Get the discord library and initialize a new client
const Discord = require('discord.js')
const client  = new Discord.Client()

//Get the dice and die libraries
const { Dice, Die } = require(`${__dirname}/Dice.js`)

//This will be used to track user's and their specific dice
//Users will be keyed by their discordId
const users = {}

//Remove a user from the users list
const clearUser = ( id ) => {
    //Clear the user's timeout before removing
    if( users[id] ) clearTimeout( users[id].timout ) 
    return delete users[id]
}

//Reset the user's timeout back to max
const resetUser = ( id ) => {
    //Clear the user's current timeout
    if( users[id] ) clearTimeout( users[id].timout ) 
    //Reapply a new timeout with default TIMEOUT time (ms)
    return users[id] ? users[id].timeout = setTimeout(() => clearUser(id), TIMEOUT) : null
}

//Reply function to send dice-embed-message to discord
//After message sent to user, reset the user's timeout
const reply = ( message, user, old ) => message.channel
    .send({ embed:{
        files:[{ attachment:user.dice.draw( old ), name:`dice_roll.png` }],
        image:{ url:`attachment://dice_roll.png` },
        author:{ 
            name:message.member.displayName,
            icon_url:message.author.displayAvatarURL
        },
        description:[
            `Rolled: ${user.dice.values().join(", ")}`,
            `Sum: ${user.dice.sum()}`,
            '```',
            user.dice.result().join(" "),
            '```',
        ].join("\n"),
        footer:{ text:"I'm a shittybot" },
        timestamp:new Date(),        
    } })
    .then(() => resetUser(message.author.id))

//Function to handle re-roll
const rerollDice = async ( message ) => {
    const content = message.content.split(/\s+/)
    //If message contains "help" send help instead
    if( content.includes('help') ) 
        return message.channel.send({ embed:{
            title:'Dice help - Reroll',
            description:[
                `Reroll dice : \`${prefix}rr\``,
                '-----',
                `Your dice session will timeout after ${TIMEOUT/60000} minutes of inactivity`,
                '```',
                `${prefix}rr`,
                '```',
            ].join("\n"),
            footer:{ text:"I'm a shittybot" },
            timestamp:new Date(),
        } })

    //If no user found, roll new dice instead
    var user = users[message.author.id]
    if( !user ) return rollDice( message )

    //Get lower limit from input, or from config default (if no input)
    var below = Number(content.find(c => Number(c))) || REROLL
    
    //Reroll the user's dice below the lower limit
    user.dice.reroll( below )
    
    //Send reply to discord
    return reply( message, user )
}

const rollDice = async ( message ) => {
    const content = message.content.split(/\s+/)
    //If message contains "help" send help instead
    if( content.includes('help') ) 
        return message.channel.send({ embed:{
            title:'Dice help - Roll',
            description:[
                `Roll dice : \`${prefix}r\``,
                `Roll n-dice : \`${prefix}r [n]\``,
                `Roll n-dice with s-sides : \`${prefix}r [n] s=[s]\``,
                '-----',
                `Your dice session will timeout after ${TIMEOUT/60000} minutes of inactivity`,
                `Number of dice or sides will last until reset or timeout`,
                '```',
                `${prefix}r`,
                `${prefix}r 4`,
                `${prefix}r 2 s=16`,
                '```',
            ].join("\n"),
            footer:{ text:"I'm a shittybot" },
            timestamp:new Date(),
        } })

    //Get the user, or create a blank one if none found
    var user = users[message.author.id] || {}

    //Get the number of dice for user - if no input and no previous dice, use config default
    var numDice = content.find(c => c.startsWith('d='))
        ? Number(content.find(c => c.startsWith('d=')).split(/\=/)[1])
        : Number(content.find(c => Number(c))) || ((user.dice||[]).dice||[]).length || NUMDICE
    
    //Get the number of sides per die - if no input and no previous dice, use config default
    var numSides = content.find(c => c.startsWith('s=')) 
        numSides = numSides ? Number(numSides.split(/\=/)[1]) : (user.dice||{}).sides || NUMSIDES

    if( !user.dice ) {
        //If no existing user dice, create new dice
        user = users[message.author.id] = {
            dice: new Dice( numDice, numSides )
        }
    } else {
        //If num dice or num sides differs from existing user, create new dice
        if( numDice !== user.dice.dice.length || numSides !== user.dice.sides ) 
            user.dice = new Dice( numDice, numSides )
    }

    //Roll all this user's dice
    user.dice.roll()
    
    //Send reply to discord
    return reply( message, user )
}


//Discord "Ready" event handler
//This function fires when the discord client connects to discord
client.on('ready', () => {
    //Set the invite link
    invite = `https:\/\/discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=515136`
    //Report startup
    console.log("DISCORD",`Logged in as ${client.user.tag}`, process.pid)
    console.log("DISCORD",`Member of ${client.guilds.size} guilds`, process.pid)
    console.log("DISCORD",invite, process.pid)
    //Set the user activity to "[prefix]help" so people can easily see usage
    client.user.setActivity(`${prefix}help`, { type: 'LISTENING' }).catch(console.error)
})

//Discord "Message" event handler
//This function fires everytime the discord client see's a new message
client.on('message', message => {

    //Skip messages from other bots
    //Note: We almost always want to skip other bots or they could cause infinite looping    
    if( message.author.bot ) return
    //Skip messages that don't start with our prefix
    if( !message.content.startsWith(prefix) ) return
        
    try {
        //Parse the command from the message
        var command = message.content.slice(prefix.length).split(/\s+/)[0]
        //Route to proper function by command
        switch( command.toLowerCase() ) {
            case "i":     return message.channel.send(`Invite Mr.Dice Guy : ${invite}`)
            case "r":     return rollDice( message )
            case "rr":    return rerollDice( message )
            case "reset": return clearUser(message.author.id)
            case "me":    return users[message.author.id] 
                ? reply( message, users[message.author.id], true )
                : message.reply(`You don't have any dice - roll with ${prefix}r`)
            
            //Default help menu if no command match
            default:      return message.channel
                .send({ embed:{
                    title:'Dice help',
                    description:[
                        `Your dice : \`${prefix}me\``,
                        `Roll dice : \`${prefix}r\``,
                        `Reroll dice : \`${prefix}rr\``,
                        `Invite me : \`${prefix}i\``,
                    ].join("\n"),
                    footer:{ text:"I'm a shittybot" },
                    timestamp:new Date(),
                } })
        }
    } catch(e) {
        //If something errors, log in console and reply to discord with error
        console.error(e)
        return message.reply(e.message)
    }

})

client.login(token)
