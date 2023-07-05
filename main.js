let localStream; // this is my device's camera data and microphone data stream
let remoteStream; // this is the remote device's camera data and microphone data stream
let peerConnection; 


//its for our STUN  server --> google it
const servers = {
    //we need to pass it to the peerrtc connection
    iceServers:[
        {
            urls:[
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302'
                 ]
        }
    ]
}







let init = async() =>{

    //this enables the permission for audio and video
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    document.getElementById('user-1').srcObject = localStream;

    //create the offer immediately once we load our page
    createOffer()

}


let createOffer = async() =>{

    // this will help to create the peer connection and stores all the info b/w us and the remote device
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;


    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track,localStream)
    });


    peerConnection.ontrack = (event)=>{
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack()
        })
    }

    peerConnection.onicecandidate = async(event)=>{
        if(event.candidate){
            console.log('New ice candidate : '+event.candidate);
        }
    }




    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log('Our Offer : '+offer);
}





init();