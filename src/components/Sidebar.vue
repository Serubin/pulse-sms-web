<template>
    <div id="sidebar">
        <div id="drawer-holder">
            <ul id="drawer-links">
                <li id="conversations-link">
                    <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect">
                        <img src="../assets/images/holder.gif" width="24" height="24" class="icon_conversations">
                    Conversations
                    </div>
                </li>
                <li id="archive-link">
                    <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect">
                        <img src="../assets/images/holder.gif" width="24" height="24" class="icon_archive">
                        Archive
                    </div>
                </li>
                <li id="scheduled_messages_link">
                    <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect">
                        <img src="../assets/images/holder.gif" width="24" height="24" class="icon_scheduled_messages">
                        Scheduled Messages
                    </div>
                </li>
                <li id="blacklist_link">
                    <div class="link-card mdl-card mdl-js-button mdl-js-ripple-effect">
                        <img src="../assets/images/holder.gif" width="24" height="24" class="icon_blacklist">
                        Blacklist
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: 'app-sidebar',
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
</style>
