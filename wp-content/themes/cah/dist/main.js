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
___CSS_LOADER_EXPORT___.push([module.id, "@charset \"UTF-8\";\nhtml {\n  overflow-x: hidden;\n  height: 100%;\n  margin: 0;\n}\n@media (min-width: 767px) {\n  html {\n    font-size: 1.7vh;\n  }\n}\n@media (min-width: 1200px) {\n  html {\n    font-size: 1.85vh;\n  }\n}\nhtml.freeze {\n  overflow: hidden;\n}\n\nbody {\n  margin: 0;\n  color: antiquewhite;\n}\n\nh1 {\n  margin: 0;\n  margin-bottom: 3rem;\n  font-size: 4rem;\n}\n\nh2 {\n  font-size: 2.5rem;\n  margin: 0;\n}\n\nh3 {\n  font-size: 2.3rem;\n  margin: 0;\n}\n\na {\n  text-decoration: none;\n  color: inherit;\n}\n\na {\n  cursor: pointer;\n}\n\na.hidden, a.selectedPage {\n  pointer-events: none;\n}\n\na.hidden {\n  opacity: 0;\n}\n\na.selectedPage {\n  color: #e8aa77;\n  filter: saturate(120%);\n}\n\n*.hidden {\n  display: none;\n  pointer-events: none;\n}\n\ndiv, button {\n  box-sizing: border-box;\n}\n\nbutton {\n  border: none;\n  background: transparent;\n}\n\nli {\n  list-style-type: none;\n}\n\n#overallContainer {\n  position: relative;\n  top: 0;\n}\n#overallContainer.faded {\n  filter: opacity(40%);\n}\n\n.contentContainer {\n  height: initial;\n  width: 100%;\n  margin: 4% 0;\n  margin-bottom: 5%;\n  display: flex;\n  justify-content: center;\n}\n.contentContainer > div {\n  display: flex;\n  justify-content: center;\n  padding-top: 5.5rem;\n}\n@media (min-width: 767px) {\n  .contentContainer > div {\n    width: 95%;\n  }\n}\n@media (min-width: 1200px) {\n  .contentContainer > div {\n    width: 85%;\n  }\n}\n.contentContainer_paginated .textBox .content-pages {\n  text-align: center;\n}\n.contentContainer_paginated .textBox .content-pages a {\n  font-size: 1.75rem;\n}\n\n.titleAndTextBox, .contentBox {\n  position: relative;\n}\n\n.titleAndTextBox {\n  margin-right: 5%;\n}\n\n.titleBox, .textBox {\n  height: 50%;\n  width: 16rem;\n}\n\n.titleBox {\n  padding: 10%;\n}\n.titleBox > * {\n  height: 50%;\n  width: 100%;\n  margin: 0;\n}\n.titleBox > :nth-child(2) {\n  display: flex;\n}\n.titleBox > :nth-child(2) h2 {\n  align-self: flex-end;\n  padding-bottom: 15%;\n}\n\n.contentBox.properties, .contentBox.members {\n  display: grid;\n  row-gap: 0.35rem;\n}\n@media (min-width: 767px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(3, 33.3%);\n  }\n}\n@media (min-width: 1200px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(4, 25%);\n  }\n}\n\n.contentBox {\n  width: 100%;\n  height: 100%;\n}\n.contentBox.properties > div, .contentBox.members > div {\n  width: 14rem;\n}\n.contentBox.properties > div .displaySquares, .contentBox.members > div .displaySquares {\n  box-sizing: initial;\n  position: relative;\n  text-align: center;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.contentBox.properties > div .displaySquares .interaction-prompt, .contentBox.members > div .displaySquares .interaction-prompt {\n  text-align: center;\n  position: absolute;\n  background-color: rgba(20, 20, 20, 0.7);\n  padding: 0.2rem 0.2rem;\n  margin-top: 7.6rem;\n  border-radius: 30%;\n  font-size: 1.5rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares .interaction-prompt .click-prompt, .contentBox.members > div .displaySquares .interaction-prompt .click-prompt {\n    display: none;\n  }\n}\n.contentBox.properties > div .displaySquares .interaction-prompt .hover-prompt, .contentBox.members > div .displaySquares .interaction-prompt .hover-prompt {\n  display: none;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares .interaction-prompt .hover-prompt, .contentBox.members > div .displaySquares .interaction-prompt .hover-prompt {\n    display: block;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks, .contentBox.members > div .displaySquares-pageLinks {\n  position: absolute;\n  display: none;\n  flex-direction: column;\n  width: 100%;\n  text-align: center;\n}\n.contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n  color: rgb(238, 231, 210);\n  cursor: pointer;\n  font-size: 1.5rem;\n  margin-top: 0.7rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n    font-size: 1.3rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n  font-size: 2rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n    font-size: 1.4rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks *:hover, .contentBox.members > div .displaySquares-pageLinks *:hover {\n  transform: scale(110%);\n  filter: brightness(120%);\n}\n.contentBox.properties > div .displaySquares-pageLinks i, .contentBox.members > div .displaySquares-pageLinks i {\n  font-size: 1.4rem;\n}\n.contentBox.properties > div .displaySquares .displaySquares-pageLinks__visible, .contentBox.members > div .displaySquares .displaySquares-pageLinks__visible {\n  display: flex;\n}\n.contentBox.properties > div .displaySquares div p, .contentBox.properties > div .displaySquares div a, .contentBox.members > div .displaySquares div p, .contentBox.members > div .displaySquares div a {\n  margin: 2%;\n}\n.contentBox.properties > div .display-text, .contentBox.members > div .display-text {\n  margin-top: -0.3rem;\n  text-align: center;\n  font-size: 1.3rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.2rem;\n}\n.contentBox.properties > div .display-text p, .contentBox.members > div .display-text p {\n  margin: 0;\n}\n.contentBox.properties > div .display-text p:nth-of-type(2), .contentBox.members > div .display-text p:nth-of-type(2) {\n  font-weight: 700;\n}\n.contentBox .news {\n  margin: 0 1%;\n  padding-top: 5%;\n  height: auto;\n}\n.contentBox .news iframe {\n  width: 300px;\n  height: 200px;\n}\n\n#footerContainer {\n  background-color: rgba(39, 39, 39, 0.6);\n  margin: 0;\n  display: flex;\n  position: fixed;\n  bottom: 0;\n  width: 100%;\n  text-align: center;\n  justify-content: flex-end;\n  padding-right: 2rem;\n  color: ivory;\n}\n#footerContainer p {\n  margin: 1rem;\n}\n@media (min-width: 1200px) {\n  #footerContainer p {\n    margin: 0.65rem;\n  }\n}\n\n#openingContainer {\n  height: 99.5vh;\n  position: relative;\n  color: rgb(189, 189, 189);\n  display: flex;\n  justify-content: center;\n}\n#openingContainer h1 {\n  font-size: 5.2rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer h1 {\n    font-size: 6.5rem;\n  }\n}\n#openingContainer p {\n  font-size: 2.5rem;\n  font-weight: 600;\n}\n@media (min-width: 1200px) {\n  #openingContainer p {\n    font-size: 2.7rem;\n  }\n}\n#openingContainer #welcomeContainer div {\n  text-shadow: 1px 1px black;\n  width: 80%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer div {\n    width: 70%;\n  }\n}\n#openingContainer header {\n  display: grid;\n  grid-auto-flow: row;\n  grid-template-columns: 4% 25% 1fr;\n  background-color: rgba(70, 62, 55, 0.85);\n  box-shadow: 0.2rem 0.2rem 1rem 0.4rem inset rgba(49, 43, 39, 0.75);\n  width: 100%;\n  height: 5rem;\n  position: fixed;\n  top: 0;\n  z-index: 9999;\n  color: rgb(199, 187, 156);\n}\n#openingContainer header.hidden {\n  display: none;\n}\n#openingContainer header button {\n  font-size: 1.8rem;\n  width: 10rem;\n  cursor: pointer;\n}\n#openingContainer header button i {\n  display: inline;\n}\n#openingContainer header #logo-symbol, #openingContainer header #logo-text {\n  height: 4rem;\n}\n#openingContainer header #logo-symbol {\n  margin-top: 0.3rem;\n  padding-left: 0.5rem;\n}\n#openingContainer header #logo-text {\n  margin-top: 0.6rem;\n  padding-left: 0.2rem;\n}\n#openingContainer header img {\n  height: 100%;\n}\n#openingContainer header p, #openingContainer header nav {\n  margin: 0;\n}\n#openingContainer header nav {\n  margin-right: 2rem;\n}\n#openingContainer header nav ul {\n  margin: 0;\n  padding: 0;\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1.5rem;\n}\n#openingContainer header nav ul li a {\n  font-size: 1.8rem;\n  text-shadow: 1px 1px black;\n}\n#openingContainer #pageImage {\n  position: absolute;\n  top: 0;\n  height: 100%;\n  width: 100%;\n}\n#openingContainer #pageImage img {\n  height: 100%;\n  width: 100%;\n  filter: blur(0.6rem) grayscale(50%);\n}\n#openingContainer #welcomeContainer {\n  position: absolute;\n  text-align: center;\n  align-items: center;\n  margin-top: 1%;\n  display: flex;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer {\n    margin-top: 2%;\n  }\n}\n#openingContainer #welcomeContainer img {\n  height: 6rem;\n}\n\n.titleBox {\n  background: transparent;\n}\n.titleBox p {\n  font-size: 1.5rem;\n}\n\n.textBox {\n  padding-left: 0.5rem;\n}\n.textBox p {\n  font-size: 1.3rem;\n  color: white;\n}\n\n#propertiesContainer > div .titleBox, #membersContainer > div .titleBox {\n  border: 0.35rem solid rgb(199, 187, 156);\n}\n#propertiesContainer img, #membersContainer img {\n  width: 100%;\n  height: 100%;\n  margin-bottom: 1rem;\n}\n#propertiesContainer img.pageLinks__visible, #membersContainer img.pageLinks__visible {\n  filter: brightness(27%);\n}\n\n#allNewsContainer {\n  height: 51rem;\n}\n@media (min-width: 1200px) {\n  #allNewsContainer {\n    height: 52rem;\n  }\n}\n\n#contactContainer {\n  height: 55rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer {\n    height: 52rem;\n  }\n}\n\n#allNewsContainer, #contactContainer {\n  background-color: rgb(31, 27, 21);\n  color: white;\n}\n#allNewsContainer > div .titleBox, #contactContainer > div .titleBox {\n  border: 4px solid rgb(221, 221, 221);\n}\n#allNewsContainer > div .textBox p, #contactContainer > div .textBox p {\n  color: antiquewhite;\n}\n#allNewsContainer .contentBox, #contactContainer .contentBox {\n  display: flex;\n  font-size: 1.1rem;\n}\n#allNewsContainer .contentBox > div, #contactContainer .contentBox > div {\n  flex-basis: 50%;\n  height: 100%;\n}\n#allNewsContainer .contentBox > div > div, #contactContainer .contentBox > div > div {\n  overflow: auto;\n  height: 92%;\n}\n#allNewsContainer .contentBox .form-message, #contactContainer .contentBox .form-message {\n  height: auto;\n}\n#allNewsContainer .contentBox h3, #contactContainer .contentBox h3 {\n  text-align: center;\n  height: 8%;\n}\n#allNewsContainer .contentBox ul, #contactContainer .contentBox ul {\n  padding: 0;\n}\n#allNewsContainer .contentBox ul li, #contactContainer .contentBox ul li {\n  display: inline;\n}\n#allNewsContainer .contentBox .news, #contactContainer .contentBox .news {\n  border: 1px solid rgba(233, 233, 233, 0.3);\n}\n#allNewsContainer .contentBox .news::after, #contactContainer .contentBox .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#allNewsContainer .contentBox .news img, #contactContainer .contentBox .news img {\n  width: 13rem;\n  float: left;\n  margin-right: 2.5%;\n  cursor: pointer;\n}\n#allNewsContainer .contentBox .news p, #contactContainer .contentBox .news p {\n  line-height: 1.2rem;\n  font-size: 1.25rem;\n}\n#allNewsContainer .contentBox .news, #allNewsContainer .contentBox form, #contactContainer .contentBox .news, #contactContainer .contentBox form {\n  padding: 0 5%;\n}\n#allNewsContainer .contentBox form, #contactContainer .contentBox form {\n  display: grid;\n  -moz-column-gap: 1.2rem;\n       column-gap: 1.2rem;\n  grid-template-areas: \"contactName contactEmail\" \"contactPhone contactSubject\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"submit ...\";\n}\n#allNewsContainer .contentBox form #contact-name, #contactContainer .contentBox form #contact-name {\n  grid-area: contactName;\n}\n#allNewsContainer .contentBox form #contact-email, #contactContainer .contentBox form #contact-email {\n  grid-area: contactEmail;\n}\n#allNewsContainer .contentBox form #contact-phone, #contactContainer .contentBox form #contact-phone {\n  grid-area: contactPhone;\n}\n#allNewsContainer .contentBox form #contact-subject, #contactContainer .contentBox form #contact-subject {\n  grid-area: contactSubject;\n}\n#allNewsContainer .contentBox form #contact-message, #contactContainer .contentBox form #contact-message {\n  grid-area: contactMessage;\n}\n\n#contactContainer {\n  background: black;\n  color: white;\n}\n#contactContainer .contentBox {\n  -moz-column-gap: 3rem;\n       column-gap: 3rem;\n  width: 85%;\n  display: flex;\n  padding-bottom: 1rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox {\n    width: 70%;\n  }\n}\n#contactContainer .contentBox img {\n  filter: saturate(120%);\n  width: 45%;\n  margin-left: 2rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox img {\n    width: 50%;\n    margin-left: 0;\n  }\n}\n#contactContainer .contentBox label.error {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: rgb(120, 179, 158);\n}\n#contactContainer .contentBox form {\n  margin-top: 3rem;\n}\n#contactContainer .contentBox form > div {\n  margin: 5% 0;\n  margin-top: 0;\n}\n#contactContainer .contentBox form label {\n  font-size: 1.4rem;\n}\n#contactContainer .contentBox form [type=radio] {\n  width: 10%;\n  display: initial;\n}\n#contactContainer .contentBox form ul {\n  padding: 0;\n}\n#contactContainer .contentBox form input, #contactContainer .contentBox form select {\n  display: block;\n  margin-top: 2%;\n}\n#contactContainer .contentBox form input {\n  height: 1.5rem;\n}\n#contactContainer .contentBox form select {\n  height: 2rem;\n}\n#contactContainer .contentBox form textarea {\n  width: 100%;\n  height: 18rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox form textarea {\n    height: 20rem;\n  }\n}\n#contactContainer .contentBox form button {\n  grid-area: submit;\n  color: ivory;\n  font-size: 1.3rem;\n  text-align: left;\n}\n\n.dot-pulse {\n  top: 20%;\n  left: 35%;\n}\n\n#pop-up-display-box {\n  background-color: rgba(45, 41, 35, 0.8);\n  width: 94vw;\n  height: 87vh;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 8vh;\n  left: 3vw;\n  display: none;\n  row-gap: 1rem;\n  align-items: center;\n  flex-direction: column;\n  padding-top: 2.5rem;\n}\n#pop-up-display-box img {\n  width: 26rem;\n}\n#pop-up-display-box a, #pop-up-display-box button {\n  font-size: 2rem;\n}\n#pop-up-display-box button {\n  color: antiquewhite;\n  cursor: pointer;\n}\n#pop-up-display-box button:hover, #pop-up-display-box a:hover {\n  filter: brightness(72%);\n}\n#pop-up-display-box #content-holder {\n  display: flex;\n  justify-content: space-evenly;\n  position: relative;\n  width: 70%;\n}\n#pop-up-display-box #content-holder .pop-up-directional {\n  font-size: 2.5rem;\n}\n\n#news-media-display {\n  background-color: rgba(44, 52, 77, 0.8);\n  height: 88vh;\n  width: 94vw;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 7vh;\n  left: 3vw;\n  display: none;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n}\n\n#singleContainer {\n  height: 87%;\n  min-width: 96%;\n  top: 8.3%;\n  display: flex;\n  flex-wrap: wrap;\n  position: absolute;\n  z-index: 1;\n  padding: 1.5rem 1rem;\n  padding-bottom: 1rem;\n  background-color: rgba(37, 35, 34, 0.9);\n}\n@media (min-width: 1200px) {\n  #singleContainer {\n    min-width: 60%;\n  }\n}\n#singleContainer h4 {\n  font-size: 1.6rem;\n}\n#singleContainer h3, #singleContainer h4, #singleContainer .related-link {\n  color: rgb(241, 218, 189);\n}\n#singleContainer #mainImageAndStats {\n  width: 21vw;\n  text-align: center;\n}\n#singleContainer #mainImageAndStats img {\n  height: 42%;\n}\n#singleContainer #mainImageAndStats ul {\n  padding-left: 20%;\n  font-size: 1.5rem;\n  text-align: left;\n  margin-top: 1rem;\n}\n#singleContainer #mainImageAndStats ul li {\n  margin-top: 0.6rem;\n  list-style-type: square;\n}\n#singleContainer #mainImageAndStats ul li a {\n  filter: brightness(115%);\n}\n#singleContainer #singleInfo {\n  width: 30vw;\n  display: grid;\n  grid-template-rows: 7% 1fr;\n  height: 100%;\n}\n#singleContainer #singleInfo p {\n  margin-top: 1.2rem;\n  font-size: 1.7rem;\n  height: 99%;\n}\n#singleContainer #singleInfo div {\n  overflow: auto;\n  padding: 0 1rem;\n}\n#singleContainer #singleInfo #mediaContainer {\n  height: auto;\n}\n#singleContainer #singleInfo #mediaContainer iframe {\n  width: 200px;\n  height: 200px;\n}\n#singleContainer #vidAndImgCol {\n  height: 100%;\n  width: 16vw;\n  overflow: auto;\n  overflow-x: hidden;\n  text-align: center;\n}\n#singleContainer #vidAndImgCol h3 {\n  font-size: 1.9rem;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col {\n  width: 26vw;\n  position: relative;\n  height: 100%;\n  overflow: auto;\n  padding: 0 1rem;\n  display: grid;\n  grid-template-rows: 10% 1fr 4%;\n}\n#singleContainer #updates-col h3 {\n  font-size: 2rem;\n}\n#singleContainer #updates-col h3 a {\n  font-size: 1.7rem;\n}\n#singleContainer #updates-col h3 a:hover {\n  color: white;\n}\n#singleContainer #updates-col #news-reciever {\n  overflow: auto;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col #news-reciever p {\n  font-size: 1.4rem;\n  padding-right: 1rem;\n}\n#singleContainer #updates-col #pagination-holder {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n  font-size: 1.8rem;\n  display: flex;\n  justify-content: center;\n}\n\nbody {\n  background-color: rgb(100, 92, 82);\n}\n\n.search-overlay {\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(72, 68, 62, 0.96);\n  visibility: hidden;\n  opacity: 0;\n  transform: scale(1.09);\n  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;\n  box-sizing: border-box;\n}\n.search-overlay .container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n.search-overlay p {\n  padding-top: 1rem;\n}\nbody.admin-bar .search-overlay {\n  top: 2rem;\n}\n.search-overlay__top {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n.search-overlay__icon {\n  margin-right: 0.75rem;\n  font-size: 2.5rem;\n  color: rgb(148, 121, 105);\n}\n.search-overlay--active {\n  visibility: visible;\n  opacity: 1;\n  transform: scale(1);\n}\n.search-overlay__section-title {\n  margin: 30px 0 1px 0;\n  font-weight: 400;\n  font-size: 2rem;\n  padding: 15px 0;\n  border-bottom: 1px solid #ccc;\n}\n.search-overlay__close {\n  font-size: 2.7rem;\n  cursor: pointer;\n  transition: all 0.3s;\n  background-color: rgb(58, 54, 54);\n  color: rgb(180, 171, 166);\n  line-height: 0.7;\n}\n.search-overlay__close:hover {\n  opacity: 1;\n}\n.search-overlay .one-half {\n  padding-bottom: 0;\n}\n\n.search-term {\n  width: 75%;\n  box-sizing: border-box;\n  border: none;\n  padding: 1rem 0;\n  margin: 0;\n  background-color: transparent;\n  font-size: 1rem;\n  font-weight: 300;\n  outline: none;\n  color: rgb(218, 201, 182);\n}\n\n.body-no-scroll {\n  overflow: hidden;\n}\n\n.container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n}\n\n@media (min-width: 960px) {\n  .search-term {\n    width: 80%;\n    font-size: 3rem;\n  }\n}\n@-webkit-keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.spinner-loader {\n  margin-top: 45px;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  border: 0.25rem solid rgba(0, 0, 0, 0.2);\n  border-top-color: black;\n  -webkit-animation: spin 1s infinite linear;\n  animation: spin 1s infinite linear;\n}\n\n.media-card button {\n  color: white;\n  cursor: pointer;\n  font-size: 2.1rem;\n}\n\nh1, h2, h3, h4 {\n  font-family: \"Libre Caslon Text\", serif;\n}\n\n.news p, .textBox p, #relationship-link, #single-link {\n  font-family: \"Libre Caslon Display\", serif;\n}\n\nh1 {\n  font-weight: 700;\n}\n\nh2 {\n  font-weight: 400;\n}\n\n.display-text, #welcomeContainer p, .titleBox p {\n  font-family: \"Cormorant SC\", serif;\n}\n\ninput, .read-more, .news li a, header li a, #realtimeFiltersAndSorting button, #search-filters button, #reset-all {\n  font-family: \"Lora\", serif;\n}\n\n.search-form {\n  position: fixed;\n  top: 50%;\n  color: white;\n}\n\n.content-loader {\n  background-color: transparent;\n  height: 50%;\n  position: absolute;\n}\n.content-loader .ball {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(47, 163, 56);\n  border-radius: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader[data-text]::before {\n  position: absolute;\n}\n.content-loader.loader.is-active::before {\n  position: absolute;\n  width: 50%;\n  left: 25%;\n  top: 39%;\n  font-size: 2.7rem;\n  color: rgb(195, 168, 126);\n  background-color: transparent;\n}\n.content-loader.loader-bar-ping-pong::after {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(101, 148, 187);\n  -webkit-animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader.is-active {\n  height: 97%;\n  z-index: 0;\n  background-color: rgba(51, 49, 56, 0.7490196078);\n  -webkit-animation: blink 1.8s linear infinite alternate;\n          animation: blink 1.8s linear infinite alternate;\n}\n\n@-webkit-keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@-webkit-keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n@keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n#all-news-container {\n  height: 85%;\n  top: 9%;\n  width: 95%;\n  left: 2.5%;\n  background-color: rgba(37, 35, 34, 0.75);\n  position: absolute;\n  display: flex;\n  color: aliceblue;\n}\n#all-news-container button {\n  color: antiquewhite;\n}\n#all-news-container #media-container, #all-news-container #filters-and-links-container, #all-news-container #selected-news-container {\n  position: relative;\n  height: 100%;\n}\n#all-news-container #filters-and-links-container {\n  border: 0.2rem solid rgba(212, 193, 130, 0.4);\n  border-left: none;\n  padding-left: 1.5rem;\n  display: grid;\n  grid-template-areas: \"realtimeFiltersAndSorting\" \"searchFilters\" \"resetAll\";\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting {\n  grid-area: realtimeFiltersAndSorting;\n  display: grid;\n  margin-top: 1.5rem;\n  grid-template-areas: \"headingRFS headingRFS\" \"orderBy toggleType\" \"filterDate filterDate\";\n  width: 100%;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button, #all-news-container #filters-and-links-container #realtime-filters-and-sorting label {\n  font-size: 1.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting h2 {\n  grid-area: headingRFS;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #order-by {\n  grid-area: orderBy;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #toggle-type {\n  grid-area: toggleType;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date {\n  grid-area: filterDate;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date div ul {\n  display: flex;\n  gap: 3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul {\n  padding-left: 0.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul li {\n  margin-top: 0.5rem;\n}\n#all-news-container #filters-and-links-container #search-filters {\n  grid-area: searchFilters;\n  display: grid;\n  grid-template-areas: \"headingSF headingSF headingSF\" \"newsSearch newsSearch newsSearch\" \"caseSensitive fullWordOnly wordStartOnly\" \"includeTitle includeDescription ...\";\n}\n#all-news-container #filters-and-links-container #search-filters h2 {\n  grid-area: headingSF;\n}\n#all-news-container #filters-and-links-container #search-filters button {\n  font-size: 1.2rem;\n  text-align: left;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container {\n  grid-area: newsSearch;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container #news-search {\n  font-size: 1.15rem;\n  height: 2.3rem;\n  width: 18rem;\n}\n#all-news-container #filters-and-links-container #search-filters #full-word-only {\n  grid-area: fullWordOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only {\n  grid-area: wordStartOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #case-sensitive {\n  grid-area: caseSensitive;\n}\n#all-news-container #filters-and-links-container #search-filters #include-title {\n  grid-area: includeTitle;\n}\n#all-news-container #filters-and-links-container #search-filters #include-description {\n  grid-area: includeDescription;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive, #all-news-container #filters-and-links-container #search-filters button.inactive {\n  pointer-events: none;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive span, #all-news-container #filters-and-links-container #search-filters button.inactive span {\n  color: red;\n}\n#all-news-container #filters-and-links-container button, #all-news-container #filters-and-links-container select, #all-news-container #filters-and-links-container label {\n  font-size: 1.1rem;\n}\n#all-news-container #filters-and-links-container #reset-all {\n  font-size: 1.4rem;\n  grid-area: resetAll;\n}\n#all-news-container #filters-and-links-container button {\n  cursor: pointer;\n}\n#all-news-container #filters-and-links-container h3 {\n  font-size: 1.7rem;\n}\n#all-news-container #filters-and-links-container h4 {\n  font-size: 1.5rem;\n  margin-bottom: 0.8rem;\n}\n#all-news-container #selected-news-container {\n  width: 66%;\n  display: grid;\n  grid-template-rows: 10% 84% 6%;\n  border: 0.2rem solid rgb(180, 174, 164);\n}\n#all-news-container #selected-news-container h2 {\n  width: 100%;\n  text-align: center;\n  font-size: 3rem;\n  margin-bottom: 1rem;\n  border-bottom: 0.3rem solid rgb(185, 158, 122);\n}\n#all-news-container #selected-news-container #dismiss-selection {\n  position: absolute;\n}\n#all-news-container #selected-news-container #dismiss-selection.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #selected-news-reciever {\n  margin-bottom: 0.5rem;\n  padding-right: 2rem;\n  overflow: auto;\n}\n#all-news-container #selected-news-container #full-display-container {\n  padding-left: 2rem;\n}\n#all-news-container #selected-news-container #main-display.dismissed, #all-news-container #selected-news-container #full-display-container.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #main-display .news, #all-news-container #selected-news-container #full-display-container .news {\n  font-size: 1.2rem;\n  padding-top: 0;\n}\n#all-news-container #selected-news-container #main-display .news::after, #all-news-container #selected-news-container #full-display-container .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#all-news-container #selected-news-container #main-display .news img, #all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news img, #all-news-container #selected-news-container #full-display-container .news iframe {\n  float: left;\n  margin-right: 2%;\n}\n#all-news-container #selected-news-container #main-display .news p, #all-news-container #selected-news-container #full-display-container .news p {\n  line-height: 1.2rem;\n}\n#all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news iframe {\n  width: 150px;\n  height: 100px;\n}\n#all-news-container #selected-news-container #main-display ul li, #all-news-container #selected-news-container #full-display-container ul li {\n  list-style-type: circle;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link, #all-news-container #selected-news-container #main-display ul li .relationship-link, #all-news-container #selected-news-container #full-display-container ul li .see-more-link, #all-news-container #selected-news-container #full-display-container ul li .relationship-link {\n  cursor: pointer;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link.dismissed, #all-news-container #selected-news-container #main-display ul li .relationship-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .see-more-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .relationship-link.dismissed {\n  display: none;\n}\n#all-news-container #filters-and-links-container {\n  width: 36%;\n  padding-top: 1rem;\n}\n#all-news-container #pagination-holder {\n  width: 100%;\n}\n#all-news-container #pagination-holder.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n#all-news-container #pagination-holder .content-pages a {\n  cursor: pointer;\n  font-size: 1.9rem;\n  margin-left: 0.5rem;\n}\n#all-news-container #pagination-holder .content-pages a.hidden, #all-news-container #pagination-holder .content-pages a.selectedPage {\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages a.hidden {\n  opacity: 0;\n}\n\n#media-reciever {\n  display: none;\n  position: fixed;\n  background-color: rgba(10, 10, 10, 0.8);\n  top: 7%;\n  width: 100%;\n  height: 95%;\n  z-index: 1;\n}\n#media-reciever #current-media {\n  margin-left: 14rem;\n  position: absolute;\n  top: 3rem;\n  height: 45rem;\n  width: 80rem;\n}\n#media-reciever #current-media iframe, #media-reciever #current-media img {\n  width: 100%;\n  height: 100%;\n}\n#media-reciever #current-media #play-button-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: absolute;\n  height: 100%;\n  width: 100%;\n}\n#media-reciever #current-media #play-button-container #play-button {\n  height: 6rem;\n  width: 9rem;\n  background-color: rgba(99, 100, 179, 0.8);\n  position: absolute;\n  border-radius: 35%;\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  transition: opacity 0.2s ease;\n}\n#media-reciever #current-media #play-button-container #play-button div {\n  border-left: 3rem solid rgb(125, 150, 168);\n  border-top: 1.7rem solid transparent;\n  border-bottom: 1.7rem solid transparent;\n}\n#media-reciever #current-media #play-button-container #play-button:hover {\n  opacity: 0.7;\n}\n#media-reciever #current-media.center-display {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface {\n  display: flex;\n  flex-direction: column;\n  position: absolute;\n  height: 82%;\n  overflow: auto;\n  right: 2rem;\n  top: 3rem;\n}\n#media-reciever #media-selection-interface #media-menu {\n  font-size: 1.2rem;\n  display: flex;\n}\n#media-reciever #media-selection-interface #media-menu a {\n  color: azure;\n  margin-left: 2rem;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-menu a.active {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column {\n  max-width: 380px;\n  display: flex;\n  flex-direction: column;\n  overflow: auto;\n}\n#media-reciever #media-selection-interface #media-column .media-selection {\n  display: flex;\n  margin-top: 1rem;\n  width: 100%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb {\n  width: 45%;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb.selected {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information {\n  display: flex;\n  flex-direction: column;\n  margin-left: 1rem;\n  width: 55%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p {\n  margin: 0;\n  color: beige;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p:nth-of-type(2) {\n  margin-top: 1rem;\n}\n#media-reciever #media-selection-interface #media-pagination {\n  margin-top: 1.5rem;\n  color: aliceblue;\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface #media-pagination a {\n  font-size: 1.2rem;\n  margin-left: 1rem;\n}\n#media-reciever #media-close {\n  position: absolute;\n  color: white;\n  left: 3.5rem;\n  top: 3.5rem;\n  font-size: 3.5rem;\n  cursor: pointer;\n}\n\n.media-card:hover img, .property-media-card:hover img {\n  filter: brightness(50%);\n  cursor: pointer;\n}\n.media-card:hover h3, .media-card:hover p, .media-card:hover button, .property-media-card:hover h3, .property-media-card:hover p, .property-media-card:hover button {\n  filter: contrast(40%);\n  cursor: pointer;\n}\n\n.loader {\n  color: #fff;\n  position: fixed;\n  box-sizing: border-box;\n  left: -9999px;\n  top: -9999px;\n  width: 0;\n  height: 0;\n  overflow: hidden;\n  z-index: 999999;\n}\n\n.loader:after, .loader:before {\n  box-sizing: border-box;\n  display: none;\n}\n\n.loader.is-active {\n  background-color: rgba(0, 0, 0, 0.85);\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.loader.is-active:after, .loader.is-active:before {\n  display: block;\n}\n\n@-webkit-keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n\n@keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.loader[data-text]:before {\n  position: fixed;\n  left: 0;\n  top: 50%;\n  color: currentColor;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  width: 100%;\n  font-size: 14px;\n}\n\n.loader[data-text=\"\"]:before {\n  content: \"Loading\";\n}\n\n.loader[data-text]:not([data-text=\"\"]):before {\n  content: attr(data-text);\n}\n\n.loader[data-text][data-blink]:before {\n  -webkit-animation: blink 1s linear infinite alternate;\n          animation: blink 1s linear infinite alternate;\n}\n\n.loader-default[data-text]:before {\n  top: calc(50% - 63px);\n}\n\n.loader-default:after {\n  content: \"\";\n  position: fixed;\n  width: 48px;\n  height: 48px;\n  border: 8px solid #fff;\n  border-left-color: transparent;\n  border-radius: 50%;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-default[data-half]:after {\n  border-right-color: transparent;\n}\n\n.loader-default[data-inverse]:after {\n  animation-direction: reverse;\n}\n\n.loader-double:after, .loader-double:before {\n  content: \"\";\n  position: fixed;\n  border-radius: 50%;\n  border: 8px solid;\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-double:after {\n  width: 48px;\n  height: 48px;\n  border-color: #fff;\n  border-left-color: transparent;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n}\n\n.loader-double:before {\n  width: 64px;\n  height: 64px;\n  border-color: #eb974e;\n  border-right-color: transparent;\n  -webkit-animation-duration: 2s;\n          animation-duration: 2s;\n  top: calc(50% - 32px);\n  left: calc(50% - 32px);\n}\n\n.loader-bar[data-text]:before {\n  top: calc(50% - 40px);\n  color: #fff;\n}\n\n.loader-bar:after {\n  content: \"\";\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  width: 200px;\n  height: 20px;\n  transform: translate(-50%, -50%);\n  background: linear-gradient(-45deg, #4183d7 25%, #52b3d9 0, #52b3d9 50%, #4183d7 0, #4183d7 75%, #52b3d9 0, #52b3d9);\n  background-size: 20px 20px;\n  box-shadow: inset 0 10px 0 hsla(0, 0%, 100%, 0.2), 0 0 0 5px rgba(0, 0, 0, 0.2);\n  animation: moveBar 1.5s linear infinite reverse;\n}\n\n.loader-bar[data-rounded]:after {\n  border-radius: 15px;\n}\n\n.loader-bar[data-inverse]:after {\n  -webkit-animation-direction: normal;\n          animation-direction: normal;\n}\n\n@-webkit-keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n\n@keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n.loader-bar-ping-pong:before {\n  width: 200px;\n  background-color: #000;\n}\n\n.loader-bar-ping-pong:after, .loader-bar-ping-pong:before {\n  content: \"\";\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 100px);\n}\n\n.loader-bar-ping-pong:after {\n  width: 50px;\n  background-color: #f19;\n  -webkit-animation: moveBarPingPong 0.5s linear infinite alternate;\n          animation: moveBarPingPong 0.5s linear infinite alternate;\n}\n\n.loader-bar-ping-pong[data-rounded]:before {\n  border-radius: 10px;\n}\n\n.loader-bar-ping-pong[data-rounded]:after {\n  border-radius: 50%;\n  width: 20px;\n  -webkit-animation-name: moveBarPingPongRounded;\n          animation-name: moveBarPingPongRounded;\n}\n\n@keyframes moveBarPingPong {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 50px);\n  }\n}\n@-webkit-keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@-webkit-keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n@keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n.loader-border[data-text]:before {\n  color: #fff;\n}\n\n.loader-border:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 15px;\n  height: 15px;\n  background-color: #ff0;\n  -webkit-animation: corners 3s ease both infinite;\n          animation: corners 3s ease both infinite;\n}\n\n.loader-ball:before {\n  content: \"\";\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 50%;\n  left: 50%;\n  margin: -25px 0 0 -25px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: kickBall 1s infinite alternate ease-in both;\n          animation: kickBall 1s infinite alternate ease-in both;\n}\n\n.loader-ball[data-shadow]:before {\n  box-shadow: inset -5px -5px 10px 0 rgba(0, 0, 0, 0.5);\n}\n\n.loader-ball:after {\n  content: \"\";\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.3);\n  border-radius: 50%;\n  width: 45px;\n  height: 20px;\n  top: calc(50% + 10px);\n  left: 50%;\n  margin: 0 0 0 -22.5px;\n  z-index: 0;\n  -webkit-animation: shadow 1s infinite alternate ease-out both;\n          animation: shadow 1s infinite alternate ease-out both;\n}\n\n@-webkit-keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n\n@keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n@-webkit-keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n@keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n.loader-smartphone:after {\n  content: \"\";\n  color: #fff;\n  font-size: 12px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  line-height: 120px;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  width: 70px;\n  height: 130px;\n  margin: -65px 0 0 -35px;\n  border: 5px solid #fd0;\n  border-radius: 10px;\n  box-shadow: inset 0 5px 0 0 #fd0;\n  background: radial-gradient(circle at 50% 90%, rgba(0, 0, 0, 0.5) 6px, transparent 0), linear-gradient(0deg, #fd0 22px, transparent 0), linear-gradient(0deg, rgba(0, 0, 0, 0.5) 22px, rgba(0, 0, 0, 0.5));\n  -webkit-animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n          animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n}\n\n.loader-smartphone[data-screen=\"\"]:after {\n  content: \"Loading\";\n}\n\n.loader-smartphone:not([data-screen=\"\"]):after {\n  content: attr(data-screen);\n}\n\n@-webkit-keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n\n@keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n.loader-clock:before {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  margin: -60px 0 0 -60px;\n  background: linear-gradient(180deg, transparent 50%, #f5f5f5 0), linear-gradient(90deg, transparent 55px, #2ecc71 0, #2ecc71 65px, transparent 0), linear-gradient(180deg, #f5f5f5 50%, #f5f5f5 0);\n  box-shadow: inset 0 0 0 10px #f5f5f5, 0 0 0 5px #555, 0 0 0 10px #7b7b7b;\n  -webkit-animation: rotation infinite 2s linear;\n          animation: rotation infinite 2s linear;\n}\n\n.loader-clock:after, .loader-clock:before {\n  content: \"\";\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  overflow: hidden;\n}\n\n.loader-clock:after {\n  width: 60px;\n  height: 40px;\n  margin: -20px 0 0 -15px;\n  border-radius: 20px 0 0 20px;\n  background: radial-gradient(circle at 14px 20px, #25a25a 10px, transparent 0), radial-gradient(circle at 14px 20px, #1b7943 14px, transparent 0), linear-gradient(180deg, transparent 15px, #2ecc71 0, #2ecc71 25px, transparent 0);\n  -webkit-animation: rotation infinite 24s linear;\n          animation: rotation infinite 24s linear;\n  transform-origin: 15px center;\n}\n\n.loader-curtain:after, .loader-curtain:before {\n  position: fixed;\n  width: 100%;\n  top: 50%;\n  margin-top: -35px;\n  font-size: 70px;\n  text-align: center;\n  font-family: Helvetica, Arial, sans-serif;\n  overflow: hidden;\n  line-height: 1.2;\n  content: \"Loading\";\n}\n\n.loader-curtain:before {\n  color: #666;\n}\n\n.loader-curtain:after {\n  color: #fff;\n  height: 0;\n  -webkit-animation: curtain 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both;\n}\n\n.loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):after, .loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):before {\n  content: attr(data-curtain-text);\n}\n\n.loader-curtain[data-brazilian]:before {\n  color: #f1c40f;\n}\n\n.loader-curtain[data-brazilian]:after {\n  color: #2ecc71;\n}\n\n.loader-curtain[data-colorful]:before {\n  -webkit-animation: maskColorful 2s linear infinite alternate both;\n          animation: maskColorful 2s linear infinite alternate both;\n}\n\n.loader-curtain[data-colorful]:after {\n  -webkit-animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n  color: #000;\n}\n\n@-webkit-keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n\n@keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n@-webkit-keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@-webkit-keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n@keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n.loader-music:after, .loader-music:before {\n  content: \"\";\n  position: fixed;\n  width: 240px;\n  height: 240px;\n  top: 50%;\n  left: 50%;\n  margin: -120px 0 0 -120px;\n  border-radius: 50%;\n  text-align: center;\n  line-height: 240px;\n  color: #fff;\n  font-size: 40px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);\n  letter-spacing: -1px;\n}\n\n.loader-music:after {\n  -webkit-backface-visibility: hidden;\n          backface-visibility: hidden;\n}\n\n.loader-music[data-hey-oh]:after, .loader-music[data-hey-oh]:before {\n  box-shadow: 0 0 0 10px;\n}\n\n.loader-music[data-hey-oh]:before {\n  background-color: #fff;\n  color: #000;\n  -webkit-animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-hey-oh]:after {\n  background-color: #000;\n  -webkit-animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n          animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after, .loader-music[data-no-cry]:before {\n  background: linear-gradient(45deg, #009b3a 50%, #fed100 51%);\n  box-shadow: 0 0 0 10px #000;\n}\n\n.loader-music[data-no-cry]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after {\n  -webkit-animation: coin 2.5s linear infinite, no 5s linear infinite both;\n          animation: coin 2.5s linear infinite, no 5s linear infinite both;\n}\n\n.loader-music[data-we-are]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n  background: radial-gradient(ellipse at center, #4ecdc4 0, #556270);\n}\n\n.loader-music[data-we-are]:after {\n  -webkit-animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n  background: radial-gradient(ellipse at center, #26d0ce 0, #1a2980);\n}\n\n.loader-music[data-rock-you]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n  background: #444;\n}\n\n.loader-music[data-rock-you]:after {\n  -webkit-animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n  background: #96281b;\n}\n\n@-webkit-keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n\n@keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n@-webkit-keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@-webkit-keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@-webkit-keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@-webkit-keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@-webkit-keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@-webkit-keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@-webkit-keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@-webkit-keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@-webkit-keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n@keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n.loader-pokeball:before {\n  content: \"\";\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  top: 50%;\n  left: 50%;\n  margin: -50px 0 0 -50px;\n  background: linear-gradient(180deg, red 42%, #000 0, #000 58%, #fff 0);\n  background-repeat: no-repeat;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: movePokeball 1s linear infinite both;\n          animation: movePokeball 1s linear infinite both;\n}\n\n.loader-pokeball:after {\n  content: \"\";\n  position: absolute;\n  width: 24px;\n  height: 24px;\n  top: 50%;\n  left: 50%;\n  margin: -12px 0 0 -12px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 2;\n  -webkit-animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n          animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n  border: 2px solid #000;\n  box-shadow: 0 0 0 5px #fff, 0 0 0 10px #000;\n}\n\n@-webkit-keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n\n@keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n@-webkit-keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n@keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n.loader-bouncing:after, .loader-bouncing:before {\n  content: \"\";\n  width: 20px;\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 10px);\n  border-radius: 50%;\n  background-color: #fff;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:after {\n  margin-left: -30px;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:before {\n  -webkit-animation-delay: 0.2s;\n          animation-delay: 0.2s;\n}\n\n@-webkit-keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n\n@keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n.sbl-circ-ripple {\n  height: 48px;\n  width: 48px;\n  color: #48659b;\n  border-radius: 50%;\n  position: relative;\n  display: inline-block;\n  top: 20%;\n  left: 40%;\n}\n\n.sbl-circ-ripple::after, .sbl-circ-ripple::before {\n  content: \"\";\n  height: 0;\n  width: 0;\n  border: inherit;\n  border: 5px solid;\n  border-radius: inherit;\n  position: absolute;\n  left: 40%;\n  top: 40%;\n  -webkit-animation: circle-ripple 1s linear infinite;\n          animation: circle-ripple 1s linear infinite;\n}\n\n.sbl-circ-ripple::before {\n  -webkit-animation-delay: -0.6s;\n          animation-delay: -0.6s;\n}\n\n@-webkit-keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}\n\n@keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}/*# sourceMappingURL=style.css.map */", "",{"version":3,"sources":["webpack://./css/style.css","webpack://./css/base/_customBase.scss","webpack://./css/base/_mixins.scss","webpack://./css/modules/_footer.scss","webpack://./css/modules/_opening.scss","webpack://./css/modules/_properties.scss","webpack://./css/modules/_single.scss","webpack://./css/modules/_constant.scss","webpack://./css/modules/_search.scss","webpack://./css/modules/_loader.scss","webpack://./css/modules/_all-news.scss","webpack://./css/modules/_shadow-box.scss","webpack://./css/downloads/css-loader.css","webpack://./css/downloads/sbl-circ-ripple.css"],"names":[],"mappings":"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","sourceRoot":""}]);
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
    if(document.getElementById('all-news-container')){
        this.returnHome = document.querySelector('#return-home');
                 //Later, find way to make this not cause errors on other pages
        this.mainContainer = document.getElementById('all-news-container');
        this.newsReciever = document.querySelector('#main-display');
        this.paginationHolder = document.getElementById('pagination-holder')
        this.relationshipLinks;
        this.seeMore;
        this.dismissButton = document.getElementById('dismiss-selection');

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

        this.newsSearch.addEventListener("keyup", () => this.typingLogic())

        this.dismissButton.addEventListener('click', () => this.dismissSelection())

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
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (News);

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
        // console.log(e.keyCode);
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
                console.log(this.currentSelection)
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
                console.log(this.firstPageButton)
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
            console.log(e.keyCode, this.isMediaRecieverOpen)
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
//Look up how to bundle scss here using webpack and make this into an import file(Also use seperate file for gen logic, 
//so can conditional this for forms)









const search = new _modules_search__WEBPACK_IMPORTED_MODULE_2__["default"]();
const pagination = new _modules_pagination__WEBPACK_IMPORTED_MODULE_3__["default"]();
const news = new _modules_all_news__WEBPACK_IMPORTED_MODULE_4__["default"]();
const relatedNews = new _modules_singlePost__WEBPACK_IMPORTED_MODULE_5__["default"]();
const shadowBox = new _modules_shadowBox__WEBPACK_IMPORTED_MODULE_6__["default"]();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVcsVUFBVSxZQUFZLFdBQVcsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssTUFBTSxNQUFNLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsWUFBWSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE1BQU0sT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLFVBQVUsS0FBSyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxhQUFhLFlBQVksV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxVQUFVLEtBQUssTUFBTSxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxZQUFZLFlBQVksYUFBYSxZQUFZLFlBQVksVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxjQUFjLGNBQWMsZUFBZSxjQUFjLGNBQWMsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLGNBQWMsY0FBYyxlQUFlLGVBQWUsY0FBYyxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsVUFBVSxZQUFZLFlBQVksYUFBYSxhQUFhLGFBQWEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsV0FBVyxVQUFVLGNBQWMsY0FBYyxlQUFlLGNBQWMsY0FBYyxXQUFXLFFBQVEsUUFBUSxZQUFZLGFBQWEsV0FBVyxRQUFRLFFBQVEsVUFBVSxTQUFTLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsTUFBTSxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssWUFBWSxLQUFLLEtBQUssV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxTQUFTLFFBQVEsS0FBSyxVQUFVLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxZQUFZLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLE1BQU0sUUFBUSxLQUFLLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFlB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TSxVQUFVLEtBQUssS0FBSyxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsS0FBSyxNQUFNLFVBQVUsS0FBSyxNQUFNLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLFdBQVcsS0FBSyxLQUFLLE1BQU0sTUFBTSxXQUFXLEtBQUssTUFBTSxLQUFLLFVBQVUsVUFBVSxLQUFLLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLE1BQU0sVUFBVSxPQUFPLEtBQUssT0FBTyxVQUFVLE9BQU8sTUFBTSxNQUFNLFVBQVUsT0FBTyxLQUFLLE1BQU0sV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE9BQU8sVUFBVSxPQUFPLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxPQUFPLFdBQVcsV0FBVyxNQUFNLE9BQU8sV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE9BQU8sVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLEtBQUssTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLEtBQUssTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLFFBQVEsTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxNQUFNLE9BQU8sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxXQUFXLE1BQU0sT0FBTyxNQUFNLFVBQVUsVUFBVSxNQUFNLEtBQUssTUFBTSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sT0FBTyxNQUFNLFVBQVUsT0FBTyxLQUFLLE1BQU0sV0FBVyxVQUFVLFdBQVcsV0FBVyxRQUFRLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxVQUFVLFVBQVUsV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLFFBQVEsT0FBTyxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFVBQVUsV0FBVyxRQUFRLE9BQU8sS0FBSyxVQUFVLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLFVBQVUsVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxVQUFVLFVBQVUsVUFBVSxRQUFRLE9BQU8sV0FBVyxVQUFVLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE1BQU0sT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsVUFBVSxZQUFZLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxRQUFRLFVBQVUsVUFBVSxRQUFRLE9BQU8sV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLFFBQVEsV0FBVyxVQUFVLFVBQVUsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxRQUFRLFVBQVUsUUFBUSxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFFBQVEsUUFBUSxVQUFVLFVBQVUsVUFBVSxVQUFVLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFVBQVUsVUFBVSxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLE9BQU8sVUFBVSxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxXQUFXLE9BQU8sUUFBUSxVQUFVLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxTQUFTLE9BQU8sVUFBVSxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sVUFBVSxRQUFRLE9BQU8sVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxPQUFPLFdBQVcsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFVBQVUsUUFBUSxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFdBQVcsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxRQUFRLFFBQVEsV0FBVyxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsV0FBVyxVQUFVLFFBQVEsUUFBUSxVQUFVLFVBQVUsUUFBUSxRQUFRLFdBQVcsUUFBUSxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsUUFBUSxPQUFPLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFFBQVEsT0FBTyxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsU0FBUyxRQUFRLFlBQVksV0FBVyxTQUFTLFFBQVEsWUFBWSxXQUFXLFVBQVUsVUFBVSxVQUFVLFNBQVMsUUFBUSxXQUFXLFNBQVMsUUFBUSxNQUFNLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFFBQVEsTUFBTSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLE1BQU0sVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLEtBQUssUUFBUSxXQUFXLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFVBQVUsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFlBQVksWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsTUFBTSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxXQUFXLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxVQUFVLFNBQVMsV0FBVyxXQUFXLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFVBQVUsU0FBUyxTQUFTLFVBQVUsVUFBVSxXQUFXLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsV0FBVyxZQUFZLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFVBQVUsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsVUFBVSxTQUFTLFNBQVMsVUFBVSxVQUFVLFdBQVcsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxXQUFXLFlBQVksU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsVUFBVSxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLFdBQVcsVUFBVSxTQUFTLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxXQUFXLFVBQVUsU0FBUyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsV0FBVyxXQUFXLFlBQVksWUFBWSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxTQUFTLE1BQU0sV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsTUFBTSxTQUFTLE1BQU0sV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsS0FBSyxTQUFTLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFdBQVcsVUFBVSxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLE1BQU0sU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxXQUFXLFdBQVcsVUFBVSxTQUFTLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsTUFBTSxXQUFXLFNBQVMsTUFBTSxTQUFTLE1BQU0sV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxLQUFLLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxLQUFLLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsS0FBSyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLEtBQUssV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxLQUFLLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsdUNBQXVDO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLGtCQUFrQjtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0ZBQW9GLGtCQUFrQjtBQUN0RztBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0ZBQW9GLGtCQUFrQjtBQUN0RztBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsaUVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN2dDZjtBQUNBO0FBQ3lCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0VBQW9FLE9BQU87QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeE9XO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLGdEQUFTO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRCw4QkFB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O1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQzBCO0FBQ0Y7QUFDeEI7QUFDc0M7QUFDUTtBQUNSO0FBQ1M7QUFDSDtBQUM1QztBQUNBLG1CQUFtQix1REFBTTtBQUN6Qix1QkFBdUIsMkRBQVU7QUFDakMsaUJBQWlCLHlEQUFJO0FBQ3JCLHdCQUF3QiwyREFBVztBQUNuQyxzQkFBc0IsMERBQVMsRyIsInNvdXJjZXMiOlsid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9jc3MvZG90cy5jc3MiLCJ3ZWJwYWNrOi8vY2FoLy4vY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2NhaC8uL2Nzcy9kb3RzLmNzcz83NjQyIiwid2VicGFjazovL2NhaC8uL2Nzcy9zdHlsZS5jc3M/ZGExZiIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL2FsbC1uZXdzLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3BhZ2luYXRpb24uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvc2VhcmNoLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3NoYWRvd0JveC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9zaW5nbGVQb3N0LmpzIiwid2VicGFjazovL2NhaC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vY2FoL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgY29uZmlnLnRyYW5zaXRpb25hbCAmJiBjb25maWcudHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWw7XG5cbiAgaWYgKHRyYW5zaXRpb25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsaWRhdG9yLmFzc2VydE9wdGlvbnModHJhbnNpdGlvbmFsLCB7XG4gICAgICBzaWxlbnRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKSxcbiAgICAgIGZvcmNlZEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKVxuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8vIGZpbHRlciBvdXQgc2tpcHBlZCBpbnRlcmNlcHRvcnNcbiAgdmFyIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHZhciBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSB0cnVlO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBpZiAodHlwZW9mIGludGVyY2VwdG9yLnJ1bldoZW4gPT09ICdmdW5jdGlvbicgJiYgaW50ZXJjZXB0b3IucnVuV2hlbihjb25maWcpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyAmJiBpbnRlcmNlcHRvci5zeW5jaHJvbm91cztcblxuICAgIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHByb21pc2U7XG5cbiAgaWYgKCFzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMpIHtcbiAgICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoY2hhaW4sIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluKTtcbiAgICBjaGFpbiA9IGNoYWluLmNvbmNhdChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4pO1xuXG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuXG4gIHZhciBuZXdDb25maWcgPSBjb25maWc7XG4gIHdoaWxlIChyZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICB2YXIgb25GdWxmaWxsZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHZhciBvblJlamVjdGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB0cnkge1xuICAgICAgbmV3Q29uZmlnID0gb25GdWxmaWxsZWQobmV3Q29uZmlnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgb25SZWplY3RlZChlcnJvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIHByb21pc2UgPSBkaXNwYXRjaFJlcXVlc3QobmV3Q29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG5cbiAgd2hpbGUgKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpLCByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCwgb3B0aW9ucykge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZCxcbiAgICBzeW5jaHJvbm91czogb3B0aW9ucyA/IG9wdGlvbnMuc3luY2hyb25vdXMgOiBmYWxzZSxcbiAgICBydW5XaGVuOiBvcHRpb25zID8gb3B0aW9ucy5ydW5XaGVuIDogbnVsbFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsO1xuICAgIHZhciBzaWxlbnRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuc2lsZW50SlNPTlBhcnNpbmc7XG4gICAgdmFyIGZvcmNlZEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5mb3JjZWRKU09OUGFyc2luZztcbiAgICB2YXIgc3RyaWN0SlNPTlBhcnNpbmcgPSAhc2lsZW50SlNPTlBhcnNpbmcgJiYgdGhpcy5yZXNwb25zZVR5cGUgPT09ICdqc29uJztcblxuICAgIGlmIChzdHJpY3RKU09OUGFyc2luZyB8fCAoZm9yY2VkSlNPTlBhcnNpbmcgJiYgdXRpbHMuaXNTdHJpbmcoZGF0YSkgJiYgZGF0YS5sZW5ndGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKHN0cmljdEpTT05QYXJzaW5nKSB7XG4gICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICAgICAgdGhyb3cgZW5oYW5jZUVycm9yKGUsIHRoaXMsICdFX0pTT05fUEFSU0UnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGtnID0gcmVxdWlyZSgnLi8uLi8uLi9wYWNrYWdlLmpzb24nKTtcblxudmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblsnb2JqZWN0JywgJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ3N0cmluZycsICdzeW1ib2wnXS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGkpIHtcbiAgdmFsaWRhdG9yc1t0eXBlXSA9IGZ1bmN0aW9uIHZhbGlkYXRvcih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09IHR5cGUgfHwgJ2EnICsgKGkgPCAxID8gJ24gJyA6ICcgJykgKyB0eXBlO1xuICB9O1xufSk7XG5cbnZhciBkZXByZWNhdGVkV2FybmluZ3MgPSB7fTtcbnZhciBjdXJyZW50VmVyQXJyID0gcGtnLnZlcnNpb24uc3BsaXQoJy4nKTtcblxuLyoqXG4gKiBDb21wYXJlIHBhY2thZ2UgdmVyc2lvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IHRoYW5WZXJzaW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNPbGRlclZlcnNpb24odmVyc2lvbiwgdGhhblZlcnNpb24pIHtcbiAgdmFyIHBrZ1ZlcnNpb25BcnIgPSB0aGFuVmVyc2lvbiA/IHRoYW5WZXJzaW9uLnNwbGl0KCcuJykgOiBjdXJyZW50VmVyQXJyO1xuICB2YXIgZGVzdFZlciA9IHZlcnNpb24uc3BsaXQoJy4nKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICBpZiAocGtnVmVyc2lvbkFycltpXSA+IGRlc3RWZXJbaV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAocGtnVmVyc2lvbkFycltpXSA8IGRlc3RWZXJbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7c3RyaW5nP30gdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIHZhciBpc0RlcHJlY2F0ZWQgPSB2ZXJzaW9uICYmIGlzT2xkZXJWZXJzaW9uKHZlcnNpb24pO1xuXG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBwa2cudmVyc2lvbiArICddIFRyYW5zaXRpb25hbCBvcHRpb24gXFwnJyArIG9wdCArICdcXCcnICsgZGVzYyArIChtZXNzYWdlID8gJy4gJyArIG1lc3NhZ2UgOiAnJyk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdCwgb3B0cykge1xuICAgIGlmICh2YWxpZGF0b3IgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0TWVzc2FnZShvcHQsICcgaGFzIGJlZW4gcmVtb3ZlZCBpbiAnICsgdmVyc2lvbikpO1xuICAgIH1cblxuICAgIGlmIChpc0RlcHJlY2F0ZWQgJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzT2xkZXJWZXJzaW9uOiBpc09sZGVyVmVyc2lvbixcbiAgYXNzZXJ0T3B0aW9uczogYXNzZXJ0T3B0aW9ucyxcbiAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnRyaW0gPyBzdHIudHJpbSgpIDogc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiQGNoYXJzZXQgXFxcIlVURi04XFxcIjtcXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEVsYXN0aWNcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1lbGFzdGljIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZWxhc3RpYyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWVsYXN0aWMgMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG4uZG90LWVsYXN0aWM6OmJlZm9yZSwgLmRvdC1lbGFzdGljOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1lbGFzdGljOjpiZWZvcmUge1xcbiAgbGVmdDogLTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWVsYXN0aWMtYmVmb3JlIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZWxhc3RpYy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG4uZG90LWVsYXN0aWM6OmFmdGVyIHtcXG4gIGxlZnQ6IDk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWVsYXN0aWMtYWZ0ZXIgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1lbGFzdGljLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1lbGFzdGljLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1lbGFzdGljLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWVsYXN0aWMge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZWxhc3RpYyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWVsYXN0aWMtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMC42Nyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZWxhc3RpYy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAwLjY3KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFB1bHNlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtcHVsc2Uge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcHVsc2UgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuMjVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMjVzO1xcbn1cXG4uZG90LXB1bHNlOjpiZWZvcmUsIC5kb3QtcHVsc2U6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LXB1bHNlOjpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1wdWxzZS1iZWZvcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlLWJlZm9yZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcXG59XFxuLmRvdC1wdWxzZTo6YWZ0ZXIge1xcbiAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcHVsc2UtYWZ0ZXIgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlLWFmdGVyIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC41cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1wdWxzZS1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtcHVsc2UtYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtcHVsc2Uge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtcHVsc2Uge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1wdWxzZS1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1wdWxzZS1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZsYXNoaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZmxhc2hpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBsaW5lYXIgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBsaW5lYXIgYWx0ZXJuYXRlO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC41cztcXG59XFxuLmRvdC1mbGFzaGluZzo6YmVmb3JlLCAuZG90LWZsYXNoaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1mbGFzaGluZzo6YmVmb3JlIHtcXG4gIGxlZnQ6IC05OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcXG59XFxuLmRvdC1mbGFzaGluZzo6YWZ0ZXIge1xcbiAgbGVmdDogOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMXM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxhc2hpbmcge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlLCAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg2NSwgODgsIDk1LCAwLjIpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1mbGFzaGluZyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICB9XFxuICA1MCUsIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDY1LCA4OCwgOTUsIDAuMik7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgQ29sbGlzaW9uXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtY29sbGlzaW9uIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1jb2xsaXNpb246OmJlZm9yZSwgLmRvdC1jb2xsaXNpb246OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWNvbGxpc2lvbjo6YmVmb3JlIHtcXG4gIGxlZnQ6IC01NXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1jb2xsaXNpb24tYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1jb2xsaXNpb246OmFmdGVyIHtcXG4gIGxlZnQ6IDU1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1hZnRlciAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1jb2xsaXNpb24tYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAxcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAxcztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYmVmb3JlIHtcXG4gIDAlLCA1MCUsIDc1JSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtOTlweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1iZWZvcmUge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC05OXB4KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYWZ0ZXIge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDk5cHgpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYWZ0ZXIge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDk5cHgpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFJldm9sdXRpb25cXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1yZXZvbHV0aW9uIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1yZXZvbHV0aW9uOjpiZWZvcmUsIC5kb3QtcmV2b2x1dGlvbjo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5kb3QtcmV2b2x1dGlvbjo6YmVmb3JlIHtcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IC05OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMjcuNXB4IDEyNi41cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMS40cyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMS40cyBsaW5lYXIgaW5maW5pdGU7XFxufVxcbi5kb3QtcmV2b2x1dGlvbjo6YWZ0ZXIge1xcbiAgbGVmdDogMDtcXG4gIHRvcDogLTE5OHB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMjcuNXB4IDIyNS41cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1yZXZvbHV0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1yZXZvbHV0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1yZXZvbHV0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IENhcm91c2VsXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtY2Fyb3VzZWwge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1jYXJvdXNlbCAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtY2Fyb3VzZWwgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtY2Fyb3VzZWwge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZiwgOTk5OXB4IDAgMCAxcHggIzQxNTg1ZiwgMTAwOThweCAwIDAgLTFweCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTFweCAjNDE1ODVmLCA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZiwgOTk5OXB4IDAgMCAxcHggIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1jYXJvdXNlbCB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMXB4ICM0MTU4NWYsIDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZiwgOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgVHlwaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtdHlwaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtdHlwaW5nIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC10eXBpbmcgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtdHlwaW5nIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC0xMHB4IDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAtMTBweCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAtMTBweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtdHlwaW5nIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC0xMHB4IDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAtMTBweCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAtMTBweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBXaW5kbWlsbFxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXdpbmRtaWxsIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRvcDogLTEwcHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiA1cHggMTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtd2luZG1pbGwgMnMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC13aW5kbWlsbCAycyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcbi5kb3Qtd2luZG1pbGw6OmJlZm9yZSwgLmRvdC13aW5kbWlsbDo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5kb3Qtd2luZG1pbGw6OmJlZm9yZSB7XFxuICBsZWZ0OiAtOC42NjI1NHB4O1xcbiAgdG9wOiAxNXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LXdpbmRtaWxsOjphZnRlciB7XFxuICBsZWZ0OiA4LjY2MjU0cHg7XFxuICB0b3A6IDE1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtd2luZG1pbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDcyMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXdpbmRtaWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWig3MjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEJyaWNrc1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWJyaWNrcyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0b3A6IDMwLjVweDtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWJyaWNrcyAycyBpbmZpbml0ZSBlYXNlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1icmlja3MgMnMgaW5maW5pdGUgZWFzZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1icmlja3Mge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA0MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTguMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjYlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDkxLjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtYnJpY2tzIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgOC4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNDEuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDU4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY2JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA5MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRmxvYXRpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1mbG9hdGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsb2F0aW5nIDNzIGluZmluaXRlIGN1YmljLWJlemllcigwLjE1LCAwLjYsIDAuOSwgMC4xKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmcgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMTUsIDAuNiwgMC45LCAwLjEpO1xcbn1cXG4uZG90LWZsb2F0aW5nOjpiZWZvcmUsIC5kb3QtZmxvYXRpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWZsb2F0aW5nOjpiZWZvcmUge1xcbiAgbGVmdDogLTEycHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsb2F0aW5nLWJlZm9yZSAzcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYmVmb3JlIDNzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbn1cXG4uZG90LWZsb2F0aW5nOjphZnRlciB7XFxuICBsZWZ0OiAtMjRweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYWZ0ZXIgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMSwgMSk7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsb2F0aW5nLWFmdGVyIDNzIGluZmluaXRlIGN1YmljLWJlemllcigwLjQsIDAsIDEsIDEpO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYygtNTAlIC0gMjcuNXB4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgMTI3LjVweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZmxvYXRpbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKC01MCUgLSAyNy41cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDEyNy41cHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTEycHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZmxvYXRpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBsZWZ0OiAtMTJweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTI0cHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1mbG9hdGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGxlZnQ6IC0yNHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBGaXJlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZmlyZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTAuODVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjg1cztcXG59XFxuLmRvdC1maXJlOjpiZWZvcmUsIC5kb3QtZmlyZTo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3QtZmlyZTo6YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAxNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC0xLjg1cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMS44NXM7XFxufVxcbi5kb3QtZmlyZTo6YWZ0ZXIge1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTIuODVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0yLjg1cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1maXJlIHtcXG4gIDElIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTM3LjEyNXB4IDAgMnB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC0xNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1maXJlIHtcXG4gIDElIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTM3LjEyNXB4IDAgMnB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC0xNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFNwaW5cXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1zcGluIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zcGluIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zcGluIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXNwaW4ge1xcbiAgMCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAxMi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDM3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgNjIuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA3NSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA4Ny41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtc3BpbiB7XFxuICAwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDEyLjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMzcuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA2Mi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDg3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZhbGxpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1mYWxsaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmFsbGluZyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZhbGxpbmcgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuMXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC4xcztcXG59XFxuLmRvdC1mYWxsaW5nOjpiZWZvcmUsIC5kb3QtZmFsbGluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtZmFsbGluZzo6YmVmb3JlIHtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmFsbGluZy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mYWxsaW5nLWJlZm9yZSAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMHM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMHM7XFxufVxcbi5kb3QtZmFsbGluZzo6YWZ0ZXIge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mYWxsaW5nLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmFsbGluZy1hZnRlciAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4ycztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZhbGxpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmFsbGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCA5OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZhbGxpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgU3RyZXRjaGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXN0cmV0Y2hpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZyAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zdHJldGNoaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3Qtc3RyZXRjaGluZzo6YmVmb3JlLCAuZG90LXN0cmV0Y2hpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LXN0cmV0Y2hpbmc6OmJlZm9yZSB7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3Qtc3RyZXRjaGluZzo6YWZ0ZXIge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zdHJldGNoaW5nLWFmdGVyIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgsIDAuOCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC44LCAwLjgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0yMHB4KSBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDIwcHgpIHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBHb29leSBFZmZlY3RcXG4gKiBEb3QgR2F0aGVyaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZ2F0aGVyaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3QtZ2F0aGVyaW5nOjpiZWZvcmUsIC5kb3QtZ2F0aGVyaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IC01MHB4O1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgb3BhY2l0eTogMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1nYXRoZXJpbmcgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZ2F0aGVyaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3QtZ2F0aGVyaW5nOjphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC41cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWdhdGhlcmluZyB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDM1JSwgNjAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDUwcHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMDBweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWdhdGhlcmluZyB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDM1JSwgNjAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDUwcHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMDBweCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBIb3VyZ2xhc3NcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1ob3VyZ2xhc3Mge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAtOTlweDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAyNy41cHggMTI2LjVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzIDIuNHMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWhvdXJnbGFzcyAyLjRzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC42cztcXG59XFxuLmRvdC1ob3VyZ2xhc3M6OmJlZm9yZSwgLmRvdC1ob3VyZ2xhc3M6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LWhvdXJnbGFzczo6YmVmb3JlIHtcXG4gIHRvcDogMTk4cHg7XFxufVxcbi5kb3QtaG91cmdsYXNzOjphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWhvdXJnbGFzcy1hZnRlciAyLjRzIGluZmluaXRlIGN1YmljLWJlemllcigwLjY1LCAwLjA1LCAwLjM2LCAxKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzLWFmdGVyIDIuNHMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNjUsIDAuMDUsIDAuMzYsIDEpO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWhvdXJnbGFzcyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigxODBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtaG91cmdsYXNzIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTgwZGVnKTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWhvdXJnbGFzcy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTk4cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtaG91cmdsYXNzLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE5OHB4KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBHb29leSBFZmZlY3RcXG4gKiBEb3QgT3ZlcnRha2luZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LW92ZXJ0YWtpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBib3gtc2hhZG93OiAwIC0yMHB4IDAgMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1vdmVydGFraW5nIDJzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1vdmVydGFraW5nIDJzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmJlZm9yZSwgLmRvdC1vdmVydGFraW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBib3gtc2hhZG93OiAwIC0yMHB4IDAgMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4zcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjNzO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAxLjVzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1vdmVydGFraW5nIDEuNXMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC42cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjZzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LW92ZXJ0YWtpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LW92ZXJ0YWtpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBTaHV0dGxlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtc2h1dHRsZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTlweDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YmVmb3JlLCAuZG90LXNodXR0bGU6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YmVmb3JlIHtcXG4gIGxlZnQ6IDk5cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXNodXR0bGUgMnMgaW5maW5pdGUgZWFzZS1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXNodXR0bGUgMnMgaW5maW5pdGUgZWFzZS1vdXQ7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YWZ0ZXIge1xcbiAgbGVmdDogMTk4cHg7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc2h1dHRsZSB7XFxuICAwJSwgNTAlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yOTdweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjk3cHgpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1zaHV0dGxlIHtcXG4gIDAlLCA1MCUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI5N3B4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyOTdweCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEVtb2ppXFxuICogRG90IEJvdW5jaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtYm91bmNpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgZm9udC1zaXplOiAxMHB4O1xcbn1cXG4uZG90LWJvdW5jaW5nOjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIuKavfCfj4Dwn4+QXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtYm91bmNpbmcgMXMgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWJvdW5jaW5nIDFzIGluZmluaXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWJvdW5jaW5nIHtcXG4gIDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gICAgLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLWluO1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICB9XFxuICAzNCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMzUlIHtcXG4gICAgdG9wOiAyMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuNSwgMC41KTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA5MCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWJvdW5jaW5nIHtcXG4gIDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gICAgLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLWluO1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICB9XFxuICAzNCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMzUlIHtcXG4gICAgdG9wOiAyMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuNSwgMC41KTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA5MCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEVtb2ppXFxuICogRG90IFJvbGxpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1yb2xsaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogNTVweDtcXG4gIGZvbnQtc2l6ZTogMTBweDtcXG59XFxuLmRvdC1yb2xsaW5nOjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1yb2xsaW5nIDNzIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1yb2xsaW5nIDNzIGluZmluaXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXJvbGxpbmcge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAzNC4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA2Ny42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1yb2xsaW5nIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMzQuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgNjcuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG59LyojIHNvdXJjZU1hcHBpbmdVUkw9ZG90cy5jc3MubWFwICovXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vY3NzL2RvdHMuY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWVsYXN0aWMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX21peGlucy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fdmFyaWFibGVzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtcHVsc2Uuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1mbGFzaGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWNvbGxpc2lvbi5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXJldm9sdXRpb24uc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1jYXJvdXNlbC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXR5cGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXdpbmRtaWxsLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtYnJpY2tzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZmxvYXRpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1maXJlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtc3Bpbi5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWZhbGxpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1zdHJldGNoaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZ2F0aGVyaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtaG91cmdsYXNzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtb3ZlcnRha2luZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXNodXR0bGUuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1ib3VuY2luZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXJvbGxpbmcuc2Nzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSxnQkFBZ0I7QUNBaEI7Ozs7RUFBQTtBQU1BO0VBQ0Usa0JBQUE7RUNJQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VGR1YsaURBQUE7VUFBQSx5Q0FBQTtBREdGO0FDREU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QURFSjtBQ0NFO0VBQ0UsV0FBQTtFQ1hGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUZrQlIsd0RBQUE7VUFBQSxnREFBQTtBREdKO0FDQUU7RUFDRSxVRWpCVTtFREZaLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9W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WkYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRW1CUixxREFBQTtVQUFBLDZDQUFBO0VBQ0EsMkJBQUE7VUFBQSxtQkFBQTtBTHFLSjtBS2xLRTtFQUNFLFVGbkJVO0VERlosV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRTRCUixxREFBQTtVQUFBLDZDQUFBO0VBQ0EsMkJBQUE7VUFBQSxtQkFBQTtBTHNLSjs7QUtsS0E7RUFDRTtJQUNFLHlCQUFBO0VMcUtGO0VLbEtBO0lBRUUsdUNBQUE7RUxtS0Y7QUFDRjs7QUszS0E7RUFDRTtJQUNFLHlCQUFBO0VMcUtGO0VLbEtBO0lBRUUsdUNBQUE7RUxtS0Y7QUFDRjtBTXBOQTs7OztFQUFBO0FBTUE7RUFDRSxrQkFBQTtFSklBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUh5Tlo7QU10TkU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QU51Tko7QU1wTkU7RUFDRSxXQUFBO0VKVEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFR2dCUiwyREFBQTtVQUFBLG1EQUFBO0FOd05KO0FNck5FO0VBQ0UsVUh4QlE7RURPVixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VHd0JSLDBEQUFBO1VBQUEsa0RBQUE7RUFDQSwyQkFBQTtVQUFBLG1CQUFBO0FOeU5KOztBTXJOQTtFQUNFO0lBSUUsd0JBQUE7RU5xTkY7RU1sTkE7SUFDRSw0QkFBQTtFTm9ORjtBQUNGOztBTTlOQTtFQUNFO0lBSUUsd0JBQUE7RU5xTkY7RU1sTkE7SUFDRSw0QkFBQTtFTm9ORjtBQUNGO0FNak5BO0VBQ0U7SUFJRSx3QkFBQTtFTmdORjtFTTdNQTtJQUNFLDJCQUFBO0VOK01GO0FBQ0Y7QU16TkE7RUFDRTtJQUlFLHdCQUFBO0VOZ05GO0VNN01BO0lBQ0UsMkJBQUE7RU4rTUY7QUFDRjtBTzNRQTs7OztFQUFBO0FBTUE7RUFDRSxrQkFBQTtFTElBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUhnUlo7QU83UUU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtBUDhRSjtBTzNRRTtFQUNFLE9BQUE7RUFDQSxVQUFBO0VMVEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFSWdCUixnQ0FBQTtFQUNBLHNEQUFBO1VBQUEsOENBQUE7QVArUUo7QU81UUU7RUFDRSxPQUFBO0VBQ0EsV0FBQTtFTG5CRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VJMEJSLGdDQUFBO0VBQ0Esb0RBQUE7VUFBQSw0Q0FBQTtBUGdSSjs7QU81UUE7RUFDRTtJQUNFLDZDQUFBO0VQK1FGO0VPNVFBO0lBQ0UsK0NBQUE7RVA4UUY7QUFDRjs7QU9yUkE7RUFDRTtJQUNFLDZDQUFBO0VQK1FGO0VPNVFBO0lBQ0UsK0NBQUE7RVA4UUY7QUFDRjtBUTVUQTs7OztFQUFBO0FBV0E7RUFDRSxrQkFBQTtFQUNBLGFBUFM7RU5LVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VLU1YsNkVBQ0U7RUFHRixvREFBQTtVQUFBLDRDQUFBO0FSdVRGOztBUXBUQTtFQUNFO0lBQ0UscUZBQ0U7RVJzVEo7RVFqVEE7SUFDRSxxRkFDRTtFUmtUSjtFUTdTQTtJQUNFLHFGQUNFO0VSOFNKO0FBQ0Y7O0FRaFVBO0VBQ0U7SUFDRSxxRkFDRTtFUnNUSjtFUWpUQTtJQUNFLHFGQUNFO0VSa1RKO0VRN1NBO0lBQ0UscUZBQ0U7RVI4U0o7QUFDRjtBU3hWQTs7OztFQUFBO0FBV0E7RUFDRSxrQkFBQTtFQUNBLGFBUFM7RVBLVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VNU1YsNkVBQ0U7RUFHRixrREFBQTtVQUFBLDBDQUFBO0FUbVZGOztBU2hWQTtFQUNFO0lBQ0UsNkVBQ0U7RVRrVko7RVM3VUE7SUFDRSxpRkFDRTtFVDhVSjtFU3pVQTtJQUNFLDZFQUNFO0VUMFVKO0VTclVBO0lBQ0UsaUZBQ0U7RVRzVUo7RVNqVUE7SUFDRSw2RUFDRTtFVGtVSjtFUzdUQTtJQUNFLGlGQUNFO0VUOFRKO0VTelRBO0lBQ0UsNkVBQ0U7RVQwVEo7QUFDRjs7QVN4V0E7RUFDRTtJQUNFLDZFQUNFO0VUa1ZKO0VTN1VBO0lBQ0UsaUZBQ0U7RVQ4VUo7RVN6VUE7SUFDRSw2RUFDRTtFVDBVSjtFU3JVQTtJQUNFLGlGQUNFO0VUc1VKO0VTalVBO0lBQ0UsNkVBQ0U7RVRrVUo7RVM3VEE7SUFDRSxpRkFDRTtFVDhUSjtFU3pUQTtJQUNFLDZFQUNFO0VUMFRKO0FBQ0Y7QVVoWUE7Ozs7RUFBQTtBQVVBO0VBQ0Usa0JBQUE7RUFDQSxVQUFBO0VSREEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFT1FWLDBCQUFBO0VBQ0Esa0RBQUE7VUFBQSwwQ0FBQTtBVitYRjtBVTdYRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0FWOFhKO0FVM1hFO0VBQ0UsZ0JBQUE7RUFDQSxTQUFBO0VSakJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUhzWlo7QVU3WEU7RUFDRSxlQUFBO0VBQ0EsU0FBQTtFUnhCRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0FIK1paOztBVTlYQTtFQUNFO0lBQ0UsNkNBQUE7RVZpWUY7RVU5WEE7SUFDRSwrQ0FBQTtFVmdZRjtBQUNGOztBVXZZQTtFQUNFO0lBQ0UsNkNBQUE7RVZpWUY7RVU5WEE7SUFDRSwrQ0FBQTtFVmdZRjtBQUNGO0FXaGJBOzs7O0VBQUE7QUFjQTtFQUNFLGtCQUFBO0VBQ0EsV0FUUTtFQVVSLGFBVFM7RVRHVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VRYVYsdUZBQ0U7RUFHRiw4Q0FBQTtVQUFBLHNDQUFBO0FYd2FGOztBV3JhQTtFQUNFO0lBQ0UsdUZBQ0U7RVh1YUo7RVdsYUE7SUFDRSx3RkFDRTtFWG1hSjtFVzlaQTtJQUNFLDRGQUNFO0VYK1pKO0VXMVpBO0lBQ0UsMkZBQ0U7RVgyWko7RVd0WkE7SUFDRSx1RkFDRTtFWHVaSjtFV2xaQTtJQUNFLHdGQUNFO0VYbVpKO0VXOVlBO0lBQ0UsNEZBQ0U7RVgrWUo7RVcxWUE7SUFDRSwyRkFDRTtFWDJZSjtFV3RZQTtJQUNFLHVGQUNFO0VYdVlKO0VXbFlBO0lBQ0Usd0ZBQ0U7RVhtWUo7RVc5WEE7SUFDRSw0RkFDRTtFWCtYSjtFVzFYQTtJQUNFLDJGQUNFO0VYMlhKO0VXdFhBO0lBQ0UsdUZBQ0U7RVh1WEo7QUFDRjs7QVcvY0E7RUFDRTtJQUNFLHVGQUNFO0VYdWFKO0VXbGFBO0lBQ0Usd0ZBQ0U7RVhtYUo7RVc5WkE7SUFDRSw0RkFDRTtFWCtaSjtFVzFaQTtJQUNFLDJGQUNFO0VYMlpKO0VXdFpBO0lBQ0UsdUZBQ0U7RVh1Wko7RVdsWkE7SUFDRSx3RkFDRTtFWG1aSjtFVzlZQTtJQUNFLDRGQUNFO0VYK1lKO0VXMVlBO0lBQ0UsMkZBQ0U7RVgyWUo7RVd0WUE7SUFDRSx1RkFDRTtFWHVZSjtFV2xZQTtJQUNFLHdGQUNFO0VYbVlKO0VXOVhBO0lBQ0UsNEZBQ0U7RVgrWEo7RVcxWEE7SUFDRSwyRkFDRTtFWDJYSjtFV3RYQTtJQUNFLHVGQUNFO0VYdVhKO0FBQ0Y7QVkzZUE7Ozs7RUFBQTtBQVNBO0VBQ0Usa0JBQUE7RVZDQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VTTVYsNkVBQUE7VUFBQSxxRUFBQTtBWjJlRjtBWXplRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBWjBlSjtBWXZlRTtFQUNFLFdBQUE7RVZkRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BX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Q0U7SUFDRSxpREFBQTtFZjhuQkY7RWUzbkJBO0lBR0UsaUNBQUE7RWYybkJGO0VleG5CQTtJQUNFLGdEQUFBO0VmMG5CRjtBQUNGO0FnQmh1QkE7Ozs7RUFBQTtBQVNBO0VBQ0Usa0JBQUE7RWRDQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VhTVYsNEJBQUE7RUFDQSxxREFBQTtVQUFBLDZDQUFBO0FoQmd1QkY7QWdCOXRCRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBaEIrdEJKO0FnQjV0QkU7RWRkQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0Vhb0JSLDREQUFBO1VBQUEsb0RBQUE7QWhCaXVCSjtBZ0I5dEJFO0VkcEJBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RWEwQlIsMkRBQUE7VUFBQSxtREFBQTtBaEJtdUJKOztBZ0IvdEJBO0VBQ0U7SUFDRSw0QkFBQTtFaEJrdUJGO0VnQi90QkE7SUFFRSwwQkFBQTtFaEJndUJGO0VnQjd0QkE7SUFDRSw0QkFBQTtFaEIrdEJGO0FBQ0Y7O0FnQjN1QkE7RUFDRTtJQUNFLDRCQUFBO0VoQmt1QkY7RWdCL3RCQTtJQUVFLDBCQUFBO0VoQmd1QkY7RWdCN3RCQTtJQUNFLDRCQUFBO0VoQit0QkY7QUFDRjtBZ0I1dEJBO0VBQ0U7SUFDRSx1Q0FBQTtFaEI4dEJGO0VnQjN0QkE7SUFFRSx1Q0FBQTtFaEI0dEJGO0VnQnp0QkE7SUFDRSx1Q0FBQTtFaEIydEJGO0FBQ0Y7QWdCdnVCQTtFQUNFO0lBQ0UsdUNBQUE7RWhCOHRCRjtFZ0IzdEJBO0lBRUUsdUNBQUE7RWhCNHRCRjtFZ0J6dEJBO0lBQ0UsdUNBQUE7RWhCMnRCRjtBQUNGO0FnQnh0QkE7RUFDRTtJQUNFLHVDQUFBO0VoQjB0QkY7RWdCdnRCQTtJQUVFLHNDQUFBO0VoQnd0QkY7RWdCcnRCQTtJQUNFLHVDQUFBO0VoQnV0QkY7QUFDRjtB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RXNCcmlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJ1aUNGO0VzQnBpQ0E7SUFDRSxhQUFBO0lBQ0EsMkNBQUE7RXRCc2lDRjtFc0JuaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0QnFpQ0Y7RXNCbGlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJvaUNGO0VzQmppQ0E7SUFDRSxhQUFBO0lBQ0EsMkNBQUE7RXRCbWlDRjtFc0JoaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0QmtpQ0Y7QUFDRjs7QXNCOWtDQTtFQUNFO0lBQ0UsWUFBQTtJQUNBLDBDQUFBO0V0QjBpQ0Y7RXNCdmlDQTtJQUNFLFlBQUE7SUFDQSwyQ0FBQTtFdEJ5aUNGO0VzQnRpQ0E7SUFDRSxZQUFBO0lBQ0EsMENBQUE7RXRCd2lDRjtFc0JyaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0QnVpQ0Y7RXNCcGlDQTtJQUNFLGFBQUE7SUFDQSwyQ0FBQTtFdEJzaUNGO0VzQm5pQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCcWlDRjtFc0JsaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0Qm9pQ0Y7RXNCamlDQTtJQUNFLGFBQUE7SUFDQSwyQ0FBQTtFdEJtaUNGO0VzQmhpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCa2lDRjtBQUNGLENBQUEsbUNBQUFcIixcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBjaGFyc2V0IFxcXCJVVEYtOFxcXCI7XFxuaHRtbCB7XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBtYXJnaW46IDA7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiA3NjdweCkge1xcbiAgaHRtbCB7XFxuICAgIGZvbnQtc2l6ZTogMS43dmg7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIGh0bWwge1xcbiAgICBmb250LXNpemU6IDEuODV2aDtcXG4gIH1cXG59XFxuaHRtbC5mcmVlemUge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuYm9keSB7XFxuICBtYXJnaW46IDA7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG5cXG5oMSB7XFxuICBtYXJnaW46IDA7XFxuICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgZm9udC1zaXplOiA0cmVtO1xcbn1cXG5cXG5oMiB7XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuaDMge1xcbiAgZm9udC1zaXplOiAyLjNyZW07XFxuICBtYXJnaW46IDA7XFxufVxcblxcbmEge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6IGluaGVyaXQ7XFxufVxcblxcbmEge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG5hLmhpZGRlbiwgYS5zZWxlY3RlZFBhZ2Uge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcblxcbmEuaGlkZGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxufVxcblxcbmEuc2VsZWN0ZWRQYWdlIHtcXG4gIGNvbG9yOiAjZThhYTc3O1xcbiAgZmlsdGVyOiBzYXR1cmF0ZSgxMjAlKTtcXG59XFxuXFxuKi5oaWRkZW4ge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG5cXG5kaXYsIGJ1dHRvbiB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG5idXR0b24ge1xcbiAgYm9yZGVyOiBub25lO1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcblxcbmxpIHtcXG4gIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcXG59XFxuXFxuI292ZXJhbGxDb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAwO1xcbn1cXG4jb3ZlcmFsbENvbnRhaW5lci5mYWRlZCB7XFxuICBmaWx0ZXI6IG9wYWNpdHkoNDAlKTtcXG59XFxuXFxuLmNvbnRlbnRDb250YWluZXIge1xcbiAgaGVpZ2h0OiBpbml0aWFsO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBtYXJnaW46IDQlIDA7XFxuICBtYXJnaW4tYm90dG9tOiA1JTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRDb250YWluZXIgPiBkaXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgcGFkZGluZy10b3A6IDUuNXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDc2N3B4KSB7XFxuICAuY29udGVudENvbnRhaW5lciA+IGRpdiB7XFxuICAgIHdpZHRoOiA5NSU7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Q29udGFpbmVyID4gZGl2IHtcXG4gICAgd2lkdGg6IDg1JTtcXG4gIH1cXG59XFxuLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkIC50ZXh0Qm94IC5jb250ZW50LXBhZ2VzIHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkIC50ZXh0Qm94IC5jb250ZW50LXBhZ2VzIGEge1xcbiAgZm9udC1zaXplOiAxLjc1cmVtO1xcbn1cXG5cXG4udGl0bGVBbmRUZXh0Qm94LCAuY29udGVudEJveCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbi50aXRsZUFuZFRleHRCb3gge1xcbiAgbWFyZ2luLXJpZ2h0OiA1JTtcXG59XFxuXFxuLnRpdGxlQm94LCAudGV4dEJveCB7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHdpZHRoOiAxNnJlbTtcXG59XFxuXFxuLnRpdGxlQm94IHtcXG4gIHBhZGRpbmc6IDEwJTtcXG59XFxuLnRpdGxlQm94ID4gKiB7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4udGl0bGVCb3ggPiA6bnRoLWNoaWxkKDIpIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcbi50aXRsZUJveCA+IDpudGgtY2hpbGQoMikgaDIge1xcbiAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICBwYWRkaW5nLWJvdHRvbTogMTUlO1xcbn1cXG5cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzLCAuY29udGVudEJveC5tZW1iZXJzIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICByb3ctZ2FwOiAwLjM1cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogNzY3cHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAzMy4zJSk7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg0LCAyNSUpO1xcbiAgfVxcbn1cXG5cXG4uY29udGVudEJveCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiB7XFxuICB3aWR0aDogMTRyZW07XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyB7XFxuICBib3gtc2l6aW5nOiBpbml0aWFsO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwLCAyMCwgMjAsIDAuNyk7XFxuICBwYWRkaW5nOiAwLjJyZW0gMC4ycmVtO1xcbiAgbWFyZ2luLXRvcDogNy42cmVtO1xcbiAgYm9yZGVyLXJhZGl1czogMzAlO1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5pbnRlcmFjdGlvbi1wcm9tcHQgLmNsaWNrLXByb21wdCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuY2xpY2stcHJvbXB0IHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuaG92ZXItcHJvbXB0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5ob3Zlci1wcm9tcHQge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuaG92ZXItcHJvbXB0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5ob3Zlci1wcm9tcHQge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3Mge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICB3aWR0aDogMTAwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICosIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqIHtcXG4gIGNvbG9yOiByZ2IoMjM4LCAyMzEsIDIxMCk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIG1hcmdpbi10b3A6IDAuN3JlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICosIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqIHtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICB9XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMge1xcbiAgZm9udC1zaXplOiAycmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAuY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLmZhLXNlYXJjaC1wbHVzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLmZhLXNlYXJjaC1wbHVzIHtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICB9XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqOmhvdmVyLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgKjpob3ZlciB7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDExMCUpO1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDEyMCUpO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgaSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIGkge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NfX3Zpc2libGUsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NfX3Zpc2libGUge1xcbiAgZGlzcGxheTogZmxleDtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IHAsIC5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIGRpdiBhLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgcCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IGEge1xcbiAgbWFyZ2luOiAyJTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5LXRleHQge1xcbiAgbWFyZ2luLXRvcDogLTAuM3JlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBnYXA6IDAuMnJlbTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0IHAsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCBwIHtcXG4gIG1hcmdpbjogMDtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0IHA6bnRoLW9mLXR5cGUoMiksIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCBwOm50aC1vZi10eXBlKDIpIHtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcbi5jb250ZW50Qm94IC5uZXdzIHtcXG4gIG1hcmdpbjogMCAxJTtcXG4gIHBhZGRpbmctdG9wOiA1JTtcXG4gIGhlaWdodDogYXV0bztcXG59XFxuLmNvbnRlbnRCb3ggLm5ld3MgaWZyYW1lIHtcXG4gIHdpZHRoOiAzMDBweDtcXG4gIGhlaWdodDogMjAwcHg7XFxufVxcblxcbiNmb290ZXJDb250YWluZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzOSwgMzksIDM5LCAwLjYpO1xcbiAgbWFyZ2luOiAwO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJvdHRvbTogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcXG4gIHBhZGRpbmctcmlnaHQ6IDJyZW07XFxuICBjb2xvcjogaXZvcnk7XFxufVxcbiNmb290ZXJDb250YWluZXIgcCB7XFxuICBtYXJnaW46IDFyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNmb290ZXJDb250YWluZXIgcCB7XFxuICAgIG1hcmdpbjogMC42NXJlbTtcXG4gIH1cXG59XFxuXFxuI29wZW5pbmdDb250YWluZXIge1xcbiAgaGVpZ2h0OiA5OS41dmg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBjb2xvcjogcmdiKDE4OSwgMTg5LCAxODkpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoMSB7XFxuICBmb250LXNpemU6IDUuMnJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaDEge1xcbiAgICBmb250LXNpemU6IDYuNXJlbTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgcCB7XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNvcGVuaW5nQ29udGFpbmVyIHAge1xcbiAgICBmb250LXNpemU6IDIuN3JlbTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIgZGl2IHtcXG4gIHRleHQtc2hhZG93OiAxcHggMXB4IGJsYWNrO1xcbiAgd2lkdGg6IDgwJTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIgZGl2IHtcXG4gICAgd2lkdGg6IDcwJTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLWF1dG8tZmxvdzogcm93O1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiA0JSAyNSUgMWZyO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg3MCwgNjIsIDU1LCAwLjg1KTtcXG4gIGJveC1zaGFkb3c6IDAuMnJlbSAwLjJyZW0gMXJlbSAwLjRyZW0gaW5zZXQgcmdiYSg0OSwgNDMsIDM5LCAwLjc1KTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiA1cmVtO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiAwO1xcbiAgei1pbmRleDogOTk5OTtcXG4gIGNvbG9yOiByZ2IoMTk5LCAxODcsIDE1Nik7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlci5oaWRkZW4ge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIGJ1dHRvbiB7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIHdpZHRoOiAxMHJlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIGJ1dHRvbiBpIHtcXG4gIGRpc3BsYXk6IGlubGluZTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyICNsb2dvLXN5bWJvbCwgI29wZW5pbmdDb250YWluZXIgaGVhZGVyICNsb2dvLXRleHQge1xcbiAgaGVpZ2h0OiA0cmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tc3ltYm9sIHtcXG4gIG1hcmdpbi10b3A6IDAuM3JlbTtcXG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tdGV4dCB7XFxuICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICBwYWRkaW5nLWxlZnQ6IDAuMnJlbTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIGltZyB7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBwLCAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHtcXG4gIG1hcmdpbjogMDtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB7XFxuICBtYXJnaW4tcmlnaHQ6IDJyZW07XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwge1xcbiAgbWFyZ2luOiAwO1xcbiAgcGFkZGluZzogMDtcXG4gIGhlaWdodDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBnYXA6IDEuNXJlbTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCBsaSBhIHtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgdGV4dC1zaGFkb3c6IDFweCAxcHggYmxhY2s7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICNwYWdlSW1hZ2Uge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICNwYWdlSW1hZ2UgaW1nIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZmlsdGVyOiBibHVyKDAuNnJlbSkgZ3JheXNjYWxlKDUwJSk7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBtYXJnaW4tdG9wOiAxJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciB7XFxuICAgIG1hcmdpbi10b3A6IDIlO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciBpbWcge1xcbiAgaGVpZ2h0OiA2cmVtO1xcbn1cXG5cXG4udGl0bGVCb3gge1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcbi50aXRsZUJveCBwIHtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbn1cXG5cXG4udGV4dEJveCB7XFxuICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcXG59XFxuLnRleHRCb3ggcCB7XFxuICBmb250LXNpemU6IDEuM3JlbTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuI3Byb3BlcnRpZXNDb250YWluZXIgPiBkaXYgLnRpdGxlQm94LCAjbWVtYmVyc0NvbnRhaW5lciA+IGRpdiAudGl0bGVCb3gge1xcbiAgYm9yZGVyOiAwLjM1cmVtIHNvbGlkIHJnYigxOTksIDE4NywgMTU2KTtcXG59XFxuI3Byb3BlcnRpZXNDb250YWluZXIgaW1nLCAjbWVtYmVyc0NvbnRhaW5lciBpbWcge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbn1cXG4jcHJvcGVydGllc0NvbnRhaW5lciBpbWcucGFnZUxpbmtzX192aXNpYmxlLCAjbWVtYmVyc0NvbnRhaW5lciBpbWcucGFnZUxpbmtzX192aXNpYmxlIHtcXG4gIGZpbHRlcjogYnJpZ2h0bmVzcygyNyUpO1xcbn1cXG5cXG4jYWxsTmV3c0NvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDUxcmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsTmV3c0NvbnRhaW5lciB7XFxuICAgIGhlaWdodDogNTJyZW07XFxuICB9XFxufVxcblxcbiNjb250YWN0Q29udGFpbmVyIHtcXG4gIGhlaWdodDogNTVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNjb250YWN0Q29udGFpbmVyIHtcXG4gICAgaGVpZ2h0OiA1MnJlbTtcXG4gIH1cXG59XFxuXFxuI2FsbE5ld3NDb250YWluZXIsICNjb250YWN0Q29udGFpbmVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzMSwgMjcsIDIxKTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgPiBkaXYgLnRpdGxlQm94LCAjY29udGFjdENvbnRhaW5lciA+IGRpdiAudGl0bGVCb3gge1xcbiAgYm9yZGVyOiA0cHggc29saWQgcmdiKDIyMSwgMjIxLCAyMjEpO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciA+IGRpdiAudGV4dEJveCBwLCAjY29udGFjdENvbnRhaW5lciA+IGRpdiAudGV4dEJveCBwIHtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZm9udC1zaXplOiAxLjFyZW07XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94ID4gZGl2LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiB7XFxuICBmbGV4LWJhc2lzOiA1MCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94ID4gZGl2ID4gZGl2LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiA+IGRpdiB7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIGhlaWdodDogOTIlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAuZm9ybS1tZXNzYWdlLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAuZm9ybS1tZXNzYWdlIHtcXG4gIGhlaWdodDogYXV0bztcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggaDMsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGgzIHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGhlaWdodDogOCU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IHVsLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB1bCB7XFxuICBwYWRkaW5nOiAwO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCB1bCBsaSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggdWwgbGkge1xcbiAgZGlzcGxheTogaW5saW5lO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cywgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3Mge1xcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyMzMsIDIzMywgMjMzLCAwLjMpO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3czo6YWZ0ZXIsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiIFxcXCI7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIGhlaWdodDogMXJlbTtcXG4gIGNsZWFyOiBib3RoO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBpbWcsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIGltZyB7XFxuICB3aWR0aDogMTNyZW07XFxuICBmbG9hdDogbGVmdDtcXG4gIG1hcmdpbi1yaWdodDogMi41JTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgcCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgcCB7XFxuICBsaW5lLWhlaWdodDogMS4ycmVtO1xcbiAgZm9udC1zaXplOiAxLjI1cmVtO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cywgI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0ge1xcbiAgcGFkZGluZzogMCA1JTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgLW1vei1jb2x1bW4tZ2FwOiAxLjJyZW07XFxuICAgICAgIGNvbHVtbi1nYXA6IDEuMnJlbTtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJjb250YWN0TmFtZSBjb250YWN0RW1haWxcXFwiIFxcXCJjb250YWN0UGhvbmUgY29udGFjdFN1YmplY3RcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJzdWJtaXQgLi4uXFxcIjtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1uYW1lLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LW5hbWUge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0TmFtZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1lbWFpbCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1lbWFpbCB7XFxuICBncmlkLWFyZWE6IGNvbnRhY3RFbWFpbDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1waG9uZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1waG9uZSB7XFxuICBncmlkLWFyZWE6IGNvbnRhY3RQaG9uZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1zdWJqZWN0LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LXN1YmplY3Qge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0U3ViamVjdDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1tZXNzYWdlLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LW1lc3NhZ2Uge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0TWVzc2FnZTtcXG59XFxuXFxuI2NvbnRhY3RDb250YWluZXIge1xcbiAgYmFja2dyb3VuZDogYmxhY2s7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHtcXG4gIC1tb3otY29sdW1uLWdhcDogM3JlbTtcXG4gICAgICAgY29sdW1uLWdhcDogM3JlbTtcXG4gIHdpZHRoOiA4NSU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgcGFkZGluZy1ib3R0b206IDFyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHtcXG4gICAgd2lkdGg6IDcwJTtcXG4gIH1cXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggaW1nIHtcXG4gIGZpbHRlcjogc2F0dXJhdGUoMTIwJSk7XFxuICB3aWR0aDogNDUlO1xcbiAgbWFyZ2luLWxlZnQ6IDJyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGltZyB7XFxuICAgIHdpZHRoOiA1MCU7XFxuICAgIG1hcmdpbi1sZWZ0OiAwO1xcbiAgfVxcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBsYWJlbC5lcnJvciB7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICBjb2xvcjogcmdiKDEyMCwgMTc5LCAxNTgpO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gPiBkaXYge1xcbiAgbWFyZ2luOiA1JSAwO1xcbiAgbWFyZ2luLXRvcDogMDtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBsYWJlbCB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBbdHlwZT1yYWRpb10ge1xcbiAgd2lkdGg6IDEwJTtcXG4gIGRpc3BsYXk6IGluaXRpYWw7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gdWwge1xcbiAgcGFkZGluZzogMDtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBpbnB1dCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBzZWxlY3Qge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBtYXJnaW4tdG9wOiAyJTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBpbnB1dCB7XFxuICBoZWlnaHQ6IDEuNXJlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBzZWxlY3Qge1xcbiAgaGVpZ2h0OiAycmVtO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHRleHRhcmVhIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxOHJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB0ZXh0YXJlYSB7XFxuICAgIGhlaWdodDogMjByZW07XFxuICB9XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gYnV0dG9uIHtcXG4gIGdyaWQtYXJlYTogc3VibWl0O1xcbiAgY29sb3I6IGl2b3J5O1xcbiAgZm9udC1zaXplOiAxLjNyZW07XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG5cXG4uZG90LXB1bHNlIHtcXG4gIHRvcDogMjAlO1xcbiAgbGVmdDogMzUlO1xcbn1cXG5cXG4jcG9wLXVwLWRpc3BsYXktYm94IHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNDUsIDQxLCAzNSwgMC44KTtcXG4gIHdpZHRoOiA5NHZ3O1xcbiAgaGVpZ2h0OiA4N3ZoO1xcbiAgb3ZlcmZsb3cteTogYXV0bztcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIHotaW5kZXg6IDExMDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogOHZoO1xcbiAgbGVmdDogM3Z3O1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHJvdy1nYXA6IDFyZW07XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIHBhZGRpbmctdG9wOiAyLjVyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggaW1nIHtcXG4gIHdpZHRoOiAyNnJlbTtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCBhLCAjcG9wLXVwLWRpc3BsYXktYm94IGJ1dHRvbiB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uIHtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uOmhvdmVyLCAjcG9wLXVwLWRpc3BsYXktYm94IGE6aG92ZXIge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDcyJSk7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggI2NvbnRlbnQtaG9sZGVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWV2ZW5seTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA3MCU7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggI2NvbnRlbnQtaG9sZGVyIC5wb3AtdXAtZGlyZWN0aW9uYWwge1xcbiAgZm9udC1zaXplOiAyLjVyZW07XFxufVxcblxcbiNuZXdzLW1lZGlhLWRpc3BsYXkge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg0NCwgNTIsIDc3LCAwLjgpO1xcbiAgaGVpZ2h0OiA4OHZoO1xcbiAgd2lkdGg6IDk0dnc7XFxuICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgei1pbmRleDogMTEwO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA3dmg7XFxuICBsZWZ0OiAzdnc7XFxuICBkaXNwbGF5OiBub25lO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG59XFxuXFxuI3NpbmdsZUNvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDg3JTtcXG4gIG1pbi13aWR0aDogOTYlO1xcbiAgdG9wOiA4LjMlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtd3JhcDogd3JhcDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDE7XFxuICBwYWRkaW5nOiAxLjVyZW0gMXJlbTtcXG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzNywgMzUsIDM0LCAwLjkpO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjc2luZ2xlQ29udGFpbmVyIHtcXG4gICAgbWluLXdpZHRoOiA2MCU7XFxuICB9XFxufVxcbiNzaW5nbGVDb250YWluZXIgaDQge1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgaDMsICNzaW5nbGVDb250YWluZXIgaDQsICNzaW5nbGVDb250YWluZXIgLnJlbGF0ZWQtbGluayB7XFxuICBjb2xvcjogcmdiKDI0MSwgMjE4LCAxODkpO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB7XFxuICB3aWR0aDogMjF2dztcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgaW1nIHtcXG4gIGhlaWdodDogNDIlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB1bCB7XFxuICBwYWRkaW5nLWxlZnQ6IDIwJTtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG4gIG1hcmdpbi10b3A6IDFyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHVsIGxpIHtcXG4gIG1hcmdpbi10b3A6IDAuNnJlbTtcXG4gIGxpc3Qtc3R5bGUtdHlwZTogc3F1YXJlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB1bCBsaSBhIHtcXG4gIGZpbHRlcjogYnJpZ2h0bmVzcygxMTUlKTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyB7XFxuICB3aWR0aDogMzB2dztcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLXJvd3M6IDclIDFmcjtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyBwIHtcXG4gIG1hcmdpbi10b3A6IDEuMnJlbTtcXG4gIGZvbnQtc2l6ZTogMS43cmVtO1xcbiAgaGVpZ2h0OiA5OSU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3NpbmdsZUluZm8gZGl2IHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgcGFkZGluZzogMCAxcmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvICNtZWRpYUNvbnRhaW5lciB7XFxuICBoZWlnaHQ6IGF1dG87XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3NpbmdsZUluZm8gI21lZGlhQ29udGFpbmVyIGlmcmFtZSB7XFxuICB3aWR0aDogMjAwcHg7XFxuICBoZWlnaHQ6IDIwMHB4O1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN2aWRBbmRJbWdDb2wge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDE2dnc7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdmlkQW5kSW1nQ29sIGgzIHtcXG4gIGZvbnQtc2l6ZTogMS45cmVtO1xcbiAgbWFyZ2luOiAxcmVtIDA7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIHtcXG4gIHdpZHRoOiAyNnZ3O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBwYWRkaW5nOiAwIDFyZW07XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiAxMCUgMWZyIDQlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCBoMyB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIGgzIGEge1xcbiAgZm9udC1zaXplOiAxLjdyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIGgzIGE6aG92ZXIge1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCAjbmV3cy1yZWNpZXZlciB7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIG1hcmdpbjogMXJlbSAwO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCAjbmV3cy1yZWNpZXZlciBwIHtcXG4gIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgcGFkZGluZy1yaWdodDogMXJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgI3BhZ2luYXRpb24taG9sZGVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvdHRvbTogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcblxcbmJvZHkge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEwMCwgOTIsIDgyKTtcXG59XFxuXFxuLnNlYXJjaC1vdmVybGF5IHtcXG4gIG92ZXJmbG93LXk6IGF1dG87XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICB6LWluZGV4OiAxMTA7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBib3R0b206IDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcyLCA2OCwgNjIsIDAuOTYpO1xcbiAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgb3BhY2l0eTogMDtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMS4wOSk7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MsIHRyYW5zZm9ybSAwLjNzLCB2aXNpYmlsaXR5IDAuM3M7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG4uc2VhcmNoLW92ZXJsYXkgLmNvbnRhaW5lciB7XFxuICBtYXgtd2lkdGg6IDEzMDBweDtcXG4gIG1hcmdpbjogMCBhdXRvO1xcbiAgcGFkZGluZzogMCAxNnB4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbi5zZWFyY2gtb3ZlcmxheSBwIHtcXG4gIHBhZGRpbmctdG9wOiAxcmVtO1xcbn1cXG5ib2R5LmFkbWluLWJhciAuc2VhcmNoLW92ZXJsYXkge1xcbiAgdG9wOiAycmVtO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX3RvcCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMTIpO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX2ljb24ge1xcbiAgbWFyZ2luLXJpZ2h0OiAwLjc1cmVtO1xcbiAgZm9udC1zaXplOiAyLjVyZW07XFxuICBjb2xvcjogcmdiKDE0OCwgMTIxLCAxMDUpO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXktLWFjdGl2ZSB7XFxuICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgb3BhY2l0eTogMTtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9fc2VjdGlvbi10aXRsZSB7XFxuICBtYXJnaW46IDMwcHggMCAxcHggMDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXNpemU6IDJyZW07XFxuICBwYWRkaW5nOiAxNXB4IDA7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2NjYztcXG59XFxuLnNlYXJjaC1vdmVybGF5X19jbG9zZSB7XFxuICBmb250LXNpemU6IDIuN3JlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjNzO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDU4LCA1NCwgNTQpO1xcbiAgY29sb3I6IHJnYigxODAsIDE3MSwgMTY2KTtcXG4gIGxpbmUtaGVpZ2h0OiAwLjc7XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9fY2xvc2U6aG92ZXIge1xcbiAgb3BhY2l0eTogMTtcXG59XFxuLnNlYXJjaC1vdmVybGF5IC5vbmUtaGFsZiB7XFxuICBwYWRkaW5nLWJvdHRvbTogMDtcXG59XFxuXFxuLnNlYXJjaC10ZXJtIHtcXG4gIHdpZHRoOiA3NSU7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgYm9yZGVyOiBub25lO1xcbiAgcGFkZGluZzogMXJlbSAwO1xcbiAgbWFyZ2luOiAwO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBmb250LXNpemU6IDFyZW07XFxuICBmb250LXdlaWdodDogMzAwO1xcbiAgb3V0bGluZTogbm9uZTtcXG4gIGNvbG9yOiByZ2IoMjE4LCAyMDEsIDE4Mik7XFxufVxcblxcbi5ib2R5LW5vLXNjcm9sbCB7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG4uY29udGFpbmVyIHtcXG4gIG1heC13aWR0aDogMTMwMHB4O1xcbiAgbWFyZ2luOiAwIGF1dG87XFxuICBwYWRkaW5nOiAwIDE2cHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbkBtZWRpYSAobWluLXdpZHRoOiA5NjBweCkge1xcbiAgLnNlYXJjaC10ZXJtIHtcXG4gICAgd2lkdGg6IDgwJTtcXG4gICAgZm9udC1zaXplOiAzcmVtO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgc3BpbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XFxuICB9XFxufVxcbi5zcGlubmVyLWxvYWRlciB7XFxuICBtYXJnaW4tdG9wOiA0NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgd2lkdGg6IDI0cHg7XFxuICBoZWlnaHQ6IDI0cHg7XFxuICBib3JkZXI6IDAuMjVyZW0gc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgYm9yZGVyLXRvcC1jb2xvcjogYmxhY2s7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICBhbmltYXRpb246IHNwaW4gMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG4ubWVkaWEtY2FyZCBidXR0b24ge1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgZm9udC1zaXplOiAyLjFyZW07XFxufVxcblxcbmgxLCBoMiwgaDMsIGg0IHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTGlicmUgQ2FzbG9uIFRleHRcXFwiLCBzZXJpZjtcXG59XFxuXFxuLm5ld3MgcCwgLnRleHRCb3ggcCwgI3JlbGF0aW9uc2hpcC1saW5rLCAjc2luZ2xlLWxpbmsge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJMaWJyZSBDYXNsb24gRGlzcGxheVxcXCIsIHNlcmlmO1xcbn1cXG5cXG5oMSB7XFxuICBmb250LXdlaWdodDogNzAwO1xcbn1cXG5cXG5oMiB7XFxuICBmb250LXdlaWdodDogNDAwO1xcbn1cXG5cXG4uZGlzcGxheS10ZXh0LCAjd2VsY29tZUNvbnRhaW5lciBwLCAudGl0bGVCb3ggcCB7XFxuICBmb250LWZhbWlseTogXFxcIkNvcm1vcmFudCBTQ1xcXCIsIHNlcmlmO1xcbn1cXG5cXG5pbnB1dCwgLnJlYWQtbW9yZSwgLm5ld3MgbGkgYSwgaGVhZGVyIGxpIGEsICNyZWFsdGltZUZpbHRlcnNBbmRTb3J0aW5nIGJ1dHRvbiwgI3NlYXJjaC1maWx0ZXJzIGJ1dHRvbiwgI3Jlc2V0LWFsbCB7XFxuICBmb250LWZhbWlseTogXFxcIkxvcmFcXFwiLCBzZXJpZjtcXG59XFxuXFxuLnNlYXJjaC1mb3JtIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogNTAlO1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG5cXG4uY29udGVudC1sb2FkZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuLmNvbnRlbnQtbG9hZGVyIC5iYWxsIHtcXG4gIHdpZHRoOiAxLjJyZW07XFxuICBoZWlnaHQ6IDEuMnJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig0NywgMTYzLCA1Nik7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDUwJTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcyIDAuN3MgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSwgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdDIgMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nMiAwLjdzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUsIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQyIDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG4uY29udGVudC1sb2FkZXIubG9hZGVyW2RhdGEtdGV4dF06OmJlZm9yZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5jb250ZW50LWxvYWRlci5sb2FkZXIuaXMtYWN0aXZlOjpiZWZvcmUge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDUwJTtcXG4gIGxlZnQ6IDI1JTtcXG4gIHRvcDogMzklO1xcbiAgZm9udC1zaXplOiAyLjdyZW07XFxuICBjb2xvcjogcmdiKDE5NSwgMTY4LCAxMjYpO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxufVxcbi5jb250ZW50LWxvYWRlci5sb2FkZXItYmFyLXBpbmctcG9uZzo6YWZ0ZXIge1xcbiAgd2lkdGg6IDEuMnJlbTtcXG4gIGhlaWdodDogMS4ycmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEwMSwgMTQ4LCAxODcpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjdzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUsIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQgMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nIDAuN3MgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSwgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdCAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuLmNvbnRlbnQtbG9hZGVyLmxvYWRlci5pcy1hY3RpdmUge1xcbiAgaGVpZ2h0OiA5NyU7XFxuICB6LWluZGV4OiAwO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1MSwgNDksIDU2LCAwLjc0OTAxOTYwNzgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGJsaW5rIDEuOHMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBibGluayAxLjhzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBibGluayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIG9wYWNpdHk6IDAuNzU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBibGluayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIG9wYWNpdHk6IDAuNzU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IDQwJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiA2MCU7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogNDAlO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IDYwJTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcyLCA2OCwgODIsIDAuNzUpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMDIsIDc4LCAxMjIsIDAuNzUpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTQ5LCA5MywgMTY4LCAwLjc1KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0IHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg3MiwgNjgsIDgyLCAwLjc1KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTAyLCA3OCwgMTIyLCAwLjc1KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDE0OSwgOTMsIDE2OCwgMC43NSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmcyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogNDMlO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IDYzJTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmcyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogNDMlO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IDYzJTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQyIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDQ3LCAxNjMsIDU2KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig4NywgMTQzLCA1Nik7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEyNiwgMTMxLCA1OCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdDIge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNDcsIDE2MywgNTYpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDg3LCAxNDMsIDU2KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTI2LCAxMzEsIDU4KTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDg1JTtcXG4gIHRvcDogOSU7XFxuICB3aWR0aDogOTUlO1xcbiAgbGVmdDogMi41JTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMzcsIDM1LCAzNCwgMC43NSk7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgY29sb3I6IGFsaWNlYmx1ZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciBidXR0b24ge1xcbiAgY29sb3I6IGFudGlxdWV3aGl0ZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjbWVkaWEtY29udGFpbmVyLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIHtcXG4gIGJvcmRlcjogMC4ycmVtIHNvbGlkIHJnYmEoMjEyLCAxOTMsIDEzMCwgMC40KTtcXG4gIGJvcmRlci1sZWZ0OiBub25lO1xcbiAgcGFkZGluZy1sZWZ0OiAxLjVyZW07XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcInJlYWx0aW1lRmlsdGVyc0FuZFNvcnRpbmdcXFwiIFxcXCJzZWFyY2hGaWx0ZXJzXFxcIiBcXFwicmVzZXRBbGxcXFwiO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcge1xcbiAgZ3JpZC1hcmVhOiByZWFsdGltZUZpbHRlcnNBbmRTb3J0aW5nO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIG1hcmdpbi10b3A6IDEuNXJlbTtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJoZWFkaW5nUkZTIGhlYWRpbmdSRlNcXFwiIFxcXCJvcmRlckJ5IHRvZ2dsZVR5cGVcXFwiIFxcXCJmaWx0ZXJEYXRlIGZpbHRlckRhdGVcXFwiO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBidXR0b24sICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBsYWJlbCB7XFxuICBmb250LXNpemU6IDEuM3JlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIGgyIHtcXG4gIGdyaWQtYXJlYTogaGVhZGluZ1JGUztcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nICNvcmRlci1ieSB7XFxuICBncmlkLWFyZWE6IG9yZGVyQnk7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyAjdG9nZ2xlLXR5cGUge1xcbiAgZ3JpZC1hcmVhOiB0b2dnbGVUeXBlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI2ZpbHRlci1kYXRlIHtcXG4gIGdyaWQtYXJlYTogZmlsdGVyRGF0ZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nICNmaWx0ZXItZGF0ZSBkaXYgdWwge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGdhcDogM3JlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIHVsIHtcXG4gIHBhZGRpbmctbGVmdDogMC4zcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgdWwgbGkge1xcbiAgbWFyZ2luLXRvcDogMC41cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIHtcXG4gIGdyaWQtYXJlYTogc2VhcmNoRmlsdGVycztcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwiaGVhZGluZ1NGIGhlYWRpbmdTRiBoZWFkaW5nU0ZcXFwiIFxcXCJuZXdzU2VhcmNoIG5ld3NTZWFyY2ggbmV3c1NlYXJjaFxcXCIgXFxcImNhc2VTZW5zaXRpdmUgZnVsbFdvcmRPbmx5IHdvcmRTdGFydE9ubHlcXFwiIFxcXCJpbmNsdWRlVGl0bGUgaW5jbHVkZURlc2NyaXB0aW9uIC4uLlxcXCI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgaDIge1xcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nU0Y7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgYnV0dG9uIHtcXG4gIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjbmV3cy1zZWFyY2gtY29udGFpbmVyIHtcXG4gIGdyaWQtYXJlYTogbmV3c1NlYXJjaDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjbmV3cy1zZWFyY2gtY29udGFpbmVyICNuZXdzLXNlYXJjaCB7XFxuICBmb250LXNpemU6IDEuMTVyZW07XFxuICBoZWlnaHQ6IDIuM3JlbTtcXG4gIHdpZHRoOiAxOHJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjZnVsbC13b3JkLW9ubHkge1xcbiAgZ3JpZC1hcmVhOiBmdWxsV29yZE9ubHk7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI3dvcmQtc3RhcnQtb25seSB7XFxuICBncmlkLWFyZWE6IHdvcmRTdGFydE9ubHk7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI2Nhc2Utc2Vuc2l0aXZlIHtcXG4gIGdyaWQtYXJlYTogY2FzZVNlbnNpdGl2ZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjaW5jbHVkZS10aXRsZSB7XFxuICBncmlkLWFyZWE6IGluY2x1ZGVUaXRsZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjaW5jbHVkZS1kZXNjcmlwdGlvbiB7XFxuICBncmlkLWFyZWE6IGluY2x1ZGVEZXNjcmlwdGlvbjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjd29yZC1zdGFydC1vbmx5LmluYWN0aXZlLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIGJ1dHRvbi5pbmFjdGl2ZSB7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjd29yZC1zdGFydC1vbmx5LmluYWN0aXZlIHNwYW4sICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgYnV0dG9uLmluYWN0aXZlIHNwYW4ge1xcbiAgY29sb3I6IHJlZDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGJ1dHRvbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIHNlbGVjdCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGxhYmVsIHtcXG4gIGZvbnQtc2l6ZTogMS4xcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3Jlc2V0LWFsbCB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG4gIGdyaWQtYXJlYTogcmVzZXRBbGw7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBidXR0b24ge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgaDMge1xcbiAgZm9udC1zaXplOiAxLjdyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBoNCB7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIG1hcmdpbi1ib3R0b206IDAuOHJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIge1xcbiAgd2lkdGg6IDY2JTtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLXJvd3M6IDEwJSA4NCUgNiU7XFxuICBib3JkZXI6IDAuMnJlbSBzb2xpZCByZ2IoMTgwLCAxNzQsIDE2NCk7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyIGgyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1zaXplOiAzcmVtO1xcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gIGJvcmRlci1ib3R0b206IDAuM3JlbSBzb2xpZCByZ2IoMTg1LCAxNTgsIDEyMik7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNkaXNtaXNzLXNlbGVjdGlvbiB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNkaXNtaXNzLXNlbGVjdGlvbi5kaXNtaXNzZWQge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1yZWNpZXZlciB7XFxuICBtYXJnaW4tYm90dG9tOiAwLjVyZW07XFxuICBwYWRkaW5nLXJpZ2h0OiAycmVtO1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIHtcXG4gIHBhZGRpbmctbGVmdDogMnJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheS5kaXNtaXNzZWQsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyLmRpc21pc3NlZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzIHtcXG4gIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgcGFkZGluZy10b3A6IDA7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3M6OmFmdGVyLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3czo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIiBcXFwiO1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBoZWlnaHQ6IDFyZW07XFxuICBjbGVhcjogYm90aDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBpbWcsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgaWZyYW1lLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBpbWcsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzIGlmcmFtZSB7XFxuICBmbG9hdDogbGVmdDtcXG4gIG1hcmdpbi1yaWdodDogMiU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgcCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgcCB7XFxuICBsaW5lLWhlaWdodDogMS4ycmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzIGlmcmFtZSwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgaWZyYW1lIHtcXG4gIHdpZHRoOiAxNTBweDtcXG4gIGhlaWdodDogMTAwcHg7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGksICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIHVsIGxpIHtcXG4gIGxpc3Qtc3R5bGUtdHlwZTogY2lyY2xlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IHVsIGxpIC5zZWUtbW9yZS1saW5rLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IHVsIGxpIC5yZWxhdGlvbnNoaXAtbGluaywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnNlZS1tb3JlLWxpbmssICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIHVsIGxpIC5yZWxhdGlvbnNoaXAtbGluayB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnNlZS1tb3JlLWxpbmsuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IHVsIGxpIC5yZWxhdGlvbnNoaXAtbGluay5kaXNtaXNzZWQsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIHVsIGxpIC5zZWUtbW9yZS1saW5rLmRpc21pc3NlZCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLmRpc21pc3NlZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIge1xcbiAgd2lkdGg6IDM2JTtcXG4gIHBhZGRpbmctdG9wOiAxcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciB7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIuZGlzbWlzc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIgLmNvbnRlbnQtcGFnZXMge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIgLmNvbnRlbnQtcGFnZXMgYSB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBmb250LXNpemU6IDEuOXJlbTtcXG4gIG1hcmdpbi1sZWZ0OiAwLjVyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEuaGlkZGVuLCAjYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyBhLnNlbGVjdGVkUGFnZSB7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIgLmNvbnRlbnQtcGFnZXMgYS5oaWRkZW4ge1xcbiAgb3BhY2l0eTogMDtcXG59XFxuXFxuI21lZGlhLXJlY2lldmVyIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEwLCAxMCwgMTAsIDAuOCk7XFxuICB0b3A6IDclO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDk1JTtcXG4gIHotaW5kZXg6IDE7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSB7XFxuICBtYXJnaW4tbGVmdDogMTRyZW07XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDNyZW07XFxuICBoZWlnaHQ6IDQ1cmVtO1xcbiAgd2lkdGg6IDgwcmVtO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgaWZyYW1lLCAjbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgaW1nIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgI3BsYXktYnV0dG9uLWNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSAjcGxheS1idXR0b24tY29udGFpbmVyICNwbGF5LWJ1dHRvbiB7XFxuICBoZWlnaHQ6IDZyZW07XFxuICB3aWR0aDogOXJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoOTksIDEwMCwgMTc5LCAwLjgpO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm9yZGVyLXJhZGl1czogMzUlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycyBlYXNlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgI3BsYXktYnV0dG9uLWNvbnRhaW5lciAjcGxheS1idXR0b24gZGl2IHtcXG4gIGJvcmRlci1sZWZ0OiAzcmVtIHNvbGlkIHJnYigxMjUsIDE1MCwgMTY4KTtcXG4gIGJvcmRlci10b3A6IDEuN3JlbSBzb2xpZCB0cmFuc3BhcmVudDtcXG4gIGJvcmRlci1ib3R0b206IDEuN3JlbSBzb2xpZCB0cmFuc3BhcmVudDtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIgI3BsYXktYnV0dG9uOmhvdmVyIHtcXG4gIG9wYWNpdHk6IDAuNztcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhLmNlbnRlci1kaXNwbGF5IHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGhlaWdodDogODIlO1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICByaWdodDogMnJlbTtcXG4gIHRvcDogM3JlbTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1tZW51IHtcXG4gIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgZGlzcGxheTogZmxleDtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1tZW51IGEge1xcbiAgY29sb3I6IGF6dXJlO1xcbiAgbWFyZ2luLWxlZnQ6IDJyZW07XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtbWVudSBhLmFjdGl2ZSB7XFxuICBmaWx0ZXI6IGNvbnRyYXN0KDQ4JSk7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4ge1xcbiAgbWF4LXdpZHRoOiAzODBweDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24ge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIG1hcmdpbi10b3A6IDFyZW07XFxuICB3aWR0aDogMTAwJTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiAubWVkaWEtdGh1bWIge1xcbiAgd2lkdGg6IDQ1JTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiAubWVkaWEtdGh1bWIuc2VsZWN0ZWQge1xcbiAgZmlsdGVyOiBjb250cmFzdCg0OCUpO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24gLm1lZGlhLWluZm9ybWF0aW9uIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgbWFyZ2luLWxlZnQ6IDFyZW07XFxuICB3aWR0aDogNTUlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS1pbmZvcm1hdGlvbiBwIHtcXG4gIG1hcmdpbjogMDtcXG4gIGNvbG9yOiBiZWlnZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiAubWVkaWEtaW5mb3JtYXRpb24gcDpudGgtb2YtdHlwZSgyKSB7XFxuICBtYXJnaW4tdG9wOiAxcmVtO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLXBhZ2luYXRpb24ge1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgY29sb3I6IGFsaWNlYmx1ZTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1wYWdpbmF0aW9uIGEge1xcbiAgZm9udC1zaXplOiAxLjJyZW07XFxuICBtYXJnaW4tbGVmdDogMXJlbTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1jbG9zZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBjb2xvcjogd2hpdGU7XFxuICBsZWZ0OiAzLjVyZW07XFxuICB0b3A6IDMuNXJlbTtcXG4gIGZvbnQtc2l6ZTogMy41cmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubWVkaWEtY2FyZDpob3ZlciBpbWcsIC5wcm9wZXJ0eS1tZWRpYS1jYXJkOmhvdmVyIGltZyB7XFxuICBmaWx0ZXI6IGJyaWdodG5lc3MoNTAlKTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuLm1lZGlhLWNhcmQ6aG92ZXIgaDMsIC5tZWRpYS1jYXJkOmhvdmVyIHAsIC5tZWRpYS1jYXJkOmhvdmVyIGJ1dHRvbiwgLnByb3BlcnR5LW1lZGlhLWNhcmQ6aG92ZXIgaDMsIC5wcm9wZXJ0eS1tZWRpYS1jYXJkOmhvdmVyIHAsIC5wcm9wZXJ0eS1tZWRpYS1jYXJkOmhvdmVyIGJ1dHRvbiB7XFxuICBmaWx0ZXI6IGNvbnRyYXN0KDQwJSk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbi5sb2FkZXIge1xcbiAgY29sb3I6ICNmZmY7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHRvcDogLTk5OTlweDtcXG4gIHdpZHRoOiAwO1xcbiAgaGVpZ2h0OiAwO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIHotaW5kZXg6IDk5OTk5OTtcXG59XFxuXFxuLmxvYWRlcjphZnRlciwgLmxvYWRlcjpiZWZvcmUge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5sb2FkZXIuaXMtYWN0aXZlIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC44NSk7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IDA7XFxufVxcblxcbi5sb2FkZXIuaXMtYWN0aXZlOmFmdGVyLCAubG9hZGVyLmlzLWFjdGl2ZTpiZWZvcmUge1xcbiAgZGlzcGxheTogYmxvY2s7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyByb3RhdGlvbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDApO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIHJvdGF0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMCk7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM1OWRlZyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgYmxpbmsge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwLjU7XFxuICB9XFxuICB0byB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcbi5sb2FkZXJbZGF0YS10ZXh0XTpiZWZvcmUge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgbGVmdDogMDtcXG4gIHRvcDogNTAlO1xcbiAgY29sb3I6IGN1cnJlbnRDb2xvcjtcXG4gIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmb250LXNpemU6IDE0cHg7XFxufVxcblxcbi5sb2FkZXJbZGF0YS10ZXh0PVxcXCJcXFwiXTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIkxvYWRpbmdcXFwiO1xcbn1cXG5cXG4ubG9hZGVyW2RhdGEtdGV4dF06bm90KFtkYXRhLXRleHQ9XFxcIlxcXCJdKTpiZWZvcmUge1xcbiAgY29udGVudDogYXR0cihkYXRhLXRleHQpO1xcbn1cXG5cXG4ubG9hZGVyW2RhdGEtdGV4dF1bZGF0YS1ibGlua106YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBibGluayAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGJsaW5rIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbi5sb2FkZXItZGVmYXVsdFtkYXRhLXRleHRdOmJlZm9yZSB7XFxuICB0b3A6IGNhbGMoNTAlIC0gNjNweCk7XFxufVxcblxcbi5sb2FkZXItZGVmYXVsdDphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiA0OHB4O1xcbiAgaGVpZ2h0OiA0OHB4O1xcbiAgYm9yZGVyOiA4cHggc29saWQgI2ZmZjtcXG4gIGJvcmRlci1sZWZ0LWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHRvcDogY2FsYyg1MCUgLSAyNHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMjRweCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogcm90YXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuXFxuLmxvYWRlci1kZWZhdWx0W2RhdGEtaGFsZl06YWZ0ZXIge1xcbiAgYm9yZGVyLXJpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDtcXG59XFxuXFxuLmxvYWRlci1kZWZhdWx0W2RhdGEtaW52ZXJzZV06YWZ0ZXIge1xcbiAgYW5pbWF0aW9uLWRpcmVjdGlvbjogcmV2ZXJzZTtcXG59XFxuXFxuLmxvYWRlci1kb3VibGU6YWZ0ZXIsIC5sb2FkZXItZG91YmxlOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIGJvcmRlcjogOHB4IHNvbGlkO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHJvdGF0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItZG91YmxlOmFmdGVyIHtcXG4gIHdpZHRoOiA0OHB4O1xcbiAgaGVpZ2h0OiA0OHB4O1xcbiAgYm9yZGVyLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLWxlZnQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgdG9wOiBjYWxjKDUwJSAtIDI0cHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAyNHB4KTtcXG59XFxuXFxuLmxvYWRlci1kb3VibGU6YmVmb3JlIHtcXG4gIHdpZHRoOiA2NHB4O1xcbiAgaGVpZ2h0OiA2NHB4O1xcbiAgYm9yZGVyLWNvbG9yOiAjZWI5NzRlO1xcbiAgYm9yZGVyLXJpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWR1cmF0aW9uOiAycztcXG4gICAgICAgICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAycztcXG4gIHRvcDogY2FsYyg1MCUgLSAzMnB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMzJweCk7XFxufVxcblxcbi5sb2FkZXItYmFyW2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIHRvcDogY2FsYyg1MCUgLSA0MHB4KTtcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4ubG9hZGVyLWJhcjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgd2lkdGg6IDIwMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoLTQ1ZGVnLCAjNDE4M2Q3IDI1JSwgIzUyYjNkOSAwLCAjNTJiM2Q5IDUwJSwgIzQxODNkNyAwLCAjNDE4M2Q3IDc1JSwgIzUyYjNkOSAwLCAjNTJiM2Q5KTtcXG4gIGJhY2tncm91bmQtc2l6ZTogMjBweCAyMHB4O1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAxMHB4IDAgaHNsYSgwLCAwJSwgMTAwJSwgMC4yKSwgMCAwIDAgNXB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gIGFuaW1hdGlvbjogbW92ZUJhciAxLjVzIGxpbmVhciBpbmZpbml0ZSByZXZlcnNlO1xcbn1cXG5cXG4ubG9hZGVyLWJhcltkYXRhLXJvdW5kZWRdOmFmdGVyIHtcXG4gIGJvcmRlci1yYWRpdXM6IDE1cHg7XFxufVxcblxcbi5sb2FkZXItYmFyW2RhdGEtaW52ZXJzZV06YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGlyZWN0aW9uOiBub3JtYWw7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kaXJlY3Rpb246IG5vcm1hbDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXIge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7XFxuICB9XFxuICB0byB7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDIwcHggMjBweDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBtb3ZlQmFyIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMHB4IDIwcHg7XFxuICB9XFxufVxcbi5sb2FkZXItYmFyLXBpbmctcG9uZzpiZWZvcmUge1xcbiAgd2lkdGg6IDIwMHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG59XFxuXFxuLmxvYWRlci1iYXItcGluZy1wb25nOmFmdGVyLCAubG9hZGVyLWJhci1waW5nLXBvbmc6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDEwcHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAxMDBweCk7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZzphZnRlciB7XFxuICB3aWR0aDogNTBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmMTk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nIDAuNXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcgMC41cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWJhci1waW5nLXBvbmdbZGF0YS1yb3VuZGVkXTpiZWZvcmUge1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG59XFxuXFxuLmxvYWRlci1iYXItcGluZy1wb25nW2RhdGEtcm91bmRlZF06YWZ0ZXIge1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgd2lkdGg6IDIwcHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1uYW1lOiBtb3ZlQmFyUGluZ1BvbmdSb3VuZGVkO1xcbiAgICAgICAgICBhbmltYXRpb24tbmFtZTogbW92ZUJhclBpbmdQb25nUm91bmRlZDtcXG59XFxuXFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1Bvbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSAtIDEwMHB4KTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyA1MHB4KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ1JvdW5kZWQge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSAtIDEwMHB4KTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyA4MHB4KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdSb3VuZGVkIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgLSAxMDBweCk7XFxuICB9XFxuICB0byB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgODBweCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBjb3JuZXJzIHtcXG4gIDYlIHtcXG4gICAgd2lkdGg6IDYwcHg7XFxuICAgIGhlaWdodDogMTVweDtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICAgIGxlZnQ6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgICB0b3A6IDA7XFxuICB9XFxuICAzMSUge1xcbiAgICBoZWlnaHQ6IDYwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICAgIHRvcDogY2FsYygxMDAlIC0gMTVweCk7XFxuICAgIGxlZnQ6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgfVxcbiAgNTYlIHtcXG4gICAgd2lkdGg6IDYwcHg7XFxuICB9XFxuICA3NSUge1xcbiAgICB3aWR0aDogMTVweDtcXG4gICAgbGVmdDogMDtcXG4gICAgdG9wOiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gIH1cXG4gIDgxJSB7XFxuICAgIGhlaWdodDogNjBweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBjb3JuZXJzIHtcXG4gIDYlIHtcXG4gICAgd2lkdGg6IDYwcHg7XFxuICAgIGhlaWdodDogMTVweDtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICAgIGxlZnQ6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgICB0b3A6IDA7XFxuICB9XFxuICAzMSUge1xcbiAgICBoZWlnaHQ6IDYwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICAgIHRvcDogY2FsYygxMDAlIC0gMTVweCk7XFxuICAgIGxlZnQ6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgfVxcbiAgNTYlIHtcXG4gICAgd2lkdGg6IDYwcHg7XFxuICB9XFxuICA3NSUge1xcbiAgICB3aWR0aDogMTVweDtcXG4gICAgbGVmdDogMDtcXG4gICAgdG9wOiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gIH1cXG4gIDgxJSB7XFxuICAgIGhlaWdodDogNjBweDtcXG4gIH1cXG59XFxuLmxvYWRlci1ib3JkZXJbZGF0YS10ZXh0XTpiZWZvcmUge1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5sb2FkZXItYm9yZGVyOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxNXB4O1xcbiAgaGVpZ2h0OiAxNXB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb3JuZXJzIDNzIGVhc2UgYm90aCBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb3JuZXJzIDNzIGVhc2UgYm90aCBpbmZpbml0ZTtcXG59XFxuXFxuLmxvYWRlci1iYWxsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiA1MHB4O1xcbiAgaGVpZ2h0OiA1MHB4O1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICBtYXJnaW46IC0yNXB4IDAgMCAtMjVweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB6LWluZGV4OiAxO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGtpY2tCYWxsIDFzIGluZmluaXRlIGFsdGVybmF0ZSBlYXNlLWluIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjoga2lja0JhbGwgMXMgaW5maW5pdGUgYWx0ZXJuYXRlIGVhc2UtaW4gYm90aDtcXG59XFxuXFxuLmxvYWRlci1iYWxsW2RhdGEtc2hhZG93XTpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogaW5zZXQgLTVweCAtNXB4IDEwcHggMCByZ2JhKDAsIDAsIDAsIDAuNSk7XFxufVxcblxcbi5sb2FkZXItYmFsbDphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4zKTtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHdpZHRoOiA0NXB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgdG9wOiBjYWxjKDUwJSArIDEwcHgpO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAwIDAgMCAtMjIuNXB4O1xcbiAgei1pbmRleDogMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBzaGFkb3cgMXMgaW5maW5pdGUgYWx0ZXJuYXRlIGVhc2Utb3V0IGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogc2hhZG93IDFzIGluZmluaXRlIGFsdGVybmF0ZSBlYXNlLW91dCBib3RoO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgc2hhZG93IHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMCk7XFxuICB9XFxuICA0MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwKTtcXG4gIH1cXG4gIDk1JSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43NSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICB9XFxuICB0byB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43NSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgc2hhZG93IHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMCk7XFxuICB9XFxuICA0MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwKTtcXG4gIH1cXG4gIDk1JSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43NSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICB9XFxuICB0byB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43NSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBraWNrQmFsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtODBweCkgc2NhbGVYKDAuOTUpO1xcbiAgfVxcbiAgOTAlIHtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCkgc2NhbGVYKDEpO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCUgNTAlIDIwJSAyMCU7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMga2lja0JhbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTgwcHgpIHNjYWxlWCgwLjk1KTtcXG4gIH1cXG4gIDkwJSB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApIHNjYWxlWCgxKTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlIDUwJSAyMCUgMjAlO1xcbiAgfVxcbn1cXG4ubG9hZGVyLXNtYXJ0cGhvbmU6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogMTJweDtcXG4gIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgbGluZS1oZWlnaHQ6IDEyMHB4O1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgbGVmdDogNTAlO1xcbiAgdG9wOiA1MCU7XFxuICB3aWR0aDogNzBweDtcXG4gIGhlaWdodDogMTMwcHg7XFxuICBtYXJnaW46IC02NXB4IDAgMCAtMzVweDtcXG4gIGJvcmRlcjogNXB4IHNvbGlkICNmZDA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCA1cHggMCAwICNmZDA7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDUwJSA5MCUsIHJnYmEoMCwgMCwgMCwgMC41KSA2cHgsIHRyYW5zcGFyZW50IDApLCBsaW5lYXItZ3JhZGllbnQoMGRlZywgI2ZkMCAyMnB4LCB0cmFuc3BhcmVudCAwKSwgbGluZWFyLWdyYWRpZW50KDBkZWcsIHJnYmEoMCwgMCwgMCwgMC41KSAyMnB4LCByZ2JhKDAsIDAsIDAsIDAuNSkpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHNoYWtlIDJzIGN1YmljLWJlemllcigwLjM2LCAwLjA3LCAwLjE5LCAwLjk3KSBib3RoIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IHNoYWtlIDJzIGN1YmljLWJlemllcigwLjM2LCAwLjA3LCAwLjE5LCAwLjk3KSBib3RoIGluZmluaXRlO1xcbn1cXG5cXG4ubG9hZGVyLXNtYXJ0cGhvbmVbZGF0YS1zY3JlZW49XFxcIlxcXCJdOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJMb2FkaW5nXFxcIjtcXG59XFxuXFxuLmxvYWRlci1zbWFydHBob25lOm5vdChbZGF0YS1zY3JlZW49XFxcIlxcXCJdKTphZnRlciB7XFxuICBjb250ZW50OiBhdHRyKGRhdGEtc2NyZWVuKTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIHNoYWtlIHtcXG4gIDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDEwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDE1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAyMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDQwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICA1NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIHNoYWtlIHtcXG4gIDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDEwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDE1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAyMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDQwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICA1NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbn1cXG4ubG9hZGVyLWNsb2NrOmJlZm9yZSB7XFxuICB3aWR0aDogMTIwcHg7XFxuICBoZWlnaHQ6IDEyMHB4O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgbWFyZ2luOiAtNjBweCAwIDAgLTYwcHg7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCB0cmFuc3BhcmVudCA1MCUsICNmNWY1ZjUgMCksIGxpbmVhci1ncmFkaWVudCg5MGRlZywgdHJhbnNwYXJlbnQgNTVweCwgIzJlY2M3MSAwLCAjMmVjYzcxIDY1cHgsIHRyYW5zcGFyZW50IDApLCBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjZjVmNWY1IDUwJSwgI2Y1ZjVmNSAwKTtcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgMCAwIDEwcHggI2Y1ZjVmNSwgMCAwIDAgNXB4ICM1NTUsIDAgMCAwIDEwcHggIzdiN2I3YjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiBpbmZpbml0ZSAycyBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogcm90YXRpb24gaW5maW5pdGUgMnMgbGluZWFyO1xcbn1cXG5cXG4ubG9hZGVyLWNsb2NrOmFmdGVyLCAubG9hZGVyLWNsb2NrOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGxlZnQ6IDUwJTtcXG4gIHRvcDogNTAlO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuLmxvYWRlci1jbG9jazphZnRlciB7XFxuICB3aWR0aDogNjBweDtcXG4gIGhlaWdodDogNDBweDtcXG4gIG1hcmdpbjogLTIwcHggMCAwIC0xNXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMjBweCAwIDAgMjBweDtcXG4gIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgMTRweCAyMHB4LCAjMjVhMjVhIDEwcHgsIHRyYW5zcGFyZW50IDApLCByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDE0cHggMjBweCwgIzFiNzk0MyAxNHB4LCB0cmFuc3BhcmVudCAwKSwgbGluZWFyLWdyYWRpZW50KDE4MGRlZywgdHJhbnNwYXJlbnQgMTVweCwgIzJlY2M3MSAwLCAjMmVjYzcxIDI1cHgsIHRyYW5zcGFyZW50IDApO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDI0cyBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogcm90YXRpb24gaW5maW5pdGUgMjRzIGxpbmVhcjtcXG4gIHRyYW5zZm9ybS1vcmlnaW46IDE1cHggY2VudGVyO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW46YWZ0ZXIsIC5sb2FkZXItY3VydGFpbjpiZWZvcmUge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0b3A6IDUwJTtcXG4gIG1hcmdpbi10b3A6IC0zNXB4O1xcbiAgZm9udC1zaXplOiA3MHB4O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgbGluZS1oZWlnaHQ6IDEuMjtcXG4gIGNvbnRlbnQ6IFxcXCJMb2FkaW5nXFxcIjtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluOmJlZm9yZSB7XFxuICBjb2xvcjogIzY2NjtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluOmFmdGVyIHtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgaGVpZ2h0OiAwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGN1cnRhaW4gMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGN1cnRhaW4gMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW5bZGF0YS1jdXJ0YWluLXRleHRdOm5vdChbZGF0YS1jdXJ0YWluLXRleHQ9XFxcIlxcXCJdKTphZnRlciwgLmxvYWRlci1jdXJ0YWluW2RhdGEtY3VydGFpbi10ZXh0XTpub3QoW2RhdGEtY3VydGFpbi10ZXh0PVxcXCJcXFwiXSk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IGF0dHIoZGF0YS1jdXJ0YWluLXRleHQpO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW5bZGF0YS1icmF6aWxpYW5dOmJlZm9yZSB7XFxuICBjb2xvcjogI2YxYzQwZjtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtYnJhemlsaWFuXTphZnRlciB7XFxuICBjb2xvcjogIzJlY2M3MTtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtY29sb3JmdWxdOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbWFza0NvbG9yZnVsIDJzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtYXNrQ29sb3JmdWwgMnMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW5bZGF0YS1jb2xvcmZ1bF06YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGN1cnRhaW4gMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoLCBtYXNrQ29sb3JmdWwtZnJvbnQgMnMgMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGN1cnRhaW4gMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoLCBtYXNrQ29sb3JmdWwtZnJvbnQgMnMgMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoO1xcbiAgY29sb3I6ICMwMDA7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBtYXNrQ29sb3JmdWwge1xcbiAgMCUge1xcbiAgICBjb2xvcjogIzM0OThkYjtcXG4gIH1cXG4gIDQ5LjUlIHtcXG4gICAgY29sb3I6ICMzNDk4ZGI7XFxuICB9XFxuICA1MC41JSB7XFxuICAgIGNvbG9yOiAjZTc0YzNjO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb2xvcjogI2U3NGMzYztcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBtYXNrQ29sb3JmdWwge1xcbiAgMCUge1xcbiAgICBjb2xvcjogIzM0OThkYjtcXG4gIH1cXG4gIDQ5LjUlIHtcXG4gICAgY29sb3I6ICMzNDk4ZGI7XFxuICB9XFxuICA1MC41JSB7XFxuICAgIGNvbG9yOiAjZTc0YzNjO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb2xvcjogI2U3NGMzYztcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1hc2tDb2xvcmZ1bC1mcm9udCB7XFxuICAwJSB7XFxuICAgIGNvbG9yOiAjMmVjYzcxO1xcbiAgfVxcbiAgNDkuNSUge1xcbiAgICBjb2xvcjogIzJlY2M3MTtcXG4gIH1cXG4gIDUwLjUlIHtcXG4gICAgY29sb3I6ICNmMWM0MGY7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbG9yOiAjZjFjNDBmO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1hc2tDb2xvcmZ1bC1mcm9udCB7XFxuICAwJSB7XFxuICAgIGNvbG9yOiAjMmVjYzcxO1xcbiAgfVxcbiAgNDkuNSUge1xcbiAgICBjb2xvcjogIzJlY2M3MTtcXG4gIH1cXG4gIDUwLjUlIHtcXG4gICAgY29sb3I6ICNmMWM0MGY7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbG9yOiAjZjFjNDBmO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY3VydGFpbiB7XFxuICAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gIH1cXG4gIHRvIHtcXG4gICAgaGVpZ2h0OiA4NHB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGN1cnRhaW4ge1xcbiAgMCUge1xcbiAgICBoZWlnaHQ6IDA7XFxuICB9XFxuICB0byB7XFxuICAgIGhlaWdodDogODRweDtcXG4gIH1cXG59XFxuLmxvYWRlci1tdXNpYzphZnRlciwgLmxvYWRlci1tdXNpYzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogMjQwcHg7XFxuICBoZWlnaHQ6IDI0MHB4O1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICBtYXJnaW46IC0xMjBweCAwIDAgLTEyMHB4O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgbGluZS1oZWlnaHQ6IDI0MHB4O1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDQwcHg7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIHRleHQtc2hhZG93OiAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgbGV0dGVyLXNwYWNpbmc6IC0xcHg7XFxufVxcblxcbi5sb2FkZXItbXVzaWM6YWZ0ZXIge1xcbiAgLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgICAgICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLWhleS1vaF06YWZ0ZXIsIC5sb2FkZXItbXVzaWNbZGF0YS1oZXktb2hdOmJlZm9yZSB7XFxuICBib3gtc2hhZG93OiAwIDAgMCAxMHB4O1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTpiZWZvcmUge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGNvbG9yOiAjMDAwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCBvaCA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgb2ggNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1oZXktb2hdOmFmdGVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgaGV5IDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIGhleSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLW5vLWNyeV06YWZ0ZXIsIC5sb2FkZXItbXVzaWNbZGF0YS1uby1jcnldOmJlZm9yZSB7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoNDVkZWcsICMwMDliM2EgNTAlLCAjZmVkMTAwIDUxJSk7XFxuICBib3gtc2hhZG93OiAwIDAgMCAxMHB4ICMwMDA7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1uby1jcnldOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIGNyeSA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgY3J5IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgbm8gNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgbm8gNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS13ZS1hcmVdOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIHRoZVdvcmxkIDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCB0aGVXb3JsZCA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChlbGxpcHNlIGF0IGNlbnRlciwgIzRlY2RjNCAwLCAjNTU2MjcwKTtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXdlLWFyZV06YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIHdlQXJlIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIHdlQXJlIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGVsbGlwc2UgYXQgY2VudGVyLCAjMjZkMGNlIDAsICMxYTI5ODApO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtcm9jay15b3VdOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIHJvY2tZb3UgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIHJvY2tZb3UgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICBiYWNrZ3JvdW5kOiAjNDQ0O1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtcm9jay15b3VdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZVdpbGwgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgd2VXaWxsIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgYmFja2dyb3VuZDogIzk2MjgxYjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGNvaW4ge1xcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMzU5ZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBjb2luIHtcXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDM1OWRlZyk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBjb2luQmFjayB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDF0dXJuKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY29pbkJhY2sge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxdHVybik7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgaGV5IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIkhleSFcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIkxldCdzIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBoZXkge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiSGV5IVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiTGV0J3MhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIkhleSFcXFwiO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgb2gge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiT2ghXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJHbyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiT2ghXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBvaCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJPaCFcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIkdvIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJPaCFcXFwiO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbm8ge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiTm8uLi5cXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIm5vXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBubyB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJOby4uLlxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwibm9cXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiTm8uLi5cXFwiO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY3J5IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIndvbWFuXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJjcnkhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndvbWFuXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBjcnkge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwid29tYW5cXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcImNyeSFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwid29tYW5cXFwiO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgd2VBcmUge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2UgYXJlXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSBhcmVcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiV2UgYXJlXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyB3ZUFyZSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSBhcmVcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIndlIGFyZVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSBhcmVcXFwiO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgdGhlV29ybGQge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwidGhlIGNoaWxkcmVuIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgd29ybGQsXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyB0aGVXb3JsZCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgd29ybGQsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgY2hpbGRyZW4hXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcInRoZSB3b3JsZCxcXFwiO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgd2VXaWxsIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIldlIHdpbGwsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJyb2NrIHlvdSFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiV2Ugd2lsbCxcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHdlV2lsbCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwicm9jayB5b3UhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIHdpbGwsXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHJvY2tZb3Uge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwid2Ugd2lsbFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+kmFxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSB3aWxsXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyByb2NrWW91IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIvCfpJhcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwid2Ugd2lsbFxcXCI7XFxuICB9XFxufVxcbi5sb2FkZXItcG9rZWJhbGw6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDEwMHB4O1xcbiAgaGVpZ2h0OiAxMDBweDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAtNTBweCAwIDAgLTUwcHg7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCByZWQgNDIlLCAjMDAwIDAsICMwMDAgNTglLCAjZmZmIDApO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB6LWluZGV4OiAxO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVQb2tlYmFsbCAxcyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb3ZlUG9rZWJhbGwgMXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItcG9rZWJhbGw6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogMjRweDtcXG4gIGhlaWdodDogMjRweDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAtMTJweCAwIDAgLTEycHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgei1pbmRleDogMjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlUG9rZWJhbGwgMXMgbGluZWFyIGluZmluaXRlIGJvdGgsIGZsYXNoUG9rZWJhbGwgMC41cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoLCBmbGFzaFBva2ViYWxsIDAuNXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgYm9yZGVyOiAycHggc29saWQgIzAwMDtcXG4gIGJveC1zaGFkb3c6IDAgMCAwIDVweCAjZmZmLCAwIDAgMCAxMHB4ICMwMDA7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCkgcm90YXRlKDApO1xcbiAgfVxcbiAgMTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGV4KC0xMHB4KSByb3RhdGUoLTVkZWcpO1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwcHgpIHJvdGF0ZSg1ZGVnKTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRleCgwKSByb3RhdGUoMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbW92ZVBva2ViYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApIHJvdGF0ZSgwKTtcXG4gIH1cXG4gIDE1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRleCgtMTBweCkgcm90YXRlKC01ZGVnKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMHB4KSByb3RhdGUoNWRlZyk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoMCkgcm90YXRlKDApO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZmxhc2hQb2tlYmFsbCB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICB9XFxuICB0byB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZDA7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZmxhc2hQb2tlYmFsbCB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICB9XFxuICB0byB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZDA7XFxuICB9XFxufVxcbi5sb2FkZXItYm91bmNpbmc6YWZ0ZXIsIC5sb2FkZXItYm91bmNpbmc6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgd2lkdGg6IDIwcHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IGNhbGMoNTAlIC0gMTBweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDEwcHgpO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGtpY2sgMC42cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbi5sb2FkZXItYm91bmNpbmc6YWZ0ZXIge1xcbiAgbWFyZ2luLWxlZnQ6IC0zMHB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGtpY2sgMC42cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjoga2ljayAwLjZzIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuLmxvYWRlci1ib3VuY2luZzpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuMnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC4ycztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGtpY2sge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICB0byB7XFxuICAgIG9wYWNpdHk6IDAuMztcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcmVtKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBraWNrIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBvcGFjaXR5OiAwLjM7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXJlbSk7XFxuICB9XFxufVxcbi5zYmwtY2lyYy1yaXBwbGUge1xcbiAgaGVpZ2h0OiA0OHB4O1xcbiAgd2lkdGg6IDQ4cHg7XFxuICBjb2xvcjogIzQ4NjU5YjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHRvcDogMjAlO1xcbiAgbGVmdDogNDAlO1xcbn1cXG5cXG4uc2JsLWNpcmMtcmlwcGxlOjphZnRlciwgLnNibC1jaXJjLXJpcHBsZTo6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgaGVpZ2h0OiAwO1xcbiAgd2lkdGg6IDA7XFxuICBib3JkZXI6IGluaGVyaXQ7XFxuICBib3JkZXI6IDVweCBzb2xpZDtcXG4gIGJvcmRlci1yYWRpdXM6IGluaGVyaXQ7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBsZWZ0OiA0MCU7XFxuICB0b3A6IDQwJTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjaXJjbGUtcmlwcGxlIDFzIGxpbmVhciBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjaXJjbGUtcmlwcGxlIDFzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuXFxuLnNibC1jaXJjLXJpcHBsZTo6YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAtMC42cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC42cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGNpcmNsZS1yaXBwbGUge1xcbiAgMCUge1xcbiAgICBoZWlnaHQ6IDA7XFxuICAgIHdpZHRoOiAwO1xcbiAgICBsZWZ0OiAxLjZyZW07XFxuICAgIHRvcDogMS42cmVtO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGhlaWdodDogNXJlbTtcXG4gICAgd2lkdGg6IDVyZW07XFxuICAgIGxlZnQ6IC0xcmVtO1xcbiAgICB0b3A6IC0xcmVtO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGNpcmNsZS1yaXBwbGUge1xcbiAgMCUge1xcbiAgICBoZWlnaHQ6IDA7XFxuICAgIHdpZHRoOiAwO1xcbiAgICBsZWZ0OiAxLjZyZW07XFxuICAgIHRvcDogMS42cmVtO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGhlaWdodDogNXJlbTtcXG4gICAgd2lkdGg6IDVyZW07XFxuICAgIGxlZnQ6IC0xcmVtO1xcbiAgICB0b3A6IC0xcmVtO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn0vKiMgc291cmNlTWFwcGluZ1VSTD1zdHlsZS5jc3MubWFwICovXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vY3NzL3N0eWxlLmNzc1wiLFwid2VicGFjazovLy4vY3NzL2Jhc2UvX2N1c3RvbUJhc2Uuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2Jhc2UvX21peGlucy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fZm9vdGVyLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19vcGVuaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19wcm9wZXJ0aWVzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19zaW5nbGUuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX2NvbnN0YW50LnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19zZWFyY2guc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX2xvYWRlci5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fYWxsLW5ld3Muc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3NoYWRvdy1ib3guc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2Rvd25sb2Fkcy9jc3MtbG9hZGVyLmNzc1wiLFwid2VicGFjazovLy4vY3NzL2Rvd25sb2Fkcy9zYmwtY2lyYy1yaXBwbGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBLGdCQUFnQjtBQ0VoQjtFQUNJLGtCQUFBO0VBQ0EsWUFBQTtFQUNBLFNBQUE7QURBSjtBRUVJO0VETEo7SUFXUSxnQkFBQTtFREpOO0FBQ0Y7QUVHSTtFRFhKO0lBY1EsaUJBQUE7RURGTjtBQUNGO0FDSUk7RUFDSSxnQkFBQTtBREZSOztBQ01BO0VBQ0ksU0FBQTtFQUNBLG1CQUFBO0FESEo7O0FDTUE7RUFDSSxT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V0FBQTtFYm9qRUY7RWFsakVBO0lBQ0UsWUFBQTtJQUNBLFdBQUE7SUFDQSxXQUFBO0lBQ0EsVUFBQTtJQUNBLFVBQUE7RWJvakVGO0FBQ0YsQ0FBQSxvQ0FBQVwiLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdOyAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG5cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTsgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcblxuXG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG5cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG5cbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcblxuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblxuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICB2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgcmV0dXJuIFwiLyojIHNvdXJjZVVSTD1cIi5jb25jYXQoY3NzTWFwcGluZy5zb3VyY2VSb290IHx8IFwiXCIpLmNvbmNhdChzb3VyY2UsIFwiICovXCIpO1xuICAgIH0pO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9kb3RzLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vZG90cy5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiLy9Db250aW51ZSB0byB3b3JrIG9uIG1ha2luZyB0aGlzIG1vcmUgZWZmaWNpZW50IGFuZCByZWFkYWJsZVxyXG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCJcclxuaW1wb3J0IFNoYWRvd0JveCBmcm9tICcuL3NoYWRvd0JveCc7XHJcbmNsYXNzIE5ld3Mge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICAvLyB0aGlzLmNsb3NlTWVkaWFCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY2xvc2UnKTtcclxuICAgIGlmKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGwtbmV3cy1jb250YWluZXInKSl7XHJcbiAgICAgICAgdGhpcy5yZXR1cm5Ib21lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3JldHVybi1ob21lJyk7XHJcbiAgICAgICAgICAgICAgICAgLy9MYXRlciwgZmluZCB3YXkgdG8gbWFrZSB0aGlzIG5vdCBjYXVzZSBlcnJvcnMgb24gb3RoZXIgcGFnZXNcclxuICAgICAgICB0aGlzLm1haW5Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxsLW5ld3MtY29udGFpbmVyJyk7XHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbi1kaXNwbGF5Jyk7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2luYXRpb24taG9sZGVyJylcclxuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcExpbmtzO1xyXG4gICAgICAgIHRoaXMuc2VlTW9yZTtcclxuICAgICAgICB0aGlzLmRpc21pc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzbWlzcy1zZWxlY3Rpb24nKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnM7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbFRpdGxlID0gXCJBbGwgTmV3c1wiO1xyXG4gICAgICAgIHRoaXMuc3RvcmVkVGl0bGU7XHJcbiAgICAgICAgdGhpcy5mdWxsRGlzcGxheUNvbnRlbnQgPSBbXTtcclxuICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZXh0ZXJuYWxDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub3JpZ2luO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMubWFpbkhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluLWhlYWRlcicpO1xyXG5cclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25ld3Mtc2VhcmNoXCIpXHJcbiAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSAnJztcclxuICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMucHJldmlvdXNWYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy50eXBpbmdUaW1lcjtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0OyAgICAgIFxyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZnVsbC1kaXNwbGF5LWNvbnRhaW5lcicpOyAgICBcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRBbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQtYWxsJyk7XHJcblxyXG4gICAgICAgIHRoaXMudG9nZ2xlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2dnbGUtb3B0aW9ucycpO1xyXG5cclxuICAgICAgICAvL0FmdGVyIGdldCBldmVyeXRoaW5nIHdvcmtpbmcsIHB1dCB0aGUgc2V0dGluZyBpbiBoZXJlLCByYXJlciB0aGFuIGp1c3QgYSByZWZcclxuICAgICAgICAvL252bS4gTmVlZCB0byBkbyBpdCBub3dcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnJlb3JkZXJCeURhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3JkZXItYnktZGF0ZScpO1xyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5QWxwaGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3JkZXItYnktYWxwaGEnKTtcclxuXHJcbiAgICAgICAgdGhpcy5mdWxsV29yZFN3aXRjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmdWxsLXdvcmQtb25seScpO1xyXG5cclxuICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3b3JkLXN0YXJ0LW9ubHknKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYXNlU2Vuc2l0aXZlU3dpdGNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Nhc2Utc2Vuc2l0aXZlJyk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVRpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2luY2x1ZGUtdGl0bGUnKTtcclxuICAgICAgICB0aGlzLmluY2x1ZGVEZXNjcmlwdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLWRlc2NyaXB0aW9uJyk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVByb3BlcnR5VXBkYXRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLXByb3BlcnR5LXVwZGF0ZXMnKTtcclxuICAgICAgICB0aGlzLmluY2x1ZGVHZW5lcmFsTmV3cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLWdlbmVyYWwtbmV3cycpO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dhYmxlU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGRhdGVPcmRlcjp7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdvcmRlci1ieS1kYXRlJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2Rlc2MnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhbHBoYU9yZGVyOntcclxuICAgICAgICAgICAgICAgIHJlZjogJ29yZGVyLWJ5LWFscGhhJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2Rlc2MnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogZmFsc2VcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5jbHVkZVRpdGxlOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdpbmNsdWRlLXRpdGxlJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbmNsdWRlRGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ2luY2x1ZGUtZGVzY3JpcHRpb24nLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnaW5jbHVkZScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHVwZGF0ZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS1wcm9wZXJ0eS11cGRhdGVzJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuZXdzOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdpbmNsdWRlLWdlbmVyYWwtbmV3cycsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZnVsbFdvcmQ6IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ2Z1bGwtd29yZC1vbmx5JyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2Z1bGwtd29yZC1vbmx5JyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHdvcmRTdGFydE9ubHk6IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ3dvcmQtc3RhcnQtb25seScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICd3b3JkLXN0YXJ0LW9ubHknLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogZmFsc2VcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaXNDYXNlU2Vuc2l0aXZlOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdjYXNlLXNlbnNpdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdjYXNlLXNlbnNpdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRoaXMuZmlsdGVyQnlkYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbHRlci1ieS1kYXRlJylcclxuICAgICAgICAvLyB0aGlzLmlzRGF0ZUZpbHRlck9uID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkYXRlLWZpbHRlcnMnKTtcclxuICAgICAgICB0aGlzLmRhdGVGaWx0ZXJPcHRpb25zID0gdGhpcy5kYXRlRmlsdGVycy5xdWVyeVNlbGVjdG9yQWxsKCdzZWxlY3QnKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy9yYW5nZSBtYWtlcyB0aGUgcHJldmlvdXMgdHdvIG51bGwsIGVmZmVjdGl2ZWx5IGNhbmNlbGluZyB0aGV5IG91dCBhbmQgc2h1dHRpbmcgb2ZmIHRoZWlyIGlmIGxvZ2ljXHJcbiAgICAgICAgLy9idXR0b24gd2lsbCBtYWtlIG9wdGlvbnMgYXBwZWFyIGFuZCBtYWtlIGlzRmlsdGVyT24gPSB0cnVlLCBidXQgaWYgbm8gb3B0aW9uIGlzIHNlbGVjdGVkLCB0aGV5IGRpc3NhcGVhciBhbmQgZmFsc2UgaXMgcmVzdG9yZWQgXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyU2V0VXAgPSB7XHJcbiAgICAgICAgICAgIG1vbnRoOiBudWxsLFxyXG4gICAgICAgICAgICB5ZWFyOiBudWxsLFxyXG4gICAgICAgICAgICAvLyByYW5nZToge1xyXG4gICAgICAgICAgICAvLyAgICAgc3RhcnQ6IG51bGwsXHJcbiAgICAgICAgICAgIC8vICAgICBlbmQ6IG51bGxcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy55ZWFyT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNieS15ZWFyJyk7XHJcbiAgICAgICAgdGhpcy5tb250aE9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnktbW9udGgnKTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy55ZWFyTGlzdCA9IHt9XHJcbiAgICAgICAgdGhpcy5tb250aHMgPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMudG9nZ2FibGVTZXR0aW5ncztcclxuICAgICAgICB0aGlzLmV2ZW50cyh0YXJnZXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50cyh0YXJnZXQpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGNvbnN0IGRlZmF1bHRTd2l0Y2hTZXR0aW5ncyA9IHsuLi50aGlzLnRvZ2dhYmxlU2V0dGluZ3MsIGFscGhhT3JkZXI6IHsuLi50aGlzLnRvZ2dhYmxlU2V0dGluZ3MuYWxwaGFPcmRlcn19O1xyXG4gICAgICAgIGxldCBkZWZhdWx0U3dpdGNoU2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMudG9nZ2FibGVTZXR0aW5ncykpXHJcblxyXG4gICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG5cclxuICAgICAgICB0aGlzLnBvcHVsYXRlRGF0ZUZpbHRlcnMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXNldEFsbC5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgdGhpcy50b2dnbGVUZXh0KGRlZmF1bHRTd2l0Y2hTZXR0aW5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2FibGVTZXR0aW5ncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFN3aXRjaFNldHRpbmdzKSk7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IHRoaXMudG9nZ2FibGVTZXR0aW5nczsgXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5kYXRlT3JkZXIsIHRhcmdldC5kYXRlT3JkZXIpXHJcbiAgICAgICAgICAgIHRoaXMud29yZFNlYXJjaFBvc2l0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGRlZmF1bHRTd2l0Y2hTZXR0aW5ncy5pc0Nhc2VTZW5zaXRpdmUpXHJcbiAgICAgICAgICAgIC8vIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgJHt0aGlzLmluaXRpYWxUaXRsZX1gO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXBvcnQgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NTZWFyY2gudmFsdWUgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5kaXNtaXNzU2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICAgICAgLy8gdGhpcy5tZWRpYUNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgIHRoaXMueWVhck9wdGlvbnMudmFsdWUgPSAnJ1xyXG4gICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZSA9ICcnXHJcbiAgICAgICAgICAgIHRoaXMueWVhck9wdGlvbnMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcclxuICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coeWVhci5vcHRpb25zW3llYXIuc2VsZWN0ZWRJbmRleF0udmFsdWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vZGVzYyBkYXRlIG5vdCB3b3JraW5nXHJcbiAgICAgICAgdGhpcy5yZW9yZGVyQnlEYXRlLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyKVxyXG4gICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5pc09uID0gZmFsc2VcclxuICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID0gJ2Rlc2MnXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0YXJnZXQuZGF0ZU9yZGVyLmlzT24gPSB0cnVlXHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQuZGF0ZU9yZGVyLmRpcmVjdGl2ZSA9PT0gJ2Rlc2MnKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuZGlyZWN0aXZlID0gJ2FzYydcclxuICAgICAgICAgICAgfWVsc2UoXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZGF0ZU9yZGVyLmRpcmVjdGl2ZSA9ICdkZXNjJ1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgIH07XHJcbi8vaW5pYXRlIHRvZ2dsZSB0aHJvdWdoIHRoZXNlLCB1c2luZyBsZXRzIHRvIGhhbmRsZSBib3RoIGNoYW5nZXMgYmFzZWQgb24gdGhlIC5kaXJlY3RpdmUgdmFsdWUsIFxyXG4vL2FuZCBtYXliZSBldmVuIHNldHRpbmcgaW50aWFsIGhpZGluZyB0aGlzIHdheSB0b28gXHJcbiAgICAgICAgdGhpcy5yZW9yZGVyQnlBbHBoYS5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5pc09uID0gZmFsc2VcclxuICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRhcmdldC5hbHBoYU9yZGVyLmlzT24gPSB0cnVlXHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQuYWxwaGFPcmRlci5kaXJlY3RpdmUgPT09ICdkZXNjJyl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5kaXJlY3RpdmUgPSAnYXNjJ1xyXG4gICAgICAgICAgICB9ZWxzZShcclxuICAgICAgICAgICAgICAgIHRhcmdldC5hbHBoYU9yZGVyLmRpcmVjdGl2ZSA9ICdkZXNjJ1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVByb3BlcnR5VXBkYXRlcy5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LnVwZGF0ZS5pc09uID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC51cGRhdGUuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC51cGRhdGUuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gIFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVHZW5lcmFsTmV3cy5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0Lm5ld3MuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQubmV3cy5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm5ld3MuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZnVsbFdvcmRTd2l0Y2gub25jbGljayA9ICgpPT57XHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQuZnVsbFdvcmQuaXNPbil7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZnVsbFdvcmQuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24uY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfWVsc2V7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZnVsbFdvcmQuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQud29yZFN0YXJ0T25seS5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbi5jbGFzc0xpc3QuYWRkKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgd29yZCBzdGFydCBvbmx5IGlzOiAke3RhcmdldC53b3JkU3RhcnRPbmx5LmlzT259YClcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYGZ1bGwgd29yZCBvbmx5IGlzOiAke3RhcmdldC5mdWxsV29yZC5pc09ufWApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbi5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbil7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQud29yZFN0YXJ0T25seS5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGB3b3JkIHN0YXJ0IG9ubHkgaXM6ICR7dGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbn1gKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYXNlU2Vuc2l0aXZlU3dpdGNoLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYGNhc2Ugc2Vuc2l0aXZlIGlzOiAke3RhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbn1gKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbmNsdWRlVGl0bGUub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5pbmNsdWRlVGl0bGUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZURlc2NyaXB0aW9uLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZURlc2NyaXB0aW9uLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVEZXNjcmlwdGlvbi5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVEZXNjcmlwdGlvbi5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyB0aGlzLmluY2x1ZGVSZWxhdGlvbnNoaXAub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgLy8gICAgIGlmKHRoaXMuc2VhcmNoYWJsZUZpZWxkcy5yZWxhdGlvbnNoaXBzKXtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuc2VhcmNoYWJsZUZpZWxkcy5yZWxhdGlvbnNoaXBzID0gZmFsc2U7XHJcbiAgICAgICAgLy8gICAgIH1lbHNle1xyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5zZWFyY2hhYmxlRmllbGRzLnJlbGF0aW9uc2hpcHMgPSB0cnVlO1xyXG4gICAgICAgIC8vICAgICB9ICBcclxuICAgICAgICAvLyB9O1xyXG5cclxuICAgICAgICAvLyB0aGlzLmZpbHRlckJ5ZGF0ZS5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAvLyAgICAgdGhpcy5kYXRlRmlsdGVycy5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAvLyAgICAgdGhpcy5pc0RhdGVGaWx0ZXJPbiA9IHRydWU7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKHRoaXMuaXNEYXRlRmlsdGVyT24pXHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICB0aGlzLmRhdGVGaWx0ZXJPcHRpb25zLmZvckVhY2goZSA9PntcclxuICAgICAgICAgICAgZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAob3B0aW9uKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRNb250aCA9IHRoaXMubW9udGhPcHRpb25zLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKGUuaWQgPT09ICdieS15ZWFyJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMueWVhck9wdGlvbnMudmFsdWUgIT09ICcnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Bbnk8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy55ZWFyTGlzdFt0aGlzLnllYXJPcHRpb25zLnZhbHVlXS5tYXAobW9udGg9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7bW9udGh9XCI+JHttb250aH08L29wdGlvbj5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Bbnk8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMubW9udGhzLm1hcChtb250aD0+IGA8b3B0aW9uIHZhbHVlPVwiJHttb250aH1cIj4ke21vbnRofTwvb3B0aW9uPmApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLm1vbnRoT3B0aW9ucy5xdWVyeVNlbGVjdG9yKGBvcHRpb25bdmFsdWU9JyR7Y3VycmVudE1vbnRofSddYCkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMudmFsdWUgPSBjdXJyZW50TW9udGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLnZhbHVlID0gJydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IG9wdGlvbi50YXJnZXQuaWQuc2xpY2UoMyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGVGaWx0ZXJTZXRVcFt2YWx1ZV0gPSBvcHRpb24udGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5kYXRlRmlsdGVyU2V0VXApXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2guYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsICgpID0+IHRoaXMudHlwaW5nTG9naWMoKSlcclxuXHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5kaXNtaXNzU2VsZWN0aW9uKCkpXHJcblxyXG4gICAgICAgIHRoaXMudG9nZ2xlVGV4dCh0YXJnZXQpO1xyXG4gICAgICAgIHRoaXMudG9nZ2xlT3B0aW9ucy5mb3JFYWNoKGU9PntlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PiB0aGlzLnRvZ2dsZVRleHQodGFyZ2V0KSl9KVxyXG4gICAgfVxyXG4vL0FkZCAnaXNPbicgdG8gZXhjbHVkZXMsIHdpdGggaW5jbHVkZSBoYXZpbmcgY2xhc3Mgb2ZmIGFuZCBleGNsdWRlIGhhdmluZyBjbGFzcyBvZiAqdmFsdWU/XHJcbiAgICB0b2dnbGVUZXh0KHRhcmdldCl7XHJcbiAgICAgICAgbGV0IGZpbHRlcktleXMgPSBPYmplY3Qua2V5cyh0YXJnZXQpXHJcbiAgICAgICAgZmlsdGVyS2V5cy5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgIyR7dGFyZ2V0W2VdLnJlZn0gc3BhbmApLmZvckVhY2goaT0+aS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSlcclxuICAgICAgICAgICAgaWYodGFyZ2V0W2VdLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGFyZ2V0W2VdLnJlZn0gLiR7dGFyZ2V0W2VdLmRpcmVjdGl2ZX1gKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0YXJnZXRbZV0ucmVmfSAub2ZmYCkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8vUmVkbyBwYWdpbmF0aW9uLCBidXQgd2lsbCBuZWVkIHRvIGhhdmUgc2V0dXAgd29yayBmb3IgZ2V0dGluZyByaWQgdGhyb3VnaCBlYWNoIHJlbG9hZFxyXG4gICAgXHJcbiAgICAvL2NoZWNrIHBhZ2luYXRpb24gdGhyb3VnaG91dCBlYWNoIGFkZFxyXG5cclxuICAgIC8vZXN0YWJsaXNoIGRlZmF1bHQgc2VhcmNoIGJlaGF2aW9yLiBBcyBpbiwgZG9lcyBpdCBsb29rIGF0IHRpdGxlLCBiaW8sIFxyXG4gICAgLy9hbmQgY2FwdGlvbiBwYXJ0aWFscyBhdCB0aGUgc3RhcnQ/KGluIGlmIHN0YXRlbWVudHMgdXNlIGNvbnRhaW5zIG9uIHN0cmluZ3M/KVxyXG4gICAgLy9pbiBnYXRoZXJOZXdzKCkgaGF2ZSBpZiBzdGF0ZW1lbnRzIHRoYXQgd29yayB0aHJvdWdoIHRoZSBkYXRhIGFmdGVyIGl0J3MgZ290dGVuLCBiZWZvcmUgdGhlIGluc2VydGlvbnNcclxuICAgIC8vV2hlbiBjbGljayBvbiBuZXdzLCB1c2UgYmlnZ2VyIHBpY3R1cmUuIEFsc28gcHV0IGluIGR1bW15LCBcclxuICAgIC8vcmVsYXRlZCBzaXRlcyBvbiB0aGUgcmlnaHQsIGFuZCBtYXliZSBldmVuIHJlbGF0ZWQgbWVtYmVycyBhbmQgcHJvcGVydGllcyh0aXRsZSBvdmVyIGFuZCB3aXRoIGxpbmtzKVxyXG4gICAgLy9BbHNvIGxpc3Qgb3RoZXIgbmV3cyByZWxhdGVkIHRvIGl0LCBsaWtlIGlmIGFsbCBhYm91dCBzYW1lIGJ1aWxkaW5nIG9yIG1lbWJlcihjYW4gdXNlIGNtbW9uIHJlbGF0aW9uIGZvciB0aGF0IGJ1dCBcclxuICAgIC8vbmVlZCB0byBhZGQgYSBuZXcgZmllbGQgZm9yIHR5cGVzIG9mIHJlbGF0aW9uc2hpcHMpXHJcbiAgICAvL0dpdmUgdGl0bGVzIHRvIG90aGVyIHNlY3Rpb25zLCB3aXRoIHRoZSByaWdodCBiZWluZyBkaXZpZGVkIGludG8gcmVsYXRlZCBsaW5rcyBhbmQgc2VhcmNoIG1vZGlmaWNhdGlvbnNcclxuICAgIC8vUmVtZW1iZXIgZnVuY3Rpb25hbGl0eSBmb3Igb3RoZXIgcGFydHMgbGlua2luZyB0byBoZXJlXHJcbiAgICB0eXBpbmdMb2dpYygpIHtcclxuICAgICAgICAvL0F1dG9tYXRpY2FsbHkgZGlzbWlzcyBzaW5nbGUgb3IgaGF2ZSB0aGlzIGFuZCBvdGhlciBidXR0b25zIGZyb3plbiBhbmQvb3IgaGlkZGVuIHVudGlsIGRpc21pc3NlZFxyXG4gICAgICAgIC8vTGVhbmluZyB0b3dhcmRzIHRoZSBsYXR0ZXIsIGFzIGZhciBsZXNzIGNvbXBsaWNhdGVkXHJcbiAgICAgICAgaWYgKHRoaXMubmV3c1NlYXJjaC52YWx1ZSAhPT0gdGhpcy5wcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5kaXNtaXNzU2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50eXBpbmdUaW1lcilcclxuICAgIFxyXG4gICAgICAgICAgaWYgKHRoaXMubmV3c1NlYXJjaC52YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNTcGlubmVyVmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gdGhpcy5uZXdzU2VhcmNoLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYFNob3dpbmcgUmVzdWx0cyBmb3I6ICR7dGhpcy5uZXdzRGVsaXZlcnl9YDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnR5cGluZ1RpbWVyID0gc2V0VGltZW91dCh0aGlzLmdhdGhlck5ld3MuYmluZCh0aGlzKSwgNzUwKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gXCJcIjtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGAke3RoaXMuaW5pdGlhbFRpdGxlfWA7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLm5ld3NTZWFyY2gudmFsdWVcclxuICAgICAgfVxyXG5cclxuICAgICAgYXN5bmMgcG9wdWxhdGVEYXRlRmlsdGVycygpe1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgLy9JcyBpdCBiZXR0ZXIganVzdCB0byB1c2Ugc2VwZXJhdGUgdXJsIHJvdXRlcz8gXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9hbGwtbmV3cz9uZXdzJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVzID0gW107XHJcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0RGF0ZXMgPSBbXTtcclxuICAgICAgICAgICAgLy8gY29uc3QgeWVhcnMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpXHJcblxyXG4gICAgICAgICAgICByZXN1bHRzLnVwZGF0ZXNBbmROZXdzLmZvckVhY2gobmV3cz0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkYXRlcy5pbmNsdWRlcyhuZXcgRGF0ZShuZXdzLmRhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tdXMnLCB7bW9udGg6ICdsb25nJywgeWVhcjogJ251bWVyaWMnfSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXMucHVzaChuZXcgRGF0ZShuZXdzLmRhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tdXMnLCB7bW9udGg6ICdsb25nJywgeWVhcjogJ251bWVyaWMnfSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhkYXRlcylcclxuXHJcbiAgICAgICAgICAgIGRhdGVzLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICAgICAgc3BsaXREYXRlcy5wdXNoKGUuc3BsaXQoJyAnKSlcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNwbGl0RGF0ZXMpXHJcblxyXG4gICAgICAgICAgICBzcGxpdERhdGVzLmZvckVhY2goZGF0ZT0+e1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLm1vbnRocy5pbmNsdWRlcyhkYXRlWzBdKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aHMucHVzaChkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8gaWYoIXllYXJzLmluY2x1ZGVzKGRhdGVbMV0pKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyB5ZWFycy5wdXNoKGRhdGVbMV0pXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ZWFyTGlzdFtkYXRlWzFdXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHllYXJzID0gT2JqZWN0LmtleXModGhpcy55ZWFyTGlzdClcclxuXHJcbiAgICAgICAgICAgIHllYXJzLmZvckVhY2goeWVhcj0+e1xyXG4gICAgICAgICAgICAgICAgc3BsaXREYXRlcy5mb3JFYWNoKGRhdGU9PntcclxuICAgICAgICAgICAgICAgICAgICBpZih5ZWFyID09PSBkYXRlWzFdKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy55ZWFyTGlzdFt5ZWFyXS5wdXNoKGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnllYXJMaXN0KVxyXG5cclxuICAgICAgICAgICAgbGV0IGFsbE1vbnRocyA9IFsnSmFudWFyeScsJ0ZlYnJ1YXJ5JywnTWFyY2gnLCAnQXByaWwnLCdNYXknLCdKdW5lJywnSnVseScsJ0F1Z3VzdCcsJ1NlcHRlbWJlcicsJ09jdG9iZXInLCdOb3ZlbWJlcicsJ0RlY2VtYmVyJ107XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vbnRocy5zb3J0KGZ1bmN0aW9uKGEsYil7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWxsTW9udGhzLmluZGV4T2YoYSkgPiBhbGxNb250aHMuaW5kZXhPZihiKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHllYXJzLnNvcnQoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMueWVhck9wdGlvbnMuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPkFueTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgJHt5ZWFycy5tYXAoeWVhcj0+IGA8b3B0aW9uIHZhbHVlPVwiJHt5ZWFyfVwiPiR7eWVhcn08L29wdGlvbj5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgYDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Bbnk8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICR7dGhpcy5tb250aHMubWFwKG1vbnRoPT4gYDxvcHRpb24gdmFsdWU9XCIke21vbnRofVwiPiR7bW9udGh9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcblxyXG4gICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgYXN5bmMgZ2F0aGVyTmV3cygpe1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3NcclxuICAgICAgICAvL1B1dCByZXN1bHRzIGluIHZhciBjb3B5LCBqdXN0IGxpa2UgaW4gdGhlIHNoYWRvd2JveFxyXG4gICAgXHJcbiAgICAgICAgLy9NYXliZSwgdG8gc29sdmUgY2VydGFpbiBpc3N1ZXMgb2YgJ3VuZGVmaW5lZCcsIGFsbG93IHBhZ2luYXRpb24gZXZlbiB3aGVuIG9ubHkgMSBwYWdlLCBhcyBJIHRoaW5rIG5leHQgYW5kIHByZXYgd2lsbCBiZSBoaWRkZW4gXHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAvL0lzIGl0IGJldHRlciBqdXN0IHRvIHVzZSBzZXBlcmF0ZSB1cmwgcm91dGVzPyBcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL2FsbC1uZXdzP25ld3M9JyArIHRoaXMubmV3c0RlbGl2ZXJ5KTsgXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhOyBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3VsdHMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIC8vbWF5YmUgYWxsb3dpbmcgYSBvbmUgb24gdGhlIHBhZ2luYXRpb24gd291bGQgc29sdmUgdGhlIGVycm9yc1xyXG5cclxuICAgICAgICAgICAgLy9Gb3IgZmllbGQgZXhjbHVzaW9uLCBjb3VsZCBoYXZlIGNvZGUgcHJvY2Vzc2VkIHdpdGggbWF0Y2hlcygpIG9yIGluZGV4T2Ygb24gdGhlIGZpZWxkcyB0aGF0IGFyZW4ndCBiYW5uZWRcclxuICAgICAgICAgICAgLy9UYWtlIG91dCB0aG9zZSB0aGF0IHByb2R1Y2UgYSBmYWxzZSByZXN1bHRcclxuXHJcbiAgICAgICAgICAgIGxldCBhbGxOZXdzID0gcmVzdWx0cy51cGRhdGVzQW5kTmV3cztcclxuXHJcbiAgICAgICAgICAgIGxldCByZWxhdGVkUG9zdHMgPSByZXN1bHRzLnByb3BlcnRpZXNBbmRNZW1iZXJzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBvc3RSZWxhdGlvbnNoaXBzID0gW107XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBhbGxOZXdzLm1hcChuZXdzPT57XHJcbiAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChwb3N0PT57XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYCR7bmV3cy50aXRsZX06ICR7cG9zdC5JRH1gKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpIDwgcmVsYXRlZFBvc3RzLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5JRCA9PT0gcmVsYXRlZFBvc3RzW2ldLmlkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RSZWxhdGlvbnNoaXBzLnB1c2gocmVsYXRlZFBvc3RzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHBvc3RSZWxhdGlvbnNoaXBzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld3MucmVsYXRpb25zaGlwcyA9IHBvc3RSZWxhdGlvbnNoaXBzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHBvc3RSZWxhdGlvbnNoaXBzID0gW107XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgbiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xyXG4gICAgICAgICAgICBpZihuLmluZGV4T2YoJyMnKSA+IC0xKXtcclxuICAgICAgICAgICAgICAgIG4gPSBuLnNwbGl0KC9bLy1dKy8pXHJcbiAgICAgICAgICAgICAgICBpZihuWzRdLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobls1XS5pbmRleE9mKCduZXdzJykgPiAtMSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuc2luZ2xlQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSB0cnVlOyBcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gYCR7bls0XX1gOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSBgJHtuWzRdfWA7IFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbiA9IG5bNl07ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJlcG9ydCA9IG5bNF0uc2xpY2UoMSk7IFxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSgnJywgJycsIGAvJHtuWzJdfS0ke25bM119YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaGlzdG9yeS5nbygtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leHRlcm5hbENhbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbmV3c1R5cGVzID0gWyduZXdzJywgJ3VwZGF0ZSddO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGFDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld3NPdXRwdXQgPSAyO1xyXG4gICAgICAgICAgICBsZXQgcGFnZUNvdW50ID0gMDtcclxuICAgICAgICAgICAgbGV0IG5ld3NQYWdlID0gW107XHJcbiAgICAgICAgICAgIGxldCBuZXdzUGFnZXMgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGNvbnRlbnRTaG93bjtcclxuXHJcbiAgICAgICAgICAgIC8vIC8vaWYgc3ltYm9sIGVudGVyZWQgYXMgb25seSB0aGluZywgaXQnbGwgbXkgbG9naWMsIHNvbWV0aW1lcy4gUmVtZWR5IHRoaXMuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZighdGhpcy5mdWxsRGlzcGxheSB8fCB0aGlzLmJhY2tncm91bmRDYWxsKXtcclxuICAgICAgICAgICAgICAgIC8vRG8gc3RhcnQgdnMgYW55d2hlcmUgaW4gdGhlIHdvcmRcclxuICAgICAgICAgICAgICAgIC8vU3RhcnQgb25seSBpcyBzdGFuZGFyZCBhbmQgYXV0byB0cnVlIHdoZW4gd2hvbGUgd29yZCBpcyB0dXJuZWQgb24oPykgb3Igc2ltcGx5IGJ1cmllZCBpbiBwYXJ0aWFsIGlmXHJcbiAgICAgICAgICAgICAgICAvL2l0IHNob3VsZCBhdCBsZWFzdCBiZSBpbmFjZXNzaWJsZSBvbiB0aGUgZnJvbnRlbmQgd2l0aCB2aXN1YWwgY3VlXHJcblxyXG4gICAgICAgICAgICAgICAgLy9EbyBhIG1vcmUgdGhvcm91Z2ggdGVzdCBvZiB0aG9zZSBsYXRlciBhZnRlciByZWwgYW5kICdkaXNsYXktcXVhbGl0eScgYXJ0aWNsZXMgY3JlYXRlZCBcclxuXHJcbiAgICAgICAgICAgICAgICAvL0RvIGJhc2ljIG1vbnRoIGFuZCB5ZWFyIGFuZCByYW5nZSBwaWNraW5nLCBiZWZvcmUgbG9va2luZyBpbnRvIHBvcC11cCBhbmQgZmlndXJpbmcgb3V0IGhvdyB0byBnZXQgaW5mbyBmcm9tIHdoYXQgaXMgc2VsZWN0ZWQgb24gaXRcclxuICAgICAgICAgICAgICAgIGxldCBmdWxsTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpdGxlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlc2MgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCByZWwgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm5ld3NEZWxpdmVyeSAhPT0gJycpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZWQnKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLm5ld3NEZWxpdmVyeS5zdGFydHNXaXRoKCcjJykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVxdWVzdGVkSWQgPSB0aGlzLm5ld3NEZWxpdmVyeS5yZXBsYWNlKCcjJywgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhc3NvY2lhdGVkTmV3cyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3MgPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChyPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoci5pZCA9PT0gcGFyc2VJbnQocmVxdWVzdGVkSWQpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzb2NpYXRlZE5ld3MucHVzaChuZXdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHIudGl0bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFzc29jaWF0ZWROZXdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MgPSBhc3NvY2lhdGVkTmV3cztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZXh0ZXJuYWxDYWxsKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMub3JpZ2luKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leHRlcm5hbENhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNWYWx1ZSA9IHRoaXMubmV3c1NlYXJjaC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXR1cm5Ib21lLmhyZWY9YCR7c2l0ZURhdGEucm9vdF91cmx9LyMke3RoaXMub3JpZ2lufUNvbnRhaW5lcmA7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVkVGl0bGUgPSBgU2hvd2luZyBSZXN1bHRzIGZvcjogJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXsgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pbmNsdWRlVGl0bGUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuZnVsbFdvcmQuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzID0gYWxsTmV3cy5maWx0ZXIoKG5ld3MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIikuaW5jbHVkZXModGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmKCF0YXJnZXQuZnVsbFdvcmQuaXNPbiAmJiB0YXJnZXQud29yZFN0YXJ0T25seS5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLmZvckVhY2gobmV3cz0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYobmV3cy50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3c1NwbGl0ID0gbmV3cy50aXRsZS50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgZSBvZiBuZXdzU3BsaXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUuc3RhcnRzV2l0aCh0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlcy5wdXNoKG5ld3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIG51bGw7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlcyA9IGFsbE5ld3MuZmlsdGVyKG5ld3M9PiBuZXdzLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMgPSB0aXRsZXMuZmlsdGVyKG5ld3M9PiBuZXdzLnRpdGxlLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkpICE9PSAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuZnVsbFdvcmQuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzYyA9IGFsbE5ld3MuZmlsdGVyKChuZXdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdzLmZ1bGxEZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKS5pbmNsdWRlcyh0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaWYgZmlyZWQhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmKCF0YXJnZXQuZnVsbFdvcmQuaXNPbiAmJiB0YXJnZXQud29yZFN0YXJ0T25seS5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLmZvckVhY2gobmV3cz0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYobmV3cy5mdWxsRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld3NTcGxpdCA9IG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBlIG9mIG5ld3NTcGxpdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZS5zdGFydHNXaXRoKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzYy5wdXNoKG5ld3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MgPSBhbGxOZXdzLmZpbHRlcihuZXdzPT4gbmV3cy5mdWxsRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzYyA9IGRlc2MuZmlsdGVyKG5ld3M9PiBuZXdzLmZ1bGxEZXNjcmlwdGlvbi5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5KSAhPT0gLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VhcmNoZWROZXdzID0gZnVsbExpc3QuY29uY2F0KHRpdGxlcywgZGVzYywgcmVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MgPSBbXTsgXHJcbiAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoZWROZXdzLmZvckVhY2goKG5ld3MpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFsbE5ld3MuaW5jbHVkZXMobmV3cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnB1c2gobmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy9EYXRlcyBiZWxvbmcgdG8gYSBzZXBlcmF0ZSBsb2dpYyB0aHJlYWQsIGFuZCBhcyBzdWNoIHNob3VsZCBub3l0IGJlIGxpbmtlZCB0byB0eXBpbmcuIFRoZXkgYWUgY2xvc2VyIHRvIHRoZSBzb3J0cyBpbiB0aGF0IFxyXG4gICAgICAgICAgICAgICAgLy90aGV5IGNhbiBiZSBhZnRlciB0aGUgdHlwaW5nLCBiZWZvcmUsIG9yIGV2ZW4gYmUgdXNlZCB3aXRob3V0IGl0XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vQWZ0ZXIgSSBmaW5pc2ggdGhlIGNvcmUgbG9naWMsIGFkZCBpbiBmdW5jdGlvbmFsaXR5IHRoYXQgaGFzIGFueSBhcyBvcHRpb24gZm9yICd5ZWFyJywgd2l0aCBzZWxlY3Rpb24gb2Ygc3BlY2lmaWMgXHJcbiAgICAgICAgICAgICAgICAvL2xpbWl0aW5nIHRoZSAnbW9udGgnIHZhbHVlcyBhbmQgc2VsZWN0aW5nIHRoZSBlYXJsaWVzdCBvbmUgYXMgdGhlIGRlZmF1bHQgZmlsdGVyIGZvciAnbW9udGgnIG9yICdhbnknXHJcbiAgICAgICAgICAgICAgICAvL0ZpbHRlciBieSBkYXRlIHdpbGwgYmUgYSBib29sZWFuIHdpdGggZHJvcGRvd24gZGVmYXVsdHMgb2YgYW55IGZvciBib3RoXHJcblxyXG4gICAgICAgICAgICAgICAgIGxldCBkYXRlRmlsdGVyc1NldCA9IE9iamVjdC5rZXlzKHRoaXMuZGF0ZUZpbHRlclNldFVwKTtcclxuICAgICAgICAgICAgICAgIC8vICBjb25zb2xlLmxvZyhgY29udGVudExvYWRlZCA9ICR7dGhpcy5jb250ZW50TG9hZGVkfWApXHJcblxyXG4gICAgICAgICAgICAgICAgIGZvcihsZXQgZmlsdGVyIG9mIGRhdGVGaWx0ZXJzU2V0KXtcclxuICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5kYXRlRmlsdGVyU2V0VXBbZmlsdGVyXSl7ICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cyA9IGFsbE5ld3MuZmlsdGVyKChuZXdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3IERhdGUobmV3cy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLXVzJywge21vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJ30pLmluY2x1ZGVzKHRoaXMuZGF0ZUZpbHRlclNldFVwW2ZpbHRlcl0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgXHJcbiAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5kYXRlT3JkZXIuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy50b2dnYWJsZVNldHRpbmdzLmRhdGVPcmRlci5kaXJlY3RpdmUgPT09ICdhc2MnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5zb3J0KChhLCBiKSA9PiBuZXcgRGF0ZShhLmRhdGUpIC0gbmV3IERhdGUoYi5kYXRlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3Muc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYS5kYXRlKSAtIG5ldyBEYXRlKGIuZGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnJldmVyc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXIuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9jYWxlQ29tcGFyZSBkb2VzIGEgc3RyaW5nIGNvbXBhcmlzb24gdGhhdCByZXR1cm5zIC0xLCAwLCBvciAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhLnRpdGxlLmxvY2FsZUNvbXBhcmUoYi50aXRsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuYWxwaGFPcmRlci5kaXJlY3RpdmUgPT09ICdkZXNjJyl7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnJldmVyc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9ICAgICAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbmV3c1R5cGVzLmZvckVhY2goKHR5cGUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0W3R5cGVdLmlzT24gIT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gYWxsTmV3cy5maWx0ZXIobmV3cz0+IG5ld3MucG9zdFR5cGUgIT09IHR5cGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgICAgICBpZihhbGxOZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoYWxsTmV3cy5sZW5ndGggPD0gbmV3c091dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gbmV3c1BhZ2VzLmNvbmNhdChhbGxOZXdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChhbGxOZXdzLmxlbmd0aCA+IG5ld3NPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpdGVtID0gMTsgaXRlbSA8PSBuZXdzT3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZW1vdmVkID0gYWxsTmV3cy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFsbE5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZSA9IGFsbE5ld3Muc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKG5ld3NQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKG5ld3NQYWdlcy5sZW5ndGgpeyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBuZXdzUGFnZXNbdGhpcy5jdXJyZW50UGFnZXNdO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFNob3duID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxpdmVyTmV3cyhjb250ZW50U2hvd24pXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmNvbnRlbnRMb2FkZWQgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzYCkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBbmRQcmV2aW91cygpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYoY29udGVudFNob3duLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0UGFnaW5hdGlvbihuZXdzUGFnZXMsIGRhdGFDb3VudCwgcGFnZUNvdW50KTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QWN0aXZhdGlvbigpOyBcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vVGhpcyBuZWVkcyB0byBjaGFuZ2UgdG9cclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlT3B0aW9ucy5mb3JFYWNoKG8gPT4ge28uY2xhc3NMaXN0LmFkZCgnaW5hY3RpdmUnKTt9KTsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGVGaWx0ZXJPcHRpb25zLmZvckVhY2goZiA9PiB7Zi5kaXNhYmxlZCA9IHRydWV9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250ZW50ID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCBuZXdzIG9mIGFsbE5ld3Mpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmNsYXNzTGlzdC5hZGQoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5jbGFzc0xpc3QuYWRkKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzbWlzc0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3NlcGVyYXRlIHRoZSBpbnNlcnRpb25zIHRvIGEgZnVuY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvL1VzZSBpZiB0byB2YXJ5IGlmIGxvb2sgZm9yIG5ld3Mgd2l0aCB0aGF0IG9yIG9uZXMgd2l0aCByZWxhdGlvbnNoaXAgdGhhdCBoYXMgdGhhdFxyXG4gICAgICAgICAgICAgICAgICAgIC8vbWFrZSBhcnJheSBvZiBlYWNoIG5ld3MncyByZWxhdGlvbnNoaXBzW2dpdmUgdGhlIGZpcnN0IHBvc3QgMiBmb3IgdGVzdGluZyBvZiBpZiBjaGVja2luZyBhcmF5IHByb3Blcmx5XVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZnVsbERpc3BsYXkpeyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGVkSWRzID0gW25ld3MuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld3MucmVsYXRpb25zaGlwcy5mb3JFYWNoKHI9PnRoaXMuY2FsbGVkSWRzLnB1c2goci5pZCkpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmNhbGxlZElkcy5pbmNsdWRlcyhwYXJzZUludCh0aGlzLmN1cnJlbnRSZXBvcnQpKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250ZW50LnB1c2gobmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgJHtuZXdzLnRpdGxlfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGVkSWRzID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYodGhpcy5zaW5nbGVDYWxsKXsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsaXZlck5ld3ModGhpcy5mdWxsRGlzcGxheUNvbnRlbnQsIHRoaXMuZnVsbERpc3BsYXlDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5leHRlcm5hbENhbGwpXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmZ1bGxEaXNwbGF5ICYmIHRoaXMuZXh0ZXJuYWxDYWxsKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJhY2tncm91bmRDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTsgIFxyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlbGl2ZXJOZXdzKGNvbnRlbnRTaG93biwgZGVzdGluYXRpb24gPSB0aGlzLm5ld3NSZWNpZXZlcil7XHJcbiAgICAgICAgZGVzdGluYXRpb24uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAke2NvbnRlbnRTaG93bi5sZW5ndGggPyBgPHVsPmAgIDogJ05vIGFydGljbGVzIG1hdGNoIHlvdXIgY3JpdGVyaWEnfVxyXG4gICAgICAgICAgICAkeyFjb250ZW50U2hvd24ubGVuZ3RoID8gYDxidXR0b24gaWQ9XCJzZWFyY2hSZXNldFwiPlBsZWFzZSB0cnkgYSBkaWZmZXJlbnQgcXVlcnkgb3IgY2hhbmdlIHlvdXIgZmlsdGVycy48L2J1dHRvbj5gICA6ICcnfVxyXG4gICAgICAgICAgICAgICAgJHtjb250ZW50U2hvd24ubWFwKHJlcG9ydCA9PiBgXHJcbiAgICAgICAgICAgICAgICA8bGk+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5ld3NcIj4gICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHshdGhpcy5mdWxsRGlzcGxheSA/IGA8aDQ+JHtyZXBvcnQudGl0bGV9PC9oND5gIDogJyd9XHJcbiAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3JlcG9ydC5jYXB0aW9uLmxlbmd0aCA+PSAxID8gcmVwb3J0LmNhcHRpb24gKyAnIC0gJyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXBvcnQuZGF0ZX0gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7cmVwb3J0LnJlbGF0aW9uc2hpcHMubWFwKHJlbGF0aW9uc2hpcCA9PiBgPHNwYW4gY2xhc3M9XCJuYW1lXCI+JHtyZWxhdGlvbnNoaXAudGl0bGV9PC9zcGFuPiAgJHshdGhpcy5mdWxsRGlzcGxheSA/IGA8YSBjbGFzcz1cInJlbGF0aW9uc2hpcC1saW5rXCIgZGF0YS1yZWxhdGVkPVwiJHtyZWxhdGlvbnNoaXAuaWR9XCI+KEFzc29jaWF0ZWQgTmV3cyk8L2E+IGAgOiBgPGEgY2xhc3M9XCJyZWxhdGlvbnNoaXAtbGluayBkaXNtaXNzZWRcIiBkYXRhLXJlbGF0ZWQ9XCIke3JlbGF0aW9uc2hpcC5pZH1cIj4oQXNzb2NpYXRlZCBOZXdzKTwvYT4gYH08YSBjbGFzcz1cInNpbmdsZS1saW5rXCIgaHJlZj1cIiR7cmVsYXRpb25zaGlwLnBlcm1hbGlua31cIj4oVmlldyBQcm9maWxlKTwvYT5gKX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYS1jYXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGRhdGEtaWQ9XCIke3JlcG9ydC5pZH1cIiBkYXRhLXBvc3Q9XCIke3JlcG9ydC5wb3N0VHlwZVBsdXJhbH1cIiBzcmM9XCIke3JlcG9ydC5nYWxsZXJ5WzBdLnNlbGVjdEltYWdlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHshdGhpcy5mdWxsRGlzcGxheSA/IGA8cD4ke3JlcG9ydC5kZXNjcmlwdGlvbn08L3A+YCA6IGA8cD4ke3JlcG9ydC5mdWxsRGVzY3JpcHRpb259PC9wPmB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGJ1dHRvbiBpZD1cIiR7cmVwb3J0LmlkfVwiIGNsYXNzPVwic2VlLW1vcmUtbGlua1wiPlNlZSBNb3JlOiAke3JlcG9ydC5pZH0gPC9idXR0b24+YCA6IGA8YnV0dG9uIGlkPVwiJHtyZXBvcnQuaWR9XCIgY2xhc3M9XCJzZWUtbW9yZS1saW5rIGRpc21pc3NlZFwiPlJlYWQgbW9yZTogJHtyZXBvcnQuaWR9IDwvYnV0dG9uPmB9IFxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9saT4gXHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgJHtjb250ZW50U2hvd24ubGVuZ3RoID8gYDwvdWw+YCAgOiAnJ31cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBpZighdGhpcy5mdWxsRGlzcGxheSl7XHJcbiAgICAgICAgICAgIHRoaXMuc2VlTW9yZUZ1bmN0aW9uYWxpdHkoKTtcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJSZWxhdGVkTmV3cygpOyAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gbGV0IG1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIGltZycpIFxyXG4gICAgICAgICAgICAvLyB0aGlzLmNsb3NlTWVkaWFCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY2xvc2UnKSAgIFxyXG4gICAgICAgICAgICAvLyB0aGlzLmh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJylcclxuICAgICAgICAgICAgLy8gdGhpcy5tZWRpYVJlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJylcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5tZWRpYVJlY2lldmVyLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtcmVjaWV2ZXInKSkgXHJcbiAgICAgICAgICAgIC8vIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFDb2x1bW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY29sdW1uJyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubmV3bG9hZCA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuZ2FsbGVyeVBvc2l0aW9uID0gMDsgXHJcbiAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2N1cnJlbnQtbWVkaWEnKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5tZWRpYVBhZ2luYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtcGFnaW5hdGlvbicpO1xyXG5cclxuICAgICAgICAvLyBtZWRpYUxpbmsuZm9yRWFjaChtZWRpYT0+e1xyXG4gICAgICAgIC8vICAgICBtZWRpYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gU2hhZG93Qm94LnByb3RvdHlwZS5zaGFkb3dCb3gobWVkaWEsIHRoaXMubWVkaWFSZWNpZXZlciwgdGhpcy5odG1sLCBcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzLCAnZ2FsbGVyeScsIHRoaXMubWVkaWFDb2x1bW4sIHRoaXMubmV3bG9hZCwgdGhpcy5nYWxsZXJ5UG9zaXRpb24sXHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYSwgdGhpcy5tZWRpYVBhZ2luYXRpb25cclxuICAgICAgICAvLyAgICAgICAgICkpXHJcbiAgICAgICAgLy8gfSlcclxuXHJcbiAgICAgICAgLy8gIG1lZGlhTGluay5mb3JFYWNoKG1lZGlhPT57XHJcbiAgICAgICAgLy8gICAgIG1lZGlhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PiBTaGFkb3dCb3gucHJvdG90eXBlLnNoYWRvd0JveChtZWRpYSkpXHJcbiAgICAgICAgLy8gfSlcclxuXHJcbiAgICAgICAgU2hhZG93Qm94LnByb3RvdHlwZS5ldmVudHMoKTtcclxuXHJcbiAgICAgICAgLy8gU2hhZG93Qm94LnByb3RvdHlwZS5ldmVudHMoXHJcbiAgICAgICAgLy8gICAgIHRoaXMubWVkaWFMaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lZGlhLWNhcmQgaW1nJyksIFxyXG4gICAgICAgIC8vICAgICB0aGlzLmNsb3NlTWVkaWFCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY2xvc2UnKSwgICBcclxuICAgICAgICAvLyAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpLFxyXG4gICAgICAgIC8vICAgICB0aGlzLm1lZGlhUmVjaWV2ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtcmVjaWV2ZXInKSwgXHJcbiAgICAgICAgLy8gICAgIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbiA9IGZhbHNlXHJcbiAgICAgICAgLy8gKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jb250ZW50UGFnZU9wdGlvbnMpe1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKG9wdGlvbj0+e1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe29wdGlvbi5zdHlsZS5wb2ludGVyRXZlbnRzPVwiXCI7IH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH0pICBcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdhdGhlclJlbGF0ZWROZXdzKCl7XHJcblxyXG4gICAgICAgIHRoaXMucmVsYXRpb25zaGlwTGlua3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmVsYXRpb25zaGlwLWxpbmsnKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBMaW5rcy5mb3JFYWNoKGxpbms9PntcclxuICAgICAgICAgICAgbGluay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmtJZCA9IGxpbmsuZGF0YXNldC5yZWxhdGVkIFxyXG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBsaW5rLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignLm5hbWUnKS5pbm5lclRleHRcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXBvcnQgPSBsaW5rSWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NTZWFyY2gudmFsdWUgPSBgIyR7bGlua0lkfWA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLm5ld3NTZWFyY2g7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9IGAjJHtsaW5rSWR9YDsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYFNob3dpbmcgUmVzdWx0cyBmb3I6ICR7bmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yZWRUaXRsZSA9YFNob3dpbmcgUmVzdWx0cyBmb3I6ICR7bmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGluc2VydFBhZ2luYXRpb24obmV3c1BhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCl7XHJcbiAgICAgICAgLy9hZGQgbWFudWFsIHBhZ2UgZW50cnkgYm94XHJcbiAgICAgICAgLy9BZGQgZmFpbHNhZmUgYWdhaW5zdCBpdCBiZWluZyBhIG51bWJlciB0b28gYmlnIG9yIHNtYWxsXHJcbiAgICAgICAgLy9NYXliZSBkbyBkcm9wZG93biBpbnN0ZWFkPyAgXHJcbiAgICAgICAgLy9NYXliZSBqdXN0IGRvbid0IGRvIGF0IGFsbD9cclxuXHJcbiAgICAgICAgLy9EbyB0aGUgbnVtYmVyIGxpbWl0LCB0aG91Z2gsIG9uZSB3aGVyZSBoaWRlIGFuZCByZXZlYWwgd2hlbiBhdCBjZXJ0YWluIHBvaW50c1xyXG5cclxuICAgICAgICAvL1JlbWVtYmVyIHRvIGFkZCB0aGUgbG9hZGVyXHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50LXBhZ2VzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJcIiBjbGFzcz1cImNvbnRlbnQtZGlyZWN0aW9uIGNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzXCI+UHJldjwvYT5cclxuICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJjb250ZW50LXBhZ2VcIiBkYXRhLXBhZ2U9XCIke2RhdGFDb3VudCsrfVwiPiAke3BhZ2VDb3VudCArPSAxfTwvYT5cclxuICAgICAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX0gIFxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiXCIgY2xhc3M9XCJjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9uZXh0ICR7bmV3c1BhZ2VzLmxlbmd0aCA+IDEgPyAnJyA6ICdoaWRkZW4nfVwiPk5leHQ8L2E+IFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+IFxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9wcmV2aW91cycpOyAgICBcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykgIFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMubmV4dENvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1kaXJlY3Rpb25fbmV4dCcpOyBcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlSG9sZGVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LXBhZ2VzIGEnKVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KHRoaXMuY29udGVudFBhZ2VPcHRpb25zKTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlZU1vcmVGdW5jdGlvbmFsaXR5KCl7XHJcbiAgICAgICAgLy9hZGQgc3Bpbm5lciB0byB0aGlzLCBhcyBuZWVkcyB0byBjb25zb2x0IGJhY2tlbmRcclxuICAgICAgICB0aGlzLnNlZU1vcmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2VlLW1vcmUtbGluaycpXHJcbiAgICAgICAgdGhpcy5zZWVNb3JlLmZvckVhY2gobGluaz0+e1xyXG4gICAgICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PntcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJlcG9ydCA9IGxpbmsuaWQ7ICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLnNpbmdsZUNhbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgZnVsbCBkaXNwbGF5IGlzICR7dGhpcy5mdWxsRGlzcGxheX1gKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZGlzbWlzc1NlbGVjdGlvbigpe1xyXG4gICAgICAgIGlmKHRoaXMubmV3c0RlbGl2ZXJ5ICE9PSAnJyl7XHJcbiAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgJHt0aGlzLnN0b3JlZFRpdGxlfWA7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgJHt0aGlzLmluaXRpYWxUaXRsZX1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMuZm9yRWFjaChvID0+IHtvLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlJyk7fSkgXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucy5mb3JFYWNoKGYgPT4ge2YuZGlzYWJsZWQgPSAnJ30pXHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2Rpc21pc3NlZCcpOyAgXHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICAvLyB0aGlzLnNpbmdsZUNhbGwgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShjb250ZW50UGFnZU9wdGlvbnMpe1xyXG4gICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbigpe2VsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgMTAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBwYXJzZUludChzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcblxyXG4gICAgICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnRlbnROZXh0QWN0aXZhdGlvbigpe1xyXG4gICAgICAgIGxldCBhbGxuZXh0QnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7XHJcblxyXG4gICAgICAgIGFsbG5leHRCdXR0b25zLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhZ2UuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCgvLWdyb3VwLykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTmFtZSA9IG5hbWUuc2xpY2UoMCwgLTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWxlY3RlZFBhZ2VgKTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBuZXh0UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IG5leHRQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICAvL3RvbyBzbG93Pz9cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWVcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzfVwiXWApO1xyXG4gICAgICAgICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnRlbnROZXh0QW5kUHJldmlvdXMoKXtcclxuICAgXHJcbiAgICAgICAgdGhpcy5jb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uJyk7ICAgICBcclxuXHJcbiAgICAgICAgbGV0IHByZXZCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXNgKVxyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtZGlyZWN0aW9uX25leHRgKVxyXG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnNlbGVjdGVkUGFnZWApO1xyXG5cclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRQYWdlcyA+IDApe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRQYWdlcylcclxuICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBwcmV2QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYoIW5leHRCdXR0b24ucHJldmlvdXNFbGVtZW50U2libGluZy5jbGFzc0xpc3QuY29udGFpbnMoJ3NlbGVjdGVkUGFnZScpKXtcclxuICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBuZXh0QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAgKGkpID0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHByZXZQYWdlID0gdGhpcy5jdXJyZW50UGFnZXMgLSAxO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IHByZXZQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc31cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTmV3cyIsIi8vIFNwaXQgb3V0IEFwdHMgaW4gb3JkZXIgb2YgbW9zdCByZWNlbnRcclxuXHJcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIlxyXG5cclxuY2xhc3MgUGFnaW5hdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ZWRFbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLmh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XHJcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkZXInKTtcclxuICAgICAgICB0aGlzLmhlYWRlck5hdiA9IHRoaXMuaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoJ25hdicpO1xyXG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtc2VhcmNoLXRyaWdnZXJcIik7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5Qm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BvcC11cC1kaXNwbGF5LWJveCcpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VIb2xkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW1hZ2UtaG9sZGVyJyk7XHJcbiAgICAgICAgdGhpcy5jbG9zZU1hZ25pZnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2xvc2VNYWduaWZ5Jyk7XHJcbiAgICAgICAgLy8gdGhpcy5vdmVyYWxsQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI292ZXJhbGxDb250YWluZXInKTtcclxuICAgICAgICAvLyBGb3Igbm93LCB0aGlzIHdpbGwgYmUgaG93IEkgcHJldmVudCBlcnJvcnMgb24gb3RoZXIgcGFnZXMgXHJcbiAgICAgICAgdGhpcy5mcm9udFRlc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudENvbnRhaW5lcl9wYWdpbmF0ZWQnKSBcclxuICAgICAgICB0aGlzLnZ3ID0gTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IDAsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApXHJcbiAgICAgICAgLy8gQ2FuIEkgc2V0dXAgdG8gbG9hZCBpbiBhbmQgUGFnaW5hdGUgZGVwZW5kaW5nIG9uIGlkZW50aXR5LCBzbyBhcyB0byBtYWtlIGFkYXB0YWJsZT8gWWVzISEhXHJcblxyXG4gICAgICAgIC8vV2lsbCB0YXJnZXQgYSBzaGFyZWQsIHNwZWNpZmljIGNsYXNzIHVzaW5nIHF1ZXJ5U2VsZWN0b3JBbGwgYW5kIHVzZSBhIGxvb3BcclxuXHJcbiAgICAgICAgLy9yZW1lbWJlciB0byB1c2UgdGhlIGFqYXggdXJsIHNldC11cCB0byBsaW5rIHRvIHRoZSBzZWFyY2ggaW5mb1xyXG4gICAgICAgIC8vQ29sb3IgdGhlIHNlbGVjdGVkL2N1cnJlbnQgcGFnZSBhbmQgcHV0IGEgbmV4dCBhbmQgcHJldiBidXR0b25zIHRoYXQgb25seSBhcHBlYXIgd2hlbiBhcHBsaWNhYmxlXHJcbiAgICAgICAgLy9NYWtlIHN1cmUgcGFnaW5hdGlvbiBpcyBvdXRzaWRlIG9mIGdlbmVyYXRlZCB0ZXh0P1xyXG5cclxuICAgICAgICAvLyBjb25zaWRlciB1c2luZyBzb21lIHNvcnQgb2YgbG9hZGluZyBpY29uIGFuZCBhbmltYXRpb24gd2hlbiBjbGlja2luZyBwYWdpbmF0aW9uLiBKdXN0IGZvciB1c2VyIHNhdGlzZmFjdGlvbiBvbiBjbGlja1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHRoaXMucGFnaW5hdGVkQ29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50Q29udGFpbmVyX3BhZ2luYXRlZCcpO1xyXG4gIFxyXG4gICAgICAgIGxldCBwcm9wZXJ0aWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Byb3BlcnRpZXNDb250YWluZXIgLmNvbnRlbnRCb3gnKTtcclxuICAgICAgICBsZXQgbWVtYmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZW1iZXJzQ29udGFpbmVyIC5jb250ZW50Qm94Jyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFnaW5hdGVkQ29udGVudCA9IFtwcm9wZXJ0aWVzLCBtZW1iZXJzXTtcclxuICAgICAgICB0aGlzLmdyb3VwTmFtZTtcclxuICAgICAgICAvLyBNYWtlIHdvcmsgZm9yIGFsbCBwYWdpbmF0ZSB0aHJvdWdoIGEgbG9vcD9cclxuICAgICAgICB0aGlzLnBvc3RQYWdlU2VsZWN0O1xyXG4gICAgICAgIHRoaXMucG9zdFBhZ2VPcHRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UHJvcGVydGllc1BhZ2UgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE1heWJlIHB1dCBhbGwgdGhpbmdzIGluIHRoaXMgb2JqZWN0IHdoZW4gZnVzZVxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0ge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiAwLFxyXG4gICAgICAgICAgICBtZW1iZXJzOiAwXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnREaXJlY3Rpb247XHJcblxyXG4gICAgICAgIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIC8vIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgLy9zcGlubmVyIGZhbHNlIGJlZm9yZSB0aGUgcHJldiBpcyB0cnVlXHJcblxyXG4gICAgICAgIC8vRG8gc21hbGxlciBvbmVzIGZvciBwYWdpbmF0ZSBhbmQgZm9yIHRoZSBmb3JtIHN1Ym1pdHMsIGFzIHdlbGwgYXMgc2VhcmNoIG9uIHRoZSBhbGwgbmV3cyBwYWdlIGFuZCBhbnkgb3RoZXIgcGFnaW5hdGlvbiBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICBpZih0aGlzLmZyb250VGVzdCl7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IG1haW5Mb2FkZXJUZXh0ID0gW1wiT25lIE1vbWVudCBQbGVhc2UuLi5cIiwgXCJQZXJmZWN0aW9uIHRha2VzIHRpbWVcIiwgXCJHcm9hbmluZyBvbmx5IG1ha2VzIHRoaXMgc2xvd2VyLi4uXCIsIFwiSSdtIHdhdGNoaW5nIHlvdS4uLiA6KVwiXHJcbiAgICAgICAgICAgIC8vICwgXCJDb21tZW5jaW5nIEhhY2sgOylcIiwgXCJPbmUgTW9tZW50LiBSZXRyaWV2aW5nIHlvdXIgU1NOXCIsIFwiU2hhdmluZyB5b3VyIGNhdC4uLlwiLCBcIllvdSBsaWtlIFNjYXJ5IE1vdmllcy4uLj8gPjopXCJdO1xyXG4gICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJhbmRvbSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1haW5Mb2FkZXJUZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJlc3VsdCA9IG1haW5Mb2FkZXJUZXh0W3JhbmRvbV07XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcy5wYWdlTG9hZGVyLnNldEF0dHJpYnV0ZSgnZGF0YS1jdXJ0YWluLXRleHQnLCBgJHtyZXN1bHR9YClcclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1sb2FkZXInKTtcclxuXHJcbiAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgY29udGVudEludGVyZmFjZSgpe1xyXG4gICAgICAgIC8vSSB0aGluayB0aGF0IEkgbmVlZCB0byBkZWxheSBjbGlja2FiaWxpdHkgZm9yIHRvdWNoLCBvdGhlcndpc2UgY2FuIGNsaWNrIHdoZW4gYnJpbmdpbmcgdXBcclxuICAgICAgICAvL0Fsc28sIHBlcmhhcHMgSSBuZWVkIHRvIGFkZCBhIHN5bWJvbCB0byBpbmRpY2F0ZSB0aGF0IHlvdSBjYW4gYnJpbmcgdXAgb3B0aW9ucyBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRpc3BsYXlTcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc3BsYXlTcXVhcmVzJyk7XHJcbiAgXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5SW1hZ2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc3BsYXlJbWFnZXMnKTtcclxuICAgICAgICB0aGlzLm1hZ25pZnlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZmEtc2VhcmNoLXBsdXMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5U3F1YXJlcy5mb3JFYWNoKGRpc3BsYXlTcXVhcmUgPT4ge1xyXG4gICAgICAgICAgbGV0IGxpbmsgPSBkaXNwbGF5U3F1YXJlLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MnKTtcclxuICAgICAgICAgIGxldCBpbWFnZSA9IGRpc3BsYXlTcXVhcmUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKTtcclxuICAgICAgICAgIGxldCBtYWduaWZ5QnV0dG9uID0gZGlzcGxheVNxdWFyZS5xdWVyeVNlbGVjdG9yKCcuZmEtc2VhcmNoLXBsdXMnKVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBkaXNwbGF5U3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGUgPT4ge1xyXG5cclxuICAgICAgICAgICAgICBsaW5rLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGltYWdlLmNsYXNzTGlzdC5hZGQoJ3BhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGxpbmsuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICAgICAgICBpZihtYWduaWZ5QnV0dG9uKXtcclxuICAgICAgICAgICAgICAgIG1hZ25pZnlCdXR0b24uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgICAgIGxpbmsuc3R5bGUucG9pbnRlckV2ZW50cyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYobWFnbmlmeUJ1dHRvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFnbmlmeUJ1dHRvbi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSwgMzAwKSAgICAgICAgICBcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIGRpc3BsYXlTcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgZSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgIGxpbmsuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzX192aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgaW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSgncGFnZUxpbmtzX192aXNpYmxlJyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgICBcclxuICAgICAgdGhpcy5tYWduaWZ5QnV0dG9uLmZvckVhY2goYiA9PnsgXHJcbiAgICAgICAgICBiLm9uY2xpY2sgPSBlPT57XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSBlLnRhcmdldC5jbG9zZXN0KCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJykucHJldmlvdXNFbGVtZW50U2libGluZy5jbG9uZU5vZGUoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coaW1hZ2UpXHJcbiAgICAgICAgICAgIC8vUGVyaGFwcyBjYXJyeSBvdmVyIGFzc29jaWF0ZWQgbmV3cywgYXMgd2VsbFxyXG5cclxuICAgICAgICAgICAgLy90aGlzIGlzIG5vdCBuZWNlc3NhcnkgYXMgb25lIGRpcmVjdGx5IGJlbG93IGRvZXMgaXQgYnkgYWNjZXNzaW5nIHRoZSBwYXJlbnQgYW5kIHF1ZXJ5IHNlbGVjdGluZywgYnV0IGtlZXBpbmcgdGhpcyBhcyBjb3VsZCBiZSB1c2VmdWwgdG8gaGF2ZSBvbiBoYW5kXHJcbiAgICAgICAgICAgIHRoaXMuZmluZFNwZWNpZmllZFByZXZpb3VzKGUudGFyZ2V0LCAnbW9yZS1pbmZvLWxpbmsnKTtcclxuICAgICAgICAgICAgLy8gdGhpcy50YXJnZXRlZEVsZW1lbnQgPSBlLnRhcmdldC5jbG9zZXN0KCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJykucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlCb3guaW5zZXJ0QmVmb3JlKHRoaXMudGFyZ2V0ZWRFbGVtZW50LCB0aGlzLmNsb3NlTWFnbmlmeSk7XHJcbiAgICAgICBcclxuICAgICAgICAgICAgLy8gdGhpcy5kaXNwbGF5Qm94LnByZXBlbmQoaW1hZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnByZXBlbmQoaW1hZ2UpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICAgICAgICAgIHRoaXMub3BlbkJ1dHRvbi5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgIGUuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgdGhpcy5jbG9zZU1hZ25pZnkub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgdGhpcy5pbWFnZUhvbGRlci5xdWVyeVNlbGVjdG9yKCdpbWcnKS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlCb3gucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICBlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5yZW1vdmUoJ2ZyZWV6ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL2NoYW5nZSB0byBiZSBmcHIgZWl0aGVyIGRpcmVjdGlvbmFsIHRvIGdldCBsZXQsIHdpdGggaWYgc3RhdGVtZW50c1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBvcC11cC1kaXJlY3Rpb25hbCcpLmZvckVhY2goYnV0dG9uPT57XHJcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vTWFrZSBuZXh0IGFuZCBwcmV2IHVuY2xpY2thYmxlIGlmIG5vdGhpbmcgdGhlcmUgdG8gZ28gdG9cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRJbWFnZSA9IHRoaXMuZGlzcGxheUJveC5xdWVyeVNlbGVjdG9yKCdpbWcnKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXROYW1lID0gY3VycmVudEltYWdlLmRhdGFzZXQubmFtZTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0eXBlID0gYnV0dG9uLmlkO1xyXG4gICAgICAgICAgICBsZXQgbmV3SW1hZ2VDb250YWluZXI7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHR5cGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVNxdWFyZXMuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgICAgICBpZihlLnF1ZXJ5U2VsZWN0b3IoYC5kaXNwbGF5SW1hZ2VzW2RhdGEtbmFtZT0ke3RhcmdldE5hbWV9XWApKXtcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09PSAnbmV4dC1pbWFnZScpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUNvbnRhaW5lciA9IGUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9zZXN0KCcub3ZlcmFsbC1zcXVhcmVzJykubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUNvbnRhaW5lciA9IGUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9zZXN0KCcub3ZlcmFsbC1zcXVhcmVzJykucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmV3SW1hZ2VDb250YWluZXIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3SW1hZ2UgPSBuZXdJbWFnZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheUltYWdlcycpLmNsb25lTm9kZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TGluayA9IG5ld0ltYWdlQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLm1vcmUtaW5mby1saW5rJykuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLnJlcGxhY2VXaXRoKG5ld0ltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnF1ZXJ5U2VsZWN0b3IoJy5tb3JlLWluZm8tbGluaycpLnJlcGxhY2VXaXRoKG5ld0xpbmspO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmaW5kU3BlY2lmaWVkUHJldmlvdXMoc291cmNlLCBpZGVudGlmaWVyKXtcclxuICAgICAgICAvLyB0aGlzIHdpbGwgbmVlZCB0byBiZSB0d2Vha2VkIGhhbmRsZSBub24tbmVzdGVkLCBhcyB3ZWxsIGFzIG90aGVyIG5lZWRzXHJcbiAgICAgICAgbGV0IGxpbmsgPSBzb3VyY2UucGFyZW50RWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgIHdoaWxlIChsaW5rKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5rLmNsYXNzTmFtZS5pbmNsdWRlcyhpZGVudGlmaWVyKSkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldGVkRWxlbWVudCA9IGxpbmsuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50YXJnZXRlZEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluayA9IGxpbmsucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgfSBcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBwYWdpbmF0ZSgpe1xyXG4gICAgICAgIC8vY3JlYXRlIG5ldyBzZWFyY2ggc2V0LXVwIGZvciBqdXN0IHRoZSBtZW1iZXIgcHJvcCBwYWdpbmF0aW9uPyBMaWtlLCBnbyBtYWtlIG5ldyBpbmMgcGFnZVxyXG4gICAgICAgIC8vVXNlIHBvc3QtdHlwZSAnaWYnIHRoYXQgY2hlY2tzIGZvciB0aGUgaWQ/IEFjdHVhbGx5LCBJIGNhbiB1c2UgdGhlIHJlc3V0cyBhcnJheSBhcyBjYW4gcGx1cmFsaXplXHJcblxyXG4gICAgICAgIC8vc3RhcnQgYnkgaW5zZXJ0aW5nIHJhbmRvbSBzaGl0IGluIGJvdGg/XHJcbiAgICAgICAgLy9zZXQtdXAgdGhpcyB1cCB0byBub3QgcmVwbGFjZSBjb250ZW50LCBpZiBqYXZhc2NyaXB0IHR1cm5lZCBvZmYsIGFsb25nIHdpdGggaW5zZXJ0aW5nIGEgYnV0dG9uIHRvIHNlZSBhbGxcclxuICAgICAgICAvL2FuZCBtYWtlIHRoYXQgc2VlIGFsbCBwYWdlXHJcbiAgICAgICAgLy9JIHRoaW5rIEknbGwgbWFrZSB0aGUgc2VlIGFsbCBidXR0b24sIGJ1dCByZXBsYWNlIGl0J3MgY29udGVudHMgdGhyb3VnaCBoZXJlLCBzbyBpZiB0aGlzIGRvZXNuJ3QgcnVuLCBpdCdsbCBiZSB0aGVyZVxyXG4gICAgICAgIC8vZGlzYWJsZSBzY3JpcHQgaW4gYnJvd3NlciB0byBjaGVjay93b3JrIG9uIHN0dWZmXHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAvL0lzIGl0IGJldHRlciBqdXN0IHRvIHVzZSBzZXBlcmF0ZSB1cmwgcm91dGVzPyBcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL2NvbnRlbnQ/cGFnZScpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAvLyBsZXQgY3VycmVudE1lbWJlcnNTaG93biA9IHRoaXMuY3VycmVudFBhZ2VzLm1lbWJlcnM7XHJcbiAgICAgICAgICAgIC8vIGxldCBjdXJyZW50UHJvcGVydGllc1Nob3duID0gdGhpcy5jdXJyZW50UGFnZXMucHJvcGVydGllcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcG9zdE91dHB1dDtcclxuICAgICAgICAgICAgLy8gd2luZG93LmFsZXJ0KCdvbiB0YWJsZXQhJylcclxuICAgICAgICAgICAgLy9Db25zaWRlciBsb2NhbGl6ZWQgcmVsb2FkIG9uIHBhZ2UgcmVzaXplXHJcbiAgICAgICAgICAgIGlmKHdpbmRvdy5pbm5lcldpZHRoID49IDEyMDApe1xyXG4gICAgICAgICAgICAgICAgcG9zdE91dHB1dCA9IDg7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcG9zdE91dHB1dCA9IDY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwb3N0UGFnZSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgcG9zdFBhZ2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRzS2V5cyA9IE9iamVjdC5rZXlzKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZTtcclxuICAgICAgICAgICAgbGV0IHBvc3Q7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50U2hvd247XHJcbiAgICAgICAgICAgIGxldCBwYWdpbmF0aW9uTG9jYXRpb247XHJcbiBcclxuICAgICAgICAgICAgLy9Vc2UgYSBmb3IgbG9vcCBoZXJlPyBmb3IgcmVzdWx0IG9mIHJlc3VsdHM/XHJcbiAgICAgICAgICAgIC8vIG1ha2UgdGhpcyBpbnRvIGFuIGFycmF5IGFuZCBwdXQgaW4gaWYgYSBsb29wP1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lclR5cGUgPSB0aGlzLnBhZ2luYXRlZENvbnRlbnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyVHlwZUxvY2F0aW9uID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbnRlbnRMb2FkZWQpe1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCB0eXBlIG9mIHJlc3VsdHNLZXlzKXtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdHlwZTtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0ID0gcmVzdWx0c1tuYW1lXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCA8PSBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gcG9zdE91dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZSA9IHBvc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIG5lZWQgdG8gbWFkZSBtb3JlIHZlcnNhdGlsZSBpZiBkZWNpZGUgdG8gdW5pdmVyc2FsaXplIHBhZ2luYXRpb25cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0UGFnZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IHBvc3RQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc1t0eXBlXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocG9zdFBhZ2VzWzBdKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2VOYW1lID0gdHlwZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXS5jbGFzc0xpc3QuYWRkKHR5cGUpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydENvbnRlbnQoY29udGFpbmVyVHlwZVtjb250YWluZXJUeXBlTG9jYXRpb25dLCBjb250ZW50U2hvd24sIHBhZ2VOYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Mb2NhdGlvbiA9IGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy50ZXh0Qm94JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKHBhZ2luYXRpb25Mb2NhdGlvbiwgcG9zdFBhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCwgcGFnZU5hbWUpICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclR5cGVMb2NhdGlvbis9IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBvc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzID0gW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TmV4dEFjdGl2YXRpb24oKTsgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy90ZW1wIHVudGlsIGNoYW5nZSBzZXQtdXAgdG8gbWFrZSBzZWN0aW9uIGxvYWRlciB3b3JrXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VMb2FkZXIuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJylcclxuICAgICAgICAgICAgICAgIHBvc3QgPSByZXN1bHRzW3RoaXMuZ3JvdXBOYW1lXVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoIDw9IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZW0gPSAxOyBpdGVtIDw9IHBvc3RPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IHBvc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBwb3N0UGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzLnB1c2gocG9zdFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IHBvc3RQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV1dO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnRCb3guJHt0aGlzLmdyb3VwTmFtZX1gKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0Q29udGVudCh0YXJnZXQsIGNvbnRlbnRTaG93biwgdGhpcy5ncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBbmRQcmV2aW91cygpOyBcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBY3RpdmF0aW9uKCk7IFxyXG5cclxuICAgICAgICAgICAgICAgIC8vY2hhbmdlIHRvIGFkZGluZyBmYWRlLWNsYXNzLCBiZWZvcmUgcmVtb3ZpbmcgYWN0aXZlLCBzbyBnb2VzIGF3YXkgc21vb3RoZXJcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PnRoaXMucGFnZUxvYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSwgODEwKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+dGhpcy5wYWdlTG9hZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpLCA4MTApOyBcclxuICAgICBcclxuICAgICAgICAgICAgLy9DYW4gSSBsb29wIHRocm91Z2ggdGhlIGRpZmYgcmVzdWx0cywgdXNpbmcgdmFyaWFibGUocykgYmVmb3JlIHRoZSBpbm5lckh0bWwgYW5kIHRoZSBtYXAsIGFzIHdlbGwgYXMgdGhlIHBhZ2UgY29udGFpbmVyP1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gSG93IHRvIGdldCBwb3N0IG5hbWUsIHRob3VnaD8gQ2FuIEkgYXBwbHkgYSBmb3JlYWNoIHRvIHRoZW0gYW5kIGdyYWIgdGhlIHBvc3QgdHlwZT8gQ291bGQgSSBpbmNsdWRlIGluIHJlc3Qgcm91dGVcclxuXHJcbiAgICAgICAgICAgIC8vSGF2ZSBsb2dpYyB0aGF0IG9ubHkgaGFzIHRoZSBwcm9jZXNzIGZvciB0aGUgc2VsZWN0ZWQgc2VjdGlvbiBydW4gYWdhaW4sIHBlcmhhcHMgdmlhIGEgdmFyaWFibGUgaW4gdGhlIGNhbGwgYmVsb3cuIFxyXG4gICAgICAgICAgICAvL2llLiB0aGlzLnBhZ2luYXRlKCdtZW1iZXJzJylcclxuICAgICAgICAgICAgLy9NYXliZSB0aGUgcGFnaW5hdGlvbiBjb3VsZCBiZSBzcGxpdCB1cCwgd2l0aCB0aGUgaHRtbCBpbnNlcnRpb24gYmVpbmcgYSBzZXBlcmF0ZWx5IGNhbGxlZCBmdW5jdGlvbiB0aGF0IGlzIHJlcGVhdGVkXHJcbiAgICAgICAgICAgIC8vdGhyb3VnaCBhIGxvb3BzIGNvbnNpc3Rpbmcgb2YgdmFyaWFibGVzIGhlcmUsIGFuZCBjb3VsZCBzaW1wbHkgYmUgY2FsbGVkIGFnYWluIHdpdGggYSBzcGVjaWZpYyB2YXJpYWJsZSAgXHJcbiAgICAgICAgICAgIC8vT3Igc2ltcGx5IGp1c3Qgc2VwZXJhdGUgdGhpcyBhbGwgXHJcblxyXG4gICAgICAgICAgICAvL3NpbXBseSBkaXNwbGF5IGRpZmZlcmVudCB0aGluZ3MsIG5lZWQgdHdvIGRpZmYgaHRtbCBibG9ja3MsIGJ1dCBlYWNoIGNhbiBjYWxsZWQgdXBvbiBzZXBlcmF0ZWx5LCBhcyBkaWZmZXJlbnQgaW5uZXJIdG1sIGJsb2Nrc1xyXG5cclxuICAgICAgICAgICAgLy9CdXQgdGhlbiBhZ2FpbiwgYSB1bmlmb3JtZWQgZGlzcGxheWVkIGNvdWxkIGJlIGFjaGlldmVkIHdpdGggdGVybmFyeSBvcGVyYXRvcnMsIGNoZWNraW5nIGZvciB0aXRsZV9vcl9wb3NpdGlvblxyXG4gICAgICAgICAgICAvL0FuZCBjaGVja2luZyBmb3Igc29tZXRoaW5nIHRoYXQgY291bGQgcnVsZSBvdXQgdGhlIG1hZ25pZnlpbmcgYnV0dG9uIGFuZCB0aGUgbG9jYXRpb24gbGlua1xyXG5cclxuICAgICAgICAgICAgLy9DYW4gSSBtb3ZlIHRoaXMgQW5kIGp1c3QgbG9vcCBjYWxsIHRoaXM/XHJcblxyXG4gICAgICAgICAgICAvL01ha2Ugd29yayBhZ2Fpbi4gQW5kIHZlcnNhdGlsZVxyXG4gICAgICAgICAgICAvL0RvIEkgbmVlZCB0aGlzIGFueW1vcmUsIHRob3VnaD9cclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBhY3RpdmVQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcGFnZT0nJHtjdXJyZW50TWVtYmVyc1Nob3dufSddYCk7XHJcbiAgICAgICAgICAgIC8vIGFjdGl2ZVBhZ2luYXRpb24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICBcclxuICAgICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb250ZW50SW50ZXJmYWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5zZXJ0Q29udGVudChkZXN0aW5hdGlvbiwgdHlwZSwgcGFnZU5hbWUpe1xyXG4gICAgICAgICAgICAvL0NoYW5nZSBkZXNpdGluYXRpb24gc2V0LXVwIHRvIGFjY29tYWRhdGUgbG9hZGVyXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBhZ2VOYW1lKVxyXG4gICAgICAgICAgICAvL3JlcGxhY2Ugd29yZCBpbnRlcmFjdGlvbiBwcm9tcHRzLCB3aXRoIGN1c3RvbSwgZHJhd24gc3ltYm9sc1xyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAke3R5cGUubWFwKGl0ZW0gPT4gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm92ZXJhbGwtc3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5U3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImludGVyYWN0aW9uLXByb21wdFwiPjxzcGFuIGNsYXNzPVwiY2xpY2stcHJvbXB0XCI+VG91Y2g8L3NwYW4+PHNwYW4gY2xhc3M9XCJob3Zlci1wcm9tcHRcIj5Ib3Zlcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy52dyA+PSAxMjAwID8gYDxpbWcgY2xhc3M9XCJkaXNwbGF5SW1hZ2VzXCIgZGF0YS1uYW1lPVwiJHtpdGVtLnRpdGxlLnJlcGxhY2VBbGwoJyAnLCAnJyl9XCIgc3JjPVwiJHtpdGVtLmlzQ29tcGxldGVkIHx8IGl0ZW0ucG9zdFR5cGUgPT09ICdtZW1iZXInID8gaXRlbS5pbWFnZSA6IGl0ZW0ucHJvamVjdGVkSW1hZ2V9XCIgYWx0PVwiJHtpdGVtLnRpdGxlfVwiPmA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMudncgPCAxMjAwID8gYDxpbWcgY2xhc3M9XCJkaXNwbGF5SW1hZ2VzXCIgZGF0YS1uYW1lPVwiJHtpdGVtLnRpdGxlLnJlcGxhY2VBbGwoJyAnLCAnJyl9XCIgc3JjPVwiJHtpdGVtLmlzQ29tcGxldGVkIHx8IGl0ZW0ucG9zdFR5cGUgPT09ICdtZW1iZXInID8gaXRlbS5pbWFnZU1lZGl1bSA6IGl0ZW0ucHJvamVjdGVkSW1hZ2VNZWRpdW19XCIgYWx0PVwiJHtpdGVtLnRpdGxlfVwiPmA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cIm1vcmUtaW5mby1saW5rXCIgaHJlZj1cIiR7aXRlbS5wZXJtYWxpbmt9XCI+RmluZCBPdXQgTW9yZTwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3NpdGVEYXRhLnJvb3RfdXJsfS9hbGwtbmV3cy8jJHtpdGVtLmlkfS1yZWxhdGVkLSR7aXRlbS5wb3N0VHlwZVBsdXJhbH1cIj5Bc3NvY2lhdGVkIE5ld3M/PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtwYWdlTmFtZSA9PT0gJ3Byb3BlcnRpZXMnID8gJzxidXR0b24+PGkgY2xhc3M9XCJmYXMgZmEtc2VhcmNoLXBsdXNcIj48L2k+PC9idXR0b24+JzogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5LXRleHRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLnRpdGxlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLnBvc2l0aW9uT3JSb2xlICE9PSB1bmRlZmluZWQgPyBgPHA+JHtpdGVtLnBvc2l0aW9uT3JSb2xlfTwvcD5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+ICAgXHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgaW5zZXJ0UGFnaW5hdGlvbihkZXN0aW5hdGlvbiwgcG9zdFBhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCwgcGFnZU5hbWUpe1xyXG4gICAgICAgIC8vUHV0IGluICduZXh0JyBhbmQgJ3ByZXYnIGJ1dHRvbnNcclxuICAgICAgICAvL01ha2UgbnVtYmVycyBMYXJnZSBhbmQgY2VudGVyZWQsIGFuZCBwZXJoYXBzIHB1dCBhIGJveCBhcm91bmQgdGhlbSwgYWxvbmcgd2l0aCBmYW5jeSBzdHlsaW5nIGFsbCBhcm91bmRcclxuICAgICAgICBkZXN0aW5hdGlvbi5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgXCJiZWZvcmVlbmRcIixcclxuICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPyAnPGRpdiBjbGFzcz1cImNvbnRlbnQtcGFnZXNcIj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPiAxICA/IGA8YSBpZD1cIiR7cGFnZU5hbWV9LXByZXZcIiBjbGFzcz1cIiR7cGFnZU5hbWV9LWdyb3VwICR7cGFnZU5hbWV9LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c1wiPlByZXY8L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAke3Bvc3RQYWdlcy5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPiAxID8gYDxhIGNsYXNzPVwiY29udGVudC1wYWdlICR7cGFnZU5hbWV9LWdyb3VwXCIgZGF0YS1wYWdlPVwiJHtkYXRhQ291bnQrK31cIj4gJHtwYWdlQ291bnQgKz0gMX08L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICBgKS5qb2luKCcnKX0gIFxyXG4gICAgICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID4gMSA/IGA8YSBpZD1cIiR7cGFnZU5hbWV9LW5leHRcIiBjbGFzcz1cIiR7cGFnZU5hbWV9LWdyb3VwICR7cGFnZU5hbWV9LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9uZXh0XCI+TmV4dDwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICR7cG9zdFBhZ2VzLmxlbmd0aCA/ICc8L2Rpdj4nIDogJyd9IFxyXG5cclxuICAgICAgICBgKTtcclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9wcmV2aW91cycpOyAgICBcclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpICBcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5mb3JFYWNoKGVsPT5lbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKSlcclxuXHJcbiAgICAgICAgbGV0IGNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LXBhZ2UnKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShjb250ZW50UGFnZU9wdGlvbnMpO1xyXG4gICAgfVxyXG4vLyB0aGlzIG5ldyBzZXR1cCBjYXVzZXMgaXNzdWVzIGFmdGVyIGRpcmVjdGlvbmFsIGJ1dHRvbnMgdXNlZDogc2VsZWN0ZWRQYWdlIFxyXG4vL25vdCBiZWluZyBhZGRlZCB0byBjbGlja2VkIGFuZCBjdXJyZW50UGFnZSBvbiBkaXJlY3Rpb25hbCBnZXRzIGVycm9yXHJcbi8vTGF0dGVyIGxpa2VseSBjb25uZWN0ZWQgdG8gdGhlIGZvcm1lclxyXG5cclxuICAgIHBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KGNvbnRlbnRQYWdlT3B0aW9ucyl7XHJcbiAgICAgICAgLy9Db21iaW5lIHRoZSB0d28gYmVsb3dcclxuICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhZ2UuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCgvLWdyb3VwLykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTmFtZSA9IG5hbWUuc2xpY2UoMCwgLTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0ZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSlcclxuICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKHRoaXMuZ3JvdXBOYW1lKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pICBcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy8gY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgIC8vICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+e1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChpID0+eyBcclxuICAgICAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKVxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGkuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2godGhpcy5ncm91cE5hbWUpKXtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAvLyAgICAgICAgICAgICB9KVxyXG4gICAgICAgIC8vICAgICAgICAgfSkgIFxyXG4gICAgICAgIC8vICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgLy8gICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcclxuICAgICAgICAvLyB9KVxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgY29udGVudE5leHRBY3RpdmF0aW9uKCl7XHJcbiAgICAgICAgbGV0IGFsbG5leHRCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTtcclxuXHJcbiAgICAgICAgYWxsbmV4dEJ1dHRvbnMuZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gKGUpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkUGFnZS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKC8tZ3JvdXAvKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lID0gbmFtZS5zbGljZSgwLCAtNik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwLnNlbGVjdGVkUGFnZWApO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IG5leHRQYWdlID0gdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gPSBuZXh0UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIlwiOyB9LCA5MjApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdfVwiXWApO1xyXG4gICAgICAgICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld0N1cnJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgfTtcclxuXHJcbiAgICBjb250ZW50TmV4dEFuZFByZXZpb3VzKCl7XHJcbiAgIFxyXG4gICAgICAgIHRoaXMuY29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbicpOyAgICAgXHJcblxyXG4gICAgICAgIGxldCBwcmV2QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5ncm91cE5hbWV9LXByZXZgKVxyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5ncm91cE5hbWV9LW5leHRgKVxyXG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwLnNlbGVjdGVkUGFnZWApO1xyXG5cclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA+IDApe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50UGFnZXMpXHJcbiAgICAgICAgICAgICAgICBwcmV2QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXh0Q29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGlmKCFuZXh0QnV0dG9uLnByZXZpb3VzRWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZFBhZ2UnKSl7XHJcbiAgICAgICAgICAgICAgICBuZXh0QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSAtIDE7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA9IHByZXZQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe2VsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgOTIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cFtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXX1cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9maXggcmVwZWF0IG9mIG5leHRCdXR0b24gZnVuY3Rpb25hbGl0eVxyXG4gICAgICAgIC8vIHRoaXMubmV4dENvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgIC8vICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAvLyAgICAgICAgIGxldCBuZXh0UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzW3BhZ2VOYW1lXSArIDE7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbcGFnZU5hbWVdID0gbmV4dFBhZ2U7XHJcbiAgICAgICAgLy8gICAgICAgICBjdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAvLyAgICAgICAgIG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHtwYWdlTmFtZX0tZ3JvdXBbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc1twYWdlTmFtZV19XCJdYCk7XHJcbiAgICAgICAgLy8gICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhZ2luYXRpb24iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCJcclxuXHJcbmNsYXNzIFNlYXJjaCB7XHJcbiAgICAvLyAxLiBkZXNjcmliZSBhbmQgY3JlYXRlL2luaXRpYXRlIG91ciBvYmplY3RcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5hZGRTZWFyY2hIdG1sKCk7XHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLnJlc3VsdHNEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlYXJjaC1vdmVybGF5X19yZXN1bHRzXCIpO1xyXG4gICAgICAgIC8vSWYgb3BlbiBkaWYgb3BlbiBidXR0b24gZm9yIG1vYmlsZSB2cyBkZXNrdG9wXHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1zZWFyY2gtdHJpZ2dlclwiKTtcclxuICAgICAgICB0aGlzLmNsb3NlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZWFyY2gtb3ZlcmxheV9fY2xvc2VcIik7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hPdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZWFyY2gtb3ZlcmxheVwiKTtcclxuICAgICAgICB0aGlzLnNlYXJjaFRlcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoLXRlcm0nKTtcclxuICAgICAgICB0aGlzLmlzT3ZlcmxheU9wZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWU7XHJcbiAgICAgICAgdGhpcy50eXBpbmdUaW1lcjtcclxuLy9HZXQgcmlkIG9mIHRoaXMgYW5kIHRoZSBwYWdpbmF0aW9uIGxvZ2ljLCByZXNldGluZyB0aGUgbmV3cyByZW5kZXJpbmdcclxuICAgICAgICB0aGlzLm5ld3NQYWdlU2VsZWN0O1xyXG4gICAgICAgIHRoaXMubmV3c1BhZ2VPcHRpb247XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TmV3c1BhZ2UgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMi4gZXZlbnRzXHJcbiAgICBldmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIHRoaXMub3Blbk92ZXJsYXkoKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiBcclxuICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlT3ZlcmxheSgpKVxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGUgPT4gdGhpcy5rZXlQcmVzc0Rpc3BhdGNoZXIoZSkpXHJcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoKSA9PiB0aGlzLnR5cGluZ0xvZ2ljKCkpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gMy4gbWV0aG9kcyAoZnVuY3Rpb24sIGFjdGlvbi4uLilcclxuICAgIHR5cGluZ0xvZ2ljKCkge1xyXG4gICAgICAgIGlmKHRoaXMuc2VhcmNoVGVybS52YWx1ZSAhPT0gdGhpcy5wcmV2aW91c1ZhbHVlKXtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudHlwaW5nVGltZXIpO1xyXG4gICAgICAgICAgICBpZih0aGlzLnNlYXJjaFRlcm0udmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaXNTcGlubmVyVmlzaWJsZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzRGl2LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGluZ1RpbWVyID0gc2V0VGltZW91dCh0aGlzLmdldFJlc3VsdHMuYmluZCh0aGlzKSwgODAwKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHNEaXYuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLnNlYXJjaFRlcm0udmFsdWU7XHJcbiAgICB9XHJcbi8vQWRkIGNvbG9yaW5nIHRvIHRleHQgdGhhdCBtYXRjaGVzIHNlYXJjaCBxdWVyeSBhbmZkIG1heWJlIGRvbid0IHNob3cgdGl0bGUgYXQgYWxsIGlmIG5vIGNvbnRlbnQoPylcclxuICAgIGFzeW5jIGdldFJlc3VsdHMoKXtcclxuICAgICAgdHJ5e1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9zZWFyY2g/dGVybT0nICsgdGhpcy5zZWFyY2hUZXJtLnZhbHVlKTsgXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMuY3VycmVudE5ld3NQYWdlO1xyXG4gICAgICAgIGxldCB5ID0gMDtcclxuICAgICAgICBsZXQgaXRlbTtcclxuICAgICAgICBjb25zdCBwb3N0T3V0cHV0ID0gMztcclxuICAgICAgICBjb25zdCBuZXdzID0gcmVzdWx0cy51cGRhdGVzQW5kTmV3cztcclxuICAgICAgICBsZXQgbmV3c1BhZ2UgPSBbXTtcclxuICAgICAgICBsZXQgbmV3c1BhZ2VzID0gW107XHJcbiAgICAgICAgbGV0IG5ld3NTaG93bjtcclxuICAgICAgICBsZXQgcGFnZUxpc3ROdW1iZXIgPSAwO1xyXG4gICAgICAgIGlmKG5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgaWYobmV3cy5sZW5ndGggPD0gcG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlcy5jb25jYXQobmV3cyk7XHJcbiAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3cy5sZW5ndGggPiBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcihpdGVtID0gMTsgaXRlbSA8PSBwb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IG5ld3Muc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UucHVzaChyZW1vdmVkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIGlmKG5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZSA9IG5ld3Muc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKG5ld3NQYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihuZXdzUGFnZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgbmV3c1Nob3duID0gbmV3c1BhZ2VzW3hdO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBuZXdzU2hvd24gPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVzdWx0c0Rpdi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbmUtdGhpcmRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheV9fc2VjdGlvbi10aXRsZVwiPlByb3BlcnRpZXM8L2gyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5wcm9wZXJ0aWVzLmxlbmd0aCA/ICc8dWwgY2xhc3M9XCJsaW5rLWxpc3QgbWluLWxpc3RcIj4nIDogYDxwPk5vIHByb3BlcnRpZXMgbWF0Y2ggdGhhdCBzZWFyY2guPC9wPmB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5wcm9wZXJ0aWVzLm1hcChpdGVtID0+IGA8bGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5U3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImRpc3BsYXlJbWFnZXNcIiBkYXRhLW5hbWU9XCIke2l0ZW0udGl0bGUucmVwbGFjZUFsbCgnICcsICcnKX1cIiBzcmM9XCIke2l0ZW0uaXNDb21wbGV0ZWQgPyBpdGVtLmltYWdlIDogaXRlbS5wcm9qZWN0ZWRJbWFnZX1cIiBhbHQ9XCIke2l0ZW0udGl0bGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtpdGVtLnBlcm1hbGlua31cIj4ke2l0ZW0udGl0bGV9PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLnByb3BlcnRpZXMubGVuZ3RoID8gJzwvdWw+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25lLXRoaXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGVcIj5NZW1iZXJzPC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMubWVtYmVycy5sZW5ndGggPyAnPHVsIGNsYXNzPVwibGluay1saXN0IG1pbi1saXN0XCI+JyA6IGA8cD5ObyBtZW1iZXJzIG1hdGNoIHRoYXQgc2VhcmNoLjwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMubWVtYmVycy5tYXAoaXRlbSA9PiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz0ke2l0ZW0uaW1hZ2V9XCIgYWx0PVwiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLnBvc2l0aW9uT3JSb2xlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtpdGVtLnBlcm1hbGlua31cIj5SZWFkIE1vcmU8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLm1lbWJlcnMubGVuZ3RoID8gJzwvdWw+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25lLXRoaXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGVcIj5VcGRhdGVzIEFuZCBOZXdzPC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPHVsIGNsYXNzPVwibGluay1saXN0IG1pbi1saXN0XCI+JyA6IGA8cD5ObyBuZXdzIG9yIHVwZGF0ZXMgbWF0Y2ggdGhhdCBzZWFyY2g8L3A+ICA8YSBocmVmPVwiJHtzaXRlRGF0YS5yb290X3VybH0vY3VycmVudFwiPkdvIHRvIHZpZXdzIGFuZCB1cGRhdGUgc2VjdGlvbjwvYT5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke25ld3NTaG93bi5tYXAoaXRlbSA9PiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aDQ+JHtpdGVtLnRpdGxlfTwvaDQ+XHJcbiAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmNhcHRpb24ubGVuZ3RoID49IDEgPyBpdGVtLmNhcHRpb24gKyAnIC0gJyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmRhdGV9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+KnJlbGF0ZWQgd2lsbCBnbyBoZXJlPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmltYWdlICE9PSBudWxsID8gYDxpbWcgc3JjPVwiJHtpdGVtLmltYWdlfVwiIGFsdD1cIlwiPmAgOiBgPGRpdj4ke2l0ZW0udmlkZW99PC9kaXY+YH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJyZWFkLW1vcmVcIiBocmVmPVwiYWxsLW5ld3MvIyR7aXRlbS5pZH1cIj5SZWFkIE1vcmUuLi48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA/ICc8ZGl2IGlkPVwibmV3cy1wYWdlc1wiPicgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID4gMSA/IGA8YSBocmVmPVwiI1wiIGNsYXNzPVwibmV3cy1wYWdlXCIgZGF0YS1wYWdlPVwiJHt5Kyt9XCI+ICR7cGFnZUxpc3ROdW1iZXIgKz0gMX08L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA/ICc8L2Rpdj4nIDogJyd9ICBcclxuICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPC91bD4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYDtcclxuICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZVxyXG4gICAgICAgIGxldCBsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcGFnZT0nJHt4fSddYCk7XHJcbiAgICAgICAgbGluay5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnaXMgaXQgaGFwcGVuaW5nIGJlZm9yZSBjYXRjaD8nKVxyXG4gICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnNvbGUubG9nKCdpcyBpdCBoYXBwZW5pbmcgYWZ0ZXIgY2F0Y2g/JylcclxuICAgICAgICAgICAgdGhpcy5uZXdzUGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubmV3cy1wYWdlJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld3NQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLnRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TmV3c1BhZ2UgPSBzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3VsdHMoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaXMgaXQgaGFwcGVuaW5nIGluIG5ld3NQYWdlT3B0aW9ucz8nKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICBcclxuICAgICB9XHJcblxyXG4gICAga2V5UHJlc3NEaXNwYXRjaGVyKGUpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhlLmtleUNvZGUpO1xyXG4gICAgICAgIGlmIChlLmtleUNvZGUgPT0gODMgJiYgIXRoaXMuaXNPdmVybGF5T3BlbiAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUgIT0gXCJJTlBVVFwiICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQudGFnTmFtZSAhPSBcIlRFWFRBUkVBXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5vcGVuT3ZlcmxheSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoZS5rZXlDb2RlID09PSAyNyAmJiB0aGlzLmlzT3ZlcmxheU9wZW4pe1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlT3ZlcmxheSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvcGVuT3ZlcmxheSgpe1xyXG4gICAgICAgIHRoaXMuc2VhcmNoT3ZlcmxheS5jbGFzc0xpc3QuYWRkKFwic2VhcmNoLW92ZXJsYXktLWFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLmhlYWRlci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LmFkZCgnZnJlZXplJyk7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtLnZhbHVlID0gJyc7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKT0+IHRoaXMuc2VhcmNoVGVybS5mb2N1cygpLCAzMDEpO1xyXG4gICAgICAgIHRoaXMuaXNPdmVybGF5T3BlbiA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSAgIFxyXG4gICAgXHJcbiAgICBjbG9zZU92ZXJsYXkoKXtcclxuICAgICAgICB0aGlzLnNlYXJjaE92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnc2VhcmNoLW92ZXJsYXktLWFjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QucmVtb3ZlKCdmcmVlemUnKTtcclxuICAgICAgICB0aGlzLmlzT3ZlcmxheU9wZW4gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRTZWFyY2hIdG1sKCl7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgICAgIFwiYmVmb3JlZW5kXCIsXHJcbiAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaC1vdmVybGF5XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3RvcFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1zZWFyY2ggc2VhcmNoLW92ZXJsYXlfX2ljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2VhcmNoLXRlcm1cIiBwbGFjZWhvbGRlcj1cIldoYXQgYXJlIHlvdSBsb29raW5nIGZvcj9cIiBpZD1cInNlYXJjaC10ZXJtXCIgYXV0b2NvbXBsZXRlPVwiZmFsc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS13aW5kb3ctY2xvc2Ugc2VhcmNoLW92ZXJsYXlfX2Nsb3NlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJzZWFyY2gtb3ZlcmxheV9fcmVzdWx0c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoIiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcclxuLy9Db21iaW5lIHdpdGggb3RoZXIgcGFnaW5hdGlvbj9cclxuXHJcbmNsYXNzIFNoYWRvd0JveCB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG5cclxuICAgICAgICB0aGlzLmh0bWw7XHJcbiAgICAgICAgdGhpcy5tZWRpYUxpbms7XHJcblxyXG4gICAgICAgIHRoaXMubWVkaWFSZWNpZXZlcjtcclxuICAgICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW47XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudE93bmVySWQ7IFxyXG4gICAgICAgIHRoaXMubG9jYWxTdG9yYWdlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY3VycmVudE1lZGlhO1xyXG4gICAgICAgIHRoaXMubWVkaWFNZW51O1xyXG4gICAgICAgIHRoaXMubWVkaWFDb2x1bW47XHJcbiAgICAgICAgdGhpcy5tZWRpYVRodW1iO1xyXG4gICAgICAgIHRoaXMubWVkaWFQYWdpbmF0aW9uO1xyXG5cclxuICAgICAgICB0aGlzLnZpZGVvU3JjO1xyXG4gICAgICAgIHRoaXMucGxheUJ1dHRvbjtcclxuICAgICAgICB0aGlzLmNsb3NlTWVkaWFCdXR0b247XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YUNvdW50O1xyXG4gICAgICAgIHRoaXMucG9zdE91dHB1dDtcclxuICAgICAgICB0aGlzLnBhZ2VDb3VudDtcclxuICAgICAgICB0aGlzLnBvc3RQYWdlO1xyXG4gICAgICAgIHRoaXMucG9zdFBhZ2VzO1xyXG4gICAgICAgIHRoaXMuY29udGVudFNob3duO1xyXG5cclxuICAgICAgICAvL1Jlc2V0IHdoZW4gY2hhbmdlIGZpbHRlciBhbmQgZGlzbWlzcyBjdXJyZW50IHZpZHNcclxuICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbjsgXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZXM7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uO1xyXG4gICAgICAgIHRoaXMucG9zdEZpZWxkO1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1lZGlhO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbjtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdMb2FkO1xyXG5cclxuICAgICAgICB0aGlzLmV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50cygpe1xyXG4gICAgICAgIHRoaXMuY29udGVudFNob3duO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gMDtcclxuICAgICAgICB0aGlzLmh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XHJcbiAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50T3duZXJJZCA9IG51bGw7IFxyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lZGlhLWNhcmQgKicpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1lZGlhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2N1cnJlbnQtbWVkaWEnKTtcclxuICAgICAgICB0aGlzLm1lZGlhTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1tZW51Jyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYUNvbHVtbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jb2x1bW4nKTtcclxuICAgICAgICB0aGlzLm1lZGlhVGh1bWI7XHJcbiAgICAgICAgdGhpcy5tZWRpYVBhZ2luYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtcGFnaW5hdGlvbicpO1xyXG4gICAgICAgIHRoaXMuZ2FsbGVyeVBvc2l0aW9uID0gMDsgXHJcbiAgICAgICAgdGhpcy5wb3N0RmllbGQgPSAnZ2FsbGVyeSc7XHJcbiAgICAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyk7XHJcbiAgICAgICAgdGhpcy5uZXdMb2FkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5tZWRpYUxpbmsuZm9yRWFjaChtZWRpYT0+e1xyXG4gICAgICAgICAgICBtZWRpYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gdGhpcy5zaGFkb3dCb3gobWVkaWEpKVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGUgPT4gdGhpcy5rZXlQcmVzc0Rpc3BhdGNoZXIoZSkpXHJcbiAgICAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnRoaXMuY2xvc2VNZWRpYVJlY2lldmVyKCkpXHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICAgICAgc2hhZG93Qm94KG1lZGlhKXtcclxuICAgICAgICAgICAgdGhpcy5tZWRpYVJlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXIuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgICAgICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSB0cnVlOyBcclxuICAgICAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5hZGQoJ2ZyZWV6ZScpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHBvc3RUeXBlID0gbWVkaWEuZGF0YXNldC5wb3N0O1xyXG4gICAgICAgICAgICBsZXQgZGF0YUlkID0gcGFyc2VJbnQobWVkaWEuZGF0YXNldC5pZCk7XHJcblxyXG4gICAgICAgICAgICBpZihwb3N0VHlwZSAhPT0gJ25vbmUnKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0TWVkaWEocG9zdFR5cGUsIGRhdGFJZCk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJJc29sYXRlZE1lZGlhKG1lZGlhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXN5bmMgZ2V0TWVkaWEoZGF0YVR5cGUsIGRhdGFJZCl7XHJcbiAgICAgICAgICAgIHRyeXtcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL21lZGlhP3JlbGF0ZWQnKTsgXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZmlsdGVyTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXN1bHRzW2RhdGFUeXBlXS5mb3JFYWNoKGl0ZW09PntcclxuICAgICAgICAgICAgICAgIGxldCBwb3N0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtLmdhbGxlcnkpKTtcclxuICAgICAgICAgICAgICAgIGlmKGl0ZW0uaWQgPT09IGRhdGFJZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0c1tkYXRhVHlwZV0pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0ucG9zdFR5cGUgPT09ICdwcm9wZXJ0eScpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lZGlhTWVudS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImdhbGxlcnlcIiBjbGFzcz1cImFjdGl2ZVwiPkdlbmVyYWw8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImludGVyaW9yXCI+SW50ZXJpb3I8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImZsb29yUGxhbnNcIj5GbG9vciBQbGFuczwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiYnVpbGRpbmdQbGFuc1wiPkJ1aWxkaW5nIFBsYW5zPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVudUxpbmsgPSB0aGlzLm1lZGlhTWVudS5xdWVyeVNlbGVjdG9yQWxsKCdhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVMaW5rLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RGaWVsZCA9IGkuY3VycmVudFRhcmdldC5pZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbVt0aGlzLnBvc3RGaWVsZF0pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5ld0xvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxNZWRpYVBvcHVsYXRpb24oaXRlbSwgcG9zdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVMaW5rLmZvckVhY2goYz0+e2MuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLnRhcmdldC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIwXCJdYCkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIjBcIl1gKS5jaGlsZHJlblswXS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGxldCBhbGxOZXdzID0gcmVzdWx0c1sndXBkYXRlcyddLmNvbmNhdChyZXN1bHRzWyduZXdzJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgYWxsTmV3cy5tYXAocmVwb3J0cz0+e1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgcmVwb3J0cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocG9zdD0+e1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGlmKHBvc3QuSUQgPT09IGl0ZW0uaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICBpdGVtLmdhbGxlcnkucHVzaChyZXBvcnRzLmdhbGxlcnkpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYoZGF0YUlkICE9PSAgdGhpcy5jdXJyZW50T3duZXJJZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE93bmVySWQgPSBkYXRhSWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmxvY2FsU3RvcmFnZSA9IHRoaXMuY29udGVudFNob3duO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxNZWRpYVBvcHVsYXRpb24oaXRlbSwgcG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRoaXMuYWNjZXNzTG9jYWxTdG9yYWdlKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5pdGlhbE1lZGlhUG9wdWxhdGlvbihpdGVtLCBwb3N0KXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGlmIG1vcmUgdGhhbiBvbmUsIHNob3dcclxuICAgICAgICAgICAgLy8gaXMgdGhlcmUgYSBtb3JlIGFjY2Vzc2libGUtZnJpZW5kbHkgaHRtbCB0YWcgZm9yIGZpbHRyciBtZW51cz9cclxuICAgICAgICAgICAgLy9IYXZlIGRlc2Mgd2l0aCAncmVhZCBtb3JlJyB1bmRlciBhY3RpdmUgdmlkLiBFeGVycHQgdW5kZXIgc2VsZWN0aW9uLCBvZiBleGlzdHMsIG90aGVyd2lzZSB0cmltXHJcblxyXG4gICAgICAgICAgICB0aGlzLmRhdGFDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdE91dHB1dCA9IDE7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZUNvdW50ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wb3N0UGFnZSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLnBvc3RQYWdlcyA9IFtdO1xyXG5cclxuICBcclxuICAgICAgICAgICAgaWYocG9zdC5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgaWYocG9zdC5sZW5ndGggPD0gdGhpcy5wb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IHRoaXMucG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHBvc3QubGVuZ3RoID4gdGhpcy5wb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpdGVtID0gMTsgaXRlbSA8PSB0aGlzLnBvc3RPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IHBvc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UucHVzaChyZW1vdmVkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IHRoaXMucG9zdFBhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZSA9IHBvc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RQYWdlcy5wdXNoKHRoaXMucG9zdFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5wb3N0UGFnZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRTaG93biA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5wb3N0UGFnZXMpKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW0pXHJcbiBcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZU1lZGlhQ29sdW1uKGl0ZW0sIHRoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VzXSk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGl0ZW0pXHJcbiAgICAgICAgICAgIGlmKHRoaXMubmV3TG9hZCA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5ld0xvYWQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJDdXJyZW50TWVkaWEoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluc2VydFBhZ2luYXRpb24oaXRlbSwgdGhpcy5kYXRhQ291bnQsIHRoaXMucGFnZUNvdW50KTtcclxuICAgICAgICAgICAgfVxyXG4gXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJJc29sYXRlZE1lZGlhKG1lZGlhKXtcclxuICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LnJlbW92ZSgnYXNwZWN0LXJhdGlvJyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5hZGQoJ2NlbnRlci1kaXNwbGF5Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHttZWRpYS5kYXRhc2V0LmZ1bGx9XCI+XHJcbiAgICAgICAgICAgIGA7ICBcclxuICAgXHJcbiAgICAgICAgICAgIC8vIHRoaXMudmlkZW9TcmMgPSB0aGlzLmN1cnJlbnRNZWRpYS5xdWVyeVNlbGVjdG9yKCdpbWcnKS5kYXRhc2V0LnZpZGVvLnJlcGxhY2UoJ3dhdGNoP3Y9JywgJ2VtYmVkLycpICsgJz9hdXRvcGxheT0xJztcclxuICAgICAgICAgICAgLy8gdGhpcy5wbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BsYXktYnV0dG9uJyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGxheUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT50aGlzLnBsYXlWaWRlbyh0aGlzLnZpZGVvU3JjKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW5kZXJDdXJyZW50TWVkaWEoaXRlbSl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5pbm5lckhUTUwgPSBgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgJHtpdGVtW3RoaXMucG9zdEZpZWxkXVt0aGlzLmdhbGxlcnlQb3NpdGlvbl0udmlkZW9Tb3VyY2UgPyAnPGRpdiBpZD1cInBsYXktYnV0dG9uLWNvbnRhaW5lclwiPjxidXR0b24gaWQ9XCJwbGF5LWJ1dHRvblwiPjxkaXY+PC9kaXY+PC9idXR0b24+PC9kaXY+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPGltZyBkYXRhLXZpZGVvPVwiJHtpdGVtW3RoaXMucG9zdEZpZWxkXVt0aGlzLmdhbGxlcnlQb3NpdGlvbl0udmlkZW9Tb3VyY2V9XCIgc3JjPVwiJHtpdGVtW3RoaXMucG9zdEZpZWxkXVt0aGlzLmdhbGxlcnlQb3NpdGlvbl0uaW1hZ2V9XCI+XHJcbiAgICAgICAgICAgIGA7ICBcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlkZW9TcmMgPSB0aGlzLmN1cnJlbnRNZWRpYS5xdWVyeVNlbGVjdG9yKCdpbWcnKS5kYXRhc2V0LnZpZGVvLnJlcGxhY2UoJ3dhdGNoP3Y9JywgJ2VtYmVkLycpICsgJz9hdXRvcGxheT0xJztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucGxheUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbGF5LWJ1dHRvbicpO1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5wbGF5QnV0dG9uKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT50aGlzLnBsYXlWaWRlbyh0aGlzLnZpZGVvU3JjKSk7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QuYWRkKCdhc3BlY3QtcmF0aW8nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5yZW1vdmUoJ2NlbnRlci1kaXNwbGF5Jyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LnJlbW92ZSgnYXNwZWN0LXJhdGlvJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QuYWRkKCdjZW50ZXItZGlzcGxheScpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcG9wdWxhdGVNZWRpYUNvbHVtbihpdGVtLCBjb250ZW50KXtcclxuICAgICAgICAgICAgdGhpcy5tZWRpYUNvbHVtbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICR7Y29udGVudC5tYXAoaSA9PiBgXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBkYXRhLXBvc2l0aW9uPVwiJHtpdGVtW3RoaXMucG9zdEZpZWxkXS5maW5kSW5kZXgoYT0+e3JldHVybiBhLmlkID09PSBpLmlkfSl9XCIgIGNsYXNzPVwibWVkaWEtc2VsZWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJtZWRpYS10aHVtYlwiIHNyYz1cIiR7aS5zZWxlY3RJbWFnZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWluZm9ybWF0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2kudGl0bGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpLmRlc2NyaXB0aW9ufTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFUaHVtYiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS10aHVtYicpO1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5uZXdMb2FkID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVkaWFUaHVtYlswXS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1lZGlhLXRodW1iLnNlbGVjdGVkJykucGFyZW50Tm9kZS5kYXRhc2V0LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50U2VsZWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWIuZm9yRWFjaCh0aHVtYj0+e1xyXG4gICAgICAgICAgICAgICAgdGh1bWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PntcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWIuZm9yRWFjaChjPT57Yy5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpO30pXHJcbiAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlLnRhcmdldClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckN1cnJlbnRNZWRpYShpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gZS50YXJnZXQucGFyZW50Tm9kZS5kYXRhc2V0LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFNlbGVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAvL2FjdGl2YXRlIHRoZSBzZXBlcmF0ZSBmdW5jdGlvbiB0aGF0IGZpbGxzIHRoZSBjdXJyZW50TWRpYSBjb250YWluZXJcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5zZXJ0UGFnaW5hdGlvbihpdGVtLCBkYXRhQ291bnQsIHBhZ2VDb3VudCl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFQYWdpbmF0aW9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICR7dGhpcy5wb3N0UGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5wb3N0UGFnZXMubGVuZ3RoID4gMSA/IGA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZVwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSAgXHJcbiAgICAgICAgICAgIGA7XHJcblxyXG4gICAgICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1wYWdpbmF0aW9uIC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5maXJzdFBhZ2VCdXR0b24pXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNtZWRpYS1wYWdpbmF0aW9uIC5jb250ZW50LXBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoaXRlbSwgY29udGVudFBhZ2VPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubmV3TG9hZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoaXRlbSwgY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRTZWxlY3Rpb24pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVNZWRpYUNvbHVtbihpdGVtLCB0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlc10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChpID0+eyAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkgIFxyXG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHt0aGlzLmN1cnJlbnRTZWxlY3Rpb259XCJdYCkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7dGhpcy5jdXJyZW50U2VsZWN0aW9ufVwiXWApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7dGhpcy5jdXJyZW50U2VsZWN0aW9ufVwiXWApLmNoaWxkcmVuWzBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSkgICAgXHJcblxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGNsb3NlTWVkaWFSZWNpZXZlcigpe1xyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5tZWRpYU1lbnUuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZWRpYU1lbnUucmVtb3ZlQ2hpbGQodGhpcy5tZWRpYU1lbnUuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLm1lZGlhQ29sdW1uLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVkaWFDb2x1bW4ucmVtb3ZlQ2hpbGQodGhpcy5tZWRpYUNvbHVtbi5maXJzdENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuY3VycmVudE1lZGlhLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudE1lZGlhLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZTsgXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QucmVtb3ZlKCdmcmVlemUnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2FsbGVyeVBvc2l0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wb3N0RmllbGQgPSAnZ2FsbGVyeSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld0xvYWQgPSB0cnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBrZXlQcmVzc0Rpc3BhdGNoZXIoZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSwgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuKVxyXG4gICAgICAgICAgICBpZihlLmtleUNvZGUgPT09IDI3ICYmIHRoaXMuaXNNZWRpYVJlY2lldmVyT3Blbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTWVkaWFSZWNpZXZlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5VmlkZW8odmlkZW9TcmMpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2aWRlb1NyYylcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxpZnJhbWUgYWxsb3dmdWxsc2NyZWVuPVwiYWxsb3dmdWxsc2NyZWVuXCIgc3JjPVwiJHt2aWRlb1NyY31cIj48L2lmcmFtZT5cclxuICAgICAgICAgICAgYDtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNoYWRvd0JveDsiLCJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgU2hhZG93Qm94IGZyb20gJy4vc2hhZG93Qm94JztcclxuLy9UaGUgc2ltcGxpY2l0eSBvZiB0aGlzIGlzIGEgY2hhbmNlIHRvIHRyeSB0byBtYWtlIG15IHBhZ2luYXRpb24gY29kZSBhbmQgY29kZSBpbiBnZW5lcmFsIGNsZWFuZXIgYW5kIG1vcmUgZWZmaWNpZW50XHJcbmNsYXNzIFJlbGF0ZWROZXdze1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLm5ld3NSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXdzLXJlY2lldmVyJyk7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BhZ2luYXRpb24taG9sZGVyJyk7XHJcbiAgICAgICAgLy9pbnRlcmZlcmVzIHdpdGggU0IuIEZpZ3VyZSBvdXQgaG93IHRvIHByZXZlbnQgb24gcGFnZXMgd2hlcmUgaW52YWxpZC5cclxuICAgICAgICAvL0Fsc28gd2l0aCBhbGwtbmV3cyBpZiBvbmx5IDEgcGFnZVxyXG4gICAgICAgIHRoaXMuY3VycmVudFBvc3RJRCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluSW1hZ2VBbmRTdGF0cyBpbWcnKS5kYXRhc2V0LmlkO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAwO1xyXG4gICAgICAgIHRoaXMuY29udGVudFNob3duO1xyXG4gICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudncgPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgMCwgd2luZG93LmlubmVyV2lkdGggfHwgMClcclxuICAgICAgICB0aGlzLmV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50cygpe1xyXG4gICAgICAgIHRoaXMuZmV0Y2hSZWxhdGVkTmV3cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGZldGNoUmVsYXRlZE5ld3MoKXtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9tZWRpYT9yZWxhdGVkJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgY29uc3QgYWxsTmV3cyA9IHJlc3VsdHMudXBkYXRlcy5jb25jYXQocmVzdWx0cy5uZXdzKTtcclxuICAgICAgICAgICAgY29uc3QgcmVsYXRlZE5ld3MgPSBbXTsgXHJcbiAgICAgICAgICAgIGxldCBsaW1pdCA9IDE7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YUNvdW50ID0gMDtcclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIC8vT3JnYW5pemUgdGhlIG5ld3MgdGhhdCdzIHRocm93biBpbnRvIHJlbGF0ZWROZXdzLCBpbiBkYXRlIG9yZGVyXHJcbiAgICAgICAgICAgIC8vQ29uc2lkZXIgcGVyZm9ybWluZyB0aGUgZGF0ZSBvcmRlciBvbiBiYWNrZW5kLCB0aG91Z2ggY291bGQgYW5ub3lvbmcsIGdpdmVuIGxlc3MgcGhwIGV4cGVyaWVuY2UsIGJ1dCBjb3VsZCBiZSBiZW5lZmljaWFsIHRvIHByb2dyZXNzIG92ZXIgYWxsIFxyXG4gICAgICAgICAgICBpZighdGhpcy5jb250ZW50TG9hZGVkKXtcclxuICAgICAgICAgICAgICAgIGFsbE5ld3MuZm9yRWFjaChuZXdzID0+e1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3MucmVsYXRpb25zaGlwcy5mb3JFYWNoKHI9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoci5JRCA9PT0gcGFyc2VJbnQodGhpcy5jdXJyZW50UG9zdElEKSAmJiBsaW1pdCA8PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0Kz0xXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGVkTmV3cy5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBpZihyZWxhdGVkTmV3cy5sZW5ndGgpeyAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFNob3duID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxhdGVkTmV3cykpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlUGFnaW5hdGlvbkhvbGRlcihkYXRhQ291bnQsIHBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVOZXdzUmVjaWV2ZXIoKTtcclxuXHJcbiAgIFxyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvcHVsYXRlTmV3c1JlY2lldmVyKCl7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0pXHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8aDQ+JHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS50aXRsZX08L2g0PlxyXG4gICAgICAgICAgICA8cD4ke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmNhcHRpb24gPyBgJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5jYXB0aW9ufSAtYCA6ICcnfSAke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmRhdGV9PC9wPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtY2FyZFwiPjxpbWcgZGF0YS1wb3N0PVwiJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5wb3N0VHlwZVBsdXJhbH1cIiBkYXRhLWlkPVwiJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5pZH1cIiBzcmM9XCIke3RoaXMudncgPj0gMTIwMCA/IGAke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmdhbGxlcnlbMF0uaW1hZ2V9YCA6IGAke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmdhbGxlcnlbMF0uc2VsZWN0SW1hZ2V9YH1cIj48L2Rpdj5cclxuICAgICAgICAgICAgPHA+JHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5mdWxsRGVzY3JpcHRpb259PC9wPlxyXG4gICAgICAgIGA7XHJcbiAgXHJcbiAgICAgICAgU2hhZG93Qm94LnByb3RvdHlwZS5ldmVudHMoKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhTaGFkb3dCb3gucHJvdG90eXBlLm1lZGlhTGluaylcclxuICAgIH1cclxuXHJcbiAgICBwb3B1bGF0ZVBhZ2luYXRpb25Ib2xkZXIoZGF0YUNvdW50LCBwYWdlQ291bnQpe1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICR7dGhpcy5jb250ZW50U2hvd24ubGVuZ3RoID8gJzxkaXYgY2xhc3M9XCJjb250ZW50LXBhZ2VzXCI+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgJHt0aGlzLmNvbnRlbnRTaG93bi5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmNvbnRlbnRTaG93bi5sZW5ndGggPiAxID8gYDxhIGNsYXNzPVwiY29udGVudC1wYWdlXCIgZGF0YS1wYWdlPVwiJHtkYXRhQ291bnQrK31cIj4gJHtwYWdlQ291bnQgKz0gMX08L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9IFxyXG4gICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLmxlbmd0aCA/ICc8L2Rpdj4nIDogJyd9IFxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJyk7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmNvbnRlbnRMb2FkZWQpe1xyXG4gICAgICAgICAgICBpZih0aGlzLmZpcnN0UGFnZUJ1dHRvbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfSAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtcGFnZScpO1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwYWdpbmF0aW9uRnVuY3Rpb25hbGl0eSgpe1xyXG4gICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLmN1cnJlbnRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHBhcnNlSW50KHNlbGVjdGVkUGFnZS5kYXRhc2V0LnBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2hSZWxhdGVkTmV3cygpXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChpID0+eyBcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKVxyXG4gICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pICBcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVsYXRlZE5ld3MgIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vTG9vayB1cCBob3cgdG8gYnVuZGxlIHNjc3MgaGVyZSB1c2luZyB3ZWJwYWNrIGFuZCBtYWtlIHRoaXMgaW50byBhbiBpbXBvcnQgZmlsZShBbHNvIHVzZSBzZXBlcmF0ZSBmaWxlIGZvciBnZW4gbG9naWMsIFxyXG4vL3NvIGNhbiBjb25kaXRpb25hbCB0aGlzIGZvciBmb3JtcylcclxuaW1wb3J0ICcuLi9jc3Mvc3R5bGUuY3NzJztcclxuaW1wb3J0ICcuLi9jc3MvZG90cy5jc3MnXHJcblxyXG5pbXBvcnQgU2VhcmNoIGZyb20gJy4vbW9kdWxlcy9zZWFyY2gnO1xyXG5pbXBvcnQgUGFnaW5hdGlvbiBmcm9tICcuL21vZHVsZXMvcGFnaW5hdGlvbic7XHJcbmltcG9ydCBOZXdzIGZyb20gJy4vbW9kdWxlcy9hbGwtbmV3cyc7XHJcbmltcG9ydCBSZWxhdGVkTmV3cyBmcm9tICcuL21vZHVsZXMvc2luZ2xlUG9zdCc7XHJcbmltcG9ydCBTaGFkb3dCb3ggZnJvbSAnLi9tb2R1bGVzL3NoYWRvd0JveCc7XHJcblxyXG5jb25zdCBzZWFyY2ggPSBuZXcgU2VhcmNoKCk7XHJcbmNvbnN0IHBhZ2luYXRpb24gPSBuZXcgUGFnaW5hdGlvbigpO1xyXG5jb25zdCBuZXdzID0gbmV3IE5ld3MoKTtcclxuY29uc3QgcmVsYXRlZE5ld3MgPSBuZXcgUmVsYXRlZE5ld3MoKTtcclxuY29uc3Qgc2hhZG93Qm94ID0gbmV3IFNoYWRvd0JveCgpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==