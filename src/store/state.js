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
        GLOBAL_COLORS: 'theme_global_colors',
        USE_GLOBAL: 'theme_use_global',
        TOOLBAR: 'theme_toolbar',
    }
}

const empty_str = "\"\"";

export const state = {
    // Persistent
    account_id: JSON.parse( window.localStorage.getItem(KEYS.ACCOUNT_ID) || empty_str ),
    hash: JSON.parse( window.localStorage.getItem(KEYS.HASH) || empty_str ),
    salt: JSON.parse( window.localStorage.getItem(KEYS.SALT) || empty_str ),
    contacts: JSON.parse( window.localStorage.getItem(KEYS.CONTACTS) || '{}' ),
    theme_base: JSON.parse( window.localStorage.getItem(KEYS.THEME.BASE) || "\"light\"" ),
    theme_global_colors: JSON.parse( window.localStorage.getItem(KEYS.THEME.GLOBAL_COLORS) || "\"default\"" ),
    theme_use_global: JSON.parse( window.localStorage.getItem(KEYS.THEME.USE_GLOBAL) || "false" ),
    theme_round: JSON.parse( window.localStorage.getItem(KEYS.THEME.ROUND) || "false" ),
    theme_toolbar: JSON.parse( window.localStorage.getItem(KEYS.THEME.TOOLBAR) || "false" ),
    notifications: JSON.parse( window.localStorage.getItem(KEYS.NOTIFICATIONS) || "true" ),

    // Per session
    aes: '',
    full_theme: true,
    sidebar_open: true,
    title: "PulseClient",
    loading: true,
    colors: {
        default: "#2196f3", 
        dark: "#1565c0", 
        accent: "#448aff",
        text: "#ffffff",
    },

    msgbus: new Vue(),
    media_loader: null,
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
    theme_global_colors: (state, theme_global_colors ) => state.theme_global_colors = theme_global_colors,
    theme_use_global: (state, theme_use_global ) => state.theme_use_global = theme_use_global,
    theme_round: (state, theme_round ) => state.theme_round = theme_round,
    notifications: (state, notifications) => state.notifications = notifications,
    theme_toolbar: (state, theme_toolbar) => state.theme_toolbar = theme_toolbar,
    colors: (state, colors) => state.colors = colors,
    media_loader: (state, media_loader) => state.media_loader = media_loader,
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

