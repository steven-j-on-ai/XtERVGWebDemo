<template>
  <router-view />
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { IEVersion } from '@/utils/index'

  onMounted(() => {
    if(IEVersion() != -1){
      alert('非常抱歉，您的浏览器不支持本网页的操作，请使用其他浏览器。')
    }
  })
</script>

<style lang="scss">
.el-message{
  min-width: 300px !important;
}
.el-pagination{
  margin-top: 20px;
}
</style>
