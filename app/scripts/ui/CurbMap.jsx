import _ from 'underscore';
import React from 'react';
import { Link, Navigation, Router } from 'react-router';

import Legend from './Legend.jsx';

var map,
    complaintLayer;

var filters = {
    rodents: true,
    sweeping: true
};

function getSql() {
    var sql = 'SELECT * FROM table_311_11222';
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
            if (key === 'rodents' && value) {
                return "complaint = 'Rodent'";
            }
            if (key === 'sweeping' && value) {
                return "complaint IN ('Sweeping/Inadequate', 'Sweeping/Missed', 'Sweeping/Missed-Inadequate')";
            }
            return null;
        })
        .filter(function (value) {
            return value !== null;
        })
        .value();
    if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' OR ');
    }
    return sql;
}

function updateSql() {
    complaintLayer.setSQL(getSql());
}

var AddButton = React.createClass({
    render: function() {
        return (
            <Link className="btn btn-add" to="/add">add</Link>
        );
    }
});

var CurbMap = React.createClass({
    mixins: [Navigation],

    componentDidMount: function() {
        this.init(this.getId());
    },

    getId: function () {
        return React.findDOMNode(this).id;
    },

    init: function (id) {
        map = L.map(id, {
            zoomControl: false
        });
        L.control.zoom({ position: 'bottomleft' }).addTo(map);

        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 11,
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.setView([40.728,-73.95], 15);

        cartodb.createLayer(map, 'https://curbyourlitter.cartodb.com/api/v2/viz/4226a41e-3b85-11e5-8232-0e4fddd5de28/viz.json', {
            cartodb_logo: false,
            infowindow: false
        })
            .addTo(map)
            .on('done', (layer) => {
                complaintLayer = layer.getSubLayer(0);
                complaintLayer.setInteractivity('cartodb_id,complaint');
                updateSql();

                layer.setInteraction(true);
                layer.on('featureOver', () => {
                    document.getElementById(id).style.cursor = 'pointer';
                });
                layer.on('featureOut', () => {
                    document.getElementById(id).style.cursor = null;
                });
                layer.on('featureClick', (event, latlng, pos, data) => {
                    this.transitionTo('/reports/' + data.cartodb_id);
                });
            });
    },

    render: function() {
        return (
            <div className="map" id="map">
                {this.props.children}
                <AddButton />
                <Legend />
            </div>
        );
    }
});

export default {
    updateFilters: function (newFilters) {
        _.extend(filters, newFilters);
        updateSql();
    },

    CurbMap: CurbMap

};

export { CurbMap as CurbMap };
