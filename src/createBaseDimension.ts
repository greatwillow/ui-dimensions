import { useSelector } from 'react-redux'
import { getStore } from './storeRegistry'
import { createDimensionStore } from './dimensionStoreRegistry'
import { 
    BaseReducers, 
    DimensionReducers, 
    MainStore,
    Reducers,
    DispatchAction,
    AnyState,
    StateClosure,
    ReducersClosure,
    BaseDimension,
} from './types'

const mapReducersToStoreDispatch = <
    TState, 
    TReturnReducers
    > (
        dimensionStoreKey: string,
        reducers: Reducers<TState>,
        callback: DispatchAction,
    ): TReturnReducers => {
    const mappedReducer: any = {}
    Object.keys(reducers).forEach((key) => {
        const newKey = key.replace(`${dimensionStoreKey}_/_`, '')
        mappedReducer[newKey] = callback(key)
    })

    return mappedReducer
}

const initializeDimensionReducers = <
    TState extends AnyState, 
    TBaseReducers extends BaseReducers<TState>
    > (
        dimensionStoreKey: string,
        initialState: TState,
        reducers: DimensionReducers<TBaseReducers>,
        store: MainStore<TState>
    ): BaseReducers<TState> => {
    const baseReducers: BaseReducers<TState> = {}

    store.injectReducer(dimensionStoreKey, (state: TState = initialState, { type, payload }: { type: string; payload: unknown }) => {
        const stateEnhancedReducers: TBaseReducers = reducers(state)

        Object.keys(stateEnhancedReducers).forEach((key) => {
            baseReducers[`${dimensionStoreKey}_/_${key}`] = stateEnhancedReducers[key]
        })

        return baseReducers[type] ? baseReducers[type](payload) : state
    })

    return baseReducers
}

/**
 * @param dimensionStoreKey represents the name of the dimension of the redux store
 *
 * @param initialStateClosure represents the initial state of the given dimension
 *
 * @param getDimensionReducersFunction is a function that passes state to a series of mapped reducers
 *
 * @param dimensionAsyncActions is a map of asynchronous actions with their properties specified
 *
 * @returns an object representing the store dimension properties
 */
const createBaseDimension = <
    TState extends AnyState,
    TReducers extends BaseReducers<TState>,
    TExternalDependencies
    > (
        dimensionStoreKey: string,
        initialStateClosure: StateClosure<TState, TExternalDependencies>,
        reducersClosure: ReducersClosure<TState, TReducers, TExternalDependencies>,
        externalDependencies: TExternalDependencies,
        store: MainStore<TState> = getStore(),
    ): BaseDimension<TState, TReducers> => {

    const initialState = initialStateClosure(externalDependencies)
    const reducers = reducersClosure(externalDependencies)

    const dimensionReducers = initializeDimensionReducers(
        dimensionStoreKey, 
        initialState, 
        reducers, 
        store
    )

    const dimensionStore = createDimensionStore<TState>(store, dimensionStoreKey)

    const dimensionState = () => useSelector((storeState: any) => storeState[dimensionStoreKey])

    const dispatchedDimensionReducers = mapReducersToStoreDispatch<TState, TReducers>(
        dimensionStoreKey, 
        dimensionReducers, (type: string) => (payload: any) => {
            store.dispatch({ type, payload })
        })

    const baseDimension: BaseDimension<TState, TReducers> = {
        use: dimensionState,
        reducers: dispatchedDimensionReducers,
        store: dimensionStore,
    }

    return baseDimension
}

export { createBaseDimension }
