import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import path from "path";

import Database from "../Database/Database"
import User from "../User/User"
import {session} from "../Auth/Auth"

export default class WebServer {
    static init(server, express) {
        server.use(express.static(path.resolve('./public')));
        server.use(cookieParser());
        server.use(bodyParser.json());
        server.use(session);

        server.get('/api/users/:id', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
                if (permission > 0) {
                    let userId = request.params.id;
                    if (typeof userId === 'number') userId = userId.toString();
                    Database.find('users', {id: userId}, results => {
                        if (results !== null) {
                            response.send(JSON.stringify(results));
                        } else {
                            response.status(409).json({error: 'User with this id not exist'});
                        }
                    });
                } else response.status(403).json({error: 'Not enough permissions'});
            });
        });

        server.get('/api/users/', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
                if (permission > 0) {
                    let limit = !isNaN(parseInt(request.query.limit)) ? parseInt(request.query.limit) : 50;
                    let offset = !isNaN(parseInt(request.query.offset)) ? parseInt(request.query.offset) : 0;
                    Database.list('users', {}, results => {
                        if (results !== null) {
                            response.send(JSON.stringify(results));
                        } else {
                            response.status(409).json({error: 'Users not exist'});
                        }
                    },limit,offset);
                } else response.status(403).json({error: 'Not enough permissions'});
            });
        });

        server.post('/api/users', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
                if (permission > 0) {
                    let user = request.body['user'];
                    if (typeof user.id === 'number') user.id = user.id.toString();
                    Database.find('users', {id: user.id}, results => {
                        if (results === null) {
                            user = new User(user);
                            user._lastUpdateTime = Date.now();
                            Database.save('users', {id: user.id}, Object.assign({}, user), () => {
                                User._users[user.id] = user;
                            });
                            response.status(200).json({error: false, message: 'User created'});
                        } else {
                            response.status(409).json({error: 'User with this id exist'});
                        }
                    });
                } else response.status(403).json({error: 'Not enough permissions'});
            });
        });

        server.put('/api/users/:id', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
                if (permission > 0) {
                    let user = request.body['user'];
                    user.id = request.params.id;
                    if (typeof user.id === 'number') user.id = user.id.toString();
                    Database.find('users', {id: user.id}, results => {
                        if (results !== null) {
                            user = new User(user);
                            user._lastUpdateTime = Date.now();
                            Database.save('users', {id: user.id}, Object.assign({}, user), () => {
                                User._users[user.id] = user;
                            });
                            response.status(200).json({error: false, message: 'User updated'});
                        } else {
                            response.status(409).json({error: 'User with this id not exist'});
                        }
                    });
                } else response.status(403).json({error: 'Not enough permissions'});
            });
        });

        server.delete('/api/users/:id', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
                if (permission > 0) {
                    let userId = request.params.id;
                    if (typeof userId === 'number') userId = userId.toString();
                    Database.find('users', {id: userId}, results => {
                        if (results !== null) {
                            Database.remove('users', {id: userId}, () => {
                                delete User._users[userId];
                            });
                            response.status(200).json({error: false, message: 'User deleted'});
                        } else {
                            response.status(409).json({error: 'User with this id not exist'});
                        }
                    });
                } else response.status(403).json({error: 'Not enough permissions'});
            });
        });

        server.get('/api/scenes', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
                if (permission > 0) {
                    Database.list('scenes', {}, results => {
                        response.send(JSON.stringify(results));
                    });
                } else response.status(403).json({error: 'Not enough permissions'});
            });
        });
    }
}
