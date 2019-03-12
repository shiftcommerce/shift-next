import React from 'react'

/**
 * Returns a class with a getInitialProps definition which delegates
 * to getInitialProps of Component if it is defined.
 * To use, extended the class returned by this function.
 * @param {React.Component} Component - a React component getInitialProps will be delegated to
 * @example
 * class MyClass extends InitialPropsDelegator(ComponentToDelegateTo)
 */
export default function InitialPropsDelegator (Component) {
  return class extends React.Component {
    static async getInitialProps (appContext) {
      let appProps = {}
      if (Component.getInitialProps) {
        appProps = await Component.getInitialProps(appContext)
      }

      return {
        ...appProps
      }
    }
  }
}
