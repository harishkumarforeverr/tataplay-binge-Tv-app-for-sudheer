import React, {Component} from 'react'
import {TENURE_MSG} from "../../APIs/constant";
import "./style.scss";
import PropTypes from "prop-types";

export default class MyPlanButton extends Component {
    render() {
        const {message, onClick, icon} = this.props;

        return (
            <React.Fragment>
                <div
                    className={
                        TENURE_MSG === message
                            ? "button-wrapper color-background"
                            : "button-wrapper"
                    }
                    onClick={onClick}
                >
                    <div>
                        <img src={icon} alt=""/>
                        <p>{message}</p>
                    </div>
                    <div>
                        <img src="../../../../assets/images/Shape.png" alt=""/>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

MyPlanButton.propTypes = {
    onClick: PropTypes.func,
    icon: PropTypes.string,
    message: PropTypes.string,
};
