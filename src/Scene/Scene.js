import Database from "../Database/Database"

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
