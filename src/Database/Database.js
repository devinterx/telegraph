import MongoDB from 'mongodb'

const MongoClient = MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;

export default class Database {
    static MONGO_DB = 'mongodb';

    /** @type {MongoDatabase} */
    static db;

    static init(config, callback) {
        if (Database.db === undefined) {
            if (config.database === Database.MONGO_DB) {
                Database.db = new MongoDatabase(config.mongodb, callback);
            } else {
                throw Error('Support only mongodb database.')
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

    static find(collection, query, callback, limit, offset) {
        Database.db.find(collection, query, callback, limit, offset);
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

    find(collection, query, callback, limit, offset) {
        let cursor;
        if (limit !== undefined && offset !== undefined) {
            cursor = this._db.collection(collection).find(query).skip(offset).limit(limit);
        } else if (limit !== undefined) {
            cursor = this._db.collection(collection).find(query).limit(limit);
        } else cursor = this._db.collection(collection).find(query);

        cursor.count().then(count => {
            if (count < 1) {
                callback(null);
            } else {
                cursor.toArray((error, results) => {
                    if (error) return console.log(error);

                    let items = [];
                    for (let i = 0; i < results.length; i++) {
                        items.push(MongoDatabase._itemToResult(results[i]));
                    }
                    callback(items)
                });
            }
        });
    }

    load(index, defaultData, callback) {
        const params = index.split('/');

        this._db.collection(params[0]).findOne({id: params[1]}).then(item => {
            if (item === null && typeof defaultData === 'object' && defaultData !== null) {
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

        if (typeof data === 'object' && data !== null) {
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
        console.log(`DB: error saving index "${index}", DATA is not object.`);
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
