import _ from 'underscore';
import config from '../config/config';
import moment from 'moment';
import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';
import { hoverIntent } from './HoverIntent.jsx';
import { detailPanel } from './Panel.jsx';
import { requestColumnsDetails } from '../sql/requests';

export var Request = detailPanel(React.createClass({
    getInitialState: function () {
        return {};
    },

    getSubtypeDisplay: function() {
        if (this.props.can_type) {
            var match = _.findWhere(config.bintypes[this.props.can_type].subtypes, { label: this.props.can_subtype });
            if (match) {
                return match.display;
            }
        }
        return '';
    },

    render: function () {
        return (
            <div className="detail-panel-request">
                {this.props.image ? <img src={this.props.image} /> : ''}
                <h2>
                    <span className="detail-panel-request-icon"></span>
                    <span className="detail-panel-request-header">{this.props.can_type} bin request</span>
                    <span className="clearfix"></span>
                </h2>
                <div className="detail-panel-row">
                    <label>type</label>
                    <div>{this.getSubtypeDisplay()}</div>
                </div>
                <div className="detail-panel-row">
                    <label>requested</label>
                    <div>{moment(this.props.date).format('MMMM D, YYYY')}</div>
                </div>
                {(() => {
                    if (this.props.comment) {
                        return (
                            <div className="detail-panel-row">
                                <label>comment</label>
                                <div>{this.props.comment}</div>
                            </div>
                        );
                    }
                })()}
            </div>
        );
    }
}), config.tables.request, requestColumnsDetails);

export var RequestListItem = hoverIntent(React.createClass({
    mixins: [History],

    handleClick: function () {
        this.history.pushState(null, `/requests/${this.props.id}`);
    },

    onHoverIntent: function () {
        this.props.highlightFeature(this.props.id, 'request');
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
        var itemClasses = 'request-list-item entity-list-item';
        if (this.props.in_bbox) {
            itemClasses += ' in-view';
        }
        return (
            <li className={itemClasses} onClick={this.handleClick} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.handleMouseLeave}>
                <Grid>
                    <Row>
                        <Col className="request-list-item-icon-column" xs={2}>
                            <div className="request-list-item-icon"></div>
                        </Col>
                        <Col xs={10}>
                            <div className="request-list-item-can-type">
                                {this.props.can_type} can request
                            </div>
                            <div className="request-list-item-date">
                                {moment(this.props.date).format('h:mma MMMM Do YYYY')}
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
}), 300);
