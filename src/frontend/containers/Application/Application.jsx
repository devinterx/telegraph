import React, {Component} from "react";
import {Redirect, Route, Switch} from "react-router-dom"
import {Dashboard} from "../../components/Dashboard/Dashboard";
import "./Application.less"

const PageNotFound = ({location}) => (
    <div className="application-router-error">
        <h1>Page <code>{location.pathname}</code> not found.</h1>
    </div>
);

class Application extends Component {
    render() {
        return <div className="application-container">{this.props.children}</div>
    }
}

const ApplicationRouter = () => {
    return (
        <Application>
            <Switch>
                <Route exact path='/token/:token' render={({match}) => {
                    if (match.params.token !== undefined) {
                        window.application.token = match.params.token
                    }
                    return <Redirect to="/"/>
                }}/>

                <Route exact path='/scenes' component={Dashboard}/>
                <Route exact path='/users' component={Dashboard}/>
                <Route exact path='/' component={Dashboard}/>

                {/* 404 */}
                <Redirect to={{state: {error: true}}}/>
            </Switch>
        </Application>
    );
};

export class Router extends Component {
    constructor(props) {
        super(props);
        this.previousLocation = this.props.location;
    }

    componentWillUpdate(props) {
        const {location} = this.props;

        if (props.history.action !== 'POP' && (!location.state || !location.state.error)) {
            this.previousLocation = location
        }
    }

    render() {
        const {location} = this.props;
        const isError = !!(location.state && location.state.error && this.previousLocation !== location);

        return isError ? <Route component={PageNotFound}/> : (
            <Switch location={isError ? this.previousLocation : location}>
                <Route path="/" component={ApplicationRouter}/>
            </Switch>
        )
    }
}
