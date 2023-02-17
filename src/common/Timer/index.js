import React, {Component} from 'react';
import './style.scss';
import get from "lodash/get";
import {connect} from "react-redux";
import PropTypes from "prop-types";

class Timer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            timeLeft: 0,
            timeLeftConstant: 30,
        }
        this.timerId = "";
    }

    componentDidMount() {
        let {configResponse} = this.props;
        let timeLeft = get(configResponse, 'data.config.otpDuration');
        let result = timeLeft ? timeLeft : this.state.timeLeftConstant;
        setTimeout(() => this.setState({
            timeLeft: result,
        }), 500);
        this.timerId = setInterval(() => {
            this.countdown()
        }, 1000);
    }

    timeElapsed = () => {
        let {timerExpires} = this.props;
        timerExpires();
    }

    countdown = () => {
        if (this.state.timeLeft === -1) {
            clearTimeout(this.timerId);
            this.timeElapsed();
        } else {
            let timeRemaining = this.state.timeLeft - 1;
            this.setState({
                timeLeft: timeRemaining,
            })
        }
    }

    render() {
        return (
            <span className="timer" id={'timer'}><span id='time'>{this.state.timeLeft}</span>
                {this.state.timeLeft !== -1 ? `Code will expire in ${this.state.timeLeft} seconds` : ""}</span>
        )
    }
}


function mapStateToProps(state) {
    return {
        configResponse: get(state.headerDetails, 'configResponse'),
    }
}

Timer.propTypes = {
    configResponse: PropTypes.object,
    timerExpires: PropTypes.func,
}

export default (connect(mapStateToProps, null)(Timer))
