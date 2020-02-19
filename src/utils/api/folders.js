import axios from 'axios';
import { Api, Url, Crypto } from '@/utils/';

export default class Folders {
    static get() {
        let constructed_url = Url.get('folders') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            axios.get(constructed_url)
                .then(response => {
                    response = response.data;

                    // Decrypt Folder items
                    for (let i = 0; i < response.length; i++) {
                        const folder = Crypto.decryptFolder(response[i]);
                        if (folder != null)
                            response[i] = folder;
                    }

                    resolve(response);
                })
                .catch(response => Api.rejectHandler(response, reject));
        });

        return promise;
    }

    static delete(id) {
        let constructed_url = Url.get('remove_folder') + id + Url.getAccountParam();
        axios.post(constructed_url);
    }
}
