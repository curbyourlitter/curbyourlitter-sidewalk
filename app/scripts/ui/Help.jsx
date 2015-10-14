import React from 'react';
import { Button, Col, Grid, Row } from 'react-bootstrap';
import { Link } from 'react-router';

import { getRatingsColumnsDownload, getRatingSql } from 'curbyourlitter-sql/lib/ratings';
import { getReportColumnsDownload, getReportSql } from 'curbyourlitter-sql/lib/reports';
import { getRequestColumnsDownload, getRequestSql } from 'curbyourlitter-sql/lib/requests';

import config from '../config/config';

export var Help = React.createClass({
    render: function () {
        return (
            <div className="help">
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
            <section className="help-type">
                <h2>
                    Community Input
                    <Button className="help-download" href={this.downloadUrl()}>Download Data</Button>
                </h2>
                <p>
                    In 2017, the Curb Your Litter project will install new litter and recycling bins throughout Greenpoint. We built this map to allow Greenpointers to help us decide the street corners that would best benefit from a new trash can. Users can choose from six different types of bins:
                </p>
                <section>
                    <h3>Trash Bins</h3>
                    <HelpItem header="Covered Litter Bin" image="images/bintypes/litter_standard.jpg" />
                    <HelpItem header="BigBelly Solar Compactor Litter Bin" image="images/bintypes/litter_standard.jpg" />
                </section>
                <section>
                    <h3>Recycling Bins</h3>
                    <HelpItem header="Standard Bottle/Can Recycling Bin" image="images/bintypes/litter_standard.jpg" />
                    <HelpItem header="Standard Paper Recycling Bin" image="images/bintypes/litter_standard.jpg" />
                    <HelpItem header="BigBelly Solar Compactor for Bottle/Can Recycling" image="images/bintypes/litter_standard.jpg" />
                    <HelpItem header="BigBelly Solar Compactor for Paper Recycling" image="images/bintypes/litter_standard.jpg" />
                    <HelpItem header="BigBelly Solar Compactor for Paper Recycling" image="images/bintypes/litter_standard.jpg" />
                </section>
                <p>
                    Each green basket on the map represents a vote for a new bin&mdash;click them on the map to read more about the request, or download a CSV file of all requests made to date.
                </p>
            </section>
        );
    }
});

var HelpLitterSightings = React.createClass({
    render: function () {
        return (
            <section className="help-type">
                <h2>Litter Sightings</h2>
                <p>
                    Photos of litter in the neighborhood illustrate the problem and help us identify areas that need the most attention. Submitting a photo of a particular corner, sidewalk or vacant lot strewn with trash is a way to do your part to curb our litter problem!  Click each litter sighting on the map to see the details and read more.
                </p>
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
            <section className="help-type">
                <h2>
                    311 Data
                    <Button className="help-download" href={this.downloadUrl()}>Download Data</Button>
                </h2>
                <p>
                    311 is New York City's main source of government information and non-emergency services. Residents can report littered streets and sidewalks by calling 311 or registering a complaint online. The map displays common complaints about litter in Greenpoint, including:
                </p>
                <HelpItem header="Sanitation Condition" image="images/bintypes/litter_standard.jpg">
                    <div class="help-311-code">Code 15: Dirty Conditions / Corner Drop off</div>
                    <p>Request for cleaning or the collection of items (e.g bags, bulk items) that have been dumped on a street or public area in front of a location or end of a street, etc.</p>
                </HelpItem>
                <HelpItem header="Overflowing Litter Baskets" image="images/bintypes/litter_standard.jpg">
                    <div class="help-311-code">Code 6: Overflowing Litter Baskets</div>
                    <p>Litter basket is overflowing (above the top) with litter falling out.</p>
                </HelpItem>
                <HelpItem header="Dirty Conditions" image="images/bintypes/litter_standard.jpg">
                    <div class="help-311-code">Code E1: Improper Disposal</div>
                    <p>When an individual leaves materials in front of the another person’s property and the complainant knows the residence of origin.</p>
                    <div class="help-311-code">Code E2: Receptacle Violation</div>
                    <p>Uncovered or overflowing receptacle or dumpster.</p>
                    <div class="help-311-code">Code E3: Dirty Sidewalk</div>
                    <p>Any property where the sidewalk area is not kept clean and contains litter/debris.</p>
                    <div class="help-311-code">Code E3A: Dirty Area/Alleyway</div>
                    <p>Unclean or untidy yards, areaways, alleys, and courts visible from the street.</p>
                    <div class="help-311-code">Code E5: Loose Rubbish</div>
                    <p>Newspapers, cardboard, and other debris that has been put out for collection but is not securely bundled or tied together.</p>
                    <div class="help-311-code">Code E11: Litter Surveillance</div>
                    <p>Chronic location where pedestrians fail to dispose of litter properly.</p>
                    <div class="help-311-code">Code E12: Illegal Dumping Surveillance</div>
                    <p>Chronic location where material is being dumped from a vehicle(s). Must include timeframes and days of the week when dumping tends to occurs.</p>
                </HelpItem>
            </section>
        );
    }
});

var HelpBlockRatings = React.createClass({
    downloadUrl: function () {
        var sql = getRatingSql(null, [config.minYear, config.maxYear], getRatingsColumnsDownload(config), config),
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
                <p>
                    We created a system for rating the cleanliness of our sidewalks on a 1-5 scale. Blocks are rated each year by the project team and volunteers at each of our Clean Up Days.
                </p>
                <HelpItem header="1: Clean" image="/images/bintypes/litter_standard.jpg" body="Little or no visible litter on the block surface sampled. [Recall that the survey for each block focuses on just one of the three “surfaces”—the sidewalks on both sides of the street and the street itself.]" />
                <HelpItem header="2: Mostly Clean" image="/images/bintypes/litter_standard.jpg" body="A few discrete small items of litter." />
                <HelpItem header="3: Visible Litter" image="/images/bintypes/litter_standard.jpg" body="More than just a few items of litter. Enough litter to be easily perceived and to induce an awareness that the street is not &ldquo;clean.&rdquo;" />
                <HelpItem header="4: Lots of Litter" image="/images/bintypes/litter_standard.jpg" body="Fairly continuous items of litter. Enough litter to produce a distinct impression that the block surface has not been recently cleaned." />
                <HelpItem header="5: Dirty" image="/images/bintypes/litter_standard.jpg" body="A major litter problem. Distinctly indicates that there are issues on the block such as those associated with homelessness, illegal dumping, drug use, abandonment, impaired property values, lack of full-time residents, small levels of pedestrian traffic associated with businesses." />
            </section>
        );
    }
});

var HelpExistingCans = React.createClass({
    render: function () {
        return (
            <section className="help-type">
                <h2>Existing Bins</h2>
                <p>A dataset of all litter bins in the 11222 zip code is not publically available from the City of New York. We filled in this gap by surveying and mapping each bin in our neighborhood. There are currently two types of bins servicing Greenpoint:</p>
                <HelpItem header="BigBelly Solar Compactors for Trash" image="images/bintypes/litter_standard.jpg" />
                <HelpItem header="Standard Litter Bins" image="images/bintypes/litter_standard.jpg" />
                <HelpItem header="Covered Litter Bins" image="images/bintypes/litter_standard.jpg" />
            </section>
        );
    }
});
