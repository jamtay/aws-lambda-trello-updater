const fetch = require('node-fetch');
const moment = require('moment')

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

// Example get boards to get board id to find list id
// curl 'https://api.trello.com/1/members/me/boards?key={key}&token={token}' > ~/Desktop/trelloBoards.json
// Example get lists on a board (to get the id
// curl 'https://api.trello.com/1/boards/5c759b9bf99e913c59124588/lists?key={key}&token={token}' > ~/Desktop/trelloLists.json
/**
* @param key
* @param token
* @param boardId Optional param for the id of the board. if this is not supplied then find the board using boardName
* @param everydayId Optional param for the id of the everday list. if this is not supplied then find the list using everydayName
* @param weekendId Optional param for the id of the weekend list. if this is not supplied then find the list using weekendName
* @param boardName Optional param, but required if boardId is not supplied
* @param everydayName Optional param, but required if everydayId is not supplied
* @param weekendName Optional param, but required if weekendId is not supplied
**/
exports.updateTrello = async(key, token, boardId, everydayId, weekendId, boardName, everydayName, weekendName) => {

  const urlKeyTokenParams = `?key=${key}&token=${token}`

  // If the ids are not supplied then get the list Ids using the names

  if (!everydayId || !weekendId) {
    if (!boardId) {
      const getBoards = `https://api.trello.com/1/members/me/boards${urlKeyTokenParams}`
      const boardsResponse = await fetch(getBoards, {
        method: 'GET'
      })
      const boards = await boardsResponse.json()
      boardId = boards.find(board => board.name === boardName).id
    }

    const getLists = `https://api.trello.com/1/boards/${boardId}/lists${urlKeyTokenParams}`
    const listResponse = await fetch(getLists, {
      method: 'GET'
    })
    const lists = await listResponse.json()
    if (!everydayId) {
      everydayId = lists.find(list => list.name === everydayName).id
    }
    if (!weekendId) {
      weekendId = lists.find(list => list.name === weekendName).id
    }
  }

  const getUrl = `https://api.trello.com/1/lists/${everydayId}/cards${urlKeyTokenParams}`
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
        const extraDaysToAdd = getExtraDaysToAddToSkipWeekend()
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

  // Update the list to be at the start of the week
  const putUrl = `https://api.trello.com/1/lists/${everydayId}${urlKeyTokenParams}&pos=top`
  await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json'
    }
  })

  return `I have updated ${cardsUpdated} card's due date in your everyday list`
}
