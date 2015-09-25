import _ from 'underscore';
import config from '../config/config';
import moment from 'moment';
import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';
import { hoverIntent } from './HoverIntent.jsx';
import { detailPanel } from './Panel.jsx';

export var Report = detailPanel(React.createClass({
    render: function () {
        return (
            <div>
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
}), config.tables.report);

export var ReportListItem = hoverIntent(React.createClass({
    mixins: [History],

    handleClick: function () {
        this.history.pushState(null, `/reports/${this.props.id}`);
    },

    onHoverIntent: function () {
        this.props.highlightFeature(this.props.id, 'report');
    },

    handleMouseLeave: function () {
        this.props.onMouseLeave();
        this.props.unhighlightFeature();
    },

    shouldComponentUpdate: function () {
        // NB: currently nothing should make this list item need an update,
        // so always return false for speed-up
        return false;
    },

    slugifyComplaintType: function () {
        return this.props.complaint_type.replace(/ /g, '-').toLowerCase();
    },

    render: function () {
        var iconClasses = `report-list-item-icon report-list-item-icon-${this.slugifyComplaintType()}`;
        return (
            <li className="entity-list-item report-list-item" onClick={this.handleClick} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.handleMouseLeave}>
                <Grid>
                    <Row>
                        <Col className="report-list-item-icon-column" xs={2}>
                            <div className={iconClasses}></div>
                        </Col>
                        <Col xs={10}>
                            <div className="report-list-item-complaint">{this.props.complaint_type}</div>
                            <div className="report-list-item-address">{
                                this.props.incident_address ?
                                this.props.incident_address :
                                `${this.props.intersection_street1} & ${this.props.intersection_street2}`
                            }</div>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
}), 300);
