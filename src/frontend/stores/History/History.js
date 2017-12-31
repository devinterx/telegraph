import BaseStore from "../BaseStore";

export const ROUTE_TYPE = {
    ON_HOME: '/',
    ON_SCENES: '/scenes',
    ON_USERS: '/users',
};

export default class HistoryStore extends BaseStore {
    toRoute = route => {
        if (route === null) return;
        window.location.hash = route;
    };

    static getCurrentRoute() {
        return window.location.hash.substr(1);
    }
}
