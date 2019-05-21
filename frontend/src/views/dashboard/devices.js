import React, { Component } from "react";
import Slider from "react-slick";
import { sio, sioDisconnect, sioOpen } from "../../system/socketio";
import { Switch } from "../../components/switch"
import { ContextData } from "../../system/provider";


const Device = function (props) {
    const device = props.device;
    if (device.type == "switch") {
        // console.log("switch");
        return (
                <Switch key={props.key} data={device}></Switch>
        )
    }
    else if (device.type == "sensor2") {
        console.log("yo sensor");
        return (
            null
        )
    } else{
        return (
            null
        )

    }
    
}


const SliderInner = (props) =>{


    return(
        <Slider {...props.settings}>
                   
        {props.items.map((item, index) =>
            (
                <Device key={index} device={item} />
            )
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

    dataReceived(data){
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
                    this.setState({
                        items: result.sort((a, b) => a.order - b.order),
                        dataLoaded: true
                    });
                }

                result.map((item, index) => {
                    //Get all devices and check if it was already added to Main Provider Array If Not add it to the socket io stream once only.
                    sio(item.id, data => {
                        if (this._isMounted) {
                            console.log(data);
                            this.setState({
                                items: this.state.items.filter(item => item.id != data.id).concat(data).sort((a, b) => a.order - b.order),
                                dataLoaded: true,
                            })
                        }
                    })
                    this.context.setStream(item.id);  
                })
                
            })
            .catch((error) => {
                console.error(error)
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
            arrows:false,
            swipeToSlide:true,
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
                    slidesToScroll:1
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

