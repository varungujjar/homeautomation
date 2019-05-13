import React, { Component } from "react";


export class Home extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            itemsLoaded: false
        }
    }


    componentDidMount() {
        this._isMounted = true;
        setInterval(() => {
            var time = new Date();
            if (this._isMounted) {
                this.setState({
                    curTime: time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })
                })
            }
        }, 1000)
        fetch("/api/home")
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
                <div key={props.room.id} className="card card-shadow item">
                    <img src="assets/light/images/bedroom.svg" />
                    <div className="text-bold mt-2">{props.room.name}</div>
                    <div className="text-secondary text-md">2 Devices</div>
                </div>
            )
        }
        if (this.state.itemsLoaded == false) {
            return (
                <div className="card card-outline">
                    <div className="card-body">
                         <span className="icon-1x icon-info icon-home"></span>

                        <h2 className="mt-3 ">Good Morning, Varun</h2>
                        <div className="text-xxl mt-2">{this.state.curTime}</div>
                        <p className="mt-2">I will keep you updated right here with the most important events of your home.
                        </p>
                    </div>
                </div>
            )
        }
        return (<div> ... </div>);
    }
}