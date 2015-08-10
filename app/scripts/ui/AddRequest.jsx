import _ from 'underscore';
import React from 'react';
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

var AddRequestForm = React.createClass({
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
                <ImageInput onChangeCallback={this.fieldChange} value={this.state.fields.image} />
                <div>{this.state.fields.image}</div>
                <input type="submit">upload</input>
            </form>
        );
    }
});

export var AddRequest = React.createClass({
    render: function () {
        return (
            <Panel>
                <AddRequestForm/>
            </Panel>
        );
    }
});

export default AddRequest;