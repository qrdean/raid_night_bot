import mongoose from 'mongoose'
import { mongodbConnection } from '../.config.json'
import { logger } from '../utils/logger'
mongoose.Promise = global.Promise
let isConnected

/**
 *
 */
export function connectToDatabase() {
  if (isConnected) {
    logger.info('=> using existing database connection')
    return Promise.resolve()
  }

  logger.info('=> using new database connection')
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
