import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch'
// import Twitter from 'twitter';
import { TwitterApi , ETwitterStreamEvent , ETwitterApiError ,TweetStream} from 'twitter-api-v2';
import dateFormat from 'dateformat'

const app = express();
const PORT = process.env.PORT || 3001;
dotenv.config()


// var client = Twitter({
//     consumer_key: process.env.API_KEY,
//     consumer_secret: process.env.API_KEY_SECRET,
//     access_token_key: process.env.ACCESS_TOKEN,
//     access_token_secret: process.env.ACCESS_TOKEN_SECRET,
// });
var client = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_KEY_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    // bearerToken:process.env.BEARER_TOKEN

})
var bearerClient = new TwitterApi(process.env.BEARER_TOKEN)
const myID = '1272709903325507589'
// var client = new TwitterApi(process.env.BEARER_TOKEN);
const haves = {
    "USD": "USD",
    "EUR": "EUR",
    "GBP": "GBP"
}
async function convertTo(cur) {
    try {
        let res = await fetch('https://api.api-ninjas.com/v1/convertcurrency?have=' + cur + '&want=GHS&amount=1',
            { headers: { 'X-Api-Key': process.env.CURRENCY_CONVERTER_API_KEY } });
        // console.log(res)
        let data = await res.json();
        // console.log(res.body)
        return data;

    } catch (error) {
        console.log('something went wrong' + error)
    }
}
async function getExchangeRates() {
    try {
        return await Promise.all([
            convertTo("USD"),
            convertTo("EUR"),
            convertTo("GBP"),
        ])

    } catch (error) {
        console.log('Something went wrong while getExhangeRates' + error)
    }
}
async function getExchangeRate(cur, amount = 1) {
    try {
        let result = await fetch('https://api.api-ninjas.com/v1/convertcurrency?have=' + cur + '&want=GHS&amount='+amount,
            { headers: { 'X-Api-Key': process.env.CURRENCY_CONVERTER_API_KEY } });
        result = result.json()
        return result;
    } catch (err) {
        res.json({ err })
    }
}
const now = Date();
let tweet;
app.get('/', async function (req, res) {
    const data = await getExchangeRates()
    let date = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
    tweet = date + "\n \n 1 💵 USD >>>> GH¢ " + data[0]?.new_amount + " \n 1 💶 EUR >>>> GH¢ " + data[1]?.new_amount + " \n 1 💷 GBP >>>> GH¢ " + data[2]?.new_amount + " \n \n v1.1.0"
    // client.post('statuses/update',{status:tweet}).then(tweet=> console.log('tweeted '+ tweet)).catch(e=>console.log(e))
    // res.json(tweet);
    try {
        let result = await client.v2.tweet(tweet);
        res.json({ result })
        // let me = await client.v2.me();
        // res.json({me})
    } catch (error) {
        console.log(error)
        res.json({ error, status: error.status })
    }
});

// const me = await client.v2.me()
// console.log(me)
const callback = async({data}) => {
    // const mention = req.body;
    if(data.author_id === '1272709903325507589' ) {
        return
    }
    console.log(data)
    // console.log(data.text.split("@newtroahmed "))
    // const mentionText = data.text.split('@newtroahmed ')[1]
    let reply;

    const match = data.text.match(/(@newtroahmed)\s*(\d+\.\d+|\d+)\s*([A-Z]{3})/)
    if (!match) {
        // reply = "Invalid mention format. Try @cedi_rates " + Math.floor(Math.random() * 1000) + " USD"
        return
        // return await client.v2.reply(reply, data.id )
        // res.status(200).send("Invalid mention format. Try @newtroahmed 10 USD")
    }
    const amount = match[2]
    const from = match[3].toUpperCase()
    const result = await getExchangeRate(from,amount)
    reply = `The equivalent of ${amount} ${from} is ${result?.new_amount} GHS. \n \n Thank you for using this bot 😎`
    await client.v2.reply(reply, data.id );
}
await bearerClient.v2.updateStreamRules({ add: [{value:'@newtroahmed', tag:'mentions'}] })
const stream = await bearerClient.v2.searchStream({autoConnect:true , expansions:["author_id"]})
// console.log(stream)
// stream.autoReconnect = true;
console.log(stream.data)
stream.on(
    ETwitterStreamEvent.ConnectError, err=> console.log('connection error',err)
)
stream.on(
    ETwitterStreamEvent.Data, (data)=> callback(data)
)

app.get("/test",(req,res)=> {
    res.send('Platform ok')
})

app.listen(PORT, function () {
    console.log('server started on port ' + PORT);
})