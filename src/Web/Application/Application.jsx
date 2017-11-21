import React, {Component} from "react";

export default class Application extends Component {
    render() {
        return <div className="application">{this.props.children}</div>
    }
}

export class Home extends Component {
    render() {
        return <div className="home"/>
    }
}
