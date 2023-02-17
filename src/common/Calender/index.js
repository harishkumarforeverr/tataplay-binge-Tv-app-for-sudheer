import React, {Component} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";

import {getMonthNameFromDate, getWeekNameFromDate} from "@utils/common";

import './style.scss';


class Calendar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            calenderSelectedDate: '',
            selectedDate: null,
            fullYear: '',
            displayDate: '',
        };
        this.myRef = React.createRef();
    }

    componentDidMount = () => {
        this.loadHandler();
    };

    loadHandler = () => {
        // window.scrollTo(0, 0);
        let {minDate} = this.props;
        this.setState({
            calenderSelectedDate: minDate,
            selectedDate: null,
        }, () => {
            this.getFullYear();
            this.getDisplayDate();
        });
    };

    handleChange = date => {
        let previousSelectedItem = document.getElementsByClassName('react-datepicker__day--selected')[0];
        previousSelectedItem && previousSelectedItem.setAttribute("class", "previous-item");
        this.setState({
            calenderSelectedDate: date,
        }, () => {
            this.getFullYear();
            this.getDisplayDate();
        });
    };

    handleCalendarClose = () => {
        document.body.style.overflowY = 'auto';
        document.body.style['-ms-overflow-style'] = 'auto'
    };

    handleCalendarOpen = () => {
        document.body.style.overflowY = 'hidden';
        document.body.style['-ms-overflowY-style'] = 'none';
    };

    setDate = () => {
        this.setState({
            selectedDate: this.state.calenderSelectedDate,
        }, () => {
            this.closeCalendar(true);
        })
    };

    getDisplayDate = () => {
        let {calenderSelectedDate} = this.state;
        this.setState({
            displayDate: `${getWeekNameFromDate(calenderSelectedDate)}, ${getMonthNameFromDate(calenderSelectedDate)}  ${calenderSelectedDate.getDate()}`,
        });
    };

    getFullYear = () => {
        let {calenderSelectedDate} = this.state;
        this.setState({
            fullYear: calenderSelectedDate.getFullYear(),
        })
    };

    closeCalendar = (setCallbackValue = false) => {
        let { setDateValue, name } = this.props;
        this.myRef.current && this.myRef.current.calendar && this.myRef.current.calendar.props.setOpen(false);
        if (setCallbackValue) {
            return setDateValue(name, this.state.selectedDate);
        }
    };

    openCalender = () => {
        this.myRef.current && this.myRef.current.setOpen(true);
    };

    getCustomContainer = ({className, children}) => {
        let {fullYear, displayDate} = this.state;
        return (
            <div className={'calender-custom-container'}>
                <div className={className}>
                    <div className={'calender-top-block'}>
                        <p>{fullYear}</p>
                        <p>{displayDate}</p>
                    </div>
                    <div style={{position: "relative"}}>{children}</div>
                    <div className={'button-block'}>
                        <div>
                            <span onClick={this.closeCalendar}>CANCEL</span>
                            <span onClick={this.setDate}>OK</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        let {selectedDate} = this.state;
        let { label, minDate, maxDate } = this.props;

        return (
            <div className="calender-container">
                <div className={'calender-label'}><p>{label}</p> </div>
                <div className={'icon-block'} onClick={this.openCalender}><i className={'icon-calender'} /></div>
                <DatePicker
                    ref={this.myRef}
                    selected={selectedDate}
                    onChange={this.handleChange}
                    onCalendarClose={this.handleCalendarClose}
                    onCalendarOpen={this.handleCalendarOpen}
                    calendarContainer={this.getCustomContainer}
                    shouldCloseOnSelect={false}
                    placeholderText={'DD  /  MM  /  YYYY'}
                    dateFormat="dd/MM/yyyy"
                    minDate={minDate}
                    maxDate={maxDate}
                    withPortal
                    formatWeekDay={nameOfDay => nameOfDay.substr(0,1)}
                    onClickOutside={this.openCalender}
                    />
            </div>
        )
    }
}

Calendar.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    minDate: PropTypes.object,
    maxDate: PropTypes.object,
    setDateValue: PropTypes.func,
};

export default Calendar;
