import Database from "../Database/Database"
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
        this._processSceneMessages(this.data.scene, this.data.state);
    };

    _loadUserSceneStage(scene, state, callback) {
        Scene.loadScene(scene, scene => {
            callback(scene.getState(state).messages);
        });
    }

    onMessage = message => {
        Scene.loadScene(this.data.scene, scene => {
            let answers = scene.getState(this.data.state)['answers'];
            let trigger = false;
            if (answers[message] !== undefined) {
                if (answers[message].scene !== undefined && this.data.scene !== answers[message].scene) {
                    this.data.scene = answers[message].scene;
                    trigger = true;
                }
                if (answers[message].state !== undefined && this.data.state !== answers[message].state) {
                    this.data.state = answers[message].state;
                    trigger = true;
                }
            } else if (answers['*'] !== undefined) { // любое сообщение
                if (answers['*'].scene !== undefined && this.data.scene !== answers['*'].scene) {
                    this.data.scene = answers['*'].scene;
                    trigger = true;
                }
                if (answers['*'].state !== undefined && this.data.state !== answers['*'].state) {
                    this.data.state = answers['*'].state;
                    trigger = true;
                }
            }

            if (trigger) {
                this.saveUser(user => {
                    this._processSceneMessages(user.data.scene, user.data.state);
                });
            } else if (answers['*'] !== undefined) {
                this._processSceneMessages(this.data.scene, this.data.state);
            }
        });
    };

    _processSceneMessages = (scene, state) => {
        this._loadUserSceneStage(scene, state, messages => {
            for (let i = 0; i < messages.length; i++) {
                setTimeout(() => {
                    this.sendMessage(messages[i].text, messages[i].options);
                }, 200 * i);
            }
        });
    };

    sendMessage = (message, options) => {
        message = message.replace('%ufn', this.firstName);
        message = message.replace('%uln', this.lastName);

        User._channel.sendMessage(this.id, message, options).catch(error => this.onError);
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
