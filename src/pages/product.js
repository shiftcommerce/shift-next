// Libraries
import React, { Component, Fragment } from 'react'

// Lib
import renderComponents from '../lib/render-components'
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Components
import { Loading, ProductDisplay } from '@shiftcommerce/shift-react-components'

// Actions
import { addToCart, toggleMiniBag } from '../actions/cart-actions'
import { readProduct } from '../actions/product-actions'

// Config
import Config from '../lib/config'

class ProductPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      variantId: null,
      quantity: 1
    }

    this.Head = Config.get().Head
    this.changeVariant = this.changeVariant.bind(this)
    this.addToBag = this.addToBag.bind(this)
  }

  static async getInitialProps ({ reduxStore, req, query }) {
    const { id } = query
    const isServer = !!req

    if (isServer) {
      await reduxStore.dispatch(readProduct(id))
    }

    return { id: id }
  }

  componentDidMount () {
    const { dispatch, id } = this.props
    dispatch(readProduct(id))
  }

  addToBag () {
    const { variantId, quantity } = this.state
    this.props.dispatch(addToCart(variantId, parseInt(quantity))).then(success => {
      if (success) this.props.dispatch(toggleMiniBag(true))
    })
  }

  changeVariant (e) {
    this.setState({
      variantId: e.target.attributes['data-variant-id'].value
    })
  }

  /**
   * Render the product page when loaded. This method is seperate to the main
   * render method so it can be overridden, without overriding the loading and
   * error parts of the render method
   * @return {String} - HTML markup for the component
   */
  renderLoaded () {
    const { product, product: { template } } = this.props

    const templateSection = template && template.sections && template.sections.slice(-1).pop()
    const components = templateSection && templateSection.components
    const selectedVariant = product.variants.find(variant => variant.id === this.state.variantId)

    return (
      <Fragment>
        <ProductDisplay
          product={product}
          changeVariant={this.changeVariant}
          addToBag={this.addToBag}
          selectedVariant={selectedVariant}
        />
        { components && renderComponents(components) }
      </Fragment>
    )
  }

  render () {
    const { product, product: { loading, error, title } } = this.props

    if (loading) {
      return (
        <Loading />
      )
    } else if (error || Object.keys(product).length === 0) {
      return (
        <h1>Unable to load product.</h1>
      )
    } else {
      return (
        <Fragment>
          <this.Head>
            <title>{ suffixWithStoreName(title) }</title>
          </this.Head>
          { this.renderLoaded() }
        </Fragment>
      )
    }
  }
}

export default ProductPage
