<template>
    <div id="compose-head">
        <div class="mdl-card__title" >
            <div id="chip-insert">
                <ContactChip v-for="selected in Object.values(selectedContacts)" :contact="selected" :key="selected.id" :onDelete="removeContact" />
            </div>
            <div class="mdl-textfield mdl-js-textfield" id="recipient-wrap" :class="is_dirty" v-mdl>
                <input class="mdl-textfield__input" type="text" id="recipient" v-model="recipient" @blur="inputToChips" @keydown.delete="deleteKey" autofocus>
                <label class="mdl-textfield__label" for="recipient">Type contact...</label>
            </div>
            <div id="border"></div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'

import '@/lib/auto-complete.min.js'
import ContactChip from './ContactChip.vue'
import { Api, Crypto, Util, SessionCache } from "@/utils/"

export default {
    name: 'RecipientBar',
    props: ['onContactListChanged'],

    mounted () {
        this.queryContacts();
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);
    },

    beforeDestroy () {
        if (this.autocomplete != null) {
            this.autocomplete.destroy();
        }

        this.$store.state.msgbus.$off('refresh-btn');
    },

    data () {
        return {
            contacts: {},
            recipient: "",
            selectedContacts: [],
            autocomplete: null,
        }
    },

    methods: {
        refresh() {
            console.log("refresh compose");
            this.queryContacts(true);
        },
        /**
         * query contacts from backend or cache.
         */
        queryContacts (clearCache = false) {
            if (clearCache) {
                Util.snackbar("Downloading contacts... This may take a minute.");
                SessionCache.invalidateContacts();
            }

            Api.fetchContacts().then((resp) => this.processContacts(resp));
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

            for (let contact of response) {
                let matcher = Util.createIdMatcher(contact.phone_number);
                if (matchers.indexOf(matcher) >= 0) {
                    // Track duplicates and mark for removal
                    duplicates[duplicates.length] = contact.id;
                    continue;
                } else {
                    matchers[matchers.length] = matcher;
                }

                this.contacts[contact.id] = {
                    'id': contact.id,
                    'name': contact.name,
                    'phone': contact.phone_number
                };
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

                Api.removeContact(idString);
            }

            let matcher = this.matchContact;
            let addContact = this.addContact;

            this.autocomplete = new autoComplete({
                selector: this.$el.querySelector("#recipient"),
                minChars: 2,
                source: function(term, suggest) { suggest(matcher(term)); },
                renderItem: function (contact, search) {
                    if (contact.id == null) {
                        return '<div class="autocomplete-suggestion">Can\'t find your contact?</div>';
                    } else {
                        return '<div class="autocomplete-suggestion" data-val="' + contact.name + '" data-id="' + contact.id + '" data-name="' + contact.name + '" data-phone="' + contact.phone + '">' + contact.name + ' (' + contact.phone + ')' + '</div>';
                    }
                },
                onSelect: function(e, term, rendered) {
                    let id = rendered.getAttribute('data-id');
                    if (id == null) {
                        window.open("https://github.com/klinker-apps/messenger-issues/issues/740", '_blank');
                    } else {
                        addContact({
                            'id': id,
                            'name': rendered.getAttribute('data-name'),
                            'phone': rendered.getAttribute('data-phone')
                        });
                    }
                }
            });
        },
        matchContact (input) {
            input = input.toLowerCase()
            let list = Object.values(this.contacts).filter((data) => {
                if (data.name.toLowerCase().indexOf(input) > -1 || data.phone.indexOf(input) > -1)
                    return data;
            });

            // the blank object will be used to tell the search to add the "Can't find your contact?" text
            list[list.length] = { }
            return list;
        },
        /**
         * This takes in the input that is currently in the input box, and converts it to chips.
         * This function runs when the input box loses focus.
         * The separators are ";" and "," (semi-colon or comma).
         */
        inputToChips () {
            let enteredText = this.$el.querySelector("#recipient").value;
            if (enteredText.length > 0) {
                let split = enteredText.split(/;|,/g); // split using ";" or ","
                split.forEach((contact, i) => {
                    if (contact.length > 0) {
                        contact = contact.replace(/ /g, "");
                        this.addContact({
                            'id': contact,
                            'name': contact,
                            'phone': contact
                        });
                    }
                });
            }
        },
        /**
         * When the delete key is pressed, and there is no text inputted, delete the last chip.
         */
        deleteKey () {
            let textLength = this.$el.querySelector("#recipient").value.length;
            let contactsLength = this.selectedContacts.length;

            if (textLength == 0 && contactsLength > 0) {
                this.removeContact(this.selectedContacts[contactsLength - 1])
            }
        },
        addContact (contact) {
            this.matchList = [];
            this.recipient = "";

            if (this.selectedContacts.indexOf(contact) != -1)
                return Util.snackbar(contact.name + " has already been added");

            this.selectedContacts.push(contact);

            this.notifyContactListUpdated();
        },
        removeContact (contact) {
            const index = this.selectedContacts.indexOf(contact);
            this.selectedContacts.splice(index, 1);

            this.notifyContactListUpdated();
        },
        notifyContactListUpdated () {
            this.onContactListChanged(this.selectedContacts);
        }
    },
    computed: {
        is_dirty () { // Is dirty fix for mdl
            if (this.recipient.length > 0)
                return "is-dirty";
            return "";
        },
    },
    components: {
        ContactChip,
    }
}
</script>

