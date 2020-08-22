const fetch = require('node-fetch');
const moment = require('moment')

const startOfToday = moment().startOf('day')
const startOfYesterday = moment().add(-1, 'days').startOf('day')
const startOfTomorrow = moment().add(1, 'days').startOf('day')
const startOf2Days = moment().add(2, 'days').startOf('day')
//Dat difference for Friday to last Sunday
const startOf5DaysAgo = moment().add(-5, 'days').startOf('day')
//Dat difference for Saturday to last Sunday
const startOf6DaysAgo = moment().add(-6, 'days').startOf('day')

const isTodayFriday = moment().isoWeekday() === 5
const isTodaySaturday = moment().isoWeekday() === 6
const isTodaySunday = moment().isoWeekday() === 7

const isEndOfWorkWeek = isTodayFriday || isTodaySaturday || isTodaySunday

/**
* Get the extra days to add to the due date for the special case. If it is a Friday or Saturday, then add the extra days required to set it to a Monday due date
**/
const getExtraDaysToAddToSkipWeekend = () => {
  const isTodayFriday = moment().isoWeekday() === 5
  const isTodaySaturday = moment().isoWeekday() === 6

  if ((!isTodayFriday && !isTodaySaturday)) {
    return 0
  }
  return isTodayFriday ? 2 : 1
}

/**
* Should set the everyday item to complete if it is not the weekend
**/
const shouldSetToItemComplete = () => {
  const extraDaysToAdd = getExtraDaysToAddToSkipWeekend()
  return extraDaysToAdd > 0
}


/**
* Get the future due date of a card. If it should not be updated then return undefined
**/
const getCardsFutureDueTime = (itemDue) => {
  const startOfCardsDueDate = moment(itemDue).startOf('day')
  const isCardDueToday = startOfToday.isSame(startOfCardsDueDate)
  const isDueYesterday = startOfYesterday.isSame(startOfCardsDueDate)
  const isDueTomorrow = startOfTomorrow.isSame(startOfCardsDueDate)

  let daysFromCardDueTillTomorrow = - 1
  if (isDueYesterday) {
    daysFromCardDueTillTomorrow = 2
  } else if (isCardDueToday) {
    daysFromCardDueTillTomorrow = 1
  } else if (isDueTomorrow) {
    daysFromCardDueTillTomorrow = 0
  }

  if (daysFromCardDueTillTomorrow !== -1) {
    const extraDaysToAdd = getExtraDaysToAddToSkipWeekend()
    const daysToAppend = daysFromCardDueTillTomorrow + extraDaysToAdd
    return moment(itemDue).add(daysToAppend, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSSZ')
  } else {
    return undefined
  }
}

/**
* Get the future due date of a card for a weekend. If it should not be updated then return undefined
* If due Friday, move to saturday, if due saturday move to sunday, if due sunday move to saturday
**/
const getWeekendCardsFutureDueTime = (itemDue) => {
  const startOfCardsDueDate = moment(itemDue).startOf('day')
  const isCardDueToday = startOfToday.isSame(startOfCardsDueDate)
  const isDueYesterday = startOfYesterday.isSame(startOfCardsDueDate)
  const isDueTomorrow = startOfTomorrow.isSame(startOfCardsDueDate)
  const isCardDue2Days = startOf2Days.isSame(startOfCardsDueDate)
  const isDue5DaysAgo = startOf5DaysAgo.isSame(startOfCardsDueDate)
  const isDue6DaysAgo = startOf6DaysAgo.isSame(startOfCardsDueDate)

  let daysFromCardDueTillTomorrow = undefined

  if (isTodayFriday || isTodaySaturday) {
    if (isDueYesterday) {
      daysFromCardDueTillTomorrow = 2
    } else if (isCardDueToday) {
      daysFromCardDueTillTomorrow = 1
    } else if (isDueTomorrow) {
      daysFromCardDueTillTomorrow = 0
    } else if (isCardDue2Days) {
      daysFromCardDueTillTomorrow = -1
    }  else if (isTodayFriday && isDue5DaysAgo) {
      daysFromCardDueTillTomorrow = 6
    } else if (isDue6DaysAgo) {
      daysFromCardDueTillTomorrow = 7
    }
  } else if (isTodaySunday) {
    if (isDueYesterday) {
      daysFromCardDueTillTomorrow = 7
    } else if (isCardDueToday) {
      daysFromCardDueTillTomorrow = 6
    } else if (isDueTomorrow) {
      daysFromCardDueTillTomorrow = 5
    }
  }

  if (daysFromCardDueTillTomorrow !== undefined) {
    return moment(itemDue).add(daysFromCardDueTillTomorrow, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSSZ')
  } else {
    return undefined
  }
}

module.exports = {
  getExtraDaysToAddToSkipWeekend,
  shouldSetToItemComplete,
  getCardsFutureDueTime,
  getWeekendCardsFutureDueTime,
  isEndOfWorkWeek
}
