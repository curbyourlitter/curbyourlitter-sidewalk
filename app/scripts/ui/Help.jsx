import imagesLoaded from 'imagesloaded';
import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Col, Grid, Row } from 'react-bootstrap';
import { History, Link } from 'react-router';

import { getRatingsColumnsDownload, getRatingSql } from 'curbyourlitter-sql/lib/ratings';
import { getReportColumnsDownload, getReportSql } from 'curbyourlitter-sql/lib/reports';
import { getRequestColumnsDownload, getRequestSql } from 'curbyourlitter-sql/lib/requests';

import config from '../config/config';

export var Help = React.createClass({
    mixins: [History],

    componentDidMount: function () {
        var hashId = window.location.hash.substr(1);
        if (hashId.length > 1) {
            imagesLoaded('img', () => {
                var destinationElement = document.getElementById(hashId);
                if (destinationElement && typeof destinationElement.scrollIntoView === 'function') {
                    destinationElement.scrollIntoView();
                }
            });
        }

        document.addEventListener('keydown', this.handleKeyDown);
    },

    componentWillUnmount: function () {
        document.removeEventListener('keydown', this.handleKeyDown);
    },

    handleKeyDown: function (e) {
        if (e.which === 27) {
            this.history.pushState(null, '/');
        }
    },

    handleOuterClick: function (e) {
        if (e.target === ReactDOM.findDOMNode(this)) {
            this.history.pushState(null, '/');
            e.preventDefault();
        }
    },

    render: function () {
        return (
            <div className="help" onClick={this.handleOuterClick}>
                <div className="help-body">
                    <Link className="help-close" to="/" aria-label="close">&times;</Link>
                    <h1>The Data</h1>
                    <HelpCommunityInput />
                    <Help311Data />
                    <HelpBlockRatings />
                    <HelpExistingCans />
                </div>
            </div>
        );
    }
});

var HelpHeaderItem = React.createClass({
    render: function () {
        return (
            <Col sm={6}>
                <h4 className="help-header"><img src={this.props.image} className="help-header-img" />{this.props.header}</h4>
                {(() => {
                    if (this.props.description) {
                        return <p className="type-description">{this.props.description}</p>;
                    }
                })()}
            </Col>
        );
    }
});

var BlockRatingItem = React.createClass({
    render: function () {
        return (
            <div className="block-rating-descriptions">
                <Col sm={2}>
                    <img src={this.props.image} className="img-responsive" />
                </Col>
                <Col sm={4}>
                    <h5 className="no-margin-top">
                        <div className={"block-ratings-indicator rating-" + this.props.rating}></div>
                        {this.props.header}
                    </h5>
                    {this.props.body ? <div className="help-description">{this.props.body}</div> : ''}
                </Col>
            </div>
        );
    }
});

var CommunityItem = React.createClass({
    render: function () {
        return (
            <Col sm={3}>
                <img src={this.props.image} className="img-responsive" />
                <h5>{this.props.header}</h5>
                {this.props.body ? <div className="help-description">{this.props.body}</div> : ''}
            </Col>
        );
    }
});

var HelpCommunityInput = React.createClass({
    downloadUrl: function () {
        var sql = getRequestSql(null, null, getRequestColumnsDownload(config), config),
            queryString = $.param({
                q: sql,
                filename: 'Curb Your Litter - Community Input',
                format: 'csv'
            });
        return `http://${config.cartodbUser}.cartodb.com/api/v2/sql?${queryString}`;
    },

    render: function () {
        return (
            <section className="help-type" id="community-input">
                <h2>
                    Community Input
                    <Button className="help-download" href={this.downloadUrl()}>Download Data</Button>
                </h2>
                <Grid>
                    <Row>
                        <HelpHeaderItem header="Litter Sightings" image="images/bintypes/litter_sighting_icon.png" description="Photos of litter in the neighborhood illustrate the problem and help us identify areas that need the most attention. Submitting a photo of a particular corner, sidewalk or vacant lot strewn with trash is a way to do your part to curb our litter problem! Click each litter sighting on the map to see the details and read more." />
                    </Row>
                </Grid>
            </section>
        );
    }
});

