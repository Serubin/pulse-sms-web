<template>
    <div> <!-- sidebar-outer-holder -->
        <div id="sidebar" v-bind:style="marginLeft"> <!-- Sidebar-internal -->
            <div id="drawer-holder">
                <ul id="drawer-links">
                    <li id="conversations-link" @click="close_drawer">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon_conversations">
                        Conversations
                        </div>
                    </li>
                    <li id="archive-link" @click="close_drawer">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon_archive">
                            Archive
                        </div>
                    </li>
                    <li id="scheduled_messages_link" @click="close_drawer">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon_scheduled_messages">
                            Scheduled Messages
                        </div>
                    </li>
                    <li id="blacklist_link" @click="close_drawer">
                        <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect">
                            <img src="../assets/images/holder.gif" width="24" height="24" class="icon_blacklist">
                            Blacklist
                        </div>
                    </li>
                </ul>
            </div>
        </div> <!-- End sidebar-internal -->

        <transition name="fade">
            <div v-if="!full_theme && open" id="sidebar-overlay" @click="close_drawer"></div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'app-sidebar',
    props: ['open', 'full_theme'],
    methods: {
        close_drawer() {
            if(!this.full_theme)
                this.$emit('update:sidebar_open', false)
        }
    },
    computed: {
        marginLeft () {
            if(this.open)
                return "margin-left: 0px;";
            else
                return "margin-left: -269px;";
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    #sidebar {
        box-shadow: rgba(0, 0, 0, 0.15) 8px -10px 2px -6px;
        transition: ease-in-out margin-left 0.5s;
        float: left;
        width: 250px;
        height:100vh;
        position: fixed;
        overflow-x: hidden;
        overflow-y: hidden;
        z-index: 3;
        border-right: 1px solid #f1f1f1;
        background-color: #f3f3f3;
        
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
                    background-color: #f3f3f3;
                    padding: 7px 0;

                    img {
                        margin-left: 3px;
                        margin-top: -4px;
                        margin-right: 18px;
                    }
                }
                /* Icons */
                .icon_conversations {
                    background: url(../assets/images/vector/inbox.svg) 0 0 no-repeat;
                    width: 24px;
                    height: 24px;
                }

                .icon_archive {
                    background: url(../assets/images/vector/archive.svg) 0 0 no-repeat;
                    width: 24px;
                    height: 24px;
                }
                
                .icon_scheduled_messages {
                    background: url(../assets/images/vector/scheduled_messages.svg) 0 0 no-repeat;
                    width: 24px;
                    height: 24px;
                }
                
                .icon_blacklist {
                    background: url(../assets/images/vector/blacklist.svg) 0 0 no-repeat;
                    width: 24px;
                    height: 24px;
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

</style>
