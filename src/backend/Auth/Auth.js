import Database from "../Database/Database";
import {Telegraph} from "../../backend";

export const PERMISSION = {
    USER: 0,
    ADMINISTRATOR: 1
};

export const session = (request, response, next) => {
    if (request.path.startsWith('/api')) {
        const token = request.cookies['token'];
        if (token === undefined) {
            return response.status(403).json({error: 'Not authorized'});
        } else {
            Database.count('sessions', {token}, count => {
                if (count === 0) {
                    response.clearCookie('token', {httpOnly: true});
                    response.status(403).json({error: 'Not authorized'});
                } else next();
            });
        }
    } else next();
};

export default class Auth {
    /**
     * @param {User} user
     * @param {Array} data
     * @param {function} callback
     * @param context
     */
    static onCommand(user, data, callback, context) {
        Database.find('sessions', {userId: user.id}, sessions => {
            if (sessions === null) {
                user.sendMessage('Active sessions not found.', {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{text: 'Get new token', callback_data: 'auth login'}],
                            [{text: 'Close authorization', callback_data: 'auth close'}]
                        ]
                    })
                });
            } else {
                let buttons = [];

                for (let i = 0; i < sessions.length; i++) {
                    buttons.push([
                        {text: sessions[i].date || sessions[i].token, callback_data: 'auth token'},
                        {text: 'Use', callback_data: `auth login ${sessions[i].token}`},
                        {text: 'Sign out', callback_data: `auth logout ${sessions[i].token}`}
                    ]);
                }

                buttons.push([{text: 'Create new token', callback_data: 'auth login new'}]);
                buttons.push([{text: 'Logout all, and create new token', callback_data: 'auth logout new'}]);
                buttons.push([{text: 'Logout all', callback_data: 'auth logout all'}]);
                buttons.push([{text: 'Close authorization', callback_data: 'auth close'}]);

                user.sendMessage('Found active sessions:', {
                    reply_markup: JSON.stringify({
                        inline_keyboard: buttons
                    })
                });
            }
        });
    }

    /**
     * @param {User} user
     * @param {Array} data
     * @param {function} callback
     * @param context
     */
    static onCommandCallback(user, data, callback, context) {
        switch (data[0]) {
            case 'login':
                if (data[1] === undefined || data[1] === 'new') {
                    const token = (new Token()).toString();
                    Database.save('sessions', {token}, {
                        token: token,
                        userId: user.id,
                        permission: user.data.permission || PERMISSION.USER,
                        date: (new Date()).toISOString()
                    }, session => {
                        user.sendMessage(`New web authorization token: \n ${Telegraph.WebHost}/#/token/${session.token} \n This message will be destroyed in 1 minute.`, {}, (user, context) => {
                            const burnMessage = () => {
                                user.removeMessage(context.message_id);
                                clearTimeout(timeout)
                            };
                            const timeout = setTimeout(burnMessage, 60000);
                        });
                        user.removeMessage(context.message.message_id);
                    });
                } else {
                    const token = data[1];
                    Database.count('sessions', {token}, count => {
                        if (count > 0) {
                            Database.save('sessions', {token}, {
                                token: token,
                                userId: user.id,
                                permission: user.data.permission || PERMISSION.USER,
                                date: (new Date()).toISOString()
                            }, session => {
                                user.sendMessage(`Web authorization token: \n ${Telegraph.WebHost}/#/token/${session.token} \n This message will be destroyed in 1 minute.`, {}, (user, context) => {
                                    const burnMessage = () => {
                                        user.removeMessage(context.message_id);
                                        clearTimeout(timeout)
                                    };
                                    const timeout = setTimeout(burnMessage, 60000);
                                });
                                user.removeMessage(context.message.message_id);
                            });
                        } else {
                            user.sendMessage(`Incorrect command query $"auth login ${token}"`);
                            console.log(`Incorrect command query $"auth login ${token}"`);
                            user.removeMessage(context.message.message_id);
                        }
                    });
                }
                break;
            case 'token':
                break;
            case 'logout':
                if (data[1] === 'all') {
                    Database.removeAll('sessions', {userId: user.id}, () => {
                        user.removeMessage(context.message.message_id);
                    });
                } else if (data[1] === 'new') {
                    Database.removeAll('sessions', {userId: user.id}, () => {
                        const token = (new Token()).toString();
                        Database.save('sessions', {token}, {
                            token: token,
                            userId: user.id,
                            permission: user.data.permission || PERMISSION.USER,
                            date: (new Date()).toISOString()
                        }, session => {
                            user.sendMessage(`New web authorization token: \n ${Telegraph.WebHost}/#/token/${session.token} \n This message will be destroyed in 1 minute.`, {}, (user, context) => {
                                const burnMessage = () => {
                                    user.removeMessage(context.message_id);
                                    clearTimeout(timeout)
                                };
                                const timeout = setTimeout(burnMessage, 60000);
                            });
                            user.removeMessage(context.message.message_id);
                        });
                    });
                } else if (typeof data[1] === 'string') {
                    Database.remove('sessions', {token: data[1]}, () => {
                        user.removeMessage(context.message.message_id);
                    });
                } else {
                    user.sendMessage(`Incorrect command query $"auth logout ${data[1]}"`);
                    console.log(`Incorrect command query $"auth logout ${data[1]}"`);
                    user.removeMessage(context.message.message_id);
                }
                break;
            case 'close':
                user.removeMessage(context.message.message_id);
                break;
            default:
                console.log(`Unknown auth callback ${data[0]}`);
                callback();
        }
    }
}

class Token {
    token = '';

    length = 15;

    symbolSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    constructor() {
        for (let i = 1; i < this.length; i++) {
            let random = Math.ceil(Math.random() * this.symbolSet.length) - 1;
            this.token = this.token + this.symbolSet[random];
        }
    }

    toString() {
        return this.token;
    }
}
