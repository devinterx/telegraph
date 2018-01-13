import BaseStore from "../../BaseStore";

export default class UsersStore extends BaseStore {
    isUpdated = false;

    set offset(offset) {
        this.setState({offset});
    }

    // set limit(limit) {
    //     this.setState({limit});
    // }

    constructor(parent) {
        super({
            list: [],
            count: 0,
            offset: 0,
            limit: 50
        }, parent);
    }

    update() {
        if (!this.isUpdated) this.isUpdated = true;

        const {limit, offset} = this.getState();

        this.parentStore.network.sendGET(`/users`, {limit, offset}, response => {
            if (response.status === 200) {
                response = JSON.parse(response.response);

                this.setState({list: response.users || [], count: response.count || 0});
            }
        });
    }
}
