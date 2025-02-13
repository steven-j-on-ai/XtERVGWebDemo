// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/index',
    component:Layout,
    children:[
      {
        path:'/index',
        name:"index",
        component: () => import('@/views/index/index.vue'),
        meta: { title: '应用中心'},
      },
    ]
  },
  // 页面不存在时的路由
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/404.vue'),
    meta: { title: '404'},
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;