import buildSearchStateForURL from '../../src/lib/build-search-state-for-url'

test('it does not modify the original searchState argument', () => {
  const searchState = {
    id: 10,
    query: 'eggplant'
  }
  Object.freeze(searchState)

  expect(() => buildSearchStateForURL(searchState)).not.toThrow()
})

test('it removes the id from search state', () => {
  const searchState = {
    id: 10,
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({ query: 'eggplant' })
})

test('it removes configure property from search state', () => {
  const searchState = {
    configure: {
      filter: {
        category_id: 10
      }
    },
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({ query: 'eggplant' })
})

test('it removes current page from search state', () => {
  const searchState = {
    page: 20,
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({ query: 'eggplant' })
})

test('it removes empty ranges from search state', () => {
  const searchState = {
    range: {
      product_rating: { min: 1, max: 5 },
      'variant_meta_data.eu.price': {}
    },
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({
    range: {
      product_rating: { min: 1, max: 5 }
    },
    query: 'eggplant'
  })
})

test('it removes reset rating range from search state', () => {
  const searchState = {
    range: {
      product_rating: { min: 0, max: 5 },
      'variant_meta_data.eu.price': { min: 10, max: 20 }
    },
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({
    range: {
      'variant_meta_data.eu.price': { min: 10, max: 20 }
    },
    query: 'eggplant'
  })
})

test('it does not remove active rating ranges from search state', () => {
  const searchState = {
    range: {
      product_rating: { min: 2, max: 4 }
    },
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({
    range: {
      product_rating: { min: 2, max: 4 }
    },
    query: 'eggplant'
  })
})

test('it removes the entire range property when it would become empty', () => {
  const searchState = {
    range: {
      product_rating: { min: 0, max: 5 }
    },
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({ query: 'eggplant' })
})

test('it removes empty refinements', () => {
  const searchState = {
    refinementList: {
      category_ids: '',
      colors: 'red'
    },
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({
    refinementList: {
      colors: 'red'
    },
    query: 'eggplant'
  })
})

test('it removes the entire refinementList property when it would become empty', () => {
  const searchState = {
    refinementList: {
      category_ids: ''
    },
    query: 'eggplant'
  }

  expect(buildSearchStateForURL(searchState)).toEqual({ query: 'eggplant' })
})
