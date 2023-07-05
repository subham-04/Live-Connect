let localStream; // this is my device's camera data and microphone data stream
let remoteStream; // this is the remote device's camera data and microphone data stream
let peerConnection; 

let init = async() =>{

    //this enables the permission for audio and video
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
    document.getElementById('user-1').srcObject = localStream;


}





init();