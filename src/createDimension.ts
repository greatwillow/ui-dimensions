import { getStore } from './storeRegistry'
import { createBaseDimension } from './createBaseDimension'
import { 
    composeAsyncStatusAutomationState, 
    createAsyncStatusesDimension 
} from './asyncStatusAutomationHelpers'
import { 
    DimensionDefinitions,
    DimensionParameters,
} from './types'

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
const createDimension = <
    TDimensionDefinitions extends DimensionDefinitions<any, any, any, any, any>,
    TExternalDependencies
    >(
        dimensionParamers: DimensionParameters<TDimensionDefinitions, TExternalDependencies>
    ): TDimensionDefinitions['dimension'] => {

    if(dimensionParamers.store === undefined)
        dimensionParamers.store = getStore()
    if(dimensionParamers.addAsyncStatusAutomationState === undefined)
        dimensionParamers.addAsyncStatusAutomationState = true

    const {
        dimensionStoreKey,
        initialStateClosure,
        reducersClosure,
        selectorsClosure,
        asyncActionsClosure,
        executorsClosure,
        externalDependencies,
        addAsyncStatusAutomationState,
        store,
    } = dimensionParamers

    const baseDimension = createBaseDimension(
        dimensionStoreKey,
        initialStateClosure,
        reducersClosure,
        externalDependencies,
        store
    )

    let asyncStatusesDimension
    let executors = {}
    const selectors = selectorsClosure({ dimension: baseDimension, ...externalDependencies })
    let asyncActions = asyncActionsClosure({ dimension: { ...baseDimension, selectors }, ...externalDependencies })

    if(addAsyncStatusAutomationState) {
        asyncStatusesDimension = createAsyncStatusesDimension<TDimensionDefinitions['asyncActions'], TExternalDependencies>(
            dimensionStoreKey,
            asyncActions,
            externalDependencies
        )

        asyncActions = composeAsyncStatusAutomationState<TDimensionDefinitions['asyncActions']>(asyncActions, asyncStatusesDimension)
    }

    const useAsyncStatuses = asyncStatusesDimension ? asyncStatusesDimension.use : undefined

    if(executorsClosure)
        executors = executorsClosure({ dimension: { ...baseDimension, selectors, asyncActions, useAsyncStatuses }, ...externalDependencies })

    return {
        ...baseDimension,
        selectors,
        asyncActions,
        executors,
        useAsyncStatuses, 
    }
}

export { createDimension }
