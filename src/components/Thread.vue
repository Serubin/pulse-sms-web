<template>
    <div id="thread-wrap">
        <div class="page-content" id="message-list">
            <spinner></spinner>
            <!-- messages will be inserted here -->

            {{ $route.params.id }}
        </div>

        <div class="send-bar">
            <div class="send-bar-inner" id="sendbar">
                <input id="attach" class="mdl-button mdl-js-button mdl-button--icon attach-button" type="image" src="../assets/images/ic_attach.png"/>
                <input id="emoji" class="mdl-button mdl-js-button mdl-button--icon emoji-button" type="image" src="../assets/images/ic_mood.png"/>
                <div class="entry mdl-textfield mdl-js-textfield">
                    <textarea class="mdl-textfield__input disabled" type="text" id="message-entry" autofocus></textarea>
                    <label class="mdl-textfield__label" for="message-entry">Type message...</label>
                </div>
                <!-- fab with correct colors will be inserted here -->
                <button class="send mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored mdl-js-ripple-effect" id="send-button">
                    <i class="material-icons md-18 material-icons-white">send</i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>

import Spinner from '@/components/Spinner.vue'

export default {
    name: 'thread',

    components: {
        Spinner,
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";
    
    .send-bar {
        height: auto;
        width: 100%;
        margin: auto;
        position: fixed;
        bottom: 0%;
        clear: both;
        transition: ease-in-out width $anim-time;
    }

    .send-bar-inner {
        background: #fafafa;
        height: 100%;
        margin: auto;
        padding-left: 16px;
        padding-right: 16px;
        border-radius: 2px;
        
        .entry {
            width: calc(100% - 108px);
            margin-top: -4px;
        }

        .send {
            float: right;
            margin-top: 8px;
        }

        .attach-button {
            float: left;
            text-align: center;
            margin-top: 15px;
            min-width: 0px;
            width: 28px;
            height: 28px;
            opacity: .56;
            margin-right: 8px;
        }

        .emoji-button {
            float: left;
            text-align: center;
            margin-top: 18px;
            min-width: 0px;
            width: 24px;
            height: 24px;
            opacity: .56;
            margin-right: 8px;
        }
    }

    #message-entry {
        height: 24px;
        resize: none;
    }
</style>
