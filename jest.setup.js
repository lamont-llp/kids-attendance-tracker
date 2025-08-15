require('@testing-library/jest-dom');

import 'whatwg-fetch';

global.Request = Request;
global.Response = Response;
global.Headers = Headers;