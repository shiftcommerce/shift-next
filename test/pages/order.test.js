// Libraries
import { Provider } from 'react-redux'
import { createMockStore } from 'redux-test-utils'

// Pages
import OrderPage from '../../src/pages/order'

// Lib
import { decimalPrice } from '../../src/lib/decimal-price'

// Fixtures
import order from '../fixtures/confirmation-order'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

describe('Page Rendering:', () => {
  test('renders correctly', () => {
    // Arrange
    const initialState = { }
    const lineItems = order.line_items
    const shippingAddress = order.shipping_address.attributes
    const shippingMethod = order.shipping_method.attributes
    const billingAddress = order.billing_address.attributes
    const cardDetails = order.cardToken.card

    // Act
    const wrapper = mount(
      <Provider store={createMockStore(initialState)}>
        <OrderPage order={order} />
      </Provider>
    )

    // Assert
    expect(wrapper).toMatchSnapshot()

    // Verify order summary info
    expect(wrapper).toIncludeText(lineItems[0].title)
    expect(wrapper).toIncludeText(decimalPrice(order.total_inc_tax))

    // Verify shipping address info
    expect(wrapper).toIncludeText(shippingAddress.first_name)
    expect(wrapper).toIncludeText(shippingAddress.last_name)
    expect(wrapper).toIncludeText(shippingAddress.address_line_1)
    expect(wrapper).toIncludeText(shippingAddress.postcode)

    // Verify shipping method info
    expect(wrapper).toIncludeText(shippingMethod.label)
    expect(wrapper).toIncludeText(shippingMethod.description)

    // Verify billing address info
    expect(wrapper).toIncludeText(billingAddress.first_name)
    expect(wrapper).toIncludeText(billingAddress.last_name)
    expect(wrapper).toIncludeText(billingAddress.address_line_1)
    expect(wrapper).toIncludeText(billingAddress.postcode)

    // Verify card details info
    expect(wrapper).toIncludeText(cardDetails.last4)
    expect(wrapper).toIncludeText(cardDetails.exp_month)
    expect(wrapper).toIncludeText(cardDetails.exp_year)
  })
})
