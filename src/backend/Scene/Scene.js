import Database from "../Database/Database"
import {PERMISSION} from "../Auth/Auth";
import Command from "../Command/Command"

export default class Scene {
    id;

    states;

    _lastUpdateTime = 0;

    static _scenes = [];

    /**
     * @param {{id:int, states:object}} scene
     */
    constructor(scene) {
        this.id = scene.id;
        this.states = scene.states;
    }

    /**
     * @param {User} user
     * @param {string} message
     */
    processSceneMessages = (user, message) => {
        let answers = this.getState(user.data.state)['answers'];
        let trigger = false;
        if (answers[message] !== undefined) {
            if (answers[message].scene !== undefined && user.data.scene !== answers[message].scene) {
                user.data.scene = answers[message].scene;
                trigger = true;
            }
            if (answers[message].state !== undefined && user.data.state !== answers[message].state) {
                user.data.state = answers[message].state;
                trigger = true;
            }
        } else if (answers['*'] !== undefined) { // любое сообщение
            if (answers['*'].scene !== undefined && user.data.scene !== answers['*'].scene) {
                user.data.scene = answers['*'].scene;
                trigger = true;
            }
            if (answers['*'].state !== undefined && user.data.state !== answers['*'].state) {
                user.data.state = answers['*'].state;
                trigger = true;
            }
        }

        if (trigger) {
            user.saveUser(user => {
                this.processMessages(user);
            });
        } else if (answers['*'] !== undefined) {
            this.processMessages(user);
        }
    };

    /**
     * @param {User} user
     * @private
     */
    processMessages = user => {
        user.loadUserSceneStage(user.data.scene, user.data.state, messages => {
            for (let i = 0; i < messages.length; i++) {
                setTimeout(() => {
                    user.sendMessage(messages[i].text, messages[i].options);
                }, 200 * i);
            }
        });
    };

    /**
     * @param {string} state
     * @return {*}
     */
    getState = state => {
        return this.states[state];
    };

    static loadScene(scene, callback) {
        if (typeof scene === 'string') scene = {id: scene};

        if (Scene._scenes[scene.id] === undefined) {
            let data = Object.assign({}, DEFAULT_SCENE);
            data.id = scene.id;
            Database.load('scenes', {id: scene.id}, scene => {
                Scene._scenes[scene.id] = new Scene(scene);
                Scene._scenes[scene.id]._lastUpdateTime = Date.now();
                callback(Scene._scenes[scene.id]);
            }, data);
        } else {
            Scene._scenes[scene.id]._lastUpdateTime = Date.now();
            callback(Scene._scenes[scene.id]);
        }
    }

    static unloadScene(scene) {
        delete Scene._scenes[scene.id];
    }

    static unloadInactiveScenes() {
        let count = 0;
        this._scenes.map(scene => {
            if (scene._lastUpdateTime + 3600000 < Date.now()) {
                Scene.unloadScene(scene);
                count++;
            }
        });
        if (count > 0) console.log(`Victoriano: unloaded ${count} scene dreams.`)
    }

    /* Web Request (CRUD) */
    static REST = {
        listScenes: (request, response) => {
            let limit = !isNaN(parseInt(request.query.limit)) ? parseInt(request.query.limit) : 50;
            let offset = !isNaN(parseInt(request.query.offset)) ? parseInt(request.query.offset) : 0;
            Database.list('scenes', {}, results => {
                if(results !==null) {
                    response.send(JSON.stringify(results));
                } else {
                    response.status(409).json({error: 'Scene not exist'});
                }
            }, limit, offset);
        },

        getScene: (request, response) => {
            let sceneId = request.params.id;
            if (typeof sceneId === 'number') sceneId = sceneId.toString();
            Database.find('scenes', {id: sceneId}, results => {
                if (results !== null) {
                    response.json(results);
                } else {
                    response.status(409).json({error: 'Scene with this id not exist'});
                }
            });
        },

        createScene: (request, response) => {
            let scene = request.body['scene'];
            if (typeof scene.id === 'number' ) scene = scene.toString();
            Database.find('scenes', {id: scene.id}, results => {
                if (results === null) {
                    scene = new Scene(scene);
                    scene._lastUpdateTime = Date.now();
                    Database.save('scenes', {id: scene.id}, Object.assign({}, scene));
                    response.status(200).json({error: false, messages: "Scene created"});
                } else {
                    response.status(409).json({error: 'Scene with this id exist'});
                }
            });
        },

        updateScene: (request, response) => {
            let scene = request.body['scene'];
            scene.id = request.params.id;
            if (typeof scene.id === 'number') scene.id = scene.id.toString();
            Database.find('scenes', {id: scene.id}, results => {
                if (results !== null) {
                    scene = new Scene(scene);
                    scene._lastUpdateTime = Date.now();
                    Database.save('scenes', {id: scene.id}, Object.assign({}, scene));
                    response.status(200).json({error: false, messages: 'Scene updated'});
                } else {
                    response.status(409).json({error: 'Scene with this id not exist'});
                }
            });
        },

        deleteScene: (request, response) => {
            let sceneId = request.params.id;
            if (typeof sceneId === 'number') sceneId = sceneId.toString();
            Database.find('scenes', {id: sceneId}, results => {
                if(results !== null) {
                    Database.remove('scenes', {id: sceneId}, () => {
                        delete Scene._scenes[sceneId];
                        response.status(200).json({error: false, messages: 'Scene deleted'});
                    })
                } else {
                    response.status(409).json({error: 'Scene with this id not exist'});
                }
            });
        }


    };
}

const DEFAULT_SCENE = {
    states: {
        0: {
            messages: [
                {
                    text: 'Game in development',
                    options: {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    }
                }
            ],
            answers: {
                "*": {
                    state: 0
                }
            }
        }
    }
};