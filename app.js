const restify = require('restify');
const builder = require('botbuilder');
const botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 4500, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

const MICROSOFT_APP_ID = '6f76310c-32d6-47ab-bd25-906bfdfc09a1';
const MICROSOFT_APP_PASSWORD = '@hO-m{X|KUp1h2*@';
const BOT_OPEN_ID_META_DATA = '';
const LUIS_APP_ID = '9fc3d559-6624-4900-ad38-283e0dfdbdb0';
const LUIS_API_KEY = '7817b8e92a2f45738870896bd46edb39';
const LUIS_API_HOST_NAME = 'westus.api.cognitive.microsoft.com';
const LUIS_MODEL_URL = 'https://' + LUIS_API_HOST_NAME + '/luis/v1/application?id=' + LUIS_APP_ID + '&subscription-key=' + LUIS_API_KEY;

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD,
    openIdMetadata: BOT_OPEN_ID_META_DATA
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

const tableName = 'botdata';
let azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
let tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
let bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

// Main dialog with LUIS
let recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);
console.log('RECOGNIZERIS:::'+JSON.stringify(recognizer));
let intents = new builder.IntentDialog({ recognizers: [recognizer] })
.matches('greeting', (session) => {
    session.send(session.message.text+' Welcome to Party Booking System, Tell me how may help you ');
})

/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);

