import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Input } from 'react-bootstrap';
import qwest from 'qwest';

import { pinDropActive } from '../actions';
import map from './CurbMap.jsx';
import { Panel } from './Panel.jsx';

import config from '../config/config';

var ImageInput = React.createClass({
    getInitialState: function () {
        return {
            value: null
        };
    },

    handleChange: function (e) {
        console.log(e.target.files[0]);
        this.setState({ value: e.target.value });
        this.props.onChangeCallback({ image: e.target.files[0] });
    },

    render: function () {
        return (
            <Input onChange={this.handleChange} type="file" value={this.state.value} />
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
            this.props.onChangeCallback({ latlng: nextProps.latlng });
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
                <Input type="select" onChange={this.handleChange} value={this.props.value}>
                    <option value="small">small</option>
                    <option value="medium">medium</option>
                    <option value="large">large</option>
                </Input>
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
            canType: 'small',
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
                <Button type="submit" disabled={!this.props.pinDropValid}>next</Button>
            </form>
        );
    }
});

var RequestTypeForm = React.createClass({
    render: function () {
        return (
            <div>
                <Button onClick={() => this.props.onSelect('garbage')} block>
                    request a trash bin
                </Button>
                <Button onClick={() => this.props.onSelect('recycling')} block>
                    request a recycling bin
                </Button>
                <Button onClick={() => this.props.onSelect('bigbelly')} block>
                    request a big belly bin
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

    commentChange: function (e) {
        this.setState({ comment: e.target.value });
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
                <Input type="textarea" onChange={this.commentChange} value={this.state.comment} />
                <ImageInput onChangeCallback={this.fieldChange} />
                <Button type="submit" disabled={this.props.submitting}>
                    {this.props.submitting ?  'submitting...' : 'submit'}
                </Button>
            </form>
        );
    }
});

var Success = React.createClass({
    render: function () {
        return (
            <div>
                Your request was successfully submitted!
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        pinDropLatlng: state.pinDropLatlng,
        pinDropValid: state.pinDropValid
    };
}

export var AddRequest = connect(mapStateToProps)(React.createClass({
    getInitialState: function () {
        return {
            requestType: null,
            submitting: false,
            success: false
        };
    },

    componentWillUnmount: function () {
        this.props.dispatch(pinDropActive(false));
    },

    validateRequest: function () {
        return (this.state.requestType && this.state.canType && this.state.latlng && this.state.comment && this.state.image);
    },

    submitRequest: function () {
        if (this.validateRequest()) {
            var latlng = this.state.latlng,
                geomWkt = `POINT (${latlng.lng} ${latlng.lat})`;
            var formData = new FormData();

            formData.append('can_type', this.state.requestType);
            formData.append('comment', this.state.comment);
            formData.append('image', this.state.image, this.state.image.name);
            formData.append('geom', geomWkt);

            this.setState({ submitting: true });
            qwest.post(config.apiBase + '/canrequests/', formData)
                .then(() => {
                    console.log('success');
                    this.setState({
                        submitting: false,
                        success: true 
                    });
                })
                .catch(() => console.warn('error'));
        }
    },

    updateState: function (state) {
        this.setState(state, () => {
            this.submitRequest();
        });
    },

    render: function () {
        var bodyPanel = <RequestTypeForm onSelect={(type) => this.setState({ requestType: type })} />;
        var step = 1;
        if (this.state.success) {
            bodyPanel = <Success />;
            step = null;
        }
        else if (this.state.requestType) {
            step = 2;
            bodyPanel = <AddRequestForm onSubmit={this.updateState} {...this.props} />;
            if (this.state.canType) {
                step = 3;
                bodyPanel = <CommentPictureForm onSubmit={this.updateState} submitting={this.state.submitting} />;
            }
        }

        return (
            <Panel>
                {(() => {
                    if (step) {
                        return <div>step {step}</div>;
                    }
                })()}
                {bodyPanel}
            </Panel>
        );
    }
}));

export default AddRequest;
