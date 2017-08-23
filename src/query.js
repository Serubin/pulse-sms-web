import Vue from 'vue'

import Url from '@/utils/url.js'
import Crypto from '@/crypto.js'


export default class Querier {

    static fetchConversations (index) {
        const constructed_url = 
            Url.get('conversations') + index + Url.getAccountParam()

        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then(response => {
                    response = response.data
                    // Decrypt Conversations items
                    for(var i = 0; i < response.length; i++)
                        response[i] = Crypto.decryptConversation(response[i]);

                    resolve(response); // Resolve response
                })
                .catch(response => reject(response));
        });

        return promise
    }

    static fetchThread () {
        const constructed_url = 
            Url.get('messages') + Url.getAccountParam() 
                + "&conversation_id=" + conversation_id + "&limit=" + limit;

        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then(response => { 
                    response = response.data
                    // Decrypt Conversations items
                    for(var i = 0; i < response.length; i++)
                        response[i] = Crypto.decryptMessage(response[i]);

                    resolve(response); // Resolve response
                })
                .catch(response => reject(response));
        });

        return promise
    }
}
