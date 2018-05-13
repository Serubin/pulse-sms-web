import Vue from 'vue';

export const KEYS  = {
    ACCOUNT_ID: 'account_id',
    HASH: 'hash',
    SALT: 'salt',
    CONTACTS: 'contacts',
    NOTIFICATIONS: 'notifications',
    THEME: {
        ROUND: 'theme_round',
        BASE: 'theme_base',
        GLOBAL_DEFAULT: 'theme_global_default',
        GLOBAL_DARK: 'theme_global_dark',
        GLOBAL_ACCENT: 'theme_global_accent',
        USE_GLOBAL: 'theme_use_global',
        TOOLBAR: 'theme_toolbar',
    }
}

const empty_str = "\"\"";

export const state = {
    /* Persistent */
    account_id: JSON.parse( window.localStorage.getItem(KEYS.ACCOUNT_ID) || empty_str ),
    hash: JSON.parse( window.localStorage.getItem(KEYS.HASH) || empty_str ),
    salt: JSON.parse( window.localStorage.getItem(KEYS.SALT) || empty_str ),
    contacts: JSON.parse( window.localStorage.getItem(KEYS.CONTACTS) || '{}' ),

    theme_base: JSON.parse( window.localStorage.getItem(KEYS.THEME.BASE) || "\"light\"" ),
    theme_global_default: JSON.parse( window.localStorage.getItem(KEYS.THEME.GLOBAL_DEFAULT) || "\"#2196f3\"" ),
    theme_global_dark: JSON.parse( window.localStorage.getItem(KEYS.THEME.GLOBAL_DARK) || "\"#1565c0\"" ),
    theme_global_accent: JSON.parse( window.localStorage.getItem(KEYS.THEME.GLOBAL_ACCENT) || "\"#448aff\"" ),
    theme_use_global: JSON.parse( window.localStorage.getItem(KEYS.THEME.USE_GLOBAL) || "false" ),
    theme_round: JSON.parse( window.localStorage.getItem(KEYS.THEME.ROUND) || "false" ),
    theme_toolbar: JSON.parse( window.localStorage.getItem(KEYS.THEME.TOOLBAR) || "false" ),
    notifications: JSON.parse( window.localStorage.getItem(KEYS.NOTIFICATIONS) || "true" ),

    /* Per session */
    aes: '',
    full_theme: true,
    sidebar_open: true,
    title: "PulseClient",
    loading: true,

    colors_default: JSON.parse( window.localStorage.getItem(KEYS.THEME.GLOBAL_DEFAULT) || "\"#2196f3\"" ),
    colors_dark: JSON.parse( window.localStorage.getItem(KEYS.THEME.GLOBAL_DARK) || "\"#1565c0\"" ),
    colors_accent: JSON.parse( window.localStorage.getItem(KEYS.THEME.GLOBAL_ACCENT) || "\"#448aff\"" ),
    colors_text: "#ffffff",

    msgbus: new Vue(),
    media_loader: null,

    loaded_media: null,
    media_sending: false,

    offline: !navigator.onLine,

    last_ping: null,
}

export const getters = {
    getContact: (state) => (id) => {
        return state.contacts[id];
    }
}

export const mutations = {

    title: (state, title ) => state.title = title,
    loading: (state, loading ) => state.loading = loading,
    full_theme: (state, full_theme ) => state.full_theme = full_theme,
    sidebar_open: (state, sidebar_open ) => state.sidebar_open = sidebar_open,
    account_id: (state, account_id ) => state.account_id = account_id,
    hash: (state, hash ) => state.hash = hash,
    salt: (state, salt ) => state.salt = salt,
    aes: (state, aes ) => state.aes = aes,
    theme_base: (state, theme_base ) => state.theme_base = theme_base,
    theme_global_default: (state, theme_global_default ) => state.theme_global_default = theme_global_default,
    theme_global_dark: (state, theme_global_dark ) => state.theme_global_dark = theme_global_dark,
    theme_global_accent: (state, theme_global_accent ) => state.theme_global_accent = theme_global_accent,
    theme_use_global: (state, theme_use_global ) => state.theme_use_global = theme_use_global,
    theme_round: (state, theme_round ) => state.theme_round = theme_round,
    notifications: (state, notifications) => state.notifications = notifications,
    theme_toolbar: (state, theme_toolbar) => state.theme_toolbar = theme_toolbar,
    media_loader: (state, media_loader) => state.media_loader = media_loader,
    colors_default: (state, colors_default ) => state.colors_default = colors_default,
    colors_dark: (state, colors_dark ) => state.colors_dark = colors_dark,
    colors_accent: (state, colors_accent ) => state.colors_accent = colors_accent,
    loaded_media: (state, loaded_media ) => state.loaded_media = loaded_media,
    media_sending: (state, media_sending ) => state.media_sending = media_sending,
    last_ping: (state, last_ping ) => state.last_ping = last_ping,
    theme_global: (state, colors) => {
        state.theme_global_default = colors.default;
        state.theme_global_dark = colors.dark;
        state.theme_global_accent = colors.accent;
    },
    colors: (state, colors) => {
        state.colors_default = colors.default;
        state.colors_dark = colors.dark;
        state.colors_accent = colors.accent;
    },
    contacts: (state, payload) => {
        if(!Array.isArray(payload))
            payload = [ payload ]

        for(let i = 0; i < payload.length; i++)   
            state.contacts[payload[i].id] = payload[i]
    },
    clearContacts: (state, payload) => {
        state.contacts = {};
    },
}

export const actions = {

}

