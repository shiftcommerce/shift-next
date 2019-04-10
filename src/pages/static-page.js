// Libraries
import React, { Component } from 'react'

// Lib
import renderComponents from '../lib/render-components'
import { suffixWithStoreName } from '../lib/suffix-with-store-name'
import ApiClient from '../lib/api-client'
import Config from '../lib/config'

// Components
import { Loading, StaticPageError } from '@shiftcommerce/shift-react-components'

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
    if (req) { // server-side
      const page = await fetchPage(id)

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
    const page = await fetchPage(id)

    this.setState({ loading: false, page })
  }

  renderPageTitle (title) {
    const homepage = title === 'Homepage'

    return (
      <this.Head>
        { homepage ? <title>{Config.get().storeName}</title> : <title>{suffixWithStoreName(title)}</title> }
      </this.Head>
    )
  }

  render () {
    const page = this.props.page || this.state.page

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
      const { components } = page.template.sections.slice(-1).pop()

      return (
        <>
          { this.renderPageTitle(page.title) }
          { components && renderComponents(components) }
        </>
      )
    }
  }
}

export default StaticPage
