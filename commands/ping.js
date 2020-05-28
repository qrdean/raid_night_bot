export const name = 'ping'
export const description = 'Ping!'
export const cooldown = 5
export function execute(message) {
  message.channel.send('Pong.')
}
