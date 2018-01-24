'use strict';

const builder = require('botbuilder');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const APP_ID = '6f76310c-32d6-47ab-bd25-906bfdfc09a1';
const APP_PASSWORD = '@hO-m{X|KUp1h2*@';
const LUIS_MODEL_URL = 'https://westus.api.cognitive.microsoft.com/api/v2.0/apps/9fc3d559-6624-4900-ad38-283e0dfdbdb0?subscription-key=7817b8e92a2f45738870896bd46edb39&verbose=true&timezoneOffset=0&q=';

// Create connector and listen for messages
let connector = new builder.ChatConnector({
    appId: APP_ID,
    appPassword: APP_PASSWORD
});

app.post('/api/messages', connector.listen());

let bot = new builder.UniversalBot(connector, (session) => {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
});

let recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('Greeting',(session)=>{
    session.send('Hello. I am connected');
});

app.listen(3000, (err, resp) =>{
    console.log('Server started ', err, resp);
});