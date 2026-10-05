# Vue — Auth

**API:** [`docs/auth/frontend.md`](../../../docs/auth/frontend.md)

| Item | Value |
|---|---|
| Pages | `pages/auth/Login.vue`, `Signup.vue` |
| Store | `stores/auth/auth.js` |
| URLs | `auth.login/signup/refresh/logout` |
| Tokens | `common/authToken.js` (`accessToken`, `refreshToken`, `currentUser`) |

Login/signup honor `?redirect=`. Refresh on 401 via `request.js`. Logout clears tokens, permissions, and WS.
