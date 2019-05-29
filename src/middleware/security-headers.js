// A configurable Express middleware for setting up and customising security headers

module.exports = (options = {}) => {
  return (request, response, next) => {
    const contentSecurityPolicy = buildContentSecurityPolicy(options.imageHosts, options.scriptHosts)

    const headers = buildHeaders(contentSecurityPolicy)

    // Set the security headers on the response
    response.set(headers)

    // Call the next middleware in the stack
    next()
  }
}

// Build the full set of security headers including the passed in CSP
// and Feature-Policy
const buildHeaders = (contentSecurityPolicy) => {
  return {
    // Prevents the site from being embedded within an iframe
    'x-frame-options': 'DENY',

    // Enables browsers' out-of-the-box XSS protection mechanisms
    'x-xss-protection': '1; mode=block',

    // Enforces Certificate Transparency, see
    // https://scotthelme.co.uk/a-new-security-header-expect-ct/
    'expect-ct': 'enforce, max-age=600',

    // Prevents a browser auto-detecting the type of an asset, meaning it'll only
    // use the Content-Type header
    'x-content-type-options': 'nosniff',

    // Prevents privacy leakage when linking out to an insecure website
    'referrer-policy': 'no-referrer-when-downgrade',

    // Prevents insecure HTTP requests, forces HTTPS
    'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',

    // A whitelist of sources for assets such as
    // scripts/stylesheets/imagery/etc
    'content-security-policy': contentSecurityPolicy,

    // This is like a CSP, but for browser features - it essentially whitelists
    // native capabilities you want to allow access to (e.g. do you want to
    // allow access to the camera, geolocation, etc?) - see
    // https://scotthelme.co.uk/a-new-security-header-feature-policy/
    'feature-policy': featurePolicy
  }
}

// Browser feature policy - enable/disable browser features as required
const featurePolicy = [
  "vr 'none'",
  "usb 'none'",
  "midi 'none'",
  "camera 'none'",
  "speaker 'none'",
  "payment 'none'",
  "autoplay 'none'",
  "sync-xhr 'none'",
  "gyroscope 'none'",
  "fullscreen 'none'",
  "microphone 'none'",
  "geolocation 'none'",
  "magnetometer 'none'",
  "accelerometer 'none'",
  "encrypted-media 'none'",
  "picture-in-picture 'none'",
  "ambient-light-sensor 'none'"
].join('; ')

// This method takes image hosts and builds the CSP header
const buildContentSecurityPolicy = (imageHosts, scriptHosts) => {
  const formattedImageHosts = (imageHosts) ? imageHosts.replace(',', ' ') : ''
  const formattedScriptHosts = (scriptHosts) ? scriptHosts.replace(',', ' ') : ''

  return [
    // Only first party origins are allowed by default
    "default-src 'self'",

    // Only allow first party images or from configured external hosts
    // TODO: data: is insecure, If your goal is security you'd be better off using a sha hash of the script trying to be executed rather than opening up this hole
    // Currently this is a workaround for having inline SVGs https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src
    `img-src 'self' ${formattedImageHosts} data:`,

    // Allow inline style attributes
    "style-src 'self' 'unsafe-inline'",

    // Only allow first party scripts and those from Stripe. Unsafe inline is
    // required as that's how we load Stripe
    // TODO: Added 'unsafe-eval' in order for stripe to load correctly and to stop an webpack error "Uncaught TypeError: __webpack_require__(...) is not a function"
    // for react index.js next and next-dev.  Is this approach safe?
    "script-src 'self' 'unsafe-inline' https://js.stripe.com  https://*.paypal.com https://*.paypalobjects.com 'unsafe-eval'",

    // Allow <frame> and <iframe>'s from third party sources.
    'frame-src https://js.stripe.com https://*.paypal.com',

    // Disable loading using script interfaces i.e. <a> pings, Fetch, XHR,
    // WebSocket and EventSource
    `connect-src 'self' https://*.algolia.net https://*.algolianet.com https://*.paypal.com ${formattedScriptHosts}`,

    // Enforce that forms point to self
    "form-action 'self'",

    // Block all <object> tags
    "object-src 'self'",

    // Block all insecure requests
    'block-all-mixed-content'
  ].join('; ')
}
