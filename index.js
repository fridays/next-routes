const pathToRegexp = require('path-to-regexp')
const React = require('react')
const Link = require('next/link').default
const Router = require('next/router').default

class Routes {
  constructor() {
    this.routes = []
    this.Link = this.getLinkComponent()
    this.Router = this.getRouter()
  }

  add(name, pattern, page) {
    const route = new Route(name, pattern, page)
    this.routes.push(route)
  }

  findByName(name) {
    return this.routes.find(route => route.name === name)
  }

  getRequestHandler(app) {
    const nextHandler = app.getRequestHandler()

    return (req, res) => {
      let params
      const {url, query} = req
      const route = this.routes.find(route => params = route.match(url))

      if (route) {
        app.render(req, res, route.page, Object.assign({}, query, params))
      } else {
        nextHandler(req, res)
      }
    }
  }

  getLinkComponent() {
    return props => {
      const {route, params} = props
      let newProps

      if (route) {
        newProps = Object.assign({}, props,
          this.findByName(route).getLinkProps(params))
      }

      return React.createElement(Link, newProps || props)
    }
  }

  getRouter() {
    const NamedRouter = Object.assign({}, Router)

    NamedRouter.pushRoute = (name, params) => {
      const {href, as} = this.findByName(name).getLinkProps(params)
      return Router.push(href, as)
    }

    NamedRouter.replaceRoute = (name, params) => {
      const {href, as} = this.findByName(name).getLinkProps(params)
      return Router.replace(href, as)
    }

    return NamedRouter
  }
}


class Route {
  constructor(name, pattern, page = name) {
    this.name = name
    this.pattern = pattern
    this.page = page
    this.regex = pathToRegexp(pattern, this.keys = [])
    this.getAs = pathToRegexp.compile(pattern)
  }

  match(url) {
    const matches = this.regex.exec(url)
    if (matches) {
      return this.valuesToParams(matches.slice(1))
    }
  }

  valuesToParams(values) {
    return values.reduce((params, val, i) => (
      Object.assign(params, {[this.keys[i].name]: val})
    ), {})
  }

  getHref(params) {
    const qs = Object.keys(params).map(key => [
      encodeURIComponent(key),
      encodeURIComponent(params[key])
    ].join('=')).join('&')

    return `/${this.page}?${qs}`
  }

  getLinkProps(params) {
    const as = this.getAs(params)
    const href = this.getHref(params)
    return {as, href}
  }
}


module.exports = () => new Routes()
exports.Routes = Routes
exports.Route = Route
