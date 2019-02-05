import Vue from 'vue';
import store from '@/store/';

import { Url, Crypto, SessionCache } from '@/utils/'
import { Account, Blacklist, Conversations, Folders, Messages, ScheduledMessages, Stream } from '@/utils/api/'

export default class Api {

    static stream = Stream

    static account = Account
    static blacklist = Blacklist
    static conversations = Conversations
    static folders = Folders
    static messages = Messages
    static scheduledMessages = ScheduledMessages
    
    static fetchDrafts() {
        let constructed_url = Url.get('drafts') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    response = response.data

                    // Decrypt draft items
                    for (let i = 0; i < response.length; i++) {
                        const draft = Crypto.decryptDraft(response[i]);
                        if (draft != null)
                            response[i] = draft;
                    }

                    resolve(response);
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise
    }

    static removeDraftForConversation(conversation_id) {
        let constructed_url = Url.get('remove_draft') + conversation_id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchDevices() {
        let constructed_url = Url.get('devices') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    resolve(response.data);
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise
    }

    static removeDevice(id) {
        let constructed_url = Url.get('remove_device') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchTemplates() {
        let constructed_url = Url.get('templates') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    response = response.data

                    // Decrypt template items
                    for (let i = 0; i < response.length; i++) {
                        const template = Crypto.decryptTemplate(response[i]);
                        if (template != null)
                            response[i] = template;
                    }

                    resolve(response);
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise
    }

    static removeTemplate(id) {
        let constructed_url = Url.get('remove_template') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchAutoReplies() {
        let constructed_url = Url.get('auto_replies') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    response = response.data

                    // Decrypt reply items
                    for (let i = 0; i < response.length; i++) {
                        const reply = Crypto.decryptAutoReply(response[i]);
                        if (reply != null)
                            response[i] = reply;
                    }

                    resolve(response);
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise
    }

    static removeAutoReply(id) {
        let constructed_url = Url.get('remove_auto_reply') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchContacts() {
        let constructed_url = Url.get("contacts") + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            let contacts = [];

            if (!SessionCache.hasContacts()) {
                queryContacts(300, 3000);
            } else {
                resolve(SessionCache.getContacts());
            }

            function queryContacts(pageLimit, totalLimit) {
                Vue.http.get(constructed_url + "&limit=" + pageLimit + "&offset=" + contacts.length).then(response => {
                    response = response.data;

                    // Decrypt contact items
                    for (let i = 0; i < response.length; i++) {
                        const contact = Crypto.decryptContact(response[i]);
                        if (contact != null)
                            contacts.push(contact);
                    }

                    if (response.length == pageLimit/* && contacts.length < totalLimit*/) {
                        queryContacts(pageLimit, totalLimit);
                    } else {
                        finishQuery(contacts);
                    }
                }).catch(response => Api.rejectHandler(response, reject));
            }

            function finishQuery(contacts) {
                contacts.sort(function (a, b) {
                    let nameA = a.name.toUpperCase();
                    let nameB = b.name.toUpperCase();

                    if (nameA < nameB) {
                        return -1;
                    } else if (nameA > nameB) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                SessionCache.putContacts(contacts);
                resolve(contacts);
            }
        });

        return promise
    }

    static removeContact(id) {
        let constructed_url = Url.get('remove_contact') + id + Url.getAccountParam();
        Vue.http.post(constructed_url)
            .catch(response => Api.rejectHandler(response));
    }

    static generateId() {
        let min = 1;
        let max = 922337203685477;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static rejectHandler(e, callback = null) {
        if (e.status == 401)
            return store.state.msgbus.$emit('logout-btn');

        if (callback)
            return callback(e);
    }
}
