# 视频监控播放器组件文档

## 组件概述
这是一个基于Vue 3和WebRTC的视频监控播放器组件，主要功能包括：
- 实时视频播放
- AI标注显示
- WebSocket通信
- 插件管理

## 主要功能模块

### 1. 视频播放模块
- 使用WebRTC技术实现实时视频流传输
- 支持播放、暂停、结束等状态管理
- 自动调整视频和画布尺寸

### 2. AI标注模块
- 支持多种AI标注类型
- 可自定义显示的标注项
- 实时绘制标注框和文字
- 标注框随视频尺寸自动缩放

### 3. WebSocket通信模块
- 与后端服务建立WebSocket连接
- 处理不同类型的消息（SDP交换、标注信息等）
- 支持认证、播放控制等操作

### 4. 插件管理模块
- 检测插件状态
- 提供插件下载链接
- 支持插件启动和说明文档查看

## 主要技术栈
- Vue 3 (Composition API)
- TypeScript
- WebRTC (SRS)
- WebSocket
- Canvas
- Element Plus UI

## 核心方法说明

### 视频相关
- `initVideoPlayer()`: 初始化视频播放器
- `srsPlayer()`: 创建WebRTC连接
- `initVideoCanvas()`: 初始化视频画布
- `changeVideoCanvasSize()`: 调整画布尺寸

### 标注相关
- `drawAnnotations()`: 绘制AI标注
- `clearAnnotations()`: 清除标注
- `handleChecked()`: 处理标注选择

### 通信相关
- `sendMsg()`: 发送WebSocket消息
- `receiveMsg()`: 处理接收到的消息

## 使用说明
1. 输入账号、密码、网关标识和通道号
2. 点击"观看"按钮开始播放
3. 使用开关控制AI标注显示
4. 点击"设置标注"选择要显示的标注类型

## 注意事项
- pnpm install 安装依赖
- pnpm dev 启动服务
- pnpm build 打包
- 需要安装配套插件才能正常使用
- 视频播放依赖于WebRTC和WebSocket服务
- 组件卸载时会自动关闭视频流和清理资源