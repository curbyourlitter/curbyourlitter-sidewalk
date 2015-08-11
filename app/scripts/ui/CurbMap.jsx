import _ from 'underscore';
import React from 'react';
import joinClasses from 'react/lib/joinClasses';
import { Link, Navigation, Router } from 'react-router';
import { Button, Overlay, Popover } from 'react-bootstrap';

import Legend from './Legend.jsx';
import PopoverButton from './PopoverButton.jsx';

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

var CurbMap = React.createClass({
    mixins: [Navigation],

    componentDidMount: function() {
        this.init(this.getId());
    },

    getId: function () {
        //return React.findDOMNode(this).id;
        return 'map';
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
            <div className="app-container">
                <div className="map" id="map">
                    <ListButton />
                    <AddButton />
                    <Legend />
                </div>
                {this.props.children}
            </div>
        );
    }
});

var AddButton = React.createClass({
    mixins: [PopoverButton],

    render: function () {
        return (
            <div>
                <Link to="/add" className="btn btn-add" ref="button">
                    add
                </Link>
                <Overlay show={this.state.popoverShown} target={()=> React.findDOMNode(this.refs.button)} placement="top" containerPadding={20}>
                    <Popover>
                        <div>Add a new request</div>
                        <Button onClick={this.dismissPopover}>got it</Button>
                    </Popover>
                </Overlay>
            </div>
        );
    }
});

var ListButton = React.createClass({
    mixins: [PopoverButton],

    render: function () {
        return (
            <div>
                <Link to="/reports" className="btn btn-list" ref="button">
                    list
                </Link>
                <Overlay show={this.state.popoverShown} target={()=> React.findDOMNode(this.refs.button)} placement="bottom" containerPadding={20}>
                    <Popover>
                        <div>List all records</div>
                        <Button onClick={this.dismissPopover}>got it</Button>
                    </Popover>
                </Overlay>
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
