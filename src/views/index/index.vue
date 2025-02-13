<template>
  <div class="live-box">
    <div v-if="wsIsOpen" class="video-container">
      <video class="live-video" id="liveVideo" ref="liveVideo" autoplay></video>
      <canvas id="myCanvas">
        <p>你的浏览器不支持Canvas</p>
      </canvas>
      <div class="mark-box">
        <span>查看AI标注</span>
        <el-switch
          v-model="isOPenAiAnnotation"
          active-color="#13ce66"
          inactive-color="#E2E2E3">
        </el-switch>
        <el-link v-show="isOPenAiAnnotation" @click="showDialog"><el-icon><Edit /></el-icon>设置标注</el-link>
        <span v-show="isOPenAiAnnotation">标注项：{{ selectAnnotationName }}</span>
      </div>
    </div>
    <div v-else class="no-plugin">
      <img src="@/assets/noPlugin.png" alt="noPlugin">
      <div class="title">检测到插件未启动，可能是以下原因所致。</div>
      <div class="text">
        <span class="text1">1、插件已安装但未启动：请重启插件，启动后刷新网页即可。</span>
        <el-link type="success" @click="openPlugin">启动插件</el-link>
      </div>
      <div class="text">
        <span class="text1">2、未安装插件：请下载并安装插件，安装后重启浏览器。</span>
        <el-link type="success" @click="downLoadZip">下载插件</el-link>
      </div>
      <el-link type="success" @click="showPDF">插件安装使用说明</el-link>
    </div>
    <div class="menu-box">
      <el-input v-model="account" placeholder="请输入账号" />
      <el-input v-model="pwd" placeholder="请输入密码" />
      <el-input v-model="gatewayId" placeholder="请输入网关标识" />
      <el-input v-model="channelNo" placeholder="请输入通道号" />
      <el-button v-if="playType !== 'play'" type="primary" @click="onPlayHandler">观看</el-button>
      <el-button v-else type="primary" @click="close">关闭</el-button>
      <div class="tips">
        <p>账号及密码为飞流可靠安防视频平台时的账号密码。</p>
        <p>网关标识及通道号可在飞流可靠安防视频平台设备管理的网关管理列表及通道管理列表进行查看。</p>
      </div>
    </div>
    <el-dialog
    title="标注选择"
    v-model="dialogVisible"
    width="800px">
      <span>
        <el-checkbox-group v-model="selectAnnotation" @change="handleChecked">
          <el-checkbox v-for="item in allAnnotation" :value="item.label" :key="item.label">{{item.name}}</el-checkbox>
        </el-checkbox-group>
      </span>
    </el-dialog>
  </div>
