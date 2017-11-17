import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('./db');

export default class Database {
    static instance;

    constructor() {
        if (!fs.existsSync(DB_PATH) || (!fs.lstatSync(DB_PATH).isDirectory() && fs.accessSync(DB_PATH, fs.W_OK))) {
            if (fs.existsSync(DB_PATH) && !fs.accessSync(DB_PATH, fs.W_OK)) {
                console.error('DB: is not writable!');
            }
            fs.mkdirSync(DB_PATH, 0o777);
        }
    }

    static init() {
        if (Database.instance === undefined) Database.instance = new Database();
        return Database.instance;
    }

    static load(index, defaultData, callback) {
        const file = `${DB_PATH}/${index}.json`;

        fs.lstat(file, (error, stats) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    console.log(`DB: index "${index}" not exist. Trying create...`);
                    return Database.save(index, defaultData, callback);
                } else return console.log(`DB: index "${index}" not readable.`);
            }
            fs.access(file, fs.R_OK, (error) => {
                if (error) return console.log(`DB: index "${index}" not readable.`);

                if (stats.isFile()) {
                    fs.readFile(file, 'utf8', (err, contents) => {
                        callback(JSON.parse(contents));
                    });
                } else {
                    console.warn(`DB: index "${index}" not readable or it's directory.`);
                }
            }, () => {
                console.log(`DB: index "${index}" not readable.`);
            });
        }, () => {
            console.log(`DB: index "${index}" not readable.`);
        });
    }

    static save(index, data, callback) {
        const file = `${DB_PATH}/${index}.json`;
        const _index = path.dirname(file);
        Database._checkIndex(_index);

        fs.lstat(_index, (error, stats) => {
            if (error) return console.log(`DB: index "${index}" not readable.`);

            fs.access(_index, fs.W_OK, (error) => {
                if (error) return console.log(`DB: index "${index}" not readable.`);

                if (stats.isDirectory()) {
                    fs.writeFile(file, JSON.stringify(data), 'utf8', () => {
                        callback(data);
                        console.log(`DB: index "${index}" saved.`)
                    });
                } else {
                    console.warn(`DB: index "${index}" not writable or it's directory.`);
                }
            }, () => {
                console.log(`DB: index "${index}" not readable.`);
            });
        }, () => {
            console.log(`DB: index "${index}" not readable.`);
        });

    }

    static _checkIndex(index) {
        let dirname = path.dirname(index);
        if (!fs.existsSync(dirname)) Database._checkIndex(dirname);
        if (!fs.existsSync(index)) fs.mkdirSync(index, 0o777);
    }
}
