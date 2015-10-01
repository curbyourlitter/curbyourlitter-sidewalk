import _ from 'underscore';
import config from '../config/config';
import moment from 'moment';
import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';
import { hoverIntent } from './HoverIntent.jsx';
import { detailPanel } from './Panel.jsx';
import { reportColumnsDetails } from '../sql/reports';

export var slugifyComplaintType = function (complaintType) {
        return complaintType.replace(/ /g, '-').toLowerCase();
};

export var Report = detailPanel(React.createClass({
    render: function () {
        var iconClasses = 'detail-panel-report-icon';
        if (this.props.complaint_type) {
            iconClasses += ` detail-panel-report-icon-${slugifyComplaintType(this.props.complaint_type)}`;
        }
        return (
            <div className="detail-panel-report">
                <h2>
                    <span className={iconClasses}></span>
                    <span className="detail-panel-report-header">{this.props.complaint_type}</span>
                    <span className="clearfix"></span>
                </h2>
                <div className="detail-panel-row">
                    <label>Complaint Type</label>
                    <div>{this.props.descriptor}</div>
                </div>
                <div className="detail-panel-row">
                    <label>Reported</label>
                    <div>{moment(this.props.date).format('MMMM D, YYYY')}</div>
                </div>
                {(() => {
                    if (this.props.incident_address) {
                        return (
                            <div className="detail-panel-row">
                                <label>Location</label>
                                <div>{this.props.incident_address}</div>
                            </div>
                        );
                    }
                    else if (this.props.intersection_street1 && this.props.intersection_street2) {
                        return (
                            <div className="detail-panel-row">
                                <label>Location</label>
                                <div>{this.props.intersection_street1} &amp; {this.props.intersection_street2}</div>
                            </div>
                        );
                    }
                })()}
            </div>
        );
    }
}), config.tables.report, reportColumnsDetails);

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

    render: function () {
        var iconClasses = 'report-list-item-icon';
        if (this.props.complaint_type) {
            iconClasses += ` report-list-item-icon-${slugifyComplaintType(this.props.complaint_type)}`;
        }
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
