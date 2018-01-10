import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';

import config from '../config/config';
import { hoverIntent } from './HoverIntent.jsx';
import { detailPanel } from './Panel.jsx';
import { getInstalledCanColumnsDetails } from 'curbyourlitter-sql/lib/installedcans';


export var slugifyCanType = function (canType) {
        return canType.replace(/ /g, '-').toLowerCase();
};

export var InstalledCan = detailPanel(React.createClass({
    getImage: function (type) {
        return '/images/details/standard.jpg';
    },

    render: function () {
        var image = this.getImage(this.props.cantype);
        return (
            <div className="detail-panel-can">
                {image ? <img src={image} /> : ''}
                <h2>
                    <span className='detail-panel-installedcan-icon'></span>
                    <span className="detail-panel-can-header">New Bin</span>
                    <span className="clearfix"></span>
                </h2>
                <div className="detail-panel-row">
                    <label>Type</label>
                    <div>{this.props.cantype}</div>
                </div>
                <div className="detail-panel-row">
                    <label>Location</label>
                    <div>{this.props.name}</div>
                </div>
            </div>
        );
    }
}), config.tables.installedcan, getInstalledCanColumnsDetails(config));

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
                            <div className="can-list-item-type">New Bin</div>
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
