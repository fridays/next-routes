'use strict';

var _jsxFileName = 'src/index.js';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _url = require('url');

var _link = require('next/link');

var _link2 = _interopRequireDefault(_link);

var _router = require('next/router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function (opts) {
  return new Routes(opts);
};

var Routes = function () {
  function Routes() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$Link = _ref.Link,
        Link = _ref$Link === undefined ? _link2.default : _ref$Link,
        _ref$Router = _ref.Router,
        Router = _ref$Router === undefined ? _router2.default : _ref$Router;

    _classCallCheck(this, Routes);

    this.routes = [];
    this.Link = this.getLink(Link);
    this.Router = this.getRouter(Router);
  }

  _createClass(Routes, [{
    key: 'add',
    value: function add(name, pattern, page) {
      var options = void 0;
      if (name instanceof Object) {
        options = name;
        name = options.name;
      } else {
        if (name[0] === '/') {
          page = pattern;
          pattern = name;
          name = null;
        }
        options = { name: name, pattern: pattern, page: page };
      }

      if (this.findByName(name)) {
        throw new Error('Route "' + name + '" already exists');
      }

      this.routes.push(new Route(options));
      return this;
    }
  }, {
    key: 'findByName',
    value: function findByName(name) {
      if (name) {
        return this.routes.filter(function (route) {
          return route.name === name;
        })[0];
      }
    }
  }, {
    key: 'match',
    value: function match(url) {
      var parsedUrl = (0, _url.parse)(url, true);
      var pathname = parsedUrl.pathname,
          query = parsedUrl.query;


      return this.routes.reduce(function (result, route) {
        if (result.route) return result;
        var params = route.match(pathname);
        if (!params) return result;
        return _extends({}, result, { route: route, params: params, query: _extends({}, query, params) });
      }, { query: query, parsedUrl: parsedUrl });
    }
  }, {
    key: 'findAndGetUrls',
    value: function findAndGetUrls(nameOrUrl, params) {
      var route = this.findByName(nameOrUrl);

      if (route) {
        return { route: route, urls: route.getUrls(params), byName: true };
      } else {
        var _match = this.match(nameOrUrl),
            _route = _match.route,
            query = _match.query;

        var href = _route ? _route.getHref(query) : nameOrUrl;
        var urls = { href: href, as: nameOrUrl };
        return { route: _route, urls: urls };
      }
    }
  }, {
    key: 'getRequestHandler',
    value: function getRequestHandler(app, customHandler) {
      var _this = this;

      var nextHandler = app.getRequestHandler();

      return function (req, res) {
        var _match2 = _this.match(req.url),
            route = _match2.route,
            query = _match2.query,
            parsedUrl = _match2.parsedUrl;

        if (route) {
          if (customHandler) {
            customHandler({ req: req, res: res, route: route, query: query });
          } else {
            app.render(req, res, route.page, query);
          }
        } else {
          nextHandler(req, res, parsedUrl);
        }
      };
    }
  }, {
    key: 'getLink',
    value: function getLink(Link) {
      var _this2 = this;

      var LinkRoutes = function LinkRoutes(props) {
        var route = props.route,
            params = props.params,
            to = props.to,
            newProps = _objectWithoutProperties(props, ['route', 'params', 'to']);

        var nameOrUrl = route || to;

        if (nameOrUrl) {
          Object.assign(newProps, _this2.findAndGetUrls(nameOrUrl, params).urls);
        }

        return _react2.default.createElement(Link, _extends({}, newProps, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 99
          }
        }));
      };
      return LinkRoutes;
    }
  }, {
    key: 'getRouter',
    value: function getRouter(Router) {
      var _this3 = this;

      var wrap = function wrap(method) {
        return function (route, params, options) {
          var _findAndGetUrls = _this3.findAndGetUrls(route, params),
              byName = _findAndGetUrls.byName,
              _findAndGetUrls$urls = _findAndGetUrls.urls,
              as = _findAndGetUrls$urls.as,
              href = _findAndGetUrls$urls.href;

          return Router[method](href, as, byName ? options : params);
        };
      };

      Router.pushRoute = wrap('push');
      Router.replaceRoute = wrap('replace');
      Router.prefetchRoute = wrap('prefetch');
      return Router;
    }
  }]);

  return Routes;
}();

var Route = function () {
  function Route(_ref2) {
    var name = _ref2.name,
        pattern = _ref2.pattern,
        _ref2$page = _ref2.page,
        page = _ref2$page === undefined ? name : _ref2$page,
        _ref2$metadata = _ref2.metadata,
        metadata = _ref2$metadata === undefined ? {} : _ref2$metadata;

    _classCallCheck(this, Route);

    if (!name && !page) {
      throw new Error('Missing page to render for route "' + pattern + '"');
    }

    this.name = name;
    this.metadata = metadata;
    this.pattern = pattern || '/' + name;
    this.page = page.replace(/(^|\/)index$/, '').replace(/^\/?/, '/');
    this.regex = (0, _pathToRegexp2.default)(this.pattern, this.keys = []);
    this.keyNames = this.keys.map(function (key) {
      return key.name;
    });
    this.toPath = _pathToRegexp2.default.compile(this.pattern);
  }

  _createClass(Route, [{
    key: 'match',
    value: function match(path) {
      var values = this.regex.exec(path);
      if (values) {
        return this.valuesToParams(values.slice(1));
      }
    }
  }, {
    key: 'valuesToParams',
    value: function valuesToParams(values) {
      var _this4 = this;

      return values.reduce(function (params, val, i) {
        if (val === undefined) return params;
        return Object.assign(params, _defineProperty({}, _this4.keys[i].name, val));
      }, {});
    }
  }, {
    key: 'getHref',
    value: function getHref() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.page + '?' + toQuerystring(params);
    }
  }, {
    key: 'getAs',
    value: function getAs() {
      var _this5 = this;

      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var as = this.toPath(params) || '/';
      var keys = Object.keys(params);
      var qsKeys = keys.filter(function (key) {
        return _this5.keyNames.indexOf(key) === -1;
      });

      if (!qsKeys.length) return as;

      var qsParams = qsKeys.reduce(function (qs, key) {
        return Object.assign(qs, _defineProperty({}, key, params[key]));
      }, {});

      return as + '?' + toQuerystring(qsParams);
    }
  }, {
    key: 'getUrls',
    value: function getUrls(params) {
      var as = this.getAs(params);
      var href = this.getHref(params);
      return { as: as, href: href };
    }
  }]);

  return Route;
}();

var toQuerystring = function toQuerystring(obj) {
  return Object.keys(obj).filter(function (key) {
    return obj[key] !== null && obj[key] !== undefined;
  }).map(function (key) {
    var value = obj[key];

    if (Array.isArray(value)) {
      value = value.join('/');
    }
    return [encodeURIComponent(key), encodeURIComponent(value)].join('=');
  }).join('&');
};