import _ from 'underscore';
import moment from 'moment';
import React from 'react';
import { Link, Navigation } from 'react-router';
import { Panel } from './Panel.jsx';

var cartodbSql = new cartodb.SQL({ user: 'curbyourlitter' });

export var Report = React.createClass({
    getData: function (callback) {
        cartodbSql.execute('SELECT * FROM table_311_11222 WHERE cartodb_id = {{ id }}', { id: this.props.routeParams.reportId })
            .done(function (data) {
                callback(data.rows[0]);
            });
    },

    updateData: function () {
        var component = this;
        this.getData(function (data) {
            component.setState(data);
        });
    },

    componentDidMount: function () {
        this.updateData();
    },

    componentWillReceiveProps: function (nextProps) {
        if (this.props.routeParams.reportId !== nextProps.routeParams.reportId) {
            this.updateData();
        }
    },

    getInitialState: function () {
        return {};
    },

    render: function () {
        return (
            <Panel>
                <Link to="/reports/">&lt; List View</Link>
                <h2>{this.state.descriptor}</h2>
                <div>{moment(this.state.created_date).format('h:mma MMMM Do YYYY')}</div>
                <div>agency: {this.state.agency}</div>
                <div>
                    <h3>Location</h3>
                    {this.state.location_t}
                </div>
            </Panel>
        );
    }
});

var ReportListItem = React.createClass({
    mixins: [Navigation],

    handleClick: function () {
        this.transitionTo(`/reports/${this.props.reportId}`);
    },

    render: function () {
        return (
            <li className="report-list-item" onClick={this.handleClick}>
                <div className="report-list-item-complaint">{this.props.complaint}</div>
                <div className="report-list-item-date">{this.props.created_date}</div>
            </li>
        );
    }
});

export var ReportList = React.createClass({
    getData: function (callback) {
        // TODO only get reports as filtered, reports in viewport
        cartodbSql.execute('SELECT complaint, cartodb_id, created_date FROM table_311_11222')
            .done(function (data) {
                callback(data.rows);
            });
    },

    updateData: function () {
        var component = this;
        this.getData(function (data) {
            component.setState({ rows: data });
        });
    },

    componentDidMount: function () {
        this.updateData();
    },

    getInitialState: function () {
        return {
            rows: []
        };
    },

    render: function () {
        var list = this.state.rows.map(row => {
            return <ReportListItem key={row.cartodb_id} reportId={row.cartodb_id} {...row} />
        });
        return (
            <Panel>
                <h2>on the map</h2>
                {this.state.rows.length} results
                <ul className="report-list">
                    {list}
                </ul>
            </Panel>
        );
    }
});
