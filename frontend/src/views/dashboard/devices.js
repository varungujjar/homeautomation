import React, { Component } from "react";
import Slider from "react-slick";
import { sio, sioDisconnect, sioOpen } from "../../system/socketio";
import { ContextData } from "../../system/provider";


// const Device = function (props) {
//     const device = props.device;
//     const OtherComponent = import();
//     const ModuleMe = OtherComponent.Module

//     return (
//         <ModuleMe key={props.key} data={device}/>
//     )


// }


export const GetDevice = (id,resultData) => {
    fetch(`/api/devices?id=${id}`)
            .then(response => response.json())
            .then((result) => {
                resultData(result);  
            })
            .catch((error) => {
                console.error(error)
            })
         
}

const SliderInner = (props) => {
    return (
        <Slider {...props.settings}>
            {props.items.map((item, index) =>
                {
                    const Component = item.deviceComponent;
                    const Data = item.deviceData;
                    return(
                        <Component key={index} data={Data} />
                    )
                    
                }
            )}
        </Slider>
    )
}




export class Devices extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            items: [],
            dataLoaded: false,
        }
        const contextType = ContextData;
    }


    dataReceived(data) {
        if (this._isMounted) {
            this.setState({
                items: this.state.items.filter(item => item.id != data.id).concat(data).sort((a, b) => a.order - b.order),
                dataLoaded: true,
            })
        }
    }

    componentDidMount() {
        this._isMounted = true;
        fetch("/api/devices")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    let items = [];
                    items = result.sort((a, b) => a.order - b.order);

                    items.map((item) => {
                        import(`../../components/${item.component}/${item.type}`)
                            .then(component => {
                                const componentItem = {
                                    deviceComponent: component.Module,
                                    deviceData: item,
                                };

                                this.setState({
                                    items: this.state.items.concat(componentItem),
                                    dataLoaded: true
                                })
                            }

                            )
                            .catch(error => {
                                console.error(`"${item.component} ${item.type}" not yet supported`);

                            });
                    })

                    // Promise.all(requests).then(() => {
                    //         this.setState({
                    //             dataLoaded: true
                    //         });
                    // })
                }


                result.map((item, index) => {
                    //Get all devices and check if it was already added to Main Provider Array If Not add it to the socket io stream once only.
                    sio(item.id, data => {
                        if (this._isMounted) {
                            let items = [];
                            items = this.state.items.filter(item => item.deviceData.id != data.id);
                            import(`../../components/${data.component}/${data.type}`)
                                .then(component => {

                                    const componentItem = {
                                        deviceComponent: component.Module,
                                        deviceData: data,
                                    };
                                    this.setState({
                                        items: items.concat(componentItem).sort((a, b) => a.deviceData.order - b.deviceData.order),
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
                    breakpoint: 1280,
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


        const { items } = this.state;

        if (this.state.dataLoaded == true) {
            return (
                <>
                    <div className="section mt-4">
                        <h3 className="mb-2">Devices</h3>
                        <div className="slider-wrapper">
                            <SliderInner settings={settings} items={items}></SliderInner>
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

Devices.contextType = ContextData;

