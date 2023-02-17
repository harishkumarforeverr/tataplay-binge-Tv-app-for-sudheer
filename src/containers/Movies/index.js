import React, {Component} from 'react';
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

import HeroBanner from '../../components/HeroBanner/index';
import Listing from '../../common/Listing/index';
import {showMainLoader, hideMainLoader} from '@src/action';

import './style.scss'

class Movies extends Component {
    componentDidMount() {
        /*let { showMainLoader, hideMainLoader } = this.props;
        showMainLoader();
        setTimeout(function(){ hideMainLoader(); console.log('in timeout') }, 3000);*/
    }

    render() {
        return (
            <React.Fragment>
                <div className="home-container"><HeroBanner/><Listing items={this.props.items}/>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    items: state.heroBannerDetails.items,
})

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators({
            showMainLoader,
            hideMainLoader,
        }, dispatch),
    }
}

Movies.propTypes = {
    item: PropTypes.object,
    showMainLoader: PropTypes.func,
    hideMainLoader: PropTypes.func,
    items: PropTypes.array,
};

export default (connect(mapStateToProps, mapDispatchToProps)(Movies))
