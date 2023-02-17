import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const Heading = (props) => {
    const {heading,headingClassName,subHeading, profileEditSubHeading = false, profileEditSubHeadingText} = props;
    return (

        <div  className={headingClassName ? headingClassName: `page-heading`}>
            {heading && <h2  className='page-main-heading'>{heading}</h2>}
            {profileEditSubHeading &&
            <p className="page-sub-heading">
                {`If you want to change the ${profileEditSubHeadingText} on your Binge account, you may do so below.
                     Be sure to click the 'Save Changes' button when you are done.`}
            </p>}
            {subHeading && <p className="page-sub-heading">{subHeading}</p>}
        </div>

    )
};

Heading.propTypes = {
    heading: PropTypes.string,
    subHeading: PropTypes.string,
    profileEditSubHeadingText: PropTypes.string,
    profileEditSubHeading: PropTypes.bool,
    headingClassName:PropTypes.string,
};

export default Heading;
