/* global jest, describe, test, expect */
import React from 'react'
import ReactShallowRenderer from 'react-test-renderer/shallow'
import NextLink from 'next/link'
import nextRoutes from '../dist/index'

const renderer = new ReactShallowRenderer()

const setupRoute = (...args) => {
  const routes = nextRoutes().add(...args)
  const route = routes.routes[routes.routes.length - 1]
  return {routes, route}
}

describe('Routes', () => {
  const setup = (...args) => {
    const {routes, route} = setupRoute(...args)
    const testRoute = expected => expect(route).toMatchObject(expected)
    return {routes, route, testRoute}
  }

  test('add with name', () => {
    setup('a').testRoute({name: 'a', pattern: '/a', page: '/a'})
  })

  test('add with name and pattern', () => {
    setup('a', '/:a').testRoute({name: 'a', pattern: '/:a', page: '/a'})
  })

  test('add with name, pattern and page', () => {
    setup('a', '/:a', 'b').testRoute({name: 'a', pattern: '/:a', page: '/b'})
  })

  test('add with pattern and page', () => {
    setup('/:a', 'b').testRoute({name: null, pattern: '/:a', page: '/b'})
  })

  test('add with only pattern throws', () => {
    expect(() => setup('/:a')).toThrow()
  })

  test('match and merge params into query', () => {
    const routes = nextRoutes().add('a').add('b', '/b/:b').add('c')
    expect(routes.match('/b/b?b=x&c=c').query).toMatchObject({b: 'b', c: 'c'})
  })

  test('generate urls from params', () => {
    const {route} = setup('a', '/a/:b/:c+')
    const params = {b: 'b', c: [1, 2], d: 'd'}
    const expected = {as: '/a/b/1/2?d=d', href: '/a?b=b&c=1%2F2&d=d'}
    expect(route.getLinkProps(params)).toEqual(expected)
    expect(setup('a').route.getLinkProps()).toEqual({as: '/a', href: '/a?'})
  })

  test('with custom Link and Router', () => {
    const CustomLink = () => <div />
    const CustomRouter = {}
    const {Link, Router} = nextRoutes({Link: CustomLink, Router: CustomRouter})
    expect(renderer.render(<Link />).type).toBe(CustomLink)
    expect(Router).toBe(CustomRouter)
  })
})

describe('Request handler', () => {
  const setup = url => {
    const routes = nextRoutes()
    const nextHandler = jest.fn()
    const app = {getRequestHandler: () => nextHandler, render: jest.fn()}
    return {app, routes, req: {url}, res: {}}
  }

  test('find route and call render', () => {
    const {routes, app, req, res} = setup('/a')
    const {route, query} = routes.add('a').match('/a')
    routes.getRequestHandler(app)(req, res)
    expect(app.render).toBeCalledWith(req, res, route.page, query)
  })

  test('find route and call custom handler', () => {
    const {routes, app, req, res} = setup('/a')
    const {route, query} = routes.add('a').match('/a')
    const customHandler = jest.fn()
    const expected = expect.objectContaining({req, res, route, query})
    routes.getRequestHandler(app, customHandler)(req, res)
    expect(customHandler).toBeCalledWith(expected)
  })

  test('find no route and call next handler', () => {
    const {routes, app, req, res} = setup('/a')
    const {parsedUrl} = routes.match('/a')
    routes.getRequestHandler(app)(req, res)
    expect(app.getRequestHandler()).toBeCalledWith(req, res, parsedUrl)
  })
})

describe('Link', () => {
  const setup = (...args) => {
    const {routes, route} = setupRoute(...args)
    const {Link} = routes
    const props = {children: <a>hello</a>}
    const testLink = (addProps, expected) => {
      const actual = renderer.render(<Link {...props} {...addProps} />)
      expect(actual.type).toBe(NextLink)
      expect(actual.props).toEqual({...props, ...expected})
    }
    return {routes, route, testLink}
  }

  test('with name and params', () => {
    const {route, testLink} = setup('a', '/a/:b')
    testLink({route: 'a', params: {b: 'b'}}, route.getLinkProps({b: 'b'}))
  })

  test('with route url', () => {
    const {routes, route, testLink} = setup('/a/:b', 'a')
    testLink({route: '/a/b'}, route.getLinkProps(routes.match('/a/b').query))
  })

  test('with route not found', () => {
    setup('a').testLink({route: '/b'}, {href: '/b'})
  })

  test('without route', () => {
    setup('a').testLink({href: '/'}, {href: '/'})
  })
})

const routerMethods = ['push', 'replace', 'prefetch']

describe(`Router ${routerMethods.join(', ')}`, () => {
  const setup = (...args) => {
    const {routes, route} = setupRoute(...args)
    const testMethods = (args, expected) => {
      routerMethods.forEach(method => {
        const Router = routes.getRouter({[method]: jest.fn()})
        Router[`${method}Route`](...args)
        expect(Router[method]).toBeCalledWith(...expected)
      })
    }
    return {routes, route, testMethods}
  }

  test('with name and params', () => {
    const {route, testMethods} = setup('a', '/a/:b')
    const {as, href} = route.getLinkProps({b: 'b'})
    testMethods(['a', {b: 'b'}, {}], [href, as, {}])
  })

  test('with route url', () => {
    const {routes, testMethods} = setup('/a', 'a')
    const {route, query} = routes.match('/a')
    const {as, href} = route.getLinkProps(query)
    testMethods(['/a', {}], [href, as, {}])
  })

  test('with route not found', () => {
    setup('a').testMethods(['/b', {}], ['/b', '/b', {}])
  })
})
