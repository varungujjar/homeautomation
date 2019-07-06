import React, {Component} from "react";
import Moment from 'react-moment';
// import { DeviceModalEdit } from "../../views/common/devicemodaledit";
// import { Formik, Field } from 'formik';
import TimeKeeper from 'react-timekeeper';
//Documentation https://catc.github.io/react-timekeeper/



const convertTime = (time) => {
    let hour = ("0" + time[0]).slice(-2);
    let minutes = ("0" + time[1]).slice(-2);
    var timeString = hour+":"+minutes+":00";
    var datetime = new Date('1970-01-01 ' + timeString);
    return <Moment format="hh:mm A">{datetime}</Moment>
}


export const ModuleEdit = (props) => {
    return (
        <>
        I Am Editing Date Time
        </>
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
        console.log(newTime.hour24);
        console.log(newTime.minute);
        this.props.values.properties.time[0] = newTime.hour24;
        this.props.values.properties.time[1] = newTime.minute;
        this.props.setFieldValue(this.props.values.properties.time[0])
        this.props.setFieldValue(this.props.values.properties.time[1])
     }
     
     toggleTimekeeper(val){
        this.setState({displayTimepicker: val})
    }


    render(){
        const day = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
        const dayNumber = [0,1,2,3,4,5,6]
        const data = this.props.data.ifData;
        let timeOpen = false;

        return (
            <div>
                <div className="card card-outline-default  h-100">
                    <div className="p-all-less">
                        <span className="icon-1x icon-clock icon-info icon-left btn-info"></span>
                        <div className="text-bold">{convertTime(data.properties.time)}</div>
                        {/* <div className="text-bold text-light">{data.datetime}</div> */}
                        <div>
                            <ul className="days">
                                {
                                    data.properties.day.length == 7 && (
                                        <li>All Weekdays</li>
                                    )
                                }
                                {
                                    data.properties.day.length != 7 && (
                                        data.properties.day.map((number, index) => {
                                            return (
                                                <li key={index}>{day[number]}&nbsp;&nbsp;</li>
                                            )
                                        })
                                    )
                                }
                            </ul>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                    {/* {console.log(timeOpen)} */}
                    {
                        this.props.values && (
                            <div className="p-all-less">
                                <input className="form-control" type="hidden" value={this.props.values.type} name={`${this.props.dataType}[type]`} onChange={this.props.handleChange} onBlur={this.props.handleBlur} />
                                <input className="form-control" type="hidden" value={this.props.values.condition} name={`${this.props.dataType}[condition]`} onChange={this.props.handleChange} onBlur={this.props.handleBlur} />
                                <button type="button" className="btn btn-default" onClick={() => this.toggleTimekeeper(true)}>select time</button>

                                {this.state.displayTimepicker ?
                                <div className="time-keeper-box">
                                    <TimeKeeper
                                        time={`${this.props.values.properties.time[0]}:${this.props.values.properties.time[1] == "0" ? "00" : 0+this.props.values.properties.time[1]}`}
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
                                    dayNumber.map((number, index) => {
                                        let checked = false;
                                        const found = this.props.values.properties.day.indexOf(number);
                                        if (found > -1) { checked = true; }
                                        return (
                                            <div className="form-check form-check-inline" key={index}>
                                                <input className="form-check-input" type="checkbox" id={number} name={`${this.props.dataType}[properties][day][${number}]`} onChange={this.handleDayChange} checked={checked} />
                                                <label className="form-check-label">{day[number]}</label>
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



