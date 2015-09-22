import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

import config from '../config/config';
import { listRecordHovered, listRecordUnhovered } from '../actions';
import { Panel } from './Panel.jsx';
import { ReportListItem } from './Report.jsx';
import { RequestListItem } from './Request.jsx';

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

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

export var ListContainer = connect()(React.createClass({
    getData: function (callback) {
        // TODO only get reports as filtered, reports in viewport
        cartodbSql.execute("SELECT 'report' AS type, complaint_type, cartodb_id, created_date AS date FROM {{ table }}", {
            table: config.tables.report
        })
            .done(function (data) {
                callback(data.rows);
            });

        cartodbSql.execute("SELECT 'request' AS type, cartodb_id, can_type, added AS date FROM {{ table }} WHERE the_geom IS NOT NULL AND can_type IS NOT NULL", {
            table: config.tables.request
        })
            .done(function (data) {
                callback(data.rows);
            });
    },

    handleMouseEnter: function (id, type) {
        this.props.dispatch(listRecordHovered(id, type));
    },

    handleMouseLeave: function () {
        this.props.dispatch(listRecordUnhovered());
    },

    updateData: function () {
        var component = this;
        this.getData((data) => {
            var rows = [];
            rows.push(...this.state.rows);
            rows.push(...data);
            this.setState({ rows: _.sortBy(rows, (row) => row.date).reverse() });
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
