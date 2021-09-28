import { createBaseDimension } from './createBaseDimension'
import {
    AsyncActions,
    asyncLifecycleStatuses,
    AsyncStatusesState,
    AsyncStatusReducers,
    SetAsyncStatusParams,
    BaseDimension,
} from './types'

const getAsyncStatusInitialState = <
    TAsyncActions extends AsyncActions
    >(
        asyncActions: TAsyncActions
    ): AsyncStatusesState<TAsyncActions> => {
    const asyncStatuses: AsyncStatusesState<TAsyncActions> = {} as AsyncStatusesState<TAsyncActions>

    Object.keys(asyncActions).forEach((key: string) => {
        const typedKey = key as keyof TAsyncActions
        asyncStatuses[typedKey] = {
            status: asyncLifecycleStatuses.NO_CURRENT_CALL,
            previousStatus: asyncLifecycleStatuses.NO_CURRENT_CALL,
            isPending: false,
            hasError: false,
        }
    })

    return asyncStatuses
}

const getAsyncStatusReducers = <
    TState extends AsyncStatusesState<TAsyncActions>, 
    TAsyncActions
    > (
        state: TState
    ): AsyncStatusReducers<TAsyncActions> => {
    return {
        setAsyncStatus: ({ callName, status }: SetAsyncStatusParams) => {
                
            const typedCallName = callName as keyof TAsyncActions

            return {
                ...state,
                [typedCallName]: {
                    ...state[typedCallName],
                    status,
                    previousStatus: state[typedCallName].status,
                    isPending: status === asyncLifecycleStatuses.PENDING,
                    hasError: status === asyncLifecycleStatuses.CALL_FAILURE,
                },
            }
        }
    }
}

const createAsyncStatusesDimension = <
    TAsyncActions extends AsyncActions,
    TExternalDependencies
    > (
        originalStoreKey: string,
        asyncActions: TAsyncActions,
        externalDependencies: TExternalDependencies
    ): BaseDimension<
    AsyncStatusesState<TAsyncActions>, 
    AsyncStatusReducers<AsyncStatusesState<TAsyncActions>>
    > => {
    const dimensionStoreKey = `${originalStoreKey}_Status`

    const asyncStatusesDimensionInitialState = getAsyncStatusInitialState<TAsyncActions>(asyncActions)

    const statusesDimension = createBaseDimension<
            AsyncStatusesState<TAsyncActions>, 
            AsyncStatusReducers<AsyncStatusesState<TAsyncActions>>,
            TExternalDependencies
            > (
                dimensionStoreKey,
                () => asyncStatusesDimensionInitialState,
                () => getAsyncStatusReducers,
                externalDependencies
            )

    return statusesDimension
}

const composeAsyncStatusAutomationState = <
    TAsyncActions extends AsyncActions
    > (
        asyncActions: TAsyncActions,
        asyncStatusesDimension: BaseDimension<
    AsyncStatusesState<TAsyncActions>, 
    AsyncStatusReducers<AsyncStatusesState<TAsyncActions>> 
    >
    ): TAsyncActions => {
    const higherOrderAsyncActions: AsyncActions = {}
    const { reducers } = asyncStatusesDimension

    Object.keys(asyncActions).forEach((key: string) => {

        higherOrderAsyncActions[key] = (params: any) => {
            reducers.setAsyncStatus({ callName: key, status: asyncLifecycleStatuses.PENDING })

            return asyncActions[key](params)
                .then((result: any) => {
                    reducers.setAsyncStatus({ callName: key, status: asyncLifecycleStatuses.CALL_SUCCESS })
                    return result
                })
                .catch((error: any) => {
                    reducers.setAsyncStatus({ callName: key, status: asyncLifecycleStatuses.CALL_FAILURE })
                    return error
                })
                .finally(() => {
                    reducers.setAsyncStatus({ callName: key, status: asyncLifecycleStatuses.NO_CURRENT_CALL })
                })
        }
    })

    return higherOrderAsyncActions as { [key in keyof TAsyncActions]: TAsyncActions[key]; }
}

export { 
    createAsyncStatusesDimension,
    composeAsyncStatusAutomationState
}
