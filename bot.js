require('dotenv').load();
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const faceApi = require('./faceAPI');
const glasses = require('./glasses');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Send a photo to me and i\'m gonna make it CO0L');
});

bot.on('photo', (msg) => {
  const chatId = msg.chat.id;
  glasses.getLargestPhoto(msg.photo)
    .then((photo) => {
      request(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${photo}`,
        { json: true },
        (err, res, body) => {
          const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${body.result.file_path}`;
          faceApi.getFaceInfo(url)
            .then((faces) => {
              if (faces.length === 0) {
                throw new Error('No human faces detected');
              }
              if(faces == 0){
                throw new Error('smth is going wrong');
              }
              return glasses.buffers(faces);
            })
            .then(buffer => glasses.add(url, buffer))
            .then(picture => bot.sendPhoto(chatId, picture, { caption: 'Here we go' }))
            .catch(error => bot.sendMessage(chatId, `${error}, try again.`));
        },
      );
    });
});
