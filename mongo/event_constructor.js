/**
 *
 * @param {Number} guildId
 * @param {String} eventName
 * @param {String} description
 * @param {String[]} userIds
 * @param {Date} eventTimestamp
 */
export class EventClass {
  constructor(guildId, eventName, description, userIds, eventTimestamp) {
    ;(this._guildId = guildId),
      (this._eventName = eventName),
      (this._description = description),
      (this._userIds = userIds),
      (this._eventTimestamp = eventTimestamp)
  }
  set guildId(guildId) {
    this._guildId = guildId
  }
  get guildId() {
    return this._guildId
  }
  set eventName(eventName) {
    this._eventName = eventName
  }
  get eventName() {
    return this._eventName
  }
  set description(description) {
    this._description = description
  }
  get description() {
    return this._description
  }
  set userIds(userIds) {
    this._userIds = userIds
  }
  get userIds() {
    return this._userIds
  }
  set eventTimestamp(eventTimestamp) {
    this._eventTimestamp = eventTimestamp
  }
  get eventTimestamp() {
    return this._eventTimestamp
  }

  /**
   *
   * @param {String[]} userIds
   */
  addUserIds(userIds) {
    this._userIds = this._userIds.concat(userIds)
  }
  /**
   *
   * @param {String} userId
   */
  removeUserId(userId) {
    this._userIds = this._userIds.filter((id) => id !== userId)
  }

  toObject() {
    return {
      guildId: this._guildId,
      eventName: this._eventName,
      description: this._description,
      userIds: this._userIds,
      eventTimestamp: this.eventTimestamp,
    }
  }
}
