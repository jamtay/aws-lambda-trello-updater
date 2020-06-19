const {updateTrello} = require('updater')

const key = process.env.TRELLO_KEY
const token = process.env.TRELLO_TOKEN
const boardId = process.env.TRELLO_BOARD_ID

updateTrello(boardId, key, token).then(() => {
  console.log('==================================')
  console.log('successfully updated all trello cards (which have been completed and are due yesterday, today, or tomorrow) in EVERYDAY list to be due tomorrow')

}).catch(error => {
  console.error('An error occured. See below for details')
  console.error(error)
})
