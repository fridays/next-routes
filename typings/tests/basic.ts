import * as http from "http";
import * as next from "next";
import Routes from "../..";

const routes = Routes();

routes
  .add("login")
  .add("home", "/", "index")
  .add("/settings", "/users/:id/settings")
  .add("/example", "example")
  .add({ name: "objectstyle", pattern: "/cool", page: "cool" });

export const createServer = () => {
  const app = next({ dev: true });
  return app.prepare().then(() => {
    return http.createServer(routes.getRequestHandler(app, ({ req, res, route, query }) => {
      return app.render(req, res, route.page, query);
    }));
  });
};

export default routes;
