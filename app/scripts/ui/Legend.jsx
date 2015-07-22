var reactRouter = require('react-router'),
    Link = reactRouter.Link;

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
                </div>
            </div>
        );
    }
});

module.exports = Legend;
