const express = require('express');
const router = require('express').Router();
const request = require('request');

// token
const token = process.env.FB_PAGE_ACCESS_TOKEN
const vtoken = 'pgsecret';

// crawl weather
const getWeather = require('../getWeather.js');

router.get('/', function(req, res) {
    res.send('Hello world, I am a chat bot');
});
// Facebook verification
router.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === vtoken) {
        res.send(req.query['hub.challenge']);
    }
    res.send('No sir');
});

// Receive Messages
router.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function (entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function (event) {
                if (event.message) {
                    receivedMessage(event);
                } else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }
});

// Send a Text Message
function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            case 'getWeather':
                sendGenericMessage(senderID);
                break;

            default:
                sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendGenericMessage(recipientId) {
  // To be expanded in later sections
  getWeather(function (err, weather) {
    let messageText = weather;
    // console.log('messageText: ' + messageText);
    let messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText
      }
    };

    callSendAPI(messageData); 
  });
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAEUypwB3E8BAEbQG1yeta8FLasQeGPesb0hZC7SZCIMLZA52lkE0Yq00R7teCkZAP3uLN6s3NdQVjbpZAHJHiyHPmqLA7wdZBazeeeg1NPk5AmiqoovkW6r52SWQgDjz2Sg7M0FmZA4FZADTAz4A2fQD6PZAimb7ZBAicNBeGvOWfygZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

module.exports = router;