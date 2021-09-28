import React, { createElement } from 'react'
import { Provider as ReactReduxProvider } from 'react-redux'
import { getStore } from './storeRegistry'
import { ProviderProps } from './types'

const Provider = ({
    store = getStore(),
    context,
    children,
}: ProviderProps): React.CElement<any, any> => createElement(ReactReduxProvider, { store, context }, children)

export { Provider }
