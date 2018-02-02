<template>
    <div>
        <div id="compose-head" class="mdl-card" :style="matchListHeight">
            <div class="mdl-card__title">
                <div id="chip-insert">
                    <ContactChip v-for="selected in Object.values(selectedContacts)" :contact="selected" :key="selected.id" :onDelete="removeContact" :class="hilighted == selected ? 'selected' : ''"/>
                </div>
                <div class="mdl-textfield mdl-js-textfield" id="recipient-wrap" :class="is_dirty" v-mdl>
                    <input class="mdl-textfield__input" type="text" id="recipient" v-model="recipient" @keydown.prevent.stop="processInput">
                    <label class="mdl-textfield__label" for="recipient">Recipient...</label>
                </div>
                <div id="border"></div>
            </div>

            <ul id="match-list" class="mdl-shadow--2dp" :style="matchListHeight">
                <transition-group name="flip-list" tag="div">
                    <SelectionItem v-for="match in matchList" :contact="match" :on-click="addContact" :key="match.phone" v-if="matchList.length != 0"/>
                </transition-group>
            </ul>
        </div>

        <div class="page-content">
        </div>

        <Sendbar :onSend="sendMessage" :loading="sending"/>
    </div>
</template>

<script>
import Vue from 'vue'

import { Api, Crypto, Util } from "@/utils/"
import Sendbar from '../Thread/Sendbar.vue'
import SelectionItem from './SelectionItem.vue'
import ContactChip from './ContactChip.vue'

export default {
    name: 'compose',

    mounted () {
        this.$store.commit("loading", false);
        Api.fetchContacts()
            .then((resp) => this.processContacts(resp));
    },
    data () {
        return {
            contacts: {},
            nameIndex: {},
            recipient: "",
            matchList: [],
            selectedContacts: [],
            hilighted: null,
            sending: false,
        }
    },
    methods: {
        sendMessage(message) {
            var to = "";

            if (this.selectedContacts.length <= 0)
                return Util.Snackbar("No recipient");


            this.selectedContacts.map((value) => { // Concat selected contacts
                to += value.phone + ",";
            });
            
            to = to.slice(0, to.length - 1); // Remove trailing comma
            this.sending = true;

            Api.createThread(to, message);
            
            setTimeout(() => {
                Api.fetchConversations("index_unarchived")
                    .then((resp) => {
                        const thread_id = resp[0].device_id;

                        this.$router.push({ 
                            name:  'thread', params: { threadId: thread_id, isRead: true }
                        });
                    });
            }, 1500);
        },

        /**
        * Process contacts received from server
        * Saves contacts in contacts array
        * Also starts recipient processing
        * @param data, contact request result
        */
        processContacts(response) {
            const contains = [];
            const duplicates = [];

            for (let contact of response.data) {
                
                // Decrypt
                contact.name = Crypto.decrypt(contact.name);
                contact.phone_number = Crypto.decrypt(contact.phone_number);

                if (contains.indexOf(contact.name) >= 0) { 
                    // Track duplicates and mark for removal
                    duplicates[duplicates.length] = contact.id;
                    continue;
                }

                // Contacts by name, index
                this.nameIndex[contact.name.toLowerCase()] = this.contacts.length;
                
                // Add to cache
                this.contacts[contact.id] = { 
                    'id': contact.id, 
                    'name': contact.name, 
                    'phone': contact.phone_number 
                };

            }
        },
        processInput (e) {

            if (e.keyCode == 8)
                this.recipient = this.recipient.substr(0,this.recipient.length - 1)
            else if(e.key.length == 1)
                this.recipient += e.key;

            if (this.recipient == "") 
                this.matchList = []

            if (this.recipient.length > 0)
                this.matchList = this.matchContact(this.recipient);

            if ( (e.keyCode == 13 && this.matchList.length == 0)
                || (e.keyCode == 188)) {

                let val = this.recipient.replace(",", "");
                
                const contact = Object.values(this.contacts).containsObjKey('name', val);
                if (contact) {
                    this.recipient = "";
                    return this.addContact(contact);
                }
                
                if (!/(\d{10}|\d{3}-\d{3}-\d{4})/.test(val)) {
                    return
                }
                
                this.addContact({
                    'id': val.replace(/-/g,""),
                    'name': val,
                    'phone': val.replace(/-/g,""),
                });

                return false;
            }

            if ((e.keyCode == 13 || e.keyCode == 188) && this.matchList.length != 0) {
                this.addContact(this.matchList[0])
                this.recipient = "";
            }

            if (e.keyCode == 8 && this.recipient == "" && this.hilighted) {
                this.removeContact(this.hilighted);
                this.hilighted = null;

                return;

            }
            if (e.keyCode == 8 && this.recipient == "") {
                const last = this.selectedContacts.length - 1;
                this.hilighted = this.selectedContacts[last]; 

                return;
            }

            if (this.hilighted)
                this.hilighted = null;

        },
        matchContact (input) {

            // Regex 'like'
            const reg = new RegExp(input.split('').join('\\w*').replace(/\W/, ""), 'i');

            return Object.values(this.contacts).filter((data) => {
                if (data.name.match(reg)) 
                    return data;
            });
        },
        addContact (contact) {
            
            this.matchList = [];
            this.recipient = "";

            if (this.selectedContacts.indexOf(contact) != -1)
                return Util.snackbar(contact.name + " has alraedy been added");

            this.selectedContacts.push(contact);
        },
        removeContact (contact) {
            const index = this.selectedContacts.indexOf(contact);
            this.selectedContacts.splice(index, 1);
        },
    },
    computed: {
        matchListHeight() {
            let height = 57 * ( this.matchList.length || 1 ) + 'px'
            return {
                height: (this.matchList.length > 6 ?
                    57 * 6 : 57 * this.matchList.length) + "px"
            }
        },

        is_dirty () { // Is dirty fix for mdl
            if (this.recipient.length > 0)
                return "is-dirty";
            return "";
        },
    },
    components: {
        Sendbar,
        SelectionItem,
        ContactChip,
    }

}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/_vars.scss";

    #recipient-wrap {
        width: 100%;
    }

    #recipient {
        border-bottom: 1px solid rgba(0,0,0,0);
    }

    #compose-head {
        width: 100%;
        height: 20em;
        margin-top: 40px;
        min-height: 0px;
        overflow: visible;
        transition: ease-in-out width 0.5s;
        background: transparent;

        .mdl-card__title {
            padding: 0;
            background-color: white;
        }

        #recipient-wrap {
            margin: 0 10px 0 10px;
        }

        .mdl-textfield__label::after {
            visibility: hidden;
        }

        #chip-insert {
            display: inline-flex;
            margin-left: 10px;
        }

        .mdl-chip {
            margin-right: 5px;

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
            top: 56px;
            height: 1px;
            left: 0;
            visibility: visible;
            width: calc(100% - 2em);
            margin: 0 1em 0 1em;
        }

    }

    #match-list {
        position: absolute;
        top: 65px;
        width: 100%;
        padding: 0;
        margin: 0;
        overflow-y: scroll;
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

        @media (min-width:950px) {
            width: 650px;
        }
    }

    body.dark {
        #compose-head {
            .mdl-card__title {
                background: #374248;
                color: #fff;
            }

            .mdl-textfield__input, .mdl-textfield__label {
                color: #fff;
            }
        }
    }
    .flip-list-enter, .flip-list-leave-to
    /* .flip-list-leave-active below version 2.1.8 */ {
        opacity: 0;
    
    }
    .flip-list-leave-active {
        position: absolute;
    }
    .flip-list-move {
        transition: transform $anim-time;
    }


</style>
