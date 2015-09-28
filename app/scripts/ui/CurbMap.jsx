import _ from 'underscore';
import moment from 'moment';
import React from 'react';
import joinClasses from 'react/lib/joinClasses';
import { connect } from 'react-redux';
import { History, Link, Router } from 'react-router';
import { Button, Overlay, Popover } from 'react-bootstrap';
import 'cartodbjs-hoverintent';

import config from '../config/config';
import { listRecordHovered, listRecordUnhovered, mapIsReady, pinDropMoved } from '../actions';
import PopoverButton from './PopoverButton.jsx';
import { getRequestSql } from '../sql/requests';
import { getReportSql } from '../sql/reports';

var map;

// Which layers on the map is the mouse currently over?
var currentlyOver = {};

var globalFilters = {
    year: null
};

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });
var geocoder = new google.maps.Geocoder;

var highlightedRecordStyle = {
    color: 'yellow',
    weight: 2
};

var placementIconSize = [35, 50],
    placementIconAnchor = [17, 50];

var badPlacementIcon = L.icon({
    iconAnchor: placementIconAnchor,
    iconSize: placementIconSize,
    iconUrl: '/images/map-place-bin-invalid.svg'
});

var goodPlacementIcon = L.icon({
    iconAnchor: placementIconAnchor,
    iconSize: placementIconSize,
    iconUrl: '/images/map-place-bin-valid.svg'
});

var dragPlacementIcon = L.icon({
    iconAnchor: placementIconAnchor,
    iconSize: placementIconSize,
    iconUrl: '/images/map-place-bin-drag.svg'
});

function mapStateToProps(state) {
    return {
        listRecordHovered: state.listRecordHovered,
        mapCenter: state.mapCenter,
        pinDropActive: state.pinDropActive,
        ratingFilters: _.extend({}, state.ratingFilters),
        reportFilters: _.extend({}, state.reportFilters),
        requestFilters: _.extend({}, state.requestFilters),
        yearFilters: _.extend({}, state.yearFilters)
    };
}

export var CurbMap = connect(mapStateToProps)(React.createClass({
    mixins: [History],

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
        this.pin.on('dragstart', () => {
            this.pin.setIcon(dragPlacementIcon);
        });
        this.pin.on('dragend', () => {
            this.checkDropPinValid(this.pin.getLatLng(), (valid) => {
                if (valid) {
                    this.addDropPinPopup();
                }
                this.props.dispatch(pinDropMoved(this.pin.getLatLng(), valid));
            });
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
            // Only highlight if mouse is still over the feature
            if (this.props.listRecordHovered &&
                this.props.listRecordHovered.id === record.id && 
                this.props.listRecordHovered.recordType === record.recordType) {
                this.highlightedRecordLayer.addData(data);
            }
        });
    },

    unhighlightRecordPoint: function () {
        this.highlightedRecordLayer.clearLayers();
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

    componentDidUpdate: function (prevProps, prevState) {
        if (this.props.mapCenter && this.props.mapCenter[0] && this.props.mapCenter[1] && !_.isEqual(this.props.mapCenter, prevProps.mapCenter)) {
            map.setView(this.props.mapCenter, 17);
        }
        if (this.props.ratingFilters && !_.isEqual(this.props.ratingFilters, prevProps.ratingFilters)) {
            this.updateRatingSql();
        }
        if (this.props.reportFilters && !_.isEqual(this.props.reportFilters, prevProps.reportFilters)) {
            this.updateReportSql();
        }
        if (this.props.requestFilters && !_.isEqual(this.props.requestFilters, prevProps.requestFilters)) {
            this.updateRequestSql();
        }
        if (this.props.yearFilters && !_.isEqual(this.props.yearFilters, prevProps.yearFilters)) {
            this.updateRatingSql();
            this.updateReportSql();
            this.updateRequestSql();
        }
    },

    getRatingSql: function(filters) {
        var sql = 'SELECT ST_collect(streets.the_geom_webmercator) AS the_geom_webmercator, AVG(ratings.rating) AS avg FROM street_ratings ratings LEFT JOIN streets ON ratings.segment_id = streets.cartodb_id';
        var yearCondition = `extract(year from collected) BETWEEN ${this.props.yearFilters.start} AND ${this.props.yearFilters.end}`;
        var selectedRatings = _.chain(filters || this.props.ratingFilters)
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
        sql += ` WHERE rating IN (${selectedRatings.join(',')}) AND ${yearCondition}`;
        sql += ' GROUP BY streets.cartodb_id';
        return sql;
    },

    updateRatingSql: function () {
        if (this.ratingLayer) {
            this.ratingLayer.setSQL(this.getRatingSql());
        }
    },

    updateReportSql: function () {
        if (this.reportLayer) {
            this.reportLayer.setSQL(getReportSql(this.props.reportFilters, this.props.yearFilters));
        }
    },

    updateRequestSql: function () {
        if (this.requestLayer) {
            this.requestLayer.setSQL(getRequestSql(this.props.requestFilters, this.props.yearFilters));
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
        L.control.scale({ position: 'bottomleft' }).addTo(map);

        config.tileLayer.addTo(map);

        this.highlightedRecordLayer = L.geoJson(null, {
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
                this.ratingLayer = layer.getSubLayer(0);
                this.reportLayer = layer.getSubLayer(1);
                this.requestLayer = layer.getSubLayer(2);

                this.reportLayer.setInteraction(true);
                this.reportLayer.setInteractivity('cartodb_id, date, complaint_type, agency');
                this.requestLayer.setInteraction(true);
                this.requestLayer.setInteractivity('cartodb_id, can_type, date');

                this.updateRatingSql();
                this.updateReportSql();
                this.updateRequestSql();

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

                this.reportLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.history.pushState(null, `/reports/${data.cartodb_id}`);
                });
                this.requestLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.history.pushState(null, `/requests/${data.cartodb_id}`);
                });
            });
    },

    render: function() {
        return <div className="map" ref="map" id="map"></div>;
    }
}));

export var AddButton = React.createClass({
    mixins: [PopoverButton],

    handleClick: function () {
        this.setState({ popoverShown: false });
    },

    render: function () {
        return (
            <div>
                <Link to="/add" onClick={this.handleClick} className="btn btn-default btn-add" ref="button">
                    <div>+</div>
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

export var ListButton = React.createClass({
    mixins: [PopoverButton],

    handleClick: function () {
        this.setState({ popoverShown: false });
    },

    render: function () {
        return (
            <div>
                <Link to="/list" onClick={this.handleClick} className="btn btn-list" ref="button"></Link>
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
