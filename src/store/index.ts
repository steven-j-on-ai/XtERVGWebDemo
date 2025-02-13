import { defineStore } from 'pinia'

export const useIndexStore = defineStore('index-store', {
  state: ()=>{
    return {
      detailUrlList: ['/flBigFile','/flStreamMedia','/fxSigtran'],
      baseUrl:import.meta.env.VITE_BASE_URL,
    }
  } ,
  getters: {
    getDetailUrlList(): string[]{
        return this.detailUrlList
    },
    getBaseUrl():string{
      return this.baseUrl
    },
  },
  actions: {

  },
})
