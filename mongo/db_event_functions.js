import mongoose from 'mongoose'
import moment from 'moment'
import { EventModel } from './models/event'
import { connectToDatabase } from './db'

/**
 * guildId: Number,
 * description: string,
 * eventName: String,
 * userIds: [Number],
 * eventTimestamp: Date, -UTC
 *
 * @param {*} eventObject
 * @returns {Promise<any>}
 */
export function insertIntoEvent(eventObject) {
  return connectToDatabase().then(() => {
    const event_instance = new EventModel(eventObject)
    return event_instance.save()
  })
}

/**
 *
 * @param {number} id
 * @returns {Promise<any>}
 */
export function getEventById(id) {
  return connectToDatabase().then(() => {
    const Event = EventModel
    return Event.findById(id).exec()
  })
}

/**
 *
 * @param {number} guildId
 * @returns {Promise<any>}
 */
export function getEventsByGuildId(guildId) {
  return connectToDatabase().then(() => {
    const Event = EventModel
    return Event.find({ guildId: guildId }).exec()
  })
}

/**
 *
 * @param {number} id
 * @param {EventObject} updateEventObject
 * @returns {Promise<any>}
 */
export function updateEvent(id, updateEventObject) {
  return connectToDatabase().then(() => {
    const Event = EventModel
    return Event.findByIdAndUpdate(id, updateEventObject).exec()
  })
}

/**
 *
 * @param {Number} id
 * @param {String[]} userIds
 * @returns {Promise<any>}
 */
export function addUserIds(id, userIds) {
  const Event = EventModel
  return connectToDatabase().then(() => {
    const addToSet = { $addToSet: { userIds: userIds } }
    return Event.findByIdAndUpdate(id, addToSet).exec()
  })
}

/**
 *
 * @param {number} id
 * @returns {Promise<any>}
 */
export function deleteEventById(id) {
  return connectToDatabase().then(() => {
    const Event = EventModel
    return Event.findById(id, null).deleteOne().exec()
  })
}

/**
 *
 * @returns {Promise<any>}
 */
export function deleteDeadEvents() {
  return connectToDatabase().then(() => {
    const older_than = moment().toDate()
    const Event = EventModel
    return Event.find({ eventTimestamp: { $lt: older_than } })
      .deleteMany()
      .exec()
  })
}
