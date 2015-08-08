import { Link } from 'react-router';

import map from './Map.jsx';

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

    render: function () {
        return (
            <div className="legend-wrapper">
                <a className="btn btn-legend" onClick={this.showLegend}>legend</a>
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
