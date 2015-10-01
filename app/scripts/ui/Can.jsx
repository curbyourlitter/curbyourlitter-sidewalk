import React from 'react';
import { History } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';
import { hoverIntent } from './HoverIntent.jsx';


export var slugifyCanType = function (canType) {
        return canType.replace(/ /g, '-').toLowerCase();
};

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

    shouldComponentUpdate: function () {
        // NB: currently nothing should make this list item need an update,
        // so always return false for speed-up
        return false;
    },

    render: function () {
        var iconClasses = 'can-list-item-icon';
        if (this.props.complaint_type) {
            iconClasses += ` can-list-item-icon-${slugifyCanType(this.props.type)}`;
        }
        return (
            <li className="entity-list-item can-list-item" onClick={this.handleClick} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.handleMouseLeave}>
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
