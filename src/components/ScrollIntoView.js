import { PureComponent } from "react";
import {withRouter} from "react-router";
import PropTypes from 'prop-types';

class ScrollIntoView extends PureComponent {
    componentDidMount = () => window.scrollTo(0, 0);

    componentDidUpdate = prevProps => {
        if (this.props.location !== prevProps.location) setTimeout(()=>{ window.scrollTo(0, 0)},0);
    };

    render = () => this.props.children;
}

ScrollIntoView.propTypes = {
    location: PropTypes.object,
    children: PropTypes.object,
}

export default withRouter(ScrollIntoView);
