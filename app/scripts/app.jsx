import React from 'react';
window.React = React;
import { Route, Router } from 'react-router';
var history = require('react-router/lib/BrowserHistory').history;

var mountNode = document.getElementById("app");

var Map = require('./ui/Map.jsx').Map,
    Panel = require('./ui/Panel.jsx'),
    Report = require('./ui/Report.jsx');

React.render((
    <Router history={history}>
        <Route path="/" component={Map}>
            <Route path="add" component={Panel}/>
            <Route path="reports/:reportId" component={Report}/>
        </Route>
    </Router>
    ), mountNode
);
