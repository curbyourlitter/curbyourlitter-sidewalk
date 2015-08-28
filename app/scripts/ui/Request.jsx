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
                <Link to="/requests/">&lt; List View</Link>
                <h2>{this.props.can_subtype} {this.props.can_type} can request</h2>
                {this.props.image ? <img src={this.props.image} /> : ''}
                {this.props.comment ? <div>{this.props.comment}</div> : ''}
            </div>
        );
    }
}), config.cartodbRequestTable);
