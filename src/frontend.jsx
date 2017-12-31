import React from "react"
import ReactDOM from "react-dom"
import {HashRouter, Route} from "react-router-dom"
import {Router} from "./frontend/containers/Application/Application";
import ApplicationStore from "./frontend/stores/Application/Application";

/** @type {ApplicationStore} */
window.application = new ApplicationStore();

ReactDOM.render((
    <HashRouter>
        <Route component={Router}/>
    </HashRouter>
), window.document.getElementById('wrapper'));
