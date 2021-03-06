// Libraries
import React, { Component, Fragment } from 'react'
import Router from 'next/router'
import qs from 'qs'
import equal from 'deep-equal'

// Components
import { Loading, ProductListing, SearchFilters } from '@shiftcommerce/shift-react-components'

// Lib
import buildSearchStateForURL from '../lib/build-search-state-for-url'
import { suffixWithStoreName } from '../lib/suffix-with-store-name'
import ApiClient from '../lib/api-client'

// Actions
import { clearSearchFilter, setSearchFilter } from '../actions/search-actions'

// Config
import Config from '../lib/config'

class CategoryPage extends Component {
  static algoliaEnabled = () => true

  static async getInitialProps ({ query: { id }, reduxStore, req }) {
    if (req) { // server-side
      const category = await CategoryPage.fetchCategory(id)
      return { id, category }
    } else { // client side
      return { id }
    }
  }

  /**
   * Generate the category request object. This method can be overridden when
   * StaticPage is imported, if the query needs to be altered. For example:
   * CategoryPage.categoryRequest = (categoryId) => { ... }
   * @param  {Number} categoryId
   * @return {Object}
   */
  static categoryRequest (categoryId) {
    return {
      endpoint: `/getCategory/${categoryId}`,
      query: {}
    }
  }

  /**
   * Request the category from the API
   * @param  {Number} id
   * @return {Object} API response or error
   */
  static async fetchCategory (id) {
    const request = CategoryPage.categoryRequest(id)
    const response = await new ApiClient().read(request.endpoint, request.query)
    return response.data
  }

  static buildAlgoliaStates ({ query: { id, ...options } }) {
    return Object.assign({ configure: { filters: `category_ids:${id}` } }, options)
  }

  static onSearchStateChange (searchState) {
    clearTimeout(this.debouncedSetState)
    this.debouncedSetState = setTimeout(() => {
      // We want to stay on the same page but push a url onto the stack
      // so that the back button works as expected
      const as = this.searchStateToUrl(searchState)

      // queryString is added at the end so that the url that is pushed
      // onto the stack is different for each combination of refinements and queries,
      // otherwise the url would always be the same and the back button would
      // navigate to the previous page instead of undoing refinements
      const queryString = as.split('?')[1]
      const href = `/category?id=${this.props.id}&${queryString}`

      Router.push(href, as)
    }, this.updateAfter())
    this.setState({ searchState })
  }

  static searchStateToUrl (searchState) {
    const urlSearchState = buildSearchStateForURL(searchState)
    return Object.keys(urlSearchState).length > 0 ? `${window.location.pathname}?${qs.stringify(urlSearchState)}` : window.location.pathname
  }

  // Updates the search state when navigating to another category clientside
  static async algoliaComponentDidUpdate (prevProps, prevState) {
    if ((prevProps.id != this.props.id) && this.state.searchState) { // eslint-disable-line
      this.setState({
        searchState: Object.assign(
          {},
          this.state.searchState, {
            configure: Object.assign(
              {},
              this.state.searchState.configure,
              { filters: `category_ids:${this.props.id}` }
            ),
            page: 1 }
        )
      })
    }

    if (!equal(prevState.searchState, this.state.searchState)) return

    const urlSearchState = qs.parse(window.location.search.slice(1))
    if (this.state.searchState && !equal(buildSearchStateForURL(this.state.searchState), urlSearchState)) {
      // Now that this code has been refactored somewhat, we may no longer need to set 'currentId'
      this.setState({ currentId: this.props.id, searchState: Object.assign(urlSearchState, { configure: this.props.searchState.configure }) })
    }
  }

  constructor (props) {
    super(props)
    this.state = {}

    this.Head = Config.get().Head
  }

  async componentDidMount () {
    await this.fetchCategoryIntoState(this.props.id)
  }

  // Get the category data when navigating to other category clientside
  async componentDidUpdate (prevProps, prevState) {
    if (prevProps.id !== this.props.id) {
      await this.fetchCategoryIntoState(this.props.id)
    }
  }

  async fetchCategoryIntoState (id) {
    const category = await CategoryPage.fetchCategory(id)

    this.setState({ loading: false, category })
    this.props.dispatch(setSearchFilter(category.title))
  }

  componentWillUnmount () {
    this.props.dispatch(clearSearchFilter())
  }

  /**
   * Render the loaded content
   * @param  {Object} category
   * @return {String} - HTML markup for the component
   */
  renderLoaded (category) {
    const { title, facets } = category

    return (
      <Fragment>
        <this.Head>
          <title>{ suffixWithStoreName(title) }</title>
        </this.Head>
        <ProductListing title={title} indexName={Config.get().algoliaIndexName} facets={facets} />
      </Fragment>
    )    
  }

  render () {
    const category = this.props.category || (this.state && this.state.category)
    const loading = (this.state && this.state.loading) || !category

    if (loading) {
      return (
        <Fragment>
          <Loading />
          {/* Render Search filters so that the Algolia request triggered by the spinner
          matches the default category page request - otherwise an extra call to Algolia is made */}
          <div className='u-hidden'>
            <SearchFilters />
          </div>
        </Fragment>
      )
    } else {
      return this.renderLoaded(category)
    }
  }
}

export default CategoryPage
