import MongoDB from 'mongodb'

import fs from 'fs';
import path from 'path';

const MongoClient = MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;

export default class Database {
    static FILE_DB = 'filedb';
    static MONGO_DB = 'mongodb';

    static db;

    static init(config, callback) {
        if (Database.db === undefined) {
            if (config.database === Database.MONGO_DB) {
                Database.db = new MongoDatabase(config.mongodb, callback);
            } else if (config.database === Database.FILE_DB) {
                Database.db = new FileDatabase(config.filedb, callback);
            } else {
                Database.db = new FileDatabase(config.filedb, callback);
            }
        }
        return Database.db;
    }

    static count(index, callback, limit, offset) {
        Database.db.count(index, callback, limit, offset);
    }

    static list(index, callback, limit, offset) {
        Database.db.list(index, callback, limit, offset);
    }

    static load(index, defaultData, callback) {
        Database.db.load(index, defaultData, callback);
    }

    static save(index, data, callback) {
        Database.db.save(index, data, callback);
    }

    static remove(index, callback) {
        Database.db.remove(index, callback);
    }
}

class MongoDatabase {
    _db;

    constructor(config, callback) {
        let url;
        if (config.user !== "" && config.password !== "") {
            url = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.db}`;
        } else {
            url = `mongodb://${config.host}:${config.port}/${config.db}`;
        }
        MongoClient.connect(url).then(database => {
            this._db = database;
            callback();
        }).catch(error => {
            console.log(`DB: error:`, error);
        });
    }

    count(index, callback, limit, offset) {
        let cursor;
        if (limit !== undefined && offset !== undefined) {
            cursor = this._db.collection(index).find().skip(offset).limit(limit);
        } else if (limit !== undefined) {
            cursor = this._db.collection(index).find().limit(limit);
        } else cursor = this._db.collection(index).find();

        cursor.count().then(count => {
            callback(count);
        });
    }

    list(index, callback, limit, offset) {
        let cursor;
        if (limit !== undefined && offset !== undefined) {
            cursor = this._db.collection(index).find().skip(offset).limit(limit);
        } else if (limit !== undefined) {
            cursor = this._db.collection(index).find().limit(limit);
        } else cursor = this._db.collection(index).find();

        cursor.toArray((error, results) => {
            if (error) return console.log(error);

            let items = [];
            for (let i = 0; i < results.length; i++) {
                items.push(MongoDatabase._itemToResult(results[i]));
            }
            callback(items)
        });
    }

    load(index, defaultData, callback) {
        const params = index.split('/');

        this._db.collection(params[0]).findOne({id: params[1]}).then(item => {
            if (item === null) {
                console.log(`DB: index "${index}" not exist. Trying create...`);
                this.save(index, defaultData, callback);
                console.log(`DB: index "${index}" created.`);
            } else {
                callback(MongoDatabase._itemToResult(item));
            }
        }).catch(error => {
            console.log(`DB: error:`, error);
        });
    }

    save(index, data, callback) {
        const params = index.split('/');

        this._db.collection(params[0]).findOne({id: params[1]}).then(item => {
            if (item === null) {
                this._db.collection(params[0]).insertOne(data).then(item => {
                    callback(MongoDatabase._itemToResult(item.ops[0]));
                }).catch(error => {
                    console.log(`DB: error:`, error);
                });
            } else {
                this._db.collection(params[0]).updateOne({_id: new ObjectID(item._id)}, data).then(item => {
                    callback(MongoDatabase._itemToResult(item));
                }).catch(error => {
                    console.log(`DB: error:`, error);
                });
            }
        }).catch(error => {
            console.log(`DB: error:`, error);
        });
    }

    remove(index, callback) {
        const params = index.split('/');
        this._db.collection(params[0]).findOne({id: params[1]}).then(item => {
            if (item !== null) {
                this._db.collection('notes').removeOne({_id: new ObjectID(item._id)}).then(() => {
                    callback();
                }).catch(error => {
                    console.log(`DB: error:`, error);
                });
            } else callback();
        }).catch(error => {
            console.log(`DB: error:`, error);
        });
    }

    static _itemToResult(item) {
        let result = Object.assign({}, item);
        delete result._id;
        return result;
    }
}

class FileDatabase {
    _path;

    constructor(config, callback) {
        this._path = path.resolve(config.path);

        if (!fs.existsSync(this._path)
            || (!fs.lstatSync(this._path).isDirectory() && fs.accessSync(this._path, fs.W_OK))
        ) {
            if (fs.existsSync(this._path) && !fs.accessSync(this._path, fs.W_OK)) {
                console.error('DB: is not writable!');
            }
            fs.mkdirSync(this._path, 0o777);
        }
        callback();
    }

    count(index, callback, limit, offset) {

    }

    list(index, callback, limit, offset) {

    }

    load(index, defaultData, callback) {
        const file = `${this._path}/${index}.json`;

        fs.lstat(file, (error, stats) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    console.log(`DB: index "${index}" not exist. Trying create...`);
                    let result = Database.save(index, defaultData, callback);
                    console.log(`DB: index "${index}" created.`);
                    return result;
                } else return console.log(`DB: index "${index}" not readable.`);
            }
            fs.access(file, fs.R_OK, error => {
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

    save(index, data, callback) {
        const file = `${this._path}/${index}.json`;
        const _index = path.dirname(file);
        this._checkIndex(_index);

        fs.lstat(_index, (error, stats) => {
            if (error) return console.log(`DB: index "${index}" not readable.`);

            fs.access(_index, fs.W_OK, error => {
                if (error) return console.log(`DB: index "${index}" not readable.`);

                if (stats.isDirectory()) {
                    fs.writeFile(file, JSON.stringify(data), 'utf8', () => {
                        callback(data);
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

    remove(index, callback) {
        const file = `${this._path}/${index}.json`;

        fs.lstat(file, (error, stats) => {
            if (error) return console.log(`DB: index "${index}" not writable.`);

            fs.access(file, fs.W_OK, error => {
                if (error) return console.log(`DB: index "${index}" not writable.`);

                if (stats.isFile()) {
                    fs.unlink(file, () => {
                        callback(data);
                    });
                } else {
                    console.warn(`DB: index "${index}" not writable or it's directory.`);
                }
            }, () => {
                console.log(`DB: index "${index}" not writable.`);
            });
        }, () => {
            console.log(`DB: index "${index}" not writable.`);
        });
    }

    _checkIndex(index) {
        let dirname = path.dirname(index);
        if (!fs.existsSync(dirname)) this._checkIndex(dirname);
        if (!fs.existsSync(index)) fs.mkdirSync(index, 0o777);
    }
}
