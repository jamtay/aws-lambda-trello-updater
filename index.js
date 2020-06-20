const {updateTrello} = require('updater')

const key = process.env.TRELLO_KEY
const token = process.env.TRELLO_TOKEN
const boardId = process.env.TRELLO_BOARD_ID
const everydayId = process.env.TRELLO_EVERYDAY_ID
const weekendId = process.env.TRELLO_WEEKEND_ID

const boardName = process.env.TRELLO_BOARD_NAME || 'Life'
const everydayName = process.env.TRELLO_EVERYDAY_NAME || 'Everyday!'
const weekendName = process.env.TRELLO_WEEKEND_NAME || 'Weekend'

updateTrello(key, token, boardId, everydayId, weekendId, boardName, everydayName, weekendName).then(() => {
  console.log('==================================')
  console.log('successfully updated all trello cards (which have been completed and are due yesterday, today, or tomorrow) in EVERYDAY list to be due tomorrow')

}).catch(error => {
  console.error('An error occured. See below for details')
  console.error(error)
})
