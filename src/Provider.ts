import { getStore } from './storeRegistry'
import { ProviderProps } from './types'
import { Provider as ReactReduxProvider } from 'react-redux'
import React, { createElement } from 'react'

const Provider = ({
    store = getStore(),
    context,
    children,
}: ProviderProps): React.CElement<any, any> => createElement(ReactReduxProvider, { store, context }, children)

export { Provider }
