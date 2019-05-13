import React, { Component } from "react";
import OwlCarousel from 'react-owl-carousel2';


export class Rooms extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            items: [],
            itemsLoaded: false
        }
    }


    componentDidMount() {
        this._isMounted = true;
        fetch("/api/rooms")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        items: result,
                        itemsLoaded: true
                    });
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }


    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        const RoomItem = (props) => {
            return (
                <div key={props.room.id} className="card card-shadow item  ">
                    <div className="card-body">
                        
                        <div className="text-center">
                            <span className={`icon-2x icon-${ props.room.icon ? props.room.icon : ""}`}></span>
                        </div>
                        <div className="text-bold mt-2 text-center">{props.room.name}</div>
                        <div className="text-secondary text-md text-center">2 Devices</div>
                    </div>
                </div>
            )
        }
        const options = {
            loop: false,
            margin: 15,
            nav: false,
            responsive: {
                0: {
                    items: 2
                },
                600: {
                    items: 3
                },
                1000: {
                    items: 3
                },
                1400: {
                    items: 5
                }
               
            }
        };
        const items = this.state.items;
        if (this.state.itemsLoaded == true) {
            return (
                <div className="section">
                    <h3 className="mb-2">Rooms</h3>
                    <OwlCarousel options={options}>
                        {items.map((item, index) => (
                            <RoomItem key={index} room={item} />
                        ))}
                    </OwlCarousel>
                </div>
            )
        }
        return (<div>...</div>);
    }
}