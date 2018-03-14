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
            <header className="dashboard-component-header">
                <span className="header-icon"><i className="fa fa-table"/></span>
                <h2>{this.props.title || '...Header panel'}</h2>
                <div className="button update" onClick={this.onUpdate}><i className="fa fa-refresh"/></div>
            </header>
        );
    }
}

export class DashboardComponentFooter extends Component {
    render() {
        return (
            <div className="dashboard-component-footer">
                <div className="col-sm-6 col-xs-12 hidden-xs"/>
                <div className="col-xs-12 col-sm-6">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export class DashboardComponentContent extends Component {
    render() {
        return (
            <div className="dashboard-component-content">
                <div className="body">
                    {this.props.children}
                </div>
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
            <div className="dashboard-component-paginator">
                <ul>
                    <li className="button previous disabled"><span>Previous</span></li>
                    {pages.map(page => {
                        return (
                            <li className={`button${page === currentPage ? ' active' : ''}`} key={`page-${page}`}
                                onClick={() => {
                                    if (page !== currentPage) onPageClick(limit * (page - 1));
                                }}>
                                <span>{page}</span>
                            </li>
                        );
                    })}
                    <li className="button disabled"><span>…</span></li>
                    <li className="button next"><span>Next</span></li>
                </ul>
            </div>
        );
    }
}
