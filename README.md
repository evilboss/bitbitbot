# BitbitBot

This is a very basic, functional example for a Telegram bot (https://telegram.org/blog/bot-revolution) backend written in Node.js.

What it can do?
   * [x] /bitcoin - show a definition if bitcoin randomly picked from a pool of definitions from the web. even humorous ones.
   * [x] /btc - show the current BTC / USD and BTC / PHP value
   * [X] /mybtc - show the number of btc in the user's wallet (default 10 / simulated)
   * [X] /wallet - if no wallet is linked to user, create one show some message, if there is display the btc wallet id
   * [ ] /send [username] 1 btc -  initiate sending. should show a message after x seconds, then increment the recipients Btc value.  it should throw a message if recipient does not have a btc wallet yet
   * [ ] /request [username] [1] btc - will send a message to requestee with a button to send requested btc amount with a click 

What you need to do to get this running is:


1. Run ``npm i`` from console in the project's root directory (of course you need to have node.js and npm installed on your computer or server)

3. Run ``node bitBitBotapp.js`` to start it.

Afterwards you can go into Telegram and try writing a message with to *@bit_ro_bot* commands are on top the once that work are checked