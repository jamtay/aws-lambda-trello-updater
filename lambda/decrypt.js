const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-2' });

const boardEncrypted = process.env['TRELLO_BOARD_ID'];
let boardDecrypted;
const keyEncrypted = process.env['TRELLO_KEY'];
let keyDecrypted;
const tokenEncrypted = process.env['TRELLO_TOKEN'];
let tokenDecrypted;
const everydayEncrypted = process.env['TRELLO_EVERYDAY_ID'];
let everydayDecrypted;
const weekendEncrypted = process.env['TRELLO_WEEKEND_ID'];
let weekendDecrypted;

const getDecrpyted = async (encrypted, kms) => {
  if (!encrypted) {
    return encrypted
  }
  const req = { CiphertextBlob: Buffer.from(encrypted, 'base64') };
  const data = await kms.decrypt(req).promise();
  return data.Plaintext.toString('ascii');
}

exports.decryptEnvVars = async () => {
    if (!boardDecrypted) {
        // Decrypt code should run once and variables stored outside of the
        // function handler so that these are decrypted once per container
        const kms = new AWS.KMS();
        try {
            boardDecrypted = await getDecrpyted(boardEncrypted, kms);
            keyDecrypted = await getDecrpyted(keyEncrypted, kms);
            tokenDecrypted = await getDecrpyted(tokenEncrypted, kms);
            everydayDecrypted = await getDecrpyted(everydayEncrypted, kms);
            weekendDecrypted = await getDecrpyted(weekendEncrypted, kms);
        } catch (err) {
            console.log('Decrypt error:', err);
            throw err;
        }
    }
    return [keyDecrypted, tokenDecrypted, boardDecrypted, everydayDecrypted, weekendDecrypted]
};
