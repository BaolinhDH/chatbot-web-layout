// Dependencies:
// npm
// React (npx create-react-app)
// Axios (npm install axios)
// Mic Recorder to MP3 (npm install mic-recorder-to-mp3)
// w3cwebsocket from websocket (npm install websocket)

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import MicRecorder from 'mic-recorder-to-mp3';
import { w3cwebsocket } from 'websocket';

import './index.css';

const mp3Recorder = new MicRecorder({ bitrate: 128 }); // Mic Recorder Configuration

class Page extends React.Component{
  render(){
    return(
      <div>
        <div className="blue">
          <h1>Lorem Ipsum</h1>
        </div>

        <h2>Dolor Sit Amet</h2>

        <div className="vid-container">
          <img src = "" alt="placeholder"/>
        </div>

        <h3>
          Description:
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </h3>

        <AIInteract/>

        <br/>
        <br/>
        <br/>
      </div>
    );
  }
}

class AIInteract extends React.Component{ // Component containing all voice stuff
  constructor(props){
    super(props);

    this.state = {
      selectedFile: null, // Selected file of OralUpload Component

      isRecording: false,
      blobURL: '', // URL to blob of OralInput audio file
      isBlocked: true, // Boolean of if mic access is blocked by end user

      transcript: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis feugiat magna. Quisque sit amet semper dui. Curabitur venenatis felis vitae dui iaculis venenatis. Donec tristique felis arcu, eget volutpat sem tincidunt sit amet. Fusce porta erat eget ullamcorper laoreet. Proin porta viverra auctor. Praesent nec dolor ut neque placerat sodales ut luctus felis. Vestibulum luctus velit et semper congue. In velit mi, tempus vel feugiat in, imperdiet eu libero. In accumsan neque tellus, nec accumsan metus pellentesque quis. Nunc elementum velit sed molestie posuere. Nulla maximus erat id sapien egestas.' // Text returned from AI
    };

    this.getInput = this.getInput.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.askAudioPerms = this.askAudioPerms.bind(this)
    this.startRecording = this.startRecording.bind(this)
    this.stopRecording = this.stopRecording.bind(this)
  }

  getInput(file){
    this.setState({
      selectedFile: file,
      loaded: 0,
    })
  }

  handleSubmit = () => { // Handle Submission of file in OralUpload
    console.log("Submission Starting")
    const data = new FormData()
    data.append('file', this.state.selectedFile)

    axios.post("http://localhost:3000/upload", data, {
      // Paramters: Endpoint URL, Form Data
    })
    .then(res => {
      console.log("Submission Successful")
    })
  }

  askAudioPerms(){
    navigator.mediaDevices.getUserMedia({audio: true})
      .then(() => {
        console.log("Permission Granted");
        this.setState({isBlocked: false});
      })
      .catch(() => {
        console.log("Permission Denied");
        this.setState({isBlocked: true})
      });
  }

  startRecording(){ // Start Recording via OralInput Component
    // Start mp3Recorder
    mp3Recorder
      .start()
      .then(() => {
        this.setState({isRecording: true});
      }).catch((e) => console.error(e));

    console.log("Recording Started")
  }

  stopRecording(){ // Stop Recording after having started recording
    // Stop mp3Recorder
    mp3Recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const blobURL = URL.createObjectURL(blob)
        this.setState({blobURL, isRecording: false});
      }).catch((e) => console.log(e));

    console.log("Recording saved as blob")

    // Send mp3 Blob to chat bot:
    // [Write later]
  }

  receiveTranscript(){ // Function for receiving text from the AI and displaying it

  }

  render(){
    return(
      <div>
        <OralUpload getInput = {this.getInput} handleSubmit = {this.handleSubmit}/>
        <OralInput askAudioPerms = {this.askAudioPerms} startRecording = {this.startRecording} stopRecording = {this.stopRecording} value = {this.state}/>
        <TextOutput value = {this.state.transcript}/>
      </div>
    )
  }

}

class OralUpload extends React.Component{ // Component for uploading voice files

  handleInput=event=>{ // Handle input from OralUpload
    this.props.getInput(event.target.files[0]);
  }

  render(){
    return(
    <div>
      <div>
        <h4>Audio File Upload</h4>

        <form>
          <div className="inputContainer">
            <label>
              <input title=" " type="file" className="fileUpload" onChange = {this.handleInput}/>
            </label>
          </div>
          <br/>
          <button type="button" className="fileSubmit" onClick = {this.props.handleSubmit}>Upload</button>
        </form>
      </div>
    </div>
    );
  }
}

function OralInput(props){ // Component for Recording MP3 Voice files on site
  if(props.value.isBlocked === true){
    return(
      <div>
        <h4>Record Voice</h4>

        <form>
          <button type="button" className="fileSubmit" onClick = {props.askAudioPerms}> Enable Microphone Access </button>
        </form>
      </div>
    )
  } else{
    return(
      <div>
        <h4>Record Voice</h4>

        <form>
          <button type="button" className="record" onClick={props.startRecording} disabled={props.value.isRecording}> Start Recording </button>
          <button type="button" className="stop" onClick={props.stopRecording} disabled={!props.value.isRecording}> Stop Recording </button>
        </form>
      </div>
    )
  }
}

function TextOutput(props){
  return(
    <div>
      <h4>
        Transcribed Text
      </h4>
      <textarea rows="10" disabled value={props.value}>
      </textarea>
    </div>
  )
}

// ========================================

ReactDOM.render(
  <Page />,
  document.getElementById('root')
);