var Help311Data = React.createClass({
    downloadUrl: function () {
        var sql = getReportSql(null, null, getReportColumnsDownload(config), config),
            queryString = $.param({
                q: sql,
                filename: 'Curb Your Litter - 311 Data',
                format: 'csv'
            });
        return `http://${config.cartodbUser}.cartodb.com/api/v2/sql?${queryString}`;
    },

    render: function () {
        return (
            <section className="help-type" id="reports">
                <h2>
                    311 Data
                    <Button className="help-download" href={this.downloadUrl()}>Download Data</Button>
                </h2>
                <h3>
                    311 is New York Citys main source of government information and non-emergency services. Residents can report littered streets and sidewalks by calling 311 or registering a complaint online. The map displays common complaints about litter in Greenpoint, including:
                </h3>
                <section className="311-data">
                    <Grid>
                        <Row>
                            <Col sm={6}>
                                <h4><img src="images/bintypes/311_sanitation.png" className="help-header-img" />Sanitation Condition</h4>
                                <div className="help-code-list">
                                    <div className="help-code">Code 15: Dirty Condition / Corner Drop off</div>
                                    <div>Request for cleaning or the collection of items (e.g bags, bulk items) that have been dumped on a street or public area in front of a location or end of a street, etc.</div>
                                </div>
                            </Col>
                            <Col sm={6}>
                                <h4><img src="images/bintypes/311_overflow.png" className="help-header-img" />Overflowing Litter Bin</h4>
                                <div className="help-code-list">
                                    <div className="help-code">Code 6: Overflowing Litter Basket</div>
                                    <div>Litter basket is overflowing (above the top) with litter falling out.</div>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6}>
                                <h4><img src="images/bintypes/311_dirty.png" className="help-header-img" />Dirty Condition</h4>
                                <div className="help-code-list">
                                    <div className="help-code">Code E1: Improper Disposal</div>
                                    <div>When an individual leaves materials in front of the another person’s property and the complainant knows the residence of origin.</div>
                                    <div className="help-code">Code E2: Receptacle Violation</div>
                                    <div>Uncovered or overflowing receptacle or dumpster.</div>
                                    <div className="help-code">Code E3: Dirty Sidewalk</div>
                                    <div>Any property where the sidewalk area is not kept clean and contains litter/debris.</div>
                                    <div className="help-code">Code E3A: Dirty Area/Alleyway</div>
                                    <div>Unclean or untidy yards, areaways, alleys, and courts visible from the street.</div>
                                    <div className="help-code">Code E5: Loose Rubbish</div>
                                    <div>Newspapers, cardboard, and other debris that has been put out for collection but is not securely bundled or tied together.</div>
                                    <div className="help-code">Code E11: Litter Surveillance</div>
                                    <div>Chronic location where pedestrians fail to dispose of litter properly.</div>
                                    <div className="help-code">Code E12: Illegal Dumping Surveillance</div>
                                    <div>Chronic location where material is being dumped from a vehicle(s). Must include timeframes and days of the week when dumping tends to occurs.</div>
                                </div>
                            </Col>
                        </Row>
                    </Grid>
                </section>
            </section>
        );
    }
});

var HelpBlockRatings = React.createClass({
    downloadUrl: function () {
        var sql = getRatingSql(null, null, getRatingsColumnsDownload(config), config),
            queryString = $.param({
                q: sql,
                filename: 'Curb Your Litter - Block Ratings Data',
                format: 'csv'
            });
        return `http://${config.cartodbUser}.cartodb.com/api/v2/sql?${queryString}`;
    },

    render: function () {
        return (
            <section className="help-type block-ratings" id="block-ratings">
               <h2>
                    Block Ratings
                    <Button className="help-download" href={this.downloadUrl()}>Download Data</Button>
                </h2>
                <h3>
                    We created a system for rating the cleanliness of our sidewalks on a 1-5 scale. Blocks are rated each year by the project team and volunteers at each of our Clean Up Days.
                </h3>
                <Grid>
                    <Row>
                        <BlockRatingItem header="1: Clean" image="/images/ratings/1.jpg" body="Little or no visible litter on the block surface sampled. [Recall that the survey for each block focuses on just one of the three “surfaces”—the sidewalks on both sides of the street and the street itself.]" rating={1} />
                        <BlockRatingItem header="2: Mostly Clean" image="/images/ratings/2.jpg" body="A few discrete small items of litter." rating={2} />
                    </Row>
                    <Row>
                        <BlockRatingItem header="3: Visible Litter" image="/images/ratings/3.jpg" body="More than just a few items of litter. Enough litter to be easily perceived and to induce an awareness that the street is not &ldquo;clean.&rdquo;" rating={3} />
                        <BlockRatingItem header="4: Lots of Litter" image="/images/ratings/4.jpg" body="Fairly continuous items of litter. Enough litter to produce a distinct impression that the block surface has not been recently cleaned." rating={4} />
                    </Row>
                    <Row>
                        <BlockRatingItem header="5: Dirty" image="/images/ratings/5.jpg" body="A major litter problem. Distinctly indicates that there are issues on the block such as those associated with homelessness, illegal dumping, drug use, abandonment, impaired property values, lack of full-time residents, small levels of pedestrian traffic associated with businesses." rating={5} />
                    </Row>
                    <Row>
                        <Col sm={6}>
                            <h5 className="help-block-ratings-use-header">How to use this data</h5>
                            <div className="help-description">
                                If you would like to map the block ratings from the downloaded CSV, we recommend using <a href="https://cartodb.com">CartoDB</a>. Once you sign up for a free account you can map the ratings by uploading the CSV file in CartoDB.
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </section>
        );
    }
});

var HelpExistingCans = React.createClass({
    render: function () {
        return (
            <section className="help-type">
                <h2>Existing Bins</h2>
                <h3>A dataset of all litter bins in the 11222 zip code is not publically available from the City of New York. We filled in this gap by surveying and mapping each bin in our neighborhood. There are currently two types of bins servicing Greenpoint</h3>
            </section>
        );
    }
});
