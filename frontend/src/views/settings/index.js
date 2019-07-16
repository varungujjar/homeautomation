import React, { Component } from "react";
import { Formik } from 'formik';
import { Header } from "../common/header";
import { System } from "./system";
import { Components } from "./components";
import PropTypes from 'prop-types'
import SelectTimezone, { getTimezoneProps } from 'react-select-timezone'



const SettingsForm = () => (
    <div className="mt-4">
        <Formik
            initialValues={{ city: '', state: '' }}
            validate={values => {
                let errors = {};
                if (!values.city) {
                    errors.city = 'Please add a City';
                }
                if (!values.state) {
                    errors.state = 'Please add a State';
                }
                if (!values.latitude) {
                    errors.latitude = 'Please enter latitude';
                }
                if (!values.longitude) {
                    errors.longitude = 'Please enter latitude';
                }
                return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
                alert(JSON.stringify(values, null, 2));
                setSubmitting(false);
            }}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                /* and other goodies */
            }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" onChange={handleChange} onBlur={handleBlur} value={values.city} className="form-control" />
                                    <div className="text-danger">{errors.city && touched.city && errors.city}</div>
                                </div></div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>State</label>
                                    <input type="text" name="state" onChange={handleChange} onBlur={handleBlur} value={values.state} className="form-control" />
                                    <div className="text-danger">{errors.state && touched.state && errors.state}</div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Latitude</label>
                                    <input type="text" name="latitude" onChange={handleChange} onBlur={handleBlur} value={values.latitude} className="form-control" />
                                    <div className="text-danger">{errors.latitude && touched.latitude && errors.latitude}</div>
                                </div></div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label>Longitude</label>
                                    <input type="text" name="longitude" onChange={handleChange} onBlur={handleBlur} value={values.longitude} className="form-control" />
                                    <div className="text-danger">{errors.longitude && touched.longitude && errors.longitude}</div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            Save 
            </button>
                    </form>
                )}
        </Formik>
    </div>
);

export class Settings extends Component {
    constructor(props) {
        super(props);
        // this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }


    render() {

        const options = [
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'strawberry', label: 'Strawberry' },
            { value: 'vanilla', label: 'Vanilla' }
          ]

        return (
            <>   
            <Header name={this.props.name} icon={this.props.icon}></Header>
                      
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link   active" id="components-tab" data-toggle="tab" href="#components" role="tab" aria-controls="components" aria-selected="true"><i className="fal fa-box-open"></i> Components</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" id="rooms-tab" data-toggle="tab" href="#rooms" role="tab" aria-controls="rooms" aria-selected="false"><i className="fal fa-person-booth"></i> Rooms</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" id="devices-tab" data-toggle="tab" href="#devices" role="tab" aria-controls="devices" aria-selected="false"><i className="fal fa-toggle-off"></i> Devices</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" id="network-tab" data-toggle="tab" href="#network" role="tab" aria-controls="network" aria-selected="false"><i className="fal fa-network-wired"></i> Network</a>
                            </li>
                         
                            <li className="nav-item">
                                <a className="nav-link" id="system-info-tab" data-toggle="tab" href="#system-info" role="tab" aria-controls="system-info" aria-selected="false"><i className="fal fa-cog"></i> System Information</a>
                            </li>

                        </ul>
                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="components" role="tabpanel" aria-labelledby="components-tab">
                                <div className="mt-4"><Components/></div>
                            </div>

                            <div className="tab-pane fade " id="rooms" role="tabpanel" aria-labelledby="rooms-tab">rooms.</div>
                            <div className="tab-pane fade" id="devices" role="tabpanel" aria-labelledby="devices-tab">devices</div>
                            <div className="tab-pane fade" id="network" role="tabpanel" aria-labelledby="network-tab">network</div>
                            <div className="tab-pane fade" id="system-info" role="tabpanel" aria-labelledby="system-info-tab">
                            <System></System>
                            
                            </div>

                          

                        </div></>
           )
    }
}

