import winston from 'winston'

function getLabel(callingModule) {
  const parts = callingModule.filename.split('/')
  return parts[parts.length - 2] + '/' + parts.pop()
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.colorize(),
    winston.format.align(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(
      (info) =>
        `${info.timestamp} - ${info.service} - ${info.level}: ${info.message}`
    )
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: './logs/raid-bot.log' }),
    new winston.transports.Console({
      level: 'info',
    }),
  ],
})
