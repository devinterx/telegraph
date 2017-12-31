import BaseStore from "../BaseStore";
import Network from "../../drivers/Network/Network";
import HistoryStore from "../History/History";

export default class ApplicationStore extends BaseStore {
    get token() {
        return this.state.get().token;
    }

    set token(token) {
        let date = new Date();

        date.setTime(date.getTime() + (5 * 24 * 60 * 60 * 1000));

        document.cookie = `token=${token};expires=${date.toUTCString()};path=/`;

        return this.state.get().set({token});
    }

    constructor() {
        let t = document.cookie.match(/token=([^;]+)/);

        super({
            token: t ? t[1] : null
        });

        /** @type {{
         *    _: {ApplicationStore},
         *    History: {HistoryStore}
         * }}
         */
        this.stores = {
            _: this,
            History: new HistoryStore(),
        };

        // Fast store access
        /** @type {ApplicationStore} */
        this._ = this.stores._;

        /** @type {HistoryStore} */
        this.History = this.stores.History;

        /** @type {Network} */
        this.network = new Network();
    }
}
