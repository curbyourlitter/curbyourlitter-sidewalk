import _ from 'underscore';
import moment from 'moment';
import React from 'react';
import joinClasses from 'react/lib/joinClasses';
import { connect } from 'react-redux';
import { Link, Navigation, Router } from 'react-router';
import { Button, Overlay, Popover } from 'react-bootstrap';

import config from '../config/config';
import { listRecordHovered, listRecordUnhovered, mapIsReady, pinDropMoved } from '../actions';
import Legend from './Legend.jsx';
import PopoverButton from './PopoverButton.jsx';
import 'cartodbjs-hoverintent';

var map,
    ratingLayer,
    reportLayer,
    requestLayer,
    highlightedRecordLayer;

// Which layers on the map is the mouse currently over?
var currentlyOver = {};

var globalFilters = {
    year: null
};

var ratingFilters = {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true
};

var reportFilters = {
    dirty_conditions: true,
    overflowing_litter_basket: true,
    sanitation_conditions: true,
    year: null
};

var requestFilters = {
    litter: true,
    bigbelly: true,
    recycling: true,
    sightings: null
};

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });
var geocoder = new google.maps.Geocoder;

var highlightedRecordStyle = {
    color: 'yellow',
    weight: 2
};

function getRequestSql() {
    var sql = `SELECT *, added::text AS date FROM ${config.tables.request}`;
    var yearCondition;
    var whereConditions = _.chain(requestFilters)
        .map(function (value, key) {
            switch(key) {
                case 'bigbelly':
                    if (value) {
                        return "can_type = 'bigbelly'";
                    }
                    break;
                case 'litter':
                    if (value) {
                        return "can_type = 'trash'";
                    }
                    break;
                case 'recycling':
                    if (value) {
                        return "can_type = 'recycling'";
                    }
                    break;
                case 'sightings':
                    if (value) {
                        return 'can_type IS NULL';
                    }
                    break;
            }
            return null;
        })
        .filter(function (value) {
            return value !== null;
        })
        .value();
    if (globalFilters.year) {
        yearCondition = `extract(year from added) = ${globalFilters.year}`;
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

function getReportSql() {
    var sql = `SELECT *, created_date::text AS date FROM ${config.tables.report}`;
    var whereConditions = _.chain(reportFilters)
        .map(function (value, key) {
            if (key === 'sanitation_conditions' && value) {
                return "descriptor IN ('15 Street Cond/Dump-Out/Drop-Off')";
            }
            if (key === 'overflowing_litter_basket' && value) {
                return "descriptor IN ('6 Overflowing Litter Baskets')";
            }
            if (key === 'dirty_conditions' && value) {
                return "descriptor IN ('E1 Improper Disposal', 'E2 Receptacle Violation', 'E3 Dirty Sidewalk', 'E3A Dirty Area/Alleyway', 'E5 Loose Rubbish', 'E11 Litter Surveillance', 'E12 Illegal Dumping Surveillance')";
            }
            return null;
        })
        .filter(function (value) {
            return value !== null;
        })
        .value();
    var yearCondition = null;
    if (globalFilters.year) {
        yearCondition = `extract(year from created_date) = ${globalFilters.year}`;
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

function getRatingSql() {
    var sql = 'SELECT streets.the_geom_webmercator, ratings.rating FROM street_ratings ratings LEFT JOIN streets ON ratings.segment_id = streets.cartodb_id';
    var selectedRatings = _.chain(ratingFilters)
        .map(function (value, key) {
            if (value) {
                return key;
            }
            return null;
        })
        .filter(function (value) {
            return value !== null;
        })
        .value();
    sql += ' WHERE rating IN (' + selectedRatings.join(',') + ')';
    return sql;
}

function updateRatingSql() {
    ratingLayer.setSQL(getRatingSql());
}

function updateReportSql() {
    reportLayer.setSQL(getReportSql());
}

function updateRequestSql() {
    requestLayer.setSQL(getRequestSql());
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
        listRecordHovered: state.listRecordHovered,
        pinDropActive: state.pinDropActive
    };
}

var CurbMap = connect(mapStateToProps)(React.createClass({
    mixins: [Navigation],

    addDropPinPopup: function () {
        geocoder.geocode({'location': this.pin.getLatLng()}, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK) return;
            this.pin.bindPopup(this.getAddress(results[0])).openPopup();
        });
    },

    getAddress: function (geocoderResult) {
        var street_number = _.find(geocoderResult.address_components, component => {
            return component.types.indexOf('street_number') >= 0;
        }).long_name;
        var street = _.find(geocoderResult.address_components, component => {
            return component.types.indexOf('route') >= 0;
        }).short_name;
        return street_number + ' ' + street;
    },

    activateDropPin: function () {
        this.pin = L.marker(map.getCenter(), { 
            draggable: true,
            icon: badPlacementIcon
        }).addTo(map);

        // Give initial latlng
        this.checkDropPinValid(this.pin.getLatLng(), (valid) => {
            // TODO show popup with address if valid
            if (valid) {
                this.addDropPinPopup();
            }
            this.props.dispatch(pinDropMoved(this.pin.getLatLng(), valid));
        });

        // When marker is dragged, update latlng
        this.pin.on('dragend', () => {
            this.checkDropPinValid(this.pin.getLatLng(), (valid) => {
                if (valid) {
                    this.addDropPinPopup();
                }
                this.props.dispatch(pinDropMoved(this.pin.getLatLng(), valid));
            });
        });

        cartodbSql.execute('SELECT * FROM {{ table }}', {
            table: config.tables.intersections
        }, {
            format: 'GeoJSON'
        })
            .done((data) => {
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
            table: config.tables.intersections
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

    highlightRecordPoint: function (record) {
        this.unhighlightRecordPoint();
        cartodbSql.execute('SELECT the_geom FROM {{ table }} where cartodb_id = {{ id }}', {
            id: record.id,
            table: config.tables[record.recordType]
        }, {
            format: 'GeoJSON' 
        }).done((data) => {
            highlightedRecordLayer.addData(data);
        });
    },

    unhighlightRecordPoint: function () {
        highlightedRecordLayer.clearLayers();
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
        if (nextProps.listRecordHovered && (!this.props.listRecordHovered || !_.isEqual(nextProps.listRecordHovered, this.props.listRecordHovered))) {
            this.highlightRecordPoint(nextProps.listRecordHovered);
        }
        else if (!nextProps.listRecordHovered) {
            this.unhighlightRecordPoint();
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

        highlightedRecordLayer = L.geoJson(null, {
            style: highlightedRecordStyle,

            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng);
            }
        }).addTo(map);

        map.setView([40.728,-73.95], 15);

        var component = this;
        cartodb.createLayer(map, config.cartodbVisJson, {
            cartodb_logo: false,
            infowindow: false,
            legends: false
        })
            .addTo(map)
            .on('done', (layer) => {
                ratingLayer = layer.getSubLayer(0);
                reportLayer = layer.getSubLayer(1);
                requestLayer = layer.getSubLayer(2);

                reportLayer.setInteraction(true);
                reportLayer.setInteractivity('cartodb_id, date, complaint_type, agency');
                requestLayer.setInteraction(true);
                requestLayer.setInteractivity('cartodb_id, can_type, date');

                updateRatingSql();
                updateReportSql();
                updateRequestSql();

                layer.hoverIntent({}, function (e, latlng, pos, data, layerIndex) {
                    var content;
                    switch(layerIndex) {
                        case 1:
                            content = data.complaint_type + '<br/>' + moment(data.date).format('h:mma MMMM Do YYYY');
                            break;
                        case 2:
                            content = data.can_type + '<br/>' + moment(data.date).format('h:mma MMMM Do YYYY');
                            break;
                    }
                    map.closePopup();
                    map.openPopup(content, latlng);
                });

                layer.on('featureOver', (e, latlng, pos, data, layerIndex) => {
                    if (layerIndex === 1 || layerIndex === 2) {
                        currentlyOver[layerIndex] = true;
                        var table;
                        if (layerIndex === 1) {
                            table = 'report';
                        }
                        if (layerIndex === 2) {
                            table = 'request';
                        }
                        this.props.dispatch(listRecordHovered(data.cartodb_id, table));
                    }
                    if (_.values(currentlyOver).filter((l) => l).length > 0) {
                        document.getElementById(id).style.cursor = 'pointer';
                    }
                });
                layer.on('featureOut', (e, layerIndex) => {
                    if (!layerIndex) return;
                    currentlyOver[layerIndex] = undefined;
                    if (_.values(currentlyOver).filter((l) => l).length === 0) {
                        map.closePopup();
                        document.getElementById(id).style.cursor = null;
                        this.props.dispatch(listRecordUnhovered());
                    }
                });

                reportLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.transitionTo('/reports/' + data.cartodb_id);
                });
                requestLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.transitionTo('/requests/' + data.cartodb_id);
                });
            });
    },

    render: function() {
        return (
            <div className="map-container">
                <div className="map" ref="map" id="map">
                    <ListButton />
                    <AddButton />
                </div>
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
                <Link to="/list" onClick={this.handleClick} className="btn btn-list" ref="button">
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

    updateFilters: function (layer, newFilters) {
        switch (layer) {
            case 'rating':
                _.extend(ratingFilters, newFilters);
                updateRatingSql();
                break;
            case 'report':
                _.extend(reportFilters, newFilters);
                updateReportSql();
                break;
            case 'request':
                _.extend(requestFilters, newFilters);
                updateRequestSql();
                break;
            case null:
                _.extend(globalFilters, newFilters);
                updateReportSql();
                updateRequestSql();
                break;
        }
    },

    CurbMap: CurbMap

};

export { CurbMap as CurbMap };
