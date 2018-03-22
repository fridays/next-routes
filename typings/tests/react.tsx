import * as React from "react";
import routes from "./basic";

const { Link, Router } = routes;

export default class App extends React.Component {
  handleClick() {
    Router.pushRoute("settings", { id: "123" }, { shallow: false });
  }
  public render() {
    return (
      <div>
        <button onClick={() => this.handleClick()}>Test router</button>
        <Link route="settings" params={{ id: "123" }} passHref>
          <a>Link test</a>
        </Link>
      </div>
    );
  }
}
