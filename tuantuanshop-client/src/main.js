// 入口JS
import Vue from 'vue'
import App from './App.vue'
import {Button} from 'mint-ui'
import VueLazyLoad from 'vue-lazyload'
import router from './router/index.js'
import store from './store'

import './mock/mockServer' //加载mockServer即可
import loading from './common/imgs/loading.gif'

//注册全局组件标签
Vue.component(Button.name,Button)
Vue.use(VueLazyLoad, { // 内部自定义一个指令lazy
    loading
  })
new Vue({
    el: '#app',
    render: h => h(App),
    router,
    store,
})