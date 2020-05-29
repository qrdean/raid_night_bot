import moment from 'moment'
import momentTimezone from 'moment-timezone'
// Eventually move this value to a db?

const DEFAULT_TIME_ZONE = 'America/Chicago'
momentTimezone.tz.setDefault(DEFAULT_TIME_ZONE)

/**
 * @param {Number} number
 * @param {String} type
 * @param {String[]} time
 */
export function handleInCase(number, type, time) {
  type = timeShortHandFormatter(type)
  const momentTime = moment().clone().seconds(0)
  if (time) {
    // eslint-disable-next-line prefer-const
    let [hour, minutes] = splitTime(time[0])
    hour = time[1] ? getHourAmPm(hour, time[1]) : hour
    momentTime.hour(hour).minutes(minutes)
  }
  momentTime.add(number, type)
  return momentTime
}

/**
 *
 * @param {String} date
 * @param {String[]} time
 */
export function handleAtOnCase(date, time) {
  const momentTime = moment().clone().seconds(0)
  const startTime = moment().clone().seconds(0)
  if (time) {
    // eslint-disable-next-line prefer-const
    let [hour, minutes] = splitTime(time[0])
    hour = time[1] ? getHourAmPm(hour, time[1]) : hour
    momentTime.hour(hour).minutes(minutes)
  }
  if (date) {
    const newDate = checkForDate(date)
    if (newDate) {
      // eslint-disable-next-line prefer-const
      const [month, day] = newDate
      momentTime.month(checkForMonthNum(month - 1)).date(day)
    } else {
      const weekdayNumber = checkForWeekday(date)
      if (weekdayNumber < momentTime.day()) {
        momentTime.day(weekdayNumber + 7)
      } else if (
        time &&
        weekdayNumber === momentTime.day() &&
        startTime.hour() > momentTime.hour()
      ) {
        momentTime.day(weekdayNumber + 7)
      } else if (
        time &&
        weekdayNumber === momentTime.hour() &&
        startTime.hour() === momentTime.hour() &&
        startTime.minutes() > momentTime.minutes()
      ) {
        momentTime.day(weekdayNumber + 7)
      } else if (
        time &&
        weekdayNumber === momentTime.hour() &&
        startTime.hour() === momentTime.hour() &&
        startTime.minutes() === momentTime.minutes()
      ) {
        momentTime.day(weekdayNumber + 7)
      } else {
        momentTime.day(weekdayNumber)
      }
    }
  } else if (time && startTime.hour() > momentTime.hour()) {
    momentTime.add(1, TIME_STRINGS.DAYS)
  } else if (
    time &&
    startTime.hour() === momentTime.hour() &&
    startTime.minute() > momentTime.minute()
  ) {
    momentTime.add(1, TIME_STRINGS.DAYS)
  }
  return momentTime
}

/**
 *
 * @param {String[]} time
 */
export function handleTomorrowCase(time) {
  const momentTime = moment().clone().seconds(0)
  if (time) {
    // eslint-disable-next-line prefer-const
    let [hour, minutes] = splitTime(time[0])
    hour = time[1] ? getHourAmPm(hour, time[1]) : hour
    momentTime.hour(hour).minutes(minutes)
  }
  momentTime.add(1, TIME_STRINGS.DAYS)
  return momentTime
}

/**
 *
 * @param {Date} currentEventTime
 * @param {String[] | String} data
 * @param {String} type
 */
export function handleUpdateCase(currentEventTime, data, type) {
  const momentTime = momentTimezone(currentEventTime).clone()
  const startTime = moment().clone().seconds(0)
  if (type === 'time') {
    if (data) {
      // eslint-disable-next-line prefer-const
      let [hour, minutes] = splitTime(data[0])
      hour = data[1] ? getHourAmPm(hour, data[1]) : hour
      momentTime.hour(hour).minutes(minutes)
    }
  } else if (type === 'date') {
    if (data) {
      const newDate = checkForDate(data)
      if (newDate) {
        // eslint-disable-next-line prefer-const
        const [month, day] = newDate
        momentTime.month(checkForMonthNum(month - 1)).date(day)
      } else {
        const weekdayNumber = checkForWeekday(data)
        if (weekdayNumber < momentTime.day()) {
          momentTime.day(weekdayNumber + 7)
        } else if (
          weekdayNumber === momentTime.day() &&
          startTime.hour() > momentTime.hour()
        ) {
          momentTime.day(weekdayNumber + 7)
        } else if (
          weekdayNumber === momentTime.hour() &&
          startTime.hour() === momentTime.hour() &&
          startTime.minutes() > momentTime.minutes()
        ) {
          momentTime.day(weekdayNumber + 7)
        } else if (
          weekdayNumber === momentTime.hour() &&
          startTime.hour() === momentTime.hour() &&
          startTime.minutes() === momentTime.minutes()
        ) {
          momentTime.day(weekdayNumber + 7)
        } else {
          momentTime.day(weekdayNumber)
        }
      }
    }
  }
  return momentTime
}

