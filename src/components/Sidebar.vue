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
    #sidebar {
        box-shadow: rgba(0, 0, 0, 0.15) 8px -10px 2px -6px;
        transition: ease-in-out margin-left 0.5s;
        float: left;
        width: 250px;
        position: fixed;
        overflow-x: hidden;
        overflow-y: hidden;
        z-index: 3;
        border-right: 1px solid #f1f1f1;
        background-color: #f3f3f3;

        &:hover {
            overflow-y: auto;
        }

        #drawer-holder {
            width: 230px;
            padding-bottom: 30px;
        }
	
        #drawer-link li{
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
            }
        }
    }   
</style>
