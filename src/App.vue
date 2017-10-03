<template>
    <div id="app">

        <!-- Toolbar -->
        <div id="toolbar" :style="{ backgroundColor: theme_toolbar }"> 
            <div id="toolbar_inner" :style="{ marginLeft: margin + 'px'}"> <!-- Toolbar-Inner -->
                <div id="logo" @click="toggleSidebar"> <!-- Logo/Drawer link -->
                    <img id="logo-image" src="./assets/images/holder.gif" width="30" height="30" :class="icon_class" />
                </div>
                <span class="mdl-layout-title" id="toolbar-title">{{ title }}</span>
                <div id="toolbar_icons">
                    <button id="refresh-button" class="menu_icon refresh mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" @click="dispatchMenuButton('refresh')">
                        <i class="material-icons">refresh</i>
                    </button>
                    <button class="menu_icon android-more-button mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect" id="more-button">
                        <i class="material-icons">more_vert</i>
                    </button>
                    <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect" for="more-button" >
                        <li v-for="item in menu_items" class="mdl-menu__item" :id="item.name + '-btn'" @click.prevent="dispatchMenuButton(item.name)" v-mdl><a class="mdl-menu__item" :id="item.name + '-conversation'" href="#">{{ item. title }}</a></li>
                    </ul>
                </div>
            </div>  <!-- End Toolbar-Inner -->
        </div> <!-- End Toolbar-->

        <!-- Content Wrapper -->
        <div id="wrapper" :style="{ marginLeft: margin + 'px'}"> 

            <!-- Side Menu -->
            <div id="side-menu">
                <sidebar v-mdl>
                </sidebar>
            </div> <!-- End Side Menu -->

            <!-- Content Area -->
            <div id="content"> 
                <main class="mdl-layout__content">
                    <router-view></router-view>
                </main>
            </div> <!-- End Content Area -->

        </div> <!-- End Content Wrapper -->
        
        <!-- Loading splash page -->
        <transition name="splash-fade">
            <splash v-if="$store.state.loading"></splash>
        </transition>
    </div>
</template>

<script>

import '@/lib/sjcl.js'
import '@/lib/hmacsha1.js'

import { Util, Crypto, MessageManager } from '@/utils'

import Sidebar from '@/components/Sidebar.vue'
import Conversations from '@/components/Conversations/'
import Splash from '@/components/Splash.vue'

export default {
    name: 'app',

    beforeCreate () {

        if(this.$store.state.account_id != '') // If logged in
            Crypto.setupAes();                 // Set up crypto
        else // Otherwise, force login
            this.$router.push('login');

    },

    mounted () { // Add window event listener

        window.addEventListener('resize', this.handleResize)
        this.handleResize();

        if (this.$store.state.account_id != '') // If logged in
            this.applicationStart();            // Start app
        else {
            this.$store.state.msgbus.$on('start-app', this.applicationStart);
            this.mount_view = true;
        }

        this.$store.state.msgbus.$on('settings-btn', () => this.$router.push('/settings'));
        this.$store.state.msgbus.$on('logout-btn', this.logout);

    },

    beforeDestroy () { // Remove event listeners
        window.removeEventListener('resize', this.handleResize)

        this.$store.state.msgbus.$off('start-app');
        this.$store.state.msgbus.$off('settings-btn');
        this.$store.state.msgbus.$off('logout-btn');

        this.mm.closeWebSocket();

    },

    data () {
        return {
            margin: 0,
            loading: this.$store.state.loading,
            title: this.$store.state.title, 
            mm: null,
            toolbar_color: this.$store.state.colors.default,
            menu_items: [],
        }
    },

    methods: {

        /**
         * Application start
         * Used to allow for "late starts" such as after a login
         * without refreshing page to remount app.
         * Contains app components that require account to run.
         */
        applicationStart () {
            this.mm = new MessageManager();
            this.updateContactCache();
            MessageManager.fetchSettings();
            this.populateMenuItems();
        },
        
        toggleSidebar () {
            if(!this.full_theme)
                this.$store.commit('sidebar_open', !this.sidebar_open);
            else 
                this.$router.push('/');
        },

        handleResize () { // Handle resize. Toggles full/mini theme
            var MAIN_CONTENT_SIZE = 950;
            var width = document.documentElement.clientWidth;
            var margin = 0;

            if (width > 750) {
                this.$store.commit('sidebar_open', true);
                this.$store.commit('full_theme', true);
            } else {
                this.$store.commit('sidebar_open', false);
                this.$store.commit('full_theme', false);
            }

            // Handles left side offset
            if (width > MAIN_CONTENT_SIZE) {
                margin = (width - MAIN_CONTENT_SIZE) / 2;
            }

            this.margin = margin
        },
        
        /**
         * updateContactCache
         * Launches requests to cache all current contacts
         */
        updateContactCache () {
            let this_ = this;

            MessageManager.fetchConversations("index_unarchived")
                .then(response => { this_._updateContactCache(response) })

            MessageManager.fetchConversations("index_archived")
                .then(response => { this_._updateContactCache(response) })
        },
        
        /**
         * _updateContactCache
         * Adds response items to contact cache (stored locally)
         * 
         * @param response - server encoded response
         */
        _updateContactCache (response) {
            let cache = [];

            for(let i = 0; i < response.length; i++) {
                cache.push(Util.generateContact(
                    response[i].device_id,
                    response[i].title,
                    response[i].color,
                    Util.expandColor(response[i].color_accent),
                    Util.expandColor(response[i].color_light),
                    Util.expandColor(response[i].color_dark)
                ));
            }
            this.$store.commit('contacts', cache) 
        },


        /**
         * Populate Menu Items
         * Populates drop down menu items based on page and message context
         * Is called when routes change. Updates data() item to
         * maintain UI reactivity.
         */
        populateMenuItems () {
            let items = [
                { 'name': "account", 'title': "My Account" },
                { 'name': "settings", 'title': "Settings" },
                { 'name': "help", 'title': "Help and Feedback" },
                { 'name': "logout", 'title': "Logout" }
            ]
            
            if (this.$route.name.includes('thread')) {
                items.unshift(
                    { 'name': "delete", 'title': "Delete Conversation" },
                    (this.$route.path.includes("archived") ?
                        { 'name': "archive", 'title': "Archive Conversation" } :
                        {'name': "unarchive", 'title': "Unarchive Conversation" }),
                    { "name": "blacklist", 'title': "Blacklist Contact"}, 
                );
            }
        
            return this.menu_items = items;
        },

        dispatchMenuButton (name) {
            this.$store.state.msgbus.$emit(name + "-btn");
        },

        updateTheme (color) {
            if (!this.$store.state.theme_toolbar)
                return
            
            this.toolbar_color = color.default;

        },

        logout () {
            this.$store.commit('account_id', "");
            this.$store.commit('hash', "");
            this.$store.commit('salt', "");
            this.$store.commit('clearContacts', {});

            window.localStorage.clear();

            this.$router.push('login');
        }

    },

    computed: {
        icon_class () {
            return {
                'icon_logo': this.full_theme,
                'icon_menu_toggle': !this.full_theme
            }
        },
        sidebar_open () { // Sidebar_open state
            return this.$store.state.sidebar_open;
        },
        full_theme () { // Full_theme state
            return this.$store.state.full_theme;
        },
        theme_toolbar () {
            if (!this.$store.state.theme_toolbar) 
                return "#f7f7f7"

            return this.toolbar_color;
        }

    },
    watch: {
        '$route' (to, from) { // To update dropdown menu
            this.populateMenuItems();
        },
        '$store.state.colors' (to) {
            this.updateTheme(to);
        }

    },
    components: {
        Sidebar,
        Conversations,
        Splash
    }
}
</script>

