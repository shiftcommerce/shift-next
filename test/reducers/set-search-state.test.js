import setSearchState from '../../src/reducers/set-search-state'
import * as actionTypes from '../../src/actions/action-types'

test('applies a category filter when SET_FILTER_CATEGORY is dispatched', () => {
  const action = {
    type: actionTypes.SET_FILTER_CATEGORY,
    categoryName: 'test'
  }

  expect(setSearchState({}, action)).toEqual({
    filterCategory: 'test'
  })
})

test('clears the category filter when CLEAR_SEARCH_FILTER is dispatched', () => {
  const action = {
    type: actionTypes.CLEAR_SEARCH_FILTER
  }

  expect(setSearchState({ filterCategory: 'test' }, action)).toEqual({
    filterCategory: null
  })
})

test("doesn't change the state when an unrecognized action is dispatched", () => {
  const action = {
    type: 'UNKNOWN',
    categoryName: 'test2'
  }

  expect(setSearchState({ filterCategory: 'test' }, action)).toEqual({
    filterCategory: 'test'
  })
})
