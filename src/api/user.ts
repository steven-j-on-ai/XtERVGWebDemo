import request from '@/request/axios'
import qs from 'qs'

//手机验证码
interface McodeData {
  mobile:string,
}
export function mcode(data:McodeData) {
  return request({
    url: '/user/login/mcode',
    method: 'get',
    params: data
  })
}

//注册
interface RegData {
  name:string,
  account:string,
  pwd:string,
  pwd2:string,
  mcode:string,
  req:string
}
export function reg(data:RegData) {
  return request({
    url: '/user/login/reg',
    method: 'post',
    data: qs.stringify(data)
  })
}

//登录
interface LoginData {
  account:string,
  pwd:string,
  code:string
}
export function login(data:LoginData) {
  return request({
    url: '/user/login/login',
    method: 'post',
    data: qs.stringify(data)
  })
}

//是否登录
export function isLogin() {
  return request({
    url: '/user/login/is_login',
    method: 'get'
  })
}
//获取图形验证码
export function getMcode() {
  return request({
    url: '/user/login/vcode',
    method: 'get',
    responseType:'blob'
  })
}
//退出登录
export function logOut() {
  return request({
    url: '/user/login/logout',
    method: 'post'
  })
}
interface pwd{
  pwd:string,
  pwd1:string,
  pwd2:string
}
//修改密码
export function changePwd(data:pwd) {
  return request({
    url: '/user/login/change_pwd',
    method: 'post',
    data: qs.stringify(data)
  })
}