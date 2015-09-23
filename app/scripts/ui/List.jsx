import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import config from '../config/config';
import { listRecordHovered, listRecordUnhovered } from '../actions';
import { Panel } from './Panel.jsx';
import { ReportListItem } from './Report.jsx';
import { RequestListItem } from './Request.jsx';
import { getRequests, requestColumnsData } from '../sql/requests';
import { getReports, reportColumnsData } from '../sql/reports';

export var List = React.createClass({
    render: function () {
        var handlers = {
            handleMouseEnter: this.props.handleMouseEnter,
            handleMouseLeave: this.props.handleMouseLeave
        };
        var list = this.props.items.map(item => {
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
            <Panel className="panel-list" innerHeader={innerHeader}>
                <ul className="entity-list">
                    {list}
                </ul>
            </Panel>
        );
    }
});

function mapStateToProps(state) {
    return {
        reportFilters: _.extend({}, state.reportFilters),
        requestFilters: _.extend({}, state.requestFilters),
        yearFilters: _.extend({}, state.yearFilters)
    };
}

export var ListContainer = connect(mapStateToProps)(React.createClass({
    getData: function (reportFilters, requestFilters, yearFilters, callback) {
        // TODO also take map bbox into account, sort
        getReports(reportFilters, yearFilters, callback, reportColumnsData);
        getRequests(requestFilters,yearFilters, callback, requestColumnsData);
    },

    handleMouseEnter: function (id, type) {
        this.props.dispatch(listRecordHovered(id, type));
    },

    handleMouseLeave: function () {
        this.props.dispatch(listRecordUnhovered());
    },

    componentWillUpdate: function(nextProps) {
        var shouldUpdateData = false;
        if (nextProps.reportFilters && !_.isEqual(nextProps.reportFilters, this.props.reportFilters)) {
            shouldUpdateData = true;
        }
        if (nextProps.requestFilters && !_.isEqual(nextProps.requestFilters, this.props.requestFilters)) {
            shouldUpdateData = true;
        }
        if (nextProps.yearFilters && !_.isEqual(nextProps.yearFilters, this.props.yearFilters)) {
            shouldUpdateData = true;
        }
        if (shouldUpdateData) {
            this.updateData(nextProps.reportFilters, nextProps.requestFilters, nextProps.yearFilters);
        }
    },

    updateData: function (reportFilters, requestFilters, yearFilters) {
        var component = this;
        reportFilters = reportFilters || this.props.reportFilters;
        requestFilters = requestFilters || this.props.requestFilters;
        yearFilters = yearFilters || this.props.yearFilters;
        this.setState({ rows: [] }, () => {
            this.getData(reportFilters, requestFilters, yearFilters, (data) => {
                var rows = [];
                rows.push(...this.state.rows);
                rows.push(...data);
                this.setState({ rows: _.sortBy(rows, (row) => row.date).reverse() });
            });
        });
    },

    componentDidMount: function () {
        this.updateData();
    },

    getInitialState: function () {
        return {
            rows: []
        };
    },

    render: function () {
        return <List items={this.state.rows} handleMouseEnter={this.handleMouseEnter} handleMouseLeave={this.handleMouseLeave}/>
    }
}));
