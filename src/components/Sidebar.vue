<template>
    <div> <!-- sidebar-outer-holder -->
        <div id="sidebar" v-bind:style="marginLeft"> <!-- Sidebar-internal -->
            <div id="drawer-holder">
                <ul id="drawer-links">
                    <li id="conversations-link" @click="routeTo('conversations')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('conversations') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon conversations">
                            Conversations
                        </div>
                    </li>
                    <li id="private-link" @click="routeTo('private')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('private') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon private">
                            Private Conversations
                        </div>
                    </li>
                    <li id="archive-link" @click="routeTo('archive')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('archive') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon archive">
                            Archive
                        </div>
                    </li>
                    <li id="folder-link" @click="routeTo('folders')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('folders') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon folders">
                            Folders
                        </div>
                    </li>
                    <li id="scheduled-messages-link" @click="routeTo('scheduled')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('scheduled') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon scheduled_messages">
                            Scheduled Messages
                        </div>
                    </li>
                    <li id="blacklist-link" @click="routeTo('blacklists')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('blacklists') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon blacklist">
                            Blacklist
                        </div>
                    </li>
                </ul>
                <!-- If route is not conversation list -->

                <transition name="slide-left">
                    <conversations v-if="showConversations" small="true"></conversations>
                </transition>
                <!-- End if -->

            </div>
        </div> <!-- End sidebar-internal -->

        <!-- If not full_theme and side bar is open -->
        <transition name="fade">
            <div v-if="!full_theme && open" id="sidebar-overlay" @click="close_drawer"></div>
        </transition>
        <!-- End if -->

    </div>
</template>

<script>

import Conversations from '@/components/Conversations/'
import { Util } from '@/utils'

export default {
    name: 'sidebar',

    mounted () {
        let sidebar = this.$el.querySelector("#sidebar");
        let events = Util.addEventListeners(['mousewheel', 'DOMMouseScroll'], (e) => {
            var scrollTop = sidebar.scrollTop,
                scrollHeight = sidebar.scrollHeight,
                height = sidebar.offsetHeight,
                delta = e.wheelDelta,
                up = delta > 0;

            var prevent = function() {
                e.stopPropagation();
                e.preventDefault();
                e.returnValue = false;
                return false;
            }

            if (!up && -delta > scrollHeight - height - scrollTop) {
                // Scrolling down, but this will take us past the bottom.
                sidebar.scrollTop = scrollHeight;
                return prevent();
            } else if (up && delta > scrollTop) {
                // Scrolling up, but this will take us past the top.
                sidebar.scrollTop = 0;
                return prevent();
            }
        }, sidebar);

        this.listeners.extend(events);
    },

    beforeDestroy () {
        Util.removeEventListeners(this.listeners);
    },

    data () {
        return {
            links: {
                'conversations': { name: 'conversations-list'},
                'archive': { name: 'conversations-list-archived'},
                'blacklists': { name: 'blacklists'},
                'private': { name: 'conversations-list-private' },
                'folders': { name: 'folders' },
                'scheduled': { name: 'scheduled-messages' }
            },
            listeners: []
        }
    },

    methods: {
        /**
         * route to
         * Handles routing and closes drawer
         *
         * @param link - link to route too
         */
        routeTo (link) {
            this.close_drawer()
            this.$router.push(this.links[link])
        },

        /**
         * close drawer
         * Closes drawer if closeable
         */
        close_drawer() {
            if(!this.full_theme)
                this.$store.commit('sidebar_open', false);
        },

        /**
         * is active
         * Determines if a link is active based on route
         */
        is_active(route) {
            if (route == 'conversations' &&
                (this.$route.name == 'conversations-list' || this.$route.name == 'thread'))
                return true;

            if (route == 'private' &&
                (this.$route.name == 'passcode' || this.$route.name == 'conversations-list-private'))
                return true;

            if (route == 'archive' &&
                (this.$route.name == 'conversations-list-archived' || this.$route.name == 'thread-archived'))
                return true;

            if (route == 'folders' &&
                (this.$route.name == 'folders' || this.$route.name == 'conversations-list-folder'))
                return true;

            if (route == 'scheduled' &&
                (this.$route.name == 'scheduled-messages' || this.$route.name == 'create-scheduled-message' || this.$route.name == 'edit-scheduled-message'))
                return true;

            if (route == 'blacklists' &&
                (this.$route.name == 'blacklists' || this.$route.name == 'create-blacklist'))
                return true;

            return false;
        }
    },

    computed: {
        marginLeft () { // Handles margins
            if(this.open)
                return "margin-left: 0px;";
            else
                return "margin-left: -269px;";
        },
        open () { // Sidebar_open state
            return this.$store.state.sidebar_open;
        },
        full_theme () { // Full_theme state
            return this.$store.state.full_theme;
        },
        showConversations () {
            return this.$route.name != 'conversations-list'
                && this.$store.state.account_id != '';
        }
    },

    components: {
        Conversations
    }
}
</script>

