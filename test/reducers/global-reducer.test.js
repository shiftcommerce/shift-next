import globalReducer from '../../src/reducers/global-reducer'
import * as actionTypes from '../../src/actions/action-types'

test('sets loading to true or false when action called', async () => {
  const trueAction = {
    type: actionTypes.TOGGLE_LOADING,
    loading: true
  }

  const falseAction = {
    type: actionTypes.TOGGLE_LOADING,
    loading: false
  }

  expect(globalReducer({ loading: false }, trueAction)).toEqual({
    loading: true
  })

  expect(globalReducer({ loading: true }, falseAction)).toEqual({
    loading: false
  })
})
