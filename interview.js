const {
  ClientReadableStream,
  Status,
  StatusCode
} = require('grpc-web');
const {
  OperatorConnectRequest,
  Message,
  AnswerRequest,
  OfferRequest,
  GetDetailsRequest,
  AddIceCandidateRequest
} = require('./pigeon_pb.js');
const {
  operatorClient
} = require('./pigeon_grpc_web_pb.js');
const environment = {
    p2pSource: {
      urls: ['turn:turn.rocos.io:443'],
      username: 'turn-user',
      credential: 'i8NjnZ0fw7r@hm7U'
    },
    api: {
      url: 'https://dev-api.rocos.io', // DEV  },}
      const thisObject = {};
      const videoServer = 'https://video.rocos.io:8089/janus';
      // connect to signaling 
      serverthisObject.operatorClient = new operatorClient(environment.api.url, {}, {});thisObject.log = function(text) {
        console.log(text);
      }
      // 
      thisObject.videoCommand = 'videotestsrc ! video/x-raw,format=I420 '
      // + '! x264enc bframes=0 speed-preset=veryfast key-int-max=60 '
      // + '! video/x-h264,stream-format=byte-stream';

      const reloadButton = document.getElementById('reload');
      const videoIdInput = document.getElementById('videoId');
      const videoCommandInput = document.getElementById('videoCommand');
      videoIdInput.value = '/turtle-test-554172/tb-sim/videotest';
      videoCommandInput.value = 'videotestsrc ! video/x-raw,format=I420 ! timeoverlay draw-shadow=false draw-outline=false deltay=20 font-desc="Sans, 42" color=0xFF000000 ! x264enc bframes=0 speed-preset=veryfast key-int-max=60 ! video/x-h264,stream-format=byte-stream';thisObject.videoId = document.getElementById('videoId').value;reloadButton.onclick = reloadVideo;

      function reloadVideo() {
        thisObject.videoId = videoIdInput.value;
        thisObject.videoCommand = videoCommandInput.value;
        thisObject.stopStream();
        thisObject.startStream();
      }
      thisObject.videoCommand = "videotestsrc ! video/x-raw,format=I420 ! timeoverlay draw-shadow=false draw-outline=false deltay=20 font-desc=\"Sans, 42\" color=0xFF000000 ! x264enc bframes=0 speed-preset=veryfast key-int-max=60 ! video/x-h264,stream-format=byte-stream";
      thisObject.createAndSendOffer = function(offerOptions) {
        // log(`Creating Offer...`);    
        offerOptions = offerOptions || {
          iceRestart: false
        };
        thisObject.peerConnection.createOffer(offerOptions).then((offer) => {
          thisObject.peerConnection.setLocalDescription(offer).then(() => {
            thisObject.sendOffer(thisObject.peerConnection.localDescription);
          });
        }).catch(thisObject.log);
      }
      thisObject.sendOffer = function(offer) {
        const sdp = btoa(JSON.stringify(offer));
        const videoFormat = 'H264';
        const request = new OfferRequest();
        request.setSdp(sdp);
        request.setVideocommand(thisObject.videoCommand + ' ! appsink name=appsink');
        request.setVideoid(thisObject.videoId);
        request.setClientid('');
        request.setVideoformat(videoFormat);
        thisObject.operatorClient.offer(request, {}, (err, response) => {
          if (err) {
            thisObject.log(err);
          }
          if (response) {
            thisObject.log(response);
          }
        });
      }
      thisObject.retry = function() {
        if (!thisObject.retryTimer) {
          return;
        }
        if (!thisObject._videoStreaming || thisObject.peerConnection === null || thisObject.peerConnection.connectionState === 'connected') {
          clearInterval(thisObject.retryTimer);
          thisObject.retryTimer = null;
          return;
        }
        thisObject.createAndSendOffer({
          iceRestart: true
        });
      }
      thisObject._videoSourceStatus = {};thisObject.updateStats = function(c) {
        let diff = 1000 / thisObject.turbo;
        if (thisObject.lastBitrateRecordTime) {
          const now = window.performance.now();
          diff = now - thisObject.lastBitrateRecordTime;
        }
        thisObject._videoSourceStatus.realInterval = diff;
        thisObject.lastBitrateRecordTime = window.performance.now();
        if (c.peerConnection) {
          c.peerConnection.getStats(null).then((stats) => {
            const statsResult = parseStats(stats);
            thisObject._videoSourceStatus.webrtcRoundTripTimeMs = statsResult.bandwidth.currentRoundTripTime * 1000;
            thisObject._videoSourceStatus.webrtcPeerConnectionStatus = (thisObject.peerConnection).connectionState === 'connected';
            thisObject._videoSourceStatus.webrtcIceStateConnected = ['connected', 'completed'].indexOf(thisObject.peerConnection.iceConnectionState) > 0;
            thisObject._videoSourceStatus.webrtcIceConnectionState = thisObject.peerConnection.iceConnectionState[0].toUpperCase() + thisObject.peerConnection.iceConnectionState.substr(1);
            if (statsResult.video.packetsReceived > 0) {
              thisObject.log(statsResult.video.packetsReceived);
              thisObject._videoSourceStatus.webrtcPacketLossPercent = +(statsResult.video.packetsLost / statsResult.video.packetsReceived * 100).toFixed(2);
            }
            if ((thisObject.peerConnection).getTransceivers().length > 0) {
              const transceiver = (thisObject.peerConnection).getTransceivers()[0];
              thisObject._videoSourceStatus.webrtcStreamStarted = !transceiver.stopped;
            } else {
              thisObject._videoSourceStatus.webrtcStreamStarted = false;
            }
            thisObject._videoSourceStatus.webrtcVideoIn = statsResult.video.recv.tracks.length > 0;
            if (thisObject.webRtcStats && statsResult.video.bytesReceived && thisObject.webRtcStats.video.bytesReceived) {
              if (thisObject.webRtcStats.video.bytesReceived > statsResult.video.bytesReceived) {
                thisObject.webRtcStats.video.bytesReceived = statsResult.video.bytesReceived;
              } // multiply to turbo because we may changed the update rate          
              const extraBytesReceived = (statsResult.video.bytesReceived - thisObject.webRtcStats.video.bytesReceived);
              const bytesPerSecond = extraBytesReceived / thisObject._videoSourceStatus.realInterval * 1000;
              const kbitsPerSecond = bytesPerSecond / 128;
              thisObject.bitrateKbps = kbitsPerSecond;
              thisObject._videoSourceStatus.webrtcBitrate = Math.floor(thisObject.bitrateKbps);
            } else {
              thisObject._videoSourceStatus.webrtcBitrate = '0';
            }
            if (statsResult.video && statsResult.video.recv && (statsResult.video.recv.framesDropped || statsResult.video.recv.framesDropped === 0)) {
              thisObject._videoSourceStatus.webrtcFramesDropped = statsResult.video.recv.framesDropped;
            }
            if (statsResult.video && statsResult.video.recv && (statsResult.video.recv.framesDecoded || statsResult.video.recv.framesDecoded === 0)) {
              thisObject._videoSourceStatus.webrtcFramesDecoded = statsResult.video.recv.framesDecoded;
            }
            if (statsResult.video && statsResult.video.recv && statsResult.video.recv.framesReceived || statsResult.video.recv.framesReceived === 0) {
              thisObject._videoSourceStatus.webrtcFramesReceived = statsResult.video.recv.framesReceived;
            }
            thisObject.webRtcStats = statsResult;
          });
        }
      }
      thisObject.setupPeerConnection = function() {
        thisObject.peerConnection = new RTCPeerConnection({
          iceServers: [environment.p2pSource]
        });
        thisObject.peerConnection.ontrack = (e) => {
            // tslint:disable-next-line: max-line-length    
            thisObject.log(`PeerConnection received a streams containing ${e.streams[0].getAudioTracks().length} audio tracks(s) and ${e.streams[0].getVideoTracks().length} video tracks(s)`);
            // this.log(JSON.stringify(e.stream[0], null, 2));    
            const remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.addEventListener('loadedmetadata', function() {
              thisObject.log('Remote video videoWidth: ' + this.videoWidth + 'px,  videoHeight: ' + this.videoHeight + 'px');
            });
            remoteVideo.onresize = function() {
              thisObject.log('Remote video size changed to ' + remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight);
              // We'll use the first onsize callback as an indication that video has started      // playing out.      
              // if (startTime) {      //   var elapsedTime = window.performance.now() - startTime;     
              //   thisObject.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');      
              //   startTime = null;      // }    };    remoteVideo.srcObject = e.streams[0];    
              // this.remoteVideoElement.nativeElement.srcObject = stream;    
              // thisObject.stream.next(e.streams[0]);  };  
              thisObject.peerConnection.onsignalingstatechange = () => {
                if (thisObject.peerConnection) {
                  thisObject.log(`PeerConnection signaling state changed to '${thisObject.peerConnection.signalingState}'`);
                }
              };
              thisObject.peerConnection.oniceconnectionstatechange = () => {
                if (thisObject.peerConnection) {
                  thisObject.log(`PeerConnection ice connection state changed to '${thisObject.peerConnection.iceConnectionState}'`);
                }
              };
              thisObject.peerConnection.onicegatheringstatechange = () => {
                if (thisObject.peerConnection) {
                  thisObject.log(`PeerConnection ice gathering state changed to '${thisObject.peerConnection.iceGatheringState}'`);
                }
              };
              thisObject.peerConnection.onicecandidate = event => {
                if (event.candidate) {
                  const request = new AddIceCandidateRequest();
                  request.setVideoid(thisObject.videoId);
                  request.setCandidate(event.candidate.candidate);
                  setTimeout(() => {
                    thisObject.operatorClient.addIceCandidate(request, {}, (err, response) => {
                      if (err) {
                        thisObject.log(err);
                      }
                      if (response) {
                        thisObject.log(response);
                      }
                    });
                  }, 5000);
                } else {
                  // All candidates received    
                }
              };
              thisObject.peerConnection.onconnectionstatechange = _ => {
                // "new" | "connecting" | "connected" | "disconnected" | "failed" | "closed";    
                if (thisObject.peerConnection == null) {
                  return;
                }
                const connectionState = thisObject.peerConnection.connectionState;
                switch (connectionState) {
                  case 'failed':
                  case 'disconnected':
                    thisObject.message = `${connectionState}: retrying...`;
                    if (thisObject.retryTimer) {
                      return;
                    }
                    thisObject.retryTimer = setInterval(() => thisObject.retry(), 10000);
                    break;
                  case 'connected':
                    thisObject.message = null;
                    break;
                  default:
                    thisObject.message = connectionState;
                }
              };
              thisObject.peerConnection.addTransceiver('video', {
                'direction': 'recvonly'
              });
              thisObject.createAndSendOffer(null);
              // if (thisObject.timer) {  
              //   clearInterval(thisObject.timer);  
              // }  
              thisObject.turbo = 1;
              thisObject.timer = setInterval(() => thisObject.updateStats(thisObject), 1000 / thisObject.turbo);
            }
            thisObject.videoId = '/turtle-test-554172/tb-sim/videotest';
            thisObject.stopStream = function() {
              thisObject.watching = false;
              if (thisObject.videoMessageStream) {
                thisObject.videoMessageStream.cancel();
              } // thisObject.stopInternal();    
              thisObject.message = '';
            }
            thisObject.bootHandler = function() {
              if (!thisObject.watching) {
                return;
              }
              thisObject.message = 'Another operator has taken over the connection.';
              // thisObject.stopInternal();  }  thisObject.answerHandler = function (answerRequest) {    
              if (!thisObject.watching) {
                return;
              }
              const remoteDescription = JSON.parse(atob(answerRequest.sdp));
              if (thisObject.peerConnection) {
                thisObject.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteDescription)).then(() => {
                  // will not be called immediately if a connection is already underway          
                  // log('Finished setRemoteDescription()');        })        .catch(err => {          
                  thisObject.log(err);
                });
              }
            }
            thisObject.startWatching = function() {
              // connect as an operator (disconnects others)...    
              const request = new OperatorConnectRequest();
              request.setVideoid(thisObject.videoId);
              thisObject.videoMessageStream = thisObject.operatorClient.connect(request);
              thisObject.log('Connected. Waiting for camera...');
              thisObject.message = 'Waiting for robot to connect...';
              // thisObject.videoServerSuccess.next(true);    
              thisObject.watching = true;
              // thisObject.updateVideoStreaming(true);    
              thisObject.videoMessageStream.on('error', (err) => {
                thisObject.log(`Signaling server disconnection`);
                thisObject.stopStream();
                thisObject.message = 'Disconnected from network';
              });
              thisObject.videoMessageStream.on('status', (status) => {
                thisObject.log(`Status code: ${status.code}`);
                if (status.code === StatusCode.RESOURCE_EXHAUSTED) {
                  thisObject.bootHandler();
                }
              });
              thisObject.videoMessageStream.on('data', (r) => {
                const response = r;
                const messageType = response.getMessagetype();
                thisObject.log(`Received '${messageType}' message`);
                switch (messageType) {
                  case 'camera-connected':
                    thisObject.log('Camera connected');
                    thisObject.message = '';
                    thisObject.setupPeerConnection();
                    break;
                  case 'answer':
                    const payload = response.getPayload();
                    const answer = JSON.parse(payload);
                    thisObject.answerHandler(answer);
                    break;
                }
              });
            }
            thisObject.startStream = function() {
              const cameraStatusRequest = new GetDetailsRequest();
              cameraStatusRequest.setVideoid(thisObject.videoId);
              thisObject.operatorClient.get(cameraStatusRequest, {}, (_, response) => {
                const operators = response.getOperators();
                thisObject.startWatching();
              });
            }
            thisObject.startStream();

            function parseStats(stats) {
              const result = {
                encryption: '',
                audio: {
                  send: {
                    tracks: [],
                    codecs: [],
                    availableBandwidth: 0,
                    streams: 0,
                    framerateMean: 0,
                    bitrateMean: 0
                  },
                  recv: {
                    tracks: [],
                    codecs: [],
                    availableBandwidth: 0,
                    streams: 0,
                    framerateMean: 0,
                    bitrateMean: 0
                  },
                  bytesSent: 0,
                  bytesReceived: 0,
                  latency: 0,
                  packetsReceived: 0,
                  packetsLost: 0,
                },
                video: {
                  send: {
                    tracks: [],
                    codecs: [],
                    availableBandwidth: 0,
                    streams: 0,
                    framerateMean: 0,
                    bitrateMean: 0,
                  },
                  recv: {
                    tracks: [],
                    codecs: [],
                    availableBandwidth: 0,
                    streams: 0,
                    framerateMean: 0,
                    bitrateMean: 0,
                    frameWidth: 0,
                    frameHeight: 0,
                    framesReceived: 0,
                    framesDecoded: 0,
                    framesDropped: 0,
                  },
                  bytesSent: 0,
                  bytesReceived: 0,
                  // latency: 0,        packetsReceived: 0,        packetsLost: 0,      },      bandwidth: {        
                  systemBandwidth: 0,
                  sentPerSecond: 0,
                  encodedPerSecond: 0,
                  helper: {
                    audioBytesSent: 0,
                    videoBytestSent: 0
                  },
                  speed: 0,
                  currentRoundTripTime: 0,
                  totalRoundTripTime: 0,
                },
                connectionType: {
                  local: {
                    candidateType: '',
                    ipAddress: '',
                    port: 0,
                    priority: 0,
                    networkType: ''
                  },
                  remote: {
                    candidateType: '',
                    ipAddress: '',
                    port: 0,
                    priority: 0,
                    networkType: ''
                  }
                },
                resolutions: {
                  send: {
                    width: 0,
                    height: 0
                  },
                  recv: {
                    width: 0,
                    height: 0
                  }
                }
              };
              let candidatePair;
              stats.forEach(r => {
                if (r.type === 'candidate-pair' && r.nominated === true) {
                  candidatePair = r;
                }
              });
              if (candidatePair) {
                let localCandidate;
                stats.forEach(r => {
                  if (r.type === 'local-candidate' && r.id === candidatePair.localCandidateId) {
                    localCandidate = r;
                  }
                });
                if (localCandidate) {
                  result.connectionType.local.candidateType = localCandidate.candidateType;
                  result.connectionType.local.ipAddress = localCandidate.ip;
                  result.connectionType.local.port = localCandidate.port;
                  // result.connectionType.local.protocol = localCandidate.protocol;        
                  result.connectionType.local.priority = localCandidate.priority;
                  result.connectionType.local.networkType = localCandidate.networkType;
                }
                let remoteCandidate;
                stats.forEach(r => {
                  if (r.type === 'remote-candidate' && r.id === candidatePair.remoteCandidateId) {
                    remoteCandidate = r;
                  }
                });
                if (remoteCandidate) {
                  result.connectionType.remote.candidateType = remoteCandidate.candidateType;
                  result.connectionType.remote.ipAddress = remoteCandidate.ip;
                  result.connectionType.remote.port = remoteCandidate.port;
                  // result.connectionType.remote.protocol = remoteCandidate.protocol;        
                  result.connectionType.remote.priority = remoteCandidate.priority;
                  result.connectionType.remote.networkType = remoteCandidate.networkType;
                }
                result.bandwidth.currentRoundTripTime = candidatePair.currentRoundTripTime;
                result.bandwidth.totalRoundTripTime = candidatePair.totalRoundTripTime;
              }
              stats.forEach(videoRtp => {
                if (videoRtp.type !== 'inbound-rtp' || videoRtp.kind !== 'video') {
                  return;
                }
                result.video.recv.tracks.push(videoRtp.id);
                result.video.bytesReceived += videoRtp.bytesReceived;
                result.video.packetsReceived += videoRtp.packetsReceived;
                result.video.packetsLost += videoRtp.packetsLost;
                stats.forEach(codecReport => {
                  if (codecReport.type !== 'codec' || codecReport.id !== videoRtp.codecId) {
                    return;
                  }
                  result.video.recv.codecs.push(codecReport.mimeType);
                });
                stats.forEach(trackReport => {
                  if (trackReport.type !== 'track' || trackReport.id !== videoRtp.trackId) {
                    return;
                  }
                  result.video.recv.frameWidth = trackReport.frameWidth;
                  result.video.recv.frameHeight = trackReport.frameHeight;
                  result.video.recv.framesReceived = trackReport.framesReceived;
                  result.video.recv.framesDecoded = trackReport.framesDecoded;
                  result.video.recv.framesDropped = trackReport.framesDropped;
                });
              });
              return result;
            }--Feng
