var unirest = require('unirest');
var google = require('google');
var http = require('http');
var _ = require('lodash-node/compat');
var Client = require('node-rest-client').Client
var client = new Client();

// --- CONSTANTS --- //
var DEFAULT_TIMEOUT = 60;
var DEBUG = true;
google.resultsPerPage = 1;
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

var BOT_TOKEN = "226238119:AAHdeIiYCCh83Ss35S3Dpm7woELZo7j3S74";
var BASE_URL = "https://api.telegram.org/bot" + BOT_TOKEN + "/";
var bitBotUrl = BASE_URL + "getUpdates?offset=:offset&timeout=" + DEFAULT_TIMEOUT; // GET
var SEND_MESSAGE_URL = BASE_URL + "sendMessage";// POST

// --- INITIALIZATION --- //
var max_offset = 0; // used for getting only new messages later

// Dummy database --> in a real world application this won't be an in-memory JavaScript object, but a database connection
var questions = [
  {
    q: "Birds can fly.",
    correct: true,
    answered_by: []
  },
  {
    q: "1 + 1 equals 3",
    correct: false,
    answered_by: []
  }
];

// Array which will map a user id to the question he recently got displayed and hasn't answered yet
var active_questions = [];
// --- APPLICATION LOGIC --- //
function bitbitbot(offset) {
  var url = bitBotUrl.replace(":offset", offset);

  if (DEBUG) console.log("BitbitBot now listening to commands...");

  unirest.get(url)
    .end(function (response) {
      if (DEBUG) console.log("Starting new request to " + url);

      // Extract HTTP body from response
      var body = response.raw_body;
      if (response.status == 200) {

        // Parse as JSON data and take the result object, which contains an array of messages (or may be empty as well)
        var jsonData = JSON.parse(body);
        var result = jsonData.result;
        if (DEBUG) console.log(JSON.stringify(result));

        // Run through every newly received message object
        if (result.length > 0) {
          for (i in result) {
            // Try to interpret the text as a command and jump right to next message object, if command parsing was successful
            if (runCommand(result[i].message)) continue;
          }

          // Update the offset for the next bitbitbot to the latest received message id + 1, to only get new messages at next request
          max_offset = parseInt(result[result.length - 1].update_id) + 1; // update max offset
        }
      }

      // Long-bitbitbot again
      bitbitbot(max_offset);
    });
};

// Start bitbitbot loop
bitbitbot(max_offset);
var getWalet = function () {

};
var newWallet = function (message) {
  var storedWallet = {id: message.from.id, amount: 10};
  var wallets = new Array();
  wallets.push(storedWallet);
  localStorage.setItem("wallets", JSON.stringify(wallets));
}
var getWallets = function () {
  return JSON.parse(localStorage.getItem("wallets"));
}
var getBitCoin = function (message) {
  google('define bitcoin', function (err, res, links) {
    if (err) console.error(err);
    var description = '';
    for (var i = 0; i < res.links.length; ++i) {
      var link = res.links[i];
      var info = link.title + '-' + link.description + "\n";
      description = description + info;
    }
    localStorage.setItem('bitCoinDefinition', description);
  });
  var answer = {
    chat_id: message.chat.id,
    text: localStorage.getItem('bitCoinDefinition'),
    reply_markup: JSON.stringify({
      keyboard: [["/true", "/false"]],
      resize_keyboard: true,
      one_time_keyboard: true
    })
  };
  unirest.post(SEND_MESSAGE_URL)
    .send(answer)
    .end(function (response) {
    });

};
var btc = function (message) {
  client.get("https://openexchangerates.org/api/latest.json?app_id=30515bf4d9634bf0b26ffd70e8e7bb58", function (data, response) {
    if (data) {
      if (data.rates) {
        var textTosend = '1 USD =' + data.rates.USD + 'BTC\n1 PHP =' + data.rates.PHP + 'PHP';
        localStorage.setItem('btc', textTosend);
      }
    }


  });
  console.log(localStorage.getItem('btc'));
  var answer = {
    chat_id: message.chat.id,
    text: localStorage.getItem('btc')
  };
  unirest.post(SEND_MESSAGE_URL)
    .send(answer)
    .end(function (response) {
    });
}
var wallet = function (message) {
  var walletList = getWallets();
  if (!walletList) {
    newWallet(message);
    walletList = getWallets();
  }
  var walletId;
  _.each(walletList, function (wallet) {
    if (message.from.id === wallet.id) {
      walletId = wallet.id;
    }
  });
  if (!walletId) {
    newWallet(message);
    walletId = message.from.id;
  }
  var answer = {
    chat_id: message.chat.id,
    text: 'Your Wallet Id is ' + walletId
  };
  unirest.post(SEND_MESSAGE_URL)
    .send(answer)
    .end(function (response) {
    });
}
var mybtc = function (message) {
  var walletList = getWallets();
  var returnMessage = 'You have no wallet yet';
  _.each(walletList, function (wallet) {
    if (message.from.id === wallet.id) {
      returnMessage = 'Your BTC Balance is ' + wallet.amount;
    }

  });
  var answer = {
    chat_id: message.chat.id,
    text: returnMessage
  };
  unirest.post(SEND_MESSAGE_URL)
    .send(answer)
    .end(function (response) {
    });
}

// Define available commands and map them to functions which should be executed
// Our bot would accept command "/bitcoin", "/btc"  "/wallet" and "mybtc"
  var COMMANDS = {
    'bitcoin': getBitCoin,
    'btc': btc,
    'wallet': wallet,
    'mybtc': mybtc,
  };

  function runCommand(message) {
    var msgtext = message.text;
    // Validate message text whether it actually is a command
    if (msgtext.indexOf("/") != 0) return false; // no slash at beginning? --> no command --> return
    // Only interpret the text after the preceeding slash and to the first blank space as command, i.e. extract "mycommand" out of "/mycommand First argument"
    var command = (msgtext.indexOf(" ") == -1) ? msgtext.substring(1, msgtext.length) : msgtext.substring(1, msgtext.indexOf(" "));
    if (DEBUG) console.log("command is " + command);
    // Check whether the command exists, i.e. we have a mapping for it
    if (COMMANDS[command] == null) return false; // not a valid command?
    // Actually run the corresponding function
    COMMANDS[command](message);
    return true;
  }

// Returns a random integer between 0 and max
  function randomInt(max) {
    return Math.round((Math.random() * max));
  }
  