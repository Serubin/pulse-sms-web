import axios from 'axios';
import { Api, Url, Crypto } from '@/utils/';

export default class Drafts {
    static get() {
        let constructed_url = Url.get('drafts') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            axios.get(constructed_url)
                .then(response => {
                    response = response.data;

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

        return promise;
    }

    static delete(conversation_id) {
        let constructed_url = Url.get('remove_draft') + conversation_id + Url.getAccountParam();
        axios.post(constructed_url);
    }
}
