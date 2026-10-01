// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err)
  const status = err.status || 500
  res.status(status).json({
    message: err.message || 'Internal server error'
  })
}
