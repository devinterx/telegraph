import Database from "../Database/Database"

import cookieParser from "cookie-parser";
import path from "path";

export default class WebServer {
    static init(server, express) {
        server.use(express.static(path.resolve('./public')));

        server.use(cookieParser());

        server.use((request, response, next) => {
            if (request.path.startsWith('/api')) {
                const token = request.cookies['token'];
                if (token === undefined) {
                    return response.status(403).json({error: 'Not authorized'});
                } else {
                    Database.count(`sessions/${token}`, count => {
                        if (count === 0) {
                            response.clearCookie('token', {httpOnly: true});
                            response.status(403).json({error: 'Not authorized'});
                        } else {
                            next();
                        }
                    });
                }
            } else next();
        });

        server.get('/api/users', (request, response) => {
            Database.load(`sessions/${request.cookies['token']}`, ({user}) => {
                Database.list('users', results => {
                    response.send(JSON.stringify(results));
                });
            });
        });

        server.get('/api/scenes', (request, response) => {
            Database.load(`sessions/${request.cookies['token']}`, ({user}) => {
                Database.list('scenes', results => {
                    response.send(JSON.stringify(results));
                });
            });
        });
    }
}
