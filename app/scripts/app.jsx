import React from 'react';
window.React = React;
import { Route, Router } from 'react-router';
var history = require('react-router/lib/BrowserHistory').history;

var mountNode = document.getElementById("app");

var CurbMap = require('./ui/CurbMap.jsx').CurbMap,
    Panel = require('./ui/Panel.jsx'),
    Report = require('./ui/Report.jsx');

React.render((
    <Router history={history}>
        <Route path="/" component={CurbMap}>
            <Route path="add" component={Panel}/>
            <Route path="reports/:reportId" component={Report}/>
        </Route>
    </Router>
    ), mountNode
);
