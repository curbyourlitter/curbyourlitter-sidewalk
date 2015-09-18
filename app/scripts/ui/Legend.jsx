import React from 'react';
import { Link } from 'react-router';
import { Button, ButtonGroup } from 'react-bootstrap';

import map from './CurbMap.jsx';

var Legend = React.createClass({
    getInitialState: function () {
        return {
            shown: false
        };
    },

    showLegend: function () {
        this.setState({
            shown: !this.state.shown
        });
    },

    handleClick: function () {
        this.setState({ popoverShown: false });
        this.showLegend();
    },

    render: function () {
        return (
            <div className={this.state.shown ? "legend visible" : "legend" }>
                <h2 className="legend-header">Filters</h2>
                <div className="legend-body">
                    <YearPicker />
                    <section>
                        <h3>
                            Community Input
                            <Link to="/help/community-input" className="legend-help">?</Link>
                        </h3>
                        <LegendItem name="Litter Basket Requests" layer="request" label="litter" />
                        <LegendItem name="BigBelly Requests" layer="request" label="bigbelly" />
                        <LegendItem name="Recycling Bin Requests" layer="request" label="recycling" />
                        <LegendItem name="Litter sightings" layer="request" label="sightings" />
                    </section>
                    <section>
                        <h3>
                            311 Data
                            <Link to="/help/311-data" className="legend-help">?</Link>
                        </h3>
                        <LegendItem name="Sanitation Conditions" layer="report" label="sanitation_conditions" />
                        <LegendItem name="Overflowing Litter Basket" layer="report" label="overflowing_litter_basket" />
                        <LegendItem name="Dirty Conditions" layer="report" label="dirty_conditions" />
                    </section>
                    <section>
                        <h3>Block Ratings</h3>
                        <LegendItem name="Poor" layer="rating" label="5" />
                        <LegendItem name="Below Average" layer="rating" label="4" />
                        <LegendItem name="Average" layer="rating" label="3" />
                        <LegendItem name="Above Average" layer="rating" label="2" />
                        <LegendItem name="Great" layer="rating" label="1" />
                    </section>
                </div>
            </div>
        );
    }
});

var YearButton = React.createClass({
    handleClick: function () {
        this.props.onClick(this.props.year);
    },

    currentYear: function () {
        return (new Date()).getFullYear();
    },

    render: function () {
        return <Button onClick={this.handleClick} disabled={this.props.year > this.currentYear()} active={this.props.active}>{this.props.year}</Button>;
    }
});

var YearPicker = React.createClass({
    getInitialState: function () {
        return {
            year: null
        }
    },

    handleClick: function (value) {
        this.setState({ year: value });
        map.updateFilters(null, { year: value });
    },

    render: function () {
        return (
            <div>
                <ButtonGroup>
                    <Button onClick={() => this.handleClick(null)} active={this.state.year === null}>All</Button>
                    {[2015, 2016, 2017].map(year => {
                        return <YearButton key={year} onClick={this.handleClick} active={this.state.year === year} year={year} />;
                    })}
                </ButtonGroup>
            </div>
        );
    }
});

var LegendItem = React.createClass({
    getInitialState: function () {
        return {
            shown: true
        };
    },

    handleChange: function () {
        var shown = !this.state.shown;
        this.setState({ shown: shown });
        var filters = {};
        filters[this.props.label] = shown;
        map.updateFilters(this.props.layer, filters);
    },

    render: function () {
        return (
            <div className="legend-item">
                <input id={this.props.label} type="checkbox" onChange={this.handleChange} checked={this.state.shown} />
                <label htmlFor={this.props.label}>{this.props.name}</label>
            </div>
        );
    }
});

export default Legend;
