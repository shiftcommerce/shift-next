// Libraries
import React, { Component, Fragment } from 'react'

// Lib
import renderComponents from '../lib/render-components'
import { suffixWithStoreName } from '../lib/suffix-with-store-name'
import ApiClient from '../lib/api-client'
import Config from '../lib/config'

// Components
import { StaticPageError, Loading } from '@shiftcommerce/shift-react-components'


class StaticPage extends Component {
  static async getInitialProps ({ query: { id }, req, reduxStore }) {
    const page = await StaticPage.fetchPage(id, reduxStore.dispatch)

    return { id, page, isServer: !!req }
  }

  constructor (props) {
    super(props)

    this.Head = Config.get().Head
  }

  /**
 * Request the page from the API
 * @param  {Number} id
 * @param  {Function} dispatch
 * @return {Object} API response or error
 */
  static async fetchPage(id, dispatch) {
    try {
      const request = StaticPage.pageRequest(id)
      const response = await new ApiClient().read(request.endpoint, request.query, dispatch)

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
  static pageRequest(pageId) {
    return {
      endpoint: `/getStaticPage/${pageId}`,
      query: {
        include: 'template,meta.*'
      }
    }
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
    const { page } = this.props

    if (page.template.sections) {
      const { components } = page.template.sections.slice(-1).pop()

      if (components) {
        return renderComponents(components)
      }
    }

    return null
  }

  render () {
    const { page } = this.props

    if (this.props.loading && !this.props.isServer) {
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
