import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import path from "path";

<<<<<<< HEAD
import Database from "../Database/Database";
import Scene from "../Scene/Scene";
import {session} from "../Auth/Auth"
=======
import Database from "../Database/Database"
import User from "../User/User"
import Scene from "../Scene/Scene"
import {PERMISSION, session} from "../Auth/Auth"

// [METHOD, ROUTE, HANDLER, PERMISSION]
const ROUTES = [
    // Users
    ['GET', '/api/users/:id', User.REST.getUser, PERMISSION.ADMINISTRATOR],
    ['GET', '/api/users', User.REST.listUsers, PERMISSION.ADMINISTRATOR],
    ['POST', '/api/users', User.REST.createUser, PERMISSION.ADMINISTRATOR],
    ['PUT', '/api/users/:id', User.REST.updateUser, PERMISSION.ADMINISTRATOR],
    ['DELETE', '/api/users/:id', User.REST.deleteUser, PERMISSION.ADMINISTRATOR],

    // Scenes
    ['GET', '/api/scenes', Scene.REST.listScenes, PERMISSION.ADMINISTRATOR],
];
>>>>>>> master

export default class WebServer {
    static init(server, express) {
        server.use(express.static(path.resolve('./public')));
        server.use(cookieParser());
        server.use(bodyParser.json());
        server.use(session);

<<<<<<< HEAD
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
=======
        for (let i = 0; i < ROUTES.length; i++) {
            let grantHandler, [method, route, handler, level] = ROUTES[i];

            if (level !== undefined && level !== PERMISSION.USER) {
                grantHandler = (request, response) => WebServer._grantRequest(level, handler, request, response);
            }

            server[method.toLowerCase()](route, grantHandler || handler);
        }
    }
>>>>>>> master

    static _grantRequest(level, handler, request, response) {
        Database.load('sessions', {token: request.cookies['token']}, ({permission}) => {
            if (permission >= level) {
                handler(request, response);
            } else response.status(403).json({error: 'Not enough permissions'});
        });
    }
}
