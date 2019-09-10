<template>
    <div id="login-pane" v-mdl class="mdl-card mdl-shadow--6dp">
        <div class="mdl-card__title mdl-color--primary mdl-color-text--white">
            <h2 class="mdl-card__title-text">
                Pulse SMS
            </h2>
        </div>
        <div class="mdl-card__supporting-text">
            <!-- eslint-disable vue/no-v-html -->
            <p v-html="$t('login.first')"></p>
            <p v-if="error" class="error">
                {{ $t('login.error') }}
            </p>
            <form>
                <div class="mdl-textfield mdl-js-textfield">
                    <input id="username" v-model="username" class="mdl-textfield__input" type="email" autofocus>
                    <label class="mdl-textfield__label" for="username">{{ $t('login.email') }}</label>
                </div>
                <div class="mdl-textfield mdl-js-textfield">
                    <input id="password" v-model="password" class="mdl-textfield__input" type="password" @keyup.enter="doLogin">
                    <label class="mdl-textfield__label" for="password">{{ $t('login.password') }}</label>
                </div>
            </form>

            <a href="https://messenger.klinkerapps.com/forgot_password.html" target="_blank">{{ $t('login.forgotpassword') }}</a>
            <br>
            <!-- eslint-disable vue/no-v-html -->
            <a href="https://messenger.klinkerapps.com/overview/platform-ios.html" target="_blank" v-html="$t('login.iphone')"></a>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <button id="login" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" @click="doLogin">
                {{ $t('login.login') }}
            </button>
        </div>


        <transition name="loading-fade">
            <div v-if="loading" class="loading-center">
                <spinner />
            </div>
        </transition>
    </div>
</template>

<script>

import { Crypto, Api } from '@/utils/'
import Spinner from '@/components/Spinner.vue'
import { sjcl } from '@/lib/sjcl.js'
import { hmacSHA1 } from '@/lib/hmacsha1.js'


export default {
    name: 'Login',

    components: {
        Spinner
    },

    data () {
        return {
            title: "",
            username: '',
            password: '',
            loading: false,
            error: false,
        }
    },

    mounted () {
        if (this.$store.state.account_id != '')
            return this.$router.push({ name: 'conversations-list'});

        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);
    },

    methods: {
        doLogin() {

            if (this.username == '' || this.password == '')
                return;

            this.error = false;
            this.loading = true;

            Api.account.login(this.username, this.password)
                .then((data) => this.handleData(data.data))
                .catch((data) => this.handleError(data));
        },

        handleData (data) {
            this.error = false;

            // Create hash
            let derived_key = sjcl.misc.pbkdf2(this.password, data.salt2, 10000, 256, hmacSHA1);
            let base64_hash = sjcl.codec.base64.fromBits(derived_key);

            // Save data
            this.$store.commit('account_id', data.account_id);
            this.$store.commit('hash', base64_hash);
            this.$store.commit('salt', data.salt1);

            Crypto.setupAes(); // Setup aes for session

            this.loading = false;

            // Start app
            this.$store.state.msgbus.$emit('start-app');

            this.$router.push({ name: 'conversations-list'});
        },

        handleError() {
            this.password = "";
            this.error = true;
            this.loading = false;
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    #login-pane {
        position: relative;
        width: 330px;
        height: 100%;
        margin: 5em auto;
    }

    .loading-center {
        position: absolute;
        margin: 57px auto;
        background: #fff;

        height: 100%;
        width: 100%;

        text-align: center;
        vertical-align: middle;

        .spinner {
            margin: 35% auto;
            translate: scale(2);
        }
    }

    .error {
        color: rgb(255,64,129);
    }

    /* loading-fade transition */
    .loading-fade-enter-active {
        transition-delay: 1s;
        transition: all $anim-time ease;
    }
    .loading-fade-leave-active {
        transition-delay: 1s;
        transition: all $anim-time ease;
    }
    .loading-fade-enter, .loading-fade-leave-to {
        transform: translateY(70%);
        opacity: 0;
    }

</style>
