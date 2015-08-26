import _ from 'underscore';
import React from 'react';
import joinClasses from 'react/lib/joinClasses';
import { connect } from 'react-redux';
import { Link, Navigation, Router } from 'react-router';
import { Button, Overlay, Popover } from 'react-bootstrap';

import config from '../config/config';
import { mapIsReady, pinDropMoved } from '../actions';
import Legend from './Legend.jsx';
import PopoverButton from './PopoverButton.jsx';

var map,
    complaintLayer;

var filters = {
    rodents: true,
    sweeping: true,
    year: null
};

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });

function getSql() {
    var sql = `SELECT * FROM ${config.cartodbReportTable}`;
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
            if (key === 'rodents' && value) {
                return "complaint_type = 'Rodent'";
            }
            if (key === 'sweeping' && value) {
                return "complaint_type IN ('Sweeping/Inadequate', 'Sweeping/Missed', 'Sweeping/Missed-Inadequate')";
            }
            return null;
        })
        .filter(function (value) {
            return value !== null;
        })
        .value();
    var yearCondition = null;
    if (filters.year) {
        yearCondition = `extract(year from created_date) = ${filters.year}`;
    }
    if (whereConditions.length > 0) {
        sql += ` WHERE (${whereConditions.join(' OR ')})`;
        if (yearCondition) {
            sql += ' AND ' + yearCondition;
        }
    }
    else if (yearCondition) {
        sql += ' WHERE ' + yearCondition;
    }
    return sql;
}

function updateSql() {
    complaintLayer.setSQL(getSql());
}

var badPlacementIcon = L.AwesomeMarkers.icon({
    icon: 'ion-sad',
    markerColor: 'red',
    prefix: 'ion'
});

var goodPlacementIcon = L.AwesomeMarkers.icon({
    icon: 'ion-happy',
    markerColor: 'green',
    prefix: 'ion'
});

function mapStateToProps(state) {
    return {
        pinDropActive: state.pinDropActive
    };
}

var CurbMap = connect(mapStateToProps)(React.createClass({
    mixins: [Navigation],

    activateDropPin: function () {
        this.pin = L.marker(map.getCenter(), { 
            draggable: true,
            icon: badPlacementIcon
        }).addTo(map);

        // Give initial latlng
        this.checkDropPinValid(this.pin.getLatLng(), (valid) => {
            this.props.dispatch(pinDropMoved(this.pin.getLatLng(), valid));
        });

        // When marker is dragged, update latlng
        this.pin.on('dragend', () => {
            this.checkDropPinValid(this.pin.getLatLng(), (valid) => {
                this.props.dispatch(pinDropMoved(this.pin.getLatLng(), valid));
            });
        });

        cartodbSql.execute('SELECT * FROM {{ table }}', {
            table: config.cartodbIntersectionsTable
        }, {
            format: 'GeoJSON'
        })
            .done(function (data) {
                this.intersectionLayer = L.geoJson(data, {
                    pointToLayer: function (feature, latlng) {
                        return L.circle(latlng, config.cartodbIntersectionRadius);
                    },

                    style: {
                        clickable: false,
                        color: 'green',
                        fillColor: 'green',
                        fillOpacity: 0.1,
                        weight: 2
                    }
                }).addTo(map);
            });
    },

    checkDropPinValid: function (latlng, callback) {
        cartodbSql.execute('SELECT * FROM {{ table }} WHERE ST_DWithin(the_geom::geography, CDB_LatLng({{ lat }}, {{ lng }})::geography, {{ radius }})', {
            lat: latlng.lat,
            lng: latlng.lng,
            radius: config.cartodbIntersectionRadius,
            table: config.cartodbIntersectionsTable
        }).done((data) => {
            var valid = data.rows.length > 0;
            this.pin.setIcon(valid ? goodPlacementIcon : badPlacementIcon);
            callback(valid);
        });
    },

    deactivateDropPin: function () {
        map.removeLayer(this.intersectionLayer);
        map.removeLayer(this.pin);
    },

    componentDidMount: function() {
        this.init(this.getId());
        this.props.dispatch(mapIsReady());
        if (this.props.pinDropActive) {
            this.activateDropPin();
        }
    },

    componentWillUpdate: function(nextProps) {
        if (nextProps.pinDropActive && !this.props.pinDropActive) {
            this.activateDropPin();
        }
        if (!nextProps.pinDropActive && this.props.pinDropActive) {
            this.deactivateDropPin();
        }
    },

    getId: function () {
        return React.findDOMNode(this.refs.map).id;
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

        cartodb.createLayer(map, config.cartodbVisJson, {
            cartodb_logo: false,
            infowindow: false,
            legends: false
        })
            .addTo(map)
            .on('done', (layer) => {
                complaintLayer = layer.getSubLayer(1);
                complaintLayer.setInteractivity('cartodb_id,complaint_type');
                updateSql();

                complaintLayer.setInteraction(true);
                complaintLayer.on('featureOver', () => {
                    document.getElementById(id).style.cursor = 'pointer';
                });
                complaintLayer.on('featureOut', () => {
                    document.getElementById(id).style.cursor = null;
                });
                complaintLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.transitionTo('/reports/' + data.cartodb_id);
                });
            });
    },

    render: function() {
        return (
            <div className="map" ref="map" id="map">
                <ListButton />
                <AddButton />
                <Legend />
            </div>
        );
    }
}));

var AddButton = React.createClass({
    mixins: [PopoverButton],

    handleClick: function () {
        this.setState({ popoverShown: false });
    },

    render: function () {
        return (
            <div>
                <Link to="/add" onClick={this.handleClick} className="btn btn-add" ref="button">
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

    handleClick: function () {
        this.setState({ popoverShown: false });
    },

    render: function () {
        return (
            <div>
                <Link to="/reports" onClick={this.handleClick} className="btn btn-list" ref="button">
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
