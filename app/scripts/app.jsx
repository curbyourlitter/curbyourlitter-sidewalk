import React from 'react';
import { combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';
import qwest from 'qwest';

import collapse from '../bower_components/bootstrap/js/collapse';

import * as reducers from './reducers';
import config from './config/config';
import { AddButton, CurbMap, ListButton } from './ui/CurbMap.jsx';
import { AddRequest } from './ui/AddRequest.jsx';
import { Help } from './ui/Help.jsx';
import { Legend, LegendButton } from './ui/Legend.jsx';
import { ListContainer } from './ui/List.jsx';
import { Report } from './ui/Report.jsx';
import { Request } from './ui/Request.jsx';

var mountNode = document.getElementById("app");

let history = createHistory();
let store = createStore(combineReducers(reducers));

function mapStateToProps(state) {
    return {
        panelVisible: state.panelVisible
    };
}

var App = connect(mapStateToProps)(React.createClass({
    componentDidMount: function () {
        qwest.get('/scripts/json/bintypes.json')
            .then((xhr, response) => {
                config.bintypes = response;
            })
            .catch((xhr, response, e) => {
                console.log(e);
            });
    },

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

React.render((
    <Provider store={store}>
        {() => {
            return (
                <Router history={history}>
                    <Route path="/" component={App}>
                        <Route path="add" component={AddRequest}/>
                        <Route path="list" component={ListContainer}/>
                        <Route path="reports/:id" component={Report}/>
                        <Route path="requests/:id" component={Request}/>
                        <Route path="help" component={Help}/>
                    </Route>
                </Router>
            );
        }}
    </Provider>
    ), mountNode
);
