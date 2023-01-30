"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// import express from "express";
// declare module 'cron';
// import fetch, { Headers, } from "node-fetch";
var dotenv = require("dotenv");
var cron = require("cron");
var winston = require("winston");
var _a = require("twitter-api-v2"), TwitterApi = _a.TwitterApi, ETwitterStreamEvent = _a.ETwitterStreamEvent, ETwitterApiError = _a.ETwitterApiError, TweetStream = _a.TweetStream;
// import dateFormat from "dateformat";
var DateTimeFormat = require('intl').DateTimeFormat;
// const app = express();
// const PORT = process.env.PORT || 3001;
dotenv.config();
var logger = winston.createLogger({
    level: 'error',
    transports: [new winston.transports.File({ filename: 'error.log' })]
});
var ratesLogger = winston.createLogger({
    level: "rates",
    transports: [new winston.transports.File({ filename: 'rates.json' })]
});
var client = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_KEY_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET
});
var bearerClient = new TwitterApi(process.env.BEARER_TOKEN);
var myID = "1272709903325507589";
// var client = new TwitterApi(process.env.BEARER_TOKEN);
var haves = {
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP"
};
function convertTo(cur) {
    return __awaiter(this, void 0, void 0, function () {
        var res, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://api.api-ninjas.com/v1/convertcurrency?have=" +
                            cur +
                            "&want=GHS&amount=1", { headers: { "X-Api-Key": process.env.CURRENCY_CONVERTER_API_KEY } })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    // console.log(res.body)
                    return [2 /*return*/, data];
                case 3:
                    error_1 = _a.sent();
                    console.log("something went wrong" + error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getExchangeRates() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            convertTo("USD"),
                            convertTo("EUR"),
                            convertTo("GBP"),
                        ])];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    console.log("Something went wrong while getExhangeRates" + error_2);
                    logger.error(error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getExchangeRate(cur, amount) {
    var _a;
    if (amount === void 0) { amount = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var headers, result, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    headers = new Headers();
                    headers.append('X-Api-Key', (_a = process.env.CURRENCY_CONVERTER_API_KEY) !== null && _a !== void 0 ? _a : '');
                    return [4 /*yield*/, fetch("https://api.api-ninjas.com/v1/convertcurrency?have=" +
                            cur +
                            "&want=GHS&amount=" +
                            amount, 
                        // { headers: { "X-Api-Key": process.env.CURRENCY_CONVERTER_API_KEY } }
                        { headers: headers }).then(function (res) { return res.json(); })
                        // result = await result.json();
                    ];
                case 1:
                    result = _b.sent();
                    // result = await result.json();
                    return [2 /*return*/, result];
                case 2:
                    err_1 = _b.sent();
                    // res.json({ err });
                    logger.error(err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var now = Date();
// app.get("/", async function (req, res) {
var TweetDailyExchangeRates = function () { return __awaiter(void 0, void 0, void 0, function () {
    var tweet, data, options, date, result, error_3;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, getExchangeRates()];
            case 1:
                data = _d.sent();
                options = { year: 'numeric', month: 'long', weekday: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
                date = DateTimeFormat('en-US', options).format(new Date());
                tweet =
                    date +
                        "\n \n 1 💵 USD >>>> GH¢ " +
                        ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.new_amount) +
                        " \n 1 💶 EUR >>>> GH¢ " +
                        ((_b = data[1]) === null || _b === void 0 ? void 0 : _b.new_amount) +
                        " \n 1 💷 GBP >>>> GH¢ " +
                        ((_c = data[2]) === null || _c === void 0 ? void 0 : _c.new_amount) +
                        " \n \n v1.1.0";
                _d.label = 2;
            case 2:
                _d.trys.push([2, 4, , 5]);
                return [4 /*yield*/, client.v2.tweet(tweet)];
            case 3:
                result = _d.sent();
                //   res.json({ result });
                console.log(result);
                return [3 /*break*/, 5];
            case 4:
                error_3 = _d.sent();
                console.log(error_3);
                logger.error(error_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
var job = new cron.CronJob('00 00 09 * * *', TweetDailyExchangeRates);
job.start();
var callback = function (res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, reply, match, amount, from, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                data = res.data;
                // const mention = req.body;
                if (data.author_id === myID) {
                    return [2 /*return*/];
                }
                console.log(data);
                match = data.text.match(/(@newtroahmed)\s*(\d+\.\d+|\d+)\s*([USD|EUR|GBP]{3})/);
                if (!match) {
                    // reply = "Invalid mention format. Try @cedi_rates " + Math.floor(Math.random() * 1000) + " USD"
                    return [2 /*return*/];
                    // return await client.v2.reply(reply, data.id )
                    // res.status(200).send("Invalid mention format. Try @newtroahmed 10 USD")
                }
                amount = match[2];
                from = match[3].toUpperCase();
                return [4 /*yield*/, getExchangeRate(from, amount)];
            case 1:
                result = _a.sent();
                reply = "The equivalent of ".concat(amount, " ").concat(from, " is ").concat(result === null || result === void 0 ? void 0 : result.new_amount, " GHS. \n \n Thank you for using this bot \uD83D\uDE0E");
                return [4 /*yield*/, client.v2.reply(reply, data.id)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
bearerClient.v2.updateStreamRules({
    add: [{ value: "@newtroahmed", tag: "mentions" }]
});
var stream = bearerClient.v2.searchStream({
    autoConnect: false,
    expansions: ["author_id"]
});
var connect = function () {
    stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });
};
var restartStream = function (err) {
    stream.close(),
        // stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity }),
        connect();
    console.log("connection error, restart", err);
    logger.error(err);
};
console.log(stream.data);
// Emitted only on initial connection success
stream.on(ETwitterStreamEvent.Connected, function () {
    return console.log("Stream is started.");
});
stream.on(ETwitterStreamEvent.ConnectError, function (err) { return restartStream(err); });
stream.on(ETwitterStreamEvent.Data, function (data) { return callback(data); });
stream.on(
// Emitted when Node.js {response} is closed by remote or using .close().
ETwitterStreamEvent.ConnectionClosed, function () { return console.log("Connection has been closed."); });
connect();
// app.get("/test", (req, res) => {
//   res.send("Platform ok");
// });
// app.listen(PORT, function () {
//   console.log("server started on port " + PORT);
// });
