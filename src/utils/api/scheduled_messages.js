import Vue from 'vue';
import store from '@/store/';
import { Api, Url, Crypto } from '@/utils/'

export default class ScheduledMessages {
    static get() {
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

    static delete(id) {
        let constructed_url = Url.get('remove_scheduled') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static create(to, message, time, title, repeat) {
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

        const promise = new Promise((resolve) => {
            Vue.http.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => { resolve(response); });
        });

        return promise;
    }
}
