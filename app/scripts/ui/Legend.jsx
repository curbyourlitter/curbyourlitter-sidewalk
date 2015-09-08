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
                Legend
                <YearPicker />
                <LegendItem name="sanitation conditions" label="sanitation_conditions" />
                <LegendItem name="overflowing litter basket" label="overflowing_litter_basket" />
                <LegendItem name="dirty conditions" label="dirty_conditions" />
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
        map.updateFilters({ year: value });
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
        map.updateFilters(filters);
    },

    render: function () {
        return (
            <div className="legend-item">
                <label htmlFor={this.props.label}>{this.props.name}</label>
                <input id={this.props.label} type="checkbox" onChange={this.handleChange} checked={this.state.shown} />
            </div>
        );
    }
});

export default Legend;
