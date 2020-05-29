import { Message, RichEmbed } from 'discord.js'
import { getEventById, deleteEventById } from '../mongo/db_event_functions'
import { checkUserPermissions } from '../utils/permissionsUtils'
import { logger } from '../utils/logger'

export const name = 'delete'
export const description = 'Deletes the specified event by the event id'
export const args = true
export const cooldown = 5

/**
 *
 * @param {Message} message
 */
export async function execute(message, params) {
  const schedulePermissions = ['MANAGE_CHANNELS']
  if (
    !checkUserPermissions(
      message.guild.member(message.author),
      schedulePermissions
    )
  ) {
    return message.reply(
      ` you do not have permission to use the !${name} command`
    )
  }

  if (args.length === 0) {
    // No arguments passed
    return message.channel.send(
      'No arguments passed. Please pass in an event id'
    )
  }

  const eventName = await getEventById(params[0])
    .then((res) => {
      return res.eventName
    })
    .catch((err) => {
      logger.error(err)
    })

  deleteEventById(params[0])
    .then((res) => {
      message.channel.send(`Event ${eventName} has been deleted`)
    })
    .catch((err) => {
      logger.error(err)
      message.channel.send(`Event deletion failed`)
    })
}
