// Libraries
import React from 'react'
import Router from 'next/router'
import qs from 'qs'

// Lib
import Config from './config'
import InitialPropsDelegator from './initial-props-delegator'
import buildSearchStateForURL from './build-search-state-for-url'
import algoliaInnerWrapper from './algolia-inner-wrapper'

// Components
import { findResultsState } from './instant-search'

const MAX_VARIANTS_PER_PRODUCT = 50

export default function algoliaOuterWrapper (NextWrapper, Page) {
  return class extends InitialPropsDelegator(NextWrapper) {
    constructor (props) {
      super(props)
      this.state = {}
      this.onSearchStateChange = this.onSearchStateChange.bind(this)
    }

    static async getInitialProps (appContext) {
      const { query, req } = appContext
      const isServer = !!req

      // Get initial props from the parent
      const appProps = await Object.getPrototypeOf(this).getInitialProps(appContext)

      let searchState = query

      // remove the random undefined key
      delete searchState.undefined

      if (Page.buildAlgoliaStates) {
        searchState = Page.buildAlgoliaStates(appContext)
      }
      // We should always configure this in the state to prevent a onSearchStateChange first render
      searchState.configure = { ...searchState.configure, hitsPerPage: Config.get().algoliaResultsPerPage, distinct: MAX_VARIANTS_PER_PRODUCT }

      let resultsState = {
        _originalResponse: {
          results: [{}]
        }
      }
      if (isServer && Page.algoliaEnabled && Page.algoliaEnabled()) {
        resultsState = await findResultsState(algoliaInnerWrapper(Page), { searchState, ...appProps })
      }

      return {
        ...appProps,
        resultsState,
        searchState
      }
    }

    updateAfter () {
      // Delegate to custom implementation if the page provides one
      if (Page.updateAfter) {
        return Page.updateAfter()
      }

      // Default implementation
      return 700
    }

    onSearchStateChange (searchState) {
      // Delegate to custom implementation if the page provides one
      if (Page.onSearchStateChange) {
        return Page.onSearchStateChange.call(this, searchState)
      }

      // Default implementation
      clearTimeout(this.debouncedSetState)
      this.debouncedSetState = setTimeout(() => {
        const href = this.searchStateToUrl(searchState)
        Router.push(href, href)
      }, this.updateAfter())
      this.setState({ searchState })
    }

    searchStateToUrl (searchState) {
      // Delegate to custom implementation if the page provides one
      if (Page.searchStateToUrl) {
        return Page.searchStateToUrl.call(this, searchState)
      }

      // Default implementation
      const urlSearchState = buildSearchStateForURL(searchState)
      // Build the query string and append it to search path
      return searchState.query ? `/search?${qs.stringify(urlSearchState)}` : '/search'
    }

    static getDerivedStateFromProps (newProps, prevState) {
      if (Page.algoliaGetDerivedStateFromProps) {
        return Page.algoliaGetDerivedStateFromProps.call(this, newProps, prevState)
      }
      return null
    }

    componentDidUpdate (prevProps, prevState) {
      return Page.algoliaComponentDidUpdate && Page.algoliaComponentDidUpdate.call(this, prevProps, prevState)
    }

    componentDidMount () {
      return Page.algoliaComponentDidMount && Page.algoliaComponentDidMount.call(this)
    }

    render () {
      const { resultsState, searchState, ...appProps } = this.props

      return (
        <NextWrapper
          resultsState={resultsState}
          onSearchStateChange={this.onSearchStateChange}
          searchState={
            this.state && this.state.searchState
              ? this.state.searchState
              : searchState
          }
          {...appProps}
        />
      )
    }
  }
}
