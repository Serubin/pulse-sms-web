import Vue from 'vue';
import store from '@/store/';
import { Url, Crypto } from '@/utils/'

export default class Blacklist {
    static get() {
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

    static delete(id) {
        let constructed_url = Url.get('remove_blacklist') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static create = {
        phone: (number) => {
            let request = {
                account_id: store.state.account_id,
                device_id: Api.generateId(),
                phone_number: Crypto.encrypt(number)
            };

            let constructed_url = Url.get('create_blacklist');

            const promise = new Promise((resolve, reject) => {
                Vue.http.post(constructed_url, request, { 'Content-Type': 'application/json' })
                    .then(response => { resolve(response); });
            });

            return promise;
        },
        phrase: (phrase) => {
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
    }

}