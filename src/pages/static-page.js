// Libraries
import React, { Component, Fragment } from 'react'

// Lib
import renderComponents from '../lib/render-components'
import { suffixWithStoreName } from '../lib/suffix-with-store-name'
import ApiClient from '../lib/api-client'
import Config from '../lib/config'

// Components
import { Loading, StaticPageError } from '@shiftcommerce/shift-react-components'

class StaticPage extends Component {
  static async getInitialProps ({ query: { id }, req }) {
    if (req) { // server-side
      const page = await StaticPage.fetchPage(id)

      return { id, page }
    } else { // client side
      return { id }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }

    this.Head = Config.get().Head
  }

  static getDerivedStateFromProps (newProps, prevState) {
    if (prevState.currentId !== newProps.id) {
      return { currentId: newProps.id, loading: true }
    }
    return null
  }

  async componentDidMount () {
    await this.fetchPageIntoState(this.props.id)
  }

  async componentDidUpdate (_, prevState) {
    if (prevState.currentId !== this.state.currentId) {
      await this.fetchPageIntoState(this.props.id)
    }
  }

  async fetchPageIntoState (id) {
    const page = await StaticPage.fetchPage(id)

    this.setState({ loading: false, page })
  }

  /**
   * Request the page from the API
   * @param  {Number} id
   * @return {Object} API response or error
   */
  static async fetchPage (id) {
    try {
      const request = StaticPage.pageRequest(id)
      const response = await new ApiClient().read(request.endpoint, request.query)

      return response.data
    } catch (error) {
      return { error }
    }
  }

  /**
   * Generate the page request object. This method can be overridden when
   * StaticPage is imported, if the query needs to be altered. For example:
   * StaticPage.pageRequest = (pageId) => { ... }
   * @param  {Number} pageId
   * @return {Object}
   */
  static pageRequest (pageId) {
    return {
      endpoint: `/getStaticPage/${pageId}`,
      query: {
        include: 'template,meta.*'
      }
    }
  }

  /**
   * Returns the page object
   * @return {Object}
   */
  getPage () {
    return this.props.page || this.state.page
  }

  renderPageTitle (title) {
    const homepage = title === 'Homepage'

    return (
      <this.Head>
        { homepage ? <title>{Config.get().storeName}</title> : <title>{suffixWithStoreName(title)}</title> }
      </this.Head>
    )
  }

  /**
   * Render the static page when loaded. This method is seperate to the main
   * render method so it can be overridden, without overriding the loading and
   * error parts of the render method
   * @return {String} - HTML markup for the component
   */
  renderLoaded () {
    const page = this.getPage()

    if (page.template.sections) {
      const { components } = page.template.sections.slice(-1).pop()

      if (components) {
        return renderComponents(components)
      }
    }

    return null
  }

  render () {
    const page = this.getPage()

    if (this.state.loading) {
      return (
        <Loading />
      )
    } else if (page.error) {
      const errorDetails = {
        Endpoint: JSON.stringify(page.error.request.endpoint),
        Query: JSON.stringify(page.error.request.query),
        'Response data': JSON.stringify(page.error.data)
      }

      return (
        <StaticPageError
          errorDetails={errorDetails}
          isProduction={process.env.NODE_ENV === 'production'}
        />
      )
    } else {
      return (
        <Fragment>
          { this.renderPageTitle(page.title) }
          { this.renderLoaded() }
        </Fragment>
      )
    }
  }
}

export default StaticPage
