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

    getState = state => {
        return this.states[state];
    };

    static loadScene(scene, callback) {
        if (typeof scene === 'string') scene = {id: scene};

        if (Scene._scenes[scene.id] === undefined) {
            let data = Object.assign({}, DEFAULT_SCENE);
            data.id = scene.id;
            Database.load(`scenes/${scene.id}`, data, scene => {
                Scene._scenes[scene.id] = new Scene(scene);
                Scene._scenes[scene.id]._lastUpdateTime = Date.now();
                callback(Scene._scenes[scene.id]);
            });
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
