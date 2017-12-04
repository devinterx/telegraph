import cookieParser from "cookie-parser";
import path from "path";

import Database from "../Database/Database"
import {session} from "../Auth/Auth"

export default class WebServer {
    static init(server, express) {
        server.use(express.static(path.resolve('./public')));
        server.use(cookieParser());
        server.use(session);

        server.get('/api/users', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({user}) => {
                Database.list('users', {}, results => {
                    response.send(JSON.stringify(results));
                });
            });
        });

        server.get('/api/scenes', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({user}) => {
                Database.list('scenes', {}, results => {
                    response.send(JSON.stringify(results));
                });
            });
        });
    }
}
