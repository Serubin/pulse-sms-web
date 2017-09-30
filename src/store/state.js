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
    notifications: JSON.parse( window.localStorage.getItem(KEYS.NOTIFICATIONS) || "false" ),

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
    setContacts: (state, payload) => {
        if(!Array.isArray(payload))
            payload = [ payload ]

        for(let i = 0; i < payload.length; i++)   
            state.contacts[payload[i].id] = payload[i]
    },
    clearContacts: (state, payload) => {
        state.contacts = {};
    }
}

export const actions = {
    title: ({ commit, state }, title) => {
        if (state.title != title) // Reduce uneeded state changes
            commit('title', title)
    },
    loading: ({ commit, state }, loading) => {
        if (state.loading != loading) // Reduce uneeded state changes
            commit('loading', loading)
    },
    full_theme: ({ commit, state }, full_theme) => { 
        if(state.full_theme != full_theme) // Reduce uneeded state changes
            commit('full_theme', full_theme);
    },
    sidebar_open: ({ commit, state }, sidebar_open) => {
        if (state.sidebar_open != sidebar_open) // Reduce uneeded state changes
            commit('sidebar_open', sidebar_open)
    },
    // Saved account id
    account_id: ({ commit, state }, account_id) => {
        if (state.account_id != account_id) // Reduce uneeded state changes
            commit('account_id', account_id)
    },
    // Saved hash
    hash: ({ commit, state }, hash) => {
        if (state.hash != hash) // Reduce uneeded state changes
            commit('hash', hash)
    },
    // Saved salt
    salt: ({ commit, state }, salt) => {
        if (state.salt != salt) // Reduce uneeded state changes
            commit('salt', salt)
    },
    // AES
    aes: ({ commit, state }, aes) => {
        if (state.aes != aes) // Reduce uneeded state changes
            commit('aes', aes)
    },
    setContacts: ({ commit, state }, contacts) => {
        if(!Array.isArray(contacts))
            contacts = [ contacts ]

        commit('contacts', contacts);
    }

}

