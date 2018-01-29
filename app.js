'use strict';

const restify = require('restify');

const connector = require('./lib/service/botConnector').connector;
const bot = require('./lib/service/botConnector').bot;

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 4500, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

let intents = require('./lib/model/bot')();

bot.dialog('/', () => {
    let intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', (session) => {
        session.send("Hey! I'm the Book Flight Ticket Bot. I can book / cancel you flight tickets");
        session.userData = session.userData || {};
        session.userData.oldUser = true;
        let msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .title("What would you like to do?")
                .buttons([
                    builder.CardAction.imBack(session, "Book Ticket", "Book"),
                    builder.CardAction.imBack(session, "Cancel Ticket", "Cancel")
                ])
        ]);
        session.send(msg).endDialog();
    })
    
    .matches('bookTicket', [(session, args,callback) =>{
        console.log('TESTER ',args, session);
        let intent = args.intent;
        let dateOfTravel = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetimeV2.date');
        let noOfTickets = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
        let destinationLocation = builder.EntityRecognizer.findEntity(args.entities, 'location::destinationLocation');
        let originLocation = builder.EntityRecognizer.findEntity(args.entities, 'location::originLocation');
        let travelClass = builder.EntityRecognizer.findEntity(args.entities, 'travelClass');
        console.log(JSON.stringify(args.entities));
        session.userData = {};
        if (noOfTickets && noOfTickets.resolution && noOfTickets.resolution.value) {
            session.userData.noOfTickets = noOfTickets.resolution.value;
        }
        if (destinationLocation){
            session.userData.destinationLocation = destinationLocation.entity;
        }
        if (originLocation){
            session.userData.originLocation = originLocation.entity;
        }
        if (travelClass){
            session.userData.travelClass = travelClass.entity;
        }
        if (dateOfTravel && dateOfTravel.resolution && dateOfTravel.resolution.values && dateOfTravel.resolution.values.length && dateOfTravel.resolution.values[0].value){
            session.userData.dateOfTravel = dateOfTravel.resolution.values[0].value;
            return callback();
        } else {
            builder.Prompts.time(session, 'Please tell me your date of travel?');
        }
    }, (session, results, callback) => {
        if (results.response) {
            session.userData.dateOfTravel = results.response;
        }
        if(session.userData.originLocation){
            return callback();
        } else{
            session.beginDialog('getOriginLocation');
        }
    }, 
    
    (session, results, callback) => {
        if (results.response) {
            session.userData.originLocation = results.response;
        }
        session.beginDialog('getDestinationLocation');
    }, (session, results, callback) => {
        if (results.response) {
            session.userData.destinationLocation = results.response;
        }
        if (session.userData.noOfTickets){
            return callback();
        } else {
            builder.Prompts.number(session, 'How many tickets you want me to book?');
        }
    }, (session, results, callback) => {
        console.log(session.userData);
        if (results.response) {
            session.userData.noOfTickets = results.response;
        }
       /* if (session.userData.travelClass){
            return callback();
        } else {
            let msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments([
                new builder.HeroCard(session)
                    .title("Please select your mode of travel?")
                    .buttons([
                        builder.CardAction.imBack(session, "Economy", "Economy"),
                        builder.CardAction.imBack(session, "Business", "Business"),
                        builder.CardAction.imBack(session, "Premium Economy", "Premium Economy"),
                        builder.CardAction.imBack(session, "First Class", "First Class")
                    ])
            ]);
            console.log("TEST", msg);
            session.send(msg);
        }*/
        return callback();
    },  (session, results, callback) => {
       /* if (results.response) {
            session.userData.travelClass = results.response;
        }*/
        let flightList = [{
            flightName: "Air Asia", 
            logo : "https://akm-img-a-in.tosshub.com/indiatoday/images/story/201606/story_wikimedia,-mehdi-nazarinia_647_061316045520.jpg",
            price : 4000,
            departure : "10:30",
            arraival : "13:30"
        }, {
            flightName: "Indigo", 
            logo : "http://ste.india.com/sites/default/files/2016/05/24/491792-indigo.jpg",
            price : 4000,
            departure : "10:30",
            arraival : "13:00"
        }, {
            flightName: "Jet Airways", 
            logo : "http://ste.india.com/sites/default/files/2016/05/24/491792-indigo.jpg",
            price : 4000,
            departure : "10:00",
            arraival : "13:30"
        }];
        let attachments = [];

        for (var flight in flightList){
            attachments.push (new builder.HeroCard(session)
                .title(flightList[flight].flightName)
                .subtitle("Rs."+ flightList[flight].price)
                .text("Departure : " + flightList[flight].departure + "  Arraival : " +  flightList[flight].arraival)
                .images([builder.CardImage.create(session, flightList[flight.logo])])
                .buttons([
                    builder.CardAction.imBack(session, flightList[flight].flightName, "Select")
                ]));
        }

        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments(attachments);
        session.send(msg);
    }])

    .matches('flights',[(session, args,callback) =>{
        session.userData.flightName = session.message.text;
        builder.Prompts.text(session, 'Noted. Please tell your Email Id to receive ticket');
    }, (session, results, callback) => {
        session.userData.contactEmailId = results.response;
        builder.Prompts.confirm(session, 'Your Payable Amount is Rs.4000. Please Confirm for payment');
    },  (session, results, callback) => {
        if(results.response){
            session.send('Flight Ticket booking Successful. <br>'+ 
            session.userData.originLocation + " to " + session.userData.destinationLocation +  '<br> ' +
            session.userData.flightName + ' <br> ' +
            ' Boarding Time: ' + session.userData.dateOfTravel + ' 10:30' + '<br>' +
            ' No of Tickets: ' + session.userData.noOfTickets +
            ' Ticket is emailed to '+ session.userData.contactEmailId ).endDialog();
        } else {
            session.send('Thank you. Have a nice day!').endDialog();
        }
    }])

    .matches('cancelTicket',[(session,results, callback) => {
        builder.Prompts.time(session, 'Please tell me your date of travel?');
        session.userData = session.userData || {};
        session.userData.oldUser = true;
    }, (session, results, callback) =>{
        session.userData.cancelDate = results.response;
        builder.Prompts.confirm(session, 'Can I cancel your ticket? Please Confirm ');
    }, (session, results, callback) => {
        if (results.response){
            session.send('I have cancelled your Ticket on ' + moment(session.userData.cancelDate.resolution.start).format('DD-MM-YYYY')).endDialog();
        } else {
            session.send('Okay ! Have a nice day !').endDialog();
        }
    }])

    .onDefault((session) => {
        session.send('Please Enter a valid Response .');
    });
});

bot.dialog('getOriginLocation', [(session, callback) =>{
    builder.Prompts.text(session, 'Please tell me your origin city?');
}, (session, results, callback) => {
    session.endDialogWithResult(results);
}]);

bot.dialog('getDestinationLocation', [(session, args) =>{
    if (session.userData.destinationLocation){
        session.endDialogWithResult({});
    } else {
        if (args && args.rePrompt){
            builder.Prompts.text(session, 'Origin and Destination can not be same. Please tell me your destination city?');
        } else{
            builder.Prompts.text(session, 'Please tell me your destination city?');
        }
    }
}, (session, results, callback) => {
    if(results.response == session.userData.originLocation){
        session.replaceDialog('getDestinationLocation', { rePrompt: true });
    } else{
        session.endDialogWithResult(results);
    }
}]);
