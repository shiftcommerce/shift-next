// Pages
import SearchPage from '../../src/pages/search'

// Mock out the next/config
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    ALGOLIA_RESULTS_PER_PAGE: 4
  }
}))

describe('algoliaComponentDidUpdate', () => {
  test("doesn't update state when searchState has changed", () => {
    const mockThis = {
      setState: jest.fn(),
      state: {
        searchState: {
          a: 1,
          b: 3
        }
      }
    }

    SearchPage.algoliaComponentDidUpdate.call(mockThis, {}, { searchState: { a: 1, b: 2 } })

    expect(mockThis.setState).not.toHaveBeenCalled()
  })

  test('when search state and category ids are the same it updates search state to match the state from the url', () => {
    const mockThis = {
      setState: jest.fn(),
      state: {
        categoryId: 20,
        searchState: {
          query: '300ml'
        }
      }
    }

    window.history.pushState({}, 'Test Title', '/search?query=600ml')

    SearchPage.algoliaComponentDidUpdate.call(mockThis,
      { id: 20, searchState: { configure: { config: 'config' } } },
      { categoryId: 20, searchState: { query: '300ml' } }
    )

    expect(mockThis.setState).toHaveBeenCalledWith({
      searchState: {
        configure: {
          config: 'config'
        },
        query: '600ml'
      }
    })

    window.history.pushState({}, 'Test Title', '/')
  })
})
