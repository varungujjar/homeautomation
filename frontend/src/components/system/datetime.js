import React, { Component } from "react";
import Moment from 'react-moment';
import TimeKeeper from 'react-timekeeper';
//Documentation https://catc.github.io/react-timekeeper/



const convertTime = (time) => {
    let hour = ("0" + time[0]).slice(-2);
    let minutes = ("0" + time[1]).slice(-2);
    var timeString = hour + ":" + minutes + ":00";
    var datetime = new Date('1970-01-01 ' + timeString);
    return <Moment format="hh:mm A">{datetime}</Moment>
}


export const Module = (props) => {
    return (
        <div className="slider-slide">
            Hey
        </div>
    )
}


export class ModuleList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.day = { 0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun" };
        this.defaultIfAndProperties = {"type": "device", "condition": "=", "id": this.props.data.id, "properties": { 'day': [0,1,2,3,4,5,6], 'time': [12, 0]}}
        if(this.props.values){
            this.deviceValues = this.props.values;
        } 
        this.deviceData = this.props.data.properties.time ? this.props.data : this.defaultIfAndProperties;
        this.state = {
            displayTimepicker: false,
            timeChange:"",
            edit:false
        }
        this.config={
            TIMEPICKER_BACKGROUND: 'white',
            CLOCK_WRAPPER_BACKGROUND : '#fafafa',
            FONT_FAMILY: '"Open Sans", sans-serif',
            DONE_BUTTON_BORDER_COLOR : '#FFF',
            DROPDOWN_SELECTED_COLOR : '#efefef',
            CLOCK_WRAPPER_MERIDIEM_BACKGROUND_COLOR_SELECTED :'#333',
            CLOCK_WRAPPER_MERIDIEM_TEXT_COLOR_SELECTED : '#ffffff',
            CLOCK_HAND_ARM: '#CCC',
            CLOCK_HAND_CIRCLE_BACKGROUND: '#efefef',
            CLOCK_HAND_INTERMEDIATE_CIRCLE_BACKGROUND: '#666',
            TIME_SELECTED_COLOR :'#222'
        }
    }


    handleDayChange = (event) => {
        const target = event.currentTarget;
        let valueArray = this.deviceValues.properties.day;
        if (target.checked) {
            valueArray.push(parseInt(target.id));
        } else {
            valueArray.splice(valueArray.indexOf(parseInt(target.id)), 1);
        }
        this.deviceValues.properties.day = valueArray.sort((a, b) => a - b);
        this.props.setFieldValue(this.deviceValues.properties.day)
    };


    onTimeChange = (newTime) => {
        this.deviceValues.properties.time[0] = newTime.hour24;
        this.deviceValues.properties.time[1] = newTime.minute;
        this.props.setFieldValue(this.deviceValues.properties.time[0])
        this.props.setFieldValue(this.deviceValues.properties.time[1])
        let timeChanged = this.createTime(this.deviceValues.properties.time[0], this.deviceValues.properties.time[1])
        this.setState({ timeChange: timeChanged })
    }


    toggleTimekeeper(val) {
        this.setState({ displayTimepicker: val })
    }


    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            if (this.deviceValues) {
                if (this.deviceValues.properties.time) {
                    this.time = this.createTime(this.deviceValues.properties.time[0], this.deviceValues.properties.time[1])
                    this.setState({ timeChange: this.time })
                } else {
                    this.deviceValues.properties = this.defaultIfAndProperties;
                    this.props.setFieldValue(this.deviceValues.properties)
                    this.time = this.createTime(this.deviceData.properties.time[0], this.deviceData.properties.time[1])
                    // this.setState({ timeChange: this.time })
                }
            }
        }
    }    


    createTime = (hour, minute) => {
        let minuteUse = "";
        if (minute.toString().length == 1) {
            if (minute == 0) {
                minuteUse = "00";
            } else {
                minuteUse = "0" + minute;
            }
        } else {
            minuteUse = minute;
        }
        const time = hour + ":" + minuteUse;
        return time;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        return (
            <div>
                <div className={`card card-outline-default h-100 ${this.deviceValues && !this.state.edit ? "has-edit-hover" : ""}`}>
                    <div className="edit-overlay v-center" onClick={() => this.setState({ edit: true })}>
                        <span className="text-lg icon-1x icon-edit"></span>
                    </div>
                    {
                        
                            <>
                                <div className="p-all-less">
                                    <span className="icon-1x icon-clock icon-left btn-info"></span>
                                    <div className="text-bold">{convertTime(this.deviceData.properties.time)}</div>
                                    <ul className="days">
                                        {
                                            this.deviceData.properties.day.length == 7 && (
                                                <li>All Weekdays</li>
                                            )
                                        }
                                        {
                                            this.deviceData.properties.day.length < 7 && this.deviceData.properties.day.length > 0 &&
                                            this.deviceData.properties.day.map((number, index) => {
                                                return (
                                                    <li key={index}>{Object.values(this.day)[number]}&nbsp;&nbsp;</li>
                                                )
                                            })
                                        }
                                        {
                                            this.deviceData.properties.day.length == 0 && (
                                                <li>Weekdays</li>
                                            )
                                        }
                                    </ul>
                                </div>
                            </>
                       
                    }
                    {
                        this.deviceValues && this.state.edit && (
                            <>
                                <div className="p-all-less">
                                    <input className="form-control" type="hidden" value={this.deviceValues.type} name={`${this.props.dataType}[type]`} onChange={this.props.handleChange} />
                                    <input className="form-control" type="hidden" value={this.deviceValues.condition} name={`${this.props.dataType}[condition]`} onChange={this.props.handleChange} />
                                    <button type="button" className="btn btn-default btn-sm" onClick={() => this.toggleTimekeeper(true)}>select time</button>
                                    {this.state.displayTimepicker ?
                                        <div className="time-keeper-box">
                                            <TimeKeeper
                                                time={this.state.timeChange}
                                                config={this.config}
                                                onChange={this.onTimeChange}
                                                switchToMinuteOnHourSelect={true}
                                                closeOnMinuteSelect={true}
                                                onDoneClick={() => {
                                                    this.toggleTimekeeper(false)
                                                }}
                                            />
                                        </div>
                                        :
                                        false
                                    }
                                    {
                                        Object.keys(this.day).map((number, index) => {
                                            let checked = false;
                                            this.deviceValues.properties.day.map((value) => {
                                                if (value == number) {
                                                    checked = true;
                                                }
                                            })
                                            return (
                                                <div className="form-check mt-2" key={index}>
                                                    <input className="form-check-input" type="checkbox" id={number} name={`${this.props.dataType}[properties][day][${number}]`} onChange={this.handleDayChange} checked={checked} />
                                                    <label className="form-check-label">{Object.values(this.day)[number]}</label>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <span className="link w-100 b-t" onClick={() => this.setState({ edit: false })}>Done</span>
                            </>
                        )
                    }
                    {
                        this.props.addDefaultProperties && (this.props.dataType == "if" || this.props.dataType == "and") && (
                            <button className="text-lg icon-bg-light icon-1x icon-add float-right icon-shadow" type="button" variant="primary" onClick={() => { this.props.addDefaultProperties(this.defaultIfAndProperties) }}></button>
                        )
                    }
                    {this.deviceValues && !this.state.edit && (
                        <button className="text-lg icon-bg-light icon-1x icon-remove float-right icon-shadow" type="button" variant="primary" onClick={() => { this.props.deleteDefaultProperties(this.props.indexMap, this.props.dataType) }}></button>
                    )
                    }
                </div>
            </div>
        )
    }
}



