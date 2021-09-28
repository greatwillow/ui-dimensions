import { 
    Context, 
    ReactChild, 
    ReactChildren 
} from 'react'
import { ReactReduxContextValue } from 'react-redux'
import {
    Store,
    Unsubscribe,
} from 'redux'

export enum asyncLifecycleStatuses {
    NO_CURRENT_CALL = 'NO_CURRENT_CALL',
    TRIGGER_API_CALL = 'TRIGGER_API_CALL',
    PENDING = 'PENDING',
    CALL_SUCCESS = 'CALL_SUCCESS',
    CALL_FAILURE = 'CALL_FAILURE',
}

export type ProviderProps = {
    store?: StringTheoryStore<any>
    context?: Context<ReactReduxContextValue>
    children?: ReactChild | ReactChildren
}

export type AnyState = { [key: string]: any }

export type Reducer<TState> = (state: TState, payload?: any) => TState

export type Reducers<TState extends { [key: string]: any }> = {
    [reducerName: string]: Reducer<TState>
}

export type BaseReducer<TState> = (payload?: any) => TState

export type BaseReducers<TState> = {
    [reducerName: string]: BaseReducer<TState>
}

export type DimensionStore<TState> = {
    getState: () => TState
    subscribe: (callback: (state: TState) => void) => Unsubscribe
}

export type BaseDimension<TState, TReducers extends BaseReducers<TState>> = {
    use: () => TState,
    reducers: { [key in keyof TReducers]: TReducers[key] },
    store: DimensionStore<TState>
}

export type BaseDimensionWithSelectors<
        TState, 
        TReducers extends BaseReducers<TState>, 
        TSelectors
        > = BaseDimension<TState, TReducers
    > & {
    selectors: TSelectors
}

export type BaseDimensionWithSelectorsAndAsyncActions<
        TState, 
        TReducers extends BaseReducers<TState>, 
        TSelectors, 
        TAsyncActions extends AsyncActions
        > = BaseDimensionWithSelectors<TState, TReducers, TSelectors
    > & {
    asyncActions: TAsyncActions
    useAsyncStatuses?: () => AsyncStatusesState<TAsyncActions>
}

export type Dimension<
        TState, 
        TReducers extends BaseReducers<TState>, 
        TSelectors, 
        TAsyncActions, 
        TCustomHooks> = BaseDimension<TState, TReducers
    > & {
    selectors: { [key in keyof TSelectors]: TSelectors[key] },
    asyncActions: { [key in keyof TAsyncActions]: TAsyncActions[key] },
    customHooks: { [key in keyof TCustomHooks]: TCustomHooks[key] },
    useAsyncStatuses?: () => AsyncStatusesState<TAsyncActions> 
}

export type StringTheoryStore<TState> = Store<TState> & {
    injectReducer(key: string, reducer: Reducer<TState>): void
}

export type DimensionDefinitions<
        TState extends AnyState, 
        TReducers extends BaseReducers<TState>, 
        TAsyncActions extends AsyncActions, 
        TSelectors, 
        TCustomHooks
    > = {
    asyncActions: TAsyncActions
    customHooks: TCustomHooks
    baseDimension: BaseDimension<TState, TReducers>,
    baseDimensionWithSelectors: BaseDimensionWithSelectors<TState, TReducers, TSelectors>,
    baseDimensionWithSelectorsAndAsyncActions: BaseDimensionWithSelectorsAndAsyncActions<TState, TReducers, TSelectors, TAsyncActions>,
    dimension: Dimension<TState, TReducers, TSelectors, TAsyncActions, TCustomHooks>
    reducers: TReducers
    selectors: TSelectors
    state: TState
}

export type DispatchAction = (type: string) => (payload: any) => void

export type DimensionReducers<TReducers> = (state: any) => { [key in keyof TReducers]: TReducers[key]}

export type AsyncAction = (...params: any) => Promise<void>

export type AsyncActions = { [key: string]: AsyncAction }

export type AsyncStatusState = {
    status: asyncLifecycleStatuses
    previousStatus: asyncLifecycleStatuses
    isPending: boolean
    hasError: boolean
}

export type AsyncStatusesState<TAsyncActions> = {
    [key in keyof TAsyncActions]: AsyncStatusState
}

export type SetAsyncStatusParams = { callName: string, status: string }

