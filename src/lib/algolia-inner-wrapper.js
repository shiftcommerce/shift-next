// Lib
import React from 'react'
import Config from './config'
import InitialPropsDelegator from './initial-props-delegator'
import { Configure } from 'react-instantsearch/dom'
import t from 'typy'

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

      const categoryDefaultSortOrder = t(otherProps, 'category.default_sort_order').safeObject
      const indexWithDefaultSortOrder = categoryDefaultSortOrder ? `${algoliaIndexName}_${categoryDefaultSortOrder}` : algoliaIndexName

      return (
        <InstantSearch
          appId={algoliaAppId}
          apiKey={algoliaApiKey}
          indexName={indexWithDefaultSortOrder}
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