/**
 * Takes a moment event and then formats it for the Discord message
 * $time $zone on $Day, $Month $Day
 * @param {moment} momentTime
 */
export function formatMomentToString(momentTime) {
  return (
    momentTime.format('h:mm A') +
    ' ' +
    getTimeZoneAbbr() +
    ' on ' +
    momentTime.format('dddd, MMMM Do')
  )
}

/**
 *
 * @param {String} time
 */
function splitTime(time) {
  // eslint-disable-next-line prefer-const
  let [hour, minute] = time.split(':')
  if (minute === null || minute === undefined) {
    minute = 0
  }
  return [hour, minute]
}

/**
 *
 * @param {Number} hour
 * @param {String} type
 */
function getHourAmPm(hour, type) {
  if (type && type.toLowerCase() === 'am') {
    return hour
  } else if (type && type.toLowerCase() === 'pm') {
    return Number(hour) + 12
  }
}

/**
 * Takes a string and returns it in a format momentjs expects
 * @param {String} timeString
 */
function timeShortHandFormatter(timeString) {
  if (
    timeString &&
    (timeString.toLowerCase() === 'hr' ||
      timeString.toLowerCase() === 'hours' ||
      timeString.toLowerCase() === 'hour')
  ) {
    return TIME_STRINGS.HOURS
  }
  if (
    timeString &&
    (timeString.toLowerCase() === 'min' ||
      timeString.toLowerCase() === 'minute' ||
      timeString.toLowerCase() === 'minutes')
  ) {
    return TIME_STRINGS.MINUTES
  }
  if (
    timeString &&
    (timeString.toLowerCase() === 'day' || timeString.toLowerCase() === 'days')
  ) {
    return TIME_STRINGS.DAYS
  }
  if (
    timeString &&
    (timeString.toLowerCase() === 'mon' ||
      timeString.toLowerCase() === 'month' ||
      timeString.toLowerCase() === 'months')
  ) {
    return TIME_STRINGS.MONTHS
  }
}

/**
 *
 * @param {Number} monthNum
 */
function formatMonth(monthNum) {
  switch (monthNum) {
    case MONTH_ENUM.JANUARY:
      return (
        MONTH_STRINGS.JANUARY.charAt(0).toUpperCase() +
        MONTH_STRINGS.JANUARY.slice(1)
      )
    case MONTH_ENUM.FEBRUARY:
      return (
        MONTH_STRINGS.FEBRUARY.charAt(0).toUpperCase() +
        MONTH_STRINGS.FEBRUARY.slice(1)
      )
    case MONTH_ENUM.MARCH:
      return (
        MONTH_STRINGS.MARCH.charAt(0).toUpperCase() +
        MONTH_STRINGS.MARCH.slice(1)
      )
    case MONTH_ENUM.APRIL:
      return (
        MONTH_STRINGS.APRIL.charAt(0).toUpperCase() +
        MONTH_STRINGS.APRIL.slice(1)
      )
    case MONTH_ENUM.MAY:
      return (
        MONTH_STRINGS.MAY.charAt(0).toUpperCase() + MONTH_STRINGS.MAY.slice(1)
      )
    case MONTH_ENUM.JUNE:
      return (
        MONTH_STRINGS.JUNE.charAt(0).toUpperCase() + MONTH_STRINGS.JUNE.slice(1)
      )
    case MONTH_ENUM.JULY:
      return (
        MONTH_STRINGS.JULY.charAt(0).toUpperCase() + MONTH_STRINGS.JULY.slice(1)
      )
    case MONTH_ENUM.AUGUST:
      return (
        MONTH_STRINGS.AUGUST.charAt(0).toUpperCase() +
        MONTH_STRINGS.AUGUST.slice(1)
      )
    case MONTH_ENUM.SEPTEMBER:
      return (
        MONTH_STRINGS.SEPTEMBER.charAt(0).toUpperCase() +
        MONTH_STRINGS.SEPTEMBER.slice(1)
      )
    case MONTH_ENUM.OCTOBER:
      return (
        MONTH_STRINGS.OCTOBER.charAt(0).toUpperCase() +
        MONTH_STRINGS.OCTOBER.slice(1)
      )
    case MONTH_ENUM.NOVEMBER:
      return (
        MONTH_STRINGS.NOVEMBER.charAt(0).toUpperCase() +
        MONTH_STRINGS.NOVEMBER.slice(1)
      )
    case MONTH_ENUM.DECEMBER:
      return (
        MONTH_STRINGS.DECEMBER.charAt(0).toUpperCase() +
        MONTH_STRINGS.DECEMBER.slice(1)
      )
  }
}

/**
 *
 * @param {String} month
 */
