import _ from 'underscore';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { History, Link, Router } from 'react-router';
import { Button, Overlay, Popover } from 'react-bootstrap';
import 'cartodbjs-hoverintent';

import { getRatingSql, getRatingsColumnsMap } from 'curbyourlitter-sql/lib/ratings';
import { getReportSql, getReportColumnsMap } from 'curbyourlitter-sql/lib/reports';
import { getRequestSql, getRequestColumnsMap } from 'curbyourlitter-sql/lib/requests';

import config from '../config/config';
import {
    listRecordHovered,
    listRecordUnhovered,
    mapIsReady,
    mapMoved,
    pinDropMoved,
    requestsRequireReload
} from '../actions';
import PopoverButton from './PopoverButton.jsx';
import { slugifyComplaintType } from './Report.jsx';

var map;

var ratingLayerIndex = 0,
    reportLayerIndex = 1,
    canLayerIndex = 2,
    requestLayerIndex = 3;

// Which layers on the map is the mouse currently over?
var currentlyOver = {};

var globalFilters = {
    year: null
};

var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });
var geocoder = new google.maps.Geocoder;

// Icons for placing bins
var placementIconSize = [21, 30],
    placementIconAnchor = [10, 30];

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
        addingRequest: state.addingRequest,
        filtersWidth: state.filtersWidth,
        listRecordHovered: state.listRecordHovered,
        mapCenter: state.mapCenter,
        panelWidth: state.panelWidth,
        pinDropActive: state.pinDropActive,
        pinDropDragActive: state.pinDropDragActive,
        ratingFilters: _.extend({}, state.ratingFilters),
        recordSelected: state.recordSelected,
        reportFilters: _.extend({}, state.reportFilters),
        requestFilters: _.extend({}, state.requestFilters),
        requestsRequireReload: state.requestsRequireReload,
        yearFilters: _.extend({}, state.yearFilters)
    };
}

