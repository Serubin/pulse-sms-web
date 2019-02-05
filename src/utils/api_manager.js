import Vue from 'vue';
import store from '@/store/';
import { Url, Crypto, SessionCache } from '@/utils/'

import { 
    Account,
    AutoReply,
    Blacklist,
    Conversations,
    Devices,
    Drafts,
    Folders,
    Messages,
    ScheduledMessages,
    Stream,
    Templates
} from '@/utils/api/'

export default class Api {

    static stream = Stream

    static account = Account
    static autoReplies = AutoReply
    static blacklist = Blacklist
    static conversations = Conversations
    static devices = Devices
    static drafts = Drafts
    static folders = Folders
    static messages = Messages
    static scheduledMessages = ScheduledMessages
    static templates = Templates

    

    

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
