import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from "@/router/index";
import { whiteList } from "@/router/whiteList";

router.beforeEach(async(to, _from, next) => {
  NProgress.start()
  const is_login = true
  if(is_login){
    // 用户已登录
    next();
  }else if (whiteList.indexOf(to.path) !== -1) {
    // 在免登录白名单，直接进入
    next()
  }else{
    next('/login')
  }
})

router.afterEach(() => {
  NProgress.done() // 进度条结束
})