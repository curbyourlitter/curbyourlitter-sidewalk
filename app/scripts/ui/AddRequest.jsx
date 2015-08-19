import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

import { pinDropActive } from '../actions';
import map from './CurbMap.jsx';
import { Panel } from './Panel.jsx';

var ImageInput = React.createClass({
    handleChange: function (e) {
        this.props.onChangeCallback({ image: e.target.value });
    },

    render: function () {
        return (
            <input onChange={this.handleChange} type="file" value={this.props.value} />
        );
    }
});

var LocationInput = React.createClass({
    getInitialState: function () {
        return {
            address: ''
        };
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

    componentWillUpdate: function(nextProps) {
        if (!this.props.latlng || this.props.latlng.lat !== nextProps.latlng.lat ||
            this.props.latlng.lng !== nextProps.latlng.lng) {
            this.props.onChangeCallback({ latlng: this.props.latlng });
            var geocoder = new google.maps.Geocoder;
            var component = this;
            geocoder.geocode({'location': nextProps.latlng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    component.setState({ address: component.getAddress(results[0]) });
                }
            });
        }
    },

    render: function () {
        return (
            <div>
                <div>Move the pin on the map to your desired location</div>
                <div>current address: {this.state.address}</div>
            </div>
        );
    }
});

var CanTypeInput = React.createClass({
    handleChange: function (e) {
        this.props.onChangeCallback({ canType: e.target.value });
    },

    render: function () {
        return (
            <div>
                <span>can type:</span>
                <select onChange={this.handleChange} value={this.props.value}>
                    <option>small</option>
                    <option>medium</option>
                    <option>large</option>
                </select>
            </div>
        );
    }
});

var AddRequestForm = React.createClass({
    componentDidMount: function () {
        this.props.dispatch(pinDropActive(true));
    },

    getInitialState: function () {
        return {
            canType: null,
            latlng: null
        };
    },

    fieldChange: function (updates) {
        this.setState(updates);
    },

    submit: function (e) {
        this.props.onSubmit(this.state);
        e.preventDefault();
    },

    render: function () {
        return (
            <form onSubmit={this.submit}>
                <CanTypeInput onChangeCallback={this.fieldChange} value={this.state.canType} />
                <LocationInput onChangeCallback={this.fieldChange} latlng={this.props.pinDropLatlng} />
                <Button type="submit">next</Button>
            </form>
        );
    }
});

function mapStateToProps(state) {
    return {
        pinDropLatlng: state.pinDropLatlng
    };
}

var RequestTypeForm = React.createClass({
    render: function () {
        return (
            <div>
                <Button onClick={() => this.props.onSelect('trash')}>
                    request a trash bin
                </Button>
                <Button onClick={() => this.props.onSelect('recycling')}>
                    request a recycling bin
                </Button>
            </div>
        );
    }
});

var CommentPictureForm = React.createClass({
    getInitialState: function () {
        return {
            comment: null,
            image: null
        };
    },

    fieldChange: function (updates) {
        this.setState(updates);
    },

    submit: function (e) {
        e.preventDefault();
        this.props.onSubmit(this.state);
    },

    render: function () {
        return (
            <form onSubmit={this.submit}>
                <textarea onChangeCallback={this.fieldChange} value={this.state.comment} />
                <ImageInput onChangeCallback={this.fieldChange} value={this.state.image} />
                <Button type="submit">submit</Button>
            </form>
        );
    }
});

export var AddRequest = connect(mapStateToProps)(React.createClass({
    getInitialState: function () {
        return {
            requestType: null
        };
    },

    componentWillUnmount: function () {
        this.props.dispatch(pinDropActive(false));
    },

    updateState: function (state) {
        this.setState(state);
    },

    render: function () {
        var formPanel = <RequestTypeForm onSelect={(type) => this.setState({ requestType: type })} />;
        var step = 1;
        if (this.state.requestType) {
            step = 2;
            formPanel = <AddRequestForm onSubmit={this.updateState} {...this.props} />;
            if (this.state.canType) {
                step = 3;
                formPanel = <CommentPictureForm onSubmit={this.updateState} />;
            }
        }

        return (
            <Panel>
                <div>step {step}</div>
                {formPanel}
            </Panel>
        );
    }
}));

export default AddRequest;
