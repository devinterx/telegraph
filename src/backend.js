// require('babel-register'); // TODO:: delete this, in production by webpack(delete .map instead)
import TelegramBot from 'node-telegram-bot-api'
import Express from 'express'
import Database from "./Database/Database"
import User from "./User/User"
import Scene from "./Scene/Scene"
import WebServer from "./Web/WebServer"
import React from "react";

const TOKEN = '';

class VictorianoBot {
    _bot;
    _server;

    constructor(token, options) {
        this._bot = new TelegramBot(token, options.bot);
        this._server = Express();
        Database.init();
        WebServer.init(this._server, Express);
        User.addResponseChannel(this._bot);
        this._listen(options);
    }

    _listen = options => {
        this._bot.on('message', this.onMessage);
        this._bot.on('polling_error', this.onError);

        this._server.listen(
            options && options.web ? options.web.port || 8080 : 8080,
            options && options.ip ? options.web.ip || '0.0.0.0' : '0.0.0.0',
            this.onError);

        setInterval(VictorianoBot.gc, 3600000);

        console.log(`Victoriano: i'am listen your dreams now. \r\n\tWeb interface: http://127.0.0.1:${
            options && options.web ? options.web.port || 8080 : 8080}.`
        );
    };

    onMessage = context => {
        if (context.from['is_bot'] === true) return;

        User.loadUser(context.from, user => {
            if (context.text === '/start') {
                user.onJoin();
            } else {
                user.onMessage(context.text.toString());
            }
        });
    };

    onError = error => {
        if (error !== undefined) console.log(error);
    };

    static gc = () => {
        console.log(`Victoriano: start unloading inactive dreams.`);
        User.unloadInactiveUsers();
        Scene.unloadInactiveScenes();
    };
}

new VictorianoBot(process.env.BOT_TOKEN || TOKEN, {web: {ip: '127.0.0.1', port: 8080}, bot: {polling: true}});
