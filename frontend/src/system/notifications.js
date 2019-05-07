import React, {Component} from "react";
import {notifications} from "../system/socketio";
import iziToast from "izitoast";

export class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
           notificationData:null,
           notificationDataReceived:props.data ? true : false
        }
     } 

     componentDidMount() {

        iziToast.settings({
            image: '',
            imageWidth: 50,
            progressBar: false,
            position: 'topRight',
            transitionIn: 'fadeIn',
            transitionOut: 'fadeOut',
            icon:"",
            iconColor:"",
            timeout: 5000,
            theme: 'dark'
        })
       
        notifications(result =>{
                this.setState({
                    notificationData:result,
                    notificationDataReceived:true
            })
            console.log("from backend");
        })
    }

    render(){
        const Notification = (props) => {
        const type = props.type;
        
           
        
            if(type=="default"){
                iziToast.show({
                    title: props.title,
                    message: props.message
                })
            }
        
            if(type=="success"){
                iziToast.success({
                    title: props.title,
                    message: props.message
                })
            }
        
            if(type=="warning"){
                iziToast.warning({
                    title: props.title,
                    message: props.message
                })
            }
            if(type=="error"){
                iziToast.error({
                    title: props.title,
                    message: props.message
                })
            }
        
            if(type=="info"){
                iziToast.info({
                    title: props.title,
                    message: props.message
                })
            }
        
            return(<></>);
        } 

        if(this.state.notificationDataReceived){
          return(
              <Notification type={this.state.notificationData.type} title={this.state.notificationData.title} message={this.state.notificationData.message}></Notification>
            )
        }
        return(<></>);
      }

}






