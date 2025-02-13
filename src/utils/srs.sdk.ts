
'use strict';
 
import $ from 'jquery'

// var datachannel:any=null;

export class SrsRtcPlayerAsync {
    private pc: any;
    private datachannel: any;
    private stream: any;
    private __internal: any;

    constructor() {
        var self = this;

        self.pc = new RTCPeerConnection(undefined);

        self.pc.onconnectionstatechange = function (_event: any) {
            // console.log("connection state change: ", self.pc.connectionState);
            // var receivers = self.pc.getReceivers();
            // console.log('receivers', receivers)
        };

        self.pc.oniceconnectionstatechange = function (_event: any) {
            // console.log("iceconnection state change: ", self.pc.iceConnectionState);
        };

        self.pc.onicecandidate = async function (_ev: any) {
            // console.log('=======>' + JSON.stringify(ev.candidate));
        };

        self.pc.ontrack = function (_event: any) {
            if (self.ontrack) {
                self.ontrack(event);
            }
        };

        self.datachannel = self.pc.createDataChannel('chat');

        self.datachannel.onopen = function (_event: any) {
            // console.log("datachannel onopen: ", event);
        };

        self.datachannel.onmessage = function (event: any) {
            console.log("receive message: ", event.data);
            $('#datachannel_recv').val(event.data);
        };

        self.datachannel.onerror = function (event: any) {
            console.log("datachannel error: ", event.data);
        };

        self.datachannel.onclose = function (_event: any) {
            console.log("datachannel close: ");
        };

        self.__internal = {
            defaultPath: '/rtc/v1/play/',
            prepareUrl: function (webrtcUrl: any) {
                var urlObject = self.__internal.parse(webrtcUrl);
                var schema = "http:";
                var port = urlObject.port || 1985;
                if (schema === 'https:') {
                    port = urlObject.port || 443;
                }

                var api = urlObject.user_query.play || self.__internal.defaultPath;
                if (api.lastIndexOf('/') !== api.length - 1) {
                    api += '/';
                }

                var apiUrl = schema + '//' + urlObject.server + ':' + port + api;
                for (var key in urlObject.user_query) {
                    if (key !== 'api' && key !== 'play') {
                        apiUrl += '&' + key + '=' + urlObject.user_query[key];
                    }
                }
                apiUrl = apiUrl.replace(api + '&', api + '?');

                var streamUrl = urlObject.url;

                return {
                    apiUrl: apiUrl,
                    streamUrl: streamUrl,
                    schema: schema,
                    urlObject: urlObject,
                    port: port,
                    tid: (new Date().getTime() * Math.random() * 100).toString(16).substr(0, 7)
                };
            },
            parse: function (url: any) {
                var a = document.createElement("a");
                a.href = url.replace("rtmp://", "http://")
                    .replace("webrtc://", "http://")
                    .replace("rtc://", "http://");

                var vhost = a.hostname;
                var app = a.pathname.substr(1, a.pathname.lastIndexOf("/") - 1);
                var stream = a.pathname.substr(a.pathname.lastIndexOf("/") + 1);

                app = app.replace("...vhost...", "?vhost=");
                if (app.indexOf("?") >= 0) {
                    var params = app.substr(app.indexOf("?"));
                    app = app.substr(0, app.indexOf("?"));

                    if (params.indexOf("vhost=") > 0) {
                        vhost = params.substr(params.indexOf("vhost=") + "vhost=".length);
                        if (vhost.indexOf("&") > 0) {
                            vhost = vhost.substr(0, vhost.indexOf("&"));
                        }
                    }
                }

                if (a.hostname === vhost) {
                    var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
                    if (re.test(a.hostname)) {
                        vhost = "__defaultVhost__";
                    }
                }

                var schema = "rtmp";
                if (url.indexOf("://") > 0) {
                    schema = url.substr(0, url.indexOf("://"));
                }

                var port:any = a.port;
                if (!port) {
                    if (schema === 'http') {
                        port = 80;
                    } else if (schema === 'https') {
                        port = 443;
                    } else if (schema === 'rtmp') {
                        port = 1935;
                    }
                }

                var ret:any = {
                    url: url,
                    schema: schema,
                    server: a.hostname,
                    port: port,
                    vhost: vhost,
                    app: app,
                    stream: stream,
                    user_query: {}
                };

                self.__internal.fill_query(a.search, ret);

                if (!ret.port) {
                    if (schema === 'webrtc' || schema === 'rtc') {
                        if (ret.user_query.schema === 'https') {
                            ret.port = 443;
                        } else if (window.location.href.indexOf('https://') === 0) {
                            ret.port = 443;
                        } else {
                            ret.port = 1985;
                        }
                    }
                }

                return ret;
            },
            fill_query: function (query_string: any, obj: any) {
                obj.user_query = {};

                if (query_string.length === 0) {
                    return;
                }

                if (query_string.indexOf("?") >= 0) {
                    query_string = query_string.split("?")[1];
                }

                var queries = query_string.split("&");
                for (var i = 0; i < queries.length; i++) {
                    var elem = queries[i];

                    var query = elem.split("=");
                    obj[query[0]] = query[1];
                    obj.user_query[query[0]] = query[1];
                }

                if (obj.domain) {
                    obj.vhost = obj.domain;
                }
            }
        };

        self.stream = new MediaStream();
    }

    public async createOfferAndModifySdp(url: any): Promise<string> {
        var self = this;
        var conf = self.__internal.prepareUrl(url);
        console.log(conf);
        self.pc.addTransceiver("audio", { direction: "recvonly" });
        self.pc.addTransceiver("video", { direction: "recvonly" });

        var offer = await self.pc.createOffer();
        var sdp = offer.sdp;

        sdp = sdp.replace(/^a=rtpmap:125.*[\r\n]*/gm, '');
        sdp = sdp.replace(/^a=rtcp-fb:125.*[\r\n]*/gm, '');
        sdp = sdp.replace(/^a=fmtp:125.*[\r\n]*/gm, 'a=rtpmap:125 H264/90000\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 nack\r\na=rtcp-fb:125 nack pli\r\na=fmtp:125 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\n');

        offer.sdp = sdp;
        await self.pc.setLocalDescription(offer);

        var sdp = offer.sdp
        return sdp
    }

    public setRemoteDescription(sdp: any) {
        var self = this;

        try {
            self.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: sdp }));
        } catch (error) {
            console.error(error);
        }
    }

    public close() {
        var self = this;

        if (self.datachannel) {
            self.datachannel.close();
            self.datachannel = null;
        }
        if (self.pc) {
            self.pc.close();
            self.pc = null;
        }
    }

    public ontrack(event: any) {
        var self = this;

        self.stream.addTrack(event.track);
    }
}