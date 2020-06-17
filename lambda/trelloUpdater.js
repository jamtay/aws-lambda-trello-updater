const fetch = require('node-fetch');
const moment = require('moment')
const decryptEnvVars = require('./decrypt').decryptEnvVars

/**
* Get the extra days to add to the due date for the special case. If the label is Gym or Work and it is a Friday or Saturday, then add the extra days required to set it to a Monday due date
**/
const getExtraDaysToAdd = (itemLabel) => {
  if (itemLabel === undefined) {
    return 0
  }
  const isTodayFriday = moment().isoWeekday() === 5
  const isTodaySaturday = moment().isoWeekday() === 6

  const isWeekDayItem = itemLabel === 'Gym' || itemLabel === 'Work'
  if (!isWeekDayItem || (!isTodayFriday && !isTodaySaturday)) {
    return 0
  }
  return isTodayFriday ? 2 : 1
}

// Example get boards to get board id to find list id
// curl 'https://api.trello.com/1/members/me/boards?key={key}&token={token}' > ~/Desktop/trelloBoards.json
// Example get lists on a board (to get the id
// curl 'https://api.trello.com/1/boards/5c759b9bf99e913c59124588/lists?key={key}&token={token}' > ~/Desktop/trelloLists.json
exports.updateTrello = async() => {
  const [boardId, key, token] = await decryptEnvVars()

  const urlKeyTokenParams = `?key=${key}&token=${token}`


  //TODO: Move key, token and list ids to env vars and push to git
  const getUrl = `https://api.trello.com/1/lists/${boardId}/cards${urlKeyTokenParams}`
  const response = await fetch(getUrl, {
    method: 'GET'
  })
  console.log(
    `Response: ${response.status} ${response.statusText} for get request`
  );
  const cards = await response.json()

  const startOfToday = moment().startOf('day')
  const startOfYesterday = moment().add(-1, 'days').startOf('day')
  const startOfTomorrow = moment().add(1, 'days').startOf('day')

  let cardsUpdated = 0
  for (let item of cards) {
    const startOfCardsDueDate = moment(item.due).startOf('day')
    const isCardDueToday = startOfToday.isSame(startOfCardsDueDate)
    const isDueYesterday = startOfYesterday.isSame(startOfCardsDueDate)
    const isDueTomorrow = startOfTomorrow.isSame(startOfCardsDueDate)

    if (item.dueComplete) {
      let daysFromCardDueTillTomorrow = - 1
      if (isDueYesterday) {
        daysFromCardDueTillTomorrow = 2
      } else if (isCardDueToday) {
        daysFromCardDueTillTomorrow = 1
      } else if (isDueTomorrow) {
        daysFromCardDueTillTomorrow = 0
      }

      if (daysFromCardDueTillTomorrow !== -1) {

        const label = item.labels && item.labels.length > 0 ? item.labels[0].name : undefined

        const extraDaysToAdd = getExtraDaysToAdd(label)
        const shouldSetToComplete = extraDaysToAdd > 0
        const daysToAppend = daysFromCardDueTillTomorrow + extraDaysToAdd
        const cardsFutherDueTime = moment(item.due).add(daysToAppend, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSSZ')

        const putUrl = `https://api.trello.com/1/cards/${item.id}${urlKeyTokenParams}` + `&dueComplete=${shouldSetToComplete}` + `&due=${cardsFutherDueTime}`
        const putResposne = await fetch(putUrl, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json'
          }
        })
        console.log('----------------------------------')
        console.log(`updating ${item.id} : ${item.name} by ${daysToAppend} day${daysToAppend !== 1 ? 's' : ''} from ${item.due} to ${cardsFutherDueTime}`)
        console.log('----------------------------------')
        cardsUpdated++
      }
    }
  }

  return `I have updated ${cardsUpdated} card's due date in your everyday list`
}
