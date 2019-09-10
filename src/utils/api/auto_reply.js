import Vue from 'vue';
import { Api, Url, Crypto } from '@/utils/';

export default class AutoReply {
    static get() {
        let constructed_url = Url.get('auto_replies') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then(response => {
                    response = response.data;

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

        return promise;
    }

    static delete(id) {
        let constructed_url = Url.get('remove_auto_reply') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }
}
