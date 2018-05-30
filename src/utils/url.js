import store from '@/store'

export default class Url {
    static urls = {
        "login":                "accounts/login/",
        "update_setting":       "accounts/update_setting",
        "messages":             "messages/",
        "add_message":          "messages/add/",
        "new_thread":           "messages/forward_to_phone",
        "conversations":        "conversations/",
        "update_conversation":  "conversations/update/",
        "read":                 "conversations/read/",
        "archive":              "conversations/archive/",
        "unarchive":            "conversations/unarchive/",
        "dismiss":              "accounts/dismissed_notification/",
        "settings":             "accounts/settings/",
        "websocket":            "stream",
        "media":                "media/",
        "contacts":             "contacts/simple/",
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

    static getAccountPayload () {
        return {
            account_id: store.state.account_id
        }
    }

    static get (name) {

        let protocol = "https://";
        if(name == "websocket")
            protocol = "wss://";

        return protocol + Url.getBaseUrl() + Url.getApiVersion() + Url.urls[name];
    }
}

