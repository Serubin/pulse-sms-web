import store from '@/store'

export default class Url {
    static urls = {
        "conversations":        "conversations/",
        "messages":             "messages/",
        "add_message":          "messages/add/",
        "update_conversation":  "conversations/update/",
        "websocket":            "stream",
    }

    static getBaseUrl () {
        return "api.messenger.klinkerapps.com/";
    }

    static getApiVersion () {
        return "api/v1/";
    }

    static getAccountParam () {
        return "?account_id=" + store.state.account_id;
    }

    static get (name) {

        let protocol = "https://";
        if(name == "websocket")
            protocol = "wss://";

        return protocol + Url.getBaseUrl() + Url.getApiVersion() + Url.urls[name];
    }
}

