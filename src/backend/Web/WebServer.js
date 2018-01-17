import cookieParser from "cookie-parser";
import path from "path";

import Database from "../Database/Database";
import Scene from "../Scene/Scene";
import {session} from "../Auth/Auth"

export default class WebServer {
    static init(server, express) {
        server.use(express.static(path.resolve('./public')));
        server.use(cookieParser());
        server.use(session);

        server.get('api/scenes/:id', (request, response) => {
            Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
                if (permission > 0) {
                    let sceneId = request.params.id;
                    if(typeof sceneId === 'number') sceneId = sceneId.toString();
                    Database.find('scene', {id: sceneId}, results => {
                        if(results !== null) {
                            response.send(JSON.stringify(results));
                        } else {
                            response.status(409).json({error: 'Scene with this id not exist'});
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
