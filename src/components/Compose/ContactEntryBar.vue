<template>
    <multi-list-select id="multiselect" :list="contacts" option-value="phone" option-text="nameNormalized" :selected-items="selectedContacts" :custom-text="optionText" :placeholder="$t('compose.type')" @searchchange="searchChanged" @select="onSelect" />
</template>

<script>
import Vue from 'vue';
import { MultiListSelect } from 'vue-search-select';
import { i18n, Api, Util, SessionCache } from "@/utils/";

export default {
    name: 'ContactEntryBar',
    components: {
        MultiListSelect
    },
    props: ['onContactListChanged'],

    data () {
        return {
            contacts: [],
            selectedContacts: [],
            currentlyTyped: undefined,
        };
    },

    mounted () {
        this.queryContacts();
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);
        this.$el.querySelector('#multiselect').click();
        this.$el.querySelector('#multiselect').addEventListener('blur', () => {
            this.searchChanged(this.currentlyTyped, true);
        });
    },

    beforeDestroy () {
        this.$store.state.msgbus.$off('refresh-btn', this.refresh);
    },

    methods: {
        /**
         * select an entry in the auto-complete.
         */
        onSelect (contacts, skipFocus = false) {
            this.currentlyTyped = undefined;
            this.selectedContacts = contacts;
            this.onContactListChanged(contacts);

            if (skipFocus) {
                return;
            }

            Vue.nextTick(() => {
                this.$el.querySelector('#multiselect').click();
            });
        },
        /**
         * compute the display text used in the search result
         */
        optionText (contact) {
            if (!contact.id) {
                return contact.phone;
            }
            let display = contact.name + ' ' + contact.phone;
            if (contact.type) {
                switch (contact.type) {
                    case -1:
                        break;
                    case 0:
                        display = display + ' (' + i18n.t('contact.group') + ')';
                        break;
                    case 1:
                        display = display + ' (' + i18n.t('contact.home') + ')';
                        break;
                    case 2:
                        display = display + ' (' + i18n.t('contact.mobile') + ')';
                        break;
                    case 3:
                        display = display + ' (' + i18n.t('contact.work') + ')';
                        break;
                    default:
                        display = display + ' (' + i18n.t('contact.other') + ')';
                        break;
                }
            }
            return display;
        },
        /**
         * re-download the contacts from the backend.
         */
        refresh() {
            this.queryContacts(true);
        },
        /**
         * query contacts from backend or cache.
         */
        queryContacts (clearCache = false) {
            if (clearCache) {
                Util.snackbar(i18n.t('compose.downloading'));
                SessionCache.invalidateContacts();
            }

            Api.contacts.get().then((resp) => this.processContacts(resp));
        },
        /**
        * Process contacts received from server
        * Saves contacts in contacts array
        * Also starts recipient processing
        * @param data, contact request result
        */
        processContacts(response) {
            const matchers = [];
            const duplicates = [];
            const contactsShown = [];

            for (let contact of response) {
                let matcher = Util.createIdMatcher(contact.phone_number);
                if (matchers.indexOf(matcher) >= 0) {
                    // Track duplicates and mark for removal
                    duplicates[duplicates.length] = contact.id;
                    continue;
                } else {
                    matchers[matchers.length] = matcher;
                }

                if (contact.name !== contact.phone_number) {
                    this.contactsShown.push(matcher);
                    this.contacts.push({
                        'id': contact.id,
                        'name': contact.name,
                        'nameNormalized': this.stripUnicode(contact.name),
                        'phone': contact.phone_number,
                        'type': contact.contact_type
                    });
                }
            }

            // Sometimes, duplicate contacts come up. Not sure why this happens,
            // so, we just delete the duplicates instead....
            if (duplicates.length > 0) {
                let idString = "";
                for (var i = 0; i < duplicates.length && i < 100; i++) {
                    idString += duplicates[i];
                    if (i != duplicates.length - 1) {
                        idString += ",";
                    }
                }

                Api.contacts.delete(idString);
            }

            // We also want to add any of the current conversations.
            // Contacts are not refreshed automatically, so, if the user has a conversation active, but hasn't downloaded the
            // actual contact record, we still want to make it available for them on the compose screen.
            // This is just for convienence. We will use the conversations in the cache.
            const conversations = SessionCache.getConversations('index_public_unarchived');
            if (conversations) {
                // If the user goes directly to the compose page, the conversations would be undefined, since none are cached.
                for (let conversation of conversations) {
                    if (!conversation.phone_numbers || conversation.phone_numbers.indexOf(',') > -1) {
                        // ignore group conversations, for now, since we can't create matchers for them.
                        continue;
                    }

                    let matcher = Util.createIdMatcher(conversation.phone_numbers);
                    // if already shown then don't show again
                    if (contactsShown.indexOf(matcher) >= 0) {
                        continue;
                    }

                    const id = Api.generateId();
                    this.contacts.push({
                        'id': id,
                        'name': conversation.title,
                        'nameNormalized': this.stripUnicode(conversation.title),
                        'phone': conversation.phone_numbers,
                        'type': undefined
                    });
                }
            }
        },
        /**
         * Allows the user to search for a name containing an 'é' (or other accents)
         * by typing 'e'.
         */
        stripUnicode (input) {
            return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        },
        /**
         * Allows us to tokenize any phone numbers that the user enters, that aren't 
         * in their contact list.
         */
        searchChanged (input, forceTokenize = false) {
            if (!input) {
                return;
            }

            this.currentlyTyped = input;
            if (input.indexOf(";") > 0 || input.indexOf(",") > 0 || (forceTokenize && this.currentlyTyped.length > 0)) {
                let split = input.split(/;|,/g); // split using ";" or ","
                split.forEach((entry) => {
                    if (entry.length > 0) {
                        entry = entry.replace(/ /g, "");
                        this.selectedContacts.push({ 'phone': entry });
                    }
                });
                Vue.nextTick(() => {
                    this.currentlyTyped = undefined;
                    this.$el.querySelector('#multiselect').blur();
                    this.onSelect(this.selectedContacts, forceTokenize);
                });
            }
        }
    },
};
</script>

<style lang="scss">

@import "../../assets/scss/_vars.scss";

body.dark {
    .ui.selection.dropdown {
        background: #202024;
        color: rgba(255,255,255,.87);
    }

    .ui.selection.active.dropdown {
        border-color: transparent;
    }

    .ui.selection.active.dropdown .menu {
        border-color: transparent;
    }

    .ui.dropdown .menu {
        background: #202024;
    }

    .ui.dropdown .menu .item {
        color: rgba(255,255,255,.87);
    }

    .ui.dropdown .menu>.item {
        border-top: 1px solid #181818;
    }

    .ui.multiple.search.dropdown>input.search {
        color: rgba(255,255,255,.87);
    }
}

</style>