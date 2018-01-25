'use strict';

const builder = require('botbuilder');
const recognizer = require('../service/botConnector').recognizer;

let persistIntents = () => {
    let intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', (session) => {
        session.send("Hey! I'm the Book Flight Ticket Bot. I can book / cancel you flight tickets");
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
        
        let intent = args.intent;
        let dateOfTravel = builder.EntityRecognizer.findEntity(intent.entities, 'dateTimeV2');
        let noOfTickets = builder.EntityRecognizer.findEntity(intent.entities, 'number');
        let toLocation = builder.EntityRecognizer.findEntity(intent.entities, 'Weather.Location');
        let travelClass = builder.EntityRecognizer.findEntity(intent.entities, 'travelClass');
        console.log('ENTITIES ', dateOfTravel, noOfTickets, toLocation, travelClass, intent.entities);
        if (noOfTickets) {
            session.userData.noOfTickets = noOfTickets;
        }
        if (toLocation){
            session.userData.toLocation = toLocation;
        }
        if (travelClass){
            session.userData.travelClass = travelClass;
        }
        if (dateOfTravel){
            session.userData.dateOfTravel = dateOfTravel;
            return callback();
        } else {
            builder.Prompts.time(session, 'Please tell me your date of travel?');
        }
    }, (session, results, callback) => {
        if (results.response) {
            session.userData.dateOfTravel = results.response;
        }
        builder.Prompts.text(session, 'Please tell me your origin city?');
    }, 
    
    (session, results, callback) => {
        if (results.response) {
            session.userData.fromLocation = results.response;
        }
        if (session.userData.toLocation){
            return callback();
        } else {
            builder.Prompts.text(session, 'Please tell me your destination city?');
        }
    }, (session, results, callback) => {
        if (results.response) {
            session.userData.toLocation = results.response;
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

        for(var flight in flightList){
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
        builder.Prompts.text(session, 'Noted. Please tell your Email Id to recieve ticket');
    }, (session, results, callback) => {
        session.userData.contactEmailId = results.response;
        builder.Prompts.confirm(session, 'Your Payable Amount is Rs.4000. Please Confirm for payment');
    },  (session, results, callback) => {
        if(results.response){
            session.send('Flicht Ticket booking Successful.'+'\n'+ 
            session.userData.fromLocation + "to" + session.userData.toLocation +  '\n' +
            session.userData.flightName + '\n' +
            'Boarding Time:' + session.userData.dateOfTravel + '10:00' + '\n' +
            'Ticket is emailed to '+ session.userData.contactEmailId ).endDialog();
        } else {
            session.send('Thank you. Have a nice day!').endDialog();
        }
    }])
    .matches('cancelTicket',(session) => {
        session.send('You have Entered Cancel ticket').endDialog();
    })
    .onDefault((session) => {
        session.send('Please Enter a valid Response .');
    });
    return intents;
};

module.exports = persistIntents;