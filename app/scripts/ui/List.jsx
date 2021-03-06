import _ from 'underscore';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { getCans, getCanColumnsData } from 'curbyourlitter-sql/lib/cans';
import { getReports, getReportColumnsData } from 'curbyourlitter-sql/lib/reports';
import { getRequests, getRequestColumnsData } from 'curbyourlitter-sql/lib/requests';

import config from '../config/config';
import { listRecordHovered, listRecordUnhovered } from '../actions';
import { Panel } from './Panel.jsx';
import { CanListItem } from './Can.jsx';
import { ReportListItem } from './Report.jsx';
import { RequestListItem } from './Request.jsx';

var loadingCans = false,
    loadingReports = false,
    loadingRequests = false;

export var List = React.createClass({
    getInitialState: function () {
        return {
            inView: true
        };
    },

    getHeaderHeight: function () {
        return ReactDOM.findDOMNode(this.refs.inViewLabel).getBoundingClientRect().top;
    },

    handleScroll: function (e) {
        var oov = ReactDOM.findDOMNode(this.refs.outOfView);
        if (oov) {
            var inView = oov.getBoundingClientRect().top > this.getHeaderHeight();
            if (this.state.inView != inView) {
                this.setState({ inView: inView });
            }
        }
    },

    render: function () {
        var inView = true;
        var handlers = {
            highlightFeature: this.props.highlightFeature,
            unhighlightFeature: this.props.unhighlightFeature
        };
        var list = this.props.items.map(item => {
            var hoveredOnMap = false;
            if (item.type === this.props.hoveredRecord.recordType && item.cartodb_id === this.props.hoveredRecord.id) {
                hoveredOnMap = true;
            }
            if (inView && !item.in_bbox) {
                inView = false;
                return <li key="out-of-view" ref="outOfView" className="list-out-of-view">out of view</li>;
            }
            if (item.type === 'can') {
                return <CanListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} {...handlers} hoveredOnMap={hoveredOnMap} />
            }
            if (item.type === 'report') {
                return <ReportListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} {...handlers} hoveredOnMap={hoveredOnMap} />
            }
            else if (item.type === 'request') {
                return <RequestListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} {...handlers} hoveredOnMap={hoveredOnMap} />
            }
        });
        var innerHeader = (
            <h2>
                {this.props.loading ? 'loading...' : 'on the map'}
                <span className="list-items-count">{this.props.items.length}</span>
            </h2>
        );
        var classes = 'panel-list';
        if (this.props.loading) {
            classes += ' loading';
        }
        return (
            <Panel className={classes} ref="panel" onBodyScroll={this.handleScroll} innerHeader={innerHeader}>
                <div className="list-in-view" ref="inViewLabel">{this.state.inView ? 'in view' : 'out of view'}</div>
                <ul className="entity-list" onScroll={this.handleScroll}>
                    {list}
                </ul>
            </Panel>
        );
    }
});

function mapStateToProps(state) {
    return {
        mapBoundingBox: state.mapBoundingBox,
        mapRecordHovered: _.extend({}, state.mapRecordHovered),
        reportFilters: _.extend({}, state.reportFilters),
        requestFilters: _.extend({}, state.requestFilters),
        yearFilters: _.extend({}, state.yearFilters)
    };
}

