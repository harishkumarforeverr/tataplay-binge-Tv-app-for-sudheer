import React from 'react';
import ReadMoreAndLess from 'react-read-more-less';

class ReadMoreAndLessComponent extends ReadMoreAndLess {

    componentWillReceiveProps(nextProps) {
        if (nextProps && this.props && nextProps.reset && this.props.reset !== nextProps.reset) {
            this.setState({
                charLimit: this.props.charLimit,
            })
        }
    }

    render() {
        return (super.render())
    }
}

export default ReadMoreAndLessComponent;