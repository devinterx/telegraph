import Database from "../Database/Database";

export default class Settings {

    static set(setting, callback) {
        Database.save('settings', {key: setting.key}, Object.assign({}, setting), setting => {
            callback(setting);
        });
    }

    static get(key) {
        Database.find('settings', {key: key}, results => {
            if (results !== null) {
                return results;
            } else {
                return null;
            }
        });
    }
}