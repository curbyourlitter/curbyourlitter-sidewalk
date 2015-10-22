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
            var destinationElement = document.getElementById(hashId);
            if (destinationElement && typeof destinationElement.scrollIntoView === 'function') {
                destinationElement.scrollIntoView();
            }
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
        }
    },

    render: function () {
        return (
            <div className="help" onClick={this.handleOuterClick}>
                <div className="help-body">
                    <Link className="help-close" to="/" aria-label="close">&times;</Link>
                    <h1>The Data</h1>
                    <HelpCommunityInput />
                    <HelpLitterSightings />
                    <Help311Data />
                    <HelpBlockRatings />
                    <HelpExistingCans />
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
                            {(() => {
                                if (this.props.body) {
                                    return <p>{this.props.body}</p>;
                                }
                            })()}
                            {this.props.children}
                        </Col>
                    </Row>
                </Grid>
            </section>
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
                    <h5 className="no-margin-top">{this.props.header}</h5>
                    {(() => {
                        if (this.props.body) {
                            return <p>{this.props.body}</p>;
                        }
                    })()}
                    {this.props.children}
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
                {(() => {
                    if (this.props.body) {
                        return <p>{this.props.body}</p>;
                    }
                })()}
                {this.props.children}
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
                <h3>
                    In 2017, the Curb Your Litter project will install new litter and recycling bins throughout Greenpoint. We built this map to allow Greenpointers to help us decide the street corners that would best benefit from a new trash can. Users can choose from six different types of bins:
                </h3>
                <Grid>
                    <Row>
                        <HelpHeaderItem header="Litter Requests" image="images/bintypes/litter_request_icon.png" description="Each green basket on the map represents a vote for a new bin—click them on the map to read more about the request, or download a CSV file of all requests made to date." />
                    </Row>
                </Grid>
                <section className="trash-bins">
                    <h4 className="subhead">Trash Bins</h4>
                    <Grid>
                        <Row>
                            <CommunityItem header="Covered Litter Bin" image="images/bintypes/litter_standard.jpg" body="A covered litter bin accepts all types of trash that someone walking on the street might need to throw away. An upside to this type of bin is that you can put anything in it, and the covered top prevents it from overflowing. Everything placed in this bin is sent to a landfill." />
                            <CommunityItem header="BigBelly Litter Bin" image="images/bintypes/litter_bigbelly.jpg" body="A BigBelly litter bin uses solar panels to compact trash, allowing for these bins to hold more trash than standard litter bins. Compactors can potentially reduce truck traffic they do not need be serviced as frequently as standard bins. These bins are more expensive to maintain, and everything that goes in is sent to a landfill." />
                        </Row>
                    </Grid>
                </section>
                <section className="recycling-bins">
                    <h4 className="subhead">Recycling Bins</h4>
                    <Grid>
                        <Row>
                            <CommunityItem header="Standard Bottle & Can Recycling Bin" image="images/bintypes/recycling_standard_bottle.jpg" body="Bottle & Can recycling bins take only metal cans and plastic bottles. Cans and bottles thrown away in this type of bin are recycled. These bins encourage people to recycle and are easy to maintain." />
                            <CommunityItem header="Standard Paper Recycling Bin" image="images/bintypes/recycling_standard_paper.jpg" body="Paper recycling bins take only clean paper and magazines. All paper tossed in these bins are recycled. Standard reycling bins encourage people to recycle and are easy to maintain." />
                            <CommunityItem header="BigBelly Bottle & Can Recycling" image="images/bintypes/recycling_bigbelly_bottle.jpg" body="This type of bin accepts metal cans and plastic bottles only, and all cans and bottles thrown away in them are recycled.  A BigBelly recycler uses solar panels to power a machine that compacts trash within. Compactors can potentially reduce truck traffic they do not need be serviced as frequently as standard bins." />
                            <CommunityItem header="BigBelly Paper Recycling" image="images/bintypes/recycling_bigbelly_paper.jpg" body="This type of bin accepts clean paper and magazines only, and all paper thrown away in them is recycled. A BigBelly recycler uses solar panels to power a machine that compacts trash within. Compactors can potentially reduce truck traffic they do not need be serviced as frequently as standard bins." />
                        </Row>
                    </Grid>
                </section>
            </section>
        );
    }
});

var HelpLitterSightings = React.createClass({
    render: function () {
        return (
            <section className="help-type">
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
                        <BlockRatingItem header="1: Clean" image="/images/bintypes/01_rating.png" body="Little or no visible litter on the block surface sampled. [Recall that the survey for each block focuses on just one of the three “surfaces”—the sidewalks on both sides of the street and the street itself.]" />
                        <BlockRatingItem header="2: Mostly Clean" image="/images/bintypes/02_rating.png" body="A few discrete small items of litter." />
                    </Row>
                    <Row>
                        <BlockRatingItem header="3: Visible Litter" image="/images/bintypes/03_rating.png" body="More than just a few items of litter. Enough litter to be easily perceived and to induce an awareness that the street is not &ldquo;clean.&rdquo;" />
                        <BlockRatingItem header="4: Lots of Litter" image="/images/bintypes/04_rating.png" body="Fairly continuous items of litter. Enough litter to produce a distinct impression that the block surface has not been recently cleaned." />
                    </Row>
                    <Row>
                        <BlockRatingItem header="5: Dirty" image="/images/bintypes/05_rating.png" body="A major litter problem. Distinctly indicates that there are issues on the block such as those associated with homelessness, illegal dumping, drug use, abandonment, impaired property values, lack of full-time residents, small levels of pedestrian traffic associated with businesses." />
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
