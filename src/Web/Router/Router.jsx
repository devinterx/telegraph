import React, {Component} from "react"
import {Redirect, Route, Switch} from "react-router-dom"
import Application, {Home} from "../Application/Application";

const PageNotFound = ({location}) => (
    <div>
        <h1>Page <code>{location.pathname}</code> not found.</h1>
    </div>
);

const ApplicationRouter = () => {
    return (
        <Application>
            <Switch>
                <Route exact path='/' component={Home}/>

                {/* 404 */}
                <Redirect to={{state: {error: true}}}/>
            </Switch>
        </Application>
    );
};

export default class Router extends Component {
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

        return (
            <div>
                {isError ? <Route component={PageNotFound}/> : (
                    <Switch location={isError ? this.previousLocation : location}>
                        <Route path="/" component={ApplicationRouter}/>
                    </Switch>
                )}
            </div>
        )
    }
}
