# XtERVGWebDemo
## 简介
本项目主要为XtERVG前端代码，搭配飞流边缘AI视频网关即可完美解决视频远程传输中的卡顿、延迟、花屏等问题,同时实现了AI标注视频流的超低延迟远程实时播放。

## 架构说明
![八1](./image/八1.png)
1.嵌入式xftp流媒体播放器由浏览器侧运行的JS Agent与客户机插件构成；

2.客户机插件负责与云端的XTMS（xttp信令服务器）、XTFS（xftp流媒体服务器）连接通信；

3.xttp协议为信令协议负责在云端与浏览器间传输控制信令（诸如：传输流媒体标识信息、云端通知信息等）；

4.xftp协议为流媒体传输协议负责接收来自云端的流媒体数据；

5.JS Agent负责接收来自网页端的用户操作指令（诸如开启播放、关闭播放等）；

6.JS Agent通过WebSocket与客户机插件进行信令通信（诸如：登录xtms服务、开启远程直播、启动流媒体下载、结束WebRTC媒体流信息、SDP交换等）；

7.JS Agent通过WebRTC与客户机插件进行媒体流通信，获取媒体流并渲染至浏览器的窗口。

## 时序图
![八2](./image/八2.png)
## 代码说明
1.打开网页webSocket与本地插件连接 (WebSocket地址:ws://localhost:1234 )。
```bash
// 创建websocket连接
  const socket = new SocketService('ws://localhost:1234/',onOpen,onMessage,onClose)
  ws = socket.getWebSocket()
```
2.如果webSocket没有连接或连接失败，网页提示用户启动插件，点击启动插件按钮，通过浏览器将本地插件启动，重新加载网页建立webSocket连接。

![八3](./image/八3.jpg)

3.如果webSocket是连接状态，输入账号、密码、网关标识、通道号。

![八4](./image/八4.jpg)

（1）点击观看，通过webSocket主动发送 {type:7,data:{"xttp_uuid":账号,"xttp_pwd": 密码}} 消息给插件，在发送消息{type:9,data:{}}，通知插件准备直播。
```bash
{
  "type": 7,
  "data": {
    "xttp_uuid": "",
    "xttp_pwd": ""
  }
}

{
  "type": 9,
  "data": {}
}
```
（2）发送{type:9,data:{}}消息后，等待插件消息。当收到插件{type:10}，发送{ type:1,data:SDP数据,channel_no:网关标识+通道号}，将SDP数据和通道号发送给插件。
```bash
{
  "data": {},
  "type": 10
}

{
  "data": {
    "answer": 1
  },
  "type": 6
}

{
  "type": 1,
  "data":SDP,
  "channel_no": "43c50b70203d1d7c6e341bc027b4bc77001"
}
```
（3）等待插件消息，当收到{type:2,data:SDP应答}，将收到的SDP应答（Answer）设置为当前WebRTC连接的远程描述，从而完成媒体流连接的建立。
```bash
{
  "data": SDP,
  "type": 2
}
```
4.补充内容：

（1）{"type":4,"data":{width:原视频宽度,height:原视频高度}}，可以与当前页面播放器宽高比较，将标注信息等比例放大。
```bash
{
  "data": {
    "height": 1080,
    "width": 1920
  },
  "type": 4
}
```
（2）{"type":3,"data":视频标注信息}，视频标注信息。
- width:视频宽度，
- height：视频高度，
- annotation_item_arr:视频标注信息数据(xmin_1m，ymin_1m标注信息左上角坐标，	xmax_1m，ymax_1m标注信息右下角坐标,id:标注对应的内容id)
```bash
{"data":{"anno_ts":173766,"annotation_item_arr":[{"conf_level_1m":686440,"id":2,"xmax_1m":569847104,"xmin_1m":412274272,"ymax_1m":1079401984,"ymin_1m":964176896},{"conf_level_1m":663714,"id":2,"xmax_1m":1094089856,"xmin_1m":964092224,"ymax_1m":576731840,"ymin_1m":470370144},{"conf_level_1m":646576,"id":2,"xmax_1m":1000150528,"xmin_1m":866213568,"ymax_1m":678833728,"ymin_1m":545881664},{"conf_level_1m":597909,"id":2,"xmax_1m":1351361664,"xmin_1m":1205606784,"ymax_1m":945765952,"ymin_1m":843835968},{"conf_level_1m":590103,"id":2,"xmax_1m":1781665024,"xmin_1m":1659546112,"ymax_1m":501732224,"ymin_1m":404234080},{"conf_level_1m":572435,"id":7,"xmax_1m":999240320,"xmin_1m":857424768,"ymax_1m":679345728,"ymin_1m":548609472},{"conf_level_1m":548956,"id":2,"xmax_1m":1211665024,"xmin_1m":1077728128,"ymax_1m":456390944,"ymin_1m":334518176},{"conf_level_1m":548589,"id":2,"xmax_1m":734089792,"xmin_1m":596213568,"ymax_1m":239743792,"ymin_1m":153324928},{"conf_level_1m":548241,"id":2,"xmax_1m":1284393216,"xmin_1m":1174092288,"ymax_1m":386675072,"ymin_1m":286960992},{"conf_level_1m":540958,"id":2,"xmax_1m":798029120,"xmin_1m":668031552,"ymax_1m":164232256,"ymin_1m":53438860},{"conf_level_1m":536680,"id":7,"xmax_1m":663065408,"xmin_1m":405637184,"ymax_1m":1079283200,"ymin_1m":809244416},{"conf_level_1m":531469,"id":7,"xmax_1m":1092575232,"xmin_1m":966516992,"ymax_1m":577243776,"ymin_1m":470882112},{"conf_level_1m":526462,"id":7,"xmax_1m":1786514560,"xmin_1m":1660456320,"ymax_1m":503096192,"ymin_1m":405597984},{"conf_level_1m":522815,"id":2,"xmax_1m":666211200,"xmin_1m":492881056,"ymax_1m":982583744,"ymin_1m":807530176},{"conf_level_1m":520910,"id":2,"xmax_1m":1344393216,"xmin_1m":1234092288,"ymax_1m":308947648,"ymin_1m":198154288},{"conf_level_1m":508335,"id":7,"xmax_1m":1356211200,"xmin_1m":1206516992,"ymax_1m":948493760,"ymin_1m":844348032},{"conf_level_1m":502188,"id":7,"xmax_1m":567422336,"xmin_1m":405910176,"ymax_1m":1079062016,"ymin_1m":968268672},{"conf_level_1m":488414,"id":7,"xmax_1m":662271872,"xmin_1m":492881056,"ymax_1m":983947712,"ymin_1m":806678208},{"conf_level_1m":478413,"id":2,"xmax_1m":1284393216,"xmin_1m":1170152960,"ymax_1m":453663072,"ymin_1m":285257120},{"conf_level_1m":477324,"id":2,"xmax_1m":603786432,"xmin_1m":469849504,"ymax_1m":376959648,"ymin_1m":277245600},{"conf_level_1m":455104,"id":7,"xmax_1m":899847104,"xmin_1m":769849472,"ymax_1m":765936576,"ymin_1m":628552768},{"conf_level_1m":452223,"id":2,"xmax_1m":475907776,"xmin_1m":334092224,"ymax_1m":469686144,"ymin_1m":325654720}],"annotion_item_len":22,"height":1080,"width":1920},"type":3}
```
（3）{data: {version: "1.0.4"},"type":11}，插件版本号,可以与服务器版的插件版本比较，提示用户升级。
```bash
{
  "data": {
    "version": "1.0.7"
  },
  "type": 11
}
```
（4）切换通道/关闭网页，发送{"type":8,"data":{}}，通知插件关闭视频。
```bash
{
  "type": 8,
  "data": {}
}
```
（5）插件询问浏览器的登录状态 {"type":12,"data":{}}。
```bash
{
  "type": 12,
  "data": {}
}
```
（6）浏览器给插件通知xttp重登或退出{"type":13,"data":{"need_relogin": 0 }} ，0:退出，1：重登。
```bash
{
  "type":13,
  "data":{
    "need_relogin": 0 
  }
}
```
## 附录
1.WebSocket信令格式说明：

（1）信令为json格式；

（2）type代表具体的信令类型。

2.WebSocket具体信令格式如下：

（1）JS Agent 给客户机插件的 offer SDP（type: 1）

 **完整指令：**
```bash
    {
        "type": 1,
        "data": "offer sdp",
        "channel_no": "1d0****001"
    }
```
 **数据字段说明：**
-	data: offer SDP 的具体内容。
-	channel_no: 流媒体通道号。

（2）客户机插件给JS Agent的answer sdp(type：2)

 **完整指令：**
```bash
    {
        "type": 2,
        "data": "answer sdp"
    }
```
 **数据字段说明：**

-	data：answer sdp的具体内容。

（3）客户机插件给JS Agent的标注数据(type：3)
 
 **完整指令：**
```bash
 {
        "type": 3,
        "data": {
            "anno_ts": 0,
            "annotation_item_arr": [
                {
                    "conf_level_1m": 747859,
                    "id": 0,
                    "xmax_1m": 902554560,
                    "xmin_1m": 664839232,
                    "ymax_1m": 505652640,
                    "ymin_1m": 352369760
                },
                {
                    "conf_level_1m": 747858,
                    "id": 1,
                    "xmax_1m": 902554559,
                    "xmin_1m": 664839231,
                    "ymax_1m": 505652639,
                    "ymin_1m": 352369759
                }
            ],
            "annotion_item_len": 2,
            "height": 1080,
            "width": 1920
        }
    }
```
 **数据字段说明：**
-	data：标注数据
- anno_ts：时间戳
- annotation_item_arr：标注数组
- conf_level_1m：标签置信度
- id：标签id（对应具体标签类型）
- xmax_1m：标签矩形右下顶点的x坐标
- xmin_1m：标签矩形左上顶点的x坐标
- ymax_1m：标签矩形右下顶点的y坐标
- ymin_1m：标签矩形左上顶点的y坐标
- annotion_item_len：标注数组长度
- height：视频高度
- width：视频宽度

（4）客户机插件给JS Agent的视频size (type：4)
 
 **完整指令：**
```bash
    {
        "type": 4,
        "data": {
            "height": 1080,
            "width": 1920
        }
    }
```

 **数据字段说明：**

-	data：size数据
- height：视频高度
- width：视频宽度

（5）JS Agent给客户机插件的信令：询问客户机插件状态，暂时为保留指令，未启用(type：5)
 
 **完整指令：**
```bash
    {
        "type": 5,
        "data": {}
    }
```
（6）客户机插件给JS Agent的回复信令：代表插件状态(type：6)
  
 **完整指令：**

```bash
    {
        "type": 6,
        "data": {
            "answer"：1
        }
    }
```
 **数据字段说明：**

-	data：数据
- answer：0:未登录或掉线, 1：登录成功。
  
（7）JS Agent给客户机插件的账号、密码 (type：7)
 
 **完整指令：**

```bash
    {
        "type": 7,
        "data": {
            "xttp_uuid": "1d0****001",
            "xttp_pwd": "1****6"
        }
    }
```

 **数据字段说明：**

-	data：数据
- xttp_uuid：账号
- xttp_pwd：密码

（8）JS Agent给客户机插件的信令：关闭播放 (type：8)
 
 **完整指令：**

```bash
    {
        "type": 8,
        "data": {}
    }
```

（9）JS Agent给客户机插件的信令：播放视频前询问插件播放状态是否ready (type：9)
 
 **完整指令：**

```bash
   {
        "type": 9,
        "data": {}
    }
```

（10）客户机插件给JS Agent的回复播放条件已经ready (type：10)
 
 **完整指令：**

```bash
    {
        "type": 10,
        "data": {}
    }
```
（11）客户机插件给JS Agent的插件版本号 (type：11)
 
 **完整指令：**

```bash
    {
        "type": 11,
        "data": {
            "version": "1.0.0"
        }
    }   
```

 **数据字段说明：**

-	data：数据
- version：插件版本号
  
（12）客户机插件给JS Agent的信令：询问浏览器的登录状态 (type：12)
 
 **完整指令：**
```bash
    {
        "type": 12,
        "data": {
        }
    }
```
（13）客户机插件给JS Agent的插件版本号 (type：11)
 
 **完整指令：**

```bash
    {
        "type": 13,
        "data": {
            "need_relogin": 0
        }
    } 
```

 **数据字段说明：**

-	data：数据
- need_relogin：0:退出，1：重登。
  
（14）客户机插件给JS Agent的信令：通知浏览器退出登录 (type：14)
 
 **完整指令：**

```bash
    {
        "type": 14,
        "data": {
        }
    }
```
## 联系我们
**如果您在开发过程中遇到问题无法解决可以通过以下方式联系我们**

联系电话：010-64759451

微信二维码:扫码下方二维码后获取进群二维码，再长按识别二维码即可进群。

![微信二维码](./image/qrCode.jpg)
