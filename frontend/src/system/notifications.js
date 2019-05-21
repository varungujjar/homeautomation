import React, {Component} from "react";
import {sio} from "../system/socketio";
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
            position: 'bottomRight',
            transitionIn: 'fadeIn',
            transitionOut: 'fadeOut',
            animateInside: false,
            icon:"",
            maxWidth:"300px",
            layout:2,
            balloon:true,
            iconColor:"",
            messageSize:12,
            messageLineHeight:20,
            timeout: 5000,
            theme: 'dark'
        })
        
        sio("notification",data=>{
            this.setState({
                notificationData:data,
                notificationDataReceived:true
            })
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
        return(null);
      }

}






