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
      dataLoaded: true,
    };
  }


  componentDidMount() {
    this._isMounted = true;
    fetch("/api/devices?type=0")
        .then(response => response.json())
        .then((result) => {
            if (this._isMounted) {
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
                                dataLoaded: true
                            })

                        }

                        )
                        .catch(error => {
                            console.error(`"${item.component} ${item.type}" not yet supported`);

                        });
                })
            }


            result.map((item, index) => {
                //Get all devices and check if it was already added to Main Provider Array If Not add it to the socket io stream once only.
                

            })
               

        })
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
    // if(this.props.dataType=="if"){
    //   this.props.values.rule_if = type;
    //   this.props.setFieldValue(this.props.values.rule_if)
    // }
    
    this.props.renderAddedDevice(defaultProperties,this.props.setFieldValue,this.props.values,this.props.dataType);
    this.handleHide();
  }


  render() {
    // const ModalBody = this.state.modalDeviceRender;
    // let deviceData = this.state.modalDeviceData;
    const { devices } = this.state;

    // console.log(devices);

    return (
      this.state.dataLoaded == true &&
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
                Object.keys(devices).map((key, index) => { 
                    const Component = devices[key].deviceComponent;
                    const Data = devices[key].deviceData;
                   
                    return(
                        <div className="col-md-4 mb-3" key={index}>
                             <Component key={index} data={Data} addDefaultProperties={this.addDevice} />
                        </div>
                    )
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
