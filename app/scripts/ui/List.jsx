import _ from 'underscore';
import React from 'react';
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
        return React.findDOMNode(this.refs.inViewLabel).getBoundingClientRect().top;
    },

    handleScroll: function (e) {
        var oov = React.findDOMNode(this.refs.outOfView);
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
            if (inView && !item.in_bbox) {
                inView = false;
                return <li key="out-of-view" ref="outOfView" className="list-out-of-view">out of view</li>;
            }
            if (item.type === 'can') {
                return <CanListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} {...handlers} />
            }
            if (item.type === 'report') {
                return <ReportListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} {...handlers} />
            }
            else if (item.type === 'request') {
                return <RequestListItem key={item.type + item.cartodb_id} id={item.cartodb_id} {...item} {...handlers} />
            }
        });
        var innerHeader = (
            <h2>
                on the map
                <span className="list-items-count">{this.props.items.length}</span>
            </h2>
        );
        return (
            <Panel className="panel-list" ref="panel" onBodyScroll={this.handleScroll} innerHeader={innerHeader}>
                <div className="list-in-view" ref="inViewLabel">{this.state.inView ? 'in view' : 'out of view'}</div>
                <ul className="entity-list" onScroll={this.handleScroll}>
                    {list}
                </ul>
                <div className="list-add-request">Make a Request</div>
            </Panel>
        );
    }
});

function mapStateToProps(state) {
    return {
        mapBoundingBox: state.mapBoundingBox,
        reportFilters: _.extend({}, state.reportFilters),
        requestFilters: _.extend({}, state.requestFilters),
        yearFilters: _.extend({}, state.yearFilters)
    };
}

export var ListContainer = connect(mapStateToProps)(React.createClass({
    getInitialState: function () {
        return {
            canRows: [],
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
        getCans(filters, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.reportRows, ...this.state.requestRows);
                this.setRows(rows);
                this.setState({ canRows: data });
                this.forceUpdate();
            }
        }, getCanColumnsData(config), config);
    },

    loadReports: function (filters, yearFilters, callback) {
        getReports(filters, yearFilters, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.canRows, ...this.state.requestRows);
                this.setRows(rows);
                this.setState({ reportRows: data });
                this.forceUpdate();
            }
        }, getReportColumnsData(config), config);
    },

    loadRequests: function (filters, yearFilters, callback) {
        getRequests(filters, yearFilters, data => {
            if (this.isMounted()) {
                var rows = [];
                rows.push(...data, ...this.state.canRows, ...this.state.reportRows);
                this.setRows(rows);
                this.setState({ requestRows: data });
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
        return false;
    },

    setRows: function (rows) {
        // Subtract 180 degrees if in bbox to make items in view show up first for sure
        this.setState({ rows: _.sortBy(rows, row => {
            if (!row.center_distance) return 180;
            return row.center_distance - (row.in_bbox ? 180 : 0);
        })});
    },

    render: function () {
        return <List items={this.state.rows} highlightFeature={this.highlightFeature} unhighlightFeature={this.unhighlightFeature}/>
    }
}));
