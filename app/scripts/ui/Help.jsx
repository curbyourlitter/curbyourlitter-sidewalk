import React from 'react';
import { Button, Col, Grid, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import qwest from 'qwest';

import { ratingsColumnsDownload, getRatingSql } from '../sql/ratings';
import { reportColumnsDownload, getReportSql } from '../sql/reports';
import { requestColumnsDownload, getRequestSql } from '../sql/requests';
import config from '../config/config';

export var Help = React.createClass({
    componentDidMount: function () {
        qwest.get('/scripts/json/help.json')
            .then((xhr, response) => {
                this.setState({ helpData: response });
            })
            .catch((xhr, response, e) => {
                console.log('error', e);
            });
    },

    getInitialState: function () {
        return {
            helpData: null
        }
    },

    render: function () {
        return (
            <div className="help">
                <div className="help-body">
                    <Link className="help-close" to="/" aria-label="close">&times;</Link>
                    <h1>The Data</h1>
                    <HelpCommunityInput items={this.state.helpData ? this.state.helpData.requests.items : []} />
                    <Help311Data items={this.state.helpData ? this.state.helpData.reports.items : []} />
                    <HelpBlockRatings items={this.state.helpData ? this.state.helpData.ratings.items : []} />
                </div>
            </div>
        );
    }
});

var HelpItem = React.createClass({
    render: function () {
        return (
            <section className="help-item">
                <Grid>
                    <Row>
                        <Col xs={3}>
                            <img src={this.props.image}/>
                        </Col>
                        <Col xs={9}>
                            <h3>{this.props.header}</h3>
                            <p>{this.props.body}</p>
                        </Col>
                    </Row>
                </Grid>
            </section>
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
                {this.props.items.map((item, i) => {
                    return <HelpItem key={`community-input-${i}`} {...item} />;
                })}
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
                {this.props.items.map((item, i) => {
                    return <HelpItem key={`reports-${i}`} {...item} />;
                })}
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
                {this.props.items.map((item, i) => {
                    return <HelpItem key={`reports-${i}`} {...item} />;
                })}
            </section>
        );
    }
});