<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    body.dark #sidebar {
        background-color: $bg-dark;

        #drawer-links li .link-card {
            background-color: $bg-dark;
            color: #fff;

            &.active {
                background-color: rgba(0,0,0,0.35);
            }
        }

        .icon {
            &.scheduled_messages {
                background: url(../assets/images/vector/scheduled_messages-dark.svg) 0 0 no-repeat !important;
            }

            &.conversations {
                background: url(../assets/images/vector/inbox-dark.svg) 0 0 no-repeat !important;
            }

            &.archive {
                background: url(../assets/images/vector/archive-dark.svg) 0 0 no-repeat !important;
            }

            &.private {
                background: url(../assets/images/vector/private-dark.svg) 0 0 no-repeat !important;
            }

            &.folders {
                background: url(../assets/images/vector/folder-dark.svg) 0 0 no-repeat !important;
            }

            &.blacklist {
                background: url(../assets/images/vector/blacklist-dark.svg) 0 0 no-repeat !important;
            }
        }
    }

    body.black #sidebar {
        background-color: $bg-black;

        #drawer-links li .link-card {
            background-color: $bg-black;
            color: #fff;

            &.active {
                background-color: rgb(35,35,35);
            }
        }
    }

    #sidebar {
        transition: ease-in-out margin-left $anim-time;
        float: left;
        width: 250px;
        height:100vh;
        padding-top: 50px;
        position: fixed;
        overflow-x: hidden;
        overflow-y: hidden;
        z-index: 3;
        background-color: $bg-light;

        &:hover {
            overflow-y: auto;
        }

        @media (max-width: $mini_width) {
            & {
                margin-left: -$sidebar_margin;
            }
        }

        #drawer-holder {
            width: 230px;
            padding-bottom: 30px;
        }

        #drawer-links {
            margin: 0;
            padding: 0;
            padding-left: 12px;
            padding-top: 24px;
            margin-bottom: 21px;

            li {
                font-size: 14px;
                line-height: 26px;
                list-style: none;
                cursor: pointer;
                margin-bottom: 2px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;


                .link-card {
                    display: block;
                    min-height: 26px;
                    width: 100%;
                    cursor: pointer;
                    background-color: $bg-light;
                    padding: 7px 0;

                    &.active {
                        background-color: rgba(255,255,255,0.98);
                        border-radius: 4px 20px 20px 4px;
                    }

                    img {
                        margin-left: 12px;
                        margin-top: -4px;
                        margin-right: 9px;
                    }
                }
                /* Icons */
                .icon {
                    width: 24px;
                    height: 24px;

                    &.conversations {
                        background: url(../assets/images/vector/inbox.svg) 0 0 no-repeat;
                    }

                    &.archive {
                        background: url(../assets/images/vector/archive.svg) 0 0 no-repeat;
                    }

                    &.private {
                        background: url(../assets/images/vector/private.svg) 0 0 no-repeat;
                    }

                    &.folders {
                        background: url(../assets/images/vector/folder.svg) 0 0 no-repeat;
                    }

                    &.scheduled_messages {
                        background: url(../assets/images/vector/scheduled_messages.svg) 0 0 no-repeat;
                    }

                    &.blacklist {
                        background: url(../assets/images/vector/blacklist.svg) 0 0 no-repeat;
                    }
                }
            }
        }
    }
    /* Click catcher - Overlay */
    #sidebar-overlay {
        opacity: 0.2;
        z-index: 2;
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        background: black;

    }

    /* Opacity fade **/
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0 !important;
    }

    /* Slide fade */
    .slide-left-enter-active, .slide-left-leave-active {
        transition: all .3s ease;
    }
    .slide-left-enter, .slide-left-leave-to {
        transform: translateX(-$sidebar_margin);
        opacity: 0;
    }
</style>
