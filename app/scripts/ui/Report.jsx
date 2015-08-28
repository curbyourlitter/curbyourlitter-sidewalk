import _ from 'underscore';
import config from '../config/config';
import moment from 'moment';
import React from 'react';
import { Link, Navigation } from 'react-router';
import { detailPanel } from './Panel.jsx';

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

export var Report = detailPanel(React.createClass({
    render: function () {
        return (
            <div>
                <Link to="/reports/">&lt; List View</Link>
                <h2>{this.props.descriptor}</h2>
                <div>{moment(this.props.created_date).format('h:mma MMMM Do YYYY')}</div>
                <div>agency: {this.props.agency}</div>
                <div>
                    <h3>Location</h3>
                    {this.props.location_t}
                </div>
            </div>
        );
    }
}), config.cartodbReportTable);

var ReportListItem = React.createClass({
    mixins: [Navigation],

    handleClick: function () {
        this.transitionTo(`/reports/${this.props.reportId}`);
    },

    render: function () {
        return (
            <li className="report-list-item" onClick={this.handleClick}>
                <div className="report-list-item-complaint">{this.props.complaint_type}</div>
                <div className="report-list-item-date">{this.props.created_date}</div>
            </li>
        );
    }
});

export var ReportList = React.createClass({
    getData: function (callback) {
        // TODO only get reports as filtered, reports in viewport
        cartodbSql.execute('SELECT complaint_type, cartodb_id, created_date FROM {{ table }}', {
            table: config.cartodbReportTable
        })
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
