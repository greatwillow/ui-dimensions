import { createElement } from 'react'
import { Provider as ReactReduxProvider } from 'react-redux'
import { getStore } from './storeRegistry'
import { ProviderProps } from './types'

const Provider = ({
    store = getStore(),
    context,
    children,
}: ProviderProps) => createElement(ReactReduxProvider, { store, context }, children)

export { Provider }
