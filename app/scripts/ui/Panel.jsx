import _ from 'underscore';
import config from '../config/config';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import {
    mapCenter,
    panelToggle,
    recordSelected,
    recordUnselected
} from '../actions';

export var Panel = connect()(React.createClass({
    componentDidMount: function () {
        this.props.dispatch(panelToggle(true));
    },

    componentWillUnmount: function () {
        this.props.dispatch(panelToggle(false));
    },

    render: function () {
        var className = 'panel panel-right';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <div className={className}>
                {(() => {
                    if (!this.props.header) {
                        return (
                            <div className="panel-header">
                                <Link to="/" aria-label="close" className="panel-close">&times;</Link>
                                {this.props.innerHeader ? this.props.innerHeader : ''}
                            </div>
                        );
                    }
                    else {
                        return this.props.header;
                    }
                })()}
                <div className="panel-body" onScroll={this.props.onBodyScroll}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}));

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

export var detailPanel = function (Component, table, columns, className = 'detail-panel') {
    return connect()(React.createClass({
        getData: function (id, callback) {
            cartodbSql.execute(`SELECT ${columns.join(',')} FROM {{ table }} WHERE cartodb_id = {{ id }}`, {
                id: id,
                table: table
            })
                .done(function (data) {
                    callback(data.rows[0]);
                });
        },

        updateData: function (id) {
            this.getData(id, (data) => this.setState(data));
        },

        componentDidMount: function () {
            this.updateData(this.props.routeParams.id);
        },

        componentWillUnmount: function () {
            this.props.dispatch(recordUnselected());
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.props.routeParams.id !== nextProps.routeParams.id) {
                this.updateData(nextProps.routeParams.id);
            }
        },

        componentWillUpdate: function (nextProps, nextState) {
            this.props.dispatch(recordSelected(nextState.cartodb_id, nextState.type));
            this.props.dispatch(mapCenter([nextState.latitude, nextState.longitude]));
        },

        getInitialState: function () {
            return {};
        },

        render: function () {
            var innerHeader = (
                <h2>
                    <Link to="/list/">&lt; list</Link>
                </h2>
            );
            return (
                <Panel className={className} innerHeader={innerHeader}>
                    <Component {...this.props} {...this.state} />
                </Panel>
            );
        }
    }));
};

export default Panel;
