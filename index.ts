
// import express from "express";
// declare module 'cron';
// import fetch, { Headers, } from "node-fetch";
import * as dotenv from 'dotenv'
import * as cron from 'cron'
import * as winston from 'winston'
// import * as fs from 'fs'

type Currency = "USD" | "EUR" | "GBP"
const {
  TwitterApi,
  ETwitterStreamEvent,
  ETwitterApiError,
  TweetStream,
} = require("twitter-api-v2");
// import dateFormat from "dateformat";
const { DateTimeFormat } = require('intl')
interface StreamResponseData {
  data: {
    text: string,
    id: string,
    author_id: string,
  }
}
// const app = express();
// const PORT = process.env.PORT || 3001;
dotenv.config();
const logger = winston.createLogger({
  level: 'error',
  transports: [new winston.transports.File({ filename: 'error.log' })]
})
const ratesLogger = winston.createLogger({
  level:"rates",
  transports: [new winston.transports.File({filename:'rates.json'})]
})



var client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_KEY_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
  // bearerToken:process.env.BEARER_TOKEN
});
var bearerClient = new TwitterApi(process.env.BEARER_TOKEN);
const myID = "1272709903325507589";
// var client = new TwitterApi(process.env.BEARER_TOKEN);
const haves = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
};
async function convertTo(cur:Currency) {
  try {
    let res = await fetch(
      "https://api.api-ninjas.com/v1/convertcurrency?have=" +
      cur +
      "&want=GHS&amount=1",
      { headers: { "X-Api-Key": process.env.CURRENCY_CONVERTER_API_KEY } }
    );
    // console.log(res)
    let data = await res.json();
    // console.log(res.body)
    return data;
  } catch (error) {
    console.log("something went wrong" + error);
  }
}
async function getExchangeRates(): Promise<Array<any>> {
  try {
    return await Promise.all([
      convertTo("USD"),
      convertTo("EUR"),
      convertTo("GBP"),
    ]);
  } catch (error) {

    console.log("Something went wrong while getExhangeRates" + error);
    logger.error(error)
    return []
  }
}
interface ExchangeRateResponse {
  new_amount:string,
}
async function getExchangeRate(cur: Currency, amount: string | number = 1):Promise<ExchangeRateResponse | unknown >{
  try {
    const headers = new Headers()

    headers.append('X-Api-Key', process.env.CURRENCY_CONVERTER_API_KEY ?? '')
    let result:ExchangeRateResponse | unknown = await fetch(
      "https://api.api-ninjas.com/v1/convertcurrency?have=" +
      cur +
      "&want=GHS&amount=" +
      amount,
      // { headers: { "X-Api-Key": process.env.CURRENCY_CONVERTER_API_KEY } }
      { headers }
    ).then(res=> res.json())
    
    // result = await result.json();
    return result;

  } catch (err) {
    // res.json({ err });
    logger.error(err)

  }
}
const now = Date();
// app.get("/", async function (req, res) {
const TweetDailyExchangeRates = async () => {
  let tweet:string;

  const data = await getExchangeRates();

  // let date = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
  let options = { year: 'numeric', month: 'long', weekday: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', }
  let date = DateTimeFormat('en-US', options).format(new Date())

  tweet =
    date +
    "\n \n 1 💵 USD >>>> GH¢ " +
    data[0]?.new_amount +
    " \n 1 💶 EUR >>>> GH¢ " +
    data[1]?.new_amount +
    " \n 1 💷 GBP >>>> GH¢ " +
    data[2]?.new_amount +
    " \n \n v1.1.0";
  // client.post('statuses/update',{status:tweet}).then(tweet=> console.log('tweeted '+ tweet)).catch(e=>console.log(e))
  // res.json(tweet);
  try {
    let result = await client.v2.tweet(tweet);
    //   res.json({ result });
    console.log(result);
    // let me = await client.v2.me();
    // res.json({me})
  } catch (error) {
    console.log(error);
    logger.error(error)
    //   res.json({ error, status: error.status });
  }
  // });

  // const me = await client.v2.me()
  // console.log(me)
};
const job = new cron.CronJob('00 00 09 * * *', TweetDailyExchangeRates)
job.start()

const callback = async (res: StreamResponseData) => {
  const data = res.data;
  // const mention = req.body;
  if (data.author_id === myID) {
    return;
  }
  console.log(data);
  // console.log(data.text.split("@newtroahmed "))
  // const mentionText = data.text.split('@newtroahmed ')[1]
  let reply;

  const match = data.text.match(/(@newtroahmed)\s*(\d+\.\d+|\d+)\s*([USD|EUR|GBP]{3})/);
  if (!match) {
    // reply = "Invalid mention format. Try @cedi_rates " + Math.floor(Math.random() * 1000) + " USD"
    return;
    // return await client.v2.reply(reply, data.id )
    // res.status(200).send("Invalid mention format. Try @newtroahmed 10 USD")
  }
  const amount = match[2];
  const from = match[3].toUpperCase() as Currency;
  const result = await getExchangeRate(from, amount) as ExchangeRateResponse;
  reply = `The equivalent of ${amount} ${from} is ${result?.new_amount} GHS. \n \n Thank you for using this bot 😎`;
  await client.v2.reply(reply, data.id);
};
bearerClient.v2.updateStreamRules({
  add: [{ value: "@newtroahmed", tag: "mentions" }],
});
const stream = bearerClient.v2.searchStream({
  autoConnect: false,
  expansions: ["author_id"],
});

const connect = () => {
  stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });
};
const restartStream = (err:Error) => {
  stream.close(),
    // stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity }),
    connect();
  console.log("connection error, restart", err);
  logger.error(err)
};
console.log(stream.data);
// Emitted only on initial connection success
stream.on(ETwitterStreamEvent.Connected, () =>
  console.log("Stream is started.")
);

stream.on(ETwitterStreamEvent.ConnectError, (err: Error) => restartStream(err));
stream.on(ETwitterStreamEvent.Data, (data: StreamResponseData) => callback(data));

stream.on(
  // Emitted when Node.js {response} is closed by remote or using .close().
  ETwitterStreamEvent.ConnectionClosed,
  () => console.log("Connection has been closed.")
);

connect();
// app.get("/test", (req, res) => {
//   res.send("Platform ok");
// });

// app.listen(PORT, function () {
//   console.log("server started on port " + PORT);
// });

