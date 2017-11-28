import Database from "../Database/Database"
import Command from "../Command/Command"
import Scene from "../Scene/Scene"

export default class User {
    id;
    firstName;
    lastName;
    userName;

    data;

    _lastUpdateTime = 0;

    static _channel;
    static _users = [];

    /**
     * @param {{id:int, first_name:string, last_name:string, user_name:string, data:UserData|object}} user
     */
    constructor(user) {
        this.id = parseInt(user.id);
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.userName = user.user_name;
        this.data = user.data;
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

    loadUserSceneStage(scene, state, callback) {
        Scene.loadScene(scene, scene => {
            callback(scene.getState(state).messages);
        });
    }

    sendMessage = (message, options) => {
        message = message.replace('%ufn', this.firstName);
        message = message.replace('%uln', this.lastName);

        User._channel.sendMessage(this.id, message, options).catch(this.onError);
    };

    onError = error => {
        console.log(error);
    };

    saveUser = (callback) => {
        Database.save(`users/${this.id}`, Object.assign({}, User._users[this.id]), user => {
            callback(user);
        });
    };

    static addResponseChannel(channel) {
        User._channel = channel;
    }

    static loadUser(user, callback) {
        user = Object.assign({}, user);
        if (typeof user.id === 'number') user.id = user.id.toString();
        if (User._users[user.id] === undefined) {
            Database.load(`users/${user.id}`, Object.assign({}, user, {data: new UserData()}), user => {
                User._users[user.id] = new User(user);
                User._users[user.id]._lastUpdateTime = Date.now();
                callback(User._users[user.id]);
            });
        } else {
            User._users[user.id]._lastUpdateTime = Date.now();
            callback(User._users[user.id]);
        }
    }

    static unloadUser(user) {
        user = Object.assign({}, user);
        if (typeof user.id === 'number') user.id = user.id.toString();
        Database.save(`users/${user.id}`, Object.assign({}, user), user => {
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
        if (count > 0) console.log(`Victoriano: unloaded ${count} users dreams.`)
    }
}

class UserData {
    scene = '00_init_scene';
    state = 0;
    item = false;
    inventory = false;
}
