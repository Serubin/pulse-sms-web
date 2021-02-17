<template>
    <div>
        <!-- sidebar-outer-holder -->
        <div id="sidebar" :style="marginLeft">
            <!-- Sidebar-internal -->
            <div id="drawer-holder">
                <ul id="drawer-links">
                    <li id="conversations-link" @click="routeTo('conversations')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('conversations') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon conversations">
                            {{ $t('sidebar.conversations') }}
                            <span v-if="display_unread">
                                ({{ unread_count }})
                            </span>
                        </div>
                    </li>
                    <li id="unread-link" @click="routeTo('unread')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('unread') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon unread">
                            {{ $t('sidebar.unreadconversations') }}
                        </div>
                    </li>
                    <li id="private-link" @click="routeTo('private')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('private') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon private">
                            {{ $t('sidebar.privateconversations') }}
                        </div>
                    </li>
                    <li id="archive-link" @click="routeTo('archive')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('archive') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon archive">
                            {{ $t('sidebar.archive') }}
                        </div>
                    </li>
                    <li id="folder-link" @click="routeTo('folders')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('folders') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon folders">
                            {{ $t('sidebar.folders') }}
                        </div>
                    </li>
                    <li id="scheduled-messages-link" @click="routeTo('scheduled')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('scheduled') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon scheduled_messages">
                            {{ $t('sidebar.scheduled') }}
                        </div>
                    </li>
                    <li id="templates-link" @click="routeTo('templates')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('templates') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon templates">
                            Templates
                        </div>
                    </li>
                    <li id="blacklist-link" @click="routeTo('blacklists')">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect" :class="{ active: is_active('blacklists') }">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon blacklist">
                            {{ $t('sidebar.blacklist') }}
                        </div>
                    </li>
                    <li v-if="showConversations">
                        <div class="link-card mdl-card">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon search">
                            <input id="search-bar" v-model="searchQuery" class="quick_find fixed_pos" type="text text_box" :placeholder="$t('sidebar.searchconversations')" autocomplete="off" autocorrect="off" spellcheck="false">
                        </div>
                    </li>
                </ul>
                <!-- If route is not conversation list -->

                <transition name="slide-left">
                    <conversations v-if="showConversations" small="true" />
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

import Conversations from '@/components/Conversations/';
import { Util } from '@/utils';

