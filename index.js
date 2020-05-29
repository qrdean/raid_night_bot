import { readdirSync } from 'fs'
import { Client, Collection } from 'discord.js'
import { prefix } from './config.json'
import { token } from './.config.json'
import { logger } from './utils/logger'

const CHANNEL_IDS = ['713105583485747230']

const client = new Client()
client.commands = new Collection()
const cooldowns = new Collection()
const commandFiles = readdirSync('./commands')

commandFiles.map((file) => {
  const command = require(`./commands/${file}`)

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command)
})

client.on('ready', () => {
  logger.info('Ready!', { service: 'index.js' })
})

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return

  if (!CHANNEL_IDS.includes(message.channel.id)) return

  const args = message.content.slice(prefix.length).split(/ +/)
  const commandName = args.shift().toLowerCase()

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    )

  if (!command) return

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply("I can't execute that command inside DMs!")
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments. ${message.author}!`

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
    }

    return message.channel.send(reply)
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command.name)
  const cooldownAmount = (command.cooldown || 3) * 1000

  if (!timestamps.has(message.author.id)) {
    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
  } else {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      )
    }

    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
  }

  try {
    command.execute(message, args)
  } catch (error) {
    logger.error(error)
    message.reply('there was an error trying to execute that command!')
  }
})

client.login(token)
