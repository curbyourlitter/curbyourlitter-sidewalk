import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';

import config from '../config/config';
import { hoverIntent } from './HoverIntent.jsx';
import { detailPanel } from './Panel.jsx';
import { getCanColumnsDetails } from 'curbyourlitter-sql/lib/cans';


export var slugifyCanType = function (canType) {
        return canType.replace(/ /g, '-').toLowerCase();
};

export var Can = detailPanel(React.createClass({
    getImage: function (type) {
        var path = '/images/details/';
        if (type === 'Standard Litter Bin' || type === 'Covered Litter Bin') {
            return path + 'standard.jpg';
        }
        if (type === 'BigBelly Litter Bin') {
            return path + 'bigbelly.jpg';
        }
        if (type === 'Standard Paper Recycling Bin') {
            return path + 'paper_recycling.jpg';
        }
        if (type === 'Standard Bottle & Can Recycling Bin') {
            return path + 'bottle_can_recycling.jpg';
        }
    },

    render: function () {
        var iconClasses = 'detail-panel-can-icon';
        if (this.props.complaint_type) {
            iconClasses += ` detail-panel-can-icon-${slugifyCanType(this.props.cantype)}`;
        }
        var image = this.getImage(this.props.cantype);
        return (
            <div className="detail-panel-can">
                {image ? <img src={image} /> : ''}
                <h2>
                    <span className={iconClasses}></span>
                    <span className="detail-panel-can-header">Existing Bin</span>
                    <span className="clearfix"></span>
                </h2>
                <div className="detail-panel-row">
                    <label>Type</label>
                    <div>{this.props.cantype}</div>
                </div>
                {(() => {
                    if (this.props.can_location) {
                        return (
                            <div className="detail-panel-row">
                                <label>Location</label>
                                <div>{this.props.can_location}</div>
                            </div>
                        );
                    }
                })()}

                {(() => {
                    if (this.props.maintained_by) {
                        return (
                            <div className="detail-panel-row">
                                <label>Maintained By</label>
                                <div>{this.props.maintained_by}</div>
                            </div>
                        );
                    }
                })()}
                {(() => {
                    if (this.props.pick_up_schedule) {
                        return (
                            <div className="detail-panel-row">
                                <label>Pick-up Schedule</label>
                                <div>{this.props.pick_up_schedule}</div>
                            </div>
                        );
                    }
                })()}
            </div>
        );
    }
}), config.tables.can, getCanColumnsDetails(config));

export var CanListItem = hoverIntent(React.createClass({
    mixins: [History],

    handleClick: function () {
        this.history.pushState(null, `/cans/${this.props.id}`);
    },

    onHoverIntent: function () {
        this.props.highlightFeature(this.props.id, 'can');
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
        var itemClasses = 'can-list-item entity-list-item',
            iconClasses = 'can-list-item-icon';
        if (this.props.complaint_type) {
            iconClasses += ` can-list-item-icon-${slugifyCanType(this.props.type)}`;
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
                        <Col className="can-list-item-icon-column" xs={2}>
                            <div className={iconClasses}></div>
                        </Col>
                        <Col xs={10}>
                            <div className="can-list-item-type">Existing Bin</div>
                            <div className="can-list-item-location">
                                {this.props.can_location ? this.props.can_location : ''}
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
}), 100);
