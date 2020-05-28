import mongoose from 'mongoose'

const Schema = mongoose.Schema

const EventSchema = new Schema(
  {
    guildId: Number,
    eventName: String,
    description: String,
    userIds: [Number],
    eventTimestamp: Date,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

export const EventModel = mongoose.model('EventModel', EventSchema)
