export { default as authApi } from './authApi.jsx';

export { default as signUpApi } from './signupApi.jsx';

export { default as signInApi } from './loginApi.jsx';

export { default as usernameCheckApi } from './userCheckApi.jsx';

import signInApi from './loginApi.jsx';
import signUpApi from './signupApi.jsx';
import usernameCheckApi from './userCheckApi.jsx';

export const apiService = {
  auth: {
    signIn: signInApi,
    signUp: signUpApi,
    usernameCheck: usernameCheckApi,
  },
};
