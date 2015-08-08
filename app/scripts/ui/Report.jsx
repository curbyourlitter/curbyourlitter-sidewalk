import _ from 'underscore';
import { Link } from 'react-router';

var cartodbSql = new cartodb.SQL({ user: 'curbyourlitter' });

var ReportDetails = React.createClass({
    getData: function (callback) {
        cartodbSql.execute('SELECT * FROM table_311_11222 WHERE cartodb_id = {{ id }}', { id: this.props.routeParams.reportId })
            .done(function (data) {
                callback(data.rows[0]);
            });
    },

    updateData: function () {
        var component = this;
        this.getData(function (data) {
            component.setState(data);
        });
    },

    componentDidMount: function () {
        this.updateData();
    },

    componentWillReceiveProps: function (nextProps) {
        if (this.props.routeParams.reportId !== nextProps.routeParams.reportId) {
            this.updateData();
        }
    },

    getInitialState: function () {
        return {};
    },

    render: function () {
        return (
            <div>
                <h2>
                    report details
                </h2>
                <div>{this.state.created_da}</div>
                <div>agency: {this.state.agency}</div>
                <div>descriptor: {this.state.descriptor}</div>
                <div>{this.state.location_t}</div>
            </div>
        );
    }
});

var Report = React.createClass({
    render: function () {
        return (
            <div className="panel panel-right">
                <Link to="/">close</Link>
                <ReportDetails {...this.props} />
            </div>
        );
    }
});

export default Report;
