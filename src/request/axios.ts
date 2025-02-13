import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_API,
    timeout: 200000, // request timeout
})
  
service.interceptors.request.use(
(config) => {
    return config
},
(error) => {
    return Promise.reject(error.response)
},
)

service.interceptors.response.use(
    response => {
        const res = response.data
        return res
    },
    function axiosRetryInterceptor(error){
        let config = error.config;
        console.log(error);
        
        if(!config || !config.retry) { 
            console.log(error); 
            return Promise.reject(error); 
        }
        config.__retryCount = config.__retryCount || 0;
        if(config.__retryCount >= config.retry) {
            console.log('err' + error) // for debug
            ElMessage({ message: '系统繁忙中,请稍后再试', type: 'error' })
            return Promise.reject(error);
        }
        config.__retryCount += 1;
        let backoff = new Promise(function(resolve) {
            setTimeout(function() {
            resolve(true);
            }, config.retryDelay || 1);
        });
        return backoff.then(function() {
            return service(config);
        });
    }
)

export default service