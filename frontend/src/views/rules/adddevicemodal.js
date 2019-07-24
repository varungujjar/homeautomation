import React, { Component } from "react";
import Modal from 'react-bootstrap/Modal'

export class AddDeviceModal extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.state = {
      show:false,
      devices :[],
      components :[],
      dataLoaded:false,
    };
  }


  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
    fetch("/api/devices")
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
                            console.error(`"${item.component}/${item.type}" not yet supported`);
                        });
                })
        })
        fetch("/api/components/system/0")
        .then(response => response.json())
        .then((result) => {
                result.map((item) => {
                    import(`../../components/${item.id}`)
                        .then(component => {
                            const componentItem = {
                                deviceComponent: component.ModuleList,
                                deviceData: item,
                            };

                            this.setState({
                                components : { 
                                    ...this.state.components,
                                    [item.id]: componentItem,
                                },
                                dataLoaded:true                     
                            })

                        }

                        )
                        .catch(error => {
                            console.error(`"${item.id}" not yet supported`);
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
    if(this._isMounted){
      this.setState({ show: true });
    }
  }

  handleHide = () => {
    this.setState({ show: false });
    this._isMounted = false;
  };


  addDevice = (defaultProperties) => {
    this.props.renderAddedDevice(defaultProperties,this.props.dataType);
    this.handleHide();
  }


  render() {
    return (
      this.state.dataLoaded &&
      <>
        <div className="col-md-4 v-center text-center mb-3" >
          <div className="empty-device" onClick={this.handleShow}> 
          <span className="text-lg icon-bg-light icon-1x icon-add icon-shadow">
          </span>
          </div>
        </div>

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
            <div className="p-all-less-lg bg-light">
              <h2 className="mb-3">Components</h2>
              <div className="row mb-3">
              {
                  Object.keys(this.state.components).map((key, index) => { 
                    const Component = this.state.components[key].deviceComponent;
                    const Data = this.state.components[key].deviceData;  
                    if (this.props.dataType == "then") {
                      if (Object.keys(Data.actions).length > 0) {
                        return (
                          <div className="col-md-4 mb-3" key={index}>
                            <Component key={index} data={Data} addDefaultProperties={this.addDevice} dataType={this.props.dataType} />
                          </div>
                        )
                      }
                    } else if(Object.keys(Data.properties).length > 0) {
                      return (
                        <div className="col-md-4 mb-3" key={index}>
                          <Component key={index} data={Data} addDefaultProperties={this.addDevice} dataType={this.props.dataType} />
                        </div>
                      )
                    }
                  })
              }
            </div>
              <div className="clearfix"></div>

             <h2 className="mb-3">Devices</h2>  
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
                    } else if(Object.keys(Data.properties).length > 0) {
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
