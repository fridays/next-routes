import pathToRegexp from 'path-to-regexp'
import React from 'react'
import {parse} from 'url'
import NextLink from 'next/link'
import NextRouter from 'next/router'

module.exports = opts => new Routes(opts)

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
    return this.routes.filter(route => route.name === name)[0]
  }

  match (url) {
    const parsedUrl = parse(url, true)
    const {pathname, query} = parsedUrl

    return this.routes.reduce((result, route) => {
      if (result.route) return result
      const params = route.match(pathname)
      if (!params) return result
      return {...result, route, params, query: {...query, ...params}}
    }, {query, parsedUrl})
  }

  getRequestHandler (app, customHandler) {
    const nextHandler = app.getRequestHandler()

    return (req, res) => {
      const {route, query, parsedUrl} = this.match(req.url)

      if (route) {
        if (customHandler) {
          customHandler({req, res, route, query})
        } else {
          app.render(req, res, route.page, query)
        }
      } else {
        nextHandler(req, res, parsedUrl)
      }
    }
  }

  getLink (Link) {
    const LinkRoutes = props => {
      const {route: routeProp, params, ...newProps} = props

      if (routeProp) {
        const route = this.findByName(routeProp)

        if (route) {
          Object.assign(newProps, route.getLinkProps(params))
        } else {
          const {route, query} = this.match(routeProp)

          if (route) {
            const href = route.getHref(query)
            Object.assign(newProps, {href, as: routeProp})
          } else {
            Object.assign(newProps, {href: routeProp})
          }
        }
      }

      return <Link {...newProps} />
    }
    return LinkRoutes
  }

  getRouter (Router) {
    const fns = ['push', 'replace', 'prefetch']

    return fns.reduce((Router, fn) => Object.assign(Router, {
      [`${fn}Route`]: (routeProp, params, options) => {
        const route = this.findByName(routeProp)

        if (route) {
          const {href, as} = route.getLinkProps(params)
          return Router[fn](href, as, options)
        } else {
          options = options || params
          const {route, query} = this.match(routeProp)
          const url = route ? route.getHref(query) : routeProp
          return Router[fn](url, routeProp, options)
        }
      }
    }), Router)
  }
}

class Route {
  constructor (name, pattern, page = name) {
    if (name.charAt(0) === '/') {
      page = pattern
      pattern = name
      name = null

      if (!page) {
        throw new Error(`Please define a page to render for route "${pattern}"`)
      }
    }

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
    const qsKeys = keys.filter(key => this.keyNames.indexOf(key) === -1)

    if (!qsKeys.length) return as

    const qsParams = qsKeys.reduce((qs, key) => Object.assign(qs, {
      [key]: params[key]
    }), {})

    return `${as}?${toQuerystring(qsParams)}`
  }

  getLinkProps (params) {
    const as = this.getAs(params)
    const href = this.getHref(params)
    return {as, href}
  }
}

const toQuerystring = obj => Object.keys(obj).map(key => {
  let value = obj[key]
  if (Array.isArray(value)) {
    value = value.join('/')
  }
  return [
    encodeURIComponent(key),
    encodeURIComponent(value)
  ].join('=')
}).join('&')
