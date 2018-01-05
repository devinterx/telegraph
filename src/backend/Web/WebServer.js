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

        server.get('/api/users', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
                if (permission > 0) {
                    Database.list('users', {}, results => {
                        response.send(JSON.stringify(results));
                    });
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
