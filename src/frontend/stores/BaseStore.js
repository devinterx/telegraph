import Store from "freezer-js";

export default class BaseStore {
    get state() {
        return this._state.get();
    }

    constructor(data, parentStore) {
        if (data === undefined || data === null) data = {};
        this._state = new Store(data);

        this.parentStore = parentStore || null;

        this.stores = {
            _: this
        };
    }

    getState() {
        return this._state.get();
    }

    setState(state) {
        return this._state.get().set(state);
    }

    getStore(store) {
        if (!this.stores.hasOwnProperty(store)) return null;
        if (store === undefined) return this.stores._;
        return this.stores[store]
    }

    addEventListener(eventName, callback) {
        this._state.on(eventName, callback);
    }

    removeEventListener(eventName, callback) {
        this._state.off(eventName, callback);
    }

    trigger(eventName, data) {
        if (data === undefined) data = {};
        this._state.emit(eventName, data);
    }
}
