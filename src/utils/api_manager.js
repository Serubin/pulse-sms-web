import Vue from 'vue';
import store from '@/store/';
import emojione from 'emojione';
import * as firebase from 'firebase';
import ImageCompressor from '@xkeshi/image-compressor';

import { Util, Url, Crypto, SessionCache, Platform } from '@/utils/'
import { Account, Conversations, Messages, Stream } from '@/utils/api/'

export default class Api {

    static stream = Stream

    static account = Account
    static conversations = Conversations
    static messages = Messages



    static createThreadWithImage(to, messageId, mimeType) {
        const constructed_url = Url.get("new_thread");

        const request = {
            account_id: store.state.account_id,
            to: to,
            message: "firebase -1",
            mime_type: mimeType,
            message_id: messageId,
            sent_device: Platform.getPlatformIdentifier()
        }

        const promise = new Promise((resolve, reject) => {
            Vue.http.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => resolve(response))
                .catch(response => Api.rejectHandler(response, reject))
        });

        return promise;
    }

    static createThread(to, message, messageId = null) {
        const constructed_url = Url.get("new_thread");

        const request = {
            account_id: store.state.account_id,
            to: to,
            message: message,
            sent_device: Platform.getPlatformIdentifier()
        }

        const promise = new Promise((resolve, reject) => {
            Vue.http.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => resolve(response))
                .catch(response => Api.rejectHandler(response, reject))
        });

        return promise;
    }

    static fetchFolders() {
        let constructed_url = Url.get('folders') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    response = response.data

                    // Decrypt Folder items
                    for (let i = 0; i < response.length; i++) {
                        const folder = Crypto.decryptFolder(response[i]);
                        if (folder != null)
                            response[i] = folder;
                    }

                    resolve(response);
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise
    }

    static removeFolder(id) {
        let constructed_url = Url.get('remove_folder') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchBlacklists() {
        let constructed_url = Url.get('blacklists') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    response = response.data

                    // Decrypt Blacklist items
                    for (let i = 0; i < response.length; i++) {
                        const blacklist = Crypto.decryptBlacklist(response[i]);
                        if (blacklist != null)
                            response[i] = blacklist;
                    }

                    resolve(response);
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise
    }

    static removeBlacklist(id) {
        let constructed_url = Url.get('remove_blacklist') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static createBlacklistPhone(phone_number) {
        let request = {
            account_id: store.state.account_id,
            device_id: Api.generateId(),
            phone_number: Crypto.encrypt(phone_number)
        };

        let constructed_url = Url.get('create_blacklist');

        const promise = new Promise((resolve, reject) => {
            Vue.http.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => { resolve(response); });
        });

        return promise;
    }

    static createBlacklistPhrase(phrase) {
        let request = {
            account_id: store.state.account_id,
            device_id: Api.generateId(),
            phrase: Crypto.encrypt(phrase)
        };

        let constructed_url = Url.get('create_blacklist');

        const promise = new Promise((resolve, reject) => {
            Vue.http.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => { resolve(response); });
        });

        return promise;
    }

    static fetchScheduledMessages() {
        let constructed_url = Url.get('scheduled') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    response = response.data

                    // Decrypt Scheduled Message items
                    for (let i = 0; i < response.length; i++) {
                        const message = Crypto.decryptScheduledMessage(response[i]);
                        if (message != null)
                            response[i] = message;
                    }

                    resolve(response);
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise
    }

    static removeScheduledMessage(id) {
        let constructed_url = Url.get('remove_scheduled') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static createScheduledMessage(to, message, time, title, repeat) {
        let request = {
            account_id: store.state.account_id,
            device_id: Api.generateId(),
            to: Crypto.encrypt(to),
            data: Crypto.encrypt(message),
            mime_type: Crypto.encrypt("text/plain"),
            title: Crypto.encrypt(title.trim().length == 0 ? to : title.trim()),
            timestamp: time,
            repeat: repeat
        };

        let constructed_url = Url.get('create_scheduled');

        const promise = new Promise((resolve, reject) => {
            Vue.http.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => { resolve(response); });
        });

        return promise;
    }



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
