import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Input } from 'react-bootstrap';
import { Link } from 'react-router';
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
            <Input onChange={this.handleChange} type="file" label={this.props.label} value={this.state.value} />
        );
    }
});

var AddRequestForm = React.createClass({
    componentDidMount: function () {
        this.props.dispatch(pinDropActive(true));
    },

    getInitialState: function () {
        return {
            canSubType: 'small'
        };
    },

    submit: function (e) {
        this.props.onSubmit(this.state);
        e.preventDefault();
    },

    render: function () {
        // TODO with custom subtypes for each type
        return (
            <form onSubmit={this.submit}>
                <Input type="select" onChange={(e) => this.setState({ canSubType: e.target.value })} label="Can type" value={this.state.canSubType}>
                    <option value="small">small</option>
                    <option value="medium">medium</option>
                    <option value="large">large</option>
                </Input>
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
            email: null,
            image: null,
            name: null
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
                <Input type="textarea" onChange={this.commentChange} value={this.state.comment} label="Comment (optional)" />
                <ImageInput onChangeCallback={this.fieldChange} label="Photo (optional)" />
                <Input type="text" onChange={(e) => this.setState({ name: e.target.value })} label="Name" value={this.state.name} />
                <Input type="email" onChange={(e) => this.setState({ email: e.target.value })} label="Email Address" value={this.state.email} />
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
                <div>You're all done</div>
                <div>
                    Have another request?
                    <Button block>Make another request</Button>
                </div>
                <div>
                    About the project
                    <Button block>Go to the about page</Button>
                </div>
                <div>
                    Want to volunteer?
                    <Button block>Get involved</Button>
                </div>
                <div>
                    Why are we doing this?
                    <Button block>The problem</Button>
                </div>
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
            step: 1,
            success: false
        };
    },

    componentWillUnmount: function () {
        this.props.dispatch(pinDropActive(false));
    },

    validateRequest: function () {
        return (this.state.requestType && this.props.pinDropLatlng && this.state.name && this.state.email);
    },

    submitRequest: function () {
        if (this.validateRequest()) {
            var latlng = this.props.pinDropLatlng,
                geomWkt = `POINT (${latlng.lng} ${latlng.lat})`;
            var formData = new FormData();

            if (this.state.requestType) {
                formData.append('can_type', this.state.requestType);
            }
            if (this.state.canSubType) {
                formData.append('can_subtype', this.state.canSubType);
            }
            if (this.state.comment) {
                formData.append('comment', this.state.comment);
            }
            if (this.state.image) {
                formData.append('image', this.state.image, this.state.image.name);
            }
            formData.append('name', this.state.name);
            formData.append('email', this.state.email);
            formData.append('geom', geomWkt);

            this.setState({ submitting: true });
            qwest.post(config.apiBase + '/canrequests/', formData)
                .then(() => {
                    this.setState({
                        submitting: false,
                        step: null,
                        success: true 
                    });
                })
                .catch(() => console.warn('error'));
        }
    },

    backward: function (e) {
        e.preventDefault();
        if (this.state.step > 0) {
            this.setState({ step: this.state.step - 1 })
        }
    },

    forward: function (state) {
        if (this.state.step <= 3) {
            this.setState({ step: this.state.step + 1 })
        }
        this.setState(state, () => {
            this.submitRequest();
        });
    },

    render: function () {
        var bodyPanel,
            heading;

        if (this.state.success) {
            heading = 'Thanks!'
            bodyPanel = <Success />;
        }
        else {
            switch (this.state.step) {
                case 1:
                    bodyPanel = <RequestTypeForm onSelect={(type) => this.forward({ requestType: type })} />;
                    heading = 'Make a request';
                    break;
                case 2:
                    bodyPanel = <AddRequestForm onSubmit={this.forward} {...this.props} />;
                    heading = 'Place your bin';
                    break;
                case 3:
                    bodyPanel = <CommentPictureForm onSubmit={this.forward} submitting={this.state.submitting} />;
                    heading = 'Final step';
                    break;
                // TODO error panel
            }
        }

        var header = (
            <div className="panel-header add-request-panel-header">
                <h2>
                    {(this.state.step && this.state.step > 1) ? <a className="panel-header-back" href="#" onClick={this.backward}>back</a> : ''}
                    <span className="panel-header-label">{heading}</span>
                    <Link className="panel-header-cancel" to="/">cancel</Link>
                </h2>
                {this.state.step ? <div>step {this.state.step}</div> : ''}
            </div>
        );

        return (
            <Panel header={header}>
                {bodyPanel}
            </Panel>
        );
    }
}));

export default AddRequest;
