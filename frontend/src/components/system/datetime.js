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
        this.state = {
            displayTimepicker: false
        }
    }


    handleDayChange = (event) => {
        const target = event.currentTarget;
        let valueArray = this.props.values.properties.day;
        if (target.checked) {
            valueArray.push(parseInt(target.id));
        } else {
            valueArray.splice(valueArray.indexOf(parseInt(target.id)), 1);
        }
        this.props.values.properties.day = valueArray.sort((a, b) => a - b);
        this.props.setFieldValue(this.props.values.properties.day)
    };


    onTimeChange = (newTime) => {
        this.props.values.properties.time[0] = newTime.hour24;
        this.props.values.properties.time[1] = newTime.minute;
        this.props.setFieldValue(this.props.values.properties.time[0])
        this.props.setFieldValue(this.props.values.properties.time[1])
    }


    toggleTimekeeper(val) {
        this.setState({ displayTimepicker: val })
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


    render() {
        const day = { 0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun" }
        const defaultProperties = {"type": "device", "condition": "=", "id": this.props.data.id, "properties": { 'day': [0,1,2,3,4,5,6], 'time': [12, 0]}}
        const properties = this.props.data.properties.time ? this.props.data.properties : defaultProperties.properties;

        let time = "";
        if (this.props.values) {
            if (this.props.values.properties.time) {
                time = this.createTime(this.props.values.properties.time[0], this.props.values.properties.time[1])
            } else {
                this.props.values.properties = defaultProperties;
                this.props.setFieldValue(this.props.values.properties)
                time = this.createTime(properties.time[0], properties.time[1])
            }
        }

        return (
            <div>
                <div className="card card-outline-default  h-100">
                    <div className="p-all-less">
                        <span className="icon-1x icon-clock icon-left btn-info"></span>
                        <div className="text-bold">{convertTime(properties.time)}</div>
                        <div>
                            <ul className="days">
                                {
                                    properties.day.length == 7 && (
                                        <li>All Weekdays</li>
                                    )

                                }
                                {
                                    properties.day.length < 7 && properties.day.length > 0 &&
                                    properties.day.map((number, index) => {
                                        return (
                                            <li key={index}>{Object.values(day)[number]}&nbsp;&nbsp;</li>
                                        )
                                    })

                                }
                                {
                                    properties.day.length == 0 && (
                                        <li>Weekdays</li>
                                    )

                                }
                            </ul>
                        </div>
                        <div className="clearfix"></div>
                        {
                            this.props.addDefaultProperties && (
                                <button type="button" variant="primary" onClick={() => {this.props.addDefaultProperties(defaultProperties)}}>+ ADD</button>
                            )
                        }


                    </div>
                    {
                        this.props.values && (
                            <div className="p-all-less">
                                <input className="form-control" type="hidden" value={this.props.values.type} name={`${this.props.dataType}[type]`} onChange={this.props.handleChange} onBlur={this.props.handleBlur} />
                                <input className="form-control" type="hidden" value={this.props.values.condition} name={`${this.props.dataType}[condition]`} onChange={this.props.handleChange} onBlur={this.props.handleBlur} />
                                <button type="button" className="btn btn-default" onClick={() => this.toggleTimekeeper(true)}>select time</button>

                                {this.state.displayTimepicker ?
                                    <div className="time-keeper-box">
                                        <TimeKeeper
                                            time={time}
                                            onChange={this.onTimeChange}
                                            switchToMinuteOnHourSelect={true}
                                            onDoneClick={() => {
                                                this.toggleTimekeeper(false)
                                            }}
                                        />
                                    </div>
                                    :
                                    false
                                }
                                {
                                    Object.keys(day).map((number, index) => {
                                        let checked = false;
                                        this.props.values.properties.day.map((value) => {
                                            if (value == number) {
                                                checked = true;
                                            }
                                        })
                                        return (
                                            <div className="form-check form-check-inline" key={index}>
                                                <input className="form-check-input" type="checkbox" id={number} name={`${this.props.dataType}[properties][day][${number}]`} onChange={this.handleDayChange} checked={checked} />
                                                <label className="form-check-label">{Object.values(day)[number]}</label>
                                            </div>
                                        )
                                    })
                                }
                            </div>)
                    }
                </div>
            </div>
        )
    }
}



