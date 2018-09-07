import routes from './basic';

const whiteList : RegExp[] = [];

for (let i = 0; i < routes.routes.length; i++) {
  const route = routes.routes[i];
  whiteList.push(new RegExp(`^\\/_next\\/-\\/page\\${route.page}\\.{1}js(\\.map)?$`));
  whiteList.push(new RegExp(`^\\/_next\\/on-demand-entries-ping\\?page=\\${route.page}$`));
  whiteList.push(/_next\/webpack\/chunks\/[a-zA-Z\d-_]+\.js$/);
  whiteList.push(route.regex);
}

export default whiteList;