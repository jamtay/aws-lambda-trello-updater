
const fetch = require('node-fetch');
const moment = require('moment')

exports.updateItems = async (id, listName, shouldSetToItemComplete, getCardsFutureDueTime, urlKeyTokenParams) => {
  const getUrl = `https://api.trello.com/1/lists/${id}/cards${urlKeyTokenParams}`
  const response = await fetch(getUrl, {
    method: 'GET'
  })
  console.log(
    `Response for ${listName}: ${response.status} ${response.statusText} for get request`
  );
  const cards = await response.json()

  let cardsUpdated = 0

  for (let item of cards) {

    if (item.dueComplete) {
      const cardsFutherDueTime = getCardsFutureDueTime(item.due)

      if (cardsFutherDueTime) {
        const shouldSetToComplete = shouldSetToItemComplete()
        const putUrl = `https://api.trello.com/1/cards/${item.id}${urlKeyTokenParams}` + `&dueComplete=${shouldSetToComplete}` + `&due=${cardsFutherDueTime}`
        const putResposne = await fetch(putUrl, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json'
          }
        })
        console.log('----------------------------------')
        console.log(`updating ${item.id} in ${listName}: ${item.name} from ${item.due} to ${cardsFutherDueTime}`)
        console.log('----------------------------------')
        cardsUpdated++
      }
    }
  }
  return cardsUpdated
}
