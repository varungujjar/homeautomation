import React, { Component } from "react";
import { Rooms } from "./rooms";
import { Scenes } from "./scenes";
import { Devices } from "./devices";
import { Header } from "../common/header";
import { Horizon } from "../../components/horizon";
import { Weather } from "./weather";
import { Home } from "./home";
import { Launcher } from '../../system/agent';
import { sio, sioDisconnect, sioOpen } from "../../system/socketio";



export class Dashboard extends Component {
    constructor(props) {
        super(props);
        const initConversation = {
          "currentNode": "",
          "complete": null,
          "context": {},
          "parameters": [],
          "extractedParameters": {},
          "speechResponse": [],
          "intent": {},
          "input": "init_conversation",
          "missingParameters": []
        }
        this.state = {
            responseMessage:initConversation,
            messageList: [],
            newMessagesCount: 0,
            isOpen: false
          };
          
    }

    sendConversation(text){
      this.state.responseMessage.input = text;
      fetch(`/api/conversation`, {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.state.responseMessage)
      })
      .then(response => response.json())
      .then((agentResult) => {
        agentResult.speechResponse.map((speech, index) => {
          this.state.responseMessage = agentResult;
          this._sendMessage(speech)
        })
      })
      
    }

    _onMessageWasSent(message) {
      if (message.type=="text"){
        this.sendConversation(message.data.text)
      }else if(message.type=="emoji") {
        this.sendConversation(message.data.emoji)
      }
      this.setState({
        messageList: [...this.state.messageList, message]
      })

        
      }
    
      _sendMessage(text) {       
        if (text.length > 0) {
          const newMessagesCount = this.state.isOpen ? this.state.newMessagesCount : this.state.newMessagesCount + 1;
          this.setState({
            newMessagesCount: newMessagesCount,
            messageList: [...this.state.messageList, {
              author: 'them',
              type: 'text',
              data: { text }
            }]
          })
        }
      }

      _handleClick() {
        this.setState({
          isOpen: !this.state.isOpen,
          newMessagesCount: 0
        });
      }


     componentDidMount(){
        this.sendConversation("init_conversation")
     } 

    render() {

        

        return (
            <>
                
                
                <div className="wrapper">
                <ul className="top-nav">
                    <li className="active"><a href="#">Dashboard</a></li>
                    <li><a href="#">Living Room</a></li>
                    <li><a href="#">Bedroom</a></li>
                    <li><a href="#">Bedroom 02</a></li>
                    <li><a href="#">Bathroom</a></li>
                    <li><a href="#">Kitchen</a></li>

                </ul>

                <Home />
                <div className="row mt-5">
                    <div className="col-md-5 b-r-default"><Weather/></div>
                    <div className="col-md-7">
                    <div className="row h-100">
                        <div className="col-md-6 b-r-default"><div className="p-all-less"><Horizon/></div></div>
                        <div className="col-md-6 h-100">
                        <div className="p-all-less">
                             <div className="text-info text-3x text-thin">160 <span className="text-secondary text-normal">kwH</span></div>
                        <div className="clearfix"></div>
                        <h2 className="mt-1 text-white">Power Consumption</h2>
                        <span className="text-secondary">Overview</span>
                        </div>
                        </div>
                    </div>
                    </div>

                   
                </div>
                {/* <Rooms></Rooms> */}
                <Scenes/>
                <Devices/>
                </div>

                <Launcher
                    agentProfile={{
                    teamName: 'homie',
                    imageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png'
                    }}
                    onMessageWasSent={this._onMessageWasSent.bind(this)}
                    newMessagesCount={this.state.newMessagesCount}
                    handleClick={this._handleClick.bind(this)}
                    isOpen={this.state.isOpen}
                    messageList={this.state.messageList}
                    showEmoji
                />
            </>
        )
    }
}
