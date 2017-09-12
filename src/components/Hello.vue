<template>
    <div class="hello">
        <h1>{{ msg }}</h1>
        <hr>
        <h2>Thread id: {{ $route.params.id }}</h2>
        <hr>
        <h3>Essential Links</h3>
        <message :message-data='msg_de_data' thread-color='rgba(00,11,255,255)'></message>
        <ul>
            <li><a href="https://vuejs.org" target="_blank">Core Docs</a></li>
            <li><a href="https://forum.vuejs.org" target="_blank">Forum</a></li>
            <li><a href="https://gitter.im/vuejs/vue" target="_blank">Gitter Chat</a></li>
            <li><a href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
            <br>
            <li><a href="http://vuejs-templates.github.io/webpack/" target="_blank">Docs for This Template</a></li>
        </ul>
        <h3>Ecosystem</h3>
        <ul>
            <li><a href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
            <li><a href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
            <li><a href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
            <li><a href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
        </ul>
    </div>
</template>

<script>

import { Crypto } from '@/utils'
import Message from '@/components/Message.vue'

export default {
    name: 'hello',
    data () {
        return {
            msg: 'Welcome to Your Vue.js App',
        }
    },
    computed: {
        msg_de_data () {
            return Crypto.decryptMessage({
                "device_id":287325597367522,
                "message_type":0,
                "data":"Xw/3b5eI5sbT5Uk/Qfpv7Q==\n-:-XLF0/ibQQWjiB73+Ss1v/5Jv3Bva6jhLNbqGGDnplxF3r3ztV8MK50nYFE55GG0GID7VXs48lJBV\nybLPqB2pD+6s6UUfeNb4ehgUc5XAFSBcacDrbxgbPlTTR6QpnmT9\n",
                "timestamp":1503813338717,
                "mime_type":"tiyOyjgAbGa0gm7ntcHwlA==\n-:-bTQj3C2Sl4BOLjbQmOIRfg==\n",
                "read":true,
                "seen":true,
                "message_from":null,
                "color":null,
                "sent_device":null
            })
        }

    },
    components: {
        Message,
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h3 {
    font-weight: normal;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}

a {
    color: #42b983;
}
</style>
