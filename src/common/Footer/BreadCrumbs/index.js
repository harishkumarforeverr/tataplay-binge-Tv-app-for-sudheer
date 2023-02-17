import {Link} from "react-router-dom";
import React from "react";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";

export const BreadCrumbs = (props) => {

    return (
        <div className="bread-crumb">
            {
                props.link &&
                <>
                    <div className={`first ${props.className}`}>
                        <i className="icon-Path"/>
                    </div>
                    {props.path !== "id" ?
                        props.breadCrumbClick ?
                            <div className="fetch" onClick={() => props.breadCrumbClick(true)}>
                                <div className={`second ${props.className}`}>{props.link}</div>
                            </div> :
                            <Link to={props.path} className="fetch">
                                <div className={`second ${props.className}`}>{props.link}</div>
                            </Link> :
                        <div className={`second  ${props.className}`}>{props.link}</div>}
                </>
            }
        </div>
    )
};

BreadCrumbs.propTypes = {
    history: PropTypes.object,
    path: PropTypes.string,
    link: PropTypes.string,
    className: PropTypes.string,
    breadCrumbClick: PropTypes.func,
};