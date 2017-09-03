
import { KEYS, state } from '@/store/state.js'

const localStoreSync = store => {
    // called when the store is initialized
    store.subscribe((mutation, state) => {
        // called after every mutation.
        // The mutation comes in the format of `{ type, payload }`.
        //
        if (mutation.type == "contact") // Save contacts to local store
            window.localStorage.setItem(KEYS.CONTACTS, JSON.stringify(state.contacts))
    })
}

export default [ localStoreSync ];
