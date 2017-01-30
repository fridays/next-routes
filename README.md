# Named routes for next.js

Easy to use universal named routes for [next.js](https://github.com/zeit/next.js)

- Express-style route and parameters matching
- Request handler middleware for express.js
- `Link` and `Router` that generate URLs by route name

## How to use

Install:

```bash
npm i --save next-routes
```

Create `routes.js` inside your project root:

```javascript
// routes.js
const nextRoutes = require('next-routes')
const routes = module.exports = nextRoutes()

routes.add('blog', '/blog/:slug')
routes.add('about', '/about-us/:foo(bar|baz)', 'index')
```
This file is used both on the server an the client.

API: `routes.add(name, pattern, page = name)`

- `name` - The route name
- `pattern` - Express-style route pattern (uses [path-to-regexp](https://github.com/pillarjs/path-to-regexp))
- `page` - Page inside `./pages` to be rendered (defaults to `name`)

The page component receives the matched URL parameters merged into `req.query`

### On the server

Usage with express.js

```javascript
// server.js
const express = require('express')
const next = require('next')
const app = next({dev: process.env.NODE_ENV !== 'production'})
const routes = require('./routes')

app.prepare().then(() => {
  const server = express()
    .use(routes.getRequestHandler(app))
    .listen(3000)
})
```

### On the client

Thin wrappers around `Link` and `Router` add support for generated URLs based on route name and parameters. Just import them from your `routes` file:

#### `Link` example

```javascript
// pages/index.js
import {Link} from '../routes'

export default () => (
  <div>
    <div>Welcome to next.js!</div>
    <Link route="blog" params={{slug: 'hello-world'}}>
      <a>Hello world</a>
    </Link>
  </div>
)
```

API: `<Link route="name" params={params}>...</Link>`

- `route` - Name of a route
- `params` - URL params for the route

It generates the URL for the route and passes `href` and `as` props to `next/link`.

---

#### `Router` example

```javascript
// pages/blog.js
import {Router} from '../routes'

export default class extends React.Component {
  handleClick() {
    Router.pushRoute('about', {foo: 'bar'})
  }
  render() {
    return (
      <button onClick={this.handleClick.bind(this)}>
        Home
      </button>
    )
  }
}
```
API:

`Router.pushRoute(name, params)`

`Router.replaceRoute(name, params)`

- `route` - Name of a route
- `params` - URL params for the route

It generates the URL for the route and passes `href` and `as` parameters to `next/router`.

---
##### Related links

- [zeit/next.js](https://github.com/zeit/next.js) - Framework for server-rendered React apps
- [path-to-regexp](https://github.com/pillarjs/path-to-regexp) - Express-style path to regexp
