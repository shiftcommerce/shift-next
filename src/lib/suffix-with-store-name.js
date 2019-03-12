import Config from './config'

export function suffixWithStoreName (title) {
  return `${title} - ${Config.get().storeName}`
}
