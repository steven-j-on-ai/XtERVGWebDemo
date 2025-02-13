<template>
  <div>
    <svg :style="{ width: width, height: height }">
      <use :xlink:href="prefix + iconName" :fill="color"></use>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps({
  //xlink:href属性值的前缀
  prefix: {
    type: String,
    default: '#icon-'
  },
  //svg矢量图的名字
  iconName: String,
  //svg图标的颜色
  color: {
    type: String,
    default: ""
  },
  //svg宽度
  width: {
    type: String,
    default: '100%'
  },
  //svg高度
  height: {
    type: String,
    default: '100%'
  },

})
</script>
<style scoped></style>