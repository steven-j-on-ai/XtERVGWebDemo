import request from '@/request/axios'
import qs from 'qs'

//添加/修改应用
interface appData {
  name:string,
  desc:string,
  cat?:number,
  id?:number
}
export function modApp(data:appData) {
  return request({
    url: '/user/app/mod',
    method: 'get',
    params: data
  })
}
//应用列表查询
interface searchData {
  page:number,
  size:number
}
export function searchApp(data:searchData) {
  return request({
    url: '/user/app/search',
    method: 'get',
    params: data
  })
}
//应用详情
export function AppDetail(data:{id:string}) {
  return request({
    url: '/user/app/get',
    method: 'get',
    params: data
  })
}
//添加设备
interface deviceData {
  device_no0:string,
  ref_app_id:number
}
export function modDevice(data:deviceData) {
  return request({
    url: '/user/device/mod',
    method: 'post',
    data:qs.stringify(data)
  })
}
//申请修改
interface applyNoData {
  device_no1:string,
  ref_app_id:number,
  device_id:number
}
export function postApplyNo(data:applyNoData) {
  return request({
    url: '/user/device/apply_no',
    method: 'post',
    data:qs.stringify(data)
  })
}