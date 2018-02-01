<template>
    <div id="app">

        <!-- Toolbar -->
        <div id="toolbar" :style="{ color: text_color }"> 
            <div id="toolbar_inner" :style="{ marginLeft: margin + 'px'}"> <!-- Toolbar-Inner -->
                <div id="logo" @click="toggleSidebar"> <!-- Logo/Drawer link -->
                    <img id="logo-image" src="./assets/images/holder.gif" width="30" height="30" class="icon" :class="icon_class" />
                </div>
                <span class="mdl-layout-title" id="toolbar-title">{{ $store.state.title }}</span>
				<div id="toolbar_icons" >
					<transition-group name="list">
                    <button id="add-button" class="menu_icon add mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" tag="button" v-if="$route.path.indexOf('thread') != -1" key="add" @click="$router.push('/compose');">
						<i class="material-icons material-icons-white">add</i>
					</button>
                    <button id="refresh-button" class="menu_icon refresh mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" @click="dispatchMenuButton('refresh')" key="refresh">
                        <i class="material-icons">refresh</i>
                    </button>
                    <button class="menu_icon android-more-button mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect" id="more-button" key="more">
                        <i class="material-icons">more_vert</i>
                    </button>
					</transition-group>
                    <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect" for="more-button" >
                        <li v-for="item in menu_items" class="mdl-menu__item" :id="item.name + '-btn'" @click.prevent="dispatchMenuButton(item.name)" v-mdl><a class="mdl-menu__item" :id="item.name + '-conversation'" href="#">{{ item.title }}</a></li>
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
        <Snackbar />

        <div class="file-drag"></div>
    </div>
</template>

<script>

import Vue from 'vue'

import '@/lib/sjcl.js'
import '@/lib/hmacsha1.js'

import { Util, Crypto, Api, MediaLoader } from '@/utils'

import Sidebar from '@/components/Sidebar.vue'
import Conversations from '@/components/Conversations/'
import Splash from '@/components/Splash.vue'
import Snackbar from '@/components/Snackbar.vue'

