import _ from 'underscore';
import config from '../config/config';
import React from 'react';
import { Link } from 'react-router';

export var Panel = React.createClass({
    render: function () {
        return (
            <div className="panel panel-right">
                {(() => {
                    if (!this.props.header) {
                        return (
                            <div className="panel-header">
                                <Link to="/">close</Link>
                            </div>
                        );
                    }
                    else {
                        return this.props.header;
                    }
                })()}
                <div className="panel-body">
                    {this.props.children}
                </div>
            </div>
        );
    }
});

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

export var detailPanel = function (Component, table) {
    return React.createClass({
        getData: function (callback) {
            cartodbSql.execute('SELECT * FROM {{ table }} WHERE cartodb_id = {{ id }}', {
                id: this.props.routeParams.id,
                table: table
            })
                .done(function (data) {
                    callback(data.rows[0]);
                });
        },

        updateData: function () {
            this.getData((data) => this.setState(data));
        },

        componentDidMount: function () {
            this.updateData();
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.props.routeParams.id !== nextProps.routeParams.id) {
                this.updateData();
            }
        },

        getInitialState: function () {
            return {};
        },

        render: function () {
            return (
                <Panel>
                    <Component {...this.props} {...this.state} />
                </Panel>
            );
        }
    });
};

export default Panel;
