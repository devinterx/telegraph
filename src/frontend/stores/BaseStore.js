import Store from "freezer-js";

export default class BaseStore {
    constructor(data, parentStore) {
        if (data === undefined || data === null) data = {};
        this.state = new Store(data);

        this.parentStore = parentStore || null;

        this.stores = {
            _: this
        };
    }

    getState() {
        return this.state.get();
    }

    setState(state) {
        return this.state.get().set(state);
    }

    getStore(store) {
        if (!this.stores.hasOwnProperty(store)) return null;
        if (store === undefined) return this.stores._;
        return this.stores[store]
    }

    addEventListener(eventName, callback) {
        this.state.on(eventName, callback);
    }

    removeEventListener(eventName, callback) {
        this.state.off(eventName, callback);
    }

    trigger(eventName, data) {
        if (data === undefined) data = {};
        this.state.trigger(eventName, data);
    }
}
