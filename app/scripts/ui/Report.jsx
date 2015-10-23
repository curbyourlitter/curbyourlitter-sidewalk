import _ from 'underscore';
import config from '../config/config';
import moment from 'moment';
import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';

import { getReportColumnsDetails, getReportSqlDetails } from 'curbyourlitter-sql/lib/reports';

import { hoverIntent } from './HoverIntent.jsx';
import { detailPanel } from './Panel.jsx';

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
                    <div>
                        <p>{this.props.descriptor}</p>
                        {(() => {
                            if (this.props.description) {
                                return <p>{this.props.description}</p>;
                            }
                        })()}
                    </div>
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
}), config.tables.report, getReportColumnsDetails(config), 'detail-panel', getReportSqlDetails);

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

    shouldComponentUpdate: function (nextProps, nextState) {
        return (
            nextProps.in_bbox !== this.props.in_bbox ||
            nextProps.hoveredOnMap !== this.props.hoveredOnMap
        );
    },

    render: function () {
        var itemClasses = 'report-list-item entity-list-item',
            iconClasses = 'report-list-item-icon';
        if (this.props.complaint_type) {
            iconClasses += ` report-list-item-icon-${slugifyComplaintType(this.props.complaint_type)}`;
        }
        if (this.props.in_bbox) {
            itemClasses += ' in-view';
        }
        if (this.props.hoveredOnMap) {
            itemClasses += ' hovered-on-map';
        }
        return (
            <li className={itemClasses} onClick={this.handleClick} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.handleMouseLeave}>
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
}), 100);
