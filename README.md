# Installation

## Install nodejs (runtime environment)

- Windows: https://nodejs.org/dist/v12.16.2/node-v12.16.2-x86.msi
- All Nodejs downloads: https://nodejs.org/en/download/

## Install bot

1. Unzip the bot to it's own folder
2. In command prompt, navigate to new bot folder
3. To install dependencies, run: `npm install`



# Setup 

## Create a new bot user 

See: https://discordpy.readthedocs.io/en/latest/discord.html

At step #7, copy your token and paste it into config.json

Note: If you set as "private bot", you will be the only one who can invite anywhere.

- If you are not server owner or no permissions to invite yourself - set as apublic bot until the owner invites it into server ... then set back to private.
- If you want anyone to be able to invite the bot, just leave it as a public bot


## Edit defaults 

Config also contains the the prefix and some default values

- Note: prefic can be anything (must be at least 1 character)
- Note: the timeout is in milliseconds ... 120000 == 2 minutes



# Runtime

## Start 

1. In command prompt, navigate to new bot folder
2. Start the bot with `node index.js`
3. Copy the invite url from startup sequence and paste into browser
4. Invite to whichever server (pass link to server owner if you don't have manage permissions)

## Stop

- To break out of a running bot process, press Ctrl+C in command prompt
- If you get it stuck in the background, can close it through process manager

