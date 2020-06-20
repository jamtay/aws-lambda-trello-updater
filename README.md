# Trello Updater with Lamdba function for Alexa

A node.js program to update cards in a trello board. It shifts all due dates to the same time tomorrow and unchecks the due complete checkbox

## Technologies

- Node.JS
- AWS Lamdba
- Alexa Skill

## Running locally

1. Add a `.env` file with `TRELLO_KEY`, `TRELLO_TOKEN` and `TRELLO_BOARD_ID`. The `TRELLO_BOARD_ID` can be found by `curl 'https://api.trello.com/1/members/me/boards?key={key}&token={token}'`. The `TRELLO_KEY` and `TRELLO_TOKEN`
2. Add the remaining env vars `TRELLO_EVERYDAY_ID`, `TRELLO_WEEKEND_ID`, `TRELLO_BOARD_NAME`, `TRELLO_EVERYDAY_NAME`, `TRELLO_WEEKEND_NAME`. You only need the names and not the ids, but it will run quicker with the ids instead, because then it won't have to fetch the ids from the api 
3. Update top level `index.js`
4. Run `npm start`

### Linked package

The `updater` directory is `npm linked` to both `lambda` and the root directories

To link:

1. `npm link` in `updater` directory
2. `npm link /path/to/updater` where you want to link from. E.g from `lambda` run `npm link ../updater`
3. `npm install —save /path/to/updater`. E.g from `lambda` run `npm install --save ../updater`

Check it works by running npm start after running an npm install because of this issue: https://github.com/npm/npm/issues/18980
This means that if you just do npm link, then npm install will blow it away. So must do this https://github.com/npm/rfcs/pull/3/files

## Updating Lamdba function

1. Update the code you want inside the lamdba directory
2. Run `npm run zip` to create a zip file and `npm run push` to push the zip to your AWS lambda function
3. OR run `npm run upload` to both zip and upload to your function to AWS lambda
4. Open AWS console and navigate to this function
5. Run the test command (in AWS console) before deploying to check it works
6. Deploy
7. Go to Alexa Skill Dashboard and verify changes from there


The top level `index.js` file is used to run as a command line runner. The lamdba directory is for the AWS lambda function
