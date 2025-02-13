import path from 'path'
import { defineConfig,loadEnv,ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import sass from 'sass'; // 引入 dart-sass

// https://vitejs.dev/config/
export default defineConfig((mode: ConfigEnv)=>{
  const env = loadEnv(mode.mode, process.cwd(), '');
  return {
    base: env.VITE_BASE,
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        // 指定 SVG图标 保存的文件夹路径
        iconDirs: [path.resolve(process.cwd(), 'src/icons')],
        // 指定 使用svg图标的格式
        symbolId: 'icon-[dir]-[name]',
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    build: {
      outDir: 'XtERVGWebDemo',
      rollupOptions:{
        output: {
          // entryFileNames: 'js/[name].js',//入口文件
          entryFileNames: 'js/[name]-[hash].js',//入口文件
          // chunkFileNames: 'js/[name].js',//分包引入文件
          chunkFileNames: 'js/[name]-[hash].js',//分包引入文件
          // assetFileNames: '[ext]/[name]-[hash].[ext]',//静态文件
          assetFileNames(assetInfo:any){
            // console.log(assetInfo)
            //文件名称
            if (assetInfo.name.endsWith('.css')) {
              return 'css/[name].css'
              // return 'css/[name]-[hash].css'
            }
            //图片名称
            //定义图片后缀
            const imgExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg','.ico']
            if(imgExts.some(ext => assetInfo.name.endsWith(ext))){
              return 'imgs/[name].[ext]'
              // return 'imgs/[name]-[hash].[ext]'
            }
            //剩余资源文件
            return 'assets/[name].[ext]'
            // return 'assets/[name]-[hash].[ext]'
          }
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 80,
      proxy: {
          '/api': {
              target: env.VITE_BASE_TARGET,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
          },
      },
    },
    css: {
      // css预处理器
      preprocessorOptions: {
        scss: {
          implementation: sass, // 指定使用 dart-sass
          // 引入 mixin.scss 这样就可以在全局中使用 mixin.scss中预定义的变量了
          // 给导入的路径最后加上 ; 
          additionalData: '@use "@/style/mixin" as mixin;'
        }
      }
    }
  }
})
