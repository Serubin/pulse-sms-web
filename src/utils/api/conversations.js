import Vue from 'vue';
import store from '@/store/';
import { Api, Url, Crypto, SessionCache, Platform } from '@/utils/'

export default class Conversations {
    static getList(index, folderId) {
        if (typeof index == 'undefined') {
            index = "index_public_unarchived";
        }

        if (index == 'folder') {
            index = index + "/" + folderId;
        }

        let constructed_url = Url.get('conversations') + index + Url.getAccountParam()
        if (index == "index_public_unarchived") {
            constructed_url += "&limit=75"
        }

        const promise = new Promise((resolve, reject) => {
            if (!SessionCache.hasConversations(index)) {
                Vue.http.get(constructed_url)
                    .then(response => {
                        response = response.data

                        if (response != null) {
                            // Decrypt Conversations items
                            for (let i = 0; i < response.length; i++) {
                                const convo = Crypto.decryptConversation(response[i]);
                                if (convo != null)
                                    response[i] = convo;
                            }

                            SessionCache.putConversations(response, index);
                        }

                        resolve(response); // Resolve response
                    })
                    .catch(response => Api.rejectHandler(response, reject));
            } else {
                resolve(SessionCache.getConversations(index));
            }
        });

        return promise
    }

    static getById(id) {
        let constructed_url = Url.get('conversation') + id + Url.getAccountParam()
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    response = Crypto.decryptConversation(response.data);
                    if (response != null) {
                        resolve(response);
                    }
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise
    }

    static update(conversation_id, params) {
        let constructed_url = Url.get('update_conversation') + conversation_id;
        Vue.http.post(constructed_url, params, { 'Content-Type': 'application/json' })
            .catch(response => console.log(response));
    }

    static read(conversation_id) {
        // Read conversation
        let constructed_url = Url.get('read') + conversation_id + Url.getAccountParam();
        Vue.http.post(constructed_url)
            .catch((e) => Api.rejectHandler(e));

        // Dismiss notifiction
        constructed_url = Url.get('dismiss') + Url.getAccountParam()
            + "&id=" + conversation_id;
        Vue.http.post(constructed_url);
    }

    static archive(conversation_id, archive) {
        let constructed_url;

        if (archive) {
            constructed_url = Url.get('archive')
        } else {
            constructed_url = Url.get('unarchive')
        }

        constructed_url += conversation_id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static delete(conversation_id) {
        let constructed_url = Url.get('delete') + conversation_id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static createWithImage(to, messageId, mimeType) {
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

    static create(to, message, messageId = null) {
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
}