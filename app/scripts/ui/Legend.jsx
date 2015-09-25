import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Button, Input } from 'react-bootstrap';

import { filtersClear, filtersUpdate } from '../actions';
import config from '../config/config';
import map from './CurbMap.jsx';

function mapStateToProps(state) {
    return {
        ratingFilters: _.extend({}, state.ratingFilters),
        reportFilters: _.extend({}, state.reportFilters),
        requestFilters: _.extend({}, state.requestFilters),
        yearFilters: _.extend({}, state.yearFilters)
    };
}

var Legend = connect(mapStateToProps)(React.createClass({
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

    clear: function (e) {
        e.preventDefault();
        this.props.dispatch(filtersClear());
    },

    render: function () {
        return (
            <div className={this.state.shown ? "legend visible" : "legend" }>
                <h2 className="legend-header">
                    <span className="legend-header-icon"></span>
                    <span className="legend-header-label">filters</span>
                    <a className="legend-header-clear" onClick={this.clear} href="#">reset</a>
                </h2>
                <div className="legend-body">
                    <YearPicker dispatch={this.props.dispatch} range={this.props.yearFilters} />
                    <section>
                        <h3>
                            <span className="legend-section-header">Community Input</span>
                            <Link to="/help/community-input" className="legend-help">?</Link>
                        </h3>
                        <LegendItem name="Litter Basket Requests" layer="request" label="litter" dispatch={this.props.dispatch} shown={this.props.requestFilters.litter} />
                        <LegendItem name="BigBelly Requests" layer="request" label="bigbelly" dispatch={this.props.dispatch} shown={this.props.requestFilters.bigbelly} />
                        <LegendItem name="Recycling Bin Requests" layer="request" label="recycling" dispatch={this.props.dispatch} shown={this.props.requestFilters.recycling} />
                        <LegendItem name="Litter sightings" layer="request" label="sightings" dispatch={this.props.dispatch} shown={this.props.requestFilters.sightings} />
                    </section>
                    <section>
                        <h3>
                            <span className="legend-section-header">311 Data</span>
                            <Link to="/help/311-data" className="legend-help">?</Link>
                        </h3>
                        <LegendItem name="Sanitation Conditions" layer="report" label="sanitation_conditions" dispatch={this.props.dispatch} shown={this.props.reportFilters.sanitation_conditions} />
                        <LegendItem name="Overflowing Litter Basket" layer="report" label="overflowing_litter_basket" dispatch={this.props.dispatch} shown={this.props.reportFilters.overflowing_litter_basket} />
                        <LegendItem name="Dirty Conditions" layer="report" label="dirty_conditions" dispatch={this.props.dispatch} shown={this.props.reportFilters.dirty_conditions} />
                    </section>
                    <section>
                        <h3>
                            <span className="legend-section-header">Block Ratings</span>
                        </h3>
                        <LegendItem name="Poor" layer="rating" label="5" dispatch={this.props.dispatch} shown={this.props.ratingFilters[5]} />
                        <LegendItem name="Below Average" layer="rating" label="4" dispatch={this.props.dispatch} shown={this.props.ratingFilters[4]} />
                        <LegendItem name="Average" layer="rating" label="3" dispatch={this.props.dispatch} shown={this.props.ratingFilters[3]} />
                        <LegendItem name="Above Average" layer="rating" label="2" dispatch={this.props.dispatch} shown={this.props.ratingFilters[2]} />
                        <LegendItem name="Great" layer="rating" label="1" dispatch={this.props.dispatch} shown={this.props.ratingFilters[1]} />
                    </section>
                </div>
            </div>
        );
    }
}));

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
    handleChange: function (name, value) {
        this.props.dispatch(filtersUpdate('year', name, parseInt(value)));
    },

    render: function () {
        return (
            <div className="legend-year-picker">
                <YearSelect name="start" onChange={e => this.handleChange('start', e.target.value)} selected={this.props.range.start} min={config.minYear} max={config.maxYear} minAllowed={config.minYear} maxAllowed={this.props.range.end} /> to
                <YearSelect name="end" onChange={e => this.handleChange('end', e.target.value)} selected={this.props.range.end} min={config.minYear} max={config.maxYear} minAllowed={this.props.range.start} maxAllowed={config.maxYear} />
            </div>
        );
    }
});

var YearSelect = React.createClass({
    render: function () {
        return (
            <Input type="select" name={this.props.name} onChange={this.props.onChange} value={this.props.selected}>
                {_.range(this.props.min, this.props.max + 1).map(year => {
                    return <option key={year} value={year} disabled={year < this.props.minAllowed || year > this.props.maxAllowed}>{year}</option>;
                })}
            </Input>
        );
    }
});

var LegendItem = React.createClass({
    handleChange: function () {
        this.props.dispatch(filtersUpdate(this.props.layer, this.props.label, !this.props.shown));
    },

    render: function () {
        return (
            <div className="legend-item">
                <input id={this.props.label} type="checkbox" onChange={this.handleChange} checked={this.props.shown} />
                <label htmlFor={this.props.label}>{this.props.name}</label>
            </div>
        );
    }
});

export default Legend;
