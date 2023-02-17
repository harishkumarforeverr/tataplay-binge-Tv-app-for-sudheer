import React from 'react';
import ShowMoreText from "react-show-more-text";

class ShowMoreLessComponent extends ShowMoreText {

    componentWillReceiveProps(nextProps) {
        if (nextProps && this.props && nextProps.reset && this.props.reset !== nextProps.reset) {
            this.setState({
                expanded: false,
                truncated: true,
            })
        }
    }

    render() {
        return (super.render())
    }
}

export default ShowMoreLessComponent;