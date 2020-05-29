import { Message, RichEmbed } from 'discord.js'
import {
  getEventsByGuildId,
  updateEvent,
  getEventById,
} from '../mongo/db_event_functions'
import { formatMomentToString, handleUpdateCase } from '../utils/timeUtils'
import { checkUserPermissions } from '../utils/permissionsUtils'
const KEYWORDS = ['time', 'date', 'name']
export const name = 'update'
export const description =
  'Updates this event. Updating the time will send messages to the attendees with the new time'
export const usage =
  'Moderators can edit the time, date and name of an event Keywords: time | date | name followed by the intended change'
export const cooldown = 5

/**
 *
 * @param {Message} message
 * @param {String[]} params
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

  const updateObject = await updateParamParser(params)

  if (updateObject !== null) {
    updateEvent(params[0], updateObject)
      .then((res) => {
        let changeMessage = null
        if (updateObject.description) {
          changeMessage = buildUpdateEmbedMessage(
            res.eventName,
            updateObject.description,
            'eventTime'
          )
          sendMessageToUsers(res, message, changeMessage)
        } else if (updateObject.eventName) {
          changeMessage = buildUpdateEmbedMessage(
            res.eventName,
            updateObject.eventName,
            'nameChange'
          )
        } else {
          changeMessage = 'No Changes occurred'
        }
        return message.channel.send(changeMessage)
      })
      .catch((err) => {
        return message.channel.send('Error')
      })
  }
}

/**
 *
 * @param {String[]} params
 */
async function updateParamParser(params) {
  let firstPart = []
  let secondPart = []
  let key = null
  let time
  let eventMessage
  for (const keyword of KEYWORDS) {
    const index = params.indexOf(keyword)
    if (index > -1) {
      key = params[index]
      firstPart = params.slice(0, index)
      secondPart = params.slice(index + 1, params.length)
    }
  }

  if (key) {
    switch (key) {
      case 'time':
        return getEventById(firstPart[0])
          .then((res) => {
            if (res) {
              time = handleUpdateCase(res.eventTimestamp, secondPart, key)
              eventMessage = formatMomentToString(time)
              return {
                description: eventMessage,
                eventTimestamp: time.toDate(),
              }
            } else {
              return null
            }
          })
          .catch((err) => {
            logger.error(err)
            return null
          })
        break
      case 'date':
        return getEventById(firstPart[0])
          .then((res) => {
            if (res) {
              time = handleUpdateCase(res.eventTimestamp, secondPart[0], key)
              eventMessage = formatMomentToString(time)
              return {
                description: eventMessage,
                eventTimestamp: time.toDate(),
              }
            } else {
              return null
            }
          })
          .catch((err) => {
            logger.error(err)
            return null
          })
        break
      case 'name':
        if (secondPart[0].toLowerCase() === 'to') {
          secondPart.slice(1, secondPart.length)
          return { eventName: secondPart.join(' ') }
        } else {
          return { eventName: secondPart.join(' ') }
        }
        break
    }
  } else {
    return null
  }
}

/**
 *
 * @param {Object} res
 * @param {Message} message
 * @param {RichEmbed} changeMessage
 */
function sendMessageToUsers(res, message, changeMessage) {
  res.userIds.forEach((id) => {
    if (message.guild.members.get(id)) {
      message.guild.members.get(id).user.send(changeMessage)
    }
  })
}

/**
 *
 * @param {String} eventName
 * @param {String} content
 * @param {String} type
 */
function buildUpdateEmbedMessage(eventName, content, type) {
  const embed = new RichEmbed()
    .setTitle(`Event "${eventName}" Changed`)
    .setColor(0xff0000)
  if (type === 'nameChange') {
    embed.setDescription(`${eventName} changed to => ${content}`)
  } else if (type === 'eventTime') {
    embed.setDescription(content)
  }
  return embed
}
