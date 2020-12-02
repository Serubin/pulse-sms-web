import axios from 'axios';
import store from '@/store/';
import { Api, Url, Crypto } from '@/utils/';

export default class Templates {
    static get() {
        let constructed_url = Url.get('templates') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            axios.get(constructed_url)
                .then(response => {
                    response = response.data;

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

        return promise;
    }

    static delete(id) {
        let constructed_url = Url.get('remove_template') + id + Url.getAccountParam();
        axios.post(constructed_url);
    }

    static create(text) {
        let request = {
            account_id: store.state.account_id,
            device_id: Api.generateId(),
            text: Crypto.encrypt(text)
        };

        let constructed_url = Url.get('create_template');

        const promise = new Promise((resolve) => {
            axios.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => { resolve(response) });
        });

        return promise;
    }
}
