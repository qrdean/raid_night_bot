import { MessageEmbed, RichEmbed, Channel, Message } from 'discord.js'
import {
  handleInCase,
  formatMomentToString,
  handleAtOnCase,
  handleTomorrowCase,
} from '../utils/timeUtils'
import { EventClass } from '../mongo/event_constructor'
import { insertIntoEvent, addUserIds } from '../mongo/db_event_functions'
import { checkUserRole, checkUserPermissions } from '../utils/permissionsUtils'

const CHECKBOX = '✅'
// set this at a top level of the bot
// 12 hrs to Respond to an event
const EVENT_RESPONSE_TIME = '43200000'
const PREPOSITION_LIST = ['in', 'at', 'on', 'tomorrow']
export const name = 'schedule'
export const description = 'Schedule a time to play with your buds!'
export const usage =
  'with "in", "at", "on" or "tomorrow" to make a time. Example: !schedule Rocket League at 5 PM on Friday'
export const args = true
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
  if (args.length === 0) {
    // No arguments passed
    return message.channel.send(
      'No arguments passed. Description: ' + description
    )
  }

  const { eventName, eventMessage, eventTime } = scheduleParamsParser(params)

  const eventClass = new EventClass(
    message.channel.guild.id,
    eventName,
    eventMessage,
    [],
    eventTime.toDate()
  )

  insertIntoEvent(eventClass.toObject())
    .then((res) => {
      // SUCCESS
      createEventMessage(message, eventName, eventMessage, res._id)
    })
    .catch((err) => {
      // FAIL
      console.error(err)
      message.channel.send('An Error Occurred Creating the Event')
    })
}

/**
 *
 * @param {Message} message
 * @param {String} eventName
 * @param {String} eventMessage
 * @param {Number} eventId
 */
async function createEventMessage(message, eventName, eventMessage, eventId) {
  const embed = new RichEmbed()
    .setTitle(`Event "${eventName}" Created`)
    .setAuthor(message.author.tag, message.author.displayAvatarURL)
    .setColor(0xff0000)
    .setDescription(eventMessage)

  const embedMessageToUser = new RichEmbed()
    .setTitle(`Event "${eventName}"`)
    .setColor(0xff0000)
    .setDescription(eventMessage)

  const msg = await message.channel.send(embed)
  await msg.react(CHECKBOX)
  let keepCalling = true
  setTimeout(() => {
    keepCalling = false
  }, EVENT_RESPONSE_TIME)
  // eslint-disable-next-line prefer-const
  let currentAttendeeIds = []

  while (keepCalling) {
    try {
      const reactionFilter = (reaction, user) =>
        [CHECKBOX].includes(reaction.emoji.name) && !user.bot
      const reactions = await msg.awaitReactions(reactionFilter, {
        time: 1000,
      })
      const choice = reactions.get(CHECKBOX)
      if (choice && choice.emoji.name === CHECKBOX) {
        addUserToMessage(
          embed,
          embedMessageToUser,
          msg,
          choice.users,
          currentAttendeeIds,
          eventId
        )
      }
    } catch (err) {
      console.error(err)
    }
  }
}

/**
 *
 * @param {RichEmbed} embedMessage
 * @param {RichEmbed} embedMessageToUser
 * @param {Message} message
 * @param {Collection<string, User>} users
 * @param {any[]} currentAttendeeIds
 * @param {Number} eventId
 */
function addUserToMessage(
  embedMessage,
  embedMessageToUser,
  message,
  users,
  currentAttendeeIds,
  eventId
) {
  if (embedMessage.fields) {
    embedMessage.fields = []
  }
  console.log(users)
  const userList = users.filter(
    (user) => !user.bot && !currentAttendeeIds.includes(user.id)
  )
  const userIds = userList.map((userObj) => userObj.id)
  console.log(userIds)
  const userNameList = userList.map((userObj) => userObj.username)

  currentAttendeeIds = currentAttendeeIds.concat(userIds)
  embedMessage.addField('Attendees', userNameList, false)

  addUserIds(eventId, userIds)
    .then((res) => {
      message.edit(embedMessage)
      userList.forEach((user) => {
        user.send(embedMessageToUser)
      })
    })
    .catch((err) => {
      message.author.send(
        'An error occurred adding users to the Event. Please contact the Admin of Raid Bot'
      )
      console.error(err)
    })
}

/**
 * Takes the parameters from the message creator and tries to figure it out
 * @param {String[]} params
 */
