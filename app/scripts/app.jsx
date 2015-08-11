import React from 'react';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router';

import * as reducers from './reducers';
import { CurbMap } from './ui/CurbMap.jsx';
import { AddRequest } from './ui/AddRequest.jsx';
import { Report, ReportList } from './ui/Report.jsx';

var history = require('react-router/lib/BrowserHistory').history;

var mountNode = document.getElementById("app");

let store = createStore(combineReducers(reducers));

React.render((
    <Provider store={store}>
        {() => {
            return (
                <Router history={history}>
                    <Route path="/" component={CurbMap}>
                        <Route path="add" component={AddRequest}/>
                        <Route path="reports" component={ReportList}/>
                        <Route path="reports/:reportId" component={Report}/>
                    </Route>
                </Router>
            );
        }}
    </Provider>
    ), mountNode
);
