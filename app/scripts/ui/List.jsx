import _ from 'underscore';
import React from 'react';

import config from '../config/config';
import { Panel } from './Panel.jsx';
import { ReportListItem } from './Report.jsx';
import { RequestListItem } from './Request.jsx';

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

export var List = React.createClass({
    render: function () {
        var list = this.props.items.map(item => {
            if (item.type === 'report') {
                return <ReportListItem key={item.cartodb_id} id={item.cartodb_id} {...item} />
            }
            else if (item.type === 'request') {
                return <RequestListItem key={item.cartodb_id} id={item.cartodb_id} {...item} />
            }
        });
        return (
            <Panel>
                <h2>on the map</h2>
                {this.props.items.length} results
                <ul className="entity-list">
                    {list}
                </ul>
            </Panel>
        );
    }
});

export var ListContainer = React.createClass({
    getData: function (callback) {
        // TODO only get reports as filtered, reports in viewport
        cartodbSql.execute("SELECT 'report' AS type, complaint_type, cartodb_id, created_date AS date FROM {{ table }}", {
            table: config.cartodbReportTable
        })
            .done(function (data) {
                callback(data.rows);
            });

        cartodbSql.execute("SELECT 'request' AS type, cartodb_id, can_type, added AS date FROM {{ table }}", {
            table: config.cartodbRequestTable
        })
            .done(function (data) {
                callback(data.rows);
            });
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
        return <List items={this.state.rows} />
    }
});
