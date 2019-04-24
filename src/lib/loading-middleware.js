'use strict'

Object.defineProperty(exports, "__esModule", {
  value: true
})

let loadingChain = new Map()

let threshold = 700
let timeout = void 0

let loadingDone = function loadingDone(code, callback) {
  loadingChain.delete(code)

  if (timeout) {
    clearTimeout(timeout)
  }

  if (loadingChain.size <= 0) {
    timeout = setTimeout(function () {
      callback()
    }, threshold)
  }
};

function loadingMiddleware(store) {
  return function (next) {
    return function (action) {
      let nextAction = next(action)
      let isPromise = nextAction && !!nextAction.then

      let _ref = store.getState() || {},
        skipLoading = _ref.skipLoading

      if (isPromise && !skipLoading) {
        let code = Symbol(action.name)
        loadingChain.set(code, action.name)

        let toggleLoading = function toggleLoading(state) {
          if (store.dispatch) {
            store.dispatch({
              type: 'TOGGLE_LOADING',
              loading: state
            });
          } else {
            store.setState({ loading: state })
          }
        };

        toggleLoading(true)

        let loadingNextAction = new Promise(function (resolve, reject) {
          return nextAction.then(function (resp) {
            loadingDone(code, function () {
              return toggleLoading(false)
            })
            resolve(resp);
          }).catch(function (resp) {
            loadingDone(code, function () {
              return toggleLoading(false)
            })
            reject(resp)
          })
        })

        return loadingNextAction
      }

      return nextAction
    };
  };
}

loadingMiddleware.setThreshold = function (value) {
  threshold = value

  return loadingMiddleware
}

exports.default = loadingMiddleware