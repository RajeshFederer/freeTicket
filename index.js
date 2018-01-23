'use strict';

const builder = require('botbuilder');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const APP_ID = 'fe61c76c-2325-48bc-acb5-bb8d89997e05';
const APP_PASSWORD = 't|=.WKy]zUF+Vz!e';
const LUIS_MODEL_URL = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/5f2aca06-714b-4ee2-9d5a-ff620e9044a3?subscription-key=7817b8e92a2f45738870896bd46edb39&verbose=true&timezoneOffset=0&q=';

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