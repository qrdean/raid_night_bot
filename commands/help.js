import { prefix } from '../config.json'

export const name = 'help'
export const description =
  'List all of my commands or info about a specific command.'
export const aliases = ['commands']
export const usage = '[command name]'
export const cooldown = 5
export function execute(message, args) {
  const { commands } = message.client
  const data = []
  if (!args.length) {
    data.push("Here's a list of all my commands:")
    data.push(commands.map((command) => command.name).join(', '))
    data.push(
      `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
    )
  } else {
    if (!commands.has(args[0])) {
      return message.reply("that's not a valid command!")
    }
    const command = commands.get(args[0])
    data.push(`**Name:** ${command.name}`)
    if (command.description)
      data.push(`**Description:** ${command.description}`)
    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`)
    if (command.usage)
      data.push(`**Usage** ${prefix}${command.name} ${command.usage}`)
    data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`)
  }
  message.author
    .send(data, { split: true })
    .then(() => {
      if (message.channel.type !== 'dm') {
        message.channel.send("I've sent you a DM with all my commands!")
      }
    })
    .catch(() => message.reply("it seems like I can't DM you!"))
}
