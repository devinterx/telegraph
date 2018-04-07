import Database from "../Database/Database";

export default class Settings {

    static set(key, value, callback) {
        Database.save('settings', {key}, {data: value}, () => {
            if (callback && typeof callback === 'function') callback(value);
        });
    }

    static get(key, callback) {
        Database.find('settings', {key}, results => {
            if (results === null || results.length < 0 ) {
                callback(null);
                return;
            }
            callback(results[0].data);
        });
    }

    static remove(key, callback) {
        Database.remove('settings', {key}, () => {
            if (callback && typeof callback === 'function') callback();
        });
    }
}