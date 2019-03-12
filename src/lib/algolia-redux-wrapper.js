// Lib
import algoliaOuterWrapper from './algolia-outer-wrapper'
import withReduxStore from './with-redux-store'
import withProvider from './with-provider'
import algoliaInnerWrapper from './algolia-inner-wrapper'
import withLayout from './with-layout'

export function algoliaReduxWrapper (ConnectedComponent, Page) {
  return algoliaOuterWrapper(
    withReduxStore(
      withProvider(
        algoliaInnerWrapper(
          withLayout(
            ConnectedComponent
          )
        )
      )
    ),
    Page
  )
}

export function reduxWrapper (ConnectedComponent, Page) {
  return withReduxStore(
    withProvider(
      withLayout(
        ConnectedComponent
      )
    )
  )
}
