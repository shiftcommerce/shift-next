// Libraries
import React, { Component } from 'react'
import Head from 'next/head'
import qs from 'qs'
import equal from 'deep-equal'

// Components
import { ProductListing } from 'shift-react-components'

// Lib
import { suffixWithStoreName } from '../lib/suffix-with-store-name'
import buildSearchStateForURL from '../lib/build-search-state-for-url'
import Config from '../lib/config'

class SearchPage extends Component {
  static algoliaEnabled = () => true

  static algoliaComponentDidUpdate (prevProps, prevState) {
    if (!equal(prevState.searchState, this.state.searchState)) return

    const urlSearchState = qs.parse(window.location.search.slice(1))
    if (!equal(buildSearchStateForURL(this.state.searchState), urlSearchState)) {
      this.setState({ searchState: Object.assign(urlSearchState, { configure: prevProps.searchState.configure }) })
    }
  }

  render () {
    return (
      <>
        <Head>
          <title>{ suffixWithStoreName('Search') }</title>
        </Head>
        <ProductListing indexName={Config.get().algoliaIndexName} />
      </>
    )
  }
}

export default SearchPage
