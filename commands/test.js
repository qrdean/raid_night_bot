import {
  insertIntoEvent,
  getEventById,
  getEventsByGuildId,
  updateEvent,
  deleteDeadEvents,
  addUserIds,
} from '../mongo/db_event_functions'
import { Message } from 'discord.js'
import moment from 'moment'
import { EventClass } from '../mongo/event_constructor'
import { checkUserRole } from '../utils/permissionsUtils'
export const name = 'test'
export const description = 'test mongodb'
export const cooldown = 5
/**
 *
 * @param {Message} message
 */
export function execute(message) {
  console.log(message.author.id)
  console.log(checkUserRole(message.guild.member(message.author), 'Moderator'))
}
