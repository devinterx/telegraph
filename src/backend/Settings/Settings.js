import Database from "../Database/Database";

export default class Settings {

    static set(key, value, callback) {
        Database.save('settings', {key,value}, Object.assign({}, {key,value}), setting => {
            callback(setting);
        });
    }

    static get(key,callback) {
        Database.find('settings', {key}, results => {
            callback(results);
        });
    }
}