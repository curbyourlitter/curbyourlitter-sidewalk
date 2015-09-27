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

    render: function () {
        return (
            <Input onChange={this.handleChange} type="file" label={this.props.label} value={this.state.value} />
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
            bintypes: null,
            subType: 'small'
        };
    },

    componentDidMount: function () {
        qwest.get('/scripts/json/bintypes.json')
            .then((xhr, response) => {
                this.setState({ bintypes: response });
            })
            .catch((xhr, response, e) => {
                console.log(e);
            });
    },

    onRadioSelected: function (selectedSubType) {
        this.setState({ subType: selectedSubType });
    },

    submit: function (e) {
        this.props.onSubmit(this.state);
        e.preventDefault();
    },

    render: function () {
        var subTypes = [];
        if (this.state.bintypes) {
            subTypes = this.state.bintypes[this.props.canType].subtypes;
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
                <Button block bsSize="large" type="submit">Next</Button>
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

    submit: function (e) {
        this.props.onSubmit(this.state);
        e.preventDefault();
    },

    render: function () {
        return (
            <form onSubmit={this.submit}>
                <div className="add-request-prompt">Drag and Drop your receptacle to the corner you would like to see it installed. When finished hit ‘Next’.</div>
                <Button block bsSize="large" type="submit" disabled={!this.props.pinDropValid}>Next</Button>
            </form>
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
                    bodyPanel = <BinType canType={this.state.requestType} onSubmit={this.forward} {...this.props} />;
                    heading = 'Type of bin';
                    break;
                case 3:
                    bodyPanel = <PlaceBin onSubmit={this.forward} {...this.props} />;
                    heading = 'Place your bin';
                    break;
                case 4:
                    bodyPanel = <CommentPictureForm onSubmit={this.forward} submitting={this.state.submitting} />;
                    heading = 'Final step';
                    break;
                // TODO error panel
            }
        }

        var headerClasses = `panel-header add-request-panel-header add-request-panel-header-step-${this.state.step}`;
        var header = (
            <div className={headerClasses}>
                <h2>
                    <a className="panel-header-back" href="#" onClick={this.backward}>back</a>
                    <span className="panel-header-label">{heading}</span>
                    <Link className="panel-header-cancel" to="/">cancel</Link>
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