export type AsyncStatusReducers<TAsyncActions> = {
    setAsyncStatus: ({ callName, status }: SetAsyncStatusParams ) => AsyncStatusesState<TAsyncActions>
}

export type Selectors = {
    [key: string]: any
}

export type CustomHooks = {
    [key: string]: any
}

export type StateClosure<
        TState extends AnyState, 
        TExternalDependencies
    > = (
    externalDependencies: TExternalDependencies) => TState

export type ReducersClosure<
        TState, 
        TBaseReducers extends BaseReducers<TState>, 
        TExternalDependencies
    > = (
    externalDependencies: TExternalDependencies ) => (state: TState) => TBaseReducers

export type SelectorsClosure<
        TState,
        TBaseReducers extends BaseReducers<TState>,
        TSelectors extends Selectors, 
        TExternalDependencies
    > = ({ 
        dimension, 
        ...externalDependencies
    }: SelectorsClosureParameters<TState, TBaseReducers, TExternalDependencies>) => TSelectors
  
export type AsyncActionsClosure<
        TState, 
        TBaseReducers extends BaseReducers<TState>, 
        TSelectors, TAsyncActions extends AsyncActions, 
        TExternalDependencies
    > = ({ 
        dimension, 
        ...externalDependencies
    }: AsyncActionsClosureParameters<TState, TBaseReducers, TSelectors, TExternalDependencies>) => TAsyncActions
  
export type CustomHooksClosure<
        TState, 
        TBaseReducers extends BaseReducers<TState>, 
        TSelectors, 
        TAsyncActions extends AsyncActions, 
        TCustomHooks extends CustomHooks, 
        TExternalDependencies
    > = ({ 
        dimension, 
        ...externalDependencies 
    }: CustomHooksClosureParameters<TState, TBaseReducers, TSelectors, TAsyncActions, TExternalDependencies>) => TCustomHooks

type SelectorsClosureParameters<
        TState, 
        TBaseReducers extends BaseReducers<TState>, 
        TExternalDependencies
    >  = { 
    dimension: BaseDimension<TState, TBaseReducers> 
} & TExternalDependencies

type AsyncActionsClosureParameters<
        TState, 
        TBaseReducers extends BaseReducers<TState>, 
        TSelectors, 
        TExternalDependencies
    >  = { 
    dimension: BaseDimensionWithSelectors<TState, TBaseReducers, TSelectors> 
} & TExternalDependencies

type CustomHooksClosureParameters<
        TState, TBaseReducers extends BaseReducers<TState>, 
        TSelectors, 
        TAsyncActions extends AsyncActions, 
        TExternalDependencies
    >  = { 
    dimension: BaseDimensionWithSelectorsAndAsyncActions<TState, TBaseReducers, TSelectors, TAsyncActions> 
} & TExternalDependencies

export type DimensionParameters<
        TDimensionDefinitions extends DimensionDefinitions<any, any, any, any, any>,
        TExternalDependencies
    > = {
    dimensionStoreKey: string,
    initialStateClosure: StateClosure<
                            TDimensionDefinitions['state'], 
                            TExternalDependencies>,
    reducersClosure: ReducersClosure<
                            TDimensionDefinitions['state'], 
                            TDimensionDefinitions['reducers'], 
                            TExternalDependencies>,
    selectorsClosure: SelectorsClosure<
                            TDimensionDefinitions['state'], 
                            TDimensionDefinitions['reducers'], 
                            TDimensionDefinitions['selectors'], 
                            TExternalDependencies>,
    asyncActionsClosure: AsyncActionsClosure<
                            TDimensionDefinitions['state'], 
                            TDimensionDefinitions['reducers'], 
                            TDimensionDefinitions['selectors'], 
                            TDimensionDefinitions['asyncActions'], 
                          TExternalDependencies>,
    customHooksClosure?: CustomHooksClosure<
                            TDimensionDefinitions['state'], 
                            TDimensionDefinitions['reducers'], 
                            TDimensionDefinitions['selectors'], 
                            TDimensionDefinitions['asyncActions'], 
                            TDimensionDefinitions['customHooks'], 
                            TExternalDependencies>,
    externalDependencies: TExternalDependencies,
    addAsyncStatusAutomationState?: boolean,
    store?: StringTheoryStore<TDimensionDefinitions['state']>,
}