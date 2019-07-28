import React, { Component } from "react";
import Slider from "react-slick";
import { sio, sioDisconnect, sioOpen } from "../../system/socketio";
import { ContextData } from "../../system/provider";



export const GetDevice = (id,resultData) => {
    fetch(`/api/devices/${id}`)
            .then(response => response.json())
            .then((result) => {
                resultData(result);  
            })
            .catch((error) => {
                console.error(error)
            })
}


const SliderInner = (props) => { 
    let devices = props.items;
    return (
        <Slider {...props.settings}>

            {
                Object.keys(devices).map((key, index) => { 
                    const Component = devices[key].deviceComponent;
                    const Data = devices[key].deviceData;
                    return(
                        <Component key={index} data={Data} />
                    )
                })

            }
        </Slider>
    )
}




export class Devices extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            devices :[],
            dataLoaded: false,
        }
        // const contextType = ContextData;
    }


    

    componentDidMount() {
        this._isMounted = true;
        fetch("/api/devices")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    result.map((item) => {
                        import(`../../components/${item.component}/${item.type}`)
                            .then(component => {
                                const componentItem = {
                                    deviceComponent: component.Module,
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
                    sio(item.id, data => {
                        if (this._isMounted) {
                            import(`../../components/${data.component}/${data.type}`)
                                .then(component => {
                                    const componentItem = {
                                        deviceComponent: component.Module,
                                        deviceData: data,
                                    };
                                    
                                    this.setState({
                                        devices : { 
                                            ...this.state.devices,
                                            [data.id]: componentItem,
                                        },
                                        dataLoaded: true
                                    })
                                })


                        }
                        // this.context.setStream(item.id);  
                    })


                })
                   

            })
    }


    componentWillUnmount() {
        this._isMounted = false;
    }



    render() {

        var settings = {
            dots: true,
            infinite: false,
            speed: 500,
            arrows: false,
            swipeToSlide: true,
            slidesToShow: 5,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1219,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        };


        const { devices } = this.state;

        // console.log(this.state)

        if (this.state.dataLoaded == true) {
            return (
                <>
                    <div className="section mt-4">
                        <div className="slider-wrapper">
                            <SliderInner settings={settings} items={devices}></SliderInner>
                        </div>
                    </div>
                </>
            )
        }
        return (
            null
        )
    }
}

// Devices.contextType = ContextData;

