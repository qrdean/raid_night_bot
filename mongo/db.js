import mongoose from 'mongoose'
import { mongodbConnection } from '../.config.json'
mongoose.Promise = global.Promise
let isConnected

export function connectToDatabase() {
  if (isConnected) {
    console.log('=> using existing database connection')
    return Promise.resolve()
  }

  console.log('=> using new database connection')
  return mongoose
    .connect(mongodbConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then((db) => {
      isConnected = db.connections[0].readyState
    })
}
