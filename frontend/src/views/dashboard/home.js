import React, { Component } from "react";


export class Home extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            itemsLoaded: true
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
        // fetch("/api/home")
        //     .then(response => response.json())
        //     .then((result) => {
        //         if (this._isMounted) {
        //             this.setState({
        //                 items: result,
        //                 itemsLoaded: true
        //             });
        //         }
        //     })
        //     .catch((error) => {
        //         console.error(error)
        //     })
    }


    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        return (
        <>
            {this.state.itemsLoaded &&
                        <div className="b-l-info pl-3">
                             <h2 className="text-white">Good Morning, Varun</h2>
                              <div className="text-secondary text-md">{this.state.curTime}</div>

                        </div>    
                       
            }
            </>
            )
    }
}