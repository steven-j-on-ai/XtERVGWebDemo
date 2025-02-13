<template>
    <div class="not-found-page">
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在。</p>
      <router-link to="/">返回首页</router-link>
    </div>
  </template>
  
  <script setup lang="ts">
  // 这里可以导入你需要的组件或者Vue 3的API
  </script>
  
  <style lang="scss" scoped>
  .not-found-page {
    text-align: center;
    margin-top: 50px;
        h1 {
        font-size: 5em;
        color: #42b983;
    }
    
    p {
        font-size: 1.5em;
        color: #333;
    }
    
    router-link {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #42b983;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }
    
    router-link:hover {
        background-color: #35495e;
    }
  }
  </style>