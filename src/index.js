import pathToRegexp from 'path-to-regexp'
import React from 'react'
import {parse} from 'url'
import NextLink from 'next/link'
import NextRouter from 'next/router'

module.exports = opts => new Routes(opts)

const nextPaths = [
  '/_next',
  '/_webpack/',
  '/__webpack_hmr',
  '/static/'
]

class Routes {
  constructor ({
    Link = NextLink,
    Router = NextRouter
  } = {}) {
    this.routes = []
    this.Link = this.getLink(Link)
    this.Router = this.getRouter(Router)
  }

  add (...args) {
    this.routes.push(new Route(...args))
    return this
  }

  findByName (name) {
    const route = this.routes.find(route => route.name === name)
    if (!route) {
      throw new Error(`Unknown route: ${name}`)
    }
    return route
  }

  match (path) {
    let params
    const route = this.routes.find(route => (params = route.match(path)))
    return {route, params}
  }

  isNextPath (url) {
    return nextPaths.some(path => url.startsWith(path))
  }

  getRequestHandler (app) {
    const nextHandler = app.getRequestHandler()

    return (req, res) => {
      const parsedUrl = parse(req.url, true)
      const {pathname, query} = parsedUrl

      if (this.isNextPath(pathname)) {
        nextHandler(req, res, parsedUrl)
      } else {
        const {route, params} = this.match(pathname)

        if (route) {
          app.render(req, res, route.page, {...query, ...params})
        } else {
          nextHandler(req, res, parsedUrl)
        }
      }
    }
  }

  getLink (Link) {
    return props => {
      const {route, params, ...newProps} = props

      if (route) {
        Object.assign(newProps, this.findByName(route).getLinkProps(params))
      }

      return <Link {...newProps} />
    }
  }

  getRouter (Router) {
    Router.pushRoute = (name, params = {}, options) => {
      const {href, as} = this.findByName(name).getLinkProps(params)
      return Router.push(href, as, options)
    }

    Router.replaceRoute = (name, params = {}, options) => {
      const {href, as} = this.findByName(name).getLinkProps(params)
      return Router.replace(href, as, options)
    }

    Router.prefetchRoute = (name, params = {}) => {
      const {href} = this.findByName(name).getLinkProps(params)
      return Router.prefetch(href)
    }

    return Router
  }
}

class Route {
  constructor (name, pattern, page = name) {
    this.name = name
    this.pattern = pattern || `/${name}`
    this.page = page.replace(/^\/?(.*)/, '/$1')
    this.regex = pathToRegexp(this.pattern, this.keys = [])
    this.keyNames = this.keys.map(key => key.name)
    this.toPath = pathToRegexp.compile(this.pattern)
  }

  match (path) {
    const values = this.regex.exec(path)
    if (values) {
      return this.valuesToParams(values.slice(1))
    }
  }

  valuesToParams (values) {
    return values.reduce((params, val, i) => Object.assign(params, {
      [this.keys[i].name]: val
    }), {})
  }

  getHref (params = {}) {
    return `${this.page}?${toQuerystring(params)}`
  }

  getAs (params = {}) {
    const as = this.toPath(params)
    const keys = Object.keys(params)
    const qsKeys = keys.filter(key => !this.keyNames.includes(key))

    if (!qsKeys.length) return as

    const qsParams = qsKeys.reduce((qs, key) => Object.assign(qs, {
      [key]: params[key]
    }), {})

    return `${as}?${toQuerystring(qsParams)}`
  }

  getLinkProps (params = {}) {
    const as = this.getAs(params)
    const href = this.getHref(params)
    return {as, href}
  }
}

const toQuerystring = (obj = {}) => Object.keys(obj).map(key => {
  let value = obj[key]
  if (Array.isArray(value)) {
    value = value.join('/')
  }
  return [
    encodeURIComponent(key),
    encodeURIComponent(value)
  ].join('=')
}).join('&')
