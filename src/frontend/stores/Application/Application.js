import BaseStore from "../BaseStore";
import Network from "../../drivers/Network/Network";
import HistoryStore from "../History/History";
import UsersStore from "../components/Users/Users";

export default class ApplicationStore extends BaseStore {
    get token() {
        return this._state.get().token;
    }

    set token(token) {
        let date = new Date();

        date.setTime(date.getTime() + (5 * 24 * 60 * 60 * 1000));

        document.cookie = `token=${token};expires=${date.toUTCString()};path=/`;

        return this._state.get().set({token});
    }

    constructor() {
        let t = document.cookie.match(/token=([^;]+)/);

        super({
            token: t ? t[1] : null
        });

        /** @type {Network} */
        this.network = new Network();

        /** @type {{
         *    _: {ApplicationStore},
         *    History: {HistoryStore},
         *    Users: {UsersStore}
         * }}
         */
        this.stores = {
            _: this,
            History: new HistoryStore(),
            Users: new UsersStore(this, true),
        };

        // Fast store access
        /** @type {ApplicationStore} */
        this._ = this.stores._;

        /** @type {HistoryStore} */
        this.History = this.stores.History;

        /** @type {UsersStore} */
        this.Users = this.stores.Users;
    }
}
