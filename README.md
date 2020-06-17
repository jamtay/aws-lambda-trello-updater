# Trello Updater with Lamdba function for Alexa

A node.js program to update cards in a trello board. It shifts all due dates to the same time tomorrow and unchecks the due complete checkbox

## Technologies

- Node.JS
- AWS Lamdba
- Alexa Skill

## Running locally

1. Add a `.env` file with `TRELLO_KEY`, `TRELLO_TOKEN` and `TRELLO_BOARD_ID`. The `TRELLO_BOARD_ID` can be found by `curl 'https://api.trello.com/1/members/me/boards?key={key}&token={token}'`. The `TRELLO_KEY` and `TRELLO_TOKEN`
2. Update top level `index.js`
3. Run `npm start`


## Updating Lamdba function

1. Update the code you want inside the lamdba directory
2. Run `npm run zip` to create a zip file
3. Run `npm run upload` to upload to your function
4. Open AWS console and navigate to this function
5. Run the test command (in AWS console) before deploying to check it works
6. Deploy
7. Go to Alexa Skill Dashboard and verify changes from there


The top level `index.js` file is used to run as a command line runner. The lamdba directory is for the AWS lambda function
