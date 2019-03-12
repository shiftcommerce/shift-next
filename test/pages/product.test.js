// Libraries
import { Provider } from 'react-redux'
import { createMockStore } from 'redux-test-utils'

// Actions
import * as ProductActions from '../../src/actions/product-actions'

// Page
import ProductPage from '../../src/pages/product'

// Components
import { Loading, ProductDisplay } from '@shiftcommerce/shift-react-components'

// Fixtures
import product from '../fixtures/product'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

describe('Product page', () => {
  describe('loading and error states', () => {
    test('displays loading spinner, when there is no error and product is loading', () => {
      // Arrange
      const product = {
        loading: true,
        error: false,
        data: []
      }

      const dispatch = jest.fn()

      // Act
      const wrapper = mount(
        <Loading product={product} dispatch={dispatch} />
      )

      // Assert
      expect(wrapper).toMatchSnapshot()
      expect(wrapper.find('.o-loading')).toHaveClassName('o-loading')
    })

    test('displays an error message when there is an error loading the product', () => {
      // Arrange
      const product = {
        loading: false,
        error: true,
        data: []
      }

      const dispatch = jest.fn()

      // Act
      const wrapper = mount(
        <Provider store={createMockStore()}>
          <ProductPage product={product} dispatch={dispatch} />
        </Provider>
      )

      // Assert
      expect(wrapper).toMatchSnapshot()
      expect(wrapper).toIncludeText('Unable to load product.')
    })

    test('displays relevant message, when product data is empty', () => {
      // Arrange
      const dispatch = jest.fn()

      // Act
      const wrapper = mount(
        <Provider store={createMockStore()}>
          <ProductPage product={{}} dispatch={dispatch} />
        </Provider>
      )

      // Assert
      expect(wrapper).toMatchSnapshot()
      expect(wrapper).toIncludeText('Unable to load product.')
    })
  })

  test('renders a product once data is present', () => {
    // Arrange
    const dispatch = jest.fn()

    // Act
    const wrapper = mount(
      <Provider store={createMockStore()}>
        <ProductPage product={product} dispatch={dispatch} />
      </Provider>
    )

    // Assert
    expect(wrapper).toMatchSnapshot()

    expect(wrapper).toIncludeText(product.title)
    expect(wrapper).toIncludeText(product.min_current_price)

    expect(wrapper.find(ProductDisplay)).toExist()
  })

  test('getInitialProps() retrieves the product serverside', async () => {
    // Arrange - mock Redux store
    const dispatch = jest.fn()
    const readProductSpy = jest.spyOn(ProductActions, 'readProduct').mockImplementation(() => 'read product action')
    const req = true
    const query = {
      id: 1
    }
    const reduxStore = {
      dispatch: dispatch
    }

    // Act
    const getInitialProps = await ProductPage.getInitialProps({ reduxStore, req, query })

    // Assert
    expect(dispatch).toHaveBeenCalledWith('read product action')
    expect(readProductSpy).toHaveBeenCalledWith(1)
    expect(getInitialProps).toEqual({ id: 1 })

    readProductSpy.mockRestore()
  })

  test('getInitialProps() doesnt retrieve the product clientside', async () => {
    // Arrange
    const query = {
      id: 1
    }

    // Act
    const getInitialProps = await ProductPage.getInitialProps({ query })

    // Assert
    expect(getInitialProps).toEqual({ id: 1 })
  })
})
