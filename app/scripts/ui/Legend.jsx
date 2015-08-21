import React from 'react';
import { Link } from 'react-router';
import { Button, Overlay, Popover } from 'react-bootstrap';

import map from './CurbMap.jsx';
import PopoverButton from './PopoverButton.jsx';

var Legend = React.createClass({
    mixins: [PopoverButton],

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
            <div className="legend-wrapper">
                <a className="btn btn-legend" ref="button" onClick={this.handleClick}>legend</a>
                <Overlay show={this.state.popoverShown} target={()=> React.findDOMNode(this.refs.button)} placement="top" containerPadding={20}>
                    <Popover>
                        <div>Show legend and pick layers</div>
                        <Button onClick={this.dismissPopover}>got it</Button>
                    </Popover>
                </Overlay>
                <div className={this.state.shown ? "legend visible" : "legend" }>
                    Legend
                    <LegendItem name="rodent sightings" label="rodents" />
                    <LegendItem name="sweeping complaints" label="sweeping" />
                </div>
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
