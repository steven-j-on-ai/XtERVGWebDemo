import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import  router from '@/router'
import  {routes} from '@/router'
import { isLogin,logOut,login } from '@/api/user'

export const useUserStore = defineStore('user-store', {
  state: ()=>{
    return {
        isLgoin:true,
        userRouter:[] as string[]
    }
  } ,
  getters: {
    getIsLogin(): boolean{
        return this.isLgoin
    },
    getUserRouter(): string[]{
        return this.userRouter
    }
  },
  actions: {
    //登录状态
    setIsLogin(isLogin:boolean):void{
        this.isLgoin = isLogin
    },
    // 路由权限
    setUserRouter(){
      return new Promise((resolve,_reject)=>{
        this.userRouter = []
        //routes通用路由
        routes.forEach((item:any)=>{
          // 判断用户权限roles(暂未有需求)
          this.userRouter.push(item)
        })
        resolve('')
      })
    },
    // 判断用户是否登录
    asyncIsLogin(){
      return new Promise((resolve,reject)=>{
        isLogin().then((res:any)=>{
          if(res.code == 200){
            this.setIsLogin(true)
            resolve(true)
          }else{
            this.setIsLogin(false)
            resolve(false)
          }
        }).catch((err:any)=>{
          reject(err)
        })
      })
    },
    //退出登录
    async  asyncLogOut(){
      try{
        const res:any = await logOut();
        if (res.code == 200) {
          this.setIsLogin(false);
          ElMessage.success('退出登录');
          location.reload(); // 确保所有操作完成后刷新页面
        } else {
          // 可以在这里处理其他状态码或显示错误消息
          ElMessage.error('退出登录失败');
        }
      }catch(err){
        throw err; // 如果需要，可以重新抛出错误
      }
    },
    //登录
    async asyncLogin(form:any){
      try{
        const res:any = await login(form)
        if(res.code == 200){
          ElMessage.success('欢迎登录')
          this.setIsLogin(true)
          router.push({path:'/'})
        }else{
          ElMessage.error(res.data)
        }
      }catch(err){
        throw err; // 如果需要，可以重新抛出错误
      }
    }
  },
})
