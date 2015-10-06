import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import config from '../config/config';
import { listRecordHovered, listRecordUnhovered } from '../actions';
import { Panel } from './Panel.jsx';
import { CanListItem } from './Can.jsx';
import { ReportListItem } from './Report.jsx';
import { RequestListItem } from './Request.jsx';
import { getCans, canColumnsData } from '../sql/cans';
import { getRequests, requestColumnsData } from '../sql/requests';
import { getReports, reportColumnsData } from '../sql/reports';

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
    getData: function (props, callback) {
        var canFilters = {},
            reportFilters = _.extend({}, props.reportFilters),
            requestFilters = _.extend({}, props.requestFilters);

        if (props.mapBoundingBox) {
            canFilters.bbox = props.mapBoundingBox;
            reportFilters.bbox = props.mapBoundingBox;
            requestFilters.bbox = props.mapBoundingBox;
        }
        getCans(canFilters, callback, canColumnsData);
        getReports(reportFilters, props.yearFilters, callback, reportColumnsData);
        getRequests(requestFilters, props.yearFilters, callback, requestColumnsData);
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

    componentWillUpdate: function(nextProps) {
        if (this.filtersChanged(this.props, nextProps)) {
            this.updateData(nextProps);
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

    updateData: function (props) {
        this.setState({ rows: [] }, () => {
            this.getData(props, data => {
                var rows = [];
                rows.push(...this.state.rows);
                rows.push(...data);

                // Subtract 180 degrees if in bbox to make items in view show up
                // first for sure
                this.setState({ rows: _.sortBy(rows, (row) => row.center_distance - (row.in_bbox ? 180 : 0)) });
            });
        });
    },

    getInitialState: function () {
        return {
            rows: []
        };
    },

    render: function () {
        return <List items={this.state.rows} highlightFeature={this.highlightFeature} unhighlightFeature={this.unhighlightFeature}/>
    }
}));