export var ListContainer = connect(mapStateToProps, null, null, { pure: false })(React.createClass({
    getInitialState: function () {
        return {
            canRows: [],
            loading: false,
            loadingCans: false,
            loadingRequests: false,
            loadingReports: false,
            reportRows: [],
            requestRows: [],
            rows: []
        };
    },

    getData: function (props) {
        var bboxFilters = { bbox: props.mapBoundingBox },
            canFilters = _.extend({}, bboxFilters),
            reportFilters = _.extend({}, bboxFilters, props.reportFilters),
            requestFilters = _.extend({}, bboxFilters, props.requestFilters);

        this.loadCans(canFilters);
        this.loadReports(reportFilters, props.yearFilters);
        this.loadRequests(requestFilters, props.yearFilters);
    },

    loadCans: function (filters) {
        this.setState({ loadingCans: true });
        getCans(filters, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.reportRows, ...this.state.requestRows);
                this.setRows(rows);
                this.setState({ loadingCans: false, canRows: data });
                this.forceUpdate();
            }
        }, getCanColumnsData(config), config);
    },

    loadReports: function (filters, yearFilters, callback) {
        this.setState({ loadingReports: true });
        getReports(filters, yearFilters, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.canRows, ...this.state.requestRows);
                this.setRows(rows);
                this.setState({ loadingReports: false, reportRows: data });
                this.forceUpdate();
            }
        }, getReportColumnsData(config), config);
    },

    loadRequests: function (filters, yearFilters, callback) {
        this.setState({ loadingRequests: true });
        getRequests(filters, yearFilters, data => {
            if (this.isMounted()) {
                var sightings = data.filter(row => row.can_type === null);
                var rows = [];
                rows.push(...sightings, ...this.state.canRows, ...this.state.reportRows);
                this.setRows(rows);
                this.setState({ loadingRequests: false, requestRows: sightings });
                this.forceUpdate();
            }
        }, getRequestColumnsData(config), config);
    },

    highlightFeature: function (id, type) {
        this.props.dispatch(listRecordHovered(id, type));
    },

    unhighlightFeature: function () {
        this.props.dispatch(listRecordUnhovered());
    },

    filtersChanged: function (oldProps, newProps) {
        if (!_.isEqual(oldProps.mapBoundingBox, newProps.mapBoundingBox) ||
            !_.isEqual(oldProps.reportFilters, newProps.reportFilters) ||
            !_.isEqual(oldProps.requestFilters, newProps.requestFilters) ||
            !_.isEqual(oldProps.yearFilters, newProps.yearFilters)) {
            return true;
        }
        return false;
    },

    componentDidMount: function () {
        this.getData(this.props);
    },

    componentWillUpdate: function (nextProps, nextState) {
        if (!(nextState.loadingCans || nextState.loadingReports || nextState.loadingRequests)) {
            if (this.state.loading) {
                this.setState({ loading: false });
            }
        }
        if (nextState.loadingCans || nextState.loadingReports || nextState.loadingRequests) {
            if (!this.state.loading) {
                this.setState({ loading: true });
            }
        }
        if (this.filtersChanged(this.props, nextProps)) {
            this.getData(nextProps);
        }
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        // Update if any filters changed
        if (this.filtersChanged(this.props, nextProps)) {
            return true;
        }

        // Always update if no rows, likely just opened
        if (this.state.rows.length === 0) {
            return true;
        }

        // Always update if rows changed
        if (this.state.rows.length !== nextState.rows.length) {
            return true;
        }

        if (this.state.loading !== nextState.loading) {
            return true;
        }

        if (!_.isEqual(nextProps.mapRecordHovered, this.props.mapRecordHovered)) {
            return true;
        }
        return false;
    },

    setRows: function (rows) {
        // All rows in the current view are at the top, then sorted by date
        // (no date, at the bottom, only existing bins).
        this.setState({ rows: rows.sort((a, b) => {
            if (a.in_bbox && !b.in_bbox) {
                return -1;
            }
            if (b.in_bbox && !a.in_bbox) {
                return 1;
            }
            var aDate = a.date ? new Date(a.date) : new Date(1900, 1, 1),
                bDate = b.date ? new Date(b.date) : new Date(1900, 1, 1);
            return bDate - aDate;
        })});
    },

    render: function () {
        return <List items={this.state.rows} hoveredRecord={this.props.mapRecordHovered} highlightFeature={this.highlightFeature} unhighlightFeature={this.unhighlightFeature} loading={this.state.loading} />
    }
}));
