require('@/assets/main.scss');

import { createApp } from 'vue'
import Vue from 'vue'
import App from './App.vue'


const mixin = {
    computed: {
        mobile() {
            return window.innerWidth < window.innerHeight
        }
    },
    data() {
        return {
            endpoint: "http://localhost:8000/api/digitalclinic/",
            axios: require('axios'),
        }
    }
}

App.mixins = [mixin]

createApp(App).mount('#app')
