const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const airtableApiKey = 'key6iKNmX2Ynpo6k8';
const airtableBase = 'appFRjFTs1w91uxZj';
const airtableTable = 'Payments';
const telegramToken = '6317272869:AAFmXuvtU1XafPuMxVC7rqIMLrF59P9TJVk';
const chatIds = ['5272022550', '593152072']; // Add your chat IDs here

let lastRecordTime = null;
let lastYuliaValue = null;

const bot = new TelegramBot(telegramToken, { polling: true });

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!'); // Replace this with your desired route handler or remove it if not needed
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

setInterval(async () => {
  try {
    const response = await axios.get(`https://api.airtable.com/v0/${airtableBase}/${airtableTable}`, {
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
      },
      params: {
        sort: [{ field: 'createdTime', direction: 'desc' }],
        maxRecords: 1,
      },
    });

    const record = response.data.records[0];
    const yuliaCheckbox = record.fields.Yulia;

    // If the Yulia checkbox has changed from false to true
    if (yuliaCheckbox && !lastYuliaValue) {
      lastYuliaValue = yuliaCheckbox;

      const amount = record.fields.Amount;
      const trafficSource = record.fields.TrafficSource;
      const buyerName = record.fields.Buyer_Name;
      const buyerUsername = record.fields.Buyer_Username;
      const service = record.fields.Service;
      const serviceInfo = record.fields.ServiceInfo;

      const message = `Paid: ${amount}\nTraffic Source: ${trafficSource}\nBuyer Name: ${buyerName}\nService: ${service}\nServiceInfo: ${serviceInfo}`;

      for (const chatId of chatIds) {
        await bot.sendMessage(chatId, message);
      }
    } else {
      lastYuliaValue = yuliaCheckbox;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}, 10000);
