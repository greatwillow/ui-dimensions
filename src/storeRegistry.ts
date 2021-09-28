import { 
    createStore as reduxCreateStore, 
    combineReducers, 
    StoreEnhancer, 
    ReducersMapObject
} from 'redux'
import { 
    Reducer, 
    Reducers, 
    MainStore, 
    AnyState 
} from './types'

let store: MainStore<any>

/**
 * @returns the current or newly created store
 */
const getStore = <TState>(): MainStore<TState> => {
    if(store)
        return store

    store = createStore()

    return store
}

/**
 * Call setStore to provide your own store for dimension-state to use. You'll need to use this if you want to use middleware.
 *
 * @param store store to set in the store-registry
 *
 * @returns the current store
 */
const setStore = <TState>(initialStore: MainStore<TState>): MainStore<TState> | null => {
    if(store != null) {
        console.warn('Store is already initialized. Call setStore before the first getStore. This call will be ignored.')
        return null
    }
    if(typeof initialStore.injectReducer !== 'function')
        throw new Error('Store must support .injectReducer')

    store = initialStore

    return store
}

/**
 * Creates a Redux store that holds the state tree.
 *
 * @param initialReducers An object whose values correspond to different reducer functions that already exist in the app.
 *
 * @param enhancer An optional extension for adding third-party capabilities such as middleware and time travel
 *
 * @returns A Redux store that lets you read the state, dispatch actions and subscribe to changes.
 */
const createStore = <TState extends AnyState>(
    initialReducers?: Reducers<TState>,
    enhancer?: StoreEnhancer<any>
): MainStore<TState> => {
    if(typeof initialReducers !== 'object')
        throw new Error('initialReducers should be an object suitable to be passed to combineReducers')

    const reducers: Reducers<TState> = { ...initialReducers, _stub_: (s: TState) => s || 0 }

    const store: MainStore<TState> = reduxCreateStore(
        combineReducers(reducers),
        enhancer,
    )
    
    store.injectReducer = (key: string, reducer: Reducer<TState>) => {
        if(reducers[key])
            console.warn(`injectReducer: replacing reducer for key '${key}'`)
        reducers[key] = reducer
        store.replaceReducer(combineReducers<TState>(reducers as ReducersMapObject<any>))
    }

    Object.keys(reducers).forEach((key) => {
        if(key !== '_stub_')
            store.injectReducer(key, reducers[key])
    })

    return store
}

export {
    getStore,
    setStore,
    createStore,
}
