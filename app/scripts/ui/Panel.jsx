import _ from 'underscore';
import React from 'react';
import { Link } from 'react-router';

export var Panel = React.createClass({
    render: function () {
        return (
            <div className="panel panel-right">
                {(() => {
                    if (!this.props.header) {
                        return (
                            <div className="panel-header">
                                <Link to="/">close</Link>
                            </div>
                        );
                    }
                    else {
                        return this.props.header;
                    }
                })()}
                <div className="panel-body">
                    {this.props.children}
                </div>
            </div>
        );
    }
});

export default Panel;
