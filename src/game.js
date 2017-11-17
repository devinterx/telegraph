import TelegramBot from 'node-telegram-bot-api';
import Database from "./Database/Database"
import User from "./User/User"
import Scene from "./Scene/Scene"

const TOKEN = '';

class VictorianoBot {
    _bot;

    constructor(token, options) {
        this._bot = new TelegramBot(token, options);
        Database.init();
        User.addResponseChannel(this._bot);
        this._listen();
    }

    _listen = () => {
        this._bot.on('message', this.onMessage);
        this._bot.on('polling_error', this.onError);

        setInterval(VictorianoBot.gc, 3600000);

        console.log(`Victoriano: i'am listen your dreams now.`);
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
        console.log(error);
    };

    static gc = () => {
        console.log(`Victoriano: start unloading inactive dreams.`);
        User.unloadInactiveUsers();
        Scene.unloadInactiveScenes();
    };
}

new VictorianoBot(process.env.BOT_TOKEN || TOKEN, {polling: true});
