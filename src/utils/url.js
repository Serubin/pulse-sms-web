import store from '@/store'

export default class Url {
    static urls = {
        'conversations':  "conversations/",
        'messages': "messages/"
    }

    static getBaseUrl () {
        return "https://api.messenger.klinkerapps.com/";
    }

    static getApiVersion () {
        return "api/v1/";
    }

    static getAccountParam () {
        return "?account_id=" + store.state.account_id;
    }

    static get (name) {
        return Url.getBaseUrl() + Url.getApiVersion() + Url.urls[name];
    }
}

