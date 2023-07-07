let APP_ID = '7643fac81cc043caa99aeea2196962a5';

let token = null;
let uid = String(Math.floor(Math.random()*10000));


let client;
let channel;

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')


if(!roomId){
    window.location='lobby.html'
}


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


    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid,token})

    channel = client.createChannel(roomId)
    await channel.join()

    channel.on('MemberJoined', handleUserJoined)
    channel.on('MemberLeft', handleUserLeft)
    client.on('MessageFromPeer',handleMessageFromPeer)



    //this enables the permission for audio and video
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:true})
    document.getElementById('user-1').srcObject = localStream;

    //create the offer immediately once we load our page
    //createOffer()

}


let handleUserLeft = async(MemberID)=>{
    document.getElementById('user-2').style.display = 'none';
}


let handleMessageFromPeer = async(message, MemberID)=>{
    message = JSON.parse(message.text)

    if(message.type=='offer'){
        createAnswer(MemberID,message.offer)
    }

    if(message.type=='answer'){
        addAnswer(message.answer)
    }

    if(message.type=='candidate'){
        if(peerConnection){
            peerConnection.addIceCandidate(message.candidate)
        }
    }
    
}



let handleUserJoined = async(MemberID)=>{
    console.log('A new user joined the channel : ',MemberID);
    createOffer(MemberID)
}



let createPeerConnection = async(MemberID)=>{


    // this will help to create the peer connection and stores all the info b/w us and the remote device
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;
    document.getElementById('user-2').style.display = 'block';


    if(!localStream){
        localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
        document.getElementById('user-1').srcObject = localStream;
    }


    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track,localStream)
    });


    peerConnection.ontrack = (event)=>{
        event.streams[0].getTracks().forEach((track)=>{
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async(event)=>{
        if(event.candidate){
            client.sendMessageToPeer({text:JSON.stringify({'type':'candidate','candidate':event.candidate})},MemberID)
        }
    }



}



let createOffer = async(MemberID) =>{

    await createPeerConnection(MemberID)

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})},MemberID)
}


let createAnswer = async(MemberID, offer)=>{
    
    await createPeerConnection(MemberID)

    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    client.sendMessageToPeer({text:JSON.stringify({'type':'answer','answer':answer})},MemberID)

}


let addAnswer = async(answer) =>{
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer)
    }
}

let leaveChannel = async() =>{
    await channel.leave()
    await client.logout()
}


let toggleCamera = async() =>{
    let videoTrack = localStream.getTrack().find(track => track.kind === 'video')

    if(videoTrack.enabled){
        videoTrack.enabled = false
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255,80,80)'
    }else{
        videoTrack.enabled = true
        document.getElementById('camera-btn').style.backgroundColor = '#bdc3c7'
    
    }
}



window.addEventListener('beforeunload',leaveChannel)

init();