<style lang="scss">
    
    @import "./assets/scss/material.blue-pink.min.css";
    @import "./assets/scss/_vars.scss";


	body {
		margin: auto;
		margin-left: 0;
		color: #202020;
		background-color: #f3f3f3;
		font-family: "Open Sans", "Helvetica", Arial, sans-serif;
		font-size: 14px;
		padding: 0 !important;
		margin-bottom: 0 !important;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		font-smooth: always;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	#toolbar {
		height: 43px;
		top: 0;
		position: fixed;
		z-index: 4;
		width: 100%;
		border-bottom: solid 1px #ca2100;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
		background-color: #f7f7f7;
		border-color: #e3e3e3;

    }

    #toolbar_inner {
        max-width: 950px;
        height: 100%;
        transition: ease-in-out margin-left $anim-time;

        #logo {
            float: left;
            margin-left: 20px;
            padding-top: 9px;

            #logo-image:hover {
                cursor: pointer;
            }

            .icon_logo {
                background: url(assets/images/vector/pulse.svg) 0 0 no-repeat;
                margin-top: 2px;
                width: 25px;
                height: 25px;
            }

            .icon_logo_dark {
                background: url(assets/images/vector/pulse-dark.svg) 0 0 no-repeat;
                margin-top: 2px;
                width: 25px;
                height: 25px;
            }
            .icon_menu_toggle {
                background: url(assets/images/vector/menu_toggle.svg) 0 0 no-repeat;
                margin-top: 2px;
                width: 25px;
                height: 25px;
            }

            .icon_menu_toggle_dark {
                background: url(assets/images/vector/menu_toggle-dark.svg) 0 0 no-repeat;
                margin-top: 2px;
                width: 25px;
                height: 25px;
            }

        }

        .mdl-layout-title {
            float: left;
            margin-left: 15px;
            margin-top: 12px;
            color: #666666;
        }
    }

	
    #toolbar_icons {
        border: 0;
        float: right;
        height: 100%;
        margin-top: 5px;
        white-space: nowrap !important;

        .mdl-menu, .mdl-menu__outline {
            margin-top: -30px;
            margin-left: -170px;
        }

    }

    #wrapper {
        transition: ease-in-out margin-left $anim-time;

    }

    #content {
        transition: ease-in-out margin-left $anim-time;
        max-width: 950px;
        min-height: 380px;
        margin-left: $sidebar_margin; /* TODO, should be dynamic */
        vertical-align: top;

        @media (max-width: $mini_width) {
            & {
                margin-left: 0px;
            }
        }
    }

    .mdl-layout__content {
        width: 100%;
        height: 100%;
        position: relative;

        @media (min-width: $mini_width) {
            & {
                max-width: 650px;
            }
        }

        .page-content {
            bottom: 0;
            margin: auto;
            margin-bottom: 54px;
            margin-top: 54px;
            padding-top: 16px;
            padding-bottom: 16px;
            overflow: hidden;

            @media screen and (min-width: 720px) {
                & {
                    max-width: 720px;
                    padding: 16px;
                }
            }

            @media screen and (min-width: 600px) {
                & {
                    max-width: 600px;
                    padding: 16px;
                }
            }
        }
    }

    /* splash-fade transition */
    .splash-fade-enter-active {
        transition-delay: 1s;
        transition: all $anim-time ease;
    }
    .splash-fade-leave-active {
        transition-delay: 1s;
        transition: all $anim-time ease;
    }
    .splash-fade-enter, .splash-fade-leave-to {
        transform: translateY(70%);
        opacity: 0;
    }

</style>
