// Lib
import React from 'react'
import Config from './config'
import InitialPropsDelegator from './initial-props-delegator'
import { Configure } from 'react-instantsearch/dom'

// Components
import { InstantSearch } from './instant-search'

export default function algoliaInnerWrapper (Component) {
  return class extends InitialPropsDelegator(Component) {
    render () {
      const {
        algoliaApiKey,
        algoliaAppId,
        algoliaIndexName
      } = Config.get()
      const { resultsState, onSearchStateChange, searchState, ...otherProps } = this.props

      return (
        <InstantSearch
          appId={algoliaAppId}
          apiKey={algoliaApiKey}
          indexName={algoliaIndexName}
          resultsState={resultsState}
          onSearchStateChange={onSearchStateChange}
          searchState={searchState}
        >
          <Configure {...searchState.configure} />
          <Component {...otherProps} />
        </InstantSearch>
      )
    }
  }
}
