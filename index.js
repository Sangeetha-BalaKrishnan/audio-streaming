import React, { useState } from "react"
import Layout from "../components/layout"
import { ReactMic } from 'react-mic';

// Declaring required global variables

let audio;
let interval;
const audioChunks = [];
let audioBlob;

// Seperated styles

const styles = {
  button: {
    padding: '20px',
    borderRadius: '20px'
  },
  buttonBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  audio: {
    backgroundColor: 'gray',
    display: 'flex',
    flexDirection: 'column'
  },
  twilioBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: '20px'
  },
}

// Main function is IntexPage, which is exported at last.

const IndexPage = () => {

  // ReactJs has state properties, so we can use to set values
  const [isRecording, setIsRecording] = useState(false);
  const [size, setSize] = useState(0);

  // Whwn start recording this function calls and executes interval to send datas to server
  const record = () => {
    interval = setInterval(() => {
      send()
    }, 5000);
    setIsRecording(true);
  }

// When recording this function give chunk datas
  const onData = async (e) => {
    await audioChunks.push(e);
  }

  // this function executes every 5 secs after record starts and updates audio size
  const send = async () => {
    audioBlob = new Blob(audioChunks);
    let temp = audioBlob.size;
    setSize(bytesToSize(temp));
    const options = {
      method: 'POST',
      body: JSON.stringify(audioBlob),
      mode: 'no-cors',
      headers: { 'content-type': '*' }
    }
    const response = await fetch('http://localhost:8080/post', options);
  }

 // When audio record stop, this function will give audio file
  const onStop = async () => {
    const audioUrl = URL.createObjectURL(audioBlob);
    audio = new Audio(audioUrl);
  }

// Play the current audio
  const play = () => {
    if (audio) audio.play();
  }

  // This function is used to convert audio size in bytes into readable size
  function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  // This function is called, when we press stop
  const pause = () => {
    clearInterval(interval);
    setIsRecording(false);
  }

  // This is the function to run twilio function
  const twilio = () => {
    fetch('http://localhost:8080/call', {
      method: 'GET',
    }).then(data => console.log(data)).catch(err => console.log(err))
    record();
    onData ();
    send();
  }

  


  return (
    <Layout>
      <div style={styles.audio}>
        <h4>Browser-audio</h4>
        <ReactMic
          record={isRecording}
          className="sound-wave"
          onStop={onStop}
          onData={onData}
          strokeColor="#000000"
          backgroundColor="#FF4081"
        />
        <br />

        <div style={styles.buttonBox}>

          <button style={styles.button} onClick={record} >Rec</button>

          <button style={styles.button} onClick={pause}>Stop</button>

          <button style={styles.button} onClick={play}>play</button>

          <button style={styles.button} disabled>{size}</button>

        </div>
      </div>
      <br />

      <div style={styles.audio}>
        <h4>Twilio-voice</h4>
        <div style={styles.twilioBox}>
          <input placeholder='Enter number...'></input>
          <button onClick={twilio}>call</button>
        </div>
      </div>

    </Layout>
  )
}
export default IndexPage
