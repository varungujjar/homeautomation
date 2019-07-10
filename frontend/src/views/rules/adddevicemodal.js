import React, { Component } from "react";
import Modal from 'react-bootstrap/Modal'
import { GetDevice } from "../dashboard/devices";

export class AddDeviceModal extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.state = {
      show:false,
      devices :[],
      dataLoaded:false,
    };
  }


  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
    fetch("/api/devices?type=0")
        .then(response => response.json())
        .then((result) => {
                result.map((item) => {
                    import(`../../components/${item.component}/${item.type}`)
                        .then(component => {
                            const componentItem = {
                                deviceComponent: component.ModuleList,
                                deviceData: item,
                            };

                            this.setState({
                                devices : { 
                                    ...this.state.devices,
                                    [item.id]: componentItem,
                                },
                                dataLoaded:true
                                
                            })

                        }

                        )
                        .catch(error => {
                            console.error(`"${item.component} ${item.type}" not yet supported`);
                        });
                })
        })
      }
}


  componentWillUnmount() {
    this._isMounted = false;
  }

  handleShow() {
    this._isMounted = true;
    this.setState({ show: true });
  }

  handleHide = () => {
    this.setState({ show: false });
    this._isMounted = false;
  };


  addDevice = (defaultProperties) => {
    this.props.renderAddedDevice(defaultProperties,this.props.setFieldValue,this.props.values,this.props.dataType);
    this.handleHide();
  }


  render() {


    return (
      this.state.dataLoaded &&
      <>
        <button type="button" variant="primary" onClick={this.handleShow} className="show-device-props">
          <img src="assets/light/images/dots.svg" />
        </button>
        <Modal
          show={this.state.show}
          onHide={this.handleHide}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <h2 className="text-bold">Devices List</h2>
          </Modal.Header>
          <Modal.Body>
            <div className="p-all-less">
            <div className="row">
              {
                  Object.keys(this.state.devices).map((key, index) => { 
                    const Component = this.state.devices[key].deviceComponent;
                    const Data = this.state.devices[key].deviceData;  
                    if (this.props.dataType == "then") {
                      if (Object.keys(Data.actions).length > 0) {
                        return (
                          <div className="col-md-4 mb-3" key={index}>
                            <Component key={index} data={Data} addDefaultProperties={this.addDevice} dataType={this.props.dataType} />
                          </div>
                        )
                      }
                    } else {
                      return (
                        <div className="col-md-4 mb-3" key={index}>
                          <Component key={index} data={Data} addDefaultProperties={this.addDevice} dataType={this.props.dataType} />
                        </div>
                      )
                    }
                  })
              }
            </div>
        </div>
          </Modal.Body>
        </Modal>
      </>
    )
  }
}
