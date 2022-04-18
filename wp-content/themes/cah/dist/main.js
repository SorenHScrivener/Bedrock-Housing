/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var pkg = __webpack_require__(/*! ./../../package.json */ "./node_modules/axios/package.json");

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};
var currentVerArr = pkg.version.split('.');

/**
 * Compare package versions
 * @param {string} version
 * @param {string?} thanVersion
 * @returns {boolean}
 */
function isOlderVersion(version, thanVersion) {
  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
  var destVer = version.split('.');
  for (var i = 0; i < 3; i++) {
    if (pkgVersionArr[i] > destVer[i]) {
      return true;
    } else if (pkgVersionArr[i] < destVer[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Transitional option validator
 * @param {function|boolean?} validator
 * @param {string?} version
 * @param {string} message
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  var isDeprecated = version && isOlderVersion(version);

  function formatMessage(opt, desc) {
    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed in ' + version));
    }

    if (isDeprecated && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  isOlderVersion: isOlderVersion,
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./css/dots.css":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./css/dots.css ***!
  \************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "@charset \"UTF-8\";\n/**\n * ==============================================\n * Dot Elastic\n * ==============================================\n */\n.dot-elastic {\n  position: relative;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-elastic 1s infinite linear;\n          animation: dot-elastic 1s infinite linear;\n}\n.dot-elastic::before, .dot-elastic::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n}\n.dot-elastic::before {\n  left: -99px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-elastic-before 1s infinite linear;\n          animation: dot-elastic-before 1s infinite linear;\n}\n.dot-elastic::after {\n  left: 99px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-elastic-after 1s infinite linear;\n          animation: dot-elastic-after 1s infinite linear;\n}\n\n@-webkit-keyframes dot-elastic-before {\n  0% {\n    transform: scale(1, 1);\n  }\n  25% {\n    transform: scale(1, 1.5);\n  }\n  50% {\n    transform: scale(1, 0.67);\n  }\n  75% {\n    transform: scale(1, 1);\n  }\n  100% {\n    transform: scale(1, 1);\n  }\n}\n\n@keyframes dot-elastic-before {\n  0% {\n    transform: scale(1, 1);\n  }\n  25% {\n    transform: scale(1, 1.5);\n  }\n  50% {\n    transform: scale(1, 0.67);\n  }\n  75% {\n    transform: scale(1, 1);\n  }\n  100% {\n    transform: scale(1, 1);\n  }\n}\n@-webkit-keyframes dot-elastic {\n  0% {\n    transform: scale(1, 1);\n  }\n  25% {\n    transform: scale(1, 1);\n  }\n  50% {\n    transform: scale(1, 1.5);\n  }\n  75% {\n    transform: scale(1, 1);\n  }\n  100% {\n    transform: scale(1, 1);\n  }\n}\n@keyframes dot-elastic {\n  0% {\n    transform: scale(1, 1);\n  }\n  25% {\n    transform: scale(1, 1);\n  }\n  50% {\n    transform: scale(1, 1.5);\n  }\n  75% {\n    transform: scale(1, 1);\n  }\n  100% {\n    transform: scale(1, 1);\n  }\n}\n@-webkit-keyframes dot-elastic-after {\n  0% {\n    transform: scale(1, 1);\n  }\n  25% {\n    transform: scale(1, 1);\n  }\n  50% {\n    transform: scale(1, 0.67);\n  }\n  75% {\n    transform: scale(1, 1.5);\n  }\n  100% {\n    transform: scale(1, 1);\n  }\n}\n@keyframes dot-elastic-after {\n  0% {\n    transform: scale(1, 1);\n  }\n  25% {\n    transform: scale(1, 1);\n  }\n  50% {\n    transform: scale(1, 0.67);\n  }\n  75% {\n    transform: scale(1, 1.5);\n  }\n  100% {\n    transform: scale(1, 1);\n  }\n}\n/**\n * ==============================================\n * Dot Pulse\n * ==============================================\n */\n.dot-pulse {\n  position: relative;\n  left: -9999px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  box-shadow: 9999px 0 0 -5px;\n  -webkit-animation: dot-pulse 1.5s infinite linear;\n          animation: dot-pulse 1.5s infinite linear;\n  -webkit-animation-delay: 0.25s;\n          animation-delay: 0.25s;\n}\n.dot-pulse::before, .dot-pulse::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n}\n.dot-pulse::before {\n  box-shadow: 9900px 0 0 -5px;\n  -webkit-animation: dot-pulse-before 1.5s infinite linear;\n          animation: dot-pulse-before 1.5s infinite linear;\n  -webkit-animation-delay: 0s;\n          animation-delay: 0s;\n}\n.dot-pulse::after {\n  box-shadow: 10098px 0 0 -5px;\n  -webkit-animation: dot-pulse-after 1.5s infinite linear;\n          animation: dot-pulse-after 1.5s infinite linear;\n  -webkit-animation-delay: 0.5s;\n          animation-delay: 0.5s;\n}\n\n@-webkit-keyframes dot-pulse-before {\n  0% {\n    box-shadow: 9900px 0 0 -5px;\n  }\n  30% {\n    box-shadow: 9900px 0 0 2px;\n  }\n  60%, 100% {\n    box-shadow: 9900px 0 0 -5px;\n  }\n}\n\n@keyframes dot-pulse-before {\n  0% {\n    box-shadow: 9900px 0 0 -5px;\n  }\n  30% {\n    box-shadow: 9900px 0 0 2px;\n  }\n  60%, 100% {\n    box-shadow: 9900px 0 0 -5px;\n  }\n}\n@-webkit-keyframes dot-pulse {\n  0% {\n    box-shadow: 9999px 0 0 -5px;\n  }\n  30% {\n    box-shadow: 9999px 0 0 2px;\n  }\n  60%, 100% {\n    box-shadow: 9999px 0 0 -5px;\n  }\n}\n@keyframes dot-pulse {\n  0% {\n    box-shadow: 9999px 0 0 -5px;\n  }\n  30% {\n    box-shadow: 9999px 0 0 2px;\n  }\n  60%, 100% {\n    box-shadow: 9999px 0 0 -5px;\n  }\n}\n@-webkit-keyframes dot-pulse-after {\n  0% {\n    box-shadow: 10098px 0 0 -5px;\n  }\n  30% {\n    box-shadow: 10098px 0 0 2px;\n  }\n  60%, 100% {\n    box-shadow: 10098px 0 0 -5px;\n  }\n}\n@keyframes dot-pulse-after {\n  0% {\n    box-shadow: 10098px 0 0 -5px;\n  }\n  30% {\n    box-shadow: 10098px 0 0 2px;\n  }\n  60%, 100% {\n    box-shadow: 10098px 0 0 -5px;\n  }\n}\n/**\n * ==============================================\n * Dot Flashing\n * ==============================================\n */\n.dot-flashing {\n  position: relative;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-flashing 1s infinite linear alternate;\n          animation: dot-flashing 1s infinite linear alternate;\n  -webkit-animation-delay: 0.5s;\n          animation-delay: 0.5s;\n}\n.dot-flashing::before, .dot-flashing::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n}\n.dot-flashing::before {\n  left: -99px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-flashing 1s infinite alternate;\n          animation: dot-flashing 1s infinite alternate;\n  -webkit-animation-delay: 0s;\n          animation-delay: 0s;\n}\n.dot-flashing::after {\n  left: 99px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-flashing 1s infinite alternate;\n          animation: dot-flashing 1s infinite alternate;\n  -webkit-animation-delay: 1s;\n          animation-delay: 1s;\n}\n\n@-webkit-keyframes dot-flashing {\n  0% {\n    background-color: #41585f;\n  }\n  50%, 100% {\n    background-color: rgba(65, 88, 95, 0.2);\n  }\n}\n\n@keyframes dot-flashing {\n  0% {\n    background-color: #41585f;\n  }\n  50%, 100% {\n    background-color: rgba(65, 88, 95, 0.2);\n  }\n}\n/**\n * ==============================================\n * Dot Collision\n * ==============================================\n */\n.dot-collision {\n  position: relative;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n}\n.dot-collision::before, .dot-collision::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n}\n.dot-collision::before {\n  left: -55px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-collision-before 2s infinite ease-in;\n          animation: dot-collision-before 2s infinite ease-in;\n}\n.dot-collision::after {\n  left: 55px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-collision-after 2s infinite ease-in;\n          animation: dot-collision-after 2s infinite ease-in;\n  -webkit-animation-delay: 1s;\n          animation-delay: 1s;\n}\n\n@-webkit-keyframes dot-collision-before {\n  0%, 50%, 75%, 100% {\n    transform: translateX(0);\n  }\n  25% {\n    transform: translateX(-99px);\n  }\n}\n\n@keyframes dot-collision-before {\n  0%, 50%, 75%, 100% {\n    transform: translateX(0);\n  }\n  25% {\n    transform: translateX(-99px);\n  }\n}\n@-webkit-keyframes dot-collision-after {\n  0%, 50%, 75%, 100% {\n    transform: translateX(0);\n  }\n  25% {\n    transform: translateX(99px);\n  }\n}\n@keyframes dot-collision-after {\n  0%, 50%, 75%, 100% {\n    transform: translateX(0);\n  }\n  25% {\n    transform: translateX(99px);\n  }\n}\n/**\n * ==============================================\n * Dot Revolution\n * ==============================================\n */\n.dot-revolution {\n  position: relative;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n}\n.dot-revolution::before, .dot-revolution::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n}\n.dot-revolution::before {\n  left: 0;\n  top: -99px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  transform-origin: 27.5px 126.5px;\n  -webkit-animation: dot-revolution 1.4s linear infinite;\n          animation: dot-revolution 1.4s linear infinite;\n}\n.dot-revolution::after {\n  left: 0;\n  top: -198px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  transform-origin: 27.5px 225.5px;\n  -webkit-animation: dot-revolution 1s linear infinite;\n          animation: dot-revolution 1s linear infinite;\n}\n\n@-webkit-keyframes dot-revolution {\n  0% {\n    transform: rotateZ(0deg) translate3d(0, 0, 0);\n  }\n  100% {\n    transform: rotateZ(360deg) translate3d(0, 0, 0);\n  }\n}\n\n@keyframes dot-revolution {\n  0% {\n    transform: rotateZ(0deg) translate3d(0, 0, 0);\n  }\n  100% {\n    transform: rotateZ(360deg) translate3d(0, 0, 0);\n  }\n}\n/**\n * ==============================================\n * Dot Carousel\n * ==============================================\n */\n.dot-carousel {\n  position: relative;\n  left: -9999px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  -webkit-animation: dot-carousel 1.5s infinite linear;\n          animation: dot-carousel 1.5s infinite linear;\n}\n\n@-webkit-keyframes dot-carousel {\n  0% {\n    box-shadow: 9900px 0 0 -1px #41585f, 9999px 0 0 1px #41585f, 10098px 0 0 -1px #41585f;\n  }\n  50% {\n    box-shadow: 10098px 0 0 -1px #41585f, 9900px 0 0 -1px #41585f, 9999px 0 0 1px #41585f;\n  }\n  100% {\n    box-shadow: 9999px 0 0 1px #41585f, 10098px 0 0 -1px #41585f, 9900px 0 0 -1px #41585f;\n  }\n}\n\n@keyframes dot-carousel {\n  0% {\n    box-shadow: 9900px 0 0 -1px #41585f, 9999px 0 0 1px #41585f, 10098px 0 0 -1px #41585f;\n  }\n  50% {\n    box-shadow: 10098px 0 0 -1px #41585f, 9900px 0 0 -1px #41585f, 9999px 0 0 1px #41585f;\n  }\n  100% {\n    box-shadow: 9999px 0 0 1px #41585f, 10098px 0 0 -1px #41585f, 9900px 0 0 -1px #41585f;\n  }\n}\n/**\n * ==============================================\n * Dot Typing\n * ==============================================\n */\n.dot-typing {\n  position: relative;\n  left: -9999px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  -webkit-animation: dot-typing 1.5s infinite linear;\n          animation: dot-typing 1.5s infinite linear;\n}\n\n@-webkit-keyframes dot-typing {\n  0% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  16.667% {\n    box-shadow: 9900px -10px 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  33.333% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  50% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px -10px 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  66.667% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  83.333% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px -10px 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n}\n\n@keyframes dot-typing {\n  0% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  16.667% {\n    box-shadow: 9900px -10px 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  33.333% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  50% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px -10px 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  66.667% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n  83.333% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px -10px 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 9900px 0 0 0 #41585f, 9999px 0 0 0 #41585f, 10098px 0 0 0 #41585f;\n  }\n}\n/**\n * ==============================================\n * Dot Windmill\n * ==============================================\n */\n.dot-windmill {\n  position: relative;\n  top: -10px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  transform-origin: 5px 15px;\n  -webkit-animation: dot-windmill 2s infinite linear;\n          animation: dot-windmill 2s infinite linear;\n}\n.dot-windmill::before, .dot-windmill::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n}\n.dot-windmill::before {\n  left: -8.66254px;\n  top: 15px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n}\n.dot-windmill::after {\n  left: 8.66254px;\n  top: 15px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n}\n\n@-webkit-keyframes dot-windmill {\n  0% {\n    transform: rotateZ(0deg) translate3d(0, 0, 0);\n  }\n  100% {\n    transform: rotateZ(720deg) translate3d(0, 0, 0);\n  }\n}\n\n@keyframes dot-windmill {\n  0% {\n    transform: rotateZ(0deg) translate3d(0, 0, 0);\n  }\n  100% {\n    transform: rotateZ(720deg) translate3d(0, 0, 0);\n  }\n}\n/**\n * ==============================================\n * Dot Bricks\n * ==============================================\n */\n.dot-bricks {\n  position: relative;\n  top: 30.5px;\n  left: -9999px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  box-shadow: 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  -webkit-animation: dot-bricks 2s infinite ease;\n          animation: dot-bricks 2s infinite ease;\n}\n\n@-webkit-keyframes dot-bricks {\n  0% {\n    box-shadow: 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  }\n  8.333% {\n    box-shadow: 10029.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  }\n  16.667% {\n    box-shadow: 10029.5px -61px 0 0 #41585f, 9968.5px -61px 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  }\n  25% {\n    box-shadow: 10029.5px -61px 0 0 #41585f, 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f;\n  }\n  33.333% {\n    box-shadow: 10029.5px 0 0 0 #41585f, 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f;\n  }\n  41.667% {\n    box-shadow: 10029.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f;\n  }\n  50% {\n    box-shadow: 10029.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f, 9968.5px -61px 0 0 #41585f;\n  }\n  58.333% {\n    box-shadow: 9968.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f, 9968.5px -61px 0 0 #41585f;\n  }\n  66.666% {\n    box-shadow: 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f, 9968.5px -61px 0 0 #41585f;\n  }\n  75% {\n    box-shadow: 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f;\n  }\n  83.333% {\n    box-shadow: 9968.5px -61px 0 0 #41585f, 10029.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f;\n  }\n  91.667% {\n    box-shadow: 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  }\n}\n\n@keyframes dot-bricks {\n  0% {\n    box-shadow: 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  }\n  8.333% {\n    box-shadow: 10029.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  }\n  16.667% {\n    box-shadow: 10029.5px -61px 0 0 #41585f, 9968.5px -61px 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  }\n  25% {\n    box-shadow: 10029.5px -61px 0 0 #41585f, 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f;\n  }\n  33.333% {\n    box-shadow: 10029.5px 0 0 0 #41585f, 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f;\n  }\n  41.667% {\n    box-shadow: 10029.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f;\n  }\n  50% {\n    box-shadow: 10029.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f, 9968.5px -61px 0 0 #41585f;\n  }\n  58.333% {\n    box-shadow: 9968.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f, 9968.5px -61px 0 0 #41585f;\n  }\n  66.666% {\n    box-shadow: 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f, 9968.5px -61px 0 0 #41585f;\n  }\n  75% {\n    box-shadow: 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f;\n  }\n  83.333% {\n    box-shadow: 9968.5px -61px 0 0 #41585f, 10029.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f;\n  }\n  91.667% {\n    box-shadow: 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px -61px 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 9968.5px -61px 0 0 #41585f, 9968.5px 0 0 0 #41585f, 10029.5px 0 0 0 #41585f;\n  }\n}\n/**\n * ==============================================\n * Dot Floating\n * ==============================================\n */\n.dot-floating {\n  position: relative;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-floating 3s infinite cubic-bezier(0.15, 0.6, 0.9, 0.1);\n          animation: dot-floating 3s infinite cubic-bezier(0.15, 0.6, 0.9, 0.1);\n}\n.dot-floating::before, .dot-floating::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n}\n.dot-floating::before {\n  left: -12px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-floating-before 3s infinite ease-in-out;\n          animation: dot-floating-before 3s infinite ease-in-out;\n}\n.dot-floating::after {\n  left: -24px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-floating-after 3s infinite cubic-bezier(0.4, 0, 1, 1);\n          animation: dot-floating-after 3s infinite cubic-bezier(0.4, 0, 1, 1);\n}\n\n@-webkit-keyframes dot-floating {\n  0% {\n    left: calc(-50% - 27.5px);\n  }\n  75% {\n    left: calc(50% + 127.5px);\n  }\n  100% {\n    left: calc(50% + 127.5px);\n  }\n}\n\n@keyframes dot-floating {\n  0% {\n    left: calc(-50% - 27.5px);\n  }\n  75% {\n    left: calc(50% + 127.5px);\n  }\n  100% {\n    left: calc(50% + 127.5px);\n  }\n}\n@-webkit-keyframes dot-floating-before {\n  0% {\n    left: -50px;\n  }\n  50% {\n    left: -12px;\n  }\n  75% {\n    left: -50px;\n  }\n  100% {\n    left: -50px;\n  }\n}\n@keyframes dot-floating-before {\n  0% {\n    left: -50px;\n  }\n  50% {\n    left: -12px;\n  }\n  75% {\n    left: -50px;\n  }\n  100% {\n    left: -50px;\n  }\n}\n@-webkit-keyframes dot-floating-after {\n  0% {\n    left: -100px;\n  }\n  50% {\n    left: -24px;\n  }\n  75% {\n    left: -100px;\n  }\n  100% {\n    left: -100px;\n  }\n}\n@keyframes dot-floating-after {\n  0% {\n    left: -100px;\n  }\n  50% {\n    left: -24px;\n  }\n  75% {\n    left: -100px;\n  }\n  100% {\n    left: -100px;\n  }\n}\n/**\n * ==============================================\n * Dot Fire\n * ==============================================\n */\n.dot-fire {\n  position: relative;\n  left: -9999px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  box-shadow: 9999px 148.5px 0 -5px #41585f;\n  -webkit-animation: dot-fire 1.5s infinite linear;\n          animation: dot-fire 1.5s infinite linear;\n  -webkit-animation-delay: -0.85s;\n          animation-delay: -0.85s;\n}\n.dot-fire::before, .dot-fire::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n}\n.dot-fire::before {\n  box-shadow: 9999px 148.5px 0 -5px #41585f;\n  -webkit-animation: dot-fire 1.5s infinite linear;\n          animation: dot-fire 1.5s infinite linear;\n  -webkit-animation-delay: -1.85s;\n          animation-delay: -1.85s;\n}\n.dot-fire::after {\n  box-shadow: 9999px 148.5px 0 -5px #41585f;\n  -webkit-animation: dot-fire 1.5s infinite linear;\n          animation: dot-fire 1.5s infinite linear;\n  -webkit-animation-delay: -2.85s;\n          animation-delay: -2.85s;\n}\n\n@-webkit-keyframes dot-fire {\n  1% {\n    box-shadow: 9999px 148.5px 0 -5px #41585f;\n  }\n  50% {\n    box-shadow: 9999px -37.125px 0 2px #41585f;\n  }\n  100% {\n    box-shadow: 9999px -148.5px 0 -5px #41585f;\n  }\n}\n\n@keyframes dot-fire {\n  1% {\n    box-shadow: 9999px 148.5px 0 -5px #41585f;\n  }\n  50% {\n    box-shadow: 9999px -37.125px 0 2px #41585f;\n  }\n  100% {\n    box-shadow: 9999px -148.5px 0 -5px #41585f;\n  }\n}\n/**\n * ==============================================\n * Dot Spin\n * ==============================================\n */\n.dot-spin {\n  position: relative;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: transparent;\n  color: transparent;\n  box-shadow: 0 -118.8px 0 0 #41585f, 84.0043116px -84.0043116px 0 0 #41585f, 118.8px 0 0 0 #41585f, 84.0043116px 84.0043116px 0 0 rgba(65, 88, 95, 0), 0 118.8px 0 0 rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 0 rgba(65, 88, 95, 0), -118.8px 0 0 0 rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 0 rgba(65, 88, 95, 0);\n  -webkit-animation: dot-spin 1.5s infinite linear;\n          animation: dot-spin 1.5s infinite linear;\n}\n\n@-webkit-keyframes dot-spin {\n  0%, 100% {\n    box-shadow: 0 -118.8px 0 0 #41585f, 84.0043116px -84.0043116px 0 0 #41585f, 118.8px 0 0 0 #41585f, 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  12.5% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 0 #41585f, 118.8px 0 0 0 #41585f, 84.0043116px 84.0043116px 0 0 #41585f, 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  25% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 0 #41585f, 84.0043116px 84.0043116px 0 0 #41585f, 0 118.8px 0 0 #41585f, -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  37.5% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 0 #41585f, 0 118.8px 0 0 #41585f, -84.0043116px 84.0043116px 0 0 #41585f, -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  50% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 0 #41585f, -84.0043116px 84.0043116px 0 0 #41585f, -118.8px 0 0 0 #41585f, -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  62.5% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 0 #41585f, -118.8px 0 0 0 #41585f, -84.0043116px -84.0043116px 0 0 #41585f;\n  }\n  75% {\n    box-shadow: 0 -118.8px 0 0 #41585f, 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 0 #41585f, -84.0043116px -84.0043116px 0 0 #41585f;\n  }\n  87.5% {\n    box-shadow: 0 -118.8px 0 0 #41585f, 84.0043116px -84.0043116px 0 0 #41585f, 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 0 #41585f;\n  }\n}\n\n@keyframes dot-spin {\n  0%, 100% {\n    box-shadow: 0 -118.8px 0 0 #41585f, 84.0043116px -84.0043116px 0 0 #41585f, 118.8px 0 0 0 #41585f, 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  12.5% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 0 #41585f, 118.8px 0 0 0 #41585f, 84.0043116px 84.0043116px 0 0 #41585f, 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  25% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 0 #41585f, 84.0043116px 84.0043116px 0 0 #41585f, 0 118.8px 0 0 #41585f, -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  37.5% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 0 #41585f, 0 118.8px 0 0 #41585f, -84.0043116px 84.0043116px 0 0 #41585f, -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  50% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 0 #41585f, -84.0043116px 84.0043116px 0 0 #41585f, -118.8px 0 0 0 #41585f, -84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0);\n  }\n  62.5% {\n    box-shadow: 0 -118.8px 0 -5px rgba(65, 88, 95, 0), 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 0 #41585f, -118.8px 0 0 0 #41585f, -84.0043116px -84.0043116px 0 0 #41585f;\n  }\n  75% {\n    box-shadow: 0 -118.8px 0 0 #41585f, 84.0043116px -84.0043116px 0 -5px rgba(65, 88, 95, 0), 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 0 #41585f, -84.0043116px -84.0043116px 0 0 #41585f;\n  }\n  87.5% {\n    box-shadow: 0 -118.8px 0 0 #41585f, 84.0043116px -84.0043116px 0 0 #41585f, 118.8px 0 0 -5px rgba(65, 88, 95, 0), 84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), 0 118.8px 0 -5px rgba(65, 88, 95, 0), -84.0043116px 84.0043116px 0 -5px rgba(65, 88, 95, 0), -118.8px 0 0 -5px rgba(65, 88, 95, 0), -84.0043116px -84.0043116px 0 0 #41585f;\n  }\n}\n/**\n * ==============================================\n * Dot Falling\n * ==============================================\n */\n.dot-falling {\n  position: relative;\n  left: -9999px;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  box-shadow: 9999px 0 0 0 #41585f;\n  -webkit-animation: dot-falling 1s infinite linear;\n          animation: dot-falling 1s infinite linear;\n  -webkit-animation-delay: 0.1s;\n          animation-delay: 0.1s;\n}\n.dot-falling::before, .dot-falling::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n}\n.dot-falling::before {\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-falling-before 1s infinite linear;\n          animation: dot-falling-before 1s infinite linear;\n  -webkit-animation-delay: 0s;\n          animation-delay: 0s;\n}\n.dot-falling::after {\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-falling-after 1s infinite linear;\n          animation: dot-falling-after 1s infinite linear;\n  -webkit-animation-delay: 0.2s;\n          animation-delay: 0.2s;\n}\n\n@-webkit-keyframes dot-falling {\n  0% {\n    box-shadow: 9999px -99px 0 0 rgba(65, 88, 95, 0);\n  }\n  25%, 50%, 75% {\n    box-shadow: 9999px 0 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 9999px 99px 0 0 rgba(65, 88, 95, 0);\n  }\n}\n\n@keyframes dot-falling {\n  0% {\n    box-shadow: 9999px -99px 0 0 rgba(65, 88, 95, 0);\n  }\n  25%, 50%, 75% {\n    box-shadow: 9999px 0 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 9999px 99px 0 0 rgba(65, 88, 95, 0);\n  }\n}\n@-webkit-keyframes dot-falling-before {\n  0% {\n    box-shadow: 9900px -99px 0 0 rgba(65, 88, 95, 0);\n  }\n  25%, 50%, 75% {\n    box-shadow: 9900px 0 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 9900px 99px 0 0 rgba(65, 88, 95, 0);\n  }\n}\n@keyframes dot-falling-before {\n  0% {\n    box-shadow: 9900px -99px 0 0 rgba(65, 88, 95, 0);\n  }\n  25%, 50%, 75% {\n    box-shadow: 9900px 0 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 9900px 99px 0 0 rgba(65, 88, 95, 0);\n  }\n}\n@-webkit-keyframes dot-falling-after {\n  0% {\n    box-shadow: 10098px -99px 0 0 rgba(65, 88, 95, 0);\n  }\n  25%, 50%, 75% {\n    box-shadow: 10098px 0 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 10098px 99px 0 0 rgba(65, 88, 95, 0);\n  }\n}\n@keyframes dot-falling-after {\n  0% {\n    box-shadow: 10098px -99px 0 0 rgba(65, 88, 95, 0);\n  }\n  25%, 50%, 75% {\n    box-shadow: 10098px 0 0 0 #41585f;\n  }\n  100% {\n    box-shadow: 10098px 99px 0 0 rgba(65, 88, 95, 0);\n  }\n}\n/**\n * ==============================================\n * Dot Stretching\n * ==============================================\n */\n.dot-stretching {\n  position: relative;\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  transform: scale(1.25, 1.25);\n  -webkit-animation: dot-stretching 2s infinite ease-in;\n          animation: dot-stretching 2s infinite ease-in;\n}\n.dot-stretching::before, .dot-stretching::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n}\n.dot-stretching::before {\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-stretching-before 2s infinite ease-in;\n          animation: dot-stretching-before 2s infinite ease-in;\n}\n.dot-stretching::after {\n  width: 55px;\n  height: 55px;\n  border-radius: 33px;\n  background-color: #41585f;\n  color: #41585f;\n  -webkit-animation: dot-stretching-after 2s infinite ease-in;\n          animation: dot-stretching-after 2s infinite ease-in;\n}\n\n@-webkit-keyframes dot-stretching {\n  0% {\n    transform: scale(1.25, 1.25);\n  }\n  50%, 60% {\n    transform: scale(0.8, 0.8);\n  }\n  100% {\n    transform: scale(1.25, 1.25);\n  }\n}\n\n@keyframes dot-stretching {\n  0% {\n    transform: scale(1.25, 1.25);\n  }\n  50%, 60% {\n    transform: scale(0.8, 0.8);\n  }\n  100% {\n    transform: scale(1.25, 1.25);\n  }\n}\n@-webkit-keyframes dot-stretching-before {\n  0% {\n    transform: translate(0) scale(0.7, 0.7);\n  }\n  50%, 60% {\n    transform: translate(-20px) scale(1, 1);\n  }\n  100% {\n    transform: translate(0) scale(0.7, 0.7);\n  }\n}\n@keyframes dot-stretching-before {\n  0% {\n    transform: translate(0) scale(0.7, 0.7);\n  }\n  50%, 60% {\n    transform: translate(-20px) scale(1, 1);\n  }\n  100% {\n    transform: translate(0) scale(0.7, 0.7);\n  }\n}\n@-webkit-keyframes dot-stretching-after {\n  0% {\n    transform: translate(0) scale(0.7, 0.7);\n  }\n  50%, 60% {\n    transform: translate(20px) scale(1, 1);\n  }\n  100% {\n    transform: translate(0) scale(0.7, 0.7);\n  }\n}\n@keyframes dot-stretching-after {\n  0% {\n    transform: translate(0) scale(0.7, 0.7);\n  }\n  50%, 60% {\n    transform: translate(20px) scale(1, 1);\n  }\n  100% {\n    transform: translate(0) scale(0.7, 0.7);\n  }\n}\n/**\n * ==============================================\n * Experimental: Gooey Effect\n * Dot Gathering\n * ==============================================\n */\n.dot-gathering {\n  position: relative;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: hsl(0deg, 100%, 0%);\n  color: transparent;\n  margin: -1px 0;\n  filter: blur(2px);\n}\n.dot-gathering::before, .dot-gathering::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n  left: -50px;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: hsl(0deg, 100%, 0%);\n  color: transparent;\n  opacity: 0;\n  filter: blur(2px);\n  -webkit-animation: dot-gathering 2s infinite ease-in;\n          animation: dot-gathering 2s infinite ease-in;\n}\n.dot-gathering::after {\n  -webkit-animation-delay: 0.5s;\n          animation-delay: 0.5s;\n}\n\n@-webkit-keyframes dot-gathering {\n  0% {\n    opacity: 0;\n    transform: translateX(0);\n  }\n  35%, 60% {\n    opacity: 1;\n    transform: translateX(50px);\n  }\n  100% {\n    opacity: 0;\n    transform: translateX(100px);\n  }\n}\n\n@keyframes dot-gathering {\n  0% {\n    opacity: 0;\n    transform: translateX(0);\n  }\n  35%, 60% {\n    opacity: 1;\n    transform: translateX(50px);\n  }\n  100% {\n    opacity: 0;\n    transform: translateX(100px);\n  }\n}\n/**\n * ==============================================\n * Experimental: Gooey Effect\n * Dot Hourglass\n * ==============================================\n */\n.dot-hourglass {\n  position: relative;\n  top: -99px;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: hsl(0deg, 100%, 0%);\n  color: transparent;\n  margin: -1px 0;\n  filter: blur(2px);\n  transform-origin: 27.5px 126.5px;\n  -webkit-animation: dot-hourglass 2.4s infinite ease-in-out;\n          animation: dot-hourglass 2.4s infinite ease-in-out;\n  -webkit-animation-delay: 0.6s;\n          animation-delay: 0.6s;\n}\n.dot-hourglass::before, .dot-hourglass::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: hsl(0deg, 100%, 0%);\n  color: transparent;\n  filter: blur(2px);\n}\n.dot-hourglass::before {\n  top: 198px;\n}\n.dot-hourglass::after {\n  -webkit-animation: dot-hourglass-after 2.4s infinite cubic-bezier(0.65, 0.05, 0.36, 1);\n          animation: dot-hourglass-after 2.4s infinite cubic-bezier(0.65, 0.05, 0.36, 1);\n}\n\n@-webkit-keyframes dot-hourglass {\n  0% {\n    transform: rotateZ(0deg);\n  }\n  25% {\n    transform: rotateZ(180deg);\n  }\n  50% {\n    transform: rotateZ(180deg);\n  }\n  75% {\n    transform: rotateZ(360deg);\n  }\n  100% {\n    transform: rotateZ(360deg);\n  }\n}\n\n@keyframes dot-hourglass {\n  0% {\n    transform: rotateZ(0deg);\n  }\n  25% {\n    transform: rotateZ(180deg);\n  }\n  50% {\n    transform: rotateZ(180deg);\n  }\n  75% {\n    transform: rotateZ(360deg);\n  }\n  100% {\n    transform: rotateZ(360deg);\n  }\n}\n@-webkit-keyframes dot-hourglass-after {\n  0% {\n    transform: translateY(0);\n  }\n  25% {\n    transform: translateY(198px);\n  }\n  50% {\n    transform: translateY(198px);\n  }\n  75% {\n    transform: translateY(0);\n  }\n  100% {\n    transform: translateY(0);\n  }\n}\n@keyframes dot-hourglass-after {\n  0% {\n    transform: translateY(0);\n  }\n  25% {\n    transform: translateY(198px);\n  }\n  50% {\n    transform: translateY(198px);\n  }\n  75% {\n    transform: translateY(0);\n  }\n  100% {\n    transform: translateY(0);\n  }\n}\n/**\n * ==============================================\n * Experimental: Gooey Effect\n * Dot Overtaking\n * ==============================================\n */\n.dot-overtaking {\n  position: relative;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: transparent;\n  color: hsl(0deg, 100%, 0%);\n  margin: -1px 0;\n  box-shadow: 0 -20px 0 0;\n  filter: blur(2px);\n  -webkit-animation: dot-overtaking 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);\n          animation: dot-overtaking 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);\n}\n.dot-overtaking::before, .dot-overtaking::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: transparent;\n  color: hsl(0deg, 100%, 0%);\n  box-shadow: 0 -20px 0 0;\n  filter: blur(2px);\n}\n.dot-overtaking::before {\n  -webkit-animation: dot-overtaking 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);\n          animation: dot-overtaking 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);\n  -webkit-animation-delay: 0.3s;\n          animation-delay: 0.3s;\n}\n.dot-overtaking::after {\n  -webkit-animation: dot-overtaking 1.5s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);\n          animation: dot-overtaking 1.5s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);\n  -webkit-animation-delay: 0.6s;\n          animation-delay: 0.6s;\n}\n\n@-webkit-keyframes dot-overtaking {\n  0% {\n    transform: rotateZ(0deg);\n  }\n  100% {\n    transform: rotateZ(360deg);\n  }\n}\n\n@keyframes dot-overtaking {\n  0% {\n    transform: rotateZ(0deg);\n  }\n  100% {\n    transform: rotateZ(360deg);\n  }\n}\n/**\n * ==============================================\n * Experimental: Gooey Effect\n * Dot Shuttle\n * ==============================================\n */\n.dot-shuttle {\n  position: relative;\n  left: -99px;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: hsl(0deg, 100%, 0%);\n  color: transparent;\n  margin: -1px 0;\n  filter: blur(2px);\n}\n.dot-shuttle::before, .dot-shuttle::after {\n  content: \"\";\n  display: inline-block;\n  position: absolute;\n  top: 0;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: hsl(0deg, 100%, 0%);\n  color: transparent;\n  filter: blur(2px);\n}\n.dot-shuttle::before {\n  left: 99px;\n  -webkit-animation: dot-shuttle 2s infinite ease-out;\n          animation: dot-shuttle 2s infinite ease-out;\n}\n.dot-shuttle::after {\n  left: 198px;\n}\n\n@-webkit-keyframes dot-shuttle {\n  0%, 50%, 100% {\n    transform: translateX(0);\n  }\n  25% {\n    transform: translateX(-297px);\n  }\n  75% {\n    transform: translateX(297px);\n  }\n}\n\n@keyframes dot-shuttle {\n  0%, 50%, 100% {\n    transform: translateX(0);\n  }\n  25% {\n    transform: translateX(-297px);\n  }\n  75% {\n    transform: translateX(297px);\n  }\n}\n/**\n * ==============================================\n * Experimental: Emoji\n * Dot Bouncing\n * ==============================================\n */\n.dot-bouncing {\n  position: relative;\n  height: 55px;\n  font-size: 10px;\n}\n.dot-bouncing::before {\n  content: \"⚽🏀🏐\";\n  display: inline-block;\n  position: relative;\n  -webkit-animation: dot-bouncing 1s infinite;\n          animation: dot-bouncing 1s infinite;\n}\n\n@-webkit-keyframes dot-bouncing {\n  0% {\n    top: -20px;\n    -webkit-animation-timing-function: ease-in;\n            animation-timing-function: ease-in;\n  }\n  34% {\n    transform: scale(1, 1);\n  }\n  35% {\n    top: 20px;\n    -webkit-animation-timing-function: ease-out;\n            animation-timing-function: ease-out;\n    transform: scale(1.5, 0.5);\n  }\n  45% {\n    transform: scale(1, 1);\n  }\n  90% {\n    top: -20px;\n  }\n  100% {\n    top: -20px;\n  }\n}\n\n@keyframes dot-bouncing {\n  0% {\n    top: -20px;\n    -webkit-animation-timing-function: ease-in;\n            animation-timing-function: ease-in;\n  }\n  34% {\n    transform: scale(1, 1);\n  }\n  35% {\n    top: 20px;\n    -webkit-animation-timing-function: ease-out;\n            animation-timing-function: ease-out;\n    transform: scale(1.5, 0.5);\n  }\n  45% {\n    transform: scale(1, 1);\n  }\n  90% {\n    top: -20px;\n  }\n  100% {\n    top: -20px;\n  }\n}\n/**\n * ==============================================\n * Experimental: Emoji\n * Dot Rolling\n * ==============================================\n */\n.dot-rolling {\n  position: relative;\n  height: 55px;\n  font-size: 10px;\n}\n.dot-rolling::before {\n  content: \"⚽\";\n  display: inline-block;\n  position: relative;\n  transform: translateX(-25px);\n  -webkit-animation: dot-rolling 3s infinite;\n          animation: dot-rolling 3s infinite;\n}\n\n@-webkit-keyframes dot-rolling {\n  0% {\n    content: \"⚽\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  16.667% {\n    content: \"⚽\";\n    transform: translateX(25px) rotateZ(720deg);\n  }\n  33.333% {\n    content: \"⚽\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  34.333% {\n    content: \"🏀\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  50% {\n    content: \"🏀\";\n    transform: translateX(25px) rotateZ(720deg);\n  }\n  66.667% {\n    content: \"🏀\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  67.667% {\n    content: \"🏐\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  83.333% {\n    content: \"🏐\";\n    transform: translateX(25px) rotateZ(720deg);\n  }\n  100% {\n    content: \"🏐\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n}\n\n@keyframes dot-rolling {\n  0% {\n    content: \"⚽\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  16.667% {\n    content: \"⚽\";\n    transform: translateX(25px) rotateZ(720deg);\n  }\n  33.333% {\n    content: \"⚽\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  34.333% {\n    content: \"🏀\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  50% {\n    content: \"🏀\";\n    transform: translateX(25px) rotateZ(720deg);\n  }\n  66.667% {\n    content: \"🏀\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  67.667% {\n    content: \"🏐\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n  83.333% {\n    content: \"🏐\";\n    transform: translateX(25px) rotateZ(720deg);\n  }\n  100% {\n    content: \"🏐\";\n    transform: translateX(-25px) rotateZ(0deg);\n  }\n}/*# sourceMappingURL=dots.css.map */", "",{"version":3,"sources":["webpack://./css/dots.css","webpack://./css/dot-loader/_dot-elastic.scss","webpack://./css/dot-loader/_mixins.scss","webpack://./css/dot-loader/_variables.scss","webpack://./css/dot-loader/_dot-pulse.scss","webpack://./css/dot-loader/_dot-flashing.scss","webpack://./css/dot-loader/_dot-collision.scss","webpack://./css/dot-loader/_dot-revolution.scss","webpack://./css/dot-loader/_dot-carousel.scss","webpack://./css/dot-loader/_dot-typing.scss","webpack://./css/dot-loader/_dot-windmill.scss","webpack://./css/dot-loader/_dot-bricks.scss","webpack://./css/dot-loader/_dot-floating.scss","webpack://./css/dot-loader/_dot-fire.scss","webpack://./css/dot-loader/_dot-spin.scss","webpack://./css/dot-loader/_dot-falling.scss","webpack://./css/dot-loader/_dot-stretching.scss","webpack://./css/dot-loader/_dot-gathering.scss","webpack://./css/dot-loader/_dot-hourglass.scss","webpack://./css/dot-loader/_dot-overtaking.scss","webpack://./css/dot-loader/_dot-shuttle.scss","webpack://./css/dot-loader/_dot-bouncing.scss","webpack://./css/dot-loader/_dot-rolling.scss"],"names":[],"mappings":"AAAA,gBAAgB;ACAhB;;;;EAAA;AAMA;EACE,kBAAA;ECIA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EFGV,iDAAA;UAAA,yCAAA;ADGF;ACDE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,MAAA;ADEJ;ACCE;EACE,WAAA;ECXF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EFkBR,wDAAA;UAAA,gDAAA;ADGJ;ACAE;EACE,UEjBU;EDFZ,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EF0BR,uDAAA;UAAA,+CAAA;ADIJ;;ACAA;EACE;IACE,sBAAA;EDGF;ECAA;IACE,wBAAA;EDEF;ECCA;IACE,yBAAA;EDCF;ECEA;IACE,sBAAA;EDAF;ECGA;IACE,sBAAA;EDDF;AACF;;AClBA;EACE;IACE,sBAAA;EDGF;ECAA;IACE,wBAAA;EDEF;ECCA;IACE,yBAAA;EDCF;ECEA;IACE,sBAAA;EDAF;ECGA;IACE,sBAAA;EDDF;AACF;ACIA;EACE;IACE,sBAAA;EDFF;ECKA;IACE,sBAAA;EDHF;ECMA;IACE,wBAAA;EDJF;ECOA;IACE,sBAAA;EDLF;ECQA;IACE,sBAAA;EDNF;AACF;ACbA;EACE;IACE,sBAAA;EDFF;ECKA;IACE,sBAAA;EDHF;ECMA;IACE,wBAAA;EDJF;ECOA;IACE,sBAAA;EDLF;ECQA;IACE,sBAAA;EDNF;AACF;ACSA;EACE;IACE,sBAAA;EDPF;ECUA;IACE,sBAAA;EDRF;ECWA;IACE,yBAAA;EDTF;ECYA;IACE,wBAAA;EDVF;ECaA;IACE,sBAAA;EDXF;AACF;ACRA;EACE;IACE,sBAAA;EDPF;ECUA;IACE,sBAAA;EDRF;ECWA;IACE,yBAAA;EDTF;ECYA;IACE,wBAAA;EDVF;ECaA;IACE,sBAAA;EDXF;AACF;AI1FA;;;;EAAA;AAWA;EACE,kBAAA;EACA,aAPS;EFKT,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;ECSV,2BAAA;EACA,iDAAA;UAAA,yCAAA;EACA,8BAAA;UAAA,sBAAA;AJwFF;AItFE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,MAAA;EFfF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;AH8GZ;AIvFE;EACE,2BAAA;EACA,wDAAA;UAAA,gDAAA;EACA,2BAAA;UAAA,mBAAA;AJyFJ;AItFE;EACE,4BAAA;EACA,uDAAA;UAAA,+CAAA;EACA,6BAAA;UAAA,qBAAA;AJwFJ;;AIpFA;EACE;IACE,2BAAA;EJuFF;EIpFA;IACE,0BAAA;EJsFF;EInFA;IAEE,2BAAA;EJoFF;AACF;;AIhGA;EACE;IACE,2BAAA;EJuFF;EIpFA;IACE,0BAAA;EJsFF;EInFA;IAEE,2BAAA;EJoFF;AACF;AIjFA;EACE;IACE,2BAAA;EJmFF;EIhFA;IACE,0BAAA;EJkFF;EI/EA;IAEE,2BAAA;EJgFF;AACF;AI5FA;EACE;IACE,2BAAA;EJmFF;EIhFA;IACE,0BAAA;EJkFF;EI/EA;IAEE,2BAAA;EJgFF;AACF;AI7EA;EACE;IACE,4BAAA;EJ+EF;EI5EA;IACE,2BAAA;EJ8EF;EI3EA;IAEE,4BAAA;EJ4EF;AACF;AIxFA;EACE;IACE,4BAAA;EJ+EF;EI5EA;IACE,2BAAA;EJ8EF;EI3EA;IAEE,4BAAA;EJ4EF;AACF;AKlKA;;;;EAAA;AAMA;EACE,kBAAA;EHIA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EEGV,4DAAA;UAAA,oDAAA;EACA,6BAAA;UAAA,qBAAA;ALqKF;AKnKE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,MAAA;ALoKJ;AKjKE;EACE,WAAA;EHZF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EEmBR,qDAAA;UAAA,6CAAA;EACA,2BAAA;UAAA,mBAAA;ALqKJ;AKlKE;EACE,UFnBU;EDFZ,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EE4BR,qDAAA;UAAA,6CAAA;EACA,2BAAA;UAAA,mBAAA;ALsKJ;;AKlKA;EACE;IACE,yBAAA;ELqKF;EKlKA;IAEE,uCAAA;ELmKF;AACF;;AK3KA;EACE;IACE,yBAAA;ELqKF;EKlKA;IAEE,uCAAA;ELmKF;AACF;AMpNA;;;;EAAA;AAMA;EACE,kBAAA;EJIA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;AHyNZ;AMtNE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,MAAA;ANuNJ;AMpNE;EACE,WAAA;EJTF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EGgBR,2DAAA;UAAA,mDAAA;ANwNJ;AMrNE;EACE,UHxBQ;EDOV,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EGwBR,0DAAA;UAAA,kDAAA;EACA,2BAAA;UAAA,mBAAA;ANyNJ;;AMrNA;EACE;IAIE,wBAAA;ENqNF;EMlNA;IACE,4BAAA;ENoNF;AACF;;AM9NA;EACE;IAIE,wBAAA;ENqNF;EMlNA;IACE,4BAAA;ENoNF;AACF;AMjNA;EACE;IAIE,wBAAA;ENgNF;EM7MA;IACE,2BAAA;EN+MF;AACF;AMzNA;EACE;IAIE,wBAAA;ENgNF;EM7MA;IACE,2BAAA;EN+MF;AACF;AO3QA;;;;EAAA;AAMA;EACE,kBAAA;ELIA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;AHgRZ;AO7QE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;AP8QJ;AO3QE;EACE,OAAA;EACA,UAAA;ELTF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EIgBR,gCAAA;EACA,sDAAA;UAAA,8CAAA;AP+QJ;AO5QE;EACE,OAAA;EACA,WAAA;ELnBF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EI0BR,gCAAA;EACA,oDAAA;UAAA,4CAAA;APgRJ;;AO5QA;EACE;IACE,6CAAA;EP+QF;EO5QA;IACE,+CAAA;EP8QF;AACF;;AOrRA;EACE;IACE,6CAAA;EP+QF;EO5QA;IACE,+CAAA;EP8QF;AACF;AQ5TA;;;;EAAA;AAWA;EACE,kBAAA;EACA,aAPS;ENKT,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EKSV,6EACE;EAGF,oDAAA;UAAA,4CAAA;ARuTF;;AQpTA;EACE;IACE,qFACE;ERsTJ;EQjTA;IACE,qFACE;ERkTJ;EQ7SA;IACE,qFACE;ER8SJ;AACF;;AQhUA;EACE;IACE,qFACE;ERsTJ;EQjTA;IACE,qFACE;ERkTJ;EQ7SA;IACE,qFACE;ER8SJ;AACF;ASxVA;;;;EAAA;AAWA;EACE,kBAAA;EACA,aAPS;EPKT,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EMSV,6EACE;EAGF,kDAAA;UAAA,0CAAA;ATmVF;;AShVA;EACE;IACE,6EACE;ETkVJ;ES7UA;IACE,iFACE;ET8UJ;ESzUA;IACE,6EACE;ET0UJ;ESrUA;IACE,iFACE;ETsUJ;ESjUA;IACE,6EACE;ETkUJ;ES7TA;IACE,iFACE;ET8TJ;ESzTA;IACE,6EACE;ET0TJ;AACF;;ASxWA;EACE;IACE,6EACE;ETkVJ;ES7UA;IACE,iFACE;ET8UJ;ESzUA;IACE,6EACE;ET0UJ;ESrUA;IACE,iFACE;ETsUJ;ESjUA;IACE,6EACE;ETkUJ;ES7TA;IACE,iFACE;ET8TJ;ESzTA;IACE,6EACE;ET0TJ;AACF;AUhYA;;;;EAAA;AAUA;EACE,kBAAA;EACA,UAAA;ERDA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EOQV,0BAAA;EACA,kDAAA;UAAA,0CAAA;AV+XF;AU7XE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;AV8XJ;AU3XE;EACE,gBAAA;EACA,SAAA;ERjBF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;AHsZZ;AU7XE;EACE,eAAA;EACA,SAAA;ERxBF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;AH+ZZ;;AU9XA;EACE;IACE,6CAAA;EViYF;EU9XA;IACE,+CAAA;EVgYF;AACF;;AUvYA;EACE;IACE,6CAAA;EViYF;EU9XA;IACE,+CAAA;EVgYF;AACF;AWhbA;;;;EAAA;AAcA;EACE,kBAAA;EACA,WATQ;EAUR,aATS;ETGT,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EQaV,uFACE;EAGF,8CAAA;UAAA,sCAAA;AXwaF;;AWraA;EACE;IACE,uFACE;EXuaJ;EWlaA;IACE,wFACE;EXmaJ;EW9ZA;IACE,4FACE;EX+ZJ;EW1ZA;IACE,2FACE;EX2ZJ;EWtZA;IACE,uFACE;EXuZJ;EWlZA;IACE,wFACE;EXmZJ;EW9YA;IACE,4FACE;EX+YJ;EW1YA;IACE,2FACE;EX2YJ;EWtYA;IACE,uFACE;EXuYJ;EWlYA;IACE,wFACE;EXmYJ;EW9XA;IACE,4FACE;EX+XJ;EW1XA;IACE,2FACE;EX2XJ;EWtXA;IACE,uFACE;EXuXJ;AACF;;AW/cA;EACE;IACE,uFACE;EXuaJ;EWlaA;IACE,wFACE;EXmaJ;EW9ZA;IACE,4FACE;EX+ZJ;EW1ZA;IACE,2FACE;EX2ZJ;EWtZA;IACE,uFACE;EXuZJ;EWlZA;IACE,wFACE;EXmZJ;EW9YA;IACE,4FACE;EX+YJ;EW1YA;IACE,2FACE;EX2YJ;EWtYA;IACE,uFACE;EXuYJ;EWlYA;IACE,wFACE;EXmYJ;EW9XA;IACE,4FACE;EX+XJ;EW1XA;IACE,2FACE;EX2XJ;EWtXA;IACE,uFACE;EXuXJ;AACF;AY3eA;;;;EAAA;AASA;EACE,kBAAA;EVCA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;ESMV,6EAAA;UAAA,qEAAA;AZ2eF;AYzeE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,MAAA;AZ0eJ;AYveE;EACE,WAAA;EVdF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;ESqBR,8DAAA;UAAA,sDAAA;AZ2eJ;AYxeE;EACE,WAAA;EVtBF,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;ES6BR,4EAAA;UAAA,oEAAA;AZ4eJ;;AYxeA;EACE;IACE,yBAAA;EZ2eF;EYxeA;IACE,yBAAA;EZ0eF;EYveA;IACE,yBAAA;EZyeF;AACF;;AYpfA;EACE;IACE,yBAAA;EZ2eF;EYxeA;IACE,y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CE,gDAAA;Ef0nBF;AACF;AevoBA;EACE;IACE,iDAAA;Ef8nBF;Ee3nBA;IAGE,iCAAA;Ef2nBF;EexnBA;IACE,gDAAA;Ef0nBF;AACF;AgBhuBA;;;;EAAA;AASA;EACE,kBAAA;EdCA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EaMV,4BAAA;EACA,qDAAA;UAAA,6CAAA;AhBguBF;AgB9tBE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,MAAA;AhB+tBJ;AgB5tBE;EddA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;EaoBR,4DAAA;UAAA,oDAAA;AhBiuBJ;AgB9tBE;EdpBA,WCPU;EDQV,YCPW;EDQX,mBCPW;EDQX,yBCNU;EDOV,cCPU;Ea0BR,2DAAA;UAAA,mDAAA;AhBmuBJ;;AgB/tBA;EACE;IACE,4BAAA;EhBkuBF;EgB/tBA;IAEE,0BAAA;EhBguBF;EgB7tBA;IACE,4BAAA;EhB+tBF;AACF;;AgB3uBA;EACE;IACE,4BAAA;EhBkuBF;EgB/tBA;IAEE,0BAAA;EhBguBF;EgB7tBA;IACE,4BAAA;EhB+tBF;AACF;AgB5tBA;EACE;IACE,uCAAA;EhB8tBF;EgB3tBA;IAEE,uCAAA;EhB4tBF;EgBztBA;IACE,uCAAA;EhB2tBF;AACF;AgBvuBA;EACE;IACE,uCAAA;EhB8tBF;EgB3tBA;IAEE,uCAAA;EhB4tBF;EgBztBA;IACE,uCAAA;EhB2tBF;AACF;AgBxtBA;EACE;IACE,uCAAA;EhB0tBF;EgBvtBA;IAEE,sCAAA;EhBwtBF;EgBrtBA;IACE,uCAAA;EhButBF;AACF;AgBnuBA;EACE;IACE,uCAAA;EhB0tBF;EgBvtBA;IAEE,sCAAA;EhBwtBF;EgBrtBA;IACE,uCAAA;EhButBF;AACF;AiBvyBA;;;;;EAAA;AAWA;EACE,kBAAA;EfDA,WeIU;EfHV,YeIW;EfHX,kBeIW;EfHX,qCePc;EfQd,kBeIU;EAGV,cAAA;EACA,iBAAA;AjBgyBF;AiB9xBE;EAEE,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,MAAA;EACA,WAAA;EfpBF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","sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./css/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./css/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "@charset \"UTF-8\";\nhtml {\n  overflow-x: hidden;\n  margin: 0;\n}\n@media (min-width: 767px) {\n  html {\n    font-size: 1vw;\n  }\n}\n@media (min-width: 1200px) {\n  html {\n    font-size: 1.85vh;\n  }\n}\nhtml.freeze {\n  overflow: hidden;\n}\n\nbody {\n  margin: 0;\n  color: antiquewhite;\n  height: 100%;\n}\n\nh1 {\n  margin: 0;\n  margin-bottom: 3rem;\n  font-size: 4rem;\n}\n\nh2 {\n  font-size: 2.5rem;\n  margin: 0;\n}\nh2 a {\n  font-size: 1.9rem;\n}\n\nh3 {\n  font-size: 2.3rem;\n  margin: 0;\n}\n\na {\n  text-decoration: none;\n  color: inherit;\n}\n\na {\n  cursor: pointer;\n}\n\na.hidden, a.selectedPage {\n  pointer-events: none;\n}\n\na.hidden {\n  opacity: 0;\n}\n\na.selectedPage {\n  color: #e8aa77;\n  filter: saturate(120%);\n}\n\n*.hidden {\n  display: none;\n  pointer-events: none;\n}\n\ndiv, button {\n  box-sizing: border-box;\n}\n\nbutton {\n  border: none;\n  background: transparent;\n}\n\nli {\n  list-style-type: none;\n}\n\n#overallContainer {\n  position: relative;\n  top: 0;\n}\n#overallContainer.faded {\n  filter: opacity(40%);\n}\n\n.contentContainer {\n  height: initial;\n  width: 100%;\n  margin: 4% 0;\n  margin-bottom: 5%;\n  display: flex;\n  justify-content: center;\n}\n.contentContainer > div {\n  display: flex;\n  justify-content: center;\n  padding-top: 5.5rem;\n}\n@media (min-width: 767px) {\n  .contentContainer > div {\n    width: 95%;\n  }\n}\n@media (min-width: 1200px) {\n  .contentContainer > div {\n    width: 85%;\n  }\n}\n.contentContainer_paginated .textBox .content-pages {\n  text-align: center;\n}\n.contentContainer_paginated .textBox .content-pages a {\n  font-size: 1.75rem;\n}\n\n.titleAndTextBox, .contentBox {\n  position: relative;\n}\n\n.titleAndTextBox {\n  margin-right: 5%;\n}\n\n.titleBox, .textBox {\n  height: 50%;\n  width: 16rem;\n}\n\n.titleBox {\n  padding: 10%;\n}\n.titleBox > * {\n  height: 50%;\n  width: 100%;\n  margin: 0;\n}\n.titleBox > :nth-child(2) {\n  display: flex;\n}\n.titleBox > :nth-child(2) h2 {\n  align-self: flex-end;\n  padding-bottom: 15%;\n}\n\n.contentBox.properties, .contentBox.members {\n  display: grid;\n  row-gap: 0.35rem;\n}\n@media (min-width: 767px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(3, 33.3%);\n  }\n}\n@media (min-width: 1200px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(4, 25%);\n  }\n}\n\n.contentBox {\n  width: 100%;\n  height: 100%;\n}\n.contentBox.properties > div, .contentBox.members > div {\n  width: 14rem;\n}\n.contentBox.properties > div .displaySquares, .contentBox.members > div .displaySquares {\n  box-sizing: initial;\n  position: relative;\n  text-align: center;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.contentBox.properties > div .displaySquares .interaction-prompt, .contentBox.members > div .displaySquares .interaction-prompt {\n  text-align: center;\n  position: absolute;\n  background-color: rgba(20, 20, 20, 0.7);\n  padding: 0.2rem 0.2rem;\n  margin-top: 7.6rem;\n  border-radius: 30%;\n  font-size: 1.5rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares .interaction-prompt .click-prompt, .contentBox.members > div .displaySquares .interaction-prompt .click-prompt {\n    display: none;\n  }\n}\n.contentBox.properties > div .displaySquares .interaction-prompt .hover-prompt, .contentBox.members > div .displaySquares .interaction-prompt .hover-prompt {\n  display: none;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares .interaction-prompt .hover-prompt, .contentBox.members > div .displaySquares .interaction-prompt .hover-prompt {\n    display: block;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks, .contentBox.members > div .displaySquares-pageLinks {\n  position: absolute;\n  display: none;\n  flex-direction: column;\n  width: 100%;\n  text-align: center;\n}\n.contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n  color: rgb(238, 231, 210);\n  cursor: pointer;\n  font-size: 1.5rem;\n  margin-top: 0.7rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n    font-size: 1.3rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n  font-size: 2rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n    font-size: 1.4rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks *:hover, .contentBox.members > div .displaySquares-pageLinks *:hover {\n  transform: scale(110%);\n  filter: brightness(120%);\n}\n.contentBox.properties > div .displaySquares-pageLinks i, .contentBox.members > div .displaySquares-pageLinks i {\n  font-size: 1.4rem;\n}\n.contentBox.properties > div .displaySquares .displaySquares-pageLinks__visible, .contentBox.members > div .displaySquares .displaySquares-pageLinks__visible {\n  display: flex;\n}\n.contentBox.properties > div .displaySquares div p, .contentBox.properties > div .displaySquares div a, .contentBox.members > div .displaySquares div p, .contentBox.members > div .displaySquares div a {\n  margin: 2%;\n}\n.contentBox.properties > div .display-text, .contentBox.members > div .display-text {\n  margin-top: -0.3rem;\n  text-align: center;\n  font-size: 1.3rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.2rem;\n}\n.contentBox.properties > div .display-text p, .contentBox.members > div .display-text p {\n  margin: 0;\n}\n.contentBox.properties > div .display-text p:nth-of-type(2), .contentBox.members > div .display-text p:nth-of-type(2) {\n  font-weight: 700;\n}\n.contentBox .news {\n  margin: 0 1%;\n  padding-top: 5%;\n  height: auto;\n}\n.contentBox .news iframe {\n  width: 300px;\n  height: 200px;\n}\n\n#footerContainer {\n  background-color: rgba(39, 39, 39, 0.6);\n  margin: 0;\n  display: flex;\n  position: fixed;\n  bottom: 0;\n  width: 100%;\n  text-align: center;\n  justify-content: flex-end;\n  padding-right: 2rem;\n  color: ivory;\n}\n#footerContainer p {\n  margin: 1rem;\n}\n@media (min-width: 1200px) {\n  #footerContainer p {\n    margin: 0.65rem;\n  }\n}\n\n#openingContainer {\n  height: 99.5vh;\n  position: relative;\n  color: rgb(189, 189, 189);\n  display: flex;\n  justify-content: center;\n}\n#openingContainer h1 {\n  font-size: 5.2rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer h1 {\n    font-size: 6.5rem;\n  }\n}\n#openingContainer p {\n  font-size: 2.5rem;\n  font-weight: 600;\n}\n@media (min-width: 1200px) {\n  #openingContainer p {\n    font-size: 2.7rem;\n  }\n}\n#openingContainer #welcomeContainer div {\n  text-shadow: 1px 1px black;\n  width: 80%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer div {\n    width: 70%;\n  }\n}\n#openingContainer header {\n  display: grid;\n  grid-template-columns: [logoSymbol] 4% [logoText] 25% [navigation] 1fr;\n  grid-template-areas: \"logoSymbol logoText navigation\";\n  grid-auto-flow: column;\n  justify-self: end;\n  background-color: rgba(70, 62, 55, 0.85);\n  box-shadow: 0.2rem 0.2rem 1rem 0.4rem inset rgba(49, 43, 39, 0.75);\n  width: 100%;\n  height: 4rem;\n  position: fixed;\n  top: 0;\n  z-index: 9999;\n  color: rgb(199, 187, 156);\n}\n@media (min-width: 1200px) {\n  #openingContainer header {\n    grid-auto-flow: row;\n    grid-template-columns: [logoSymbol] 4% [logoText] 25% [navigation] 1fr;\n    grid-template-areas: \"logoSymbol logoText navigation\";\n  }\n}\n#openingContainer header.hidden {\n  display: none;\n}\n#openingContainer header button {\n  font-size: 1.8rem;\n  width: 10rem;\n  cursor: pointer;\n}\n#openingContainer header button i {\n  display: inline;\n}\n#openingContainer header #logo-symbol, #openingContainer header #logo-text {\n  height: 3rem;\n}\n#openingContainer header #logo-symbol {\n  grid-area: logoSymbol;\n  margin-top: 0.3rem;\n  padding-left: 0.5rem;\n}\n#openingContainer header #logo-text {\n  grid-area: logoText;\n  margin-top: 0.6rem;\n  padding-left: 0.2rem;\n}\n#openingContainer header img {\n  height: 100%;\n}\n#openingContainer header p, #openingContainer header nav {\n  margin: 0;\n}\n#openingContainer header nav {\n  position: relative;\n  justify-self: end;\n  overflow: hidden;\n  margin-right: 2rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav {\n    grid-area: navigation;\n    background-color: transparent;\n    overflow: visible;\n    justify-self: unset;\n  }\n}\n#openingContainer header nav ul {\n  overflow: hidden;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-evenly;\n  align-items: center;\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul {\n    flex-direction: row;\n    gap: 1.5rem;\n    height: 100%;\n    justify-content: initial;\n  }\n}\n#openingContainer header nav ul li {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 100%;\n  background-color: rgb(70, 62, 55);\n  box-shadow: 0.2rem 0.2rem 1rem 0.6rem inset rgba(49, 43, 39, 0.75);\n  border-radius: 5%;\n  border-bottom: 0.3rem solid rgba(51, 45, 40, 0.85);\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul li {\n    box-shadow: none;\n    width: initial;\n    height: initial;\n    background-color: transparent;\n    border-radius: initial;\n    border: none;\n  }\n}\n#openingContainer header nav ul li a {\n  padding: 0.5rem 1rem;\n  font-size: 1.8rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul li a {\n    padding: 0;\n  }\n}\n#openingContainer header nav ul #mobile-nav-caller {\n  height: 4rem;\n  box-shadow: none;\n  border: none;\n  background: transparent;\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul #mobile-nav-caller {\n    display: none;\n  }\n}\n#openingContainer header nav ul #mobile-nav-caller button {\n  color: aliceblue;\n}\n#openingContainer header nav.opened {\n  overflow: visible;\n}\n#openingContainer #pageImage {\n  top: 0;\n  height: 100%;\n  width: 100%;\n}\n#openingContainer #pageImage img {\n  height: 100%;\n  width: 100%;\n  filter: blur(0.6rem) grayscale(50%);\n}\n#openingContainer #welcomeContainer {\n  position: absolute;\n  text-align: center;\n  align-items: center;\n  margin-top: 1%;\n  display: flex;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer {\n    margin-top: 2%;\n  }\n}\n#openingContainer #welcomeContainer img {\n  height: 6rem;\n}\n\n.titleBox {\n  background: transparent;\n}\n.titleBox p {\n  font-size: 1.5rem;\n}\n\n.textBox {\n  padding-left: 0.5rem;\n}\n.textBox p {\n  font-size: 1.3rem;\n  color: white;\n}\n\n@media (min-width: 1200px) {\n  #propertiesContainer, #membersContainer {\n    height: 52rem;\n  }\n}\n#propertiesContainer > div .titleBox, #membersContainer > div .titleBox {\n  border: 0.35rem solid rgb(199, 187, 156);\n}\n#propertiesContainer img, #membersContainer img {\n  width: 100%;\n  height: 100%;\n  margin-bottom: 1rem;\n}\n#propertiesContainer img.pageLinks__visible, #membersContainer img.pageLinks__visible {\n  filter: brightness(27%);\n}\n\n#allNewsContainer {\n  height: 51rem;\n}\n@media (min-width: 1200px) {\n  #allNewsContainer {\n    height: 52rem;\n  }\n}\n\n#contactContainer {\n  height: 55rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer {\n    height: 52rem;\n  }\n}\n\n#allNewsContainer, #contactContainer {\n  background-color: rgb(31, 27, 21);\n  color: white;\n}\n#allNewsContainer > div .titleBox, #contactContainer > div .titleBox {\n  border: 4px solid rgb(221, 221, 221);\n}\n#allNewsContainer > div .textBox p, #contactContainer > div .textBox p {\n  color: antiquewhite;\n}\n#allNewsContainer .contentBox, #contactContainer .contentBox {\n  display: flex;\n  font-size: 1.1rem;\n}\n#allNewsContainer .contentBox > div, #contactContainer .contentBox > div {\n  flex-basis: 50%;\n  height: 100%;\n}\n#allNewsContainer .contentBox > div > div, #contactContainer .contentBox > div > div {\n  overflow: auto;\n  height: 92%;\n}\n#allNewsContainer .contentBox .form-message, #contactContainer .contentBox .form-message {\n  height: auto;\n}\n#allNewsContainer .contentBox h3, #contactContainer .contentBox h3 {\n  text-align: center;\n  height: 8%;\n}\n#allNewsContainer .contentBox ul, #contactContainer .contentBox ul {\n  padding: 0;\n}\n#allNewsContainer .contentBox ul li, #contactContainer .contentBox ul li {\n  display: inline;\n}\n#allNewsContainer .contentBox .news, #contactContainer .contentBox .news {\n  border: 1px solid rgba(233, 233, 233, 0.3);\n}\n#allNewsContainer .contentBox .news::after, #contactContainer .contentBox .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#allNewsContainer .contentBox .news img, #contactContainer .contentBox .news img {\n  width: 13rem;\n  float: left;\n  margin-right: 2.5%;\n  cursor: pointer;\n}\n#allNewsContainer .contentBox .news p, #contactContainer .contentBox .news p {\n  font-size: 1.45rem;\n  line-height: 1.4rem;\n}\n@media (min-width: 1200px) {\n  #allNewsContainer .contentBox .news p, #contactContainer .contentBox .news p {\n    font-size: 1.25rem;\n    line-height: 1.2rem;\n  }\n}\n#allNewsContainer .contentBox .news, #allNewsContainer .contentBox form, #contactContainer .contentBox .news, #contactContainer .contentBox form {\n  padding: 0 5%;\n}\n#allNewsContainer .contentBox form, #contactContainer .contentBox form {\n  display: grid;\n  -moz-column-gap: 1.2rem;\n       column-gap: 1.2rem;\n  grid-template-areas: \"contactName contactEmail\" \"contactPhone contactSubject\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"submit ...\";\n}\n#allNewsContainer .contentBox form #contact-name, #contactContainer .contentBox form #contact-name {\n  grid-area: contactName;\n}\n#allNewsContainer .contentBox form #contact-email, #contactContainer .contentBox form #contact-email {\n  grid-area: contactEmail;\n}\n#allNewsContainer .contentBox form #contact-phone, #contactContainer .contentBox form #contact-phone {\n  grid-area: contactPhone;\n}\n#allNewsContainer .contentBox form #contact-subject, #contactContainer .contentBox form #contact-subject {\n  grid-area: contactSubject;\n}\n#allNewsContainer .contentBox form #contact-message, #contactContainer .contentBox form #contact-message {\n  grid-area: contactMessage;\n}\n\n#contactContainer {\n  background: black;\n  color: white;\n}\n#contactContainer .contentBox {\n  -moz-column-gap: 3rem;\n       column-gap: 3rem;\n  width: 85%;\n  display: flex;\n  padding-bottom: 1rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox {\n    width: 70%;\n  }\n}\n#contactContainer .contentBox img {\n  filter: saturate(120%);\n  width: 45%;\n  margin-left: 2rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox img {\n    width: 50%;\n    margin-left: 0;\n  }\n}\n#contactContainer .contentBox label.error {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: rgb(120, 179, 158);\n}\n#contactContainer .contentBox form {\n  margin-top: 3rem;\n}\n#contactContainer .contentBox form > div {\n  margin: 5% 0;\n  margin-top: 0;\n}\n#contactContainer .contentBox form label {\n  font-size: 1.4rem;\n}\n#contactContainer .contentBox form [type=radio] {\n  width: 10%;\n  display: initial;\n}\n#contactContainer .contentBox form ul {\n  padding: 0;\n}\n#contactContainer .contentBox form input, #contactContainer .contentBox form select {\n  display: block;\n  margin-top: 2%;\n}\n#contactContainer .contentBox form input {\n  height: 1.5rem;\n}\n#contactContainer .contentBox form select {\n  height: 2rem;\n}\n#contactContainer .contentBox form textarea {\n  width: 100%;\n  height: 18rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox form textarea {\n    height: 20rem;\n  }\n}\n#contactContainer .contentBox form button {\n  grid-area: submit;\n  color: ivory;\n  font-size: 1.3rem;\n  text-align: left;\n}\n\n.dot-pulse {\n  top: 20%;\n  left: 35%;\n}\n\n#pop-up-display-box {\n  background-color: rgba(45, 41, 35, 0.8);\n  width: 94vw;\n  height: 87vh;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 8vh;\n  left: 3vw;\n  display: none;\n  row-gap: 1rem;\n  align-items: center;\n  flex-direction: column;\n  padding-top: 2.5rem;\n}\n#pop-up-display-box img {\n  width: 26rem;\n}\n#pop-up-display-box a, #pop-up-display-box button {\n  font-size: 2rem;\n}\n#pop-up-display-box button {\n  color: antiquewhite;\n  cursor: pointer;\n}\n#pop-up-display-box button:hover, #pop-up-display-box a:hover {\n  filter: brightness(72%);\n}\n#pop-up-display-box #content-holder {\n  display: flex;\n  justify-content: space-evenly;\n  position: relative;\n  width: 70%;\n}\n#pop-up-display-box #content-holder .pop-up-directional {\n  font-size: 2.5rem;\n}\n\n#news-media-display {\n  background-color: rgba(44, 52, 77, 0.8);\n  height: 88vh;\n  width: 94vw;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 7vh;\n  left: 3vw;\n  display: none;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n}\n\n#singleContainer {\n  height: 77%;\n  min-width: 96%;\n  top: 9.5%;\n  display: flex;\n  flex-wrap: wrap;\n  position: absolute;\n  z-index: 1;\n  padding: 1.5rem 1rem;\n  padding-bottom: 1rem;\n  background-color: rgba(37, 35, 34, 0.9);\n}\n@media (min-width: 1200px) {\n  #singleContainer {\n    min-width: 60%;\n    height: 86%;\n  }\n}\n#singleContainer h4 {\n  font-size: 1.6rem;\n}\n#singleContainer h3, #singleContainer h4, #singleContainer .related-link {\n  color: rgb(241, 218, 189);\n}\n#singleContainer #mainImageAndStats {\n  height: 100%;\n  width: 24vw;\n  text-align: center;\n}\n@media (min-width: 1200px) {\n  #singleContainer #mainImageAndStats {\n    width: 25vw;\n  }\n}\n#singleContainer #mainImageAndStats img {\n  height: 33%;\n}\n@media (min-width: 1200px) {\n  #singleContainer #mainImageAndStats img {\n    height: 42%;\n  }\n}\n#singleContainer #mainImageAndStats ul {\n  padding-left: 20%;\n  font-size: 1.4rem;\n  text-align: left;\n  margin-top: 1rem;\n}\n@media (min-width: 1200px) {\n  #singleContainer #mainImageAndStats ul {\n    font-size: 1.5rem;\n  }\n}\n#singleContainer #mainImageAndStats ul li {\n  margin-top: 0.6rem;\n  list-style-type: square;\n}\n#singleContainer #mainImageAndStats ul li a {\n  filter: brightness(115%);\n}\n#singleContainer #singleInfo {\n  width: 40vw;\n  display: grid;\n  grid-template-rows: 7% 1fr;\n  height: 100%;\n}\n@media (min-width: 1200px) {\n  #singleContainer #singleInfo {\n    width: 35vw;\n  }\n}\n#singleContainer #singleInfo p {\n  margin-top: 1.5rem;\n  font-size: 1.6rem;\n  height: 99%;\n}\n@media (min-width: 1200px) {\n  #singleContainer #singleInfo p {\n    font-size: 1.7rem;\n  }\n}\n#singleContainer #singleInfo div {\n  overflow: auto;\n  padding: 0 1rem;\n}\n#singleContainer #vidAndImgCol {\n  height: 100%;\n  width: 16vw;\n  overflow: auto;\n  overflow-x: hidden;\n  text-align: center;\n}\n#singleContainer #vidAndImgCol h3 {\n  font-size: 1.9rem;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col {\n  width: 26vw;\n  position: relative;\n  height: 100%;\n  overflow: auto;\n  padding: 0 1rem;\n  display: grid;\n  grid-template-rows: 10% 1fr 4%;\n}\n@media (min-width: 1200px) {\n  #singleContainer #updates-col {\n    width: 28vw;\n  }\n}\n#singleContainer #updates-col h3 {\n  font-size: 2rem;\n}\n#singleContainer #updates-col h3 a {\n  font-size: 1.7rem;\n}\n#singleContainer #updates-col h3 a:hover {\n  color: white;\n}\n#singleContainer #updates-col #news-reciever {\n  overflow: auto;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col #news-reciever p {\n  font-size: 1.4rem;\n  padding-right: 1rem;\n}\n#singleContainer #updates-col #news-reciever img {\n  width: 95%;\n}\n#singleContainer #updates-col #pagination-holder {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n  font-size: 1.8rem;\n  display: flex;\n  justify-content: center;\n}\n\nbody {\n  background-color: rgb(100, 92, 82);\n}\n\n.search-overlay {\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(72, 68, 62, 0.96);\n  visibility: hidden;\n  opacity: 0;\n  transform: scale(1.09);\n  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;\n  box-sizing: border-box;\n}\n.search-overlay .container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n.search-overlay p {\n  padding-top: 1rem;\n}\nbody.admin-bar .search-overlay {\n  top: 2rem;\n}\n.search-overlay__top {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n.search-overlay__icon {\n  margin-right: 0.75rem;\n  font-size: 2.5rem;\n  color: rgb(148, 121, 105);\n}\n.search-overlay--active {\n  visibility: visible;\n  opacity: 1;\n  transform: scale(1);\n}\n.search-overlay__section-title {\n  margin: 30px 0 1px 0;\n  font-weight: 400;\n  font-size: 2rem;\n  padding: 15px 0;\n  border-bottom: 1px solid #ccc;\n}\n.search-overlay__close {\n  font-size: 2.7rem;\n  cursor: pointer;\n  transition: all 0.3s;\n  background-color: rgb(58, 54, 54);\n  color: rgb(180, 171, 166);\n  line-height: 0.7;\n}\n.search-overlay__close:hover {\n  opacity: 1;\n}\n.search-overlay .one-half {\n  padding-bottom: 0;\n}\n\n.search-term {\n  width: 75%;\n  box-sizing: border-box;\n  border: none;\n  padding: 1rem 0;\n  margin: 0;\n  background-color: transparent;\n  font-size: 1rem;\n  font-weight: 300;\n  outline: none;\n  color: rgb(218, 201, 182);\n}\n\n.body-no-scroll {\n  overflow: hidden;\n}\n\n.container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n}\n\n@media (min-width: 960px) {\n  .search-term {\n    width: 80%;\n    font-size: 3rem;\n  }\n}\n@-webkit-keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.spinner-loader {\n  margin-top: 45px;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  border: 0.25rem solid rgba(0, 0, 0, 0.2);\n  border-top-color: black;\n  -webkit-animation: spin 1s infinite linear;\n  animation: spin 1s infinite linear;\n}\n\n.media-card button {\n  color: white;\n  cursor: pointer;\n  font-size: 2.1rem;\n}\n\nh1, h2, h3, h4 {\n  font-family: \"Libre Caslon Text\", serif;\n}\n\n.textBox p, #relationship-link, #single-link {\n  font-family: \"Libre Caslon Display\", serif;\n}\n\nh1 {\n  font-weight: 700;\n}\n\nh2 {\n  font-weight: 400;\n}\n\n.display-text, #welcomeContainer p, .titleBox p {\n  font-family: \"Cormorant SC\", serif;\n}\n\ninput, .read-more, .news li a, header li a, #realtimeFiltersAndSorting button, #search-filters button, #reset-all {\n  font-family: \"Lora\", serif;\n}\n\n.news p {\n  font-family: \"Roboto\", sans-serif;\n}\n\n.news p {\n  font-weight: 300;\n}\n\n.search-form {\n  position: fixed;\n  top: 50%;\n  color: white;\n}\n\n.content-loader {\n  background-color: transparent;\n  height: 50%;\n  position: absolute;\n}\n.content-loader .ball {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(47, 163, 56);\n  border-radius: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader[data-text]::before {\n  position: absolute;\n}\n.content-loader.loader.is-active::before {\n  position: absolute;\n  width: 50%;\n  left: 25%;\n  top: 39%;\n  font-size: 2.7rem;\n  color: rgb(195, 168, 126);\n  background-color: transparent;\n}\n.content-loader.loader-bar-ping-pong::after {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(101, 148, 187);\n  -webkit-animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader.is-active {\n  height: 97%;\n  z-index: 0;\n  background-color: rgba(51, 49, 56, 0.7490196078);\n  -webkit-animation: blink 1.8s linear infinite alternate;\n          animation: blink 1.8s linear infinite alternate;\n}\n\n@-webkit-keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@-webkit-keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n@keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n#all-news-container {\n  height: 56rem;\n  top: 6rem;\n  width: 95%;\n  left: 2.5%;\n  background-color: rgba(37, 35, 34, 0.75);\n  position: absolute;\n  display: grid;\n  grid-auto-flow: row;\n  grid-template-columns: 100%;\n  color: aliceblue;\n}\n@media (min-width: 1200px) {\n  #all-news-container {\n    height: 85%;\n    top: 5rem;\n  }\n}\n@media (min-width: 1200px) {\n  #all-news-container {\n    grid-template-columns: 66% 34%;\n  }\n}\n#all-news-container #filter-sort-toggle {\n  display: block;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filter-sort-toggle {\n    display: none;\n  }\n}\n#all-news-container button {\n  color: antiquewhite;\n}\n#all-news-container #media-container, #all-news-container #filters-and-links-container, #all-news-container #selected-news-container {\n  position: relative;\n}\n#all-news-container #filters-and-links-container.fade-in, #all-news-container #filters-and-links-container.fade-out {\n  display: grid;\n  background-color: rgba(51, 49, 47, 0.9);\n  border-radius: 2%;\n  box-shadow: 0.2rem 0.2rem 1rem 0.4rem inset rgba(37, 33, 30, 0.85);\n  position: fixed;\n  width: 85%;\n  height: 80%;\n  margin-left: 10%;\n  grid-template-areas: \"realtimeFiltersAndSorting\" \"searchFilters\" \"resetAll\";\n}\n#all-news-container #filters-and-links-container.fade-in {\n  -webkit-animation: fadeOptionsIn 0.5s ease-in-out;\n          animation: fadeOptionsIn 0.5s ease-in-out;\n}\n#all-news-container #filters-and-links-container.fade-out {\n  -webkit-animation: fadeOptionsOut 0.5s ease-in-out;\n          animation: fadeOptionsOut 0.5s ease-in-out;\n}\n@-webkit-keyframes fadeOptionsIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@keyframes fadeOptionsIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes fadeOptionsOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes fadeOptionsOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n#all-news-container #filters-and-links-container {\n  display: none;\n  padding-left: 1.5rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container {\n    position: relative;\n    display: grid;\n    grid-template-areas: \"realtimeFiltersAndSorting\" \"searchFilters\" \"resetAll\";\n    border: 0.2rem solid rgba(212, 193, 130, 0.4);\n    border-left: none;\n  }\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting {\n  grid-area: realtimeFiltersAndSorting;\n  display: grid;\n  margin-top: 1.5rem;\n  grid-template-areas: \"headingRFS headingRFS headingRFS\" \"orderBy toggleType filterDate\";\n  width: 100%;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container #realtime-filters-and-sorting {\n    grid-template-areas: \"headingRFS headingRFS\" \"orderBy toggleType\" \"filterDate filterDate\";\n  }\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button, #all-news-container #filters-and-links-container #realtime-filters-and-sorting label {\n  font-size: 1.6rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container #realtime-filters-and-sorting button, #all-news-container #filters-and-links-container #realtime-filters-and-sorting label {\n    font-size: 1.3rem;\n  }\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button.inactive {\n  pointer-events: none;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button.inactive span {\n  color: red;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting h2 {\n  grid-area: headingRFS;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #order-by {\n  grid-area: orderBy;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #toggle-type {\n  grid-area: toggleType;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date {\n  grid-area: filterDate;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date div ul {\n  display: flex;\n  gap: 3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul {\n  padding-left: 0.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul li {\n  margin-top: 0.5rem;\n}\n#all-news-container #filters-and-links-container #search-filters {\n  grid-area: searchFilters;\n  display: grid;\n  grid-template-areas: \"headingSF headingSF headingSF\" \"newsSearch newsSearch newsSearch\" \"caseSensitive fullWordOnly wordStartOnly\" \"includeTitle includeDescription ...\";\n}\n#all-news-container #filters-and-links-container #search-filters h2 {\n  grid-area: headingSF;\n}\n#all-news-container #filters-and-links-container #search-filters button {\n  font-size: 1.6rem;\n  text-align: left;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container #search-filters button {\n    font-size: 1.2rem;\n  }\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container {\n  grid-area: newsSearch;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container #news-search.inactive {\n  pointer-events: none;\n  background-color: gray;\n}\n#all-news-container #filters-and-links-container #search-filters #full-word-only {\n  grid-area: fullWordOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only {\n  grid-area: wordStartOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #case-sensitive {\n  grid-area: caseSensitive;\n}\n#all-news-container #filters-and-links-container #search-filters #include-title {\n  grid-area: includeTitle;\n}\n#all-news-container #filters-and-links-container #search-filters #include-description {\n  grid-area: includeDescription;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive, #all-news-container #filters-and-links-container #search-filters button.inactive {\n  pointer-events: none;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive span, #all-news-container #filters-and-links-container #search-filters button.inactive span {\n  color: red;\n}\n#all-news-container #filters-and-links-container button, #all-news-container #filters-and-links-container select, #all-news-container #filters-and-links-container label {\n  font-size: 1.3rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container button, #all-news-container #filters-and-links-container select, #all-news-container #filters-and-links-container label {\n    font-size: 1.15rem;\n  }\n}\n#all-news-container #filters-and-links-container label {\n  margin-right: 0.5rem;\n}\n#all-news-container #filters-and-links-container #reset-all {\n  font-size: 1.65rem;\n  grid-area: resetAll;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container #reset-all {\n    font-size: 1.4rem;\n  }\n}\n#all-news-container #filters-and-links-container #reset-all.inactive {\n  pointer-events: none;\n  color: red;\n}\n#all-news-container #filters-and-links-container button {\n  cursor: pointer;\n}\n#all-news-container #filters-and-links-container h3 {\n  font-size: 1.7rem;\n}\n#all-news-container #filters-and-links-container h4 {\n  font-size: 1.5rem;\n  margin-bottom: 0.8rem;\n}\n#all-news-container #selected-news-container {\n  overflow: auto;\n  display: grid;\n  grid-template-rows: 10% 84% 6%;\n  border: 0.2rem solid rgb(180, 174, 164);\n}\n#all-news-container #selected-news-container #titleAndOptions {\n  display: grid;\n  grid-template-columns: [mh] 80% [os] 10% [ds] 10%;\n  grid-template-areas: \"mh os ds\";\n  border-bottom: 0.3rem solid rgb(185, 158, 122);\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #titleAndOptions {\n    grid-template-columns: [mh] 90% [ds] 1fr;\n    grid-template-areas: \"mh ds\";\n  }\n}\n#all-news-container #selected-news-container #titleAndOptions #main-header {\n  grid-area: mh;\n  font-size: 2.3rem;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#all-news-container #selected-news-container #titleAndOptions .options-switch, #all-news-container #selected-news-container #titleAndOptions #dismiss-selection {\n  font-size: 1.5rem;\n  cursor: pointer;\n  border: 0.2rem solid rgb(212, 193, 130);\n  border-bottom: none;\n  border-top: none;\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #titleAndOptions .options-switch, #all-news-container #selected-news-container #titleAndOptions #dismiss-selection {\n    font-size: 1.2rem;\n  }\n}\n#all-news-container #selected-news-container #titleAndOptions .options-switch {\n  grid-area: os;\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #titleAndOptions .options-switch {\n    display: none;\n  }\n}\n#all-news-container #selected-news-container #titleAndOptions #dismiss-selection {\n  grid-area: ds;\n}\n#all-news-container #selected-news-container #titleAndOptions #dismiss-selection.dismissed {\n  filter: contrast(20%);\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #selected-news-reciever {\n  margin-bottom: 0.5rem;\n  padding-right: 2rem;\n  overflow: auto;\n}\n#all-news-container #selected-news-container #full-display-container {\n  padding-left: 2rem;\n}\n#all-news-container #selected-news-container #main-display.dismissed, #all-news-container #selected-news-container #full-display-container.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #main-display .news, #all-news-container #selected-news-container #full-display-container .news {\n  font-size: 1.65rem;\n  padding-top: 0;\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #main-display .news, #all-news-container #selected-news-container #full-display-container .news {\n    font-size: 1.2rem;\n  }\n}\n#all-news-container #selected-news-container #main-display .news::after, #all-news-container #selected-news-container #full-display-container .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#all-news-container #selected-news-container #main-display .news img, #all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news img, #all-news-container #selected-news-container #full-display-container .news iframe {\n  float: left;\n  margin-right: 2%;\n}\n#all-news-container #selected-news-container #main-display .news p, #all-news-container #selected-news-container #full-display-container .news p {\n  line-height: 1.6rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #main-display .news p, #all-news-container #selected-news-container #full-display-container .news p {\n    line-height: 1.2rem;\n  }\n}\n#all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news iframe {\n  width: 150px;\n  height: 100px;\n}\n#all-news-container #selected-news-container #main-display ul li, #all-news-container #selected-news-container #full-display-container ul li {\n  list-style-type: circle;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link, #all-news-container #selected-news-container #main-display ul li .relationship-link, #all-news-container #selected-news-container #full-display-container ul li .see-more-link, #all-news-container #selected-news-container #full-display-container ul li .relationship-link {\n  cursor: pointer;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link.dismissed, #all-news-container #selected-news-container #main-display ul li .relationship-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .see-more-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .relationship-link.dismissed {\n  display: none;\n}\n#all-news-container #filters-and-links-container {\n  padding-top: 1rem;\n}\n#all-news-container #pagination-holder {\n  width: 100%;\n}\n#all-news-container #pagination-holder.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n#all-news-container #pagination-holder .content-pages a {\n  cursor: pointer;\n  font-size: 1.9rem;\n  margin-left: 0.5rem;\n}\n#all-news-container #pagination-holder .content-pages a.hidden, #all-news-container #pagination-holder .content-pages a.selectedPage {\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages a.hidden {\n  opacity: 0;\n}\n\n#mobile-typing-container {\n  display: none;\n  justify-content: center;\n  align-items: flex-end;\n  background-color: rgba(24, 23, 23, 0.9);\n  height: 100%;\n  width: 100%;\n  position: fixed;\n  top: 0;\n}\n#mobile-typing-container div {\n  width: 50%;\n  margin-bottom: 5rem;\n  display: flex;\n  justify-content: center;\n  -moz-column-gap: 1rem;\n       column-gap: 1rem;\n  align-items: center;\n}\n#mobile-typing-container div button, #mobile-typing-container div label {\n  font-size: 1.8rem;\n}\n#mobile-typing-container div button {\n  cursor: pointer;\n  color: antiquewhite;\n}\n\n#mobile-typing-container.opened {\n  display: flex;\n}\n\n@media (min-width: 1200px) {\n  .options-switch {\n    display: none;\n  }\n}\n\n.news-search-field {\n  font-size: 1.4rem;\n  height: 2.6rem;\n  width: 24rem;\n}\n@media (min-width: 1200px) {\n  .news-search-field {\n    font-size: 1.15rem;\n    height: 2.3rem;\n    width: 18rem;\n  }\n}\n\n#media-reciever {\n  display: none;\n  position: fixed;\n  background-color: rgba(10, 10, 10, 0.8);\n  top: 7%;\n  width: 100%;\n  height: 95%;\n  z-index: 1;\n}\n#media-reciever #current-media {\n  margin-left: 6rem;\n  position: absolute;\n  top: 6rem;\n  width: 40rem;\n  height: 23.5rem;\n}\n@media (min-width: 1200px) {\n  #media-reciever #current-media {\n    top: 4rem;\n    margin-left: 8rem;\n    width: 64rem;\n    height: 36rem;\n  }\n}\n#media-reciever #current-media iframe, #media-reciever #current-media img {\n  width: 100%;\n  height: 100%;\n}\n#media-reciever #current-media #play-button-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: absolute;\n  height: 100%;\n  width: 100%;\n}\n#media-reciever #current-media #play-button-container #play-button {\n  height: 6rem;\n  width: 9rem;\n  background-color: rgba(99, 100, 179, 0.8);\n  position: absolute;\n  border-radius: 35%;\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  transition: opacity 0.2s ease;\n}\n#media-reciever #current-media #play-button-container #play-button div {\n  border-left: 3rem solid rgb(125, 150, 168);\n  border-top: 1.7rem solid transparent;\n  border-bottom: 1.7rem solid transparent;\n}\n#media-reciever #current-media #play-button-container #play-button:hover {\n  opacity: 0.7;\n}\n#media-reciever #current-media.center-display {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface {\n  display: flex;\n  flex-direction: column;\n  position: absolute;\n  height: 82%;\n  overflow: auto;\n  right: 2rem;\n  top: 3rem;\n}\n#media-reciever #media-selection-interface #media-menu {\n  font-size: 1.2rem;\n  display: flex;\n}\n#media-reciever #media-selection-interface #media-menu a {\n  color: azure;\n  margin-left: 2rem;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-menu a.active {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column {\n  width: 75%;\n  max-width: 380px;\n  display: flex;\n  flex-direction: column;\n  overflow: auto;\n}\n#media-reciever #media-selection-interface #media-column .media-selection {\n  display: flex;\n  margin-top: 1rem;\n  width: 100%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb {\n  width: 45%;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb.selected {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information {\n  display: flex;\n  flex-direction: column;\n  margin-left: 1rem;\n  width: 55%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p {\n  margin: 0;\n  color: beige;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p:nth-of-type(2) {\n  margin-top: 1rem;\n}\n#media-reciever #media-selection-interface #media-pagination {\n  margin-top: 1.5rem;\n  color: aliceblue;\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface #media-pagination a {\n  font-size: 1.2rem;\n  margin-left: 1rem;\n}\n#media-reciever #media-close {\n  position: absolute;\n  color: white;\n  left: 1.5rem;\n  top: 1.5rem;\n  font-size: 3.5rem;\n  cursor: pointer;\n}\n@media (min-width: 1200px) {\n  #media-reciever #media-close {\n    left: 3.5rem;\n    top: 3.5rem;\n    font-size: 3.5rem;\n  }\n}\n\n.media-card:hover img, .property-media-card:hover img {\n  filter: brightness(50%);\n  cursor: pointer;\n}\n.media-card:hover h3, .media-card:hover p, .media-card:hover button, .property-media-card:hover h3, .property-media-card:hover p, .property-media-card:hover button {\n  filter: contrast(40%);\n  cursor: pointer;\n}\n\n.loader {\n  color: #fff;\n  position: fixed;\n  box-sizing: border-box;\n  left: -9999px;\n  top: -9999px;\n  width: 0;\n  height: 0;\n  overflow: hidden;\n  z-index: 999999;\n}\n\n.loader:after, .loader:before {\n  box-sizing: border-box;\n  display: none;\n}\n\n.loader.is-active {\n  background-color: rgba(0, 0, 0, 0.85);\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.loader.is-active:after, .loader.is-active:before {\n  display: block;\n}\n\n@-webkit-keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n\n@keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.loader[data-text]:before {\n  position: fixed;\n  left: 0;\n  top: 50%;\n  color: currentColor;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  width: 100%;\n  font-size: 14px;\n}\n\n.loader[data-text=\"\"]:before {\n  content: \"Loading\";\n}\n\n.loader[data-text]:not([data-text=\"\"]):before {\n  content: attr(data-text);\n}\n\n.loader[data-text][data-blink]:before {\n  -webkit-animation: blink 1s linear infinite alternate;\n          animation: blink 1s linear infinite alternate;\n}\n\n.loader-default[data-text]:before {\n  top: calc(50% - 63px);\n}\n\n.loader-default:after {\n  content: \"\";\n  position: fixed;\n  width: 48px;\n  height: 48px;\n  border: 8px solid #fff;\n  border-left-color: transparent;\n  border-radius: 50%;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-default[data-half]:after {\n  border-right-color: transparent;\n}\n\n.loader-default[data-inverse]:after {\n  animation-direction: reverse;\n}\n\n.loader-double:after, .loader-double:before {\n  content: \"\";\n  position: fixed;\n  border-radius: 50%;\n  border: 8px solid;\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-double:after {\n  width: 48px;\n  height: 48px;\n  border-color: #fff;\n  border-left-color: transparent;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n}\n\n.loader-double:before {\n  width: 64px;\n  height: 64px;\n  border-color: #eb974e;\n  border-right-color: transparent;\n  -webkit-animation-duration: 2s;\n          animation-duration: 2s;\n  top: calc(50% - 32px);\n  left: calc(50% - 32px);\n}\n\n.loader-bar[data-text]:before {\n  top: calc(50% - 40px);\n  color: #fff;\n}\n\n.loader-bar:after {\n  content: \"\";\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  width: 200px;\n  height: 20px;\n  transform: translate(-50%, -50%);\n  background: linear-gradient(-45deg, #4183d7 25%, #52b3d9 0, #52b3d9 50%, #4183d7 0, #4183d7 75%, #52b3d9 0, #52b3d9);\n  background-size: 20px 20px;\n  box-shadow: inset 0 10px 0 hsla(0, 0%, 100%, 0.2), 0 0 0 5px rgba(0, 0, 0, 0.2);\n  animation: moveBar 1.5s linear infinite reverse;\n}\n\n.loader-bar[data-rounded]:after {\n  border-radius: 15px;\n}\n\n.loader-bar[data-inverse]:after {\n  -webkit-animation-direction: normal;\n          animation-direction: normal;\n}\n\n@-webkit-keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n\n@keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n.loader-bar-ping-pong:before {\n  width: 200px;\n  background-color: #000;\n}\n\n.loader-bar-ping-pong:after, .loader-bar-ping-pong:before {\n  content: \"\";\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 100px);\n}\n\n.loader-bar-ping-pong:after {\n  width: 50px;\n  background-color: #f19;\n  -webkit-animation: moveBarPingPong 0.5s linear infinite alternate;\n          animation: moveBarPingPong 0.5s linear infinite alternate;\n}\n\n.loader-bar-ping-pong[data-rounded]:before {\n  border-radius: 10px;\n}\n\n.loader-bar-ping-pong[data-rounded]:after {\n  border-radius: 50%;\n  width: 20px;\n  -webkit-animation-name: moveBarPingPongRounded;\n          animation-name: moveBarPingPongRounded;\n}\n\n@keyframes moveBarPingPong {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 50px);\n  }\n}\n@-webkit-keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@-webkit-keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n@keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n.loader-border[data-text]:before {\n  color: #fff;\n}\n\n.loader-border:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 15px;\n  height: 15px;\n  background-color: #ff0;\n  -webkit-animation: corners 3s ease both infinite;\n          animation: corners 3s ease both infinite;\n}\n\n.loader-ball:before {\n  content: \"\";\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 50%;\n  left: 50%;\n  margin: -25px 0 0 -25px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: kickBall 1s infinite alternate ease-in both;\n          animation: kickBall 1s infinite alternate ease-in both;\n}\n\n.loader-ball[data-shadow]:before {\n  box-shadow: inset -5px -5px 10px 0 rgba(0, 0, 0, 0.5);\n}\n\n.loader-ball:after {\n  content: \"\";\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.3);\n  border-radius: 50%;\n  width: 45px;\n  height: 20px;\n  top: calc(50% + 10px);\n  left: 50%;\n  margin: 0 0 0 -22.5px;\n  z-index: 0;\n  -webkit-animation: shadow 1s infinite alternate ease-out both;\n          animation: shadow 1s infinite alternate ease-out both;\n}\n\n@-webkit-keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n\n@keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n@-webkit-keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n@keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n.loader-smartphone:after {\n  content: \"\";\n  color: #fff;\n  font-size: 12px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  line-height: 120px;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  width: 70px;\n  height: 130px;\n  margin: -65px 0 0 -35px;\n  border: 5px solid #fd0;\n  border-radius: 10px;\n  box-shadow: inset 0 5px 0 0 #fd0;\n  background: radial-gradient(circle at 50% 90%, rgba(0, 0, 0, 0.5) 6px, transparent 0), linear-gradient(0deg, #fd0 22px, transparent 0), linear-gradient(0deg, rgba(0, 0, 0, 0.5) 22px, rgba(0, 0, 0, 0.5));\n  -webkit-animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n          animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n}\n\n.loader-smartphone[data-screen=\"\"]:after {\n  content: \"Loading\";\n}\n\n.loader-smartphone:not([data-screen=\"\"]):after {\n  content: attr(data-screen);\n}\n\n@-webkit-keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n\n@keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n.loader-clock:before {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  margin: -60px 0 0 -60px;\n  background: linear-gradient(180deg, transparent 50%, #f5f5f5 0), linear-gradient(90deg, transparent 55px, #2ecc71 0, #2ecc71 65px, transparent 0), linear-gradient(180deg, #f5f5f5 50%, #f5f5f5 0);\n  box-shadow: inset 0 0 0 10px #f5f5f5, 0 0 0 5px #555, 0 0 0 10px #7b7b7b;\n  -webkit-animation: rotation infinite 2s linear;\n          animation: rotation infinite 2s linear;\n}\n\n.loader-clock:after, .loader-clock:before {\n  content: \"\";\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  overflow: hidden;\n}\n\n.loader-clock:after {\n  width: 60px;\n  height: 40px;\n  margin: -20px 0 0 -15px;\n  border-radius: 20px 0 0 20px;\n  background: radial-gradient(circle at 14px 20px, #25a25a 10px, transparent 0), radial-gradient(circle at 14px 20px, #1b7943 14px, transparent 0), linear-gradient(180deg, transparent 15px, #2ecc71 0, #2ecc71 25px, transparent 0);\n  -webkit-animation: rotation infinite 24s linear;\n          animation: rotation infinite 24s linear;\n  transform-origin: 15px center;\n}\n\n.loader-curtain:after, .loader-curtain:before {\n  position: fixed;\n  width: 100%;\n  top: 50%;\n  margin-top: -35px;\n  font-size: 70px;\n  text-align: center;\n  font-family: Helvetica, Arial, sans-serif;\n  overflow: hidden;\n  line-height: 1.2;\n  content: \"Loading\";\n}\n\n.loader-curtain:before {\n  color: #666;\n}\n\n.loader-curtain:after {\n  color: #fff;\n  height: 0;\n  -webkit-animation: curtain 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both;\n}\n\n.loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):after, .loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):before {\n  content: attr(data-curtain-text);\n}\n\n.loader-curtain[data-brazilian]:before {\n  color: #f1c40f;\n}\n\n.loader-curtain[data-brazilian]:after {\n  color: #2ecc71;\n}\n\n.loader-curtain[data-colorful]:before {\n  -webkit-animation: maskColorful 2s linear infinite alternate both;\n          animation: maskColorful 2s linear infinite alternate both;\n}\n\n.loader-curtain[data-colorful]:after {\n  -webkit-animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n  color: #000;\n}\n\n@-webkit-keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n\n@keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n@-webkit-keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@-webkit-keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n@keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n.loader-music:after, .loader-music:before {\n  content: \"\";\n  position: fixed;\n  width: 240px;\n  height: 240px;\n  top: 50%;\n  left: 50%;\n  margin: -120px 0 0 -120px;\n  border-radius: 50%;\n  text-align: center;\n  line-height: 240px;\n  color: #fff;\n  font-size: 40px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);\n  letter-spacing: -1px;\n}\n\n.loader-music:after {\n  -webkit-backface-visibility: hidden;\n          backface-visibility: hidden;\n}\n\n.loader-music[data-hey-oh]:after, .loader-music[data-hey-oh]:before {\n  box-shadow: 0 0 0 10px;\n}\n\n.loader-music[data-hey-oh]:before {\n  background-color: #fff;\n  color: #000;\n  -webkit-animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-hey-oh]:after {\n  background-color: #000;\n  -webkit-animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n          animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after, .loader-music[data-no-cry]:before {\n  background: linear-gradient(45deg, #009b3a 50%, #fed100 51%);\n  box-shadow: 0 0 0 10px #000;\n}\n\n.loader-music[data-no-cry]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after {\n  -webkit-animation: coin 2.5s linear infinite, no 5s linear infinite both;\n          animation: coin 2.5s linear infinite, no 5s linear infinite both;\n}\n\n.loader-music[data-we-are]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n  background: radial-gradient(ellipse at center, #4ecdc4 0, #556270);\n}\n\n.loader-music[data-we-are]:after {\n  -webkit-animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n  background: radial-gradient(ellipse at center, #26d0ce 0, #1a2980);\n}\n\n.loader-music[data-rock-you]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n  background: #444;\n}\n\n.loader-music[data-rock-you]:after {\n  -webkit-animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n  background: #96281b;\n}\n\n@-webkit-keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n\n@keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n@-webkit-keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@-webkit-keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@-webkit-keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@-webkit-keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@-webkit-keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@-webkit-keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@-webkit-keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@-webkit-keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@-webkit-keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n@keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n.loader-pokeball:before {\n  content: \"\";\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  top: 50%;\n  left: 50%;\n  margin: -50px 0 0 -50px;\n  background: linear-gradient(180deg, red 42%, #000 0, #000 58%, #fff 0);\n  background-repeat: no-repeat;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: movePokeball 1s linear infinite both;\n          animation: movePokeball 1s linear infinite both;\n}\n\n.loader-pokeball:after {\n  content: \"\";\n  position: absolute;\n  width: 24px;\n  height: 24px;\n  top: 50%;\n  left: 50%;\n  margin: -12px 0 0 -12px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 2;\n  -webkit-animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n          animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n  border: 2px solid #000;\n  box-shadow: 0 0 0 5px #fff, 0 0 0 10px #000;\n}\n\n@-webkit-keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n\n@keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n@-webkit-keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n@keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n.loader-bouncing:after, .loader-bouncing:before {\n  content: \"\";\n  width: 20px;\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 10px);\n  border-radius: 50%;\n  background-color: #fff;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:after {\n  margin-left: -30px;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:before {\n  -webkit-animation-delay: 0.2s;\n          animation-delay: 0.2s;\n}\n\n@-webkit-keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n\n@keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n.sbl-circ-ripple {\n  height: 48px;\n  width: 48px;\n  color: #48659b;\n  border-radius: 50%;\n  position: relative;\n  display: inline-block;\n  top: 20%;\n  left: 40%;\n}\n\n.sbl-circ-ripple::after, .sbl-circ-ripple::before {\n  content: \"\";\n  height: 0;\n  width: 0;\n  border: inherit;\n  border: 5px solid;\n  border-radius: inherit;\n  position: absolute;\n  left: 40%;\n  top: 40%;\n  -webkit-animation: circle-ripple 1s linear infinite;\n          animation: circle-ripple 1s linear infinite;\n}\n\n.sbl-circ-ripple::before {\n  -webkit-animation-delay: -0.6s;\n          animation-delay: -0.6s;\n}\n\n@-webkit-keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}\n\n@keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}/*# sourceMappingURL=style.css.map */", "",{"version":3,"sources":["webpack://./css/style.css","webpack://./css/base/_customBase.scss","webpack://./css/base/_mixins.scss","webpack://./css/modules/_footer.scss","webpack://./css/modules/_opening.scss","webpack://./css/modules/_properties.scss","webpack://./css/modules/_single.scss","webpack://./css/modules/_constant.scss","webpack://./css/modules/_search.scss","webpack://./css/modules/_loader.scss","webpack://./css/modules/_all-news.scss","webpack://./css/modules/_shadow-box.scss","webpack://./css/downloads/css-loader.css","webpack://./css/downloads/sbl-circ-ripple.css"],"names":[],"mappings":"AAAA,gBAAgB;ACEhB;EACI,kBAAA;EAEA,SAAA;ADDJ;AEGI;EDLJ;IAcQ,cAAA;EDRN;AACF;AEII;EDXJ;IAiBQ,iBAAA;EDNN;AACF;ACQI;EACI,gBAAA;ADNR;;ACUA;EACI,SAAA;EACA,mBAAA;EACA,YAAA;ADPJ;;ACUA;EACI,SAAA;EACA,mBAAA;EACA,eAAA;ADPJ;;ACUA;EACI,iBAAA;EACA,SAAA;ADPJ;ACQI;EACI,iBAAA;ADNR;;ACUA;EACI,iBAAA;EACA,SAAA;ADPJ;;ACUA;EACI,qBAAA;EACA,cAAA;ADPJ;;ACUA;EACI,eAAA;ADPJ;;ACSA;EACI,oBAAA;ADNJ;;ACQA;EACI,UAAA;ADLJ;;ACOA;EACI,cAAA;EACA,sBAAA;ADJJ;;ACOA;EACI,aAAA;EACA,oBAAA;ADJJ;;ACOA;EACI,sBAAA;ADJJ;;ACOA;EACI,YAAA;EACA,uBAAA;ADJJ;;ACOA;EACI,qBAAA;ADJJ;;ACQA;EACI,kBAAA;EACA,MAAA;ADLJ;ACQI;EACI,oBAAA;ADNR;;ACWA;EAOI,eAAA;EAEA,WAAA;EACA,YAAA;EACA,iBAAA;EACA,aAAA;EACA,uBAAA;ADfJ;ACiBI;EASI,aAAA;EACA,uBAAA;EAGA,mBAAA;ADzBR;AEjGI;ED6GA;IAEQ,UAAA;EDVV;AACF;AEhGI;EDuGA;IAKQ,UAAA;EDRV;AACF;ACmBY;EACI,kBAAA;ADjBhB;ACkBgB;EACI,kBAAA;ADhBpB;;ACuBA;EACI,kBAAA;ADpBJ;;ACuBA;EACI,gBAAA;ADpBJ;;ACuBA;EACI,WAAA;EACA,YAAA;ADpBJ;;ACuBA;EACI,YAAA;ADpBJ;ACqBI;EACI,WAAA;EACA,WAAA;EACA,SAAA;ADnBR;ACqBI;EACI,aAAA;ADnBR;ACoBQ;EACI,oBAAA;EACA,mBAAA;ADlBZ;;ACuBA;EACI,aAAA;EAOA,gBAAA;AD1BJ;AEnJI;EDqKJ;IAGQ,uCAAA;EDjBN;AACF;AElJI;ED+JJ;IAMQ,qCAAA;EDfN;AACF;;ACmBA;EACI,WAAA;EACA,YAAA;ADhBJ;ACsBI;EAEI,YAAA;ADrBR;ACuBQ;EACI,mBAAA;EACA,kBAAA;EAGA,kBAAA;EACA,aAAA;EACA,mBAAA;EACA,uBAAA;ADvBZ;ACwBY;EAEI,kBAAA;EACA,kBAAA;EAEA,uCAAA;EACA,sBAAA;EACA,kBAAA;EACA,kBAAA;EACA,iBAAA;ADxBhB;AEhLI;EDyMY;IAEQ,aAAA;EDvBtB;AACF;ACyBgB;EACI,aAAA;ADvBpB;AExLI;ED8MY;IAGQ,cAAA;EDrBtB;AACF;ACwBY;EACI,kBAAA;EACA,aAAA;EACA,sBAAA;EACA,WAAA;EACA,kBAAA;ADtBhB;ACwBgB;EACI,yBAAA;EACA,eAAA;EACA,iBAAA;EAIA,kBAAA;ADzBpB;AE1MI;ED4NY;IAKQ,iBAAA;EDnBtB;AACF;ACsBgB;EACI,eAAA;ADpBpB;AElNI;EDqOY;IAGQ,iBAAA;EDlBtB;AACF;ACoBgB;EACI,sBAAA;EACA,wBAAA;ADlBpB;ACoBgB;EACI,iBAAA;ADlBpB;ACqBY;EACI,aAAA;ADnBhB;ACsBgB;EACI,UAAA;ADpBpB;ACwBQ;EACI,mBAAA;EACA,kBAAA;EACA,iBAAA;EACA,aAAA;EACA,sBAAA;EACA,WAAA;ADtBZ;ACuBY;EACI,SAAA;ADrBhB;ACuBY;EACI,gBAAA;ADrBhB;AC0BI;EACI,YAAA;EACA,eAAA;EACA,YAAA;ADxBR;AC0BQ;EACI,YAAA;EACA,aAAA;ADxBZ;;AGvQA;EACI,uCAAA;EACA,SAAA;EACA,aAAA;EACA,eAAA;EACA,SAAA;EACA,WAAA;EACA,kBAAA;EACA,yBAAA;EACA,mBAAA;EACA,YAAA;AH0QJ;AGzQI;EACI,YAAA;AH2QR;AE3QI;ECDA;IAGQ,eAAA;EH6QV;AACF;;AI3RA;EACI,cAAA;EACA,kBAAA;EACA,yBAAA;EACA,aAAA;EACA,uBAAA;AJ8RJ;AI7RI;EACI,iBAAA;AJ+RR;AE3RI;EELA;IAGQ,iBAAA;EJiSV;AACF;AI/RI;EACI,iBAAA;EAIA,gBAAA;AJ8RR;AEpSI;EECA;IAGQ,iBAAA;EJoSV;AACF;AIhSQ;EAGI,0BAAA;EAEA,UAAA;AJ+RZ;AE7SI;EESI;IAOQ,UAAA;EJiSd;AACF;AI9RI;EACI,aAAA;EACA,sEAAA;EACA,qDAAA;EACA,sBAAA;EACA,iBAAA;EAaA,wCAAA;EACA,kEAAA;EACA,WAAA;EACA,YAAA;EACA,eAAA;EACA,MAAA;EACA,aAAA;EAEA,yBAAA;AJmRR;AEjUI;EEoBA;IAOQ,mBAAA;IAEA,sEAAA;IACA,qDAAA;EJySV;AACF;AIzRQ;EACI,aAAA;AJ2RZ;AIzRQ;EACI,iBAAA;EACA,YAAA;EACA,eAAA;AJ2RZ;AI1RY;EACE,eAAA;AJ4Rd;AInRQ;EACI,YAAA;AJqRZ;AInRQ;EACI,qBAAA;EAEA,kBAAA;EACA,oBAAA;AJoRZ;AIlRQ;EACI,mBAAA;EAEA,kBAAA;EACA,oBAAA;AJmRZ;AIjRQ;EACI,YAAA;AJmRZ;AIjRQ;EACI,SAAA;AJmRZ;AI/QQ;EAEI,kBAAA;EAGA,iBAAA;EACA,gBAAA;EAYA,kBAAA;AJmQZ;AE5WI;EEuFI;IAYQ,qBAAA;IACA,6BAAA;IACA,iBAAA;IACA,mBAAA;EJ6Qd;AACF;AI1QY;EACI,gBAAA;EACA,SAAA;EACA,UAAA;EAEA,aAAA;EACA,sBAAA;EACA,6BAAA;EACA,mBAAA;AJ2QhB;AE7XI;EE0GQ;IAUQ,mBAAA;IACA,WAAA;IACA,YAAA;IACA,wBAAA;EJ6QlB;AACF;AI5QgB;EACI,aAAA;EACA,uBAAA;EACA,mBAAA;EACA,WAAA;EACA,iCAAA;EACA,kEAAA;EACA,iBAAA;EAEA,kDAAA;AJ6QpB;AE/YI;EEyHY;IAWQ,gBAAA;IACA,cAAA;IACA,eAAA;IACA,6BAAA;IACA,sBAAA;IACA,YAAA;EJ+QtB;AACF;AI9QoB;EACE,oBAAA;EACA,iBAAA;AJgRtB;AE7ZI;EE2IgB;IAIQ,UAAA;EJkR1B;AACF;AI5QgB;EAEI,YAAA;EACA,gBAAA;EACA,YAAA;EACA,uBAAA;AJ6QpB;AExaI;EEsJY;IAOQ,aAAA;EJ+QtB;AACF;AI9QoB;EACI,gBAAA;AJgRxB;AI1QQ;EACI,iBAAA;AJ4QZ;AIzQI;EAKI,MAAA;EACA,YAAA;EACA,WAAA;AJuQR;AItQQ;EACI,YAAA;EACA,WAAA;EACA,mCAAA;AJwQZ;AIrQI;EACI,kBAAA;EACA,kBAAA;EACA,mBAAA;EACA,cAAA;EAIA,aAAA;EACA,uBAAA;EACA,WAAA;EACA,YAAA;AJoQR;AEvcI;EEwLA;IAMQ,cAAA;EJ6QV;AACF;AIxQQ;EACI,YAAA;AJ0QZ;;AK1dA;EACI,uBAAA;AL6dJ;AK5dI;EACI,iBAAA;AL8dR;;AK1dA;EACI,oBAAA;AL6dJ;AK5dI;EACI,iBAAA;EACA,YAAA;AL8dR;;AE9dI;EGIJ;IAEQ,aAAA;EL6dN;AACF;AK3dQ;EACI,wCAAA;AL6dZ;AK1dI;EACI,WAAA;EACA,YAAA;EACA,mBAAA;AL4dR;AK1dI;EACI,uBAAA;AL4dR;;AKxdA;EACI,aAAA;AL2dJ;AEnfI;EGuBJ;IAGQ,aAAA;EL6dN;AACF;;AK1dA;EACI,aAAA;AL6dJ;AE5fI;EG8BJ;IAGQ,aAAA;EL+dN;AACF;;AK5dA;EACI,iCAAA;EACA,YAAA;AL+dJ;AK7dQ;EACI,oCAAA;AL+dZ;AK5dY;EACI,mBAAA;AL8dhB;AK1dI;EACI,aAAA;EACA,iBAAA;AL4dR;AK3dQ;EACI,eAAA;EACA,YAAA;AL6dZ;AK3dY;EACI,cAAA;EACA,WAAA;AL6dhB;AK1dQ;EACI,YAAA;AL4dZ;AK1dQ;EACI,kBAAA;EACA,UAAA;AL4dZ;AK1dQ;EACI,UAAA;AL4dZ;AK3dY;EACI,eAAA;AL6dhB;AK1dQ;EACI,0CAAA;AL4dZ;AK3dY;EACI,YAAA;EACA,cAAA;EACA,YAAA;EACA,WAAA;AL6dhB;AK3dY;EACI,YAAA;EACA,WAAA;EACA,kBAAA;EACA,eAAA;AL6dhB;AK3dY;EACI,kBAAA;EACA,mBAAA;AL6dhB;AExjBI;EGyFQ;IAIQ,kBAAA;IACA,mBAAA;EL+dlB;AACF;AK5dQ;EACI,aAAA;AL8dZ;AK5dQ;EACI,aAAA;EACA,uBAAA;OAAA,kBAAA;EACA,0RAAA;AL8dZ;AKndY;EACI,sBAAA;ALqdhB;AKndY;EACI,uBAAA;ALqdhB;AKndY;EACI,uBAAA;ALqdhB;AKndY;EACI,yBAAA;ALqdhB;AKndY;EACI,yBAAA;ALqdhB;;AK/cA;EACI,iBAAA;EACA,YAAA;ALkdJ;AKjdI;EACI,qBAAA;OAAA,gBAAA;EAEA,UAAA;EAIA,aAAA;EACA,oBAAA;AL+cR;AEhmBI;EGyIA;IAKQ,UAAA;ELsdV;AACF;AK7cQ;EACI,sBAAA;EACA,UAAA;EACA,iBAAA;AL+cZ;AE1mBI;EGwJI;IAKQ,UAAA;IAKA,cAAA;EL6cd;AACF;AK3cQ;EACI,iBAAA;EACA,gBAAA;EACA,yBAAA;AL6cZ;AK3cQ;EACI,gBAAA;AL6cZ;AK1cY;EACI,YAAA;EACA,aAAA;AL4chB;AK1cY;EACI,iBAAA;AL4chB;AK1cY;EACI,UAAA;EACA,gBAAA;AL4chB;AK1cY;EACI,UAAA;AL4chB;AK1cY;EACI,cAAA;EACA,cAAA;AL4chB;AKzcY;EACI,cAAA;AL2chB;AKzcY;EACI,YAAA;AL2chB;AKzcY;EACI,WAAA;EACA,aAAA;AL2chB;AEppBI;EGuMQ;IAIQ,aAAA;EL6clB;AACF;AK3cY;EACI,iBAAA;EACA,YAAA;EACA,iBAAA;EACA,gBAAA;AL6chB;;AKvcA;EACI,QAAA;EACA,SAAA;AL0cJ;;AKtcA;EACI,uCAAA;EACA,WAAA;EACA,YAAA;EACA,gBAAA;EACA,kBAAA;EACA,YAAA;EACA,eAAA;EACA,QAAA;EACA,SAAA;EACA,aAAA;EAEA,aAAA;EACA,mBAAA;EACA,sBAAA;EACA,mBAAA;ALwcJ;AKvcI;EACI,YAAA;ALycR;AKtcI;EACI,eAAA;ALwcR;AKtcI;EACI,mBAAA;EAEA,eAAA;ALucR;AKrcI;EACI,uBAAA;ALucR;AKrcI;EACI,aAAA;EACA,6BAAA;EACA,kBAAA;EACA,UAAA;ALucR;AKtcQ;EACI,iBAAA;ALwcZ;;AKncA;EACI,uCAAA;EACA,YAAA;EACA,WAAA;EACA,gBAAA;EACA,kBAAA;EACA,YAAA;EACA,eAAA;EACA,QAAA;EACA,SAAA;EACA,aAAA;EACA,6BAAA;EACA,mBAAA;EACA,sBAAA;ALscJ;;AMruBA;EAGI,WAAA;EACA,cAAA;EACA,SAAA;EASA,aAAA;EAEA,eAAA;EACA,kBAAA;EACA,UAAA;EACA,oBAAA;EACA,oBAAA;EACA,uCAAA;AN6tBJ;AExuBI;EIVJ;IAOQ,cAAA;IACA,WAAA;EN+uBN;AACF;AMluBI;EACI,iBAAA;ANouBR;AMluBI;EACI,yBAAA;ANouBR;AMluBI;EACI,YAAA;EACA,WAAA;EAIA,kBAAA;ANiuBR;AEzvBI;EIkBA;IAIQ,WAAA;ENuuBV;AACF;AMruBQ;EACI,WAAA;ANuuBZ;AEjwBI;EIyBI;IAGQ,WAAA;ENyuBd;AACF;AMvuBQ;EACI,iBAAA;EACA,iBAAA;EAIA,gBAAA;EACA,gBAAA;ANsuBZ;AE5wBI;EI+BI;IAIQ,iBAAA;EN6uBd;AACF;AMruBY;EACI,kBAAA;EACA,uBAAA;ANuuBhB;AMtuBgB;EACI,wBAAA;ANwuBpB;AMnuBI;EACI,WAAA;EAKA,aAAA;EACA,0BAAA;EACA,YAAA;ANiuBR;AE9xBI;EIqDA;IAGQ,WAAA;EN0uBV;AACF;AMruBQ;EACI,kBAAA;EACA,iBAAA;EAIA,WAAA;ANouBZ;AExyBI;EI8DI;IAIQ,iBAAA;EN0uBd;AACF;AMvuBQ;EACI,cAAA;EAEA,eAAA;ANwuBZ;AM/tBI;EACI,YAAA;EACA,WAAA;EAIA,cAAA;EACA,kBAAA;EACA,kBAAA;AN8tBR;AM7tBQ;EACI,iBAAA;EACA,cAAA;AN+tBZ;AM3tBI;EACI,WAAA;EAIA,kBAAA;EACA,YAAA;EACA,cAAA;EACA,eAAA;EACA,aAAA;EACA,8BAAA;AN0tBR;AEr0BI;EIiGA;IAGQ,WAAA;ENquBV;AACF;AM9tBQ;EACI,eAAA;ANguBZ;AM/tBY;EACI,iBAAA;ANiuBhB;AM/tBY;EACI,YAAA;ANiuBhB;AM9tBQ;EACI,cAAA;EACA,cAAA;ANguBZ;AM/tBY;EACI,iBAAA;EACA,mBAAA;ANiuBhB;AM/tBY;EACI,UAAA;ANiuBhB;AM9tBQ;EACI,kBAAA;EACA,SAAA;EACA,WAAA;EACA,iBAAA;EACA,aAAA;EACA,uBAAA;ANguBZ;;AOn3BA;EACE,kCAAA;APs3BF;;AOn3BA;EACI,gBAAA;EACA,kBAAA;EACA,YAAA;EACA,eAAA;EACA,MAAA;EACA,OAAA;EACA,QAAA;EACA,SAAA;EACA,wCAAA;EACA,kBAAA;EACA,UAAA;EACA,sBAAA;EACA,yDAAA;EACA,sBAAA;APs3BJ;AOp3BI;EACE,iBAAA;EACA,cAAA;EACA,eAAA;EACA,kBAAA;EACA,aAAA;EACA,mBAAA;APs3BN;AOn3BI;EACE,iBAAA;APq3BN;AOl3BI;EACE,SAAA;APo3BN;AOj3BI;EACE,qCAAA;APm3BN;AOh3BI;EACE,qBAAA;EACA,iBAAA;EAEF,yBAAA;APi3BJ;AO32BI;EACE,mBAAA;EACA,UAAA;EACA,mBAAA;AP62BN;AO12BI;EACE,oBAAA;EACA,gBAAA;EAEA,eAAA;EACA,eAAA;EACA,6BAAA;AP22BN;AOx2BI;EAIE,iBAAA;EACA,eAAA;EACA,oBAAA;EACA,iCAAA;EAEA,yBAAA;EACA,gBAAA;APs2BN;AO31BI;EACE,UAAA;AP61BN;AO11BI;EACE,iBAAA;AP41BN;;AOx1BE;EACE,UAAA;EACA,sBAAA;EACA,YAAA;EACA,eAAA;EACA,SAAA;EACA,6BAAA;EACA,eAAA;EACA,gBAAA;EACA,aAAA;EAEA,yBAAA;AP01BJ;;AOh1BE;EACE,gBAAA;APm1BJ;;AOh1BE;EACE,iBAAA;EACA,cAAA;EACA,eAAA;EACA,kBAAA;APm1BJ;;AO/0BE;EACE;IACE,UAAA;IACA,eAAA;EPk1BJ;AACF;AO/0BA;EACI;IAEE,uBAAA;EPi1BJ;EO/0BE;IAEE,yBAAA;EPi1BJ;AACF;AOz1BA;EACI;IAEE,uBAAA;EPi1BJ;EO/0BE;IAEE,yBAAA;EPi1BJ;AACF;AO90BA;EACI,gBAAA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;EACA,wCAAA;EACA,uBAAA;EACA,0CAAA;EACA,kCAAA;APg1BJ;;AO50BI;EACE,YAAA;EACA,eAAA;EACA,iBAAA;AP+0BN;;AO30BE;EACE,uCAAA;AP80BJ;;AO30BE;EACE,0CAAA;AP80BJ;;AO30BE;EACE,gBAAA;AP80BJ;;AO30BE;EACE,gBAAA;AP80BJ;;AO30BE;EACE,kCAAA;AP80BJ;;AO30BE;EACE,0BAAA;AP80BJ;;AO50BE;EACE,iCAAA;AP+0BJ;;AO50BE;EACE,gBAAA;AP+0BJ;;AQjhCA;EACI,eAAA;EACA,QAAA;EACA,YAAA;ARohCJ;;ASn5BA;EACI,6BAAA;EACA,WAAA;EACA,kBAAA;ATs5BJ;ASr5BI;EACE,aAAA;EACA,cAAA;EACA,kCAAA;EACA,kBAAA;EACA,kBAAA;EACA,QAAA;EACA,kIAAA;UAAA,0HAAA;ATu5BN;ASr5BI;EACE,kBAAA;ATu5BN;ASr5BI;EACE,kBAAA;EACA,UAAA;EACA,SAAA;EACA,QAAA;EACA,iBAAA;EACA,yBAAA;EACA,6BAAA;ATu5BN;ASr5BI;EAEI,aAAA;EACA,cAAA;EACA,oCAAA;EACA,gIAAA;UAAA,wHAAA;ATs5BR;ASp5BI;EACE,WAAA;EACA,UAAA;EACA,gDAAA;EACA,uDAAA;UAAA,+CAAA;ATs5BN;;ASl5BA;EACE;IAAG,YAAA;ETs5BH;ESr5BA;IAAI,aAAA;ETw5BJ;ESv5BA;IAAK,UAAA;ET05BL;AACF;;AS95BA;EACE;IAAG,YAAA;ETs5BH;ESr5BA;IAAI,aAAA;ETw5BJ;ESv5BA;IAAK,UAAA;ET05BL;AACF;ASx5BA;EACE;IACE,SAAA;ET05BF;ESx5BA;IACE,SAAA;ET05BF;AACF;ASh6BA;EACE;IACE,SAAA;ET05BF;ESx5BA;IACE,SAAA;ET05BF;AACF;ASx5BA;EACE;IACE,wCAAA;ET05BF;ESx5BA;IACE,0CAAA;ET05BF;ESx5BA;IACE,0CAAA;ET05BF;AACF;ASn6BA;EACE;IACE,wCAAA;ET05BF;ESx5BA;IACE,0CAAA;ET05BF;ESx5BA;IACE,0CAAA;ET05BF;AACF;ASv5BA;EACE;IACE,SAAA;ETy5BF;ESv5BA;IACE,SAAA;ETy5BF;AACF;AS/5BA;EACE;IACE,SAAA;ETy5BF;ESv5BA;IACE,SAAA;ETy5BF;AACF;ASv5BA;EACE;IACE,kCAAA;ETy5BF;ESv5BA;IACE,kCAAA;ETy5BF;ESv5BA;IACE,mCAAA;ETy5BF;AACF;ASl6BA;EACE;IACE,kCAAA;ETy5BF;ESv5BA;IACE,kCAAA;ETy5BF;ESv5BA;IACE,mCAAA;ETy5BF;AACF;AU9mCA;EACI,aAAA;EACA,SAAA;EAKA,UAAA;EACA,UAAA;EAEA,wCAAA;EACA,kBAAA;EACA,aAAA;EACA,mBAAA;EACA,2BAAA;EAIA,gBAAA;AVwmCJ;AE/mCI;EQXJ;IAIQ,WAAA;IACA,SAAA;EV0nCN;AACF;AErnCI;EQXJ;IAgBY,8BAAA;EVonCV;AACF;AUlnCI;EACI,cAAA;AVonCR;AE7nCI;EQQA;IAGQ,aAAA;EVsnCV;AACF;AUpnCI;EACI,mBAAA;AVsnCR;AUpnCI;EACI,kBAAA;AVsnCR;AUnnCI;EACI,aAAA;EACA,uCAAA;EACA,iBAAA;EACA,kEAAA;EACA,eAAA;EACA,UAAA;EACA,WAAA;EACA,gBAAA;EACA,2EAAA;AVqnCR;AUjnCI;EACI,iDAAA;UAAA,yCAAA;AVmnCR;AUjnCI;EACI,kDAAA;UAAA,0CAAA;AVmnCR;AUjnCI;EACI;IACI,UAAA;EVmnCV;EUjnCM;IACI,UAAA;EVmnCV;AACF;AUznCI;EACI;IACI,UAAA;EVmnCV;EUjnCM;IACI,UAAA;EVmnCV;AACF;AUjnCI;EACI;IACI,UAAA;EVmnCV;EUjnCM;IACI,UAAA;EVmnCV;AACF;AUznCI;EACI;IACI,UAAA;EVmnCV;EUjnCM;IACI,UAAA;EVmnCV;AACF;AUjnCI;EACI,aAAA;EAUA,oBAAA;AV0mCR;AE7qCI;EQwDA;IAGQ,kBAAA;IACA,aAAA;IACA,2EAAA;IAGA,6CAAA;IACA,iBAAA;EVonCV;AACF;AUlnCQ;EACI,oCAAA;EACA,aAAA;EACA,kBAAA;EACA,uFAAA;EAUA,WAAA;AV2mCZ;AE7rCI;EQoEI;IAOQ,yFAAA;EVsnCd;AACF;AU/mCY;EACI,iBAAA;AVinChB;AErsCI;EQmFQ;IAGQ,iBAAA;EVmnClB;AACF;AUjnCY;EACI,oBAAA;AVmnChB;AUlnCgB;EACI,UAAA;AVonCpB;AUjnCY;EACI,qBAAA;AVmnChB;AUjnCY;EACI,kBAAA;AVmnChB;AUjnCY;EACI,qBAAA;AVmnChB;AUjnCY;EACI,qBAAA;AVmnChB;AUjnCoB;EACI,aAAA;EACA,SAAA;AVmnCxB;AUpmCY;EACI,oBAAA;AVsmChB;AUrmCgB;EAEI,kBAAA;AVsmCpB;AU/lCQ;EACI,wBAAA;EACA,aAAA;EACA,wKAAA;AVimCZ;AU5lCY;EACI,oBAAA;AV8lChB;AU5lCY;EACI,iBAAA;EAIA,gBAAA;AV2lChB;AElvCI;EQkJQ;IAGQ,iBAAA;EVimClB;AACF;AU9lCY;EACI,qBAAA;AVgmChB;AU/lCgB;EACI,oBAAA;EACA,sBAAA;AVimCpB;AU7lCY;EACI,uBAAA;AV+lChB;AU7lCY;EACI,wBAAA;AV+lChB;AU7lCY;EACI,wBAAA;AV+lChB;AU7lCY;EACI,uBAAA;AV+lChB;AU7lCY;EACI,6BAAA;AV+lChB;AU1lCY;EACI,oBAAA;AV4lChB;AU3lCgB;EACI,UAAA;AV6lCpB;AUzlCQ;EACI,iBAAA;AV2lCZ;AEtxCI;EQ0LI;IAGQ,kBAAA;EV6lCd;AACF;AU3lCQ;EACI,oBAAA;AV6lCZ;AU3lCQ;EACI,kBAAA;EAIA,mBAAA;AV0lCZ;AElyCI;EQmMI;IAGQ,iBAAA;EVgmCd;AACF;AU7lCQ;EACI,oBAAA;EACA,UAAA;AV+lCZ;AU7lCQ;EACI,eAAA;AV+lCZ;AU7lCQ;EACI,iBAAA;AV+lCZ;AU7lCQ;EACI,iBAAA;EACA,qBAAA;AV+lCZ;AU5lCI;EACI,cAAA;EAKA,aAAA;EACA,8BAAA;EACA,uCAAA;AV0lCR;AUzlCQ;EACI,aAAA;EACA,iDAAA;EACA,+BAAA;EAKA,8CAAA;AVulCZ;AEj0CI;EQkOI;IAKQ,wCAAA;IACA,4BAAA;EV8lCd;AACF;AU5lCY;EACI,aAAA;EACA,iBAAA;EACA,aAAA;EACA,uBAAA;EACA,mBAAA;AV8lChB;AU5lCY;EACI,iBAAA;EAIA,eAAA;EACA,uCAAA;EACA,mBAAA;EACA,gBAAA;AV2lChB;AEr1CI;EQkPQ;IAGQ,iBAAA;EVomClB;AACF;AU9lCY;EACI,aAAA;AVgmChB;AE71CI;EQ4PQ;IAGQ,aAAA;EVkmClB;AACF;AU5lCY;EACI,aAAA;AV8lChB;AU7lCgB;EACI,qBAAA;EACA,oBAAA;AV+lCpB;AU1lCQ;EACI,qBAAA;EACA,mBAAA;EACA,cAAA;AV4lCZ;AU1lCQ;EACI,kBAAA;AV4lCZ;AUzlCY;EACI,aAAA;EACA,oBAAA;AV2lChB;AUzlCY;EACI,kBAAA;EAKA,cAAA;AVulChB;AEz3CI;EQ4RQ;IAGQ,iBAAA;EV8lClB;AACF;AU3lCgB;EACI,YAAA;EACA,cAAA;EACA,YAAA;EACA,WAAA;AV6lCpB;AU3lCgB;EACI,WAAA;EACA,gBAAA;AV6lCpB;AU3lCgB;EACI,mBAAA;AV6lCpB;AE34CI;EQ6SY;IAGQ,mBAAA;EV+lCtB;AACF;AU7lCgB;EACI,YAAA;EACA,aAAA;AV+lCpB;AU3lCgB;EACI,uBAAA;AV6lCpB;AU5lCoB;EACI,eAAA;AV8lCxB;AU5lCoB;EACI,aAAA;AV8lCxB;AUxlCI;EAEI,iBAAA;AVylCR;AUvlCI;EAGI,WAAA;AVulCR;AUrlCQ;EACI,aAAA;EACA,oBAAA;AVulCZ;AUrlCQ;EACI,aAAA;EACA,mBAAA;EACA,uBAAA;AVulCZ;AUrlCgB;EACI,eAAA;EACA,iBAAA;EACA,mBAAA;AVulCpB;AUrlCgB;EACI,oBAAA;AVulCpB;AUrlCgB;EACI,UAAA;AVulCpB;;AU7kCA;EACI,aAAA;EACA,uBAAA;EACA,qBAAA;EACA,uCAAA;EACA,YAAA;EACA,WAAA;EACA,eAAA;EACA,MAAA;AVglCJ;AU/kCI;EACI,UAAA;EACA,mBAAA;EACA,aAAA;EACA,uBAAA;EACA,qBAAA;OAAA,gBAAA;EACA,mBAAA;AVilCR;AUhlCQ;EACI,iBAAA;AVklCZ;AUhlCQ;EACI,eAAA;EACA,mBAAA;AVklCZ;;AU7kCA;EACI,aAAA;AVglCJ;;AEr9CI;EQwYJ;IAEQ,aAAA;EVglCN;AACF;;AU7kCA;EACI,iBAAA;EACA,cAAA;EACA,YAAA;AVglCJ;AEj+CI;EQ8YJ;IAKQ,kBAAA;IACA,cAAA;IACA,YAAA;EVklCN;AACF;;AW/+CA;EACI,aAAA;EAGA,eAAA;EACA,uCAAA;EACA,OAAA;EACA,WAAA;EACA,WAAA;EACA,UAAA;AXg/CJ;AW9+CI;EAGI,iBAAA;EACA,kBAAA;EACA,SAAA;EAMA,YAAA;EACA,eAAA;AXy+CR;AEz/CI;ESIA;IAcQ,SAAA;IACA,iBAAA;IACA,YAAA;IACA,aAAA;EX2+CV;AACF;AWz+CQ;EACI,WAAA;EACA,YAAA;AX2+CZ;AWz+CQ;EACI,aAAA;EACA,uBAAA;EACA,mBAAA;EACA,kBAAA;EACA,YAAA;EACA,WAAA;AX2+CZ;AW1+CY;EACI,YAAA;EACA,WAAA;EACA,yCAAA;EACA,kBAAA;EACA,kBAAA;EACA,eAAA;EACA,aAAA;EACA,uBAAA;EACA,mBAAA;EACA,6BAAA;AX4+ChB;AW3+CgB;EACI,0CAAA;EACA,oCAAA;EACA,uCAAA;AX6+CpB;AW1+CY;EACI,YAAA;AX4+ChB;AWl+CI;EACI,aAAA;EACA,uBAAA;EACA,mBAAA;AXo+CR;AWj+CI;EACI,aAAA;EACA,sBAAA;EACA,kBAAA;EACA,WAAA;EACA,cAAA;EACA,WAAA;EACA,SAAA;AXm+CR;AWl+CQ;EACI,iBAAA;EACA,aAAA;AXo+CZ;AWn+CY;EACI,YAAA;EACA,iBAAA;EACA,eAAA;AXq+ChB;AWn+CY;EACI,qBAAA;EACA,oBAAA;AXq+ChB;AWj+CQ;EACI,UAAA;EACA,gBAAA;EACA,aAAA;EACA,sBAAA;EACA,cAAA;AXm+CZ;AWl+CY;EACI,aAAA;EACA,gBAAA;EACA,WAAA;AXo+ChB;AWn+CgB;EACI,UAAA;EACA,eAAA;AXq+CpB;AWn+CgB;EACI,qBAAA;EACA,oBAAA;AXq+CpB;AWn+CgB;EACI,aAAA;EACA,sBAAA;EACA,iBAAA;EACA,UAAA;AXq+CpB;AWp+CoB;EACI,SAAA;EACA,YAAA;AXs+CxB;AWp+CoB;EACI,gBAAA;AXs+CxB;AWh+CQ;EACI,kBAAA;EACA,gBAAA;EACA,WAAA;EACA,aAAA;EACA,uBAAA;EACA,mBAAA;AXk+CZ;AWj+CY;EACI,iBAAA;EACA,iBAAA;AXm+ChB;AW99CI;EACI,kBAAA;EACA,YAAA;EACA,YAAA;EACA,WAAA;EACA,iBAAA;EAMA,eAAA;AX29CR;AEjnDI;ES2IA;IAOQ,YAAA;IACA,WAAA;IACA,iBAAA;EXm+CV;AACF;;AW79CI;EACI,uBAAA;EACA,eAAA;AXg+CR;AW99CI;EACI,qBAAA;EACA,eAAA;AXg+CR;;AY9oDA;EAAQ,WAAA;EAAW,eAAA;EAAe,sBAAA;EAAsB,aAAA;EAAa,YAAA;EAAY,QAAA;EAAQ,SAAA;EAAS,gBAAA;EAAgB,eAAA;AZ0pDlH;;AY1pDiI;EAA6B,sBAAA;EAAsB,aAAA;AZ+pDpL;;AY/pDiM;EAAkB,qCAAA;EAAiC,WAAA;EAAW,YAAA;EAAY,OAAA;EAAO,MAAA;AZuqDlR;;AYvqDwR;EAAiD,cAAA;AZ2qDzU;;AY3qDuV;EAAoB;IAAG,oBAAA;EZgrD5W;EYhrDgY;IAAG,yBAAA;EZmrDnY;AACF;;AYprDuV;EAAoB;IAAG,oBAAA;EZgrD5W;EYhrDgY;IAAG,yBAAA;EZmrDnY;AACF;AYprD+Z;EAAiB;IAAG,YAAA;EZwrDjb;EYxrD4b;IAAG,UAAA;EZ2rD/b;AACF;AY5rD4c;EAA0B,eAAA;EAAe,OAAA;EAAO,QAAA;EAAQ,mBAAA;EAAmB,yCAAA;EAAuC,kBAAA;EAAkB,WAAA;EAAW,eAAA;AZssD3lB;;AYtsD0mB;EAA6B,kBAAA;AZ0sDvoB;;AY1sDypB;EAA8C,wBAAA;AZ8sDvsB;;AY9sD+tB;EAAsC,qDAAA;UAAA,6CAAA;AZktDrwB;;AYltDkzB;EAAkC,qBAAA;AZstDp1B;;AYttDy2B;EAAsB,WAAA;EAAW,eAAA;EAAe,WAAA;EAAW,YAAA;EAAY,sBAAA;EAAsB,8BAAA;EAA8B,kBAAA;EAAkB,qBAAA;EAAqB,sBAAA;EAAsB,8CAAA;UAAA,sCAAA;AZmuDjiC;;AYnuDukC;EAAiC,+BAAA;AZuuDxmC;;AYvuDuoC;EAAoC,4BAAA;AZ2uD3qC;;AY3uDusC;EAA2C,WAAA;EAAW,eAAA;EAAe,kBAAA;EAAkB,iBAAA;EAAiB,8CAAA;UAAA,sCAAA;AZmvD/yC;;AYnvDq1C;EAAqB,WAAA;EAAW,YAAA;EAAY,kBAAA;EAAkB,8BAAA;EAA8B,qBAAA;EAAqB,sBAAA;AZ4vDt8C;;AY5vD49C;EAAsB,WAAA;EAAW,YAAA;EAAY,qBAAA;EAAqB,+BAAA;EAA+B,8BAAA;UAAA,sBAAA;EAAsB,qBAAA;EAAqB,sBAAA;AZswDxmD;;AYtwD8nD;EAA8B,qBAAA;EAAqB,WAAA;AZ2wDjrD;;AY3wD4rD;EAAkB,WAAA;EAAW,eAAA;EAAe,QAAA;EAAQ,SAAA;EAAS,YAAA;EAAY,YAAA;EAAY,gCAAA;EAA+B,oHAAA;EAA6G,0BAAA;EAA0B,+EAAA;EAAsE,+CAAA;AZyxD7/D;;AYzxD4iE;EAAgC,mBAAA;AZ6xD5kE;;AY7xD+lE;EAAgC,mCAAA;UAAA,2BAAA;AZiyD/nE;;AYjyD0pE;EAAmB;IAAG,wBAAA;EZsyD9qE;EYtyDssE;IAAG,8BAAA;EZyyDzsE;AACF;;AY1yD0pE;EAAmB;IAAG,wBAAA;EZsyD9qE;EYtyDssE;IAAG,8BAAA;EZyyDzsE;AACF;AY1yD0uE;EAA6B,YAAA;EAAY,sBAAA;AZ8yDnxE;;AY9yDyyE;EAAyD,WAAA;EAAW,YAAA;EAAY,kBAAA;EAAkB,qBAAA;EAAqB,uBAAA;AZszDh6E;;AYtzDu7E;EAA4B,WAAA;EAAW,sBAAA;EAAsB,iEAAA;UAAA,yDAAA;AZ4zDp/E;;AY5zD4iF;EAA2C,mBAAA;AZg0DvlF;;AYh0D0mF;EAA0C,kBAAA;EAAkB,WAAA;EAAW,8CAAA;UAAA,sCAAA;AZs0DjrF;;AYt0DutF;EAA2B;IAAG,uBAAA;EZ20DnvF;EY30D0wF;IAAG,sBAAA;EZ80D7wF;AACF;AY/0DuyF;EAAkC;IAAG,uBAAA;EZm1D10F;EYn1Di2F;IAAG,sBAAA;EZs1Dp2F;AACF;AYv1DuyF;EAAkC;IAAG,uBAAA;EZm1D10F;EYn1Di2F;IAAG,sBAAA;EZs1Dp2F;AACF;AYv1D83F;EAAmB;IAAG,WAAA;IAAW,YAAA;EZ41D75F;EY51Dy6F;IAAI,WAAA;IAAW,YAAA;IAAY,uBAAA;IAAuB,MAAA;EZk2D39F;EYl2Di+F;IAAI,YAAA;EZq2Dr+F;EYr2Di/F;IAAI,YAAA;IAAY,sBAAA;IAAsB,uBAAA;EZ02DvhG;EY12D8iG;IAAI,WAAA;EZ62DljG;EY72D6jG;IAAI,WAAA;IAAW,OAAA;IAAO,sBAAA;EZk3DnlG;EYl3DymG;IAAI,YAAA;EZq3D7mG;AACF;AYt3D83F;EAAmB;IAAG,WAAA;IAAW,YAAA;EZ41D75F;EY51Dy6F;IAAI,WAAA;IAAW,YAAA;IAAY,uBAAA;IAAuB,MAAA;EZk2D39F;EYl2Di+F;IAAI,YAAA;EZq2Dr+F;EYr2Di/F;IAAI,YAAA;IAAY,sBAAA;IAAsB,uBAAA;EZ02DvhG;EY12D8iG;IAAI,WAAA;EZ62DljG;EY72D6jG;IAAI,WAAA;IAAW,OAAA;IAAO,sBAAA;EZk3DnlG;EYl3DymG;IAAI,YAAA;EZq3D7mG;AACF;AYt3D4nG;EAAiC,WAAA;AZy3D7pG;;AYz3DwqG;EAAqB,WAAA;EAAW,kBAAA;EAAkB,MAAA;EAAM,OAAA;EAAO,WAAA;EAAW,YAAA;EAAY,sBAAA;EAAsB,gDAAA;UAAA,wCAAA;AZo4DpxG;;AYp4D4zG;EAAoB,WAAA;EAAW,kBAAA;EAAkB,WAAA;EAAW,YAAA;EAAY,QAAA;EAAQ,SAAA;EAAS,uBAAA;EAAuB,sBAAA;EAAsB,kBAAA;EAAkB,UAAA;EAAU,8DAAA;UAAA,sDAAA;AZk5D99G;;AYl5DohH;EAAiC,qDAAA;AZs5DrjH;;AYt5DsmH;EAAmB,WAAA;EAAW,kBAAA;EAAkB,oCAAA;EAAgC,kBAAA;EAAkB,WAAA;EAAW,YAAA;EAAY,qBAAA;EAAqB,SAAA;EAAS,qBAAA;EAAqB,UAAA;EAAU,6DAAA;UAAA,qDAAA;AZo6D5xH;;AYp6Di1H;EAAkB;IAAG,6BAAA;IAA6B,mBAAA;EZ06Dj4H;EY16Do5H;IAAI,6BAAA;IAA6B,mBAAA;EZ86Dr7H;EY96Dw8H;IAAI,qCAAA;IAAiC,mBAAA;EZk7D7+H;EYl7DggI;IAAG,qCAAA;IAAiC,mBAAA;EZs7DpiI;AACF;;AYv7Di1H;EAAkB;IAAG,6BAAA;IAA6B,mBAAA;EZ06Dj4H;EY16Do5H;IAAI,6BAAA;IAA6B,mBAAA;EZ86Dr7H;EY96Dw8H;IAAI,qCAAA;IAAiC,mBAAA;EZk7D7+H;EYl7DggI;IAAG,qCAAA;IAAiC,mBAAA;EZs7DpiI;AACF;AYv7D0jI;EAAoB;IAAG,yCAAA;EZ27D/kI;EY37DunI;IAAI,kBAAA;EZ87D3nI;EY97D6oI;IAAG,kCAAA;IAAkC,8BAAA;EZk8DlrI;AACF;AYn8D0jI;EAAoB;IAAG,yCAAA;EZ27D/kI;EY37DunI;IAAI,kBAAA;EZ87D3nI;EY97D6oI;IAAG,kCAAA;IAAkC,8BAAA;EZk8DlrI;AACF;AYn8DmtI;EAAyB,WAAA;EAAW,WAAA;EAAW,eAAA;EAAe,yCAAA;EAAuC,kBAAA;EAAkB,kBAAA;EAAkB,eAAA;EAAe,SAAA;EAAS,QAAA;EAAQ,WAAA;EAAW,aAAA;EAAa,uBAAA;EAAuB,sBAAA;EAAsB,mBAAA;EAAmB,gCAAA;EAAgC,0MAAA;EAAsL,8EAAA;UAAA,sEAAA;AZs9D1qJ;;AYt9DyuJ;EAAyC,kBAAA;AZ09DlxJ;;AY19DoyJ;EAA+C,0BAAA;AZ89Dn1J;;AY99D62J;EAAiB;IAAG,kCAAA;EZm+D/3J;EYn+D+5J;IAAI,iCAAA;EZs+Dn6J;EYt+Dk8J;IAAI,kCAAA;EZy+Dt8J;EYz+Ds+J;IAAI,iCAAA;EZ4+D1+J;EY5+DygK;IAAI,kCAAA;EZ++D7gK;EY/+D6iK;IAAI,iCAAA;EZk/DjjK;EYl/DglK;IAAI,kCAAA;EZq/DplK;EYr/DonK;IAAI,iCAAA;EZw/DxnK;EYx/DupK;IAAI,kCAAA;EZ2/D3pK;EY3/D2rK;IAAI,iCAAA;EZ8/D/rK;EY9/D8tK;IAAI,kCAAA;EZigEluK;AACF;;AYlgE62J;EAAiB;IAAG,kCAAA;EZm+D/3J;EYn+D+5J;IAAI,iCAAA;EZs+Dn6J;EYt+Dk8J;IAAI,kCAAA;EZy+Dt8J;EYz+Ds+J;IAAI,iCAAA;EZ4+D1+J;EY5+DygK;IAAI,kCAAA;EZ++D7gK;EY/+D6iK;IAAI,iCAAA;EZk/DjjK;EYl/DglK;IAAI,kCAAA;EZq/DplK;EYr/DonK;IAAI,iCAAA;EZw/DxnK;EYx/DupK;IAAI,kCAAA;EZ2/D3pK;EY3/D2rK;IAAI,iCAAA;EZ8/D/rK;EY9/D8tK;IAAI,kCAAA;EZigEluK;AACF;AYlgEqwK;EAAqB,YAAA;EAAY,aAAA;EAAa,kBAAA;EAAkB,uBAAA;EAAuB,kMAAA;EAAwL,wEAAA;EAAsE,8CAAA;UAAA,sCAAA;AZ2gE1lL;;AY3gEgoL;EAAyC,WAAA;EAAW,eAAA;EAAe,SAAA;EAAS,QAAA;EAAQ,gBAAA;AZmhEptL;;AYnhEouL;EAAoB,WAAA;EAAW,YAAA;EAAY,uBAAA;EAAuB,4BAAA;EAA4B,mOAAA;EAAyN,+CAAA;UAAA,uCAAA;EAAuC,6BAAA;AZ6hElkM;;AY7hE+lM;EAA6C,eAAA;EAAe,WAAA;EAAW,QAAA;EAAQ,iBAAA;EAAiB,eAAA;EAAe,kBAAA;EAAkB,yCAAA;EAAuC,gBAAA;EAAgB,gBAAA;EAAgB,kBAAA;AZ0iEvyM;;AY1iEyzM;EAAuB,WAAA;AZ8iEh1M;;AY9iE21M;EAAsB,WAAA;EAAW,SAAA;EAAS,4DAAA;UAAA,oDAAA;AZojEr4M;;AYpjEy7M;EAA2I,gCAAA;AZwjEpkN;;AYxjEomN;EAAuC,cAAA;AZ4jE3oN;;AY5jEypN;EAAsC,cAAA;AZgkE/rN;;AYhkE6sN;EAAsC,iEAAA;UAAA,yDAAA;AZokEnvN;;AYpkE4yN;EAAqC,qHAAA;UAAA,6GAAA;EAA4G,WAAA;AZykE77N;;AYzkEw8N;EAAwB;IAAG,cAAA;EZ8kEj+N;EY9kE++N;IAAM,cAAA;EZilEr/N;EYjlEmgO;IAAM,cAAA;EZolEzgO;EYplEuhO;IAAG,cAAA;EZulE1hO;AACF;;AYxlEw8N;EAAwB;IAAG,cAAA;EZ8kEj+N;EY9kE++N;IAAM,cAAA;EZilEr/N;EYjlEmgO;IAAM,cAAA;EZolEzgO;EYplEuhO;IAAG,cAAA;EZulE1hO;AACF;AYxlE2iO;EAA8B;IAAG,cAAA;EZ4lE1kO;EY5lEwlO;IAAM,cAAA;EZ+lE9lO;EY/lE4mO;IAAM,cAAA;EZkmElnO;EYlmEgoO;IAAG,cAAA;EZqmEnoO;AACF;AYtmE2iO;EAA8B;IAAG,cAAA;EZ4lE1kO;EY5lEwlO;IAAM,cAAA;EZ+lE9lO;EY/lE4mO;IAAM,cAAA;EZkmElnO;EYlmEgoO;IAAG,cAAA;EZqmEnoO;AACF;AYtmEopO;EAAmB;IAAG,SAAA;EZ0mExqO;EY1mEirO;IAAG,YAAA;EZ6mEprO;AACF;AY9mEopO;EAAmB;IAAG,SAAA;EZ0mExqO;EY1mEirO;IAAG,YAAA;EZ6mEprO;AACF;AY9mEmsO;EAAyC,WAAA;EAAW,eAAA;EAAe,YAAA;EAAY,aAAA;EAAa,QAAA;EAAQ,SAAA;EAAS,yBAAA;EAAyB,kBAAA;EAAkB,kBAAA;EAAkB,kBAAA;EAAkB,WAAA;EAAW,eAAA;EAAe,yCAAA;EAAuC,yCAAA;EAAqC,oBAAA;AZ+nEr+O;;AY/nEy/O;EAAoB,mCAAA;UAAA,2BAAA;AZmoE7gP;;AYnoEwiP;EAAmE,sBAAA;AZuoE3mP;;AYvoEioP;EAAkC,sBAAA;EAAsB,WAAA;EAAW,kFAAA;UAAA,0EAAA;AZ6oEpsP;;AY7oE6wP;EAAiC,sBAAA;EAAsB,yEAAA;UAAA,iEAAA;AZkpEp0P;;AYlpEo4P;EAAmE,4DAAA;EAA0D,2BAAA;AZupEjgQ;;AYvpE4hQ;EAAkC,mFAAA;UAAA,2EAAA;AZ2pE9jQ;;AY3pEwoQ;EAAiC,wEAAA;UAAA,gEAAA;AZ+pEzqQ;;AY/pEwuQ;EAAkC,wFAAA;UAAA,gFAAA;EAA+E,kEAAA;AZoqEz1Q;;AYpqEy5Q;EAAiC,2EAAA;UAAA,mEAAA;EAAkE,kEAAA;AZyqE5/Q;;AYzqE4jR;EAAoC,uFAAA;UAAA,+EAAA;EAA8E,gBAAA;AZ8qE9qR;;AY9qE8rR;EAAmC,4EAAA;UAAA,oEAAA;EAAmE,mBAAA;AZmrEpyR;;AYnrEuzR;EAAgB;IAAG,0BAAA;EZwrEx0R;AACF;;AYzrEuzR;EAAgB;IAAG,0BAAA;EZwrEx0R;AACF;AYzrEq2R;EAAoB;IAAG,0BAAA;EZ6rE13R;EY7rEo5R;IAAI,yBAAA;EZgsEx5R;EYhsEi7R;IAAG,0BAAA;EZmsEp7R;AACF;AYpsEq2R;EAAoB;IAAG,0BAAA;EZ6rE13R;EY7rEo5R;IAAI,yBAAA;EZgsEx5R;EYhsEi7R;IAAG,0BAAA;EZmsEp7R;AACF;AYpsEi9R;EAAe;IAAG,eAAA;EZwsEj+R;EYxsEg/R;IAAI,iBAAA;EZ2sEp/R;EY3sEqgS;IAAG,eAAA;EZ8sExgS;AACF;AY/sEi9R;EAAe;IAAG,eAAA;EZwsEj+R;EYxsEg/R;IAAI,iBAAA;EZ2sEp/R;EY3sEqgS;IAAG,eAAA;EZ8sExgS;AACF;AY/sE0hS;EAAc;IAAG,cAAA;EZmtEziS;EYntEujS;IAAI,cAAA;EZstE3jS;EYttEykS;IAAG,cAAA;EZytE5kS;AACF;AY1tE0hS;EAAc;IAAG,cAAA;EZmtEziS;EYntEujS;IAAI,cAAA;EZstE3jS;EYttEykS;IAAG,cAAA;EZytE5kS;AACF;AY1tE6lS;EAAc;IAAG,gBAAA;EZ8tE5mS;EY9tE4nS;IAAI,aAAA;EZiuEhoS;EYjuE6oS;IAAG,gBAAA;EZouEhpS;AACF;AYruE6lS;EAAc;IAAG,gBAAA;EZ8tE5mS;EY9tE4nS;IAAI,aAAA;EZiuEhoS;EYjuE6oS;IAAG,gBAAA;EZouEhpS;AACF;AYruEmqS;EAAe;IAAG,gBAAA;EZyuEnrS;EYzuEmsS;IAAI,eAAA;EZ4uEvsS;EY5uEstS;IAAG,gBAAA;EZ+uEztS;AACF;AYhvEmqS;EAAe;IAAG,gBAAA;EZyuEnrS;EYzuEmsS;IAAI,eAAA;EZ4uEvsS;EY5uEstS;IAAG,gBAAA;EZ+uEztS;AACF;AYhvE4uS;EAAiB;IAAG,iBAAA;EZovE9vS;EYpvE+wS;IAAI,iBAAA;EZuvEnxS;EYvvEoyS;IAAG,iBAAA;EZ0vEvyS;AACF;AY3vE4uS;EAAiB;IAAG,iBAAA;EZovE9vS;EYpvE+wS;IAAI,iBAAA;EZuvEnxS;EYvvEoyS;IAAG,iBAAA;EZ0vEvyS;AACF;AY3vE2zS;EAAoB;IAAG,qBAAA;EZ+vEh1S;EY/vEq2S;IAAI,wBAAA;EZkwEz2S;EYlwEi4S;IAAG,qBAAA;EZqwEp4S;AACF;AYtwE2zS;EAAoB;IAAG,qBAAA;EZ+vEh1S;EY/vEq2S;IAAI,wBAAA;EZkwEz2S;EYlwEi4S;IAAG,qBAAA;EZqwEp4S;AACF;AYtwE45S;EAAkB;IAAG,mBAAA;EZ0wE/6S;EY1wEk8S;IAAI,oBAAA;EZ6wEt8S;EY7wE09S;IAAG,mBAAA;EZgxE79S;AACF;AYjxE45S;EAAkB;IAAG,mBAAA;EZ0wE/6S;EY1wEk8S;IAAI,oBAAA;EZ6wEt8S;EY7wE09S;IAAG,mBAAA;EZgxE79S;AACF;AYjxEm/S;EAAmB;IAAG,kBAAA;EZqxEvgT;EYrxEyhT;IAAI,aAAA;EZwxE7hT;EYxxE8iT;IAAG,kBAAA;EZ2xEjjT;AACF;AY5xEm/S;EAAmB;IAAG,kBAAA;EZqxEvgT;EYrxEyhT;IAAI,aAAA;EZwxE7hT;EYxxE8iT;IAAG,kBAAA;EZ2xEjjT;AACF;AY5xEskT;EAAwB,WAAA;EAAW,kBAAA;EAAkB,YAAA;EAAY,aAAA;EAAa,QAAA;EAAQ,SAAA;EAAS,uBAAA;EAAuB,sEAAA;EAAkE,4BAAA;EAA4B,sBAAA;EAAsB,kBAAA;EAAkB,UAAA;EAAU,uDAAA;UAAA,+CAAA;AZ2yE50T;;AY3yE23T;EAAuB,WAAA;EAAW,kBAAA;EAAkB,WAAA;EAAW,YAAA;EAAY,QAAA;EAAQ,SAAA;EAAS,uBAAA;EAAuB,sBAAA;EAAsB,kBAAA;EAAkB,UAAA;EAAU,8FAAA;UAAA,sFAAA;EAAoF,sBAAA;EAAsB,2CAAA;AZ2zE1oU;;AY3zEorU;EAAwB;IAAG,kCAAA;EZg0E7sU;EYh0E+uU;IAAI,0CAAA;EZm0EnvU;EYn0E6xU;IAAI,wCAAA;EZs0EjyU;EYt0Ey0U;IAAI,kCAAA;EZy0E70U;AACF;;AY10EorU;EAAwB;IAAG,kCAAA;EZg0E7sU;EYh0E+uU;IAAI,0CAAA;EZm0EnvU;EYn0E6xU;IAAI,wCAAA;EZs0EjyU;EYt0Ey0U;IAAI,kCAAA;EZy0E70U;AACF;AY10Ek3U;EAAyB;IAAG,sBAAA;EZ80E54U;EY90Ek6U;IAAG,sBAAA;EZi1Er6U;AACF;AYl1Ek3U;EAAyB;IAAG,sBAAA;EZ80E54U;EY90Ek6U;IAAG,sBAAA;EZi1Er6U;AACF;AYl1E87U;EAA+C,WAAA;EAAW,WAAA;EAAW,YAAA;EAAY,kBAAA;EAAkB,qBAAA;EAAqB,sBAAA;EAAsB,kBAAA;EAAkB,sBAAA;EAAsB,+CAAA;UAAA,uCAAA;AZ61EpnV;;AY71E0pV;EAAuB,kBAAA;EAAkB,+CAAA;UAAA,uCAAA;AZk2EnsV;;AYl2EyuV;EAAwB,6BAAA;UAAA,qBAAA;AZs2EjwV;;AYt2EqxV;EAAgB;IAAG,UAAA;IAAU,wBAAA;EZ42EhzV;EY52Ew0V;IAAG,YAAA;IAAW,4BAAA;EZg3Et1V;AACF;;AYj3EqxV;EAAgB;IAAG,UAAA;IAAU,wBAAA;EZ42EhzV;EY52Ew0V;IAAG,YAAA;IAAW,4BAAA;EZg3Et1V;AACF;Aaj3EA;EACE,YAAA;EACA,WAAA;EACA,cAAA;EACA,kBAAA;EACA,kBAAA;EACA,qBAAA;EACA,QAAA;EACA,SAAA;Abm3EF;;Aaj3EE;EACE,WAAA;EACA,SAAA;EACA,QAAA;EACA,eAAA;EACA,iBAAA;EACA,sBAAA;EACA,kBAAA;EACA,SAAA;EACA,QAAA;EACA,mDAAA;UAAA,2CAAA;Abo3EJ;;Aan3EE;EACE,8BAAA;UAAA,sBAAA;Abs3EJ;;Aap3EA;EACE;IACE,SAAA;IACA,QAAA;IACA,YAAA;IACA,WAAA;Ebu3EF;Ear3EA;IACE,YAAA;IACA,WAAA;IACA,WAAA;IACA,UAAA;IACA,UAAA;Ebu3EF;AACF;;Aap4EA;EACE;IACE,SAAA;IACA,QAAA;IACA,YAAA;IACA,WAAA;Ebu3EF;Ear3EA;IACE,YAAA;IACA,WAAA;IACA,WAAA;IACA,UAAA;IACA,UAAA;Ebu3EF;AACF,CAAA,oCAAA","sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./css/dots.css":
/*!**********************!*\
  !*** ./css/dots.css ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_dots_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./dots.css */ "./node_modules/css-loader/dist/cjs.js!./css/dots.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_dots_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_dots_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_dots_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_dots_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./css/style.css":
/*!***********************!*\
  !*** ./css/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./css/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./src/modules/all-news.js":
/*!*********************************!*\
  !*** ./src/modules/all-news.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shadowBox__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shadowBox */ "./src/modules/shadowBox.js");
//Continue to work on making this more efficient and readable


class News {
    constructor(){
        // this.closeMediaButton = document.querySelector('#media-close');
    if(document.querySelector('#all-news-container')){
        this.viewPortHeight = window.innerHeight
        this.returnHome = document.querySelector('#return-home');
                 //Later, find way to make this not cause errors on other pages
        this.mainContainer = document.querySelector('#all-news-container');
        this.newsReciever = document.querySelector('#main-display');
        this.paginationHolder = document.querySelector('#pagination-holder')
        this.relationshipLinks;
        this.seeMore;
        this.allOptions = document.querySelector('#filters-and-links-container')
        this.optionsButton = document.querySelectorAll('.options-switch');
        this.allOptionsVisible = false;
        this.dismissButton = document.querySelector('#dismiss-selection');

        this.contentPageOptions;

        this.initialTitle = "All News";
        this.storedTitle;
        this.fullDisplayContent = [];
        this.calledIds = [];
        this.externalCall = false;
        this.backgroundCall = false;
        this.origin;

        this.currentPages = 0;
        this.contentLoaded = false;

        this.mainHeader = document.querySelector('#main-header');

        this.newsSearch = document.querySelector("#news-search")
        this.newsDelivery = '';
        this.isSpinnerVisible = false
        this.previousValue = "";
        this.typingTimer;

        this.newsSearchCloneContainer = document.querySelector('#mobile-typing-container');
        this.newsSearchClone = this.newsSearchCloneContainer.querySelector('input');
        this.closeNewsSearchClone = document.querySelector('#close-mobile-news-search');

        this.currentReport;      
        this.fullDisplayContainer = document.querySelector('#full-display-container');    
        this.fullDisplay = false;

        this.resetAll = document.getElementById('reset-all');

        this.toggleOptions = document.querySelectorAll('.toggle-options');

        //After get everything working, put the setting in here, rarer than just a ref
        //nvm. Need to do it now
        
        this.reorderByDate = document.querySelector('#order-by-date');
        this.reorderByAlpha = document.querySelector('#order-by-alpha');

        this.fullWordSwitch = document.querySelector('#full-word-only');

        this.wordSearchPosition = document.querySelector('#word-start-only');

        this.caseSensitiveSwitch = document.querySelector('#case-sensitive');

        this.includeTitle = document.querySelector('#include-title');
        this.includeDescription = document.querySelector('#include-description');

        this.includePropertyUpdates = document.querySelector('#include-property-updates');
        this.includeGeneralNews = document.querySelector('#include-general-news');

        this.toggableSettings = {
            dateOrder:{
                ref: 'order-by-date',
                directive: 'desc',
                isOn: true
            },
            alphaOrder:{
                ref: 'order-by-alpha',
                directive: 'desc',
                isOn: false
            },
            includeTitle: {
                ref: 'include-title',
                directive: 'include',
                isOn: true
            },
            includeDescription: {
                ref: 'include-description',
                directive: 'include',
                isOn: true
            },
            update: {
                ref: 'include-property-updates',
                directive: 'include',
                isOn: true
            },
            news: {
                ref: 'include-general-news',
                directive: 'include',
                isOn: true
            },
            fullWord: {
                ref: 'full-word-only',
                directive: 'full-word-only',
                isOn: false
            },
            wordStartOnly: {
                ref: 'word-start-only',
                directive: 'word-start-only',
                isOn: false
            },
            isCaseSensitive: {
                ref: 'case-sensitive',
                directive: 'case-sensitive',
                isOn: false
            }
        }
        // this.filterBydate = document.querySelector('#filter-by-date')
        // this.isDateFilterOn = true;

        this.dateFilters = document.querySelector('#date-filters');
        this.dateFilterOptions = this.dateFilters.querySelectorAll('select');
        

        //range makes the previous two null, effectively canceling they out and shutting off their if logic
        //button will make options appear and make isFilterOn = true, but if no option is selected, they dissapear and false is restored 
        this.dateFilterSetUp = {
            month: null,
            year: null,
            // range: {
            //     start: null,
            //     end: null
            // }
        }

        this.yearOptions = document.querySelector('#by-year');
        this.monthOptions = document.querySelector('#by-month');

        
        this.yearList = {}
        this.months = [];

        let target = this.toggableSettings;
        this.events(target);
        }
       
    }

    events(target){
        window.addEventListener('resize', ()=>{
            setTimeout(()=>{
                if(window.innerWidth >= 1200){
                    this.allOptionsVisible = false;
                    this.allOptions.classList.remove('fade-in');
                    this.allOptions.classList.remove('fade-out');
                }
            }, 300)
        })
        // const defaultSwitchSettings = {...this.toggableSettings, alphaOrder: {...this.toggableSettings.alphaOrder}};
        let defaultSwitchSettings = JSON.parse(JSON.stringify(this.toggableSettings))

        this.gatherNews();

        this.populateDateFilters();

        this.resetAll.onclick = ()=>{
            this.toggleText(defaultSwitchSettings);
            this.toggableSettings = JSON.parse(JSON.stringify(defaultSwitchSettings));
            target = this.toggableSettings; 
            console.log(this.toggableSettings.dateOrder, target.dateOrder)
            this.wordSearchPosition.classList.remove('inactive');
            // console.log(defaultSwitchSettings.isCaseSensitive)
            // this.mainHeader.innerHTML = `${this.initialTitle}`;
            this.currentReport = '';
            this.contentLoaded = false;
            this.newsReciever.innerHTML = '<div class="spinner-loader"></div>';
            this.isSpinnerVisible = true;
            this.newsSearch.value = '';
            this.newsDelivery = '';
            this.dismissSelection();
            this.fullDisplay = false;
            // this.mediaContainer.innerHTML = '';
            this.gatherNews();
            this.yearOptions.value = ''
            this.monthOptions.value = ''
            this.yearOptions.dispatchEvent(new Event('change'));
            this.monthOptions.dispatchEvent(new Event('change'));
            // console.log(year.options[year.selectedIndex].value)
        }
        //desc date not working
        this.reorderByDate.onclick = ()=>{
            console.log(this.toggableSettings.dateOrder)
            target.alphaOrder.isOn = false
            target.alphaOrder.directive = 'desc'
            
            target.dateOrder.isOn = true

            if(target.dateOrder.directive === 'desc'){
                target.dateOrder.directive = 'asc'
            }else(
                target.dateOrder.directive = 'desc'
            )
            this.gatherNews();
        };
//iniate toggle through these, using lets to handle both changes based on the .directive value, 
//and maybe even setting intial hiding this way too 
        this.reorderByAlpha.onclick = ()=>{
            target.dateOrder.isOn = false
            target.dateOrder.directive = 'desc'
            
            target.alphaOrder.isOn = true

            if(target.alphaOrder.directive === 'desc'){
                target.alphaOrder.directive = 'asc'
            }else(
                target.alphaOrder.directive = 'desc'
            )
            this.gatherNews();
        };

        this.includePropertyUpdates.onclick = ()=>{
            if(target.update.isOn === true){
                target.update.isOn = false;
            }else{
                target.update.isOn = true;
            }  
            this.contentLoaded = false;
            this.gatherNews()
        };

        this.includeGeneralNews.onclick = ()=>{
            if(target.news.isOn === true){
                target.news.isOn = false;
            }else{
                target.news.isOn = true;
            } 
            this.contentLoaded = false;
            this.gatherNews()
        };

        this.fullWordSwitch.onclick = ()=>{

            if(target.fullWord.isOn){
                target.fullWord.isOn = false;
                this.wordSearchPosition.classList.remove('inactive');
            }else{            
                target.fullWord.isOn = true;
                target.wordStartOnly.isOn = false;
                this.wordSearchPosition.classList.add('inactive');
            } 
            console.log(`word start only is: ${target.wordStartOnly.isOn}`)
            console.log(`full word only is: ${target.fullWord.isOn}`)
        }

        this.wordSearchPosition.onclick = ()=>{
            if(target.wordStartOnly.isOn){
                target.wordStartOnly.isOn = false;
            }else{
                target.wordStartOnly.isOn = true;
            } 
            console.log(`word start only is: ${target.wordStartOnly.isOn}`)
        }

        this.caseSensitiveSwitch.onclick = ()=>{
            if(target.isCaseSensitive.isOn){
                target.isCaseSensitive.isOn = false;
            }else{
                target.isCaseSensitive.isOn = true;
            } 
            console.log(`case sensitive is: ${target.isCaseSensitive.isOn}`)
        }

        this.includeTitle.onclick = ()=>{
            if(target.includeTitle.isOn){
                target.includeTitle.isOn = false;
            }else{
                target.includeTitle.isOn = true;
            } 
        };

        this.includeDescription.onclick = ()=>{
            if(target.includeDescription.isOn){
                target.includeDescription.isOn = false;
            }else{
                target.includeDescription.isOn = true;
            } 
        };

        // this.includeRelationship.onclick = ()=>{
        //     if(this.searchableFields.relationships){
        //         this.searchableFields.relationships = false;
        //     }else{
        //         this.searchableFields.relationships = true;
        //     }  
        // };

        // this.filterBydate.onclick = ()=>{
        //     this.dateFilters.classList.remove('dismissed');
        //     this.isDateFilterOn = true;
        //     console.log(this.isDateFilterOn)
        // }

        this.dateFilterOptions.forEach(e =>{
            e.addEventListener('change', (option)=>{
                let currentMonth = this.monthOptions.value;

                if(e.id === 'by-year'){
                    
                        if(this.yearOptions.value !== ''){
                            this.monthOptions.innerHTML = `
                            <option value="">Any</option>
                            ${this.yearList[this.yearOptions.value].map(month=> `<option value="${month}">${month}</option>`).join('')}
                            `;
                        }else{
                            this.monthOptions.innerHTML = `
                                <option value="">Any</option>
                                ${this.months.map(month=> `<option value="${month}">${month}</option>`).join('')}
                            `
                        }

                        if(this.monthOptions.querySelector(`option[value='${currentMonth}']`)){
                            this.monthOptions.value = currentMonth;
                            this.monthOptions.dispatchEvent(new Event('change'));
                        }else{
                            this.monthOptions.value = ''
                            this.monthOptions.dispatchEvent(new Event('change'));
                        }
                }
                let value = option.target.id.slice(3);
                this.dateFilterSetUp[value] = option.target.value;
                // console.log(this.dateFilterSetUp)

                this.contentLoaded = false;
               
                this.gatherNews()
            })
        })

        this.newsSearch.addEventListener('keyup', () => this.typingLogic())
        this.optionsButton.forEach(e=>{e.addEventListener('click', () => this.toggleAllOptions())})
        this.dismissButton.addEventListener('click', () => this.dismissSelection())

        this.newsSearchClone.addEventListener('keyup', () => this.simuTyping());
        //considering change layout of options as alt to clone
        this.newsSearch.addEventListener('focusin', ()=> this.openClone());
        this.closeNewsSearchClone.addEventListener('click', ()=> this.closeClone());

        this.toggleText(target);
        this.toggleOptions.forEach(e=>{e.addEventListener('click', ()=> this.toggleText(target))})
    }
//Add 'isOn' to excludes, with include having class off and exclude having class of *value?
    toggleText(target){
        let filterKeys = Object.keys(target)
        filterKeys.forEach(e=>{
            document.querySelectorAll(`#${target[e].ref} span`).forEach(i=>i.classList.add('hidden'))
            if(target[e].isOn){
                document.querySelector(`#${target[e].ref} .${target[e].directive}`).classList.remove('hidden');
            }else{
                document.querySelector(`#${target[e].ref} .off`).classList.remove('hidden');
            }
        })
    }

    //Redo pagination, but will need to have setup work for getting rid through each reload
    
    //check pagination throughout each add

    //establish default search behavior. As in, does it look at title, bio, 
    //and caption partials at the start?(in if statements use contains on strings?)
    //in gatherNews() have if statements that work through the data after it's gotten, before the insertions
    //When click on news, use bigger picture. Also put in dummy, 
    //related sites on the right, and maybe even related members and properties(title over and with links)
    //Also list other news related to it, like if all about same building or member(can use cmmon relation for that but 
    //need to add a new field for types of relationships)
    //Give titles to other sections, with the right being divided into related links and search modifications
    //Remember functionality for other parts linking to here
    typingLogic() {
        //Automatically dismiss single or have this and other buttons frozen and/or hidden until dismissed
        //Leaning towards the latter, as far less complicated
        if (this.newsSearch.value !== this.previousValue) {
            this.fullDisplay = false;
            this.dismissSelection();
            this.contentLoaded = false;
            clearTimeout(this.typingTimer)
    
          if (this.newsSearch.value) {
            if (!this.isSpinnerVisible) {
              this.newsReciever.innerHTML = '<div class="spinner-loader"></div>'
              this.isSpinnerVisible = true
            }
            this.newsDelivery = this.newsSearch.value;
            this.mainHeader.innerHTML = `Showing Results for: ${this.newsDelivery}`;
            this.currentPages = 0;
            this.typingTimer = setTimeout(this.gatherNews.bind(this), 750);
          } else {
            this.newsDelivery = "";
            this.mainHeader.innerHTML = `${this.initialTitle}`;
            this.isSpinnerVisible = false;
            
            this.gatherNews()
          }
        }
    
        this.previousValue = this.newsSearch.value
      }

      openClone(){
        this.newsSearchCloneContainer.classList.add('opened');
        this.newsSearchClone.focus();
      }

      closeClone(){
        this.newsSearchCloneContainer.classList.remove('opened');
      }

      simuTyping(){
        this.newsSearch.value = this.newsSearchClone.value;
        this.typingLogic()
      }

      keyPressDispatcher(e) {
            if (e.keyCode == 83 && !this.isOverlayOpen && document.activeElement.tagName != "INPUT" && document.activeElement.tagName != "TEXTAREA") {
                this.openClone();
            }

            if(e.keyCode === 27 && this.isOverlayOpen){
                this.closeClone();
            }
        }

      async populateDateFilters(){
        try{
            //Is it better just to use seperate url routes? 
            const response = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(siteData.root_url + '/wp-json/cah/v1/all-news?news'); 
            const results = response.data;

            const dates = [];
            const splitDates = [];
            // const years = [];

            console.log(results)

            results.updatesAndNews.forEach(news=>{
                if (!dates.includes(new Date(news.date).toLocaleDateString('en-us', {month: 'long', year: 'numeric'}))) {
                    dates.push(new Date(news.date).toLocaleDateString('en-us', {month: 'long', year: 'numeric'}));
                }
            })
            // console.log(dates)

            dates.forEach(e=>{
                splitDates.push(e.split(' '))
            })

            console.log(splitDates)

            splitDates.forEach(date=>{

                if(!this.months.includes(date[0])){
                    this.months.push(date[0]);
                }
                
                // if(!years.includes(date[1])){
                    // years.push(date[1])
                    this.yearList[date[1]] = [];
                // }

            })

            const years = Object.keys(this.yearList)

            years.forEach(year=>{
                splitDates.forEach(date=>{
                    if(year === date[1]){
                        this.yearList[year].push(date[0]);
                    }
                })
            })
            
            console.log(this.yearList)

            let allMonths = ['January','February','March', 'April','May','June','July','August','September','October','November','December'];

            this.months.sort(function(a,b){
                return allMonths.indexOf(a) > allMonths.indexOf(b);
            });
            years.sort();

            this.yearOptions.innerHTML = `
                <option value="">Any</option>
                ${years.map(year=> `<option value="${year}">${year}</option>`).join('')}
            `;

            this.monthOptions.innerHTML = `
                <option value="">Any</option>
                ${this.months.map(month=> `<option value="${month}">${month}</option>`).join('')}
            `;

            }catch(e){
                console.log(e);
            }
        }
    
    async gatherNews(){
        let target = this.toggableSettings
        //Put results in var copy, just like in the shadowbox
    
        //Maybe, to solve certain issues of 'undefined', allow pagination even when only 1 page, as I think next and prev will be hidden 
        try{
            //Is it better just to use seperate url routes? 
            const response = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(siteData.root_url + '/wp-json/cah/v1/all-news?news=' + this.newsDelivery); 
            const results = response.data; 
            
            // console.log(results)
        
            //maybe allowing a one on the pagination would solve the errors

            //For field exclusion, could have code processed with matches() or indexOf on the fields that aren't banned
            //Take out those that produce a false result

            let allNews = results.updatesAndNews;

            let relatedPosts = results.propertiesAndMembers;

            let postRelationships = [];
            
            allNews.map(news=>{
                news.relationships.forEach(post=>{
                    // console.log(`${news.title}: ${post.ID}`)
                    for(let i=0; i < relatedPosts.length; i++){
                        if(post.ID === relatedPosts[i].id){
                            postRelationships.push(relatedPosts[i]);
                            // console.log(postRelationships)
                        }
                        news.relationships = postRelationships;

                    }

                })
                postRelationships = [];
            })
            
            let n = window.location.href;
            if(n.indexOf('#') > -1){
                n = n.split(/[/-]+/)
                if(n[4].length){
                    if(n[5].indexOf('news') > -1){
                        // this.singleCall = true;
                        this.fullDisplay = true; 
                    }else{
                        this.newsSearch.value = `${n[4]}`; 
                        this.newsDelivery = `${n[4]}`; 
                    }
                    this.origin = n[6];                
                    this.currentReport = n[4].slice(1); 
                    window.history.replaceState('', '', `/${n[2]}-${n[3]}`);
                    // history.go(-1);
                    this.externalCall = true;
                }
            }

            let newsTypes = ['news', 'update'];

            let dataCount = 0;
            const newsOutput = 2;
            let pageCount = 0;
            let newsPage = [];
            let newsPages = [];
            let contentShown;

            // //if symbol entered as only thing, it'll my logic, sometimes. Remedy this.
            
            if(!this.fullDisplay || this.backgroundCall){
                //Do start vs anywhere in the word
                //Start only is standard and auto true when whole word is turned on(?) or simply buried in partial if
                //it should at least be inacessible on the frontend with visual cue

                //Do a more thorough test of those later after rel and 'dislay-quality' articles created 

                //Do basic month and year and range picking, before looking into pop-up and figuring out how to get info from what is selected on it
                let fullList = [];
                let titles = [];
                let desc = [];
                let rel = [];

                if(this.newsDelivery !== ''){
                    console.log('red')

                    if(this.newsDelivery.startsWith('#')){
                        let requestedId = this.newsDelivery.replace('#', '')
                        let associatedNews = [];
                        let name;
                        allNews.forEach(news =>{
                            news.relationships.forEach(r=>{
                                if(r.id === parseInt(requestedId)){
                                    associatedNews.push(news);
                                    name = r.title;
                                    console.log(associatedNews)
                                }
                            })
                        })
                        allNews = associatedNews;

                        if(this.externalCall){
                            console.log(this.origin)
                            this.externalCall = false;
                            this.previousValue = this.newsSearch.value;
                            this.gatherNews();
                            this.returnHome.href=`${siteData.root_url}/#${this.origin}Container`; 
                            this.mainHeader.innerHTML = `Showing Results for: ${name}`;
                            this.storedTitle = `Showing Results for: ${name}`;
                        }
                    }else{    
                        if(target.includeTitle.isOn){
                            if(target.fullWord.isOn){
                                titles = allNews.filter((news) => {
                                    if (news.title.toLowerCase().split(" ").includes(this.newsDelivery.toLowerCase())) {
                                        return news;
                                    }                              
                                        return null;
                                });
                            }else if(!target.fullWord.isOn && target.wordStartOnly.isOn){
                                allNews.forEach(news=> {
                                    if(news.title.toLowerCase().indexOf(this.newsDelivery.toLowerCase()) !== -1) {
                                        let newsSplit = news.title.toLowerCase().split(" ");
                                        for(let e of newsSplit){
                                            if(e.startsWith(this.newsDelivery.toLowerCase())){
                                                titles.push(news)
                                                // break;
                                                // return news;
                                            }
                                            // return null; 
                                        }
                                    }
                                })
                            }else{
                                titles = allNews.filter(news=> news.title.toLowerCase().indexOf(this.newsDelivery.toLowerCase()) !== -1)
                            }

                            if(target.isCaseSensitive.isOn){
                                titles = titles.filter(news=> news.title.indexOf(this.newsDelivery) !== -1);
                            }
                        }

                        if(target.includeDescription.isOn){
                            if(target.fullWord.isOn){
                                desc = allNews.filter((news) => {
                                    if (news.fullDescription.toLowerCase().split(" ").includes(this.newsDelivery.toLowerCase())) {
                                        return news;
                                    }                               
                                        return null;
                                });
                                console.log('if fired!')
                            }else if(!target.fullWord.isOn && target.wordStartOnly.isOn){
                                allNews.forEach(news=> {
                                    if(news.fullDescription.toLowerCase().indexOf(this.newsDelivery.toLowerCase()) !== -1) {
                                        let newsSplit = news.fullDescription.toLowerCase().split(" ");
                                        for(let e of newsSplit){
                                            if(e.startsWith(this.newsDelivery.toLowerCase())){
                                                desc.push(news)
                                            }
                                        }
                                    }
                                })
                            }else{
                                desc = allNews.filter(news=> news.fullDescription.toLowerCase().indexOf(this.newsDelivery.toLowerCase()) !== -1)
                            }
  
                            if(target.isCaseSensitive.isOn){
                                desc = desc.filter(news=> news.fullDescription.indexOf(this.newsDelivery) !== -1);
                            }
                        }

                        let searchedNews = fullList.concat(titles, desc, rel);
                        
                        allNews = []; 
    
                        searchedNews.forEach((news)=>{
                            if (!allNews.includes(news)) {
                                allNews.push(news);
                            }
                        })
                    }
                }

                
                //Dates belong to a seperate logic thread, and as such should noyt be linked to typing. They ae closer to the sorts in that 
                //they can be after the typing, before, or even be used without it
                
                //After I finish the core logic, add in functionality that has any as option for 'year', with selection of specific 
                //limiting the 'month' values and selecting the earliest one as the default filter for 'month' or 'any'
                //Filter by date will be a boolean with dropdown defaults of any for both

                 let dateFiltersSet = Object.keys(this.dateFilterSetUp);
                //  console.log(`contentLoaded = ${this.contentLoaded}`)

                 for(let filter of dateFiltersSet){
                     if(this.dateFilterSetUp[filter]){                         
                         allNews = allNews.filter((news) => {
                            if (new Date(news.date).toLocaleDateString('en-us', {month: 'long', year: 'numeric'}).includes(this.dateFilterSetUp[filter])) {
                              return news;
                            }
                          
                            return null;
                          });
                     }
   
                 }

                if(this.toggableSettings.dateOrder.isOn === true){
                    if(this.toggableSettings.dateOrder.directive === 'asc'){
                        allNews.sort((a, b) => new Date(a.date) - new Date(b.date));
                    }else{
                        allNews.sort((a, b) => new Date(a.date) - new Date(b.date));
                        allNews.reverse();
                    }
                }

                if(this.toggableSettings.alphaOrder.isOn === true){
                    allNews.sort(function(a, b) {
                        // localeCompare does a string comparison that returns -1, 0, or 1
                        return a.title.localeCompare(b.title);
                    })
                    if(this.toggableSettings.alphaOrder.directive === 'desc'){ 
                        allNews.reverse();
                    }        
                }
                
                newsTypes.forEach((type)=>{
                    if(target[type].isOn !== true){
                        allNews = allNews.filter(news=> news.postType !== type)
                    }
                })

                if(allNews.length){
                    if(allNews.length <= newsOutput){
                        let page = newsPages.concat(allNews);
                        newsPages.push(page);
                    }else{
                        while (allNews.length > newsOutput){
                            for(let item = 1; item <= newsOutput; item++){
                                let removed = allNews.shift();
                                newsPage.push(removed);
                            }
                            let page = newsPage.splice(0);
                            newsPages.push(page);
                        } 

                            if(allNews.length){
                                newsPage = allNews.splice(0);
                                newsPages.push(newsPage);
                            }
                        }
                }

                if(newsPages.length){                
                    contentShown = newsPages[this.currentPages];
                }else{
                    contentShown = [];
                }

                this.deliverNews(contentShown)
                if(this.contentLoaded && document.querySelector(`.content-direction_previous`)){
                    this.contentNextAndPrevious();
                }else if(contentShown.length > 0){
                    this.insertPagination(newsPages, dataCount, pageCount);
                }else{
                    this.paginationHolder.innerHTML = '';
                }

                this.contentNextActivation(); 

                this.contentLoaded = true;
            }else{
                //This needs to change to
                this.toggleOptions.forEach(o => {o.classList.add('inactive');}); 
                this.dateFilterOptions.forEach(f => {f.disabled = true});
                this.newsSearch.classList.add('inactive');
                this.resetAll.classList.add('inactive');
                this.fullDisplayContent = [];
                this.calledIds = [];
                for(let news of allNews){
                    this.newsReciever.classList.add('dismissed');
                    this.paginationHolder.classList.add('dismissed');
                    this.fullDisplayContainer.classList.remove('dismissed');
                    this.dismissButton.classList.remove('dismissed');
                    //seperate the insertions to a function
                    
                    //Use if to vary if look for news with that or ones with relationship that has that
                    //make array of each news's relationships[give the first post 2 for testing of if checking aray properly]
                    if(this.fullDisplay){                    
                        this.calledIds = [news.id]
                    }else{
                        news.relationships.forEach(r=>this.calledIds.push(r.id))
                    }

                    if(this.calledIds.includes(parseInt(this.currentReport))){
                        this.fullDisplayContent.push(news);
                        this.mainHeader.innerHTML = `${news.title}`;
                    }
                    this.calledIds = [];
                }
                    // if(this.singleCall){ 
                        this.deliverNews(this.fullDisplayContent, this.fullDisplayContainer);
                //     }else{
                //         this.contentLoaded = false;
                //         this.gatherNews();
                //     }
                // console.log(this.externalCall)
                if(this.fullDisplay && this.externalCall){
                    this.backgroundCall = true;
                    this.contentLoaded = false;
                    this.gatherNews();
                    this.fullDisplay = false;
                } 
            }
            
            this.isSpinnerVisible = false;  
        }catch(e){
            console.log(e);
        }
    }

    deliverNews(contentShown, destination = this.newsReciever){
        destination.innerHTML = `
            ${contentShown.length ? `<ul>`  : 'No articles match your criteria'}
            ${!contentShown.length ? `<button id="searchReset">Please try a different query or change your filters.</button>`  : ''}
                ${contentShown.map(report => `
                <li>
                    <div class="news">                           
                        ${!this.fullDisplay ? `<h4>${report.title}</h4>` : ''}
    
                        <p>
                            ${report.caption.length >= 1 ? report.caption + ' - ' : ''}
                            ${report.date} 
                        </p>
                        
                        <p>${report.relationships.map(relationship => `<span class="name">${relationship.title}</span>  ${!this.fullDisplay ? `<a class="relationship-link" data-related="${relationship.id}">(Associated News)</a> ` : `<a class="relationship-link dismissed" data-related="${relationship.id}">(Associated News)</a> `}<a class="single-link" href="${relationship.permalink}">(View Profile)</a>`)}</p>
                        <div class="media-card">
                            <img data-id="${report.id}" data-post="${report.postTypePlural}" src="${report.gallery[0].selectImage}">
                        </div>
        
                        ${!this.fullDisplay ? `<p>${report.description}</p>` : `<p>${report.fullDescription}</p>`}
                        ${!this.fullDisplay ? `<button id="${report.id}" class="see-more-link">See More: ${report.id} </button>` : `<button id="${report.id}" class="see-more-link dismissed">Read more: ${report.id} </button>`} 
                    </div>
                </li> 
                `).join('')}
            ${contentShown.length ? `</ul>`  : ''}
        `;

        if(!this.fullDisplay){
            this.seeMoreFunctionality();
            this.gatherRelatedNews();  
        }

            // let mediaLink = document.querySelectorAll('.media-card img') 
            // this.closeMediaButton = document.querySelector('#media-close')   
            // this.html = document.querySelector('html')
            // this.mediaReciever = document.querySelector('#media-reciever')
            // console.log(this.mediaReciever, document.querySelector('#media-reciever')) 
            // this.isMediaRecieverOpen = false
            // this.mediaColumn = document.querySelector('#media-column');
            // this.newload = true;
            // this.galleryPosition = 0; 
            // this.currentMedia = document.querySelector('#current-media');
            // this.mediaPagination = document.querySelector('#media-pagination');

        // mediaLink.forEach(media=>{
        //     media.addEventListener('click', ()=> ShadowBox.prototype.shadowBox(media, this.mediaReciever, this.html, 
        //         this.currentPages, 'gallery', this.mediaColumn, this.newload, this.galleryPosition,
        //         this.currentMedia, this.mediaPagination
        //         ))
        // })

        //  mediaLink.forEach(media=>{
        //     media.addEventListener('click', ()=> ShadowBox.prototype.shadowBox(media))
        // })

        _shadowBox__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.events();

        // ShadowBox.prototype.events(
        //     this.mediaLink = document.querySelectorAll('.media-card img'), 
        //     this.closeMediaButton = document.querySelector('#media-close'),   
        //     this.html = document.querySelector('html'),
        //     this.mediaReciever = document.querySelector('#media-reciever'), 
        //     this.isMediaRecieverOpen = false
        // );

        if(this.contentPageOptions){
            this.contentPageOptions.forEach(option=>{
                setTimeout(function(){option.style.pointerEvents=""; }, 500);
            })  
        }

    }

    gatherRelatedNews(){

        this.relationshipLinks = document.querySelectorAll('.relationship-link');

        this.relationshipLinks.forEach(link=>{
            link.addEventListener('click', ()=> {
                let linkId = link.dataset.related 
                let name = link.parentElement.querySelector('.name').innerText

                this.currentReport = linkId;
                this.newsSearch.value = `#${linkId}`;
                this.previousValue = this.newsSearch;
                this.newsDelivery = `#${linkId}`; 
                this.mainHeader.innerHTML = `Showing Results for: ${name}`;
                this.storedTitle =`Showing Results for: ${name}`;
                this.contentLoaded = false;
                this.gatherNews();
            })
        })
    }

    insertPagination(newsPages, dataCount, pageCount){
        //add manual page entry box
        //Add failsafe against it being a number too big or small
        //Maybe do dropdown instead?  
        //Maybe just don't do at all?

        //Do the number limit, though, one where hide and reveal when at certain points

        //Remember to add the loader
        this.paginationHolder.innerHTML = `
                <div class="content-pages">
                    <a id="" class="content-direction content-direction_previous">Prev</a>
                    ${newsPages.map((page)=>`
                    <a class="content-page" data-page="${dataCount++}"> ${pageCount += 1}</a>
                    `).join('')}  
                    <a id="" class="content-direction content-direction_next ${newsPages.length > 1 ? '' : 'hidden'}">Next</a> 
                </div> 
            `;
            this.previousContentDirection = document.querySelectorAll('.content-direction_previous');    
            this.previousContentDirection.forEach(el=>{
                el.classList.add('hidden')  
            })
            
                this.nextContentDirection = document.querySelector('.content-direction_next'); 
        
                this.firstPageButton = document.querySelector('.content-page[data-page="0"]');
                
                this.firstPageButton.classList.add('selectedPage')
                this.contentPageHolder
                this.contentPageOptions = document.querySelectorAll('.content-pages a')
    
                this.paginationFunctionality(this.contentPageOptions);


    }

    seeMoreFunctionality(){
        //add spinner to this, as needs to consolt backend
        this.seeMore = document.querySelectorAll('.see-more-link')
        this.seeMore.forEach(link=>{
            link.addEventListener('click', ()=>{
                this.currentReport = link.id;          
                this.fullDisplay = true;
                // this.singleCall = true;
                this.gatherNews();
                // console.log(`full display is ${this.fullDisplay}`)
            })
        })
    }

    dismissSelection(){
        if(this.newsDelivery !== ''){
            this.mainHeader.innerHTML = `${this.storedTitle}`;
        }else{
            this.mainHeader.innerHTML = `${this.initialTitle}`;
        }
        this.toggleOptions.forEach(o => {o.classList.remove('inactive');}) 
        this.dateFilterOptions.forEach(f => {f.disabled = ''})
        this.newsSearch.classList.remove('inactive');
        this.resetAll.classList.remove('inactive');
        this.newsReciever.classList.remove('dismissed');
        this.paginationHolder.classList.remove('dismissed');
        this.fullDisplayContainer.classList.add('dismissed');
        this.dismissButton.classList.add('dismissed');  
        this.backgroundCall = false;
        this.fullDisplay = false;
        // this.singleCall = false;
    }

    paginationFunctionality(contentPageOptions){
        contentPageOptions.forEach(el => {
            el.onclick = (e) => {
                let selectedPage = e.currentTarget;

                el.style.pointerEvents="none";
                this.newsReciever.innerHTML = '<div class="spinner-loader"></div>'
                //too slow??
                this.isSpinnerVisible = true

                // setTimeout(function(){el.style.pointerEvents=""; }, 1000);

                this.currentPages = parseInt(selectedPage.dataset.page);
                this.gatherNews()

                contentPageOptions.forEach(i =>{ 
                    i.classList.remove('selectedPage');
                })

                el.classList.add('selectedPage');
            }
        })
    }

    contentNextActivation(){
        let allnextButtons = document.querySelectorAll('.content-direction_next');

        allnextButtons.forEach(el=>{
            el.onclick = (e)=>{
                let selectedPage = e.currentTarget;

                selectedPage.classList.forEach((name)=>{
                    if(name.match(/-group/)){
                        this.groupName = name.slice(0, -6);
                    }
                })
                let current = document.querySelector(`.selectedPage`);
        
                let nextPage = this.currentPages + 1;

                this.currentPages = nextPage;
                current.classList.remove('selectedPage');
                
                el.style.pointerEvents="none";
                this.newsReciever.innerHTML = '<div class="spinner-loader"></div>'
                //too slow??
                this.isSpinnerVisible = true

                this.gatherNews()

                let newCurrent = document.querySelector(`.content-page[data-page="${this.currentPages}"]`);
                newCurrent.classList.add('selectedPage');
            }
        })
        
    };

    contentNextAndPrevious(){
   
        this.contentDirection = document.querySelectorAll('.content-direction');     

        let prevButton = document.querySelector(`.content-direction_previous`)
        let nextButton = document.querySelector(`.content-direction_next`)
        let current = document.querySelector(`.selectedPage`);

        if(this.currentPages > 0){
            console.log(this.currentPages)
            prevButton.classList.remove('hidden')
        }else{
            prevButton.classList.add('hidden')
        }


        if(!nextButton.previousElementSibling.classList.contains('selectedPage')){
            nextButton.classList.remove('hidden')
        }else{
            nextButton.classList.add('hidden')
        }

        this.previousContentDirection.forEach(el=>{
            el.onclick =  (i) =>{
                let prevPage = this.currentPages - 1;
                
                this.currentPages = prevPage;
                current.classList.remove('selectedPage');
                el.style.pointerEvents="none";
                this.newsReciever.innerHTML = '<div class="spinner-loader"></div>'
                //too slow??
                this.isSpinnerVisible = true

                this.gatherNews()

                let newCurrent = document.querySelector(`.content-page[data-page="${this.currentPages}"]`);
                newCurrent.classList.add('selectedPage');
                console.log(newCurrent)
            }
        })
    }

    toggleAllOptions(){
        if(!this.allOptionsVisible){
            this.allOptions.classList.add('fade-in');
            this.allOptionsVisible = true;
            this.newsReciever.querySelectorAll('*').forEach(e=>e.style.pointerEvents = 'none')
        }else{
            this.allOptions.classList.remove('fade-in');
            this.allOptions.classList.add('fade-out');
            setTimeout(()=>{this.allOptions.classList.remove('fade-out');}, 450)

            this.allOptionsVisible = false;
            this.newsReciever.querySelectorAll('*').forEach(e=>e.style.pointerEvents = '')
        }
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (News);

/***/ }),

/***/ "./src/modules/mobile.js":
/*!*******************************!*\
  !*** ./src/modules/mobile.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class MobileInterfece {
    constructor(){
        this.nav = document.querySelector('nav');
        this.opened = false;
        this.mobileNavCaller = document.querySelector('#mobile-nav-caller');
        this.events();
    }
    events(){
        this.mobileNavCaller.addEventListener('click', ()=>this.openNav())
    }

    openNav(){
        if(!this.opened){
            this.nav.classList.add('opened');
            this.opened = true;
        }else{
            this.nav.classList.remove('opened');
            this.opened = false;
        }

    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MobileInterfece);

/***/ }),

/***/ "./src/modules/pagination.js":
/*!***********************************!*\
  !*** ./src/modules/pagination.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
// Spit out Apts in order of most recent



class Pagination {
    constructor(){
        this.targetedElement;

        this.html = document.querySelector('html');
        this.header = document.querySelector('header');
        this.headerNav = this.header.querySelector('nav');
        this.openButton = document.querySelectorAll(".js-search-trigger");
        this.displayBox = document.querySelector('#pop-up-display-box');
        this.imageHolder = document.querySelector('#image-holder');
        this.closeMagnify = document.querySelector('#closeMagnify');
        // this.overallContainer = document.querySelector('#overallContainer');
        // For now, this will be how I prevent errors on other pages 
        this.frontTest = document.querySelector('.contentContainer_paginated') 
        this.vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        this.vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

        // Can I setup to load in and Paginate depending on identity, so as to make adaptable? Yes!!!

        //Will target a shared, specific class using querySelectorAll and use a loop

        //remember to use the ajax url set-up to link to the search info
        //Color the selected/current page and put a next and prev buttons that only appear when applicable
        //Make sure pagination is outside of generated text?

        // consider using some sort of loading icon and animation when clicking pagination. Just for user satisfaction on click
        
        // this.paginatedContainers = document.querySelectorAll('.contentContainer_paginated');
  
        let properties = document.querySelector('#propertiesContainer .contentBox');
        let members = document.querySelector('#membersContainer .contentBox');

        this.paginatedContent = [properties, members];
        this.groupName;
        // Make work for all paginate through a loop?
        this.postPageSelect;
        this.postPageOption;
        
        this.currentPropertiesPage = 0;
        
        // Maybe put all things in this object when fuse
        this.currentPages = {
            properties: 0,
            members: 0
        }

        this.contentDirection;

        this.pageLoader = document.querySelector('#page-loader');
        this.contentLoaded = false;
        // this.isSpinnerVisible = true;
        //spinner false before the prev is true

        //Do smaller ones for paginate and for the form submits, as well as search on the all news page and any other pagination 
            
        this.events();
    }

    events(){
        // this.html.style.fontSize = `${this.vh*.017}px`;
        // console.log(this.vh*.017)
        if(this.frontTest){
            // const mainLoaderText = ["One Moment Please...", "Perfection takes time", "Groaning only makes this slower...", "I'm watching you... :)"
            // , "Commencing Hack ;)", "One Moment. Retrieving your SSN", "Shaving your cat...", "You like Scary Movies...? >:)"];
    
            // const random = Math.floor(Math.random() * mainLoaderText.length);
            // const result = mainLoaderText[random];
            // this.pageLoader = document.querySelector('#page-loader');

            // this.pageLoader.setAttribute('data-curtain-text', `${result}`)
    
            this.contentLoader = document.querySelector('.content-loader');

             this.paginate();
        }
        
    }

    
    contentInterface(){
        //I think that I need to delay clickability for touch, otherwise can click when bringing up
        //Also, perhaps I need to add a symbol to indicate that you can bring up options 
        
        this.displaySquares = document.querySelectorAll('.displaySquares');
  
        this.displayImages = document.querySelectorAll('.displayImages');
        this.magnifyButton = document.querySelectorAll('.fa-search-plus');

        this.displaySquares.forEach(displaySquare => {
          let link = displaySquare.querySelector('.displaySquares-pageLinks');
          let image = displaySquare.querySelector('.displayImages');
          let magnifyButton = displaySquare.querySelector('.fa-search-plus')
          
          displaySquare.addEventListener("mouseenter", e => {

              link.classList.add('displaySquares-pageLinks__visible');
              image.classList.add('pageLinks__visible');
              link.style.pointerEvents = 'none';
              if(magnifyButton){
                magnifyButton.style.pointerEvents = 'none';
              }

              setTimeout(()=>{
                link.style.pointerEvents = '';
                if(magnifyButton){
                    magnifyButton.style.pointerEvents = '';
                }
              }, 300)          
            })
          displaySquare.addEventListener("mouseleave", e => {

              link.classList.remove('displaySquares-pageLinks__visible');
              image.classList.remove('pageLinks__visible');
          })
      })
      
      this.magnifyButton.forEach(b =>{ 
          b.onclick = e=>{

            let image = e.target.closest('.displaySquares-pageLinks').previousElementSibling.cloneNode();
            console.log(image)
            //Perhaps carry over associated news, as well

            //this is not necessary as one directly below does it by accessing the parent and query selecting, but keeping this as could be useful to have on hand
            this.findSpecifiedPrevious(e.target, 'more-info-link');
            // this.targetedElement = e.target.closest('.displaySquares-pageLinks').querySelector('.more-info-link').cloneNode(true);
            this.displayBox.insertBefore(this.targetedElement, this.closeMagnify);
       
            // this.displayBox.prepend(image);
            this.imageHolder.prepend(image);
            
            this.displayBox.style.display = 'flex';
            this.openButton.forEach(e=>{
                e.classList.add('hidden');
            })
            this.html.classList.add('freeze');
          }
      })

     this.closeMagnify.onclick = ()=>{
        this.imageHolder.querySelector('img').remove();
        this.displayBox.querySelector('.more-info-link').remove();
        this.displayBox.style.display = 'none';
        this.openButton.forEach(e=>{
            e.classList.remove('hidden');
        })
        this.html.classList.remove('freeze');
      }

      //change to be fpr either directional to get let, with if statements
    document.querySelectorAll('.pop-up-directional').forEach(button=>{
        button.onclick = ()=>{
        //Make next and prev unclickable if nothing there to go to
            let currentImage = this.displayBox.querySelector('img');

            let targetName = currentImage.dataset.name;

            let type = button.id;
            let newImageContainer;
            console.log(type)
            this.displaySquares.forEach(e=>{
                if(e.querySelector(`.displayImages[data-name=${targetName}]`)){
                    if(type === 'next-image'){
                        newImageContainer = e.querySelector('.displayImages').closest('.overall-squares').nextElementSibling;
                    }else{
                        newImageContainer = e.querySelector('.displayImages').closest('.overall-squares').previousElementSibling;
                    }
                    if(newImageContainer){
                        let newImage = newImageContainer.querySelector('.displayImages').cloneNode();
                        let newLink = newImageContainer.querySelector('.displaySquares-pageLinks .more-info-link').cloneNode(true);
                        this.imageHolder.querySelector('img').replaceWith(newImage);
                        this.displayBox.querySelector('.more-info-link').replaceWith(newLink);
                    }    
                }
            })
        }
      })
    }
    
    findSpecifiedPrevious(source, identifier){
        // this will need to be tweaked handle non-nested, as well as other needs
        let link = source.parentElement.previousElementSibling;
        while (link) {
            if (link.className.includes(identifier)) {
                
                this.targetedElement = link.cloneNode(true);
                console.log(this.targetedElement);
                break;
            }
            link = link.previousElementSibling;
            } 
    }

    async paginate(){
        //create new search set-up for just the member prop pagination? Like, go make new inc page
        //Use post-type 'if' that checks for the id? Actually, I can use the resuts array as can pluralize

        //start by inserting random shit in both?
        //set-up this up to not replace content, if javascript turned off, along with inserting a button to see all
        //and make that see all page
        //I think I'll make the see all button, but replace it's contents through here, so if this doesn't run, it'll be there
        //disable script in browser to check/work on stuff
        try{
            //Is it better just to use seperate url routes? 
            const response = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(siteData.root_url + '/wp-json/cah/v1/content?page'); 
            const results = response.data;

            // let currentMembersShown = this.currentPages.members;
            // let currentPropertiesShown = this.currentPages.properties;

            let dataCount = 0;
            let postOutput;
            // window.alert('on tablet!')
            //Consider localized reload on page resize
            if(window.innerWidth >= 1200){
                postOutput = 8;
            }else{
                postOutput = 6;
            }
            let pageCount = 0;
            let postPage = [];
            let postPages = [];
            let resultsKeys = Object.keys(results);
            let name;
            let post;
            let contentShown;
            let paginationLocation;
 
            //Use a for loop here? for result of results?
            // make this into an array and put in if a loop?

            let containerType = this.paginatedContent;

            let containerTypeLocation = 0;

            if(!this.contentLoaded){
                for(let type of resultsKeys){
                    name = type;
                    post = results[name];

                    if(post.length){
                        if(post.length <= postOutput){
                            let page = postPages.concat(post);
                            postPages.push(page);
                        }else{
                            while (post.length > postOutput){
                                for(let item = 1; item <= postOutput; item++){
                                    let removed = post.shift();
                                    postPage.push(removed);
                                }
                                let page = postPage.splice(0);
                                postPages.push(page);
                            } 
        
                            if(post.length){
                                postPage = post.splice(0);
                                postPages.push(postPage);
                            }
                        }
                    }

                    // this will need to made more versatile if decide to universalize pagination
                    if(postPages.length){
                        
                        contentShown = postPages[this.currentPages[type]];
                    }else{
                        contentShown = [];
                    }

                    console.log(postPages[0])

                        let pageName = type;

                        containerType[containerTypeLocation].classList.add(type)

                        this.insertContent(containerType[containerTypeLocation], contentShown, pageName)
                        

                        paginationLocation = containerType[containerTypeLocation].previousElementSibling.querySelector('.textBox')
                        this.insertPagination(paginationLocation, postPages, dataCount, pageCount, pageName)     

                        containerTypeLocation+= 1
                        
                        // post = [];
                        postPage = [];
                        postPages = []
                        this.contentNextActivation(); 
                }
            }else{
                //temp until change set-up to make section loader work
                this.pageLoader.classList.add('is-active')
                post = results[this.groupName]

                if(post.length <= postOutput){
                    let page = postPages.concat(post);
                    postPages.push(page);
                }else{
                    while (post.length > postOutput){
                        for(let item = 1; item <= postOutput; item++){
                            let removed = post.shift();
                            postPage.push(removed);
                        }
                        let page = postPage.splice(0);
                        postPages.push(page);
                    } 

                    if(post.length){
                        postPage = post.splice(0);
                        postPages.push(postPage);
                    }
                }
                contentShown = postPages[this.currentPages[this.groupName]];
                
                let target = document.querySelector(`.contentBox.${this.groupName}`)

                this.insertContent(target, contentShown, this.groupName);

                this.contentNextAndPrevious(); 
                this.contentNextActivation(); 

                //change to adding fade-class, before removing active, so goes away smoother
                setTimeout(()=>this.pageLoader.classList.remove('is-active'), 810);

            }
            this.contentLoaded = true;
            setTimeout(()=>this.pageLoader.classList.remove('is-active'), 810); 
     
            //Can I loop through the diff results, using variable(s) before the innerHtml and the map, as well as the page container?
            
            // How to get post name, though? Can I apply a foreach to them and grab the post type? Could I include in rest route

            //Have logic that only has the process for the selected section run again, perhaps via a variable in the call below. 
            //ie. this.paginate('members')
            //Maybe the pagination could be split up, with the html insertion being a seperately called function that is repeated
            //through a loops consisting of variables here, and could simply be called again with a specific variable  
            //Or simply just seperate this all 

            //simply display different things, need two diff html blocks, but each can called upon seperately, as different innerHtml blocks

            //But then again, a uniformed displayed could be achieved with ternary operators, checking for title_or_position
            //And checking for something that could rule out the magnifying button and the location link

            //Can I move this And just loop call this?

            //Make work again. And versatile
            //Do I need this anymore, though?

            // let activePagination = document.querySelector(`[data-page='${currentMembersShown}']`);
            // activePagination.classList.add('selectedPage');
          
        }catch (e) {
            console.log(e)
          }
            
        
        this.contentInterface();
    }

    insertContent(destination, type, pageName){
            //Change desitination set-up to accomadate loader
            console.log(pageName)
            //replace word interaction prompts, with custom, drawn symbols
            destination.innerHTML = `
                ${type.map(item => `
                <div class="overall-squares">
                    <div class="displaySquares">
                        <p class="interaction-prompt"><span class="click-prompt">Touch</span><span class="hover-prompt">Hover</span></p>
                        ${this.vw >= 1200 ? `<img class="displayImages" data-name="${item.title.replaceAll(' ', '')}" src="${item.isCompleted || item.postType === 'member' ? item.image : item.projectedImage}" alt="${item.title}">`: ''}
                        ${this.vw < 1200 ? `<img class="displayImages" data-name="${item.title.replaceAll(' ', '')}" src="${item.isCompleted || item.postType === 'member' ? item.imageMedium : item.projectedImageMedium}" alt="${item.title}">`: ''}
                        <div class="displaySquares-pageLinks">
                            <a class="more-info-link" href="${item.permalink}">Find Out More</a>
                            <a href="${siteData.root_url}/all-news/#${item.id}-related-${item.postTypePlural}">Associated News?</a>
                            ${pageName === 'properties' ? '<button><i class="fas fa-search-plus"></i></button>': ''}
                        </div>
                    </div>
                    <div class="display-text">
                        <p>${item.title}</p>
                        ${item.positionOrRole !== undefined ? `<p>${item.positionOrRole}</p>` : ''}
                    </div> 
                </div>   
                `).join('')}
            `;
        }

    insertPagination(destination, postPages, dataCount, pageCount, pageName){
        //Put in 'next' and 'prev' buttons
        //Make numbers Large and centered, and perhaps put a box around them, along with fancy styling all around
        destination.insertAdjacentHTML(
        "beforeend",
            `
            ${postPages.length ? '<div class="content-pages">' : ''}
                ${postPages.length > 1  ? `<a id="${pageName}-prev" class="${pageName}-group ${pageName}-direction content-direction content-direction_previous">Prev</a>` : ''}
            ${postPages.map((page)=>`
                ${postPages.length > 1 ? `<a class="content-page ${pageName}-group" data-page="${dataCount++}"> ${pageCount += 1}</a>` : ''}
            `).join('')}  
                ${postPages.length > 1 ? `<a id="${pageName}-next" class="${pageName}-group ${pageName}-direction content-direction content-direction_next">Next</a>` : ''}
            ${postPages.length ? '</div>' : ''} 

        `);
        this.previousContentDirection = document.querySelectorAll('.content-direction_previous');    
        this.previousContentDirection.forEach(el=>{
            el.classList.add('hidden')  
        })

        this.nextContentDirection = document.querySelectorAll('.content-direction_next'); 
        
        this.firstPageButton = document.querySelectorAll('.content-page[data-page="0"]');
        
        this.firstPageButton.forEach(el=>el.classList.add('selectedPage'))

        let contentPageOptions = document.querySelectorAll('.content-page');

        this.paginationFunctionality(contentPageOptions);
    }
// this new setup causes issues after directional buttons used: selectedPage 
//not being added to clicked and currentPage on directional gets error
//Latter likely connected to the former

    paginationFunctionality(contentPageOptions){
        //Combine the two below
        contentPageOptions.forEach(el => {
            el.onclick = (e) => {
                let selectedPage = e.currentTarget;

                selectedPage.classList.forEach((name)=>{
                    if(name.match(/-group/)){
                        this.groupName = name.slice(0, -6);
                    }
                })

                this.currentPages[this.groupName] = parseInt(selectedPage.dataset.page);

                this.paginate()

                contentPageOptions.forEach(i =>{ 
                    console.log(i)
                    i.classList.forEach((name)=>{
                        if(name.match(this.groupName)){
                            i.classList.remove('selectedPage');
                        }
                    })
                })  
                el.classList.add('selectedPage');
            }
        })

        // contentPageOptions.forEach(el => {
        //     el.addEventListener('click', () =>{
                
        //         contentPageOptions.forEach(i =>{ 
        //             console.log(i)
        //             i.classList.forEach((name)=>{
        //                 if(name.match(this.groupName)){
        //                     i.classList.remove('selectedPage');
        //                 }
        //             })
        //         })  
        //         el.classList.add('selectedPage');
        //     }, { once: true });
        // })
    }

    
    contentNextActivation(){
        let allnextButtons = document.querySelectorAll('.content-direction_next');

        allnextButtons.forEach(el=>{
            el.onclick = (e)=>{
                let selectedPage = e.currentTarget;

                selectedPage.classList.forEach((name)=>{
                    if(name.match(/-group/)){
                        this.groupName = name.slice(0, -6);
                    }
                })
                let current = document.querySelector(`.${this.groupName}-group.selectedPage`);
        
                let nextPage = this.currentPages[this.groupName] + 1;

                this.currentPages[this.groupName] = nextPage;
                current.classList.remove('selectedPage');
                
                el.style.pointerEvents="none";
                setTimeout(function(){el.style.pointerEvents=""; }, 920);

                this.paginate()

                let newCurrent = document.querySelector(`.${this.groupName}-group[data-page="${this.currentPages[this.groupName]}"]`);
                newCurrent.classList.add('selectedPage');
                console.log(newCurrent)
            }
        })
        
    };

    contentNextAndPrevious(){
   
        this.contentDirection = document.querySelectorAll('.content-direction');     

        let prevButton = document.querySelector(`#${this.groupName}-prev`)
        let nextButton = document.querySelector(`#${this.groupName}-next`)
        let current = document.querySelector(`.${this.groupName}-group.selectedPage`);

        this.previousContentDirection.forEach(el=>{
            if(this.currentPages[this.groupName] > 0){
                console.log(this.currentPages)
                prevButton.classList.remove('hidden')
            }else{
                prevButton.classList.add('hidden')
            }
        })

        this.nextContentDirection.forEach(el=>{
            if(!nextButton.previousElementSibling.classList.contains('selectedPage')){
                nextButton.classList.remove('hidden')
            }else{
                nextButton.classList.add('hidden')
            }
        })

        this.previousContentDirection.forEach(el=>{
            el.onclick =  (i) =>{
                let prevPage = this.currentPages[this.groupName] - 1;
                
                this.currentPages[this.groupName] = prevPage;
                current.classList.remove('selectedPage');

                el.style.pointerEvents="none";
                setTimeout(function(){el.style.pointerEvents=""; }, 920);

                this.paginate()

                let newCurrent = document.querySelector(`.${this.groupName}-group[data-page="${this.currentPages[this.groupName]}"]`);
                newCurrent.classList.add('selectedPage');
                console.log(newCurrent)
            }
        })

        //fix repeat of nextButton functionality
        // this.nextContentDirection.forEach(el=>{
        //     el.onclick =  (i) =>{
        //         let nextPage = this.currentPages[pageName] + 1;

        //         this.currentPages[pageName] = nextPage;
        //         current.classList.remove('selectedPage');

        //         this.paginate()

        //         newCurrent = document.querySelector(`.${pageName}-group[data-page="${this.currentPages[pageName]}"]`);
        //         newCurrent.classList.add('selectedPage');
        //         console.log(newCurrent)
        //     }
        // })
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Pagination);

/***/ }),

/***/ "./src/modules/search.js":
/*!*******************************!*\
  !*** ./src/modules/search.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);


class Search {
    // 1. describe and create/initiate our object
    constructor(){
        this.addSearchHtml();
        this.html = document.querySelector('html');
        this.header = document.querySelector("header");
        this.resultsDiv = document.querySelector("#search-overlay__results");
        //If open dif open button for mobile vs desktop
        this.openButton = document.querySelectorAll(".js-search-trigger");
        this.closeButton = document.querySelector(".search-overlay__close");
        this.searchOverlay = document.querySelector(".search-overlay");
        this.searchTerm = document.querySelector('#search-term');
        this.isOverlayOpen = false;
        this.isSpinnerVisible = false;
        this.previousValue;
        this.typingTimer;
//Get rid of this and the pagination logic, reseting the news rendering
        this.newsPageSelect;
        this.newsPageOption;
        this.currentNewsPage = 0;
        
        this.events();
    }

    // 2. events
    events() {
        this.openButton.forEach(el => {
            el.addEventListener("click", e => {
                e.preventDefault()
                this.openOverlay()
            })
        })
 
        this.closeButton.addEventListener("click", () => this.closeOverlay())
        document.addEventListener("keydown", e => this.keyPressDispatcher(e))
        this.searchTerm.addEventListener("keyup", () => this.typingLogic())
    }

    // 3. methods (function, action...)
    typingLogic() {
        if(this.searchTerm.value !== this.previousValue){
            clearTimeout(this.typingTimer);
            if(this.searchTerm.value){
                if(!this.isSpinnerVisible){
                    this.resultsDiv.innerHTML = '<div class="spinner-loader"></div>';
                    this.isSpinnerVisible = true;
                }
                this.typingTimer = setTimeout(this.getResults.bind(this), 800);
            }else{
                this.resultsDiv.innerHTML = '';
                this.isSpinnerVisible = false;
            }
        }
        this.previousValue = this.searchTerm.value;
    }
//Add coloring to text that matches search query anfd maybe don't show title at all if no content(?)
    async getResults(){
      try{
        const response = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(siteData.root_url + '/wp-json/cah/v1/search?term=' + this.searchTerm.value); 
        const results = response.data;


        let x = this.currentNewsPage;
        let y = 0;
        let item;
        const postOutput = 3;
        const news = results.updatesAndNews;
        let newsPage = [];
        let newsPages = [];
        let newsShown;
        let pageListNumber = 0;
        if(news.length){
            if(news.length <= postOutput){
                let page = newsPages.concat(news);
                newsPages.push(page);
            }else{
                while (news.length > postOutput){
                
                    for(item = 1; item <= postOutput; item++){
                        let removed = news.shift();
                        newsPage.push(removed);
                    }
                    let page = newsPage.splice(0);
                    newsPages.push(page);
                     
                } 
                if(news.length){
                    newsPage = news.splice(0);
                    newsPages.push(newsPage);
                }
            }
        }
        if(newsPages.length){
            newsShown = newsPages[x];
        }else{
            newsShown = [];
        }

        this.resultsDiv.innerHTML = `
            <div class="row">
                <div class="one-third">
                    <h2 class="search-overlay__section-title">Properties</h2>
                    ${results.properties.length ? '<ul class="link-list min-list">' : `<p>No properties match that search.</p>`}
                        ${results.properties.map(item => `<li>
                        <div class="displaySquares">
                            <img class="displayImages" data-name="${item.title.replaceAll(' ', '')}" src="${item.isCompleted ? item.image : item.projectedImage}" alt="${item.title}">
                            <a href="${item.permalink}">${item.title}</a>
                        </div>    
                            <li>`).join('')}
                    ${results.properties.length ? '</ul>' : ''}
                </div>
                <div class="one-third">
                    <h2 class="search-overlay__section-title">Members</h2>
                    ${results.members.length ? '<ul class="link-list min-list">' : `<p>No members match that search.</p>`}
                        ${results.members.map(item => `
                            <img src=${item.image}" alt="">
                            <div>
                                <p>${item.title}</p>
                                <p>${item.positionOrRole}</p>
                                <a href="${item.permalink}">Read More</a>
                            </div>
                        `).join('')}
                    ${results.members.length ? '</ul>' : ''}
                </div>
                <div class="one-third">
                    <h2 class="search-overlay__section-title">Updates And News</h2>
                    ${newsPages.length ? '<ul class="link-list min-list">' : `<p>No news or updates match that search</p>  <a href="${siteData.root_url}/current">Go to views and update section</a>`}
                        ${newsShown.map(item => `
                        <div class="news">
                        
                        <h4>${item.title}</h4>
     
                        <p>
                            ${item.caption.length >= 1 ? item.caption + ' - ' : ''}
                            ${item.date} 
                        </p>
                         
                        <p>*related will go here</p>
                            ${item.image !== null ? `<img src="${item.image}" alt="">` : `<div>${item.video}</div>`}
           
                        <p>${item.description}</p>
                        <a class="read-more" href="all-news/#${item.id}">Read More...</a>
                    </div> 
                        `).join('')}

                        ${newsPages.length ? '<div id="news-pages">' : ''}
                        
                            ${newsPages.map((page)=>`
                                ${newsPages.length > 1 ? `<a href="#" class="news-page" data-page="${y++}"> ${pageListNumber += 1}</a>` : ''}
                            `).join('')}  

                        ${newsPages.length ? '</div>' : ''}  
                    ${newsPages.length ? '</ul>' : ''}
                    
                </div>
            </div>
        `;
        this.isSpinnerVisible = false
        let link = document.querySelector(`[data-page='${x}']`);
        link.classList.add('selectedPage');
        console.log('is it happening before catch?')
      }catch (e) {
        console.log(e)
      }
      console.log('is it happening after catch?')
            this.newsPageOptions = document.querySelectorAll('.news-page');

            this.newsPageOptions.forEach(el => {
                    el.addEventListener("click", e => {
                        let selectedPage = e.target;
                        this.currentNewsPage = selectedPage.dataset.page;
                        this.getResults()
                        console.log('is it happening in newsPageOptions?')
                    })
                })
                  
     }

    keyPressDispatcher(e) {
        if (e.keyCode == 83 && !this.isOverlayOpen && document.activeElement.tagName != "INPUT" && document.activeElement.tagName != "TEXTAREA") {
            this.openOverlay();
        }

        if(e.keyCode === 27 && this.isOverlayOpen){
            this.closeOverlay();
        }
    }

    openOverlay(){
        this.searchOverlay.classList.add("search-overlay--active");
        this.header.classList.add('hidden');
        this.html.classList.add('freeze');
        this.searchTerm.value = '';
        setTimeout(()=> this.searchTerm.focus(), 301);
        this.isOverlayOpen = true;
        return false;
    }   
    
    closeOverlay(){
        this.searchOverlay.classList.remove('search-overlay--active');
        this.header.classList.remove('hidden');
        this.html.classList.remove('freeze');
        this.isOverlayOpen = false;
    }

    addSearchHtml(){
        document.body.insertAdjacentHTML(
            "beforeend",
            `
            <div class="search-overlay">
                <div class="search-overlay__top">
                    <div class="container">
                        <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
                        <input type="text" class="search-term" placeholder="What are you looking for?" id="search-term" autocomplete="false">
                        <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
                    </div>
                </div>

                <div class="container">
                    <div id="search-overlay__results">
                        
                    </div>
                </div>
            </div>
        `
        );
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Search);

/***/ }),

/***/ "./src/modules/shadowBox.js":
/*!**********************************!*\
  !*** ./src/modules/shadowBox.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);

//Combine with other pagination?

class ShadowBox {
    constructor(){

        this.html;
        this.mediaLink;

        this.mediaReciever;
        this.isMediaRecieverOpen;

        this.currentOwnerId; 
        this.localStorage;
        
        this.currentMedia;
        this.mediaMenu;
        this.mediaColumn;
        this.mediaThumb;
        this.mediaPagination;

        this.videoSrc;
        this.playButton;
        this.closeMediaButton;

        this.dataCount;
        this.postOutput;
        this.pageCount;
        this.postPage;
        this.postPages;
        this.contentShown;

        //Reset when change filter and dismiss current vids
        this.galleryPosition; 
        this.currentPages;
        this.currentSelection;
        this.postField;
        this.currentMedia;
        this.closeMediaButton;

        this.newLoad;

        this.events();
    }

    events(){
        this.contentShown;
        this.currentPages = 0;
        this.html = document.querySelector('html');
        this.isMediaRecieverOpen = false;
        this.currentOwnerId = null; 
        this.mediaLink = document.querySelectorAll('.media-card *');
        this.currentMedia = document.querySelector('#current-media');
        this.mediaMenu = document.querySelector('#media-menu');
        this.mediaColumn = document.querySelector('#media-column');
        this.mediaThumb;
        this.mediaPagination = document.querySelector('#media-pagination');
        this.galleryPosition = 0; 
        this.postField = 'gallery';
        this.closeMediaButton = document.querySelector('#media-close');
        this.newLoad = true;

        this.mediaLink.forEach(media=>{
            media.addEventListener('click', ()=> this.shadowBox(media))
        })

        document.addEventListener("keydown", e => this.keyPressDispatcher(e))
        this.closeMediaButton.addEventListener('click', ()=>this.closeMediaReciever())
    
    }

        shadowBox(media){
            this.mediaReciever = document.querySelector('#media-reciever');

            this.mediaReciever.style.display = "flex";
            this.isMediaRecieverOpen = true; 
            this.html.classList.add('freeze');
            
            let postType = media.dataset.post;
            let dataId = parseInt(media.dataset.id);

            if(postType !== 'none'){
                this.getMedia(postType, dataId);
            }else{
                this.renderIsolatedMedia(media);
            }
        }

        async getMedia(dataType, dataId){
            try{
            const response = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(siteData.root_url + '/wp-json/cah/v1/media?related'); 
            const results = response.data;

            const filterList = [];
              
            results[dataType].forEach(item=>{
                let post = JSON.parse(JSON.stringify(item.gallery));
                if(item.id === dataId){
                    console.log(results[dataType])

                    if(item.postType === 'property'){
                        this.mediaMenu.innerHTML = `
                            <a id="gallery" class="active">General</a>
                            <a id="interior">Interior</a>
                            <a id="floorPlans">Floor Plans</a>
                            <a id="buildingPlans">Building Plans</a>
                        `;
                        let menuLink = this.mediaMenu.querySelectorAll('a')
                        
                        menuLink.forEach(e=>{
                            e.addEventListener('click', i=>{
                                this.postField = i.currentTarget.id;

                                post = JSON.parse(JSON.stringify(item[this.postField]));
                                this.newLoad = true;
                                this.currentPages = 0;
                                this.initialMediaPopulation(item, post);

                                menuLink.forEach(c=>{c.classList.remove('active');})
                                i.target.classList.add('active');

                                // if(document.querySelector(`[data-position="0"]`)){
                                //     document.querySelector(`[data-position="0"]`).children[0].classList.add('selected');
                                // }
                               
                            })
                        })
                    }
                    //     let allNews = results['updates'].concat(results['news']);

                    //     allNews.map(reports=>{
                    //         reports.relationships.forEach(post=>{
                    //             if(post.ID === item.id){
                    //                 item.gallery.push(reports.gallery)
                    //             }
                    //         })
                    //     })

                    // if(dataId !==  this.currentOwnerId){
                        this.currentOwnerId = dataId;

                        // this.localStorage = this.contentShown;
                        this.initialMediaPopulation(item, post);
                    // }else{
                    //     this.accessLocalStorage(item);
                    // }
                    // }
                }
            })

            }catch(e){
                console.log(e);
            }
        }

        initialMediaPopulation(item, post){
            
            // if more than one, show
            // is there a more accessible-friendly html tag for filtrr menus?
            //Have desc with 'read more' under active vid. Exerpt under selection, of exists, otherwise trim

            this.dataCount = 0;
            this.postOutput = 1;
            this.pageCount = 0;
            this.postPage = [];
            this.postPages = [];

  
            if(post.length){
                if(post.length <= this.postOutput){
                    let page = this.postPages.concat(post);
                    this.postPages.push(page);
                }else{
                    while (post.length > this.postOutput){
                        for(let item = 1; item <= this.postOutput; item++){
                            let removed = post.shift();
                            this.postPage.push(removed);
                        }
                        let page = this.postPage.splice(0);
                        this.postPages.push(page);
                    } 

                    if(post.length){
                        this.postPage = post.splice(0);
                        this.postPages.push(this.postPage);
                    }
                }
            }

            if(this.postPages.length){
                        
                this.contentShown = JSON.parse(JSON.stringify(this.postPages));
            }else{
                this.contentShown = [];
            }
            console.log(item)
 
            this.populateMediaColumn(item, this.contentShown[this.currentPages]);
            // console.log(item)
            if(this.newLoad === true){
                console.log(this.newLoad);
                this.renderCurrentMedia(item);
                this.insertPagination(item, this.dataCount, this.pageCount);
            }
 
        }

        renderIsolatedMedia(media){
            // this.currentMedia.classList.remove('aspect-ratio');
            this.currentMedia.classList.add('center-display');
            this.currentMedia.innerHTML = `
                <img src="${media.dataset.full}">
            `;  
   
            // this.videoSrc = this.currentMedia.querySelector('img').dataset.video.replace('watch?v=', 'embed/') + '?autoplay=1';
            // this.playButton = document.querySelector('#play-button');
            // this.playButton.addEventListener('click', ()=>this.playVideo(this.videoSrc));
        }

        renderCurrentMedia(item){
            if(this.newLoad === true){
                this.galleryPosition = 0;
            }
            console.log(this.postField, this.galleryPosition)

            this.currentMedia.innerHTML = `       
                ${item[this.postField][this.galleryPosition].videoSource ? '<div id="play-button-container"><button id="play-button"><div></div></button></div>' : ''}
                <img data-video="${item[this.postField][this.galleryPosition].videoSource}" src="${item[this.postField][this.galleryPosition].image}">
            `;  

            this.videoSrc = this.currentMedia.querySelector('img').dataset.video.replace('watch?v=', 'embed/') + '?autoplay=1';
            
            this.playButton = document.querySelector('#play-button');

            if(this.playButton){
                this.playButton.addEventListener('click', ()=>this.playVideo(this.videoSrc));
                // this.currentMedia.classList.add('aspect-ratio');
                this.currentMedia.classList.remove('center-display');
            }else{
                // this.currentMedia.classList.remove('aspect-ratio');
                this.currentMedia.classList.add('center-display');
            }

        }

        populateMediaColumn(item, content){
            this.mediaColumn.innerHTML = `
      
                    ${content.map(i => `
                    <div data-position="${item[this.postField].findIndex(a=>{return a.id === i.id})}"  class="media-selection">
                        <img class="media-thumb" src="${i.selectImage}">
                        <div class="media-information">
                            <p>${i.title}</p>
                            <p>${i.description}</p>
                        </div>
                    </div>
                `).join('')}
            `;
            
            this.mediaThumb = document.querySelectorAll('.media-thumb');

            if(this.newLoad === true){
                this.mediaThumb[0].classList.add('selected');
                this.currentSelection = document.querySelector('.media-thumb.selected').parentNode.dataset.position;
                // console.log(this.currentSelection, 'red')
            }

            this.mediaThumb.forEach(thumb=>{
                thumb.addEventListener('click', (e)=>{
                    this.mediaThumb.forEach(c=>{c.classList.remove('selected');})
                    e.target.classList.add('selected');
                    // console.log(e.target)
                    this.galleryPosition = e.target.parentNode.dataset.position;
                    this.renderCurrentMedia(item);

                    this.currentSelection = e.target.parentNode.dataset.position;
                    console.log(this.currentSelection)
                    //activate the seperate function that fills the currentMdia container
                })
            })

        }

        insertPagination(item, dataCount, pageCount){
            this.mediaPagination.innerHTML = `
                ${this.postPages.map((page)=>`
                    ${this.postPages.length > 1 ? `<a class="content-page" data-page="${dataCount++}"> ${pageCount += 1}</a>` : ''}
                `).join('')}  
            `;

            if(document.querySelector('.content-page[data-page="0"]')){
                this.firstPageButton = document.querySelector('#media-pagination .content-page[data-page="0"]');
                console.log(document.querySelector('.content-page[data-page="0"]'))
                this.firstPageButton.classList.add('selectedPage');
            }

            let contentPageOptions = document.querySelectorAll('#media-pagination .content-page');

            this.paginationFunctionality(item, contentPageOptions);

            this.newLoad = false;
        }

        paginationFunctionality(item, contentPageOptions){
            contentPageOptions.forEach(el => {
                el.addEventListener('click', e => {
                    let selectedPage = e.currentTarget;

                    console.log(this.currentSelection)

                    this.currentPages = parseInt(selectedPage.dataset.page);
                    // this.initialMediaPopulation(item);
                    this.populateMediaColumn(item, this.contentShown[this.currentPages]);

                    contentPageOptions.forEach(i =>{                          
                        i.classList.remove('selectedPage');
                    })  
                    el.classList.add('selectedPage');

                   if(document.querySelector(`[data-position="${this.currentSelection}"]`)){
                        console.log(document.querySelector(`[data-position="${this.currentSelection}"]`))
                        document.querySelector(`[data-position="${this.currentSelection}"]`).children[0].classList.add('selected');
                   }

                })    

            })
        }
    
        closeMediaReciever(){
            while (this.mediaMenu.firstChild) {
                this.mediaMenu.removeChild(this.mediaMenu.firstChild);
            }

            while (this.mediaColumn.firstChild) {
                this.mediaColumn.removeChild(this.mediaColumn.firstChild);
            }

            while (this.currentMedia.firstChild) {
                this.currentMedia.removeChild(this.currentMedia.firstChild);
            }

            this.mediaReciever.style.display = "none";
            this.isMediaRecieverOpen = false; 
            this.html.classList.remove('freeze');

            this.galleryPosition = 0;
            this.currentPages = 0;

            this.postField = 'gallery';

            this.newLoad = true
        }

        keyPressDispatcher(e){
            // console.log(e.keyCode, this.isMediaRecieverOpen)
            if(e.keyCode === 27 && this.isMediaRecieverOpen){
                this.closeMediaReciever();
            }
        }

        playVideo(videoSrc){
            console.log(videoSrc)

            this.currentMedia.innerHTML = `
                <iframe allowfullscreen="allowfullscreen" src="${videoSrc}"></iframe>
            `;
        }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ShadowBox);

/***/ }),

/***/ "./src/modules/singlePost.js":
/*!***********************************!*\
  !*** ./src/modules/singlePost.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shadowBox__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shadowBox */ "./src/modules/shadowBox.js");


//The simplicity of this is a chance to try to make my pagination code and code in general cleaner and more efficient
class RelatedNews{
    constructor(){
        if(document.querySelector('#singleContainer')){
            this.newsReciever = document.querySelector('#news-reciever');
            this.paginationHolder = document.querySelector('#pagination-holder');
            //interferes with SB. Figure out how to prevent on pages where invalid.
            //Also with all-news if only 1 page
            this.currentPostID = document.querySelector('#mainImageAndStats img').dataset.id;
            this.currentPage = 0;
            this.contentShown;
            this.contentPageOptions;
            this.contentLoaded = false;
            this.vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
            this.events();
        }
    }

    events(){
        this.fetchRelatedNews();
    }

    async fetchRelatedNews(){
        try{
            const response = await axios__WEBPACK_IMPORTED_MODULE_0___default().get(siteData.root_url + '/wp-json/cah/v1/media?related'); 
            const results = response.data;
            const allNews = results.updates.concat(results.news);
            const relatedNews = []; 
            let limit = 1;

            let dataCount = 0;
            let pageCount = 0;
            //Organize the news that's thrown into relatedNews, in date order
            //Consider performing the date order on backend, though could annoyong, given less php experience, but could be beneficial to progress over all 
            if(!this.contentLoaded){
                allNews.forEach(news =>{
                    news.relationships.forEach(r=>{
                        if(r.ID === parseInt(this.currentPostID) && limit <= 2){
                            limit+=1
                            relatedNews.push(news);
                        } 
                    })
                })
    
                if(relatedNews.length){      
                    this.contentShown = JSON.parse(JSON.stringify(relatedNews));
                }else{
                    this.contentShown = [];
                }

                this.populatePaginationHolder(dataCount, pageCount);
            }
                this.populateNewsReciever();

   
        }catch(e){
            console.log(e);
        }
    }

    populateNewsReciever(){
        console.log(this.contentShown[this.currentPage])
        this.newsReciever.innerHTML = `
            <h4>${this.contentShown[this.currentPage].title}</h4>
            <p>${this.contentShown[this.currentPage].caption ? `${this.contentShown[this.currentPage].caption} -` : ''} ${this.contentShown[this.currentPage].date}</p>
            <div class="media-card"><img data-post="${this.contentShown[this.currentPage].postTypePlural}" data-id="${this.contentShown[this.currentPage].id}" src="${this.vw >= 1200 ? `${this.contentShown[this.currentPage].gallery[0].image}` : `${this.contentShown[this.currentPage].gallery[0].selectImage}`}"></div>
            <p>${this.contentShown[this.currentPage].fullDescription}</p>
        `;
  
        _shadowBox__WEBPACK_IMPORTED_MODULE_1__["default"].prototype.events();
        // console.log(ShadowBox.prototype.mediaLink)
    }

    populatePaginationHolder(dataCount, pageCount){
        this.paginationHolder.innerHTML = `
            ${this.contentShown.length ? '<div class="content-pages">' : ''}
                ${this.contentShown.map((page)=>`
                    ${this.contentShown.length > 1 ? `<a class="content-page" data-page="${dataCount++}"> ${pageCount += 1}</a>` : ''}
                `).join('')} 
            ${this.contentShown.length ? '</div>' : ''} 
        `;

        this.firstPageButton = document.querySelector('.content-page[data-page="0"]');

        if(!this.contentLoaded){
            if(this.firstPageButton){
                this.firstPageButton.classList.add('selectedPage');
            }     
            this.contentPageOptions = document.querySelectorAll('.content-page');
            this.paginationFunctionality();
            this.contentLoaded = true;
        }

    }

    paginationFunctionality(){
        this.contentPageOptions.forEach(el => {
            el.onclick = (e) => {
                let selectedPage = e.currentTarget;

                this.currentPage = parseInt(selectedPage.dataset.page);

                this.fetchRelatedNews()

                this.contentPageOptions.forEach(i =>{ 
                    console.log(i)
                    i.classList.forEach((name)=>{
                        i.classList.remove('selectedPage');
                    })
                })  
                el.classList.add('selectedPage');
            }
        })
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RelatedNews); 

/***/ }),

/***/ "./node_modules/axios/package.json":
/*!*****************************************!*\
  !*** ./node_modules/axios/package.json ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"axios","version":"0.21.4","description":"Promise based HTTP client for the browser and node.js","main":"index.js","scripts":{"test":"grunt test","start":"node ./sandbox/server.js","build":"NODE_ENV=production grunt build","preversion":"npm test","version":"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json","postversion":"git push && git push --tags","examples":"node ./examples/server.js","coveralls":"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js","fix":"eslint --fix lib/**/*.js"},"repository":{"type":"git","url":"https://github.com/axios/axios.git"},"keywords":["xhr","http","ajax","promise","node"],"author":"Matt Zabriskie","license":"MIT","bugs":{"url":"https://github.com/axios/axios/issues"},"homepage":"https://axios-http.com","devDependencies":{"coveralls":"^3.0.0","es6-promise":"^4.2.4","grunt":"^1.3.0","grunt-banner":"^0.6.0","grunt-cli":"^1.2.0","grunt-contrib-clean":"^1.1.0","grunt-contrib-watch":"^1.0.0","grunt-eslint":"^23.0.0","grunt-karma":"^4.0.0","grunt-mocha-test":"^0.13.3","grunt-ts":"^6.0.0-beta.19","grunt-webpack":"^4.0.2","istanbul-instrumenter-loader":"^1.0.0","jasmine-core":"^2.4.1","karma":"^6.3.2","karma-chrome-launcher":"^3.1.0","karma-firefox-launcher":"^2.1.0","karma-jasmine":"^1.1.1","karma-jasmine-ajax":"^0.1.13","karma-safari-launcher":"^1.0.0","karma-sauce-launcher":"^4.3.6","karma-sinon":"^1.0.5","karma-sourcemap-loader":"^0.3.8","karma-webpack":"^4.0.2","load-grunt-tasks":"^3.5.2","minimist":"^1.2.0","mocha":"^8.2.1","sinon":"^4.5.0","terser-webpack-plugin":"^4.2.3","typescript":"^4.0.5","url-search-params":"^0.10.0","webpack":"^4.44.2","webpack-dev-server":"^3.11.0"},"browser":{"./lib/adapters/http.js":"./lib/adapters/xhr.js"},"jsdelivr":"dist/axios.min.js","unpkg":"dist/axios.min.js","typings":"./index.d.ts","dependencies":{"follow-redirects":"^1.14.0"},"bundlesize":[{"path":"./dist/axios.min.js","threshold":"5kB"}],"_resolved":"https://registry.npmjs.org/axios/-/axios-0.21.4.tgz","_integrity":"sha512-ut5vewkiu8jjGBdqpM44XxjuCjq9LAKeHVmoVfHVzy8eHgxxq8SbAVQNovDA8mVi05kP0Ea/n/UzcSHcTJQfNg==","_from":"axios@0.21.4"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/style.css */ "./css/style.css");
/* harmony import */ var _css_dots_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../css/dots.css */ "./css/dots.css");
/* harmony import */ var _modules_search__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/search */ "./src/modules/search.js");
/* harmony import */ var _modules_pagination__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/pagination */ "./src/modules/pagination.js");
/* harmony import */ var _modules_all_news__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/all-news */ "./src/modules/all-news.js");
/* harmony import */ var _modules_singlePost__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/singlePost */ "./src/modules/singlePost.js");
/* harmony import */ var _modules_shadowBox__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/shadowBox */ "./src/modules/shadowBox.js");
/* harmony import */ var _modules_mobile__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/mobile */ "./src/modules/mobile.js");
//Look up how to bundle scss here using webpack and make this into an import file(Also use seperate file for gen logic, 
//so can conditional this for forms)










const search = new _modules_search__WEBPACK_IMPORTED_MODULE_2__["default"]();
const pagination = new _modules_pagination__WEBPACK_IMPORTED_MODULE_3__["default"]();
const news = new _modules_all_news__WEBPACK_IMPORTED_MODULE_4__["default"]();
const relatedNews = new _modules_singlePost__WEBPACK_IMPORTED_MODULE_5__["default"]();
const shadowBox = new _modules_shadowBox__WEBPACK_IMPORTED_MODULE_6__["default"]();
const mobileInterfece = new _modules_mobile__WEBPACK_IMPORTED_MODULE_7__["default"]();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVcsVUFBVSxZQUFZLFdBQVcsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssTUFBTSxNQUFNLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsWUFBWSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE1BQU0sT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLFVBQVUsS0FBSyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxhQUFhLFlBQVksV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxVQUFVLEtBQUssTUFBTSxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxZQUFZLFlBQVksYUFBYSxZQUFZLFlBQVksVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxjQUFjLGNBQWMsZUFBZSxjQUFjLGNBQWMsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLGNBQWMsY0FBYyxlQUFlLGVBQWUsY0FBYyxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsVUFBVSxZQUFZLFlBQVksYUFBYSxhQUFhLGFBQWEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsV0FBVyxVQUFVLGNBQWMsY0FBYyxlQUFlLGNBQWMsY0FBYyxXQUFXLFFBQVEsUUFBUSxZQUFZLGFBQWEsV0FBVyxRQUFRLFFBQVEsVUFBVSxTQUFTLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsTUFBTSxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssWUFBWSxLQUFLLEtBQUssV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxTQUFTLFFBQVEsS0FBSyxVQUFVLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxZQUFZLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLE1BQU0sUUFBUSxLQUFLLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFlB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QUFXLFVBQVUsS0FBSyxLQUFLLFdBQVcsTUFBTSxLQUFLLFdBQVcsVUFBVSxNQUFNLEtBQUssV0FBVyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxXQUFXLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLFdBQVcsTUFBTSxLQUFLLFVBQVUsV0FBVyxNQUFNLEtBQUssV0FBVyxNQUFNLEtBQUssVUFBVSxXQUFXLE1BQU0sS0FBSyxXQUFXLE1BQU0sS0FBSyxXQUFXLFVBQVUsS0FBSyxLQUFLLFdBQVcsTUFBTSxLQUFLLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLEtBQUssTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sTUFBTSxVQUFVLEtBQUssS0FBSyxNQUFNLE1BQU0sVUFBVSxLQUFLLEtBQUssTUFBTSxXQUFXLE9BQU8sT0FBTyxXQUFXLFFBQVEsTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLE1BQU0sV0FBVyxLQUFLLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxNQUFNLFVBQVUsT0FBTyxLQUFLLE9BQU8sVUFBVSxPQUFPLE1BQU0sTUFBTSxVQUFVLE9BQU8sS0FBSyxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE1BQU0sTUFBTSxXQUFXLE9BQU8sS0FBSyxPQUFPLFVBQVUsT0FBTyxNQUFNLE1BQU0sV0FBVyxPQUFPLEtBQUssT0FBTyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxNQUFNLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLE1BQU0sV0FBVyxXQUFXLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLE1BQU0sV0FBVyxVQUFVLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLE1BQU0sVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxNQUFNLEtBQUssTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxNQUFNLFdBQVcsV0FBVyxXQUFXLFdBQVcsTUFBTSxLQUFLLE1BQU0sV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLE9BQU8sS0FBSyxPQUFPLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLEtBQUssT0FBTyxXQUFXLFdBQVcsT0FBTyxNQUFNLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLE9BQU8sTUFBTSxNQUFNLFVBQVUsT0FBTyxLQUFLLE9BQU8sV0FBVyxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsT0FBTyxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsV0FBVyxPQUFPLEtBQUssTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLFFBQVEsTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxNQUFNLE9BQU8sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxXQUFXLE1BQU0sT0FBTyxNQUFNLFVBQVUsVUFBVSxNQUFNLEtBQUssTUFBTSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sT0FBTyxNQUFNLFVBQVUsT0FBTyxLQUFLLE1BQU0sV0FBVyxVQUFVLFdBQVcsV0FBVyxRQUFRLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sS0FBSyxVQUFVLFVBQVUsT0FBTyxLQUFLLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsT0FBTyxPQUFPLE1BQU0sVUFBVSxPQUFPLEtBQUssT0FBTyxVQUFVLE9BQU8sT0FBTyxNQUFNLFVBQVUsT0FBTyxLQUFLLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sTUFBTSxXQUFXLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE9BQU8sTUFBTSxVQUFVLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxVQUFVLE9BQU8sT0FBTyxNQUFNLFdBQVcsT0FBTyxLQUFLLE9BQU8sVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxPQUFPLE9BQU8sTUFBTSxVQUFVLE9BQU8sS0FBSyxPQUFPLFVBQVUsT0FBTyxPQUFPLFdBQVcsUUFBUSxPQUFPLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxVQUFVLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLFFBQVEsT0FBTyxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFFBQVEsT0FBTyxLQUFLLFVBQVUsVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFVBQVUsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sTUFBTSxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLEtBQUssVUFBVSxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssT0FBTyxVQUFVLE9BQU8sT0FBTyxLQUFLLFVBQVUsT0FBTyxLQUFLLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sVUFBVSxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLEtBQUssT0FBTyxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxPQUFPLE1BQU0sV0FBVyxPQUFPLEtBQUssT0FBTyxXQUFXLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLE9BQU8sV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLE9BQU8sV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxVQUFVLFFBQVEsT0FBTyxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsT0FBTyxLQUFLLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsT0FBTyxLQUFLLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sS0FBSyxPQUFPLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLE9BQU8sVUFBVSxRQUFRLE9BQU8sTUFBTSxVQUFVLFFBQVEsS0FBSyxPQUFPLFVBQVUsUUFBUSxRQUFRLFdBQVcsV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLFFBQVEsVUFBVSxVQUFVLFVBQVUsVUFBVSxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFFBQVEsUUFBUSxVQUFVLFFBQVEsT0FBTyxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxXQUFXLE9BQU8sUUFBUSxVQUFVLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxTQUFTLE9BQU8sVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsUUFBUSxPQUFPLFVBQVUsUUFBUSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sT0FBTyxXQUFXLFVBQVUsVUFBVSxPQUFPLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxPQUFPLE1BQU0sT0FBTyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsT0FBTyxPQUFPLEtBQUssVUFBVSxXQUFXLFVBQVUsVUFBVSxPQUFPLEtBQUssT0FBTyxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sVUFBVSxRQUFRLE9BQU8sVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxPQUFPLFdBQVcsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFVBQVUsUUFBUSxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sVUFBVSxXQUFXLFVBQVUsV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxRQUFRLFFBQVEsV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsT0FBTyxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsT0FBTyxNQUFNLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFNBQVMsUUFBUSxZQUFZLFdBQVcsU0FBUyxRQUFRLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxTQUFTLFFBQVEsV0FBVyxTQUFTLFFBQVEsTUFBTSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsTUFBTSxRQUFRLE1BQU0sV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxNQUFNLFVBQVUsUUFBUSxRQUFRLFVBQVUsUUFBUSxLQUFLLFFBQVEsV0FBVyxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxVQUFVLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxZQUFZLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsV0FBVyxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksVUFBVSxTQUFTLFdBQVcsV0FBVyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxXQUFXLFdBQVcsVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxVQUFVLFNBQVMsU0FBUyxVQUFVLFVBQVUsV0FBVyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFdBQVcsWUFBWSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxVQUFVLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFVBQVUsU0FBUyxTQUFTLFVBQVUsVUFBVSxXQUFXLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsV0FBVyxZQUFZLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFVBQVUsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsU0FBUyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksV0FBVyxVQUFVLFNBQVMsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxXQUFXLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFdBQVcsV0FBVyxZQUFZLFlBQVksV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxNQUFNLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsTUFBTSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxXQUFXLFVBQVUsU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxNQUFNLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxLQUFLLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxLQUFLLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsS0FBSyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLEtBQUssV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxLQUFLLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsS0FBSyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFdBQVcsV0FBVyxZQUFZLFlBQVksVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxNQUFNLFVBQVUsV0FBVyxTQUFTLFNBQVMsVUFBVSxXQUFXLFNBQVMsTUFBTSxTQUFTLE1BQU0sVUFBVSxXQUFXLFNBQVMsU0FBUyxVQUFVLFdBQVcsU0FBUyxLQUFLLE9BQU8sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsUUFBUSxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sS0FBSyxV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QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQ3JFYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNmQTtBQUN5QjtBQUNXO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUMwQjtBQUNGO0FBQ3hCO0FBQ3NDO0FBQ1E7QUFDUjtBQUNTO0FBQ0g7QUFDRztBQUMvQztBQUNBLG1CQUFtQix1REFBTTtBQUN6Qix1QkFBdUIsMkRBQVU7QUFDakMsaUJBQWlCLHlEQUFJO0FBQ3JCLHdCQUF3QiwyREFBVztBQUNuQyxzQkFBc0IsMERBQVM7QUFDL0IsNEJBQTRCLHVEQUFlLEciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vY3NzL2RvdHMuY3NzIiwid2VicGFjazovL2NhaC8uL2Nzcy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9jc3MvZG90cy5jc3M/NzY0MiIsIndlYnBhY2s6Ly9jYWgvLi9jc3Mvc3R5bGUuY3NzP2RhMWYiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9hbGwtbmV3cy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9tb2JpbGUuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvcGFnaW5hdGlvbi5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9zZWFyY2guanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvc2hhZG93Qm94LmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3NpbmdsZVBvc3QuanMiLCJ3ZWJwYWNrOi8vY2FoL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NhaC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NhaC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2NhaC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NhaC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBjb25maWcudHJhbnNpdGlvbmFsICYmIGNvbmZpZy50cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbDtcblxuICBpZiAodHJhbnNpdGlvbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWxpZGF0b3IuYXNzZXJ0T3B0aW9ucyh0cmFuc2l0aW9uYWwsIHtcbiAgICAgIHNpbGVudEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgZm9yY2VkSlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBjbGFyaWZ5VGltZW91dEVycm9yOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpXG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBza2lwcGVkIGludGVyY2VwdG9yc1xuICB2YXIgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdmFyIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHRydWU7XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGlmICh0eXBlb2YgaW50ZXJjZXB0b3IucnVuV2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnRlcmNlcHRvci5ydW5XaGVuKGNvbmZpZykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9yLnN5bmNocm9ub3VzO1xuXG4gICAgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoIXN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycykge1xuICAgIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG5cbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjaGFpbiwgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4pO1xuICAgIGNoYWluID0gY2hhaW4uY29uY2F0KHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbik7XG5cbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG5cbiAgdmFyIG5ld0NvbmZpZyA9IGNvbmZpZztcbiAgd2hpbGUgKHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHZhciBvbkZ1bGZpbGxlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdmFyIG9uUmVqZWN0ZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHRyeSB7XG4gICAgICBuZXdDb25maWcgPSBvbkZ1bGZpbGxlZChuZXdDb25maWcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvblJlamVjdGVkKGVycm9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcHJvbWlzZSA9IGRpc3BhdGNoUmVxdWVzdChuZXdDb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cblxuICB3aGlsZSAocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4ocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCksIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgIGNvbmZpZyxcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgY29uZmlnLFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIHZhciBjb250ZXh0ID0gdGhpcyB8fCBkZWZhdWx0cztcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4uY2FsbChjb250ZXh0LCBkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9jb3JlL2VuaGFuY2VFcnJvcicpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVNhZmVseShyYXdWYWx1ZSwgcGFyc2VyLCBlbmNvZGVyKSB7XG4gIGlmICh1dGlscy5pc1N0cmluZyhyYXdWYWx1ZSkpIHtcbiAgICB0cnkge1xuICAgICAgKHBhcnNlciB8fCBKU09OLnBhcnNlKShyYXdWYWx1ZSk7XG4gICAgICByZXR1cm4gdXRpbHMudHJpbShyYXdWYWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubmFtZSAhPT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoZW5jb2RlciB8fCBKU09OLnN0cmluZ2lmeSkocmF3VmFsdWUpO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cbiAgdHJhbnNpdGlvbmFsOiB7XG4gICAgc2lsZW50SlNPTlBhcnNpbmc6IHRydWUsXG4gICAgZm9yY2VkSlNPTlBhcnNpbmc6IHRydWUsXG4gICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogZmFsc2VcbiAgfSxcblxuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpIHx8IChoZWFkZXJzICYmIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID09PSAnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHJldHVybiBzdHJpbmdpZnlTYWZlbHkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICB2YXIgdHJhbnNpdGlvbmFsID0gdGhpcy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwa2cgPSByZXF1aXJlKCcuLy4uLy4uL3BhY2thZ2UuanNvbicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xudmFyIGN1cnJlbnRWZXJBcnIgPSBwa2cudmVyc2lvbi5zcGxpdCgnLicpO1xuXG4vKipcbiAqIENvbXBhcmUgcGFja2FnZSB2ZXJzaW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gdGhhblZlcnNpb25cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uLCB0aGFuVmVyc2lvbikge1xuICB2YXIgcGtnVmVyc2lvbkFyciA9IHRoYW5WZXJzaW9uID8gdGhhblZlcnNpb24uc3BsaXQoJy4nKSA6IGN1cnJlbnRWZXJBcnI7XG4gIHZhciBkZXN0VmVyID0gdmVyc2lvbi5zcGxpdCgnLicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGlmIChwa2dWZXJzaW9uQXJyW2ldID4gZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChwa2dWZXJzaW9uQXJyW2ldIDwgZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvclxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgdmFyIGlzRGVwcmVjYXRlZCA9IHZlcnNpb24gJiYgaXNPbGRlclZlcnNpb24odmVyc2lvbik7XG5cbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIHBrZy52ZXJzaW9uICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkIGluICcgKyB2ZXJzaW9uKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGVwcmVjYXRlZCAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNPbGRlclZlcnNpb246IGlzT2xkZXJWZXJzaW9uLFxuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJAY2hhcnNldCBcXFwiVVRGLThcXFwiO1xcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRWxhc3RpY1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWVsYXN0aWMge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1lbGFzdGljIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZWxhc3RpYyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcbi5kb3QtZWxhc3RpYzo6YmVmb3JlLCAuZG90LWVsYXN0aWM6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWVsYXN0aWM6OmJlZm9yZSB7XFxuICBsZWZ0OiAtOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZWxhc3RpYy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1lbGFzdGljLWJlZm9yZSAxcyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcbi5kb3QtZWxhc3RpYzo6YWZ0ZXIge1xcbiAgbGVmdDogOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZWxhc3RpYy1hZnRlciAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWVsYXN0aWMtYWZ0ZXIgMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWVsYXN0aWMtYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMC42Nyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWVsYXN0aWMtYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMC42Nyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZWxhc3RpYyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1lbGFzdGljIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZWxhc3RpYy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAwLjY3KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1lbGFzdGljLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgUHVsc2VcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1wdWxzZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAtNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1wdWxzZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcHVsc2UgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4yNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC4yNXM7XFxufVxcbi5kb3QtcHVsc2U6OmJlZm9yZSwgLmRvdC1wdWxzZTo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3QtcHVsc2U6OmJlZm9yZSB7XFxuICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXB1bHNlLWJlZm9yZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcHVsc2UtYmVmb3JlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDBzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDBzO1xcbn1cXG4uZG90LXB1bHNlOjphZnRlciB7XFxuICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1wdWxzZS1hZnRlciAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcHVsc2UtYWZ0ZXIgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC41cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXB1bHNlLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1wdWxzZS1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1wdWxzZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1wdWxzZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXB1bHNlLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LXB1bHNlLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRmxhc2hpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1mbGFzaGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGxpbmVhciBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGxpbmVhciBhbHRlcm5hdGU7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC41cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbn1cXG4uZG90LWZsYXNoaW5nOjpiZWZvcmUsIC5kb3QtZmxhc2hpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWZsYXNoaW5nOjpiZWZvcmUge1xcbiAgbGVmdDogLTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDBzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDBzO1xcbn1cXG4uZG90LWZsYXNoaW5nOjphZnRlciB7XFxuICBsZWZ0OiA5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAxcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAxcztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mbGFzaGluZyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICB9XFxuICA1MCUsIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDY1LCA4OCwgOTUsIDAuMik7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWZsYXNoaW5nIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSwgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNjUsIDg4LCA5NSwgMC4yKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBDb2xsaXNpb25cXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1jb2xsaXNpb24ge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LWNvbGxpc2lvbjo6YmVmb3JlLCAuZG90LWNvbGxpc2lvbjo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtY29sbGlzaW9uOjpiZWZvcmUge1xcbiAgbGVmdDogLTU1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtY29sbGlzaW9uLWJlZm9yZSAycyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4uZG90LWNvbGxpc2lvbjo6YWZ0ZXIge1xcbiAgbGVmdDogNTVweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtY29sbGlzaW9uLWFmdGVyIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1hZnRlciAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDFzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDFzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1iZWZvcmUge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC05OXB4KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtY29sbGlzaW9uLWJlZm9yZSB7XFxuICAwJSwgNTAlLCA3NSUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTk5cHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1hZnRlciB7XFxuICAwJSwgNTAlLCA3NSUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoOTlweCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1hZnRlciB7XFxuICAwJSwgNTAlLCA3NSUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoOTlweCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgUmV2b2x1dGlvblxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXJldm9sdXRpb24ge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LXJldm9sdXRpb246OmJlZm9yZSwgLmRvdC1yZXZvbHV0aW9uOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuLmRvdC1yZXZvbHV0aW9uOjpiZWZvcmUge1xcbiAgbGVmdDogMDtcXG4gIHRvcDogLTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAyNy41cHggMTI2LjVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcmV2b2x1dGlvbiAxLjRzIGxpbmVhciBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcmV2b2x1dGlvbiAxLjRzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuLmRvdC1yZXZvbHV0aW9uOjphZnRlciB7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiAtMTk4cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAyNy41cHggMjI1LjVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcmV2b2x1dGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXJldm9sdXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXJldm9sdXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgQ2Fyb3VzZWxcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1jYXJvdXNlbCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWNhcm91c2VsIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1jYXJvdXNlbCAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1jYXJvdXNlbCB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMXB4ICM0MTU4NWYsIDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZiwgOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWNhcm91c2VsIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5OTlweCAwIDAgMXB4ICM0MTU4NWYsIDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZiwgOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5OTlweCAwIDAgMXB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAxcHggIzQxNTg1ZiwgMTAwOThweCAwIDAgLTFweCAjNDE1ODVmLCA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBUeXBpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC10eXBpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC10eXBpbmcgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXR5cGluZyAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC10eXBpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTEwcHggMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IC0xMHB4IDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IC0xMHB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC10eXBpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTEwcHggMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IC0xMHB4IDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IC0xMHB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFdpbmRtaWxsXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtd2luZG1pbGwge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAtMTBweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIHRyYW5zZm9ybS1vcmlnaW46IDVweCAxNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC13aW5kbWlsbCAycyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXdpbmRtaWxsIDJzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuLmRvdC13aW5kbWlsbDo6YmVmb3JlLCAuZG90LXdpbmRtaWxsOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuLmRvdC13aW5kbWlsbDo6YmVmb3JlIHtcXG4gIGxlZnQ6IC04LjY2MjU0cHg7XFxuICB0b3A6IDE1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3Qtd2luZG1pbGw6OmFmdGVyIHtcXG4gIGxlZnQ6IDguNjYyNTRweDtcXG4gIHRvcDogMTVweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC13aW5kbWlsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooNzIwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtd2luZG1pbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDcyMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgQnJpY2tzXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtYnJpY2tzIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRvcDogMzAuNXB4O1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtYnJpY2tzIDJzIGluZmluaXRlIGVhc2U7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWJyaWNrcyAycyBpbmZpbml0ZSBlYXNlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWJyaWNrcyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDguMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAyNSUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDQxLjY2NyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA1OC4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDY2LjY2NiUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgOTEuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1icmlja3Mge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA0MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTguMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjYlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDkxLjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBGbG9hdGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWZsb2F0aW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmcgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMTUsIDAuNiwgMC45LCAwLjEpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbG9hdGluZyAzcyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4xNSwgMC42LCAwLjksIDAuMSk7XFxufVxcbi5kb3QtZmxvYXRpbmc6OmJlZm9yZSwgLmRvdC1mbG9hdGluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtZmxvYXRpbmc6OmJlZm9yZSB7XFxuICBsZWZ0OiAtMTJweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYmVmb3JlIDNzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbG9hdGluZy1iZWZvcmUgM3MgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XFxufVxcbi5kb3QtZmxvYXRpbmc6OmFmdGVyIHtcXG4gIGxlZnQ6IC0yNHB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbG9hdGluZy1hZnRlciAzcyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC40LCAwLCAxLCAxKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYWZ0ZXIgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMSwgMSk7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxvYXRpbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKC01MCUgLSAyNy41cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDEyNy41cHgpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1mbG9hdGluZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoLTUwJSAtIDI3LjVweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDEyNy41cHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgMTI3LjVweCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxvYXRpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBsZWZ0OiAtMTJweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1mbG9hdGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGxlZnQ6IC0xMnB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxvYXRpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBsZWZ0OiAtMjRweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZsb2F0aW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTI0cHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZpcmVcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1maXJlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAtMC44NXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuODVzO1xcbn1cXG4uZG90LWZpcmU6OmJlZm9yZSwgLmRvdC1maXJlOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1maXJlOjpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTEuODVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0xLjg1cztcXG59XFxuLmRvdC1maXJlOjphZnRlciB7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAtMi44NXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogLTIuODVzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZpcmUge1xcbiAgMSUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtMzcuMTI1cHggMCAycHggIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWZpcmUge1xcbiAgMSUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtMzcuMTI1cHggMCAycHggIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgU3BpblxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXNwaW4ge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXNwaW4gMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXNwaW4gMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc3BpbiB7XFxuICAwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDEyLjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMzcuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA2Mi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDg3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1zcGluIHtcXG4gIDAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMTIuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAzNy41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDYyLjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODcuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRmFsbGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWZhbGxpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mYWxsaW5nIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmFsbGluZyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4xcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjFzO1xcbn1cXG4uZG90LWZhbGxpbmc6OmJlZm9yZSwgLmRvdC1mYWxsaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1mYWxsaW5nOjpiZWZvcmUge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mYWxsaW5nLWJlZm9yZSAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZhbGxpbmctYmVmb3JlIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcXG59XFxuLmRvdC1mYWxsaW5nOjphZnRlciB7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZhbGxpbmctYWZ0ZXIgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mYWxsaW5nLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmFsbGluZyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZmFsbGluZyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mYWxsaW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZmFsbGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmFsbGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZmFsbGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBTdHJldGNoaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtc3RyZXRjaGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuMjUsIDEuMjUpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zdHJldGNoaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmcgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1zdHJldGNoaW5nOjpiZWZvcmUsIC5kb3Qtc3RyZXRjaGluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3Qtc3RyZXRjaGluZzo6YmVmb3JlIHtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZy1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZy1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1zdHJldGNoaW5nOjphZnRlciB7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZy1hZnRlciAycyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMjUsIDEuMjUpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOCwgMC44KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMjUsIDEuMjUpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgsIDAuOCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTIwcHgpIHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0yMHB4KSBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgyMHB4KSBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBHYXRoZXJpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1nYXRoZXJpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG59XFxuLmRvdC1nYXRoZXJpbmc6OmJlZm9yZSwgLmRvdC1nYXRoZXJpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogLTUwcHg7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBvcGFjaXR5OiAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWdhdGhlcmluZyAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1nYXRoZXJpbmcgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1nYXRoZXJpbmc6OmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuNXM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZ2F0aGVyaW5nIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMzUlLCA2MCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNTBweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwMHB4KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZ2F0aGVyaW5nIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMzUlLCA2MCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNTBweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwMHB4KTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogR29vZXkgRWZmZWN0XFxuICogRG90IEhvdXJnbGFzc1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWhvdXJnbGFzcyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0b3A6IC05OXB4O1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG4gIHRyYW5zZm9ybS1vcmlnaW46IDI3LjVweCAxMjYuNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1ob3VyZ2xhc3MgMi40cyBpbmZpbml0ZSBlYXNlLWluLW91dDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzIDIuNHMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC42cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjZzO1xcbn1cXG4uZG90LWhvdXJnbGFzczo6YmVmb3JlLCAuZG90LWhvdXJnbGFzczo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAwO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3QtaG91cmdsYXNzOjpiZWZvcmUge1xcbiAgdG9wOiAxOThweDtcXG59XFxuLmRvdC1ob3VyZ2xhc3M6OmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzLWFmdGVyIDIuNHMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNjUsIDAuMDUsIDAuMzYsIDEpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1ob3VyZ2xhc3MtYWZ0ZXIgMi40cyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC42NSwgMC4wNSwgMC4zNiwgMSk7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtaG91cmdsYXNzIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTgwZGVnKTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1ob3VyZ2xhc3Mge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTgwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigxODBkZWcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtaG91cmdsYXNzLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE5OHB4KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1ob3VyZ2xhc3MtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTk4cHgpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE5OHB4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBPdmVydGFraW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtb3ZlcnRha2luZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBtYXJnaW46IC0xcHggMDtcXG4gIGJveC1zaGFkb3c6IDAgLTIwcHggMCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxufVxcbi5kb3Qtb3ZlcnRha2luZzo6YmVmb3JlLCAuZG90LW92ZXJ0YWtpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBjb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGJveC1zaGFkb3c6IDAgLTIwcHggMCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3Qtb3ZlcnRha2luZzo6YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAycyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAycyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjNzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuM3M7XFxufVxcbi5kb3Qtb3ZlcnRha2luZzo6YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1vdmVydGFraW5nIDEuNXMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMS41cyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjZzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuNnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtb3ZlcnRha2luZyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtb3ZlcnRha2luZyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogR29vZXkgRWZmZWN0XFxuICogRG90IFNodXR0bGVcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1zaHV0dGxlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OXB4O1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG59XFxuLmRvdC1zaHV0dGxlOjpiZWZvcmUsIC5kb3Qtc2h1dHRsZTo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG59XFxuLmRvdC1zaHV0dGxlOjpiZWZvcmUge1xcbiAgbGVmdDogOTlweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc2h1dHRsZSAycyBpbmZpbml0ZSBlYXNlLW91dDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtc2h1dHRsZSAycyBpbmZpbml0ZSBlYXNlLW91dDtcXG59XFxuLmRvdC1zaHV0dGxlOjphZnRlciB7XFxuICBsZWZ0OiAxOThweDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zaHV0dGxlIHtcXG4gIDAlLCA1MCUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI5N3B4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyOTdweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXNodXR0bGUge1xcbiAgMCUsIDUwJSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjk3cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI5N3B4KTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogRW1vamlcXG4gKiBEb3QgQm91bmNpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1ib3VuY2luZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBmb250LXNpemU6IDEwcHg7XFxufVxcbi5kb3QtYm91bmNpbmc6OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwi4pq98J+PgPCfj5BcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1ib3VuY2luZyAxcyBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtYm91bmNpbmcgMXMgaW5maW5pdGU7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtYm91bmNpbmcge1xcbiAgMCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICAgICAgICAgICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1pbjtcXG4gIH1cXG4gIDM0JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAzNSUge1xcbiAgICB0b3A6IDIwcHg7XFxuICAgIC13ZWJraXQtYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1vdXQ7XFxuICAgICAgICAgICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1vdXQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS41LCAwLjUpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDkwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtYm91bmNpbmcge1xcbiAgMCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICAgICAgICAgICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1pbjtcXG4gIH1cXG4gIDM0JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAzNSUge1xcbiAgICB0b3A6IDIwcHg7XFxuICAgIC13ZWJraXQtYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1vdXQ7XFxuICAgICAgICAgICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1vdXQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS41LCAwLjUpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDkwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogRW1vamlcXG4gKiBEb3QgUm9sbGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXJvbGxpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgZm9udC1zaXplOiAxMHB4O1xcbn1cXG4uZG90LXJvbGxpbmc6OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXJvbGxpbmcgM3MgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXJvbGxpbmcgM3MgaW5maW5pdGU7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtcm9sbGluZyB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDM0LjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDY2LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDY3LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXJvbGxpbmcge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAzNC4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA2Ny42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbn0vKiMgc291cmNlTWFwcGluZ1VSTD1kb3RzLmNzcy5tYXAgKi9cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9jc3MvZG90cy5jc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZWxhc3RpYy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fbWl4aW5zLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL192YXJpYWJsZXMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1wdWxzZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWZsYXNoaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtY29sbGlzaW9uLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtcmV2b2x1dGlvbi5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWNhcm91c2VsLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtdHlwaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtd2luZG1pbGwuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1icmlja3Muc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1mbG9hdGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWZpcmUuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1zcGluLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZmFsbGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXN0cmV0Y2hpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1nYXRoZXJpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1ob3VyZ2xhc3Muc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1vdmVydGFraW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtc2h1dHRsZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWJvdW5jaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtcm9sbGluZy5zY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBLGdCQUFnQjtBQ0FoQjs7OztFQUFBO0FBTUE7RUFDRSxrQkFBQTtFQ0lBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUZHVixpREFBQTtVQUFBLHlDQUFBO0FER0Y7QUNERTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBREVKO0FDQ0U7RUFDRSxXQUFBO0VDWEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRmtCUix3REFBQTtVQUFBLGdEQUFBO0FER0o7QUNBRTtFQUNFLFVFakJVO0VERlosV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRjBCUix1REFBQTtVQUFBLCtDQUFBO0FESUo7O0FDQUE7RUFDRTtJQUNFLHNCQUFBO0VE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QUFBO1VBQUEsNkNBQUE7RUFDQSwyQkFBQTtVQUFBLG1CQUFBO0FMcUtKO0FLbEtFO0VBQ0UsVUZuQlU7RURGWixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VFNEJSLHFEQUFBO1VBQUEsNkNBQUE7RUFDQSwyQkFBQTtVQUFBLG1CQUFBO0FMc0tKOztBS2xLQTtFQUNFO0lBQ0UseUJBQUE7RUxxS0Y7RUtsS0E7SUFFRSx1Q0FBQTtFTG1LRjtBQUNGOztBSzNLQTtFQUNFO0lBQ0UseUJBQUE7RUxxS0Y7RUtsS0E7SUFFRSx1Q0FBQTtFTG1LRjtBQUNGO0FNcE5BOzs7O0VBQUE7QUFNQTtFQUNFLGtCQUFBO0VKSUEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtBSHlOWjtBTXRORTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBTnVOSjtBTXBORTtFQUNFLFdBQUE7RUpURixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VHZ0JSLDJEQUFBO1VBQUEsbURBQUE7QU53Tko7QU1yTkU7RUFDRSxVSHhCUTtFRE9WLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUd3QlIsMERBQUE7VUFBQSxrREFBQTtFQUNBLDJCQUFBO1VBQUEsbUJBQUE7QU55Tko7O0FNck5BO0VBQ0U7SUFJRSx3QkFBQTtFTnFORjtFTWxOQTtJQUNFLDRCQUFBO0VOb05GO0FBQ0Y7O0FNOU5BO0VBQ0U7SUFJRSx3QkFBQTtFTnFORjtFTWxOQTtJQUNFLDRCQUFBO0VOb05GO0FBQ0Y7QU1qTkE7RUFDRTtJQUlFLHdCQUFBO0VOZ05GO0VNN01BO0lBQ0UsMkJBQUE7RU4rTUY7QUFDRjtBTXpOQTtFQUNFO0lBSUUsd0JBQUE7RU5nTkY7RU03TUE7SUFDRSwyQkFBQTtFTitNRjtBQUNGO0FPM1FBOzs7O0VBQUE7QUFNQTtFQUNFLGtCQUFBO0VMSUEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtBSGdSWjtBTzdRRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0FQOFFKO0FPM1FFO0VBQ0UsT0FBQTtFQUNBLFVBQUE7RUxURixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VJZ0JSLGdDQUFBO0VBQ0Esc0RBQUE7VUFBQSw4Q0FBQTtBUCtRSjtBTzVRRTtFQUNFLE9BQUE7RUFDQSxXQUFBO0VMbkJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUkwQlIsZ0NBQUE7RUFDQSxvREFBQTtVQUFBLDRDQUFBO0FQZ1JKOztBTzVRQTtFQUNFO0lBQ0UsNkNBQUE7RVArUUY7RU81UUE7SUFDRSwrQ0FBQTtFUDhRRjtBQUNGOztBT3JSQTtFQUNFO0lBQ0UsNkNBQUE7RVArUUY7RU81UUE7SUFDRSwrQ0FBQTtFUDhRRjtBQUNGO0FRNVRBOzs7O0VBQUE7QUFXQTtFQUNFLGtCQUFBO0VBQ0EsYUFQUztFTktULFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUtTViw2RUFDRTtFQUdGLG9EQUFBO1VBQUEsNENBQUE7QVJ1VEY7O0FRcFRBO0VBQ0U7SUFDRSxxRkFDRTtFUnNUSjtFUWpUQTtJQUNFLHFGQUNFO0VSa1RKO0VRN1NBO0lBQ0UscUZBQ0U7RVI4U0o7QUFDRjs7QVFoVUE7RUFDRTtJQUNFLHFGQUNFO0VSc1RKO0VRalRBO0lBQ0UscUZBQ0U7RVJrVEo7RVE3U0E7SUFDRSxxRkFDRTtFUjhTSjtBQUNGO0FTeFZBOzs7O0VBQUE7QUFXQTtFQUNFLGtCQUFBO0VBQ0EsYUFQUztFUEtULFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RU1TViw2RUFDRTtFQUdGLGtEQUFBO1VBQUEsMENBQUE7QVRtVkY7O0FTaFZBO0VBQ0U7SUFDRSw2RUFDRTtFVGtWSjtFUzdVQTtJQUNFLGlGQUNFO0VUOFVKO0VTelVBO0lBQ0UsNkVBQ0U7RVQwVUo7RVNyVUE7SUFDRSxpRkFDRTtFVHNVSjtFU2pVQTtJQUNFLDZFQUNFO0VUa1VKO0VTN1RBO0lBQ0UsaUZBQ0U7RVQ4VEo7RVN6VEE7SUFDRSw2RUFDRTtFVDBUSjtBQUNGOztBU3hXQTtFQUNFO0lBQ0UsNkVBQ0U7RVRrVko7RVM3VUE7SUFDRSxpRkFDRTtFVDhVSjtFU3pVQTtJQUNFLDZFQUNFO0VUMFVKO0VTclVBO0lBQ0UsaUZBQ0U7RVRzVUo7RVNqVUE7SUFDRSw2RUFDRTtFVGtVSjtFUzdUQTtJQUNFLGlGQUNFO0VUOFRKO0VTelRBO0lBQ0UsNkVBQ0U7RVQwVEo7QUFDRjtBVWhZQTs7OztFQUFBO0FBVUE7RUFDRSxrQkFBQTtFQUNBLFVBQUE7RVJEQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VPUVYsMEJBQUE7RUFDQSxrREFBQTtVQUFBLDBDQUFBO0FWK1hGO0FVN1hFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7QVY4WEo7QVUzWEU7RUFDRSxnQkFBQTtFQUNBLFNBQUE7RVJqQkYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtBSHNaWjtBVTdYRTtFQUNFLGVBQUE7RUFDQSxTQUFBO0VSeEJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUgrWlo7O0FVOVhBO0VBQ0U7SUFDRSw2Q0FBQTtFVmlZRjtFVTlYQTtJQUNFLCtDQUFBO0VWZ1lGO0FBQ0Y7O0FVdllBO0VBQ0U7SUFDRSw2Q0FBQTtFVmlZRjtFVTlYQTtJQUNFLCtDQUFBO0VWZ1lGO0FBQ0Y7QVdoYkE7Ozs7RUFBQTtBQWNBO0VBQ0Usa0JBQUE7RUFDQSxXQVRRO0VBVVIsYUFUUztFVEdULFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVFhVix1RkFDRTtFQUdGLDhDQUFBO1VBQUEsc0NBQUE7QVh3YUY7O0FXcmFBO0VBQ0U7SUFDRSx1RkFDRTtFWHVhSjtFV2xhQTtJQUNFLHdGQUNFO0VYbWFKO0VXOVpBO0lBQ0UsNEZBQ0U7RVgrWko7RVcxWkE7SUFDRSwyRkFDRTtFWDJaSjtFV3RaQTtJQUNFLHVGQUNFO0VYdVpKO0VXbFpBO0lBQ0Usd0ZBQ0U7RVhtWko7RVc5WUE7SUFDRSw0RkFDRTtFWCtZSjtFVzFZQTtJQUNFLDJGQUNFO0VYMllKO0VXdFlBO0lBQ0UsdUZBQ0U7RVh1WUo7RVdsWUE7SUFDRSx3RkFDRTtFWG1ZSjtFVzlYQTtJQUNFLDRGQUNFO0VYK1hKO0VXMVhBO0lBQ0UsMkZBQ0U7RVgyWEo7RVd0WEE7SUFDRSx1RkFDRTtFWHVYSjtBQUNGOztBVy9jQTtFQUNFO0lBQ0UsdUZBQ0U7RVh1YUo7RVdsYUE7SUFDRSx3RkFDRTtFWG1hSjtFVzlaQTtJQUNFLDRGQUNFO0VYK1pKO0VXMVpBO0lBQ0UsMkZBQ0U7RVgyWko7RVd0WkE7SUFDRSx1RkFDRTtFWHVaSjtFV2xaQTtJQUNFLHdGQUNFO0VYbVpKO0VXOVlBO0lBQ0UsNEZBQ0U7RVgrWUo7RVcxWUE7SUFDRSwyRkFDRTtFWDJZSjtFV3RZQTtJQUNFLHVGQUNFO0VYdVlKO0VXbFlBO0lBQ0Usd0ZBQ0U7RVhtWUo7RVc5WEE7SUFDRSw0RkFDRTtFWCtYSjtFVzFYQTtJQUNFLDJGQUNFO0VYMlhKO0VXdFhBO0lBQ0UsdUZBQ0U7RVh1WEo7QUFDRjtBWTNlQTs7OztFQUFBO0FBU0E7RUFDRSxrQkFBQTtFVkNBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVNNViw2RUFBQTtVQUFBLHFFQUFBO0FaMmVGO0FZemVFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0FaMGVKO0FZdmVFO0VBQ0UsV0FBQTtFVmRGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVNxQlIsOERBQUE7VUFBQSxzREFBQTtBWjJlSjtBWXhlRTtF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Z0RBQUE7RWYwbkJGO0FBQ0Y7QWdCaHVCQTs7OztFQUFBO0FBU0E7RUFDRSxrQkFBQTtFZENBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RWFNViw0QkFBQTtFQUNBLHFEQUFBO1VBQUEsNkNBQUE7QWhCZ3VCRjtBZ0I5dEJFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0FoQit0Qko7QWdCNXRCRTtFZGRBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RWFvQlIsNERBQUE7VUFBQSxvREFBQTtBaEJpdUJKO0FnQjl0QkU7RWRwQkEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFYTBCUiwyREFBQTtVQUFBLG1EQUFBO0FoQm11Qko7O0FnQi90QkE7RUFDRTtJQUNFLDRCQUFBO0VoQmt1QkY7RWdCL3RCQTtJQUVFLDBCQUFBO0VoQmd1QkY7RWdCN3RCQTtJQUNFLDRCQUFBO0VoQit0QkY7QUFDRjs7QWdCM3VCQTtFQUNFO0lBQ0UsNEJBQUE7RWhCa3VCRjtFZ0IvdEJBO0lBRUUsMEJBQUE7RWhCZ3VCRjtFZ0I3dEJBO0lBQ0UsNEJBQUE7RWhCK3RCRjtBQUNGO0FnQjV0QkE7RUFDRTtJQUNFLHVDQUFBO0VoQjh0QkY7RWdCM3RCQTtJQUVFLHVDQUFBO0VoQjR0QkY7RWdCenRCQTtJQUNFLHVDQUFBO0VoQjJ0QkY7QUFDRjtBZ0J2dUJBO0VBQ0U7SUFDRSx1Q0FBQTtFaEI4dEJGO0VnQjN0QkE7SUFFRSx1Q0FBQTtFaEI0dEJGO0VnQnp0QkE7SUFDRSx1Q0FBQTtFaEIydEJGO0FBQ0Y7QWdCeHRCQTtFQUNFO0lBQ0UsdUNBQUE7RWhCMHRCRjtFZ0J2dEJBO0lBRUUsc0NBQUE7RWhCd3RCRjtFZ0JydEJBO0lBQ0UsdUNBQUE7RWhCdXRCRjtBQUNGO0FnQm51QkE7RUFDRTtJQUNFLHVDQUFBO0VoQjB0QkY7RWdCdnRCQTtJQUVFLHNDQUFBO0VoQnd0QkY7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QSwyQ0FBQTtFdEJzaUNGO0VzQm5pQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCcWlDRjtFc0JsaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0Qm9pQ0Y7RXNCamlDQTtJQUNFLGFBQUE7SUFDQSwyQ0FBQTtFdEJtaUNGO0VzQmhpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCa2lDRjtBQUNGOztBc0I5a0NBO0VBQ0U7SUFDRSxZQUFBO0lBQ0EsMENBQUE7RXRCMGlDRjtFc0J2aUNBO0lBQ0UsWUFBQTtJQUNBLDJDQUFBO0V0QnlpQ0Y7RXNCdGlDQTtJQUNFLFlBQUE7SUFDQSwwQ0FBQTtFdEJ3aUNGO0VzQnJpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCdWlDRjtFc0JwaUNBO0lBQ0UsYUFBQTtJQUNBLDJDQUFBO0V0QnNpQ0Y7RXNCbmlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJxaUNGO0VzQmxpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCb2lDRjtFc0JqaUNBO0lBQ0UsYUFBQTtJQUNBLDJDQUFBO0V0Qm1pQ0Y7RXNCaGlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJraUNGO0FBQ0YsQ0FBQSxtQ0FBQVwiLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiQGNoYXJzZXQgXFxcIlVURi04XFxcIjtcXG5odG1sIHtcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIG1hcmdpbjogMDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDc2N3B4KSB7XFxuICBodG1sIHtcXG4gICAgZm9udC1zaXplOiAxdnc7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIGh0bWwge1xcbiAgICBmb250LXNpemU6IDEuODV2aDtcXG4gIH1cXG59XFxuaHRtbC5mcmVlemUge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuYm9keSB7XFxuICBtYXJnaW46IDA7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG5cXG5oMSB7XFxuICBtYXJnaW46IDA7XFxuICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgZm9udC1zaXplOiA0cmVtO1xcbn1cXG5cXG5oMiB7XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG4gIG1hcmdpbjogMDtcXG59XFxuaDIgYSB7XFxuICBmb250LXNpemU6IDEuOXJlbTtcXG59XFxuXFxuaDMge1xcbiAgZm9udC1zaXplOiAyLjNyZW07XFxuICBtYXJnaW46IDA7XFxufVxcblxcbmEge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6IGluaGVyaXQ7XFxufVxcblxcbmEge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG5hLmhpZGRlbiwgYS5zZWxlY3RlZFBhZ2Uge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcblxcbmEuaGlkZGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxufVxcblxcbmEuc2VsZWN0ZWRQYWdlIHtcXG4gIGNvbG9yOiAjZThhYTc3O1xcbiAgZmlsdGVyOiBzYXR1cmF0ZSgxMjAlKTtcXG59XFxuXFxuKi5oaWRkZW4ge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG5cXG5kaXYsIGJ1dHRvbiB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG5idXR0b24ge1xcbiAgYm9yZGVyOiBub25lO1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcblxcbmxpIHtcXG4gIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcXG59XFxuXFxuI292ZXJhbGxDb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAwO1xcbn1cXG4jb3ZlcmFsbENvbnRhaW5lci5mYWRlZCB7XFxuICBmaWx0ZXI6IG9wYWNpdHkoNDAlKTtcXG59XFxuXFxuLmNvbnRlbnRDb250YWluZXIge1xcbiAgaGVpZ2h0OiBpbml0aWFsO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBtYXJnaW46IDQlIDA7XFxuICBtYXJnaW4tYm90dG9tOiA1JTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRDb250YWluZXIgPiBkaXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgcGFkZGluZy10b3A6IDUuNXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDc2N3B4KSB7XFxuICAuY29udGVudENvbnRhaW5lciA+IGRpdiB7XFxuICAgIHdpZHRoOiA5NSU7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Q29udGFpbmVyID4gZGl2IHtcXG4gICAgd2lkdGg6IDg1JTtcXG4gIH1cXG59XFxuLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkIC50ZXh0Qm94IC5jb250ZW50LXBhZ2VzIHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkIC50ZXh0Qm94IC5jb250ZW50LXBhZ2VzIGEge1xcbiAgZm9udC1zaXplOiAxLjc1cmVtO1xcbn1cXG5cXG4udGl0bGVBbmRUZXh0Qm94LCAuY29udGVudEJveCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbi50aXRsZUFuZFRleHRCb3gge1xcbiAgbWFyZ2luLXJpZ2h0OiA1JTtcXG59XFxuXFxuLnRpdGxlQm94LCAudGV4dEJveCB7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHdpZHRoOiAxNnJlbTtcXG59XFxuXFxuLnRpdGxlQm94IHtcXG4gIHBhZGRpbmc6IDEwJTtcXG59XFxuLnRpdGxlQm94ID4gKiB7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4udGl0bGVCb3ggPiA6bnRoLWNoaWxkKDIpIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcbi50aXRsZUJveCA+IDpudGgtY2hpbGQoMikgaDIge1xcbiAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICBwYWRkaW5nLWJvdHRvbTogMTUlO1xcbn1cXG5cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzLCAuY29udGVudEJveC5tZW1iZXJzIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICByb3ctZ2FwOiAwLjM1cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogNzY3cHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAzMy4zJSk7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg0LCAyNSUpO1xcbiAgfVxcbn1cXG5cXG4uY29udGVudEJveCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiB7XFxuICB3aWR0aDogMTRyZW07XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyB7XFxuICBib3gtc2l6aW5nOiBpbml0aWFsO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwLCAyMCwgMjAsIDAuNyk7XFxuICBwYWRkaW5nOiAwLjJyZW0gMC4ycmVtO1xcbiAgbWFyZ2luLXRvcDogNy42cmVtO1xcbiAgYm9yZGVyLXJhZGl1czogMzAlO1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5pbnRlcmFjdGlvbi1wcm9tcHQgLmNsaWNrLXByb21wdCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuY2xpY2stcHJvbXB0IHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuaG92ZXItcHJvbXB0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5ob3Zlci1wcm9tcHQge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuaG92ZXItcHJvbXB0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5ob3Zlci1wcm9tcHQge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3Mge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICB3aWR0aDogMTAwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICosIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqIHtcXG4gIGNvbG9yOiByZ2IoMjM4LCAyMzEsIDIxMCk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIG1hcmdpbi10b3A6IDAuN3JlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICosIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqIHtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICB9XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMge1xcbiAgZm9udC1zaXplOiAycmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAuY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLmZhLXNlYXJjaC1wbHVzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLmZhLXNlYXJjaC1wbHVzIHtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICB9XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqOmhvdmVyLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgKjpob3ZlciB7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDExMCUpO1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDEyMCUpO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgaSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIGkge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NfX3Zpc2libGUsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NfX3Zpc2libGUge1xcbiAgZGlzcGxheTogZmxleDtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IHAsIC5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIGRpdiBhLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgcCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IGEge1xcbiAgbWFyZ2luOiAyJTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5LXRleHQge1xcbiAgbWFyZ2luLXRvcDogLTAuM3JlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBnYXA6IDAuMnJlbTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0IHAsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCBwIHtcXG4gIG1hcmdpbjogMDtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0IHA6bnRoLW9mLXR5cGUoMiksIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCBwOm50aC1vZi10eXBlKDIpIHtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcbi5jb250ZW50Qm94IC5uZXdzIHtcXG4gIG1hcmdpbjogMCAxJTtcXG4gIHBhZGRpbmctdG9wOiA1JTtcXG4gIGhlaWdodDogYXV0bztcXG59XFxuLmNvbnRlbnRCb3ggLm5ld3MgaWZyYW1lIHtcXG4gIHdpZHRoOiAzMDBweDtcXG4gIGhlaWdodDogMjAwcHg7XFxufVxcblxcbiNmb290ZXJDb250YWluZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzOSwgMzksIDM5LCAwLjYpO1xcbiAgbWFyZ2luOiAwO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJvdHRvbTogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcXG4gIHBhZGRpbmctcmlnaHQ6IDJyZW07XFxuICBjb2xvcjogaXZvcnk7XFxufVxcbiNmb290ZXJDb250YWluZXIgcCB7XFxuICBtYXJnaW46IDFyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNmb290ZXJDb250YWluZXIgcCB7XFxuICAgIG1hcmdpbjogMC42NXJlbTtcXG4gIH1cXG59XFxuXFxuI29wZW5pbmdDb250YWluZXIge1xcbiAgaGVpZ2h0OiA5OS41dmg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBjb2xvcjogcmdiKDE4OSwgMTg5LCAxODkpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoMSB7XFxuICBmb250LXNpemU6IDUuMnJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaDEge1xcbiAgICBmb250LXNpemU6IDYuNXJlbTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgcCB7XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNvcGVuaW5nQ29udGFpbmVyIHAge1xcbiAgICBmb250LXNpemU6IDIuN3JlbTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIgZGl2IHtcXG4gIHRleHQtc2hhZG93OiAxcHggMXB4IGJsYWNrO1xcbiAgd2lkdGg6IDgwJTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIgZGl2IHtcXG4gICAgd2lkdGg6IDcwJTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFtsb2dvU3ltYm9sXSA0JSBbbG9nb1RleHRdIDI1JSBbbmF2aWdhdGlvbl0gMWZyO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImxvZ29TeW1ib2wgbG9nb1RleHQgbmF2aWdhdGlvblxcXCI7XFxuICBncmlkLWF1dG8tZmxvdzogY29sdW1uO1xcbiAganVzdGlmeS1zZWxmOiBlbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcwLCA2MiwgNTUsIDAuODUpO1xcbiAgYm94LXNoYWRvdzogMC4ycmVtIDAuMnJlbSAxcmVtIDAuNHJlbSBpbnNldCByZ2JhKDQ5LCA0MywgMzksIDAuNzUpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDRyZW07XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDA7XFxuICB6LWluZGV4OiA5OTk5O1xcbiAgY29sb3I6IHJnYigxOTksIDE4NywgMTU2KTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHtcXG4gICAgZ3JpZC1hdXRvLWZsb3c6IHJvdztcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbbG9nb1N5bWJvbF0gNCUgW2xvZ29UZXh0XSAyNSUgW25hdmlnYXRpb25dIDFmcjtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImxvZ29TeW1ib2wgbG9nb1RleHQgbmF2aWdhdGlvblxcXCI7XFxuICB9XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlci5oaWRkZW4ge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIGJ1dHRvbiB7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIHdpZHRoOiAxMHJlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIGJ1dHRvbiBpIHtcXG4gIGRpc3BsYXk6IGlubGluZTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyICNsb2dvLXN5bWJvbCwgI29wZW5pbmdDb250YWluZXIgaGVhZGVyICNsb2dvLXRleHQge1xcbiAgaGVpZ2h0OiAzcmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tc3ltYm9sIHtcXG4gIGdyaWQtYXJlYTogbG9nb1N5bWJvbDtcXG4gIG1hcmdpbi10b3A6IDAuM3JlbTtcXG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tdGV4dCB7XFxuICBncmlkLWFyZWE6IGxvZ29UZXh0O1xcbiAgbWFyZ2luLXRvcDogMC42cmVtO1xcbiAgcGFkZGluZy1sZWZ0OiAwLjJyZW07XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBpbWcge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgcCwgI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB7XFxuICBtYXJnaW46IDA7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAganVzdGlmeS1zZWxmOiBlbmQ7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgbWFyZ2luLXJpZ2h0OiAycmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHtcXG4gICAgZ3JpZC1hcmVhOiBuYXZpZ2F0aW9uO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgb3ZlcmZsb3c6IHZpc2libGU7XFxuICAgIGp1c3RpZnktc2VsZjogdW5zZXQ7XFxuICB9XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtZXZlbmx5O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCB7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgIGdhcDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIGp1c3RpZnktY29udGVudDogaW5pdGlhbDtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCBsaSB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNzAsIDYyLCA1NSk7XFxuICBib3gtc2hhZG93OiAwLjJyZW0gMC4ycmVtIDFyZW0gMC42cmVtIGluc2V0IHJnYmEoNDksIDQzLCAzOSwgMC43NSk7XFxuICBib3JkZXItcmFkaXVzOiA1JTtcXG4gIGJvcmRlci1ib3R0b206IDAuM3JlbSBzb2xpZCByZ2JhKDUxLCA0NSwgNDAsIDAuODUpO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHVsIGxpIHtcXG4gICAgYm94LXNoYWRvdzogbm9uZTtcXG4gICAgd2lkdGg6IGluaXRpYWw7XFxuICAgIGhlaWdodDogaW5pdGlhbDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGJvcmRlci1yYWRpdXM6IGluaXRpYWw7XFxuICAgIGJvcmRlcjogbm9uZTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCBsaSBhIHtcXG4gIHBhZGRpbmc6IDAuNXJlbSAxcmVtO1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwgbGkgYSB7XFxuICAgIHBhZGRpbmc6IDA7XFxuICB9XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwgI21vYmlsZS1uYXYtY2FsbGVyIHtcXG4gIGhlaWdodDogNHJlbTtcXG4gIGJveC1zaGFkb3c6IG5vbmU7XFxuICBib3JkZXI6IG5vbmU7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCAjbW9iaWxlLW5hdi1jYWxsZXIge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHVsICNtb2JpbGUtbmF2LWNhbGxlciBidXR0b24ge1xcbiAgY29sb3I6IGFsaWNlYmx1ZTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdi5vcGVuZWQge1xcbiAgb3ZlcmZsb3c6IHZpc2libGU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICNwYWdlSW1hZ2Uge1xcbiAgdG9wOiAwO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICNwYWdlSW1hZ2UgaW1nIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZmlsdGVyOiBibHVyKDAuNnJlbSkgZ3JheXNjYWxlKDUwJSk7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBtYXJnaW4tdG9wOiAxJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciB7XFxuICAgIG1hcmdpbi10b3A6IDIlO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciBpbWcge1xcbiAgaGVpZ2h0OiA2cmVtO1xcbn1cXG5cXG4udGl0bGVCb3gge1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcbi50aXRsZUJveCBwIHtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbn1cXG5cXG4udGV4dEJveCB7XFxuICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcXG59XFxuLnRleHRCb3ggcCB7XFxuICBmb250LXNpemU6IDEuM3JlbTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI3Byb3BlcnRpZXNDb250YWluZXIsICNtZW1iZXJzQ29udGFpbmVyIHtcXG4gICAgaGVpZ2h0OiA1MnJlbTtcXG4gIH1cXG59XFxuI3Byb3BlcnRpZXNDb250YWluZXIgPiBkaXYgLnRpdGxlQm94LCAjbWVtYmVyc0NvbnRhaW5lciA+IGRpdiAudGl0bGVCb3gge1xcbiAgYm9yZGVyOiAwLjM1cmVtIHNvbGlkIHJnYigxOTksIDE4NywgMTU2KTtcXG59XFxuI3Byb3BlcnRpZXNDb250YWluZXIgaW1nLCAjbWVtYmVyc0NvbnRhaW5lciBpbWcge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbn1cXG4jcHJvcGVydGllc0NvbnRhaW5lciBpbWcucGFnZUxpbmtzX192aXNpYmxlLCAjbWVtYmVyc0NvbnRhaW5lciBpbWcucGFnZUxpbmtzX192aXNpYmxlIHtcXG4gIGZpbHRlcjogYnJpZ2h0bmVzcygyNyUpO1xcbn1cXG5cXG4jYWxsTmV3c0NvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDUxcmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsTmV3c0NvbnRhaW5lciB7XFxuICAgIGhlaWdodDogNTJyZW07XFxuICB9XFxufVxcblxcbiNjb250YWN0Q29udGFpbmVyIHtcXG4gIGhlaWdodDogNTVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNjb250YWN0Q29udGFpbmVyIHtcXG4gICAgaGVpZ2h0OiA1MnJlbTtcXG4gIH1cXG59XFxuXFxuI2FsbE5ld3NDb250YWluZXIsICNjb250YWN0Q29udGFpbmVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzMSwgMjcsIDIxKTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgPiBkaXYgLnRpdGxlQm94LCAjY29udGFjdENvbnRhaW5lciA+IGRpdiAudGl0bGVCb3gge1xcbiAgYm9yZGVyOiA0cHggc29saWQgcmdiKDIyMSwgMjIxLCAyMjEpO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciA+IGRpdiAudGV4dEJveCBwLCAjY29udGFjdENvbnRhaW5lciA+IGRpdiAudGV4dEJveCBwIHtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZm9udC1zaXplOiAxLjFyZW07XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94ID4gZGl2LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiB7XFxuICBmbGV4LWJhc2lzOiA1MCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94ID4gZGl2ID4gZGl2LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiA+IGRpdiB7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIGhlaWdodDogOTIlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAuZm9ybS1tZXNzYWdlLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAuZm9ybS1tZXNzYWdlIHtcXG4gIGhlaWdodDogYXV0bztcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggaDMsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGgzIHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGhlaWdodDogOCU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IHVsLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB1bCB7XFxuICBwYWRkaW5nOiAwO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCB1bCBsaSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggdWwgbGkge1xcbiAgZGlzcGxheTogaW5saW5lO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cywgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3Mge1xcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyMzMsIDIzMywgMjMzLCAwLjMpO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3czo6YWZ0ZXIsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiIFxcXCI7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIGhlaWdodDogMXJlbTtcXG4gIGNsZWFyOiBib3RoO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBpbWcsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIGltZyB7XFxuICB3aWR0aDogMTNyZW07XFxuICBmbG9hdDogbGVmdDtcXG4gIG1hcmdpbi1yaWdodDogMi41JTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgcCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgcCB7XFxuICBmb250LXNpemU6IDEuNDVyZW07XFxuICBsaW5lLWhlaWdodDogMS40cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBwLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBwIHtcXG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS4ycmVtO1xcbiAgfVxcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cywgI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0ge1xcbiAgcGFkZGluZzogMCA1JTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgLW1vei1jb2x1bW4tZ2FwOiAxLjJyZW07XFxuICAgICAgIGNvbHVtbi1nYXA6IDEuMnJlbTtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJjb250YWN0TmFtZSBjb250YWN0RW1haWxcXFwiIFxcXCJjb250YWN0UGhvbmUgY29udGFjdFN1YmplY3RcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJzdWJtaXQgLi4uXFxcIjtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1uYW1lLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LW5hbWUge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0TmFtZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1lbWFpbCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1lbWFpbCB7XFxuICBncmlkLWFyZWE6IGNvbnRhY3RFbWFpbDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1waG9uZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1waG9uZSB7XFxuICBncmlkLWFyZWE6IGNvbnRhY3RQaG9uZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1zdWJqZWN0LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LXN1YmplY3Qge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0U3ViamVjdDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1tZXNzYWdlLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LW1lc3NhZ2Uge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0TWVzc2FnZTtcXG59XFxuXFxuI2NvbnRhY3RDb250YWluZXIge1xcbiAgYmFja2dyb3VuZDogYmxhY2s7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHtcXG4gIC1tb3otY29sdW1uLWdhcDogM3JlbTtcXG4gICAgICAgY29sdW1uLWdhcDogM3JlbTtcXG4gIHdpZHRoOiA4NSU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgcGFkZGluZy1ib3R0b206IDFyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHtcXG4gICAgd2lkdGg6IDcwJTtcXG4gIH1cXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggaW1nIHtcXG4gIGZpbHRlcjogc2F0dXJhdGUoMTIwJSk7XFxuICB3aWR0aDogNDUlO1xcbiAgbWFyZ2luLWxlZnQ6IDJyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGltZyB7XFxuICAgIHdpZHRoOiA1MCU7XFxuICAgIG1hcmdpbi1sZWZ0OiAwO1xcbiAgfVxcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBsYWJlbC5lcnJvciB7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICBjb2xvcjogcmdiKDEyMCwgMTc5LCAxNTgpO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gPiBkaXYge1xcbiAgbWFyZ2luOiA1JSAwO1xcbiAgbWFyZ2luLXRvcDogMDtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBsYWJlbCB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBbdHlwZT1yYWRpb10ge1xcbiAgd2lkdGg6IDEwJTtcXG4gIGRpc3BsYXk6IGluaXRpYWw7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gdWwge1xcbiAgcGFkZGluZzogMDtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBpbnB1dCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBzZWxlY3Qge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBtYXJnaW4tdG9wOiAyJTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBpbnB1dCB7XFxuICBoZWlnaHQ6IDEuNXJlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBzZWxlY3Qge1xcbiAgaGVpZ2h0OiAycmVtO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHRleHRhcmVhIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxOHJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB0ZXh0YXJlYSB7XFxuICAgIGhlaWdodDogMjByZW07XFxuICB9XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gYnV0dG9uIHtcXG4gIGdyaWQtYXJlYTogc3VibWl0O1xcbiAgY29sb3I6IGl2b3J5O1xcbiAgZm9udC1zaXplOiAxLjNyZW07XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG5cXG4uZG90LXB1bHNlIHtcXG4gIHRvcDogMjAlO1xcbiAgbGVmdDogMzUlO1xcbn1cXG5cXG4jcG9wLXVwLWRpc3BsYXktYm94IHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNDUsIDQxLCAzNSwgMC44KTtcXG4gIHdpZHRoOiA5NHZ3O1xcbiAgaGVpZ2h0OiA4N3ZoO1xcbiAgb3ZlcmZsb3cteTogYXV0bztcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIHotaW5kZXg6IDExMDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogOHZoO1xcbiAgbGVmdDogM3Z3O1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHJvdy1nYXA6IDFyZW07XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIHBhZGRpbmctdG9wOiAyLjVyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggaW1nIHtcXG4gIHdpZHRoOiAyNnJlbTtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCBhLCAjcG9wLXVwLWRpc3BsYXktYm94IGJ1dHRvbiB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uIHtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uOmhvdmVyLCAjcG9wLXVwLWRpc3BsYXktYm94IGE6aG92ZXIge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDcyJSk7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggI2NvbnRlbnQtaG9sZGVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWV2ZW5seTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA3MCU7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggI2NvbnRlbnQtaG9sZGVyIC5wb3AtdXAtZGlyZWN0aW9uYWwge1xcbiAgZm9udC1zaXplOiAyLjVyZW07XFxufVxcblxcbiNuZXdzLW1lZGlhLWRpc3BsYXkge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg0NCwgNTIsIDc3LCAwLjgpO1xcbiAgaGVpZ2h0OiA4OHZoO1xcbiAgd2lkdGg6IDk0dnc7XFxuICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgei1pbmRleDogMTEwO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA3dmg7XFxuICBsZWZ0OiAzdnc7XFxuICBkaXNwbGF5OiBub25lO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG59XFxuXFxuI3NpbmdsZUNvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDc3JTtcXG4gIG1pbi13aWR0aDogOTYlO1xcbiAgdG9wOiA5LjUlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtd3JhcDogd3JhcDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDE7XFxuICBwYWRkaW5nOiAxLjVyZW0gMXJlbTtcXG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzNywgMzUsIDM0LCAwLjkpO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjc2luZ2xlQ29udGFpbmVyIHtcXG4gICAgbWluLXdpZHRoOiA2MCU7XFxuICAgIGhlaWdodDogODYlO1xcbiAgfVxcbn1cXG4jc2luZ2xlQ29udGFpbmVyIGg0IHtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyIGgzLCAjc2luZ2xlQ29udGFpbmVyIGg0LCAjc2luZ2xlQ29udGFpbmVyIC5yZWxhdGVkLWxpbmsge1xcbiAgY29sb3I6IHJnYigyNDEsIDIxOCwgMTg5KTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDI0dnc7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHtcXG4gICAgd2lkdGg6IDI1dnc7XFxuICB9XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIGltZyB7XFxuICBoZWlnaHQ6IDMzJTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgaW1nIHtcXG4gICAgaGVpZ2h0OiA0MiU7XFxuICB9XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHVsIHtcXG4gIHBhZGRpbmctbGVmdDogMjAlO1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgdWwge1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gIH1cXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgdWwgbGkge1xcbiAgbWFyZ2luLXRvcDogMC42cmVtO1xcbiAgbGlzdC1zdHlsZS10eXBlOiBzcXVhcmU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHVsIGxpIGEge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDExNSUpO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIHtcXG4gIHdpZHRoOiA0MHZ3O1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogNyUgMWZyO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIHtcXG4gICAgd2lkdGg6IDM1dnc7XFxuICB9XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3NpbmdsZUluZm8gcCB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG4gIGhlaWdodDogOTklO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIHAge1xcbiAgICBmb250LXNpemU6IDEuN3JlbTtcXG4gIH1cXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyBkaXYge1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBwYWRkaW5nOiAwIDFyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3ZpZEFuZEltZ0NvbCB7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTZ2dztcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN2aWRBbmRJbWdDb2wgaDMge1xcbiAgZm9udC1zaXplOiAxLjlyZW07XFxuICBtYXJnaW46IDFyZW0gMDtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wge1xcbiAgd2lkdGg6IDI2dnc7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIHBhZGRpbmc6IDAgMXJlbTtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLXJvd3M6IDEwJSAxZnIgNCU7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIHtcXG4gICAgd2lkdGg6IDI4dnc7XFxuICB9XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIGgzIHtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgaDMgYSB7XFxuICBmb250LXNpemU6IDEuN3JlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgaDMgYTpob3ZlciB7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sICNuZXdzLXJlY2lldmVyIHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgbWFyZ2luOiAxcmVtIDA7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sICNuZXdzLXJlY2lldmVyIHAge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxuICBwYWRkaW5nLXJpZ2h0OiAxcmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCAjbmV3cy1yZWNpZXZlciBpbWcge1xcbiAgd2lkdGg6IDk1JTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgI3BhZ2luYXRpb24taG9sZGVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvdHRvbTogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcblxcbmJvZHkge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEwMCwgOTIsIDgyKTtcXG59XFxuXFxuLnNlYXJjaC1vdmVybGF5IHtcXG4gIG92ZXJmbG93LXk6IGF1dG87XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICB6LWluZGV4OiAxMTA7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBib3R0b206IDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcyLCA2OCwgNjIsIDAuOTYpO1xcbiAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgb3BhY2l0eTogMDtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMS4wOSk7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MsIHRyYW5zZm9ybSAwLjNzLCB2aXNpYmlsaXR5IDAuM3M7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG4uc2VhcmNoLW92ZXJsYXkgLmNvbnRhaW5lciB7XFxuICBtYXgtd2lkdGg6IDEzMDBweDtcXG4gIG1hcmdpbjogMCBhdXRvO1xcbiAgcGFkZGluZzogMCAxNnB4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbi5zZWFyY2gtb3ZlcmxheSBwIHtcXG4gIHBhZGRpbmctdG9wOiAxcmVtO1xcbn1cXG5ib2R5LmFkbWluLWJhciAuc2VhcmNoLW92ZXJsYXkge1xcbiAgdG9wOiAycmVtO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX3RvcCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMTIpO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX2ljb24ge1xcbiAgbWFyZ2luLXJpZ2h0OiAwLjc1cmVtO1xcbiAgZm9udC1zaXplOiAyLjVyZW07XFxuICBjb2xvcjogcmdiKDE0OCwgMTIxLCAxMDUpO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXktLWFjdGl2ZSB7XFxuICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgb3BhY2l0eTogMTtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9fc2VjdGlvbi10aXRsZSB7XFxuICBtYXJnaW46IDMwcHggMCAxcHggMDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXNpemU6IDJyZW07XFxuICBwYWRkaW5nOiAxNXB4IDA7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2NjYztcXG59XFxuLnNlYXJjaC1vdmVybGF5X19jbG9zZSB7XFxuICBmb250LXNpemU6IDIuN3JlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjNzO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDU4LCA1NCwgNTQpO1xcbiAgY29sb3I6IHJnYigxODAsIDE3MSwgMTY2KTtcXG4gIGxpbmUtaGVpZ2h0OiAwLjc7XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9fY2xvc2U6aG92ZXIge1xcbiAgb3BhY2l0eTogMTtcXG59XFxuLnNlYXJjaC1vdmVybGF5IC5vbmUtaGFsZiB7XFxuICBwYWRkaW5nLWJvdHRvbTogMDtcXG59XFxuXFxuLnNlYXJjaC10ZXJtIHtcXG4gIHdpZHRoOiA3NSU7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgYm9yZGVyOiBub25lO1xcbiAgcGFkZGluZzogMXJlbSAwO1xcbiAgbWFyZ2luOiAwO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBmb250LXNpemU6IDFyZW07XFxuICBmb250LXdlaWdodDogMzAwO1xcbiAgb3V0bGluZTogbm9uZTtcXG4gIGNvbG9yOiByZ2IoMjE4LCAyMDEsIDE4Mik7XFxufVxcblxcbi5ib2R5LW5vLXNjcm9sbCB7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG4uY29udGFpbmVyIHtcXG4gIG1heC13aWR0aDogMTMwMHB4O1xcbiAgbWFyZ2luOiAwIGF1dG87XFxuICBwYWRkaW5nOiAwIDE2cHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbkBtZWRpYSAobWluLXdpZHRoOiA5NjBweCkge1xcbiAgLnNlYXJjaC10ZXJtIHtcXG4gICAgd2lkdGg6IDgwJTtcXG4gICAgZm9udC1zaXplOiAzcmVtO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgc3BpbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XFxuICB9XFxufVxcbi5zcGlubmVyLWxvYWRlciB7XFxuICBtYXJnaW4tdG9wOiA0NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgd2lkdGg6IDI0cHg7XFxuICBoZWlnaHQ6IDI0cHg7XFxuICBib3JkZXI6IDAuMjVyZW0gc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgYm9yZGVyLXRvcC1jb2xvcjogYmxhY2s7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICBhbmltYXRpb246IHNwaW4gMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG4ubWVkaWEtY2FyZCBidXR0b24ge1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgZm9udC1zaXplOiAyLjFyZW07XFxufVxcblxcbmgxLCBoMiwgaDMsIGg0IHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTGlicmUgQ2FzbG9uIFRleHRcXFwiLCBzZXJpZjtcXG59XFxuXFxuLnRleHRCb3ggcCwgI3JlbGF0aW9uc2hpcC1saW5rLCAjc2luZ2xlLWxpbmsge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJMaWJyZSBDYXNsb24gRGlzcGxheVxcXCIsIHNlcmlmO1xcbn1cXG5cXG5oMSB7XFxuICBmb250LXdlaWdodDogNzAwO1xcbn1cXG5cXG5oMiB7XFxuICBmb250LXdlaWdodDogNDAwO1xcbn1cXG5cXG4uZGlzcGxheS10ZXh0LCAjd2VsY29tZUNvbnRhaW5lciBwLCAudGl0bGVCb3ggcCB7XFxuICBmb250LWZhbWlseTogXFxcIkNvcm1vcmFudCBTQ1xcXCIsIHNlcmlmO1xcbn1cXG5cXG5pbnB1dCwgLnJlYWQtbW9yZSwgLm5ld3MgbGkgYSwgaGVhZGVyIGxpIGEsICNyZWFsdGltZUZpbHRlcnNBbmRTb3J0aW5nIGJ1dHRvbiwgI3NlYXJjaC1maWx0ZXJzIGJ1dHRvbiwgI3Jlc2V0LWFsbCB7XFxuICBmb250LWZhbWlseTogXFxcIkxvcmFcXFwiLCBzZXJpZjtcXG59XFxuXFxuLm5ld3MgcCB7XFxuICBmb250LWZhbWlseTogXFxcIlJvYm90b1xcXCIsIHNhbnMtc2VyaWY7XFxufVxcblxcbi5uZXdzIHAge1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG59XFxuXFxuLnNlYXJjaC1mb3JtIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogNTAlO1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG5cXG4uY29udGVudC1sb2FkZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuLmNvbnRlbnQtbG9hZGVyIC5iYWxsIHtcXG4gIHdpZHRoOiAxLjJyZW07XFxuICBoZWlnaHQ6IDEuMnJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig0NywgMTYzLCA1Nik7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDUwJTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcyIDAuN3MgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSwgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdDIgMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nMiAwLjdzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUsIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQyIDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG4uY29udGVudC1sb2FkZXIubG9hZGVyW2RhdGEtdGV4dF06OmJlZm9yZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5jb250ZW50LWxvYWRlci5sb2FkZXIuaXMtYWN0aXZlOjpiZWZvcmUge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDUwJTtcXG4gIGxlZnQ6IDI1JTtcXG4gIHRvcDogMzklO1xcbiAgZm9udC1zaXplOiAyLjdyZW07XFxuICBjb2xvcjogcmdiKDE5NSwgMTY4LCAxMjYpO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxufVxcbi5jb250ZW50LWxvYWRlci5sb2FkZXItYmFyLXBpbmctcG9uZzo6YWZ0ZXIge1xcbiAgd2lkdGg6IDEuMnJlbTtcXG4gIGhlaWdodDogMS4ycmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEwMSwgMTQ4LCAxODcpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjdzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUsIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQgMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nIDAuN3MgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSwgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdCAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuLmNvbnRlbnQtbG9hZGVyLmxvYWRlci5pcy1hY3RpdmUge1xcbiAgaGVpZ2h0OiA5NyU7XFxuICB6LWluZGV4OiAwO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1MSwgNDksIDU2LCAwLjc0OTAxOTYwNzgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGJsaW5rIDEuOHMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBibGluayAxLjhzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBibGluayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIG9wYWNpdHk6IDAuNzU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBibGluayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIG9wYWNpdHk6IDAuNzU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IDQwJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiA2MCU7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogNDAlO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IDYwJTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcyLCA2OCwgODIsIDAuNzUpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMDIsIDc4LCAxMjIsIDAuNzUpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTQ5LCA5MywgMTY4LCAwLjc1KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0IHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg3MiwgNjgsIDgyLCAwLjc1KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTAyLCA3OCwgMTIyLCAwLjc1KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDE0OSwgOTMsIDE2OCwgMC43NSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmcyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogNDMlO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IDYzJTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmcyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogNDMlO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IDYzJTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQyIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDQ3LCAxNjMsIDU2KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig4NywgMTQzLCA1Nik7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEyNiwgMTMxLCA1OCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdDIge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNDcsIDE2MywgNTYpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDg3LCAxNDMsIDU2KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTI2LCAxMzEsIDU4KTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDU2cmVtO1xcbiAgdG9wOiA2cmVtO1xcbiAgd2lkdGg6IDk1JTtcXG4gIGxlZnQ6IDIuNSU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDM3LCAzNSwgMzQsIDAuNzUpO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtYXV0by1mbG93OiByb3c7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDEwMCU7XFxuICBjb2xvcjogYWxpY2VibHVlO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyIHtcXG4gICAgaGVpZ2h0OiA4NSU7XFxuICAgIHRvcDogNXJlbTtcXG4gIH1cXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciB7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogNjYlIDM0JTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVyLXNvcnQtdG9nZ2xlIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXItc29ydC10b2dnbGUge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyIGJ1dHRvbiB7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNtZWRpYS1jb250YWluZXIsICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIuZmFkZS1pbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyLmZhZGUtb3V0IHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDUxLCA0OSwgNDcsIDAuOSk7XFxuICBib3JkZXItcmFkaXVzOiAyJTtcXG4gIGJveC1zaGFkb3c6IDAuMnJlbSAwLjJyZW0gMXJlbSAwLjRyZW0gaW5zZXQgcmdiYSgzNywgMzMsIDMwLCAwLjg1KTtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiA4NSU7XFxuICBoZWlnaHQ6IDgwJTtcXG4gIG1hcmdpbi1sZWZ0OiAxMCU7XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwicmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZ1xcXCIgXFxcInNlYXJjaEZpbHRlcnNcXFwiIFxcXCJyZXNldEFsbFxcXCI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lci5mYWRlLWluIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBmYWRlT3B0aW9uc0luIDAuNXMgZWFzZS1pbi1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZmFkZU9wdGlvbnNJbiAwLjVzIGVhc2UtaW4tb3V0O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIuZmFkZS1vdXQge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGZhZGVPcHRpb25zT3V0IDAuNXMgZWFzZS1pbi1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZmFkZU9wdGlvbnNPdXQgMC41cyBlYXNlLWluLW91dDtcXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGZhZGVPcHRpb25zSW4ge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZmFkZU9wdGlvbnNJbiB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGZhZGVPcHRpb25zT3V0IHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGZhZGVPcHRpb25zT3V0IHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBhZGRpbmctbGVmdDogMS41cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJyZWFsdGltZUZpbHRlcnNBbmRTb3J0aW5nXFxcIiBcXFwic2VhcmNoRmlsdGVyc1xcXCIgXFxcInJlc2V0QWxsXFxcIjtcXG4gICAgYm9yZGVyOiAwLjJyZW0gc29saWQgcmdiYSgyMTIsIDE5MywgMTMwLCAwLjQpO1xcbiAgICBib3JkZXItbGVmdDogbm9uZTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIHtcXG4gIGdyaWQtYXJlYTogcmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZztcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwiaGVhZGluZ1JGUyBoZWFkaW5nUkZTIGhlYWRpbmdSRlNcXFwiIFxcXCJvcmRlckJ5IHRvZ2dsZVR5cGUgZmlsdGVyRGF0ZVxcXCI7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIHtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImhlYWRpbmdSRlMgaGVhZGluZ1JGU1xcXCIgXFxcIm9yZGVyQnkgdG9nZ2xlVHlwZVxcXCIgXFxcImZpbHRlckRhdGUgZmlsdGVyRGF0ZVxcXCI7XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBidXR0b24sICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBsYWJlbCB7XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIGJ1dHRvbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIGxhYmVsIHtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBidXR0b24uaW5hY3RpdmUge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBidXR0b24uaW5hY3RpdmUgc3BhbiB7XFxuICBjb2xvcjogcmVkO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgaDIge1xcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nUkZTO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI29yZGVyLWJ5IHtcXG4gIGdyaWQtYXJlYTogb3JkZXJCeTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nICN0b2dnbGUtdHlwZSB7XFxuICBncmlkLWFyZWE6IHRvZ2dsZVR5cGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyAjZmlsdGVyLWRhdGUge1xcbiAgZ3JpZC1hcmVhOiBmaWx0ZXJEYXRlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI2ZpbHRlci1kYXRlIGRpdiB1bCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZ2FwOiAzcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgdWwge1xcbiAgcGFkZGluZy1sZWZ0OiAwLjNyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyB1bCBsaSB7XFxuICBtYXJnaW4tdG9wOiAwLjVyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMge1xcbiAgZ3JpZC1hcmVhOiBzZWFyY2hGaWx0ZXJzO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJoZWFkaW5nU0YgaGVhZGluZ1NGIGhlYWRpbmdTRlxcXCIgXFxcIm5ld3NTZWFyY2ggbmV3c1NlYXJjaCBuZXdzU2VhcmNoXFxcIiBcXFwiY2FzZVNlbnNpdGl2ZSBmdWxsV29yZE9ubHkgd29yZFN0YXJ0T25seVxcXCIgXFxcImluY2x1ZGVUaXRsZSBpbmNsdWRlRGVzY3JpcHRpb24gLi4uXFxcIjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBoMiB7XFxuICBncmlkLWFyZWE6IGhlYWRpbmdTRjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBidXR0b24ge1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIGJ1dHRvbiB7XFxuICAgIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNuZXdzLXNlYXJjaC1jb250YWluZXIge1xcbiAgZ3JpZC1hcmVhOiBuZXdzU2VhcmNoO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNuZXdzLXNlYXJjaC1jb250YWluZXIgI25ld3Mtc2VhcmNoLmluYWN0aXZlIHtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogZ3JheTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjZnVsbC13b3JkLW9ubHkge1xcbiAgZ3JpZC1hcmVhOiBmdWxsV29yZE9ubHk7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI3dvcmQtc3RhcnQtb25seSB7XFxuICBncmlkLWFyZWE6IHdvcmRTdGFydE9ubHk7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI2Nhc2Utc2Vuc2l0aXZlIHtcXG4gIGdyaWQtYXJlYTogY2FzZVNlbnNpdGl2ZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjaW5jbHVkZS10aXRsZSB7XFxuICBncmlkLWFyZWE6IGluY2x1ZGVUaXRsZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjaW5jbHVkZS1kZXNjcmlwdGlvbiB7XFxuICBncmlkLWFyZWE6IGluY2x1ZGVEZXNjcmlwdGlvbjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjd29yZC1zdGFydC1vbmx5LmluYWN0aXZlLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIGJ1dHRvbi5pbmFjdGl2ZSB7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjd29yZC1zdGFydC1vbmx5LmluYWN0aXZlIHNwYW4sICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgYnV0dG9uLmluYWN0aXZlIHNwYW4ge1xcbiAgY29sb3I6IHJlZDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGJ1dHRvbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIHNlbGVjdCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGxhYmVsIHtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgYnV0dG9uLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgc2VsZWN0LCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgbGFiZWwge1xcbiAgICBmb250LXNpemU6IDEuMTVyZW07XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBsYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IDAuNXJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZXNldC1hbGwge1xcbiAgZm9udC1zaXplOiAxLjY1cmVtO1xcbiAgZ3JpZC1hcmVhOiByZXNldEFsbDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZXNldC1hbGwge1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZXNldC1hbGwuaW5hY3RpdmUge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICBjb2xvcjogcmVkO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgYnV0dG9uIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGgzIHtcXG4gIGZvbnQtc2l6ZTogMS43cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgaDQge1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxuICBtYXJnaW4tYm90dG9tOiAwLjhyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyIHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogMTAlIDg0JSA2JTtcXG4gIGJvcmRlcjogMC4ycmVtIHNvbGlkIHJnYigxODAsIDE3NCwgMTY0KTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3RpdGxlQW5kT3B0aW9ucyB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbbWhdIDgwJSBbb3NdIDEwJSBbZHNdIDEwJTtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJtaCBvcyBkc1xcXCI7XFxuICBib3JkZXItYm90dG9tOiAwLjNyZW0gc29saWQgcmdiKDE4NSwgMTU4LCAxMjIpO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zIHtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbbWhdIDkwJSBbZHNdIDFmcjtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcIm1oIGRzXFxcIjtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3RpdGxlQW5kT3B0aW9ucyAjbWFpbi1oZWFkZXIge1xcbiAgZ3JpZC1hcmVhOiBtaDtcXG4gIGZvbnQtc2l6ZTogMi4zcmVtO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3RpdGxlQW5kT3B0aW9ucyAub3B0aW9ucy1zd2l0Y2gsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICN0aXRsZUFuZE9wdGlvbnMgI2Rpc21pc3Mtc2VsZWN0aW9uIHtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgYm9yZGVyOiAwLjJyZW0gc29saWQgcmdiKDIxMiwgMTkzLCAxMzApO1xcbiAgYm9yZGVyLWJvdHRvbTogbm9uZTtcXG4gIGJvcmRlci10b3A6IG5vbmU7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICN0aXRsZUFuZE9wdGlvbnMgLm9wdGlvbnMtc3dpdGNoLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zICNkaXNtaXNzLXNlbGVjdGlvbiB7XFxuICAgIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zIC5vcHRpb25zLXN3aXRjaCB7XFxuICBncmlkLWFyZWE6IG9zO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zIC5vcHRpb25zLXN3aXRjaCB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICN0aXRsZUFuZE9wdGlvbnMgI2Rpc21pc3Mtc2VsZWN0aW9uIHtcXG4gIGdyaWQtYXJlYTogZHM7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICN0aXRsZUFuZE9wdGlvbnMgI2Rpc21pc3Mtc2VsZWN0aW9uLmRpc21pc3NlZCB7XFxuICBmaWx0ZXI6IGNvbnRyYXN0KDIwJSk7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtcmVjaWV2ZXIge1xcbiAgbWFyZ2luLWJvdHRvbTogMC41cmVtO1xcbiAgcGFkZGluZy1yaWdodDogMnJlbTtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB7XFxuICBwYWRkaW5nLWxlZnQ6IDJyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lci5kaXNtaXNzZWQge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyB7XFxuICBmb250LXNpemU6IDEuNjVyZW07XFxuICBwYWRkaW5nLXRvcDogMDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3Mge1xcbiAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3czo6YWZ0ZXIsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiIFxcXCI7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIGhlaWdodDogMXJlbTtcXG4gIGNsZWFyOiBib3RoO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzIGltZywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBpZnJhbWUsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzIGltZywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgaWZyYW1lIHtcXG4gIGZsb2F0OiBsZWZ0O1xcbiAgbWFyZ2luLXJpZ2h0OiAyJTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBwLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBwIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjZyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgcCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgcCB7XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjJyZW07XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgaWZyYW1lLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBpZnJhbWUge1xcbiAgd2lkdGg6IDE1MHB4O1xcbiAgaGVpZ2h0OiAxMDBweDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkge1xcbiAgbGlzdC1zdHlsZS10eXBlOiBjaXJjbGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnNlZS1tb3JlLWxpbmssICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAuc2VlLW1vcmUtbGluaywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSAuc2VlLW1vcmUtbGluay5kaXNtaXNzZWQsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLmRpc21pc3NlZCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnNlZS1tb3JlLWxpbmsuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAucmVsYXRpb25zaGlwLWxpbmsuZGlzbWlzc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciB7XFxuICBwYWRkaW5nLXRvcDogMXJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIge1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyLmRpc21pc3NlZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgZm9udC1zaXplOiAxLjlyZW07XFxuICBtYXJnaW4tbGVmdDogMC41cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyBhLmhpZGRlbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIgLmNvbnRlbnQtcGFnZXMgYS5zZWxlY3RlZFBhZ2Uge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEuaGlkZGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxufVxcblxcbiNtb2JpbGUtdHlwaW5nLWNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI0LCAyMywgMjMsIDAuOSk7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogMDtcXG59XFxuI21vYmlsZS10eXBpbmctY29udGFpbmVyIGRpdiB7XFxuICB3aWR0aDogNTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogNXJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIC1tb3otY29sdW1uLWdhcDogMXJlbTtcXG4gICAgICAgY29sdW1uLWdhcDogMXJlbTtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbiNtb2JpbGUtdHlwaW5nLWNvbnRhaW5lciBkaXYgYnV0dG9uLCAjbW9iaWxlLXR5cGluZy1jb250YWluZXIgZGl2IGxhYmVsIHtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbn1cXG4jbW9iaWxlLXR5cGluZy1jb250YWluZXIgZGl2IGJ1dHRvbiB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG5cXG4jbW9iaWxlLXR5cGluZy1jb250YWluZXIub3BlbmVkIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcblxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5vcHRpb25zLXN3aXRjaCB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxufVxcblxcbi5uZXdzLXNlYXJjaC1maWVsZCB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG4gIGhlaWdodDogMi42cmVtO1xcbiAgd2lkdGg6IDI0cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAubmV3cy1zZWFyY2gtZmllbGQge1xcbiAgICBmb250LXNpemU6IDEuMTVyZW07XFxuICAgIGhlaWdodDogMi4zcmVtO1xcbiAgICB3aWR0aDogMThyZW07XFxuICB9XFxufVxcblxcbiNtZWRpYS1yZWNpZXZlciB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMCwgMTAsIDEwLCAwLjgpO1xcbiAgdG9wOiA3JTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiA5NSU7XFxuICB6LWluZGV4OiAxO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEge1xcbiAgbWFyZ2luLWxlZnQ6IDZyZW07XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDZyZW07XFxuICB3aWR0aDogNDByZW07XFxuICBoZWlnaHQ6IDIzLjVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSB7XFxuICAgIHRvcDogNHJlbTtcXG4gICAgbWFyZ2luLWxlZnQ6IDhyZW07XFxuICAgIHdpZHRoOiA2NHJlbTtcXG4gICAgaGVpZ2h0OiAzNnJlbTtcXG4gIH1cXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhIGlmcmFtZSwgI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhIGltZyB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgI3BsYXktYnV0dG9uLWNvbnRhaW5lciAjcGxheS1idXR0b24ge1xcbiAgaGVpZ2h0OiA2cmVtO1xcbiAgd2lkdGg6IDlyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDk5LCAxMDAsIDE3OSwgMC44KTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvcmRlci1yYWRpdXM6IDM1JTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIgI3BsYXktYnV0dG9uIGRpdiB7XFxuICBib3JkZXItbGVmdDogM3JlbSBzb2xpZCByZ2IoMTI1LCAxNTAsIDE2OCk7XFxuICBib3JkZXItdG9wOiAxLjdyZW0gc29saWQgdHJhbnNwYXJlbnQ7XFxuICBib3JkZXItYm90dG9tOiAxLjdyZW0gc29saWQgdHJhbnNwYXJlbnQ7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSAjcGxheS1idXR0b24tY29udGFpbmVyICNwbGF5LWJ1dHRvbjpob3ZlciB7XFxuICBvcGFjaXR5OiAwLjc7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYS5jZW50ZXItZGlzcGxheSB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBoZWlnaHQ6IDgyJTtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgcmlnaHQ6IDJyZW07XFxuICB0b3A6IDNyZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtbWVudSB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtbWVudSBhIHtcXG4gIGNvbG9yOiBhenVyZTtcXG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLW1lbnUgYS5hY3RpdmUge1xcbiAgZmlsdGVyOiBjb250cmFzdCg0OCUpO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIHtcXG4gIHdpZHRoOiA3NSU7XFxuICBtYXgtd2lkdGg6IDM4MHB4O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBvdmVyZmxvdzogYXV0bztcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS10aHVtYiB7XFxuICB3aWR0aDogNDUlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS10aHVtYi5zZWxlY3RlZCB7XFxuICBmaWx0ZXI6IGNvbnRyYXN0KDQ4JSk7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiAubWVkaWEtaW5mb3JtYXRpb24ge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBtYXJnaW4tbGVmdDogMXJlbTtcXG4gIHdpZHRoOiA1NSU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24gLm1lZGlhLWluZm9ybWF0aW9uIHAge1xcbiAgbWFyZ2luOiAwO1xcbiAgY29sb3I6IGJlaWdlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS1pbmZvcm1hdGlvbiBwOm50aC1vZi10eXBlKDIpIHtcXG4gIG1hcmdpbi10b3A6IDFyZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtcGFnaW5hdGlvbiB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBjb2xvcjogYWxpY2VibHVlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLXBhZ2luYXRpb24gYSB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIG1hcmdpbi1sZWZ0OiAxcmVtO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLWNsb3NlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGxlZnQ6IDEuNXJlbTtcXG4gIHRvcDogMS41cmVtO1xcbiAgZm9udC1zaXplOiAzLjVyZW07XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNtZWRpYS1yZWNpZXZlciAjbWVkaWEtY2xvc2Uge1xcbiAgICBsZWZ0OiAzLjVyZW07XFxuICAgIHRvcDogMy41cmVtO1xcbiAgICBmb250LXNpemU6IDMuNXJlbTtcXG4gIH1cXG59XFxuXFxuLm1lZGlhLWNhcmQ6aG92ZXIgaW1nLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBpbWcge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDUwJSk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbi5tZWRpYS1jYXJkOmhvdmVyIGgzLCAubWVkaWEtY2FyZDpob3ZlciBwLCAubWVkaWEtY2FyZDpob3ZlciBidXR0b24sIC5wcm9wZXJ0eS1tZWRpYS1jYXJkOmhvdmVyIGgzLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBwLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBidXR0b24ge1xcbiAgZmlsdGVyOiBjb250cmFzdCg0MCUpO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubG9hZGVyIHtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB0b3A6IC05OTk5cHg7XFxuICB3aWR0aDogMDtcXG4gIGhlaWdodDogMDtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICB6LWluZGV4OiA5OTk5OTk7XFxufVxcblxcbi5sb2FkZXI6YWZ0ZXIsIC5sb2FkZXI6YmVmb3JlIHtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4ubG9hZGVyLmlzLWFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuODUpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiAwO1xcbn1cXG5cXG4ubG9hZGVyLmlzLWFjdGl2ZTphZnRlciwgLmxvYWRlci5pcy1hY3RpdmU6YmVmb3JlIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgcm90YXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzU5ZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyByb3RhdGlvbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDApO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGJsaW5rIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgfVxcbiAgdG8ge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG4ubG9hZGVyW2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IDUwJTtcXG4gIGNvbG9yOiBjdXJyZW50Q29sb3I7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZm9udC1zaXplOiAxNHB4O1xcbn1cXG5cXG4ubG9hZGVyW2RhdGEtdGV4dD1cXFwiXFxcIl06YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJMb2FkaW5nXFxcIjtcXG59XFxuXFxuLmxvYWRlcltkYXRhLXRleHRdOm5vdChbZGF0YS10ZXh0PVxcXCJcXFwiXSk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IGF0dHIoZGF0YS10ZXh0KTtcXG59XFxuXFxuLmxvYWRlcltkYXRhLXRleHRdW2RhdGEtYmxpbmtdOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogYmxpbmsgMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBibGluayAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHRbZGF0YS10ZXh0XTpiZWZvcmUge1xcbiAgdG9wOiBjYWxjKDUwJSAtIDYzcHgpO1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHQ6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogNDhweDtcXG4gIGhlaWdodDogNDhweDtcXG4gIGJvcmRlcjogOHB4IHNvbGlkICNmZmY7XFxuICBib3JkZXItbGVmdC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB0b3A6IGNhbGMoNTAlIC0gMjRweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDI0cHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHJvdGF0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItZGVmYXVsdFtkYXRhLWhhbGZdOmFmdGVyIHtcXG4gIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxufVxcblxcbi5sb2FkZXItZGVmYXVsdFtkYXRhLWludmVyc2VdOmFmdGVyIHtcXG4gIGFuaW1hdGlvbi1kaXJlY3Rpb246IHJldmVyc2U7XFxufVxcblxcbi5sb2FkZXItZG91YmxlOmFmdGVyLCAubG9hZGVyLWRvdWJsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBib3JkZXI6IDhweCBzb2xpZDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogcm90YXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG4ubG9hZGVyLWRvdWJsZTphZnRlciB7XFxuICB3aWR0aDogNDhweDtcXG4gIGhlaWdodDogNDhweDtcXG4gIGJvcmRlci1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1sZWZ0LWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIHRvcDogY2FsYyg1MCUgLSAyNHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMjRweCk7XFxufVxcblxcbi5sb2FkZXItZG91YmxlOmJlZm9yZSB7XFxuICB3aWR0aDogNjRweDtcXG4gIGhlaWdodDogNjRweDtcXG4gIGJvcmRlci1jb2xvcjogI2ViOTc0ZTtcXG4gIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kdXJhdGlvbjogMnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kdXJhdGlvbjogMnM7XFxuICB0b3A6IGNhbGMoNTAlIC0gMzJweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDMycHgpO1xcbn1cXG5cXG4ubG9hZGVyLWJhcltkYXRhLXRleHRdOmJlZm9yZSB7XFxuICB0b3A6IGNhbGMoNTAlIC0gNDBweCk7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLmxvYWRlci1iYXI6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAyMDBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KC00NWRlZywgIzQxODNkNyAyNSUsICM1MmIzZDkgMCwgIzUyYjNkOSA1MCUsICM0MTgzZDcgMCwgIzQxODNkNyA3NSUsICM1MmIzZDkgMCwgIzUyYjNkOSk7XFxuICBiYWNrZ3JvdW5kLXNpemU6IDIwcHggMjBweDtcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgMTBweCAwIGhzbGEoMCwgMCUsIDEwMCUsIDAuMiksIDAgMCAwIDVweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICBhbmltYXRpb246IG1vdmVCYXIgMS41cyBsaW5lYXIgaW5maW5pdGUgcmV2ZXJzZTtcXG59XFxuXFxuLmxvYWRlci1iYXJbZGF0YS1yb3VuZGVkXTphZnRlciB7XFxuICBib3JkZXItcmFkaXVzOiAxNXB4O1xcbn1cXG5cXG4ubG9hZGVyLWJhcltkYXRhLWludmVyc2VdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRpcmVjdGlvbjogbm9ybWFsO1xcbiAgICAgICAgICBhbmltYXRpb24tZGlyZWN0aW9uOiBub3JtYWw7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMHB4IDIwcHg7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbW92ZUJhciB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMjBweCAyMHB4O1xcbiAgfVxcbn1cXG4ubG9hZGVyLWJhci1waW5nLXBvbmc6YmVmb3JlIHtcXG4gIHdpZHRoOiAyMDBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZzphZnRlciwgLmxvYWRlci1iYXItcGluZy1wb25nOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGhlaWdodDogMjBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogY2FsYyg1MCUgLSAxMHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbn1cXG5cXG4ubG9hZGVyLWJhci1waW5nLXBvbmc6YWZ0ZXIge1xcbiAgd2lkdGg6IDUwcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjE5O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjVzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nIDAuNXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuLmxvYWRlci1iYXItcGluZy1wb25nW2RhdGEtcm91bmRlZF06YmVmb3JlIHtcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZ1tkYXRhLXJvdW5kZWRdOmFmdGVyIHtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb24tbmFtZTogbW92ZUJhclBpbmdQb25nUm91bmRlZDtcXG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IG1vdmVCYXJQaW5nUG9uZ1JvdW5kZWQ7XFxufVxcblxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgLSAxMDBweCk7XFxuICB9XFxuICB0byB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgNTBweCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdSb3VuZGVkIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgLSAxMDBweCk7XFxuICB9XFxuICB0byB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgODBweCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nUm91bmRlZCB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDgwcHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY29ybmVycyB7XFxuICA2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICB9XFxuICAyNSUge1xcbiAgICB3aWR0aDogMTVweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgdG9wOiAwO1xcbiAgfVxcbiAgMzElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gIH1cXG4gIDU2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHRvcDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA4MSUge1xcbiAgICBoZWlnaHQ6IDYwcHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY29ybmVycyB7XFxuICA2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICB9XFxuICAyNSUge1xcbiAgICB3aWR0aDogMTVweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgdG9wOiAwO1xcbiAgfVxcbiAgMzElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gIH1cXG4gIDU2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHRvcDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA4MSUge1xcbiAgICBoZWlnaHQ6IDYwcHg7XFxuICB9XFxufVxcbi5sb2FkZXItYm9yZGVyW2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4ubG9hZGVyLWJvcmRlcjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTVweDtcXG4gIGhlaWdodDogMTVweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29ybmVycyAzcyBlYXNlIGJvdGggaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29ybmVycyAzcyBlYXNlIGJvdGggaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItYmFsbDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAtMjVweCAwIDAgLTI1cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBraWNrQmFsbCAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1pbiBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGtpY2tCYWxsIDFzIGluZmluaXRlIGFsdGVybmF0ZSBlYXNlLWluIGJvdGg7XFxufVxcblxcbi5sb2FkZXItYmFsbFtkYXRhLXNoYWRvd106YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IGluc2V0IC01cHggLTVweCAxMHB4IDAgcmdiYSgwLCAwLCAwLCAwLjUpO1xcbn1cXG5cXG4ubG9hZGVyLWJhbGw6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMyk7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogNDVweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRvcDogY2FsYyg1MCUgKyAxMHB4KTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogMCAwIDAgLTIyLjVweDtcXG4gIHotaW5kZXg6IDA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogc2hhZG93IDFzIGluZmluaXRlIGFsdGVybmF0ZSBlYXNlLW91dCBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IHNoYWRvdyAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1vdXQgYm90aDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIHNoYWRvdyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMCk7XFxuICB9XFxuICA5NSUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIHNoYWRvdyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMCk7XFxuICB9XFxuICA5NSUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMga2lja0JhbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTgwcHgpIHNjYWxlWCgwLjk1KTtcXG4gIH1cXG4gIDkwJSB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApIHNjYWxlWCgxKTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlIDUwJSAyMCUgMjAlO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGtpY2tCYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC04MHB4KSBzY2FsZVgoMC45NSk7XFxuICB9XFxuICA5MCUge1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKSBzY2FsZVgoMSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJSA1MCUgMjAlIDIwJTtcXG4gIH1cXG59XFxuLmxvYWRlci1zbWFydHBob25lOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEycHg7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAxMjBweDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGxlZnQ6IDUwJTtcXG4gIHRvcDogNTAlO1xcbiAgd2lkdGg6IDcwcHg7XFxuICBoZWlnaHQ6IDEzMHB4O1xcbiAgbWFyZ2luOiAtNjVweCAwIDAgLTM1cHg7XFxuICBib3JkZXI6IDVweCBzb2xpZCAjZmQwO1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgNXB4IDAgMCAjZmQwO1xcbiAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCA1MCUgOTAlLCByZ2JhKDAsIDAsIDAsIDAuNSkgNnB4LCB0cmFuc3BhcmVudCAwKSwgbGluZWFyLWdyYWRpZW50KDBkZWcsICNmZDAgMjJweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgwZGVnLCByZ2JhKDAsIDAsIDAsIDAuNSkgMjJweCwgcmdiYSgwLCAwLCAwLCAwLjUpKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBzaGFrZSAycyBjdWJpYy1iZXppZXIoMC4zNiwgMC4wNywgMC4xOSwgMC45NykgYm90aCBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBzaGFrZSAycyBjdWJpYy1iZXppZXIoMC4zNiwgMC4wNywgMC4xOSwgMC45NykgYm90aCBpbmZpbml0ZTtcXG59XFxuXFxuLmxvYWRlci1zbWFydHBob25lW2RhdGEtc2NyZWVuPVxcXCJcXFwiXTphZnRlciB7XFxuICBjb250ZW50OiBcXFwiTG9hZGluZ1xcXCI7XFxufVxcblxcbi5sb2FkZXItc21hcnRwaG9uZTpub3QoW2RhdGEtc2NyZWVuPVxcXCJcXFwiXSk6YWZ0ZXIge1xcbiAgY29udGVudDogYXR0cihkYXRhLXNjcmVlbik7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBzaGFrZSB7XFxuICA1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAxMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDM1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICA0MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBzaGFrZSB7XFxuICA1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAxMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDM1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICA0MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG59XFxuLmxvYWRlci1jbG9jazpiZWZvcmUge1xcbiAgd2lkdGg6IDEyMHB4O1xcbiAgaGVpZ2h0OiAxMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIG1hcmdpbjogLTYwcHggMCAwIC02MHB4O1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgdHJhbnNwYXJlbnQgNTAlLCAjZjVmNWY1IDApLCBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHRyYW5zcGFyZW50IDU1cHgsICMyZWNjNzEgMCwgIzJlY2M3MSA2NXB4LCB0cmFuc3BhcmVudCAwKSwgbGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2Y1ZjVmNSA1MCUsICNmNWY1ZjUgMCk7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDAgMCAxMHB4ICNmNWY1ZjUsIDAgMCAwIDVweCAjNTU1LCAwIDAgMCAxMHB4ICM3YjdiN2I7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogcm90YXRpb24gaW5maW5pdGUgMnMgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDJzIGxpbmVhcjtcXG59XFxuXFxuLmxvYWRlci1jbG9jazphZnRlciwgLmxvYWRlci1jbG9jazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBsZWZ0OiA1MCU7XFxuICB0b3A6IDUwJTtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbi5sb2FkZXItY2xvY2s6YWZ0ZXIge1xcbiAgd2lkdGg6IDYwcHg7XFxuICBoZWlnaHQ6IDQwcHg7XFxuICBtYXJnaW46IC0yMHB4IDAgMCAtMTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDIwcHggMCAwIDIwcHg7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDE0cHggMjBweCwgIzI1YTI1YSAxMHB4LCB0cmFuc3BhcmVudCAwKSwgcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAxNHB4IDIwcHgsICMxYjc5NDMgMTRweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHRyYW5zcGFyZW50IDE1cHgsICMyZWNjNzEgMCwgIzJlY2M3MSAyNXB4LCB0cmFuc3BhcmVudCAwKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiBpbmZpbml0ZSAyNHMgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDI0cyBsaW5lYXI7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAxNXB4IGNlbnRlcjtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluOmFmdGVyLCAubG9hZGVyLWN1cnRhaW46YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdG9wOiA1MCU7XFxuICBtYXJnaW4tdG9wOiAtMzVweDtcXG4gIGZvbnQtc2l6ZTogNzBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGxpbmUtaGVpZ2h0OiAxLjI7XFxuICBjb250ZW50OiBcXFwiTG9hZGluZ1xcXCI7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbjpiZWZvcmUge1xcbiAgY29sb3I6ICM2NjY7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbjphZnRlciB7XFxuICBjb2xvcjogI2ZmZjtcXG4gIGhlaWdodDogMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtY3VydGFpbi10ZXh0XTpub3QoW2RhdGEtY3VydGFpbi10ZXh0PVxcXCJcXFwiXSk6YWZ0ZXIsIC5sb2FkZXItY3VydGFpbltkYXRhLWN1cnRhaW4tdGV4dF06bm90KFtkYXRhLWN1cnRhaW4tdGV4dD1cXFwiXFxcIl0pOmJlZm9yZSB7XFxuICBjb250ZW50OiBhdHRyKGRhdGEtY3VydGFpbi10ZXh0KTtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtYnJhemlsaWFuXTpiZWZvcmUge1xcbiAgY29sb3I6ICNmMWM0MGY7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWJyYXppbGlhbl06YWZ0ZXIge1xcbiAgY29sb3I6ICMyZWNjNzE7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWNvbG9yZnVsXTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1hc2tDb2xvcmZ1bCAycyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbWFza0NvbG9yZnVsIDJzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtY29sb3JmdWxdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aCwgbWFza0NvbG9yZnVsLWZyb250IDJzIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aCwgbWFza0NvbG9yZnVsLWZyb250IDJzIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gIGNvbG9yOiAjMDAwO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbWFza0NvbG9yZnVsIHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMzNDk4ZGI7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2U3NGMzYztcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbWFza0NvbG9yZnVsIHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMzNDk4ZGI7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2U3NGMzYztcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtYXNrQ29sb3JmdWwtZnJvbnQge1xcbiAgMCUge1xcbiAgICBjb2xvcjogIzJlY2M3MTtcXG4gIH1cXG4gIDQ5LjUlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA1MC41JSB7XFxuICAgIGNvbG9yOiAjZjFjNDBmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtYXNrQ29sb3JmdWwtZnJvbnQge1xcbiAgMCUge1xcbiAgICBjb2xvcjogIzJlY2M3MTtcXG4gIH1cXG4gIDQ5LjUlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA1MC41JSB7XFxuICAgIGNvbG9yOiAjZjFjNDBmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGN1cnRhaW4ge1xcbiAgMCUge1xcbiAgICBoZWlnaHQ6IDA7XFxuICB9XFxuICB0byB7XFxuICAgIGhlaWdodDogODRweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBjdXJ0YWluIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBoZWlnaHQ6IDg0cHg7XFxuICB9XFxufVxcbi5sb2FkZXItbXVzaWM6YWZ0ZXIsIC5sb2FkZXItbXVzaWM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgd2lkdGg6IDI0MHB4O1xcbiAgaGVpZ2h0OiAyNDBweDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAtMTIwcHggMCAwIC0xMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAyNDBweDtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiA0MHB4O1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICB0ZXh0LXNoYWRvdzogMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gIGxldHRlci1zcGFjaW5nOiAtMXB4O1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljOmFmdGVyIHtcXG4gIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICAgICAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1oZXktb2hdOmFmdGVyLCAubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogMCAwIDAgMTBweDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLWhleS1vaF06YmVmb3JlIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBjb2xvcjogIzAwMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgb2ggNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIG9oIDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTphZnRlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIGhleSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBoZXkgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1uby1jcnldOmFmdGVyLCAubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTpiZWZvcmUge1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjMDA5YjNhIDUwJSwgI2ZlZDEwMCA1MSUpO1xcbiAgYm94LXNoYWRvdzogMCAwIDAgMTBweCAjMDAwO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCBjcnkgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIGNyeSA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLW5vLWNyeV06YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIG5vIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIG5vIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtd2UtYXJlXTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCB0aGVXb3JsZCA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgdGhlV29ybGQgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSBhdCBjZW50ZXIsICM0ZWNkYzQgMCwgIzU1NjI3MCk7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS13ZS1hcmVdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZUFyZSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZUFyZSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChlbGxpcHNlIGF0IGNlbnRlciwgIzI2ZDBjZSAwLCAjMWEyOTgwKTtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXJvY2steW91XTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCByb2NrWW91IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCByb2NrWW91IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgYmFja2dyb3VuZDogIzQ0NDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXJvY2steW91XTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgd2VXaWxsIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIHdlV2lsbCA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6ICM5NjI4MWI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBjb2luIHtcXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDM1OWRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgY29pbiB7XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY29pbkJhY2sge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxdHVybik7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGNvaW5CYWNrIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMXR1cm4pO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGhleSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJMZXQncyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiSGV5IVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgaGV5IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIkhleSFcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIkxldCdzIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG9oIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiR28hXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgb2gge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiT2ghXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJHbyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiT2ghXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG5vIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJub1xcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJOby4uLlxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm8ge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiTm8uLi5cXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIm5vXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGNyeSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiY3J5IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY3J5IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIndvbWFuXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJjcnkhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndvbWFuXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHdlQXJlIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwid2UgYXJlXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgd2VBcmUge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2UgYXJlXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSBhcmVcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiV2UgYXJlXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHRoZVdvcmxkIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSB3b3JsZCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSBjaGlsZHJlbiFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgdGhlV29ybGQge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwidGhlIGNoaWxkcmVuIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgd29ybGQsXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHdlV2lsbCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwicm9jayB5b3UhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIHdpbGwsXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyB3ZVdpbGwge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2Ugd2lsbCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInJvY2sgeW91IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyByb2NrWW91IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIvCfpJhcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwid2Ugd2lsbFxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgcm9ja1lvdSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSB3aWxsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn6SYXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbn1cXG4ubG9hZGVyLXBva2ViYWxsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiAxMDBweDtcXG4gIGhlaWdodDogMTAwcHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTUwcHggMCAwIC01MHB4O1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmVkIDQyJSwgIzAwMCAwLCAjMDAwIDU4JSwgI2ZmZiAwKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlUG9rZWJhbGwgMXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLXBva2ViYWxsOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDI0cHg7XFxuICBoZWlnaHQ6IDI0cHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTEycHggMCAwIC0xMnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHotaW5kZXg6IDI7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoLCBmbGFzaFBva2ViYWxsIDAuNXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVQb2tlYmFsbCAxcyBsaW5lYXIgaW5maW5pdGUgYm90aCwgZmxhc2hQb2tlYmFsbCAwLjVzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gIGJvcmRlcjogMnB4IHNvbGlkICMwMDA7XFxuICBib3gtc2hhZG93OiAwIDAgMCA1cHggI2ZmZiwgMCAwIDAgMTBweCAjMDAwO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZVBva2ViYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApIHJvdGF0ZSgwKTtcXG4gIH1cXG4gIDE1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRleCgtMTBweCkgcm90YXRlKC01ZGVnKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMHB4KSByb3RhdGUoNWRlZyk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoMCkgcm90YXRlKDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1vdmVQb2tlYmFsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKSByb3RhdGUoMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoLTEwcHgpIHJvdGF0ZSgtNWRlZyk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTBweCkgcm90YXRlKDVkZWcpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGV4KDApIHJvdGF0ZSgwKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGZsYXNoUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmQwO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGZsYXNoUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmQwO1xcbiAgfVxcbn1cXG4ubG9hZGVyLWJvdW5jaW5nOmFmdGVyLCAubG9hZGVyLWJvdW5jaW5nOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDEwcHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAxMHB4KTtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjoga2ljayAwLjZzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWJvdW5jaW5nOmFmdGVyIHtcXG4gIG1hcmdpbi1sZWZ0OiAtMzBweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGtpY2sgMC42cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbi5sb2FkZXItYm91bmNpbmc6YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBraWNrIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBvcGFjaXR5OiAwLjM7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXJlbSk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMga2ljayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgb3BhY2l0eTogMC4zO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFyZW0pO1xcbiAgfVxcbn1cXG4uc2JsLWNpcmMtcmlwcGxlIHtcXG4gIGhlaWdodDogNDhweDtcXG4gIHdpZHRoOiA0OHB4O1xcbiAgY29sb3I6ICM0ODY1OWI7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICB0b3A6IDIwJTtcXG4gIGxlZnQ6IDQwJTtcXG59XFxuXFxuLnNibC1jaXJjLXJpcHBsZTo6YWZ0ZXIsIC5zYmwtY2lyYy1yaXBwbGU6OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGhlaWdodDogMDtcXG4gIHdpZHRoOiAwO1xcbiAgYm9yZGVyOiBpbmhlcml0O1xcbiAgYm9yZGVyOiA1cHggc29saWQ7XFxuICBib3JkZXItcmFkaXVzOiBpbmhlcml0O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgbGVmdDogNDAlO1xcbiAgdG9wOiA0MCU7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY2lyY2xlLXJpcHBsZSAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY2lyY2xlLXJpcHBsZSAxcyBsaW5lYXIgaW5maW5pdGU7XFxufVxcblxcbi5zYmwtY2lyYy1yaXBwbGU6OmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTAuNnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuNnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBjaXJjbGUtcmlwcGxlIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgICB3aWR0aDogMDtcXG4gICAgbGVmdDogMS42cmVtO1xcbiAgICB0b3A6IDEuNnJlbTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBsZWZ0OiAtMXJlbTtcXG4gICAgdG9wOiAtMXJlbTtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBjaXJjbGUtcmlwcGxlIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgICB3aWR0aDogMDtcXG4gICAgbGVmdDogMS42cmVtO1xcbiAgICB0b3A6IDEuNnJlbTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBsZWZ0OiAtMXJlbTtcXG4gICAgdG9wOiAtMXJlbTtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59LyojIHNvdXJjZU1hcHBpbmdVUkw9c3R5bGUuY3NzLm1hcCAqL1wiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL2Nzcy9zdHlsZS5jc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9iYXNlL19jdXN0b21CYXNlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9iYXNlL19taXhpbnMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX2Zvb3Rlci5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fb3BlbmluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fcHJvcGVydGllcy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fc2luZ2xlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19jb25zdGFudC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fc2VhcmNoLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19sb2FkZXIuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX2FsbC1uZXdzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19zaGFkb3ctYm94LnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3dubG9hZHMvY3NzLWxvYWRlci5jc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3dubG9hZHMvc2JsLWNpcmMtcmlwcGxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSxnQkFBZ0I7QUNFaEI7RUFDSSxrQkFBQTtFQUVBLFNBQUE7QURESjtBRUdJO0VETEo7SUFjUSxjQUFB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RUE7RUFDRTtJQUNFLFNBQUE7SUFDQSxRQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7RWJ1M0VGO0VhcjNFQTtJQUNFLFlBQUE7SUFDQSxXQUFBO0lBQ0EsV0FBQTtJQUNBLFVBQUE7SUFDQSxVQUFBO0VidTNFRjtBQUNGOztBYXA0RUE7RUFDRTtJQUNFLFNBQUE7SUFDQSxRQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7RWJ1M0VGO0VhcjNFQTtJQUNFLFlBQUE7SUFDQSxXQUFBO0lBQ0EsV0FBQTtJQUNBLFVBQUE7SUFDQSxVQUFBO0VidTNFRjtBQUNGLENBQUEsb0NBQUFcIixcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCBcIlwiKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vZG90cy5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2RvdHMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcblxuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG5cbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG5cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cblxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG5cbiAgY3NzICs9IG9iai5jc3M7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vQ29udGludWUgdG8gd29yayBvbiBtYWtpbmcgdGhpcyBtb3JlIGVmZmljaWVudCBhbmQgcmVhZGFibGVcclxuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiXHJcbmltcG9ydCBTaGFkb3dCb3ggZnJvbSAnLi9zaGFkb3dCb3gnO1xyXG5jbGFzcyBOZXdzIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgLy8gdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyk7XHJcbiAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYWxsLW5ld3MtY29udGFpbmVyJykpe1xyXG4gICAgICAgIHRoaXMudmlld1BvcnRIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICAgICAgICB0aGlzLnJldHVybkhvbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmV0dXJuLWhvbWUnKTtcclxuICAgICAgICAgICAgICAgICAvL0xhdGVyLCBmaW5kIHdheSB0byBtYWtlIHRoaXMgbm90IGNhdXNlIGVycm9ycyBvbiBvdGhlciBwYWdlc1xyXG4gICAgICAgIHRoaXMubWFpbkNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhbGwtbmV3cy1jb250YWluZXInKTtcclxuICAgICAgICB0aGlzLm5ld3NSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluLWRpc3BsYXknKTtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFnaW5hdGlvbi1ob2xkZXInKVxyXG4gICAgICAgIHRoaXMucmVsYXRpb25zaGlwTGlua3M7XHJcbiAgICAgICAgdGhpcy5zZWVNb3JlO1xyXG4gICAgICAgIHRoaXMuYWxsT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXInKVxyXG4gICAgICAgIHRoaXMub3B0aW9uc0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcHRpb25zLXN3aXRjaCcpO1xyXG4gICAgICAgIHRoaXMuYWxsT3B0aW9uc1Zpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRpc21pc3NCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGlzbWlzcy1zZWxlY3Rpb24nKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnM7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbFRpdGxlID0gXCJBbGwgTmV3c1wiO1xyXG4gICAgICAgIHRoaXMuc3RvcmVkVGl0bGU7XHJcbiAgICAgICAgdGhpcy5mdWxsRGlzcGxheUNvbnRlbnQgPSBbXTtcclxuICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZXh0ZXJuYWxDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub3JpZ2luO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMubWFpbkhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluLWhlYWRlcicpO1xyXG5cclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25ld3Mtc2VhcmNoXCIpXHJcbiAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSAnJztcclxuICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMucHJldmlvdXNWYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy50eXBpbmdUaW1lcjtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoQ2xvbmVDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbW9iaWxlLXR5cGluZy1jb250YWluZXInKTtcclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2hDbG9uZSA9IHRoaXMubmV3c1NlYXJjaENsb25lQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Jyk7XHJcbiAgICAgICAgdGhpcy5jbG9zZU5ld3NTZWFyY2hDbG9uZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbG9zZS1tb2JpbGUtbmV3cy1zZWFyY2gnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0OyAgICAgIFxyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZnVsbC1kaXNwbGF5LWNvbnRhaW5lcicpOyAgICBcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRBbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQtYWxsJyk7XHJcblxyXG4gICAgICAgIHRoaXMudG9nZ2xlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2dnbGUtb3B0aW9ucycpO1xyXG5cclxuICAgICAgICAvL0FmdGVyIGdldCBldmVyeXRoaW5nIHdvcmtpbmcsIHB1dCB0aGUgc2V0dGluZyBpbiBoZXJlLCByYXJlciB0aGFuIGp1c3QgYSByZWZcclxuICAgICAgICAvL252bS4gTmVlZCB0byBkbyBpdCBub3dcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnJlb3JkZXJCeURhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3JkZXItYnktZGF0ZScpO1xyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5QWxwaGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3JkZXItYnktYWxwaGEnKTtcclxuXHJcbiAgICAgICAgdGhpcy5mdWxsV29yZFN3aXRjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmdWxsLXdvcmQtb25seScpO1xyXG5cclxuICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3b3JkLXN0YXJ0LW9ubHknKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYXNlU2Vuc2l0aXZlU3dpdGNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Nhc2Utc2Vuc2l0aXZlJyk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVRpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2luY2x1ZGUtdGl0bGUnKTtcclxuICAgICAgICB0aGlzLmluY2x1ZGVEZXNjcmlwdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLWRlc2NyaXB0aW9uJyk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVByb3BlcnR5VXBkYXRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLXByb3BlcnR5LXVwZGF0ZXMnKTtcclxuICAgICAgICB0aGlzLmluY2x1ZGVHZW5lcmFsTmV3cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLWdlbmVyYWwtbmV3cycpO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dhYmxlU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGRhdGVPcmRlcjp7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdvcmRlci1ieS1kYXRlJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2Rlc2MnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhbHBoYU9yZGVyOntcclxuICAgICAgICAgICAgICAgIHJlZjogJ29yZGVyLWJ5LWFscGhhJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2Rlc2MnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogZmFsc2VcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5jbHVkZVRpdGxlOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdpbmNsdWRlLXRpdGxlJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbmNsdWRlRGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ2luY2x1ZGUtZGVzY3JpcHRpb24nLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnaW5jbHVkZScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHVwZGF0ZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS1wcm9wZXJ0eS11cGRhdGVzJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuZXdzOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdpbmNsdWRlLWdlbmVyYWwtbmV3cycsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZnVsbFdvcmQ6IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ2Z1bGwtd29yZC1vbmx5JyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2Z1bGwtd29yZC1vbmx5JyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHdvcmRTdGFydE9ubHk6IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ3dvcmQtc3RhcnQtb25seScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICd3b3JkLXN0YXJ0LW9ubHknLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogZmFsc2VcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaXNDYXNlU2Vuc2l0aXZlOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdjYXNlLXNlbnNpdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdjYXNlLXNlbnNpdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRoaXMuZmlsdGVyQnlkYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbHRlci1ieS1kYXRlJylcclxuICAgICAgICAvLyB0aGlzLmlzRGF0ZUZpbHRlck9uID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkYXRlLWZpbHRlcnMnKTtcclxuICAgICAgICB0aGlzLmRhdGVGaWx0ZXJPcHRpb25zID0gdGhpcy5kYXRlRmlsdGVycy5xdWVyeVNlbGVjdG9yQWxsKCdzZWxlY3QnKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy9yYW5nZSBtYWtlcyB0aGUgcHJldmlvdXMgdHdvIG51bGwsIGVmZmVjdGl2ZWx5IGNhbmNlbGluZyB0aGV5IG91dCBhbmQgc2h1dHRpbmcgb2ZmIHRoZWlyIGlmIGxvZ2ljXHJcbiAgICAgICAgLy9idXR0b24gd2lsbCBtYWtlIG9wdGlvbnMgYXBwZWFyIGFuZCBtYWtlIGlzRmlsdGVyT24gPSB0cnVlLCBidXQgaWYgbm8gb3B0aW9uIGlzIHNlbGVjdGVkLCB0aGV5IGRpc3NhcGVhciBhbmQgZmFsc2UgaXMgcmVzdG9yZWQgXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyU2V0VXAgPSB7XHJcbiAgICAgICAgICAgIG1vbnRoOiBudWxsLFxyXG4gICAgICAgICAgICB5ZWFyOiBudWxsLFxyXG4gICAgICAgICAgICAvLyByYW5nZToge1xyXG4gICAgICAgICAgICAvLyAgICAgc3RhcnQ6IG51bGwsXHJcbiAgICAgICAgICAgIC8vICAgICBlbmQ6IG51bGxcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy55ZWFyT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNieS15ZWFyJyk7XHJcbiAgICAgICAgdGhpcy5tb250aE9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnktbW9udGgnKTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy55ZWFyTGlzdCA9IHt9XHJcbiAgICAgICAgdGhpcy5tb250aHMgPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMudG9nZ2FibGVTZXR0aW5ncztcclxuICAgICAgICB0aGlzLmV2ZW50cyh0YXJnZXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50cyh0YXJnZXQpe1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKT0+e1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XHJcbiAgICAgICAgICAgICAgICBpZih3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMjAwKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnNWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGxPcHRpb25zLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGUtaW4nKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnMuY2xhc3NMaXN0LnJlbW92ZSgnZmFkZS1vdXQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMzAwKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLy8gY29uc3QgZGVmYXVsdFN3aXRjaFNldHRpbmdzID0gey4uLnRoaXMudG9nZ2FibGVTZXR0aW5ncywgYWxwaGFPcmRlcjogey4uLnRoaXMudG9nZ2FibGVTZXR0aW5ncy5hbHBoYU9yZGVyfX07XHJcbiAgICAgICAgbGV0IGRlZmF1bHRTd2l0Y2hTZXR0aW5ncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy50b2dnYWJsZVNldHRpbmdzKSlcclxuXHJcbiAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcblxyXG4gICAgICAgIHRoaXMucG9wdWxhdGVEYXRlRmlsdGVycygpO1xyXG5cclxuICAgICAgICB0aGlzLnJlc2V0QWxsLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZVRleHQoZGVmYXVsdFN3aXRjaFNldHRpbmdzKTtcclxuICAgICAgICAgICAgdGhpcy50b2dnYWJsZVNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0U3dpdGNoU2V0dGluZ3MpKTtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gdGhpcy50b2dnYWJsZVNldHRpbmdzOyBcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50b2dnYWJsZVNldHRpbmdzLmRhdGVPcmRlciwgdGFyZ2V0LmRhdGVPcmRlcilcclxuICAgICAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24uY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZGVmYXVsdFN3aXRjaFNldHRpbmdzLmlzQ2FzZVNlbnNpdGl2ZSlcclxuICAgICAgICAgICAgLy8gdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGAke3RoaXMuaW5pdGlhbFRpdGxlfWA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFJlcG9ydCA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubmV3c1NlYXJjaC52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLmRpc21pc3NTZWxlY3Rpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyB0aGlzLm1lZGlhQ29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgdGhpcy55ZWFyT3B0aW9ucy52YWx1ZSA9ICcnXHJcbiAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLnZhbHVlID0gJydcclxuICAgICAgICAgICAgdGhpcy55ZWFyT3B0aW9ucy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh5ZWFyLm9wdGlvbnNbeWVhci5zZWxlY3RlZEluZGV4XS52YWx1ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9kZXNjIGRhdGUgbm90IHdvcmtpbmdcclxuICAgICAgICB0aGlzLnJlb3JkZXJCeURhdGUub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5kYXRlT3JkZXIpXHJcbiAgICAgICAgICAgIHRhcmdldC5hbHBoYU9yZGVyLmlzT24gPSBmYWxzZVxyXG4gICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuaXNPbiA9IHRydWVcclxuXHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5kYXRlT3JkZXIuZGlyZWN0aXZlID09PSAnZGVzYycpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPSAnYXNjJ1xyXG4gICAgICAgICAgICB9ZWxzZShcclxuICAgICAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuZGlyZWN0aXZlID0gJ2Rlc2MnXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgfTtcclxuLy9pbmlhdGUgdG9nZ2xlIHRocm91Z2ggdGhlc2UsIHVzaW5nIGxldHMgdG8gaGFuZGxlIGJvdGggY2hhbmdlcyBiYXNlZCBvbiB0aGUgLmRpcmVjdGl2ZSB2YWx1ZSwgXHJcbi8vYW5kIG1heWJlIGV2ZW4gc2V0dGluZyBpbnRpYWwgaGlkaW5nIHRoaXMgd2F5IHRvbyBcclxuICAgICAgICB0aGlzLnJlb3JkZXJCeUFscGhhLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICB0YXJnZXQuZGF0ZU9yZGVyLmlzT24gPSBmYWxzZVxyXG4gICAgICAgICAgICB0YXJnZXQuZGF0ZU9yZGVyLmRpcmVjdGl2ZSA9ICdkZXNjJ1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuaXNPbiA9IHRydWVcclxuXHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5hbHBoYU9yZGVyLmRpcmVjdGl2ZSA9PT0gJ2Rlc2MnKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5hbHBoYU9yZGVyLmRpcmVjdGl2ZSA9ICdhc2MnXHJcbiAgICAgICAgICAgIH1lbHNlKFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID0gJ2Rlc2MnXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmNsdWRlUHJvcGVydHlVcGRhdGVzLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQudXBkYXRlLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnVwZGF0ZS5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnVwZGF0ZS5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSAgXHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZUdlbmVyYWxOZXdzLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQubmV3cy5pc09uID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5uZXdzLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQubmV3cy5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5mdWxsV29yZFN3aXRjaC5vbmNsaWNrID0gKCk9PntcclxuXHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5mdWxsV29yZC5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5mdWxsV29yZC5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9ZWxzZXsgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRhcmdldC5mdWxsV29yZC5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMud29yZFNlYXJjaFBvc2l0aW9uLmNsYXNzTGlzdC5hZGQoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGB3b3JkIHN0YXJ0IG9ubHkgaXM6ICR7dGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbn1gKVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgZnVsbCB3b3JkIG9ubHkgaXM6ICR7dGFyZ2V0LmZ1bGxXb3JkLmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMud29yZFNlYXJjaFBvc2l0aW9uLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQud29yZFN0YXJ0T25seS5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQud29yZFN0YXJ0T25seS5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHdvcmQgc3RhcnQgb25seSBpczogJHt0YXJnZXQud29yZFN0YXJ0T25seS5pc09ufWApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNhc2VTZW5zaXRpdmVTd2l0Y2gub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgY2FzZSBzZW5zaXRpdmUgaXM6ICR7dGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09ufWApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVUaXRsZS5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlVGl0bGUuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlVGl0bGUuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmNsdWRlRGVzY3JpcHRpb24ub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbil7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5jbHVkZURlc2NyaXB0aW9uLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5jbHVkZURlc2NyaXB0aW9uLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIHRoaXMuaW5jbHVkZVJlbGF0aW9uc2hpcC5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAvLyAgICAgaWYodGhpcy5zZWFyY2hhYmxlRmllbGRzLnJlbGF0aW9uc2hpcHMpe1xyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5zZWFyY2hhYmxlRmllbGRzLnJlbGF0aW9uc2hpcHMgPSBmYWxzZTtcclxuICAgICAgICAvLyAgICAgfWVsc2V7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyA9IHRydWU7XHJcbiAgICAgICAgLy8gICAgIH0gIFxyXG4gICAgICAgIC8vIH07XHJcblxyXG4gICAgICAgIC8vIHRoaXMuZmlsdGVyQnlkYXRlLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vICAgICB0aGlzLmRhdGVGaWx0ZXJzLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIC8vICAgICB0aGlzLmlzRGF0ZUZpbHRlck9uID0gdHJ1ZTtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2codGhpcy5pc0RhdGVGaWx0ZXJPbilcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlck9wdGlvbnMuZm9yRWFjaChlID0+e1xyXG4gICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChvcHRpb24pPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudE1vbnRoID0gdGhpcy5tb250aE9wdGlvbnMudmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZS5pZCA9PT0gJ2J5LXllYXInKXtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy55ZWFyT3B0aW9ucy52YWx1ZSAhPT0gJycpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPkFueTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLnllYXJMaXN0W3RoaXMueWVhck9wdGlvbnMudmFsdWVdLm1hcChtb250aD0+IGA8b3B0aW9uIHZhbHVlPVwiJHttb250aH1cIj4ke21vbnRofTwvb3B0aW9uPmApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPkFueTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5tb250aHMubWFwKG1vbnRoPT4gYDxvcHRpb24gdmFsdWU9XCIke21vbnRofVwiPiR7bW9udGh9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMubW9udGhPcHRpb25zLnF1ZXJ5U2VsZWN0b3IoYG9wdGlvblt2YWx1ZT0nJHtjdXJyZW50TW9udGh9J11gKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZSA9IGN1cnJlbnRNb250aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMudmFsdWUgPSAnJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gb3B0aW9uLnRhcmdldC5pZC5zbGljZSgzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZUZpbHRlclNldFVwW3ZhbHVlXSA9IG9wdGlvbi50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmRhdGVGaWx0ZXJTZXRVcClcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMubmV3c1NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsICgpID0+IHRoaXMudHlwaW5nTG9naWMoKSlcclxuICAgICAgICB0aGlzLm9wdGlvbnNCdXR0b24uZm9yRWFjaChlPT57ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMudG9nZ2xlQWxsT3B0aW9ucygpKX0pXHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5kaXNtaXNzU2VsZWN0aW9uKCkpXHJcblxyXG4gICAgICAgIHRoaXMubmV3c1NlYXJjaENsb25lLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKCkgPT4gdGhpcy5zaW11VHlwaW5nKCkpO1xyXG4gICAgICAgIC8vY29uc2lkZXJpbmcgY2hhbmdlIGxheW91dCBvZiBvcHRpb25zIGFzIGFsdCB0byBjbG9uZVxyXG4gICAgICAgIHRoaXMubmV3c1NlYXJjaC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgKCk9PiB0aGlzLm9wZW5DbG9uZSgpKTtcclxuICAgICAgICB0aGlzLmNsb3NlTmV3c1NlYXJjaENsb25lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PiB0aGlzLmNsb3NlQ2xvbmUoKSk7XHJcblxyXG4gICAgICAgIHRoaXMudG9nZ2xlVGV4dCh0YXJnZXQpO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlT3B0aW9ucy5mb3JFYWNoKGU9PntlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PiB0aGlzLnRvZ2dsZVRleHQodGFyZ2V0KSl9KVxyXG4gICAgfVxyXG4vL0FkZCAnaXNPbicgdG8gZXhjbHVkZXMsIHdpdGggaW5jbHVkZSBoYXZpbmcgY2xhc3Mgb2ZmIGFuZCBleGNsdWRlIGhhdmluZyBjbGFzcyBvZiAqdmFsdWU/XHJcbiAgICB0b2dnbGVUZXh0KHRhcmdldCl7XHJcbiAgICAgICAgbGV0IGZpbHRlcktleXMgPSBPYmplY3Qua2V5cyh0YXJnZXQpXHJcbiAgICAgICAgZmlsdGVyS2V5cy5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgIyR7dGFyZ2V0W2VdLnJlZn0gc3BhbmApLmZvckVhY2goaT0+aS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSlcclxuICAgICAgICAgICAgaWYodGFyZ2V0W2VdLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGFyZ2V0W2VdLnJlZn0gLiR7dGFyZ2V0W2VdLmRpcmVjdGl2ZX1gKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0YXJnZXRbZV0ucmVmfSAub2ZmYCkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8vUmVkbyBwYWdpbmF0aW9uLCBidXQgd2lsbCBuZWVkIHRvIGhhdmUgc2V0dXAgd29yayBmb3IgZ2V0dGluZyByaWQgdGhyb3VnaCBlYWNoIHJlbG9hZFxyXG4gICAgXHJcbiAgICAvL2NoZWNrIHBhZ2luYXRpb24gdGhyb3VnaG91dCBlYWNoIGFkZFxyXG5cclxuICAgIC8vZXN0YWJsaXNoIGRlZmF1bHQgc2VhcmNoIGJlaGF2aW9yLiBBcyBpbiwgZG9lcyBpdCBsb29rIGF0IHRpdGxlLCBiaW8sIFxyXG4gICAgLy9hbmQgY2FwdGlvbiBwYXJ0aWFscyBhdCB0aGUgc3RhcnQ/KGluIGlmIHN0YXRlbWVudHMgdXNlIGNvbnRhaW5zIG9uIHN0cmluZ3M/KVxyXG4gICAgLy9pbiBnYXRoZXJOZXdzKCkgaGF2ZSBpZiBzdGF0ZW1lbnRzIHRoYXQgd29yayB0aHJvdWdoIHRoZSBkYXRhIGFmdGVyIGl0J3MgZ290dGVuLCBiZWZvcmUgdGhlIGluc2VydGlvbnNcclxuICAgIC8vV2hlbiBjbGljayBvbiBuZXdzLCB1c2UgYmlnZ2VyIHBpY3R1cmUuIEFsc28gcHV0IGluIGR1bW15LCBcclxuICAgIC8vcmVsYXRlZCBzaXRlcyBvbiB0aGUgcmlnaHQsIGFuZCBtYXliZSBldmVuIHJlbGF0ZWQgbWVtYmVycyBhbmQgcHJvcGVydGllcyh0aXRsZSBvdmVyIGFuZCB3aXRoIGxpbmtzKVxyXG4gICAgLy9BbHNvIGxpc3Qgb3RoZXIgbmV3cyByZWxhdGVkIHRvIGl0LCBsaWtlIGlmIGFsbCBhYm91dCBzYW1lIGJ1aWxkaW5nIG9yIG1lbWJlcihjYW4gdXNlIGNtbW9uIHJlbGF0aW9uIGZvciB0aGF0IGJ1dCBcclxuICAgIC8vbmVlZCB0byBhZGQgYSBuZXcgZmllbGQgZm9yIHR5cGVzIG9mIHJlbGF0aW9uc2hpcHMpXHJcbiAgICAvL0dpdmUgdGl0bGVzIHRvIG90aGVyIHNlY3Rpb25zLCB3aXRoIHRoZSByaWdodCBiZWluZyBkaXZpZGVkIGludG8gcmVsYXRlZCBsaW5rcyBhbmQgc2VhcmNoIG1vZGlmaWNhdGlvbnNcclxuICAgIC8vUmVtZW1iZXIgZnVuY3Rpb25hbGl0eSBmb3Igb3RoZXIgcGFydHMgbGlua2luZyB0byBoZXJlXHJcbiAgICB0eXBpbmdMb2dpYygpIHtcclxuICAgICAgICAvL0F1dG9tYXRpY2FsbHkgZGlzbWlzcyBzaW5nbGUgb3IgaGF2ZSB0aGlzIGFuZCBvdGhlciBidXR0b25zIGZyb3plbiBhbmQvb3IgaGlkZGVuIHVudGlsIGRpc21pc3NlZFxyXG4gICAgICAgIC8vTGVhbmluZyB0b3dhcmRzIHRoZSBsYXR0ZXIsIGFzIGZhciBsZXNzIGNvbXBsaWNhdGVkXHJcbiAgICAgICAgaWYgKHRoaXMubmV3c1NlYXJjaC52YWx1ZSAhPT0gdGhpcy5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5kaXNtaXNzU2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50eXBpbmdUaW1lcilcclxuICAgIFxyXG4gICAgICAgICAgaWYgKHRoaXMubmV3c1NlYXJjaC52YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNTcGlubmVyVmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gdGhpcy5uZXdzU2VhcmNoLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYFNob3dpbmcgUmVzdWx0cyBmb3I6ICR7dGhpcy5uZXdzRGVsaXZlcnl9YDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnR5cGluZ1RpbWVyID0gc2V0VGltZW91dCh0aGlzLmdhdGhlck5ld3MuYmluZCh0aGlzKSwgNzUwKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gXCJcIjtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGAke3RoaXMuaW5pdGlhbFRpdGxlfWA7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLm5ld3NTZWFyY2gudmFsdWVcclxuICAgICAgfVxyXG5cclxuICAgICAgb3BlbkNsb25lKCl7XHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoQ2xvbmVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnb3BlbmVkJyk7XHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoQ2xvbmUuZm9jdXMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY2xvc2VDbG9uZSgpe1xyXG4gICAgICAgIHRoaXMubmV3c1NlYXJjaENsb25lQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW5lZCcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzaW11VHlwaW5nKCl7XHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gdGhpcy5uZXdzU2VhcmNoQ2xvbmUudmFsdWU7XHJcbiAgICAgICAgdGhpcy50eXBpbmdMb2dpYygpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGtleVByZXNzRGlzcGF0Y2hlcihlKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gODMgJiYgIXRoaXMuaXNPdmVybGF5T3BlbiAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUgIT0gXCJJTlBVVFwiICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQudGFnTmFtZSAhPSBcIlRFWFRBUkVBXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbkNsb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKGUua2V5Q29kZSA9PT0gMjcgJiYgdGhpcy5pc092ZXJsYXlPcGVuKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VDbG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgYXN5bmMgcG9wdWxhdGVEYXRlRmlsdGVycygpe1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgLy9JcyBpdCBiZXR0ZXIganVzdCB0byB1c2Ugc2VwZXJhdGUgdXJsIHJvdXRlcz8gXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9hbGwtbmV3cz9uZXdzJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVzID0gW107XHJcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0RGF0ZXMgPSBbXTtcclxuICAgICAgICAgICAgLy8gY29uc3QgeWVhcnMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpXHJcblxyXG4gICAgICAgICAgICByZXN1bHRzLnVwZGF0ZXNBbmROZXdzLmZvckVhY2gobmV3cz0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkYXRlcy5pbmNsdWRlcyhuZXcgRGF0ZShuZXdzLmRhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tdXMnLCB7bW9udGg6ICdsb25nJywgeWVhcjogJ251bWVyaWMnfSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXMucHVzaChuZXcgRGF0ZShuZXdzLmRhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tdXMnLCB7bW9udGg6ICdsb25nJywgeWVhcjogJ251bWVyaWMnfSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhkYXRlcylcclxuXHJcbiAgICAgICAgICAgIGRhdGVzLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICAgICAgc3BsaXREYXRlcy5wdXNoKGUuc3BsaXQoJyAnKSlcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNwbGl0RGF0ZXMpXHJcblxyXG4gICAgICAgICAgICBzcGxpdERhdGVzLmZvckVhY2goZGF0ZT0+e1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLm1vbnRocy5pbmNsdWRlcyhkYXRlWzBdKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aHMucHVzaChkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8gaWYoIXllYXJzLmluY2x1ZGVzKGRhdGVbMV0pKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyB5ZWFycy5wdXNoKGRhdGVbMV0pXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ZWFyTGlzdFtkYXRlWzFdXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHllYXJzID0gT2JqZWN0LmtleXModGhpcy55ZWFyTGlzdClcclxuXHJcbiAgICAgICAgICAgIHllYXJzLmZvckVhY2goeWVhcj0+e1xyXG4gICAgICAgICAgICAgICAgc3BsaXREYXRlcy5mb3JFYWNoKGRhdGU9PntcclxuICAgICAgICAgICAgICAgICAgICBpZih5ZWFyID09PSBkYXRlWzFdKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy55ZWFyTGlzdFt5ZWFyXS5wdXNoKGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnllYXJMaXN0KVxyXG5cclxuICAgICAgICAgICAgbGV0IGFsbE1vbnRocyA9IFsnSmFudWFyeScsJ0ZlYnJ1YXJ5JywnTWFyY2gnLCAnQXByaWwnLCdNYXknLCdKdW5lJywnSnVseScsJ0F1Z3VzdCcsJ1NlcHRlbWJlcicsJ09jdG9iZXInLCdOb3ZlbWJlcicsJ0RlY2VtYmVyJ107XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vbnRocy5zb3J0KGZ1bmN0aW9uKGEsYil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWxsTW9udGhzLmluZGV4T2YoYSkgPiBhbGxNb250aHMuaW5kZXhPZihiKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHllYXJzLnNvcnQoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMueWVhck9wdGlvbnMuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPkFueTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgJHt5ZWFycy5tYXAoeWVhcj0+IGA8b3B0aW9uIHZhbHVlPVwiJHt5ZWFyfVwiPiR7eWVhcn08L29wdGlvbj5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgYDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Bbnk8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICR7dGhpcy5tb250aHMubWFwKG1vbnRoPT4gYDxvcHRpb24gdmFsdWU9XCIke21vbnRofVwiPiR7bW9udGh9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcblxyXG4gICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgYXN5bmMgZ2F0aGVyTmV3cygpe1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3NcclxuICAgICAgICAvL1B1dCByZXN1bHRzIGluIHZhciBjb3B5LCBqdXN0IGxpa2UgaW4gdGhlIHNoYWRvd2JveFxyXG4gICAgXHJcbiAgICAgICAgLy9NYXliZSwgdG8gc29sdmUgY2VydGFpbiBpc3N1ZXMgb2YgJ3VuZGVmaW5lZCcsIGFsbG93IHBhZ2luYXRpb24gZXZlbiB3aGVuIG9ubHkgMSBwYWdlLCBhcyBJIHRoaW5rIG5leHQgYW5kIHByZXYgd2lsbCBiZSBoaWRkZW4gXHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAvL0lzIGl0IGJldHRlciBqdXN0IHRvIHVzZSBzZXBlcmF0ZSB1cmwgcm91dGVzPyBcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL2FsbC1uZXdzP25ld3M9JyArIHRoaXMubmV3c0RlbGl2ZXJ5KTsgXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhOyBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3VsdHMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIC8vbWF5YmUgYWxsb3dpbmcgYSBvbmUgb24gdGhlIHBhZ2luYXRpb24gd291bGQgc29sdmUgdGhlIGVycm9yc1xyXG5cclxuICAgICAgICAgICAgLy9Gb3IgZmllbGQgZXhjbHVzaW9uLCBjb3VsZCBoYXZlIGNvZGUgcHJvY2Vzc2VkIHdpdGggbWF0Y2hlcygpIG9yIGluZGV4T2Ygb24gdGhlIGZpZWxkcyB0aGF0IGFyZW4ndCBiYW5uZWRcclxuICAgICAgICAgICAgLy9UYWtlIG91dCB0aG9zZSB0aGF0IHByb2R1Y2UgYSBmYWxzZSByZXN1bHRcclxuXHJcbiAgICAgICAgICAgIGxldCBhbGxOZXdzID0gcmVzdWx0cy51cGRhdGVzQW5kTmV3cztcclxuXHJcbiAgICAgICAgICAgIGxldCByZWxhdGVkUG9zdHMgPSByZXN1bHRzLnByb3BlcnRpZXNBbmRNZW1iZXJzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvc3RSZWxhdGlvbnNoaXBzID0gW107XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBhbGxOZXdzLm1hcChuZXdzPT57XHJcbiAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChwb3N0PT57XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYCR7bmV3cy50aXRsZX06ICR7cG9zdC5JRH1gKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpIDwgcmVsYXRlZFBvc3RzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5JRCA9PT0gcmVsYXRlZFBvc3RzW2ldLmlkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RSZWxhdGlvbnNoaXBzLnB1c2gocmVsYXRlZFBvc3RzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHBvc3RSZWxhdGlvbnNoaXBzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld3MucmVsYXRpb25zaGlwcyA9IHBvc3RSZWxhdGlvbnNoaXBzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHBvc3RSZWxhdGlvbnNoaXBzID0gW107XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xyXG4gICAgICAgICAgICBpZihuLmluZGV4T2YoJyMnKSA+IC0xKXtcclxuICAgICAgICAgICAgICAgIG4gPSBuLnNwbGl0KC9bLy1dKy8pXHJcbiAgICAgICAgICAgICAgICBpZihuWzRdLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobls1XS5pbmRleE9mKCduZXdzJykgPiAtMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuc2luZ2xlQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSB0cnVlOyBcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gYCR7bls0XX1gOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSBgJHtuWzRdfWA7IFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbiA9IG5bNl07ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJlcG9ydCA9IG5bNF0uc2xpY2UoMSk7IFxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSgnJywgJycsIGAvJHtuWzJdfS0ke25bM119YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaGlzdG9yeS5nbygtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHRlcm5hbENhbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbmV3c1R5cGVzID0gWyduZXdzJywgJ3VwZGF0ZSddO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGFDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld3NPdXRwdXQgPSAyO1xyXG4gICAgICAgICAgICBsZXQgcGFnZUNvdW50ID0gMDtcclxuICAgICAgICAgICAgbGV0IG5ld3NQYWdlID0gW107XHJcbiAgICAgICAgICAgIGxldCBuZXdzUGFnZXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnRTaG93bjtcclxuXHJcbiAgICAgICAgICAgIC8vIC8vaWYgc3ltYm9sIGVudGVyZWQgYXMgb25seSB0aGluZywgaXQnbGwgbXkgbG9naWMsIHNvbWV0aW1lcy4gUmVtZWR5IHRoaXMuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZighdGhpcy5mdWxsRGlzcGxheSB8fCB0aGlzLmJhY2tncm91bmRDYWxsKXtcclxuICAgICAgICAgICAgICAgIC8vRG8gc3RhcnQgdnMgYW55d2hlcmUgaW4gdGhlIHdvcmRcclxuICAgICAgICAgICAgICAgIC8vU3RhcnQgb25seSBpcyBzdGFuZGFyZCBhbmQgYXV0byB0cnVlIHdoZW4gd2hvbGUgd29yZCBpcyB0dXJuZWQgb24oPykgb3Igc2ltcGx5IGJ1cmllZCBpbiBwYXJ0aWFsIGlmXHJcbiAgICAgICAgICAgICAgICAvL2l0IHNob3VsZCBhdCBsZWFzdCBiZSBpbmFjZXNzaWJsZSBvbiB0aGUgZnJvbnRlbmQgd2l0aCB2aXN1YWwgY3VlXHJcblxyXG4gICAgICAgICAgICAgICAgLy9EbyBhIG1vcmUgdGhvcm91Z2ggdGVzdCBvZiB0aG9zZSBsYXRlciBhZnRlciByZWwgYW5kICdkaXNsYXktcXVhbGl0eScgYXJ0aWNsZXMgY3JlYXRlZCBcclxuXHJcbiAgICAgICAgICAgICAgICAvL0RvIGJhc2ljIG1vbnRoIGFuZCB5ZWFyIGFuZCByYW5nZSBwaWNraW5nLCBiZWZvcmUgbG9va2luZyBpbnRvIHBvcC11cCBhbmQgZmlndXJpbmcgb3V0IGhvdyB0byBnZXQgaW5mbyBmcm9tIHdoYXQgaXMgc2VsZWN0ZWQgb24gaXRcclxuICAgICAgICAgICAgICAgIGxldCBmdWxsTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpdGxlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlc2MgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCByZWwgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm5ld3NEZWxpdmVyeSAhPT0gJycpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZWQnKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLm5ld3NEZWxpdmVyeS5zdGFydHNXaXRoKCcjJykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVxdWVzdGVkSWQgPSB0aGlzLm5ld3NEZWxpdmVyeS5yZXBsYWNlKCcjJywgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhc3NvY2lhdGVkTmV3cyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3MgPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChyPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoci5pZCA9PT0gcGFyc2VJbnQocmVxdWVzdGVkSWQpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzb2NpYXRlZE5ld3MucHVzaChuZXdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHIudGl0bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFzc29jaWF0ZWROZXdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MgPSBhc3NvY2lhdGVkTmV3cztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZXh0ZXJuYWxDYWxsKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMub3JpZ2luKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leHRlcm5hbENhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNWYWx1ZSA9IHRoaXMubmV3c1NlYXJjaC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXR1cm5Ib21lLmhyZWY9YCR7c2l0ZURhdGEucm9vdF91cmx9LyMke3RoaXMub3JpZ2lufUNvbnRhaW5lcmA7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVkVGl0bGUgPSBgU2hvd2luZyBSZXN1bHRzIGZvcjogJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXsgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pbmNsdWRlVGl0bGUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuZnVsbFdvcmQuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzID0gYWxsTmV3cy5maWx0ZXIoKG5ld3MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIikuaW5jbHVkZXModGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmKCF0YXJnZXQuZnVsbFdvcmQuaXNPbiAmJiB0YXJnZXQud29yZFN0YXJ0T25seS5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLmZvckVhY2gobmV3cz0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYobmV3cy50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3c1NwbGl0ID0gbmV3cy50aXRsZS50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgZSBvZiBuZXdzU3BsaXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUuc3RhcnRzV2l0aCh0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlcy5wdXNoKG5ld3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIG51bGw7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlcyA9IGFsbE5ld3MuZmlsdGVyKG5ld3M9PiBuZXdzLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMgPSB0aXRsZXMuZmlsdGVyKG5ld3M9PiBuZXdzLnRpdGxlLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkpICE9PSAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuZnVsbFdvcmQuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzYyA9IGFsbE5ld3MuZmlsdGVyKChuZXdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdzLmZ1bGxEZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKS5pbmNsdWRlcyh0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaWYgZmlyZWQhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmKCF0YXJnZXQuZnVsbFdvcmQuaXNPbiAmJiB0YXJnZXQud29yZFN0YXJ0T25seS5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLmZvckVhY2gobmV3cz0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYobmV3cy5mdWxsRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld3NTcGxpdCA9IG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBlIG9mIG5ld3NTcGxpdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZS5zdGFydHNXaXRoKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzYy5wdXNoKG5ld3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MgPSBhbGxOZXdzLmZpbHRlcihuZXdzPT4gbmV3cy5mdWxsRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzYyA9IGRlc2MuZmlsdGVyKG5ld3M9PiBuZXdzLmZ1bGxEZXNjcmlwdGlvbi5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5KSAhPT0gLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VhcmNoZWROZXdzID0gZnVsbExpc3QuY29uY2F0KHRpdGxlcywgZGVzYywgcmVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MgPSBbXTsgXHJcbiAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoZWROZXdzLmZvckVhY2goKG5ld3MpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFsbE5ld3MuaW5jbHVkZXMobmV3cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnB1c2gobmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy9EYXRlcyBiZWxvbmcgdG8gYSBzZXBlcmF0ZSBsb2dpYyB0aHJlYWQsIGFuZCBhcyBzdWNoIHNob3VsZCBub3l0IGJlIGxpbmtlZCB0byB0eXBpbmcuIFRoZXkgYWUgY2xvc2VyIHRvIHRoZSBzb3J0cyBpbiB0aGF0IFxyXG4gICAgICAgICAgICAgICAgLy90aGV5IGNhbiBiZSBhZnRlciB0aGUgdHlwaW5nLCBiZWZvcmUsIG9yIGV2ZW4gYmUgdXNlZCB3aXRob3V0IGl0XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vQWZ0ZXIgSSBmaW5pc2ggdGhlIGNvcmUgbG9naWMsIGFkZCBpbiBmdW5jdGlvbmFsaXR5IHRoYXQgaGFzIGFueSBhcyBvcHRpb24gZm9yICd5ZWFyJywgd2l0aCBzZWxlY3Rpb24gb2Ygc3BlY2lmaWMgXHJcbiAgICAgICAgICAgICAgICAvL2xpbWl0aW5nIHRoZSAnbW9udGgnIHZhbHVlcyBhbmQgc2VsZWN0aW5nIHRoZSBlYXJsaWVzdCBvbmUgYXMgdGhlIGRlZmF1bHQgZmlsdGVyIGZvciAnbW9udGgnIG9yICdhbnknXHJcbiAgICAgICAgICAgICAgICAvL0ZpbHRlciBieSBkYXRlIHdpbGwgYmUgYSBib29sZWFuIHdpdGggZHJvcGRvd24gZGVmYXVsdHMgb2YgYW55IGZvciBib3RoXHJcblxyXG4gICAgICAgICAgICAgICAgIGxldCBkYXRlRmlsdGVyc1NldCA9IE9iamVjdC5rZXlzKHRoaXMuZGF0ZUZpbHRlclNldFVwKTtcclxuICAgICAgICAgICAgICAgIC8vICBjb25zb2xlLmxvZyhgY29udGVudExvYWRlZCA9ICR7dGhpcy5jb250ZW50TG9hZGVkfWApXHJcblxyXG4gICAgICAgICAgICAgICAgIGZvcihsZXQgZmlsdGVyIG9mIGRhdGVGaWx0ZXJzU2V0KXtcclxuICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5kYXRlRmlsdGVyU2V0VXBbZmlsdGVyXSl7ICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cyA9IGFsbE5ld3MuZmlsdGVyKChuZXdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3IERhdGUobmV3cy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLXVzJywge21vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJ30pLmluY2x1ZGVzKHRoaXMuZGF0ZUZpbHRlclNldFVwW2ZpbHRlcl0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgXHJcbiAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5kYXRlT3JkZXIuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy50b2dnYWJsZVNldHRpbmdzLmRhdGVPcmRlci5kaXJlY3RpdmUgPT09ICdhc2MnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5zb3J0KChhLCBiKSA9PiBuZXcgRGF0ZShhLmRhdGUpIC0gbmV3IERhdGUoYi5kYXRlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3Muc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYS5kYXRlKSAtIG5ldyBEYXRlKGIuZGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnJldmVyc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXIuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9jYWxlQ29tcGFyZSBkb2VzIGEgc3RyaW5nIGNvbXBhcmlzb24gdGhhdCByZXR1cm5zIC0xLCAwLCBvciAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuYWxwaGFPcmRlci5kaXJlY3RpdmUgPT09ICdkZXNjJyl7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnJldmVyc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9ICAgICAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbmV3c1R5cGVzLmZvckVhY2goKHR5cGUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0W3R5cGVdLmlzT24gIT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gYWxsTmV3cy5maWx0ZXIobmV3cz0+IG5ld3MucG9zdFR5cGUgIT09IHR5cGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgICAgICBpZihhbGxOZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoYWxsTmV3cy5sZW5ndGggPD0gbmV3c091dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gbmV3c1BhZ2VzLmNvbmNhdChhbGxOZXdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChhbGxOZXdzLmxlbmd0aCA+IG5ld3NPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpdGVtID0gMTsgaXRlbSA8PSBuZXdzT3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZW1vdmVkID0gYWxsTmV3cy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFsbE5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZSA9IGFsbE5ld3Muc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKG5ld3NQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKG5ld3NQYWdlcy5sZW5ndGgpeyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBuZXdzUGFnZXNbdGhpcy5jdXJyZW50UGFnZXNdO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFNob3duID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxpdmVyTmV3cyhjb250ZW50U2hvd24pXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmNvbnRlbnRMb2FkZWQgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzYCkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBbmRQcmV2aW91cygpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYoY29udGVudFNob3duLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0UGFnaW5hdGlvbihuZXdzUGFnZXMsIGRhdGFDb3VudCwgcGFnZUNvdW50KTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QWN0aXZhdGlvbigpOyBcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vVGhpcyBuZWVkcyB0byBjaGFuZ2UgdG9cclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlT3B0aW9ucy5mb3JFYWNoKG8gPT4ge28uY2xhc3NMaXN0LmFkZCgnaW5hY3RpdmUnKTt9KTsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGVGaWx0ZXJPcHRpb25zLmZvckVhY2goZiA9PiB7Zi5kaXNhYmxlZCA9IHRydWV9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV3c1NlYXJjaC5jbGFzc0xpc3QuYWRkKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldEFsbC5jbGFzc0xpc3QuYWRkKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheUNvbnRlbnQgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGVkSWRzID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IobGV0IG5ld3Mgb2YgYWxsTmV3cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuY2xhc3NMaXN0LmFkZCgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmNsYXNzTGlzdC5hZGQoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vc2VwZXJhdGUgdGhlIGluc2VydGlvbnMgdG8gYSBmdW5jdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIC8vVXNlIGlmIHRvIHZhcnkgaWYgbG9vayBmb3IgbmV3cyB3aXRoIHRoYXQgb3Igb25lcyB3aXRoIHJlbGF0aW9uc2hpcCB0aGF0IGhhcyB0aGF0XHJcbiAgICAgICAgICAgICAgICAgICAgLy9tYWtlIGFycmF5IG9mIGVhY2ggbmV3cydzIHJlbGF0aW9uc2hpcHNbZ2l2ZSB0aGUgZmlyc3QgcG9zdCAyIGZvciB0ZXN0aW5nIG9mIGlmIGNoZWNraW5nIGFyYXkgcHJvcGVybHldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5mdWxsRGlzcGxheSl7ICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbbmV3cy5pZF1cclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocj0+dGhpcy5jYWxsZWRJZHMucHVzaChyLmlkKSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY2FsbGVkSWRzLmluY2x1ZGVzKHBhcnNlSW50KHRoaXMuY3VycmVudFJlcG9ydCkpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheUNvbnRlbnQucHVzaChuZXdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGAke25ld3MudGl0bGV9YDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBpZih0aGlzLnNpbmdsZUNhbGwpeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxpdmVyTmV3cyh0aGlzLmZ1bGxEaXNwbGF5Q29udGVudCwgdGhpcy5mdWxsRGlzcGxheUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmV4dGVybmFsQ2FsbClcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuZnVsbERpc3BsYXkgJiYgdGhpcy5leHRlcm5hbENhbGwpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZENhbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IGZhbHNlOyAgXHJcbiAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGVsaXZlck5ld3MoY29udGVudFNob3duLCBkZXN0aW5hdGlvbiA9IHRoaXMubmV3c1JlY2lldmVyKXtcclxuICAgICAgICBkZXN0aW5hdGlvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICR7Y29udGVudFNob3duLmxlbmd0aCA/IGA8dWw+YCAgOiAnTm8gYXJ0aWNsZXMgbWF0Y2ggeW91ciBjcml0ZXJpYSd9XHJcbiAgICAgICAgICAgICR7IWNvbnRlbnRTaG93bi5sZW5ndGggPyBgPGJ1dHRvbiBpZD1cInNlYXJjaFJlc2V0XCI+UGxlYXNlIHRyeSBhIGRpZmZlcmVudCBxdWVyeSBvciBjaGFuZ2UgeW91ciBmaWx0ZXJzLjwvYnV0dG9uPmAgIDogJyd9XHJcbiAgICAgICAgICAgICAgICAke2NvbnRlbnRTaG93bi5tYXAocmVwb3J0ID0+IGBcclxuICAgICAgICAgICAgICAgIDxsaT5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmV3c1wiPiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkeyF0aGlzLmZ1bGxEaXNwbGF5ID8gYDxoND4ke3JlcG9ydC50aXRsZX08L2g0PmAgOiAnJ31cclxuICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cmVwb3J0LmNhcHRpb24ubGVuZ3RoID49IDEgPyByZXBvcnQuY2FwdGlvbiArICcgLSAnIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3JlcG9ydC5kYXRlfSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtyZXBvcnQucmVsYXRpb25zaGlwcy5tYXAocmVsYXRpb25zaGlwID0+IGA8c3BhbiBjbGFzcz1cIm5hbWVcIj4ke3JlbGF0aW9uc2hpcC50aXRsZX08L3NwYW4+ICAkeyF0aGlzLmZ1bGxEaXNwbGF5ID8gYDxhIGNsYXNzPVwicmVsYXRpb25zaGlwLWxpbmtcIiBkYXRhLXJlbGF0ZWQ9XCIke3JlbGF0aW9uc2hpcC5pZH1cIj4oQXNzb2NpYXRlZCBOZXdzKTwvYT4gYCA6IGA8YSBjbGFzcz1cInJlbGF0aW9uc2hpcC1saW5rIGRpc21pc3NlZFwiIGRhdGEtcmVsYXRlZD1cIiR7cmVsYXRpb25zaGlwLmlkfVwiPihBc3NvY2lhdGVkIE5ld3MpPC9hPiBgfTxhIGNsYXNzPVwic2luZ2xlLWxpbmtcIiBocmVmPVwiJHtyZWxhdGlvbnNoaXAucGVybWFsaW5rfVwiPihWaWV3IFByb2ZpbGUpPC9hPmApfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWNhcmRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgZGF0YS1pZD1cIiR7cmVwb3J0LmlkfVwiIGRhdGEtcG9zdD1cIiR7cmVwb3J0LnBvc3RUeXBlUGx1cmFsfVwiIHNyYz1cIiR7cmVwb3J0LmdhbGxlcnlbMF0uc2VsZWN0SW1hZ2V9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkeyF0aGlzLmZ1bGxEaXNwbGF5ID8gYDxwPiR7cmVwb3J0LmRlc2NyaXB0aW9ufTwvcD5gIDogYDxwPiR7cmVwb3J0LmZ1bGxEZXNjcmlwdGlvbn08L3A+YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHshdGhpcy5mdWxsRGlzcGxheSA/IGA8YnV0dG9uIGlkPVwiJHtyZXBvcnQuaWR9XCIgY2xhc3M9XCJzZWUtbW9yZS1saW5rXCI+U2VlIE1vcmU6ICR7cmVwb3J0LmlkfSA8L2J1dHRvbj5gIDogYDxidXR0b24gaWQ9XCIke3JlcG9ydC5pZH1cIiBjbGFzcz1cInNlZS1tb3JlLWxpbmsgZGlzbWlzc2VkXCI+UmVhZCBtb3JlOiAke3JlcG9ydC5pZH0gPC9idXR0b24+YH0gXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2xpPiBcclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAke2NvbnRlbnRTaG93bi5sZW5ndGggPyBgPC91bD5gICA6ICcnfVxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmZ1bGxEaXNwbGF5KXtcclxuICAgICAgICAgICAgdGhpcy5zZWVNb3JlRnVuY3Rpb25hbGl0eSgpO1xyXG4gICAgICAgICAgICB0aGlzLmdhdGhlclJlbGF0ZWROZXdzKCk7ICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBsZXQgbWVkaWFMaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lZGlhLWNhcmQgaW1nJykgXHJcbiAgICAgICAgICAgIC8vIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jbG9zZScpICAgXHJcbiAgICAgICAgICAgIC8vIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1lZGlhUmVjaWV2ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtcmVjaWV2ZXInKVxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm1lZGlhUmVjaWV2ZXIsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpKSBcclxuICAgICAgICAgICAgLy8gdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gZmFsc2VcclxuICAgICAgICAgICAgLy8gdGhpcy5tZWRpYUNvbHVtbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jb2x1bW4nKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5uZXdsb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gdGhpcy5nYWxsZXJ5UG9zaXRpb24gPSAwOyBcclxuICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50TWVkaWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY3VycmVudC1tZWRpYScpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLm1lZGlhUGFnaW5hdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1wYWdpbmF0aW9uJyk7XHJcblxyXG4gICAgICAgIC8vIG1lZGlhTGluay5mb3JFYWNoKG1lZGlhPT57XHJcbiAgICAgICAgLy8gICAgIG1lZGlhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PiBTaGFkb3dCb3gucHJvdG90eXBlLnNoYWRvd0JveChtZWRpYSwgdGhpcy5tZWRpYVJlY2lldmVyLCB0aGlzLmh0bWwsIFxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMsICdnYWxsZXJ5JywgdGhpcy5tZWRpYUNvbHVtbiwgdGhpcy5uZXdsb2FkLCB0aGlzLmdhbGxlcnlQb3NpdGlvbixcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLCB0aGlzLm1lZGlhUGFnaW5hdGlvblxyXG4gICAgICAgIC8vICAgICAgICAgKSlcclxuICAgICAgICAvLyB9KVxyXG5cclxuICAgICAgICAvLyAgbWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAvLyAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IFNoYWRvd0JveC5wcm90b3R5cGUuc2hhZG93Qm94KG1lZGlhKSlcclxuICAgICAgICAvLyB9KVxyXG5cclxuICAgICAgICBTaGFkb3dCb3gucHJvdG90eXBlLmV2ZW50cygpO1xyXG5cclxuICAgICAgICAvLyBTaGFkb3dCb3gucHJvdG90eXBlLmV2ZW50cyhcclxuICAgICAgICAvLyAgICAgdGhpcy5tZWRpYUxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVkaWEtY2FyZCBpbWcnKSwgXHJcbiAgICAgICAgLy8gICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jbG9zZScpLCAgIFxyXG4gICAgICAgIC8vICAgICB0aGlzLmh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyksXHJcbiAgICAgICAgLy8gICAgIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpLCBcclxuICAgICAgICAvLyAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gZmFsc2VcclxuICAgICAgICAvLyApO1xyXG5cclxuICAgICAgICBpZih0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucyl7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2gob3B0aW9uPT57XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7b3B0aW9uLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgNTAwKTtcclxuICAgICAgICAgICAgfSkgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2F0aGVyUmVsYXRlZE5ld3MoKXtcclxuXHJcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBMaW5rcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yZWxhdGlvbnNoaXAtbGluaycpO1xyXG5cclxuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcExpbmtzLmZvckVhY2gobGluaz0+e1xyXG4gICAgICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGlua0lkID0gbGluay5kYXRhc2V0LnJlbGF0ZWQgXHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGxpbmsucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubmFtZScpLmlubmVyVGV4dFxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJlcG9ydCA9IGxpbmtJZDtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV3c1NlYXJjaC52YWx1ZSA9IGAjJHtsaW5rSWR9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNWYWx1ZSA9IHRoaXMubmV3c1NlYXJjaDtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gYCMke2xpbmtJZH1gOyBcclxuICAgICAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgU2hvd2luZyBSZXN1bHRzIGZvcjogJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3JlZFRpdGxlID1gU2hvd2luZyBSZXN1bHRzIGZvcjogJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaW5zZXJ0UGFnaW5hdGlvbihuZXdzUGFnZXMsIGRhdGFDb3VudCwgcGFnZUNvdW50KXtcclxuICAgICAgICAvL2FkZCBtYW51YWwgcGFnZSBlbnRyeSBib3hcclxuICAgICAgICAvL0FkZCBmYWlsc2FmZSBhZ2FpbnN0IGl0IGJlaW5nIGEgbnVtYmVyIHRvbyBiaWcgb3Igc21hbGxcclxuICAgICAgICAvL01heWJlIGRvIGRyb3Bkb3duIGluc3RlYWQ/ICBcclxuICAgICAgICAvL01heWJlIGp1c3QgZG9uJ3QgZG8gYXQgYWxsP1xyXG5cclxuICAgICAgICAvL0RvIHRoZSBudW1iZXIgbGltaXQsIHRob3VnaCwgb25lIHdoZXJlIGhpZGUgYW5kIHJldmVhbCB3aGVuIGF0IGNlcnRhaW4gcG9pbnRzXHJcblxyXG4gICAgICAgIC8vUmVtZW1iZXIgdG8gYWRkIHRoZSBsb2FkZXJcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQtcGFnZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YSBpZD1cIlwiIGNsYXNzPVwiY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXNcIj5QcmV2PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZVwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSAgXHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJcIiBjbGFzcz1cImNvbnRlbnQtZGlyZWN0aW9uIGNvbnRlbnQtZGlyZWN0aW9uX25leHQgJHtuZXdzUGFnZXMubGVuZ3RoID4gMSA/ICcnIDogJ2hpZGRlbid9XCI+TmV4dDwvYT4gXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj4gXHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzJyk7ICAgIFxyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSAgXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0Q29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7IFxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJylcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFBhZ2VIb2xkZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtcGFnZXMgYScpXHJcbiAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkodGhpcy5jb250ZW50UGFnZU9wdGlvbnMpO1xyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VlTW9yZUZ1bmN0aW9uYWxpdHkoKXtcclxuICAgICAgICAvL2FkZCBzcGlubmVyIHRvIHRoaXMsIGFzIG5lZWRzIHRvIGNvbnNvbHQgYmFja2VuZFxyXG4gICAgICAgIHRoaXMuc2VlTW9yZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZWUtbW9yZS1saW5rJylcclxuICAgICAgICB0aGlzLnNlZU1vcmUuZm9yRWFjaChsaW5rPT57XHJcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gbGluay5pZDsgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuc2luZ2xlQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBmdWxsIGRpc3BsYXkgaXMgJHt0aGlzLmZ1bGxEaXNwbGF5fWApXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBkaXNtaXNzU2VsZWN0aW9uKCl7XHJcbiAgICAgICAgaWYodGhpcy5uZXdzRGVsaXZlcnkgIT09ICcnKXtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGAke3RoaXMuc3RvcmVkVGl0bGV9YDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGAke3RoaXMuaW5pdGlhbFRpdGxlfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudG9nZ2xlT3B0aW9ucy5mb3JFYWNoKG8gPT4ge28uY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUnKTt9KSBcclxuICAgICAgICB0aGlzLmRhdGVGaWx0ZXJPcHRpb25zLmZvckVhY2goZiA9PiB7Zi5kaXNhYmxlZCA9ICcnfSlcclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2guY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUnKTtcclxuICAgICAgICB0aGlzLnJlc2V0QWxsLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2Rpc21pc3NlZCcpOyAgXHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICAvLyB0aGlzLnNpbmdsZUNhbGwgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShjb250ZW50UGFnZU9wdGlvbnMpe1xyXG4gICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbigpe2VsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgMTAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBwYXJzZUludChzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcblxyXG4gICAgICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnRlbnROZXh0QWN0aXZhdGlvbigpe1xyXG4gICAgICAgIGxldCBhbGxuZXh0QnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7XHJcblxyXG4gICAgICAgIGFsbG5leHRCdXR0b25zLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhZ2UuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCgvLWdyb3VwLykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTmFtZSA9IG5hbWUuc2xpY2UoMCwgLTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWxlY3RlZFBhZ2VgKTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBuZXh0UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IG5leHRQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICAvL3RvbyBzbG93Pz9cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWVcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzfVwiXWApO1xyXG4gICAgICAgICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnRlbnROZXh0QW5kUHJldmlvdXMoKXtcclxuICAgXHJcbiAgICAgICAgdGhpcy5jb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uJyk7ICAgICBcclxuXHJcbiAgICAgICAgbGV0IHByZXZCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXNgKVxyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtZGlyZWN0aW9uX25leHRgKVxyXG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnNlbGVjdGVkUGFnZWApO1xyXG5cclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRQYWdlcyA+IDApe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRQYWdlcylcclxuICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBwcmV2QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYoIW5leHRCdXR0b24ucHJldmlvdXNFbGVtZW50U2libGluZy5jbGFzc0xpc3QuY29udGFpbnMoJ3NlbGVjdGVkUGFnZScpKXtcclxuICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBuZXh0QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAgKGkpID0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHByZXZQYWdlID0gdGhpcy5jdXJyZW50UGFnZXMgLSAxO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IHByZXZQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc31cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGVBbGxPcHRpb25zKCl7XHJcbiAgICAgICAgaWYoIXRoaXMuYWxsT3B0aW9uc1Zpc2libGUpe1xyXG4gICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnMuY2xhc3NMaXN0LmFkZCgnZmFkZS1pbicpO1xyXG4gICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnNWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIucXVlcnlTZWxlY3RvckFsbCgnKicpLmZvckVhY2goZT0+ZS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnMuY2xhc3NMaXN0LnJlbW92ZSgnZmFkZS1pbicpO1xyXG4gICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnMuY2xhc3NMaXN0LmFkZCgnZmFkZS1vdXQnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+e3RoaXMuYWxsT3B0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdmYWRlLW91dCcpO30sIDQ1MClcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsT3B0aW9uc1Zpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIucXVlcnlTZWxlY3RvckFsbCgnKicpLmZvckVhY2goZT0+ZS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJycpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOZXdzIiwiY2xhc3MgTW9iaWxlSW50ZXJmZWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5uYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYnKTtcclxuICAgICAgICB0aGlzLm9wZW5lZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlTmF2Q2FsbGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21vYmlsZS1uYXYtY2FsbGVyJyk7XHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuICAgIGV2ZW50cygpe1xyXG4gICAgICAgIHRoaXMubW9iaWxlTmF2Q2FsbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnRoaXMub3Blbk5hdigpKVxyXG4gICAgfVxyXG5cclxuICAgIG9wZW5OYXYoKXtcclxuICAgICAgICBpZighdGhpcy5vcGVuZWQpe1xyXG4gICAgICAgICAgICB0aGlzLm5hdi5jbGFzc0xpc3QuYWRkKCdvcGVuZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5vcGVuZWQgPSB0cnVlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLm5hdi5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5vcGVuZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb2JpbGVJbnRlcmZlY2U7IiwiLy8gU3BpdCBvdXQgQXB0cyBpbiBvcmRlciBvZiBtb3N0IHJlY2VudFxyXG5cclxuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiXHJcblxyXG5jbGFzcyBQYWdpbmF0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy50YXJnZXRlZEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcclxuICAgICAgICB0aGlzLmhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyTmF2ID0gdGhpcy5oZWFkZXIucXVlcnlTZWxlY3RvcignbmF2Jyk7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1zZWFyY2gtdHJpZ2dlclwiKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcG9wLXVwLWRpc3BsYXktYm94Jyk7XHJcbiAgICAgICAgdGhpcy5pbWFnZUhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbWFnZS1ob2xkZXInKTtcclxuICAgICAgICB0aGlzLmNsb3NlTWFnbmlmeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbG9zZU1hZ25pZnknKTtcclxuICAgICAgICAvLyB0aGlzLm92ZXJhbGxDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3ZlcmFsbENvbnRhaW5lcicpO1xyXG4gICAgICAgIC8vIEZvciBub3csIHRoaXMgd2lsbCBiZSBob3cgSSBwcmV2ZW50IGVycm9ycyBvbiBvdGhlciBwYWdlcyBcclxuICAgICAgICB0aGlzLmZyb250VGVzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50Q29udGFpbmVyX3BhZ2luYXRlZCcpIFxyXG4gICAgICAgIHRoaXMudmggPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IDAsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKVxyXG4gICAgICAgIHRoaXMudncgPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgMCwgd2luZG93LmlubmVyV2lkdGggfHwgMClcclxuXHJcbiAgICAgICAgLy8gQ2FuIEkgc2V0dXAgdG8gbG9hZCBpbiBhbmQgUGFnaW5hdGUgZGVwZW5kaW5nIG9uIGlkZW50aXR5LCBzbyBhcyB0byBtYWtlIGFkYXB0YWJsZT8gWWVzISEhXHJcblxyXG4gICAgICAgIC8vV2lsbCB0YXJnZXQgYSBzaGFyZWQsIHNwZWNpZmljIGNsYXNzIHVzaW5nIHF1ZXJ5U2VsZWN0b3JBbGwgYW5kIHVzZSBhIGxvb3BcclxuXHJcbiAgICAgICAgLy9yZW1lbWJlciB0byB1c2UgdGhlIGFqYXggdXJsIHNldC11cCB0byBsaW5rIHRvIHRoZSBzZWFyY2ggaW5mb1xyXG4gICAgICAgIC8vQ29sb3IgdGhlIHNlbGVjdGVkL2N1cnJlbnQgcGFnZSBhbmQgcHV0IGEgbmV4dCBhbmQgcHJldiBidXR0b25zIHRoYXQgb25seSBhcHBlYXIgd2hlbiBhcHBsaWNhYmxlXHJcbiAgICAgICAgLy9NYWtlIHN1cmUgcGFnaW5hdGlvbiBpcyBvdXRzaWRlIG9mIGdlbmVyYXRlZCB0ZXh0P1xyXG5cclxuICAgICAgICAvLyBjb25zaWRlciB1c2luZyBzb21lIHNvcnQgb2YgbG9hZGluZyBpY29uIGFuZCBhbmltYXRpb24gd2hlbiBjbGlja2luZyBwYWdpbmF0aW9uLiBKdXN0IGZvciB1c2VyIHNhdGlzZmFjdGlvbiBvbiBjbGlja1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHRoaXMucGFnaW5hdGVkQ29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50Q29udGFpbmVyX3BhZ2luYXRlZCcpO1xyXG4gIFxyXG4gICAgICAgIGxldCBwcm9wZXJ0aWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Byb3BlcnRpZXNDb250YWluZXIgLmNvbnRlbnRCb3gnKTtcclxuICAgICAgICBsZXQgbWVtYmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZW1iZXJzQ29udGFpbmVyIC5jb250ZW50Qm94Jyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFnaW5hdGVkQ29udGVudCA9IFtwcm9wZXJ0aWVzLCBtZW1iZXJzXTtcclxuICAgICAgICB0aGlzLmdyb3VwTmFtZTtcclxuICAgICAgICAvLyBNYWtlIHdvcmsgZm9yIGFsbCBwYWdpbmF0ZSB0aHJvdWdoIGEgbG9vcD9cclxuICAgICAgICB0aGlzLnBvc3RQYWdlU2VsZWN0O1xyXG4gICAgICAgIHRoaXMucG9zdFBhZ2VPcHRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UHJvcGVydGllc1BhZ2UgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE1heWJlIHB1dCBhbGwgdGhpbmdzIGluIHRoaXMgb2JqZWN0IHdoZW4gZnVzZVxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0ge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiAwLFxyXG4gICAgICAgICAgICBtZW1iZXJzOiAwXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnREaXJlY3Rpb247XHJcblxyXG4gICAgICAgIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIC8vIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgLy9zcGlubmVyIGZhbHNlIGJlZm9yZSB0aGUgcHJldiBpcyB0cnVlXHJcblxyXG4gICAgICAgIC8vRG8gc21hbGxlciBvbmVzIGZvciBwYWdpbmF0ZSBhbmQgZm9yIHRoZSBmb3JtIHN1Ym1pdHMsIGFzIHdlbGwgYXMgc2VhcmNoIG9uIHRoZSBhbGwgbmV3cyBwYWdlIGFuZCBhbnkgb3RoZXIgcGFnaW5hdGlvbiBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICAvLyB0aGlzLmh0bWwuc3R5bGUuZm9udFNpemUgPSBgJHt0aGlzLnZoKi4wMTd9cHhgO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMudmgqLjAxNylcclxuICAgICAgICBpZih0aGlzLmZyb250VGVzdCl7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IG1haW5Mb2FkZXJUZXh0ID0gW1wiT25lIE1vbWVudCBQbGVhc2UuLi5cIiwgXCJQZXJmZWN0aW9uIHRha2VzIHRpbWVcIiwgXCJHcm9hbmluZyBvbmx5IG1ha2VzIHRoaXMgc2xvd2VyLi4uXCIsIFwiSSdtIHdhdGNoaW5nIHlvdS4uLiA6KVwiXHJcbiAgICAgICAgICAgIC8vICwgXCJDb21tZW5jaW5nIEhhY2sgOylcIiwgXCJPbmUgTW9tZW50LiBSZXRyaWV2aW5nIHlvdXIgU1NOXCIsIFwiU2hhdmluZyB5b3VyIGNhdC4uLlwiLCBcIllvdSBsaWtlIFNjYXJ5IE1vdmllcy4uLj8gPjopXCJdO1xyXG4gICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJhbmRvbSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1haW5Mb2FkZXJUZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJlc3VsdCA9IG1haW5Mb2FkZXJUZXh0W3JhbmRvbV07XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcy5wYWdlTG9hZGVyLnNldEF0dHJpYnV0ZSgnZGF0YS1jdXJ0YWluLXRleHQnLCBgJHtyZXN1bHR9YClcclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1sb2FkZXInKTtcclxuXHJcbiAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgY29udGVudEludGVyZmFjZSgpe1xyXG4gICAgICAgIC8vSSB0aGluayB0aGF0IEkgbmVlZCB0byBkZWxheSBjbGlja2FiaWxpdHkgZm9yIHRvdWNoLCBvdGhlcndpc2UgY2FuIGNsaWNrIHdoZW4gYnJpbmdpbmcgdXBcclxuICAgICAgICAvL0Fsc28sIHBlcmhhcHMgSSBuZWVkIHRvIGFkZCBhIHN5bWJvbCB0byBpbmRpY2F0ZSB0aGF0IHlvdSBjYW4gYnJpbmcgdXAgb3B0aW9ucyBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRpc3BsYXlTcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc3BsYXlTcXVhcmVzJyk7XHJcbiAgXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5SW1hZ2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc3BsYXlJbWFnZXMnKTtcclxuICAgICAgICB0aGlzLm1hZ25pZnlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZmEtc2VhcmNoLXBsdXMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5U3F1YXJlcy5mb3JFYWNoKGRpc3BsYXlTcXVhcmUgPT4ge1xyXG4gICAgICAgICAgbGV0IGxpbmsgPSBkaXNwbGF5U3F1YXJlLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MnKTtcclxuICAgICAgICAgIGxldCBpbWFnZSA9IGRpc3BsYXlTcXVhcmUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKTtcclxuICAgICAgICAgIGxldCBtYWduaWZ5QnV0dG9uID0gZGlzcGxheVNxdWFyZS5xdWVyeVNlbGVjdG9yKCcuZmEtc2VhcmNoLXBsdXMnKVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBkaXNwbGF5U3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGUgPT4ge1xyXG5cclxuICAgICAgICAgICAgICBsaW5rLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGltYWdlLmNsYXNzTGlzdC5hZGQoJ3BhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGxpbmsuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICAgICAgICBpZihtYWduaWZ5QnV0dG9uKXtcclxuICAgICAgICAgICAgICAgIG1hZ25pZnlCdXR0b24uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgICAgIGxpbmsuc3R5bGUucG9pbnRlckV2ZW50cyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYobWFnbmlmeUJ1dHRvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFnbmlmeUJ1dHRvbi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSwgMzAwKSAgICAgICAgICBcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIGRpc3BsYXlTcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgZSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgIGxpbmsuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzX192aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgaW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSgncGFnZUxpbmtzX192aXNpYmxlJyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgICBcclxuICAgICAgdGhpcy5tYWduaWZ5QnV0dG9uLmZvckVhY2goYiA9PnsgXHJcbiAgICAgICAgICBiLm9uY2xpY2sgPSBlPT57XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSBlLnRhcmdldC5jbG9zZXN0KCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJykucHJldmlvdXNFbGVtZW50U2libGluZy5jbG9uZU5vZGUoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coaW1hZ2UpXHJcbiAgICAgICAgICAgIC8vUGVyaGFwcyBjYXJyeSBvdmVyIGFzc29jaWF0ZWQgbmV3cywgYXMgd2VsbFxyXG5cclxuICAgICAgICAgICAgLy90aGlzIGlzIG5vdCBuZWNlc3NhcnkgYXMgb25lIGRpcmVjdGx5IGJlbG93IGRvZXMgaXQgYnkgYWNjZXNzaW5nIHRoZSBwYXJlbnQgYW5kIHF1ZXJ5IHNlbGVjdGluZywgYnV0IGtlZXBpbmcgdGhpcyBhcyBjb3VsZCBiZSB1c2VmdWwgdG8gaGF2ZSBvbiBoYW5kXHJcbiAgICAgICAgICAgIHRoaXMuZmluZFNwZWNpZmllZFByZXZpb3VzKGUudGFyZ2V0LCAnbW9yZS1pbmZvLWxpbmsnKTtcclxuICAgICAgICAgICAgLy8gdGhpcy50YXJnZXRlZEVsZW1lbnQgPSBlLnRhcmdldC5jbG9zZXN0KCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJykucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlCb3guaW5zZXJ0QmVmb3JlKHRoaXMudGFyZ2V0ZWRFbGVtZW50LCB0aGlzLmNsb3NlTWFnbmlmeSk7XHJcbiAgICAgICBcclxuICAgICAgICAgICAgLy8gdGhpcy5kaXNwbGF5Qm94LnByZXBlbmQoaW1hZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnByZXBlbmQoaW1hZ2UpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICAgICAgICAgIHRoaXMub3BlbkJ1dHRvbi5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgIGUuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgdGhpcy5jbG9zZU1hZ25pZnkub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgdGhpcy5pbWFnZUhvbGRlci5xdWVyeVNlbGVjdG9yKCdpbWcnKS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlCb3gucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICBlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5yZW1vdmUoJ2ZyZWV6ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL2NoYW5nZSB0byBiZSBmcHIgZWl0aGVyIGRpcmVjdGlvbmFsIHRvIGdldCBsZXQsIHdpdGggaWYgc3RhdGVtZW50c1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBvcC11cC1kaXJlY3Rpb25hbCcpLmZvckVhY2goYnV0dG9uPT57XHJcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vTWFrZSBuZXh0IGFuZCBwcmV2IHVuY2xpY2thYmxlIGlmIG5vdGhpbmcgdGhlcmUgdG8gZ28gdG9cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRJbWFnZSA9IHRoaXMuZGlzcGxheUJveC5xdWVyeVNlbGVjdG9yKCdpbWcnKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXROYW1lID0gY3VycmVudEltYWdlLmRhdGFzZXQubmFtZTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0eXBlID0gYnV0dG9uLmlkO1xyXG4gICAgICAgICAgICBsZXQgbmV3SW1hZ2VDb250YWluZXI7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHR5cGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVNxdWFyZXMuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgICAgICBpZihlLnF1ZXJ5U2VsZWN0b3IoYC5kaXNwbGF5SW1hZ2VzW2RhdGEtbmFtZT0ke3RhcmdldE5hbWV9XWApKXtcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09PSAnbmV4dC1pbWFnZScpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUNvbnRhaW5lciA9IGUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9zZXN0KCcub3ZlcmFsbC1zcXVhcmVzJykubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUNvbnRhaW5lciA9IGUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9zZXN0KCcub3ZlcmFsbC1zcXVhcmVzJykucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmV3SW1hZ2VDb250YWluZXIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3SW1hZ2UgPSBuZXdJbWFnZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheUltYWdlcycpLmNsb25lTm9kZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TGluayA9IG5ld0ltYWdlQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLm1vcmUtaW5mby1saW5rJykuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLnJlcGxhY2VXaXRoKG5ld0ltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnF1ZXJ5U2VsZWN0b3IoJy5tb3JlLWluZm8tbGluaycpLnJlcGxhY2VXaXRoKG5ld0xpbmspO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmaW5kU3BlY2lmaWVkUHJldmlvdXMoc291cmNlLCBpZGVudGlmaWVyKXtcclxuICAgICAgICAvLyB0aGlzIHdpbGwgbmVlZCB0byBiZSB0d2Vha2VkIGhhbmRsZSBub24tbmVzdGVkLCBhcyB3ZWxsIGFzIG90aGVyIG5lZWRzXHJcbiAgICAgICAgbGV0IGxpbmsgPSBzb3VyY2UucGFyZW50RWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgIHdoaWxlIChsaW5rKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5rLmNsYXNzTmFtZS5pbmNsdWRlcyhpZGVudGlmaWVyKSkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldGVkRWxlbWVudCA9IGxpbmsuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50YXJnZXRlZEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluayA9IGxpbmsucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgfSBcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBwYWdpbmF0ZSgpe1xyXG4gICAgICAgIC8vY3JlYXRlIG5ldyBzZWFyY2ggc2V0LXVwIGZvciBqdXN0IHRoZSBtZW1iZXIgcHJvcCBwYWdpbmF0aW9uPyBMaWtlLCBnbyBtYWtlIG5ldyBpbmMgcGFnZVxyXG4gICAgICAgIC8vVXNlIHBvc3QtdHlwZSAnaWYnIHRoYXQgY2hlY2tzIGZvciB0aGUgaWQ/IEFjdHVhbGx5LCBJIGNhbiB1c2UgdGhlIHJlc3V0cyBhcnJheSBhcyBjYW4gcGx1cmFsaXplXHJcblxyXG4gICAgICAgIC8vc3RhcnQgYnkgaW5zZXJ0aW5nIHJhbmRvbSBzaGl0IGluIGJvdGg/XHJcbiAgICAgICAgLy9zZXQtdXAgdGhpcyB1cCB0byBub3QgcmVwbGFjZSBjb250ZW50LCBpZiBqYXZhc2NyaXB0IHR1cm5lZCBvZmYsIGFsb25nIHdpdGggaW5zZXJ0aW5nIGEgYnV0dG9uIHRvIHNlZSBhbGxcclxuICAgICAgICAvL2FuZCBtYWtlIHRoYXQgc2VlIGFsbCBwYWdlXHJcbiAgICAgICAgLy9JIHRoaW5rIEknbGwgbWFrZSB0aGUgc2VlIGFsbCBidXR0b24sIGJ1dCByZXBsYWNlIGl0J3MgY29udGVudHMgdGhyb3VnaCBoZXJlLCBzbyBpZiB0aGlzIGRvZXNuJ3QgcnVuLCBpdCdsbCBiZSB0aGVyZVxyXG4gICAgICAgIC8vZGlzYWJsZSBzY3JpcHQgaW4gYnJvd3NlciB0byBjaGVjay93b3JrIG9uIHN0dWZmXHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAvL0lzIGl0IGJldHRlciBqdXN0IHRvIHVzZSBzZXBlcmF0ZSB1cmwgcm91dGVzPyBcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL2NvbnRlbnQ/cGFnZScpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAvLyBsZXQgY3VycmVudE1lbWJlcnNTaG93biA9IHRoaXMuY3VycmVudFBhZ2VzLm1lbWJlcnM7XHJcbiAgICAgICAgICAgIC8vIGxldCBjdXJyZW50UHJvcGVydGllc1Nob3duID0gdGhpcy5jdXJyZW50UGFnZXMucHJvcGVydGllcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcG9zdE91dHB1dDtcclxuICAgICAgICAgICAgLy8gd2luZG93LmFsZXJ0KCdvbiB0YWJsZXQhJylcclxuICAgICAgICAgICAgLy9Db25zaWRlciBsb2NhbGl6ZWQgcmVsb2FkIG9uIHBhZ2UgcmVzaXplXHJcbiAgICAgICAgICAgIGlmKHdpbmRvdy5pbm5lcldpZHRoID49IDEyMDApe1xyXG4gICAgICAgICAgICAgICAgcG9zdE91dHB1dCA9IDg7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcG9zdE91dHB1dCA9IDY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwb3N0UGFnZSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgcG9zdFBhZ2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRzS2V5cyA9IE9iamVjdC5rZXlzKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZTtcclxuICAgICAgICAgICAgbGV0IHBvc3Q7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50U2hvd247XHJcbiAgICAgICAgICAgIGxldCBwYWdpbmF0aW9uTG9jYXRpb247XHJcbiBcclxuICAgICAgICAgICAgLy9Vc2UgYSBmb3IgbG9vcCBoZXJlPyBmb3IgcmVzdWx0IG9mIHJlc3VsdHM/XHJcbiAgICAgICAgICAgIC8vIG1ha2UgdGhpcyBpbnRvIGFuIGFycmF5IGFuZCBwdXQgaW4gaWYgYSBsb29wP1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lclR5cGUgPSB0aGlzLnBhZ2luYXRlZENvbnRlbnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyVHlwZUxvY2F0aW9uID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbnRlbnRMb2FkZWQpe1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCB0eXBlIG9mIHJlc3VsdHNLZXlzKXtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdHlwZTtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0ID0gcmVzdWx0c1tuYW1lXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCA8PSBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gcG9zdE91dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZSA9IHBvc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIG5lZWQgdG8gbWFkZSBtb3JlIHZlcnNhdGlsZSBpZiBkZWNpZGUgdG8gdW5pdmVyc2FsaXplIHBhZ2luYXRpb25cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0UGFnZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IHBvc3RQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc1t0eXBlXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocG9zdFBhZ2VzWzBdKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2VOYW1lID0gdHlwZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXS5jbGFzc0xpc3QuYWRkKHR5cGUpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydENvbnRlbnQoY29udGFpbmVyVHlwZVtjb250YWluZXJUeXBlTG9jYXRpb25dLCBjb250ZW50U2hvd24sIHBhZ2VOYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Mb2NhdGlvbiA9IGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy50ZXh0Qm94JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKHBhZ2luYXRpb25Mb2NhdGlvbiwgcG9zdFBhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCwgcGFnZU5hbWUpICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclR5cGVMb2NhdGlvbis9IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBvc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzID0gW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TmV4dEFjdGl2YXRpb24oKTsgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy90ZW1wIHVudGlsIGNoYW5nZSBzZXQtdXAgdG8gbWFrZSBzZWN0aW9uIGxvYWRlciB3b3JrXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VMb2FkZXIuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJylcclxuICAgICAgICAgICAgICAgIHBvc3QgPSByZXN1bHRzW3RoaXMuZ3JvdXBOYW1lXVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoIDw9IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZW0gPSAxOyBpdGVtIDw9IHBvc3RPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IHBvc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBwb3N0UGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzLnB1c2gocG9zdFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IHBvc3RQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV1dO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnRCb3guJHt0aGlzLmdyb3VwTmFtZX1gKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0Q29udGVudCh0YXJnZXQsIGNvbnRlbnRTaG93biwgdGhpcy5ncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBbmRQcmV2aW91cygpOyBcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBY3RpdmF0aW9uKCk7IFxyXG5cclxuICAgICAgICAgICAgICAgIC8vY2hhbmdlIHRvIGFkZGluZyBmYWRlLWNsYXNzLCBiZWZvcmUgcmVtb3ZpbmcgYWN0aXZlLCBzbyBnb2VzIGF3YXkgc21vb3RoZXJcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PnRoaXMucGFnZUxvYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSwgODEwKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+dGhpcy5wYWdlTG9hZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpLCA4MTApOyBcclxuICAgICBcclxuICAgICAgICAgICAgLy9DYW4gSSBsb29wIHRocm91Z2ggdGhlIGRpZmYgcmVzdWx0cywgdXNpbmcgdmFyaWFibGUocykgYmVmb3JlIHRoZSBpbm5lckh0bWwgYW5kIHRoZSBtYXAsIGFzIHdlbGwgYXMgdGhlIHBhZ2UgY29udGFpbmVyP1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gSG93IHRvIGdldCBwb3N0IG5hbWUsIHRob3VnaD8gQ2FuIEkgYXBwbHkgYSBmb3JlYWNoIHRvIHRoZW0gYW5kIGdyYWIgdGhlIHBvc3QgdHlwZT8gQ291bGQgSSBpbmNsdWRlIGluIHJlc3Qgcm91dGVcclxuXHJcbiAgICAgICAgICAgIC8vSGF2ZSBsb2dpYyB0aGF0IG9ubHkgaGFzIHRoZSBwcm9jZXNzIGZvciB0aGUgc2VsZWN0ZWQgc2VjdGlvbiBydW4gYWdhaW4sIHBlcmhhcHMgdmlhIGEgdmFyaWFibGUgaW4gdGhlIGNhbGwgYmVsb3cuIFxyXG4gICAgICAgICAgICAvL2llLiB0aGlzLnBhZ2luYXRlKCdtZW1iZXJzJylcclxuICAgICAgICAgICAgLy9NYXliZSB0aGUgcGFnaW5hdGlvbiBjb3VsZCBiZSBzcGxpdCB1cCwgd2l0aCB0aGUgaHRtbCBpbnNlcnRpb24gYmVpbmcgYSBzZXBlcmF0ZWx5IGNhbGxlZCBmdW5jdGlvbiB0aGF0IGlzIHJlcGVhdGVkXHJcbiAgICAgICAgICAgIC8vdGhyb3VnaCBhIGxvb3BzIGNvbnNpc3Rpbmcgb2YgdmFyaWFibGVzIGhlcmUsIGFuZCBjb3VsZCBzaW1wbHkgYmUgY2FsbGVkIGFnYWluIHdpdGggYSBzcGVjaWZpYyB2YXJpYWJsZSAgXHJcbiAgICAgICAgICAgIC8vT3Igc2ltcGx5IGp1c3Qgc2VwZXJhdGUgdGhpcyBhbGwgXHJcblxyXG4gICAgICAgICAgICAvL3NpbXBseSBkaXNwbGF5IGRpZmZlcmVudCB0aGluZ3MsIG5lZWQgdHdvIGRpZmYgaHRtbCBibG9ja3MsIGJ1dCBlYWNoIGNhbiBjYWxsZWQgdXBvbiBzZXBlcmF0ZWx5LCBhcyBkaWZmZXJlbnQgaW5uZXJIdG1sIGJsb2Nrc1xyXG5cclxuICAgICAgICAgICAgLy9CdXQgdGhlbiBhZ2FpbiwgYSB1bmlmb3JtZWQgZGlzcGxheWVkIGNvdWxkIGJlIGFjaGlldmVkIHdpdGggdGVybmFyeSBvcGVyYXRvcnMsIGNoZWNraW5nIGZvciB0aXRsZV9vcl9wb3NpdGlvblxyXG4gICAgICAgICAgICAvL0FuZCBjaGVja2luZyBmb3Igc29tZXRoaW5nIHRoYXQgY291bGQgcnVsZSBvdXQgdGhlIG1hZ25pZnlpbmcgYnV0dG9uIGFuZCB0aGUgbG9jYXRpb24gbGlua1xyXG5cclxuICAgICAgICAgICAgLy9DYW4gSSBtb3ZlIHRoaXMgQW5kIGp1c3QgbG9vcCBjYWxsIHRoaXM/XHJcblxyXG4gICAgICAgICAgICAvL01ha2Ugd29yayBhZ2Fpbi4gQW5kIHZlcnNhdGlsZVxyXG4gICAgICAgICAgICAvL0RvIEkgbmVlZCB0aGlzIGFueW1vcmUsIHRob3VnaD9cclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBhY3RpdmVQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcGFnZT0nJHtjdXJyZW50TWVtYmVyc1Nob3dufSddYCk7XHJcbiAgICAgICAgICAgIC8vIGFjdGl2ZVBhZ2luYXRpb24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICBcclxuICAgICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb250ZW50SW50ZXJmYWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5zZXJ0Q29udGVudChkZXN0aW5hdGlvbiwgdHlwZSwgcGFnZU5hbWUpe1xyXG4gICAgICAgICAgICAvL0NoYW5nZSBkZXNpdGluYXRpb24gc2V0LXVwIHRvIGFjY29tYWRhdGUgbG9hZGVyXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBhZ2VOYW1lKVxyXG4gICAgICAgICAgICAvL3JlcGxhY2Ugd29yZCBpbnRlcmFjdGlvbiBwcm9tcHRzLCB3aXRoIGN1c3RvbSwgZHJhd24gc3ltYm9sc1xyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAke3R5cGUubWFwKGl0ZW0gPT4gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm92ZXJhbGwtc3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5U3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImludGVyYWN0aW9uLXByb21wdFwiPjxzcGFuIGNsYXNzPVwiY2xpY2stcHJvbXB0XCI+VG91Y2g8L3NwYW4+PHNwYW4gY2xhc3M9XCJob3Zlci1wcm9tcHRcIj5Ib3Zlcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy52dyA+PSAxMjAwID8gYDxpbWcgY2xhc3M9XCJkaXNwbGF5SW1hZ2VzXCIgZGF0YS1uYW1lPVwiJHtpdGVtLnRpdGxlLnJlcGxhY2VBbGwoJyAnLCAnJyl9XCIgc3JjPVwiJHtpdGVtLmlzQ29tcGxldGVkIHx8IGl0ZW0ucG9zdFR5cGUgPT09ICdtZW1iZXInID8gaXRlbS5pbWFnZSA6IGl0ZW0ucHJvamVjdGVkSW1hZ2V9XCIgYWx0PVwiJHtpdGVtLnRpdGxlfVwiPmA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMudncgPCAxMjAwID8gYDxpbWcgY2xhc3M9XCJkaXNwbGF5SW1hZ2VzXCIgZGF0YS1uYW1lPVwiJHtpdGVtLnRpdGxlLnJlcGxhY2VBbGwoJyAnLCAnJyl9XCIgc3JjPVwiJHtpdGVtLmlzQ29tcGxldGVkIHx8IGl0ZW0ucG9zdFR5cGUgPT09ICdtZW1iZXInID8gaXRlbS5pbWFnZU1lZGl1bSA6IGl0ZW0ucHJvamVjdGVkSW1hZ2VNZWRpdW19XCIgYWx0PVwiJHtpdGVtLnRpdGxlfVwiPmA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cIm1vcmUtaW5mby1saW5rXCIgaHJlZj1cIiR7aXRlbS5wZXJtYWxpbmt9XCI+RmluZCBPdXQgTW9yZTwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3NpdGVEYXRhLnJvb3RfdXJsfS9hbGwtbmV3cy8jJHtpdGVtLmlkfS1yZWxhdGVkLSR7aXRlbS5wb3N0VHlwZVBsdXJhbH1cIj5Bc3NvY2lhdGVkIE5ld3M/PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtwYWdlTmFtZSA9PT0gJ3Byb3BlcnRpZXMnID8gJzxidXR0b24+PGkgY2xhc3M9XCJmYXMgZmEtc2VhcmNoLXBsdXNcIj48L2k+PC9idXR0b24+JzogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5LXRleHRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLnRpdGxlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLnBvc2l0aW9uT3JSb2xlICE9PSB1bmRlZmluZWQgPyBgPHA+JHtpdGVtLnBvc2l0aW9uT3JSb2xlfTwvcD5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+ICAgXHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgaW5zZXJ0UGFnaW5hdGlvbihkZXN0aW5hdGlvbiwgcG9zdFBhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCwgcGFnZU5hbWUpe1xyXG4gICAgICAgIC8vUHV0IGluICduZXh0JyBhbmQgJ3ByZXYnIGJ1dHRvbnNcclxuICAgICAgICAvL01ha2UgbnVtYmVycyBMYXJnZSBhbmQgY2VudGVyZWQsIGFuZCBwZXJoYXBzIHB1dCBhIGJveCBhcm91bmQgdGhlbSwgYWxvbmcgd2l0aCBmYW5jeSBzdHlsaW5nIGFsbCBhcm91bmRcclxuICAgICAgICBkZXN0aW5hdGlvbi5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgXCJiZWZvcmVlbmRcIixcclxuICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPyAnPGRpdiBjbGFzcz1cImNvbnRlbnQtcGFnZXNcIj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPiAxICA/IGA8YSBpZD1cIiR7cGFnZU5hbWV9LXByZXZcIiBjbGFzcz1cIiR7cGFnZU5hbWV9LWdyb3VwICR7cGFnZU5hbWV9LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c1wiPlByZXY8L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAke3Bvc3RQYWdlcy5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPiAxID8gYDxhIGNsYXNzPVwiY29udGVudC1wYWdlICR7cGFnZU5hbWV9LWdyb3VwXCIgZGF0YS1wYWdlPVwiJHtkYXRhQ291bnQrK31cIj4gJHtwYWdlQ291bnQgKz0gMX08L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICBgKS5qb2luKCcnKX0gIFxyXG4gICAgICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID4gMSA/IGA8YSBpZD1cIiR7cGFnZU5hbWV9LW5leHRcIiBjbGFzcz1cIiR7cGFnZU5hbWV9LWdyb3VwICR7cGFnZU5hbWV9LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9uZXh0XCI+TmV4dDwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICR7cG9zdFBhZ2VzLmxlbmd0aCA/ICc8L2Rpdj4nIDogJyd9IFxyXG5cclxuICAgICAgICBgKTtcclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9wcmV2aW91cycpOyAgICBcclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpICBcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5mb3JFYWNoKGVsPT5lbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKSlcclxuXHJcbiAgICAgICAgbGV0IGNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LXBhZ2UnKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShjb250ZW50UGFnZU9wdGlvbnMpO1xyXG4gICAgfVxyXG4vLyB0aGlzIG5ldyBzZXR1cCBjYXVzZXMgaXNzdWVzIGFmdGVyIGRpcmVjdGlvbmFsIGJ1dHRvbnMgdXNlZDogc2VsZWN0ZWRQYWdlIFxyXG4vL25vdCBiZWluZyBhZGRlZCB0byBjbGlja2VkIGFuZCBjdXJyZW50UGFnZSBvbiBkaXJlY3Rpb25hbCBnZXRzIGVycm9yXHJcbi8vTGF0dGVyIGxpa2VseSBjb25uZWN0ZWQgdG8gdGhlIGZvcm1lclxyXG5cclxuICAgIHBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KGNvbnRlbnRQYWdlT3B0aW9ucyl7XHJcbiAgICAgICAgLy9Db21iaW5lIHRoZSB0d28gYmVsb3dcclxuICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhZ2UuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCgvLWdyb3VwLykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTmFtZSA9IG5hbWUuc2xpY2UoMCwgLTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0ZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSlcclxuICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKHRoaXMuZ3JvdXBOYW1lKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pICBcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy8gY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgIC8vICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+e1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChpID0+eyBcclxuICAgICAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKVxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGkuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2godGhpcy5ncm91cE5hbWUpKXtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAvLyAgICAgICAgICAgICB9KVxyXG4gICAgICAgIC8vICAgICAgICAgfSkgIFxyXG4gICAgICAgIC8vICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgLy8gICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcclxuICAgICAgICAvLyB9KVxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgY29udGVudE5leHRBY3RpdmF0aW9uKCl7XHJcbiAgICAgICAgbGV0IGFsbG5leHRCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTtcclxuXHJcbiAgICAgICAgYWxsbmV4dEJ1dHRvbnMuZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gKGUpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkUGFnZS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKC8tZ3JvdXAvKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lID0gbmFtZS5zbGljZSgwLCAtNik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwLnNlbGVjdGVkUGFnZWApO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IG5leHRQYWdlID0gdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gPSBuZXh0UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIlwiOyB9LCA5MjApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdfVwiXWApO1xyXG4gICAgICAgICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld0N1cnJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgfTtcclxuXHJcbiAgICBjb250ZW50TmV4dEFuZFByZXZpb3VzKCl7XHJcbiAgIFxyXG4gICAgICAgIHRoaXMuY29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbicpOyAgICAgXHJcblxyXG4gICAgICAgIGxldCBwcmV2QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5ncm91cE5hbWV9LXByZXZgKVxyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5ncm91cE5hbWV9LW5leHRgKVxyXG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwLnNlbGVjdGVkUGFnZWApO1xyXG5cclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA+IDApe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50UGFnZXMpXHJcbiAgICAgICAgICAgICAgICBwcmV2QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXh0Q29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGlmKCFuZXh0QnV0dG9uLnByZXZpb3VzRWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZFBhZ2UnKSl7XHJcbiAgICAgICAgICAgICAgICBuZXh0QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSAtIDE7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA9IHByZXZQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe2VsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgOTIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cFtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXX1cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9maXggcmVwZWF0IG9mIG5leHRCdXR0b24gZnVuY3Rpb25hbGl0eVxyXG4gICAgICAgIC8vIHRoaXMubmV4dENvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgIC8vICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAvLyAgICAgICAgIGxldCBuZXh0UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzW3BhZ2VOYW1lXSArIDE7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbcGFnZU5hbWVdID0gbmV4dFBhZ2U7XHJcbiAgICAgICAgLy8gICAgICAgICBjdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAvLyAgICAgICAgIG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHtwYWdlTmFtZX0tZ3JvdXBbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc1twYWdlTmFtZV19XCJdYCk7XHJcbiAgICAgICAgLy8gICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhZ2luYXRpb24iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCJcclxuXHJcbmNsYXNzIFNlYXJjaCB7XHJcbiAgICAvLyAxLiBkZXNjcmliZSBhbmQgY3JlYXRlL2luaXRpYXRlIG91ciBvYmplY3RcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5hZGRTZWFyY2hIdG1sKCk7XHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLnJlc3VsdHNEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlYXJjaC1vdmVybGF5X19yZXN1bHRzXCIpO1xyXG4gICAgICAgIC8vSWYgb3BlbiBkaWYgb3BlbiBidXR0b24gZm9yIG1vYmlsZSB2cyBkZXNrdG9wXHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1zZWFyY2gtdHJpZ2dlclwiKTtcclxuICAgICAgICB0aGlzLmNsb3NlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZWFyY2gtb3ZlcmxheV9fY2xvc2VcIik7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hPdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZWFyY2gtb3ZlcmxheVwiKTtcclxuICAgICAgICB0aGlzLnNlYXJjaFRlcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoLXRlcm0nKTtcclxuICAgICAgICB0aGlzLmlzT3ZlcmxheU9wZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWU7XHJcbiAgICAgICAgdGhpcy50eXBpbmdUaW1lcjtcclxuLy9HZXQgcmlkIG9mIHRoaXMgYW5kIHRoZSBwYWdpbmF0aW9uIGxvZ2ljLCByZXNldGluZyB0aGUgbmV3cyByZW5kZXJpbmdcclxuICAgICAgICB0aGlzLm5ld3NQYWdlU2VsZWN0O1xyXG4gICAgICAgIHRoaXMubmV3c1BhZ2VPcHRpb247XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TmV3c1BhZ2UgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMi4gZXZlbnRzXHJcbiAgICBldmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIHRoaXMub3Blbk92ZXJsYXkoKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiBcclxuICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlT3ZlcmxheSgpKVxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGUgPT4gdGhpcy5rZXlQcmVzc0Rpc3BhdGNoZXIoZSkpXHJcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoKSA9PiB0aGlzLnR5cGluZ0xvZ2ljKCkpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gMy4gbWV0aG9kcyAoZnVuY3Rpb24sIGFjdGlvbi4uLilcclxuICAgIHR5cGluZ0xvZ2ljKCkge1xyXG4gICAgICAgIGlmKHRoaXMuc2VhcmNoVGVybS52YWx1ZSAhPT0gdGhpcy5wcmV2aW91c1ZhbHVlKXtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudHlwaW5nVGltZXIpO1xyXG4gICAgICAgICAgICBpZih0aGlzLnNlYXJjaFRlcm0udmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaXNTcGlubmVyVmlzaWJsZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzRGl2LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGluZ1RpbWVyID0gc2V0VGltZW91dCh0aGlzLmdldFJlc3VsdHMuYmluZCh0aGlzKSwgODAwKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHNEaXYuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLnNlYXJjaFRlcm0udmFsdWU7XHJcbiAgICB9XHJcbi8vQWRkIGNvbG9yaW5nIHRvIHRleHQgdGhhdCBtYXRjaGVzIHNlYXJjaCBxdWVyeSBhbmZkIG1heWJlIGRvbid0IHNob3cgdGl0bGUgYXQgYWxsIGlmIG5vIGNvbnRlbnQoPylcclxuICAgIGFzeW5jIGdldFJlc3VsdHMoKXtcclxuICAgICAgdHJ5e1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9zZWFyY2g/dGVybT0nICsgdGhpcy5zZWFyY2hUZXJtLnZhbHVlKTsgXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMuY3VycmVudE5ld3NQYWdlO1xyXG4gICAgICAgIGxldCB5ID0gMDtcclxuICAgICAgICBsZXQgaXRlbTtcclxuICAgICAgICBjb25zdCBwb3N0T3V0cHV0ID0gMztcclxuICAgICAgICBjb25zdCBuZXdzID0gcmVzdWx0cy51cGRhdGVzQW5kTmV3cztcclxuICAgICAgICBsZXQgbmV3c1BhZ2UgPSBbXTtcclxuICAgICAgICBsZXQgbmV3c1BhZ2VzID0gW107XHJcbiAgICAgICAgbGV0IG5ld3NTaG93bjtcclxuICAgICAgICBsZXQgcGFnZUxpc3ROdW1iZXIgPSAwO1xyXG4gICAgICAgIGlmKG5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgaWYobmV3cy5sZW5ndGggPD0gcG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlcy5jb25jYXQobmV3cyk7XHJcbiAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3cy5sZW5ndGggPiBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcihpdGVtID0gMTsgaXRlbSA8PSBwb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IG5ld3Muc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UucHVzaChyZW1vdmVkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIGlmKG5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZSA9IG5ld3Muc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKG5ld3NQYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihuZXdzUGFnZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgbmV3c1Nob3duID0gbmV3c1BhZ2VzW3hdO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBuZXdzU2hvd24gPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVzdWx0c0Rpdi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbmUtdGhpcmRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheV9fc2VjdGlvbi10aXRsZVwiPlByb3BlcnRpZXM8L2gyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5wcm9wZXJ0aWVzLmxlbmd0aCA/ICc8dWwgY2xhc3M9XCJsaW5rLWxpc3QgbWluLWxpc3RcIj4nIDogYDxwPk5vIHByb3BlcnRpZXMgbWF0Y2ggdGhhdCBzZWFyY2guPC9wPmB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5wcm9wZXJ0aWVzLm1hcChpdGVtID0+IGA8bGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5U3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImRpc3BsYXlJbWFnZXNcIiBkYXRhLW5hbWU9XCIke2l0ZW0udGl0bGUucmVwbGFjZUFsbCgnICcsICcnKX1cIiBzcmM9XCIke2l0ZW0uaXNDb21wbGV0ZWQgPyBpdGVtLmltYWdlIDogaXRlbS5wcm9qZWN0ZWRJbWFnZX1cIiBhbHQ9XCIke2l0ZW0udGl0bGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtpdGVtLnBlcm1hbGlua31cIj4ke2l0ZW0udGl0bGV9PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLnByb3BlcnRpZXMubGVuZ3RoID8gJzwvdWw+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25lLXRoaXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGVcIj5NZW1iZXJzPC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMubWVtYmVycy5sZW5ndGggPyAnPHVsIGNsYXNzPVwibGluay1saXN0IG1pbi1saXN0XCI+JyA6IGA8cD5ObyBtZW1iZXJzIG1hdGNoIHRoYXQgc2VhcmNoLjwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMubWVtYmVycy5tYXAoaXRlbSA9PiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz0ke2l0ZW0uaW1hZ2V9XCIgYWx0PVwiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLnBvc2l0aW9uT3JSb2xlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtpdGVtLnBlcm1hbGlua31cIj5SZWFkIE1vcmU8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLm1lbWJlcnMubGVuZ3RoID8gJzwvdWw+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25lLXRoaXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGVcIj5VcGRhdGVzIEFuZCBOZXdzPC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPHVsIGNsYXNzPVwibGluay1saXN0IG1pbi1saXN0XCI+JyA6IGA8cD5ObyBuZXdzIG9yIHVwZGF0ZXMgbWF0Y2ggdGhhdCBzZWFyY2g8L3A+ICA8YSBocmVmPVwiJHtzaXRlRGF0YS5yb290X3VybH0vY3VycmVudFwiPkdvIHRvIHZpZXdzIGFuZCB1cGRhdGUgc2VjdGlvbjwvYT5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke25ld3NTaG93bi5tYXAoaXRlbSA9PiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aDQ+JHtpdGVtLnRpdGxlfTwvaDQ+XHJcbiAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmNhcHRpb24ubGVuZ3RoID49IDEgPyBpdGVtLmNhcHRpb24gKyAnIC0gJyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmRhdGV9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+KnJlbGF0ZWQgd2lsbCBnbyBoZXJlPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmltYWdlICE9PSBudWxsID8gYDxpbWcgc3JjPVwiJHtpdGVtLmltYWdlfVwiIGFsdD1cIlwiPmAgOiBgPGRpdj4ke2l0ZW0udmlkZW99PC9kaXY+YH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJyZWFkLW1vcmVcIiBocmVmPVwiYWxsLW5ld3MvIyR7aXRlbS5pZH1cIj5SZWFkIE1vcmUuLi48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA/ICc8ZGl2IGlkPVwibmV3cy1wYWdlc1wiPicgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID4gMSA/IGA8YSBocmVmPVwiI1wiIGNsYXNzPVwibmV3cy1wYWdlXCIgZGF0YS1wYWdlPVwiJHt5Kyt9XCI+ICR7cGFnZUxpc3ROdW1iZXIgKz0gMX08L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA/ICc8L2Rpdj4nIDogJyd9ICBcclxuICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPC91bD4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYDtcclxuICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZVxyXG4gICAgICAgIGxldCBsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcGFnZT0nJHt4fSddYCk7XHJcbiAgICAgICAgbGluay5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnaXMgaXQgaGFwcGVuaW5nIGJlZm9yZSBjYXRjaD8nKVxyXG4gICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnNvbGUubG9nKCdpcyBpdCBoYXBwZW5pbmcgYWZ0ZXIgY2F0Y2g/JylcclxuICAgICAgICAgICAgdGhpcy5uZXdzUGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubmV3cy1wYWdlJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld3NQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLnRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TmV3c1BhZ2UgPSBzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3VsdHMoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaXMgaXQgaGFwcGVuaW5nIGluIG5ld3NQYWdlT3B0aW9ucz8nKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICBcclxuICAgICB9XHJcblxyXG4gICAga2V5UHJlc3NEaXNwYXRjaGVyKGUpIHtcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09IDgzICYmICF0aGlzLmlzT3ZlcmxheU9wZW4gJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC50YWdOYW1lICE9IFwiSU5QVVRcIiAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUgIT0gXCJURVhUQVJFQVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3Blbk92ZXJsYXkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGUua2V5Q29kZSA9PT0gMjcgJiYgdGhpcy5pc092ZXJsYXlPcGVuKXtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZU92ZXJsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbk92ZXJsYXkoKXtcclxuICAgICAgICB0aGlzLnNlYXJjaE92ZXJsYXkuY2xhc3NMaXN0LmFkZChcInNlYXJjaC1vdmVybGF5LS1hY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5oZWFkZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5hZGQoJ2ZyZWV6ZScpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoVGVybS52YWx1ZSA9ICcnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiB0aGlzLnNlYXJjaFRlcm0uZm9jdXMoKSwgMzAxKTtcclxuICAgICAgICB0aGlzLmlzT3ZlcmxheU9wZW4gPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gICBcclxuICAgIFxyXG4gICAgY2xvc2VPdmVybGF5KCl7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hPdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ3NlYXJjaC1vdmVybGF5LS1hY3RpdmUnKTtcclxuICAgICAgICB0aGlzLmhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LnJlbW92ZSgnZnJlZXplJyk7XHJcbiAgICAgICAgdGhpcy5pc092ZXJsYXlPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkU2VhcmNoSHRtbCgpe1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICBcImJlZm9yZWVuZFwiLFxyXG4gICAgICAgICAgICBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X190b3BcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtc2VhcmNoIHNlYXJjaC1vdmVybGF5X19pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNlYXJjaC10ZXJtXCIgcGxhY2Vob2xkZXI9XCJXaGF0IGFyZSB5b3UgbG9va2luZyBmb3I/XCIgaWQ9XCJzZWFyY2gtdGVybVwiIGF1dG9jb21wbGV0ZT1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtd2luZG93LWNsb3NlIHNlYXJjaC1vdmVybGF5X19jbG9zZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwic2VhcmNoLW92ZXJsYXlfX3Jlc3VsdHNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNlYXJjaCIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcbi8vQ29tYmluZSB3aXRoIG90aGVyIHBhZ2luYXRpb24/XHJcblxyXG5jbGFzcyBTaGFkb3dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sO1xyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rO1xyXG5cclxuICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXI7XHJcbiAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkOyBcclxuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYTtcclxuICAgICAgICB0aGlzLm1lZGlhTWVudTtcclxuICAgICAgICB0aGlzLm1lZGlhQ29sdW1uO1xyXG4gICAgICAgIHRoaXMubWVkaWFUaHVtYjtcclxuICAgICAgICB0aGlzLm1lZGlhUGFnaW5hdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy52aWRlb1NyYztcclxuICAgICAgICB0aGlzLnBsYXlCdXR0b247XHJcbiAgICAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGFDb3VudDtcclxuICAgICAgICB0aGlzLnBvc3RPdXRwdXQ7XHJcbiAgICAgICAgdGhpcy5wYWdlQ291bnQ7XHJcbiAgICAgICAgdGhpcy5wb3N0UGFnZTtcclxuICAgICAgICB0aGlzLnBvc3RQYWdlcztcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuXHJcbiAgICAgICAgLy9SZXNldCB3aGVuIGNoYW5nZSBmaWx0ZXIgYW5kIGRpc21pc3MgY3VycmVudCB2aWRzXHJcbiAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb247IFxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbjtcclxuICAgICAgICB0aGlzLnBvc3RGaWVsZDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYTtcclxuICAgICAgICB0aGlzLmNsb3NlTWVkaWFCdXR0b247XHJcblxyXG4gICAgICAgIHRoaXMubmV3TG9hZDtcclxuXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudE93bmVySWQgPSBudWxsOyBcclxuICAgICAgICB0aGlzLm1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIConKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LW1lZGlhJyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYU1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtbWVudScpO1xyXG4gICAgICAgIHRoaXMubWVkaWFDb2x1bW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY29sdW1uJyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYVRodW1iO1xyXG4gICAgICAgIHRoaXMubWVkaWFQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24nKTtcclxuICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7IFxyXG4gICAgICAgIHRoaXMucG9zdEZpZWxkID0gJ2dhbGxlcnknO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jbG9zZScpO1xyXG4gICAgICAgIHRoaXMubmV3TG9hZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHRoaXMuc2hhZG93Qm94KG1lZGlhKSlcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHRoaXMua2V5UHJlc3NEaXNwYXRjaGVyKGUpKVxyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT50aGlzLmNsb3NlTWVkaWFSZWNpZXZlcigpKVxyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgICAgIHNoYWRvd0JveChtZWRpYSl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tZWRpYVJlY2lldmVyLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBwb3N0VHlwZSA9IG1lZGlhLmRhdGFzZXQucG9zdDtcclxuICAgICAgICAgICAgbGV0IGRhdGFJZCA9IHBhcnNlSW50KG1lZGlhLmRhdGFzZXQuaWQpO1xyXG5cclxuICAgICAgICAgICAgaWYocG9zdFR5cGUgIT09ICdub25lJyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldE1lZGlhKHBvc3RUeXBlLCBkYXRhSWQpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySXNvbGF0ZWRNZWRpYShtZWRpYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIGdldE1lZGlhKGRhdGFUeXBlLCBkYXRhSWQpe1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9tZWRpYT9yZWxhdGVkJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmVzdWx0c1tkYXRhVHlwZV0uZm9yRWFjaChpdGVtPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbS5nYWxsZXJ5KSk7XHJcbiAgICAgICAgICAgICAgICBpZihpdGVtLmlkID09PSBkYXRhSWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHNbZGF0YVR5cGVdKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihpdGVtLnBvc3RUeXBlID09PSAncHJvcGVydHknKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYU1lbnUuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJnYWxsZXJ5XCIgY2xhc3M9XCJhY3RpdmVcIj5HZW5lcmFsPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJpbnRlcmlvclwiPkludGVyaW9yPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJmbG9vclBsYW5zXCI+Rmxvb3IgUGxhbnM8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImJ1aWxkaW5nUGxhbnNcIj5CdWlsZGluZyBQbGFuczwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lbnVMaW5rID0gdGhpcy5tZWRpYU1lbnUucXVlcnlTZWxlY3RvckFsbCgnYScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51TGluay5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0RmllbGQgPSBpLmN1cnJlbnRUYXJnZXQuaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW1bdGhpcy5wb3N0RmllbGRdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3QpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51TGluay5mb3JFYWNoKGM9PntjLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO30pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiMFwiXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIwXCJdYCkuY2hpbGRyZW5bMF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBsZXQgYWxsTmV3cyA9IHJlc3VsdHNbJ3VwZGF0ZXMnXS5jb25jYXQocmVzdWx0c1snbmV3cyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFsbE5ld3MubWFwKHJlcG9ydHM9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHJlcG9ydHMucmVsYXRpb25zaGlwcy5mb3JFYWNoKHBvc3Q9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBpZihwb3N0LklEID09PSBpdGVtLmlkKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgaXRlbS5nYWxsZXJ5LnB1c2gocmVwb3J0cy5nYWxsZXJ5KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmKGRhdGFJZCAhPT0gIHRoaXMuY3VycmVudE93bmVySWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkID0gZGF0YUlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5sb2NhbFN0b3JhZ2UgPSB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0aGlzLmFjY2Vzc0xvY2FsU3RvcmFnZShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluaXRpYWxNZWRpYVBvcHVsYXRpb24oaXRlbSwgcG9zdCl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBpZiBtb3JlIHRoYW4gb25lLCBzaG93XHJcbiAgICAgICAgICAgIC8vIGlzIHRoZXJlIGEgbW9yZSBhY2Nlc3NpYmxlLWZyaWVuZGx5IGh0bWwgdGFnIGZvciBmaWx0cnIgbWVudXM/XHJcbiAgICAgICAgICAgIC8vSGF2ZSBkZXNjIHdpdGggJ3JlYWQgbW9yZScgdW5kZXIgYWN0aXZlIHZpZC4gRXhlcnB0IHVuZGVyIHNlbGVjdGlvbiwgb2YgZXhpc3RzLCBvdGhlcndpc2UgdHJpbVxyXG5cclxuICAgICAgICAgICAgdGhpcy5kYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnBvc3RPdXRwdXQgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMgPSBbXTtcclxuXHJcbiAgXHJcbiAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoIDw9IHRoaXMucG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBvc3RQYWdlcy5jb25jYXQocG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHRoaXMucG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gdGhpcy5wb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBvc3RQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaCh0aGlzLnBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucG9zdFBhZ2VzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucG9zdFBhZ2VzKSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtKVxyXG4gXHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVNZWRpYUNvbHVtbihpdGVtLCB0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlc10pO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpdGVtKVxyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdMb2FkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKGl0ZW0sIHRoaXMuZGF0YUNvdW50LCB0aGlzLnBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgIH1cclxuIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVySXNvbGF0ZWRNZWRpYShtZWRpYSl7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5yZW1vdmUoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QuYWRkKCdjZW50ZXItZGlzcGxheScpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7bWVkaWEuZGF0YXNldC5mdWxsfVwiPlxyXG4gICAgICAgICAgICBgOyAgXHJcbiAgIFxyXG4gICAgICAgICAgICAvLyB0aGlzLnZpZGVvU3JjID0gdGhpcy5jdXJyZW50TWVkaWEucXVlcnlTZWxlY3RvcignaW1nJykuZGF0YXNldC52aWRlby5yZXBsYWNlKCd3YXRjaD92PScsICdlbWJlZC8nKSArICc/YXV0b3BsYXk9MSc7XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGxheUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbGF5LWJ1dHRvbicpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+dGhpcy5wbGF5VmlkZW8odGhpcy52aWRlb1NyYykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb24gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucG9zdEZpZWxkLCB0aGlzLmdhbGxlcnlQb3NpdGlvbilcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmlubmVySFRNTCA9IGAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS52aWRlb1NvdXJjZSA/ICc8ZGl2IGlkPVwicGxheS1idXR0b24tY29udGFpbmVyXCI+PGJ1dHRvbiBpZD1cInBsYXktYnV0dG9uXCI+PGRpdj48L2Rpdj48L2J1dHRvbj48L2Rpdj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICA8aW1nIGRhdGEtdmlkZW89XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS52aWRlb1NvdXJjZX1cIiBzcmM9XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS5pbWFnZX1cIj5cclxuICAgICAgICAgICAgYDsgIFxyXG5cclxuICAgICAgICAgICAgdGhpcy52aWRlb1NyYyA9IHRoaXMuY3VycmVudE1lZGlhLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLmRhdGFzZXQudmlkZW8ucmVwbGFjZSgnd2F0Y2g/dj0nLCAnZW1iZWQvJykgKyAnP2F1dG9wbGF5PTEnO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5wbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BsYXktYnV0dG9uJyk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLnBsYXlCdXR0b24pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnRoaXMucGxheVZpZGVvKHRoaXMudmlkZW9TcmMpKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5hZGQoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LnJlbW92ZSgnY2VudGVyLWRpc3BsYXknKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QucmVtb3ZlKCdhc3BlY3QtcmF0aW8nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5hZGQoJ2NlbnRlci1kaXNwbGF5Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwb3B1bGF0ZU1lZGlhQ29sdW1uKGl0ZW0sIGNvbnRlbnQpe1xyXG4gICAgICAgICAgICB0aGlzLm1lZGlhQ29sdW1uLmlubmVySFRNTCA9IGBcclxuICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgJHtjb250ZW50Lm1hcChpID0+IGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtcG9zaXRpb249XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdLmZpbmRJbmRleChhPT57cmV0dXJuIGEuaWQgPT09IGkuaWR9KX1cIiAgY2xhc3M9XCJtZWRpYS1zZWxlY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIm1lZGlhLXRodW1iXCIgc3JjPVwiJHtpLnNlbGVjdEltYWdlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtaW5mb3JtYXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aS50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2kuZGVzY3JpcHRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lZGlhLXRodW1iJyk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iWzBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWxlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVkaWEtdGh1bWIuc2VsZWN0ZWQnKS5wYXJlbnROb2RlLmRhdGFzZXQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRTZWxlY3Rpb24sICdyZWQnKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWIuZm9yRWFjaCh0aHVtYj0+e1xyXG4gICAgICAgICAgICAgICAgdGh1bWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PntcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWIuZm9yRWFjaChjPT57Yy5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpO30pXHJcbiAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlLnRhcmdldClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckN1cnJlbnRNZWRpYShpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gZS50YXJnZXQucGFyZW50Tm9kZS5kYXRhc2V0LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFNlbGVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAvL2FjdGl2YXRlIHRoZSBzZXBlcmF0ZSBmdW5jdGlvbiB0aGF0IGZpbGxzIHRoZSBjdXJyZW50TWRpYSBjb250YWluZXJcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5zZXJ0UGFnaW5hdGlvbihpdGVtLCBkYXRhQ291bnQsIHBhZ2VDb3VudCl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFQYWdpbmF0aW9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICR7dGhpcy5wb3N0UGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5wb3N0UGFnZXMubGVuZ3RoID4gMSA/IGA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZVwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSAgXHJcbiAgICAgICAgICAgIGA7XHJcblxyXG4gICAgICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1wYWdpbmF0aW9uIC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJykpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNtZWRpYS1wYWdpbmF0aW9uIC5jb250ZW50LXBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoaXRlbSwgY29udGVudFBhZ2VPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubmV3TG9hZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoaXRlbSwgY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRTZWxlY3Rpb24pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVNZWRpYUNvbHVtbihpdGVtLCB0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlc10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChpID0+eyAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkgIFxyXG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHt0aGlzLmN1cnJlbnRTZWxlY3Rpb259XCJdYCkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7dGhpcy5jdXJyZW50U2VsZWN0aW9ufVwiXWApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7dGhpcy5jdXJyZW50U2VsZWN0aW9ufVwiXWApLmNoaWxkcmVuWzBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSkgICAgXHJcblxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGNsb3NlTWVkaWFSZWNpZXZlcigpe1xyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5tZWRpYU1lbnUuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZWRpYU1lbnUucmVtb3ZlQ2hpbGQodGhpcy5tZWRpYU1lbnUuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLm1lZGlhQ29sdW1uLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVkaWFDb2x1bW4ucmVtb3ZlQ2hpbGQodGhpcy5tZWRpYUNvbHVtbi5maXJzdENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuY3VycmVudE1lZGlhLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudE1lZGlhLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZTsgXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QucmVtb3ZlKCdmcmVlemUnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2FsbGVyeVBvc2l0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wb3N0RmllbGQgPSAnZ2FsbGVyeSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld0xvYWQgPSB0cnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBrZXlQcmVzc0Rpc3BhdGNoZXIoZSl7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGUua2V5Q29kZSwgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuKVxyXG4gICAgICAgICAgICBpZihlLmtleUNvZGUgPT09IDI3ICYmIHRoaXMuaXNNZWRpYVJlY2lldmVyT3Blbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTWVkaWFSZWNpZXZlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5VmlkZW8odmlkZW9TcmMpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2aWRlb1NyYylcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxpZnJhbWUgYWxsb3dmdWxsc2NyZWVuPVwiYWxsb3dmdWxsc2NyZWVuXCIgc3JjPVwiJHt2aWRlb1NyY31cIj48L2lmcmFtZT5cclxuICAgICAgICAgICAgYDtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNoYWRvd0JveDsiLCJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgU2hhZG93Qm94IGZyb20gJy4vc2hhZG93Qm94JztcclxuLy9UaGUgc2ltcGxpY2l0eSBvZiB0aGlzIGlzIGEgY2hhbmNlIHRvIHRyeSB0byBtYWtlIG15IHBhZ2luYXRpb24gY29kZSBhbmQgY29kZSBpbiBnZW5lcmFsIGNsZWFuZXIgYW5kIG1vcmUgZWZmaWNpZW50XHJcbmNsYXNzIFJlbGF0ZWROZXdze1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2luZ2xlQ29udGFpbmVyJykpe1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXdzLXJlY2lldmVyJyk7XHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdpbmF0aW9uLWhvbGRlcicpO1xyXG4gICAgICAgICAgICAvL2ludGVyZmVyZXMgd2l0aCBTQi4gRmlndXJlIG91dCBob3cgdG8gcHJldmVudCBvbiBwYWdlcyB3aGVyZSBpbnZhbGlkLlxyXG4gICAgICAgICAgICAvL0Fsc28gd2l0aCBhbGwtbmV3cyBpZiBvbmx5IDEgcGFnZVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQb3N0SUQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkltYWdlQW5kU3RhdHMgaW1nJykuZGF0YXNldC5pZDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudFNob3duO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucztcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudncgPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgMCwgd2luZG93LmlubmVyV2lkdGggfHwgMClcclxuICAgICAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnRzKCl7XHJcbiAgICAgICAgdGhpcy5mZXRjaFJlbGF0ZWROZXdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZmV0Y2hSZWxhdGVkTmV3cygpe1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL21lZGlhP3JlbGF0ZWQnKTsgXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICBjb25zdCBhbGxOZXdzID0gcmVzdWx0cy51cGRhdGVzLmNvbmNhdChyZXN1bHRzLm5ld3MpO1xyXG4gICAgICAgICAgICBjb25zdCByZWxhdGVkTmV3cyA9IFtdOyBcclxuICAgICAgICAgICAgbGV0IGxpbWl0ID0gMTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcGFnZUNvdW50ID0gMDtcclxuICAgICAgICAgICAgLy9Pcmdhbml6ZSB0aGUgbmV3cyB0aGF0J3MgdGhyb3duIGludG8gcmVsYXRlZE5ld3MsIGluIGRhdGUgb3JkZXJcclxuICAgICAgICAgICAgLy9Db25zaWRlciBwZXJmb3JtaW5nIHRoZSBkYXRlIG9yZGVyIG9uIGJhY2tlbmQsIHRob3VnaCBjb3VsZCBhbm5veW9uZywgZ2l2ZW4gbGVzcyBwaHAgZXhwZXJpZW5jZSwgYnV0IGNvdWxkIGJlIGJlbmVmaWNpYWwgdG8gcHJvZ3Jlc3Mgb3ZlciBhbGwgXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbnRlbnRMb2FkZWQpe1xyXG4gICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3MgPT57XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocj0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyLklEID09PSBwYXJzZUludCh0aGlzLmN1cnJlbnRQb3N0SUQpICYmIGxpbWl0IDw9IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQrPTFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0ZWROZXdzLnB1c2gobmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGlmKHJlbGF0ZWROZXdzLmxlbmd0aCl7ICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlbGF0ZWROZXdzKSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVQYWdpbmF0aW9uSG9sZGVyKGRhdGFDb3VudCwgcGFnZUNvdW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZU5ld3NSZWNpZXZlcigpO1xyXG5cclxuICAgXHJcbiAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcG9wdWxhdGVOZXdzUmVjaWV2ZXIoKXtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXSlcclxuICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgIDxoND4ke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLnRpdGxlfTwvaDQ+XHJcbiAgICAgICAgICAgIDxwPiR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uY2FwdGlvbiA/IGAke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmNhcHRpb259IC1gIDogJyd9ICR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uZGF0ZX08L3A+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYS1jYXJkXCI+PGltZyBkYXRhLXBvc3Q9XCIke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLnBvc3RUeXBlUGx1cmFsfVwiIGRhdGEtaWQ9XCIke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmlkfVwiIHNyYz1cIiR7dGhpcy52dyA+PSAxMjAwID8gYCR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uZ2FsbGVyeVswXS5pbWFnZX1gIDogYCR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uZ2FsbGVyeVswXS5zZWxlY3RJbWFnZX1gfVwiPjwvZGl2PlxyXG4gICAgICAgICAgICA8cD4ke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmZ1bGxEZXNjcmlwdGlvbn08L3A+XHJcbiAgICAgICAgYDtcclxuICBcclxuICAgICAgICBTaGFkb3dCb3gucHJvdG90eXBlLmV2ZW50cygpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFNoYWRvd0JveC5wcm90b3R5cGUubWVkaWFMaW5rKVxyXG4gICAgfVxyXG5cclxuICAgIHBvcHVsYXRlUGFnaW5hdGlvbkhvbGRlcihkYXRhQ291bnQsIHBhZ2VDb3VudCl7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgJHt0aGlzLmNvbnRlbnRTaG93bi5sZW5ndGggPyAnPGRpdiBjbGFzcz1cImNvbnRlbnQtcGFnZXNcIj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLmxlbmd0aCA+IDEgPyBgPGEgY2xhc3M9XCJjb250ZW50LXBhZ2VcIiBkYXRhLXBhZ2U9XCIke2RhdGFDb3VudCsrfVwiPiAke3BhZ2VDb3VudCArPSAxfTwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX0gXHJcbiAgICAgICAgICAgICR7dGhpcy5jb250ZW50U2hvd24ubGVuZ3RoID8gJzwvZGl2PicgOiAnJ30gXHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuY29udGVudExvYWRlZCl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZmlyc3RQYWdlQnV0dG9uKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9ICAgICBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlJyk7XHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KCl7XHJcbiAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaFJlbGF0ZWROZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXHJcbiAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSkgIFxyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZWxhdGVkTmV3cyAiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy9Mb29rIHVwIGhvdyB0byBidW5kbGUgc2NzcyBoZXJlIHVzaW5nIHdlYnBhY2sgYW5kIG1ha2UgdGhpcyBpbnRvIGFuIGltcG9ydCBmaWxlKEFsc28gdXNlIHNlcGVyYXRlIGZpbGUgZm9yIGdlbiBsb2dpYywgXHJcbi8vc28gY2FuIGNvbmRpdGlvbmFsIHRoaXMgZm9yIGZvcm1zKVxyXG5pbXBvcnQgJy4uL2Nzcy9zdHlsZS5jc3MnO1xyXG5pbXBvcnQgJy4uL2Nzcy9kb3RzLmNzcydcclxuXHJcbmltcG9ydCBTZWFyY2ggZnJvbSAnLi9tb2R1bGVzL3NlYXJjaCc7XHJcbmltcG9ydCBQYWdpbmF0aW9uIGZyb20gJy4vbW9kdWxlcy9wYWdpbmF0aW9uJztcclxuaW1wb3J0IE5ld3MgZnJvbSAnLi9tb2R1bGVzL2FsbC1uZXdzJztcclxuaW1wb3J0IFJlbGF0ZWROZXdzIGZyb20gJy4vbW9kdWxlcy9zaW5nbGVQb3N0JztcclxuaW1wb3J0IFNoYWRvd0JveCBmcm9tICcuL21vZHVsZXMvc2hhZG93Qm94JztcclxuaW1wb3J0IE1vYmlsZUludGVyZmVjZSBmcm9tICcuL21vZHVsZXMvbW9iaWxlJztcclxuXHJcbmNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcclxuY29uc3QgcGFnaW5hdGlvbiA9IG5ldyBQYWdpbmF0aW9uKCk7XHJcbmNvbnN0IG5ld3MgPSBuZXcgTmV3cygpO1xyXG5jb25zdCByZWxhdGVkTmV3cyA9IG5ldyBSZWxhdGVkTmV3cygpO1xyXG5jb25zdCBzaGFkb3dCb3ggPSBuZXcgU2hhZG93Qm94KCk7XHJcbmNvbnN0IG1vYmlsZUludGVyZmVjZSA9IG5ldyBNb2JpbGVJbnRlcmZlY2UoKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=