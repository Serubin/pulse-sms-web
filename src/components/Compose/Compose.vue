<template>
    <div class="page-content">
        <RecipientBar :on-contact-list-changed="onContactListChanged" />
        <Sendbar :on-send="sendMessage" :loading="sending" />
    </div>
</template>

<script>
import { i18n } from '@/utils';

import { Api, Util } from "@/utils/";
import Sendbar from '../Thread/Sendbar.vue';
import RecipientBar from './RecipientBar.vue';

export default {
    name: 'Compose',

    components: {
        RecipientBar,
        Sendbar,
    },

    data () {
        return {
            title: 'Compose',
            sending: false,
            selectedContacts: [],
        };
    },

    mounted () {
        this.$store.commit('colors_default', this.$store.state.theme_global_default);
        this.$store.commit('colors_dark', this.$store.state.theme_global_dark);
        this.$store.commit('colors_accent', this.$store.state.theme_global_accent);

        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);
    },

    methods: {
        onContactListChanged(list) {
            this.selectedContacts = list;
        },
        sendMessage(message) {
            let to = "";

            if (this.selectedContacts.length <= 0)
                return Util.Snackbar(i18n.t('compose.norecipient'));

            this.selectedContacts.map((value) => { // Concat selected contacts
                to += value.phone + ",";
            });

            to = to.slice(0, to.length - 1); // Remove trailing comma
            this.sending = true;

            // send image, if one is attached
            if (this.$store.state.loaded_media) {
                Api.messages.media.send(this.$store.state.loaded_media, (file, messageId) => {
                    Api.conversations.createWithImage(to, messageId, file.type);
                });
            }

            if (message.length > 0) {
                Api.conversations.create(to, message);
            }

            setTimeout(() => {
                this.$router.push('/');
            }, 1500);
        },
    }

};
</script>

<style lang="scss" scoped>

    @import "../../assets/scss/_vars.scss";

    .page-content {
        height: calc(100vh - 145px);
    }

</style>