function checkForMonth(month) {
  switch (month.toLowerCase()) {
    case MONTH_STRINGS.JANUARY:
      return MONTH_ENUM.JANUARY
    case MONTH_STRINGS.FEBRUARY:
      return MONTH_ENUM.FEBRUARY
    case MONTH_STRINGS.MARCH:
      return MONTH_ENUM.MARCH
    case MONTH_STRINGS.APRIL:
      return MONTH_ENUM.APRIL
    case MONTH_STRINGS.MAY:
      return MONTH_ENUM.MAY
    case MONTH_STRINGS.JUNE:
      return MONTH_ENUM.JUNE
    case MONTH_STRINGS.JULY:
      return MONTH_ENUM.JULY
    case MONTH_STRINGS.AUGUST:
      return MONTH_ENUM.AUGUST
    case MONTH_STRINGS.SEPTEMBER:
      return MONTH_ENUM.SEPTEMBER
    case MONTH_STRINGS.OCTOBER:
      return MONTH_ENUM.OCTOBER
    case MONTH_STRINGS.NOVEMBER:
      return MONTH_ENUM.NOVEMBER
    case MONTH_STRINGS.DECEMBER:
      return MONTH_ENUM.DECEMBER
  }
}

/**
 *
 * @param {Number} month
 */
function checkForMonthNum(month) {
  switch (month) {
    case MONTH_ENUM.JANUARY:
      return MONTH_ENUM.JANUARY
    case MONTH_ENUM.FEBRUARY:
      return MONTH_ENUM.FEBRUARY
    case MONTH_ENUM.MARCH:
      return MONTH_ENUM.MARCH
    case MONTH_ENUM.APRIL:
      return MONTH_ENUM.APRIL
    case MONTH_ENUM.MAY:
      return MONTH_ENUM.MAY
    case MONTH_ENUM.JUNE:
      return MONTH_ENUM.JUNE
    case MONTH_ENUM.JULY:
      return MONTH_ENUM.JULY
    case MONTH_ENUM.AUGUST:
      return MONTH_ENUM.AUGUST
    case MONTH_ENUM.SEPTEMBER:
      return MONTH_ENUM.SEPTEMBER
    case MONTH_ENUM.OCTOBER:
      return MONTH_ENUM.OCTOBER
    case MONTH_ENUM.NOVEMBER:
      return MONTH_ENUM.NOVEMBER
    case MONTH_ENUM.DECEMBER:
      return MONTH_ENUM.DECEMBER
  }
}

/**
 *
 * @param {Number} date
 */
function getPostDateFix(date) {
  const dateString = date.toString()
  if (dateString.endsWith('1')) {
    return 'st'
  } else if (dateString.endsWith('2')) {
    return 'nd'
  } else if (dateString.endsWith('3')) {
    return 'rd'
  } else {
    return 'th'
  }
}

function getTimeZoneAbbr() {
  return momentTimezone.tz([2020, 0], DEFAULT_TIME_ZONE).format('z')
}

/**
 * Checks for the date and splits it
 * @param {String} date
 */
function checkForDate(date) {
  const seperators = ['/', '-', ' ']
  for (const seperator of seperators) {
    if (date.includes(seperator)) {
      const [month, day] = date.split(seperator)
      return [Number(month), Number(day)]
    }
  }
  return null
}

/**
 *
 * @param {String} weekdayString
 */
function checkForWeekday(weekdayString) {
  switch (weekdayString.toLowerCase()) {
    case WEEKDAY.MONDAY:
      return WEEKDAY_ENUM.MONDAY
      break
    case WEEKDAY.TUESDAY:
      return WEEKDAY_ENUM.TUESDAY
      break
    case WEEKDAY.WEDNESDAY:
      return WEEKDAY_ENUM.WEDNESDAY
      break
    case WEEKDAY.THURSDAY:
      return WEEKDAY_ENUM.THURSDAY
      break
    case WEEKDAY.FRIDAY:
      return WEEKDAY_ENUM.FRIDAY
      break
    case WEEKDAY.SATURDAY:
      return WEEKDAY_ENUM.SATURDAY
      break
    case WEEKDAY.SUNDAY:
      return WEEKDAY_ENUM.SUNDAY
      break
  }
}

const WEEKDAY = Object.freeze({
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
})

const WEEKDAY_ENUM = Object.freeze({
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
})

const MONTH_STRINGS = Object.freeze({
  JANUARY: 'january',
  FEBRUARY: 'february',
  MARCH: 'march',
  APRIL: 'april',
  MAY: 'may',
  JUNE: 'june',
  JULY: 'july',
  AUGUST: 'august',
  SEPTEMBER: 'september',
  OCTOBER: 'october',
  NOVEMBER: 'november',
  DECEMBER: 'december',
})

const MONTH_ENUM = Object.freeze({
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
})

const TIME_STRINGS = Object.freeze({
  SECONDS: 'seconds',
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
  DATE: 'date',
  WEEKS: 'weeks',
  MONTHS: 'months',
})
