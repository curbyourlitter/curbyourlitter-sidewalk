import _ from 'underscore';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
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
    mapRecordHovered,
    mapRecordUnhovered,
    pinDropMoved,
    requestsRequireReload
} from '../actions';
import CanPopup from './Can.jsx';
import PopoverButton from './PopoverButton.jsx';
import { slugifyComplaintType } from './Report.jsx';

var map;

var ratingLayerIndex = 0,
    reportLayerIndex = 1,
    canLayerIndex = 2,
    requestLayerIndex = 3,
    installedCanLayerIndex = 4;

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
        binFilters: _.extend({}, state.binFilters),
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

export var CurbMap = connect(mapStateToProps, null, null, { pure: false })(React.createClass({
    mixins: [History],

    highlightedRecordPopup: null,
    selectedRecordPopup: null,

    addDropPinPopup: function () {
        geocoder.geocode({'location': this.pin.getLatLng()}, (results, status) => {
            if (status !== google.maps.GeocoderStatus.OK) return;
            this.pin.bindPopup(this.getAddress(results[0]), {
                closeButton: false,
                offset: [0, -20]
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
        if (this.pin) this.pin.dragging.enable();
    },

    disableDropPinDrag: function () {
        if (this.pin) this.pin.dragging.disable();
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
            if (!valid) {
                this.pin.bindPopup('Place me!', {
                    closeButton: false,
                    offset: [0, -20]
                }).openPopup();
            }
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
            iconAnchor = [7.5, 5];
            iconSize = [14.5, 17];
            iconUrl = '/images/map-bin-hover.svg';
        }
        if (data.type === 'installedcan') {
            iconAnchor = [8, 7];
            iconSize = [17, 17],
            iconUrl = '/images/map-bin-request-hover.svg';
        }
        if (data.type === 'report') {
            iconAnchor = [6, 6];
            iconSize = [12, 12];
            iconUrl = '/images/map-report.svg';
        }
        if (data.type === 'request' && data.can_type) {
            iconAnchor = [8, 7];
            iconSize = [17, 17],
            iconUrl = '/images/map-bin-request-hover.svg';
        }
        if (data.type === 'request' && !data.can_type) {
            iconAnchor = [6, 6];
            iconSize = [12, 12];
            iconUrl = '/images/map-litter-sighting.svg';
        }

        if (zoom >= 17) {
            var width = Math.floor(iconSize[0] * 1.4),
                height = Math.floor(iconSize[1] * 1.4);
            iconSize = [width, height];
            iconAnchor = [width / 2, height / 2 - 2];
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
            iconAnchor = [7.5, 5];
            iconSize = [14.5, 17];
            iconUrl = '/images/map-bin-selected.svg';
        }
        if (data.type === 'installedcan') {
            iconAnchor = [8, 7];
            iconSize = [17, 17],
            iconUrl = '/images/map-bin-request-selected.svg';
        }
        if (data.type === 'report') {
            iconAnchor = [6, 6];
            iconSize = [12, 12];
            iconUrl = '/images/map-report.svg';
        }
        if (data.type === 'request' && data.can_type) {
            iconAnchor = [8, 7];
            iconSize = [17, 17],
            iconUrl = '/images/map-bin-request-selected.svg';
        }
        if (data.type === 'request' && !data.can_type) {
            iconAnchor = [6, 6];
            iconSize = [12, 12];
            iconUrl = '/images/map-litter-sighting.svg';
        }

        if (zoom >= 17) {
            var width = Math.floor(iconSize[0] * 1.4),
                height = Math.floor(iconSize[1] * 1.4);
            iconSize = [width, height];
            iconAnchor = [width / 2, height / 2 - 2];
        }

        return L.icon({
            iconAnchor: iconAnchor,
            iconSize: iconSize,
            iconUrl: iconUrl
        });
    },

    getPopupContent: function (data, recordType) {
        switch(recordType) {
            // Reports
            case 'report':
                var iconClasses = `detail-popup-icon report-icon-${slugifyComplaintType(data.complaint_type)}`;
                return (
                    <div className="detail-popup report-popup">
                        <div className={iconClasses}></div>
                        <div className="detail-popup-text report-type">{data.complaint_type}</div>
                        <div className="clearfix"></div>
                    </div>
                );
            // Requests
            case 'request':
                var iconClasses = 'detail-popup-icon request-icon';
                if (!data.can_type) {
                    iconClasses += ' request-icon-litter-sighting';
                }
                return (
                    <div className="detail-popup request-popup">
                        <div className={iconClasses}></div>
                        <div className="detail-popup-text request-type">
                            {data.can_type ? `${data.can_type} bin request` : 'litter sighting'}
                        </div>
                        <div className="clearfix"></div>
                    </div>
                );
            // Cans
            case 'can':
                return (
                    <div className="detail-popup can-popup">
                        <div className="detail-popup-icon can-icon"></div>
                        <div className="detail-popup-text can-type">Existing Bin</div>
                        <div className="clearfix"></div>
                    </div>
                );
            case 'installedcan':
                return (
                    <div className="detail-popup installedcan-popup">
                        <div className="detail-popup-icon can-icon"></div>
                        <div className="detail-popup-text can-type">New Bin</div>
                        <div className="clearfix"></div>
                    </div>
                );
        }
    },

    openRecordPopup: function (data, recordType) {
        var popup = L.popup({
            closeButton: false,
            maxHeight: 50,
            minWidth: 150,
            offset: [0, -3]
        })
            .setLatLng([data.latitude, data.longitude])
            .setContent(ReactDOMServer.renderToString(this.getPopupContent(data, recordType)));
        map.addLayer(popup);
        return popup;
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
        cartodbSql.execute('SELECT *, ST_X(the_geom) AS longitude, ST_Y(the_geom) AS latitude FROM {{ table }} where cartodb_id = {{ id }}', {
            id: record.id,
            table: config.tables[record.recordType]
        }, {
            format: 'GeoJSON' 
        }).done((data) => {
            this.unhighlightRecordPoint();
            if (this.highlightedRecordPopup) map.removeLayer(this.highlightedRecordPopup);
            if (this.selectedRecordPopup) map.removeLayer(this.selectedRecordPopup);
            // Only select if feature still selected
            if (this.props.recordSelected && _.isEqual(this.props.recordSelected, record)) {
                data.features[0].properties.type = record.recordType;
                this.selectedRecordLayer.addData(data);
                this.selectedRecordPopup = this.openRecordPopup(data.features[0].properties, record.recordType);
            }
        });
    },

    unselectRecord: function () {
        this.selectedRecordLayer.clearLayers();
        if (this.selectedRecordPopup) map.removeLayer(this.selectedRecordPopup);
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
            map.setView(this.props.mapCenter, Math.max(map.getZoom(), 17));
        }
        if (this.props.binFilters && !_.isEqual(this.props.binFilters, prevProps.binFilters)) {
            if (this.props.binFilters.existing) {
                this.canLayer.show();
            }
            else {
                this.canLayer.hide();
            }

            if (this.props.binFilters.new) {
                this.installedCanLayer.show();
            }
            else {
                this.installedCanLayer.hide();
            }
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
        return ReactDOM.findDOMNode(this.refs.map).id;
    },

    showOnlyExitingCans: function () {
        if (this.canLayer && this.ratingLayer && this.reportLayer && this.installedCanLayer) {
            this.canLayer.show();
            this.ratingLayer.hide();
            this.reportLayer.hide();
            this.installedCanLayer.hide();
        }
    },

    showAllLayers: function () {
        if (this.canLayer && this.ratingLayer && this.reportLayer && this.requestLayer && this.installedCanLayer) {
            this.canLayer.show();
            this.ratingLayer.show();
            this.reportLayer.show();
            this.requestLayer.show();
            this.installedCanLayer.show();
        }
    },

    init: function (id) {
        map = L.map(id, {
            maxZoom: 22,
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
                this.installedCanLayer = layer.getSubLayer(installedCanLayerIndex);

                if (this.props.addingRequest) {
                    this.showOnlyExitingCans();
                }
                else {
                    this.showAllLayers();
                }

                this.canLayer.setInteraction(true);
                this.canLayer.setInteractivity('longitude, latitude, cartodb_id, type');
                this.installedCanLayer.setInteraction(true);
                this.installedCanLayer.setInteractivity('longitude, latitude, cartodb_id');
                this.reportLayer.setInteraction(true);
                this.reportLayer.setInteractivity('longitude, latitude, cartodb_id, date, complaint_type, agency');
                this.requestLayer.setInteraction(true);
                this.requestLayer.setInteractivity('longitude, latitude, cartodb_id, can_type, date');

                this.updateRatingSql();
                this.updateReportSql();
                this.updateRequestSql();

                layer.hoverIntent({}, (e, latlng, pos, data, layerIndex) => {
                    if (!this.pin) {
                        if (this.highlightedRecordPopup) map.removeLayer(this.highlightedRecordPopup);
                        var recordType;
                        switch (layerIndex) {
                            case canLayerIndex:
                                recordType = 'can';
                                break;
                            case installedCanLayerIndex:
                                recordType = 'installedcan';
                                break;
                            case reportLayerIndex:
                                recordType = 'report';
                                break;
                            case installedCanLayerIndex:
                                recordType = 'request';
                                break;
                        }
                        this.highlightedRecordPopup = this.openRecordPopup(data, recordType);
                    }
                });

                layer.on('featureOver', (e, latlng, pos, data, layerIndex) => {
                    if (layerIndex === reportLayerIndex || layerIndex === canLayerIndex || layerIndex === requestLayerIndex || layerIndex === installedCanLayerIndex) {
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
                        if (layerIndex === installedCanLayerIndex) {
                            table = 'installedcan';
                        }
                        this.props.dispatch(listRecordHovered(data.cartodb_id, table));
                        this.props.dispatch(mapRecordHovered(data.cartodb_id, table));
                    }
                    if (_.values(currentlyOver).filter((l) => l).length > 0) {
                        document.getElementById(id).style.cursor = 'pointer';
                    }
                });
                layer.on('featureOut', (e, layerIndex) => {
                    if (!layerIndex) return;
                    currentlyOver[layerIndex] = undefined;
                    if (_.values(currentlyOver).filter((l) => l).length === 0) {
                        if (!this.pin && this.highlightedRecordPopup) {
                            map.removeLayer(this.highlightedRecordPopup);
                        }
                        document.getElementById(id).style.cursor = null;
                        this.props.dispatch(listRecordUnhovered());
                        this.props.dispatch(mapRecordUnhovered());
                    }
                });

                this.canLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.openFeature(data.cartodb_id, 'can');
                });
                this.installedCanLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.openFeature(data.cartodb_id, 'installedcan');
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
            case 'installedcan':
                this.history.pushState(null, `/installedcans/${id}`);
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
                <Overlay show={this.state.popoverShown} target={()=> ReactDOM.findDOMNode(this.refs.button)} placement="top" containerPadding={20}>
                    <Popover id="add-popover" bsSize="small">
                        <div className="add-popover-icon"></div>
                        <div className="add-popover-text">Request a New Bin</div>
                        <div className="clearfix"></div>
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