export default {
    name: 'app',

    beforeCreate () {

        // Set title
        this.$store.commit('title', "PulseClient");
        // If logged in (account_id) then setup crypto
        if(this.$store.state.account_id != '') 
            Crypto.setupAes(); 
        else // Otherwise, force login page
            this.$router.push('login');

    },

    mounted () { // Add window event listener
        
        this.calculateHour(); // Calculate the next hour (for day/night theme)
        this.updateBodyClass(this.theme_str, ""); // Enables global theme

        // Handle resizing for left margin size
        window.addEventListener('resize', this.handleResize)
        this.handleResize(); // Get initial margin size

        // Setup firebase
        Util.firebaseConfig(); 
        
        // Construct colors object from saved global theme
        const colors = {
            'default': this.$store.state.theme_global_default,
            'dark': this.$store.state.theme_global_dark,
            'accent': this.$store.state.theme_global_accent,
        };

        // Commit them to current application colors
        this.$store.commit('colors', colors); 

        // If logged in start app
        if (this.$store.state.account_id != '') {
            this.applicationStart();
        } else { // Otherwise, add listener for start-app event
                 // This allows for another part of the app to setup parts of the app
                 // Which may have unmet requirements (such as login)
            this.$store.state.msgbus.$on('start-app', this.applicationStart);
            this.mount_view = true;
        }
        
        // Setup global button listeners
        this.$store.state.msgbus.$on('settings-btn', () => this.$router.push('/settings'));
        this.$store.state.msgbus.$on('logout-btn', this.logout);
        
        // Request notification permissions if setting is on.
        if (this.$store.state.notifications)
            Notification.requestPermission();

        // Set toolbar color with materialColorChange animiation
        const toolbar = this.$el.querySelector("#toolbar");
        Util.materialColorChange(toolbar, this.theme_toolbar);

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
            mm: null,
            toolbar_color: this.$store.state.colors_default,
            menu_items: [],
            hour: null,
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
            // Setup the API (Open websocket)
            this.mm = new Api(); 
            // Grab user settings from server and store in local storage
            Api.fetchSettings();
            // Populate the dropdown menu
            this.populateMenuItems();
            // Setup and store the medialoader (MMS)
            this.$store.commit('media_loader', new MediaLoader());
        },

        /**
         * Handles the sidebar button
         * Toggles sidebar open/close or redirects to '/' based on current theme
         */
        toggleSidebar () {
            if(!this.full_theme)
                this.$store.commit('sidebar_open', !this.sidebar_open);
            else 
                this.$router.push('/');
        },
        /**
         * Calculates margin size on window resize
         * effectively creating a dynamic left-side whitespace
         */
        handleResize () { // Handle resize. Toggles full/mini theme
            const MAIN_CONTENT_SIZE = 950;
            const width = document.documentElement.clientWidth;
            let margin = 0;

            // If width is less than 750, close sidebar
            if (width > 750) {
                this.$store.commit('sidebar_open', true);
                this.$store.commit('full_theme', true);
            } else {
                this.$store.commit('sidebar_open', false);
                this.$store.commit('full_theme', false);
            }

            // Handles left side offset
            // Calculates width based on the main content size of 950
            if (width > MAIN_CONTENT_SIZE) {
                margin = (width - MAIN_CONTENT_SIZE) / 2;
            }
            
            // Set margin
            this.margin = margin
        },
        
        /**
         * Populate Menu Items
         * Populates drop down menu items based on page and message context
         * Is called when routes change. Updates data() item to
         * maintain UI reactivity.
         */
        populateMenuItems () {

            // Static items!
            const items = [
                { 'name': "settings", 'title': "Settings" },
                { 'name': "logout", 'title': "Logout" }
            ]

            // On thread add Delete, Blacklist, & Archive/unarchive
            if (this.$route.name.includes('thread'))
                items.unshift(
                    { 'name': "delete", 'title': "Delete Conversation" },
                    ( !this.$route.path.includes("archived") ?
                        { 'name': "archive", 'title': "Archive Conversation" } :
                        {'name': "unarchive", 'title': "Unarchive Conversation" }),
                    { "name": "blacklist", 'title': "Blacklist Contact"}, 
                );
            else  // Otherwise just Account & Help
                items.unshift(
                    { 'name': "account", 'title': "My Account" },
                    { 'name': "help", 'title': "Help and Feedback" },
                )

            // Set menu_items
            return this.menu_items = items;
        },

        /**
         * handles menu button click event.
         * Dispatches an event with "name-btn" title.
         * @param name - button name
         */
        dispatchMenuButton (name) {
            // Dispatch button event to message bus
            this.$store.state.msgbus.$emit(name + "-btn");
        },

        /**
         * Updates theme (toolbar color)
         * When toolbar theme is enabled
         * @param color - rgb/hex color string.
         */
        updateTheme (color) {
            // Ignore if toolbar theme is false
            if (!this.$store.state.theme_toolbar)
                return false;
            // Set color
            this.toolbar_color = color;
        },

        /**
         * Handle logout
         * Removes sensative data, clears local storage, 
         * and closes websocket 
         */
        logout () {

            // Remove sensative data
            this.$store.commit('account_id', "");
            this.$store.commit('hash', "");
            this.$store.commit('salt', "");
            this.$store.commit('aes', "");
            this.$store.commit('clearContacts', {});
            
            // Clear local storage (browser)
            window.localStorage.clear();
            // Close socket
            this.mm.closeWebSocket();

            Util.snackbar("You've been logged out");

            this.$router.push('login');
        },

        /**
         * updates body class.
         * Removes from class, adds to class
         * @param to - new class
         * @param from  - old class
         */
        updateBodyClass (to, from) {
            const body = this.$el.parentElement; // select body
            // Add and remove classes
            const classes = body.className.replace(from, "")
            body.className = classes + " " + to;
        },

        /**
         * Sets current hour, ever hour on the hour.
         */
        calculateHour () {

            // Determines ms to the next hour
            const nextHour = (60 - new Date().getMinutes()) * 60 * 1000
            this.hour = new Date().getHours(); // Get current hour

            setTimeout(() => { // Rerun function at the next hour
                this.calculateHour()
            }, nextHour + 2000);
        }

    },

    computed: {
        icon_class () {
            return {
                'logo': this.full_theme && !this.$store.state.theme_toolbar,
                'logo_dark': this.full_theme && this.$store.state.theme_toolbar,
                'menu_toggle': !this.full_theme && !this.$store.state.theme_toolbar,
                'menu_toggle_dark': !this.full_theme && this.$store.state.theme_toolbar,
            }
        },

        sidebar_open () { // Sidebar_open state
            return this.$store.state.sidebar_open;
        },

        full_theme () { // Full_theme state
            return this.$store.state.full_theme;
        },

        theme_str () {
            const theme = this.$store.state.theme_base;

            // If day/night, return dark/light
            if (theme == "day_night") 
                return this.is_night ? "dark" : "";

            return theme; // Otherwise return stored theme
        },

        is_night () { // If "night" (between 20 and 7)
            return this.hour < 7 || this.hour >= 20 ? true : false;
        },

        theme_toolbar () { // Determine toolbar color
            if (this.$store.state.theme_use_global) // If use global 
                return this.$store.state.theme_global_default;

            if (!this.$store.state.theme_toolbar)  // If not color toolbar
                return this.default_toolbar_color;

            return this.toolbar_color;
        },

        default_toolbar_color () { // Determine default colors
            const theme = this.theme_str; // Theme string

            if (theme == "light") // Light theme
                return "#f3f3f3"
            else if(theme == "dark") // Dark theme
                return "#202B30"
            else if(theme == "day_night") // Day night
                return this.is_night ? "#202b30" : "#f3f3f3"
                
        },

        text_color () { // Determines toolbar text color
            if (this.$store.state.theme_toolbar) 
                return "#fff";
        }
    },
    watch: {
        '$route' (to, from) { // To update dropdown menu
            this.populateMenuItems();
        },
        '$store.state.colors_default' (to) { // Handle theme changes
            this.updateTheme(to);
        },
        'theme_str' (to, from) { // Handles updating the body class
            this.updateBodyClass(to, from)
        },
        'theme_toolbar' (to, from) { // Handle toolbar color change
            Vue.nextTick(() => {
                const toolbar = this.$el.querySelector("#toolbar");
                Util.materialColorChange(toolbar, to);
            })
        }

    },
    components: {
        Sidebar,
        Conversations,
        Splash,
        Snackbar
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
		background-color: $bg-light;
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

    .file-drag.dragging {
        border: rgba(0,128,0,0.3) solid 1em;
        position: fixed;
        height: calc(100% - 2em);
        width: calc(100% - 2em);
        top: 0;
        z-index: 10;
        left: 0;
    }

	#toolbar {
		height: 43px;
		top: 0;
		position: fixed;
		z-index: 4;
		width: 100%;
		border-bottom: solid 1px #ca2100;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
		background-color: $bg-light;
        border-color: #e3e3e3;

    }

    #toolbar_inner {
        max-width: 950px;
        height: 100%;
        position: relative;
        z-index: 6;
        transition: ease-in-out margin-left $anim-time;

        #logo {
            float: left;
            margin-left: 20px;
            padding-top: 9px;

            #logo-image:hover {
                cursor: pointer;
            }
            
            .icon {
                margin-top: 2px;
                width: 25px;
                height: 25px;
                
                &.logo {
                    background: url(assets/images/vector/pulse.svg) 0 0 no-repeat;
                }

                &.logo_dark {
                    background: url(assets/images/vector/pulse-dark.svg) 0 0 no-repeat;
                }

                &.menu_toggle {
                    background: url(assets/images/vector/menu_toggle.svg) 0 0 no-repeat;
                }

                &.menu_toggle_dark {
                    background: url(assets/images/vector/menu_toggle-dark.svg) 0 0 no-repeat;
                }
            }

        }

        .mdl-layout-title {
            float: left;
            margin-left: 15px;
            margin-top: 12px;
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

	.list-enter-active, .list-leave-active {
		transition: all .3s;
	}
	.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
		opacity: 0;
		transform: translateX(30px);
	}

    body.dark {
        background-color: $bg-dark;
        color: #fff;

        .mdl-progress > .bufferbar {
            background-image: linear-gradient(to right,rgba(55, 66, 72,.7),rgba(55, 66, 72,.7)),
                linear-gradient(to right,rgb(33,150,243),rgb(33,150,243));
        }


        #toolbar {
            border-bottom: solid 1px #ca2100;
            background-color: $bg-darker;
            border-color: #202b30;
        }

        #logo .icon {
            &.logo {
                background: url(assets/images/vector/pulse-dark.svg) 0 0 no-repeat !important;
            }

            &.menu_toggle {
                background: url(assets/images/vector/menu_toggle-dark.svg) 0 0 no-repeat !important;
            }

        }

        .mdl-color-text--grey-900 {
            color: #fff !important;
        }

        .mdl-color-text--grey-600 {
            color: rgba(255,255,255,.77) !important;
        }
    }
    
    .transition span.animator {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        overflow: hidden;

        span:first-of-type {
            display: block;
            position: absolute;
            top: -50%;
            width: 200%;
            height: 200%;
            margin-left: -50%;
            border-radius: 50px;
            opacity: 0;
            z-index: 3;
            animation: ripple .5s ease-out forwards;
        }
    }

    @keyframes ripple {
        0% {
            transform: scaleX(0);
        }
        70% {
            transform: scaleX(0.5);
        }
        100% {
            opacity: 1;
            transform: scaleX(1);
        }
    }

</style>