</template> 
<script setup lang="ts">
  import {ref,onBeforeUnmount } from "vue"
  import { ElMessage } from 'element-plus'
  import { Md5 } from "ts-md5";
  import "./style/index.scss"
  import SocketService from '@/utils/socket'
  import {downloadFile} from '@/utils/index'
  import {SrsRtcPlayerAsync} from '@/utils/srs.sdk'
  import {annotationList} from './annotationList'

  const liveVideo = ref()
  //输入的账号 密码 网关标识 通道号
  const account = ref("")
  const pwd = ref("")
  const gatewayId = ref("")
  const channelNo = ref("")

  //webSocket连接标识 false失败，true成功
  const wsIsOpen = ref(false)
  //webSocket实例
  let ws:WebSocket|null = null
  //webRTC实例
  let sdk:any = null
  //video实例
  let video:any = null
  //playType
  let playType = ref('end')
  //canvas实例
  let canvas:any = null
  let ctx:any = null
  //播放器宽高
  // let video_width:string = '0px'
  // let video_height:string = '0px'
  //是否开启ai标注
  const isOPenAiAnnotation = ref(true)
  const allAnnotation:any = ref([])
  const selectAnnotation:any = ref([])
  const selectAnnotationName = ref('')
  const dialogVisible = ref(false)

  // websocket连接成功
  const onOpen = () => {
    wsIsOpen.value = true
  }
  // websocket接收到消息
  const onMessage = (e:any) => {
    const message = JSON.parse(e.data)
    receiveMsg(message)
  }
  // websocket关闭连接
  const onClose = () => {
    ws = null
    wsIsOpen.value = false
  }
  // 创建websocket连接
  const socket = new SocketService('ws://localhost:1234/',onOpen,onMessage,onClose)
  ws = socket.getWebSocket()

  // 发送消息处理
  const sendMsg = (type:number,data?:any)=>{
    let sendData:any = {}
    switch(type){
      case 1:
        sendData = {
          type:1,
          data:data,
          channel_no:gatewayId.value+channelNo.value
        }
      break;
      case 7:
        sendData = {
          type:7,
          data:{
              "xttp_uuid": account.value,
              "xttp_pwd": Md5.hashStr(pwd.value)
          }
        }
      break;
      case 8:
      sendData = {
          type:8,
          data:{}
        }
      break;
      case 9:
        sendData = {
          type:9,
          data:{}
        }
      break;
    }
    ws&&ws.send(JSON.stringify(sendData))
  }
  // 接受消息处理
  const receiveMsg = (message:any)=>{
    switch(message.type){
      case 2:
        sdk.setRemoteDescription(message.data)
      break;
      case 3:
        drawAnnotations(message.data)
      break;
      case 10:
        initVideoPlayer()
      break;
    }
  }
  // 初始化视频播放器
  const initVideoPlayer = ()=>{
    srsPlayer()
    initVideoCanvas()
    window.addEventListener('resize', changeVideoCanvasSize)
  }
  //创建SRS连接，交换SDP
  const srsPlayer = ()=>{
    sdk = new SrsRtcPlayerAsync();
    liveVideo.value.srcObject = sdk.stream
    sdk.createOfferAndModifySdp('webrtc://127.0.0.1:1988/live/livestream').then((sdp:any) => {
      sendMsg(1,sdp)
    }).catch((error:any) => {
      console.error('sdkError', error);
    });
  }
  //初始化播放器和canvas
  const initVideoCanvas = ()=>{
    //当视频可以播放，获取video宽高，给canvas画布设置
    video = document.getElementById('liveVideo');
    canvas = document.getElementById('myCanvas')
    ctx = canvas.getContext('2d')
    video.addEventListener('canplay',(_e:any)=>{
      playType.value = 'canplay'
    })
    // 当视频播放时开始绘制标注
    video.addEventListener('play', () =>{
      playType.value = 'play'
      console.log("开始");
      // video_width = video.clientWidth + 'px'
      // video_height = video.clientHeight + 'px'
      changeVideoCanvasSize()
    });
    video.addEventListener('pause', () => { //暂停
      playType.value = 'pause'
      console.log("暂停");
    });
    video.addEventListener('ended', () =>{
      playType.value = 'ended'
      console.log("结束");
      clearAnnotations()
    })
  }
  //将视频宽高赋值给画布
  const changeVideoCanvasSize = ()=>{
    canvas.width = video.clientWidth
    canvas.height = video.clientHeight
  }
  //清除canvas标记
  const clearAnnotations = ()=>{
    // 清除之前的标注
    if(ctx) {
      ctx.clearRect(0, 0, canvas.width,canvas.height);
    }
  }
  //画标注信息
  const drawAnnotations = (message:any,isClear:boolean = true)=>{
    if(isClear){
      clearAnnotations()
    }
    if(!isOPenAiAnnotation.value){
      return
    }
    //防止一个人多个标签看 因为第二个页面还没初始化canvas画布
    if(!ctx){
      return
    }
    // 绘制新的标注 绘制一个红色的矩形框
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1 // 边框宽度
    const w_percentage = canvas.width/message.width // 计算比例
    const h_percentage = canvas.height/message.height // 计算比例
    const filterMessage = message.annotation_item_arr.filter((item:any) => {
      if(selectAnnotation.value.includes(allAnnotation.value[item.id].label)){
        return item
      }
    })
    const annotation_item_arr = filterMessage.map((item:any) => {
        item.xmax = item.xmax_1m/1000000
        item.xmin = item.xmin_1m/1000000
        item.ymax = item.ymax_1m/1000000
        item.ymin = item.ymin_1m/1000000
        item.x_width = (item.xmax - item.xmin) * w_percentage
        item.y_height = (item.ymax - item.ymin) * h_percentage
        item.x = item.xmin * w_percentage
        item.y = item.ymin * h_percentage
        item.type_name = allAnnotation.value[item.id].name
        return item
      }
    )
    annotation_item_arr.forEach((item:any)=>{
      // 绘制文本
      ctx.beginPath();
      ctx.rect(item.x, item.y, item.x_width, item.y_height);
      ctx.stroke();
      // 在边框内绘制文本，
      ctx.font = '16px Arial'; // 设置字体大小和字体，可以根据需要调整
      ctx.fillStyle = 'red'; // 设置文本颜色
      ctx.fillText(item.type_name, item.x + 5, item.y + 20)
    })
  }
  //观看
  const onPlayHandler = ()=>{
    if(!wsIsOpen.value){
      ElMessage.error("插件未启动")
      return
    }
    if(account.value == "" || pwd.value == "" || gatewayId.value == "" || channelNo.value == ""){
      ElMessage.error("请填写所有内容")
      return
    }
    close()
    sendMsg(7)
    sendMsg(9)
  }
  //初始化标签
  const initAnnotation = ()=>{
    allAnnotation.value = annotationList
    allAnnotation.value.forEach((item:any,i:number)=>{
      if(i == 0){
        selectAnnotationName.value = item.name 
      }else if(i<5){
        selectAnnotationName.value += ',' + item.name 
      }
      if(i == 5){
        selectAnnotationName.value += '...'
      }
    })
    selectAnnotation.value = allAnnotation.value.map((item:any)=>{return item.label})
  }
  initAnnotation()
  //显示标注
  const showDialog = ()=>{
    dialogVisible.value = true

  }
  //选择标注方法
  const handleChecked = (value:any)=>{
    selectAnnotation.value = value
    selectAnnotationName.value = ''
    // let index:number
    // value.length < 6?index = value.length - 1:index = 5
    if(value.length < 6){
      value.forEach((item:any,i:number)=>{
        const temp = allAnnotation.value.find((i:any)=>i.label == item)
        if(i == 0){
          selectAnnotationName.value = temp.name
        }else{
          selectAnnotationName.value += ',' + temp.name 
        }
      })
    }else{
      for(let i = 0;i<6;i++){
        if(i == 5){
          selectAnnotationName.value += '...'
        }else{
          const temp = allAnnotation.value.find((j:any)=>j.label == value[i])
          selectAnnotationName.value += temp.name + ','
        }
      }
    }
  }
  //关闭视频，清空canvas内容
  const close = ()=>{
    sendMsg(8)
    if (sdk != null) {
      console.log('关闭视频流');
      sdk.close();
      sdk = null;
    }
    window.removeEventListener('resize',changeVideoCanvasSize)
    clearAnnotations()
    playType.value = 'cancel'
  }
  onBeforeUnmount(()=>{
    close()
    console.log('关闭1');
  })
  // 打开插件
  const openPlugin = ()=>{
    window.location.href="xftpplayer://start"
    window.location.reload()
  }
  // 下载插件
  const downLoadZip = ()=>{
    downloadFile('https://monitor.zhilianxi.com/d/xplayer_setup_1.0.7.zip')
  }
  // 插件使用说明
  const showPDF = ()=>{
    window.open(`https://monitor.zhilianxi.com/d/plugin_info.pdf`,'_blank')
  }
</script>
