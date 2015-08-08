import _ from 'underscore';
import React from 'react';
import { Link } from 'react-router';

export var Panel = React.createClass({
    render: function () {
        return (
            <div className="panel panel-right">
                <div className="panel-header">
                    <Link to="/">close</Link>
                </div>
                <div className="panel-body">
                    {this.props.children}
                </div>
            </div>
        );
    }
});

export default Panel;