export default {
    name: 'Sidebar',

    components: {
        Conversations
    },

    data () {
        return {
            links: {
                conversations: { name: 'conversations-list' },
                unread: { name: 'conversations-list-unread' },
                archive: { name: 'conversations-list-archived' },
                blacklists: { name: 'blacklists' },
                private: { name: 'conversations-list-private' },
                folders: { name: 'folders' },
                scheduled: { name: 'scheduled-messages' },
                templates: { name: 'templates' }
            },
            listeners: [],
            searchQuery: ''
        };
    },

    computed: {
        marginLeft () { // Handles margins
            if (this.open) {
                return 'margin-left: 0px;';
            } else {
                return 'margin-left: -269px;';
            }
        },
        open () { // Sidebar_open state
            return this.$store.state.sidebar_open;
        },
        full_theme () { // Full_theme state
            return this.$store.state.full_theme;
        },
        showConversations () {
            return this.$route.name !== 'conversations-list' &&
                this.$store.state.account_id !== '';
        },
        display_unread () {
            return this.$store.state.unread_count_in_sidebar;
        },
        unread_count () {
            return this.$store.state.unread_count;
        }
    },

    watch: {

        'searchQuery' (to) {
            this.$store.state.msgbus.$emit('searchUpdated', to);
        }

    },

    mounted () {
        const sidebar = this.$el.querySelector('#sidebar');
        const events = Util.addEventListeners(['mousewheel', 'DOMMouseScroll'], (e) => {
            const scrollTop = sidebar.scrollTop;
            const scrollHeight = sidebar.scrollHeight;
            const height = sidebar.offsetHeight;
            const delta = e.wheelDelta;
            const up = delta > 0;

            const prevent = function () {
                e.stopPropagation();
                e.preventDefault();
                e.returnValue = false;
                return false;
            };

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

    methods: {
        /**
         * route to
         * Handles routing and closes drawer
         *
         * @param link - link to route too
         */
        routeTo (link) {
            this.close_drawer();
            this.$router.push(this.links[link]).catch(() => {});
            this.searchQuery = '';
        },

        /**
         * close drawer
         * Closes drawer if closeable
         */
        close_drawer () {
            if (!this.full_theme) {
                this.$store.commit('sidebar_open', false);
            }
        },

        /**
         * is active
         * Determines if a link is active based on route
         */
        is_active (route) {
            if (route === 'conversations' &&
                (this.$route.name === 'conversations-list' || this.$route.name === 'thread')) {
                return true;
            }

            if (route === 'unread' &&
                (this.$route.name === 'conversations-list-unread')) {
                return true;
            }

            if (route === 'private' &&
                (this.$route.name === 'passcode' || this.$route.name === 'conversations-list-private')) {
                return true;
            }

            if (route === 'archive' &&
                (this.$route.name === 'conversations-list-archived' || this.$route.name === 'thread-archived')) {
                return true;
            }

            if (route === 'folders' &&
                (this.$route.name === 'folders' || this.$route.name === 'conversations-list-folder')) {
                return true;
            }

            if (route === 'scheduled' &&
                (this.$route.name === 'scheduled-messages' || this.$route.name === 'create-scheduled-message' || this.$route.name === 'edit-scheduled-message')) {
                return true;
            }

            if (route === 'blacklists' &&
                (this.$route.name === 'blacklists' || this.$route.name === 'create-blacklist')) {
                return true;
            }

            if (route === 'templates' &&
                (this.$route.name === 'templates' || this.$route.name === 'create-template')) {
                return true;
            }

            return false;
        }
    }
};
</script>

<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    body.dark #sidebar {
        background-color: $bg-dark;

        .quick_find {
            color: white;
        }

        .quick_find::placeholder {
            color: white;
        }

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

            &.unread {
                background: url(../assets/images/vector/unread-dark.svg) 0 0 no-repeat !important;
            }

            &.folders {
                background: url(../assets/images/vector/folder-dark.svg) 0 0 no-repeat !important;
            }

            &.blacklist {
                background: url(../assets/images/vector/blacklist-dark.svg) 0 0 no-repeat !important;
            }

            &.search {
                background: url(../assets/images/vector/search-dark.svg) 0 0 no-repeat !important;
            }

            &.templates {
                background: url(../assets/images/vector/templates-dark.svg) 0 0 no-repeat !important;
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
            width: 245px;
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
                padding: 2px;

                .link-card {
                    display: block;
                    min-height: 26px;
                    width: 100%;
                    cursor: pointer;
                    background-color: $bg-light;
                    padding: 7px 0;

                    img {
                        margin-left: 12px;
                        margin-top: -4px;
                        margin-right: 9px;
                    }

                    &.active {
                        background-color: rgba(255,255,255,0.98);
                        border-radius: 4px 20px 20px 4px;
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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

                    &.unread {
                        background: url(../assets/images/vector/unread.svg) 0 0 no-repeat;
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

                    &.search {
                        background: url(../assets/images/vector/search.svg) 0 0 no-repeat;
                    }

                    &.templates {
                        background: url(../assets/images/vector/templates.svg) 0 0 no-repeat;
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

    #quick_find {
      white-space: nowrap;
      padding-top: 5px;
      text-align: right;
    }

    .quick_find {
      margin-top: 3px;
      border: 0px solid white;
      font-size: 16px;
      background-color: transparent;
      color: black;
      background-position: 10px 10px;
      background-repeat: no-repeat;
      -webkit-transition: width 0.4s ease-in-out;
      transition: width 0.4s ease-in-out;
    }

    .quick_find:focus {
      outline: none !important;
    }

    .quick_find::placeholder {
        color: black;
    }
</style>
