import _ from 'underscore';
import config from '../config/config';
import moment from 'moment';
import React from 'react';
import { Link, Navigation } from 'react-router';
import { detailPanel } from './Panel.jsx';

export var Report = detailPanel(React.createClass({
    render: function () {
        return (
            <div>
                <Link to="/list/">&lt; List View</Link>
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

export var ReportListItem = React.createClass({
    mixins: [Navigation],

    handleClick: function () {
        this.transitionTo(`/reports/${this.props.id}`);
    },

    render: function () {
        return (
            <li className="entity-list-item report-list-item" onClick={this.handleClick}>
                <div className="report-list-item-complaint">{this.props.complaint_type}</div>
                <div className="report-list-item-date">
                    {moment(this.props.date).format('h:mma MMMM Do YYYY')}
                </div>
            </li>
        );
    }
});
