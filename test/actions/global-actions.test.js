import * as globalActions from '../../src/actions/global-actions'
import * as actionTypes from '../../src/actions/action-types'

test('toggleLoading() sets loading to true or false', () => {
  const toggleLoadingSpy = jest.spyOn(globalActions, 'toggleLoading')

  const action = globalActions.toggleLoading(true)

  expect(toggleLoadingSpy).toHaveBeenCalledTimes(1)
  const request = toggleLoadingSpy.mock.calls[0][0]
  expect(request).toEqual(true)
  expect(action.type).toEqual(actionTypes.TOGGLE_LOADING)

  toggleLoadingSpy.mockRestore()
})
