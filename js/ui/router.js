/**
 * APP ROUTER — Hash-based SPA routing
 * Routes: #home | #levels | #game/:destId | #daily | #result
 */

export class Router {
  constructor(routes) {
    this._routes   = routes; // { home, levels, game, daily, result }
    this._current  = null;
    this._params   = {};

    window.addEventListener('hashchange', () => this._handleRoute());
    this._handleRoute();
  }

  _handleRoute() {
    const hash   = location.hash.slice(1) || 'home';
    const [route, ...rest] = hash.split('/');

    this._params = {};
    if (rest.length) this._params.id = rest.join('/');

    if (this._routes[route]) {
      this._current = route;
      this._routes[route](this._params);
    } else {
      this.go('home');
    }
  }

  go(route, params = {}) {
    const paramStr = params.id ? `/${params.id}` : '';
    location.hash = `${route}${paramStr}`;
  }

  get current() { return this._current; }
  get params()  { return this._params; }
}
