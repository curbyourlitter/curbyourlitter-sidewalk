import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';

import config from '../config/config';

export var Help = React.createClass({
    render: function () {
        return (
            <div className="help">
                <div className="help-body">
                    <Link className="help-close" to="/" aria-label="close">&times;</Link>
                    {this.props.children}
                </div>
            </div>
        );
    }
});

export var HelpCommunityInput = React.createClass({
    downloadUrl: function () {
        var columns = [
            'name',
            'added',
            'can_type',
            'can_subtype',
            'comment',
            'image',
            'ST_X(the_geom) AS longitude',
            'ST_Y(the_geom) AS latitude'
        ],
            sql = `SELECT ${columns.join(',')} FROM ${config.tables.request}`,
            queryString = $.param({
                q: sql,
                filename: 'Curb Your Litter - Community Input',
                format: 'csv'
            });
        return `http://${config.cartodbUser}.cartodb.com/api/v2/sql?${queryString}`;
    },

    render: function () {
        return (
            <div>
                <h1>The Data</h1>
                <h2>
                    Community Input
                    <Button className="help-download" href={this.downloadUrl()}>Download CSV</Button>
                </h2>
                <section>
                    <h3>Litter Basket Requests</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>BigBelly Requests</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>Recycling Bin Requests</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>Litter Sightings</h3>
                    <p>Text</p>
                </section>
            </div>
        );
    }
});

export var Help311Data = React.createClass({
    downloadUrl: function () {
        var columns = [
            'complaint_type',
            'descriptor',
            'incident_address',
            'location_type',
            'status',
            'ST_X(the_geom) AS longitude',
            'ST_Y(the_geom) AS latitude'
        ],
            sql = `SELECT ${columns.join(',')} FROM ${config.tables.report}`,
            queryString = $.param({
                q: sql,
                filename: 'Curb Your Litter - 311 Data',
                format: 'csv'
            });
        return `http://${config.cartodbUser}.cartodb.com/api/v2/sql?${queryString}`;
    },

    render: function () {
        return (
            <div>
                <h1>The Data</h1>
                <h2>
                    311 Data
                    <Button className="help-download" href={this.downloadUrl()}>Download CSV</Button>
                </h2>
                <section>
                    <h3>Sanitation Conditions</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>Overflowing Litter Basket</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>Dirty Conditions</h3>
                    <p>Text</p>
                </section>
            </div>
        );
    }
});
