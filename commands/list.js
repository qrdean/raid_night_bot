import { Message, RichEmbed } from 'discord.js'
import { getEventsByGuildId } from '../mongo/db_event_functions'
import { logger } from '../utils/logger'

export const name = 'list'
export const description = 'Sends the user a list of Events in this server'
export const cooldown = 5

/**
 *
 * @param {Message} message
 */
export async function execute(message) {
  getEventsByGuildId(message.guild.id)
    .then((res) => {
      const formattedMessage = formatMessage(res, message)
      return message.author.send(formattedMessage)
    })
    .catch((err) => {
      logger.error(err)
    })
}

/**
 *
 * @param {Object[]} dbResponse
 * @param {Message} message
 * @returns {RichEmbed}
 */
function formatMessage(dbResponse, message) {
  const embed = new RichEmbed().setTitle(
    `Upcoming Events in ${message.guild.name}`
  )

  dbResponse.forEach((eventObject) => {
    embed.addField('Event Name', eventObject.eventName, true)
    embed.addField('Event ID', eventObject._id, true)
    embed.addField('Event Time', eventObject.description, false)

    if (eventObject.userIds && eventObject.userIds.length > 0) {
      const guildMembers = message.guild.members.filter((guildMember) => {
        return eventObject.userIds.includes(guildMember.user.id)
      })
      const userNames = guildMembers.map((member) => member.user.username)
      embed.addField('Attendees', userNames, false)
    }
  })

  return embed
}
