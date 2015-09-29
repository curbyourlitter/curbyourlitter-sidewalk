import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';

import { ratingsColumnsDownload, getRatingSql } from '../sql/ratings';
import { reportColumnsDownload, getReportSql } from '../sql/reports';
import { requestColumnsDownload, getRequestSql } from '../sql/requests';
import config from '../config/config';

export var Help = React.createClass({
    render: function () {
        return (
            <div className="help">
                <div className="help-body">
                    <Link className="help-close" to="/" aria-label="close">&times;</Link>
                    <h1>The Data</h1>
                    <HelpCommunityInput/>
                    <Help311Data/>
                    <HelpBlockRatings/>
                </div>
            </div>
        );
    }
});

export var HelpCommunityInput = React.createClass({
    downloadUrl: function () {
        var sql = getRequestSql(null, null, requestColumnsDownload),
            queryString = $.param({
                q: sql,
                filename: 'Curb Your Litter - Community Input',
                format: 'csv'
            });
        return `http://${config.cartodbUser}.cartodb.com/api/v2/sql?${queryString}`;
    },

    render: function () {
        return (
            <section className="help-type">
                <h2>
                    Community Input
                    <Button className="help-download" href={this.downloadUrl()}>Download Data</Button>
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
            </section>
        );
    }
});

export var Help311Data = React.createClass({
    downloadUrl: function () {
        var sql = getReportSql(null, null, reportColumnsDownload),
            queryString = $.param({
                q: sql,
                filename: 'Curb Your Litter - 311 Data',
                format: 'csv'
            });
        return `http://${config.cartodbUser}.cartodb.com/api/v2/sql?${queryString}`;
    },

    render: function () {
        return (
            <section className="help-type">
                <h2>
                    311 Data
                    <Button className="help-download" href={this.downloadUrl()}>Download Data</Button>
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
            </section>
        );
    }
});

export var HelpBlockRatings = React.createClass({
    downloadUrl: function () {
        var sql = getRatingSql(null, [config.minYear, config.maxYear], ratingsColumnsDownload),
            queryString = $.param({
                q: sql,
                filename: 'Curb Your Litter - Block Ratings Data',
                format: 'csv'
            });
        return `http://${config.cartodbUser}.cartodb.com/api/v2/sql?${queryString}`;
    },

    render: function () {
        return (
            <section className="help-type">
                <h2>
                    Block Ratings
                    <Button className="help-download" href={this.downloadUrl()}>Download Data</Button>
                </h2>
                <section>
                    <h3>Poor</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>Below Average</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>Average</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>Above Average</h3>
                    <p>Text</p>
                </section>
                <section>
                    <h3>Great</h3>
                    <p>Text</p>
                </section>
            </section>
        );
    }
});
