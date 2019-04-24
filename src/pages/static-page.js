// Libraries
import React, { Component, Fragment } from 'react'

// Lib
import renderComponents from '../lib/render-components'
import { suffixWithStoreName } from '../lib/suffix-with-store-name'
import ApiClient from '../lib/api-client'
import Config from '../lib/config'

// Components
import { StaticPageError, Loading } from '@shiftcommerce/shift-react-components'

const pageRequest = (pageId) => {
  return {
    endpoint: `/getStaticPage/${pageId}`,
    query: {
      include: 'template,meta.*'
    }
  }
}

const fetchPage = async (id) => {
  try {
    const request = pageRequest(id)
    const response = await new ApiClient().read(request.endpoint, request.query)

    return response.data
  } catch (error) {
    return { error }
  }
}

class StaticPage extends Component {
  static async getInitialProps ({ query: { id }, req }) {
    const page = await fetchPage(id)

    return { id, page, isServer: !!req }
  }

  constructor (props) {
    super(props)

    this.Head = Config.get().Head
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
