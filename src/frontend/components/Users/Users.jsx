import React, {Component} from "react";
import DashboardComponent, {
    DashboardComponentContent as Content,
    DashboardComponentFooter as Footer,
    DashboardComponentHeader as Header,
    DashboardComponentPaginator as Paginator
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
            <table className="dashboard-component-table users-list">
                <thead>
                <tr className="row filter" role="row">
                    <th rowSpan="1" colSpan="1"/>
                    <th className="input" rowSpan="1" colSpan="1">
                        <input className="form-control" placeholder="Filter ID" type="text"/>
                    </th>
                    <th className="input" rowSpan="1" colSpan="1">
                        <input type="text" className="form-control" placeholder="Filter First Name"/>
                    </th>
                    <th className="input" rowSpan="1" colSpan="1">
                        <input type="text" className="form-control" placeholder="Filter Last Name"/>
                    </th>
                    <th rowSpan="1" colSpan="1"/>
                </tr>
                <tr className="row header" role="row">
                    <th className="sorting cell" rowSpan="1" colSpan="1">№</th>
                    <th className="sorting cell" rowSpan="1" colSpan="1">ID</th>
                    <th className="sorting cell" rowSpan="1" colSpan="1">First Name</th>
                    <th className="sorting cell" rowSpan="1" colSpan="1">Last Name</th>
                    <th className="sorting cell" rowSpan="1" colSpan="1">Action</th>
                </tr>
                </thead>
                <tbody>
                {list.map((item, i) => {
                    return <User key={`user-${offset + i}`} user={item} idx={offset + i + 1}/>
                })}
                </tbody>
            </table>
        ) : (
            <div className="users-list">
                <div className="no-users">No users</div>
            </div>
        );

        return (
            <div className={`${DashboardComponent.className} users-container`}>
                <Header title="Users" limit={limit} count={count} onUpdate={this.onUpdate}/>
                <Content>
                    {content}
                    {list.length > 0 ? (
                        <Footer>
                            <Paginator offset={offset} limit={limit} count={count} onPageClick={this.onPage}/>
                        </Footer>
                    ) : null}
                </Content>
            </div>
        );
    }
}

class User extends Component {
    render() {
        const {user, idx} = this.props;

        return (
            <tr className="row user" role="row">
                <td>{idx}</td>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td/>
            </tr>
        );
    }
}
