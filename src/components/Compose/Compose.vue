<template>
    <div class="page-content">
        <RecipientBar :onContactListChanged="onContactListChanged"/>
        <Sendbar :onSend="sendMessage" :loading="sending" />
    </div>
</template>

<script>
import Vue from 'vue'

import { Api, Crypto, Util } from "@/utils/"
import Sendbar from '../Thread/Sendbar.vue'
import RecipientBar from './RecipientBar.vue'

export default {
    name: 'compose',

    mounted () {
        this.$store.commit('colors_default', this.$store.state.theme_global_default)
        this.$store.commit('colors_dark', this.$store.state.theme_global_dark)
        this.$store.commit('colors_accent', this.$store.state.theme_global_accent)

        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);
    },

    data () {
        return {
            title: 'Compose',
            sending: false,
            selectedContacts: [],
        }
    },

    methods: {
        onContactListChanged(list) {
            this.selectedContacts = list;
        },
        sendMessage(message) {
            let to = "";

            if (this.selectedContacts.length <= 0)
                return Util.Snackbar("No recipient");

            this.selectedContacts.map((value) => { // Concat selected contacts
                to += value.phone + ",";
            });

            to = to.slice(0, to.length - 1); // Remove trailing comma
            this.sending = true;

            // send image, if one is attached
            if (this.$store.state.loaded_media) {
                let _this = this;
                Api.sendFile(this.$store.state.loaded_media, (file, messageId) => {
                    Api.createThreadWithImage(to, messageId, file.type);
                });
            }

            if (message.length > 0) {
                Api.createThread(to, message);
            }

            setTimeout(() => {
                Api.fetchConversations("index_unarchived")
                    .then((resp) => {
                        this.$router.push('/');

                        // This worked well to push you to the first conversation in the list, but what if
                        // the user has pinned conversations? It is difficult to know which one you just sent
                        // the message to, especially considering that there is no guarentee that Firebase
                        // delivered the message to the phone, the phone sent it, and the backend updated
                        // within this second and a half.
                        // it is safer to push to the base index, instead of a thread.

                        // const thread_id = resp[0].device_id;
                        //
                        // this.$router.push({
                        //     name:  'thread', params: { threadId: thread_id, isRead: true }
                        // });
                    });
            }, 1500);
        }
    },

    components: {
        RecipientBar,
        Sendbar,
    }

}
</script>

<style lang="scss" scoped>

    @import "../../assets/scss/_vars.scss";

</style>
