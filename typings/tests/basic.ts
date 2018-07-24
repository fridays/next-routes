import * as http from "http";
import * as next from "next";
import * as routes from "../..";

const nextroutes = routes()
.add("login")
.add("home", "/", "index")
.add("/settings", "/users/:id/settings")
.add("/example", "example")
.add({ name: "objectstyle", pattern: "/cool", page: "cool" });

export const createServer = () => {
  const app = next({ dev: true });
  return app.prepare().then(() => {
    return http.createServer(nextroutes.getRequestHandler(app));
  });
};

export default nextroutes;
