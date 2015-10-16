import React from 'react';

export var hoverIntent = function (Component, duration = 500) {
    return React.createClass({
        startTimer: function () {
            if (!this.timer && !this.timerFired) {
                this.timer = setTimeout(() => {
                    this.timer = null;
                    this.timerFired = true;
                    if (this.isMounted() && this.refs.child) {
                        this.refs.child.onHoverIntent();
                    }
                }, duration);
            }
        },

        stopTimer: function () {
            this.timerFired = false;
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
        },

        render: function () {
            return (
                <Component onMouseEnter={this.startTimer} onMouseLeave={this.stopTimer} ref="child" {...this.props} {...this.state} />
            );
        }
    });
};
