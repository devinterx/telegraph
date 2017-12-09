import TelegramBot from "node-telegram-bot-api"
import Express from "express"

import Database from "./backend/Database/Database"
import User from "./backend/User/User"
import Scene from "./backend/Scene/Scene"
import WebServer from "./backend/Web/WebServer"

import fs from "fs"
import path from "path"

require('babel-register');

const TOKEN = '';
const CONFIG_FILE = "./config.json";

class TelegraphBot {
    _bot;
    _server;

    constructor(token, config) {
        if (config.services.bot) this._bot = new TelegramBot(token, config.bot);
        if (config.services.web) this._server = Express();

        Database.init(config.db, () => {
            if (this._server) WebServer.init(this._server, Express);
            if (this._bot) User.addResponseChannel(this._bot);
            this._listen(config);
        });
    }

    _listen = options => {
        if (this._bot) this._bot.on('message', this.onMessage);
        if (this._bot) this._bot.on('callback_query', this.onCallbackQuery);
        if (this._bot) this._bot.on('polling_error', this.onError);

        if (this._server) this._server.listen(
            options && options.web ? options.web.port || 8080 : 8080,
            options && options.ip ? options.web.ip || '0.0.0.0' : '0.0.0.0',
            this.onError);

        setInterval(TelegraphBot.gc, 3600000);

        console.log(`Victoriano: i'am listen your dreams now. \r\n\tWeb interface: http://127.0.0.1:${
            options && options.web ? options.web.port || 8080 : 8080}.`
        );
    };

    onMessage = context => {
        if (context.from['is_bot'] === true) return;

        User.loadUser(context.from, user => {
            if (context.text.startsWith('/')) {
                user.onCommand(context.text);
            } else {
                user.onMessage(context.text.toString());
            }
        });
    };

    onCallbackQuery = context => {
        if (context.from['is_bot'] === true) return;

        User.loadUser(context.from, user => {
            user.onCommandCallback(context.data.toString(), context);
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

export class Telegraph {
    static CONFIG;

    static get WebHost() {
        return Telegraph.CONFIG['web']['host'];
    }

    constructor(token) {
        const file = path.resolve(CONFIG_FILE);

        fs.access(file, fs.R_OK, error => {
            if (error) return console.log(`Victoriano: config file "${CONFIG_FILE}" not found.`);

            fs.readFile(file, 'utf8', (error, config) => {
                if (error) throw Error('Telegraph: error read config.');
                Telegraph.CONFIG = JSON.parse(config);
                new TelegraphBot(token, Telegraph.CONFIG);
            });
        });
    }
}

new Telegraph(process.env.BOT_TOKEN || TOKEN);
