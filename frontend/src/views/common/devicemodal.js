import React, { Component } from "react";
import Modal from 'react-bootstrap/Modal'
import { sio } from "../../system/socketio";
import { GetDevice } from "../dashboard/devices";

export class DeviceModal extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.state = {
      show:false,
    };
  }


  getDeviceData = (props) => {
    GetDevice(props.data.id, data => {
      import(`../../components/${data.component}/${data.type}`)
        .then(component => {
          if (this._isMounted) {
            this.setState({
              modalDeviceRender: component.ModuleModal,
              modalDeviceData: data,
              dataLoaded: true,
            })
          }
        }
        ).catch(error => {
          // console.error(`"${this.props.data.component} ${this.props.data.type}" not yet supported`);
        });
    })
  }
  


  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      this.getDeviceData(this.props)
    }
      sio(this.props.data.id, data => { 
        if (this._isMounted) {
          this.setState({
            modalDeviceData: data,
            dataLoaded: true
          })
        }
    })
  }


  componentWillUnmount() {
    this._isMounted = false;
  }

  handleShow() {
    this._isMounted = true;
    this.setState({ show: true });
    this.getDeviceData(this.props)
  }

  handleHide = () => {
    this.setState({ show: false });
    this._isMounted = false;
  };

  render() {
    const ModalBody = this.state.modalDeviceRender;
    let deviceData = this.state.modalDeviceData;

    return (
      this.state.dataLoaded == true &&
      <>
        <button variant="primary" onClick={this.handleShow} className="show-device-props">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </button>
        <Modal
          show={this.state.show}
          onHide={this.handleHide}
          size="md"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <h2 className="text-bold">{deviceData.name ? deviceData.name : "..."}</h2>
          </Modal.Header>
          <Modal.Body>
            <ModalBody data={deviceData} />
          </Modal.Body>
        </Modal>
      </>
    )
  }
}
