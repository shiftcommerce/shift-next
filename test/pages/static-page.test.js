import axios from 'axios'
import nock from 'nock'
import httpAdapter from 'axios/lib/adapters/http'

import StaticPage from '../../src/pages/static-page'
import * as renderComponents from '../../src/lib/render-components'
import Config from '../../src/lib/config'

axios.defaults.adapter = httpAdapter

nock.disableNetConnect()

afterEach(() => { nock.cleanAll() })

const page = {
  template: {
    sections: [{
      components: ['component1', 'component2']
    }]
  }
}

test('renders components defined in the first template section', async () => {
  Config.set({ apiHostProxy: 'http://example.com' })

  // The requests is made to /10 but in reality props.id would have changed to 11 too
  nock(/example\.com/)
    .get('/getStaticPage/10')
    .query(true)
    .reply(200, {})

  const renderComponentsMock = jest.spyOn(renderComponents, 'default')

  shallow(<StaticPage page={page} id={10} />, { disableLifecycleMethods: true })

  expect(renderComponentsMock).toHaveBeenCalledWith(['component1', 'component2'])

  renderComponentsMock.mockRestore()
})

describe('page title', () => {
  test('renders correct page title for non-homepage pages', async () => {
    Config.set({ apiHostProxy: 'http://example.com', storeName: 'MyStore' })

    // The requests is made to /10 but in reality props.id would have changed to 11 too
    nock(/example\.com/)
      .get('/getStaticPage/10')
      .query(true)
      .reply(200, {})

    const wrapper = shallow(<StaticPage page={Object.assign({}, page, { title: 'Deliveries' })} id={10} />, { disableLifecycleMethods: true })

    expect(wrapper).toContainReact(<title>Deliveries - MyStore</title>)
  })

  test('renders just the store name as title for the homepage', async () => {
    Config.set({ apiHostProxy: 'http://example.com', storeName: 'MyStore' })

    // The requests is made to /10 but in reality props.id would have changed to 11 too
    nock(/example\.com/)
      .get('/getStaticPage/10')
      .query(true)
      .reply(200, {})

    const wrapper = shallow(<StaticPage page={Object.assign({}, page, { title: 'Homepage' })} id={10} />, { disableLifecycleMethods: true })

    expect(wrapper).toContainReact(<title>MyStore</title>)
  })
})

describe('getInitialProps()', () => {
  test('fetches and returns the page when run server side', async () => {
    Config.set({ apiHostProxy: 'http://example.com' })

    const pageRequest = nock(/example\.com/)
      .get('/getStaticPage/10')
      .query(true)
      .reply(200, {
        id: 10,
        title: 'Test Page'
      })

    expect(await StaticPage.getInitialProps({ query: { id: 10 }, req: true, reduxStore: { dispatch: jest.fn() }})).toEqual({
      id: 10,
      page: {
        id: 10,
        title: 'Test Page'
      },
      isServer: true
    })
    expect(pageRequest.isDone()).toBe(true)
  })

  test('fetches and returns the page when run client side', async () => {
    Config.set({ apiHostProxy: 'http://example.com' })

    const pageRequest = nock(/example\.com/)
      .get('/getStaticPage/10')
      .query(true)
      .reply(200, {
        id: 10,
        title: 'Test Page'
      })

    expect(await StaticPage.getInitialProps({ query: { id: 10 }, req: false, reduxStore: { dispatch: jest.fn() }})).toEqual({
      id: 10,
      page: {
        id: 10,
        title: 'Test Page'
      },
      isServer: false
    })
    expect(pageRequest.isDone()).toBe(true)
  })

  test('fetches and returns the page when run server side with a custom request query', async () => {
    Config.set({
      apiHostProxy: 'http://example.com'
    })

    const staticPageQuery = {
      include: 'aCustomQuery'
    }

    StaticPage.pageRequest = (pageId) => {
      return {
        endpoint: `/getStaticPage/${pageId}`,
        query: staticPageQuery
      }
    }

    const pageRequest = nock(/example\.com/)
      .get('/getStaticPage/10')
      .query(staticPageQuery)
      .reply(200, {
        id: 10,
        title: 'Test Page'
      })

    expect(await StaticPage.getInitialProps({ query: { id: 10 }, req: true, reduxStore: { dispatch: jest.fn() } })).toEqual({
      id: 10,
      page: {
        id: 10,
        title: 'Test Page'
      },
      isServer: true
    })
    expect(pageRequest.isDone()).toBe(true)
  })
})
