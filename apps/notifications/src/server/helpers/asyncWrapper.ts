// Wrapper to catch errors in async routeHandlers
// https://thecodebarbarian.com/80-20-guide-to-express-error-handling
export default (asyncRouteHandler) => (request, response, next) =>
  asyncRouteHandler(request, response, next).catch(next);