function scheduleParamsParser(params) {
  // a list of prepositions to find
  // Should seperate out into two sections
  // Event Name || Time
  let firstPart = []
  let secondPart = []
  let thirdPart = []
  let firstPrep = null
  let secondPrep = null
  let foundFirstPrep = false
  let index1 = null
  let index2 = null
  for (const prep of PREPOSITION_LIST) {
    const index = params.indexOf(prep)
    if (index > -1) {
      if (foundFirstPrep) {
        index2 = index
        if (index2 < index1) {
          const temp = index2
          index2 = index1
          index1 = temp
        }
      } else {
        index1 = index
        foundFirstPrep = true
      }
    }
  }
  if (index2 !== null) {
    firstPrep = params[index1]
    secondPrep = params[index2]
    firstPart = params.slice(0, index1)
    secondPart = params.slice(index1 + 1, index2)
    thirdPart = params.slice(index2 + 1, params.length)
  } else {
    firstPrep = params[index1]
    firstPart = params.slice(0, index1)
    secondPart = params.slice(index1 + 1, params.length)
  }
  firstPart = firstPart.join(' ')
  // Join this with space
  switch (firstPrep) {
    /**
     * Programmatically ->
     * firstPart + firstPrep + secondPart[0] + secondPart[1]
     * OR
     * ...+ thirdPart[0] + thirdPart[1]?
     * e.g.
     *  !schedule $gameName in 2 Days
     *  !schedule $gameName in 4 hours
     *  !schedule $gameName in 1 Week
     *  !schedule $gameName in 2 Days at 5:00 PM
     */
    case 'in':
      if (secondPrep && secondPrep === 'at') {
        const time = handleInCase(secondPart[0], secondPart[1], thirdPart)
        const returnObject = {
          eventName: firstPart,
          eventMessage: formatMomentToString(time),
          eventTime: time,
        }
        return returnObject
      } else {
        // secondPart[0] is a number ** secondPart[1] is type
        const time = handleInCase(secondPart[0], secondPart[1], null)
        const returnObject = {
          eventName: firstPart,
          eventMessage: formatMomentToString(time),
          eventTime: time,
        }
        return returnObject
      }
      // Specify time from Current Date/Time. Minutes. Hours. Days. Weeks. Months.
      // Can be followed by 'at'
      break
    /**
     * e.g.
     *  !schedule $gameName at 6 PM
     *  !schedule $gameName at 10:00 on Monday
     *  !schedule $gameName at 7:30 PM on 5/23
     *  !schedule $gameName at 7 PM on 5-23
     */
    case 'at':
      if (secondPrep && secondPrep === 'on') {
        const time = handleAtOnCase(thirdPart[0], secondPart)
        const returnObject = {
          eventName: firstPart,
          eventMessage: formatMomentToString(time),
          eventTime: time,
        }
        return returnObject
      } else {
        const time = handleAtOnCase(null, secondPart)
        const returnObject = {
          eventName: firstPart,
          eventMessage: formatMomentToString(time),
          eventTime: time,
        }
        return returnObject
      }

      // Specify a specific time e.g. 6 PM. could be followed by an 'on' some Day or Date
      break
    /**
     * e.g.
     *  !schedule $gameName on Thurday
     *  !schedule $gameName on 5/23
     *  !schedule $gameName on Friday at 9:30 PM
     *  !schedule $gameName on 5/30 at 9 PM
     */
    case 'on':
      if (secondPrep && secondPrep === 'at') {
        const time = handleAtOnCase(secondPart[0], thirdPart)
        const returnObject = {
          eventName: firstPart,
          eventMessage: formatMomentToString(time),
          eventTime: time,
        }
        return returnObject
      } else {
        const time = handleAtOnCase(secondPart[0], null)
        const returnObject = {
          eventName: firstPart,
          eventMessage: formatMomentToString(time),
          eventTime: time,
        }
        return returnObject
      }
      // Specifies a day or date e.g. Monday or 5/26. Usually followed by an 'at' to specify time
      break
    case 'tomorrow':
      /**
       * e.g.
       *  !schedule $gamename tomorrow
       *  !schedule $gameName tomorrow at 5 PM
       *  !schedule $gameName tomorrow at 10:30 PM
       */
      if (secondPrep && secondPrep === 'at') {
        const time = handleTomorrowCase(thirdPart)
        const returnObject = {
          eventName: firstPart,
          eventMessage: formatMomentToString(time),
          eventTime: time,
        }
        return returnObject
      } else {
        const time = handleTomorrowCase(null)
        const returnObject = {
          eventName: firstPart,
          eventMessage: formatMomentToString(time),
          eventTime: time,
        }
        return returnObject
      }
    default:
      console.error('error no preps found')
      return null
      break
  }
}
