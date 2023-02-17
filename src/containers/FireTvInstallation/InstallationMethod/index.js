import React, {Component} from "react";
import "../style.scss";
import {bindActionCreators} from "redux";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import RadioButton from "@common/RadioButton";
import Button from "@common/Buttons";
import {Link} from "react-router-dom";
import {URL} from "@routeConstants";
import PropTypes from "prop-types";
import {showNoInternetPopup} from "@utils/common";
import {NO_OP} from "@constants";
import {campaign} from "../APIs/action";
import isEmpty from "lodash/isEmpty";

class InstallationMethod extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addressPage: false,
            selectedRadio: 'fs-diy',
        };
    }

    componentDidMount = async () => {
        const {campaign} = this.props
        await campaign();
        setTimeout(() =>this.setState({...this.state, data: this.props.campaignData}), 0);
    }

    proceedHandler = () => {
        const stepNo = 2;
        this.props.updateInfo(stepNo, this.state.selectedRadio);
    };

    doItYours = () => {
        return (
            <div className="radio-block">
                <div className="radio-text">Do It Yourself</div>
                <RadioButton
                    name="fs-radio"
                    value="fs-diy"
                    checked={this.state.selectedRadio === "fs-diy"}
                    showLabel={false}
                    chandler={(e) => this.setState({selectedRadio: e.target.value})}
                />
                <div className="radio-desc">
                    Installation guide for self-installation would be provided .
                    Recommended for contactless installation.
                </div>
            </div>
        );
    };
    installerRequired = () => {
        return (
            <div className="second">
                <div className="radio-text">Installer Required</div>
                <RadioButton
                    name="fs-radio"
                    value="fs-installer"
                    showLabel={false}
                    chandler={(e) => this.setState({selectedRadio: e.target.value})}
                />
                <div className="radio-desc">
                    Our agent with visit your address and do the installation for you.
                    Recommended for people not comfortable with self installation.
                </div>
            </div>
        );
    };
    displayInstallerRequiredAndDoItYours = () => {
        return (
            <>
                {this.doItYours()}
                {this.installerRequired()}
            </>
        )
    }
    displayData = () => {
        if (this.state.data?.diyInstallation) {
            return this.doItYours();
        } else if (this.state.data?.installationRequired) {
            return this.installerRequired();
        } else {
            return this.displayInstallerRequiredAndDoItYours();
        }
    };

    render() {
        return (
            <div>
                <h1>Installation Method</h1>
                <div className="instructions">
                    You can either do it yourself or we send our installer to your address
                </div>
                {this.displayData()}

                <div className="btn-block">
                    <Button
                        // disabled={isEmpty(this.state?.data)}
                        bType="submit"
                        cName="btn primary-btn btn-block button-margin"
                        clickHandler={() => this.proceedHandler()}
                        bValue={"Proceed"}
                    />
                    <Link
                        to={navigator.onLine && URL.DEFAULT}
                        onClick={!navigator.onLine ? showNoInternetPopup : NO_OP}
                    >
                        <div className="btn-link">Not now</div>
                    </Link>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        campaignData: state?.fireTvInstallation?.campaign?.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators({
            campaign,
        }, dispatch),
    }
};

InstallationMethod.propTypes = {
    updateInfo: PropTypes.func,
    campaign: PropTypes.func,
    campaignData: PropTypes.object,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(InstallationMethod))
