import React from 'react';
import { combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';

import collapse from '../bower_components/bootstrap/js/collapse';

import * as reducers from './reducers';
import { AddButton, CurbMap, ListButton } from './ui/CurbMap.jsx';
import { AddRequest } from './ui/AddRequest.jsx';
import { Help, Help311Data, HelpCommunityInput } from './ui/Help.jsx';
import Legend from './ui/Legend.jsx';
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
    render: function () {
        return (
            <div className="app-container">
                <CurbMap />
                {!this.props.panelVisible ? <ListButton /> : ''}
                <AddButton />
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
                        <Route path="help" component={Help}>
                            <Route path="community-input" component={HelpCommunityInput}/>
                            <Route path="311-data" component={Help311Data}/>
                        </Route>
                    </Route>
                </Router>
            );
        }}
    </Provider>
    ), mountNode
);
