import React from 'react';
import { Route, Router } from 'react-router';

import { CurbMap } from './ui/CurbMap.jsx';
import Panel from './ui/Panel.jsx';
import { Report, ReportList } from './ui/Report.jsx';

var history = require('react-router/lib/BrowserHistory').history;

var mountNode = document.getElementById("app");

React.render((
    <Router history={history}>
        <Route path="/" component={CurbMap}>
            <Route path="add" component={Panel}/>
            <Route path="reports" component={ReportList}/>
            <Route path="reports/:reportId" component={Report}/>
        </Route>
    </Router>
    ), mountNode
);
