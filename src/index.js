// Next Pages
import CartPage from './pages/cart'
import CategoryPage from './pages/category'
import ForgottenPasswordPage from './pages/forgotten-password'
import LoginPage from './pages/login'
import MyAccountPage from './pages/my-account'
import OfflinePage from './pages/offline'
import OrderPage from './pages/order'
import PasswordResetPage from './pages/password_reset'
import PaymentPage from './pages/payment'
import ProductPage from './pages/product'
import RegisterPage from './pages/register'
import SearchPage from './pages/search'
import ShippingAddressPage from './pages/shipping-address'
import ShippingMethodPage from './pages/checkout/shipping-method'
import SlugPage from './pages/slug'
import StaticPage from './pages/static-page'

// Components
import withCheckout from './components/with-checkout'

// Express handlers
import shiftAccountHandler from './express/account-handler'
import shiftCartHandler from './express/cart-handler'
import shiftCategoryHandler from './express/category-handler'
import shiftProductHandler from './express/product-handler'
import shiftMenuHandler from './express/menu-handler'
import shiftSlugHandler from './express/slug-handler'
import shiftStaticPageHandler from './express/staticpage-handler'
import shiftAddressBookHandler from './express/addressbook-handler'

// Routes
import shiftAccountRoutes from './routes/account-routes.js'
import shiftCheckoutRoutes from './routes/checkout-routes.js'
import shiftOrderRoutes from './routes/order-routes.js'

// Lib
import Config from './lib/config'
import { algoliaReduxWrapper, reduxWrapper } from './lib/algolia-redux-wrapper'
import { getSessionExpiryTime } from './lib/session'

// Shift-api Config
import { shiftApiConfig } from '@shiftcommerce/shift-node-api'

shiftApiConfig.set({
  apiHost: process.env.API_HOST,
  apiTenant: process.env.API_TENANT,
  apiAccessToken: process.env.API_ACCESS_TOKEN
})

module.exports = {
  shiftRoutes: (server) => {
    server.get('/customerOrders', shiftAccountHandler.getCustomerOrders)
    server.get('/getAccount', shiftAccountHandler.getAccount)
    server.get('/getAddressBook', shiftAddressBookHandler.getAddressBook)
    server.get('/getCart', shiftCartHandler.getCart)
    server.get('/getCategory/:id', shiftCategoryHandler.getCategory)
    server.get('/getMenus', shiftMenuHandler.getMenu)
    server.get('/getProduct/:id', shiftProductHandler.getProductById)
    server.get('/getShippingMethods', shiftCartHandler.getShippingMethods)
    server.get('/getSlug', shiftSlugHandler.getSlug)
    server.get('/getStaticPage/:id', shiftStaticPageHandler.getStaticPage)
    server.get('/forgotPassword', shiftAccountHandler.requestForgotPasswordEmail)
    server.post('/passwordReset', shiftAccountHandler.resetPassword)
    server.post('/addCartCoupon', shiftCartHandler.addCartCoupon)
    server.post('/addToCart', shiftCartHandler.addToCart)
    server.post('/createAddress', shiftCartHandler.createAddress)
    server.post('/createAddressBookEntry', shiftAddressBookHandler.createAddressBookEntry)
    server.post('/deleteLineItem/:lineItemId', shiftCartHandler.deleteLineItem)
    server.post('/login', shiftAccountHandler.loginAccount)
    server.post('/register', shiftAccountHandler.registerAccount)
    server.post('/setCartBillingAddress', shiftCartHandler.setCartBillingAddress)
    server.post('/setCartShippingAddress', shiftCartHandler.setCartShippingAddress)
    server.post('/setShippingMethod', shiftCartHandler.setCartShippingMethod)
    server.post('/updateLineItem', shiftCartHandler.updateLineItem)
    server.delete('/deleteAddress/:addressId', shiftAddressBookHandler.deleteAddress)

    /**
     * Account Routes
     */
    server.get('/account/login', shiftAccountRoutes.loginRoute)
    server.get('/account/myaccount', shiftAccountRoutes.viewRoute)
    server.get('/account/register', shiftAccountRoutes.registerRoute)
    server.get('/account/logout', shiftAccountRoutes.logoutRoute)

    /**
     * Checkout Routes
     */
    server.get('/checkout/review', shiftCheckoutRoutes.reviewRoute)

    /**
     * Order Routes
     */
    server.get('/order', shiftOrderRoutes.indexRoute)
  },

  CategoryPage: CategoryPage,
  CartPage: CartPage,
  ForgottenPasswordPage: ForgottenPasswordPage,
  LoginPage: LoginPage,
  MyAccountPage: MyAccountPage,
  OfflinePage: OfflinePage,
  OrderPage: OrderPage,
  PasswordResetPage: PasswordResetPage,
  PaymentPage: PaymentPage,
  ProductPage: ProductPage,
  RegisterPage: RegisterPage,
  SearchPage: SearchPage,
  ShippingAddressPage: ShippingAddressPage,
  ShippingMethodPage: ShippingMethodPage,
  SlugPage: SlugPage,
  StaticPage: StaticPage,

  withCheckout: withCheckout,

  algoliaReduxWrapper,
  reduxWrapper,
  getSessionExpiryTime,
  shiftNextConfig: Config
}
