import React, {Component} from "react";
import "./DashboardComponent.less"

export default class DashboardComponent extends Component {
    static className = 'dashboard-component';

    constructor(props) {
        super(props);
    }

    update = () => {
        if (this.store) this.setState(this.store.state);
    };

    componentDidMount() {
        if (this.store) this.store.addEventListener('update', this.update);
        if (this.store && !this.store.isUpdated) this.store.update();
    }

    componentWillUnmount() {
        if (this.store) this.store.removeEventListener('update', this.update);
    }
}

export class DashboardComponentHeader extends Component {
    render() {
        return (
            <div className="dashboard-component-header">
                ...Header panel
                <div className="button update" onClick={this.onUpdate}><i className="fa fa-refresh"/></div>
            </div>
        );
    }
}

export class DashboardComponentPaginator extends Component {
    render() {
        const {count, offset, limit, onPageClick} = this.props;
        const pagesCount = Math.max(Math.ceil(count / limit), 1);
        const currentPage = Math.ceil(offset + 1 / limit);

        let pages = [];
        for (let i = 0; i < pagesCount; i++) {
            pages.push(i + 1);
        }

        return (
            <ul className="dashboard-component-paginator">
                {pages.map(page => {
                    return (
                        <li className={`page${page === currentPage ? ' active' : ''}`} key={`page-${page}`}
                            onClick={() => {
                                if (page !== currentPage) onPageClick(limit * (page - 1));
                            }}>
                            {page}
                        </li>
                    );
                })}
            </ul>
        );
    }
}
