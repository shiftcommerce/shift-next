exports.default = function () {
    const state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    const action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}

    switch (action.type) {
      case 'REDUX_LOADING_MIDDLEWARE':
        {
          return Object.assign({}, state, {
            loading: action.loading
          })
        }
      default:
        {
          return state;
        }
    }
}