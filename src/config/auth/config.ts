const ISSUER = process.env.REACT_APP_ISSUER as string
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID as string

export default {
  issuer: ISSUER,
  clientId: CLIENT_ID,
  pkce: true,
  tokenManager: {
    autoRenew: true,
  },
}
