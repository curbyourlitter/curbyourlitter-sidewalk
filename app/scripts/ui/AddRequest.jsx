import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Grid, Input, Row } from 'react-bootstrap';
import {} from 'react-bootstrap';
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

    clickInput: function () {
        var input = React.findDOMNode(this.refs.input);
        var event = new MouseEvent('click', {
            'view': window, 
            'bubbles': true, 
            'cancelable': false
        });
        input.dispatchEvent(event);
    },

    render: function () {
        return (
            <div className="image-input">
                <label htmlFor="image-file-input">
                    <Input id="image-file-input" ref="input" onChange={this.handleChange} accept="image/*" type="file" label={this.props.label} value={this.state.value} />
                    <Button onClick={this.clickInput} bsSize="large" block>Choose a Photo</Button>
                </label>
            </div>
        );
    }
});

var RequestTypeForm = React.createClass({
    render: function () {
        return (
            <div>
                <div className="add-request-prompt">What type of request would you like to make?</div>
                <Button bsSize="large" onClick={() => this.props.onSelect('litter')} block>
                    Litter Bin Request
                </Button>
                <Button bsSize="large" onClick={() => this.props.onSelect('recycling')} block>
                    Recycling Bin Request
                </Button>
            </div>
        );
    }
});

var BinTypeRadio = React.createClass({
    handleClick: function (e) {
        e.preventDefault();
        this.props.onSelect(this.props.label);
    },

    render: function () {
        var classes = "bin-type-list-item",
            selected = this.props.label === this.props.selected;
        if (selected) {
            classes += ' active';
        }
        return (
            <li className={classes} onClick={this.handleClick}>
                <Grid>
                    <Row>
                        <Col xs={2}>
                            <input ref="input" type="radio" name="bin-type" onChange={(e) => {}} checked={selected}></input>
                            <span className="bin-type-list-item-input">
                                <span className="bin-type-list-item-input-inner"></span>
                            </span>
                        </Col>
                        <Col xs={4} className="bin-type-list-item-image-column">
                            <img src={this.props.image} />
                        </Col>
                        <Col xs={6}>
                            <div className="bin-type-list-item-subtype">{this.props.display}</div>
                            <p className="bin-type-list-item-text">{this.props.description}</p>
                        </Col>
                    </Row>
                </Grid>
            </li>
        );
    }
});

var BinType = React.createClass({
    getInitialState: function () {
        return {
            subType: 'small',
            valid: false
        };
    },

    onRadioSelected: function (selectedSubType) {
        this.setState({
            subType: selectedSubType,
            valid: selectedSubType !== null
        });
    },

    submit: function (e) {
        if (!this.state.valid) return false;
        this.props.onSubmit(this.state);
        e.preventDefault();
    },

    render: function () {
        var subTypes = [];
        if (config.bintypes) {
            subTypes = config.bintypes[this.props.canType].subtypes;
        }
        return (
            <form onSubmit={this.submit}>
                <div className="add-request-prompt">Select the type of litter bin. When finished hit ‘Next’.</div>
                <ul className="bin-type-list">
                    {subTypes.map(subType => {
                        return (
                            <BinTypeRadio key={subType.label} onSelect={this.onRadioSelected} selected={this.state.subType} {...subType} />
                        );
                    })}
                </ul>
                <Button className="next-button" block bsSize="large" type="submit" disabled={!this.state.valid}>Next</Button>
            </form>
        );
    }
});

var PlaceBin = React.createClass({
    componentDidMount: function () {
        this.props.dispatch(pinDropActive(true));
    },

    componentWillUnmount: function () {
        this.props.dispatch(pinDropActive(false));
    },

    getInitialState: function () {
        return {};
    },

    submit: function (e) {
        this.props.onSubmit(this.state);
        e.preventDefault();
    },

    render: function () {
        return (
            <form onSubmit={this.submit}>
                <div className="add-request-prompt">
                    <p>Drag and drop your bin to the corner you would like to see it installed. When finished click &lsquo;next&rsquo;.</p>
                    <p>Keep in mind!</p>
                </div>
                <Grid className="add-request-bin-tips">
                    <Row>
                        <Col xs={6}>Bins are placed on street corners because it makes them easier to service.</Col>
                        <Col xs={6}>Gray bins on the map represent existing litter bins. You can request a bin on a corner that already has one if you think it needs a different type of bin!</Col>
                    </Row>
                </Grid>
                <Button className="next-button" block bsSize="large" type="submit" disabled={!this.props.pinDropValid}>Next</Button>
            </form>
        );
    }
});

