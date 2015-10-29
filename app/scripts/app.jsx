import React from 'react';
import ReactAnalytics from 'ga-react-router';
import ReactDOM from 'react-dom';
import { combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';

import collapse from '../bower_components/bootstrap/js/collapse';

import * as reducers from './reducers';
import config from './config/config';
import { AddButton, CurbMap, ListButton } from './ui/CurbMap.jsx';
import { AddRequest } from './ui/AddRequest.jsx';
import { Can } from './ui/Can.jsx';
import { Help } from './ui/Help.jsx';
import { Legend, LegendButton } from './ui/Legend.jsx';
import { ListContainer } from './ui/List.jsx';
import { Report } from './ui/Report.jsx';
import { Request } from './ui/Request.jsx';

var mountNode = document.getElementById("app");

let history = createHistory();
let store = createStore(combineReducers(reducers));

var triggerGA = function () {
    ReactAnalytics({ path: location.pathname });
};

function mapStateToProps(state) {
    return {
        panelVisible: state.panelVisible
    };
}

var App = connect(mapStateToProps)(React.createClass({
    render: function () {
        return (
            <div className="app-container">
                <CurbMap />
                {!this.props.panelVisible ? <ListButton /> : ''}
                <AddButton />
                <LegendButton />
                <Legend />
                {this.props.children}
            </div>
        );
    }
}));

ReactDOM.render((
    <Provider store={store}>
        <Router history={history} onUpdate={triggerGA}>
            <Route path="/" component={App}>
                <Route path="add" component={AddRequest}/>
                <Route path="list" component={ListContainer}/>
                <Route path="cans/:id" component={Can}/>
                <Route path="reports/:id" component={Report}/>
                <Route path="requests/:id" component={Request}/>
                <Route path="help" component={Help}/>
            </Route>
        </Router>
    </Provider>
    ), mountNode
);
