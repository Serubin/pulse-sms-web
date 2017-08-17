export const ACCOUNT_ID_KEY = "account_id";
export const CONTACTS_KEY = "contacts";

export const state = {
    account_id: window.localStorage.getItem(ACCOUNT_ID_KEY) || '',
    contacts: JSON.parse(window.localStorage.getItem(CONTACTS_KEY) || '[]'),
    full_theme: true,
    sidebar_open: true,
}

export const mutations = {
    full_theme: (state, full_theme ) => state.full_theme = full_theme,
    sidebar_open: (state, sidebar_open ) => state.sidebar_open = sidebar_open
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
}

