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
___CSS_LOADER_EXPORT___.push([module.id, "@charset \"UTF-8\";\nhtml {\n  overflow-x: hidden;\n  margin: 0;\n}\n@media (min-width: 767px) {\n  html {\n    font-size: 1vw;\n  }\n}\n@media (min-width: 1200px) {\n  html {\n    font-size: 1.85vh;\n  }\n}\nhtml.freeze {\n  overflow: hidden;\n}\n\nbody {\n  margin: 0;\n  color: antiquewhite;\n  height: 100%;\n}\n\nh1 {\n  margin: 0;\n  margin-bottom: 3rem;\n  font-size: 4rem;\n}\n\nh2 {\n  font-size: 2.5rem;\n  margin: 0;\n}\n@media (min-width: 1200px) {\n  h2 {\n    font-size: 2.15rem;\n  }\n}\nh2 a {\n  font-size: 1.9rem;\n}\n\nh3 {\n  font-size: 2.3rem;\n  margin: 0;\n}\n\na {\n  text-decoration: none;\n  color: inherit;\n}\n\na {\n  cursor: pointer;\n}\n\na.hidden, a.selectedPage {\n  pointer-events: none;\n}\n\na.hidden {\n  opacity: 0;\n}\n\na.selectedPage {\n  color: #e8aa77;\n  filter: saturate(120%);\n}\n\n*.hidden {\n  display: none;\n  pointer-events: none;\n}\n\ndiv, button {\n  box-sizing: border-box;\n}\n\nbutton {\n  border: none;\n  background: transparent;\n}\n\nli {\n  list-style-type: none;\n}\n\n#overallContainer {\n  position: relative;\n  top: 0;\n}\n#overallContainer.faded {\n  filter: opacity(40%);\n}\n\n.contentContainer {\n  height: initial;\n  width: 100%;\n  margin: 4% 0;\n  margin-bottom: 5%;\n  display: flex;\n  justify-content: center;\n}\n.contentContainer > div {\n  display: flex;\n  justify-content: center;\n  padding-top: 5.5rem;\n}\n@media (min-width: 767px) {\n  .contentContainer > div {\n    width: 95%;\n  }\n}\n@media (min-width: 1200px) {\n  .contentContainer > div {\n    width: 85%;\n  }\n}\n.contentContainer_paginated .textBox .content-pages {\n  text-align: center;\n}\n.contentContainer_paginated .textBox .content-pages a {\n  font-size: 1.75rem;\n}\n\n.titleAndTextBox, .contentBox {\n  position: relative;\n}\n\n.titleAndTextBox {\n  margin-right: 5%;\n}\n\n.titleBox, .textBox {\n  height: 50%;\n  width: 16rem;\n}\n\n.titleBox {\n  padding: 10%;\n}\n.titleBox > * {\n  height: 50%;\n  width: 100%;\n  margin: 0;\n}\n.titleBox > :nth-child(2) {\n  display: flex;\n}\n.titleBox > :nth-child(2) h2 {\n  align-self: flex-end;\n  padding-bottom: 15%;\n}\n\n.contentBox.properties, .contentBox.members {\n  display: grid;\n  row-gap: 0.35rem;\n}\n@media (min-width: 767px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(3, 33.3%);\n  }\n}\n@media (min-width: 1200px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(4, 25%);\n  }\n}\n\n.contentBox {\n  width: 100%;\n  height: 100%;\n}\n.contentBox.properties > div, .contentBox.members > div {\n  width: 14rem;\n}\n.contentBox.properties > div .displaySquares, .contentBox.members > div .displaySquares {\n  box-sizing: initial;\n  position: relative;\n  text-align: center;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.contentBox.properties > div .displaySquares .interaction-prompt, .contentBox.members > div .displaySquares .interaction-prompt {\n  text-align: center;\n  position: absolute;\n  background-color: rgba(20, 20, 20, 0.7);\n  padding: 0.2rem 0.2rem;\n  margin-top: 7.6rem;\n  border-radius: 30%;\n  font-size: 1.5rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares .interaction-prompt .click-prompt, .contentBox.members > div .displaySquares .interaction-prompt .click-prompt {\n    display: none;\n  }\n}\n.contentBox.properties > div .displaySquares .interaction-prompt .hover-prompt, .contentBox.members > div .displaySquares .interaction-prompt .hover-prompt {\n  display: none;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares .interaction-prompt .hover-prompt, .contentBox.members > div .displaySquares .interaction-prompt .hover-prompt {\n    display: block;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks, .contentBox.members > div .displaySquares-pageLinks {\n  position: absolute;\n  display: none;\n  flex-direction: column;\n  width: 100%;\n  text-align: center;\n}\n.contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n  color: rgb(238, 231, 210);\n  cursor: pointer;\n  font-size: 1.5rem;\n  margin-top: 0.7rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n    font-size: 1.3rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n  font-size: 2rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n    font-size: 1.4rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks *:hover, .contentBox.members > div .displaySquares-pageLinks *:hover {\n  transform: scale(110%);\n  filter: brightness(120%);\n}\n.contentBox.properties > div .displaySquares-pageLinks i, .contentBox.members > div .displaySquares-pageLinks i {\n  font-size: 1.4rem;\n}\n.contentBox.properties > div .displaySquares .displaySquares-pageLinks__visible, .contentBox.members > div .displaySquares .displaySquares-pageLinks__visible {\n  display: flex;\n}\n.contentBox.properties > div .displaySquares div p, .contentBox.properties > div .displaySquares div a, .contentBox.members > div .displaySquares div p, .contentBox.members > div .displaySquares div a {\n  margin: 2%;\n}\n.contentBox.properties > div .display-text, .contentBox.members > div .display-text {\n  margin-top: -0.3rem;\n  text-align: center;\n  font-size: 1.3rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.2rem;\n}\n.contentBox.properties > div .display-text p, .contentBox.members > div .display-text p {\n  margin: 0;\n}\n.contentBox.properties > div .display-text p:nth-of-type(2), .contentBox.members > div .display-text p:nth-of-type(2) {\n  font-weight: 700;\n}\n.contentBox .news {\n  margin: 0 1%;\n  padding-top: 5%;\n  height: auto;\n}\n.contentBox .news iframe {\n  width: 300px;\n  height: 200px;\n}\n\n#footerContainer {\n  background-color: rgba(39, 39, 39, 0.7);\n  margin: 0;\n  display: flex;\n  position: fixed;\n  bottom: 0;\n  width: 100%;\n  justify-content: space-between;\n  align-items: center;\n  padding-right: 2rem;\n  padding-left: 2rem;\n  color: ivory;\n}\n#footerContainer .credit {\n  font-size: 1.5rem;\n}\n@media (min-width: 1200px) {\n  #footerContainer .credit {\n    font-size: 1.2rem;\n  }\n}\n#footerContainer #social-container a {\n  font-size: 1.7rem;\n  margin: 1rem;\n}\n@media (min-width: 1200px) {\n  #footerContainer #social-container a {\n    font-size: 1.3rem;\n    margin: 0.65rem;\n  }\n}\n\n#openingContainer {\n  height: 99.5vh;\n  position: relative;\n  color: rgb(189, 189, 189);\n  display: flex;\n  justify-content: center;\n}\n#openingContainer h1 {\n  font-size: 5.2rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer h1 {\n    font-size: 6.5rem;\n  }\n}\n#openingContainer p {\n  font-size: 2.5rem;\n  font-weight: 600;\n}\n@media (min-width: 1200px) {\n  #openingContainer p {\n    font-size: 2.7rem;\n  }\n}\n#openingContainer #welcomeContainer div {\n  text-shadow: 1px 1px black;\n  width: 80%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer div {\n    width: 70%;\n  }\n}\n#openingContainer header {\n  display: grid;\n  grid-template-columns: [logoSymbol] 6% [logoText] 29% [navigation] 1fr;\n  grid-template-areas: \"logoSymbol logoText navigation\";\n  grid-auto-flow: column;\n  justify-self: end;\n  background-color: rgba(70, 62, 55, 0.85);\n  box-shadow: 0.2rem 0.2rem 1rem 0.4rem inset rgba(49, 43, 39, 0.75);\n  width: 100%;\n  height: 5.5rem;\n  position: fixed;\n  top: 0;\n  z-index: 9999;\n  color: rgb(199, 187, 156);\n}\n@media (min-width: 1200px) {\n  #openingContainer header {\n    grid-auto-flow: row;\n    grid-template-columns: [logoSymbol] 4% [logoText] 25% [navigation] 1fr;\n    grid-template-areas: \"logoSymbol logoText navigation\";\n  }\n}\n@media (min-width: 1200px) {\n  #openingContainer header {\n    height: 4rem;\n  }\n}\n#openingContainer header.hidden {\n  display: none;\n}\n#openingContainer header button {\n  font-size: 1.8rem;\n  width: 10rem;\n  cursor: pointer;\n}\n#openingContainer header button i {\n  display: inline;\n}\n#openingContainer header #logo-symbol, #openingContainer header #logo-text {\n  height: 4.5rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer header #logo-symbol, #openingContainer header #logo-text {\n    height: 3rem;\n  }\n}\n#openingContainer header #logo-symbol {\n  grid-area: logoSymbol;\n  margin-top: 0.3rem;\n  padding-left: 0.5rem;\n}\n#openingContainer header #logo-text {\n  grid-area: logoText;\n  margin-top: 0.6rem;\n  padding-left: 0.2rem;\n}\n#openingContainer header img {\n  height: 100%;\n}\n#openingContainer header p, #openingContainer header nav {\n  margin: 0;\n}\n#openingContainer header nav {\n  position: relative;\n  justify-self: end;\n  overflow: hidden;\n  margin-right: 2rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav {\n    grid-area: navigation;\n    background-color: transparent;\n    overflow: visible;\n    justify-self: unset;\n  }\n}\n#openingContainer header nav ul {\n  overflow: hidden;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-evenly;\n  align-items: center;\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul {\n    flex-direction: row;\n    gap: 1.5rem;\n    height: 100%;\n    justify-content: initial;\n  }\n}\n#openingContainer header nav ul li {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 100%;\n  background-color: rgb(70, 62, 55);\n  box-shadow: 0.2rem 0.2rem 1rem 0.6rem inset rgba(49, 43, 39, 0.75);\n  border-radius: 5%;\n  border-bottom: 0.3rem solid rgba(51, 45, 40, 0.85);\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul li {\n    box-shadow: none;\n    width: initial;\n    height: initial;\n    background-color: transparent;\n    border-radius: initial;\n    border: none;\n  }\n}\n#openingContainer header nav ul li a {\n  padding: 0.5rem 1rem;\n  font-size: 1.8rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul li a {\n    padding: 0;\n  }\n}\n#openingContainer header nav ul #mobile-nav-caller {\n  height: 5.5rem;\n  box-shadow: none;\n  border: none;\n  background: transparent;\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul #mobile-nav-caller {\n    height: 4rem;\n  }\n}\n@media (min-width: 1200px) {\n  #openingContainer header nav ul #mobile-nav-caller {\n    display: none;\n  }\n}\n#openingContainer header nav ul #mobile-nav-caller button {\n  color: aliceblue;\n}\n#openingContainer header nav.opened {\n  overflow: visible;\n}\n#openingContainer #pageImage {\n  top: 0;\n  height: 100%;\n  width: 100%;\n}\n#openingContainer #pageImage img {\n  height: 100%;\n  width: 100%;\n  filter: blur(0.6rem) grayscale(50%);\n}\n#openingContainer #welcomeContainer {\n  position: absolute;\n  text-align: center;\n  align-items: center;\n  margin-top: 1%;\n  display: flex;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer {\n    margin-top: 2%;\n  }\n}\n#openingContainer #welcomeContainer img {\n  height: 6rem;\n}\n\n.titleBox {\n  background: transparent;\n}\n.titleBox p {\n  font-size: 1.5rem;\n}\n\n.textBox {\n  padding-left: 0.5rem;\n}\n.textBox p {\n  font-size: 1.3rem;\n  color: white;\n}\n\n@media (min-width: 1200px) {\n  #propertiesContainer, #membersContainer {\n    height: 52rem;\n  }\n}\n#propertiesContainer > div .titleBox, #membersContainer > div .titleBox {\n  border: 0.35rem solid rgb(199, 187, 156);\n}\n#propertiesContainer img, #membersContainer img {\n  width: 100%;\n  height: 100%;\n  margin-bottom: 1rem;\n}\n#propertiesContainer img.pageLinks__visible, #membersContainer img.pageLinks__visible {\n  filter: brightness(27%);\n}\n\n#allNewsContainer {\n  height: 51rem;\n}\n@media (min-width: 1200px) {\n  #allNewsContainer {\n    height: 52rem;\n  }\n}\n\n#contactContainer {\n  height: 55rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer {\n    height: 52rem;\n  }\n}\n\n#allNewsContainer, #contactContainer {\n  background-color: rgb(31, 27, 21);\n  color: white;\n}\n#allNewsContainer > div .titleBox, #contactContainer > div .titleBox {\n  border: 4px solid rgb(221, 221, 221);\n}\n#allNewsContainer > div .textBox p, #contactContainer > div .textBox p {\n  color: antiquewhite;\n}\n#allNewsContainer .contentBox, #contactContainer .contentBox {\n  display: flex;\n  font-size: 1.1rem;\n}\n#allNewsContainer .contentBox > div, #contactContainer .contentBox > div {\n  flex-basis: 50%;\n  height: 100%;\n}\n#allNewsContainer .contentBox > div > div, #contactContainer .contentBox > div > div {\n  overflow: auto;\n  height: 92%;\n}\n#allNewsContainer .contentBox .form-message, #contactContainer .contentBox .form-message {\n  height: auto;\n}\n#allNewsContainer .contentBox h3, #contactContainer .contentBox h3 {\n  text-align: center;\n  height: 8%;\n}\n#allNewsContainer .contentBox ul, #contactContainer .contentBox ul {\n  padding: 0;\n}\n#allNewsContainer .contentBox ul li, #contactContainer .contentBox ul li {\n  display: inline;\n}\n#allNewsContainer .contentBox .news, #contactContainer .contentBox .news {\n  border: 1px solid rgba(233, 233, 233, 0.3);\n}\n#allNewsContainer .contentBox .news::after, #contactContainer .contentBox .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#allNewsContainer .contentBox .news img, #contactContainer .contentBox .news img {\n  width: 13rem;\n  float: left;\n  margin-right: 2.5%;\n  cursor: pointer;\n}\n#allNewsContainer .contentBox .news p, #contactContainer .contentBox .news p {\n  font-size: 1.45rem;\n  line-height: 1.4rem;\n}\n@media (min-width: 1200px) {\n  #allNewsContainer .contentBox .news p, #contactContainer .contentBox .news p {\n    font-size: 1.25rem;\n    line-height: 1.2rem;\n  }\n}\n#allNewsContainer .contentBox .news, #allNewsContainer .contentBox form, #contactContainer .contentBox .news, #contactContainer .contentBox form {\n  padding: 0 5%;\n}\n#allNewsContainer .contentBox form, #contactContainer .contentBox form {\n  display: grid;\n  -moz-column-gap: 1.2rem;\n       column-gap: 1.2rem;\n  grid-template-areas: \"contactName contactEmail\" \"contactPhone contactSubject\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"submit ...\";\n}\n#allNewsContainer .contentBox form #contact-name, #contactContainer .contentBox form #contact-name {\n  grid-area: contactName;\n}\n#allNewsContainer .contentBox form #contact-email, #contactContainer .contentBox form #contact-email {\n  grid-area: contactEmail;\n}\n#allNewsContainer .contentBox form #contact-phone, #contactContainer .contentBox form #contact-phone {\n  grid-area: contactPhone;\n}\n#allNewsContainer .contentBox form #contact-subject, #contactContainer .contentBox form #contact-subject {\n  grid-area: contactSubject;\n}\n#allNewsContainer .contentBox form #contact-message, #contactContainer .contentBox form #contact-message {\n  grid-area: contactMessage;\n}\n\n#contactContainer {\n  background: black;\n  color: white;\n}\n#contactContainer .contentBox {\n  -moz-column-gap: 3rem;\n       column-gap: 3rem;\n  width: 85%;\n  display: flex;\n  padding-bottom: 1rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox {\n    width: 70%;\n  }\n}\n#contactContainer .contentBox img {\n  filter: saturate(120%);\n  width: 45%;\n  margin-left: 2rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox img {\n    width: 50%;\n    margin-left: 0;\n  }\n}\n#contactContainer .contentBox label.error {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: rgb(120, 179, 158);\n}\n#contactContainer .contentBox form {\n  margin-top: 3rem;\n}\n#contactContainer .contentBox form > div {\n  margin: 5% 0;\n  margin-top: 0;\n}\n#contactContainer .contentBox form label {\n  font-size: 1.4rem;\n}\n#contactContainer .contentBox form [type=radio] {\n  width: 10%;\n  display: initial;\n}\n#contactContainer .contentBox form ul {\n  padding: 0;\n}\n#contactContainer .contentBox form input, #contactContainer .contentBox form select {\n  display: block;\n  margin-top: 2%;\n}\n#contactContainer .contentBox form input {\n  height: 1.5rem;\n}\n#contactContainer .contentBox form select {\n  height: 2rem;\n}\n#contactContainer .contentBox form textarea {\n  width: 100%;\n  height: 18rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox form textarea {\n    height: 20rem;\n  }\n}\n#contactContainer .contentBox form button {\n  grid-area: submit;\n  color: ivory;\n  font-size: 1.3rem;\n  text-align: left;\n}\n\n.dot-pulse {\n  top: 20%;\n  left: 35%;\n}\n\n#pop-up-display-box {\n  background-color: rgba(45, 41, 35, 0.8);\n  width: 94vw;\n  height: 87vh;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 8vh;\n  left: 3vw;\n  display: none;\n  row-gap: 1rem;\n  align-items: center;\n  flex-direction: column;\n  padding-top: 2.5rem;\n}\n#pop-up-display-box img {\n  width: 26rem;\n}\n#pop-up-display-box a, #pop-up-display-box button {\n  font-size: 2rem;\n}\n#pop-up-display-box button {\n  color: antiquewhite;\n  cursor: pointer;\n}\n#pop-up-display-box button:hover, #pop-up-display-box a:hover {\n  filter: brightness(72%);\n}\n#pop-up-display-box #content-holder {\n  display: flex;\n  justify-content: space-evenly;\n  position: relative;\n  width: 70%;\n}\n#pop-up-display-box #content-holder .pop-up-directional {\n  font-size: 2.5rem;\n}\n\n#news-media-display {\n  background-color: rgba(44, 52, 77, 0.8);\n  height: 88vh;\n  width: 94vw;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 7vh;\n  left: 3vw;\n  display: none;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n}\n\n#singleContainer {\n  height: 77%;\n  min-width: 96%;\n  top: 9.5%;\n  display: flex;\n  flex-wrap: wrap;\n  position: absolute;\n  z-index: 1;\n  padding: 1.5rem 1rem;\n  padding-bottom: 1rem;\n  background-color: rgba(37, 35, 34, 0.9);\n}\n@media (min-width: 1200px) {\n  #singleContainer {\n    min-width: 60%;\n    height: 86%;\n  }\n}\n#singleContainer h4 {\n  font-size: 1.6rem;\n}\n#singleContainer h3, #singleContainer h4, #singleContainer .related-link {\n  color: rgb(241, 218, 189);\n}\n#singleContainer #mainImageAndStats {\n  height: 100%;\n  width: 24vw;\n  text-align: center;\n}\n@media (min-width: 1200px) {\n  #singleContainer #mainImageAndStats {\n    width: 25vw;\n  }\n}\n#singleContainer #mainImageAndStats img {\n  height: 33%;\n}\n@media (min-width: 1200px) {\n  #singleContainer #mainImageAndStats img {\n    height: 42%;\n  }\n}\n#singleContainer #mainImageAndStats ul {\n  padding-left: 20%;\n  font-size: 1.4rem;\n  text-align: left;\n  margin-top: 1rem;\n}\n@media (min-width: 1200px) {\n  #singleContainer #mainImageAndStats ul {\n    font-size: 1.5rem;\n  }\n}\n#singleContainer #mainImageAndStats ul li {\n  margin-top: 0.6rem;\n  list-style-type: square;\n}\n#singleContainer #mainImageAndStats ul li a {\n  filter: brightness(115%);\n}\n#singleContainer #singleInfo {\n  width: 40vw;\n  display: grid;\n  grid-template-rows: 7% 1fr;\n  height: 100%;\n}\n@media (min-width: 1200px) {\n  #singleContainer #singleInfo {\n    width: 35vw;\n  }\n}\n#singleContainer #singleInfo p {\n  margin-top: 1.5rem;\n  font-size: 1.6rem;\n  height: 99%;\n}\n@media (min-width: 1200px) {\n  #singleContainer #singleInfo p {\n    font-size: 1.7rem;\n  }\n}\n#singleContainer #singleInfo div {\n  overflow: auto;\n  padding: 0 1rem;\n}\n#singleContainer #vidAndImgCol {\n  height: 100%;\n  width: 16vw;\n  overflow: auto;\n  overflow-x: hidden;\n  text-align: center;\n}\n#singleContainer #vidAndImgCol h3 {\n  font-size: 1.9rem;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col {\n  width: 26vw;\n  position: relative;\n  height: 100%;\n  overflow: auto;\n  padding: 0 1rem;\n  display: grid;\n  grid-template-rows: 10% 1fr 4%;\n}\n@media (min-width: 1200px) {\n  #singleContainer #updates-col {\n    width: 28vw;\n  }\n}\n#singleContainer #updates-col h3 {\n  font-size: 2rem;\n}\n#singleContainer #updates-col h3 a {\n  font-size: 1.7rem;\n}\n#singleContainer #updates-col h3 a:hover {\n  color: white;\n}\n#singleContainer #updates-col #news-reciever {\n  overflow: auto;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col #news-reciever p {\n  font-size: 1.4rem;\n  padding-right: 1rem;\n}\n#singleContainer #updates-col #news-reciever img {\n  width: 95%;\n}\n#singleContainer #updates-col #pagination-holder {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n  font-size: 1.8rem;\n  display: flex;\n  justify-content: center;\n}\n\nbody {\n  background-color: rgb(100, 92, 82);\n}\n\n.search-overlay {\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(72, 68, 62, 0.96);\n  visibility: hidden;\n  opacity: 0;\n  transform: scale(1.09);\n  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;\n  box-sizing: border-box;\n}\n.search-overlay .container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n.search-overlay p {\n  padding-top: 1rem;\n}\nbody.admin-bar .search-overlay {\n  top: 2rem;\n}\n.search-overlay__top {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n.search-overlay__icon {\n  margin-right: 0.75rem;\n  font-size: 2.5rem;\n  color: rgb(148, 121, 105);\n}\n.search-overlay--active {\n  visibility: visible;\n  opacity: 1;\n  transform: scale(1);\n}\n.search-overlay__section-title {\n  margin: 30px 0 1px 0;\n  font-weight: 400;\n  font-size: 2rem;\n  padding: 15px 0;\n  border-bottom: 1px solid #ccc;\n}\n.search-overlay__close {\n  font-size: 2.7rem;\n  cursor: pointer;\n  transition: all 0.3s;\n  background-color: rgb(58, 54, 54);\n  color: rgb(180, 171, 166);\n  line-height: 0.7;\n}\n.search-overlay__close:hover {\n  opacity: 1;\n}\n.search-overlay .one-half {\n  padding-bottom: 0;\n}\n\n.search-term {\n  width: 75%;\n  box-sizing: border-box;\n  border: none;\n  padding: 1rem 0;\n  margin: 0;\n  background-color: transparent;\n  font-size: 1rem;\n  font-weight: 300;\n  outline: none;\n  color: rgb(218, 201, 182);\n}\n\n.body-no-scroll {\n  overflow: hidden;\n}\n\n.container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n}\n\n@media (min-width: 960px) {\n  .search-term {\n    width: 80%;\n    font-size: 3rem;\n  }\n}\n@-webkit-keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.spinner-loader {\n  margin-top: 45px;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  border: 0.25rem solid rgba(0, 0, 0, 0.2);\n  border-top-color: black;\n  -webkit-animation: spin 1s infinite linear;\n  animation: spin 1s infinite linear;\n}\n\n.media-card button {\n  color: white;\n  cursor: pointer;\n  font-size: 2.1rem;\n}\n\nh1, h2, h3, h4 {\n  font-family: \"Libre Caslon Text\", serif;\n}\n\n.textBox p, #relationship-link, #single-link {\n  font-family: \"Libre Caslon Display\", serif;\n}\n\nh1 {\n  font-weight: 700;\n}\n\nh2 {\n  font-weight: 400;\n}\n\n.display-text, #welcomeContainer p, .titleBox p {\n  font-family: \"Cormorant SC\", serif;\n}\n\ninput, .read-more, .news li a, header li a, #realtimeFiltersAndSorting button, #search-filters button, #reset-all {\n  font-family: \"Lora\", serif;\n}\n\n.news p {\n  font-family: \"Roboto\", sans-serif;\n}\n\n.news p {\n  font-weight: 300;\n}\n\n.search-form {\n  position: fixed;\n  top: 50%;\n  color: white;\n}\n\n.content-loader {\n  background-color: transparent;\n  height: 50%;\n  position: absolute;\n}\n.content-loader .ball {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(47, 163, 56);\n  border-radius: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader[data-text]::before {\n  position: absolute;\n}\n.content-loader.loader.is-active::before {\n  position: absolute;\n  width: 50%;\n  left: 25%;\n  top: 39%;\n  font-size: 2.7rem;\n  color: rgb(195, 168, 126);\n  background-color: transparent;\n}\n.content-loader.loader-bar-ping-pong::after {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(101, 148, 187);\n  -webkit-animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader.is-active {\n  height: 97%;\n  z-index: 0;\n  background-color: rgba(51, 49, 56, 0.7490196078);\n  -webkit-animation: blink 1.8s linear infinite alternate;\n          animation: blink 1.8s linear infinite alternate;\n}\n\n@-webkit-keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@-webkit-keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n@keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n#all-news-container {\n  height: 56rem;\n  top: 7rem;\n  width: 95%;\n  left: 2.5%;\n  background-color: rgba(37, 35, 34, 0.75);\n  position: absolute;\n  display: grid;\n  grid-auto-flow: row;\n  grid-template-columns: 100%;\n  color: aliceblue;\n}\n@media (min-width: 1200px) {\n  #all-news-container {\n    height: 68%;\n    top: 7.3rem;\n  }\n}\n@media (min-width: 1200px) {\n  #all-news-container {\n    grid-template-columns: 66% 34%;\n  }\n}\n#all-news-container #filter-sort-toggle {\n  display: block;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filter-sort-toggle {\n    display: none;\n  }\n}\n#all-news-container button {\n  color: antiquewhite;\n}\n#all-news-container #media-container, #all-news-container #filters-and-links-container, #all-news-container #selected-news-container {\n  position: relative;\n}\n#all-news-container #filters-and-links-container.fade-in, #all-news-container #filters-and-links-container.fade-out {\n  display: grid;\n  background-color: rgba(51, 49, 47, 0.9);\n  border-radius: 2%;\n  box-shadow: 0.2rem 0.2rem 1rem 0.4rem inset rgba(37, 33, 30, 0.85);\n  position: fixed;\n  width: 90%;\n  height: 80%;\n  margin-left: 5%;\n  grid-template-areas: \"realtimeFiltersAndSorting realtimeFiltersAndSorting realtimeFiltersAndSorting\" \"searchFilters searchFilters searchFilters\" \"... resetAll ...\";\n}\n#all-news-container #filters-and-links-container.fade-in {\n  -webkit-animation: fadeOptionsIn 0.5s ease-in-out;\n          animation: fadeOptionsIn 0.5s ease-in-out;\n}\n#all-news-container #filters-and-links-container.fade-out {\n  -webkit-animation: fadeOptionsOut 0.5s ease-in-out;\n          animation: fadeOptionsOut 0.5s ease-in-out;\n}\n@-webkit-keyframes fadeOptionsIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@keyframes fadeOptionsIn {\n  0% {\n    opacity: 0;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes fadeOptionsOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes fadeOptionsOut {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n#all-news-container #filters-and-links-container {\n  display: none;\n  padding-left: 1.5rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container {\n    position: relative;\n    display: grid;\n    grid-template-areas: \"realtimeFiltersAndSorting realtimeFiltersAndSorting realtimeFiltersAndSorting\" \"searchFilters searchFilters searchFilters\" \"... resetAll ...\";\n    border: 0.2rem solid rgba(212, 193, 130, 0.4);\n    border-left: none;\n  }\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting {\n  grid-area: realtimeFiltersAndSorting;\n  display: grid;\n  margin-top: 1.5rem;\n  grid-template-areas: \"headingRFS headingRFS headingRFS\" \"orderBy toggleType filterDate\";\n  width: 100%;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container #realtime-filters-and-sorting {\n    grid-template-areas: \"headingRFS headingRFS\" \"orderBy toggleType\" \"filterDate filterDate\";\n  }\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button, #all-news-container #filters-and-links-container #realtime-filters-and-sorting label {\n  font-size: 1.8rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container #realtime-filters-and-sorting button, #all-news-container #filters-and-links-container #realtime-filters-and-sorting label {\n    font-size: 1.3rem;\n  }\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button.inactive {\n  pointer-events: none;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button.inactive span {\n  color: red;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting h2 {\n  grid-area: headingRFS;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #order-by {\n  grid-area: orderBy;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #toggle-type {\n  grid-area: toggleType;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date {\n  grid-area: filterDate;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date div ul {\n  display: flex;\n  gap: 3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul {\n  padding-left: 0.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul li {\n  margin-top: 0.5rem;\n}\n#all-news-container #filters-and-links-container #search-filters {\n  grid-area: searchFilters;\n  display: grid;\n  grid-template-areas: \"headingSF headingSF headingSF\" \"newsSearch newsSearch newsSearch\" \"caseSensitive fullWordOnly wordStartOnly\" \"includeTitle includeDescription ...\";\n}\n#all-news-container #filters-and-links-container #search-filters h2 {\n  grid-area: headingSF;\n}\n#all-news-container #filters-and-links-container #search-filters button {\n  font-size: 1.8rem;\n  text-align: left;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container #search-filters button {\n    font-size: 1.2rem;\n  }\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container {\n  grid-area: newsSearch;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container #news-search.inactive {\n  pointer-events: none;\n  background-color: gray;\n}\n#all-news-container #filters-and-links-container #search-filters #full-word-only {\n  grid-area: fullWordOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only {\n  grid-area: wordStartOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #case-sensitive {\n  grid-area: caseSensitive;\n}\n#all-news-container #filters-and-links-container #search-filters #include-title {\n  grid-area: includeTitle;\n}\n#all-news-container #filters-and-links-container #search-filters #include-description {\n  grid-area: includeDescription;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive, #all-news-container #filters-and-links-container #search-filters button.inactive {\n  pointer-events: none;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive span, #all-news-container #filters-and-links-container #search-filters button.inactive span {\n  color: red;\n}\n#all-news-container #filters-and-links-container button, #all-news-container #filters-and-links-container select, #all-news-container #filters-and-links-container label {\n  font-size: 1.3rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container button, #all-news-container #filters-and-links-container select, #all-news-container #filters-and-links-container label {\n    font-size: 1.15rem;\n  }\n}\n#all-news-container #filters-and-links-container label {\n  margin-right: 0.5rem;\n}\n#all-news-container #filters-and-links-container #reset-all {\n  font-size: 1.8rem;\n  grid-area: resetAll;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container #reset-all {\n    font-size: 1.4rem;\n  }\n}\n#all-news-container #filters-and-links-container #reset-all.inactive {\n  pointer-events: none;\n  color: red;\n}\n#all-news-container #filters-and-links-container button {\n  cursor: pointer;\n}\n#all-news-container #filters-and-links-container h3 {\n  font-size: 2rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #filters-and-links-container h3 {\n    font-size: 1.7rem;\n  }\n}\n#all-news-container #filters-and-links-container h4 {\n  font-size: 1.5rem;\n  margin-bottom: 0.8rem;\n}\n#all-news-container #selected-news-container {\n  overflow: auto;\n  display: grid;\n  grid-template-rows: 10% 1fr;\n  grid-template-columns: 93% 1fr;\n  grid-template-areas: \"tao ph\" \"snr ph\";\n  border: 0.2rem solid rgb(180, 174, 164);\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container {\n    grid-template-rows: 10% 84% 6%;\n    grid-template-areas: \"tao\" \"snr\" \"ph\";\n  }\n}\n#all-news-container #selected-news-container #titleAndOptions {\n  grid-area: tao;\n  display: grid;\n  grid-template-columns: [mh] 80% [os] 10% [ds] 10%;\n  grid-template-areas: \"mh os ds\";\n  border-bottom: 0.3rem solid rgb(185, 158, 122);\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #titleAndOptions {\n    grid-template-columns: [mh] 90% [ds] 1fr;\n    grid-template-areas: \"mh ds\";\n  }\n}\n#all-news-container #selected-news-container #titleAndOptions #main-header {\n  grid-area: mh;\n  font-size: 2.3rem;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#all-news-container #selected-news-container #titleAndOptions .options-switch, #all-news-container #selected-news-container #titleAndOptions #dismiss-selection {\n  font-size: 1.5rem;\n  cursor: pointer;\n  border: 0.2rem solid rgb(212, 193, 130);\n  border-bottom: none;\n  border-top: none;\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #titleAndOptions .options-switch, #all-news-container #selected-news-container #titleAndOptions #dismiss-selection {\n    font-size: 1.2rem;\n  }\n}\n#all-news-container #selected-news-container #titleAndOptions .options-switch {\n  grid-area: os;\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #titleAndOptions .options-switch {\n    display: none;\n  }\n}\n#all-news-container #selected-news-container #titleAndOptions #dismiss-selection {\n  grid-area: ds;\n}\n#all-news-container #selected-news-container #titleAndOptions #dismiss-selection.dismissed {\n  filter: contrast(20%);\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #selected-news-reciever {\n  grid-area: snr;\n  margin-bottom: 0.5rem;\n  padding-right: 2rem;\n  overflow: auto;\n}\n#all-news-container #selected-news-container #full-display-container {\n  padding-left: 2rem;\n}\n#all-news-container #selected-news-container #main-display.dismissed, #all-news-container #selected-news-container #full-display-container.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #main-display .news, #all-news-container #selected-news-container #full-display-container .news {\n  font-size: 1.65rem;\n  padding-top: 0;\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #main-display .news, #all-news-container #selected-news-container #full-display-container .news {\n    font-size: 1.2rem;\n  }\n}\n#all-news-container #selected-news-container #main-display .news::after, #all-news-container #selected-news-container #full-display-container .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#all-news-container #selected-news-container #main-display .news img, #all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news img, #all-news-container #selected-news-container #full-display-container .news iframe {\n  float: left;\n  margin-right: 2%;\n}\n#all-news-container #selected-news-container #main-display .news p, #all-news-container #selected-news-container #full-display-container .news p {\n  line-height: 1.6rem;\n}\n@media (min-width: 1200px) {\n  #all-news-container #selected-news-container #main-display .news p, #all-news-container #selected-news-container #full-display-container .news p {\n    line-height: 1.2rem;\n  }\n}\n#all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news iframe {\n  width: 150px;\n  height: 100px;\n}\n#all-news-container #selected-news-container #main-display ul li, #all-news-container #selected-news-container #full-display-container ul li {\n  list-style-type: circle;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link, #all-news-container #selected-news-container #main-display ul li .relationship-link, #all-news-container #selected-news-container #full-display-container ul li .see-more-link, #all-news-container #selected-news-container #full-display-container ul li .relationship-link {\n  cursor: pointer;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link.dismissed, #all-news-container #selected-news-container #main-display ul li .relationship-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .see-more-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .relationship-link.dismissed {\n  display: none;\n}\n#all-news-container #filters-and-links-container {\n  padding-top: 1rem;\n}\n#all-news-container #pagination-holder {\n  grid-area: ph;\n  display: flex;\n  flex-direction: column;\n  border-left: 0.2rem solid rgba(212, 193, 130, 0.4);\n}\n@media (min-width: 1200px) {\n  #all-news-container #pagination-holder {\n    display: block;\n    width: 100%;\n    border: none;\n  }\n}\n#all-news-container #pagination-holder.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n}\n@media (min-width: 1200px) {\n  #all-news-container #pagination-holder .content-pages {\n    flex-direction: row;\n  }\n}\n#all-news-container #pagination-holder .content-pages a {\n  cursor: pointer;\n  font-size: 1.9rem;\n  margin-left: 0.5rem;\n}\n#all-news-container #pagination-holder .content-pages a.hidden, #all-news-container #pagination-holder .content-pages a.selectedPage {\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages a.hidden {\n  opacity: 0;\n}\n\n#mobile-typing-container {\n  display: none;\n  justify-content: center;\n  align-items: flex-end;\n  background-color: rgba(24, 23, 23, 0.9);\n  height: 100%;\n  width: 100%;\n  position: fixed;\n  top: 0;\n}\n#mobile-typing-container div {\n  width: 50%;\n  margin-bottom: 5rem;\n  display: flex;\n  justify-content: center;\n  -moz-column-gap: 1rem;\n       column-gap: 1rem;\n  align-items: center;\n}\n#mobile-typing-container div button, #mobile-typing-container div label {\n  font-size: 1.8rem;\n}\n#mobile-typing-container div button {\n  cursor: pointer;\n  color: antiquewhite;\n}\n\n#mobile-typing-container.opened {\n  display: flex;\n}\n\n@media (min-width: 1200px) {\n  .options-switch {\n    display: none;\n  }\n}\n\n.news-search-field {\n  font-size: 1.6rem;\n  height: 2.8rem;\n  width: 26rem;\n}\n@media (min-width: 1200px) {\n  .news-search-field {\n    font-size: 1.15rem;\n    height: 2.3rem;\n    width: 18rem;\n  }\n}\n\n#media-reciever {\n  display: none;\n  position: fixed;\n  background-color: rgba(10, 10, 10, 0.8);\n  top: 7%;\n  width: 100%;\n  height: 95%;\n  z-index: 1;\n}\n#media-reciever #current-media {\n  margin-left: 6rem;\n  position: absolute;\n  top: 6rem;\n  width: 40rem;\n  height: 23.5rem;\n}\n@media (min-width: 1200px) {\n  #media-reciever #current-media {\n    top: 4rem;\n    margin-left: 8rem;\n    width: 64rem;\n    height: 36rem;\n  }\n}\n#media-reciever #current-media iframe, #media-reciever #current-media img {\n  width: 100%;\n  height: 100%;\n}\n#media-reciever #current-media #play-button-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: absolute;\n  height: 100%;\n  width: 100%;\n}\n#media-reciever #current-media #play-button-container #play-button {\n  height: 6rem;\n  width: 9rem;\n  background-color: rgba(99, 100, 179, 0.8);\n  position: absolute;\n  border-radius: 35%;\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  transition: opacity 0.2s ease;\n}\n#media-reciever #current-media #play-button-container #play-button div {\n  border-left: 3rem solid rgb(125, 150, 168);\n  border-top: 1.7rem solid transparent;\n  border-bottom: 1.7rem solid transparent;\n}\n#media-reciever #current-media #play-button-container #play-button:hover {\n  opacity: 0.7;\n}\n#media-reciever #current-media.center-display {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface {\n  display: flex;\n  flex-direction: column;\n  position: absolute;\n  height: 82%;\n  overflow: auto;\n  right: 2rem;\n  top: 3rem;\n}\n#media-reciever #media-selection-interface #media-menu {\n  font-size: 1.2rem;\n  display: flex;\n}\n#media-reciever #media-selection-interface #media-menu a {\n  color: azure;\n  margin-left: 2rem;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-menu a.active {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column {\n  width: 75%;\n  max-width: 380px;\n  display: flex;\n  flex-direction: column;\n  overflow: auto;\n}\n#media-reciever #media-selection-interface #media-column .media-selection {\n  display: flex;\n  margin-top: 1rem;\n  width: 100%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb {\n  width: 45%;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb.selected {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information {\n  display: flex;\n  flex-direction: column;\n  margin-left: 1rem;\n  width: 55%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p {\n  margin: 0;\n  color: beige;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p:nth-of-type(2) {\n  margin-top: 1rem;\n}\n#media-reciever #media-selection-interface #media-pagination {\n  margin-top: 1.5rem;\n  color: aliceblue;\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface #media-pagination a {\n  font-size: 1.2rem;\n  margin-left: 1rem;\n}\n#media-reciever #media-close {\n  position: absolute;\n  color: white;\n  left: 1.5rem;\n  top: 1.5rem;\n  font-size: 3.5rem;\n  cursor: pointer;\n}\n@media (min-width: 1200px) {\n  #media-reciever #media-close {\n    left: 3.5rem;\n    top: 3.5rem;\n    font-size: 3.5rem;\n  }\n}\n\n.media-card:hover img, .property-media-card:hover img {\n  filter: brightness(50%);\n  cursor: pointer;\n}\n.media-card:hover h3, .media-card:hover p, .media-card:hover button, .property-media-card:hover h3, .property-media-card:hover p, .property-media-card:hover button {\n  filter: contrast(40%);\n  cursor: pointer;\n}\n\n.loader {\n  color: #fff;\n  position: fixed;\n  box-sizing: border-box;\n  left: -9999px;\n  top: -9999px;\n  width: 0;\n  height: 0;\n  overflow: hidden;\n  z-index: 999999;\n}\n\n.loader:after, .loader:before {\n  box-sizing: border-box;\n  display: none;\n}\n\n.loader.is-active {\n  background-color: rgba(0, 0, 0, 0.85);\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.loader.is-active:after, .loader.is-active:before {\n  display: block;\n}\n\n@-webkit-keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n\n@keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.loader[data-text]:before {\n  position: fixed;\n  left: 0;\n  top: 50%;\n  color: currentColor;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  width: 100%;\n  font-size: 14px;\n}\n\n.loader[data-text=\"\"]:before {\n  content: \"Loading\";\n}\n\n.loader[data-text]:not([data-text=\"\"]):before {\n  content: attr(data-text);\n}\n\n.loader[data-text][data-blink]:before {\n  -webkit-animation: blink 1s linear infinite alternate;\n          animation: blink 1s linear infinite alternate;\n}\n\n.loader-default[data-text]:before {\n  top: calc(50% - 63px);\n}\n\n.loader-default:after {\n  content: \"\";\n  position: fixed;\n  width: 48px;\n  height: 48px;\n  border: 8px solid #fff;\n  border-left-color: transparent;\n  border-radius: 50%;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-default[data-half]:after {\n  border-right-color: transparent;\n}\n\n.loader-default[data-inverse]:after {\n  animation-direction: reverse;\n}\n\n.loader-double:after, .loader-double:before {\n  content: \"\";\n  position: fixed;\n  border-radius: 50%;\n  border: 8px solid;\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-double:after {\n  width: 48px;\n  height: 48px;\n  border-color: #fff;\n  border-left-color: transparent;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n}\n\n.loader-double:before {\n  width: 64px;\n  height: 64px;\n  border-color: #eb974e;\n  border-right-color: transparent;\n  -webkit-animation-duration: 2s;\n          animation-duration: 2s;\n  top: calc(50% - 32px);\n  left: calc(50% - 32px);\n}\n\n.loader-bar[data-text]:before {\n  top: calc(50% - 40px);\n  color: #fff;\n}\n\n.loader-bar:after {\n  content: \"\";\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  width: 200px;\n  height: 20px;\n  transform: translate(-50%, -50%);\n  background: linear-gradient(-45deg, #4183d7 25%, #52b3d9 0, #52b3d9 50%, #4183d7 0, #4183d7 75%, #52b3d9 0, #52b3d9);\n  background-size: 20px 20px;\n  box-shadow: inset 0 10px 0 hsla(0, 0%, 100%, 0.2), 0 0 0 5px rgba(0, 0, 0, 0.2);\n  animation: moveBar 1.5s linear infinite reverse;\n}\n\n.loader-bar[data-rounded]:after {\n  border-radius: 15px;\n}\n\n.loader-bar[data-inverse]:after {\n  -webkit-animation-direction: normal;\n          animation-direction: normal;\n}\n\n@-webkit-keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n\n@keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n.loader-bar-ping-pong:before {\n  width: 200px;\n  background-color: #000;\n}\n\n.loader-bar-ping-pong:after, .loader-bar-ping-pong:before {\n  content: \"\";\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 100px);\n}\n\n.loader-bar-ping-pong:after {\n  width: 50px;\n  background-color: #f19;\n  -webkit-animation: moveBarPingPong 0.5s linear infinite alternate;\n          animation: moveBarPingPong 0.5s linear infinite alternate;\n}\n\n.loader-bar-ping-pong[data-rounded]:before {\n  border-radius: 10px;\n}\n\n.loader-bar-ping-pong[data-rounded]:after {\n  border-radius: 50%;\n  width: 20px;\n  -webkit-animation-name: moveBarPingPongRounded;\n          animation-name: moveBarPingPongRounded;\n}\n\n@keyframes moveBarPingPong {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 50px);\n  }\n}\n@-webkit-keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@-webkit-keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n@keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n.loader-border[data-text]:before {\n  color: #fff;\n}\n\n.loader-border:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 15px;\n  height: 15px;\n  background-color: #ff0;\n  -webkit-animation: corners 3s ease both infinite;\n          animation: corners 3s ease both infinite;\n}\n\n.loader-ball:before {\n  content: \"\";\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 50%;\n  left: 50%;\n  margin: -25px 0 0 -25px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: kickBall 1s infinite alternate ease-in both;\n          animation: kickBall 1s infinite alternate ease-in both;\n}\n\n.loader-ball[data-shadow]:before {\n  box-shadow: inset -5px -5px 10px 0 rgba(0, 0, 0, 0.5);\n}\n\n.loader-ball:after {\n  content: \"\";\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.3);\n  border-radius: 50%;\n  width: 45px;\n  height: 20px;\n  top: calc(50% + 10px);\n  left: 50%;\n  margin: 0 0 0 -22.5px;\n  z-index: 0;\n  -webkit-animation: shadow 1s infinite alternate ease-out both;\n          animation: shadow 1s infinite alternate ease-out both;\n}\n\n@-webkit-keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n\n@keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n@-webkit-keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n@keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n.loader-smartphone:after {\n  content: \"\";\n  color: #fff;\n  font-size: 12px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  line-height: 120px;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  width: 70px;\n  height: 130px;\n  margin: -65px 0 0 -35px;\n  border: 5px solid #fd0;\n  border-radius: 10px;\n  box-shadow: inset 0 5px 0 0 #fd0;\n  background: radial-gradient(circle at 50% 90%, rgba(0, 0, 0, 0.5) 6px, transparent 0), linear-gradient(0deg, #fd0 22px, transparent 0), linear-gradient(0deg, rgba(0, 0, 0, 0.5) 22px, rgba(0, 0, 0, 0.5));\n  -webkit-animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n          animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n}\n\n.loader-smartphone[data-screen=\"\"]:after {\n  content: \"Loading\";\n}\n\n.loader-smartphone:not([data-screen=\"\"]):after {\n  content: attr(data-screen);\n}\n\n@-webkit-keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n\n@keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n.loader-clock:before {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  margin: -60px 0 0 -60px;\n  background: linear-gradient(180deg, transparent 50%, #f5f5f5 0), linear-gradient(90deg, transparent 55px, #2ecc71 0, #2ecc71 65px, transparent 0), linear-gradient(180deg, #f5f5f5 50%, #f5f5f5 0);\n  box-shadow: inset 0 0 0 10px #f5f5f5, 0 0 0 5px #555, 0 0 0 10px #7b7b7b;\n  -webkit-animation: rotation infinite 2s linear;\n          animation: rotation infinite 2s linear;\n}\n\n.loader-clock:after, .loader-clock:before {\n  content: \"\";\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  overflow: hidden;\n}\n\n.loader-clock:after {\n  width: 60px;\n  height: 40px;\n  margin: -20px 0 0 -15px;\n  border-radius: 20px 0 0 20px;\n  background: radial-gradient(circle at 14px 20px, #25a25a 10px, transparent 0), radial-gradient(circle at 14px 20px, #1b7943 14px, transparent 0), linear-gradient(180deg, transparent 15px, #2ecc71 0, #2ecc71 25px, transparent 0);\n  -webkit-animation: rotation infinite 24s linear;\n          animation: rotation infinite 24s linear;\n  transform-origin: 15px center;\n}\n\n.loader-curtain:after, .loader-curtain:before {\n  position: fixed;\n  width: 100%;\n  top: 50%;\n  margin-top: -35px;\n  font-size: 70px;\n  text-align: center;\n  font-family: Helvetica, Arial, sans-serif;\n  overflow: hidden;\n  line-height: 1.2;\n  content: \"Loading\";\n}\n\n.loader-curtain:before {\n  color: #666;\n}\n\n.loader-curtain:after {\n  color: #fff;\n  height: 0;\n  -webkit-animation: curtain 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both;\n}\n\n.loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):after, .loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):before {\n  content: attr(data-curtain-text);\n}\n\n.loader-curtain[data-brazilian]:before {\n  color: #f1c40f;\n}\n\n.loader-curtain[data-brazilian]:after {\n  color: #2ecc71;\n}\n\n.loader-curtain[data-colorful]:before {\n  -webkit-animation: maskColorful 2s linear infinite alternate both;\n          animation: maskColorful 2s linear infinite alternate both;\n}\n\n.loader-curtain[data-colorful]:after {\n  -webkit-animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n  color: #000;\n}\n\n@-webkit-keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n\n@keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n@-webkit-keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@-webkit-keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n@keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n.loader-music:after, .loader-music:before {\n  content: \"\";\n  position: fixed;\n  width: 240px;\n  height: 240px;\n  top: 50%;\n  left: 50%;\n  margin: -120px 0 0 -120px;\n  border-radius: 50%;\n  text-align: center;\n  line-height: 240px;\n  color: #fff;\n  font-size: 40px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);\n  letter-spacing: -1px;\n}\n\n.loader-music:after {\n  -webkit-backface-visibility: hidden;\n          backface-visibility: hidden;\n}\n\n.loader-music[data-hey-oh]:after, .loader-music[data-hey-oh]:before {\n  box-shadow: 0 0 0 10px;\n}\n\n.loader-music[data-hey-oh]:before {\n  background-color: #fff;\n  color: #000;\n  -webkit-animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-hey-oh]:after {\n  background-color: #000;\n  -webkit-animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n          animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after, .loader-music[data-no-cry]:before {\n  background: linear-gradient(45deg, #009b3a 50%, #fed100 51%);\n  box-shadow: 0 0 0 10px #000;\n}\n\n.loader-music[data-no-cry]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after {\n  -webkit-animation: coin 2.5s linear infinite, no 5s linear infinite both;\n          animation: coin 2.5s linear infinite, no 5s linear infinite both;\n}\n\n.loader-music[data-we-are]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n  background: radial-gradient(ellipse at center, #4ecdc4 0, #556270);\n}\n\n.loader-music[data-we-are]:after {\n  -webkit-animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n  background: radial-gradient(ellipse at center, #26d0ce 0, #1a2980);\n}\n\n.loader-music[data-rock-you]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n  background: #444;\n}\n\n.loader-music[data-rock-you]:after {\n  -webkit-animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n  background: #96281b;\n}\n\n@-webkit-keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n\n@keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n@-webkit-keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@-webkit-keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@-webkit-keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@-webkit-keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@-webkit-keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@-webkit-keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@-webkit-keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@-webkit-keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@-webkit-keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n@keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n.loader-pokeball:before {\n  content: \"\";\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  top: 50%;\n  left: 50%;\n  margin: -50px 0 0 -50px;\n  background: linear-gradient(180deg, red 42%, #000 0, #000 58%, #fff 0);\n  background-repeat: no-repeat;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: movePokeball 1s linear infinite both;\n          animation: movePokeball 1s linear infinite both;\n}\n\n.loader-pokeball:after {\n  content: \"\";\n  position: absolute;\n  width: 24px;\n  height: 24px;\n  top: 50%;\n  left: 50%;\n  margin: -12px 0 0 -12px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 2;\n  -webkit-animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n          animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n  border: 2px solid #000;\n  box-shadow: 0 0 0 5px #fff, 0 0 0 10px #000;\n}\n\n@-webkit-keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n\n@keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n@-webkit-keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n@keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n.loader-bouncing:after, .loader-bouncing:before {\n  content: \"\";\n  width: 20px;\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 10px);\n  border-radius: 50%;\n  background-color: #fff;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:after {\n  margin-left: -30px;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:before {\n  -webkit-animation-delay: 0.2s;\n          animation-delay: 0.2s;\n}\n\n@-webkit-keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n\n@keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n.sbl-circ-ripple {\n  height: 48px;\n  width: 48px;\n  color: #48659b;\n  border-radius: 50%;\n  position: relative;\n  display: inline-block;\n  top: 20%;\n  left: 40%;\n}\n\n.sbl-circ-ripple::after, .sbl-circ-ripple::before {\n  content: \"\";\n  height: 0;\n  width: 0;\n  border: inherit;\n  border: 5px solid;\n  border-radius: inherit;\n  position: absolute;\n  left: 40%;\n  top: 40%;\n  -webkit-animation: circle-ripple 1s linear infinite;\n          animation: circle-ripple 1s linear infinite;\n}\n\n.sbl-circ-ripple::before {\n  -webkit-animation-delay: -0.6s;\n          animation-delay: -0.6s;\n}\n\n@-webkit-keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}\n\n@keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}/*# sourceMappingURL=style.css.map */", "",{"version":3,"sources":["webpack://./css/style.css","webpack://./css/base/_customBase.scss","webpack://./css/base/_mixins.scss","webpack://./css/modules/_footer.scss","webpack://./css/modules/_opening.scss","webpack://./css/modules/_properties.scss","webpack://./css/modules/_single.scss","webpack://./css/modules/_constant.scss","webpack://./css/modules/_search.scss","webpack://./css/modules/_loader.scss","webpack://./css/modules/_all-news.scss","webpack://./css/modules/_shadow-box.scss","webpack://./css/downloads/css-loader.css","webpack://./css/downloads/sbl-circ-ripple.css"],"names":[],"mappings":"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","sourceRoot":""}]);
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

        this.vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
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
        if(this.vw < 1200){
            this.newsSearch.addEventListener('focusin', ()=> this.openClone());
        }
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
        // if(this.vw >= 1200){
            
        // }
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
        // this.mobileNavCaller.addEventListener('click', ()=>this.openNav())
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVcsVUFBVSxZQUFZLFdBQVcsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssTUFBTSxNQUFNLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsWUFBWSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE1BQU0sT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLFVBQVUsS0FBSyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxhQUFhLFlBQVksV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxVQUFVLEtBQUssTUFBTSxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxZQUFZLFlBQVksYUFBYSxZQUFZLFlBQVksVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxjQUFjLGNBQWMsZUFBZSxjQUFjLGNBQWMsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLGNBQWMsY0FBYyxlQUFlLGVBQWUsY0FBYyxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsVUFBVSxZQUFZLFlBQVksYUFBYSxhQUFhLGFBQWEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsV0FBVyxVQUFVLGNBQWMsY0FBYyxlQUFlLGNBQWMsY0FBYyxXQUFXLFFBQVEsUUFBUSxZQUFZLGFBQWEsV0FBVyxRQUFRLFFBQVEsVUFBVSxTQUFTLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsTUFBTSxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssWUFBWSxLQUFLLEtBQUssV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxTQUFTLFFBQVEsS0FBSyxVQUFVLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxZQUFZLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLE1BQU0sUUFBUSxLQUFLLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFlB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QVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLFdBQVcsS0FBSyxLQUFLLE1BQU0sTUFBTSxXQUFXLEtBQUssTUFBTSxNQUFNLFVBQVUsVUFBVSxLQUFLLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLE1BQU0sVUFBVSxPQUFPLEtBQUssT0FBTyxVQUFVLE9BQU8sTUFBTSxNQUFNLFVBQVUsT0FBTyxLQUFLLE1BQU0sV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxNQUFNLFdBQVcsT0FBTyxLQUFLLE9BQU8sVUFBVSxPQUFPLE1BQU0sTUFBTSxXQUFXLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE1BQU0sVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sS0FBSyxXQUFXLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLE1BQU0sV0FBVyxXQUFXLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLLE1BQU0sV0FBVyxVQUFVLE1BQU0sTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLE1BQU0sVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxNQUFNLEtBQUssTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxPQUFPLEtBQUssTUFBTSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsV0FBVyxNQUFNLEtBQUssTUFBTSxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsT0FBTyxLQUFLLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxPQUFPLE1BQU0sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLFVBQVUsV0FBVyxVQUFVLFdBQVcsT0FBTyxNQUFNLE1BQU0sVUFBVSxPQUFPLEtBQUssTUFBTSxNQUFNLFVBQVUsT0FBTyxLQUFLLE9BQU8sV0FBVyxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsT0FBTyxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxNQUFNLE9BQU8sTUFBTSxVQUFVLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxPQUFPLE1BQU0sVUFBVSxNQUFNLE1BQU0sTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsV0FBVyxPQUFPLEtBQUssTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLFFBQVEsTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxNQUFNLE9BQU8sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxXQUFXLE1BQU0sT0FBTyxNQUFNLFVBQVUsVUFBVSxNQUFNLEtBQUssTUFBTSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sT0FBTyxNQUFNLFVBQVUsT0FBTyxLQUFLLE1BQU0sV0FBVyxVQUFVLFdBQVcsV0FBVyxRQUFRLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sS0FBSyxVQUFVLFVBQVUsT0FBTyxLQUFLLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsT0FBTyxPQUFPLE1BQU0sVUFBVSxPQUFPLEtBQUssT0FBTyxVQUFVLE9BQU8sT0FBTyxNQUFNLFVBQVUsT0FBTyxLQUFLLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sTUFBTSxXQUFXLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE9BQU8sTUFBTSxVQUFVLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxVQUFVLE9BQU8sT0FBTyxNQUFNLFdBQVcsT0FBTyxLQUFLLE9BQU8sVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxPQUFPLE9BQU8sTUFBTSxVQUFVLE9BQU8sS0FBSyxPQUFPLFVBQVUsT0FBTyxPQUFPLFdBQVcsUUFBUSxPQUFPLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxVQUFVLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLFFBQVEsT0FBTyxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFFBQVEsT0FBTyxLQUFLLFVBQVUsVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFVBQVUsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sTUFBTSxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLEtBQUssVUFBVSxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssT0FBTyxVQUFVLE9BQU8sT0FBTyxLQUFLLFVBQVUsT0FBTyxLQUFLLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sVUFBVSxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLEtBQUssT0FBTyxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxPQUFPLE1BQU0sV0FBVyxPQUFPLEtBQUssT0FBTyxXQUFXLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLE9BQU8sV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLE9BQU8sV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxVQUFVLFFBQVEsT0FBTyxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsT0FBTyxLQUFLLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsT0FBTyxLQUFLLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxNQUFNLFdBQVcsT0FBTyxLQUFLLE9BQU8sV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxLQUFLLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxNQUFNLFdBQVcsV0FBVyxPQUFPLEtBQUssT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsUUFBUSxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sTUFBTSxXQUFXLFFBQVEsS0FBSyxPQUFPLFVBQVUsUUFBUSxPQUFPLE1BQU0sVUFBVSxRQUFRLEtBQUssT0FBTyxVQUFVLFFBQVEsUUFBUSxXQUFXLFdBQVcsUUFBUSxPQUFPLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLFFBQVEsVUFBVSxVQUFVLFVBQVUsVUFBVSxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxNQUFNLFdBQVcsUUFBUSxLQUFLLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFFBQVEsUUFBUSxVQUFVLFFBQVEsT0FBTyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxNQUFNLFVBQVUsVUFBVSxVQUFVLE9BQU8sS0FBSyxPQUFPLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sTUFBTSxXQUFXLE9BQU8sS0FBSyxRQUFRLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFNBQVMsT0FBTyxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxRQUFRLE9BQU8sVUFBVSxRQUFRLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxPQUFPLFdBQVcsVUFBVSxVQUFVLE9BQU8sT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLE9BQU8sTUFBTSxPQUFPLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxPQUFPLE9BQU8sS0FBSyxVQUFVLFdBQVcsVUFBVSxVQUFVLE9BQU8sS0FBSyxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxVQUFVLFFBQVEsT0FBTyxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxRQUFRLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxVQUFVLFFBQVEsUUFBUSxVQUFVLFVBQVUsUUFBUSxRQUFRLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsVUFBVSxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE9BQU8sTUFBTSxVQUFVLFVBQVUsV0FBVyxPQUFPLE1BQU0sT0FBTyxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsU0FBUyxRQUFRLFlBQVksV0FBVyxTQUFTLFFBQVEsWUFBWSxXQUFXLFVBQVUsVUFBVSxVQUFVLFNBQVMsUUFBUSxXQUFXLFNBQVMsUUFBUSxNQUFNLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFFBQVEsTUFBTSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLE1BQU0sVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLEtBQUssUUFBUSxXQUFXLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFVBQVUsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFlBQVksWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsTUFBTSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxXQUFXLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxVQUFVLFNBQVMsV0FBVyxXQUFXLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFVBQVUsU0FBUyxTQUFTLFVBQVUsVUFBVSxXQUFXLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsV0FBVyxZQUFZLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFVBQVUsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsVUFBVSxTQUFTLFNBQVMsVUFBVSxVQUFVLFdBQVcsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxXQUFXLFlBQVksU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsVUFBVSxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLFdBQVcsVUFBVSxTQUFTLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxXQUFXLFVBQVUsU0FBUyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsV0FBVyxXQUFXLFlBQVksWUFBWSxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxTQUFTLE1BQU0sV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsTUFBTSxTQUFTLE1BQU0sV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsS0FBSyxTQUFTLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFdBQVcsVUFBVSxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLE1BQU0sU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxXQUFXLFdBQVcsVUFBVSxTQUFTLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsTUFBTSxXQUFXLFNBQVMsTUFBTSxTQUFTLE1BQU0sV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxLQUFLLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxLQUFLLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsS0FBSyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLEtBQUssV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxLQUFLLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNULDBDQUEwQyx1Q0FBdUM7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsa0JBQWtCO0FBQ2hFO0FB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RyIsInNvdXJjZXMiOlsid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9jc3MvZG90cy5jc3MiLCJ3ZWJwYWNrOi8vY2FoLy4vY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2NhaC8uL2Nzcy9kb3RzLmNzcz83NjQyIiwid2VicGFjazovL2NhaC8uL2Nzcy9zdHlsZS5jc3M/ZGExZiIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL2FsbC1uZXdzLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL21vYmlsZS5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9wYWdpbmF0aW9uLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3NlYXJjaC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9zaGFkb3dCb3guanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvc2luZ2xlUG9zdC5qcyIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY2FoL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2NhaC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vY2FoL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2FoL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICBmdW5jdGlvbiBvbmxvYWRlbmQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhcmVzcG9uc2VUeXBlIHx8IHJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnIHx8ICByZXNwb25zZVR5cGUgPT09ICdqc29uJyA/XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCdvbmxvYWRlbmQnIGluIHJlcXVlc3QpIHtcbiAgICAgIC8vIFVzZSBvbmxvYWRlbmQgaWYgYXZhaWxhYmxlXG4gICAgICByZXF1ZXN0Lm9ubG9hZGVuZCA9IG9ubG9hZGVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZSB0byBlbXVsYXRlIG9ubG9hZGVuZFxuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlYWR5c3RhdGUgaGFuZGxlciBpcyBjYWxsaW5nIGJlZm9yZSBvbmVycm9yIG9yIG9udGltZW91dCBoYW5kbGVycyxcbiAgICAgICAgLy8gc28gd2Ugc2hvdWxkIGNhbGwgb25sb2FkZW5kIG9uIHRoZSBuZXh0ICd0aWNrJ1xuICAgICAgICBzZXRUaW1lb3V0KG9ubG9hZGVuZCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIGNvbmZpZy50cmFuc2l0aW9uYWwgJiYgY29uZmlnLnRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJylcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHtcbiAgICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxuICB9LFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JykgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHBrZyA9IHJlcXVpcmUoJy4vLi4vLi4vcGFja2FnZS5qc29uJyk7XG5cbnZhciB2YWxpZGF0b3JzID0ge307XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5bJ29iamVjdCcsICdib29sZWFuJywgJ251bWJlcicsICdmdW5jdGlvbicsICdzdHJpbmcnLCAnc3ltYm9sJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpKSB7XG4gIHZhbGlkYXRvcnNbdHlwZV0gPSBmdW5jdGlvbiB2YWxpZGF0b3IodGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSB0eXBlIHx8ICdhJyArIChpIDwgMSA/ICduICcgOiAnICcpICsgdHlwZTtcbiAgfTtcbn0pO1xuXG52YXIgZGVwcmVjYXRlZFdhcm5pbmdzID0ge307XG52YXIgY3VycmVudFZlckFyciA9IHBrZy52ZXJzaW9uLnNwbGl0KCcuJyk7XG5cbi8qKlxuICogQ29tcGFyZSBwYWNrYWdlIHZlcnNpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmc/fSB0aGFuVmVyc2lvblxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzT2xkZXJWZXJzaW9uKHZlcnNpb24sIHRoYW5WZXJzaW9uKSB7XG4gIHZhciBwa2dWZXJzaW9uQXJyID0gdGhhblZlcnNpb24gPyB0aGFuVmVyc2lvbi5zcGxpdCgnLicpIDogY3VycmVudFZlckFycjtcbiAgdmFyIGRlc3RWZXIgPSB2ZXJzaW9uLnNwbGl0KCcuJyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgaWYgKHBrZ1ZlcnNpb25BcnJbaV0gPiBkZXN0VmVyW2ldKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHBrZ1ZlcnNpb25BcnJbaV0gPCBkZXN0VmVyW2ldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBUcmFuc2l0aW9uYWwgb3B0aW9uIHZhbGlkYXRvclxuICogQHBhcmFtIHtmdW5jdGlvbnxib29sZWFuP30gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge3N0cmluZz99IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbnZhbGlkYXRvcnMudHJhbnNpdGlvbmFsID0gZnVuY3Rpb24gdHJhbnNpdGlvbmFsKHZhbGlkYXRvciwgdmVyc2lvbiwgbWVzc2FnZSkge1xuICB2YXIgaXNEZXByZWNhdGVkID0gdmVyc2lvbiAmJiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uKTtcblxuICBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlKG9wdCwgZGVzYykge1xuICAgIHJldHVybiAnW0F4aW9zIHYnICsgcGtnLnZlcnNpb24gKyAnXSBUcmFuc2l0aW9uYWwgb3B0aW9uIFxcJycgKyBvcHQgKyAnXFwnJyArIGRlc2MgKyAobWVzc2FnZSA/ICcuICcgKyBtZXNzYWdlIDogJycpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHQsIG9wdHMpIHtcbiAgICBpZiAodmFsaWRhdG9yID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdE1lc3NhZ2Uob3B0LCAnIGhhcyBiZWVuIHJlbW92ZWQgaW4gJyArIHZlcnNpb24pKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEZXByZWNhdGVkICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc09sZGVyVmVyc2lvbjogaXNPbGRlclZlcnNpb24sXG4gIGFzc2VydE9wdGlvbnM6IGFzc2VydE9wdGlvbnMsXG4gIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBjaGFyc2V0IFxcXCJVVEYtOFxcXCI7XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBFbGFzdGljXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZWxhc3RpYyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWVsYXN0aWMgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1lbGFzdGljIDFzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuLmRvdC1lbGFzdGljOjpiZWZvcmUsIC5kb3QtZWxhc3RpYzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtZWxhc3RpYzo6YmVmb3JlIHtcXG4gIGxlZnQ6IC05OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1lbGFzdGljLWJlZm9yZSAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWVsYXN0aWMtYmVmb3JlIDFzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuLmRvdC1lbGFzdGljOjphZnRlciB7XFxuICBsZWZ0OiA5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1lbGFzdGljLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZWxhc3RpYy1hZnRlciAxcyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZWxhc3RpYy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAwLjY3KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZWxhc3RpYy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAwLjY3KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1lbGFzdGljIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWVsYXN0aWMge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1lbGFzdGljLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWVsYXN0aWMtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMC42Nyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBQdWxzZVxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXB1bHNlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXB1bHNlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1wdWxzZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjI1cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjI1cztcXG59XFxuLmRvdC1wdWxzZTo6YmVmb3JlLCAuZG90LXB1bHNlOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1wdWxzZTo6YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcHVsc2UtYmVmb3JlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1wdWxzZS1iZWZvcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMHM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMHM7XFxufVxcbi5kb3QtcHVsc2U6OmFmdGVyIHtcXG4gIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXB1bHNlLWFmdGVyIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1wdWxzZS1hZnRlciAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuNXM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtcHVsc2UtYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXB1bHNlLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXB1bHNlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAtNXB4O1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LXB1bHNlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAtNXB4O1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtcHVsc2UtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtcHVsc2UtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBGbGFzaGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWZsYXNoaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgbGluZWFyIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgbGluZWFyIGFsdGVybmF0ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuNXM7XFxufVxcbi5kb3QtZmxhc2hpbmc6OmJlZm9yZSwgLmRvdC1mbGFzaGluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtZmxhc2hpbmc6OmJlZm9yZSB7XFxuICBsZWZ0OiAtOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMHM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMHM7XFxufVxcbi5kb3QtZmxhc2hpbmc6OmFmdGVyIHtcXG4gIGxlZnQ6IDk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDFzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDFzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsYXNoaW5nIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSwgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNjUsIDg4LCA5NSwgMC4yKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZmxhc2hpbmcge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlLCAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg2NSwgODgsIDk1LCAwLjIpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IENvbGxpc2lvblxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWNvbGxpc2lvbiB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3QtY29sbGlzaW9uOjpiZWZvcmUsIC5kb3QtY29sbGlzaW9uOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1jb2xsaXNpb246OmJlZm9yZSB7XFxuICBsZWZ0OiAtNTVweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtY29sbGlzaW9uLWJlZm9yZSAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1jb2xsaXNpb24tYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3QtY29sbGlzaW9uOjphZnRlciB7XFxuICBsZWZ0OiA1NXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1jb2xsaXNpb24tYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtY29sbGlzaW9uLWFmdGVyIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMXM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtY29sbGlzaW9uLWJlZm9yZSB7XFxuICAwJSwgNTAlLCA3NSUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTk5cHgpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYmVmb3JlIHtcXG4gIDAlLCA1MCUsIDc1JSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtOTlweCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtY29sbGlzaW9uLWFmdGVyIHtcXG4gIDAlLCA1MCUsIDc1JSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCg5OXB4KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtY29sbGlzaW9uLWFmdGVyIHtcXG4gIDAlLCA1MCUsIDc1JSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCg5OXB4KTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBSZXZvbHV0aW9uXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtcmV2b2x1dGlvbiB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3QtcmV2b2x1dGlvbjo6YmVmb3JlLCAuZG90LXJldm9sdXRpb246OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG4uZG90LXJldm9sdXRpb246OmJlZm9yZSB7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiAtOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIHRyYW5zZm9ybS1vcmlnaW46IDI3LjVweCAxMjYuNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1yZXZvbHV0aW9uIDEuNHMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1yZXZvbHV0aW9uIDEuNHMgbGluZWFyIGluZmluaXRlO1xcbn1cXG4uZG90LXJldm9sdXRpb246OmFmdGVyIHtcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IC0xOThweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIHRyYW5zZm9ybS1vcmlnaW46IDI3LjVweCAyMjUuNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1yZXZvbHV0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcmV2b2x1dGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtcmV2b2x1dGlvbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtcmV2b2x1dGlvbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBDYXJvdXNlbFxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWNhcm91c2VsIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtY2Fyb3VzZWwgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWNhcm91c2VsIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWNhcm91c2VsIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5OTlweCAwIDAgMXB4ICM0MTU4NWYsIDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZiwgOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5OTlweCAwIDAgMXB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAxcHggIzQxNTg1ZiwgMTAwOThweCAwIDAgLTFweCAjNDE1ODVmLCA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtY2Fyb3VzZWwge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZiwgOTk5OXB4IDAgMCAxcHggIzQxNTg1ZiwgMTAwOThweCAwIDAgLTFweCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTFweCAjNDE1ODVmLCA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZiwgOTk5OXB4IDAgMCAxcHggIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFR5cGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXR5cGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXR5cGluZyAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtdHlwaW5nIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXR5cGluZyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAtMTBweCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggLTEwcHggMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDY2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggLTEwcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXR5cGluZyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAtMTBweCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggLTEwcHggMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDY2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggLTEwcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgV2luZG1pbGxcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC13aW5kbWlsbCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0b3A6IC0xMHB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogNXB4IDE1cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXdpbmRtaWxsIDJzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtd2luZG1pbGwgMnMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG4uZG90LXdpbmRtaWxsOjpiZWZvcmUsIC5kb3Qtd2luZG1pbGw6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG4uZG90LXdpbmRtaWxsOjpiZWZvcmUge1xcbiAgbGVmdDogLTguNjYyNTRweDtcXG4gIHRvcDogMTVweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC13aW5kbWlsbDo6YWZ0ZXIge1xcbiAgbGVmdDogOC42NjI1NHB4O1xcbiAgdG9wOiAxNXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXdpbmRtaWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWig3MjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC13aW5kbWlsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooNzIwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBCcmlja3NcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1icmlja3Mge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAzMC41cHg7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1icmlja3MgMnMgaW5maW5pdGUgZWFzZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtYnJpY2tzIDJzIGluZmluaXRlIGVhc2U7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtYnJpY2tzIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgOC4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNDEuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDU4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY2JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA5MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWJyaWNrcyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDguMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAyNSUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDQxLjY2NyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA1OC4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDY2LjY2NiUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgOTEuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZsb2F0aW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZmxvYXRpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbG9hdGluZyAzcyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4xNSwgMC42LCAwLjksIDAuMSk7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsb2F0aW5nIDNzIGluZmluaXRlIGN1YmljLWJlemllcigwLjE1LCAwLjYsIDAuOSwgMC4xKTtcXG59XFxuLmRvdC1mbG9hdGluZzo6YmVmb3JlLCAuZG90LWZsb2F0aW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1mbG9hdGluZzo6YmVmb3JlIHtcXG4gIGxlZnQ6IC0xMnB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbG9hdGluZy1iZWZvcmUgM3MgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsb2F0aW5nLWJlZm9yZSAzcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcXG59XFxuLmRvdC1mbG9hdGluZzo6YWZ0ZXIge1xcbiAgbGVmdDogLTI0cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsb2F0aW5nLWFmdGVyIDNzIGluZmluaXRlIGN1YmljLWJlemllcigwLjQsIDAsIDEsIDEpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbG9hdGluZy1hZnRlciAzcyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC40LCAwLCAxLCAxKTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mbG9hdGluZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoLTUwJSAtIDI3LjVweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDEyNy41cHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgMTI3LjVweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWZsb2F0aW5nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYygtNTAlIC0gMjcuNXB4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgMTI3LjVweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mbG9hdGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGxlZnQ6IC0xMnB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZsb2F0aW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTEycHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mbG9hdGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGxlZnQ6IC0yNHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZmxvYXRpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBsZWZ0OiAtMjRweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRmlyZVxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWZpcmUge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAxNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC0wLjg1cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC44NXM7XFxufVxcbi5kb3QtZmlyZTo6YmVmb3JlLCAuZG90LWZpcmU6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LWZpcmU6OmJlZm9yZSB7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAtMS44NXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogLTEuODVzO1xcbn1cXG4uZG90LWZpcmU6OmFmdGVyIHtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAxNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC0yLjg1cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMi44NXM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmlyZSB7XFxuICAxJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAxNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC0zNy4xMjVweCAwIDJweCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZmlyZSB7XFxuICAxJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAxNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC0zNy4xMjVweCAwIDJweCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBTcGluXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtc3BpbiB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc3BpbiAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtc3BpbiAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zcGluIHtcXG4gIDAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMTIuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAzNy41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDYyLjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODcuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXNwaW4ge1xcbiAgMCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAxMi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDM3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgNjIuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA3NSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA4Ny41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBGYWxsaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZmFsbGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAwICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZhbGxpbmcgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mYWxsaW5nIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjFzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMXM7XFxufVxcbi5kb3QtZmFsbGluZzo6YmVmb3JlLCAuZG90LWZhbGxpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWZhbGxpbmc6OmJlZm9yZSB7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZhbGxpbmctYmVmb3JlIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmFsbGluZy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDBzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDBzO1xcbn1cXG4uZG90LWZhbGxpbmc6OmFmdGVyIHtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmFsbGluZy1hZnRlciAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZhbGxpbmctYWZ0ZXIgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuMnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC4ycztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mYWxsaW5nIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCA5OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1mYWxsaW5nIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCA5OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZhbGxpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCA5OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1mYWxsaW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mYWxsaW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCA5OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1mYWxsaW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCA5OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFN0cmV0Y2hpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1zdHJldGNoaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmcgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZyAycyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4uZG90LXN0cmV0Y2hpbmc6OmJlZm9yZSwgLmRvdC1zdHJldGNoaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1zdHJldGNoaW5nOjpiZWZvcmUge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zdHJldGNoaW5nLWJlZm9yZSAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zdHJldGNoaW5nLWJlZm9yZSAycyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4uZG90LXN0cmV0Y2hpbmc6OmFmdGVyIHtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZy1hZnRlciAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zdHJldGNoaW5nLWFmdGVyIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC44LCAwLjgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMjUsIDEuMjUpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOCwgMC44KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMjUsIDEuMjUpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTIwcHgpIHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgyMHB4KSBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDIwcHgpIHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogR29vZXkgRWZmZWN0XFxuICogRG90IEdhdGhlcmluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWdhdGhlcmluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBtYXJnaW46IC0xcHggMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LWdhdGhlcmluZzo6YmVmb3JlLCAuZG90LWdhdGhlcmluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAtNTBweDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG9wYWNpdHk6IDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZ2F0aGVyaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWdhdGhlcmluZyAycyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4uZG90LWdhdGhlcmluZzo6YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC41cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1nYXRoZXJpbmcge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAzNSUsIDYwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCg1MHB4KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTAwcHgpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1nYXRoZXJpbmcge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAzNSUsIDYwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCg1MHB4KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTAwcHgpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBHb29leSBFZmZlY3RcXG4gKiBEb3QgSG91cmdsYXNzXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtaG91cmdsYXNzIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRvcDogLTk5cHg7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBtYXJnaW46IC0xcHggMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMjcuNXB4IDEyNi41cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWhvdXJnbGFzcyAyLjRzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1ob3VyZ2xhc3MgMi40cyBpbmZpbml0ZSBlYXNlLWluLW91dDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjZzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuNnM7XFxufVxcbi5kb3QtaG91cmdsYXNzOjpiZWZvcmUsIC5kb3QtaG91cmdsYXNzOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG59XFxuLmRvdC1ob3VyZ2xhc3M6OmJlZm9yZSB7XFxuICB0b3A6IDE5OHB4O1xcbn1cXG4uZG90LWhvdXJnbGFzczo6YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1ob3VyZ2xhc3MtYWZ0ZXIgMi40cyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC42NSwgMC4wNSwgMC4zNiwgMSk7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWhvdXJnbGFzcy1hZnRlciAyLjRzIGluZmluaXRlIGN1YmljLWJlemllcigwLjY1LCAwLjA1LCAwLjM2LCAxKTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1ob3VyZ2xhc3Mge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTgwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigxODBkZWcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWhvdXJnbGFzcyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigxODBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1ob3VyZ2xhc3MtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTk4cHgpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE5OHB4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWhvdXJnbGFzcy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTk4cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogR29vZXkgRWZmZWN0XFxuICogRG90IE92ZXJ0YWtpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1vdmVydGFraW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBjb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgYm94LXNoYWRvdzogMCAtMjBweCAwIDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAycyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAycyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG59XFxuLmRvdC1vdmVydGFraW5nOjpiZWZvcmUsIC5kb3Qtb3ZlcnRha2luZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAwO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgYm94LXNoYWRvdzogMCAtMjBweCAwIDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG59XFxuLmRvdC1vdmVydGFraW5nOjpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1vdmVydGFraW5nIDJzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1vdmVydGFraW5nIDJzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuM3M7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC4zcztcXG59XFxuLmRvdC1vdmVydGFraW5nOjphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMS41cyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAxLjVzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC42cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1vdmVydGFraW5nIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1vdmVydGFraW5nIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBHb29leSBFZmZlY3RcXG4gKiBEb3QgU2h1dHRsZVxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXNodXR0bGUge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5cHg7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBtYXJnaW46IC0xcHggMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LXNodXR0bGU6OmJlZm9yZSwgLmRvdC1zaHV0dGxlOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LXNodXR0bGU6OmJlZm9yZSB7XFxuICBsZWZ0OiA5OXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zaHV0dGxlIDJzIGluZmluaXRlIGVhc2Utb3V0O1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zaHV0dGxlIDJzIGluZmluaXRlIGVhc2Utb3V0O1xcbn1cXG4uZG90LXNodXR0bGU6OmFmdGVyIHtcXG4gIGxlZnQ6IDE5OHB4O1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXNodXR0bGUge1xcbiAgMCUsIDUwJSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjk3cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI5N3B4KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtc2h1dHRsZSB7XFxuICAwJSwgNTAlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yOTdweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjk3cHgpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBFbW9qaVxcbiAqIERvdCBCb3VuY2luZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWJvdW5jaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogNTVweDtcXG4gIGZvbnQtc2l6ZTogMTBweDtcXG59XFxuLmRvdC1ib3VuY2luZzo6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCLimr3wn4+A8J+PkFxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWJvdW5jaW5nIDFzIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1ib3VuY2luZyAxcyBpbmZpbml0ZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1ib3VuY2luZyB7XFxuICAwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICAgIC13ZWJraXQtYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1pbjtcXG4gICAgICAgICAgICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLWluO1xcbiAgfVxcbiAgMzQlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDM1JSB7XFxuICAgIHRvcDogMjBweDtcXG4gICAgLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLW91dDtcXG4gICAgICAgICAgICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLW91dDtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjUsIDAuNSk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgOTAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1ib3VuY2luZyB7XFxuICAwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICAgIC13ZWJraXQtYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1pbjtcXG4gICAgICAgICAgICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLWluO1xcbiAgfVxcbiAgMzQlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDM1JSB7XFxuICAgIHRvcDogMjBweDtcXG4gICAgLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLW91dDtcXG4gICAgICAgICAgICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLW91dDtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjUsIDAuNSk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgOTAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBFbW9qaVxcbiAqIERvdCBSb2xsaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtcm9sbGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBmb250LXNpemU6IDEwcHg7XFxufVxcbi5kb3Qtcm9sbGluZzo6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtcm9sbGluZyAzcyBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtcm9sbGluZyAzcyBpbmZpbml0ZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1yb2xsaW5nIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMzQuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgNjcuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtcm9sbGluZyB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDM0LjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDY2LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDY3LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxufS8qIyBzb3VyY2VNYXBwaW5nVVJMPWRvdHMuY3NzLm1hcCAqL1wiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL2Nzcy9kb3RzLmNzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1lbGFzdGljLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19taXhpbnMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX3ZhcmlhYmxlcy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXB1bHNlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZmxhc2hpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1jb2xsaXNpb24uc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1yZXZvbHV0aW9uLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtY2Fyb3VzZWwuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC10eXBpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC13aW5kbWlsbC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWJyaWNrcy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWZsb2F0aW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZmlyZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXNwaW4uc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1mYWxsaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtc3RyZXRjaGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWdhdGhlcmluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWhvdXJnbGFzcy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LW92ZXJ0YWtpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1zaHV0dGxlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtYm91bmNpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1yb2xsaW5nLnNjc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUEsZ0JBQWdCO0FDQWhCOzs7O0VBQUE7QUFNQTtFQUNFLGtCQUFBO0VDSUEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRkdWLGlEQUFBO1VBQUEseUNBQUE7QURHRjtBQ0RFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0FERUo7QUNDRTtFQUNFLFdBQUE7RUNYRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VGa0JSLHdEQUFBO1VBQUEsZ0RBQUE7QURHSjtBQ0FFO0VBQ0UsVUVqQlU7RURGWixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VGMEJSLHVEQUFBO1VBQUEsK0NBQUE7QURJSjs7QUNBQTtFQUNFO0lBQ0Usc0JBQUE7RURHRjtFQ0FBO0lBQ0Usd0JBQUE7RURFRjtFQ0NBO0lBQ0UseUJBQUE7RURDRjtFQ0VBO0lBQ0Usc0JBQUE7RURBRjtFQ0dBO0lBQ0Usc0JBQUE7RURERjtBQUNGOztBQ2xCQTtFQUNFO0lBQ0Usc0JBQUE7RURHRjtFQ0FBO0lBQ0Usd0JBQUE7RURFRjtFQ0NBO0lBQ0UseUJBQUE7RURDRjtFQ0VB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bEtBO0VBQ0U7SUFDRSx5QkFBQTtFTHFLRjtFS2xLQTtJQUVFLHVDQUFBO0VMbUtGO0FBQ0Y7O0FLM0tBO0VBQ0U7SUFDRSx5QkFBQTtFTHFLRjtFS2xLQTtJQUVFLHVDQUFBO0VMbUtGO0FBQ0Y7QU1wTkE7Ozs7RUFBQTtBQU1BO0VBQ0Usa0JBQUE7RUpJQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0FIeU5aO0FNdE5FO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0FOdU5KO0FNcE5FO0VBQ0UsV0FBQTtFSlRGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUdnQlIsMkRBQUE7VUFBQSxtREFBQTtBTndOSjtBTXJORTtFQUNFLFVIeEJRO0VET1YsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFR3dCUiwwREFBQTtVQUFBLGtEQUFBO0VBQ0EsMkJBQUE7VUFBQSxtQkFBQTtBTnlOSjs7QU1yTkE7RUFDRTtJQUlFLHdCQUFBO0VOcU5GO0VNbE5BO0lBQ0UsNEJBQUE7RU5vTkY7QUFDRjs7QU05TkE7RUFDRTtJQUlFLHdCQUFBO0VOcU5GO0VNbE5BO0lBQ0UsNEJBQUE7RU5vTkY7QUFDRjtBTWpOQTtFQUNFO0lBSUUsd0JBQUE7RU5nTkY7RU03TUE7SUFDRSwyQkFBQTtFTitNRjtBQUNGO0FNek5BO0VBQ0U7SUFJRSx3QkFBQTtFTmdORjtFTTdNQTtJQUNFLDJCQUFBO0VOK01GO0FBQ0Y7QU8zUUE7Ozs7RUFBQTtBQU1BO0VBQ0Usa0JBQUE7RUxJQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0FIZ1JaO0FPN1FFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7QVA4UUo7QU8zUUU7RUFDRSxPQUFBO0VBQ0EsVUFBQTtFTFRGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUlnQlIsZ0NBQUE7RUFDQSxzREFBQTtVQUFBLDhDQUFBO0FQK1FKO0FPNVFFO0VBQ0UsT0FBQTtFQUNBLFdBQUE7RUxuQkYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFSTBCUixnQ0FBQTtFQUNBLG9EQUFBO1VBQUEsNENBQUE7QVBnUko7O0FPNVFBO0VBQ0U7SUFDRSw2Q0FBQTtFUCtRRjtFTzVRQTtJQUNFLCtDQUFBO0VQOFFGO0FBQ0Y7O0FPclJBO0VBQ0U7SUFDRSw2Q0FBQTtFUCtRRjtFTzVRQTtJQUNFLCtDQUFBO0VQOFFGO0FBQ0Y7QVE1VEE7Ozs7RUFBQTtBQVdBO0VBQ0Usa0JBQUE7RUFDQSxhQVBTO0VOS1QsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFS1NWLDZFQUNFO0VBR0Ysb0RBQUE7VUFBQSw0Q0FBQTtBUnVURjs7QVFwVEE7RUFDRTtJQUNFLHFGQUNFO0VSc1RKO0VRalRBO0lBQ0UscUZBQ0U7RVJrVEo7RVE3U0E7SUFDRSxxRkFDRTtFUjhTSjtBQUNGOztBUWhVQTtFQUNFO0lBQ0UscUZBQ0U7RVJzVEo7RVFqVEE7SUFDRSxxRkFDRTtFUmtUSjtFUTdTQTtJQUNFLHFGQUNFO0VSOFNKO0FBQ0Y7QVN4VkE7Ozs7RUFBQTtBQVdBO0VBQ0Usa0JBQUE7RUFDQSxhQVBTO0VQS1QsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFTVNWLDZFQUNFO0VBR0Ysa0RBQUE7VUFBQSwwQ0FBQTtBVG1WRjs7QVNoVkE7RUFDRTtJQUNFLDZFQUNFO0VUa1ZKO0VTN1VBO0lBQ0UsaUZBQ0U7RVQ4VUo7RVN6VUE7SUFDRSw2RUFDRTtFVDBVSjtFU3JVQTtJQUNFLGlGQUNFO0VUc1VKO0VTalVBO0lBQ0UsNkVBQ0U7RVRrVUo7RVM3VEE7SUFDRSxpRkFDRTtFVDhUSjtFU3pUQTtJQUNFLDZFQUNFO0VUMFRKO0FBQ0Y7O0FTeFdBO0VBQ0U7SUFDRSw2RUFDRTtFVGtWSjtFUzdVQTtJQUNFLGlGQUNFO0VUOFVKO0VTelVBO0lBQ0UsNkVBQ0U7RVQwVUo7RVNyVUE7SUFDRSxpRkFDRTtFVHNVSjtFU2pVQTtJQUNFLDZFQUNFO0VUa1VKO0VTN1RBO0lBQ0UsaUZBQ0U7RVQ4VEo7RVN6VEE7SUFDRSw2RUFDRTtFVDBUSjtBQUNGO0FVaFlBOzs7O0VBQUE7QUFVQTtFQUNFLGtCQUFBO0VBQ0EsVUFBQTtFUkRBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RU9RViwwQkFBQTtFQUNBLGtEQUFBO1VBQUEsMENBQUE7QVYrWEY7QVU3WEU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtBVjhYSjtBVTNYRTtFQUNFLGdCQUFBO0VBQ0EsU0FBQTtFUmpCRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0FIc1paO0FVN1hFO0VBQ0UsZUFBQTtFQUNBLFNBQUE7RVJ4QkYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtBSCtaWjs7QVU5WEE7RUFDRTtJQUNFLDZDQUFBO0VWaVlGO0VVOVhBO0lBQ0UsK0NBQUE7RVZnWUY7QUFDRjs7QVV2WUE7RUFDRTtJQUNFLDZDQUFBO0VWaVlGO0VVOVhBO0lBQ0UsK0NBQUE7RVZnWUY7QUFDRjtBV2hiQTs7OztFQUFBO0FBY0E7RUFDRSxrQkFBQTtFQUNBLFdBVFE7RUFVUixhQVRTO0VUR1QsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFUWFWLHVGQUNFO0VBR0YsOENBQUE7VUFBQSxzQ0FBQTtBWHdhRjs7QVdyYUE7RUFDRTtJQUNFLHVGQUNFO0VYdWFKO0VXbGFBO0lBQ0Usd0ZBQ0U7RVhtYUo7RVc5WkE7SUFDRSw0RkFDRTtFWCtaSjtFVzFaQTtJQUNFLDJGQUNFO0VYMlpKO0VXdFpBO0lBQ0UsdUZBQ0U7RVh1Wko7RVdsWkE7SUFDRSx3RkFDRTtFWG1aSjtFVzlZQTtJQUNFLDRGQUNFO0VYK1lKO0VXMVlBO0lBQ0UsMkZBQ0U7RVgyWUo7RVd0WUE7SUFDRSx1RkFDRTtFWHVZSjtFV2xZQTtJQUNFLHdGQUNFO0VYbVlKO0VXOVhBO0lBQ0UsNEZBQ0U7RVgrWEo7RVcxWEE7SUFDRSwyRkFDRTtFWDJYSjtFV3RYQTtJQUNFLHVGQUNFO0VYdVhKO0FBQ0Y7O0FXL2NBO0VBQ0U7SUFDRSx1RkFDRTtFWHVhSjtFV2xhQTtJQUNFLHdGQUNFO0VYbWFKO0VXOVpBO0lBQ0UsNEZBQ0U7RVgrWko7RVcxWkE7SUFDRSwyRkFDRTtFWDJaSjtFV3RaQTtJQUNFLHVGQUNFO0VYdVpKO0VXbFpBO0lBQ0Usd0ZBQ0U7RVhtWko7RVc5WUE7SUFDRSw0RkFDRTtFWCtZSjtFVzFZQTtJQUNFLDJGQUNFO0VYMllKO0VXdFlBO0lBQ0UsdUZBQ0U7RVh1WUo7RVdsWUE7SUFDRSx3RkFDRTtFWG1ZSjtFVzlYQTtJQUNFLDRGQUNFO0VYK1hKO0VXMVhBO0lBQ0UsMkZBQ0U7RVgyWEo7RVd0WEE7SUFDRSx1RkFDRTtFWHVYSjtBQUNGO0FZM2VBOzs7O0VBQUE7QUFTQTtFQUNFLGtCQUFBO0VWQ0EsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFU01WLDZFQUFBO1VBQUEscUVBQUE7QVoyZUY7QVl6ZUU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QVowZUo7QVl2ZUU7RUFDRSxXQUFBO0VWZEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFU3FCUiw4REFBQTtVQUFBLHNEQUFBO0FaMmVKO0FZeGVFO0VBQ0UsV0FBQTtFVnRCRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VTNkJSLDRFQUFBO1VBQUEsb0VBQUE7QVo0ZUo7O0FZeGVBO0VBQ0U7SUFDRSx5QkFBQTtFWjJlRjtFWXhlQTtJQUNFLHlCQUFBO0VaMGVGO0VZdmVBO0lBQ0UseUJBQUE7RVp5ZUY7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QUNBLE1BQUE7QWZxb0JKO0FlbG9CRTtFYi9CQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VZcUNSLHdEQUFBO1VBQUEsZ0RBQUE7RUFDQSwyQkFBQTtVQUFBLG1CQUFBO0FmdW9CSjtBZXBvQkU7RWJ0Q0EsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFWTRDUix1REFBQTtVQUFBLCtDQUFBO0VBQ0EsNkJBQUE7VUFBQSxxQkFBQTtBZnlvQko7O0Flcm9CQTtFQUNFO0lBQ0UsZ0RBQUE7RWZ3b0JGO0Vlcm9CQTtJQUdFLGdDQUFBO0VmcW9CRjtFZWxvQkE7SUFDRSwrQ0FBQTtFZm9vQkY7QUFDRjs7QWVqcEJBO0VBQ0U7SUFDRSxnREFBQTtFZndvQkY7RWVyb0JBO0lBR0UsZ0NBQUE7RWZxb0JGO0VlbG9CQTtJQUNFLCtDQUFBO0Vmb29CRjtBQUNGO0Flam9CQTtFQUNFO0lBQ0UsZ0RBQUE7RWZtb0JGO0VlaG9CQTtJQUdFLGdDQUFBO0VmZ29CRjtFZTduQkE7SUFDRSwrQ0FBQTtFZituQkY7QUFDRjtBZTVvQkE7RUFDRTtJQUNFLGdEQUFBO0VmbW9CRjtFZWhvQkE7SUFHRSxnQ0FBQTtFZmdvQkY7RWU3bkJBO0lBQ0UsK0NBQUE7RWYrbkJGO0FBQ0Y7QWU1bkJBO0VBQ0U7SUFDRSxpREFBQTtFZjhuQkY7RWUzbkJBO0lBR0UsaUNBQUE7RWYybkJGO0VleG5CQTtJQUNFLGdEQUFBO0VmMG5CRjtBQUNGO0Fldm9CQTtFQUNFO0lBQ0UsaURBQUE7RWY4bkJGO0VlM25CQTtJQUdFLGlDQUFBO0VmMm5CRjtFZXhuQkE7SUFDRSxnREFBQTtFZjBuQkY7QUFDRjtBZ0JodUJBOzs7O0VBQUE7QUFTQTtFQUNFLGtCQUFBO0VkQ0EsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFYU1WLDRCQUFBO0VBQ0EscURBQUE7VUFBQSw2Q0FBQTtBaEJndUJGO0FnQjl0QkU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QWhCK3RCSjtBZ0I1dEJFO0VkZEEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFYW9CUiw0REFBQTtVQUFBLG9EQUFBO0FoQml1Qko7QWdCOXRCRTtFZHBCQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VhMEJSLDJEQUFBO1VBQUEsbURBQUE7QWhCbXVCSjs7QWdCL3RCQTtFQUNFO0lBQ0UsNEJBQUE7RWhCa3VCRjtFZ0IvdEJBO0lBRUUsMEJBQUE7RWhCZ3VCRjtFZ0I3dEJBO0lBQ0UsNEJBQUE7RWhCK3RCRjtBQUNGOztBZ0IzdUJBO0VBQ0U7SUFDRSw0QkFBQTtFaEJrdUJGO0VnQi90QkE7SUFFRSwwQkFBQTtFaEJndUJGO0VnQjd0QkE7SUFDRSw0QkFBQTtFaEIrdEJGO0FBQ0Y7QWdCNXRCQTtFQUNFO0lBQ0UsdUNBQUE7RWhCOHRCRjtFZ0IzdEJBO0lBRUUsdUNBQUE7RWhCNHRCRjtFZ0J6dEJBO0lBQ0UsdUNBQUE7RWhCMnRCRjtBQUNGO0FnQnZ1QkE7RUFDRTtJQUNFLHVDQUFBO0VoQjh0QkY7RWdCM3RCQTtJQUVFLHVDQUFBO0VoQjR0QkY7RWdCenRCQTtJQUNFLHVDQUFBO0VoQjJ0QkY7QUFDRjtBZ0J4dEJBO0VBQ0U7SUFDRSx1Q0FBQTtFaEIwdEJGO0VnQnZ0QkE7SUFFRSxzQ0FBQTtFaEJ3dEJGO0VnQnJ0QkE7SUFDRSx1Q0FBQTtFaEJ1dEJGO0FBQ0Y7QWdCbnVCQTtFQUNFO0lBQ0UsdUNBQUE7RWhCMHRCRjtFZ0J2dEJBO0lBRUUsc0NBQUE7RWhCd3RCRjtFZ0JydEJBO0lBQ0UsdUNBQUE7RWhCdXRCRjtBQUNGO0FpQnZ5QkE7Ozs7O0VBQUE7QUFXQTtFQUNFLGtCQUFBO0VmREEsV2VJVTtFZkhWLFllSVc7RWZIWCxrQmVJVztFZkhYLHFDZVBjO0VmUWQsa0JlSVU7RUFHVixjQUFBO0VBQ0EsaUJBQUE7QWpCZ3lCRjtBaUI5eEJFO0VBRUUsV0FBQTtF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Q0Y7O0FzQjlrQ0E7RUFDRTtJQUNFLFlBQUE7SUFDQSwwQ0FBQTtFdEIwaUNGO0VzQnZpQ0E7SUFDRSxZQUFBO0lBQ0EsMkNBQUE7RXRCeWlDRjtFc0J0aUNBO0lBQ0UsWUFBQTtJQUNBLDBDQUFBO0V0QndpQ0Y7RXNCcmlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJ1aUNGO0VzQnBpQ0E7SUFDRSxhQUFBO0lBQ0EsMkNBQUE7RXRCc2lDRjtFc0JuaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0QnFpQ0Y7RXNCbGlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJvaUNGO0VzQmppQ0E7SUFDRSxhQUFBO0lBQ0EsMkNBQUE7RXRCbWlDRjtFc0JoaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0QmtpQ0Y7QUFDRixDQUFBLG1DQUFBXCIsXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJAY2hhcnNldCBcXFwiVVRGLThcXFwiO1xcbmh0bWwge1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogNzY3cHgpIHtcXG4gIGh0bWwge1xcbiAgICBmb250LXNpemU6IDF2dztcXG4gIH1cXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgaHRtbCB7XFxuICAgIGZvbnQtc2l6ZTogMS44NXZoO1xcbiAgfVxcbn1cXG5odG1sLmZyZWV6ZSB7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG5ib2R5IHtcXG4gIG1hcmdpbjogMDtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcblxcbmgxIHtcXG4gIG1hcmdpbjogMDtcXG4gIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICBmb250LXNpemU6IDRyZW07XFxufVxcblxcbmgyIHtcXG4gIGZvbnQtc2l6ZTogMi41cmVtO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICBoMiB7XFxuICAgIGZvbnQtc2l6ZTogMi4xNXJlbTtcXG4gIH1cXG59XFxuaDIgYSB7XFxuICBmb250LXNpemU6IDEuOXJlbTtcXG59XFxuXFxuaDMge1xcbiAgZm9udC1zaXplOiAyLjNyZW07XFxuICBtYXJnaW46IDA7XFxufVxcblxcbmEge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6IGluaGVyaXQ7XFxufVxcblxcbmEge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG5hLmhpZGRlbiwgYS5zZWxlY3RlZFBhZ2Uge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcblxcbmEuaGlkZGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxufVxcblxcbmEuc2VsZWN0ZWRQYWdlIHtcXG4gIGNvbG9yOiAjZThhYTc3O1xcbiAgZmlsdGVyOiBzYXR1cmF0ZSgxMjAlKTtcXG59XFxuXFxuKi5oaWRkZW4ge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG5cXG5kaXYsIGJ1dHRvbiB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG5idXR0b24ge1xcbiAgYm9yZGVyOiBub25lO1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcblxcbmxpIHtcXG4gIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcXG59XFxuXFxuI292ZXJhbGxDb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAwO1xcbn1cXG4jb3ZlcmFsbENvbnRhaW5lci5mYWRlZCB7XFxuICBmaWx0ZXI6IG9wYWNpdHkoNDAlKTtcXG59XFxuXFxuLmNvbnRlbnRDb250YWluZXIge1xcbiAgaGVpZ2h0OiBpbml0aWFsO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBtYXJnaW46IDQlIDA7XFxuICBtYXJnaW4tYm90dG9tOiA1JTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRDb250YWluZXIgPiBkaXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgcGFkZGluZy10b3A6IDUuNXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDc2N3B4KSB7XFxuICAuY29udGVudENvbnRhaW5lciA+IGRpdiB7XFxuICAgIHdpZHRoOiA5NSU7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Q29udGFpbmVyID4gZGl2IHtcXG4gICAgd2lkdGg6IDg1JTtcXG4gIH1cXG59XFxuLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkIC50ZXh0Qm94IC5jb250ZW50LXBhZ2VzIHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkIC50ZXh0Qm94IC5jb250ZW50LXBhZ2VzIGEge1xcbiAgZm9udC1zaXplOiAxLjc1cmVtO1xcbn1cXG5cXG4udGl0bGVBbmRUZXh0Qm94LCAuY29udGVudEJveCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbi50aXRsZUFuZFRleHRCb3gge1xcbiAgbWFyZ2luLXJpZ2h0OiA1JTtcXG59XFxuXFxuLnRpdGxlQm94LCAudGV4dEJveCB7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHdpZHRoOiAxNnJlbTtcXG59XFxuXFxuLnRpdGxlQm94IHtcXG4gIHBhZGRpbmc6IDEwJTtcXG59XFxuLnRpdGxlQm94ID4gKiB7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4udGl0bGVCb3ggPiA6bnRoLWNoaWxkKDIpIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcbi50aXRsZUJveCA+IDpudGgtY2hpbGQoMikgaDIge1xcbiAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICBwYWRkaW5nLWJvdHRvbTogMTUlO1xcbn1cXG5cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzLCAuY29udGVudEJveC5tZW1iZXJzIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICByb3ctZ2FwOiAwLjM1cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogNzY3cHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAzMy4zJSk7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg0LCAyNSUpO1xcbiAgfVxcbn1cXG5cXG4uY29udGVudEJveCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiB7XFxuICB3aWR0aDogMTRyZW07XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyB7XFxuICBib3gtc2l6aW5nOiBpbml0aWFsO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwLCAyMCwgMjAsIDAuNyk7XFxuICBwYWRkaW5nOiAwLjJyZW0gMC4ycmVtO1xcbiAgbWFyZ2luLXRvcDogNy42cmVtO1xcbiAgYm9yZGVyLXJhZGl1czogMzAlO1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5pbnRlcmFjdGlvbi1wcm9tcHQgLmNsaWNrLXByb21wdCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuY2xpY2stcHJvbXB0IHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuaG92ZXItcHJvbXB0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5ob3Zlci1wcm9tcHQge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuaG92ZXItcHJvbXB0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5ob3Zlci1wcm9tcHQge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3Mge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICB3aWR0aDogMTAwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICosIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqIHtcXG4gIGNvbG9yOiByZ2IoMjM4LCAyMzEsIDIxMCk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIG1hcmdpbi10b3A6IDAuN3JlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICosIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqIHtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICB9XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMge1xcbiAgZm9udC1zaXplOiAycmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAuY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLmZhLXNlYXJjaC1wbHVzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLmZhLXNlYXJjaC1wbHVzIHtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICB9XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqOmhvdmVyLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgKjpob3ZlciB7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDExMCUpO1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDEyMCUpO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgaSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIGkge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NfX3Zpc2libGUsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NfX3Zpc2libGUge1xcbiAgZGlzcGxheTogZmxleDtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IHAsIC5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIGRpdiBhLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgcCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IGEge1xcbiAgbWFyZ2luOiAyJTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5LXRleHQge1xcbiAgbWFyZ2luLXRvcDogLTAuM3JlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBnYXA6IDAuMnJlbTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0IHAsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCBwIHtcXG4gIG1hcmdpbjogMDtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheS10ZXh0IHA6bnRoLW9mLXR5cGUoMiksIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCBwOm50aC1vZi10eXBlKDIpIHtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcbi5jb250ZW50Qm94IC5uZXdzIHtcXG4gIG1hcmdpbjogMCAxJTtcXG4gIHBhZGRpbmctdG9wOiA1JTtcXG4gIGhlaWdodDogYXV0bztcXG59XFxuLmNvbnRlbnRCb3ggLm5ld3MgaWZyYW1lIHtcXG4gIHdpZHRoOiAzMDBweDtcXG4gIGhlaWdodDogMjAwcHg7XFxufVxcblxcbiNmb290ZXJDb250YWluZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzOSwgMzksIDM5LCAwLjcpO1xcbiAgbWFyZ2luOiAwO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJvdHRvbTogMDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIHBhZGRpbmctcmlnaHQ6IDJyZW07XFxuICBwYWRkaW5nLWxlZnQ6IDJyZW07XFxuICBjb2xvcjogaXZvcnk7XFxufVxcbiNmb290ZXJDb250YWluZXIgLmNyZWRpdCB7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2Zvb3RlckNvbnRhaW5lciAuY3JlZGl0IHtcXG4gICAgZm9udC1zaXplOiAxLjJyZW07XFxuICB9XFxufVxcbiNmb290ZXJDb250YWluZXIgI3NvY2lhbC1jb250YWluZXIgYSB7XFxuICBmb250LXNpemU6IDEuN3JlbTtcXG4gIG1hcmdpbjogMXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2Zvb3RlckNvbnRhaW5lciAjc29jaWFsLWNvbnRhaW5lciBhIHtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIG1hcmdpbjogMC42NXJlbTtcXG4gIH1cXG59XFxuXFxuI29wZW5pbmdDb250YWluZXIge1xcbiAgaGVpZ2h0OiA5OS41dmg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBjb2xvcjogcmdiKDE4OSwgMTg5LCAxODkpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoMSB7XFxuICBmb250LXNpemU6IDUuMnJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaDEge1xcbiAgICBmb250LXNpemU6IDYuNXJlbTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgcCB7XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNvcGVuaW5nQ29udGFpbmVyIHAge1xcbiAgICBmb250LXNpemU6IDIuN3JlbTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIgZGl2IHtcXG4gIHRleHQtc2hhZG93OiAxcHggMXB4IGJsYWNrO1xcbiAgd2lkdGg6IDgwJTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIgZGl2IHtcXG4gICAgd2lkdGg6IDcwJTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFtsb2dvU3ltYm9sXSA2JSBbbG9nb1RleHRdIDI5JSBbbmF2aWdhdGlvbl0gMWZyO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImxvZ29TeW1ib2wgbG9nb1RleHQgbmF2aWdhdGlvblxcXCI7XFxuICBncmlkLWF1dG8tZmxvdzogY29sdW1uO1xcbiAganVzdGlmeS1zZWxmOiBlbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcwLCA2MiwgNTUsIDAuODUpO1xcbiAgYm94LXNoYWRvdzogMC4ycmVtIDAuMnJlbSAxcmVtIDAuNHJlbSBpbnNldCByZ2JhKDQ5LCA0MywgMzksIDAuNzUpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDUuNXJlbTtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogMDtcXG4gIHotaW5kZXg6IDk5OTk7XFxuICBjb2xvcjogcmdiKDE5OSwgMTg3LCAxNTYpO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIge1xcbiAgICBncmlkLWF1dG8tZmxvdzogcm93O1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFtsb2dvU3ltYm9sXSA0JSBbbG9nb1RleHRdIDI1JSBbbmF2aWdhdGlvbl0gMWZyO1xcbiAgICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwibG9nb1N5bWJvbCBsb2dvVGV4dCBuYXZpZ2F0aW9uXFxcIjtcXG4gIH1cXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHtcXG4gICAgaGVpZ2h0OiA0cmVtO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIuaGlkZGVuIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBidXR0b24ge1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICB3aWR0aDogMTByZW07XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBidXR0b24gaSB7XFxuICBkaXNwbGF5OiBpbmxpbmU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciAjbG9nby1zeW1ib2wsICNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciAjbG9nby10ZXh0IHtcXG4gIGhlaWdodDogNC41cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tc3ltYm9sLCAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tdGV4dCB7XFxuICAgIGhlaWdodDogM3JlbTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyICNsb2dvLXN5bWJvbCB7XFxuICBncmlkLWFyZWE6IGxvZ29TeW1ib2w7XFxuICBtYXJnaW4tdG9wOiAwLjNyZW07XFxuICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyICNsb2dvLXRleHQge1xcbiAgZ3JpZC1hcmVhOiBsb2dvVGV4dDtcXG4gIG1hcmdpbi10b3A6IDAuNnJlbTtcXG4gIHBhZGRpbmctbGVmdDogMC4ycmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgaW1nIHtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHAsICNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGp1c3RpZnktc2VsZjogZW5kO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIG1hcmdpbi1yaWdodDogMnJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB7XFxuICAgIGdyaWQtYXJlYTogbmF2aWdhdGlvbjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIG92ZXJmbG93OiB2aXNpYmxlO1xcbiAgICBqdXN0aWZ5LXNlbGY6IHVuc2V0O1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHVsIHtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWV2ZW5seTtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwge1xcbiAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xcbiAgICBnYXA6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGluaXRpYWw7XFxuICB9XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwgbGkge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDcwLCA2MiwgNTUpO1xcbiAgYm94LXNoYWRvdzogMC4ycmVtIDAuMnJlbSAxcmVtIDAuNnJlbSBpbnNldCByZ2JhKDQ5LCA0MywgMzksIDAuNzUpO1xcbiAgYm9yZGVyLXJhZGl1czogNSU7XFxuICBib3JkZXItYm90dG9tOiAwLjNyZW0gc29saWQgcmdiYSg1MSwgNDUsIDQwLCAwLjg1KTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCBsaSB7XFxuICAgIGJveC1zaGFkb3c6IG5vbmU7XFxuICAgIHdpZHRoOiBpbml0aWFsO1xcbiAgICBoZWlnaHQ6IGluaXRpYWw7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBib3JkZXItcmFkaXVzOiBpbml0aWFsO1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICB9XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwgbGkgYSB7XFxuICBwYWRkaW5nOiAwLjVyZW0gMXJlbTtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHVsIGxpIGEge1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHVsICNtb2JpbGUtbmF2LWNhbGxlciB7XFxuICBoZWlnaHQ6IDUuNXJlbTtcXG4gIGJveC1zaGFkb3c6IG5vbmU7XFxuICBib3JkZXI6IG5vbmU7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCAjbW9iaWxlLW5hdi1jYWxsZXIge1xcbiAgICBoZWlnaHQ6IDRyZW07XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwgI21vYmlsZS1uYXYtY2FsbGVyIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCAjbW9iaWxlLW5hdi1jYWxsZXIgYnV0dG9uIHtcXG4gIGNvbG9yOiBhbGljZWJsdWU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYub3BlbmVkIHtcXG4gIG92ZXJmbG93OiB2aXNpYmxlO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciAjcGFnZUltYWdlIHtcXG4gIHRvcDogMDtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciAjcGFnZUltYWdlIGltZyB7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZpbHRlcjogYmx1cigwLjZyZW0pIGdyYXlzY2FsZSg1MCUpO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgbWFyZ2luLXRvcDogMSU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIge1xcbiAgICBtYXJnaW4tdG9wOiAyJTtcXG4gIH1cXG59XFxuI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIgaW1nIHtcXG4gIGhlaWdodDogNnJlbTtcXG59XFxuXFxuLnRpdGxlQm94IHtcXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbn1cXG4udGl0bGVCb3ggcCB7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG59XFxuXFxuLnRleHRCb3gge1xcbiAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XFxufVxcbi50ZXh0Qm94IHAge1xcbiAgZm9udC1zaXplOiAxLjNyZW07XFxuICBjb2xvcjogd2hpdGU7XFxufVxcblxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNwcm9wZXJ0aWVzQ29udGFpbmVyLCAjbWVtYmVyc0NvbnRhaW5lciB7XFxuICAgIGhlaWdodDogNTJyZW07XFxuICB9XFxufVxcbiNwcm9wZXJ0aWVzQ29udGFpbmVyID4gZGl2IC50aXRsZUJveCwgI21lbWJlcnNDb250YWluZXIgPiBkaXYgLnRpdGxlQm94IHtcXG4gIGJvcmRlcjogMC4zNXJlbSBzb2xpZCByZ2IoMTk5LCAxODcsIDE1Nik7XFxufVxcbiNwcm9wZXJ0aWVzQ29udGFpbmVyIGltZywgI21lbWJlcnNDb250YWluZXIgaW1nIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG59XFxuI3Byb3BlcnRpZXNDb250YWluZXIgaW1nLnBhZ2VMaW5rc19fdmlzaWJsZSwgI21lbWJlcnNDb250YWluZXIgaW1nLnBhZ2VMaW5rc19fdmlzaWJsZSB7XFxuICBmaWx0ZXI6IGJyaWdodG5lc3MoMjclKTtcXG59XFxuXFxuI2FsbE5ld3NDb250YWluZXIge1xcbiAgaGVpZ2h0OiA1MXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbE5ld3NDb250YWluZXIge1xcbiAgICBoZWlnaHQ6IDUycmVtO1xcbiAgfVxcbn1cXG5cXG4jY29udGFjdENvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDU1cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjY29udGFjdENvbnRhaW5lciB7XFxuICAgIGhlaWdodDogNTJyZW07XFxuICB9XFxufVxcblxcbiNhbGxOZXdzQ29udGFpbmVyLCAjY29udGFjdENvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzEsIDI3LCAyMSk7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyID4gZGl2IC50aXRsZUJveCwgI2NvbnRhY3RDb250YWluZXIgPiBkaXYgLnRpdGxlQm94IHtcXG4gIGJvcmRlcjogNHB4IHNvbGlkIHJnYigyMjEsIDIyMSwgMjIxKTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgPiBkaXYgLnRleHRCb3ggcCwgI2NvbnRhY3RDb250YWluZXIgPiBkaXYgLnRleHRCb3ggcCB7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3gge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZvbnQtc2l6ZTogMS4xcmVtO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggPiBkaXYge1xcbiAgZmxleC1iYXNpczogNTAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiA+IGRpdiwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggPiBkaXYgPiBkaXYge1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBoZWlnaHQ6IDkyJTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLmZvcm0tbWVzc2FnZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLmZvcm0tbWVzc2FnZSB7XFxuICBoZWlnaHQ6IGF1dG87XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGgzLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBoMyB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBoZWlnaHQ6IDglO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCB1bCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggdWwge1xcbiAgcGFkZGluZzogMDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggdWwgbGksICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHVsIGxpIHtcXG4gIGRpc3BsYXk6IGlubGluZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIHtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjMzLCAyMzMsIDIzMywgMC4zKTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3M6OmFmdGVyLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3czo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIiBcXFwiO1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBoZWlnaHQ6IDFyZW07XFxuICBjbGVhcjogYm90aDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgaW1nLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBpbWcge1xcbiAgd2lkdGg6IDEzcmVtO1xcbiAgZmxvYXQ6IGxlZnQ7XFxuICBtYXJnaW4tcmlnaHQ6IDIuNSU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIHAsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIHAge1xcbiAgZm9udC1zaXplOiAxLjQ1cmVtO1xcbiAgbGluZS1oZWlnaHQ6IDEuNHJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgcCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgcCB7XFxuICAgIGZvbnQtc2l6ZTogMS4yNXJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuMnJlbTtcXG4gIH1cXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MsICNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0sICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHtcXG4gIHBhZGRpbmc6IDAgNSU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0sICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0ge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIC1tb3otY29sdW1uLWdhcDogMS4ycmVtO1xcbiAgICAgICBjb2x1bW4tZ2FwOiAxLjJyZW07XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwiY29udGFjdE5hbWUgY29udGFjdEVtYWlsXFxcIiBcXFwiY29udGFjdFBob25lIGNvbnRhY3RTdWJqZWN0XFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwic3VibWl0IC4uLlxcXCI7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtbmFtZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1uYW1lIHtcXG4gIGdyaWQtYXJlYTogY29udGFjdE5hbWU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtZW1haWwsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtZW1haWwge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0RW1haWw7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtcGhvbmUsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtcGhvbmUge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0UGhvbmU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3Qtc3ViamVjdCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1zdWJqZWN0IHtcXG4gIGdyaWQtYXJlYTogY29udGFjdFN1YmplY3Q7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtbWVzc2FnZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1tZXNzYWdlIHtcXG4gIGdyaWQtYXJlYTogY29udGFjdE1lc3NhZ2U7XFxufVxcblxcbiNjb250YWN0Q29udGFpbmVyIHtcXG4gIGJhY2tncm91bmQ6IGJsYWNrO1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB7XFxuICAtbW96LWNvbHVtbi1nYXA6IDNyZW07XFxuICAgICAgIGNvbHVtbi1nYXA6IDNyZW07XFxuICB3aWR0aDogODUlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB7XFxuICAgIHdpZHRoOiA3MCU7XFxuICB9XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGltZyB7XFxuICBmaWx0ZXI6IHNhdHVyYXRlKDEyMCUpO1xcbiAgd2lkdGg6IDQ1JTtcXG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBpbWcge1xcbiAgICB3aWR0aDogNTAlO1xcbiAgICBtYXJnaW4tbGVmdDogMDtcXG4gIH1cXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggbGFiZWwuZXJyb3Ige1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgY29sb3I6IHJnYigxMjAsIDE3OSwgMTU4KTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB7XFxuICBtYXJnaW4tdG9wOiAzcmVtO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtID4gZGl2IHtcXG4gIG1hcmdpbjogNSUgMDtcXG4gIG1hcmdpbi10b3A6IDA7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gbGFiZWwge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gW3R5cGU9cmFkaW9dIHtcXG4gIHdpZHRoOiAxMCU7XFxuICBkaXNwbGF5OiBpbml0aWFsO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHVsIHtcXG4gIHBhZGRpbmc6IDA7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gaW5wdXQsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gc2VsZWN0IHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgbWFyZ2luLXRvcDogMiU7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gaW5wdXQge1xcbiAgaGVpZ2h0OiAxLjVyZW07XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gc2VsZWN0IHtcXG4gIGhlaWdodDogMnJlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB0ZXh0YXJlYSB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMThyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gdGV4dGFyZWEge1xcbiAgICBoZWlnaHQ6IDIwcmVtO1xcbiAgfVxcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIGJ1dHRvbiB7XFxuICBncmlkLWFyZWE6IHN1Ym1pdDtcXG4gIGNvbG9yOiBpdm9yeTtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG59XFxuXFxuLmRvdC1wdWxzZSB7XFxuICB0b3A6IDIwJTtcXG4gIGxlZnQ6IDM1JTtcXG59XFxuXFxuI3BvcC11cC1kaXNwbGF5LWJveCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDQ1LCA0MSwgMzUsIDAuOCk7XFxuICB3aWR0aDogOTR2dztcXG4gIGhlaWdodDogODd2aDtcXG4gIG92ZXJmbG93LXk6IGF1dG87XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICB6LWluZGV4OiAxMTA7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDh2aDtcXG4gIGxlZnQ6IDN2dztcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICByb3ctZ2FwOiAxcmVtO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBwYWRkaW5nLXRvcDogMi41cmVtO1xcbn1cXG4jcG9wLXVwLWRpc3BsYXktYm94IGltZyB7XFxuICB3aWR0aDogMjZyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYSwgI3BvcC11cC1kaXNwbGF5LWJveCBidXR0b24ge1xcbiAgZm9udC1zaXplOiAycmVtO1xcbn1cXG4jcG9wLXVwLWRpc3BsYXktYm94IGJ1dHRvbiB7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jcG9wLXVwLWRpc3BsYXktYm94IGJ1dHRvbjpob3ZlciwgI3BvcC11cC1kaXNwbGF5LWJveCBhOmhvdmVyIHtcXG4gIGZpbHRlcjogYnJpZ2h0bmVzcyg3MiUpO1xcbn1cXG4jcG9wLXVwLWRpc3BsYXktYm94ICNjb250ZW50LWhvbGRlciB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1ldmVubHk7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNzAlO1xcbn1cXG4jcG9wLXVwLWRpc3BsYXktYm94ICNjb250ZW50LWhvbGRlciAucG9wLXVwLWRpcmVjdGlvbmFsIHtcXG4gIGZvbnQtc2l6ZTogMi41cmVtO1xcbn1cXG5cXG4jbmV3cy1tZWRpYS1kaXNwbGF5IHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNDQsIDUyLCA3NywgMC44KTtcXG4gIGhlaWdodDogODh2aDtcXG4gIHdpZHRoOiA5NHZ3O1xcbiAgb3ZlcmZsb3cteTogYXV0bztcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIHotaW5kZXg6IDExMDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogN3ZoO1xcbiAgbGVmdDogM3Z3O1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxufVxcblxcbiNzaW5nbGVDb250YWluZXIge1xcbiAgaGVpZ2h0OiA3NyU7XFxuICBtaW4td2lkdGg6IDk2JTtcXG4gIHRvcDogOS41JTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LXdyYXA6IHdyYXA7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB6LWluZGV4OiAxO1xcbiAgcGFkZGluZzogMS41cmVtIDFyZW07XFxuICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMzcsIDM1LCAzNCwgMC45KTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI3NpbmdsZUNvbnRhaW5lciB7XFxuICAgIG1pbi13aWR0aDogNjAlO1xcbiAgICBoZWlnaHQ6IDg2JTtcXG4gIH1cXG59XFxuI3NpbmdsZUNvbnRhaW5lciBoNCB7XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciBoMywgI3NpbmdsZUNvbnRhaW5lciBoNCwgI3NpbmdsZUNvbnRhaW5lciAucmVsYXRlZC1saW5rIHtcXG4gIGNvbG9yOiByZ2IoMjQxLCAyMTgsIDE4OSk7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAyNHZ3O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB7XFxuICAgIHdpZHRoOiAyNXZ3O1xcbiAgfVxcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyBpbWcge1xcbiAgaGVpZ2h0OiAzMyU7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIGltZyB7XFxuICAgIGhlaWdodDogNDIlO1xcbiAgfVxcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB1bCB7XFxuICBwYWRkaW5nLWxlZnQ6IDIwJTtcXG4gIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG4gIG1hcmdpbi10b3A6IDFyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHVsIHtcXG4gICAgZm9udC1zaXplOiAxLjVyZW07XFxuICB9XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHVsIGxpIHtcXG4gIG1hcmdpbi10b3A6IDAuNnJlbTtcXG4gIGxpc3Qtc3R5bGUtdHlwZTogc3F1YXJlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB1bCBsaSBhIHtcXG4gIGZpbHRlcjogYnJpZ2h0bmVzcygxMTUlKTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyB7XFxuICB3aWR0aDogNDB2dztcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLXJvd3M6IDclIDFmcjtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyB7XFxuICAgIHdpZHRoOiAzNXZ3O1xcbiAgfVxcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIHAge1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBoZWlnaHQ6IDk5JTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyBwIHtcXG4gICAgZm9udC1zaXplOiAxLjdyZW07XFxuICB9XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3NpbmdsZUluZm8gZGl2IHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgcGFkZGluZzogMCAxcmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN2aWRBbmRJbWdDb2wge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDE2dnc7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdmlkQW5kSW1nQ29sIGgzIHtcXG4gIGZvbnQtc2l6ZTogMS45cmVtO1xcbiAgbWFyZ2luOiAxcmVtIDA7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIHtcXG4gIHdpZHRoOiAyNnZ3O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBwYWRkaW5nOiAwIDFyZW07XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiAxMCUgMWZyIDQlO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCB7XFxuICAgIHdpZHRoOiAyOHZ3O1xcbiAgfVxcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCBoMyB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIGgzIGEge1xcbiAgZm9udC1zaXplOiAxLjdyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIGgzIGE6aG92ZXIge1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCAjbmV3cy1yZWNpZXZlciB7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIG1hcmdpbjogMXJlbSAwO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCAjbmV3cy1yZWNpZXZlciBwIHtcXG4gIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgcGFkZGluZy1yaWdodDogMXJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgI25ld3MtcmVjaWV2ZXIgaW1nIHtcXG4gIHdpZHRoOiA5NSU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sICNwYWdpbmF0aW9uLWhvbGRlciB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3R0b206IDA7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG5cXG5ib2R5IHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxMDAsIDkyLCA4Mik7XFxufVxcblxcbi5zZWFyY2gtb3ZlcmxheSB7XFxuICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgei1pbmRleDogMTEwO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHJpZ2h0OiAwO1xcbiAgYm90dG9tOiAwO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg3MiwgNjgsIDYyLCAwLjk2KTtcXG4gIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gIG9wYWNpdHk6IDA7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuMDkpO1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjNzLCB0cmFuc2Zvcm0gMC4zcywgdmlzaWJpbGl0eSAwLjNzO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuLnNlYXJjaC1vdmVybGF5IC5jb250YWluZXIge1xcbiAgbWF4LXdpZHRoOiAxMzAwcHg7XFxuICBtYXJnaW46IDAgYXV0bztcXG4gIHBhZGRpbmc6IDAgMTZweDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXkgcCB7XFxuICBwYWRkaW5nLXRvcDogMXJlbTtcXG59XFxuYm9keS5hZG1pbi1iYXIgLnNlYXJjaC1vdmVybGF5IHtcXG4gIHRvcDogMnJlbTtcXG59XFxuLnNlYXJjaC1vdmVybGF5X190b3Age1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjEyKTtcXG59XFxuLnNlYXJjaC1vdmVybGF5X19pY29uIHtcXG4gIG1hcmdpbi1yaWdodDogMC43NXJlbTtcXG4gIGZvbnQtc2l6ZTogMi41cmVtO1xcbiAgY29sb3I6IHJnYigxNDgsIDEyMSwgMTA1KTtcXG59XFxuLnNlYXJjaC1vdmVybGF5LS1hY3RpdmUge1xcbiAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gIG9wYWNpdHk6IDE7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGUge1xcbiAgbWFyZ2luOiAzMHB4IDAgMXB4IDA7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAgZm9udC1zaXplOiAycmVtO1xcbiAgcGFkZGluZzogMTVweCAwO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNjY2M7XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9fY2xvc2Uge1xcbiAgZm9udC1zaXplOiAyLjdyZW07XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig1OCwgNTQsIDU0KTtcXG4gIGNvbG9yOiByZ2IoMTgwLCAxNzEsIDE2Nik7XFxuICBsaW5lLWhlaWdodDogMC43O1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX2Nsb3NlOmhvdmVyIHtcXG4gIG9wYWNpdHk6IDE7XFxufVxcbi5zZWFyY2gtb3ZlcmxheSAub25lLWhhbGYge1xcbiAgcGFkZGluZy1ib3R0b206IDA7XFxufVxcblxcbi5zZWFyY2gtdGVybSB7XFxuICB3aWR0aDogNzUlO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGJvcmRlcjogbm9uZTtcXG4gIHBhZGRpbmc6IDFyZW0gMDtcXG4gIG1hcmdpbjogMDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgZm9udC1zaXplOiAxcmVtO1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICBjb2xvcjogcmdiKDIxOCwgMjAxLCAxODIpO1xcbn1cXG5cXG4uYm9keS1uby1zY3JvbGwge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuLmNvbnRhaW5lciB7XFxuICBtYXgtd2lkdGg6IDEzMDBweDtcXG4gIG1hcmdpbjogMCBhdXRvO1xcbiAgcGFkZGluZzogMCAxNnB4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG5AbWVkaWEgKG1pbi13aWR0aDogOTYwcHgpIHtcXG4gIC5zZWFyY2gtdGVybSB7XFxuICAgIHdpZHRoOiA4MCU7XFxuICAgIGZvbnQtc2l6ZTogM3JlbTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHNwaW4ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHNwaW4ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xcbiAgfVxcbn1cXG4uc3Bpbm5lci1sb2FkZXIge1xcbiAgbWFyZ2luLXRvcDogNDVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHdpZHRoOiAyNHB4O1xcbiAgaGVpZ2h0OiAyNHB4O1xcbiAgYm9yZGVyOiAwLjI1cmVtIHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gIGJvcmRlci10b3AtY29sb3I6IGJsYWNrO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHNwaW4gMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgYW5pbWF0aW9uOiBzcGluIDFzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuLm1lZGlhLWNhcmQgYnV0dG9uIHtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGZvbnQtc2l6ZTogMi4xcmVtO1xcbn1cXG5cXG5oMSwgaDIsIGgzLCBoNCB7XFxuICBmb250LWZhbWlseTogXFxcIkxpYnJlIENhc2xvbiBUZXh0XFxcIiwgc2VyaWY7XFxufVxcblxcbi50ZXh0Qm94IHAsICNyZWxhdGlvbnNoaXAtbGluaywgI3NpbmdsZS1saW5rIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTGlicmUgQ2FzbG9uIERpc3BsYXlcXFwiLCBzZXJpZjtcXG59XFxuXFxuaDEge1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuXFxuaDIge1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG59XFxuXFxuLmRpc3BsYXktdGV4dCwgI3dlbGNvbWVDb250YWluZXIgcCwgLnRpdGxlQm94IHAge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJDb3Jtb3JhbnQgU0NcXFwiLCBzZXJpZjtcXG59XFxuXFxuaW5wdXQsIC5yZWFkLW1vcmUsIC5uZXdzIGxpIGEsIGhlYWRlciBsaSBhLCAjcmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZyBidXR0b24sICNzZWFyY2gtZmlsdGVycyBidXR0b24sICNyZXNldC1hbGwge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJMb3JhXFxcIiwgc2VyaWY7XFxufVxcblxcbi5uZXdzIHAge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJSb2JvdG9cXFwiLCBzYW5zLXNlcmlmO1xcbn1cXG5cXG4ubmV3cyBwIHtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxufVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDUwJTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuLmNvbnRlbnQtbG9hZGVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgaGVpZ2h0OiA1MCU7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5jb250ZW50LWxvYWRlciAuYmFsbCB7XFxuICB3aWR0aDogMS4ycmVtO1xcbiAgaGVpZ2h0OiAxLjJyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNDcsIDE2MywgNTYpO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA1MCU7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nMiAwLjdzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUsIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQyIDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZzIgMC43cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlLCBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0MiAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuLmNvbnRlbnQtbG9hZGVyLmxvYWRlcltkYXRhLXRleHRdOjpiZWZvcmUge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG4uY29udGVudC1sb2FkZXIubG9hZGVyLmlzLWFjdGl2ZTo6YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiA1MCU7XFxuICBsZWZ0OiAyNSU7XFxuICB0b3A6IDM5JTtcXG4gIGZvbnQtc2l6ZTogMi43cmVtO1xcbiAgY29sb3I6IHJnYigxOTUsIDE2OCwgMTI2KTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbn1cXG4uY29udGVudC1sb2FkZXIubG9hZGVyLWJhci1waW5nLXBvbmc6OmFmdGVyIHtcXG4gIHdpZHRoOiAxLjJyZW07XFxuICBoZWlnaHQ6IDEuMnJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxMDEsIDE0OCwgMTg3KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcgMC43cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlLCBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0IDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjdzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUsIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQgMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcbi5jb250ZW50LWxvYWRlci5sb2FkZXIuaXMtYWN0aXZlIHtcXG4gIGhlaWdodDogOTclO1xcbiAgei1pbmRleDogMDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTEsIDQ5LCA1NiwgMC43NDkwMTk2MDc4KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBibGluayAxLjhzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogYmxpbmsgMS44cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgYmxpbmsge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwLjU7XFxuICB9XFxuICA1MCUge1xcbiAgICBvcGFjaXR5OiAwLjc1O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgYmxpbmsge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwLjU7XFxuICB9XFxuICA1MCUge1xcbiAgICBvcGFjaXR5OiAwLjc1O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1Bvbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiA0MCU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogNjAlO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IDQwJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiA2MCU7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0IHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg3MiwgNjgsIDgyLCAwLjc1KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTAyLCA3OCwgMTIyLCAwLjc1KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDE0OSwgOTMsIDE2OCwgMC43NSk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdCB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNzIsIDY4LCA4MiwgMC43NSk7XFxuICB9XFxuICA1MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEwMiwgNzgsIDEyMiwgMC43NSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxNDksIDkzLCAxNjgsIDAuNzUpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nMiB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IDQzJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiA2MyU7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nMiB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IDQzJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiA2MyU7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0MiB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig0NywgMTYzLCA1Nik7XFxuICB9XFxuICA1MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoODcsIDE0MywgNTYpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYigxMjYsIDEzMSwgNTgpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQyIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDQ3LCAxNjMsIDU2KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig4NywgMTQzLCA1Nik7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEyNiwgMTMxLCA1OCk7XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIge1xcbiAgaGVpZ2h0OiA1NnJlbTtcXG4gIHRvcDogN3JlbTtcXG4gIHdpZHRoOiA5NSU7XFxuICBsZWZ0OiAyLjUlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzNywgMzUsIDM0LCAwLjc1KTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLWF1dG8tZmxvdzogcm93O1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxMDAlO1xcbiAgY29sb3I6IGFsaWNlYmx1ZTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciB7XFxuICAgIGhlaWdodDogNjglO1xcbiAgICB0b3A6IDcuM3JlbTtcXG4gIH1cXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciB7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogNjYlIDM0JTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVyLXNvcnQtdG9nZ2xlIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXItc29ydC10b2dnbGUge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyIGJ1dHRvbiB7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNtZWRpYS1jb250YWluZXIsICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIuZmFkZS1pbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyLmZhZGUtb3V0IHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDUxLCA0OSwgNDcsIDAuOSk7XFxuICBib3JkZXItcmFkaXVzOiAyJTtcXG4gIGJveC1zaGFkb3c6IDAuMnJlbSAwLjJyZW0gMXJlbSAwLjRyZW0gaW5zZXQgcmdiYSgzNywgMzMsIDMwLCAwLjg1KTtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiA5MCU7XFxuICBoZWlnaHQ6IDgwJTtcXG4gIG1hcmdpbi1sZWZ0OiA1JTtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJyZWFsdGltZUZpbHRlcnNBbmRTb3J0aW5nIHJlYWx0aW1lRmlsdGVyc0FuZFNvcnRpbmcgcmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZ1xcXCIgXFxcInNlYXJjaEZpbHRlcnMgc2VhcmNoRmlsdGVycyBzZWFyY2hGaWx0ZXJzXFxcIiBcXFwiLi4uIHJlc2V0QWxsIC4uLlxcXCI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lci5mYWRlLWluIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBmYWRlT3B0aW9uc0luIDAuNXMgZWFzZS1pbi1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZmFkZU9wdGlvbnNJbiAwLjVzIGVhc2UtaW4tb3V0O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIuZmFkZS1vdXQge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGZhZGVPcHRpb25zT3V0IDAuNXMgZWFzZS1pbi1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZmFkZU9wdGlvbnNPdXQgMC41cyBlYXNlLWluLW91dDtcXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGZhZGVPcHRpb25zSW4ge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZmFkZU9wdGlvbnNJbiB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGZhZGVPcHRpb25zT3V0IHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGZhZGVPcHRpb25zT3V0IHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBhZGRpbmctbGVmdDogMS41cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJyZWFsdGltZUZpbHRlcnNBbmRTb3J0aW5nIHJlYWx0aW1lRmlsdGVyc0FuZFNvcnRpbmcgcmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZ1xcXCIgXFxcInNlYXJjaEZpbHRlcnMgc2VhcmNoRmlsdGVycyBzZWFyY2hGaWx0ZXJzXFxcIiBcXFwiLi4uIHJlc2V0QWxsIC4uLlxcXCI7XFxuICAgIGJvcmRlcjogMC4ycmVtIHNvbGlkIHJnYmEoMjEyLCAxOTMsIDEzMCwgMC40KTtcXG4gICAgYm9yZGVyLWxlZnQ6IG5vbmU7XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyB7XFxuICBncmlkLWFyZWE6IHJlYWx0aW1lRmlsdGVyc0FuZFNvcnRpbmc7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImhlYWRpbmdSRlMgaGVhZGluZ1JGUyBoZWFkaW5nUkZTXFxcIiBcXFwib3JkZXJCeSB0b2dnbGVUeXBlIGZpbHRlckRhdGVcXFwiO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyB7XFxuICAgIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJoZWFkaW5nUkZTIGhlYWRpbmdSRlNcXFwiIFxcXCJvcmRlckJ5IHRvZ2dsZVR5cGVcXFwiIFxcXCJmaWx0ZXJEYXRlIGZpbHRlckRhdGVcXFwiO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgYnV0dG9uLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgbGFiZWwge1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBidXR0b24sICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBsYWJlbCB7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgYnV0dG9uLmluYWN0aXZlIHtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgYnV0dG9uLmluYWN0aXZlIHNwYW4ge1xcbiAgY29sb3I6IHJlZDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIGgyIHtcXG4gIGdyaWQtYXJlYTogaGVhZGluZ1JGUztcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nICNvcmRlci1ieSB7XFxuICBncmlkLWFyZWE6IG9yZGVyQnk7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyAjdG9nZ2xlLXR5cGUge1xcbiAgZ3JpZC1hcmVhOiB0b2dnbGVUeXBlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI2ZpbHRlci1kYXRlIHtcXG4gIGdyaWQtYXJlYTogZmlsdGVyRGF0ZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nICNmaWx0ZXItZGF0ZSBkaXYgdWwge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGdhcDogM3JlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIHVsIHtcXG4gIHBhZGRpbmctbGVmdDogMC4zcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgdWwgbGkge1xcbiAgbWFyZ2luLXRvcDogMC41cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIHtcXG4gIGdyaWQtYXJlYTogc2VhcmNoRmlsdGVycztcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwiaGVhZGluZ1NGIGhlYWRpbmdTRiBoZWFkaW5nU0ZcXFwiIFxcXCJuZXdzU2VhcmNoIG5ld3NTZWFyY2ggbmV3c1NlYXJjaFxcXCIgXFxcImNhc2VTZW5zaXRpdmUgZnVsbFdvcmRPbmx5IHdvcmRTdGFydE9ubHlcXFwiIFxcXCJpbmNsdWRlVGl0bGUgaW5jbHVkZURlc2NyaXB0aW9uIC4uLlxcXCI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgaDIge1xcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nU0Y7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgYnV0dG9uIHtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBidXR0b24ge1xcbiAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjbmV3cy1zZWFyY2gtY29udGFpbmVyIHtcXG4gIGdyaWQtYXJlYTogbmV3c1NlYXJjaDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjbmV3cy1zZWFyY2gtY29udGFpbmVyICNuZXdzLXNlYXJjaC5pbmFjdGl2ZSB7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG4gIGJhY2tncm91bmQtY29sb3I6IGdyYXk7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI2Z1bGwtd29yZC1vbmx5IHtcXG4gIGdyaWQtYXJlYTogZnVsbFdvcmRPbmx5O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICN3b3JkLXN0YXJ0LW9ubHkge1xcbiAgZ3JpZC1hcmVhOiB3b3JkU3RhcnRPbmx5O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNjYXNlLXNlbnNpdGl2ZSB7XFxuICBncmlkLWFyZWE6IGNhc2VTZW5zaXRpdmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI2luY2x1ZGUtdGl0bGUge1xcbiAgZ3JpZC1hcmVhOiBpbmNsdWRlVGl0bGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI2luY2x1ZGUtZGVzY3JpcHRpb24ge1xcbiAgZ3JpZC1hcmVhOiBpbmNsdWRlRGVzY3JpcHRpb247XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI3dvcmQtc3RhcnQtb25seS5pbmFjdGl2ZSwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBidXR0b24uaW5hY3RpdmUge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI3dvcmQtc3RhcnQtb25seS5pbmFjdGl2ZSBzcGFuLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIGJ1dHRvbi5pbmFjdGl2ZSBzcGFuIHtcXG4gIGNvbG9yOiByZWQ7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBidXR0b24sICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBzZWxlY3QsICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBsYWJlbCB7XFxuICBmb250LXNpemU6IDEuM3JlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGJ1dHRvbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIHNlbGVjdCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGxhYmVsIHtcXG4gICAgZm9udC1zaXplOiAxLjE1cmVtO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgbGFiZWwge1xcbiAgbWFyZ2luLXJpZ2h0OiAwLjVyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVzZXQtYWxsIHtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZ3JpZC1hcmVhOiByZXNldEFsbDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZXNldC1hbGwge1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZXNldC1hbGwuaW5hY3RpdmUge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICBjb2xvcjogcmVkO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgYnV0dG9uIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGgzIHtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGgzIHtcXG4gICAgZm9udC1zaXplOiAxLjdyZW07XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBoNCB7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIG1hcmdpbi1ib3R0b206IDAuOHJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIge1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiAxMCUgMWZyO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiA5MyUgMWZyO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcInRhbyBwaFxcXCIgXFxcInNuciBwaFxcXCI7XFxuICBib3JkZXI6IDAuMnJlbSBzb2xpZCByZ2IoMTgwLCAxNzQsIDE2NCk7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyIHtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiAxMCUgODQlIDYlO1xcbiAgICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwidGFvXFxcIiBcXFwic25yXFxcIiBcXFwicGhcXFwiO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zIHtcXG4gIGdyaWQtYXJlYTogdGFvO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogW21oXSA4MCUgW29zXSAxMCUgW2RzXSAxMCU7XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwibWggb3MgZHNcXFwiO1xcbiAgYm9yZGVyLWJvdHRvbTogMC4zcmVtIHNvbGlkIHJnYigxODUsIDE1OCwgMTIyKTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3RpdGxlQW5kT3B0aW9ucyB7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogW21oXSA5MCUgW2RzXSAxZnI7XFxuICAgIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJtaCBkc1xcXCI7XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICN0aXRsZUFuZE9wdGlvbnMgI21haW4taGVhZGVyIHtcXG4gIGdyaWQtYXJlYTogbWg7XFxuICBmb250LXNpemU6IDIuM3JlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICN0aXRsZUFuZE9wdGlvbnMgLm9wdGlvbnMtc3dpdGNoLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zICNkaXNtaXNzLXNlbGVjdGlvbiB7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGJvcmRlcjogMC4ycmVtIHNvbGlkIHJnYigyMTIsIDE5MywgMTMwKTtcXG4gIGJvcmRlci1ib3R0b206IG5vbmU7XFxuICBib3JkZXItdG9wOiBub25lO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zIC5vcHRpb25zLXN3aXRjaCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3RpdGxlQW5kT3B0aW9ucyAjZGlzbWlzcy1zZWxlY3Rpb24ge1xcbiAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3RpdGxlQW5kT3B0aW9ucyAub3B0aW9ucy1zd2l0Y2gge1xcbiAgZ3JpZC1hcmVhOiBvcztcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3RpdGxlQW5kT3B0aW9ucyAub3B0aW9ucy1zd2l0Y2gge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zICNkaXNtaXNzLXNlbGVjdGlvbiB7XFxuICBncmlkLWFyZWE6IGRzO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjdGl0bGVBbmRPcHRpb25zICNkaXNtaXNzLXNlbGVjdGlvbi5kaXNtaXNzZWQge1xcbiAgZmlsdGVyOiBjb250cmFzdCgyMCUpO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLXJlY2lldmVyIHtcXG4gIGdyaWQtYXJlYTogc25yO1xcbiAgbWFyZ2luLWJvdHRvbTogMC41cmVtO1xcbiAgcGFkZGluZy1yaWdodDogMnJlbTtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB7XFxuICBwYWRkaW5nLWxlZnQ6IDJyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lci5kaXNtaXNzZWQge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyB7XFxuICBmb250LXNpemU6IDEuNjVyZW07XFxuICBwYWRkaW5nLXRvcDogMDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3Mge1xcbiAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gIH1cXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3czo6YWZ0ZXIsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiIFxcXCI7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIGhlaWdodDogMXJlbTtcXG4gIGNsZWFyOiBib3RoO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzIGltZywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBpZnJhbWUsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzIGltZywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgaWZyYW1lIHtcXG4gIGZsb2F0OiBsZWZ0O1xcbiAgbWFyZ2luLXJpZ2h0OiAyJTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBwLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBwIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjZyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgcCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgcCB7XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjJyZW07XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgaWZyYW1lLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBpZnJhbWUge1xcbiAgd2lkdGg6IDE1MHB4O1xcbiAgaGVpZ2h0OiAxMDBweDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkge1xcbiAgbGlzdC1zdHlsZS10eXBlOiBjaXJjbGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnNlZS1tb3JlLWxpbmssICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAuc2VlLW1vcmUtbGluaywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSAuc2VlLW1vcmUtbGluay5kaXNtaXNzZWQsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLmRpc21pc3NlZCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnNlZS1tb3JlLWxpbmsuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAucmVsYXRpb25zaGlwLWxpbmsuZGlzbWlzc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciB7XFxuICBwYWRkaW5nLXRvcDogMXJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIge1xcbiAgZ3JpZC1hcmVhOiBwaDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgYm9yZGVyLWxlZnQ6IDAuMnJlbSBzb2xpZCByZ2JhKDIxMiwgMTkzLCAxMzAsIDAuNCk7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyLmRpc21pc3NlZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyB7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgZm9udC1zaXplOiAxLjlyZW07XFxuICBtYXJnaW4tbGVmdDogMC41cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyBhLmhpZGRlbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIgLmNvbnRlbnQtcGFnZXMgYS5zZWxlY3RlZFBhZ2Uge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEuaGlkZGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxufVxcblxcbiNtb2JpbGUtdHlwaW5nLWNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI0LCAyMywgMjMsIDAuOSk7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogMDtcXG59XFxuI21vYmlsZS10eXBpbmctY29udGFpbmVyIGRpdiB7XFxuICB3aWR0aDogNTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogNXJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIC1tb3otY29sdW1uLWdhcDogMXJlbTtcXG4gICAgICAgY29sdW1uLWdhcDogMXJlbTtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbiNtb2JpbGUtdHlwaW5nLWNvbnRhaW5lciBkaXYgYnV0dG9uLCAjbW9iaWxlLXR5cGluZy1jb250YWluZXIgZGl2IGxhYmVsIHtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbn1cXG4jbW9iaWxlLXR5cGluZy1jb250YWluZXIgZGl2IGJ1dHRvbiB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG5cXG4jbW9iaWxlLXR5cGluZy1jb250YWluZXIub3BlbmVkIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcblxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5vcHRpb25zLXN3aXRjaCB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxufVxcblxcbi5uZXdzLXNlYXJjaC1maWVsZCB7XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG4gIGhlaWdodDogMi44cmVtO1xcbiAgd2lkdGg6IDI2cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAubmV3cy1zZWFyY2gtZmllbGQge1xcbiAgICBmb250LXNpemU6IDEuMTVyZW07XFxuICAgIGhlaWdodDogMi4zcmVtO1xcbiAgICB3aWR0aDogMThyZW07XFxuICB9XFxufVxcblxcbiNtZWRpYS1yZWNpZXZlciB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMCwgMTAsIDEwLCAwLjgpO1xcbiAgdG9wOiA3JTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiA5NSU7XFxuICB6LWluZGV4OiAxO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEge1xcbiAgbWFyZ2luLWxlZnQ6IDZyZW07XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDZyZW07XFxuICB3aWR0aDogNDByZW07XFxuICBoZWlnaHQ6IDIzLjVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSB7XFxuICAgIHRvcDogNHJlbTtcXG4gICAgbWFyZ2luLWxlZnQ6IDhyZW07XFxuICAgIHdpZHRoOiA2NHJlbTtcXG4gICAgaGVpZ2h0OiAzNnJlbTtcXG4gIH1cXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhIGlmcmFtZSwgI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhIGltZyB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgI3BsYXktYnV0dG9uLWNvbnRhaW5lciAjcGxheS1idXR0b24ge1xcbiAgaGVpZ2h0OiA2cmVtO1xcbiAgd2lkdGg6IDlyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDk5LCAxMDAsIDE3OSwgMC44KTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvcmRlci1yYWRpdXM6IDM1JTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIgI3BsYXktYnV0dG9uIGRpdiB7XFxuICBib3JkZXItbGVmdDogM3JlbSBzb2xpZCByZ2IoMTI1LCAxNTAsIDE2OCk7XFxuICBib3JkZXItdG9wOiAxLjdyZW0gc29saWQgdHJhbnNwYXJlbnQ7XFxuICBib3JkZXItYm90dG9tOiAxLjdyZW0gc29saWQgdHJhbnNwYXJlbnQ7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSAjcGxheS1idXR0b24tY29udGFpbmVyICNwbGF5LWJ1dHRvbjpob3ZlciB7XFxuICBvcGFjaXR5OiAwLjc7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYS5jZW50ZXItZGlzcGxheSB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBoZWlnaHQ6IDgyJTtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgcmlnaHQ6IDJyZW07XFxuICB0b3A6IDNyZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtbWVudSB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtbWVudSBhIHtcXG4gIGNvbG9yOiBhenVyZTtcXG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLW1lbnUgYS5hY3RpdmUge1xcbiAgZmlsdGVyOiBjb250cmFzdCg0OCUpO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIHtcXG4gIHdpZHRoOiA3NSU7XFxuICBtYXgtd2lkdGg6IDM4MHB4O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBvdmVyZmxvdzogYXV0bztcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS10aHVtYiB7XFxuICB3aWR0aDogNDUlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS10aHVtYi5zZWxlY3RlZCB7XFxuICBmaWx0ZXI6IGNvbnRyYXN0KDQ4JSk7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiAubWVkaWEtaW5mb3JtYXRpb24ge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBtYXJnaW4tbGVmdDogMXJlbTtcXG4gIHdpZHRoOiA1NSU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24gLm1lZGlhLWluZm9ybWF0aW9uIHAge1xcbiAgbWFyZ2luOiAwO1xcbiAgY29sb3I6IGJlaWdlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS1pbmZvcm1hdGlvbiBwOm50aC1vZi10eXBlKDIpIHtcXG4gIG1hcmdpbi10b3A6IDFyZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtcGFnaW5hdGlvbiB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBjb2xvcjogYWxpY2VibHVlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLXBhZ2luYXRpb24gYSB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIG1hcmdpbi1sZWZ0OiAxcmVtO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLWNsb3NlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGxlZnQ6IDEuNXJlbTtcXG4gIHRvcDogMS41cmVtO1xcbiAgZm9udC1zaXplOiAzLjVyZW07XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNtZWRpYS1yZWNpZXZlciAjbWVkaWEtY2xvc2Uge1xcbiAgICBsZWZ0OiAzLjVyZW07XFxuICAgIHRvcDogMy41cmVtO1xcbiAgICBmb250LXNpemU6IDMuNXJlbTtcXG4gIH1cXG59XFxuXFxuLm1lZGlhLWNhcmQ6aG92ZXIgaW1nLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBpbWcge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDUwJSk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbi5tZWRpYS1jYXJkOmhvdmVyIGgzLCAubWVkaWEtY2FyZDpob3ZlciBwLCAubWVkaWEtY2FyZDpob3ZlciBidXR0b24sIC5wcm9wZXJ0eS1tZWRpYS1jYXJkOmhvdmVyIGgzLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBwLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBidXR0b24ge1xcbiAgZmlsdGVyOiBjb250cmFzdCg0MCUpO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubG9hZGVyIHtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB0b3A6IC05OTk5cHg7XFxuICB3aWR0aDogMDtcXG4gIGhlaWdodDogMDtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICB6LWluZGV4OiA5OTk5OTk7XFxufVxcblxcbi5sb2FkZXI6YWZ0ZXIsIC5sb2FkZXI6YmVmb3JlIHtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4ubG9hZGVyLmlzLWFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuODUpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiAwO1xcbn1cXG5cXG4ubG9hZGVyLmlzLWFjdGl2ZTphZnRlciwgLmxvYWRlci5pcy1hY3RpdmU6YmVmb3JlIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgcm90YXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzU5ZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyByb3RhdGlvbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDApO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGJsaW5rIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgfVxcbiAgdG8ge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG4ubG9hZGVyW2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IDUwJTtcXG4gIGNvbG9yOiBjdXJyZW50Q29sb3I7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZm9udC1zaXplOiAxNHB4O1xcbn1cXG5cXG4ubG9hZGVyW2RhdGEtdGV4dD1cXFwiXFxcIl06YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJMb2FkaW5nXFxcIjtcXG59XFxuXFxuLmxvYWRlcltkYXRhLXRleHRdOm5vdChbZGF0YS10ZXh0PVxcXCJcXFwiXSk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IGF0dHIoZGF0YS10ZXh0KTtcXG59XFxuXFxuLmxvYWRlcltkYXRhLXRleHRdW2RhdGEtYmxpbmtdOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogYmxpbmsgMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBibGluayAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHRbZGF0YS10ZXh0XTpiZWZvcmUge1xcbiAgdG9wOiBjYWxjKDUwJSAtIDYzcHgpO1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHQ6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogNDhweDtcXG4gIGhlaWdodDogNDhweDtcXG4gIGJvcmRlcjogOHB4IHNvbGlkICNmZmY7XFxuICBib3JkZXItbGVmdC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB0b3A6IGNhbGMoNTAlIC0gMjRweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDI0cHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHJvdGF0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItZGVmYXVsdFtkYXRhLWhhbGZdOmFmdGVyIHtcXG4gIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxufVxcblxcbi5sb2FkZXItZGVmYXVsdFtkYXRhLWludmVyc2VdOmFmdGVyIHtcXG4gIGFuaW1hdGlvbi1kaXJlY3Rpb246IHJldmVyc2U7XFxufVxcblxcbi5sb2FkZXItZG91YmxlOmFmdGVyLCAubG9hZGVyLWRvdWJsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBib3JkZXI6IDhweCBzb2xpZDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogcm90YXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG4ubG9hZGVyLWRvdWJsZTphZnRlciB7XFxuICB3aWR0aDogNDhweDtcXG4gIGhlaWdodDogNDhweDtcXG4gIGJvcmRlci1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1sZWZ0LWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIHRvcDogY2FsYyg1MCUgLSAyNHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMjRweCk7XFxufVxcblxcbi5sb2FkZXItZG91YmxlOmJlZm9yZSB7XFxuICB3aWR0aDogNjRweDtcXG4gIGhlaWdodDogNjRweDtcXG4gIGJvcmRlci1jb2xvcjogI2ViOTc0ZTtcXG4gIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kdXJhdGlvbjogMnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kdXJhdGlvbjogMnM7XFxuICB0b3A6IGNhbGMoNTAlIC0gMzJweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDMycHgpO1xcbn1cXG5cXG4ubG9hZGVyLWJhcltkYXRhLXRleHRdOmJlZm9yZSB7XFxuICB0b3A6IGNhbGMoNTAlIC0gNDBweCk7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLmxvYWRlci1iYXI6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAyMDBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KC00NWRlZywgIzQxODNkNyAyNSUsICM1MmIzZDkgMCwgIzUyYjNkOSA1MCUsICM0MTgzZDcgMCwgIzQxODNkNyA3NSUsICM1MmIzZDkgMCwgIzUyYjNkOSk7XFxuICBiYWNrZ3JvdW5kLXNpemU6IDIwcHggMjBweDtcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgMTBweCAwIGhzbGEoMCwgMCUsIDEwMCUsIDAuMiksIDAgMCAwIDVweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICBhbmltYXRpb246IG1vdmVCYXIgMS41cyBsaW5lYXIgaW5maW5pdGUgcmV2ZXJzZTtcXG59XFxuXFxuLmxvYWRlci1iYXJbZGF0YS1yb3VuZGVkXTphZnRlciB7XFxuICBib3JkZXItcmFkaXVzOiAxNXB4O1xcbn1cXG5cXG4ubG9hZGVyLWJhcltkYXRhLWludmVyc2VdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRpcmVjdGlvbjogbm9ybWFsO1xcbiAgICAgICAgICBhbmltYXRpb24tZGlyZWN0aW9uOiBub3JtYWw7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMHB4IDIwcHg7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbW92ZUJhciB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMjBweCAyMHB4O1xcbiAgfVxcbn1cXG4ubG9hZGVyLWJhci1waW5nLXBvbmc6YmVmb3JlIHtcXG4gIHdpZHRoOiAyMDBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZzphZnRlciwgLmxvYWRlci1iYXItcGluZy1wb25nOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGhlaWdodDogMjBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogY2FsYyg1MCUgLSAxMHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbn1cXG5cXG4ubG9hZGVyLWJhci1waW5nLXBvbmc6YWZ0ZXIge1xcbiAgd2lkdGg6IDUwcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjE5O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjVzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nIDAuNXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuLmxvYWRlci1iYXItcGluZy1wb25nW2RhdGEtcm91bmRlZF06YmVmb3JlIHtcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZ1tkYXRhLXJvdW5kZWRdOmFmdGVyIHtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb24tbmFtZTogbW92ZUJhclBpbmdQb25nUm91bmRlZDtcXG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IG1vdmVCYXJQaW5nUG9uZ1JvdW5kZWQ7XFxufVxcblxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgLSAxMDBweCk7XFxuICB9XFxuICB0byB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgNTBweCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdSb3VuZGVkIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgLSAxMDBweCk7XFxuICB9XFxuICB0byB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgODBweCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nUm91bmRlZCB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDgwcHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY29ybmVycyB7XFxuICA2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICB9XFxuICAyNSUge1xcbiAgICB3aWR0aDogMTVweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgdG9wOiAwO1xcbiAgfVxcbiAgMzElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gIH1cXG4gIDU2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHRvcDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA4MSUge1xcbiAgICBoZWlnaHQ6IDYwcHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY29ybmVycyB7XFxuICA2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICB9XFxuICAyNSUge1xcbiAgICB3aWR0aDogMTVweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgdG9wOiAwO1xcbiAgfVxcbiAgMzElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gIH1cXG4gIDU2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHRvcDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA4MSUge1xcbiAgICBoZWlnaHQ6IDYwcHg7XFxuICB9XFxufVxcbi5sb2FkZXItYm9yZGVyW2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4ubG9hZGVyLWJvcmRlcjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTVweDtcXG4gIGhlaWdodDogMTVweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29ybmVycyAzcyBlYXNlIGJvdGggaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29ybmVycyAzcyBlYXNlIGJvdGggaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItYmFsbDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAtMjVweCAwIDAgLTI1cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBraWNrQmFsbCAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1pbiBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGtpY2tCYWxsIDFzIGluZmluaXRlIGFsdGVybmF0ZSBlYXNlLWluIGJvdGg7XFxufVxcblxcbi5sb2FkZXItYmFsbFtkYXRhLXNoYWRvd106YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IGluc2V0IC01cHggLTVweCAxMHB4IDAgcmdiYSgwLCAwLCAwLCAwLjUpO1xcbn1cXG5cXG4ubG9hZGVyLWJhbGw6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMyk7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogNDVweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRvcDogY2FsYyg1MCUgKyAxMHB4KTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogMCAwIDAgLTIyLjVweDtcXG4gIHotaW5kZXg6IDA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogc2hhZG93IDFzIGluZmluaXRlIGFsdGVybmF0ZSBlYXNlLW91dCBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IHNoYWRvdyAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1vdXQgYm90aDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIHNoYWRvdyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMCk7XFxuICB9XFxuICA5NSUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIHNoYWRvdyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMCk7XFxuICB9XFxuICA5NSUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMga2lja0JhbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTgwcHgpIHNjYWxlWCgwLjk1KTtcXG4gIH1cXG4gIDkwJSB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApIHNjYWxlWCgxKTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlIDUwJSAyMCUgMjAlO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGtpY2tCYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC04MHB4KSBzY2FsZVgoMC45NSk7XFxuICB9XFxuICA5MCUge1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKSBzY2FsZVgoMSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJSA1MCUgMjAlIDIwJTtcXG4gIH1cXG59XFxuLmxvYWRlci1zbWFydHBob25lOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEycHg7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAxMjBweDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGxlZnQ6IDUwJTtcXG4gIHRvcDogNTAlO1xcbiAgd2lkdGg6IDcwcHg7XFxuICBoZWlnaHQ6IDEzMHB4O1xcbiAgbWFyZ2luOiAtNjVweCAwIDAgLTM1cHg7XFxuICBib3JkZXI6IDVweCBzb2xpZCAjZmQwO1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgNXB4IDAgMCAjZmQwO1xcbiAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCA1MCUgOTAlLCByZ2JhKDAsIDAsIDAsIDAuNSkgNnB4LCB0cmFuc3BhcmVudCAwKSwgbGluZWFyLWdyYWRpZW50KDBkZWcsICNmZDAgMjJweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgwZGVnLCByZ2JhKDAsIDAsIDAsIDAuNSkgMjJweCwgcmdiYSgwLCAwLCAwLCAwLjUpKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBzaGFrZSAycyBjdWJpYy1iZXppZXIoMC4zNiwgMC4wNywgMC4xOSwgMC45NykgYm90aCBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBzaGFrZSAycyBjdWJpYy1iZXppZXIoMC4zNiwgMC4wNywgMC4xOSwgMC45NykgYm90aCBpbmZpbml0ZTtcXG59XFxuXFxuLmxvYWRlci1zbWFydHBob25lW2RhdGEtc2NyZWVuPVxcXCJcXFwiXTphZnRlciB7XFxuICBjb250ZW50OiBcXFwiTG9hZGluZ1xcXCI7XFxufVxcblxcbi5sb2FkZXItc21hcnRwaG9uZTpub3QoW2RhdGEtc2NyZWVuPVxcXCJcXFwiXSk6YWZ0ZXIge1xcbiAgY29udGVudDogYXR0cihkYXRhLXNjcmVlbik7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBzaGFrZSB7XFxuICA1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAxMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDM1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICA0MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBzaGFrZSB7XFxuICA1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAxMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDM1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICA0MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG59XFxuLmxvYWRlci1jbG9jazpiZWZvcmUge1xcbiAgd2lkdGg6IDEyMHB4O1xcbiAgaGVpZ2h0OiAxMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIG1hcmdpbjogLTYwcHggMCAwIC02MHB4O1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgdHJhbnNwYXJlbnQgNTAlLCAjZjVmNWY1IDApLCBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHRyYW5zcGFyZW50IDU1cHgsICMyZWNjNzEgMCwgIzJlY2M3MSA2NXB4LCB0cmFuc3BhcmVudCAwKSwgbGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2Y1ZjVmNSA1MCUsICNmNWY1ZjUgMCk7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDAgMCAxMHB4ICNmNWY1ZjUsIDAgMCAwIDVweCAjNTU1LCAwIDAgMCAxMHB4ICM3YjdiN2I7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogcm90YXRpb24gaW5maW5pdGUgMnMgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDJzIGxpbmVhcjtcXG59XFxuXFxuLmxvYWRlci1jbG9jazphZnRlciwgLmxvYWRlci1jbG9jazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBsZWZ0OiA1MCU7XFxuICB0b3A6IDUwJTtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbi5sb2FkZXItY2xvY2s6YWZ0ZXIge1xcbiAgd2lkdGg6IDYwcHg7XFxuICBoZWlnaHQ6IDQwcHg7XFxuICBtYXJnaW46IC0yMHB4IDAgMCAtMTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDIwcHggMCAwIDIwcHg7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDE0cHggMjBweCwgIzI1YTI1YSAxMHB4LCB0cmFuc3BhcmVudCAwKSwgcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAxNHB4IDIwcHgsICMxYjc5NDMgMTRweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHRyYW5zcGFyZW50IDE1cHgsICMyZWNjNzEgMCwgIzJlY2M3MSAyNXB4LCB0cmFuc3BhcmVudCAwKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiBpbmZpbml0ZSAyNHMgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDI0cyBsaW5lYXI7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAxNXB4IGNlbnRlcjtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluOmFmdGVyLCAubG9hZGVyLWN1cnRhaW46YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdG9wOiA1MCU7XFxuICBtYXJnaW4tdG9wOiAtMzVweDtcXG4gIGZvbnQtc2l6ZTogNzBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGxpbmUtaGVpZ2h0OiAxLjI7XFxuICBjb250ZW50OiBcXFwiTG9hZGluZ1xcXCI7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbjpiZWZvcmUge1xcbiAgY29sb3I6ICM2NjY7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbjphZnRlciB7XFxuICBjb2xvcjogI2ZmZjtcXG4gIGhlaWdodDogMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtY3VydGFpbi10ZXh0XTpub3QoW2RhdGEtY3VydGFpbi10ZXh0PVxcXCJcXFwiXSk6YWZ0ZXIsIC5sb2FkZXItY3VydGFpbltkYXRhLWN1cnRhaW4tdGV4dF06bm90KFtkYXRhLWN1cnRhaW4tdGV4dD1cXFwiXFxcIl0pOmJlZm9yZSB7XFxuICBjb250ZW50OiBhdHRyKGRhdGEtY3VydGFpbi10ZXh0KTtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtYnJhemlsaWFuXTpiZWZvcmUge1xcbiAgY29sb3I6ICNmMWM0MGY7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWJyYXppbGlhbl06YWZ0ZXIge1xcbiAgY29sb3I6ICMyZWNjNzE7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWNvbG9yZnVsXTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1hc2tDb2xvcmZ1bCAycyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbWFza0NvbG9yZnVsIDJzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtY29sb3JmdWxdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aCwgbWFza0NvbG9yZnVsLWZyb250IDJzIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aCwgbWFza0NvbG9yZnVsLWZyb250IDJzIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gIGNvbG9yOiAjMDAwO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbWFza0NvbG9yZnVsIHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMzNDk4ZGI7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2U3NGMzYztcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbWFza0NvbG9yZnVsIHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMzNDk4ZGI7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2U3NGMzYztcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtYXNrQ29sb3JmdWwtZnJvbnQge1xcbiAgMCUge1xcbiAgICBjb2xvcjogIzJlY2M3MTtcXG4gIH1cXG4gIDQ5LjUlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA1MC41JSB7XFxuICAgIGNvbG9yOiAjZjFjNDBmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtYXNrQ29sb3JmdWwtZnJvbnQge1xcbiAgMCUge1xcbiAgICBjb2xvcjogIzJlY2M3MTtcXG4gIH1cXG4gIDQ5LjUlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA1MC41JSB7XFxuICAgIGNvbG9yOiAjZjFjNDBmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGN1cnRhaW4ge1xcbiAgMCUge1xcbiAgICBoZWlnaHQ6IDA7XFxuICB9XFxuICB0byB7XFxuICAgIGhlaWdodDogODRweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBjdXJ0YWluIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBoZWlnaHQ6IDg0cHg7XFxuICB9XFxufVxcbi5sb2FkZXItbXVzaWM6YWZ0ZXIsIC5sb2FkZXItbXVzaWM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgd2lkdGg6IDI0MHB4O1xcbiAgaGVpZ2h0OiAyNDBweDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAtMTIwcHggMCAwIC0xMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAyNDBweDtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiA0MHB4O1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICB0ZXh0LXNoYWRvdzogMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gIGxldHRlci1zcGFjaW5nOiAtMXB4O1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljOmFmdGVyIHtcXG4gIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICAgICAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1oZXktb2hdOmFmdGVyLCAubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogMCAwIDAgMTBweDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLWhleS1vaF06YmVmb3JlIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBjb2xvcjogIzAwMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgb2ggNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIG9oIDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTphZnRlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIGhleSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBoZXkgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1uby1jcnldOmFmdGVyLCAubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTpiZWZvcmUge1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjMDA5YjNhIDUwJSwgI2ZlZDEwMCA1MSUpO1xcbiAgYm94LXNoYWRvdzogMCAwIDAgMTBweCAjMDAwO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCBjcnkgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIGNyeSA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLW5vLWNyeV06YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIG5vIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIG5vIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtd2UtYXJlXTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCB0aGVXb3JsZCA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgdGhlV29ybGQgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSBhdCBjZW50ZXIsICM0ZWNkYzQgMCwgIzU1NjI3MCk7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS13ZS1hcmVdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZUFyZSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZUFyZSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChlbGxpcHNlIGF0IGNlbnRlciwgIzI2ZDBjZSAwLCAjMWEyOTgwKTtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXJvY2steW91XTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCByb2NrWW91IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCByb2NrWW91IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgYmFja2dyb3VuZDogIzQ0NDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXJvY2steW91XTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgd2VXaWxsIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIHdlV2lsbCA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6ICM5NjI4MWI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBjb2luIHtcXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDM1OWRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgY29pbiB7XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY29pbkJhY2sge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxdHVybik7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGNvaW5CYWNrIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMXR1cm4pO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGhleSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJMZXQncyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiSGV5IVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgaGV5IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIkhleSFcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIkxldCdzIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG9oIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiR28hXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgb2gge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiT2ghXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJHbyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiT2ghXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG5vIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJub1xcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJOby4uLlxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm8ge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiTm8uLi5cXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIm5vXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGNyeSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiY3J5IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY3J5IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIndvbWFuXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJjcnkhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndvbWFuXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHdlQXJlIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwid2UgYXJlXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgd2VBcmUge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2UgYXJlXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSBhcmVcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiV2UgYXJlXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHRoZVdvcmxkIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSB3b3JsZCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSBjaGlsZHJlbiFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgdGhlV29ybGQge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwidGhlIGNoaWxkcmVuIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgd29ybGQsXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHdlV2lsbCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwicm9jayB5b3UhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIHdpbGwsXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyB3ZVdpbGwge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2Ugd2lsbCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInJvY2sgeW91IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyByb2NrWW91IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIvCfpJhcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwid2Ugd2lsbFxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgcm9ja1lvdSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSB3aWxsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn6SYXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbn1cXG4ubG9hZGVyLXBva2ViYWxsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiAxMDBweDtcXG4gIGhlaWdodDogMTAwcHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTUwcHggMCAwIC01MHB4O1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmVkIDQyJSwgIzAwMCAwLCAjMDAwIDU4JSwgI2ZmZiAwKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlUG9rZWJhbGwgMXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLXBva2ViYWxsOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDI0cHg7XFxuICBoZWlnaHQ6IDI0cHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTEycHggMCAwIC0xMnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHotaW5kZXg6IDI7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoLCBmbGFzaFBva2ViYWxsIDAuNXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVQb2tlYmFsbCAxcyBsaW5lYXIgaW5maW5pdGUgYm90aCwgZmxhc2hQb2tlYmFsbCAwLjVzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gIGJvcmRlcjogMnB4IHNvbGlkICMwMDA7XFxuICBib3gtc2hhZG93OiAwIDAgMCA1cHggI2ZmZiwgMCAwIDAgMTBweCAjMDAwO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZVBva2ViYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApIHJvdGF0ZSgwKTtcXG4gIH1cXG4gIDE1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRleCgtMTBweCkgcm90YXRlKC01ZGVnKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMHB4KSByb3RhdGUoNWRlZyk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoMCkgcm90YXRlKDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1vdmVQb2tlYmFsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKSByb3RhdGUoMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoLTEwcHgpIHJvdGF0ZSgtNWRlZyk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTBweCkgcm90YXRlKDVkZWcpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGV4KDApIHJvdGF0ZSgwKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGZsYXNoUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmQwO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGZsYXNoUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmQwO1xcbiAgfVxcbn1cXG4ubG9hZGVyLWJvdW5jaW5nOmFmdGVyLCAubG9hZGVyLWJvdW5jaW5nOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDEwcHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAxMHB4KTtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjoga2ljayAwLjZzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWJvdW5jaW5nOmFmdGVyIHtcXG4gIG1hcmdpbi1sZWZ0OiAtMzBweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGtpY2sgMC42cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbi5sb2FkZXItYm91bmNpbmc6YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBraWNrIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBvcGFjaXR5OiAwLjM7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXJlbSk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMga2ljayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgb3BhY2l0eTogMC4zO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFyZW0pO1xcbiAgfVxcbn1cXG4uc2JsLWNpcmMtcmlwcGxlIHtcXG4gIGhlaWdodDogNDhweDtcXG4gIHdpZHRoOiA0OHB4O1xcbiAgY29sb3I6ICM0ODY1OWI7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICB0b3A6IDIwJTtcXG4gIGxlZnQ6IDQwJTtcXG59XFxuXFxuLnNibC1jaXJjLXJpcHBsZTo6YWZ0ZXIsIC5zYmwtY2lyYy1yaXBwbGU6OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGhlaWdodDogMDtcXG4gIHdpZHRoOiAwO1xcbiAgYm9yZGVyOiBpbmhlcml0O1xcbiAgYm9yZGVyOiA1cHggc29saWQ7XFxuICBib3JkZXItcmFkaXVzOiBpbmhlcml0O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgbGVmdDogNDAlO1xcbiAgdG9wOiA0MCU7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY2lyY2xlLXJpcHBsZSAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY2lyY2xlLXJpcHBsZSAxcyBsaW5lYXIgaW5maW5pdGU7XFxufVxcblxcbi5zYmwtY2lyYy1yaXBwbGU6OmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTAuNnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuNnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBjaXJjbGUtcmlwcGxlIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgICB3aWR0aDogMDtcXG4gICAgbGVmdDogMS42cmVtO1xcbiAgICB0b3A6IDEuNnJlbTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBsZWZ0OiAtMXJlbTtcXG4gICAgdG9wOiAtMXJlbTtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBjaXJjbGUtcmlwcGxlIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgICB3aWR0aDogMDtcXG4gICAgbGVmdDogMS42cmVtO1xcbiAgICB0b3A6IDEuNnJlbTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBsZWZ0OiAtMXJlbTtcXG4gICAgdG9wOiAtMXJlbTtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59LyojIHNvdXJjZU1hcHBpbmdVUkw9c3R5bGUuY3NzLm1hcCAqL1wiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL2Nzcy9zdHlsZS5jc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9iYXNlL19jdXN0b21CYXNlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9iYXNlL19taXhpbnMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX2Zvb3Rlci5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fb3BlbmluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fcHJvcGVydGllcy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fc2luZ2xlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19jb25zdGFudC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fc2VhcmNoLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19sb2FkZXIuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX2FsbC1uZXdzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19zaGFkb3ctYm94LnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3dubG9hZHMvY3NzLWxvYWRlci5jc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3dubG9hZHMvc2JsLWNpcmMtcmlwcGxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSxnQkFBZ0I7QUNFaEI7RUFDSSxrQkFBQTtFQUVBLFNBQUE7QURESjtBRUdJO0VETEo7SUFjUSxjQUFBO0VEUk47QUFDRjtBRUlJO0VEWEo7SUFpQlEsaUJBQUE7RUROTjtBQUNGO0FDUUk7RUFDSSxnQkFBQTtBRE5SOztBQ1VBO0VBQ0ksU0FBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtBRFBKOztBQ1VBO0VBQ0ksU0FBQTtFQUNBLG1CQUFBO0VBQ0EsZUFBQTtBRFBKOztBQ1VBO0VBQ0ksaUJBQUE7RUFJQSxTQUFBO0FEVko7QUVyQkk7RUQwQko7SUFHUSxrQkFBQTtFREpOO0FBQ0Y7QUNNSTtFQUNJLGlCQUFBO0FESlI7O0FD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QUNBLGNBQUE7RUFDQSxrQkFBQTtFQUNBLGtCQUFBO0VBQ0EscUJBQUE7RUFDQSxRQUFBO0VBQ0EsU0FBQTtBYmk3RUY7O0FhLzZFRTtFQUNFLFdBQUE7RUFDQSxTQUFBO0VBQ0EsUUFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLHNCQUFBO0VBQ0Esa0JBQUE7RUFDQSxTQUFBO0VBQ0EsUUFBQTtFQUNBLG1EQUFBO1VBQUEsMkNBQUE7QWJrN0VKOztBYWo3RUU7RUFDRSw4QkFBQTtVQUFBLHNCQUFBO0FibzdFSjs7QWFsN0VBO0VBQ0U7SUFDRSxTQUFBO0lBQ0EsUUFBQTtJQUNBLFlBQUE7SUFDQSxXQUFBO0VicTdFRjtFYW43RUE7SUFDRSxZQUFBO0lBQ0EsV0FBQTtJQUNBLFdBQUE7SUFDQSxVQUFBO0lBQ0EsVUFBQTtFYnE3RUY7QUFDRjs7QWFsOEVBO0VBQ0U7SUFDRSxTQUFBO0lBQ0EsUUFBQTtJQUNBLFlBQUE7SUFDQSxXQUFBO0VicTdFRjtFYW43RUE7SUFDRSxZQUFBO0lBQ0EsV0FBQTtJQUNBLFdBQUE7SUFDQSxVQUFBO0lBQ0EsVUFBQTtFYnE3RUY7QUFDRixDQUFBLG9DQUFBXCIsXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2RvdHMuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9kb3RzLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcblxuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG5cbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuXG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB1cGRhdGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuXG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuXG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuXG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuXG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTsgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuXG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuXG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG5cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuXG4gIGNzcyArPSBvYmouY3NzO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfSAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG5cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCIvL0NvbnRpbnVlIHRvIHdvcmsgb24gbWFraW5nIHRoaXMgbW9yZSBlZmZpY2llbnQgYW5kIHJlYWRhYmxlXHJcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIlxyXG5pbXBvcnQgU2hhZG93Qm94IGZyb20gJy4vc2hhZG93Qm94JztcclxuY2xhc3MgTmV3cyB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIC8vIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jbG9zZScpO1xyXG4gICAgaWYoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FsbC1uZXdzLWNvbnRhaW5lcicpKXtcclxuICAgICAgICB0aGlzLnZpZXdQb3J0SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XHJcbiAgICAgICAgdGhpcy5yZXR1cm5Ib21lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3JldHVybi1ob21lJyk7XHJcbiAgICAgICAgICAgICAgICAgLy9MYXRlciwgZmluZCB3YXkgdG8gbWFrZSB0aGlzIG5vdCBjYXVzZSBlcnJvcnMgb24gb3RoZXIgcGFnZXNcclxuICAgICAgICB0aGlzLm1haW5Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYWxsLW5ld3MtY29udGFpbmVyJyk7XHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbi1kaXNwbGF5Jyk7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BhZ2luYXRpb24taG9sZGVyJylcclxuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcExpbmtzO1xyXG4gICAgICAgIHRoaXMuc2VlTW9yZTtcclxuICAgICAgICB0aGlzLmFsbE9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyJylcclxuICAgICAgICB0aGlzLm9wdGlvbnNCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcub3B0aW9ucy1zd2l0Y2gnKTtcclxuICAgICAgICB0aGlzLmFsbE9wdGlvbnNWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Rpc21pc3Mtc2VsZWN0aW9uJyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxUaXRsZSA9IFwiQWxsIE5ld3NcIjtcclxuICAgICAgICB0aGlzLnN0b3JlZFRpdGxlO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250ZW50ID0gW107XHJcbiAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4dGVybmFsQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENhbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm9yaWdpbjtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm1haW5IZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbi1oZWFkZXInKTtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXdzLXNlYXJjaFwiKVxyXG4gICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gJyc7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2VcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMudHlwaW5nVGltZXI7XHJcblxyXG4gICAgICAgIHRoaXMubmV3c1NlYXJjaENsb25lQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21vYmlsZS10eXBpbmctY29udGFpbmVyJyk7XHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoQ2xvbmUgPSB0aGlzLm5ld3NTZWFyY2hDbG9uZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xyXG4gICAgICAgIHRoaXMuY2xvc2VOZXdzU2VhcmNoQ2xvbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2xvc2UtbW9iaWxlLW5ld3Mtc2VhcmNoJyk7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFJlcG9ydDsgICAgICBcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Z1bGwtZGlzcGxheS1jb250YWluZXInKTsgICAgXHJcbiAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnJlc2V0QWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0LWFsbCcpO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG9nZ2xlLW9wdGlvbnMnKTtcclxuXHJcbiAgICAgICAgLy9BZnRlciBnZXQgZXZlcnl0aGluZyB3b3JraW5nLCBwdXQgdGhlIHNldHRpbmcgaW4gaGVyZSwgcmFyZXIgdGhhbiBqdXN0IGEgcmVmXHJcbiAgICAgICAgLy9udm0uIE5lZWQgdG8gZG8gaXQgbm93XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5yZW9yZGVyQnlEYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI29yZGVyLWJ5LWRhdGUnKTtcclxuICAgICAgICB0aGlzLnJlb3JkZXJCeUFscGhhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI29yZGVyLWJ5LWFscGhhJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZnVsbFdvcmRTd2l0Y2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZnVsbC13b3JkLW9ubHknKTtcclxuXHJcbiAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd29yZC1zdGFydC1vbmx5Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZVN3aXRjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXNlLXNlbnNpdGl2ZScpO1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVUaXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLXRpdGxlJyk7XHJcbiAgICAgICAgdGhpcy5pbmNsdWRlRGVzY3JpcHRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1kZXNjcmlwdGlvbicpO1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVQcm9wZXJ0eVVwZGF0ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1wcm9wZXJ0eS11cGRhdGVzJyk7XHJcbiAgICAgICAgdGhpcy5pbmNsdWRlR2VuZXJhbE5ld3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1nZW5lcmFsLW5ld3MnKTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnYWJsZVNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBkYXRlT3JkZXI6e1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnb3JkZXItYnktZGF0ZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdkZXNjJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWxwaGFPcmRlcjp7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdvcmRlci1ieS1hbHBoYScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdkZXNjJyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGluY2x1ZGVUaXRsZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS10aXRsZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5jbHVkZURlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdpbmNsdWRlLWRlc2NyaXB0aW9uJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1cGRhdGU6IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ2luY2x1ZGUtcHJvcGVydHktdXBkYXRlcycsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmV3czoge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS1nZW5lcmFsLW5ld3MnLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnaW5jbHVkZScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bGxXb3JkOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdmdWxsLXdvcmQtb25seScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdmdWxsLXdvcmQtb25seScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiBmYWxzZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3b3JkU3RhcnRPbmx5OiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICd3b3JkLXN0YXJ0LW9ubHknLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnd29yZC1zdGFydC1vbmx5JyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGlzQ2FzZVNlbnNpdGl2ZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnY2FzZS1zZW5zaXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnY2FzZS1zZW5zaXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGlzLmZpbHRlckJ5ZGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWx0ZXItYnktZGF0ZScpXHJcbiAgICAgICAgLy8gdGhpcy5pc0RhdGVGaWx0ZXJPbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGF0ZS1maWx0ZXJzJyk7XHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucyA9IHRoaXMuZGF0ZUZpbHRlcnMucXVlcnlTZWxlY3RvckFsbCgnc2VsZWN0Jyk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vcmFuZ2UgbWFrZXMgdGhlIHByZXZpb3VzIHR3byBudWxsLCBlZmZlY3RpdmVseSBjYW5jZWxpbmcgdGhleSBvdXQgYW5kIHNodXR0aW5nIG9mZiB0aGVpciBpZiBsb2dpY1xyXG4gICAgICAgIC8vYnV0dG9uIHdpbGwgbWFrZSBvcHRpb25zIGFwcGVhciBhbmQgbWFrZSBpc0ZpbHRlck9uID0gdHJ1ZSwgYnV0IGlmIG5vIG9wdGlvbiBpcyBzZWxlY3RlZCwgdGhleSBkaXNzYXBlYXIgYW5kIGZhbHNlIGlzIHJlc3RvcmVkIFxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlclNldFVwID0ge1xyXG4gICAgICAgICAgICBtb250aDogbnVsbCxcclxuICAgICAgICAgICAgeWVhcjogbnVsbCxcclxuICAgICAgICAgICAgLy8gcmFuZ2U6IHtcclxuICAgICAgICAgICAgLy8gICAgIHN0YXJ0OiBudWxsLFxyXG4gICAgICAgICAgICAvLyAgICAgZW5kOiBudWxsXHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMueWVhck9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnkteWVhcicpO1xyXG4gICAgICAgIHRoaXMubW9udGhPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2J5LW1vbnRoJyk7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxpc3QgPSB7fVxyXG4gICAgICAgIHRoaXMubW9udGhzID0gW107XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3M7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzKHRhcmdldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnZ3ID0gTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IDAsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApXHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnRzKHRhcmdldCl7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpPT57XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgICAgIGlmKHdpbmRvdy5pbm5lcldpZHRoID49IDEyMDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWxsT3B0aW9uc1Zpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnMuY2xhc3NMaXN0LnJlbW92ZSgnZmFkZS1pbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWxsT3B0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdmYWRlLW91dCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAzMDApXHJcbiAgICAgICAgfSlcclxuICAgICAgICAvLyBjb25zdCBkZWZhdWx0U3dpdGNoU2V0dGluZ3MgPSB7Li4udGhpcy50b2dnYWJsZVNldHRpbmdzLCBhbHBoYU9yZGVyOiB7Li4udGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXJ9fTtcclxuICAgICAgICBsZXQgZGVmYXVsdFN3aXRjaFNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MpKVxyXG5cclxuICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3B1bGF0ZURhdGVGaWx0ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRBbGwub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlVGV4dChkZWZhdWx0U3dpdGNoU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnRvZ2dhYmxlU2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRTd2l0Y2hTZXR0aW5ncykpO1xyXG4gICAgICAgICAgICB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3M7IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyLCB0YXJnZXQuZGF0ZU9yZGVyKVxyXG4gICAgICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhkZWZhdWx0U3dpdGNoU2V0dGluZ3MuaXNDYXNlU2Vuc2l0aXZlKVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5pbml0aWFsVGl0bGV9YDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLnZhbHVlID0gJydcclxuICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMudmFsdWUgPSAnJ1xyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHllYXIub3B0aW9uc1t5ZWFyLnNlbGVjdGVkSW5kZXhdLnZhbHVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2Rlc2MgZGF0ZSBub3Qgd29ya2luZ1xyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5RGF0ZS5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50b2dnYWJsZVNldHRpbmdzLmRhdGVPcmRlcilcclxuICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuaXNPbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRhcmdldC5hbHBoYU9yZGVyLmRpcmVjdGl2ZSA9ICdkZXNjJ1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5pc09uID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPT09ICdkZXNjJyl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZGF0ZU9yZGVyLmRpcmVjdGl2ZSA9ICdhc2MnXHJcbiAgICAgICAgICAgIH1lbHNlKFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICB9O1xyXG4vL2luaWF0ZSB0b2dnbGUgdGhyb3VnaCB0aGVzZSwgdXNpbmcgbGV0cyB0byBoYW5kbGUgYm90aCBjaGFuZ2VzIGJhc2VkIG9uIHRoZSAuZGlyZWN0aXZlIHZhbHVlLCBcclxuLy9hbmQgbWF5YmUgZXZlbiBzZXR0aW5nIGludGlhbCBoaWRpbmcgdGhpcyB3YXkgdG9vIFxyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5QWxwaGEub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuaXNPbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuZGlyZWN0aXZlID0gJ2Rlc2MnXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5pc09uID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID09PSAnZGVzYycpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID0gJ2FzYydcclxuICAgICAgICAgICAgfWVsc2UoXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVQcm9wZXJ0eVVwZGF0ZXMub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC51cGRhdGUuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudXBkYXRlLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudXBkYXRlLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmNsdWRlR2VuZXJhbE5ld3Mub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5uZXdzLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm5ld3MuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5uZXdzLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmZ1bGxXb3JkU3dpdGNoLm9uY2xpY2sgPSAoKT0+e1xyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZ1bGxXb3JkLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMud29yZFNlYXJjaFBvc2l0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1lbHNleyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZ1bGxXb3JkLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24uY2xhc3NMaXN0LmFkZCgnaW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHdvcmQgc3RhcnQgb25seSBpczogJHt0YXJnZXQud29yZFN0YXJ0T25seS5pc09ufWApXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmdWxsIHdvcmQgb25seSBpczogJHt0YXJnZXQuZnVsbFdvcmQuaXNPbn1gKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24ub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgd29yZCBzdGFydCBvbmx5IGlzOiAke3RhcmdldC53b3JkU3RhcnRPbmx5LmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZVN3aXRjaC5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBjYXNlIHNlbnNpdGl2ZSBpczogJHt0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVRpdGxlLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVEZXNjcmlwdGlvbi5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmluY2x1ZGVEZXNjcmlwdGlvbi5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5pbmNsdWRlUmVsYXRpb25zaGlwLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vICAgICBpZih0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyl7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyA9IGZhbHNlO1xyXG4gICAgICAgIC8vICAgICB9ZWxzZXtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuc2VhcmNoYWJsZUZpZWxkcy5yZWxhdGlvbnNoaXBzID0gdHJ1ZTtcclxuICAgICAgICAvLyAgICAgfSAgXHJcbiAgICAgICAgLy8gfTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5maWx0ZXJCeWRhdGUub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgLy8gICAgIHRoaXMuZGF0ZUZpbHRlcnMuY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuaXNEYXRlRmlsdGVyT24gPSB0cnVlO1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh0aGlzLmlzRGF0ZUZpbHRlck9uKVxyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucy5mb3JFYWNoKGUgPT57XHJcbiAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKG9wdGlvbik9PntcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50TW9udGggPSB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihlLmlkID09PSAnYnkteWVhcicpe1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnllYXJPcHRpb25zLnZhbHVlICE9PSAnJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMueWVhckxpc3RbdGhpcy55ZWFyT3B0aW9ucy52YWx1ZV0ubWFwKG1vbnRoPT4gYDxvcHRpb24gdmFsdWU9XCIke21vbnRofVwiPiR7bW9udGh9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLm1vbnRocy5tYXAobW9udGg9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7bW9udGh9XCI+JHttb250aH08L29wdGlvbj5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5tb250aE9wdGlvbnMucXVlcnlTZWxlY3Rvcihgb3B0aW9uW3ZhbHVlPScke2N1cnJlbnRNb250aH0nXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLnZhbHVlID0gY3VycmVudE1vbnRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZSA9ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBvcHRpb24udGFyZ2V0LmlkLnNsaWNlKDMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlRmlsdGVyU2V0VXBbdmFsdWVdID0gb3B0aW9uLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZGF0ZUZpbHRlclNldFVwKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKCkgPT4gdGhpcy50eXBpbmdMb2dpYygpKVxyXG4gICAgICAgIHRoaXMub3B0aW9uc0J1dHRvbi5mb3JFYWNoKGU9PntlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy50b2dnbGVBbGxPcHRpb25zKCkpfSlcclxuICAgICAgICB0aGlzLmRpc21pc3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmRpc21pc3NTZWxlY3Rpb24oKSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoQ2xvbmUuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoKSA9PiB0aGlzLnNpbXVUeXBpbmcoKSk7XHJcbiAgICAgICAgLy9jb25zaWRlcmluZyBjaGFuZ2UgbGF5b3V0IG9mIG9wdGlvbnMgYXMgYWx0IHRvIGNsb25lXHJcbiAgICAgICAgaWYodGhpcy52dyA8IDEyMDApe1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NTZWFyY2guYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsICgpPT4gdGhpcy5vcGVuQ2xvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2xvc2VOZXdzU2VhcmNoQ2xvbmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHRoaXMuY2xvc2VDbG9uZSgpKTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnbGVUZXh0KHRhcmdldCk7XHJcbiAgICAgICAgdGhpcy50b2dnbGVPcHRpb25zLmZvckVhY2goZT0+e2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHRoaXMudG9nZ2xlVGV4dCh0YXJnZXQpKX0pXHJcbiAgICB9XHJcbi8vQWRkICdpc09uJyB0byBleGNsdWRlcywgd2l0aCBpbmNsdWRlIGhhdmluZyBjbGFzcyBvZmYgYW5kIGV4Y2x1ZGUgaGF2aW5nIGNsYXNzIG9mICp2YWx1ZT9cclxuICAgIHRvZ2dsZVRleHQodGFyZ2V0KXtcclxuICAgICAgICBsZXQgZmlsdGVyS2V5cyA9IE9iamVjdC5rZXlzKHRhcmdldClcclxuICAgICAgICBmaWx0ZXJLZXlzLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAjJHt0YXJnZXRbZV0ucmVmfSBzcGFuYCkuZm9yRWFjaChpPT5pLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpKVxyXG4gICAgICAgICAgICBpZih0YXJnZXRbZV0uaXNPbil7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0YXJnZXRbZV0ucmVmfSAuJHt0YXJnZXRbZV0uZGlyZWN0aXZlfWApLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RhcmdldFtlXS5yZWZ9IC5vZmZgKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLy9SZWRvIHBhZ2luYXRpb24sIGJ1dCB3aWxsIG5lZWQgdG8gaGF2ZSBzZXR1cCB3b3JrIGZvciBnZXR0aW5nIHJpZCB0aHJvdWdoIGVhY2ggcmVsb2FkXHJcbiAgICBcclxuICAgIC8vY2hlY2sgcGFnaW5hdGlvbiB0aHJvdWdob3V0IGVhY2ggYWRkXHJcblxyXG4gICAgLy9lc3RhYmxpc2ggZGVmYXVsdCBzZWFyY2ggYmVoYXZpb3IuIEFzIGluLCBkb2VzIGl0IGxvb2sgYXQgdGl0bGUsIGJpbywgXHJcbiAgICAvL2FuZCBjYXB0aW9uIHBhcnRpYWxzIGF0IHRoZSBzdGFydD8oaW4gaWYgc3RhdGVtZW50cyB1c2UgY29udGFpbnMgb24gc3RyaW5ncz8pXHJcbiAgICAvL2luIGdhdGhlck5ld3MoKSBoYXZlIGlmIHN0YXRlbWVudHMgdGhhdCB3b3JrIHRocm91Z2ggdGhlIGRhdGEgYWZ0ZXIgaXQncyBnb3R0ZW4sIGJlZm9yZSB0aGUgaW5zZXJ0aW9uc1xyXG4gICAgLy9XaGVuIGNsaWNrIG9uIG5ld3MsIHVzZSBiaWdnZXIgcGljdHVyZS4gQWxzbyBwdXQgaW4gZHVtbXksIFxyXG4gICAgLy9yZWxhdGVkIHNpdGVzIG9uIHRoZSByaWdodCwgYW5kIG1heWJlIGV2ZW4gcmVsYXRlZCBtZW1iZXJzIGFuZCBwcm9wZXJ0aWVzKHRpdGxlIG92ZXIgYW5kIHdpdGggbGlua3MpXHJcbiAgICAvL0Fsc28gbGlzdCBvdGhlciBuZXdzIHJlbGF0ZWQgdG8gaXQsIGxpa2UgaWYgYWxsIGFib3V0IHNhbWUgYnVpbGRpbmcgb3IgbWVtYmVyKGNhbiB1c2UgY21tb24gcmVsYXRpb24gZm9yIHRoYXQgYnV0IFxyXG4gICAgLy9uZWVkIHRvIGFkZCBhIG5ldyBmaWVsZCBmb3IgdHlwZXMgb2YgcmVsYXRpb25zaGlwcylcclxuICAgIC8vR2l2ZSB0aXRsZXMgdG8gb3RoZXIgc2VjdGlvbnMsIHdpdGggdGhlIHJpZ2h0IGJlaW5nIGRpdmlkZWQgaW50byByZWxhdGVkIGxpbmtzIGFuZCBzZWFyY2ggbW9kaWZpY2F0aW9uc1xyXG4gICAgLy9SZW1lbWJlciBmdW5jdGlvbmFsaXR5IGZvciBvdGhlciBwYXJ0cyBsaW5raW5nIHRvIGhlcmVcclxuICAgIHR5cGluZ0xvZ2ljKCkge1xyXG4gICAgICAgIC8vQXV0b21hdGljYWxseSBkaXNtaXNzIHNpbmdsZSBvciBoYXZlIHRoaXMgYW5kIG90aGVyIGJ1dHRvbnMgZnJvemVuIGFuZC9vciBoaWRkZW4gdW50aWwgZGlzbWlzc2VkXHJcbiAgICAgICAgLy9MZWFuaW5nIHRvd2FyZHMgdGhlIGxhdHRlciwgYXMgZmFyIGxlc3MgY29tcGxpY2F0ZWRcclxuICAgICAgICBpZiAodGhpcy5uZXdzU2VhcmNoLnZhbHVlICE9PSB0aGlzLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc21pc3NTZWxlY3Rpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnR5cGluZ1RpbWVyKVxyXG4gICAgXHJcbiAgICAgICAgICBpZiAodGhpcy5uZXdzU2VhcmNoLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1NwaW5uZXJWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2PidcclxuICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSB0aGlzLm5ld3NTZWFyY2gudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgU2hvd2luZyBSZXN1bHRzIGZvcjogJHt0aGlzLm5ld3NEZWxpdmVyeX1gO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudHlwaW5nVGltZXIgPSBzZXRUaW1lb3V0KHRoaXMuZ2F0aGVyTmV3cy5iaW5kKHRoaXMpLCA3NTApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5pbml0aWFsVGl0bGV9YDtcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIHRoaXMucHJldmlvdXNWYWx1ZSA9IHRoaXMubmV3c1NlYXJjaC52YWx1ZVxyXG4gICAgICB9XHJcblxyXG4gICAgICBvcGVuQ2xvbmUoKXtcclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2hDbG9uZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdvcGVuZWQnKTtcclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2hDbG9uZS5mb2N1cygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjbG9zZUNsb25lKCl7XHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoQ2xvbmVDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbmVkJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNpbXVUeXBpbmcoKXtcclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2gudmFsdWUgPSB0aGlzLm5ld3NTZWFyY2hDbG9uZS52YWx1ZTtcclxuICAgICAgICB0aGlzLnR5cGluZ0xvZ2ljKClcclxuICAgICAgfVxyXG5cclxuICAgICAga2V5UHJlc3NEaXNwYXRjaGVyKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PSA4MyAmJiAhdGhpcy5pc092ZXJsYXlPcGVuICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQudGFnTmFtZSAhPSBcIklOUFVUXCIgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC50YWdOYW1lICE9IFwiVEVYVEFSRUFcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuQ2xvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoZS5rZXlDb2RlID09PSAyNyAmJiB0aGlzLmlzT3ZlcmxheU9wZW4pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZUNsb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICBhc3luYyBwb3B1bGF0ZURhdGVGaWx0ZXJzKCl7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAvL0lzIGl0IGJldHRlciBqdXN0IHRvIHVzZSBzZXBlcmF0ZSB1cmwgcm91dGVzPyBcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL2FsbC1uZXdzP25ld3MnKTsgXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGF0ZXMgPSBbXTtcclxuICAgICAgICAgICAgY29uc3Qgc3BsaXREYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICAvLyBjb25zdCB5ZWFycyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cylcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdHMudXBkYXRlc0FuZE5ld3MuZm9yRWFjaChuZXdzPT57XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRhdGVzLmluY2x1ZGVzKG5ldyBEYXRlKG5ld3MuZGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi11cycsIHttb250aDogJ2xvbmcnLCB5ZWFyOiAnbnVtZXJpYyd9KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlcy5wdXNoKG5ldyBEYXRlKG5ld3MuZGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi11cycsIHttb250aDogJ2xvbmcnLCB5ZWFyOiAnbnVtZXJpYyd9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGRhdGVzKVxyXG5cclxuICAgICAgICAgICAgZGF0ZXMuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgICAgICBzcGxpdERhdGVzLnB1c2goZS5zcGxpdCgnICcpKVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coc3BsaXREYXRlcylcclxuXHJcbiAgICAgICAgICAgIHNwbGl0RGF0ZXMuZm9yRWFjaChkYXRlPT57XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMubW9udGhzLmluY2x1ZGVzKGRhdGVbMF0pKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRocy5wdXNoKGRhdGVbMF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBpZigheWVhcnMuaW5jbHVkZXMoZGF0ZVsxXSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHllYXJzLnB1c2goZGF0ZVsxXSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnllYXJMaXN0W2RhdGVbMV1dID0gW107XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY29uc3QgeWVhcnMgPSBPYmplY3Qua2V5cyh0aGlzLnllYXJMaXN0KVxyXG5cclxuICAgICAgICAgICAgeWVhcnMuZm9yRWFjaCh5ZWFyPT57XHJcbiAgICAgICAgICAgICAgICBzcGxpdERhdGVzLmZvckVhY2goZGF0ZT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHllYXIgPT09IGRhdGVbMV0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnllYXJMaXN0W3llYXJdLnB1c2goZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMueWVhckxpc3QpXHJcblxyXG4gICAgICAgICAgICBsZXQgYWxsTW9udGhzID0gWydKYW51YXJ5JywnRmVicnVhcnknLCdNYXJjaCcsICdBcHJpbCcsJ01heScsJ0p1bmUnLCdKdWx5JywnQXVndXN0JywnU2VwdGVtYmVyJywnT2N0b2JlcicsJ05vdmVtYmVyJywnRGVjZW1iZXInXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubW9udGhzLnNvcnQoZnVuY3Rpb24oYSxiKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhbGxNb250aHMuaW5kZXhPZihhKSA+IGFsbE1vbnRocy5pbmRleE9mKGIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgeWVhcnMuc29ydCgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy55ZWFyT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAke3llYXJzLm1hcCh5ZWFyPT4gYDxvcHRpb24gdmFsdWU9XCIke3llYXJ9XCI+JHt5ZWFyfTwvb3B0aW9uPmApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICBgO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPkFueTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgJHt0aGlzLm1vbnRocy5tYXAobW9udGg9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7bW9udGh9XCI+JHttb250aH08L29wdGlvbj5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgYDtcclxuXHJcbiAgICAgICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICBhc3luYyBnYXRoZXJOZXdzKCl7XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMudG9nZ2FibGVTZXR0aW5nc1xyXG4gICAgICAgIC8vUHV0IHJlc3VsdHMgaW4gdmFyIGNvcHksIGp1c3QgbGlrZSBpbiB0aGUgc2hhZG93Ym94XHJcbiAgICBcclxuICAgICAgICAvL01heWJlLCB0byBzb2x2ZSBjZXJ0YWluIGlzc3VlcyBvZiAndW5kZWZpbmVkJywgYWxsb3cgcGFnaW5hdGlvbiBldmVuIHdoZW4gb25seSAxIHBhZ2UsIGFzIEkgdGhpbmsgbmV4dCBhbmQgcHJldiB3aWxsIGJlIGhpZGRlbiBcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIC8vSXMgaXQgYmV0dGVyIGp1c3QgdG8gdXNlIHNlcGVyYXRlIHVybCByb3V0ZXM/IFxyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvYWxsLW5ld3M/bmV3cz0nICsgdGhpcy5uZXdzRGVsaXZlcnkpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7IFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocmVzdWx0cylcclxuICAgICAgICBcclxuICAgICAgICAgICAgLy9tYXliZSBhbGxvd2luZyBhIG9uZSBvbiB0aGUgcGFnaW5hdGlvbiB3b3VsZCBzb2x2ZSB0aGUgZXJyb3JzXHJcblxyXG4gICAgICAgICAgICAvL0ZvciBmaWVsZCBleGNsdXNpb24sIGNvdWxkIGhhdmUgY29kZSBwcm9jZXNzZWQgd2l0aCBtYXRjaGVzKCkgb3IgaW5kZXhPZiBvbiB0aGUgZmllbGRzIHRoYXQgYXJlbid0IGJhbm5lZFxyXG4gICAgICAgICAgICAvL1Rha2Ugb3V0IHRob3NlIHRoYXQgcHJvZHVjZSBhIGZhbHNlIHJlc3VsdFxyXG5cclxuICAgICAgICAgICAgbGV0IGFsbE5ld3MgPSByZXN1bHRzLnVwZGF0ZXNBbmROZXdzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHJlbGF0ZWRQb3N0cyA9IHJlc3VsdHMucHJvcGVydGllc0FuZE1lbWJlcnM7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zdFJlbGF0aW9uc2hpcHMgPSBbXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGFsbE5ld3MubWFwKG5ld3M9PntcclxuICAgICAgICAgICAgICAgIG5ld3MucmVsYXRpb25zaGlwcy5mb3JFYWNoKHBvc3Q9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgJHtuZXdzLnRpdGxlfTogJHtwb3N0LklEfWApXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7IGkgPCByZWxhdGVkUG9zdHMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwb3N0LklEID09PSByZWxhdGVkUG9zdHNbaV0uaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFJlbGF0aW9uc2hpcHMucHVzaChyZWxhdGVkUG9zdHNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocG9zdFJlbGF0aW9uc2hpcHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzID0gcG9zdFJlbGF0aW9uc2hpcHM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgcG9zdFJlbGF0aW9uc2hpcHMgPSBbXTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBuID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcbiAgICAgICAgICAgIGlmKG4uaW5kZXhPZignIycpID4gLTEpe1xyXG4gICAgICAgICAgICAgICAgbiA9IG4uc3BsaXQoL1svLV0rLylcclxuICAgICAgICAgICAgICAgIGlmKG5bNF0ubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihuWzVdLmluZGV4T2YoJ25ld3MnKSA+IC0xKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5zaW5nbGVDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IHRydWU7IFxyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5ld3NTZWFyY2gudmFsdWUgPSBgJHtuWzRdfWA7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9IGAke25bNF19YDsgXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luID0gbls2XTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gbls0XS5zbGljZSgxKTsgXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKCcnLCAnJywgYC8ke25bMl19LSR7blszXX1gKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBoaXN0b3J5LmdvKC0xKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4dGVybmFsQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBuZXdzVHlwZXMgPSBbJ25ld3MnLCAndXBkYXRlJ107XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YUNvdW50ID0gMDtcclxuICAgICAgICAgICAgY29uc3QgbmV3c091dHB1dCA9IDI7XHJcbiAgICAgICAgICAgIGxldCBwYWdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgbmV3c1BhZ2UgPSBbXTtcclxuICAgICAgICAgICAgbGV0IG5ld3NQYWdlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY29udGVudFNob3duO1xyXG5cclxuICAgICAgICAgICAgLy8gLy9pZiBzeW1ib2wgZW50ZXJlZCBhcyBvbmx5IHRoaW5nLCBpdCdsbCBteSBsb2dpYywgc29tZXRpbWVzLiBSZW1lZHkgdGhpcy5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmZ1bGxEaXNwbGF5IHx8IHRoaXMuYmFja2dyb3VuZENhbGwpe1xyXG4gICAgICAgICAgICAgICAgLy9EbyBzdGFydCB2cyBhbnl3aGVyZSBpbiB0aGUgd29yZFxyXG4gICAgICAgICAgICAgICAgLy9TdGFydCBvbmx5IGlzIHN0YW5kYXJkIGFuZCBhdXRvIHRydWUgd2hlbiB3aG9sZSB3b3JkIGlzIHR1cm5lZCBvbig/KSBvciBzaW1wbHkgYnVyaWVkIGluIHBhcnRpYWwgaWZcclxuICAgICAgICAgICAgICAgIC8vaXQgc2hvdWxkIGF0IGxlYXN0IGJlIGluYWNlc3NpYmxlIG9uIHRoZSBmcm9udGVuZCB3aXRoIHZpc3VhbCBjdWVcclxuXHJcbiAgICAgICAgICAgICAgICAvL0RvIGEgbW9yZSB0aG9yb3VnaCB0ZXN0IG9mIHRob3NlIGxhdGVyIGFmdGVyIHJlbCBhbmQgJ2Rpc2xheS1xdWFsaXR5JyBhcnRpY2xlcyBjcmVhdGVkIFxyXG5cclxuICAgICAgICAgICAgICAgIC8vRG8gYmFzaWMgbW9udGggYW5kIHllYXIgYW5kIHJhbmdlIHBpY2tpbmcsIGJlZm9yZSBsb29raW5nIGludG8gcG9wLXVwIGFuZCBmaWd1cmluZyBvdXQgaG93IHRvIGdldCBpbmZvIGZyb20gd2hhdCBpcyBzZWxlY3RlZCBvbiBpdFxyXG4gICAgICAgICAgICAgICAgbGV0IGZ1bGxMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICBsZXQgdGl0bGVzID0gW107XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVzYyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlbCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubmV3c0RlbGl2ZXJ5ICE9PSAnJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3JlZCcpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMubmV3c0RlbGl2ZXJ5LnN0YXJ0c1dpdGgoJyMnKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXF1ZXN0ZWRJZCA9IHRoaXMubmV3c0RlbGl2ZXJ5LnJlcGxhY2UoJyMnLCAnJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFzc29jaWF0ZWROZXdzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLmZvckVhY2gobmV3cyA9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld3MucmVsYXRpb25zaGlwcy5mb3JFYWNoKHI9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyLmlkID09PSBwYXJzZUludChyZXF1ZXN0ZWRJZCkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NvY2lhdGVkTmV3cy5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gci50aXRsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXNzb2NpYXRlZE5ld3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cyA9IGFzc29jaWF0ZWROZXdzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5leHRlcm5hbENhbGwpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5vcmlnaW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4dGVybmFsQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5uZXdzU2VhcmNoLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJldHVybkhvbWUuaHJlZj1gJHtzaXRlRGF0YS5yb290X3VybH0vIyR7dGhpcy5vcmlnaW59Q29udGFpbmVyYDsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYFNob3dpbmcgUmVzdWx0cyBmb3I6ICR7bmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZWRUaXRsZSA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNleyAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5mdWxsV29yZC5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMgPSBhbGxOZXdzLmZpbHRlcigobmV3cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3cy50aXRsZS50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKS5pbmNsdWRlcyh0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2UgaWYoIXRhcmdldC5mdWxsV29yZC5pc09uICYmIHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MuZm9yRWFjaChuZXdzPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihuZXdzLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdzU3BsaXQgPSBuZXdzLnRpdGxlLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBlIG9mIG5ld3NTcGxpdCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZS5zdGFydHNXaXRoKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzLnB1c2gobmV3cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiBuZXdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gbnVsbDsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzID0gYWxsTmV3cy5maWx0ZXIobmV3cz0+IG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlcyA9IHRpdGxlcy5maWx0ZXIobmV3cz0+IG5ld3MudGl0bGUuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeSkgIT09IC0xKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmluY2x1ZGVEZXNjcmlwdGlvbi5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5mdWxsV29yZC5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjID0gYWxsTmV3cy5maWx0ZXIoKG5ld3MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpLmluY2x1ZGVzKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpZiBmaXJlZCEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2UgaWYoIXRhcmdldC5mdWxsV29yZC5pc09uICYmIHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MuZm9yRWFjaChuZXdzPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihuZXdzLmZ1bGxEZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3c1NwbGl0ID0gbmV3cy5mdWxsRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGUgb2YgbmV3c1NwbGl0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlLnN0YXJ0c1dpdGgodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjLnB1c2gobmV3cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzYyA9IGFsbE5ld3MuZmlsdGVyKG5ld3M9PiBuZXdzLmZ1bGxEZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjID0gZGVzYy5maWx0ZXIobmV3cz0+IG5ld3MuZnVsbERlc2NyaXB0aW9uLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkpICE9PSAtMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWFyY2hlZE5ld3MgPSBmdWxsTGlzdC5jb25jYXQodGl0bGVzLCBkZXNjLCByZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cyA9IFtdOyBcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hlZE5ld3MuZm9yRWFjaCgobmV3cyk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYWxsTmV3cy5pbmNsdWRlcyhuZXdzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MucHVzaChuZXdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvL0RhdGVzIGJlbG9uZyB0byBhIHNlcGVyYXRlIGxvZ2ljIHRocmVhZCwgYW5kIGFzIHN1Y2ggc2hvdWxkIG5veXQgYmUgbGlua2VkIHRvIHR5cGluZy4gVGhleSBhZSBjbG9zZXIgdG8gdGhlIHNvcnRzIGluIHRoYXQgXHJcbiAgICAgICAgICAgICAgICAvL3RoZXkgY2FuIGJlIGFmdGVyIHRoZSB0eXBpbmcsIGJlZm9yZSwgb3IgZXZlbiBiZSB1c2VkIHdpdGhvdXQgaXRcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy9BZnRlciBJIGZpbmlzaCB0aGUgY29yZSBsb2dpYywgYWRkIGluIGZ1bmN0aW9uYWxpdHkgdGhhdCBoYXMgYW55IGFzIG9wdGlvbiBmb3IgJ3llYXInLCB3aXRoIHNlbGVjdGlvbiBvZiBzcGVjaWZpYyBcclxuICAgICAgICAgICAgICAgIC8vbGltaXRpbmcgdGhlICdtb250aCcgdmFsdWVzIGFuZCBzZWxlY3RpbmcgdGhlIGVhcmxpZXN0IG9uZSBhcyB0aGUgZGVmYXVsdCBmaWx0ZXIgZm9yICdtb250aCcgb3IgJ2FueSdcclxuICAgICAgICAgICAgICAgIC8vRmlsdGVyIGJ5IGRhdGUgd2lsbCBiZSBhIGJvb2xlYW4gd2l0aCBkcm9wZG93biBkZWZhdWx0cyBvZiBhbnkgZm9yIGJvdGhcclxuXHJcbiAgICAgICAgICAgICAgICAgbGV0IGRhdGVGaWx0ZXJzU2V0ID0gT2JqZWN0LmtleXModGhpcy5kYXRlRmlsdGVyU2V0VXApO1xyXG4gICAgICAgICAgICAgICAgLy8gIGNvbnNvbGUubG9nKGBjb250ZW50TG9hZGVkID0gJHt0aGlzLmNvbnRlbnRMb2FkZWR9YClcclxuXHJcbiAgICAgICAgICAgICAgICAgZm9yKGxldCBmaWx0ZXIgb2YgZGF0ZUZpbHRlcnNTZXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmRhdGVGaWx0ZXJTZXRVcFtmaWx0ZXJdKXsgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gYWxsTmV3cy5maWx0ZXIoKG5ld3MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXcgRGF0ZShuZXdzLmRhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tdXMnLCB7bW9udGg6ICdsb25nJywgeWVhcjogJ251bWVyaWMnfSkuaW5jbHVkZXModGhpcy5kYXRlRmlsdGVyU2V0VXBbZmlsdGVyXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICBcclxuICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy50b2dnYWJsZVNldHRpbmdzLmRhdGVPcmRlci5pc09uID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyLmRpcmVjdGl2ZSA9PT0gJ2FzYycpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGEuZGF0ZSkgLSBuZXcgRGF0ZShiLmRhdGUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5zb3J0KChhLCBiKSA9PiBuZXcgRGF0ZShhLmRhdGUpIC0gbmV3IERhdGUoYi5kYXRlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuYWxwaGFPcmRlci5pc09uID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2NhbGVDb21wYXJlIGRvZXMgYSBzdHJpbmcgY29tcGFyaXNvbiB0aGF0IHJldHVybnMgLTEsIDAsIG9yIDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEudGl0bGUubG9jYWxlQ29tcGFyZShiLnRpdGxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5hbHBoYU9yZGVyLmRpcmVjdGl2ZSA9PT0gJ2Rlc2MnKXsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuZXdzVHlwZXMuZm9yRWFjaCgodHlwZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXRbdHlwZV0uaXNPbiAhPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MgPSBhbGxOZXdzLmZpbHRlcihuZXdzPT4gbmV3cy5wb3N0VHlwZSAhPT0gdHlwZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKGFsbE5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihhbGxOZXdzLmxlbmd0aCA8PSBuZXdzT3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZXMuY29uY2F0KGFsbE5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGFsbE5ld3MubGVuZ3RoID4gbmV3c091dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZW0gPSAxOyBpdGVtIDw9IG5ld3NPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBhbGxOZXdzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UucHVzaChyZW1vdmVkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gbmV3c1BhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYWxsTmV3cy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlID0gYWxsTmV3cy5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gobmV3c1BhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYobmV3c1BhZ2VzLmxlbmd0aCl7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IG5ld3NQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc107XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGl2ZXJOZXdzKGNvbnRlbnRTaG93bilcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY29udGVudExvYWRlZCAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXNgKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TmV4dEFuZFByZXZpb3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZihjb250ZW50U2hvd24ubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKG5ld3NQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBY3RpdmF0aW9uKCk7IFxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy9UaGlzIG5lZWRzIHRvIGNoYW5nZSB0b1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVPcHRpb25zLmZvckVhY2gobyA9PiB7by5jbGFzc0xpc3QuYWRkKCdpbmFjdGl2ZScpO30pOyBcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZUZpbHRlck9wdGlvbnMuZm9yRWFjaChmID0+IHtmLmRpc2FibGVkID0gdHJ1ZX0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLmNsYXNzTGlzdC5hZGQoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0QWxsLmNsYXNzTGlzdC5hZGQoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGVudCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgbmV3cyBvZiBhbGxOZXdzKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5jbGFzc0xpc3QuYWRkKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuY2xhc3NMaXN0LmFkZCgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc21pc3NCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zZXBlcmF0ZSB0aGUgaW5zZXJ0aW9ucyB0byBhIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Vc2UgaWYgdG8gdmFyeSBpZiBsb29rIGZvciBuZXdzIHdpdGggdGhhdCBvciBvbmVzIHdpdGggcmVsYXRpb25zaGlwIHRoYXQgaGFzIHRoYXRcclxuICAgICAgICAgICAgICAgICAgICAvL21ha2UgYXJyYXkgb2YgZWFjaCBuZXdzJ3MgcmVsYXRpb25zaGlwc1tnaXZlIHRoZSBmaXJzdCBwb3N0IDIgZm9yIHRlc3Rpbmcgb2YgaWYgY2hlY2tpbmcgYXJheSBwcm9wZXJseV1cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmZ1bGxEaXNwbGF5KXsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtuZXdzLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChyPT50aGlzLmNhbGxlZElkcy5wdXNoKHIuaWQpKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jYWxsZWRJZHMuaW5jbHVkZXMocGFyc2VJbnQodGhpcy5jdXJyZW50UmVwb3J0KSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGVudC5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7bmV3cy50aXRsZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmKHRoaXMuc2luZ2xlQ2FsbCl7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGl2ZXJOZXdzKHRoaXMuZnVsbERpc3BsYXlDb250ZW50LCB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZXh0ZXJuYWxDYWxsKVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5mdWxsRGlzcGxheSAmJiB0aGlzLmV4dGVybmFsQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7ICBcclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWxpdmVyTmV3cyhjb250ZW50U2hvd24sIGRlc3RpbmF0aW9uID0gdGhpcy5uZXdzUmVjaWV2ZXIpe1xyXG4gICAgICAgIGRlc3RpbmF0aW9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgJHtjb250ZW50U2hvd24ubGVuZ3RoID8gYDx1bD5gICA6ICdObyBhcnRpY2xlcyBtYXRjaCB5b3VyIGNyaXRlcmlhJ31cclxuICAgICAgICAgICAgJHshY29udGVudFNob3duLmxlbmd0aCA/IGA8YnV0dG9uIGlkPVwic2VhcmNoUmVzZXRcIj5QbGVhc2UgdHJ5IGEgZGlmZmVyZW50IHF1ZXJ5IG9yIGNoYW5nZSB5b3VyIGZpbHRlcnMuPC9idXR0b24+YCAgOiAnJ31cclxuICAgICAgICAgICAgICAgICR7Y29udGVudFNob3duLm1hcChyZXBvcnQgPT4gYFxyXG4gICAgICAgICAgICAgICAgPGxpPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzXCI+ICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGg0PiR7cmVwb3J0LnRpdGxlfTwvaDQ+YCA6ICcnfVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXBvcnQuY2FwdGlvbi5sZW5ndGggPj0gMSA/IHJlcG9ydC5jYXB0aW9uICsgJyAtICcgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cmVwb3J0LmRhdGV9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD4ke3JlcG9ydC5yZWxhdGlvbnNoaXBzLm1hcChyZWxhdGlvbnNoaXAgPT4gYDxzcGFuIGNsYXNzPVwibmFtZVwiPiR7cmVsYXRpb25zaGlwLnRpdGxlfTwvc3Bhbj4gICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGEgY2xhc3M9XCJyZWxhdGlvbnNoaXAtbGlua1wiIGRhdGEtcmVsYXRlZD1cIiR7cmVsYXRpb25zaGlwLmlkfVwiPihBc3NvY2lhdGVkIE5ld3MpPC9hPiBgIDogYDxhIGNsYXNzPVwicmVsYXRpb25zaGlwLWxpbmsgZGlzbWlzc2VkXCIgZGF0YS1yZWxhdGVkPVwiJHtyZWxhdGlvbnNoaXAuaWR9XCI+KEFzc29jaWF0ZWQgTmV3cyk8L2E+IGB9PGEgY2xhc3M9XCJzaW5nbGUtbGlua1wiIGhyZWY9XCIke3JlbGF0aW9uc2hpcC5wZXJtYWxpbmt9XCI+KFZpZXcgUHJvZmlsZSk8L2E+YCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtY2FyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBkYXRhLWlkPVwiJHtyZXBvcnQuaWR9XCIgZGF0YS1wb3N0PVwiJHtyZXBvcnQucG9zdFR5cGVQbHVyYWx9XCIgc3JjPVwiJHtyZXBvcnQuZ2FsbGVyeVswXS5zZWxlY3RJbWFnZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPHA+JHtyZXBvcnQuZGVzY3JpcHRpb259PC9wPmAgOiBgPHA+JHtyZXBvcnQuZnVsbERlc2NyaXB0aW9ufTwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkeyF0aGlzLmZ1bGxEaXNwbGF5ID8gYDxidXR0b24gaWQ9XCIke3JlcG9ydC5pZH1cIiBjbGFzcz1cInNlZS1tb3JlLWxpbmtcIj5TZWUgTW9yZTogJHtyZXBvcnQuaWR9IDwvYnV0dG9uPmAgOiBgPGJ1dHRvbiBpZD1cIiR7cmVwb3J0LmlkfVwiIGNsYXNzPVwic2VlLW1vcmUtbGluayBkaXNtaXNzZWRcIj5SZWFkIG1vcmU6ICR7cmVwb3J0LmlkfSA8L2J1dHRvbj5gfSBcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvbGk+IFxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICR7Y29udGVudFNob3duLmxlbmd0aCA/IGA8L3VsPmAgIDogJyd9XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZnVsbERpc3BsYXkpe1xyXG4gICAgICAgICAgICB0aGlzLnNlZU1vcmVGdW5jdGlvbmFsaXR5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyUmVsYXRlZE5ld3MoKTsgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBtZWRpYUxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVkaWEtY2FyZCBpbWcnKSBcclxuICAgICAgICAgICAgLy8gdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJykgICBcclxuICAgICAgICAgICAgLy8gdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpXHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubWVkaWFSZWNpZXZlciwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJykpIFxyXG4gICAgICAgICAgICAvLyB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1lZGlhQ29sdW1uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNvbHVtbicpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLm5ld2xvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7IFxyXG4gICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LW1lZGlhJyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24nKTtcclxuXHJcbiAgICAgICAgLy8gbWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAvLyAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IFNoYWRvd0JveC5wcm90b3R5cGUuc2hhZG93Qm94KG1lZGlhLCB0aGlzLm1lZGlhUmVjaWV2ZXIsIHRoaXMuaHRtbCwgXHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcywgJ2dhbGxlcnknLCB0aGlzLm1lZGlhQ29sdW1uLCB0aGlzLm5ld2xvYWQsIHRoaXMuZ2FsbGVyeVBvc2l0aW9uLFxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEsIHRoaXMubWVkaWFQYWdpbmF0aW9uXHJcbiAgICAgICAgLy8gICAgICAgICApKVxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgIC8vICBtZWRpYUxpbmsuZm9yRWFjaChtZWRpYT0+e1xyXG4gICAgICAgIC8vICAgICBtZWRpYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gU2hhZG93Qm94LnByb3RvdHlwZS5zaGFkb3dCb3gobWVkaWEpKVxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKCk7XHJcblxyXG4gICAgICAgIC8vIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKFxyXG4gICAgICAgIC8vICAgICB0aGlzLm1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIGltZycpLCBcclxuICAgICAgICAvLyAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyksICAgXHJcbiAgICAgICAgLy8gICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKSxcclxuICAgICAgICAvLyAgICAgdGhpcy5tZWRpYVJlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJyksIFxyXG4gICAgICAgIC8vICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZVxyXG4gICAgICAgIC8vICk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChvcHRpb249PntcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtvcHRpb24uc3R5bGUucG9pbnRlckV2ZW50cz1cIlwiOyB9LCA1MDApO1xyXG4gICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBnYXRoZXJSZWxhdGVkTmV3cygpe1xyXG5cclxuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcExpbmtzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJlbGF0aW9uc2hpcC1saW5rJyk7XHJcblxyXG4gICAgICAgIHRoaXMucmVsYXRpb25zaGlwTGlua3MuZm9yRWFjaChsaW5rPT57XHJcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBsaW5rSWQgPSBsaW5rLmRhdGFzZXQucmVsYXRlZCBcclxuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gbGluay5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJykuaW5uZXJUZXh0XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gbGlua0lkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gYCMke2xpbmtJZH1gO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5uZXdzU2VhcmNoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSBgIyR7bGlua0lkfWA7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVkVGl0bGUgPWBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpbnNlcnRQYWdpbmF0aW9uKG5ld3NQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQpe1xyXG4gICAgICAgIC8vYWRkIG1hbnVhbCBwYWdlIGVudHJ5IGJveFxyXG4gICAgICAgIC8vQWRkIGZhaWxzYWZlIGFnYWluc3QgaXQgYmVpbmcgYSBudW1iZXIgdG9vIGJpZyBvciBzbWFsbFxyXG4gICAgICAgIC8vTWF5YmUgZG8gZHJvcGRvd24gaW5zdGVhZD8gIFxyXG4gICAgICAgIC8vTWF5YmUganVzdCBkb24ndCBkbyBhdCBhbGw/XHJcblxyXG4gICAgICAgIC8vRG8gdGhlIG51bWJlciBsaW1pdCwgdGhvdWdoLCBvbmUgd2hlcmUgaGlkZSBhbmQgcmV2ZWFsIHdoZW4gYXQgY2VydGFpbiBwb2ludHNcclxuXHJcbiAgICAgICAgLy9SZW1lbWJlciB0byBhZGQgdGhlIGxvYWRlclxyXG4gICAgICAgIC8vIGlmKHRoaXMudncgPj0gMTIwMCl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIC8vIH1cclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQtcGFnZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YSBpZD1cIlwiIGNsYXNzPVwiY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXNcIj5QcmV2PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZVwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSAgXHJcbiAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJcIiBjbGFzcz1cImNvbnRlbnQtZGlyZWN0aW9uIGNvbnRlbnQtZGlyZWN0aW9uX25leHQgJHtuZXdzUGFnZXMubGVuZ3RoID4gMSA/ICcnIDogJ2hpZGRlbid9XCI+TmV4dDwvYT4gXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj4gXHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzJyk7ICAgIFxyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSAgXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0Q29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7IFxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJylcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFBhZ2VIb2xkZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtcGFnZXMgYScpXHJcbiAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkodGhpcy5jb250ZW50UGFnZU9wdGlvbnMpO1xyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VlTW9yZUZ1bmN0aW9uYWxpdHkoKXtcclxuICAgICAgICAvL2FkZCBzcGlubmVyIHRvIHRoaXMsIGFzIG5lZWRzIHRvIGNvbnNvbHQgYmFja2VuZFxyXG4gICAgICAgIHRoaXMuc2VlTW9yZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZWUtbW9yZS1saW5rJylcclxuICAgICAgICB0aGlzLnNlZU1vcmUuZm9yRWFjaChsaW5rPT57XHJcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gbGluay5pZDsgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuc2luZ2xlQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBmdWxsIGRpc3BsYXkgaXMgJHt0aGlzLmZ1bGxEaXNwbGF5fWApXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBkaXNtaXNzU2VsZWN0aW9uKCl7XHJcbiAgICAgICAgaWYodGhpcy5uZXdzRGVsaXZlcnkgIT09ICcnKXtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGAke3RoaXMuc3RvcmVkVGl0bGV9YDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGAke3RoaXMuaW5pdGlhbFRpdGxlfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudG9nZ2xlT3B0aW9ucy5mb3JFYWNoKG8gPT4ge28uY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUnKTt9KSBcclxuICAgICAgICB0aGlzLmRhdGVGaWx0ZXJPcHRpb25zLmZvckVhY2goZiA9PiB7Zi5kaXNhYmxlZCA9ICcnfSlcclxuICAgICAgICB0aGlzLm5ld3NTZWFyY2guY2xhc3NMaXN0LnJlbW92ZSgnaW5hY3RpdmUnKTtcclxuICAgICAgICB0aGlzLnJlc2V0QWxsLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2Rpc21pc3NlZCcpOyAgXHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICAvLyB0aGlzLnNpbmdsZUNhbGwgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShjb250ZW50UGFnZU9wdGlvbnMpe1xyXG4gICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gc2V0VGltZW91dChmdW5jdGlvbigpe2VsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgMTAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBwYXJzZUludChzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcblxyXG4gICAgICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnRlbnROZXh0QWN0aXZhdGlvbigpe1xyXG4gICAgICAgIGxldCBhbGxuZXh0QnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7XHJcblxyXG4gICAgICAgIGFsbG5leHRCdXR0b25zLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhZ2UuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCgvLWdyb3VwLykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTmFtZSA9IG5hbWUuc2xpY2UoMCwgLTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWxlY3RlZFBhZ2VgKTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBuZXh0UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IG5leHRQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICAvL3RvbyBzbG93Pz9cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWVcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzfVwiXWApO1xyXG4gICAgICAgICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnRlbnROZXh0QW5kUHJldmlvdXMoKXtcclxuICAgXHJcbiAgICAgICAgdGhpcy5jb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uJyk7ICAgICBcclxuXHJcbiAgICAgICAgbGV0IHByZXZCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXNgKVxyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtZGlyZWN0aW9uX25leHRgKVxyXG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnNlbGVjdGVkUGFnZWApO1xyXG5cclxuICAgICAgICBpZih0aGlzLmN1cnJlbnRQYWdlcyA+IDApe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRQYWdlcylcclxuICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBwcmV2QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYoIW5leHRCdXR0b24ucHJldmlvdXNFbGVtZW50U2libGluZy5jbGFzc0xpc3QuY29udGFpbnMoJ3NlbGVjdGVkUGFnZScpKXtcclxuICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBuZXh0QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAgKGkpID0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHByZXZQYWdlID0gdGhpcy5jdXJyZW50UGFnZXMgLSAxO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IHByZXZQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc31cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGVBbGxPcHRpb25zKCl7XHJcbiAgICAgICAgaWYoIXRoaXMuYWxsT3B0aW9uc1Zpc2libGUpe1xyXG4gICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnMuY2xhc3NMaXN0LmFkZCgnZmFkZS1pbicpO1xyXG4gICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnNWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIucXVlcnlTZWxlY3RvckFsbCgnKicpLmZvckVhY2goZT0+ZS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnKVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnMuY2xhc3NMaXN0LnJlbW92ZSgnZmFkZS1pbicpO1xyXG4gICAgICAgICAgICB0aGlzLmFsbE9wdGlvbnMuY2xhc3NMaXN0LmFkZCgnZmFkZS1vdXQnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+e3RoaXMuYWxsT3B0aW9ucy5jbGFzc0xpc3QucmVtb3ZlKCdmYWRlLW91dCcpO30sIDQ1MClcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWxsT3B0aW9uc1Zpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIucXVlcnlTZWxlY3RvckFsbCgnKicpLmZvckVhY2goZT0+ZS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJycpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOZXdzIiwiY2xhc3MgTW9iaWxlSW50ZXJmZWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5uYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYnKTtcclxuICAgICAgICB0aGlzLm9wZW5lZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlTmF2Q2FsbGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21vYmlsZS1uYXYtY2FsbGVyJyk7XHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuICAgIGV2ZW50cygpe1xyXG4gICAgICAgIC8vIHRoaXMubW9iaWxlTmF2Q2FsbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnRoaXMub3Blbk5hdigpKVxyXG4gICAgfVxyXG5cclxuICAgIG9wZW5OYXYoKXtcclxuICAgICAgICBpZighdGhpcy5vcGVuZWQpe1xyXG4gICAgICAgICAgICB0aGlzLm5hdi5jbGFzc0xpc3QuYWRkKCdvcGVuZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5vcGVuZWQgPSB0cnVlO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLm5hdi5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5vcGVuZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb2JpbGVJbnRlcmZlY2U7IiwiLy8gU3BpdCBvdXQgQXB0cyBpbiBvcmRlciBvZiBtb3N0IHJlY2VudFxyXG5cclxuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiXHJcblxyXG5jbGFzcyBQYWdpbmF0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy50YXJnZXRlZEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcclxuICAgICAgICB0aGlzLmhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyTmF2ID0gdGhpcy5oZWFkZXIucXVlcnlTZWxlY3RvcignbmF2Jyk7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1zZWFyY2gtdHJpZ2dlclwiKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcG9wLXVwLWRpc3BsYXktYm94Jyk7XHJcbiAgICAgICAgdGhpcy5pbWFnZUhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbWFnZS1ob2xkZXInKTtcclxuICAgICAgICB0aGlzLmNsb3NlTWFnbmlmeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbG9zZU1hZ25pZnknKTtcclxuICAgICAgICAvLyB0aGlzLm92ZXJhbGxDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3ZlcmFsbENvbnRhaW5lcicpO1xyXG4gICAgICAgIC8vIEZvciBub3csIHRoaXMgd2lsbCBiZSBob3cgSSBwcmV2ZW50IGVycm9ycyBvbiBvdGhlciBwYWdlcyBcclxuICAgICAgICB0aGlzLmZyb250VGVzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50Q29udGFpbmVyX3BhZ2luYXRlZCcpIFxyXG4gICAgICAgIHRoaXMudmggPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IDAsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKVxyXG4gICAgICAgIHRoaXMudncgPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgMCwgd2luZG93LmlubmVyV2lkdGggfHwgMClcclxuXHJcbiAgICAgICAgLy8gQ2FuIEkgc2V0dXAgdG8gbG9hZCBpbiBhbmQgUGFnaW5hdGUgZGVwZW5kaW5nIG9uIGlkZW50aXR5LCBzbyBhcyB0byBtYWtlIGFkYXB0YWJsZT8gWWVzISEhXHJcblxyXG4gICAgICAgIC8vV2lsbCB0YXJnZXQgYSBzaGFyZWQsIHNwZWNpZmljIGNsYXNzIHVzaW5nIHF1ZXJ5U2VsZWN0b3JBbGwgYW5kIHVzZSBhIGxvb3BcclxuXHJcbiAgICAgICAgLy9yZW1lbWJlciB0byB1c2UgdGhlIGFqYXggdXJsIHNldC11cCB0byBsaW5rIHRvIHRoZSBzZWFyY2ggaW5mb1xyXG4gICAgICAgIC8vQ29sb3IgdGhlIHNlbGVjdGVkL2N1cnJlbnQgcGFnZSBhbmQgcHV0IGEgbmV4dCBhbmQgcHJldiBidXR0b25zIHRoYXQgb25seSBhcHBlYXIgd2hlbiBhcHBsaWNhYmxlXHJcbiAgICAgICAgLy9NYWtlIHN1cmUgcGFnaW5hdGlvbiBpcyBvdXRzaWRlIG9mIGdlbmVyYXRlZCB0ZXh0P1xyXG5cclxuICAgICAgICAvLyBjb25zaWRlciB1c2luZyBzb21lIHNvcnQgb2YgbG9hZGluZyBpY29uIGFuZCBhbmltYXRpb24gd2hlbiBjbGlja2luZyBwYWdpbmF0aW9uLiBKdXN0IGZvciB1c2VyIHNhdGlzZmFjdGlvbiBvbiBjbGlja1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHRoaXMucGFnaW5hdGVkQ29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50Q29udGFpbmVyX3BhZ2luYXRlZCcpO1xyXG4gIFxyXG4gICAgICAgIGxldCBwcm9wZXJ0aWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Byb3BlcnRpZXNDb250YWluZXIgLmNvbnRlbnRCb3gnKTtcclxuICAgICAgICBsZXQgbWVtYmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZW1iZXJzQ29udGFpbmVyIC5jb250ZW50Qm94Jyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFnaW5hdGVkQ29udGVudCA9IFtwcm9wZXJ0aWVzLCBtZW1iZXJzXTtcclxuICAgICAgICB0aGlzLmdyb3VwTmFtZTtcclxuICAgICAgICAvLyBNYWtlIHdvcmsgZm9yIGFsbCBwYWdpbmF0ZSB0aHJvdWdoIGEgbG9vcD9cclxuICAgICAgICB0aGlzLnBvc3RQYWdlU2VsZWN0O1xyXG4gICAgICAgIHRoaXMucG9zdFBhZ2VPcHRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UHJvcGVydGllc1BhZ2UgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE1heWJlIHB1dCBhbGwgdGhpbmdzIGluIHRoaXMgb2JqZWN0IHdoZW4gZnVzZVxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0ge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiAwLFxyXG4gICAgICAgICAgICBtZW1iZXJzOiAwXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnREaXJlY3Rpb247XHJcblxyXG4gICAgICAgIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIC8vIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgLy9zcGlubmVyIGZhbHNlIGJlZm9yZSB0aGUgcHJldiBpcyB0cnVlXHJcblxyXG4gICAgICAgIC8vRG8gc21hbGxlciBvbmVzIGZvciBwYWdpbmF0ZSBhbmQgZm9yIHRoZSBmb3JtIHN1Ym1pdHMsIGFzIHdlbGwgYXMgc2VhcmNoIG9uIHRoZSBhbGwgbmV3cyBwYWdlIGFuZCBhbnkgb3RoZXIgcGFnaW5hdGlvbiBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICAvLyB0aGlzLmh0bWwuc3R5bGUuZm9udFNpemUgPSBgJHt0aGlzLnZoKi4wMTd9cHhgO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMudmgqLjAxNylcclxuICAgICAgICBpZih0aGlzLmZyb250VGVzdCl7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IG1haW5Mb2FkZXJUZXh0ID0gW1wiT25lIE1vbWVudCBQbGVhc2UuLi5cIiwgXCJQZXJmZWN0aW9uIHRha2VzIHRpbWVcIiwgXCJHcm9hbmluZyBvbmx5IG1ha2VzIHRoaXMgc2xvd2VyLi4uXCIsIFwiSSdtIHdhdGNoaW5nIHlvdS4uLiA6KVwiXHJcbiAgICAgICAgICAgIC8vICwgXCJDb21tZW5jaW5nIEhhY2sgOylcIiwgXCJPbmUgTW9tZW50LiBSZXRyaWV2aW5nIHlvdXIgU1NOXCIsIFwiU2hhdmluZyB5b3VyIGNhdC4uLlwiLCBcIllvdSBsaWtlIFNjYXJ5IE1vdmllcy4uLj8gPjopXCJdO1xyXG4gICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJhbmRvbSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1haW5Mb2FkZXJUZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJlc3VsdCA9IG1haW5Mb2FkZXJUZXh0W3JhbmRvbV07XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcy5wYWdlTG9hZGVyLnNldEF0dHJpYnV0ZSgnZGF0YS1jdXJ0YWluLXRleHQnLCBgJHtyZXN1bHR9YClcclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1sb2FkZXInKTtcclxuXHJcbiAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgY29udGVudEludGVyZmFjZSgpe1xyXG4gICAgICAgIC8vSSB0aGluayB0aGF0IEkgbmVlZCB0byBkZWxheSBjbGlja2FiaWxpdHkgZm9yIHRvdWNoLCBvdGhlcndpc2UgY2FuIGNsaWNrIHdoZW4gYnJpbmdpbmcgdXBcclxuICAgICAgICAvL0Fsc28sIHBlcmhhcHMgSSBuZWVkIHRvIGFkZCBhIHN5bWJvbCB0byBpbmRpY2F0ZSB0aGF0IHlvdSBjYW4gYnJpbmcgdXAgb3B0aW9ucyBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRpc3BsYXlTcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc3BsYXlTcXVhcmVzJyk7XHJcbiAgXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5SW1hZ2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc3BsYXlJbWFnZXMnKTtcclxuICAgICAgICB0aGlzLm1hZ25pZnlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZmEtc2VhcmNoLXBsdXMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5U3F1YXJlcy5mb3JFYWNoKGRpc3BsYXlTcXVhcmUgPT4ge1xyXG4gICAgICAgICAgbGV0IGxpbmsgPSBkaXNwbGF5U3F1YXJlLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MnKTtcclxuICAgICAgICAgIGxldCBpbWFnZSA9IGRpc3BsYXlTcXVhcmUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKTtcclxuICAgICAgICAgIGxldCBtYWduaWZ5QnV0dG9uID0gZGlzcGxheVNxdWFyZS5xdWVyeVNlbGVjdG9yKCcuZmEtc2VhcmNoLXBsdXMnKVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBkaXNwbGF5U3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGUgPT4ge1xyXG5cclxuICAgICAgICAgICAgICBsaW5rLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGltYWdlLmNsYXNzTGlzdC5hZGQoJ3BhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGxpbmsuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICAgICAgICBpZihtYWduaWZ5QnV0dG9uKXtcclxuICAgICAgICAgICAgICAgIG1hZ25pZnlCdXR0b24uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgICAgIGxpbmsuc3R5bGUucG9pbnRlckV2ZW50cyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYobWFnbmlmeUJ1dHRvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFnbmlmeUJ1dHRvbi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSwgMzAwKSAgICAgICAgICBcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIGRpc3BsYXlTcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgZSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgIGxpbmsuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzX192aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgaW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSgncGFnZUxpbmtzX192aXNpYmxlJyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgICBcclxuICAgICAgdGhpcy5tYWduaWZ5QnV0dG9uLmZvckVhY2goYiA9PnsgXHJcbiAgICAgICAgICBiLm9uY2xpY2sgPSBlPT57XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSBlLnRhcmdldC5jbG9zZXN0KCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJykucHJldmlvdXNFbGVtZW50U2libGluZy5jbG9uZU5vZGUoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coaW1hZ2UpXHJcbiAgICAgICAgICAgIC8vUGVyaGFwcyBjYXJyeSBvdmVyIGFzc29jaWF0ZWQgbmV3cywgYXMgd2VsbFxyXG5cclxuICAgICAgICAgICAgLy90aGlzIGlzIG5vdCBuZWNlc3NhcnkgYXMgb25lIGRpcmVjdGx5IGJlbG93IGRvZXMgaXQgYnkgYWNjZXNzaW5nIHRoZSBwYXJlbnQgYW5kIHF1ZXJ5IHNlbGVjdGluZywgYnV0IGtlZXBpbmcgdGhpcyBhcyBjb3VsZCBiZSB1c2VmdWwgdG8gaGF2ZSBvbiBoYW5kXHJcbiAgICAgICAgICAgIHRoaXMuZmluZFNwZWNpZmllZFByZXZpb3VzKGUudGFyZ2V0LCAnbW9yZS1pbmZvLWxpbmsnKTtcclxuICAgICAgICAgICAgLy8gdGhpcy50YXJnZXRlZEVsZW1lbnQgPSBlLnRhcmdldC5jbG9zZXN0KCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJykucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlCb3guaW5zZXJ0QmVmb3JlKHRoaXMudGFyZ2V0ZWRFbGVtZW50LCB0aGlzLmNsb3NlTWFnbmlmeSk7XHJcbiAgICAgICBcclxuICAgICAgICAgICAgLy8gdGhpcy5kaXNwbGF5Qm94LnByZXBlbmQoaW1hZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnByZXBlbmQoaW1hZ2UpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICAgICAgICAgIHRoaXMub3BlbkJ1dHRvbi5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgIGUuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgdGhpcy5jbG9zZU1hZ25pZnkub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgdGhpcy5pbWFnZUhvbGRlci5xdWVyeVNlbGVjdG9yKCdpbWcnKS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlCb3gucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICBlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5yZW1vdmUoJ2ZyZWV6ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL2NoYW5nZSB0byBiZSBmcHIgZWl0aGVyIGRpcmVjdGlvbmFsIHRvIGdldCBsZXQsIHdpdGggaWYgc3RhdGVtZW50c1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBvcC11cC1kaXJlY3Rpb25hbCcpLmZvckVhY2goYnV0dG9uPT57XHJcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vTWFrZSBuZXh0IGFuZCBwcmV2IHVuY2xpY2thYmxlIGlmIG5vdGhpbmcgdGhlcmUgdG8gZ28gdG9cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRJbWFnZSA9IHRoaXMuZGlzcGxheUJveC5xdWVyeVNlbGVjdG9yKCdpbWcnKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXROYW1lID0gY3VycmVudEltYWdlLmRhdGFzZXQubmFtZTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0eXBlID0gYnV0dG9uLmlkO1xyXG4gICAgICAgICAgICBsZXQgbmV3SW1hZ2VDb250YWluZXI7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHR5cGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVNxdWFyZXMuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgICAgICBpZihlLnF1ZXJ5U2VsZWN0b3IoYC5kaXNwbGF5SW1hZ2VzW2RhdGEtbmFtZT0ke3RhcmdldE5hbWV9XWApKXtcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09PSAnbmV4dC1pbWFnZScpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUNvbnRhaW5lciA9IGUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9zZXN0KCcub3ZlcmFsbC1zcXVhcmVzJykubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUNvbnRhaW5lciA9IGUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9zZXN0KCcub3ZlcmFsbC1zcXVhcmVzJykucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmV3SW1hZ2VDb250YWluZXIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3SW1hZ2UgPSBuZXdJbWFnZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheUltYWdlcycpLmNsb25lTm9kZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TGluayA9IG5ld0ltYWdlQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLm1vcmUtaW5mby1saW5rJykuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLnJlcGxhY2VXaXRoKG5ld0ltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnF1ZXJ5U2VsZWN0b3IoJy5tb3JlLWluZm8tbGluaycpLnJlcGxhY2VXaXRoKG5ld0xpbmspO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmaW5kU3BlY2lmaWVkUHJldmlvdXMoc291cmNlLCBpZGVudGlmaWVyKXtcclxuICAgICAgICAvLyB0aGlzIHdpbGwgbmVlZCB0byBiZSB0d2Vha2VkIGhhbmRsZSBub24tbmVzdGVkLCBhcyB3ZWxsIGFzIG90aGVyIG5lZWRzXHJcbiAgICAgICAgbGV0IGxpbmsgPSBzb3VyY2UucGFyZW50RWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgIHdoaWxlIChsaW5rKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5rLmNsYXNzTmFtZS5pbmNsdWRlcyhpZGVudGlmaWVyKSkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldGVkRWxlbWVudCA9IGxpbmsuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50YXJnZXRlZEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluayA9IGxpbmsucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgfSBcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBwYWdpbmF0ZSgpe1xyXG4gICAgICAgIC8vY3JlYXRlIG5ldyBzZWFyY2ggc2V0LXVwIGZvciBqdXN0IHRoZSBtZW1iZXIgcHJvcCBwYWdpbmF0aW9uPyBMaWtlLCBnbyBtYWtlIG5ldyBpbmMgcGFnZVxyXG4gICAgICAgIC8vVXNlIHBvc3QtdHlwZSAnaWYnIHRoYXQgY2hlY2tzIGZvciB0aGUgaWQ/IEFjdHVhbGx5LCBJIGNhbiB1c2UgdGhlIHJlc3V0cyBhcnJheSBhcyBjYW4gcGx1cmFsaXplXHJcblxyXG4gICAgICAgIC8vc3RhcnQgYnkgaW5zZXJ0aW5nIHJhbmRvbSBzaGl0IGluIGJvdGg/XHJcbiAgICAgICAgLy9zZXQtdXAgdGhpcyB1cCB0byBub3QgcmVwbGFjZSBjb250ZW50LCBpZiBqYXZhc2NyaXB0IHR1cm5lZCBvZmYsIGFsb25nIHdpdGggaW5zZXJ0aW5nIGEgYnV0dG9uIHRvIHNlZSBhbGxcclxuICAgICAgICAvL2FuZCBtYWtlIHRoYXQgc2VlIGFsbCBwYWdlXHJcbiAgICAgICAgLy9JIHRoaW5rIEknbGwgbWFrZSB0aGUgc2VlIGFsbCBidXR0b24sIGJ1dCByZXBsYWNlIGl0J3MgY29udGVudHMgdGhyb3VnaCBoZXJlLCBzbyBpZiB0aGlzIGRvZXNuJ3QgcnVuLCBpdCdsbCBiZSB0aGVyZVxyXG4gICAgICAgIC8vZGlzYWJsZSBzY3JpcHQgaW4gYnJvd3NlciB0byBjaGVjay93b3JrIG9uIHN0dWZmXHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAvL0lzIGl0IGJldHRlciBqdXN0IHRvIHVzZSBzZXBlcmF0ZSB1cmwgcm91dGVzPyBcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL2NvbnRlbnQ/cGFnZScpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAvLyBsZXQgY3VycmVudE1lbWJlcnNTaG93biA9IHRoaXMuY3VycmVudFBhZ2VzLm1lbWJlcnM7XHJcbiAgICAgICAgICAgIC8vIGxldCBjdXJyZW50UHJvcGVydGllc1Nob3duID0gdGhpcy5jdXJyZW50UGFnZXMucHJvcGVydGllcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcG9zdE91dHB1dDtcclxuICAgICAgICAgICAgLy8gd2luZG93LmFsZXJ0KCdvbiB0YWJsZXQhJylcclxuICAgICAgICAgICAgLy9Db25zaWRlciBsb2NhbGl6ZWQgcmVsb2FkIG9uIHBhZ2UgcmVzaXplXHJcbiAgICAgICAgICAgIGlmKHdpbmRvdy5pbm5lcldpZHRoID49IDEyMDApe1xyXG4gICAgICAgICAgICAgICAgcG9zdE91dHB1dCA9IDg7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcG9zdE91dHB1dCA9IDY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwb3N0UGFnZSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgcG9zdFBhZ2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRzS2V5cyA9IE9iamVjdC5rZXlzKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZTtcclxuICAgICAgICAgICAgbGV0IHBvc3Q7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50U2hvd247XHJcbiAgICAgICAgICAgIGxldCBwYWdpbmF0aW9uTG9jYXRpb247XHJcbiBcclxuICAgICAgICAgICAgLy9Vc2UgYSBmb3IgbG9vcCBoZXJlPyBmb3IgcmVzdWx0IG9mIHJlc3VsdHM/XHJcbiAgICAgICAgICAgIC8vIG1ha2UgdGhpcyBpbnRvIGFuIGFycmF5IGFuZCBwdXQgaW4gaWYgYSBsb29wP1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lclR5cGUgPSB0aGlzLnBhZ2luYXRlZENvbnRlbnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyVHlwZUxvY2F0aW9uID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbnRlbnRMb2FkZWQpe1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCB0eXBlIG9mIHJlc3VsdHNLZXlzKXtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdHlwZTtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0ID0gcmVzdWx0c1tuYW1lXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCA8PSBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gcG9zdE91dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZSA9IHBvc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIG5lZWQgdG8gbWFkZSBtb3JlIHZlcnNhdGlsZSBpZiBkZWNpZGUgdG8gdW5pdmVyc2FsaXplIHBhZ2luYXRpb25cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0UGFnZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IHBvc3RQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc1t0eXBlXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocG9zdFBhZ2VzWzBdKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2VOYW1lID0gdHlwZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXS5jbGFzc0xpc3QuYWRkKHR5cGUpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydENvbnRlbnQoY29udGFpbmVyVHlwZVtjb250YWluZXJUeXBlTG9jYXRpb25dLCBjb250ZW50U2hvd24sIHBhZ2VOYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Mb2NhdGlvbiA9IGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy50ZXh0Qm94JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKHBhZ2luYXRpb25Mb2NhdGlvbiwgcG9zdFBhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCwgcGFnZU5hbWUpICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclR5cGVMb2NhdGlvbis9IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBvc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzID0gW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TmV4dEFjdGl2YXRpb24oKTsgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy90ZW1wIHVudGlsIGNoYW5nZSBzZXQtdXAgdG8gbWFrZSBzZWN0aW9uIGxvYWRlciB3b3JrXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VMb2FkZXIuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJylcclxuICAgICAgICAgICAgICAgIHBvc3QgPSByZXN1bHRzW3RoaXMuZ3JvdXBOYW1lXVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoIDw9IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZW0gPSAxOyBpdGVtIDw9IHBvc3RPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IHBvc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBwb3N0UGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzLnB1c2gocG9zdFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IHBvc3RQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV1dO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnRCb3guJHt0aGlzLmdyb3VwTmFtZX1gKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0Q29udGVudCh0YXJnZXQsIGNvbnRlbnRTaG93biwgdGhpcy5ncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBbmRQcmV2aW91cygpOyBcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBY3RpdmF0aW9uKCk7IFxyXG5cclxuICAgICAgICAgICAgICAgIC8vY2hhbmdlIHRvIGFkZGluZyBmYWRlLWNsYXNzLCBiZWZvcmUgcmVtb3ZpbmcgYWN0aXZlLCBzbyBnb2VzIGF3YXkgc21vb3RoZXJcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PnRoaXMucGFnZUxvYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSwgODEwKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+dGhpcy5wYWdlTG9hZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpLCA4MTApOyBcclxuICAgICBcclxuICAgICAgICAgICAgLy9DYW4gSSBsb29wIHRocm91Z2ggdGhlIGRpZmYgcmVzdWx0cywgdXNpbmcgdmFyaWFibGUocykgYmVmb3JlIHRoZSBpbm5lckh0bWwgYW5kIHRoZSBtYXAsIGFzIHdlbGwgYXMgdGhlIHBhZ2UgY29udGFpbmVyP1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gSG93IHRvIGdldCBwb3N0IG5hbWUsIHRob3VnaD8gQ2FuIEkgYXBwbHkgYSBmb3JlYWNoIHRvIHRoZW0gYW5kIGdyYWIgdGhlIHBvc3QgdHlwZT8gQ291bGQgSSBpbmNsdWRlIGluIHJlc3Qgcm91dGVcclxuXHJcbiAgICAgICAgICAgIC8vSGF2ZSBsb2dpYyB0aGF0IG9ubHkgaGFzIHRoZSBwcm9jZXNzIGZvciB0aGUgc2VsZWN0ZWQgc2VjdGlvbiBydW4gYWdhaW4sIHBlcmhhcHMgdmlhIGEgdmFyaWFibGUgaW4gdGhlIGNhbGwgYmVsb3cuIFxyXG4gICAgICAgICAgICAvL2llLiB0aGlzLnBhZ2luYXRlKCdtZW1iZXJzJylcclxuICAgICAgICAgICAgLy9NYXliZSB0aGUgcGFnaW5hdGlvbiBjb3VsZCBiZSBzcGxpdCB1cCwgd2l0aCB0aGUgaHRtbCBpbnNlcnRpb24gYmVpbmcgYSBzZXBlcmF0ZWx5IGNhbGxlZCBmdW5jdGlvbiB0aGF0IGlzIHJlcGVhdGVkXHJcbiAgICAgICAgICAgIC8vdGhyb3VnaCBhIGxvb3BzIGNvbnNpc3Rpbmcgb2YgdmFyaWFibGVzIGhlcmUsIGFuZCBjb3VsZCBzaW1wbHkgYmUgY2FsbGVkIGFnYWluIHdpdGggYSBzcGVjaWZpYyB2YXJpYWJsZSAgXHJcbiAgICAgICAgICAgIC8vT3Igc2ltcGx5IGp1c3Qgc2VwZXJhdGUgdGhpcyBhbGwgXHJcblxyXG4gICAgICAgICAgICAvL3NpbXBseSBkaXNwbGF5IGRpZmZlcmVudCB0aGluZ3MsIG5lZWQgdHdvIGRpZmYgaHRtbCBibG9ja3MsIGJ1dCBlYWNoIGNhbiBjYWxsZWQgdXBvbiBzZXBlcmF0ZWx5LCBhcyBkaWZmZXJlbnQgaW5uZXJIdG1sIGJsb2Nrc1xyXG5cclxuICAgICAgICAgICAgLy9CdXQgdGhlbiBhZ2FpbiwgYSB1bmlmb3JtZWQgZGlzcGxheWVkIGNvdWxkIGJlIGFjaGlldmVkIHdpdGggdGVybmFyeSBvcGVyYXRvcnMsIGNoZWNraW5nIGZvciB0aXRsZV9vcl9wb3NpdGlvblxyXG4gICAgICAgICAgICAvL0FuZCBjaGVja2luZyBmb3Igc29tZXRoaW5nIHRoYXQgY291bGQgcnVsZSBvdXQgdGhlIG1hZ25pZnlpbmcgYnV0dG9uIGFuZCB0aGUgbG9jYXRpb24gbGlua1xyXG5cclxuICAgICAgICAgICAgLy9DYW4gSSBtb3ZlIHRoaXMgQW5kIGp1c3QgbG9vcCBjYWxsIHRoaXM/XHJcblxyXG4gICAgICAgICAgICAvL01ha2Ugd29yayBhZ2Fpbi4gQW5kIHZlcnNhdGlsZVxyXG4gICAgICAgICAgICAvL0RvIEkgbmVlZCB0aGlzIGFueW1vcmUsIHRob3VnaD9cclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBhY3RpdmVQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcGFnZT0nJHtjdXJyZW50TWVtYmVyc1Nob3dufSddYCk7XHJcbiAgICAgICAgICAgIC8vIGFjdGl2ZVBhZ2luYXRpb24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICBcclxuICAgICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb250ZW50SW50ZXJmYWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5zZXJ0Q29udGVudChkZXN0aW5hdGlvbiwgdHlwZSwgcGFnZU5hbWUpe1xyXG4gICAgICAgICAgICAvL0NoYW5nZSBkZXNpdGluYXRpb24gc2V0LXVwIHRvIGFjY29tYWRhdGUgbG9hZGVyXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBhZ2VOYW1lKVxyXG4gICAgICAgICAgICAvL3JlcGxhY2Ugd29yZCBpbnRlcmFjdGlvbiBwcm9tcHRzLCB3aXRoIGN1c3RvbSwgZHJhd24gc3ltYm9sc1xyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAke3R5cGUubWFwKGl0ZW0gPT4gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm92ZXJhbGwtc3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5U3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImludGVyYWN0aW9uLXByb21wdFwiPjxzcGFuIGNsYXNzPVwiY2xpY2stcHJvbXB0XCI+VG91Y2g8L3NwYW4+PHNwYW4gY2xhc3M9XCJob3Zlci1wcm9tcHRcIj5Ib3Zlcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy52dyA+PSAxMjAwID8gYDxpbWcgY2xhc3M9XCJkaXNwbGF5SW1hZ2VzXCIgZGF0YS1uYW1lPVwiJHtpdGVtLnRpdGxlLnJlcGxhY2VBbGwoJyAnLCAnJyl9XCIgc3JjPVwiJHtpdGVtLmlzQ29tcGxldGVkIHx8IGl0ZW0ucG9zdFR5cGUgPT09ICdtZW1iZXInID8gaXRlbS5pbWFnZSA6IGl0ZW0ucHJvamVjdGVkSW1hZ2V9XCIgYWx0PVwiJHtpdGVtLnRpdGxlfVwiPmA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMudncgPCAxMjAwID8gYDxpbWcgY2xhc3M9XCJkaXNwbGF5SW1hZ2VzXCIgZGF0YS1uYW1lPVwiJHtpdGVtLnRpdGxlLnJlcGxhY2VBbGwoJyAnLCAnJyl9XCIgc3JjPVwiJHtpdGVtLmlzQ29tcGxldGVkIHx8IGl0ZW0ucG9zdFR5cGUgPT09ICdtZW1iZXInID8gaXRlbS5pbWFnZU1lZGl1bSA6IGl0ZW0ucHJvamVjdGVkSW1hZ2VNZWRpdW19XCIgYWx0PVwiJHtpdGVtLnRpdGxlfVwiPmA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cIm1vcmUtaW5mby1saW5rXCIgaHJlZj1cIiR7aXRlbS5wZXJtYWxpbmt9XCI+RmluZCBPdXQgTW9yZTwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3NpdGVEYXRhLnJvb3RfdXJsfS9hbGwtbmV3cy8jJHtpdGVtLmlkfS1yZWxhdGVkLSR7aXRlbS5wb3N0VHlwZVBsdXJhbH1cIj5Bc3NvY2lhdGVkIE5ld3M/PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtwYWdlTmFtZSA9PT0gJ3Byb3BlcnRpZXMnID8gJzxidXR0b24+PGkgY2xhc3M9XCJmYXMgZmEtc2VhcmNoLXBsdXNcIj48L2k+PC9idXR0b24+JzogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5LXRleHRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLnRpdGxlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLnBvc2l0aW9uT3JSb2xlICE9PSB1bmRlZmluZWQgPyBgPHA+JHtpdGVtLnBvc2l0aW9uT3JSb2xlfTwvcD5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+ICAgXHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgaW5zZXJ0UGFnaW5hdGlvbihkZXN0aW5hdGlvbiwgcG9zdFBhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCwgcGFnZU5hbWUpe1xyXG4gICAgICAgIC8vUHV0IGluICduZXh0JyBhbmQgJ3ByZXYnIGJ1dHRvbnNcclxuICAgICAgICAvL01ha2UgbnVtYmVycyBMYXJnZSBhbmQgY2VudGVyZWQsIGFuZCBwZXJoYXBzIHB1dCBhIGJveCBhcm91bmQgdGhlbSwgYWxvbmcgd2l0aCBmYW5jeSBzdHlsaW5nIGFsbCBhcm91bmRcclxuICAgICAgICBkZXN0aW5hdGlvbi5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgXCJiZWZvcmVlbmRcIixcclxuICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPyAnPGRpdiBjbGFzcz1cImNvbnRlbnQtcGFnZXNcIj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPiAxICA/IGA8YSBpZD1cIiR7cGFnZU5hbWV9LXByZXZcIiBjbGFzcz1cIiR7cGFnZU5hbWV9LWdyb3VwICR7cGFnZU5hbWV9LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c1wiPlByZXY8L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAke3Bvc3RQYWdlcy5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPiAxID8gYDxhIGNsYXNzPVwiY29udGVudC1wYWdlICR7cGFnZU5hbWV9LWdyb3VwXCIgZGF0YS1wYWdlPVwiJHtkYXRhQ291bnQrK31cIj4gJHtwYWdlQ291bnQgKz0gMX08L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICBgKS5qb2luKCcnKX0gIFxyXG4gICAgICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID4gMSA/IGA8YSBpZD1cIiR7cGFnZU5hbWV9LW5leHRcIiBjbGFzcz1cIiR7cGFnZU5hbWV9LWdyb3VwICR7cGFnZU5hbWV9LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9uZXh0XCI+TmV4dDwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICR7cG9zdFBhZ2VzLmxlbmd0aCA/ICc8L2Rpdj4nIDogJyd9IFxyXG5cclxuICAgICAgICBgKTtcclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9wcmV2aW91cycpOyAgICBcclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpICBcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5mb3JFYWNoKGVsPT5lbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKSlcclxuXHJcbiAgICAgICAgbGV0IGNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LXBhZ2UnKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShjb250ZW50UGFnZU9wdGlvbnMpO1xyXG4gICAgfVxyXG4vLyB0aGlzIG5ldyBzZXR1cCBjYXVzZXMgaXNzdWVzIGFmdGVyIGRpcmVjdGlvbmFsIGJ1dHRvbnMgdXNlZDogc2VsZWN0ZWRQYWdlIFxyXG4vL25vdCBiZWluZyBhZGRlZCB0byBjbGlja2VkIGFuZCBjdXJyZW50UGFnZSBvbiBkaXJlY3Rpb25hbCBnZXRzIGVycm9yXHJcbi8vTGF0dGVyIGxpa2VseSBjb25uZWN0ZWQgdG8gdGhlIGZvcm1lclxyXG5cclxuICAgIHBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KGNvbnRlbnRQYWdlT3B0aW9ucyl7XHJcbiAgICAgICAgLy9Db21iaW5lIHRoZSB0d28gYmVsb3dcclxuICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhZ2UuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCgvLWdyb3VwLykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTmFtZSA9IG5hbWUuc2xpY2UoMCwgLTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0ZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSlcclxuICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKHRoaXMuZ3JvdXBOYW1lKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pICBcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy8gY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgIC8vICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+e1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChpID0+eyBcclxuICAgICAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKVxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGkuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2godGhpcy5ncm91cE5hbWUpKXtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAvLyAgICAgICAgICAgICB9KVxyXG4gICAgICAgIC8vICAgICAgICAgfSkgIFxyXG4gICAgICAgIC8vICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgLy8gICAgIH0sIHsgb25jZTogdHJ1ZSB9KTtcclxuICAgICAgICAvLyB9KVxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgY29udGVudE5leHRBY3RpdmF0aW9uKCl7XHJcbiAgICAgICAgbGV0IGFsbG5leHRCdXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTtcclxuXHJcbiAgICAgICAgYWxsbmV4dEJ1dHRvbnMuZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gKGUpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkUGFnZS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKC8tZ3JvdXAvKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lID0gbmFtZS5zbGljZSgwLCAtNik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwLnNlbGVjdGVkUGFnZWApO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IG5leHRQYWdlID0gdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gPSBuZXh0UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIlwiOyB9LCA5MjApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdfVwiXWApO1xyXG4gICAgICAgICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld0N1cnJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgfTtcclxuXHJcbiAgICBjb250ZW50TmV4dEFuZFByZXZpb3VzKCl7XHJcbiAgIFxyXG4gICAgICAgIHRoaXMuY29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbicpOyAgICAgXHJcblxyXG4gICAgICAgIGxldCBwcmV2QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5ncm91cE5hbWV9LXByZXZgKVxyXG4gICAgICAgIGxldCBuZXh0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5ncm91cE5hbWV9LW5leHRgKVxyXG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwLnNlbGVjdGVkUGFnZWApO1xyXG5cclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA+IDApe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50UGFnZXMpXHJcbiAgICAgICAgICAgICAgICBwcmV2QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXh0Q29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGlmKCFuZXh0QnV0dG9uLnByZXZpb3VzRWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZFBhZ2UnKSl7XHJcbiAgICAgICAgICAgICAgICBuZXh0QnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSAtIDE7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA9IHByZXZQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe2VsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgOTIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cFtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXX1cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9maXggcmVwZWF0IG9mIG5leHRCdXR0b24gZnVuY3Rpb25hbGl0eVxyXG4gICAgICAgIC8vIHRoaXMubmV4dENvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgIC8vICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAvLyAgICAgICAgIGxldCBuZXh0UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzW3BhZ2VOYW1lXSArIDE7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbcGFnZU5hbWVdID0gbmV4dFBhZ2U7XHJcbiAgICAgICAgLy8gICAgICAgICBjdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAvLyAgICAgICAgIG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHtwYWdlTmFtZX0tZ3JvdXBbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc1twYWdlTmFtZV19XCJdYCk7XHJcbiAgICAgICAgLy8gICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhZ2luYXRpb24iLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCJcclxuXHJcbmNsYXNzIFNlYXJjaCB7XHJcbiAgICAvLyAxLiBkZXNjcmliZSBhbmQgY3JlYXRlL2luaXRpYXRlIG91ciBvYmplY3RcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5hZGRTZWFyY2hIdG1sKCk7XHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImhlYWRlclwiKTtcclxuICAgICAgICB0aGlzLnJlc3VsdHNEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlYXJjaC1vdmVybGF5X19yZXN1bHRzXCIpO1xyXG4gICAgICAgIC8vSWYgb3BlbiBkaWYgb3BlbiBidXR0b24gZm9yIG1vYmlsZSB2cyBkZXNrdG9wXHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1zZWFyY2gtdHJpZ2dlclwiKTtcclxuICAgICAgICB0aGlzLmNsb3NlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZWFyY2gtb3ZlcmxheV9fY2xvc2VcIik7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hPdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zZWFyY2gtb3ZlcmxheVwiKTtcclxuICAgICAgICB0aGlzLnNlYXJjaFRlcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoLXRlcm0nKTtcclxuICAgICAgICB0aGlzLmlzT3ZlcmxheU9wZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWU7XHJcbiAgICAgICAgdGhpcy50eXBpbmdUaW1lcjtcclxuLy9HZXQgcmlkIG9mIHRoaXMgYW5kIHRoZSBwYWdpbmF0aW9uIGxvZ2ljLCByZXNldGluZyB0aGUgbmV3cyByZW5kZXJpbmdcclxuICAgICAgICB0aGlzLm5ld3NQYWdlU2VsZWN0O1xyXG4gICAgICAgIHRoaXMubmV3c1BhZ2VPcHRpb247XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TmV3c1BhZ2UgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gMi4gZXZlbnRzXHJcbiAgICBldmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIHRoaXMub3Blbk92ZXJsYXkoKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiBcclxuICAgICAgICB0aGlzLmNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlT3ZlcmxheSgpKVxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGUgPT4gdGhpcy5rZXlQcmVzc0Rpc3BhdGNoZXIoZSkpXHJcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoKSA9PiB0aGlzLnR5cGluZ0xvZ2ljKCkpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gMy4gbWV0aG9kcyAoZnVuY3Rpb24sIGFjdGlvbi4uLilcclxuICAgIHR5cGluZ0xvZ2ljKCkge1xyXG4gICAgICAgIGlmKHRoaXMuc2VhcmNoVGVybS52YWx1ZSAhPT0gdGhpcy5wcmV2aW91c1ZhbHVlKXtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudHlwaW5nVGltZXIpO1xyXG4gICAgICAgICAgICBpZih0aGlzLnNlYXJjaFRlcm0udmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaXNTcGlubmVyVmlzaWJsZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzRGl2LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lci1sb2FkZXJcIj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGluZ1RpbWVyID0gc2V0VGltZW91dCh0aGlzLmdldFJlc3VsdHMuYmluZCh0aGlzKSwgODAwKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHNEaXYuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLnNlYXJjaFRlcm0udmFsdWU7XHJcbiAgICB9XHJcbi8vQWRkIGNvbG9yaW5nIHRvIHRleHQgdGhhdCBtYXRjaGVzIHNlYXJjaCBxdWVyeSBhbmZkIG1heWJlIGRvbid0IHNob3cgdGl0bGUgYXQgYWxsIGlmIG5vIGNvbnRlbnQoPylcclxuICAgIGFzeW5jIGdldFJlc3VsdHMoKXtcclxuICAgICAgdHJ5e1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9zZWFyY2g/dGVybT0nICsgdGhpcy5zZWFyY2hUZXJtLnZhbHVlKTsgXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMuY3VycmVudE5ld3NQYWdlO1xyXG4gICAgICAgIGxldCB5ID0gMDtcclxuICAgICAgICBsZXQgaXRlbTtcclxuICAgICAgICBjb25zdCBwb3N0T3V0cHV0ID0gMztcclxuICAgICAgICBjb25zdCBuZXdzID0gcmVzdWx0cy51cGRhdGVzQW5kTmV3cztcclxuICAgICAgICBsZXQgbmV3c1BhZ2UgPSBbXTtcclxuICAgICAgICBsZXQgbmV3c1BhZ2VzID0gW107XHJcbiAgICAgICAgbGV0IG5ld3NTaG93bjtcclxuICAgICAgICBsZXQgcGFnZUxpc3ROdW1iZXIgPSAwO1xyXG4gICAgICAgIGlmKG5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgaWYobmV3cy5sZW5ndGggPD0gcG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlcy5jb25jYXQobmV3cyk7XHJcbiAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3cy5sZW5ndGggPiBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcihpdGVtID0gMTsgaXRlbSA8PSBwb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IG5ld3Muc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UucHVzaChyZW1vdmVkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIGlmKG5ld3MubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZSA9IG5ld3Muc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKG5ld3NQYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihuZXdzUGFnZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgbmV3c1Nob3duID0gbmV3c1BhZ2VzW3hdO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBuZXdzU2hvd24gPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVzdWx0c0Rpdi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbmUtdGhpcmRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheV9fc2VjdGlvbi10aXRsZVwiPlByb3BlcnRpZXM8L2gyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5wcm9wZXJ0aWVzLmxlbmd0aCA/ICc8dWwgY2xhc3M9XCJsaW5rLWxpc3QgbWluLWxpc3RcIj4nIDogYDxwPk5vIHByb3BlcnRpZXMgbWF0Y2ggdGhhdCBzZWFyY2guPC9wPmB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5wcm9wZXJ0aWVzLm1hcChpdGVtID0+IGA8bGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5U3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImRpc3BsYXlJbWFnZXNcIiBkYXRhLW5hbWU9XCIke2l0ZW0udGl0bGUucmVwbGFjZUFsbCgnICcsICcnKX1cIiBzcmM9XCIke2l0ZW0uaXNDb21wbGV0ZWQgPyBpdGVtLmltYWdlIDogaXRlbS5wcm9qZWN0ZWRJbWFnZX1cIiBhbHQ9XCIke2l0ZW0udGl0bGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtpdGVtLnBlcm1hbGlua31cIj4ke2l0ZW0udGl0bGV9PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLnByb3BlcnRpZXMubGVuZ3RoID8gJzwvdWw+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25lLXRoaXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGVcIj5NZW1iZXJzPC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMubWVtYmVycy5sZW5ndGggPyAnPHVsIGNsYXNzPVwibGluay1saXN0IG1pbi1saXN0XCI+JyA6IGA8cD5ObyBtZW1iZXJzIG1hdGNoIHRoYXQgc2VhcmNoLjwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMubWVtYmVycy5tYXAoaXRlbSA9PiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz0ke2l0ZW0uaW1hZ2V9XCIgYWx0PVwiXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLnBvc2l0aW9uT3JSb2xlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtpdGVtLnBlcm1hbGlua31cIj5SZWFkIE1vcmU8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLm1lbWJlcnMubGVuZ3RoID8gJzwvdWw+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25lLXRoaXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGVcIj5VcGRhdGVzIEFuZCBOZXdzPC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPHVsIGNsYXNzPVwibGluay1saXN0IG1pbi1saXN0XCI+JyA6IGA8cD5ObyBuZXdzIG9yIHVwZGF0ZXMgbWF0Y2ggdGhhdCBzZWFyY2g8L3A+ICA8YSBocmVmPVwiJHtzaXRlRGF0YS5yb290X3VybH0vY3VycmVudFwiPkdvIHRvIHZpZXdzIGFuZCB1cGRhdGUgc2VjdGlvbjwvYT5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke25ld3NTaG93bi5tYXAoaXRlbSA9PiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aDQ+JHtpdGVtLnRpdGxlfTwvaDQ+XHJcbiAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmNhcHRpb24ubGVuZ3RoID49IDEgPyBpdGVtLmNhcHRpb24gKyAnIC0gJyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmRhdGV9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+KnJlbGF0ZWQgd2lsbCBnbyBoZXJlPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpdGVtLmltYWdlICE9PSBudWxsID8gYDxpbWcgc3JjPVwiJHtpdGVtLmltYWdlfVwiIGFsdD1cIlwiPmAgOiBgPGRpdj4ke2l0ZW0udmlkZW99PC9kaXY+YH1cclxuICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJyZWFkLW1vcmVcIiBocmVmPVwiYWxsLW5ld3MvIyR7aXRlbS5pZH1cIj5SZWFkIE1vcmUuLi48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA/ICc8ZGl2IGlkPVwibmV3cy1wYWdlc1wiPicgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID4gMSA/IGA8YSBocmVmPVwiI1wiIGNsYXNzPVwibmV3cy1wYWdlXCIgZGF0YS1wYWdlPVwiJHt5Kyt9XCI+ICR7cGFnZUxpc3ROdW1iZXIgKz0gMX08L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA/ICc8L2Rpdj4nIDogJyd9ICBcclxuICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPC91bD4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYDtcclxuICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZVxyXG4gICAgICAgIGxldCBsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcGFnZT0nJHt4fSddYCk7XHJcbiAgICAgICAgbGluay5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnaXMgaXQgaGFwcGVuaW5nIGJlZm9yZSBjYXRjaD8nKVxyXG4gICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnNvbGUubG9nKCdpcyBpdCBoYXBwZW5pbmcgYWZ0ZXIgY2F0Y2g/JylcclxuICAgICAgICAgICAgdGhpcy5uZXdzUGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubmV3cy1wYWdlJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld3NQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLnRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TmV3c1BhZ2UgPSBzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3VsdHMoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaXMgaXQgaGFwcGVuaW5nIGluIG5ld3NQYWdlT3B0aW9ucz8nKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICBcclxuICAgICB9XHJcblxyXG4gICAga2V5UHJlc3NEaXNwYXRjaGVyKGUpIHtcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09IDgzICYmICF0aGlzLmlzT3ZlcmxheU9wZW4gJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC50YWdOYW1lICE9IFwiSU5QVVRcIiAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUgIT0gXCJURVhUQVJFQVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3Blbk92ZXJsYXkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGUua2V5Q29kZSA9PT0gMjcgJiYgdGhpcy5pc092ZXJsYXlPcGVuKXtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZU92ZXJsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbk92ZXJsYXkoKXtcclxuICAgICAgICB0aGlzLnNlYXJjaE92ZXJsYXkuY2xhc3NMaXN0LmFkZChcInNlYXJjaC1vdmVybGF5LS1hY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5oZWFkZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5hZGQoJ2ZyZWV6ZScpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoVGVybS52YWx1ZSA9ICcnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiB0aGlzLnNlYXJjaFRlcm0uZm9jdXMoKSwgMzAxKTtcclxuICAgICAgICB0aGlzLmlzT3ZlcmxheU9wZW4gPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gICBcclxuICAgIFxyXG4gICAgY2xvc2VPdmVybGF5KCl7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hPdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ3NlYXJjaC1vdmVybGF5LS1hY3RpdmUnKTtcclxuICAgICAgICB0aGlzLmhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LnJlbW92ZSgnZnJlZXplJyk7XHJcbiAgICAgICAgdGhpcy5pc092ZXJsYXlPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkU2VhcmNoSHRtbCgpe1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICBcImJlZm9yZWVuZFwiLFxyXG4gICAgICAgICAgICBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X190b3BcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtc2VhcmNoIHNlYXJjaC1vdmVybGF5X19pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNlYXJjaC10ZXJtXCIgcGxhY2Vob2xkZXI9XCJXaGF0IGFyZSB5b3UgbG9va2luZyBmb3I/XCIgaWQ9XCJzZWFyY2gtdGVybVwiIGF1dG9jb21wbGV0ZT1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtd2luZG93LWNsb3NlIHNlYXJjaC1vdmVybGF5X19jbG9zZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwic2VhcmNoLW92ZXJsYXlfX3Jlc3VsdHNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNlYXJjaCIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcbi8vQ29tYmluZSB3aXRoIG90aGVyIHBhZ2luYXRpb24/XHJcblxyXG5jbGFzcyBTaGFkb3dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sO1xyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rO1xyXG5cclxuICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXI7XHJcbiAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkOyBcclxuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYTtcclxuICAgICAgICB0aGlzLm1lZGlhTWVudTtcclxuICAgICAgICB0aGlzLm1lZGlhQ29sdW1uO1xyXG4gICAgICAgIHRoaXMubWVkaWFUaHVtYjtcclxuICAgICAgICB0aGlzLm1lZGlhUGFnaW5hdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy52aWRlb1NyYztcclxuICAgICAgICB0aGlzLnBsYXlCdXR0b247XHJcbiAgICAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGFDb3VudDtcclxuICAgICAgICB0aGlzLnBvc3RPdXRwdXQ7XHJcbiAgICAgICAgdGhpcy5wYWdlQ291bnQ7XHJcbiAgICAgICAgdGhpcy5wb3N0UGFnZTtcclxuICAgICAgICB0aGlzLnBvc3RQYWdlcztcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuXHJcbiAgICAgICAgLy9SZXNldCB3aGVuIGNoYW5nZSBmaWx0ZXIgYW5kIGRpc21pc3MgY3VycmVudCB2aWRzXHJcbiAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb247IFxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbjtcclxuICAgICAgICB0aGlzLnBvc3RGaWVsZDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYTtcclxuICAgICAgICB0aGlzLmNsb3NlTWVkaWFCdXR0b247XHJcblxyXG4gICAgICAgIHRoaXMubmV3TG9hZDtcclxuXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudE93bmVySWQgPSBudWxsOyBcclxuICAgICAgICB0aGlzLm1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIConKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LW1lZGlhJyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYU1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtbWVudScpO1xyXG4gICAgICAgIHRoaXMubWVkaWFDb2x1bW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY29sdW1uJyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYVRodW1iO1xyXG4gICAgICAgIHRoaXMubWVkaWFQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24nKTtcclxuICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7IFxyXG4gICAgICAgIHRoaXMucG9zdEZpZWxkID0gJ2dhbGxlcnknO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jbG9zZScpO1xyXG4gICAgICAgIHRoaXMubmV3TG9hZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHRoaXMuc2hhZG93Qm94KG1lZGlhKSlcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHRoaXMua2V5UHJlc3NEaXNwYXRjaGVyKGUpKVxyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT50aGlzLmNsb3NlTWVkaWFSZWNpZXZlcigpKVxyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgICAgIHNoYWRvd0JveChtZWRpYSl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tZWRpYVJlY2lldmVyLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBwb3N0VHlwZSA9IG1lZGlhLmRhdGFzZXQucG9zdDtcclxuICAgICAgICAgICAgbGV0IGRhdGFJZCA9IHBhcnNlSW50KG1lZGlhLmRhdGFzZXQuaWQpO1xyXG5cclxuICAgICAgICAgICAgaWYocG9zdFR5cGUgIT09ICdub25lJyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldE1lZGlhKHBvc3RUeXBlLCBkYXRhSWQpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySXNvbGF0ZWRNZWRpYShtZWRpYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIGdldE1lZGlhKGRhdGFUeXBlLCBkYXRhSWQpe1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9tZWRpYT9yZWxhdGVkJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmVzdWx0c1tkYXRhVHlwZV0uZm9yRWFjaChpdGVtPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbS5nYWxsZXJ5KSk7XHJcbiAgICAgICAgICAgICAgICBpZihpdGVtLmlkID09PSBkYXRhSWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHNbZGF0YVR5cGVdKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihpdGVtLnBvc3RUeXBlID09PSAncHJvcGVydHknKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYU1lbnUuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJnYWxsZXJ5XCIgY2xhc3M9XCJhY3RpdmVcIj5HZW5lcmFsPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJpbnRlcmlvclwiPkludGVyaW9yPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJmbG9vclBsYW5zXCI+Rmxvb3IgUGxhbnM8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImJ1aWxkaW5nUGxhbnNcIj5CdWlsZGluZyBQbGFuczwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lbnVMaW5rID0gdGhpcy5tZWRpYU1lbnUucXVlcnlTZWxlY3RvckFsbCgnYScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51TGluay5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0RmllbGQgPSBpLmN1cnJlbnRUYXJnZXQuaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW1bdGhpcy5wb3N0RmllbGRdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3QpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51TGluay5mb3JFYWNoKGM9PntjLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO30pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiMFwiXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIwXCJdYCkuY2hpbGRyZW5bMF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBsZXQgYWxsTmV3cyA9IHJlc3VsdHNbJ3VwZGF0ZXMnXS5jb25jYXQocmVzdWx0c1snbmV3cyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFsbE5ld3MubWFwKHJlcG9ydHM9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHJlcG9ydHMucmVsYXRpb25zaGlwcy5mb3JFYWNoKHBvc3Q9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBpZihwb3N0LklEID09PSBpdGVtLmlkKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgaXRlbS5nYWxsZXJ5LnB1c2gocmVwb3J0cy5nYWxsZXJ5KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmKGRhdGFJZCAhPT0gIHRoaXMuY3VycmVudE93bmVySWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkID0gZGF0YUlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5sb2NhbFN0b3JhZ2UgPSB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0aGlzLmFjY2Vzc0xvY2FsU3RvcmFnZShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluaXRpYWxNZWRpYVBvcHVsYXRpb24oaXRlbSwgcG9zdCl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBpZiBtb3JlIHRoYW4gb25lLCBzaG93XHJcbiAgICAgICAgICAgIC8vIGlzIHRoZXJlIGEgbW9yZSBhY2Nlc3NpYmxlLWZyaWVuZGx5IGh0bWwgdGFnIGZvciBmaWx0cnIgbWVudXM/XHJcbiAgICAgICAgICAgIC8vSGF2ZSBkZXNjIHdpdGggJ3JlYWQgbW9yZScgdW5kZXIgYWN0aXZlIHZpZC4gRXhlcnB0IHVuZGVyIHNlbGVjdGlvbiwgb2YgZXhpc3RzLCBvdGhlcndpc2UgdHJpbVxyXG5cclxuICAgICAgICAgICAgdGhpcy5kYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnBvc3RPdXRwdXQgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMgPSBbXTtcclxuXHJcbiAgXHJcbiAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoIDw9IHRoaXMucG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBvc3RQYWdlcy5jb25jYXQocG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHRoaXMucG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gdGhpcy5wb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBvc3RQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaCh0aGlzLnBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucG9zdFBhZ2VzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucG9zdFBhZ2VzKSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtKVxyXG4gXHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVNZWRpYUNvbHVtbihpdGVtLCB0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlc10pO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpdGVtKVxyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdMb2FkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKGl0ZW0sIHRoaXMuZGF0YUNvdW50LCB0aGlzLnBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgIH1cclxuIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVySXNvbGF0ZWRNZWRpYShtZWRpYSl7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5yZW1vdmUoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QuYWRkKCdjZW50ZXItZGlzcGxheScpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7bWVkaWEuZGF0YXNldC5mdWxsfVwiPlxyXG4gICAgICAgICAgICBgOyAgXHJcbiAgIFxyXG4gICAgICAgICAgICAvLyB0aGlzLnZpZGVvU3JjID0gdGhpcy5jdXJyZW50TWVkaWEucXVlcnlTZWxlY3RvcignaW1nJykuZGF0YXNldC52aWRlby5yZXBsYWNlKCd3YXRjaD92PScsICdlbWJlZC8nKSArICc/YXV0b3BsYXk9MSc7XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGxheUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbGF5LWJ1dHRvbicpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+dGhpcy5wbGF5VmlkZW8odGhpcy52aWRlb1NyYykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pe1xyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb24gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMucG9zdEZpZWxkLCB0aGlzLmdhbGxlcnlQb3NpdGlvbilcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmlubmVySFRNTCA9IGAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS52aWRlb1NvdXJjZSA/ICc8ZGl2IGlkPVwicGxheS1idXR0b24tY29udGFpbmVyXCI+PGJ1dHRvbiBpZD1cInBsYXktYnV0dG9uXCI+PGRpdj48L2Rpdj48L2J1dHRvbj48L2Rpdj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICA8aW1nIGRhdGEtdmlkZW89XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS52aWRlb1NvdXJjZX1cIiBzcmM9XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS5pbWFnZX1cIj5cclxuICAgICAgICAgICAgYDsgIFxyXG5cclxuICAgICAgICAgICAgdGhpcy52aWRlb1NyYyA9IHRoaXMuY3VycmVudE1lZGlhLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLmRhdGFzZXQudmlkZW8ucmVwbGFjZSgnd2F0Y2g/dj0nLCAnZW1iZWQvJykgKyAnP2F1dG9wbGF5PTEnO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5wbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BsYXktYnV0dG9uJyk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLnBsYXlCdXR0b24pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnRoaXMucGxheVZpZGVvKHRoaXMudmlkZW9TcmMpKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5hZGQoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LnJlbW92ZSgnY2VudGVyLWRpc3BsYXknKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QucmVtb3ZlKCdhc3BlY3QtcmF0aW8nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5hZGQoJ2NlbnRlci1kaXNwbGF5Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwb3B1bGF0ZU1lZGlhQ29sdW1uKGl0ZW0sIGNvbnRlbnQpe1xyXG4gICAgICAgICAgICB0aGlzLm1lZGlhQ29sdW1uLmlubmVySFRNTCA9IGBcclxuICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgJHtjb250ZW50Lm1hcChpID0+IGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtcG9zaXRpb249XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdLmZpbmRJbmRleChhPT57cmV0dXJuIGEuaWQgPT09IGkuaWR9KX1cIiAgY2xhc3M9XCJtZWRpYS1zZWxlY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIm1lZGlhLXRodW1iXCIgc3JjPVwiJHtpLnNlbGVjdEltYWdlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtaW5mb3JtYXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aS50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2kuZGVzY3JpcHRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lZGlhLXRodW1iJyk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iWzBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWxlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVkaWEtdGh1bWIuc2VsZWN0ZWQnKS5wYXJlbnROb2RlLmRhdGFzZXQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRTZWxlY3Rpb24sICdyZWQnKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWIuZm9yRWFjaCh0aHVtYj0+e1xyXG4gICAgICAgICAgICAgICAgdGh1bWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PntcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWIuZm9yRWFjaChjPT57Yy5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpO30pXHJcbiAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlLnRhcmdldClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckN1cnJlbnRNZWRpYShpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gZS50YXJnZXQucGFyZW50Tm9kZS5kYXRhc2V0LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFNlbGVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAvL2FjdGl2YXRlIHRoZSBzZXBlcmF0ZSBmdW5jdGlvbiB0aGF0IGZpbGxzIHRoZSBjdXJyZW50TWRpYSBjb250YWluZXJcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5zZXJ0UGFnaW5hdGlvbihpdGVtLCBkYXRhQ291bnQsIHBhZ2VDb3VudCl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFQYWdpbmF0aW9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICR7dGhpcy5wb3N0UGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5wb3N0UGFnZXMubGVuZ3RoID4gMSA/IGA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZVwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSAgXHJcbiAgICAgICAgICAgIGA7XHJcblxyXG4gICAgICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1wYWdpbmF0aW9uIC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJykpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNtZWRpYS1wYWdpbmF0aW9uIC5jb250ZW50LXBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoaXRlbSwgY29udGVudFBhZ2VPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubmV3TG9hZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoaXRlbSwgY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRTZWxlY3Rpb24pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVNZWRpYUNvbHVtbihpdGVtLCB0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlc10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChpID0+eyAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkgIFxyXG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHt0aGlzLmN1cnJlbnRTZWxlY3Rpb259XCJdYCkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7dGhpcy5jdXJyZW50U2VsZWN0aW9ufVwiXWApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7dGhpcy5jdXJyZW50U2VsZWN0aW9ufVwiXWApLmNoaWxkcmVuWzBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSkgICAgXHJcblxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGNsb3NlTWVkaWFSZWNpZXZlcigpe1xyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5tZWRpYU1lbnUuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZWRpYU1lbnUucmVtb3ZlQ2hpbGQodGhpcy5tZWRpYU1lbnUuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLm1lZGlhQ29sdW1uLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVkaWFDb2x1bW4ucmVtb3ZlQ2hpbGQodGhpcy5tZWRpYUNvbHVtbi5maXJzdENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuY3VycmVudE1lZGlhLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLnJlbW92ZUNoaWxkKHRoaXMuY3VycmVudE1lZGlhLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZTsgXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QucmVtb3ZlKCdmcmVlemUnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2FsbGVyeVBvc2l0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wb3N0RmllbGQgPSAnZ2FsbGVyeSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld0xvYWQgPSB0cnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBrZXlQcmVzc0Rpc3BhdGNoZXIoZSl7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGUua2V5Q29kZSwgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuKVxyXG4gICAgICAgICAgICBpZihlLmtleUNvZGUgPT09IDI3ICYmIHRoaXMuaXNNZWRpYVJlY2lldmVyT3Blbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTWVkaWFSZWNpZXZlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5VmlkZW8odmlkZW9TcmMpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh2aWRlb1NyYylcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxpZnJhbWUgYWxsb3dmdWxsc2NyZWVuPVwiYWxsb3dmdWxsc2NyZWVuXCIgc3JjPVwiJHt2aWRlb1NyY31cIj48L2lmcmFtZT5cclxuICAgICAgICAgICAgYDtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNoYWRvd0JveDsiLCJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgU2hhZG93Qm94IGZyb20gJy4vc2hhZG93Qm94JztcclxuLy9UaGUgc2ltcGxpY2l0eSBvZiB0aGlzIGlzIGEgY2hhbmNlIHRvIHRyeSB0byBtYWtlIG15IHBhZ2luYXRpb24gY29kZSBhbmQgY29kZSBpbiBnZW5lcmFsIGNsZWFuZXIgYW5kIG1vcmUgZWZmaWNpZW50XHJcbmNsYXNzIFJlbGF0ZWROZXdze1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2luZ2xlQ29udGFpbmVyJykpe1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXdzLXJlY2lldmVyJyk7XHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdpbmF0aW9uLWhvbGRlcicpO1xyXG4gICAgICAgICAgICAvL2ludGVyZmVyZXMgd2l0aCBTQi4gRmlndXJlIG91dCBob3cgdG8gcHJldmVudCBvbiBwYWdlcyB3aGVyZSBpbnZhbGlkLlxyXG4gICAgICAgICAgICAvL0Fsc28gd2l0aCBhbGwtbmV3cyBpZiBvbmx5IDEgcGFnZVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQb3N0SUQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkltYWdlQW5kU3RhdHMgaW1nJykuZGF0YXNldC5pZDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudFNob3duO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucztcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudncgPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgMCwgd2luZG93LmlubmVyV2lkdGggfHwgMClcclxuICAgICAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnRzKCl7XHJcbiAgICAgICAgdGhpcy5mZXRjaFJlbGF0ZWROZXdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZmV0Y2hSZWxhdGVkTmV3cygpe1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL21lZGlhP3JlbGF0ZWQnKTsgXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICBjb25zdCBhbGxOZXdzID0gcmVzdWx0cy51cGRhdGVzLmNvbmNhdChyZXN1bHRzLm5ld3MpO1xyXG4gICAgICAgICAgICBjb25zdCByZWxhdGVkTmV3cyA9IFtdOyBcclxuICAgICAgICAgICAgbGV0IGxpbWl0ID0gMTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcGFnZUNvdW50ID0gMDtcclxuICAgICAgICAgICAgLy9Pcmdhbml6ZSB0aGUgbmV3cyB0aGF0J3MgdGhyb3duIGludG8gcmVsYXRlZE5ld3MsIGluIGRhdGUgb3JkZXJcclxuICAgICAgICAgICAgLy9Db25zaWRlciBwZXJmb3JtaW5nIHRoZSBkYXRlIG9yZGVyIG9uIGJhY2tlbmQsIHRob3VnaCBjb3VsZCBhbm5veW9uZywgZ2l2ZW4gbGVzcyBwaHAgZXhwZXJpZW5jZSwgYnV0IGNvdWxkIGJlIGJlbmVmaWNpYWwgdG8gcHJvZ3Jlc3Mgb3ZlciBhbGwgXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbnRlbnRMb2FkZWQpe1xyXG4gICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3MgPT57XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocj0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyLklEID09PSBwYXJzZUludCh0aGlzLmN1cnJlbnRQb3N0SUQpICYmIGxpbWl0IDw9IDIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQrPTFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0ZWROZXdzLnB1c2gobmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICBcclxuICAgICAgICAgICAgICAgIGlmKHJlbGF0ZWROZXdzLmxlbmd0aCl7ICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlbGF0ZWROZXdzKSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVQYWdpbmF0aW9uSG9sZGVyKGRhdGFDb3VudCwgcGFnZUNvdW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZU5ld3NSZWNpZXZlcigpO1xyXG5cclxuICAgXHJcbiAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcG9wdWxhdGVOZXdzUmVjaWV2ZXIoKXtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXSlcclxuICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgIDxoND4ke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLnRpdGxlfTwvaDQ+XHJcbiAgICAgICAgICAgIDxwPiR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uY2FwdGlvbiA/IGAke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmNhcHRpb259IC1gIDogJyd9ICR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uZGF0ZX08L3A+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYS1jYXJkXCI+PGltZyBkYXRhLXBvc3Q9XCIke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLnBvc3RUeXBlUGx1cmFsfVwiIGRhdGEtaWQ9XCIke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmlkfVwiIHNyYz1cIiR7dGhpcy52dyA+PSAxMjAwID8gYCR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uZ2FsbGVyeVswXS5pbWFnZX1gIDogYCR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uZ2FsbGVyeVswXS5zZWxlY3RJbWFnZX1gfVwiPjwvZGl2PlxyXG4gICAgICAgICAgICA8cD4ke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmZ1bGxEZXNjcmlwdGlvbn08L3A+XHJcbiAgICAgICAgYDtcclxuICBcclxuICAgICAgICBTaGFkb3dCb3gucHJvdG90eXBlLmV2ZW50cygpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFNoYWRvd0JveC5wcm90b3R5cGUubWVkaWFMaW5rKVxyXG4gICAgfVxyXG5cclxuICAgIHBvcHVsYXRlUGFnaW5hdGlvbkhvbGRlcihkYXRhQ291bnQsIHBhZ2VDb3VudCl7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgJHt0aGlzLmNvbnRlbnRTaG93bi5sZW5ndGggPyAnPGRpdiBjbGFzcz1cImNvbnRlbnQtcGFnZXNcIj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLmxlbmd0aCA+IDEgPyBgPGEgY2xhc3M9XCJjb250ZW50LXBhZ2VcIiBkYXRhLXBhZ2U9XCIke2RhdGFDb3VudCsrfVwiPiAke3BhZ2VDb3VudCArPSAxfTwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX0gXHJcbiAgICAgICAgICAgICR7dGhpcy5jb250ZW50U2hvd24ubGVuZ3RoID8gJzwvZGl2PicgOiAnJ30gXHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuY29udGVudExvYWRlZCl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZmlyc3RQYWdlQnV0dG9uKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9ICAgICBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlJyk7XHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KCl7XHJcbiAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaFJlbGF0ZWROZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXHJcbiAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSkgIFxyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZWxhdGVkTmV3cyAiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy9Mb29rIHVwIGhvdyB0byBidW5kbGUgc2NzcyBoZXJlIHVzaW5nIHdlYnBhY2sgYW5kIG1ha2UgdGhpcyBpbnRvIGFuIGltcG9ydCBmaWxlKEFsc28gdXNlIHNlcGVyYXRlIGZpbGUgZm9yIGdlbiBsb2dpYywgXHJcbi8vc28gY2FuIGNvbmRpdGlvbmFsIHRoaXMgZm9yIGZvcm1zKVxyXG5pbXBvcnQgJy4uL2Nzcy9zdHlsZS5jc3MnO1xyXG5pbXBvcnQgJy4uL2Nzcy9kb3RzLmNzcydcclxuXHJcbmltcG9ydCBTZWFyY2ggZnJvbSAnLi9tb2R1bGVzL3NlYXJjaCc7XHJcbmltcG9ydCBQYWdpbmF0aW9uIGZyb20gJy4vbW9kdWxlcy9wYWdpbmF0aW9uJztcclxuaW1wb3J0IE5ld3MgZnJvbSAnLi9tb2R1bGVzL2FsbC1uZXdzJztcclxuaW1wb3J0IFJlbGF0ZWROZXdzIGZyb20gJy4vbW9kdWxlcy9zaW5nbGVQb3N0JztcclxuaW1wb3J0IFNoYWRvd0JveCBmcm9tICcuL21vZHVsZXMvc2hhZG93Qm94JztcclxuaW1wb3J0IE1vYmlsZUludGVyZmVjZSBmcm9tICcuL21vZHVsZXMvbW9iaWxlJztcclxuXHJcbmNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcclxuY29uc3QgcGFnaW5hdGlvbiA9IG5ldyBQYWdpbmF0aW9uKCk7XHJcbmNvbnN0IG5ld3MgPSBuZXcgTmV3cygpO1xyXG5jb25zdCByZWxhdGVkTmV3cyA9IG5ldyBSZWxhdGVkTmV3cygpO1xyXG5jb25zdCBzaGFkb3dCb3ggPSBuZXcgU2hhZG93Qm94KCk7XHJcbmNvbnN0IG1vYmlsZUludGVyZmVjZSA9IG5ldyBNb2JpbGVJbnRlcmZlY2UoKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=