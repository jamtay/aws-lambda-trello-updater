const fetch = require('node-fetch');
const moment = require('moment')
const {updateItems} = require('./updateItems')
const {
  getExtraDaysToAddToSkipWeekend,
  shouldSetToItemComplete,
  getCardsFutureDueTime,
  getWeekendCardsFutureDueTime} = require('./dateUpdater')


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

  const cardsUpdated = await updateItems(everydayId, everydayName, shouldSetToItemComplete, getCardsFutureDueTime, urlKeyTokenParams)
  const weekendCardsUpdated = await updateItems(weekendId, weekendName, () => false, getWeekendCardsFutureDueTime, urlKeyTokenParams)

  // Update the list to be at the start of the week
  const putUrl = `https://api.trello.com/1/lists/${everydayId}${urlKeyTokenParams}&pos=top`
  await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json'
    }
  })

  return `I have updated ${cardsUpdated} card's due date in your everyday list and ${weekendCardsUpdated} in your weekend list`
}
