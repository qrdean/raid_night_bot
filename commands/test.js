import {
  insertIntoEvent,
  getEventById,
  getEventsByGuildId,
  updateEvent,
  deleteDeadEvents,
  addUserIds,
} from '../mongo/db_event_functions'
import moment from 'moment'
import { EventClass } from '../mongo/event_constructor'
export const name = 'test'
export const description = 'test mongodb'
export const cooldown = 5
export function execute(message) {
  console.log(message.channel.guild.id)
  const eventClass = new EventClass(
    message.channel.guild.id,
    'Event Name',
    'Event Message',
    [],
    moment().toDate()
  )
  console.log(eventClass)
  eventClass.addUserIds([123, 456])
  console.log(eventClass.toObject())
  eventClass.removeUserId(123)
  console.log(eventClass.toObject())
  const eventCollectionObject = {
    guildId: message.channel.guild.id,
    eventName: 'eventName',
    description: 'eventMessage',
    userIds: [],
    eventTimestamp: moment().toDate(),
  }
  console.log(eventCollectionObject)
  // const eventObject = {
  //   guildId: '111',
  //   eventName: 'Test Update Event',
  //   description: 'testing update event mongoose',
  //   userIds: [237419517272129536, 395682605900496896, 456],
  //   eventTimestamp: moment().toDate(),
  // }
  const userIdToAdd = [456, 91234, 901823, 881873]
  getEventsByGuildId(110)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.error
    })
}
