import React from 'react'
import Cookies from 'js-cookie'
import { initializeStore } from './configure-store'
import { readMenu } from '../actions/menu-actions'
import { fetchAccountDetails, setLoggedInFromCookies } from '../actions/account-actions'
import { toggleLoading } from '../actions/global-actions'

// Config
import Config from './config'

// Lib
import InitialPropsDelegator from './initial-props-delegator'

const isServer = typeof window === 'undefined'
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function getOrCreateStore (initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = initializeStore(initialState)
  }
  return window[__NEXT_REDUX_STORE__]
}

export default (App) => {
  return class AppWithRedux extends InitialPropsDelegator(App) {
    static async getInitialProps (appContext) {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      const reduxStore = getOrCreateStore()
      reduxStore.dispatch(toggleLoading(true))
      await reduxStore.dispatch(readMenu(Config.get().menuRequest))
      // Provide the store to getInitialProps of pages
      appContext.reduxStore = reduxStore

      // Get initial props from the parent
      let appProps = await Object.getPrototypeOf(this).getInitialProps(appContext)

      return {
        initialReduxState: reduxStore.getState(),
        reduxStore,
        ...appProps
      }
    }

    constructor (props) {
      super(props)
      this.reduxStore = getOrCreateStore(props.initialReduxState)
    }

    componentDidMount () {
      if (Cookies.get('signedIn')) {
        this.reduxStore.dispatch(setLoggedInFromCookies())
        this.reduxStore.dispatch(fetchAccountDetails())
      }
    }

    render () {
      const { reduxStore, initialReduxState, ...otherProps } = this.props

      let currentStore = reduxStore
      if (!reduxStore || (Object.keys(reduxStore).length === 0 && reduxStore.constructor === Object && !isServer)) {
        currentStore = getOrCreateStore(initialReduxState)
      }

      return <App reduxStore={currentStore} {...otherProps} />
    }
  }
}
