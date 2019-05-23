import React from "react";
import Moment from 'react-moment';


const convertTime = (time) => {
    let hour = ("0" + time[0]).slice(-2);
    let minutes = ("0" + time[1]).slice(-2);
    var timeString = hour+":"+minutes+":00";
    var datetime = new Date('1970-01-01 ' + timeString);
    return <Moment format="hh:mm A">{datetime}</Moment>
}


export const ModuleRule = (props) => {
    const day = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    const ifData= props.component.if;
    return (
        <div className="card card-outline-default  h-100">
            <div className="p-all-less">
                <span className="icon-1x icon-clock icon-info icon-left btn-info"></span>
                <div className="text-bold">{convertTime(ifData.properties.time)}</div>
                {/* <div className="text-bold text-light">{ifData.datetime}</div> */}
                <div className="">
                    <ul className="days">
                        {
                            ifData.properties.day.length == 7 && (
                                <li>All Weekdays</li>
                            )
                        }
                        {
                            ifData.properties.day.length != 7 && (
                                ifData.properties.day.map((number, index) => {
                                    return (
                                        <li key={index}>{day[number]}&nbsp;.&nbsp;</li>
                                    )
                                })
                            )
                        }
                    </ul>
                </div>
                <div className="clearfix"></div>
            </div>
        </div>
    )

}

