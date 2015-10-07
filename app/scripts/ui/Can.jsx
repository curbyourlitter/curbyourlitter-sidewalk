import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';

import config from '../config/config';
import { hoverIntent } from './HoverIntent.jsx';
import { detailPanel } from './Panel.jsx';
import { canColumnsDetails } from '../sql/cans';


export var slugifyCanType = function (canType) {
        return canType.replace(/ /g, '-').toLowerCase();
};

export var Can = detailPanel(React.createClass({
    render: function () {
        var iconClasses = 'detail-panel-can-icon';
        if (this.props.complaint_type) {
            iconClasses += ` detail-panel-can-icon-${slugifyCanType(this.props.cantype)}`;
        }
        return (
            <div className="detail-panel-can">
                <h2>
                    <span className={iconClasses}></span>
                    <span className="detail-panel-can-header">Existing Bin</span>
                    <span className="clearfix"></span>
                </h2>
                <div className="detail-panel-row">
                    <label>Type</label>
                    <div>{this.props.cantype}</div>
                </div>
            </div>
        );
    }
}), config.tables.can, canColumnsDetails);

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
        return (nextProps.in_bbox !== this.props.in_bbox);
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
        return (
            <li className={itemClasses} onClick={this.handleClick} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.handleMouseLeave}>
                <Grid>
                    <Row>
                        <Col className="can-list-item-icon-column" xs={2}>
                            <div className={iconClasses}></div>
                        </Col>
                        <Col xs={10}>
                            <div className="can-list-item-type">Existing Bin</div>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
}), 300);
