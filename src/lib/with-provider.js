// Libraries
import React from 'react'
import { Provider } from 'react-redux'

// Lib
import InitialPropsDelegator from './initial-props-delegator'

export default function withProvider (Component) {
  return class extends InitialPropsDelegator(Component) {
    render () {
      const { reduxStore, ...otherProps } = this.props
      return (
        <Provider store={reduxStore}>
          <Component {...otherProps} />
        </Provider>
      )
    }
  }
}
