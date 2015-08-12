import React from 'react';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import BrowserHistory from 'react-router/lib/BrowserHistory';

import * as reducers from './reducers';
import { CurbMap } from './ui/CurbMap.jsx';
import { AddRequest } from './ui/AddRequest.jsx';
import { Report, ReportList } from './ui/Report.jsx';

var mountNode = document.getElementById("app");

let store = createStore(combineReducers(reducers));

var App = React.createClass({
    render: function () {
        return (
            <div className="app-container">
                <CurbMap />
                {this.props.children}
            </div>
        );
    }
});

React.render((
    <Provider store={store}>
        {() => {
            return (
                <Router history={new BrowserHistory()}>
                    <Route path="/" component={App}>
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