export var CurbMap = connect(mapStateToProps)(React.createClass({
    mixins: [History],

    addDropPinPopup: function () {
        geocoder.geocode({'location': this.pin.getLatLng()}, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK) return;
            this.pin.bindPopup(this.getAddress(results[0]), {
                closeButton: false,
                offset: [0, -25]
            }).openPopup();
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
            if (valid) {
                this.addDropPinPopup();
            }
            this.props.dispatch(pinDropMoved(this.pin.getLatLng(), valid));
        });

        // When marker is dragged, update latlng
        this.pin.on('dragstart', () => {
            this.pin.unbindPopup();
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

    enableDropPinDrag: function () {
        this.pin.dragging.enable();
    },

    disableDropPinDrag: function () {
        this.pin.dragging.disable();
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
        this.pin = undefined;
    },

    getHighlightedRecordIcon: function (data, zoom) {
        var iconAnchor,
            iconSize,
            iconUrl;

        if (data.type === 'can') {
            iconAnchor = [8, 10];
            iconSize = [16, 23];
            iconUrl = '/images/map-bin-hover.svg';
        }
        if (data.type === 'report') {
            iconAnchor = [6, 6];
            iconSize = [12, 12];
            iconUrl = '/images/map-report.svg';
        }
        if (data.type === 'request' && data.can_type) {
            iconAnchor = [8, 10];
            iconSize = [16, 23],
            iconUrl = '/images/map-bin-request-hover.svg';
        }
        if (data.type === 'request' && !data.can_type) {
            iconAnchor = [6, 6];
            iconSize = [12, 12];
            iconUrl = '/images/map-litter-sighting.svg';
        }

        if (zoom >= 17) {
            var width = Math.floor(iconSize[0] * 1.7),
                height = Math.floor(iconSize[1] * 1.7);
            iconSize = [width, height];
            iconAnchor = [width / 2, height / 2 - Math.floor(height * 0.1)];
        }

        return L.icon({
            iconAnchor: iconAnchor,
            iconSize: iconSize,
            iconUrl: iconUrl
        });
    },

    getSelectedRecordIcon: function (data, zoom) {
        var iconAnchor,
            iconSize,
            iconUrl;

        if (data.type === 'can') {
            iconAnchor = [8, 10];
            iconSize = [16, 23];
            iconUrl = '/images/map-bin-selected.svg';
        }
        if (data.type === 'report') {
            iconAnchor = [6, 6];
            iconSize = [12, 12];
            iconUrl = '/images/map-report.svg';
        }
        if (data.type === 'request' && data.can_type) {
            iconAnchor = [8, 10];
            iconSize = [16, 23];
            iconUrl = '/images/map-bin-request-selected.svg';
        }
        if (data.type === 'request' && !data.can_type) {
            iconAnchor = [6, 6];
            iconSize = [12, 12];
            iconUrl = '/images/map-litter-sighting.svg';
        }

        if (zoom >= 17) {
            var width = Math.floor(iconSize[0] * 1.5),
                height = Math.floor(iconSize[1] * 1.5);
            iconSize = [width, height];
            iconAnchor = [width / 2, height / 2];
        }

        return L.icon({
            iconAnchor: iconAnchor,
            iconSize: iconSize,
            iconUrl: iconUrl
        });
    },

    highlightRecordPoint: function (record) {
        this.unhighlightRecordPoint();
        cartodbSql.execute('SELECT * FROM {{ table }} where cartodb_id = {{ id }}', {
            id: record.id,
            table: config.tables[record.recordType]
        }, {
            format: 'GeoJSON' 
        }).done((data) => {
            // Only highlight if mouse is still over the feature
            if (this.props.listRecordHovered &&
                this.props.listRecordHovered.id === record.id && 
                this.props.listRecordHovered.recordType === record.recordType) {
                data.features[0].properties.type = record.recordType;
                this.highlightedRecordLayer.addData(data);
            }
        });
    },

    unhighlightRecordPoint: function () {
        this.highlightedRecordLayer.clearLayers();
    },

    selectRecord: function (record) {
        this.unselectRecord();
        cartodbSql.execute('SELECT * FROM {{ table }} where cartodb_id = {{ id }}', {
            id: record.id,
            table: config.tables[record.recordType]
        }, {
            format: 'GeoJSON' 
        }).done((data) => {
            // Only highlight if mouse is still over the feature
            if (this.props.recordSelected && _.isEqual(this.props.recordSelected, record)) {
                data.features[0].properties.type = record.recordType;
                this.selectedRecordLayer.addData(data);
            }
        });
    },

    unselectRecord: function () {
        this.selectedRecordLayer.clearLayers();
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
        if (nextProps.pinDropDragActive !== this.props.pinDropDragActive) {
            nextProps.pinDropDragActive ? this.enableDropPinDrag() : this.disableDropPinDrag();
        }
        if (nextProps.listRecordHovered && (!this.props.listRecordHovered || !_.isEqual(nextProps.listRecordHovered, this.props.listRecordHovered))) {
            this.highlightRecordPoint(nextProps.listRecordHovered);
        }
        else if (!nextProps.listRecordHovered) {
            this.unhighlightRecordPoint();
        }
        if (nextProps.recordSelected && (!this.props.recordSelected || !_.isEqual(nextProps.recordSelected, this.props.recordSelected))) {
            this.selectRecord(nextProps.recordSelected);
        }
        else if (!nextProps.recordSelected) {
            this.unselectRecord();
        }

        if (nextProps.addingRequest !== this.props.addingRequest) {
            if (nextProps.addingRequest) {
                // Hide everything but existing bins
                this.showOnlyExitingCans();
            }
            else {
                // Show everything
                this.showAllLayers();
            }
        }

        if (nextProps.filtersWidth !== this.props.filtersWidth || nextProps.panelWidth !== this.props.panelWidth) {
            this.updateActiveArea(nextProps);
        }

        if (nextProps.requestsRequireReload) {
            this.updateRequestSql();
            this.props.dispatch(requestsRequireReload(false));
        }
    },

    updateActiveArea: function (props) {
        map.setActiveArea({
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: props.filtersWidth + 'px',
            right: props.panelWidth + 'px'
        });
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

    updateRatingSql: function () {
        if (this.ratingLayer) {
            this.ratingLayer.setSQL(getRatingSql(this.props.ratingFilters, this.props.yearFilters, getRatingsColumnsMap(config), config, true));
        }
    },

    updateReportSql: function () {
        if (this.reportLayer) {
            this.reportLayer.setSQL(getReportSql(this.props.reportFilters, this.props.yearFilters, getReportColumnsMap(config), config));
        }
    },

    updateRequestSql: function () {
        if (this.requestLayer) {
            this.requestLayer.setSQL(getRequestSql(this.props.requestFilters, this.props.yearFilters, getRequestColumnsMap(config), config));
        }
    },

    getId: function () {
        return React.findDOMNode(this.refs.map).id;
    },

    showOnlyExitingCans: function () {
        if (this.canLayer && this.ratingLayer && this.reportLayer && this.requestLayer) {
            this.canLayer.show();
            this.ratingLayer.hide();
            this.reportLayer.hide();
            this.requestLayer.hide();
        }
    },

    showAllLayers: function () {
        if (this.canLayer && this.ratingLayer && this.reportLayer && this.requestLayer) {
            this.canLayer.show();
            this.ratingLayer.show();
            this.reportLayer.show();
            this.requestLayer.show();
        }
    },

    init: function (id) {
        map = L.map(id, {
            minZoom: 14,
            scrollWheelZoom: false,
            zoomControl: false
        });
        L.control.zoom({ position: 'bottomleft' }).addTo(map);
        L.control.scale({ position: 'bottomleft' }).addTo(map);

        this.updateActiveArea(this.props);

        map.on({
            moveend: () => {
                this.props.dispatch(mapMoved(map.getBounds().toBBoxString().split(','), map.getCenter));
            },
            zoomend: () => {
                this.selectedRecordLayer.eachLayer(layer => {
                    layer.setIcon(this.getSelectedRecordIcon(layer.feature.properties, map.getZoom()));
                });
                this.props.dispatch(mapMoved(map.getBounds().toBBoxString().split(','), map.getCenter));
            }
        });

        config.tileLayer.addTo(map);

        this.highlightedRecordLayer = L.geoJson(null, {
            onEachFeature: (feature, layer) => {
                layer.on('click', () => {
                    this.openFeature(feature.properties.cartodb_id, feature.properties.type);
                });
            },

            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, {
                    icon: this.getHighlightedRecordIcon(feature.properties, map.getZoom())
                });
            }
        }).addTo(map);

        this.selectedRecordLayer = L.geoJson(null, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, {
                    icon: this.getSelectedRecordIcon(feature.properties, map.getZoom())
                });
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
                this.ratingLayer = layer.getSubLayer(ratingLayerIndex);
                this.reportLayer = layer.getSubLayer(reportLayerIndex);
                this.canLayer = layer.getSubLayer(canLayerIndex);
                this.requestLayer = layer.getSubLayer(requestLayerIndex);

                if (this.props.addingRequest) {
                    this.showOnlyExitingCans();
                }
                else {
                    this.showAllLayers();
                }

                this.canLayer.setInteraction(true);
                this.canLayer.setInteractivity('longitude, latitude, cartodb_id, type');
                this.reportLayer.setInteraction(true);
                this.reportLayer.setInteractivity('longitude, latitude, cartodb_id, date, complaint_type, agency');
                this.requestLayer.setInteraction(true);
                this.requestLayer.setInteractivity('longitude, latitude, cartodb_id, can_type, date');

                this.updateRatingSql();
                this.updateReportSql();
                this.updateRequestSql();

                layer.hoverIntent({}, (e, latlng, pos, data, layerIndex) => {
                    var content;
                    switch(layerIndex) {
                        // Reports
                        case reportLayerIndex:
                            var iconClasses = `detail-popup-icon report-icon-${slugifyComplaintType(data.complaint_type)}`;
                            content = (
                                <div className="detail-popup report-popup">
                                    <div className={iconClasses}></div>
                                    <div className="detail-popup-text report-type">{data.complaint_type}</div>
                                    <div className="clearfix"></div>
                                </div>
                            );
                            break;
                        // Requests
                        case requestLayerIndex:
                            content = (
                                <div className="detail-popup request-popup">
                                    <div className="detail-popup-icon request-icon"></div>
                                    <div className="detail-popup-text request-type">{data.can_type} bin request</div>
                                    <div className="clearfix"></div>
                                </div>
                            );
                            break;
                        // Cans
                        case canLayerIndex:
                            content = (
                                <div className="detail-popup can-popup">
                                    <div className="detail-popup-icon can-icon"></div>
                                    <div className="detail-popup-text can-type">Existing Bin</div>
                                    <div className="clearfix"></div>
                                </div>
                            );
                            break;
                    }
                    if (!this.pin) {
                        map.closePopup();
                        map.openPopup(React.renderToString(content), [data.latitude, data.longitude], {
                            closeButton: false,
                            maxHeight: 50,
                            minWidth: 150,
                            offset: [0, -3]
                        });
                    }
                });

                layer.on('featureOver', (e, latlng, pos, data, layerIndex) => {
                    if (layerIndex === reportLayerIndex || layerIndex === canLayerIndex || layerIndex === requestLayerIndex) {
                        currentlyOver[layerIndex] = true;
                        var table;
                        if (layerIndex === reportLayerIndex) {
                            table = 'report';
                        }
                        if (layerIndex === requestLayerIndex) {
                            table = 'request';
                        }
                        if (layerIndex === canLayerIndex) {
                            table = 'can';
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
                        if (!this.pin) {
                            map.closePopup();
                        }
                        document.getElementById(id).style.cursor = null;
                        this.props.dispatch(listRecordUnhovered());
                    }
                });

                this.canLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.openFeature(data.cartodb_id, 'can');
                });
                this.reportLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.openFeature(data.cartodb_id, 'report');
                });
                this.requestLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.openFeature(data.cartodb_id, 'request');
                });
            });
    },

    openFeature: function (id, type) {
        switch (type) {
            case 'can':
                this.history.pushState(null, `/cans/${id}`);
                break;
            case 'report':
                this.history.pushState(null, `/reports/${id}`);
                break;
            case 'request':
                this.history.pushState(null, `/requests/${id}`);
                break;
        }
    },

    render: function() {
        return <div className="map" ref="map" id="map"></div>;
    }
}));

export var AddButton = React.createClass({
    mixins: [PopoverButton],

    componentDidMount: function() {
        window.addEventListener('resize', this.handleResize);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize);
    },

    handleResize: function () {
        window.removeEventListener('resize', this.handleResize);
        this.setState({ popoverShown: false });
    },

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
                        <div>Request a new bin</div>
                        <Button block onClick={this.dismissPopover}>Got it</Button>
                    </Popover>
                </Overlay>
            </div>
        );
    }
});

export var ListButton = React.createClass({
    render: function () {
        return (
            <Link to="/list" className="btn btn-list" ref="button"></Link>
        );
    }
});
