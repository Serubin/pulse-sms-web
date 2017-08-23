export const ACCOUNT_ID_KEY = "account_id";
export const HASH_KEY = "hash";
export const SALT_KEY = "salt";
export const CONTACTS_KEY = "contacts";

export const state = {
    account_id: window.localStorage.getItem(ACCOUNT_ID_KEY) || '',
    hash: window.localStorage.getItem(HASH_KEY) || '',
    salt: window.localStorage.getItem(SALT_KEY) || '',
    aes: '',
    contacts: JSON.parse(window.localStorage.getItem(CONTACTS_KEY) || '[]'),
    full_theme: true,
    sidebar_open: true,
}

export const mutations = {
    full_theme: (state, full_theme ) => state.full_theme = full_theme,
    sidebar_open: (state, sidebar_open ) => state.sidebar_open = sidebar_open,
    hash: (state, hash ) => state.hash = hash,
    salt: (state, salt ) => state.salt = salt,
    aes: (state, aes ) => state.aes = aes,
}

export const actions = {
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

}

