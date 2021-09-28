import { createBaseDimension } from './createBaseDimension'
import { createInterstellarDimension } from './createInterstellarDimension'
import { 
    getStore, 
    setStore, 
    createStore 
} from './storeRegistry'
import { Provider } from './Provider'
import { 
    Dimension, 
    DimensionDefinitions,
    DimensionReducers, 
    StringTheoryStore 
} from './types'

export {
    getStore,
    setStore,
    createStore,
    createBaseDimension,
    createInterstellarDimension,
    Provider,
    Dimension, 
    DimensionReducers,
    DimensionDefinitions, 
    StringTheoryStore 
}
