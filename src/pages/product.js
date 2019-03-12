// Libraries
import React, { Component } from 'react'
import Head from 'next/head'

// Lib
import renderComponents from '../lib/render-components'
import { suffixWithStoreName } from '../lib/suffix-with-store-name'

// Components
import { Loading, ProductDisplay } from '@shiftcommerce/shift-react-components'

// Actions
import { addToCart } from '../actions/cart-actions'
import { readProduct } from '../actions/product-actions'

class ProductPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      variantId: null,
      quantity: 1
    }

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
    this.props.dispatch(addToCart(variantId, parseInt(quantity)))
  }

  changeVariant (e) {
    this.setState({
      variantId: e.target.attributes['data-variant-id'].value
    })
  }

  render () {
    const { product, product: { loading, error, template, title } } = this.props

    if (loading) {
      return (
        <Loading />
      )
    } else if (error || Object.keys(product).length === 0) {
      return (
        <h1>Unable to load product.</h1>
      )
    } else {
      const templateSection = template && template.sections && template.sections.slice(-1).pop()
      const components = templateSection && templateSection.components
      const selectedVariant = product.variants.find(variant => variant.id === this.state.variantId)

      return (
        <>
          <Head>
            <title>{ suffixWithStoreName(title) }</title>
          </Head>
          <ProductDisplay
            product={product}
            changeVariant={this.changeVariant}
            addToBag={this.addToBag}
            selectedVariant={selectedVariant}
          />
          { components && renderComponents(components) }
        </>
      )
    }
  }
}

export default ProductPage
