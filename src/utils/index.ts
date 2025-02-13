
export function IEVersion() {
    let userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    // console.log(userAgent);
    let isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    let isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
    let isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if(isIE) {
     let reIE = new RegExp("MSIE (\\d+\\.\\d+);");
     let match = reIE.exec(userAgent);
     let fIEVersion = match ? parseFloat(match[1]) : 0;
     if(fIEVersion == 7) {
         return 7;
     } else if(fIEVersion == 8) {
         return 8;
     } else if(fIEVersion == 9) {
         return 9;
     } else if(fIEVersion == 10) {
         return 10;
     } else {
         return 6;//IE版本<=7
     }
    } else if(isEdge) {
     return 'edge';//edge
    } else if(isIE11) {
     return 11; //IE11
    }else{
     return -1;//不是ie浏览器
    }
}

export function downloadFile(fileUrl:string) {
    // 创建一个<a>元素
    const link = document.createElement('a');
    // 设置href属性为文件的URL
    link.href = fileUrl;
    const fileName = fileUrl.split('/').pop() || new Date().getTime().toString();
    // 设置下载的文件名
    link.setAttribute('download', fileName);
    // 将<a>元素添加到body中（Firefox需要）
    document.body.appendChild(link);
    // 模拟点击<a>元素
    link.click();
    // 移除<a>元素
    document.body.removeChild(link);
}