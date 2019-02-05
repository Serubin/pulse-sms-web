import Vue from 'vue';
import { Api, Url } from '@/utils/'

export default class Devices {
    static get() {
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

    static delete(id) {
        let constructed_url = Url.get('remove_device') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }
}