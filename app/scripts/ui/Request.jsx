import _ from 'underscore';
import config from '../config/config';
import moment from 'moment';
import React from 'react';
import { Link, Navigation } from 'react-router';
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
}), config.cartodbRequestTable);

export var RequestListItem = React.createClass({
    mixins: [Navigation],

    handleClick: function () {
        this.transitionTo(`/requests/${this.props.id}`);
    },

    render: function () {
        return (
            <li className="entity-list-item request-list-item" onClick={this.handleClick}>
                <div className="request-list-item-can-type">
                    {this.props.can_type} can request
                </div>
                <div className="request-list-item-date">
                    {moment(this.props.date).format('h:mma MMMM Do YYYY')}
                </div>
            </li>
        );
    }
});
