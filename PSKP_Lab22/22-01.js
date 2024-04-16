const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const axios = require('axios');
const { sequelize, Subscriber } = require('./models');

const token = '6708507900:AAHrOIDbjffwasvk02ILG5Yezl7ilenrOWY';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет! Я бот, который выполняет несколько функций. Вот список доступных команд:\n\n/subscribe - подписаться на рассылку случайных фактов\n/unsubscribe - отписаться от рассылки\n/weather (название города), например /weather Minsk - получить информацию о погоде в городе\n/joke - получить случайную шутку\n/cat - получить случайное изображение кота');
});

bot.onText(/\/subscribe/, async (msg) => {
    const chatId = msg.chat.id;
  
    try {
        await Subscriber.create({ chatId });
  
        bot.sendMessage(chatId, 'Вы успешно подписались на рассылку случайных фактов!');
    } catch (error) {
        console.error('Ошибка при добавлении подписчика:', error);
        bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз позже.');
    }
});

bot.onText(/\/unsubscribe/, async (msg) => {
    const chatId = msg.chat.id;
  
    try {
        await Subscriber.destroy({ where: { chatId: chatId.toString() } });
  
        bot.sendMessage(chatId, 'Вы успешно отписались от рассылки случайных фактов!');
    } catch (error) {
        console.error('Ошибка при удалении подписчика:', error);
        bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз позже.');
    }
});

cron.schedule('0 12 * * *', async () => {
    try {
      const subscribers = await Subscriber.findAll();

      const response = await axios.get('https://randomuselessfact.appspot.com/api/v2/facts/random');
      const fact = response.data.text;

      subscribers.forEach((subscriber) => {
        bot.sendMessage(subscriber.chatId, fact);
      });
    } catch (error) {
      console.error('Ошибка при рассылке случайного факта:', error);
    }
});

bot.onText(/\/weather (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1];
  
    axios.get(`https://wttr.in/${city}?format=%C+%t`)
      .then((response) => {
        const weatherData = response.data;
  
        bot.sendMessage(chatId, weatherData);
      })
      .catch((error) => {
        console.error('Ошибка при получении информации о погоде:', error);
        bot.sendMessage(chatId, 'Не удалось получить информацию о погоде.');
      });
});

bot.onText(/\/joke/, (msg) => {
    const chatId = msg.chat.id;
  
    axios.get('https://v2.jokeapi.dev/joke/Any?type=single')
      .then((response) => {
        const joke = response.data.joke;
        bot.sendMessage(chatId, joke);
      })
      .catch((error) => {
        console.error('Ошибка при получении случайной шутки:', error);
        bot.sendMessage(chatId, 'Не удалось получить случайную шутку.');
      });
});

bot.onText(/\/cat/, (msg) => {
    const chatId = msg.chat.id;
  
    axios.get('https://api.thecatapi.com/v1/images/search')
    .then((response) => {
      const imageUrl = response.data[0].url;
      return axios.get(imageUrl, { responseType: 'arraybuffer' });
    })
    .then((imageResponse) => {
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');
      bot.sendPhoto(chatId, imageBuffer);
    })
    .catch((error) => {
      console.error('Ошибка при получении случайного изображения кота:', error);
      bot.sendMessage(chatId, 'Не удалось получить случайное изображение кота.');
    });
});