import React, {Component} from "react";
import DashboardComponent, {
    DashboardComponentHeader,
    DashboardComponentPaginator
} from "../Dashboard/DashboardComponent";

export default class Users extends DashboardComponent {
    store = window.application.Users;
    state = window.application.Users.state;

    onUpdate = () => {
        this.store.update();
    };

    onPage = offset => {
        this.store.offset = offset;
        this.store.update();
    };

    render() {
        const {list, count, offset, limit} = this.state;

        let content = list.length > 0 ? (
            <ul className="table users-list">
                <li className="row header">
                    <span className="cell">№</span>
                    <span className="cell">ID</span>
                    <span className="cell">First Name</span>
                    <span className="cell">Last Name</span>
                    <span className="cell">Action</span>
                </li>
                <li className="row filter">

                </li>
                {list.map((item, i) => {
                    return <User key={`user-${offset + i}`} user={item} idx={offset + i + 1}/>
                })}
            </ul>
        ) : (
            <div className="users-list">
                <div className="no-users">No users</div>
            </div>
        );

        return (
            <div className={`${DashboardComponent.className} users-container`}>
                <DashboardComponentHeader limit={limit} count={count} onUpdate={this.onUpdate}/>
                {content}
                <DashboardComponentPaginator offset={offset} limit={limit} count={count} onPageClick={this.onPage}/>
            </div>
        );
    }
}

class User extends Component {
    render() {
        const {user, idx} = this.props;

        return (
            <li className="row user">
                <span className="cell">{idx}</span>
                <span className="cell">{user.id}</span>
                <span className="cell">{user.firstName}</span>
                <span className="cell">{user.lastName}</span>
                <span className="cell"/>
            </li>
        );
    }
}
