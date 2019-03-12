/**
 * Convert time in seconds to a Date instance
 * @return {Date} The Date instance for when the session should expire
 */
export const getSessionExpiryTime = () => {
  // Set default session expiry time in seconds (30 days)
  const defaultSessionExpirySeconds = 30 * 24 * 60 * 60
  // Get the `SESSSION_EXPIRY` from the environment. If it's empty, use
  // the value set in `defaultSessionExpirySeconds`
  const expiryInSeconds = (process.env.SESSSION_EXPIRY || defaultSessionExpirySeconds)

  return new Date(Date.now() + (expiryInSeconds * 1000))
}
