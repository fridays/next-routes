import pathToRegexp from 'path-to-regexp'
import React from 'react'
import {parse} from 'url'
import Link from 'next/link'
import Router from 'next/router'

module.exports = opts => new Routes(opts)

const nextPaths = [
  '/_next',
  '/_webpack/',
  '/__webpack_hmr',
  '/static/'
]

class Routes {
  constructor ({
    WrapLink = Link,
    WrapRouter = Router
  } = {}) {
    this.routes = []
    this.Link = this.getLink(WrapLink)
    this.Router = this.getRouter(WrapRouter)
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
    const pushRoute = (name, params = {}) => {
      const {href, as} = this.findByName(name).getLinkProps(params)
      return Router.push(href, as)
    }

    const replaceRoute = (name, params = {}) => {
      const {href, as} = this.findByName(name).getLinkProps(params)
      return Router.replace(href, as)
    }

    return Object.assign(Object.create(Router), {pushRoute, replaceRoute})
  }
}

class Route {
  constructor (name, pattern, page = name) {
    this.name = name
    this.pattern = pattern || `/${name}`
    this.page = page.replace(/^\/?(.*)/, '/$1')
    this.regex = pathToRegexp(this.pattern, this.keys = [])
    this.getAs = pathToRegexp.compile(this.pattern)
  }

  match (path) {
    const values = this.regex.exec(path)
    if (values) {
      return this.valuesToParams(values.slice(1))
    }
  }

  valuesToParams (values) {
    return values.reduce((params, val, i) => (
      Object.assign(params, {[this.keys[i].name]: val})
    ), {})
  }

  getHref (params = {}) {
    const qs = Object.keys(params).map(key => {
      let value = params[key]
      if (Array.isArray(value)) {
        value = value.join('/')
      }
      return [
        encodeURIComponent(key),
        encodeURIComponent(value)
      ].join('=')
    }).join('&')

    return `${this.page}?${qs}`
  }

  getLinkProps (params = {}) {
    const as = this.getAs(params)
    const href = this.getHref(params)
    return {as, href}
  }
}
