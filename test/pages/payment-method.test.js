// Libraries
import Router from 'next/router'

// Pages
import PaymentMethodPage from '../../src/pages/checkout/payment-method'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

const cart = {
  line_items: [
    {
      id: '1'
    }
  ],
  line_items_count: 1,
  shipping_address: {},
  shipping_method: {}
}

test('renders correct checkout components', () => {
  const wrapper = shallow(
    <PaymentMethodPage cart={ cart } />,
    { disableLifecycleMethods: true }
  )

  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('PaymentMethods').length).toEqual(1)
})

describe('nextSection()', () => {
  test('navigates to shipping address when called', async () => {
    const pushSpy = jest.spyOn(Router, 'push').mockImplementation(() => {})

    const wrapper = shallow(
      <PaymentMethodPage cart={cart} />,
      { disableLifecycleMethods: true }
    )

    await wrapper.instance().nextSection()

    expect(pushSpy).toHaveBeenCalledWith('/checkout/shipping-address')

    pushSpy.mockRestore()
  })
})