var InformationForm = React.createClass({
    getInitialState: function () {
        return {
            comment: null,
            email: null,
            image: null,
            name: null,
            valid: false
        };
    },

    fieldChange: function (updates) {
        this.setState(updates, (state) => {
            this.setState({
                valid: this.state.email !== null && this.state.name !== null
            });
        });
    },

    submit: function (e) {
        if (!this.state.valid) return false;
        e.preventDefault();
        this.props.onSubmit(this.state);
    },

    render: function () {
        return (
            <form onSubmit={this.submit}>
                <label>Your Information</label>
                <Input type="text" onChange={(e) => this.fieldChange({ name: e.target.value })} placeholder="Name" value={this.state.name} />
                <Input type="email" onChange={(e) => this.fieldChange({ email: e.target.value })} placeholder="Email" value={this.state.email} />
                <Input type="textarea" onChange={(e) => this.fieldChange({ comment: e.target.value })} value={this.state.comment} label="Tell us why it should be here (optional)" placeholder="Write something..." />
                <ImageInput onChangeCallback={this.fieldChange} label="Give us some visual proof (optional)" />
                <Button type="submit" disabled={!this.state.valid || this.props.submitting} bsSize="large" block>
                    {this.props.submitting ?  'Submitting...' : 'Submit'}
                </Button>
            </form>
        );
    }
});

var Success = React.createClass({
    render: function () {
        return (
            <div className="add-request-success">
                <h2>Thanks for your help in placing a bin!</h2>
                <Button bsSize="large" block>Make another Request</Button>
                <Button bsSize="large" block>Get Involved</Button>
                <Button bsSize="large" block>What's the Problem?</Button>
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

var Steps = React.createClass({
    render: function () {
        var arrows = [];
        for (var i = 0; i < this.props.count; i++) {
            var classes = 'step-arrow';
            if (i < this.props.current) {
                classes += ' active';
            }
            arrows.push(<div key={i} className={classes}></div>);
        }
        return (
            <div className="add-request-steps">
                {arrows.reverse()}
                <div className="clearfix"></div>
            </div>
        );
    }
});

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
            if (this.state.subType) {
                formData.append('can_subtype', this.state.subType);
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
            state.step = this.state.step + 1;
            this.setState(state);
        }
        else {
            this.setState(state, () => {
                this.submitRequest();
            });
        }
    },

    render: function () {
        var bodyPanel,
            heading,
            cancelLabel = 'cancel';

        if (this.state.success) {
            cancelLabel = 'done';
            heading = 'Success!';
            bodyPanel = <Success />;
        }
        else {
            switch (this.state.step) {
                case 1:
                    bodyPanel = <RequestTypeForm onSelect={(type) => this.forward({ requestType: type })} />;
                    heading = 'Make a request';
                    break;
                case 2:
                    bodyPanel = <BinType canType={this.state.requestType} onSubmit={this.forward} {...this.props} />;
                    heading = 'Type of bin';
                    break;
                case 3:
                    bodyPanel = <PlaceBin onSubmit={this.forward} {...this.props} />;
                    heading = 'Place your bin';
                    break;
                case 4:
                    bodyPanel = <InformationForm onSubmit={this.forward} submitting={this.state.submitting} />;
                    heading = 'Final step';
                    break;
                // TODO error panel
            }
        }

        var headerClasses = `panel-header add-request-panel-header`;
        if (this.state.step) {
            headerClasses += ` add-request-panel-header-step-${this.state.step}`;
        }
        if (this.state.success) {
            headerClasses += ' add-request-panel-header-success';
        }
        var header = (
            <div className={headerClasses}>
                <h2>
                    <a className="panel-header-back" href="#" onClick={this.backward}>&lt; back</a>
                    <span className="panel-header-label">{heading}</span>
                    <Link className="panel-header-cancel" to="/">{cancelLabel}</Link>
                </h2>
                <Steps count={4} current={this.state.step}/>
            </div>
        );

        return (
            <Panel className="add-request-panel" header={header}>
                {bodyPanel}
            </Panel>
        );
    }
}));

export default AddRequest;
