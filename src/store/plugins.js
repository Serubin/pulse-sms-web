
import { KEYS, state } from '@/store/state.js'

    // called when the store is initialize  
const localStoreSync = store => {
    const local_items = {
        'contacts': KEYS.CONTACTS,
        'clearContacts': KEYS.CONTACTS,
        'account_id': KEYS.ACCOUNT_ID,
        'hash': KEYS.HASH,
        'salt': KEYS.SALT,
    }

    // called after every mutation.
    store.subscribe((mutation, state) => {
        
        // Only save if in local_items array
        if (!Object.keys(local_items).contains(mutation.type))
            return;

        let key = local_items[mutation.type]
        let value = JSON.stringify(state[mutation.type])

        window.localStorage.setItem(key, value)
    })
}


export default [ localStoreSync ];
