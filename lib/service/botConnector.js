'use strict';

const builder = require('botbuilder');
const botbuilder_azure = require("botbuilder-azure");
const appConfig = require('../config/appConfig');

//connector 
const connector = new builder.ChatConnector({
    appId: appConfig.MICROSOFT_APP_ID,
    appPassword: appConfig.MICROSOFT_APP_PASSWORD,
    openIdMetadata: appConfig.BOT_OPEN_ID_META_DATA
});

//bot
const TABLE_NAME = 'botdata';
let azureTableClient = new botbuilder_azure.AzureTableClient(TABLE_NAME, process.env['AzureWebJobsStorage']);
let tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
let bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

const LUIS_MODEL_URL = 'https://' + appConfig.LUIS_API_HOST_NAME + '/luis/v1/application?id=' + appConfig.LUIS_APP_ID + '&subscription-key=' + appConfig.LUIS_API_KEY;
let recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);

module.exports = {
    connector : connector, 
    bot : bot,
    recognizer : recognizer
};