<style lang="scss" scoped>

    @import "../../assets/scss/auto-complete.css";
    @import "../../assets/scss/_vars.scss";

    #recipient {
        border-bottom: 1px solid rgba(0,0,0,0);
    }

    #compose-head {
        width: 100%;
        overflow: visible;
        transition: ease-in-out width 0.5s;
        background: transparent;

        .mdl-card__title {
            padding: 0;
            overflow-x: scroll;
            overflow-y: hidden;
            white-space: nowrap;
        }

        #recipient-wrap {
            display: inline-block;
        }

        .mdl-textfield {
            max-width: 600px;
            min-width: 600px;
            width: 600px;
        }

        .mdl-textfield__label::after {
            visibility: hidden;
        }

        #chip-insert {
            display: inline-flex;
            margin-left: 0px;
        }

        .mdl-chip {
            margin-right: 8px;

            &.selected {
                background-color: #b3d4fc;
            }

            &.error {
                background-color: #d23f31 !important;
            }
        }

        #border {
            position: absolute;
            transition-duration: .2s;
            transition-timing-function: cubic-bezier(.4,0,.2,1);
            background-color: rgba(0, 0, 0, 0.12);
            top: 136px;
            height: 1px;
            left: 0px;
            visibility: visible;
            width: calc(100% - 2em);
            margin: 0 1em 0 1em;
        }
    }

    #compose-head {
        @media (min-width: 750px) {
            width: 500px;
        }

        @media (min-width: 800px) {
            width: 550px;
        }

        @media (min-width: 850px) {
            width: 600px;
        }

        @media (min-width: 900px) {
            width: 650px;
        }
    }

    .mdl-textfield {
        @media (min-width: 750px) {
            max-width: 450px;
            min-width: 450px;
            width: 450px;
        }

        @media (min-width: 800px) {
            max-width: 500px;
            min-width: 500px;
            width: 500px;
        }

        @media (min-width: 850px) {
            max-width: 550px;
            min-width: 550px;
            width: 550px;
        }

        @media (min-width: 900px) {
            max-width: 600px;
            min-width: 600px;
            width: 600px;
        }
    }

    body.dark {
        #compose-head {
            .mdl-card__title {
                color: #fff;
            }

            .mdl-textfield__input, .mdl-textfield__label {
                color: #fff;
            }
        }
    }

    input:focus {
        outline: none;
    }

</style>
