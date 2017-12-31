import Database from "../Database/Database"
import Command from "../Command/Command"
import Scene from "../Scene/Scene"
import {PERMISSION} from "../Auth/Auth";

export default class User {
    id;
    firstName;
    lastName;
    userName;
    languageCode = 'en';

    data;

    _lastUpdateTime = 0;

    static _channel;
    static _users = [];

    /**
     * @param {{id, first_name, last_name, username, language_code: string}|User} user
     */
    constructor(user) {
        this.id = user.id;
        this.firstName = user.firstName || user.first_name;
        this.lastName = user.lastName || user.last_name;
        this.userName = user.userName || user.username;
        this.languageCode = user.languageCode || user.language_code;
        this.data = user.data || new UserData();
    }

    onJoin = () => {
        Scene.loadScene(this.data.scene, scene => {
            scene.processMessages(this);
        });
    };

    onCommand = message => {
        if (message === '/start') return this.onJoin();
        Command.onCommand(message.substring(1), this);
    };

    onMessage = message => {
        Scene.loadScene(this.data.scene, scene => {
            scene.processSceneMessages(this, message);
        });
    };

    onCommandCallback = (data, context) => {
        Command.onCommandCallback(data, this, context);
    };

    loadUserSceneStage = (scene, state, callback) => {
        Scene.loadScene(scene, scene => {
            callback(scene.getState(state).messages);
        });
    };

    sendMessage = (message, options, callback) => {
        message = message.replace('%ufn', this.firstName);
        message = message.replace('%uln', this.lastName);

        User._channel.sendMessage(this.id, message, options).then(context => {
            if (callback && typeof callback === 'function') callback(this, context);
        }).catch(this.onError);
    };

    removeMessage = (messageId, chatId) => {
        User._channel.deleteMessage(chatId || this.id, messageId).catch(this.onError);
    };

    onError = error => {
        console.log(error);
    };

    saveUser = callback => {
        Database.save('users', {id: this.id}, Object.assign({}, User._users[this.id]), user => {
            callback(user);
        });
    };

    static addResponseChannel(channel) {
        User._channel = channel;
    }

    /**
     * @callback loadUserCallback
     * @param {User} user
     */

    /**
     * @param {User} user
     * @param {loadUserCallback} callback
     */
    static loadUser(user, callback) {
        user = Object.assign({}, user);
        if (typeof user.id === 'number') user.id = user.id.toString();

        if (User._users[user.id] === undefined) {
            if (!(user instanceof User)) user = new User(user);
            user._lastUpdateTime = Date.now();

            Database.load('users', {id: user.id}, () => {
                User._users[user.id] = user;
                callback(User._users[user.id]);
            }, Object.assign({}, user));
        } else {
            User._users[user.id]._lastUpdateTime = Date.now();
            callback(User._users[user.id]);
        }
    }

    static unloadUser(user) {
        user = Object.assign({}, user);
        if (typeof user.id === 'number') user.id = user.id.toString();
        Database.save('users', {id: user.id}, Object.assign({}, user), user => {
            delete User._users[user.id];
        });
    }

    static unloadInactiveUsers() {
        let count = 0;
        this._users.map(user => {
            if (user._lastUpdateTime + 3600000 < Date.now()) {
                User.unloadUser(user);
                count++;
            }
        });
        if (count > 0) console.log(`Telegraph: unloaded ${count} users dreams.`)
    }
}

class UserData {
    permission = PERMISSION.USER;
    scene = '00_init_scene';
    state = 0;
    item = false;
    inventory = false;
}
