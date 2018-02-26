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
    avatar = false;

    data;

    _lastUpdateTime = 0;

    static _channel;
    static _token;
    static _users = [];
    static online = 0;

    /**
     * @param {{id, first_name, last_name, username, language_code: string}|User} user
     */
    constructor(user) {
        this.id = user.id;
        this.firstName = user.firstName || user.first_name;
        this.lastName = user.lastName || user.last_name;
        this.userName = user.userName || user.username;
        this.languageCode = user.languageCode || user.language_code;
        this.avatar = user.avatar || false;
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

    checkAndUpdateAvatar = () => {
        // const profile = User._channel.getUserProfilePhotos(session.userId);
        // profile.then(resources => {
        //     const fileId = resources.photos[0][0].file_id;
        //     if (fileId) {
        //         const file = User._channel.getFile(fileId);
        //         file.then(result => {
        //             const path = result.file_path;
        //             this.avatar = `https://api.telegram.org/file/bot${User._token}/${path}`;
        //         });
        //     } else {
        //         this.avatar = false
        //     }
        // });
    };

    last = () => {
        this._lastUpdateTime = Date.now();
        return this;
    };

    static addResponseChannel(channel, token) {
        User._channel = channel;
        User._token = token;
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
            if (!(user instanceof User)) user = (new User(user)).last();

            Database.find('users', {id: user.id}, users => {
                if (users !== null && users.length > 0) {
                    // update user, load him and async (check & update avatar)
                    let _user = new User(users[0]).last();
                    if (_user.languageCode !== user.languageCode
                        || _user.firstName !== user.firstName
                        || _user.lastName !== user.lastName
                        || _user.userName !== user.userName
                    ) {
                        _user.languageCode = user.languageCode;
                        _user.firstName = user.firstName;
                        _user.lastName = user.lastName;
                        _user.userName = user.userName;
                    }

                    User._users[_user.id] = _user;
                    User.online++;
                    _user.checkAndUpdateAvatar();
                    callback(User._users[_user.id]);
                } else {
                    // create user, load him and upload avatar
                    Database.save('users', {id: user.id}, user, () => {
                        User._users[user.id] = user;
                        User.online++;
                        user.checkAndUpdateAvatar();
                        callback(User._users[user.id]);
                    });
                }
            });
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
            User.online--;
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
        if (count > 0) console.log(`Telegraph: unloaded ${count} users dreams`)
    }

    /* Web Request (CRUD) */
    static REST = {
        listUsers: (request, response) => {
            let limit = !isNaN(parseInt(request.query.limit)) ? parseInt(request.query.limit) : 50;
            let offset = !isNaN(parseInt(request.query.offset)) ? parseInt(request.query.offset) : 0;
            Database.list('users', {}, (users, count) => {
                if (users !== null) {
                    response.json({users, count});
                } else {
                    response.status(409).json({error: 'Users not exist'});
                }
            }, limit, offset);
        },

        getUser: (request, response) => {
            let userId = request.params.id;
            if (typeof userId === 'number') userId = userId.toString();
            Database.find('users', {id: userId}, users => {
                if (users !== null && users.length > 0) {
                    response.json({user: users[0]});
                } else {
                    response.status(409).json({error: 'User with this id not exist'});
                }
            });
        },

        createUser: (request, response) => {
            let user = request.body['user'];
            if (typeof user.id === 'number') user.id = user.id.toString();
            Database.find('users', {id: user.id}, results => {
                if (results === null) {
                    user = new User(user);
                    user._lastUpdateTime = Date.now();
                    Database.save('users', {id: user.id}, Object.assign({}, user), () => {
                        response.json({error: false, message: 'User created'});
                    });
                } else {
                    response.status(409).json({error: 'User with this id exist'});
                }
            });
        },

        updateUser: (request, response) => {
            let user = request.body['user'];
            user.id = request.params.id;
            if (typeof user.id === 'number') user.id = user.id.toString();
            Database.find('users', {id: user.id}, results => {
                if (results !== null) {
                    user = new User(user);
                    user._lastUpdateTime = Date.now();
                    Database.save('users', {id: user.id}, Object.assign({}, user), () => {
                        response.json({error: false, message: 'User updated'});
                    });
                } else {
                    response.status(409).json({error: 'User with this id not exist'});
                }
            });
        },

        deleteUser: (request, response) => {
            let userId = request.params.id;
            if (typeof userId === 'number') userId = userId.toString();
            Database.find('users', {id: userId}, results => {
                if (results !== null) {
                    Database.remove('users', {id: userId}, () => {
                        delete User._users[userId];
                        response.json({error: false, message: 'User deleted'});
                    });
                    response.json({error: false, message: 'User deleted'});
                } else {
                    response.status(409).json({error: 'User with this id not exist'});
                }
            });
        },

        getOnline: (request, response) => {
            response.json({online: User.online});
        },

        getMeInfo: (request, response, session) => {
            Database.find('users', {id: session.userId}, users => {
                if (users !== null && users.length > 0) {
                    const user = users[0];
                    response.json({
                        id: session.userId,
                        permission: session.permission,
                        language: user.languageCode,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userName: user.userName,
                        avatar: user.avatar || false
                    });
                } else {
                    response.status(409).json({error: 'User data in database incorrect'});
                }
            });
        }
    };
}

class UserData {
    permission = PERMISSION.USER;
    scene = '00_init_scene';
    state = 0;
    item = false;
    inventory = false;
}
