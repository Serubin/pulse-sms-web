
export const KEYS  = {
    ACCOUNT_ID: 'account_id',
    HASH: 'hash',
    SALT: 'salt',
    CONTACTS: 'contacts',
    THEME: {
        ROUND: 'theme_round',
    }
}

export const state = {
    // Persistent
    account_id: window.localStorage.getItem(KEYS.ACCOUNT_ID) || '',
    hash: window.localStorage.getItem(KEYS.HASH) || '',
    salt: window.localStorage.getItem(KEYS.SALT) || '',
    contacts: JSON.parse(window.localStorage.getItem(KEYS.CONTACTS) || '{}'),
    theme_round: window.localStorage.getItem(KEYS.THEME.ROUND) || false,

    // Per session
    aes: '',
    full_theme: true,
    sidebar_open: true,
    title: "PulseClient",
    loading: true,
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
    hash: (state, hash ) => state.hash = hash,
    salt: (state, salt ) => state.salt = salt,
    aes: (state, aes ) => state.aes = aes,
    contact: (state, payload) => {
        for(let i = 0; i < payload.length; i++)   
            state.contacts[payload[i].id] = payload[i]
    },
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

        commit('contact', contacts);
    }

}

