import BaseStore from "../BaseStore";

export const ROUTE_TYPE = {
    ON_HOME: '/',
    ON_SCENES: '/scenes',
    ON_USERS: '/users',
    ON_TEST: '/test',
    ON_TEST_1: '/test/1',
    ON_TEST_2: '/test/2',
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
