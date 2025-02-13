export default class SocketService {
    private url: string;
    private times: number; // 重连和心跳时间
    private ws: WebSocket | null; // 和服务端连接的socket对象
    // private sendRetryCount: number; // 记录重试的次数
    // private connectRetryCount: number; // 重新连接尝试的次数
    private error_time_id: number | null; // 尝试重连计时器id
    private heart_time_id: number | null; // 心跳计时器id
    private heart_time_out_id: number | null; // 心跳超时计时器id

    constructor(
        url: string,
        onOpen: () => void,
        onMessage: (event: MessageEvent) => void,
        onClose: (event: CloseEvent) => void,
        heart_message: { behave: string } = { behave: "hb" },
        times: number = 60000
    ) {
        this.url = url;
        this.times = times;
        this.ws = null;
        // this.sendRetryCount = 0;
        // this.connectRetryCount = 0;
        this.error_time_id = null;
        this.heart_time_id = null;
        this.heart_time_out_id = null;
        this.connectWebSocket(onOpen, onMessage, onClose, heart_message);
    }

    private connectWebSocket(
        onOpen: () => void,
        onMessage: (event: MessageEvent) => void,
        onClose: (event: CloseEvent) => void,
        heart_message: { behave: string }
    ): void {
        if (!window.WebSocket) {
            alert("您的浏览器不支持WebSocket");
            return;
        }

        this.ws && this.ws.close();
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("***连接成功***");
            if (this.error_time_id !== null) clearInterval(this.error_time_id);
            if (this.heart_time_id !== null) clearTimeout(this.heart_time_id);
            if (this.heart_time_out_id !== null) clearTimeout(this.heart_time_out_id);
            // this.connectRetryCount = 0;
            this.heartCheckStart(this.ws, heart_message);
            onOpen();
        };

        this.ws.onmessage = (e) => {
            this.heartCheckReset();
            this.heartCheckStart(this.ws, heart_message);
            onMessage(e);
        };

        this.ws.onclose = (e) => {
            // this.connectRetryCount = 0;
            this.heartCheckReset();
            onClose(e);
            console.log("***连接关闭***", e);
        };

        this.ws.onerror = (e) => {
            console.log("***连接异常***", e);
        };
    }

    private heartCheckReset(): void {
        if (this.heart_time_id !== null) clearTimeout(this.heart_time_id);
        if (this.heart_time_out_id !== null) clearTimeout(this.heart_time_out_id);
        // console.log("***发送成功，清空发送心跳和心跳停止***");
    }

    private heartCheckStart(ws: WebSocket | null, message: { behave: string }): void {
        // console.log("***启动心跳***", message);
        if (ws) {
            this.heart_time_id = setTimeout(() => {
                ws.send(JSON.stringify(message));
                // console.log("***发送心跳***");
                this.heart_time_out_id = setTimeout(() => {
                    // console.log("***心跳停止***");
                    ws.close();
                }, this.times);
            }, this.times);
        }
    }

    public sendMessage(message: any): void {
        if (this.ws) {
            this.ws.send(JSON.stringify(message));
        }
    }

    public getWebSocket(): WebSocket | null {
        return this.ws;
    }
}