/*
 * @Author: raoqidi
 * @Date: 2021-07-01 11:59:36
 * @LastEditors: raoqidi
 * @LastEditTime: 2021-09-05 19:12:53
 * @Description: please add a description to the file
 * @FilePath: /qiankun-demo/vue2/src/main.ts
 */
import './public-path';
import ElementUI from 'common/node_modules/element-ui';
import 'common/node_modules/element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import { routes } from './router';
import store from './store';
// import { store as commonStore } from 'common';
import globalRegister from './store/global-register';
Vue.config.productionTip = false;
Vue.use(ElementUI);

let instance: Vue | null = null;
let router: VueRouter | null = null;

const render = (props: any = {}) => {
  const { container, routerBase } = props;
  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? routerBase : process.env.BASE_URL,
    mode: 'history',
    routes,
  });
  // router.beforeEach((to, from, next) => {
  //   if (window.__POWERED_BY_QIANKUN__ && !to.path.includes("/vue2")) {
  //     console.log(to.path);
  //     next({ path: "/vue2" + to.path });
  //   } else {
  //     next();
  //   }
  // });

  instance = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app');

  // 解决vue-devtools在qiankun中无法使用的问题
  // https://github.com/vuejs/devtools/blob/7273c9a9fca2d54134f92c1e8caed59b51d0818c/packages/shell-chrome/src/detector.js
  if (window.__POWERED_BY_QIANKUN__ && process.env.NODE_ENV === 'development') {
    // vue-devtools  加入此处代码即可
    const instanceDiv: any = document.createElement('div');
    instanceDiv.__vue__ = instance;
    document.body.appendChild(instanceDiv);
  }
};

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
  console.log('[vue2] vue app bootstraped');
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props: any) {
  console.log('[vue2] props from main framework', props);
  // commonStore.globalRegister(store, props);
  globalRegister(store, props);
  render(props);
  props.onGlobalStateChange((state: any, prev: any) => {
    console.log('globalStateChange的回调...');
    console.log(prev, state);
  });

  // props.setGlobalState(state);
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount() {
  instance!.$destroy();
  instance!.$el.innerHTML = '';
  instance = null;
  router = null;
}

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function update(props: any) {
  console.log('update props', props);
}
