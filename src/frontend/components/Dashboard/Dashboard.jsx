import React, {Component} from "react";
import HistoryStore, {ROUTE_TYPE} from "../../stores/History/History";
import "./Dashboard.less"
import Users from "../Users/Users";

export class Dashboard extends Component {
    render() {
        if (window.application.token === null) return <AnonymousDashboard/>;

        const route = HistoryStore.getCurrentRoute();

        let container;
        switch (route) {
            case '/users':
                container = <Users/>;
                break;
            default:
                container = <div>{route}</div>
        }

        return (
            <div className="dashboard-container">
                <DashboardMenu/>
                {container}
            </div>
        )
    }
}

class DashboardMenu extends Component {
    MENU = [
        {
            label: 'Scenes',
            icon: 'fa fa-list',
            onClick: () => {
                window.application.History.toRoute(ROUTE_TYPE.ON_SCENES);
            }
        },
        {
            label: 'Users',
            icon: 'fa fa-list',
            onClick: () => {
                window.application.History.toRoute(ROUTE_TYPE.ON_USERS);
            }
        }
    ];

    render() {
        return (
            <div className="top-menu-container">
                <div className="logo" onClick={() => window.application.History.toRoute(ROUTE_TYPE.ON_HOME)}>
                    Telegraph
                </div>
                <ul className="menu">
                    {this.MENU.map((item, i) => (item.visible !== false) ? (
                        <li className={`menu-item ${item.className || ''}`} onClick={() => item.onClick(item)} key={i}>
                            <i className={item.icon}/><span>{item.label}</span>
                        </li>
                    ) : null)}
                </ul>
            </div>
        )
    }
}

class AnonymousDashboard extends Component {
    render() {
        return (
            <div className="dashboard-container anonymous">
                <div className="logo"/>
            </div>
        )
    }
}
