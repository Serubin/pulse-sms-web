<template>
    <div id="app">
        <div id="toolbar"> <!-- Toolbar -->
            <div id="toolbar_inner"> <!-- Toolbar-Inner -->
                <div id="logo" @click="toggleSidebar"> <!-- Logo/Drawer link -->
                    <img id="logo-image" src="./assets/images/holder.gif" width="30" height="30" :class="icon_class" />
                </div>
                <span class="mdl-layout-title" id="toolbar-title">Pulse</span>
            </div>  <!-- End Toolbar-Inner -->
        </div> <!-- End Toolbar-->
        
		<div id="wrapper"> <!-- Content Wrapper -->
            <div id="side-menu"> <!-- Side Menu -->
                <sidebar v-mdl :open="sidebar_open" :full_theme="full_theme" :sidebar_open.sync="sidebar_open" >
                </sidebar>
            </div> <!-- End Side Menu -->
            <div id="content"> <!-- Content Area -->
				<router-view></router-view>
			</div> <!-- End Content Area -->
		</div> <!-- End Content Wrapper -->
    </div>
</template>

<script>

import '@/lib/sjcl.js'
import '@/lib/hmacsha1.js'
import Crypto from '@/crypto.js'
import Sidebar from '@/components/Sidebar.vue'
import Conversations from '@/components/Conversations.vue'

export default {
    name: 'app',

    beforeCreate () {

        if(this.$store.state.account_id != '') 
            Crypto.setupAes();
        else
            return //TODO Redirect to login

    },

    mounted () { // Add window event listener
        window.addEventListener('resize', this.handleResize)
        this.handleResize();

        
    },

    beforeDestroy () { // Remove event listeners
        window.removeEventListener('resize', this.handleResize)
    },

    methods: {
        toggleSidebar () {
            if(!this.full_theme)
                this.$store.dispatch('sidebar_open', !this.sidebar_open);
        },

        handleResize () { // Handle resize. Toggles full/mini theme
            var width = document.documentElement.clientWidth;

            if (width > 750) {
                this.$store.dispatch('sidebar_open', true);
                this.$store.dispatch('full_theme', true);
            } else {
                this.$store.dispatch('sidebar_open', false);
                this.$store.dispatch('full_theme', false);
            }

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
        }
    },
    components: {
        Sidebar,
        Conversations
    }
}
</script>

<style lang="scss">
    
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

		#toolbar_inner {
			max-width: 950px;
			height: 100%;

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
	}
	
	#wrapper {
        #content {
            display: inline-block;
			transition: ease-in-out margin-left 0.5s;
			max-width: 950px;
			min-height: 380px;
			margin-top: 56px;
			margin-left: $sidebar_margin; /* TODO, should be dynamic */
            vertical-align: top;

            @media (max-width: $mini_width) {
                & {
                    margin-left: 0px;
                }
            }
		}
	}

</style>
