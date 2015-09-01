import _ from 'underscore';
import config from '../config/config';
import moment from 'moment';
import React from 'react';
import { Link, Navigation } from 'react-router';
import { Col, Grid, Row } from 'react-bootstrap';
import { detailPanel } from './Panel.jsx';

export var Request = detailPanel(React.createClass({
    getInitialState: function () {
        return {};
    },

    render: function () {
        return (
            <div>
                <Link to="/list/">&lt; List View</Link>
                <h2>{this.props.can_subtype} {this.props.can_type} can request</h2>
                {this.props.image ? <img src={this.props.image} /> : ''}
                {this.props.comment ? <div>{this.props.comment}</div> : ''}
            </div>
        );
    }
}), config.tables.request);

export var RequestListItem = React.createClass({
    mixins: [Navigation],

    handleClick: function () {
        this.transitionTo(`/requests/${this.props.id}`);
    },

    handleMouseEnter: function () {
        this.props.handleMouseEnter(this.props.id, this.props.type);
    },

    handleMouseLeave: function () {
        this.props.handleMouseLeave(this.props.id, this.props.type);
    },

    render: function () {
        return (
            <li className="entity-list-item request-list-item" onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                <Grid>
                    <Row>
                        <Col sm={2}>
                            <div className="request-list-item-icon"></div>
                        </Col>
                        <Col sm={10}>
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
});
