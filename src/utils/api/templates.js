import axios from 'axios';
import { Api, Url, Crypto } from '@/utils/';
import SessionCache from '../cache_manager';

export default class Templates {
    static get() {
        let constructed_url = Url.get('templates') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            if(!SessionCache.hasTemplates()) {
                axios.get(constructed_url)
                    .then(response => {
                        response = response.data;
                        for (let i = 0; i < response.length; i++) {
                            const template = Crypto.decryptTemplate(response[i]);
                            if (template != null)
                                response[i] = template;
                        }
                        SessionCache.putTemplates(response);
                        resolve(response);
                    })
                    .catch(response => Api.rejectHandler(response, reject));
            } else {
                resolve(SessionCache.getTemplates());
            }
        });

        return promise;
    }

    static delete(id) {
        let constructed_url = Url.get('remove_template') + id + Url.getAccountParam();
        axios.post(constructed_url);
    }

    static create(text) {
        let request = {
            templates: [
                {
                    device_id: Api.generateId(),
                    text: Crypto.encrypt(text)
                }
            ]
        };

        let constructed_url = Url.get('create_template') + Url.getAccountParam();

        const promise = new Promise((resolve) => {
            axios.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => { resolve(response) });
        });

        return promise;
    }

    static update (id, text) {
        // eslint-disable-next-line camelcase
        const constructed_url = Url.get('update_template') + id + Url.getAccountParam() + '&text=' + text;
        const promise = new Promise((resolve) => {
            axios.post(constructed_url)
                .then(response => { resolve(response) });
        });
        return promise;
    }

}
