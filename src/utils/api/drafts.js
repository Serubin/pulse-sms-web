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
        let constructed_url = Url.get('remove_drafts') + conversation_id + Url.getAccountParam();
        axios.post(constructed_url);
    }

    static replace(conversation_id, draft) {
        let request = {
            device_conversation_id: conversation_id,
            drafts: [
                {
                    device_id: Api.generateId(),
                    device_conversation_id: conversation_id,
                    mime_type: Crypto.encrypt("text/plain"),
                    data: Crypto.encrypt(draft),
                } 
            ],
        };

        let constructed_url = Url.get('replace_drafts') + Url.getAccountParam();

        const promise = new Promise((resolve) => {
            axios.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => { resolve(response) });
        });

        return promise;
    }

    static create(conversation_id, draft) {
        let request = {
            drafts: [
                {
                    device_id: Api.generateId(),
                    device_conversation_id: conversation_id,
                    mime_type: Crypto.encrypt("text/plain"),
                    data: Crypto.encrypt(draft),
                } 
            ],
        };

        let constructed_url = Url.get('create_drafts') + Url.getAccountParam();

        const promise = new Promise((resolve) => {
            axios.post(constructed_url, request, { 'Content-Type': 'application/json' })
                .then(response => { resolve(response) });
        });

        return promise;
    }
}
