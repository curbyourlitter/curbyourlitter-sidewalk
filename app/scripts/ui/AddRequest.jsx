import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';

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
    render: function () {
        return (
            <div>
                <div>Move the pin on the map</div>
                <div>current location: {this.props.latlng}</div>
            </div>
        );
    }
});

var AddRequestForm = React.createClass({
    componentDidMount: function () {
        this.props.dispatch(pinDropActive(true));
    },

    componentWillUnmount: function () {
        this.props.dispatch(pinDropActive(false));
    },

    getInitialState: function () {
        return {
            fields: {}
        };
    },

    fieldChange: function (updates) {
        this.setState({ fields: _.extend(this.state.fields, updates) });
    },

    submit: function (e) {
        console.log(this.state);
        e.preventDefault();
    },

    render: function () {
        return (
            <form onSubmit={this.submit}>
                <LocationInput latlng={this.props.pinDropLatlng} />
                <ImageInput onChangeCallback={this.fieldChange} value={this.state.fields.image} />
                <div>{this.state.fields.image}</div>
                <input type="submit">upload</input>
            </form>
        );
    }
});

function mapStateToProps(state) {
    return {
        pinDropLatlng: state.pinDropLatlng
    };
}

export var AddRequest = connect(mapStateToProps)(React.createClass({
    render: function () {
        return (
            <Panel>
                <AddRequestForm {...this.props} />
            </Panel>
        );
    }
}));

export default AddRequest;
