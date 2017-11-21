import Database from "../Database/Database"

import path from "path";

export default class WebServer {
    static init(server, express) {
        server.use(express.static(path.resolve('./public')));

        server.get('/users', (request, response) => {
            Database.list('users', (results) => {
                response.send(JSON.stringify(results));
            })
        });

        server.get('/scenes', (request, response) => {
            Database.list('scenes', (results) => {
                response.send(JSON.stringify(results));
            })
        });
    }
}
