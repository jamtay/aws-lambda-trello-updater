const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-2' });

const boardEncrypted = process.env['TRELLO_BOARD_ID'];
let boardDecrypted;
const keyEncrypted = process.env['TRELLO_KEY'];
let keyDecrypted;
const tokenEncrypted = process.env['TRELLO_TOKEN'];
let tokenDecrypted;

exports.decryptEnvVars = async () => {
    if (!boardDecrypted) {
        // Decrypt code should run once and variables stored outside of the
        // function handler so that these are decrypted once per container
        const kms = new AWS.KMS();
        try {
            const req = { CiphertextBlob: Buffer.from(boardEncrypted, 'base64') };
            const data = await kms.decrypt(req).promise();
            boardDecrypted = data.Plaintext.toString('ascii');

            const reqKey = { CiphertextBlob: Buffer.from(keyEncrypted, 'base64') };
            const dataKey = await kms.decrypt(reqKey).promise();
            keyDecrypted = dataKey.Plaintext.toString('ascii');

            const reqToken = { CiphertextBlob: Buffer.from(tokenEncrypted, 'base64') };
            const dataToken = await kms.decrypt(reqToken).promise();
            tokenDecrypted = dataToken.Plaintext.toString('ascii');
        } catch (err) {
            console.log('Decrypt error:', err);
            throw err;
        }
    }
    return [boardDecrypted, keyDecrypted, tokenDecrypted]
};
