import React from "react"
import ReactDOM from "react-dom"
import {HashRouter, Route} from "react-router-dom"
import Router from "./Web/Router/Router";

ReactDOM.render((
    <HashRouter>
        <Route component={Router}/>
    </HashRouter>
), window.document.getElementById('application'));
