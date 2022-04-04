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
___CSS_LOADER_EXPORT___.push([module.id, "@charset \"UTF-8\";\nhtml {\n  overflow-x: hidden;\n  height: 100%;\n  margin: 0;\n}\n@media (min-width: 767px) {\n  html {\n    font-size: 1.6vh;\n  }\n}\n@media (min-width: 960px) {\n  html {\n    font-size: 1.8vh;\n  }\n}\nhtml.freeze {\n  overflow: hidden;\n}\n\nbody {\n  margin: 0;\n  color: antiquewhite;\n}\n\nh1 {\n  margin: 0;\n  margin-bottom: 3rem;\n  font-size: 4rem;\n}\n\nh2 {\n  font-size: 2.5rem;\n  margin: 0;\n}\n\nh3 {\n  font-size: 2.3rem;\n  margin: 0;\n}\n\na {\n  text-decoration: none;\n  color: inherit;\n}\n\na {\n  cursor: pointer;\n}\n\na.hidden, a.selectedPage {\n  pointer-events: none;\n}\n\na.hidden {\n  opacity: 0;\n}\n\na.selectedPage {\n  color: #e8aa77;\n  filter: saturate(120%);\n}\n\n*.hidden {\n  display: none;\n  pointer-events: none;\n}\n\ndiv, button {\n  box-sizing: border-box;\n}\n\nbutton {\n  border: none;\n  background: transparent;\n}\n\nli {\n  list-style-type: none;\n}\n\n#overallContainer {\n  position: relative;\n  top: 0;\n}\n#overallContainer.faded {\n  filter: opacity(40%);\n}\n\n.contentContainer {\n  height: 59.5rem;\n  width: 100%;\n  margin: 4% 0;\n  margin-bottom: 3%;\n  display: flex;\n  justify-content: center;\n}\n.contentContainer > div {\n  width: 85%;\n  display: flex;\n  justify-content: center;\n  padding-top: 5.5rem;\n}\n.contentContainer_paginated .textBox .content-pages {\n  text-align: center;\n}\n.contentContainer_paginated .textBox .content-pages a {\n  font-size: 1.75rem;\n}\n\n.titleAndTextBox, .contentBox {\n  position: relative;\n}\n\n.titleAndTextBox {\n  margin-right: 5%;\n}\n\n.titleBox, .textBox {\n  height: 50%;\n  width: 16rem;\n}\n\n.titleBox {\n  padding: 10%;\n}\n.titleBox > * {\n  height: 50%;\n  width: 100%;\n  margin: 0;\n}\n.titleBox > :nth-child(2) {\n  display: flex;\n}\n.titleBox > :nth-child(2) h2 {\n  align-self: flex-end;\n  padding-bottom: 15%;\n}\n\n.contentBox {\n  width: 100%;\n  height: 100%;\n}\n.contentBox.properties > div, .contentBox.members > div {\n  display: grid;\n  width: 15.5rem;\n}\n@media (min-width: 767px) {\n  .contentBox.properties > div, .contentBox.members > div {\n    grid-template-columns: repeat(3, auto);\n  }\n}\n@media (min-width: 960px) {\n  .contentBox.properties > div, .contentBox.members > div {\n    grid-template-columns: repeat(4, auto);\n  }\n}\n.contentBox.properties > div .displaySquares, .contentBox.members > div .displaySquares {\n  box-sizing: initial;\n  position: relative;\n  text-align: center;\n  display: flex;\n  align-items: center;\n}\n.contentBox.properties > div .displaySquares-pageLinks, .contentBox.members > div .displaySquares-pageLinks {\n  position: absolute;\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  text-align: center;\n  opacity: 0;\n}\n.contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n  color: rgb(238, 231, 210);\n  cursor: pointer;\n  font-size: 1.3rem;\n  margin-top: 0.7rem;\n}\n.contentBox.properties > div .displaySquares-pageLinks *:hover, .contentBox.members > div .displaySquares-pageLinks *:hover {\n  transform: scale(110%);\n  filter: brightness(120%);\n}\n.contentBox.properties > div .displaySquares-pageLinks i, .contentBox.members > div .displaySquares-pageLinks i {\n  font-size: 1.4rem;\n}\n.contentBox.properties > div .displaySquares .displaySquares-pageLinks__visible, .contentBox.members > div .displaySquares .displaySquares-pageLinks__visible {\n  opacity: 1;\n}\n.contentBox.properties > div .displaySquares div p, .contentBox.properties > div .displaySquares div a, .contentBox.members > div .displaySquares div p, .contentBox.members > div .displaySquares div a {\n  margin: 2%;\n}\n.contentBox.properties > div .display-text, .contentBox.members > div .display-text {\n  text-align: center;\n  font-size: 1.4rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.contentBox.properties > div .display-text p, .contentBox.members > div .display-text p {\n  margin: 0;\n}\n.contentBox.properties > div .display-text p:nth-of-type(2), .contentBox.members > div .display-text p:nth-of-type(2) {\n  font-weight: 700;\n}\n.contentBox .news {\n  margin: 0 1%;\n  padding-top: 5%;\n  height: auto;\n}\n.contentBox .news iframe {\n  width: 300px;\n  height: 200px;\n}\n\n#footerContainer {\n  background-color: rgba(39, 39, 39, 0.6);\n  margin: 0;\n  display: flex;\n  position: fixed;\n  bottom: 0;\n  width: 100%;\n  text-align: center;\n  justify-content: flex-end;\n  padding-right: 2rem;\n  color: ivory;\n}\n\n#openingContainer {\n  height: 99.5vh;\n  position: relative;\n  color: rgb(189, 189, 189);\n  display: flex;\n  justify-content: center;\n}\n#openingContainer h1 {\n  font-size: 6.5rem;\n}\n#openingContainer p {\n  font-size: 2.7rem;\n  font-weight: 600;\n}\n#openingContainer #welcomeContainer div {\n  padding: 5%;\n  text-shadow: 1px 1px black;\n  width: 70%;\n}\n#openingContainer header {\n  display: grid;\n  grid-auto-flow: row;\n  grid-template-columns: 4% 25% 1fr;\n  background-color: rgba(70, 62, 55, 0.85);\n  box-shadow: 0.2rem 0.2rem 1rem 0.4rem inset rgba(49, 43, 39, 0.75);\n  width: 100%;\n  height: 5rem;\n  position: fixed;\n  top: 0;\n  z-index: 9999;\n  color: rgb(199, 187, 156);\n}\n#openingContainer header.hidden {\n  display: none;\n}\n#openingContainer header button {\n  font-size: 1.8rem;\n  width: 10rem;\n  cursor: pointer;\n}\n#openingContainer header button i {\n  display: inline;\n}\n#openingContainer header #logo-symbol, #openingContainer header #logo-text {\n  height: 4rem;\n}\n#openingContainer header #logo-symbol {\n  margin-top: 0.3rem;\n  padding-left: 0.5rem;\n}\n#openingContainer header #logo-text {\n  margin-top: 0.6rem;\n  padding-left: 0.2rem;\n}\n#openingContainer header img {\n  height: 100%;\n}\n#openingContainer header p, #openingContainer header nav {\n  margin: 0;\n}\n#openingContainer header nav {\n  margin-right: 2rem;\n}\n#openingContainer header nav ul {\n  margin: 0;\n  padding: 0;\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1.5rem;\n}\n#openingContainer header nav ul li a {\n  font-size: 1.8rem;\n  text-shadow: 1px 1px black;\n}\n#openingContainer #pageImage {\n  position: absolute;\n  top: 0;\n  height: 100%;\n  width: 100%;\n}\n#openingContainer #pageImage img {\n  height: 100%;\n  width: 100%;\n  filter: blur(0.6rem) grayscale(50%);\n}\n#openingContainer #welcomeContainer {\n  position: absolute;\n  text-align: center;\n  margin-top: 8%;\n  display: flex;\n  justify-content: center;\n  width: 100%;\n}\n#openingContainer #welcomeContainer img {\n  height: 6rem;\n}\n\n.titleBox {\n  background: transparent;\n}\n.titleBox p {\n  font-size: 1.5rem;\n}\n\n.textBox {\n  padding-left: 0.5rem;\n}\n.textBox p {\n  font-size: 1.3rem;\n  color: white;\n}\n\n#propertiesContainer > div .titleBox, #membersContainer > div .titleBox {\n  border: 0.35rem solid rgb(199, 187, 156);\n}\n#propertiesContainer img, #membersContainer img {\n  width: 100%;\n  height: 100%;\n  margin-bottom: 1rem;\n}\n#propertiesContainer img.pageLinks__visible, #membersContainer img.pageLinks__visible {\n  filter: brightness(27%);\n}\n\n#allNewsContainer, #contactContainer {\n  background-color: rgb(31, 27, 21);\n  color: white;\n}\n#allNewsContainer > div .titleBox, #contactContainer > div .titleBox {\n  border: 4px solid rgb(221, 221, 221);\n}\n#allNewsContainer > div .textBox p, #contactContainer > div .textBox p {\n  color: antiquewhite;\n}\n#allNewsContainer .contentBox, #contactContainer .contentBox {\n  display: flex;\n  font-size: 1.1rem;\n}\n#allNewsContainer .contentBox > div, #contactContainer .contentBox > div {\n  flex-basis: 50%;\n  height: 100%;\n}\n#allNewsContainer .contentBox > div > div, #contactContainer .contentBox > div > div {\n  overflow: auto;\n  height: 92%;\n}\n#allNewsContainer .contentBox .form-message, #contactContainer .contentBox .form-message {\n  height: auto;\n}\n#allNewsContainer .contentBox h3, #contactContainer .contentBox h3 {\n  text-align: center;\n  height: 8%;\n}\n#allNewsContainer .contentBox ul, #contactContainer .contentBox ul {\n  padding: 0;\n}\n#allNewsContainer .contentBox ul li, #contactContainer .contentBox ul li {\n  display: inline;\n}\n#allNewsContainer .contentBox .news, #contactContainer .contentBox .news {\n  border: 1px solid rgba(233, 233, 233, 0.3);\n}\n#allNewsContainer .contentBox .news::after, #contactContainer .contentBox .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#allNewsContainer .contentBox .news img, #contactContainer .contentBox .news img {\n  float: left;\n  margin-right: 2%;\n  cursor: pointer;\n}\n#allNewsContainer .contentBox .news p, #contactContainer .contentBox .news p {\n  line-height: 1.2rem;\n  font-size: 1.25rem;\n}\n#allNewsContainer .contentBox .news, #allNewsContainer .contentBox form, #contactContainer .contentBox .news, #contactContainer .contentBox form {\n  padding: 0 5%;\n}\n\n#contactContainer {\n  background: black;\n  color: white;\n}\n#contactContainer .contentBox {\n  display: flex;\n  padding-bottom: 1rem;\n}\n#contactContainer .contentBox img {\n  filter: saturate(120%);\n  width: 50%;\n}\n#contactContainer .contentBox label.error {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: rgb(120, 179, 158);\n}\n#contactContainer .contentBox form > div {\n  margin: 5% 0;\n  margin-top: 0;\n}\n#contactContainer .contentBox form label {\n  font-size: 1.4rem;\n}\n#contactContainer .contentBox form [type=radio] {\n  width: 10%;\n  display: initial;\n}\n#contactContainer .contentBox form ul {\n  padding: 0;\n}\n#contactContainer .contentBox form input {\n  display: block;\n  margin-top: 1%;\n  width: 40%;\n  height: 1.5rem;\n}\n#contactContainer .contentBox form textarea {\n  width: 100%;\n  height: 20rem;\n}\n#contactContainer .contentBox form button {\n  color: ivory;\n}\n\n.dot-pulse {\n  top: 20%;\n  left: 35%;\n}\n\n#pop-up-display-box {\n  background-color: rgba(45, 41, 35, 0.8);\n  width: 94vw;\n  height: 87vh;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 8vh;\n  left: 3vw;\n  display: none;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n  padding-top: 1rem;\n}\n#pop-up-display-box img {\n  width: 500px;\n}\n#pop-up-display-box a, #pop-up-display-box button {\n  font-size: 2rem;\n}\n#pop-up-display-box button {\n  color: antiquewhite;\n  cursor: pointer;\n}\n#pop-up-display-box button:hover, #pop-up-display-box a:hover {\n  filter: brightness(72%);\n}\n#pop-up-display-box #content-holder {\n  display: flex;\n  justify-content: space-evenly;\n  position: relative;\n  width: 70%;\n}\n#pop-up-display-box #content-holder .pop-up-directional {\n  font-size: 2.5rem;\n}\n\n#news-media-display {\n  background-color: rgba(44, 52, 77, 0.8);\n  height: 88vh;\n  width: 94vw;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 7vh;\n  left: 3vw;\n  display: none;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n}\n\n#singleContainer {\n  height: 87%;\n  min-width: 60%;\n  top: 8.3%;\n  display: flex;\n  flex-wrap: wrap;\n  position: absolute;\n  z-index: 1;\n  padding: 1.5rem 1rem;\n  padding-bottom: 1rem;\n  background-color: rgba(37, 35, 34, 0.9);\n}\n#singleContainer h4 {\n  font-size: 1.6rem;\n}\n#singleContainer h3, #singleContainer h4, #singleContainer .related-link {\n  color: rgb(241, 218, 189);\n}\n#singleContainer #mainImageAndStats {\n  width: 21vw;\n  text-align: center;\n}\n#singleContainer #mainImageAndStats img {\n  height: 42%;\n}\n#singleContainer #mainImageAndStats ul {\n  padding-left: 20%;\n  font-size: 1.65rem;\n  text-align: left;\n  margin-top: 1rem;\n}\n#singleContainer #mainImageAndStats ul li {\n  margin-top: 0.6rem;\n  list-style-type: square;\n}\n#singleContainer #mainImageAndStats ul li a {\n  filter: brightness(115%);\n}\n#singleContainer #singleInfo {\n  width: 30vw;\n  display: grid;\n  grid-template-rows: 7% 1fr;\n  height: 100%;\n}\n#singleContainer #singleInfo p {\n  margin-top: 1.2rem;\n  font-size: 1.7rem;\n  height: 99%;\n}\n#singleContainer #singleInfo div {\n  overflow: auto;\n  padding: 0 1rem;\n}\n#singleContainer #singleInfo #mediaContainer {\n  height: auto;\n}\n#singleContainer #singleInfo #mediaContainer iframe {\n  width: 200px;\n  height: 200px;\n}\n#singleContainer #vidAndImgCol {\n  height: 100%;\n  width: 16vw;\n  overflow: auto;\n  overflow-x: hidden;\n  text-align: center;\n}\n#singleContainer #vidAndImgCol h3 {\n  font-size: 1.9rem;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col {\n  width: 26vw;\n  position: relative;\n  height: 100%;\n  overflow: auto;\n  padding: 0 1rem;\n  display: grid;\n  grid-template-rows: 10% 1fr 4%;\n}\n#singleContainer #updates-col h3 {\n  font-size: 2rem;\n}\n#singleContainer #updates-col h3 a {\n  font-size: 1.7rem;\n}\n#singleContainer #updates-col h3 a:hover {\n  color: white;\n}\n#singleContainer #updates-col #news-reciever {\n  overflow: auto;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col #news-reciever p {\n  font-size: 1.4rem;\n  padding-right: 1rem;\n}\n#singleContainer #updates-col #pagination-holder {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n  font-size: 1.8rem;\n  display: flex;\n  justify-content: center;\n}\n\nbody {\n  background-color: rgb(100, 92, 82);\n}\n\n.search-overlay {\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(72, 68, 62, 0.96);\n  visibility: hidden;\n  opacity: 0;\n  transform: scale(1.09);\n  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;\n  box-sizing: border-box;\n}\n.search-overlay .container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n.search-overlay p {\n  padding-top: 1rem;\n}\nbody.admin-bar .search-overlay {\n  top: 2rem;\n}\n.search-overlay__top {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n.search-overlay__icon {\n  margin-right: 0.75rem;\n  font-size: 2.5rem;\n  color: rgb(148, 121, 105);\n}\n.search-overlay--active {\n  visibility: visible;\n  opacity: 1;\n  transform: scale(1);\n}\n.search-overlay__section-title {\n  margin: 30px 0 1px 0;\n  font-weight: 400;\n  font-size: 2rem;\n  padding: 15px 0;\n  border-bottom: 1px solid #ccc;\n}\n.search-overlay__close {\n  font-size: 2.7rem;\n  cursor: pointer;\n  transition: all 0.3s;\n  background-color: rgb(58, 54, 54);\n  color: rgb(180, 171, 166);\n  line-height: 0.7;\n}\n.search-overlay__close:hover {\n  opacity: 1;\n}\n.search-overlay .one-half {\n  padding-bottom: 0;\n}\n\n.search-term {\n  width: 75%;\n  box-sizing: border-box;\n  border: none;\n  padding: 1rem 0;\n  margin: 0;\n  background-color: transparent;\n  font-size: 1rem;\n  font-weight: 300;\n  outline: none;\n  color: rgb(218, 201, 182);\n}\n\n.body-no-scroll {\n  overflow: hidden;\n}\n\n.container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n}\n\n@media (min-width: 960px) {\n  .search-term {\n    width: 80%;\n    font-size: 3rem;\n  }\n}\n@-webkit-keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.spinner-loader {\n  margin-top: 45px;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  border: 0.25rem solid rgba(0, 0, 0, 0.2);\n  border-top-color: black;\n  -webkit-animation: spin 1s infinite linear;\n  animation: spin 1s infinite linear;\n}\n\n.media-card button {\n  color: white;\n  cursor: pointer;\n  font-size: 2.1rem;\n}\n\nh1, h2, h3, h4 {\n  font-family: \"Libre Caslon Text\", serif;\n}\n\n.news p, .textBox p, #relationship-link, #single-link {\n  font-family: \"Libre Caslon Display\", serif;\n}\n\nh1 {\n  font-weight: 700;\n}\n\nh2 {\n  font-weight: 400;\n}\n\n.display-text, #welcomeContainer p, .titleBox p {\n  font-family: \"Cormorant SC\", serif;\n}\n\ninput, .read-more, .news li a, header li a, #realtimeFiltersAndSorting button, #search-filters button, #reset-all {\n  font-family: \"Lora\", serif;\n}\n\n.search-form {\n  position: fixed;\n  top: 50%;\n  color: white;\n}\n\n.content-loader {\n  background-color: transparent;\n  height: 50%;\n  position: absolute;\n}\n.content-loader .ball {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(47, 163, 56);\n  border-radius: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader[data-text]::before {\n  position: absolute;\n}\n.content-loader.loader.is-active::before {\n  position: absolute;\n  width: 50%;\n  left: 25%;\n  top: 39%;\n  font-size: 2.7rem;\n  color: rgb(195, 168, 126);\n  background-color: transparent;\n}\n.content-loader.loader-bar-ping-pong::after {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(101, 148, 187);\n  -webkit-animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader.is-active {\n  height: 97%;\n  z-index: 0;\n  background-color: rgba(51, 49, 56, 0.7490196078);\n  -webkit-animation: blink 1.8s linear infinite alternate;\n          animation: blink 1.8s linear infinite alternate;\n}\n\n@-webkit-keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@-webkit-keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n@keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n#all-news-container {\n  height: 85%;\n  top: 9%;\n  width: 95%;\n  left: 2.5%;\n  background-color: rgba(37, 35, 34, 0.75);\n  position: absolute;\n  display: flex;\n  color: aliceblue;\n}\n#all-news-container button {\n  color: antiquewhite;\n}\n#all-news-container #media-container, #all-news-container #filters-and-links-container, #all-news-container #selected-news-container {\n  position: relative;\n  height: 100%;\n}\n#all-news-container #filters-and-links-container {\n  border: 0.2rem solid rgba(212, 193, 130, 0.4);\n  border-left: none;\n  padding-left: 1.5rem;\n  display: grid;\n  grid-template-areas: \"realtimeFiltersAndSorting\" \"searchFilters\" \"resetAll\";\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting {\n  grid-area: realtimeFiltersAndSorting;\n  display: grid;\n  margin-top: 1.5rem;\n  grid-template-areas: \"headingRFS headingRFS\" \"orderBy toggleType\" \"filterDate filterDate\";\n  width: 100%;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button, #all-news-container #filters-and-links-container #realtime-filters-and-sorting label {\n  font-size: 1.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting h2 {\n  grid-area: headingRFS;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #order-by {\n  grid-area: orderBy;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #toggle-type {\n  grid-area: toggleType;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date {\n  grid-area: filterDate;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date div ul {\n  display: flex;\n  gap: 3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul {\n  padding-left: 0.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul li {\n  margin-top: 0.5rem;\n}\n#all-news-container #filters-and-links-container #search-filters {\n  grid-area: searchFilters;\n  display: grid;\n  grid-template-areas: \"headingSF headingSF headingSF\" \"newsSearch newsSearch newsSearch\" \"caseSensitive fullWordOnly wordStartOnly\" \"includeTitle includeDescription ...\";\n}\n#all-news-container #filters-and-links-container #search-filters h2 {\n  grid-area: headingSF;\n}\n#all-news-container #filters-and-links-container #search-filters button {\n  font-size: 1.2rem;\n  text-align: left;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container {\n  grid-area: newsSearch;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container #news-search {\n  font-size: 1.15rem;\n  height: 2.3rem;\n  width: 18rem;\n}\n#all-news-container #filters-and-links-container #search-filters #full-word-only {\n  grid-area: fullWordOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only {\n  grid-area: wordStartOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #case-sensitive {\n  grid-area: caseSensitive;\n}\n#all-news-container #filters-and-links-container #search-filters #include-title {\n  grid-area: includeTitle;\n}\n#all-news-container #filters-and-links-container #search-filters #include-description {\n  grid-area: includeDescription;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive, #all-news-container #filters-and-links-container #search-filters button.inactive {\n  pointer-events: none;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive span, #all-news-container #filters-and-links-container #search-filters button.inactive span {\n  color: red;\n}\n#all-news-container #filters-and-links-container button, #all-news-container #filters-and-links-container select, #all-news-container #filters-and-links-container label {\n  font-size: 1.1rem;\n}\n#all-news-container #filters-and-links-container #reset-all {\n  font-size: 1.4rem;\n  grid-area: resetAll;\n}\n#all-news-container #filters-and-links-container button {\n  cursor: pointer;\n}\n#all-news-container #filters-and-links-container h3 {\n  font-size: 1.7rem;\n}\n#all-news-container #filters-and-links-container h4 {\n  font-size: 1.5rem;\n  margin-bottom: 0.8rem;\n}\n#all-news-container #selected-news-container {\n  width: 66%;\n  display: grid;\n  grid-template-rows: 10% 84% 6%;\n  border: 0.2rem solid rgb(180, 174, 164);\n}\n#all-news-container #selected-news-container h2 {\n  width: 100%;\n  text-align: center;\n  font-size: 3rem;\n  margin-bottom: 1rem;\n  border-bottom: 0.3rem solid rgb(185, 158, 122);\n}\n#all-news-container #selected-news-container #dismiss-selection {\n  position: absolute;\n}\n#all-news-container #selected-news-container #dismiss-selection.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #selected-news-reciever {\n  margin-bottom: 0.5rem;\n  padding-right: 2rem;\n  overflow: auto;\n}\n#all-news-container #selected-news-container #full-display-container {\n  padding-left: 2rem;\n}\n#all-news-container #selected-news-container #main-display.dismissed, #all-news-container #selected-news-container #full-display-container.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #main-display .news, #all-news-container #selected-news-container #full-display-container .news {\n  font-size: 1.2rem;\n  padding-top: 0;\n}\n#all-news-container #selected-news-container #main-display .news::after, #all-news-container #selected-news-container #full-display-container .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#all-news-container #selected-news-container #main-display .news img, #all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news img, #all-news-container #selected-news-container #full-display-container .news iframe {\n  float: left;\n  margin-right: 2%;\n}\n#all-news-container #selected-news-container #main-display .news p, #all-news-container #selected-news-container #full-display-container .news p {\n  line-height: 1.2rem;\n}\n#all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news iframe {\n  width: 150px;\n  height: 100px;\n}\n#all-news-container #selected-news-container #main-display ul li, #all-news-container #selected-news-container #full-display-container ul li {\n  list-style-type: circle;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link, #all-news-container #selected-news-container #main-display ul li .relationship-link, #all-news-container #selected-news-container #full-display-container ul li .see-more-link, #all-news-container #selected-news-container #full-display-container ul li .relationship-link {\n  cursor: pointer;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link.dismissed, #all-news-container #selected-news-container #main-display ul li .relationship-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .see-more-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .relationship-link.dismissed {\n  display: none;\n}\n#all-news-container #filters-and-links-container {\n  width: 36%;\n  padding-top: 1rem;\n}\n#all-news-container #pagination-holder {\n  width: 100%;\n}\n#all-news-container #pagination-holder.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n#all-news-container #pagination-holder .content-pages a {\n  cursor: pointer;\n  font-size: 1.9rem;\n  margin-left: 0.5rem;\n}\n#all-news-container #pagination-holder .content-pages a.hidden, #all-news-container #pagination-holder .content-pages a.selectedPage {\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages a.hidden {\n  opacity: 0;\n}\n\n#media-reciever {\n  display: none;\n  position: fixed;\n  background-color: rgba(10, 10, 10, 0.8);\n  top: 7%;\n  width: 100%;\n  height: 95%;\n  z-index: 1;\n}\n#media-reciever #current-media {\n  margin-left: 14rem;\n  position: absolute;\n  top: 3rem;\n  height: 45rem;\n  width: 80rem;\n}\n#media-reciever #current-media iframe, #media-reciever #current-media img {\n  width: 100%;\n  height: 100%;\n}\n#media-reciever #current-media #play-button-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: absolute;\n  height: 100%;\n  width: 100%;\n}\n#media-reciever #current-media #play-button-container #play-button {\n  height: 6rem;\n  width: 9rem;\n  background-color: rgba(99, 100, 179, 0.8);\n  position: absolute;\n  border-radius: 35%;\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  transition: opacity 0.2s ease;\n}\n#media-reciever #current-media #play-button-container #play-button div {\n  border-left: 3rem solid rgb(125, 150, 168);\n  border-top: 1.7rem solid transparent;\n  border-bottom: 1.7rem solid transparent;\n}\n#media-reciever #current-media #play-button-container #play-button:hover {\n  opacity: 0.7;\n}\n#media-reciever #current-media.center-display {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface {\n  display: flex;\n  flex-direction: column;\n  position: absolute;\n  height: 82%;\n  overflow: auto;\n  right: 2rem;\n  top: 3rem;\n}\n#media-reciever #media-selection-interface #media-menu {\n  font-size: 1.2rem;\n  display: flex;\n}\n#media-reciever #media-selection-interface #media-menu a {\n  color: azure;\n  margin-left: 2rem;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-menu a.active {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column {\n  max-width: 380px;\n  display: flex;\n  flex-direction: column;\n  overflow: auto;\n}\n#media-reciever #media-selection-interface #media-column .media-selection {\n  display: flex;\n  margin-top: 1rem;\n  width: 100%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb {\n  width: 45%;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb.selected {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information {\n  display: flex;\n  flex-direction: column;\n  margin-left: 1rem;\n  width: 55%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p {\n  margin: 0;\n  color: beige;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p:nth-of-type(2) {\n  margin-top: 1rem;\n}\n#media-reciever #media-selection-interface #media-pagination {\n  margin-top: 1.5rem;\n  color: aliceblue;\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface #media-pagination a {\n  font-size: 1.2rem;\n  margin-left: 1rem;\n}\n#media-reciever #media-close {\n  position: absolute;\n  color: white;\n  left: 3.5rem;\n  top: 3.5rem;\n  font-size: 3.5rem;\n  cursor: pointer;\n}\n\n.media-card:hover img, .property-media-card:hover img {\n  filter: brightness(50%);\n  cursor: pointer;\n}\n.media-card:hover h3, .media-card:hover p, .media-card:hover button, .property-media-card:hover h3, .property-media-card:hover p, .property-media-card:hover button {\n  filter: contrast(40%);\n  cursor: pointer;\n}\n\n.loader {\n  color: #fff;\n  position: fixed;\n  box-sizing: border-box;\n  left: -9999px;\n  top: -9999px;\n  width: 0;\n  height: 0;\n  overflow: hidden;\n  z-index: 999999;\n}\n\n.loader:after, .loader:before {\n  box-sizing: border-box;\n  display: none;\n}\n\n.loader.is-active {\n  background-color: rgba(0, 0, 0, 0.85);\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.loader.is-active:after, .loader.is-active:before {\n  display: block;\n}\n\n@-webkit-keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n\n@keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.loader[data-text]:before {\n  position: fixed;\n  left: 0;\n  top: 50%;\n  color: currentColor;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  width: 100%;\n  font-size: 14px;\n}\n\n.loader[data-text=\"\"]:before {\n  content: \"Loading\";\n}\n\n.loader[data-text]:not([data-text=\"\"]):before {\n  content: attr(data-text);\n}\n\n.loader[data-text][data-blink]:before {\n  -webkit-animation: blink 1s linear infinite alternate;\n          animation: blink 1s linear infinite alternate;\n}\n\n.loader-default[data-text]:before {\n  top: calc(50% - 63px);\n}\n\n.loader-default:after {\n  content: \"\";\n  position: fixed;\n  width: 48px;\n  height: 48px;\n  border: 8px solid #fff;\n  border-left-color: transparent;\n  border-radius: 50%;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-default[data-half]:after {\n  border-right-color: transparent;\n}\n\n.loader-default[data-inverse]:after {\n  animation-direction: reverse;\n}\n\n.loader-double:after, .loader-double:before {\n  content: \"\";\n  position: fixed;\n  border-radius: 50%;\n  border: 8px solid;\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-double:after {\n  width: 48px;\n  height: 48px;\n  border-color: #fff;\n  border-left-color: transparent;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n}\n\n.loader-double:before {\n  width: 64px;\n  height: 64px;\n  border-color: #eb974e;\n  border-right-color: transparent;\n  -webkit-animation-duration: 2s;\n          animation-duration: 2s;\n  top: calc(50% - 32px);\n  left: calc(50% - 32px);\n}\n\n.loader-bar[data-text]:before {\n  top: calc(50% - 40px);\n  color: #fff;\n}\n\n.loader-bar:after {\n  content: \"\";\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  width: 200px;\n  height: 20px;\n  transform: translate(-50%, -50%);\n  background: linear-gradient(-45deg, #4183d7 25%, #52b3d9 0, #52b3d9 50%, #4183d7 0, #4183d7 75%, #52b3d9 0, #52b3d9);\n  background-size: 20px 20px;\n  box-shadow: inset 0 10px 0 hsla(0, 0%, 100%, 0.2), 0 0 0 5px rgba(0, 0, 0, 0.2);\n  animation: moveBar 1.5s linear infinite reverse;\n}\n\n.loader-bar[data-rounded]:after {\n  border-radius: 15px;\n}\n\n.loader-bar[data-inverse]:after {\n  -webkit-animation-direction: normal;\n          animation-direction: normal;\n}\n\n@-webkit-keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n\n@keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n.loader-bar-ping-pong:before {\n  width: 200px;\n  background-color: #000;\n}\n\n.loader-bar-ping-pong:after, .loader-bar-ping-pong:before {\n  content: \"\";\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 100px);\n}\n\n.loader-bar-ping-pong:after {\n  width: 50px;\n  background-color: #f19;\n  -webkit-animation: moveBarPingPong 0.5s linear infinite alternate;\n          animation: moveBarPingPong 0.5s linear infinite alternate;\n}\n\n.loader-bar-ping-pong[data-rounded]:before {\n  border-radius: 10px;\n}\n\n.loader-bar-ping-pong[data-rounded]:after {\n  border-radius: 50%;\n  width: 20px;\n  -webkit-animation-name: moveBarPingPongRounded;\n          animation-name: moveBarPingPongRounded;\n}\n\n@keyframes moveBarPingPong {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 50px);\n  }\n}\n@-webkit-keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@-webkit-keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n@keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n.loader-border[data-text]:before {\n  color: #fff;\n}\n\n.loader-border:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 15px;\n  height: 15px;\n  background-color: #ff0;\n  -webkit-animation: corners 3s ease both infinite;\n          animation: corners 3s ease both infinite;\n}\n\n.loader-ball:before {\n  content: \"\";\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 50%;\n  left: 50%;\n  margin: -25px 0 0 -25px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: kickBall 1s infinite alternate ease-in both;\n          animation: kickBall 1s infinite alternate ease-in both;\n}\n\n.loader-ball[data-shadow]:before {\n  box-shadow: inset -5px -5px 10px 0 rgba(0, 0, 0, 0.5);\n}\n\n.loader-ball:after {\n  content: \"\";\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.3);\n  border-radius: 50%;\n  width: 45px;\n  height: 20px;\n  top: calc(50% + 10px);\n  left: 50%;\n  margin: 0 0 0 -22.5px;\n  z-index: 0;\n  -webkit-animation: shadow 1s infinite alternate ease-out both;\n          animation: shadow 1s infinite alternate ease-out both;\n}\n\n@-webkit-keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n\n@keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n@-webkit-keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n@keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n.loader-smartphone:after {\n  content: \"\";\n  color: #fff;\n  font-size: 12px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  line-height: 120px;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  width: 70px;\n  height: 130px;\n  margin: -65px 0 0 -35px;\n  border: 5px solid #fd0;\n  border-radius: 10px;\n  box-shadow: inset 0 5px 0 0 #fd0;\n  background: radial-gradient(circle at 50% 90%, rgba(0, 0, 0, 0.5) 6px, transparent 0), linear-gradient(0deg, #fd0 22px, transparent 0), linear-gradient(0deg, rgba(0, 0, 0, 0.5) 22px, rgba(0, 0, 0, 0.5));\n  -webkit-animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n          animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n}\n\n.loader-smartphone[data-screen=\"\"]:after {\n  content: \"Loading\";\n}\n\n.loader-smartphone:not([data-screen=\"\"]):after {\n  content: attr(data-screen);\n}\n\n@-webkit-keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n\n@keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n.loader-clock:before {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  margin: -60px 0 0 -60px;\n  background: linear-gradient(180deg, transparent 50%, #f5f5f5 0), linear-gradient(90deg, transparent 55px, #2ecc71 0, #2ecc71 65px, transparent 0), linear-gradient(180deg, #f5f5f5 50%, #f5f5f5 0);\n  box-shadow: inset 0 0 0 10px #f5f5f5, 0 0 0 5px #555, 0 0 0 10px #7b7b7b;\n  -webkit-animation: rotation infinite 2s linear;\n          animation: rotation infinite 2s linear;\n}\n\n.loader-clock:after, .loader-clock:before {\n  content: \"\";\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  overflow: hidden;\n}\n\n.loader-clock:after {\n  width: 60px;\n  height: 40px;\n  margin: -20px 0 0 -15px;\n  border-radius: 20px 0 0 20px;\n  background: radial-gradient(circle at 14px 20px, #25a25a 10px, transparent 0), radial-gradient(circle at 14px 20px, #1b7943 14px, transparent 0), linear-gradient(180deg, transparent 15px, #2ecc71 0, #2ecc71 25px, transparent 0);\n  -webkit-animation: rotation infinite 24s linear;\n          animation: rotation infinite 24s linear;\n  transform-origin: 15px center;\n}\n\n.loader-curtain:after, .loader-curtain:before {\n  position: fixed;\n  width: 100%;\n  top: 50%;\n  margin-top: -35px;\n  font-size: 70px;\n  text-align: center;\n  font-family: Helvetica, Arial, sans-serif;\n  overflow: hidden;\n  line-height: 1.2;\n  content: \"Loading\";\n}\n\n.loader-curtain:before {\n  color: #666;\n}\n\n.loader-curtain:after {\n  color: #fff;\n  height: 0;\n  -webkit-animation: curtain 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both;\n}\n\n.loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):after, .loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):before {\n  content: attr(data-curtain-text);\n}\n\n.loader-curtain[data-brazilian]:before {\n  color: #f1c40f;\n}\n\n.loader-curtain[data-brazilian]:after {\n  color: #2ecc71;\n}\n\n.loader-curtain[data-colorful]:before {\n  -webkit-animation: maskColorful 2s linear infinite alternate both;\n          animation: maskColorful 2s linear infinite alternate both;\n}\n\n.loader-curtain[data-colorful]:after {\n  -webkit-animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n  color: #000;\n}\n\n@-webkit-keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n\n@keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n@-webkit-keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@-webkit-keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n@keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n.loader-music:after, .loader-music:before {\n  content: \"\";\n  position: fixed;\n  width: 240px;\n  height: 240px;\n  top: 50%;\n  left: 50%;\n  margin: -120px 0 0 -120px;\n  border-radius: 50%;\n  text-align: center;\n  line-height: 240px;\n  color: #fff;\n  font-size: 40px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);\n  letter-spacing: -1px;\n}\n\n.loader-music:after {\n  -webkit-backface-visibility: hidden;\n          backface-visibility: hidden;\n}\n\n.loader-music[data-hey-oh]:after, .loader-music[data-hey-oh]:before {\n  box-shadow: 0 0 0 10px;\n}\n\n.loader-music[data-hey-oh]:before {\n  background-color: #fff;\n  color: #000;\n  -webkit-animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-hey-oh]:after {\n  background-color: #000;\n  -webkit-animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n          animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after, .loader-music[data-no-cry]:before {\n  background: linear-gradient(45deg, #009b3a 50%, #fed100 51%);\n  box-shadow: 0 0 0 10px #000;\n}\n\n.loader-music[data-no-cry]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after {\n  -webkit-animation: coin 2.5s linear infinite, no 5s linear infinite both;\n          animation: coin 2.5s linear infinite, no 5s linear infinite both;\n}\n\n.loader-music[data-we-are]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n  background: radial-gradient(ellipse at center, #4ecdc4 0, #556270);\n}\n\n.loader-music[data-we-are]:after {\n  -webkit-animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n  background: radial-gradient(ellipse at center, #26d0ce 0, #1a2980);\n}\n\n.loader-music[data-rock-you]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n  background: #444;\n}\n\n.loader-music[data-rock-you]:after {\n  -webkit-animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n  background: #96281b;\n}\n\n@-webkit-keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n\n@keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n@-webkit-keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@-webkit-keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@-webkit-keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@-webkit-keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@-webkit-keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@-webkit-keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@-webkit-keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@-webkit-keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@-webkit-keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n@keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n.loader-pokeball:before {\n  content: \"\";\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  top: 50%;\n  left: 50%;\n  margin: -50px 0 0 -50px;\n  background: linear-gradient(180deg, red 42%, #000 0, #000 58%, #fff 0);\n  background-repeat: no-repeat;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: movePokeball 1s linear infinite both;\n          animation: movePokeball 1s linear infinite both;\n}\n\n.loader-pokeball:after {\n  content: \"\";\n  position: absolute;\n  width: 24px;\n  height: 24px;\n  top: 50%;\n  left: 50%;\n  margin: -12px 0 0 -12px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 2;\n  -webkit-animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n          animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n  border: 2px solid #000;\n  box-shadow: 0 0 0 5px #fff, 0 0 0 10px #000;\n}\n\n@-webkit-keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n\n@keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n@-webkit-keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n@keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n.loader-bouncing:after, .loader-bouncing:before {\n  content: \"\";\n  width: 20px;\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 10px);\n  border-radius: 50%;\n  background-color: #fff;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:after {\n  margin-left: -30px;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:before {\n  -webkit-animation-delay: 0.2s;\n          animation-delay: 0.2s;\n}\n\n@-webkit-keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n\n@keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n.sbl-circ-ripple {\n  height: 48px;\n  width: 48px;\n  color: #48659b;\n  border-radius: 50%;\n  position: relative;\n  display: inline-block;\n  top: 20%;\n  left: 40%;\n}\n\n.sbl-circ-ripple::after, .sbl-circ-ripple::before {\n  content: \"\";\n  height: 0;\n  width: 0;\n  border: inherit;\n  border: 5px solid;\n  border-radius: inherit;\n  position: absolute;\n  left: 40%;\n  top: 40%;\n  -webkit-animation: circle-ripple 1s linear infinite;\n          animation: circle-ripple 1s linear infinite;\n}\n\n.sbl-circ-ripple::before {\n  -webkit-animation-delay: -0.6s;\n          animation-delay: -0.6s;\n}\n\n@-webkit-keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}\n\n@keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}/*# sourceMappingURL=style.css.map */", "",{"version":3,"sources":["webpack://./css/style.css","webpack://./css/base/_customBase.scss","webpack://./css/modules/_footer.scss","webpack://./css/modules/_opening.scss","webpack://./css/modules/_properties.scss","webpack://./css/modules/_single.scss","webpack://./css/modules/_constant.scss","webpack://./css/modules/_search.scss","webpack://./css/modules/_loader.scss","webpack://./css/modules/_all-news.scss","webpack://./css/modules/_shadow-box.scss","webpack://./css/downloads/css-loader.css","webpack://./css/downloads/sbl-circ-ripple.css"],"names":[],"mappings":"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","sourceRoot":""}]);
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
        
        this.displaySquares = document.querySelectorAll('.displaySquares');
  
        this.displayImages = document.querySelectorAll('.displayImages');
        this.magnifyButton = document.querySelectorAll('.fa-search-plus');

        this.displaySquares.forEach(displaySquare => {
          let link = displaySquare.querySelector('.displaySquares-pageLinks');
          let image = displaySquare.querySelector('.displayImages');
          
          displaySquare.addEventListener("mouseenter", e => {

              link.classList.add('displaySquares-pageLinks__visible');
              image.classList.add('pageLinks__visible');
          })
          displaySquare.addEventListener("mouseleave", e => {

              link.classList.remove('displaySquares-pageLinks__visible');
              image.classList.remove('pageLinks__visible');
          })
      })
      
      this.magnifyButton.forEach(b =>{ 
          b.onclick = e=>{

            let image = e.target.closest('.displaySquares-pageLinks').previousElementSibling.cloneNode();
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
            console.log(window.innerWidth)
            if(window.innerWidth >= 960){
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
            destination.innerHTML = `
                ${type.map(item => `
                <div class="overall-squares">
                    <div class="displaySquares">
                        <img class="displayImages" data-name="${item.title.replaceAll(' ', '')}" src="${item.isCompleted || item.postType === 'member' ? item.image : item.projectedImage}" alt="${item.title}">
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
            <div class="media-card"><img data-post="${this.contentShown[this.currentPage].postTypePlural}" data-id="${this.contentShown[this.currentPage].id}" src="${this.contentShown[this.currentPage].gallery[0].image}"></div>
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVcsVUFBVSxZQUFZLFdBQVcsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssTUFBTSxNQUFNLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsWUFBWSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE1BQU0sT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLFVBQVUsS0FBSyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxhQUFhLFlBQVksV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxVQUFVLEtBQUssTUFBTSxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxZQUFZLFlBQVksYUFBYSxZQUFZLFlBQVksVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxjQUFjLGNBQWMsZUFBZSxjQUFjLGNBQWMsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLGNBQWMsY0FBYyxlQUFlLGVBQWUsY0FBYyxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsVUFBVSxZQUFZLFlBQVksYUFBYSxhQUFhLGFBQWEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsV0FBVyxVQUFVLGNBQWMsY0FBYyxlQUFlLGNBQWMsY0FBYyxXQUFXLFFBQVEsUUFBUSxZQUFZLGFBQWEsV0FBVyxRQUFRLFFBQVEsVUFBVSxTQUFTLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsTUFBTSxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssWUFBWSxLQUFLLEtBQUssV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxTQUFTLFFBQVEsS0FBSyxVQUFVLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxZQUFZLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLE1BQU0sUUFBUSxLQUFLLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFlBQVksV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFFBQVEsUUFBUSxVQUFVLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsU0FBUyxRQUFRLEtBQUssVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxpQ0FBaUM7QUFDend3RDtBQUNBLGlFQUFlLHVCQUF1QixFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1B2QztBQUMwRztBQUNqQjtBQUN6Riw4QkFBOEIsbUZBQTJCLENBQUMsNEZBQXFDO0FBQy9GO0FBQ0EsNkRBQTZELFFBQVEsdUJBQXVCLGlCQUFpQixjQUFjLEdBQUcsNkJBQTZCLFVBQVUsdUJBQXVCLEtBQUssR0FBRyw2QkFBNkIsVUFBVSx1QkFBdUIsS0FBSyxHQUFHLGVBQWUscUJBQXFCLEdBQUcsVUFBVSxjQUFjLHdCQUF3QixHQUFHLFFBQVEsY0FBYyx3QkFBd0Isb0JBQW9CLEdBQUcsUUFBUSxzQkFBc0IsY0FBYyxHQUFHLFFBQVEsc0JBQXNCLGNBQWMsR0FBRyxPQUFPLDBCQUEwQixtQkFBbUIsR0FBRyxPQUFPLG9CQUFvQixHQUFHLDhCQUE4Qix5QkFBeUIsR0FBRyxjQUFjLGVBQWUsR0FBRyxvQkFBb0IsbUJBQW1CLDJCQUEyQixHQUFHLGNBQWMsa0JBQWtCLHlCQUF5QixHQUFHLGlCQUFpQiwyQkFBMkIsR0FBRyxZQUFZLGlCQUFpQiw0QkFBNEIsR0FBRyxRQUFRLDBCQUEwQixHQUFHLHVCQUF1Qix1QkFBdUIsV0FBVyxHQUFHLDJCQUEyQix5QkFBeUIsR0FBRyx1QkFBdUIsb0JBQW9CLGdCQUFnQixpQkFBaUIsc0JBQXNCLGtCQUFrQiw0QkFBNEIsR0FBRywyQkFBMkIsZUFBZSxrQkFBa0IsNEJBQTRCLHdCQUF3QixHQUFHLHVEQUF1RCx1QkFBdUIsR0FBRyx5REFBeUQsdUJBQXVCLEdBQUcsbUNBQW1DLHVCQUF1QixHQUFHLHNCQUFzQixxQkFBcUIsR0FBRyx5QkFBeUIsZ0JBQWdCLGlCQUFpQixHQUFHLGVBQWUsaUJBQWlCLEdBQUcsaUJBQWlCLGdCQUFnQixnQkFBZ0IsY0FBYyxHQUFHLDZCQUE2QixrQkFBa0IsR0FBRyxnQ0FBZ0MseUJBQXlCLHdCQUF3QixHQUFHLGlCQUFpQixnQkFBZ0IsaUJBQWlCLEdBQUcsMkRBQTJELGtCQUFrQixtQkFBbUIsR0FBRyw2QkFBNkIsNkRBQTZELDZDQUE2QyxLQUFLLEdBQUcsNkJBQTZCLDZEQUE2RCw2Q0FBNkMsS0FBSyxHQUFHLDJGQUEyRix3QkFBd0IsdUJBQXVCLHVCQUF1QixrQkFBa0Isd0JBQXdCLEdBQUcsK0dBQStHLHVCQUF1QixrQkFBa0IsMkJBQTJCLGdCQUFnQix1QkFBdUIsZUFBZSxHQUFHLG1IQUFtSCw4QkFBOEIsb0JBQW9CLHNCQUFzQix1QkFBdUIsR0FBRywrSEFBK0gsMkJBQTJCLDZCQUE2QixHQUFHLG1IQUFtSCxzQkFBc0IsR0FBRyxpS0FBaUssZUFBZSxHQUFHLDRNQUE0TSxlQUFlLEdBQUcsdUZBQXVGLHVCQUF1QixzQkFBc0Isa0JBQWtCLDJCQUEyQixjQUFjLEdBQUcsMkZBQTJGLGNBQWMsR0FBRyx5SEFBeUgscUJBQXFCLEdBQUcscUJBQXFCLGlCQUFpQixvQkFBb0IsaUJBQWlCLEdBQUcsNEJBQTRCLGlCQUFpQixrQkFBa0IsR0FBRyxzQkFBc0IsNENBQTRDLGNBQWMsa0JBQWtCLG9CQUFvQixjQUFjLGdCQUFnQix1QkFBdUIsOEJBQThCLHdCQUF3QixpQkFBaUIsR0FBRyx1QkFBdUIsbUJBQW1CLHVCQUF1Qiw4QkFBOEIsa0JBQWtCLDRCQUE0QixHQUFHLHdCQUF3QixzQkFBc0IsR0FBRyx1QkFBdUIsc0JBQXNCLHFCQUFxQixHQUFHLDJDQUEyQyxnQkFBZ0IsK0JBQStCLGVBQWUsR0FBRyw0QkFBNEIsa0JBQWtCLHdCQUF3QixzQ0FBc0MsNkNBQTZDLHVFQUF1RSxnQkFBZ0IsaUJBQWlCLG9CQUFvQixXQUFXLGtCQUFrQiw4QkFBOEIsR0FBRyxtQ0FBbUMsa0JBQWtCLEdBQUcsbUNBQW1DLHNCQUFzQixpQkFBaUIsb0JBQW9CLEdBQUcscUNBQXFDLG9CQUFvQixHQUFHLDhFQUE4RSxpQkFBaUIsR0FBRyx5Q0FBeUMsdUJBQXVCLHlCQUF5QixHQUFHLHVDQUF1Qyx1QkFBdUIseUJBQXlCLEdBQUcsZ0NBQWdDLGlCQUFpQixHQUFHLDREQUE0RCxjQUFjLEdBQUcsZ0NBQWdDLHVCQUF1QixHQUFHLG1DQUFtQyxjQUFjLGVBQWUsaUJBQWlCLGtCQUFrQiw0QkFBNEIsd0JBQXdCLGdCQUFnQixHQUFHLHdDQUF3QyxzQkFBc0IsK0JBQStCLEdBQUcsZ0NBQWdDLHVCQUF1QixXQUFXLGlCQUFpQixnQkFBZ0IsR0FBRyxvQ0FBb0MsaUJBQWlCLGdCQUFnQix3Q0FBd0MsR0FBRyx1Q0FBdUMsdUJBQXVCLHVCQUF1QixtQkFBbUIsa0JBQWtCLDRCQUE0QixnQkFBZ0IsR0FBRywyQ0FBMkMsaUJBQWlCLEdBQUcsZUFBZSw0QkFBNEIsR0FBRyxlQUFlLHNCQUFzQixHQUFHLGNBQWMseUJBQXlCLEdBQUcsY0FBYyxzQkFBc0IsaUJBQWlCLEdBQUcsNkVBQTZFLDZDQUE2QyxHQUFHLG1EQUFtRCxnQkFBZ0IsaUJBQWlCLHdCQUF3QixHQUFHLHlGQUF5Riw0QkFBNEIsR0FBRywwQ0FBMEMsc0NBQXNDLGlCQUFpQixHQUFHLHdFQUF3RSx5Q0FBeUMsR0FBRywwRUFBMEUsd0JBQXdCLEdBQUcsZ0VBQWdFLGtCQUFrQixzQkFBc0IsR0FBRyw0RUFBNEUsb0JBQW9CLGlCQUFpQixHQUFHLHdGQUF3RixtQkFBbUIsZ0JBQWdCLEdBQUcsNEZBQTRGLGlCQUFpQixHQUFHLHNFQUFzRSx1QkFBdUIsZUFBZSxHQUFHLHNFQUFzRSxlQUFlLEdBQUcsNEVBQTRFLG9CQUFvQixHQUFHLDRFQUE0RSwrQ0FBK0MsR0FBRywwRkFBMEYsbUJBQW1CLG1CQUFtQixpQkFBaUIsZ0JBQWdCLEdBQUcsb0ZBQW9GLGdCQUFnQixxQkFBcUIsb0JBQW9CLEdBQUcsZ0ZBQWdGLHdCQUF3Qix1QkFBdUIsR0FBRyxvSkFBb0osa0JBQWtCLEdBQUcsdUJBQXVCLHNCQUFzQixpQkFBaUIsR0FBRyxpQ0FBaUMsa0JBQWtCLHlCQUF5QixHQUFHLHFDQUFxQywyQkFBMkIsZUFBZSxHQUFHLDZDQUE2QyxzQkFBc0IscUJBQXFCLDhCQUE4QixHQUFHLDRDQUE0QyxpQkFBaUIsa0JBQWtCLEdBQUcsNENBQTRDLHNCQUFzQixHQUFHLG1EQUFtRCxlQUFlLHFCQUFxQixHQUFHLHlDQUF5QyxlQUFlLEdBQUcsNENBQTRDLG1CQUFtQixtQkFBbUIsZUFBZSxtQkFBbUIsR0FBRywrQ0FBK0MsZ0JBQWdCLGtCQUFrQixHQUFHLDZDQUE2QyxpQkFBaUIsR0FBRyxnQkFBZ0IsYUFBYSxjQUFjLEdBQUcseUJBQXlCLDRDQUE0QyxnQkFBZ0IsaUJBQWlCLHFCQUFxQix1QkFBdUIsaUJBQWlCLG9CQUFvQixhQUFhLGNBQWMsa0JBQWtCLGtDQUFrQyx3QkFBd0IsMkJBQTJCLHNCQUFzQixHQUFHLDJCQUEyQixpQkFBaUIsR0FBRyxxREFBcUQsb0JBQW9CLEdBQUcsOEJBQThCLHdCQUF3QixvQkFBb0IsR0FBRyxpRUFBaUUsNEJBQTRCLEdBQUcsdUNBQXVDLGtCQUFrQixrQ0FBa0MsdUJBQXVCLGVBQWUsR0FBRywyREFBMkQsc0JBQXNCLEdBQUcseUJBQXlCLDRDQUE0QyxpQkFBaUIsZ0JBQWdCLHFCQUFxQix1QkFBdUIsaUJBQWlCLG9CQUFvQixhQUFhLGNBQWMsa0JBQWtCLGtDQUFrQyx3QkFBd0IsMkJBQTJCLEdBQUcsc0JBQXNCLGdCQUFnQixtQkFBbUIsY0FBYyxrQkFBa0Isb0JBQW9CLHVCQUF1QixlQUFlLHlCQUF5Qix5QkFBeUIsNENBQTRDLEdBQUcsdUJBQXVCLHNCQUFzQixHQUFHLDRFQUE0RSw4QkFBOEIsR0FBRyx1Q0FBdUMsZ0JBQWdCLHVCQUF1QixHQUFHLDJDQUEyQyxnQkFBZ0IsR0FBRywwQ0FBMEMsc0JBQXNCLHVCQUF1QixxQkFBcUIscUJBQXFCLEdBQUcsNkNBQTZDLHVCQUF1Qiw0QkFBNEIsR0FBRywrQ0FBK0MsNkJBQTZCLEdBQUcsZ0NBQWdDLGdCQUFnQixrQkFBa0IsK0JBQStCLGlCQUFpQixHQUFHLGtDQUFrQyx1QkFBdUIsc0JBQXNCLGdCQUFnQixHQUFHLG9DQUFvQyxtQkFBbUIsb0JBQW9CLEdBQUcsZ0RBQWdELGlCQUFpQixHQUFHLHVEQUF1RCxpQkFBaUIsa0JBQWtCLEdBQUcsa0NBQWtDLGlCQUFpQixnQkFBZ0IsbUJBQW1CLHVCQUF1Qix1QkFBdUIsR0FBRyxxQ0FBcUMsc0JBQXNCLG1CQUFtQixHQUFHLGlDQUFpQyxnQkFBZ0IsdUJBQXVCLGlCQUFpQixtQkFBbUIsb0JBQW9CLGtCQUFrQixtQ0FBbUMsR0FBRyxvQ0FBb0Msb0JBQW9CLEdBQUcsc0NBQXNDLHNCQUFzQixHQUFHLDRDQUE0QyxpQkFBaUIsR0FBRyxnREFBZ0QsbUJBQW1CLG1CQUFtQixHQUFHLGtEQUFrRCxzQkFBc0Isd0JBQXdCLEdBQUcsb0RBQW9ELHVCQUF1QixjQUFjLGdCQUFnQixzQkFBc0Isa0JBQWtCLDRCQUE0QixHQUFHLFVBQVUsdUNBQXVDLEdBQUcscUJBQXFCLHFCQUFxQix1QkFBdUIsaUJBQWlCLG9CQUFvQixXQUFXLFlBQVksYUFBYSxjQUFjLDZDQUE2Qyx1QkFBdUIsZUFBZSwyQkFBMkIsOERBQThELDJCQUEyQixHQUFHLDhCQUE4QixzQkFBc0IsbUJBQW1CLG9CQUFvQix1QkFBdUIsa0JBQWtCLHdCQUF3QixHQUFHLHFCQUFxQixzQkFBc0IsR0FBRyxrQ0FBa0MsY0FBYyxHQUFHLHdCQUF3QiwwQ0FBMEMsR0FBRyx5QkFBeUIsMEJBQTBCLHNCQUFzQiw4QkFBOEIsR0FBRywyQkFBMkIsd0JBQXdCLGVBQWUsd0JBQXdCLEdBQUcsa0NBQWtDLHlCQUF5QixxQkFBcUIsb0JBQW9CLG9CQUFvQixrQ0FBa0MsR0FBRywwQkFBMEIsc0JBQXNCLG9CQUFvQix5QkFBeUIsc0NBQXNDLDhCQUE4QixxQkFBcUIsR0FBRyxnQ0FBZ0MsZUFBZSxHQUFHLDZCQUE2QixzQkFBc0IsR0FBRyxrQkFBa0IsZUFBZSwyQkFBMkIsaUJBQWlCLG9CQUFvQixjQUFjLGtDQUFrQyxvQkFBb0IscUJBQXFCLGtCQUFrQiw4QkFBOEIsR0FBRyxxQkFBcUIscUJBQXFCLEdBQUcsZ0JBQWdCLHNCQUFzQixtQkFBbUIsb0JBQW9CLHVCQUF1QixHQUFHLCtCQUErQixrQkFBa0IsaUJBQWlCLHNCQUFzQixLQUFLLEdBQUcsMkJBQTJCLFFBQVEsOEJBQThCLEtBQUssVUFBVSxnQ0FBZ0MsS0FBSyxHQUFHLG1CQUFtQixRQUFRLDhCQUE4QixLQUFLLFVBQVUsZ0NBQWdDLEtBQUssR0FBRyxtQkFBbUIscUJBQXFCLHVCQUF1QixnQkFBZ0IsaUJBQWlCLDZDQUE2Qyw0QkFBNEIsK0NBQStDLHVDQUF1QyxHQUFHLHdCQUF3QixpQkFBaUIsb0JBQW9CLHNCQUFzQixHQUFHLG9CQUFvQiw4Q0FBOEMsR0FBRywyREFBMkQsaURBQWlELEdBQUcsUUFBUSxxQkFBcUIsR0FBRyxRQUFRLHFCQUFxQixHQUFHLHFEQUFxRCx5Q0FBeUMsR0FBRyx1SEFBdUgsaUNBQWlDLEdBQUcsa0JBQWtCLG9CQUFvQixhQUFhLGlCQUFpQixHQUFHLHFCQUFxQixrQ0FBa0MsZ0JBQWdCLHVCQUF1QixHQUFHLHlCQUF5QixrQkFBa0IsbUJBQW1CLHVDQUF1Qyx1QkFBdUIsdUJBQXVCLGFBQWEsdUlBQXVJLHVJQUF1SSxHQUFHLDZDQUE2Qyx1QkFBdUIsR0FBRyw0Q0FBNEMsdUJBQXVCLGVBQWUsY0FBYyxhQUFhLHNCQUFzQiw4QkFBOEIsa0NBQWtDLEdBQUcsK0NBQStDLGtCQUFrQixtQkFBbUIseUNBQXlDLHFJQUFxSSxxSUFBcUksR0FBRyxvQ0FBb0MsZ0JBQWdCLGVBQWUscURBQXFELDREQUE0RCw0REFBNEQsR0FBRyw4QkFBOEIsUUFBUSxtQkFBbUIsS0FBSyxTQUFTLG9CQUFvQixLQUFLLFVBQVUsaUJBQWlCLEtBQUssR0FBRyxzQkFBc0IsUUFBUSxtQkFBbUIsS0FBSyxTQUFTLG9CQUFvQixLQUFLLFVBQVUsaUJBQWlCLEtBQUssR0FBRyxzQ0FBc0MsUUFBUSxnQkFBZ0IsS0FBSyxVQUFVLGdCQUFnQixLQUFLLEdBQUcsOEJBQThCLFFBQVEsZ0JBQWdCLEtBQUssVUFBVSxnQkFBZ0IsS0FBSyxHQUFHLGdEQUFnRCxRQUFRLCtDQUErQyxLQUFLLFNBQVMsaURBQWlELEtBQUssVUFBVSxpREFBaUQsS0FBSyxHQUFHLHdDQUF3QyxRQUFRLCtDQUErQyxLQUFLLFNBQVMsaURBQWlELEtBQUssVUFBVSxpREFBaUQsS0FBSyxHQUFHLHVDQUF1QyxRQUFRLGdCQUFnQixLQUFLLFVBQVUsZ0JBQWdCLEtBQUssR0FBRywrQkFBK0IsUUFBUSxnQkFBZ0IsS0FBSyxVQUFVLGdCQUFnQixLQUFLLEdBQUcsaURBQWlELFFBQVEseUNBQXlDLEtBQUssU0FBUyx5Q0FBeUMsS0FBSyxVQUFVLDBDQUEwQyxLQUFLLEdBQUcseUNBQXlDLFFBQVEseUNBQXlDLEtBQUssU0FBUyx5Q0FBeUMsS0FBSyxVQUFVLDBDQUEwQyxLQUFLLEdBQUcsdUJBQXVCLGdCQUFnQixZQUFZLGVBQWUsZUFBZSw2Q0FBNkMsdUJBQXVCLGtCQUFrQixxQkFBcUIsR0FBRyw4QkFBOEIsd0JBQXdCLEdBQUcsd0lBQXdJLHVCQUF1QixpQkFBaUIsR0FBRyxvREFBb0Qsa0RBQWtELHNCQUFzQix5QkFBeUIsa0JBQWtCLHNGQUFzRixHQUFHLGtGQUFrRix5Q0FBeUMsa0JBQWtCLHVCQUF1QixvR0FBb0csZ0JBQWdCLEdBQUcsK0tBQStLLHNCQUFzQixHQUFHLHFGQUFxRiwwQkFBMEIsR0FBRyw0RkFBNEYsdUJBQXVCLEdBQUcsK0ZBQStGLDBCQUEwQixHQUFHLCtGQUErRiwwQkFBMEIsR0FBRyxzR0FBc0csa0JBQWtCLGNBQWMsR0FBRyxxRkFBcUYseUJBQXlCLEdBQUcsd0ZBQXdGLHVCQUF1QixHQUFHLG9FQUFvRSw2QkFBNkIsa0JBQWtCLHFMQUFxTCxHQUFHLHVFQUF1RSx5QkFBeUIsR0FBRywyRUFBMkUsc0JBQXNCLHFCQUFxQixHQUFHLDJGQUEyRiwwQkFBMEIsR0FBRyx3R0FBd0csdUJBQXVCLG1CQUFtQixpQkFBaUIsR0FBRyxvRkFBb0YsNEJBQTRCLEdBQUcscUZBQXFGLDZCQUE2QixHQUFHLG9GQUFvRiw2QkFBNkIsR0FBRyxtRkFBbUYsNEJBQTRCLEdBQUcseUZBQXlGLGtDQUFrQyxHQUFHLGdMQUFnTCx5QkFBeUIsR0FBRywwTEFBMEwsZUFBZSxHQUFHLDRLQUE0SyxzQkFBc0IsR0FBRywrREFBK0Qsc0JBQXNCLHdCQUF3QixHQUFHLDJEQUEyRCxvQkFBb0IsR0FBRyx1REFBdUQsc0JBQXNCLEdBQUcsdURBQXVELHNCQUFzQiwwQkFBMEIsR0FBRyxnREFBZ0QsZUFBZSxrQkFBa0IsbUNBQW1DLDRDQUE0QyxHQUFHLG1EQUFtRCxnQkFBZ0IsdUJBQXVCLG9CQUFvQix3QkFBd0IsbURBQW1ELEdBQUcsbUVBQW1FLHVCQUF1QixHQUFHLDZFQUE2RSxrQkFBa0IseUJBQXlCLEdBQUcsd0VBQXdFLDBCQUEwQix3QkFBd0IsbUJBQW1CLEdBQUcsd0VBQXdFLHVCQUF1QixHQUFHLHdKQUF3SixrQkFBa0IseUJBQXlCLEdBQUcsZ0pBQWdKLHNCQUFzQixtQkFBbUIsR0FBRyw4SkFBOEosbUJBQW1CLG1CQUFtQixpQkFBaUIsZ0JBQWdCLEdBQUcsb1RBQW9ULGdCQUFnQixxQkFBcUIsR0FBRyxvSkFBb0osd0JBQXdCLEdBQUcsOEpBQThKLGlCQUFpQixrQkFBa0IsR0FBRyxnSkFBZ0osNEJBQTRCLEdBQUcsa1dBQWtXLG9CQUFvQixHQUFHLDBZQUEwWSxrQkFBa0IsR0FBRyxvREFBb0QsZUFBZSxzQkFBc0IsR0FBRywwQ0FBMEMsZ0JBQWdCLEdBQUcsb0RBQW9ELGtCQUFrQix5QkFBeUIsR0FBRyx5REFBeUQsa0JBQWtCLHdCQUF3Qiw0QkFBNEIsR0FBRywyREFBMkQsb0JBQW9CLHNCQUFzQix3QkFBd0IsR0FBRyx3SUFBd0kseUJBQXlCLEdBQUcsa0VBQWtFLGVBQWUsR0FBRyxxQkFBcUIsa0JBQWtCLG9CQUFvQiw0Q0FBNEMsWUFBWSxnQkFBZ0IsZ0JBQWdCLGVBQWUsR0FBRyxrQ0FBa0MsdUJBQXVCLHVCQUF1QixjQUFjLGtCQUFrQixpQkFBaUIsR0FBRyw2RUFBNkUsZ0JBQWdCLGlCQUFpQixHQUFHLHlEQUF5RCxrQkFBa0IsNEJBQTRCLHdCQUF3Qix1QkFBdUIsaUJBQWlCLGdCQUFnQixHQUFHLHNFQUFzRSxpQkFBaUIsZ0JBQWdCLDhDQUE4Qyx1QkFBdUIsdUJBQXVCLG9CQUFvQixrQkFBa0IsNEJBQTRCLHdCQUF3QixrQ0FBa0MsR0FBRywwRUFBMEUsK0NBQStDLHlDQUF5Qyw0Q0FBNEMsR0FBRyw0RUFBNEUsaUJBQWlCLEdBQUcsaURBQWlELGtCQUFrQiw0QkFBNEIsd0JBQXdCLEdBQUcsOENBQThDLGtCQUFrQiwyQkFBMkIsdUJBQXVCLGdCQUFnQixtQkFBbUIsZ0JBQWdCLGNBQWMsR0FBRywwREFBMEQsc0JBQXNCLGtCQUFrQixHQUFHLDREQUE0RCxpQkFBaUIsc0JBQXNCLG9CQUFvQixHQUFHLG1FQUFtRSwwQkFBMEIseUJBQXlCLEdBQUcsNERBQTRELHFCQUFxQixrQkFBa0IsMkJBQTJCLG1CQUFtQixHQUFHLDZFQUE2RSxrQkFBa0IscUJBQXFCLGdCQUFnQixHQUFHLDBGQUEwRixlQUFlLG9CQUFvQixHQUFHLG1HQUFtRywwQkFBMEIseUJBQXlCLEdBQUcsZ0dBQWdHLGtCQUFrQiwyQkFBMkIsc0JBQXNCLGVBQWUsR0FBRyxrR0FBa0csY0FBYyxpQkFBaUIsR0FBRyxpSEFBaUgscUJBQXFCLEdBQUcsZ0VBQWdFLHVCQUF1QixxQkFBcUIsZ0JBQWdCLGtCQUFrQiw0QkFBNEIsd0JBQXdCLEdBQUcsa0VBQWtFLHNCQUFzQixzQkFBc0IsR0FBRyxnQ0FBZ0MsdUJBQXVCLGlCQUFpQixpQkFBaUIsZ0JBQWdCLHNCQUFzQixvQkFBb0IsR0FBRywyREFBMkQsNEJBQTRCLG9CQUFvQixHQUFHLHVLQUF1SywwQkFBMEIsb0JBQW9CLEdBQUcsYUFBYSxnQkFBZ0Isb0JBQW9CLDJCQUEyQixrQkFBa0IsaUJBQWlCLGFBQWEsY0FBYyxxQkFBcUIsb0JBQW9CLEdBQUcsbUNBQW1DLDJCQUEyQixrQkFBa0IsR0FBRyx1QkFBdUIsMENBQTBDLGdCQUFnQixpQkFBaUIsWUFBWSxXQUFXLEdBQUcsdURBQXVELG1CQUFtQixHQUFHLGlDQUFpQyxRQUFRLDJCQUEyQixLQUFLLFFBQVEsZ0NBQWdDLEtBQUssR0FBRyx5QkFBeUIsUUFBUSwyQkFBMkIsS0FBSyxRQUFRLGdDQUFnQyxLQUFLLEdBQUcsb0JBQW9CLFFBQVEsbUJBQW1CLEtBQUssUUFBUSxpQkFBaUIsS0FBSyxHQUFHLDZCQUE2QixvQkFBb0IsWUFBWSxhQUFhLHdCQUF3Qiw4Q0FBOEMsdUJBQXVCLGdCQUFnQixvQkFBb0IsR0FBRyxvQ0FBb0MseUJBQXlCLEdBQUcscURBQXFELDZCQUE2QixHQUFHLDJDQUEyQywwREFBMEQsMERBQTBELEdBQUcsdUNBQXVDLDBCQUEwQixHQUFHLDJCQUEyQixrQkFBa0Isb0JBQW9CLGdCQUFnQixpQkFBaUIsMkJBQTJCLG1DQUFtQyx1QkFBdUIsMEJBQTBCLDJCQUEyQixtREFBbUQsbURBQW1ELEdBQUcsc0NBQXNDLG9DQUFvQyxHQUFHLHlDQUF5QyxpQ0FBaUMsR0FBRyxpREFBaUQsa0JBQWtCLG9CQUFvQix1QkFBdUIsc0JBQXNCLG1EQUFtRCxtREFBbUQsR0FBRywwQkFBMEIsZ0JBQWdCLGlCQUFpQix1QkFBdUIsbUNBQW1DLDBCQUEwQiwyQkFBMkIsR0FBRywyQkFBMkIsZ0JBQWdCLGlCQUFpQiwwQkFBMEIsb0NBQW9DLG1DQUFtQyxtQ0FBbUMsMEJBQTBCLDJCQUEyQixHQUFHLG1DQUFtQywwQkFBMEIsZ0JBQWdCLEdBQUcsdUJBQXVCLGtCQUFrQixvQkFBb0IsYUFBYSxjQUFjLGlCQUFpQixpQkFBaUIscUNBQXFDLHlIQUF5SCwrQkFBK0Isb0ZBQW9GLG9EQUFvRCxHQUFHLHFDQUFxQyx3QkFBd0IsR0FBRyxxQ0FBcUMsd0NBQXdDLHdDQUF3QyxHQUFHLGdDQUFnQyxRQUFRLCtCQUErQixLQUFLLFFBQVEscUNBQXFDLEtBQUssR0FBRyx3QkFBd0IsUUFBUSwrQkFBK0IsS0FBSyxRQUFRLHFDQUFxQyxLQUFLLEdBQUcsZ0NBQWdDLGlCQUFpQiwyQkFBMkIsR0FBRywrREFBK0Qsa0JBQWtCLGlCQUFpQix1QkFBdUIsMEJBQTBCLDRCQUE0QixHQUFHLGlDQUFpQyxnQkFBZ0IsMkJBQTJCLHNFQUFzRSxzRUFBc0UsR0FBRyxnREFBZ0Qsd0JBQXdCLEdBQUcsK0NBQStDLHVCQUF1QixnQkFBZ0IsbURBQW1ELG1EQUFtRCxHQUFHLGdDQUFnQyxRQUFRLDhCQUE4QixLQUFLLFFBQVEsNkJBQTZCLEtBQUssR0FBRyw2Q0FBNkMsUUFBUSw4QkFBOEIsS0FBSyxRQUFRLDZCQUE2QixLQUFLLEdBQUcscUNBQXFDLFFBQVEsOEJBQThCLEtBQUssUUFBUSw2QkFBNkIsS0FBSyxHQUFHLDhCQUE4QixRQUFRLGtCQUFrQixtQkFBbUIsS0FBSyxTQUFTLGtCQUFrQixtQkFBbUIsOEJBQThCLGFBQWEsS0FBSyxTQUFTLG1CQUFtQixLQUFLLFNBQVMsbUJBQW1CLDZCQUE2Qiw4QkFBOEIsS0FBSyxTQUFTLGtCQUFrQixLQUFLLFNBQVMsa0JBQWtCLGNBQWMsNkJBQTZCLEtBQUssU0FBUyxtQkFBbUIsS0FBSyxHQUFHLHNCQUFzQixRQUFRLGtCQUFrQixtQkFBbUIsS0FBSyxTQUFTLGtCQUFrQixtQkFBbUIsOEJBQThCLGFBQWEsS0FBSyxTQUFTLG1CQUFtQixLQUFLLFNBQVMsbUJBQW1CLDZCQUE2Qiw4QkFBOEIsS0FBSyxTQUFTLGtCQUFrQixLQUFLLFNBQVMsa0JBQWtCLGNBQWMsNkJBQTZCLEtBQUssU0FBUyxtQkFBbUIsS0FBSyxHQUFHLG9DQUFvQyxnQkFBZ0IsR0FBRywwQkFBMEIsa0JBQWtCLHVCQUF1QixXQUFXLFlBQVksZ0JBQWdCLGlCQUFpQiwyQkFBMkIscURBQXFELHFEQUFxRCxHQUFHLHlCQUF5QixrQkFBa0IsdUJBQXVCLGdCQUFnQixpQkFBaUIsYUFBYSxjQUFjLDRCQUE0QiwyQkFBMkIsdUJBQXVCLGVBQWUsbUVBQW1FLG1FQUFtRSxHQUFHLHNDQUFzQywwREFBMEQsR0FBRyx3QkFBd0Isa0JBQWtCLHVCQUF1Qix5Q0FBeUMsdUJBQXVCLGdCQUFnQixpQkFBaUIsMEJBQTBCLGNBQWMsMEJBQTBCLGVBQWUsa0VBQWtFLGtFQUFrRSxHQUFHLCtCQUErQixRQUFRLG9DQUFvQywwQkFBMEIsS0FBSyxTQUFTLG9DQUFvQywwQkFBMEIsS0FBSyxTQUFTLDRDQUE0QywwQkFBMEIsS0FBSyxRQUFRLDRDQUE0QywwQkFBMEIsS0FBSyxHQUFHLHVCQUF1QixRQUFRLG9DQUFvQywwQkFBMEIsS0FBSyxTQUFTLG9DQUFvQywwQkFBMEIsS0FBSyxTQUFTLDRDQUE0QywwQkFBMEIsS0FBSyxRQUFRLDRDQUE0QywwQkFBMEIsS0FBSyxHQUFHLCtCQUErQixRQUFRLGdEQUFnRCxLQUFLLFNBQVMseUJBQXlCLEtBQUssUUFBUSx5Q0FBeUMscUNBQXFDLEtBQUssR0FBRyx1QkFBdUIsUUFBUSxnREFBZ0QsS0FBSyxTQUFTLHlCQUF5QixLQUFLLFFBQVEseUNBQXlDLHFDQUFxQyxLQUFLLEdBQUcsNEJBQTRCLGtCQUFrQixnQkFBZ0Isb0JBQW9CLDhDQUE4Qyx1QkFBdUIsdUJBQXVCLG9CQUFvQixjQUFjLGFBQWEsZ0JBQWdCLGtCQUFrQiw0QkFBNEIsMkJBQTJCLHdCQUF3QixxQ0FBcUMsK01BQStNLG1GQUFtRixtRkFBbUYsR0FBRyxnREFBZ0QseUJBQXlCLEdBQUcsc0RBQXNELCtCQUErQixHQUFHLDhCQUE4QixRQUFRLHlDQUF5QyxLQUFLLFNBQVMsd0NBQXdDLEtBQUssU0FBUyx5Q0FBeUMsS0FBSyxTQUFTLHdDQUF3QyxLQUFLLFNBQVMseUNBQXlDLEtBQUssU0FBUyx3Q0FBd0MsS0FBSyxTQUFTLHlDQUF5QyxLQUFLLFNBQVMsd0NBQXdDLEtBQUssU0FBUyx5Q0FBeUMsS0FBSyxTQUFTLHdDQUF3QyxLQUFLLFNBQVMseUNBQXlDLEtBQUssR0FBRyxzQkFBc0IsUUFBUSx5Q0FBeUMsS0FBSyxTQUFTLHdDQUF3QyxLQUFLLFNBQVMseUNBQXlDLEtBQUssU0FBUyx3Q0FBd0MsS0FBSyxTQUFTLHlDQUF5QyxLQUFLLFNBQVMsd0NBQXdDLEtBQUssU0FBUyx5Q0FBeUMsS0FBSyxTQUFTLHdDQUF3QyxLQUFLLFNBQVMseUNBQXlDLEtBQUssU0FBUyx3Q0FBd0MsS0FBSyxTQUFTLHlDQUF5QyxLQUFLLEdBQUcsd0JBQXdCLGlCQUFpQixrQkFBa0IsdUJBQXVCLDRCQUE0Qix1TUFBdU0sNkVBQTZFLG1EQUFtRCxtREFBbUQsR0FBRywrQ0FBK0Msa0JBQWtCLG9CQUFvQixjQUFjLGFBQWEscUJBQXFCLEdBQUcseUJBQXlCLGdCQUFnQixpQkFBaUIsNEJBQTRCLGlDQUFpQyx3T0FBd08sb0RBQW9ELG9EQUFvRCxrQ0FBa0MsR0FBRyxtREFBbUQsb0JBQW9CLGdCQUFnQixhQUFhLHNCQUFzQixvQkFBb0IsdUJBQXVCLDhDQUE4QyxxQkFBcUIscUJBQXFCLHlCQUF5QixHQUFHLDRCQUE0QixnQkFBZ0IsR0FBRywyQkFBMkIsZ0JBQWdCLGNBQWMsaUVBQWlFLGlFQUFpRSxHQUFHLHFKQUFxSixxQ0FBcUMsR0FBRyw0Q0FBNEMsbUJBQW1CLEdBQUcsMkNBQTJDLG1CQUFtQixHQUFHLDJDQUEyQyxzRUFBc0Usc0VBQXNFLEdBQUcsMENBQTBDLDBIQUEwSCwwSEFBMEgsZ0JBQWdCLEdBQUcscUNBQXFDLFFBQVEscUJBQXFCLEtBQUssV0FBVyxxQkFBcUIsS0FBSyxXQUFXLHFCQUFxQixLQUFLLFFBQVEscUJBQXFCLEtBQUssR0FBRyw2QkFBNkIsUUFBUSxxQkFBcUIsS0FBSyxXQUFXLHFCQUFxQixLQUFLLFdBQVcscUJBQXFCLEtBQUssUUFBUSxxQkFBcUIsS0FBSyxHQUFHLHlDQUF5QyxRQUFRLHFCQUFxQixLQUFLLFdBQVcscUJBQXFCLEtBQUssV0FBVyxxQkFBcUIsS0FBSyxRQUFRLHFCQUFxQixLQUFLLEdBQUcsaUNBQWlDLFFBQVEscUJBQXFCLEtBQUssV0FBVyxxQkFBcUIsS0FBSyxXQUFXLHFCQUFxQixLQUFLLFFBQVEscUJBQXFCLEtBQUssR0FBRyw4QkFBOEIsUUFBUSxnQkFBZ0IsS0FBSyxRQUFRLG1CQUFtQixLQUFLLEdBQUcsc0JBQXNCLFFBQVEsZ0JBQWdCLEtBQUssUUFBUSxtQkFBbUIsS0FBSyxHQUFHLDZDQUE2QyxrQkFBa0Isb0JBQW9CLGlCQUFpQixrQkFBa0IsYUFBYSxjQUFjLDhCQUE4Qix1QkFBdUIsdUJBQXVCLHVCQUF1QixnQkFBZ0Isb0JBQW9CLDhDQUE4Qyw4Q0FBOEMseUJBQXlCLEdBQUcseUJBQXlCLHdDQUF3Qyx3Q0FBd0MsR0FBRyx5RUFBeUUsMkJBQTJCLEdBQUcsdUNBQXVDLDJCQUEyQixnQkFBZ0IsdUZBQXVGLHVGQUF1RixHQUFHLHNDQUFzQywyQkFBMkIsOEVBQThFLDhFQUE4RSxHQUFHLHlFQUF5RSxpRUFBaUUsZ0NBQWdDLEdBQUcsdUNBQXVDLHdGQUF3Rix3RkFBd0YsR0FBRyxzQ0FBc0MsNkVBQTZFLDZFQUE2RSxHQUFHLHVDQUF1Qyw2RkFBNkYsNkZBQTZGLHVFQUF1RSxHQUFHLHNDQUFzQyxnRkFBZ0YsZ0ZBQWdGLHVFQUF1RSxHQUFHLHlDQUF5Qyw0RkFBNEYsNEZBQTRGLHFCQUFxQixHQUFHLHdDQUF3QyxpRkFBaUYsaUZBQWlGLHdCQUF3QixHQUFHLDZCQUE2QixRQUFRLGlDQUFpQyxLQUFLLEdBQUcscUJBQXFCLFFBQVEsaUNBQWlDLEtBQUssR0FBRywrQkFBK0IsUUFBUSxpQ0FBaUMsS0FBSyxTQUFTLGdDQUFnQyxLQUFLLFFBQVEsaUNBQWlDLEtBQUssR0FBRyx1QkFBdUIsUUFBUSxpQ0FBaUMsS0FBSyxTQUFTLGdDQUFnQyxLQUFLLFFBQVEsaUNBQWlDLEtBQUssR0FBRywwQkFBMEIsUUFBUSx3QkFBd0IsS0FBSyxTQUFTLDBCQUEwQixLQUFLLFFBQVEsd0JBQXdCLEtBQUssR0FBRyxrQkFBa0IsUUFBUSx3QkFBd0IsS0FBSyxTQUFTLDBCQUEwQixLQUFLLFFBQVEsd0JBQXdCLEtBQUssR0FBRyx5QkFBeUIsUUFBUSx1QkFBdUIsS0FBSyxTQUFTLHVCQUF1QixLQUFLLFFBQVEsdUJBQXVCLEtBQUssR0FBRyxpQkFBaUIsUUFBUSx1QkFBdUIsS0FBSyxTQUFTLHVCQUF1QixLQUFLLFFBQVEsdUJBQXVCLEtBQUssR0FBRyx5QkFBeUIsUUFBUSx5QkFBeUIsS0FBSyxTQUFTLHNCQUFzQixLQUFLLFFBQVEseUJBQXlCLEtBQUssR0FBRyxpQkFBaUIsUUFBUSx5QkFBeUIsS0FBSyxTQUFTLHNCQUFzQixLQUFLLFFBQVEseUJBQXlCLEtBQUssR0FBRywwQkFBMEIsUUFBUSx5QkFBeUIsS0FBSyxTQUFTLHdCQUF3QixLQUFLLFFBQVEseUJBQXlCLEtBQUssR0FBRyxrQkFBa0IsUUFBUSx5QkFBeUIsS0FBSyxTQUFTLHdCQUF3QixLQUFLLFFBQVEseUJBQXlCLEtBQUssR0FBRyw0QkFBNEIsUUFBUSwwQkFBMEIsS0FBSyxTQUFTLDBCQUEwQixLQUFLLFFBQVEsMEJBQTBCLEtBQUssR0FBRyxvQkFBb0IsUUFBUSwwQkFBMEIsS0FBSyxTQUFTLDBCQUEwQixLQUFLLFFBQVEsMEJBQTBCLEtBQUssR0FBRywrQkFBK0IsUUFBUSw4QkFBOEIsS0FBSyxTQUFTLGlDQUFpQyxLQUFLLFFBQVEsOEJBQThCLEtBQUssR0FBRyx1QkFBdUIsUUFBUSw4QkFBOEIsS0FBSyxTQUFTLGlDQUFpQyxLQUFLLFFBQVEsOEJBQThCLEtBQUssR0FBRyw2QkFBNkIsUUFBUSw0QkFBNEIsS0FBSyxTQUFTLDZCQUE2QixLQUFLLFFBQVEsNEJBQTRCLEtBQUssR0FBRyxxQkFBcUIsUUFBUSw0QkFBNEIsS0FBSyxTQUFTLDZCQUE2QixLQUFLLFFBQVEsNEJBQTRCLEtBQUssR0FBRyw4QkFBOEIsUUFBUSwyQkFBMkIsS0FBSyxTQUFTLHNCQUFzQixLQUFLLFFBQVEsMkJBQTJCLEtBQUssR0FBRyxzQkFBc0IsUUFBUSwyQkFBMkIsS0FBSyxTQUFTLHNCQUFzQixLQUFLLFFBQVEsMkJBQTJCLEtBQUssR0FBRywyQkFBMkIsa0JBQWtCLHVCQUF1QixpQkFBaUIsa0JBQWtCLGFBQWEsY0FBYyw0QkFBNEIsMkVBQTJFLGlDQUFpQywyQkFBMkIsdUJBQXVCLGVBQWUsNERBQTRELDREQUE0RCxHQUFHLDRCQUE0QixrQkFBa0IsdUJBQXVCLGdCQUFnQixpQkFBaUIsYUFBYSxjQUFjLDRCQUE0QiwyQkFBMkIsdUJBQXVCLGVBQWUsbUdBQW1HLG1HQUFtRywyQkFBMkIsZ0RBQWdELEdBQUcscUNBQXFDLFFBQVEseUNBQXlDLEtBQUssU0FBUyxpREFBaUQsS0FBSyxTQUFTLCtDQUErQyxLQUFLLFNBQVMseUNBQXlDLEtBQUssR0FBRyw2QkFBNkIsUUFBUSx5Q0FBeUMsS0FBSyxTQUFTLGlEQUFpRCxLQUFLLFNBQVMsK0NBQStDLEtBQUssU0FBUyx5Q0FBeUMsS0FBSyxHQUFHLG9DQUFvQyxRQUFRLDZCQUE2QixLQUFLLFFBQVEsNkJBQTZCLEtBQUssR0FBRyw0QkFBNEIsUUFBUSw2QkFBNkIsS0FBSyxRQUFRLDZCQUE2QixLQUFLLEdBQUcsbURBQW1ELGtCQUFrQixnQkFBZ0IsaUJBQWlCLHVCQUF1QiwwQkFBMEIsMkJBQTJCLHVCQUF1QiwyQkFBMkIsb0RBQW9ELG9EQUFvRCxHQUFHLDRCQUE0Qix1QkFBdUIsb0RBQW9ELG9EQUFvRCxHQUFHLDZCQUE2QixrQ0FBa0Msa0NBQWtDLEdBQUcsNkJBQTZCLFFBQVEsaUJBQWlCLCtCQUErQixLQUFLLFFBQVEsbUJBQW1CLG1DQUFtQyxLQUFLLEdBQUcscUJBQXFCLFFBQVEsaUJBQWlCLCtCQUErQixLQUFLLFFBQVEsbUJBQW1CLG1DQUFtQyxLQUFLLEdBQUcsb0JBQW9CLGlCQUFpQixnQkFBZ0IsbUJBQW1CLHVCQUF1Qix1QkFBdUIsMEJBQTBCLGFBQWEsY0FBYyxHQUFHLHVEQUF1RCxrQkFBa0IsY0FBYyxhQUFhLG9CQUFvQixzQkFBc0IsMkJBQTJCLHVCQUF1QixjQUFjLGFBQWEsd0RBQXdELHdEQUF3RCxHQUFHLDhCQUE4QixtQ0FBbUMsbUNBQW1DLEdBQUcsc0NBQXNDLFFBQVEsZ0JBQWdCLGVBQWUsbUJBQW1CLGtCQUFrQixLQUFLLFVBQVUsbUJBQW1CLGtCQUFrQixrQkFBa0IsaUJBQWlCLGlCQUFpQixLQUFLLEdBQUcsOEJBQThCLFFBQVEsZ0JBQWdCLGVBQWUsbUJBQW1CLGtCQUFrQixLQUFLLFVBQVUsbUJBQW1CLGtCQUFrQixrQkFBa0IsaUJBQWlCLGlCQUFpQixLQUFLLEdBQUcsNENBQTRDLHNrQkFBc2tCLE9BQU8sV0FBVyxVQUFVLFVBQVUsTUFBTSxLQUFLLEtBQUssV0FBVyxNQUFNLEtBQUssS0FBSyxLQUFLLFdBQVcsTUFBTSxLQUFLLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE9BQU8sV0FBVyxRQUFRLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxNQUFNLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxPQUFPLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsT0FBTyxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxVQUFVLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxRQUFRLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLE1BQU0sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLFFBQVEsT0FBTyxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFFBQVEsT0FBTyxLQUFLLFVBQVUsVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFVBQVUsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sTUFBTSxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxVQUFVLFlBQVksUUFBUSxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxXQUFXLFVBQVUsVUFBVSxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxVQUFVLFVBQVUsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFFBQVEsUUFBUSxVQUFVLFFBQVEsT0FBTyxVQUFVLFdBQVcsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsT0FBTyxRQUFRLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFNBQVMsT0FBTyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxVQUFVLFFBQVEsT0FBTyxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxRQUFRLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxRQUFRLFFBQVEsV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsUUFBUSxPQUFPLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxTQUFTLFFBQVEsWUFBWSxXQUFXLFNBQVMsUUFBUSxZQUFZLFdBQVcsVUFBVSxVQUFVLFVBQVUsU0FBUyxRQUFRLFdBQVcsU0FBUyxRQUFRLE1BQU0sV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxNQUFNLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsTUFBTSxVQUFVLFFBQVEsUUFBUSxVQUFVLFFBQVEsS0FBSyxRQUFRLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsVUFBVSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsWUFBWSxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLFdBQVcsV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFVBQVUsU0FBUyxXQUFXLFdBQVcsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsVUFBVSxTQUFTLFNBQVMsVUFBVSxVQUFVLFdBQVcsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxXQUFXLFlBQVksU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsVUFBVSxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxVQUFVLFNBQVMsU0FBUyxVQUFVLFVBQVUsV0FBVyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFdBQVcsWUFBWSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxVQUFVLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFNBQVMsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxXQUFXLFdBQVcsWUFBWSxZQUFZLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsTUFBTSxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFdBQVcsV0FBVyxVQUFVLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsTUFBTSxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxLQUFLLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLEtBQUssV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxLQUFLLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsS0FBSyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLEtBQUssV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxXQUFXLFdBQVcsWUFBWSxZQUFZLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsTUFBTSxVQUFVLFdBQVcsU0FBUyxTQUFTLFVBQVUsV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFVBQVUsV0FBVyxTQUFTLFNBQVMsVUFBVSxXQUFXLFNBQVMsS0FBSyxPQUFPLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFdBQVcsUUFBUSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sTUFBTSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxV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QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDZkE7QUFDeUI7QUFDVztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyx1Q0FBdUM7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsa0JBQWtCO0FBQ2hFO0FBQ0E7QUFDQTtB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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQzBCO0FBQ0Y7QUFDeEI7QUFDc0M7QUFDUTtBQUNSO0FBQ1M7QUFDSDtBQUM1QztBQUNBLG1CQUFtQix1REFBTTtBQUN6Qix1QkFBdUIsMkRBQVU7QUFDakMsaUJBQWlCLHlEQUFJO0FBQ3JCLHdCQUF3QiwyREFBVztBQUNuQyxzQkFBc0IsMERBQVMsRyIsInNvdXJjZXMiOlsid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9jc3MvZG90cy5jc3MiLCJ3ZWJwYWNrOi8vY2FoLy4vY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2NhaC8uL2Nzcy9kb3RzLmNzcz83NjQyIiwid2VicGFjazovL2NhaC8uL2Nzcy9zdHlsZS5jc3M/ZGExZiIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL2FsbC1uZXdzLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3BhZ2luYXRpb24uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvc2VhcmNoLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3NoYWRvd0JveC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9zaW5nbGVQb3N0LmpzIiwid2VicGFjazovL2NhaC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vY2FoL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgY29uZmlnLnRyYW5zaXRpb25hbCAmJiBjb25maWcudHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWw7XG5cbiAgaWYgKHRyYW5zaXRpb25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsaWRhdG9yLmFzc2VydE9wdGlvbnModHJhbnNpdGlvbmFsLCB7XG4gICAgICBzaWxlbnRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKSxcbiAgICAgIGZvcmNlZEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKVxuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8vIGZpbHRlciBvdXQgc2tpcHBlZCBpbnRlcmNlcHRvcnNcbiAgdmFyIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHZhciBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSB0cnVlO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBpZiAodHlwZW9mIGludGVyY2VwdG9yLnJ1bldoZW4gPT09ICdmdW5jdGlvbicgJiYgaW50ZXJjZXB0b3IucnVuV2hlbihjb25maWcpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyAmJiBpbnRlcmNlcHRvci5zeW5jaHJvbm91cztcblxuICAgIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHByb21pc2U7XG5cbiAgaWYgKCFzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMpIHtcbiAgICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoY2hhaW4sIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluKTtcbiAgICBjaGFpbiA9IGNoYWluLmNvbmNhdChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4pO1xuXG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuXG4gIHZhciBuZXdDb25maWcgPSBjb25maWc7XG4gIHdoaWxlIChyZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICB2YXIgb25GdWxmaWxsZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHZhciBvblJlamVjdGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB0cnkge1xuICAgICAgbmV3Q29uZmlnID0gb25GdWxmaWxsZWQobmV3Q29uZmlnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgb25SZWplY3RlZChlcnJvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIHByb21pc2UgPSBkaXNwYXRjaFJlcXVlc3QobmV3Q29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG5cbiAgd2hpbGUgKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpLCByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCwgb3B0aW9ucykge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZCxcbiAgICBzeW5jaHJvbm91czogb3B0aW9ucyA/IG9wdGlvbnMuc3luY2hyb25vdXMgOiBmYWxzZSxcbiAgICBydW5XaGVuOiBvcHRpb25zID8gb3B0aW9ucy5ydW5XaGVuIDogbnVsbFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsO1xuICAgIHZhciBzaWxlbnRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuc2lsZW50SlNPTlBhcnNpbmc7XG4gICAgdmFyIGZvcmNlZEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5mb3JjZWRKU09OUGFyc2luZztcbiAgICB2YXIgc3RyaWN0SlNPTlBhcnNpbmcgPSAhc2lsZW50SlNPTlBhcnNpbmcgJiYgdGhpcy5yZXNwb25zZVR5cGUgPT09ICdqc29uJztcblxuICAgIGlmIChzdHJpY3RKU09OUGFyc2luZyB8fCAoZm9yY2VkSlNPTlBhcnNpbmcgJiYgdXRpbHMuaXNTdHJpbmcoZGF0YSkgJiYgZGF0YS5sZW5ndGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKHN0cmljdEpTT05QYXJzaW5nKSB7XG4gICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICAgICAgdGhyb3cgZW5oYW5jZUVycm9yKGUsIHRoaXMsICdFX0pTT05fUEFSU0UnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGtnID0gcmVxdWlyZSgnLi8uLi8uLi9wYWNrYWdlLmpzb24nKTtcblxudmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblsnb2JqZWN0JywgJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ3N0cmluZycsICdzeW1ib2wnXS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGkpIHtcbiAgdmFsaWRhdG9yc1t0eXBlXSA9IGZ1bmN0aW9uIHZhbGlkYXRvcih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09IHR5cGUgfHwgJ2EnICsgKGkgPCAxID8gJ24gJyA6ICcgJykgKyB0eXBlO1xuICB9O1xufSk7XG5cbnZhciBkZXByZWNhdGVkV2FybmluZ3MgPSB7fTtcbnZhciBjdXJyZW50VmVyQXJyID0gcGtnLnZlcnNpb24uc3BsaXQoJy4nKTtcblxuLyoqXG4gKiBDb21wYXJlIHBhY2thZ2UgdmVyc2lvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IHRoYW5WZXJzaW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNPbGRlclZlcnNpb24odmVyc2lvbiwgdGhhblZlcnNpb24pIHtcbiAgdmFyIHBrZ1ZlcnNpb25BcnIgPSB0aGFuVmVyc2lvbiA/IHRoYW5WZXJzaW9uLnNwbGl0KCcuJykgOiBjdXJyZW50VmVyQXJyO1xuICB2YXIgZGVzdFZlciA9IHZlcnNpb24uc3BsaXQoJy4nKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICBpZiAocGtnVmVyc2lvbkFycltpXSA+IGRlc3RWZXJbaV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAocGtnVmVyc2lvbkFycltpXSA8IGRlc3RWZXJbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7c3RyaW5nP30gdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIHZhciBpc0RlcHJlY2F0ZWQgPSB2ZXJzaW9uICYmIGlzT2xkZXJWZXJzaW9uKHZlcnNpb24pO1xuXG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBwa2cudmVyc2lvbiArICddIFRyYW5zaXRpb25hbCBvcHRpb24gXFwnJyArIG9wdCArICdcXCcnICsgZGVzYyArIChtZXNzYWdlID8gJy4gJyArIG1lc3NhZ2UgOiAnJyk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdCwgb3B0cykge1xuICAgIGlmICh2YWxpZGF0b3IgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0TWVzc2FnZShvcHQsICcgaGFzIGJlZW4gcmVtb3ZlZCBpbiAnICsgdmVyc2lvbikpO1xuICAgIH1cblxuICAgIGlmIChpc0RlcHJlY2F0ZWQgJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzT2xkZXJWZXJzaW9uOiBpc09sZGVyVmVyc2lvbixcbiAgYXNzZXJ0T3B0aW9uczogYXNzZXJ0T3B0aW9ucyxcbiAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnRyaW0gPyBzdHIudHJpbSgpIDogc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiQGNoYXJzZXQgXFxcIlVURi04XFxcIjtcXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEVsYXN0aWNcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1lbGFzdGljIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZWxhc3RpYyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWVsYXN0aWMgMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG4uZG90LWVsYXN0aWM6OmJlZm9yZSwgLmRvdC1lbGFzdGljOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1lbGFzdGljOjpiZWZvcmUge1xcbiAgbGVmdDogLTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWVsYXN0aWMtYmVmb3JlIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZWxhc3RpYy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG4uZG90LWVsYXN0aWM6OmFmdGVyIHtcXG4gIGxlZnQ6IDk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWVsYXN0aWMtYWZ0ZXIgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1lbGFzdGljLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1lbGFzdGljLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1lbGFzdGljLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWVsYXN0aWMge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZWxhc3RpYyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWVsYXN0aWMtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMC42Nyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZWxhc3RpYy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAwLjY3KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFB1bHNlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtcHVsc2Uge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcHVsc2UgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuMjVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMjVzO1xcbn1cXG4uZG90LXB1bHNlOjpiZWZvcmUsIC5kb3QtcHVsc2U6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LXB1bHNlOjpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1wdWxzZS1iZWZvcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlLWJlZm9yZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcXG59XFxuLmRvdC1wdWxzZTo6YWZ0ZXIge1xcbiAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcHVsc2UtYWZ0ZXIgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlLWFmdGVyIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC41cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1wdWxzZS1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtcHVsc2UtYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtcHVsc2Uge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtcHVsc2Uge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1wdWxzZS1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1wdWxzZS1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZsYXNoaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZmxhc2hpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBsaW5lYXIgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBsaW5lYXIgYWx0ZXJuYXRlO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC41cztcXG59XFxuLmRvdC1mbGFzaGluZzo6YmVmb3JlLCAuZG90LWZsYXNoaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1mbGFzaGluZzo6YmVmb3JlIHtcXG4gIGxlZnQ6IC05OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcXG59XFxuLmRvdC1mbGFzaGluZzo6YWZ0ZXIge1xcbiAgbGVmdDogOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMXM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxhc2hpbmcge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlLCAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg2NSwgODgsIDk1LCAwLjIpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1mbGFzaGluZyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICB9XFxuICA1MCUsIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDY1LCA4OCwgOTUsIDAuMik7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgQ29sbGlzaW9uXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtY29sbGlzaW9uIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1jb2xsaXNpb246OmJlZm9yZSwgLmRvdC1jb2xsaXNpb246OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWNvbGxpc2lvbjo6YmVmb3JlIHtcXG4gIGxlZnQ6IC01NXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1jb2xsaXNpb24tYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1jb2xsaXNpb246OmFmdGVyIHtcXG4gIGxlZnQ6IDU1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1hZnRlciAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1jb2xsaXNpb24tYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAxcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAxcztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYmVmb3JlIHtcXG4gIDAlLCA1MCUsIDc1JSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtOTlweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1iZWZvcmUge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC05OXB4KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYWZ0ZXIge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDk5cHgpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYWZ0ZXIge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDk5cHgpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFJldm9sdXRpb25cXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1yZXZvbHV0aW9uIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1yZXZvbHV0aW9uOjpiZWZvcmUsIC5kb3QtcmV2b2x1dGlvbjo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5kb3QtcmV2b2x1dGlvbjo6YmVmb3JlIHtcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IC05OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMjcuNXB4IDEyNi41cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMS40cyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMS40cyBsaW5lYXIgaW5maW5pdGU7XFxufVxcbi5kb3QtcmV2b2x1dGlvbjo6YWZ0ZXIge1xcbiAgbGVmdDogMDtcXG4gIHRvcDogLTE5OHB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMjcuNXB4IDIyNS41cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1yZXZvbHV0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1yZXZvbHV0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1yZXZvbHV0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IENhcm91c2VsXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtY2Fyb3VzZWwge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1jYXJvdXNlbCAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtY2Fyb3VzZWwgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtY2Fyb3VzZWwge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZiwgOTk5OXB4IDAgMCAxcHggIzQxNTg1ZiwgMTAwOThweCAwIDAgLTFweCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTFweCAjNDE1ODVmLCA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZiwgOTk5OXB4IDAgMCAxcHggIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1jYXJvdXNlbCB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMXB4ICM0MTU4NWYsIDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZiwgOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgVHlwaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtdHlwaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtdHlwaW5nIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC10eXBpbmcgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtdHlwaW5nIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC0xMHB4IDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAtMTBweCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAtMTBweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtdHlwaW5nIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC0xMHB4IDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAtMTBweCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAtMTBweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBXaW5kbWlsbFxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXdpbmRtaWxsIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRvcDogLTEwcHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiA1cHggMTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtd2luZG1pbGwgMnMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC13aW5kbWlsbCAycyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcbi5kb3Qtd2luZG1pbGw6OmJlZm9yZSwgLmRvdC13aW5kbWlsbDo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5kb3Qtd2luZG1pbGw6OmJlZm9yZSB7XFxuICBsZWZ0OiAtOC42NjI1NHB4O1xcbiAgdG9wOiAxNXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LXdpbmRtaWxsOjphZnRlciB7XFxuICBsZWZ0OiA4LjY2MjU0cHg7XFxuICB0b3A6IDE1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtd2luZG1pbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDcyMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXdpbmRtaWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWig3MjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEJyaWNrc1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWJyaWNrcyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0b3A6IDMwLjVweDtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWJyaWNrcyAycyBpbmZpbml0ZSBlYXNlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1icmlja3MgMnMgaW5maW5pdGUgZWFzZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1icmlja3Mge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA0MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTguMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjYlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDkxLjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtYnJpY2tzIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgOC4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNDEuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDU4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY2JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA5MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRmxvYXRpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1mbG9hdGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsb2F0aW5nIDNzIGluZmluaXRlIGN1YmljLWJlemllcigwLjE1LCAwLjYsIDAuOSwgMC4xKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmcgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMTUsIDAuNiwgMC45LCAwLjEpO1xcbn1cXG4uZG90LWZsb2F0aW5nOjpiZWZvcmUsIC5kb3QtZmxvYXRpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWZsb2F0aW5nOjpiZWZvcmUge1xcbiAgbGVmdDogLTEycHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsb2F0aW5nLWJlZm9yZSAzcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYmVmb3JlIDNzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbn1cXG4uZG90LWZsb2F0aW5nOjphZnRlciB7XFxuICBsZWZ0OiAtMjRweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYWZ0ZXIgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMSwgMSk7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsb2F0aW5nLWFmdGVyIDNzIGluZmluaXRlIGN1YmljLWJlemllcigwLjQsIDAsIDEsIDEpO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYygtNTAlIC0gMjcuNXB4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgMTI3LjVweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZmxvYXRpbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKC01MCUgLSAyNy41cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDEyNy41cHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTEycHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZmxvYXRpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBsZWZ0OiAtMTJweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTI0cHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1mbG9hdGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGxlZnQ6IC0yNHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBGaXJlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZmlyZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTAuODVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjg1cztcXG59XFxuLmRvdC1maXJlOjpiZWZvcmUsIC5kb3QtZmlyZTo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3QtZmlyZTo6YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAxNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC0xLjg1cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMS44NXM7XFxufVxcbi5kb3QtZmlyZTo6YWZ0ZXIge1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTIuODVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0yLjg1cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1maXJlIHtcXG4gIDElIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTM3LjEyNXB4IDAgMnB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC0xNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1maXJlIHtcXG4gIDElIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTM3LjEyNXB4IDAgMnB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC0xNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFNwaW5cXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1zcGluIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zcGluIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zcGluIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXNwaW4ge1xcbiAgMCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAxMi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDM3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgNjIuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA3NSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA4Ny41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtc3BpbiB7XFxuICAwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDEyLjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMzcuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA2Mi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDg3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZhbGxpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1mYWxsaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmFsbGluZyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZhbGxpbmcgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuMXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC4xcztcXG59XFxuLmRvdC1mYWxsaW5nOjpiZWZvcmUsIC5kb3QtZmFsbGluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtZmFsbGluZzo6YmVmb3JlIHtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmFsbGluZy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mYWxsaW5nLWJlZm9yZSAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMHM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMHM7XFxufVxcbi5kb3QtZmFsbGluZzo6YWZ0ZXIge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mYWxsaW5nLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmFsbGluZy1hZnRlciAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4ycztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZhbGxpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmFsbGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCA5OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZhbGxpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgU3RyZXRjaGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXN0cmV0Y2hpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZyAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zdHJldGNoaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3Qtc3RyZXRjaGluZzo6YmVmb3JlLCAuZG90LXN0cmV0Y2hpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LXN0cmV0Y2hpbmc6OmJlZm9yZSB7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3Qtc3RyZXRjaGluZzo6YWZ0ZXIge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zdHJldGNoaW5nLWFmdGVyIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgsIDAuOCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC44LCAwLjgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0yMHB4KSBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDIwcHgpIHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBHb29leSBFZmZlY3RcXG4gKiBEb3QgR2F0aGVyaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZ2F0aGVyaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3QtZ2F0aGVyaW5nOjpiZWZvcmUsIC5kb3QtZ2F0aGVyaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IC01MHB4O1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgb3BhY2l0eTogMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1nYXRoZXJpbmcgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZ2F0aGVyaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3QtZ2F0aGVyaW5nOjphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC41cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWdhdGhlcmluZyB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDM1JSwgNjAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDUwcHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMDBweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWdhdGhlcmluZyB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDM1JSwgNjAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDUwcHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMDBweCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBIb3VyZ2xhc3NcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1ob3VyZ2xhc3Mge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAtOTlweDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAyNy41cHggMTI2LjVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzIDIuNHMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWhvdXJnbGFzcyAyLjRzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC42cztcXG59XFxuLmRvdC1ob3VyZ2xhc3M6OmJlZm9yZSwgLmRvdC1ob3VyZ2xhc3M6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LWhvdXJnbGFzczo6YmVmb3JlIHtcXG4gIHRvcDogMTk4cHg7XFxufVxcbi5kb3QtaG91cmdsYXNzOjphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWhvdXJnbGFzcy1hZnRlciAyLjRzIGluZmluaXRlIGN1YmljLWJlemllcigwLjY1LCAwLjA1LCAwLjM2LCAxKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzLWFmdGVyIDIuNHMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNjUsIDAuMDUsIDAuMzYsIDEpO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWhvdXJnbGFzcyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigxODBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtaG91cmdsYXNzIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTgwZGVnKTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWhvdXJnbGFzcy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTk4cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtaG91cmdsYXNzLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE5OHB4KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBHb29leSBFZmZlY3RcXG4gKiBEb3QgT3ZlcnRha2luZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LW92ZXJ0YWtpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBib3gtc2hhZG93OiAwIC0yMHB4IDAgMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1vdmVydGFraW5nIDJzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1vdmVydGFraW5nIDJzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmJlZm9yZSwgLmRvdC1vdmVydGFraW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBib3gtc2hhZG93OiAwIC0yMHB4IDAgMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4zcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjNzO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAxLjVzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1vdmVydGFraW5nIDEuNXMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC42cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjZzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LW92ZXJ0YWtpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LW92ZXJ0YWtpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBTaHV0dGxlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtc2h1dHRsZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTlweDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YmVmb3JlLCAuZG90LXNodXR0bGU6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YmVmb3JlIHtcXG4gIGxlZnQ6IDk5cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXNodXR0bGUgMnMgaW5maW5pdGUgZWFzZS1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXNodXR0bGUgMnMgaW5maW5pdGUgZWFzZS1vdXQ7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YWZ0ZXIge1xcbiAgbGVmdDogMTk4cHg7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc2h1dHRsZSB7XFxuICAwJSwgNTAlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yOTdweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjk3cHgpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1zaHV0dGxlIHtcXG4gIDAlLCA1MCUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI5N3B4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyOTdweCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEVtb2ppXFxuICogRG90IEJvdW5jaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtYm91bmNpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgZm9udC1zaXplOiAxMHB4O1xcbn1cXG4uZG90LWJvdW5jaW5nOjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIuKavfCfj4Dwn4+QXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtYm91bmNpbmcgMXMgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWJvdW5jaW5nIDFzIGluZmluaXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWJvdW5jaW5nIHtcXG4gIDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gICAgLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLWluO1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICB9XFxuICAzNCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMzUlIHtcXG4gICAgdG9wOiAyMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuNSwgMC41KTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA5MCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWJvdW5jaW5nIHtcXG4gIDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gICAgLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLWluO1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICB9XFxuICAzNCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMzUlIHtcXG4gICAgdG9wOiAyMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuNSwgMC41KTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA5MCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEVtb2ppXFxuICogRG90IFJvbGxpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1yb2xsaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogNTVweDtcXG4gIGZvbnQtc2l6ZTogMTBweDtcXG59XFxuLmRvdC1yb2xsaW5nOjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1yb2xsaW5nIDNzIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1yb2xsaW5nIDNzIGluZmluaXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXJvbGxpbmcge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAzNC4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA2Ny42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1yb2xsaW5nIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMzQuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgNjcuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG59LyojIHNvdXJjZU1hcHBpbmdVUkw9ZG90cy5jc3MubWFwICovXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vY3NzL2RvdHMuY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWVsYXN0aWMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX21peGlucy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fdmFyaWFibGVzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtcHVsc2Uuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1mbGFzaGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWNvbGxpc2lvbi5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXJldm9sdXRpb24uc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1jYXJvdXNlbC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXR5cGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXdpbmRtaWxsLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtYnJpY2tzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZmxvYXRpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1maXJlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtc3Bpbi5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWZhbGxpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1zdHJldGNoaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZ2F0aGVyaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtaG91cmdsYXNzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtb3ZlcnRha2luZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXNodXR0bGUuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1ib3VuY2luZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXJvbGxpbmcuc2Nzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSxnQkFBZ0I7QUNBaEI7Ozs7RUFBQTtBQU1BO0VBQ0Usa0JBQUE7RUNJQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VGR1YsaURBQUE7VUFBQSx5Q0FBQTtBREdGO0FDREU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QURFSjtBQ0NFO0VBQ0UsV0FBQTtFQ1hGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUZrQlIsd0RBQUE7VUFBQSxnREFBQTtBREdKO0FDQUU7RUFDRSxVRWpCVTtFREZaLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUYwQlIsdURBQUE7VUFBQSwrQ0FBQTtBRElKOztBQ0FBO0VBQ0U7SUFDRSxzQkFBQTtFREdGO0VDQUE7SUFDRSx3QkFBQTtFREVGO0VDQ0E7SUFDRSx5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QTtBTHFLSjtBS2xLRTtFQUNFLFVGbkJVO0VERlosV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRTRCUixxREFBQTtVQUFBLDZDQUFBO0VBQ0EsMkJBQUE7VUFBQSxtQkFBQTtBTHNLSjs7QUtsS0E7RUFDRTtJQUNFLHlCQUFBO0VMcUtGO0VLbEtBO0lBRUUsdUNBQUE7RUxtS0Y7QUFDRjs7QUszS0E7RUFDRTtJQUNFLHlCQUFBO0VMcUtGO0VLbEtBO0lBRUUsdUNBQUE7RUxtS0Y7QUFDRjtBTXBOQTs7OztFQUFBO0FBTUE7RUFDRSxrQkFBQTtFSklBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUh5Tlo7QU10TkU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QU51Tko7QU1wTkU7RUFDRSxXQUFBO0VKVEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFR2dCUiwyREFBQTtVQUFBLG1EQUFBO0FOd05KO0FNck5FO0VBQ0UsVUh4QlE7RURPVixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VHd0JSLDBEQUFBO1VBQUEsa0RBQUE7RUFDQSwyQkFBQTtVQUFBLG1CQUFBO0FOeU5KOztBTXJOQTtFQUNFO0lBSUUsd0JBQUE7RU5xTkY7RU1sTkE7SUFDRSw0QkFBQTtFTm9ORjtBQUNGOztBTTlOQTtFQUNFO0lBSUUsd0JBQUE7RU5xTkY7RU1sTkE7SUFDRSw0QkFBQTtFTm9ORjtBQUNGO0FNak5BO0VBQ0U7SUFJRSx3QkFBQTtFTmdORjtFTTdNQTtJQUNFLDJCQUFBO0VOK01GO0FBQ0Y7QU16TkE7RUFDRTtJQUlFLHdCQUFBO0VOZ05GO0VNN01BO0lBQ0UsMkJBQUE7RU4rTUY7QUFDRjtBTzNRQTs7OztFQUFBO0FBTUE7RUFDRSxrQkFBQTtFTElBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUhnUlo7QU83UUU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtBUDhRSjtBTzNRRTtFQUNFLE9BQUE7RUFDQSxVQUFBO0VMVEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFSWdCUixnQ0FBQTtFQUNBLHNEQUFBO1VBQUEsOENBQUE7QVArUUo7QU81UUU7RUFDRSxPQUFBO0VBQ0EsV0FBQTtFTG5CRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VJMEJSLGdDQUFBO0VBQ0Esb0RBQUE7VUFBQSw0Q0FBQTtBUGdSSjs7QU81UUE7RUFDRTtJQUNFLDZDQUFBO0VQK1FGO0VPNVFBO0lBQ0UsK0NBQUE7RVA4UUY7QUFDRjs7QU9yUkE7RUFDRTtJQUNFLDZDQUFBO0VQK1FGO0VPNVFBO0lBQ0UsK0NBQUE7RVA4UUY7QUFDRjtBUTVUQTs7OztFQUFBO0FBV0E7RUFDRSxrQkFBQTtFQUNBLGFBUFM7RU5LVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VLU1YsNkVBQ0U7RUFHRixvREFBQTtVQUFBLDRDQUFBO0FSdVRGOztBUXBUQTtFQUNFO0lBQ0UscUZBQ0U7RVJzVEo7RVFqVEE7SUFDRSxxRkFDRTtFUmtUSjtFUTdTQTtJQUNFLHFGQUNFO0VSOFNKO0FBQ0Y7O0FRaFVBO0VBQ0U7SUFDRSxxRkFDRTtFUnNUSjtFUWpUQTtJQUNFLHFGQUNFO0VSa1RKO0VRN1NBO0lBQ0UscUZBQ0U7RVI4U0o7QUFDRjtBU3hWQTs7OztFQUFBO0FBV0E7RUFDRSxrQkFBQTtFQUNBLGFBUFM7RVBLVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VNU1YsNkVBQ0U7RUFHRixrREFBQTtVQUFBLDBDQUFBO0FUbVZGOztBU2hWQTtFQUNFO0lBQ0UsNkVBQ0U7RVRrVko7RVM3VUE7SUFDRSxpRkFDRTtFVDhVSjtFU3pVQTtJQUNFLDZFQUNFO0VUMFVKO0VTclVBO0lBQ0UsaUZBQ0U7RVRzVUo7RVNqVUE7SUFDRSw2RUFDRTtFVGtVSjtFUzdUQTtJQUNFLGlGQUNFO0VUOFRKO0VTelRBO0lBQ0UsNkVBQ0U7RVQwVEo7QUFDRjs7QVN4V0E7RUFDRTtJQUNFLDZFQUNFO0VUa1ZKO0VTN1VBO0lBQ0UsaUZBQ0U7RVQ4VUo7RVN6VUE7SUFDRSw2RUFDRTtFVDBVSjtFU3JVQTtJQUNFLGlGQUNFO0VUc1VKO0VTalVBO0lBQ0UsNkVBQ0U7RVRrVUo7RVM3VEE7SUFDRSxpRkFDRTtFVDhUSjtFU3pUQTtJQUNFLDZFQUNFO0VUMFRKO0FBQ0Y7QVVoWUE7Ozs7RUFBQTtBQVVBO0VBQ0Usa0JBQUE7RUFDQSxVQUFBO0VSREEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFT1FWLDBCQUFBO0VBQ0Esa0RBQUE7VUFBQSwwQ0FBQTtBVitYRjtBVTdYRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0FWOFhKO0FVM1hFO0VBQ0UsZ0JBQUE7RUFDQSxTQUFBO0VSakJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUhzWlo7QVU3WEU7RUFDRSxlQUFBO0VBQ0EsU0FBQTtFUnhCRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0FIK1paOztBVTlYQTtFQUNFO0lBQ0UsNkNBQUE7RVZpWUY7RVU5WEE7SUFDRSwrQ0FBQTtFVmdZRjtBQUNGOztBVXZZQTtFQUNFO0lBQ0UsNkNBQUE7RVZpWUY7RVU5WEE7SUFDRSwrQ0FBQTtFVmdZRjtBQUNGO0FXaGJBOzs7O0VBQUE7QUFjQTtFQUNFLGtCQUFBO0VBQ0EsV0FUUTtFQVVSLGFBVFM7RVRHVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VRYVYsdUZBQ0U7RUFHRiw4Q0FBQTtVQUFBLHNDQUFBO0FYd2FGOztBV3JhQTtFQUNFO0lBQ0UsdUZBQ0U7RVh1YUo7RVdsYUE7SUFDRSx3RkFDRTtFWG1hSjtFVzlaQTtJQUNFLDRGQUNFO0VYK1pKO0VXMVpBO0lBQ0UsMkZBQ0U7RVgyWko7RVd0WkE7SUFDRSx1RkFDRTtFWHVaSjtFV2xaQTtJQUNFLHdGQUNFO0VYbVpKO0VXOVlBO0lBQ0UsNEZBQ0U7RVgrWUo7RVcxWUE7SUFDRSwyRkFDRTtFWDJZSjtFV3RZQTtJQUNFLHVGQUNFO0VYdVlKO0VXbFlBO0lBQ0Usd0ZBQ0U7RVhtWUo7RVc5WEE7SUFDRSw0RkFDRTtFWCtYSjtFVzFYQTtJQUNFLDJGQUNFO0VYMlhKO0VXdFhBO0lBQ0UsdUZBQ0U7RVh1WEo7QUFDRjs7QVcvY0E7RUFDRTtJQUNFLHVGQUNFO0VYdWFKO0VXbGFBO0lBQ0Usd0ZBQ0U7RVhtYUo7RVc5WkE7SUFDRSw0RkFDRTtFWCtaSjtFVzFaQTtJQUNFLDJGQUNFO0VYMlpKO0VXdFpBO0lBQ0UsdUZBQ0U7RVh1Wko7RVdsWkE7SUFDRSx3RkFDRTtFWG1aSjtFVzlZQTtJQUNFLDRGQUNFO0VYK1lKO0VXMVlBO0lBQ0UsMkZBQ0U7RVgyWUo7RVd0WUE7SUFDRSx1RkFDRTtFWHVZSjtFV2xZQTtJQUNFLHdGQUNFO0VYbVlKO0VXOVhBO0lBQ0UsNEZBQ0U7RVgrWEo7RVcxWEE7SUFDRSwyRkFDRTtFWDJYSjtFV3RYQTtJQUNFLHVGQUNFO0VYdVhKO0FBQ0Y7QVkzZUE7Ozs7RUFBQTtBQVNBO0VBQ0Usa0JBQUE7RVZDQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VTTVYsNkVBQUE7VUFBQSxxRUFBQTtBWjJlRjtBWXplRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBWjBlSjtBWXZlRTtFQUNFLFdBQUE7RVZkRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VTcUJSLDhEQUFBO1VBQUEsc0RBQUE7QVoyZUo7QVl4ZUU7RUFDRSxXQUFBO0VWdEJGLFdDUFU7RURRVixZQ1BXO0VEUVgs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QVNBO0VBQ0Usa0JBQUE7RWRDQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VhTVYsNEJBQUE7RUFDQSxxREFBQTtVQUFBLDZDQUFBO0FoQmd1QkY7QWdCOXRCRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBaEIrdEJKO0FnQjV0QkU7RWRkQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0Vhb0JSLDREQUFBO1VBQUEsb0RBQUE7QWhCaXVCSjtBZ0I5dEJFO0VkcEJBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RWEwQlIsMkRBQUE7VUFBQSxtREFBQTtBaEJtdUJKOztBZ0IvdEJBO0VBQ0U7SUFDRSw0QkFBQTtFaEJrdUJGO0VnQi90QkE7SUFFRSwwQkFBQTtFaEJndUJGO0VnQjd0QkE7SUFDRSw0QkFBQTtFaEIrdEJGO0FBQ0Y7O0FnQjN1QkE7RUFDRTtJQUNFLDRCQUFBO0VoQmt1QkY7RWdCL3RCQTtJQUVFLDBCQUFBO0VoQmd1QkY7RWdCN3RCQTtJQUNFLDRCQUFBO0VoQit0QkY7QUFDRjtBZ0I1dEJBO0VBQ0U7SUFDRSx1Q0FBQTtFaEI4dEJGO0VnQjN0QkE7SUFFRSx1Q0FBQTtFaEI0dEJGO0VnQnp0QkE7SUFDRSx1Q0FBQTtFaEIydEJGO0FBQ0Y7QWdCdnVCQTtFQUNFO0lBQ0UsdUNBQUE7RWhCOHRCRjtFZ0IzdEJBO0lBRUUsdUNBQUE7RWhCNHRCRjtFZ0J6dEJBO0lBQ0UsdUNBQUE7RWhCMnRCRjtBQUNGO0FnQnh0QkE7RUFDRTtJQUNFLHVDQUFBO0VoQjB0QkY7RWdCdnRCQTtJQUVFLHNDQUFBO0VoQnd0QkY7RWdCcnRCQTtJQUNFLHVDQUFBO0VoQnV0QkY7QUFDRjtBZ0JudUJBO0VBQ0U7SUFDRSx1Q0FBQTtFaEIwdEJGO0VnQnZ0QkE7SUFFRSxzQ0FBQTtFaEJ3dEJGO0VnQnJ0QkE7SUFDRSx1Q0FBQTtFaEJ1dEJGO0FBQ0Y7QWlC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QUNBLDBDQUFBO0V0QnFpQ0Y7RXNCbGlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJvaUNGO0VzQmppQ0E7SUFDRSxhQUFBO0lBQ0EsMkNBQUE7RXRCbWlDRjtFc0JoaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0QmtpQ0Y7QUFDRjs7QXNCOWtDQTtFQUNFO0lBQ0UsWUFBQTtJQUNBLDBDQUFBO0V0QjBpQ0Y7RXNCdmlDQTtJQUNFLFlBQUE7SUFDQSwyQ0FBQTtFdEJ5aUNGO0VzQnRpQ0E7SUFDRSxZQUFBO0lBQ0EsMENBQUE7RXRCd2lDRjtFc0JyaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0QnVpQ0Y7RXNCcGlDQTtJQUNFLGFBQUE7SUFDQSwyQ0FBQTtFdEJzaUNGO0VzQm5pQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCcWlDRjtFc0JsaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0Qm9pQ0Y7RXNCamlDQTtJQUNFLGFBQUE7SUFDQSwyQ0FBQTtFdEJtaUNGO0VzQmhpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCa2lDRjtBQUNGLENBQUEsbUNBQUFcIixcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBjaGFyc2V0IFxcXCJVVEYtOFxcXCI7XFxuaHRtbCB7XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBtYXJnaW46IDA7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiA3NjdweCkge1xcbiAgaHRtbCB7XFxuICAgIGZvbnQtc2l6ZTogMS42dmg7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiA5NjBweCkge1xcbiAgaHRtbCB7XFxuICAgIGZvbnQtc2l6ZTogMS44dmg7XFxuICB9XFxufVxcbmh0bWwuZnJlZXplIHtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbmJvZHkge1xcbiAgbWFyZ2luOiAwO1xcbiAgY29sb3I6IGFudGlxdWV3aGl0ZTtcXG59XFxuXFxuaDEge1xcbiAgbWFyZ2luOiAwO1xcbiAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gIGZvbnQtc2l6ZTogNHJlbTtcXG59XFxuXFxuaDIge1xcbiAgZm9udC1zaXplOiAyLjVyZW07XFxuICBtYXJnaW46IDA7XFxufVxcblxcbmgzIHtcXG4gIGZvbnQtc2l6ZTogMi4zcmVtO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5cXG5hIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIGNvbG9yOiBpbmhlcml0O1xcbn1cXG5cXG5hIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuYS5oaWRkZW4sIGEuc2VsZWN0ZWRQYWdlIHtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG5cXG5hLmhpZGRlbiB7XFxuICBvcGFjaXR5OiAwO1xcbn1cXG5cXG5hLnNlbGVjdGVkUGFnZSB7XFxuICBjb2xvcjogI2U4YWE3NztcXG4gIGZpbHRlcjogc2F0dXJhdGUoMTIwJSk7XFxufVxcblxcbiouaGlkZGVuIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuXFxuZGl2LCBidXR0b24ge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuXFxuYnV0dG9uIHtcXG4gIGJvcmRlcjogbm9uZTtcXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbn1cXG5cXG5saSB7XFxuICBsaXN0LXN0eWxlLXR5cGU6IG5vbmU7XFxufVxcblxcbiNvdmVyYWxsQ29udGFpbmVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRvcDogMDtcXG59XFxuI292ZXJhbGxDb250YWluZXIuZmFkZWQge1xcbiAgZmlsdGVyOiBvcGFjaXR5KDQwJSk7XFxufVxcblxcbi5jb250ZW50Q29udGFpbmVyIHtcXG4gIGhlaWdodDogNTkuNXJlbTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgbWFyZ2luOiA0JSAwO1xcbiAgbWFyZ2luLWJvdHRvbTogMyU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcbi5jb250ZW50Q29udGFpbmVyID4gZGl2IHtcXG4gIHdpZHRoOiA4NSU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBwYWRkaW5nLXRvcDogNS41cmVtO1xcbn1cXG4uY29udGVudENvbnRhaW5lcl9wYWdpbmF0ZWQgLnRleHRCb3ggLmNvbnRlbnQtcGFnZXMge1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4uY29udGVudENvbnRhaW5lcl9wYWdpbmF0ZWQgLnRleHRCb3ggLmNvbnRlbnQtcGFnZXMgYSB7XFxuICBmb250LXNpemU6IDEuNzVyZW07XFxufVxcblxcbi50aXRsZUFuZFRleHRCb3gsIC5jb250ZW50Qm94IHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuLnRpdGxlQW5kVGV4dEJveCB7XFxuICBtYXJnaW4tcmlnaHQ6IDUlO1xcbn1cXG5cXG4udGl0bGVCb3gsIC50ZXh0Qm94IHtcXG4gIGhlaWdodDogNTAlO1xcbiAgd2lkdGg6IDE2cmVtO1xcbn1cXG5cXG4udGl0bGVCb3gge1xcbiAgcGFkZGluZzogMTAlO1xcbn1cXG4udGl0bGVCb3ggPiAqIHtcXG4gIGhlaWdodDogNTAlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBtYXJnaW46IDA7XFxufVxcbi50aXRsZUJveCA+IDpudGgtY2hpbGQoMikge1xcbiAgZGlzcGxheTogZmxleDtcXG59XFxuLnRpdGxlQm94ID4gOm50aC1jaGlsZCgyKSBoMiB7XFxuICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gIHBhZGRpbmctYm90dG9tOiAxNSU7XFxufVxcblxcbi5jb250ZW50Qm94IHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICB3aWR0aDogMTUuNXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDc2N3B4KSB7XFxuICAuY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IHtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgYXV0byk7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiA5NjBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiB7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDQsIGF1dG8pO1xcbiAgfVxcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcywgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMge1xcbiAgYm94LXNpemluZzogaW5pdGlhbDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgb3BhY2l0eTogMDtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICosIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqIHtcXG4gIGNvbG9yOiByZ2IoMjM4LCAyMzEsIDIxMCk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBmb250LXNpemU6IDEuM3JlbTtcXG4gIG1hcmdpbi10b3A6IDAuN3JlbTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICo6aG92ZXIsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqOmhvdmVyIHtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMTEwJSk7XFxuICBmaWx0ZXI6IGJyaWdodG5lc3MoMTIwJSk7XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyBpLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgaSB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZSB7XFxuICBvcGFjaXR5OiAxO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgcCwgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IGEsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIGRpdiBwLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgYSB7XFxuICBtYXJnaW46IDIlO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ2FwOiAxcmVtO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQgcCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheS10ZXh0IHAge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQgcDpudGgtb2YtdHlwZSgyKSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheS10ZXh0IHA6bnRoLW9mLXR5cGUoMikge1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuLmNvbnRlbnRCb3ggLm5ld3Mge1xcbiAgbWFyZ2luOiAwIDElO1xcbiAgcGFkZGluZy10b3A6IDUlO1xcbiAgaGVpZ2h0OiBhdXRvO1xcbn1cXG4uY29udGVudEJveCAubmV3cyBpZnJhbWUge1xcbiAgd2lkdGg6IDMwMHB4O1xcbiAgaGVpZ2h0OiAyMDBweDtcXG59XFxuXFxuI2Zvb3RlckNvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDM5LCAzOSwgMzksIDAuNik7XFxuICBtYXJnaW46IDA7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm90dG9tOiAwO1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xcbiAgcGFkZGluZy1yaWdodDogMnJlbTtcXG4gIGNvbG9yOiBpdm9yeTtcXG59XFxuXFxuI29wZW5pbmdDb250YWluZXIge1xcbiAgaGVpZ2h0OiA5OS41dmg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBjb2xvcjogcmdiKDE4OSwgMTg5LCAxODkpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoMSB7XFxuICBmb250LXNpemU6IDYuNXJlbTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgcCB7XFxuICBmb250LXNpemU6IDIuN3JlbTtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIGRpdiB7XFxuICBwYWRkaW5nOiA1JTtcXG4gIHRleHQtc2hhZG93OiAxcHggMXB4IGJsYWNrO1xcbiAgd2lkdGg6IDcwJTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLWF1dG8tZmxvdzogcm93O1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiA0JSAyNSUgMWZyO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg3MCwgNjIsIDU1LCAwLjg1KTtcXG4gIGJveC1zaGFkb3c6IDAuMnJlbSAwLjJyZW0gMXJlbSAwLjRyZW0gaW5zZXQgcmdiYSg0OSwgNDMsIDM5LCAwLjc1KTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiA1cmVtO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiAwO1xcbiAgei1pbmRleDogOTk5OTtcXG4gIGNvbG9yOiByZ2IoMTk5LCAxODcsIDE1Nik7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlci5oaWRkZW4ge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIGJ1dHRvbiB7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIHdpZHRoOiAxMHJlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIGJ1dHRvbiBpIHtcXG4gIGRpc3BsYXk6IGlubGluZTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyICNsb2dvLXN5bWJvbCwgI29wZW5pbmdDb250YWluZXIgaGVhZGVyICNsb2dvLXRleHQge1xcbiAgaGVpZ2h0OiA0cmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tc3ltYm9sIHtcXG4gIG1hcmdpbi10b3A6IDAuM3JlbTtcXG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tdGV4dCB7XFxuICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICBwYWRkaW5nLWxlZnQ6IDAuMnJlbTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIGltZyB7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBwLCAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHtcXG4gIG1hcmdpbjogMDtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB7XFxuICBtYXJnaW4tcmlnaHQ6IDJyZW07XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYgdWwge1xcbiAgbWFyZ2luOiAwO1xcbiAgcGFkZGluZzogMDtcXG4gIGhlaWdodDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBnYXA6IDEuNXJlbTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCBsaSBhIHtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgdGV4dC1zaGFkb3c6IDFweCAxcHggYmxhY2s7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICNwYWdlSW1hZ2Uge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICNwYWdlSW1hZ2UgaW1nIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZmlsdGVyOiBibHVyKDAuNnJlbSkgZ3JheXNjYWxlKDUwJSk7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIG1hcmdpbi10b3A6IDglO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIGltZyB7XFxuICBoZWlnaHQ6IDZyZW07XFxufVxcblxcbi50aXRsZUJveCB7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG59XFxuLnRpdGxlQm94IHAge1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxufVxcblxcbi50ZXh0Qm94IHtcXG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbn1cXG4udGV4dEJveCBwIHtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG5cXG4jcHJvcGVydGllc0NvbnRhaW5lciA+IGRpdiAudGl0bGVCb3gsICNtZW1iZXJzQ29udGFpbmVyID4gZGl2IC50aXRsZUJveCB7XFxuICBib3JkZXI6IDAuMzVyZW0gc29saWQgcmdiKDE5OSwgMTg3LCAxNTYpO1xcbn1cXG4jcHJvcGVydGllc0NvbnRhaW5lciBpbWcsICNtZW1iZXJzQ29udGFpbmVyIGltZyB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiNwcm9wZXJ0aWVzQ29udGFpbmVyIGltZy5wYWdlTGlua3NfX3Zpc2libGUsICNtZW1iZXJzQ29udGFpbmVyIGltZy5wYWdlTGlua3NfX3Zpc2libGUge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDI3JSk7XFxufVxcblxcbiNhbGxOZXdzQ29udGFpbmVyLCAjY29udGFjdENvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzEsIDI3LCAyMSk7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyID4gZGl2IC50aXRsZUJveCwgI2NvbnRhY3RDb250YWluZXIgPiBkaXYgLnRpdGxlQm94IHtcXG4gIGJvcmRlcjogNHB4IHNvbGlkIHJnYigyMjEsIDIyMSwgMjIxKTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgPiBkaXYgLnRleHRCb3ggcCwgI2NvbnRhY3RDb250YWluZXIgPiBkaXYgLnRleHRCb3ggcCB7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3gge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZvbnQtc2l6ZTogMS4xcmVtO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggPiBkaXYge1xcbiAgZmxleC1iYXNpczogNTAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiA+IGRpdiwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggPiBkaXYgPiBkaXYge1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBoZWlnaHQ6IDkyJTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLmZvcm0tbWVzc2FnZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLmZvcm0tbWVzc2FnZSB7XFxuICBoZWlnaHQ6IGF1dG87XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGgzLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBoMyB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBoZWlnaHQ6IDglO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCB1bCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggdWwge1xcbiAgcGFkZGluZzogMDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggdWwgbGksICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHVsIGxpIHtcXG4gIGRpc3BsYXk6IGlubGluZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIHtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjMzLCAyMzMsIDIzMywgMC4zKTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3M6OmFmdGVyLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3czo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIiBcXFwiO1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBoZWlnaHQ6IDFyZW07XFxuICBjbGVhcjogYm90aDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgaW1nLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBpbWcge1xcbiAgZmxvYXQ6IGxlZnQ7XFxuICBtYXJnaW4tcmlnaHQ6IDIlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBwLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBwIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjJyZW07XFxuICBmb250LXNpemU6IDEuMjVyZW07XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzLCAjYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBmb3JtLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cywgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB7XFxuICBwYWRkaW5nOiAwIDUlO1xcbn1cXG5cXG4jY29udGFjdENvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kOiBibGFjaztcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3gge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBpbWcge1xcbiAgZmlsdGVyOiBzYXR1cmF0ZSgxMjAlKTtcXG4gIHdpZHRoOiA1MCU7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGxhYmVsLmVycm9yIHtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGNvbG9yOiByZ2IoMTIwLCAxNzksIDE1OCk7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gPiBkaXYge1xcbiAgbWFyZ2luOiA1JSAwO1xcbiAgbWFyZ2luLXRvcDogMDtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBsYWJlbCB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBbdHlwZT1yYWRpb10ge1xcbiAgd2lkdGg6IDEwJTtcXG4gIGRpc3BsYXk6IGluaXRpYWw7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gdWwge1xcbiAgcGFkZGluZzogMDtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBpbnB1dCB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIG1hcmdpbi10b3A6IDElO1xcbiAgd2lkdGg6IDQwJTtcXG4gIGhlaWdodDogMS41cmVtO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHRleHRhcmVhIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAyMHJlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBidXR0b24ge1xcbiAgY29sb3I6IGl2b3J5O1xcbn1cXG5cXG4uZG90LXB1bHNlIHtcXG4gIHRvcDogMjAlO1xcbiAgbGVmdDogMzUlO1xcbn1cXG5cXG4jcG9wLXVwLWRpc3BsYXktYm94IHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNDUsIDQxLCAzNSwgMC44KTtcXG4gIHdpZHRoOiA5NHZ3O1xcbiAgaGVpZ2h0OiA4N3ZoO1xcbiAgb3ZlcmZsb3cteTogYXV0bztcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIHotaW5kZXg6IDExMDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogOHZoO1xcbiAgbGVmdDogM3Z3O1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBwYWRkaW5nLXRvcDogMXJlbTtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCBpbWcge1xcbiAgd2lkdGg6IDUwMHB4O1xcbn1cXG4jcG9wLXVwLWRpc3BsYXktYm94IGEsICNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uIHtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCBidXR0b24ge1xcbiAgY29sb3I6IGFudGlxdWV3aGl0ZTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCBidXR0b246aG92ZXIsICNwb3AtdXAtZGlzcGxheS1ib3ggYTpob3ZlciB7XFxuICBmaWx0ZXI6IGJyaWdodG5lc3MoNzIlKTtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCAjY29udGVudC1ob2xkZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtZXZlbmx5O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDcwJTtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCAjY29udGVudC1ob2xkZXIgLnBvcC11cC1kaXJlY3Rpb25hbCB7XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG59XFxuXFxuI25ld3MtbWVkaWEtZGlzcGxheSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDQ0LCA1MiwgNzcsIDAuOCk7XFxuICBoZWlnaHQ6IDg4dmg7XFxuICB3aWR0aDogOTR2dztcXG4gIG92ZXJmbG93LXk6IGF1dG87XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICB6LWluZGV4OiAxMTA7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDd2aDtcXG4gIGxlZnQ6IDN2dztcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbn1cXG5cXG4jc2luZ2xlQ29udGFpbmVyIHtcXG4gIGhlaWdodDogODclO1xcbiAgbWluLXdpZHRoOiA2MCU7XFxuICB0b3A6IDguMyU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC13cmFwOiB3cmFwO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgei1pbmRleDogMTtcXG4gIHBhZGRpbmc6IDEuNXJlbSAxcmVtO1xcbiAgcGFkZGluZy1ib3R0b206IDFyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDM3LCAzNSwgMzQsIDAuOSk7XFxufVxcbiNzaW5nbGVDb250YWluZXIgaDQge1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgaDMsICNzaW5nbGVDb250YWluZXIgaDQsICNzaW5nbGVDb250YWluZXIgLnJlbGF0ZWQtbGluayB7XFxuICBjb2xvcjogcmdiKDI0MSwgMjE4LCAxODkpO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB7XFxuICB3aWR0aDogMjF2dztcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgaW1nIHtcXG4gIGhlaWdodDogNDIlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB1bCB7XFxuICBwYWRkaW5nLWxlZnQ6IDIwJTtcXG4gIGZvbnQtc2l6ZTogMS42NXJlbTtcXG4gIHRleHQtYWxpZ246IGxlZnQ7XFxuICBtYXJnaW4tdG9wOiAxcmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNtYWluSW1hZ2VBbmRTdGF0cyB1bCBsaSB7XFxuICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICBsaXN0LXN0eWxlLXR5cGU6IHNxdWFyZTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgdWwgbGkgYSB7XFxuICBmaWx0ZXI6IGJyaWdodG5lc3MoMTE1JSk7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3NpbmdsZUluZm8ge1xcbiAgd2lkdGg6IDMwdnc7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiA3JSAxZnI7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3NpbmdsZUluZm8gcCB7XFxuICBtYXJnaW4tdG9wOiAxLjJyZW07XFxuICBmb250LXNpemU6IDEuN3JlbTtcXG4gIGhlaWdodDogOTklO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIGRpdiB7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIHBhZGRpbmc6IDAgMXJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyAjbWVkaWFDb250YWluZXIge1xcbiAgaGVpZ2h0OiBhdXRvO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvICNtZWRpYUNvbnRhaW5lciBpZnJhbWUge1xcbiAgd2lkdGg6IDIwMHB4O1xcbiAgaGVpZ2h0OiAyMDBweDtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdmlkQW5kSW1nQ29sIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxNnZ3O1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3ZpZEFuZEltZ0NvbCBoMyB7XFxuICBmb250LXNpemU6IDEuOXJlbTtcXG4gIG1hcmdpbjogMXJlbSAwO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCB7XFxuICB3aWR0aDogMjZ2dztcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgcGFkZGluZzogMCAxcmVtO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogMTAlIDFmciA0JTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgaDMge1xcbiAgZm9udC1zaXplOiAycmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCBoMyBhIHtcXG4gIGZvbnQtc2l6ZTogMS43cmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCBoMyBhOmhvdmVyIHtcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgI25ld3MtcmVjaWV2ZXIge1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBtYXJnaW46IDFyZW0gMDtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgI25ld3MtcmVjaWV2ZXIgcCB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG4gIHBhZGRpbmctcmlnaHQ6IDFyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sICNwYWdpbmF0aW9uLWhvbGRlciB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3R0b206IDA7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG5cXG5ib2R5IHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxMDAsIDkyLCA4Mik7XFxufVxcblxcbi5zZWFyY2gtb3ZlcmxheSB7XFxuICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgei1pbmRleDogMTEwO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHJpZ2h0OiAwO1xcbiAgYm90dG9tOiAwO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg3MiwgNjgsIDYyLCAwLjk2KTtcXG4gIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gIG9wYWNpdHk6IDA7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuMDkpO1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjNzLCB0cmFuc2Zvcm0gMC4zcywgdmlzaWJpbGl0eSAwLjNzO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuLnNlYXJjaC1vdmVybGF5IC5jb250YWluZXIge1xcbiAgbWF4LXdpZHRoOiAxMzAwcHg7XFxuICBtYXJnaW46IDAgYXV0bztcXG4gIHBhZGRpbmc6IDAgMTZweDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXkgcCB7XFxuICBwYWRkaW5nLXRvcDogMXJlbTtcXG59XFxuYm9keS5hZG1pbi1iYXIgLnNlYXJjaC1vdmVybGF5IHtcXG4gIHRvcDogMnJlbTtcXG59XFxuLnNlYXJjaC1vdmVybGF5X190b3Age1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjEyKTtcXG59XFxuLnNlYXJjaC1vdmVybGF5X19pY29uIHtcXG4gIG1hcmdpbi1yaWdodDogMC43NXJlbTtcXG4gIGZvbnQtc2l6ZTogMi41cmVtO1xcbiAgY29sb3I6IHJnYigxNDgsIDEyMSwgMTA1KTtcXG59XFxuLnNlYXJjaC1vdmVybGF5LS1hY3RpdmUge1xcbiAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gIG9wYWNpdHk6IDE7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGUge1xcbiAgbWFyZ2luOiAzMHB4IDAgMXB4IDA7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAgZm9udC1zaXplOiAycmVtO1xcbiAgcGFkZGluZzogMTVweCAwO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNjY2M7XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9fY2xvc2Uge1xcbiAgZm9udC1zaXplOiAyLjdyZW07XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYig1OCwgNTQsIDU0KTtcXG4gIGNvbG9yOiByZ2IoMTgwLCAxNzEsIDE2Nik7XFxuICBsaW5lLWhlaWdodDogMC43O1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX2Nsb3NlOmhvdmVyIHtcXG4gIG9wYWNpdHk6IDE7XFxufVxcbi5zZWFyY2gtb3ZlcmxheSAub25lLWhhbGYge1xcbiAgcGFkZGluZy1ib3R0b206IDA7XFxufVxcblxcbi5zZWFyY2gtdGVybSB7XFxuICB3aWR0aDogNzUlO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGJvcmRlcjogbm9uZTtcXG4gIHBhZGRpbmc6IDFyZW0gMDtcXG4gIG1hcmdpbjogMDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgZm9udC1zaXplOiAxcmVtO1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICBjb2xvcjogcmdiKDIxOCwgMjAxLCAxODIpO1xcbn1cXG5cXG4uYm9keS1uby1zY3JvbGwge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuLmNvbnRhaW5lciB7XFxuICBtYXgtd2lkdGg6IDEzMDBweDtcXG4gIG1hcmdpbjogMCBhdXRvO1xcbiAgcGFkZGluZzogMCAxNnB4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG5AbWVkaWEgKG1pbi13aWR0aDogOTYwcHgpIHtcXG4gIC5zZWFyY2gtdGVybSB7XFxuICAgIHdpZHRoOiA4MCU7XFxuICAgIGZvbnQtc2l6ZTogM3JlbTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHNwaW4ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHNwaW4ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xcbiAgfVxcbn1cXG4uc3Bpbm5lci1sb2FkZXIge1xcbiAgbWFyZ2luLXRvcDogNDVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHdpZHRoOiAyNHB4O1xcbiAgaGVpZ2h0OiAyNHB4O1xcbiAgYm9yZGVyOiAwLjI1cmVtIHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gIGJvcmRlci10b3AtY29sb3I6IGJsYWNrO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHNwaW4gMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgYW5pbWF0aW9uOiBzcGluIDFzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuLm1lZGlhLWNhcmQgYnV0dG9uIHtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGZvbnQtc2l6ZTogMi4xcmVtO1xcbn1cXG5cXG5oMSwgaDIsIGgzLCBoNCB7XFxuICBmb250LWZhbWlseTogXFxcIkxpYnJlIENhc2xvbiBUZXh0XFxcIiwgc2VyaWY7XFxufVxcblxcbi5uZXdzIHAsIC50ZXh0Qm94IHAsICNyZWxhdGlvbnNoaXAtbGluaywgI3NpbmdsZS1saW5rIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTGlicmUgQ2FzbG9uIERpc3BsYXlcXFwiLCBzZXJpZjtcXG59XFxuXFxuaDEge1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuXFxuaDIge1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG59XFxuXFxuLmRpc3BsYXktdGV4dCwgI3dlbGNvbWVDb250YWluZXIgcCwgLnRpdGxlQm94IHAge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJDb3Jtb3JhbnQgU0NcXFwiLCBzZXJpZjtcXG59XFxuXFxuaW5wdXQsIC5yZWFkLW1vcmUsIC5uZXdzIGxpIGEsIGhlYWRlciBsaSBhLCAjcmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZyBidXR0b24sICNzZWFyY2gtZmlsdGVycyBidXR0b24sICNyZXNldC1hbGwge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJMb3JhXFxcIiwgc2VyaWY7XFxufVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDUwJTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuLmNvbnRlbnQtbG9hZGVyIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgaGVpZ2h0OiA1MCU7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5jb250ZW50LWxvYWRlciAuYmFsbCB7XFxuICB3aWR0aDogMS4ycmVtO1xcbiAgaGVpZ2h0OiAxLjJyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNDcsIDE2MywgNTYpO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA1MCU7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nMiAwLjdzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUsIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQyIDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZzIgMC43cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlLCBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0MiAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuLmNvbnRlbnQtbG9hZGVyLmxvYWRlcltkYXRhLXRleHRdOjpiZWZvcmUge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG4uY29udGVudC1sb2FkZXIubG9hZGVyLmlzLWFjdGl2ZTo6YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiA1MCU7XFxuICBsZWZ0OiAyNSU7XFxuICB0b3A6IDM5JTtcXG4gIGZvbnQtc2l6ZTogMi43cmVtO1xcbiAgY29sb3I6IHJnYigxOTUsIDE2OCwgMTI2KTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbn1cXG4uY29udGVudC1sb2FkZXIubG9hZGVyLWJhci1waW5nLXBvbmc6OmFmdGVyIHtcXG4gIHdpZHRoOiAxLjJyZW07XFxuICBoZWlnaHQ6IDEuMnJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigxMDEsIDE0OCwgMTg3KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcgMC43cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlLCBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0IDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjdzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUsIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQgMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcbi5jb250ZW50LWxvYWRlci5sb2FkZXIuaXMtYWN0aXZlIHtcXG4gIGhlaWdodDogOTclO1xcbiAgei1pbmRleDogMDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTEsIDQ5LCA1NiwgMC43NDkwMTk2MDc4KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBibGluayAxLjhzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogYmxpbmsgMS44cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgYmxpbmsge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwLjU7XFxuICB9XFxuICA1MCUge1xcbiAgICBvcGFjaXR5OiAwLjc1O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgYmxpbmsge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAwLjU7XFxuICB9XFxuICA1MCUge1xcbiAgICBvcGFjaXR5OiAwLjc1O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1Bvbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiA0MCU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogNjAlO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IDQwJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiA2MCU7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0IHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg3MiwgNjgsIDgyLCAwLjc1KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTAyLCA3OCwgMTIyLCAwLjc1KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDE0OSwgOTMsIDE2OCwgMC43NSk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdCB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNzIsIDY4LCA4MiwgMC43NSk7XFxuICB9XFxuICA1MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEwMiwgNzgsIDEyMiwgMC43NSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxNDksIDkzLCAxNjgsIDAuNzUpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nMiB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IDQzJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiA2MyU7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nMiB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IDQzJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiA2MyU7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0MiB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig0NywgMTYzLCA1Nik7XFxuICB9XFxuICA1MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoODcsIDE0MywgNTYpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYigxMjYsIDEzMSwgNTgpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQyIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDQ3LCAxNjMsIDU2KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig4NywgMTQzLCA1Nik7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDEyNiwgMTMxLCA1OCk7XFxuICB9XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIge1xcbiAgaGVpZ2h0OiA4NSU7XFxuICB0b3A6IDklO1xcbiAgd2lkdGg6IDk1JTtcXG4gIGxlZnQ6IDIuNSU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDM3LCAzNSwgMzQsIDAuNzUpO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGNvbG9yOiBhbGljZWJsdWU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgYnV0dG9uIHtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI21lZGlhLWNvbnRhaW5lciwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciB7XFxuICBib3JkZXI6IDAuMnJlbSBzb2xpZCByZ2JhKDIxMiwgMTkzLCAxMzAsIDAuNCk7XFxuICBib3JkZXItbGVmdDogbm9uZTtcXG4gIHBhZGRpbmctbGVmdDogMS41cmVtO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJyZWFsdGltZUZpbHRlcnNBbmRTb3J0aW5nXFxcIiBcXFwic2VhcmNoRmlsdGVyc1xcXCIgXFxcInJlc2V0QWxsXFxcIjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIHtcXG4gIGdyaWQtYXJlYTogcmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZztcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwiaGVhZGluZ1JGUyBoZWFkaW5nUkZTXFxcIiBcXFwib3JkZXJCeSB0b2dnbGVUeXBlXFxcIiBcXFwiZmlsdGVyRGF0ZSBmaWx0ZXJEYXRlXFxcIjtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgYnV0dG9uLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgbGFiZWwge1xcbiAgZm9udC1zaXplOiAxLjNyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyBoMiB7XFxuICBncmlkLWFyZWE6IGhlYWRpbmdSRlM7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyAjb3JkZXItYnkge1xcbiAgZ3JpZC1hcmVhOiBvcmRlckJ5O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI3RvZ2dsZS10eXBlIHtcXG4gIGdyaWQtYXJlYTogdG9nZ2xlVHlwZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nICNmaWx0ZXItZGF0ZSB7XFxuICBncmlkLWFyZWE6IGZpbHRlckRhdGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyAjZmlsdGVyLWRhdGUgZGl2IHVsIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBnYXA6IDNyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyB1bCB7XFxuICBwYWRkaW5nLWxlZnQ6IDAuM3JlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIHVsIGxpIHtcXG4gIG1hcmdpbi10b3A6IDAuNXJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyB7XFxuICBncmlkLWFyZWE6IHNlYXJjaEZpbHRlcnM7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImhlYWRpbmdTRiBoZWFkaW5nU0YgaGVhZGluZ1NGXFxcIiBcXFwibmV3c1NlYXJjaCBuZXdzU2VhcmNoIG5ld3NTZWFyY2hcXFwiIFxcXCJjYXNlU2Vuc2l0aXZlIGZ1bGxXb3JkT25seSB3b3JkU3RhcnRPbmx5XFxcIiBcXFwiaW5jbHVkZVRpdGxlIGluY2x1ZGVEZXNjcmlwdGlvbiAuLi5cXFwiO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIGgyIHtcXG4gIGdyaWQtYXJlYTogaGVhZGluZ1NGO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIGJ1dHRvbiB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIHRleHQtYWxpZ246IGxlZnQ7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI25ld3Mtc2VhcmNoLWNvbnRhaW5lciB7XFxuICBncmlkLWFyZWE6IG5ld3NTZWFyY2g7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI25ld3Mtc2VhcmNoLWNvbnRhaW5lciAjbmV3cy1zZWFyY2gge1xcbiAgZm9udC1zaXplOiAxLjE1cmVtO1xcbiAgaGVpZ2h0OiAyLjNyZW07XFxuICB3aWR0aDogMThyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI2Z1bGwtd29yZC1vbmx5IHtcXG4gIGdyaWQtYXJlYTogZnVsbFdvcmRPbmx5O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICN3b3JkLXN0YXJ0LW9ubHkge1xcbiAgZ3JpZC1hcmVhOiB3b3JkU3RhcnRPbmx5O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNjYXNlLXNlbnNpdGl2ZSB7XFxuICBncmlkLWFyZWE6IGNhc2VTZW5zaXRpdmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI2luY2x1ZGUtdGl0bGUge1xcbiAgZ3JpZC1hcmVhOiBpbmNsdWRlVGl0bGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI2luY2x1ZGUtZGVzY3JpcHRpb24ge1xcbiAgZ3JpZC1hcmVhOiBpbmNsdWRlRGVzY3JpcHRpb247XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI3dvcmQtc3RhcnQtb25seS5pbmFjdGl2ZSwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBidXR0b24uaW5hY3RpdmUge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgI3dvcmQtc3RhcnQtb25seS5pbmFjdGl2ZSBzcGFuLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzIGJ1dHRvbi5pbmFjdGl2ZSBzcGFuIHtcXG4gIGNvbG9yOiByZWQ7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBidXR0b24sICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBzZWxlY3QsICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBsYWJlbCB7XFxuICBmb250LXNpemU6IDEuMXJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZXNldC1hbGwge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxuICBncmlkLWFyZWE6IHJlc2V0QWxsO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgYnV0dG9uIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGgzIHtcXG4gIGZvbnQtc2l6ZTogMS43cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgaDQge1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxuICBtYXJnaW4tYm90dG9tOiAwLjhyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyIHtcXG4gIHdpZHRoOiA2NiU7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiAxMCUgODQlIDYlO1xcbiAgYm9yZGVyOiAwLjJyZW0gc29saWQgcmdiKDE4MCwgMTc0LCAxNjQpO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciBoMiB7XFxuICB3aWR0aDogMTAwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogM3JlbTtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICBib3JkZXItYm90dG9tOiAwLjNyZW0gc29saWQgcmdiKDE4NSwgMTU4LCAxMjIpO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZGlzbWlzcy1zZWxlY3Rpb24ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZGlzbWlzcy1zZWxlY3Rpb24uZGlzbWlzc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtcmVjaWV2ZXIge1xcbiAgbWFyZ2luLWJvdHRvbTogMC41cmVtO1xcbiAgcGFkZGluZy1yaWdodDogMnJlbTtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB7XFxuICBwYWRkaW5nLWxlZnQ6IDJyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lci5kaXNtaXNzZWQge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIHBhZGRpbmctdG9wOiAwO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzOjphZnRlciwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3M6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCIgXFxcIjtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgaGVpZ2h0OiAxcmVtO1xcbiAgY2xlYXI6IGJvdGg7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgaW1nLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzIGlmcmFtZSwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgaW1nLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBpZnJhbWUge1xcbiAgZmxvYXQ6IGxlZnQ7XFxuICBtYXJnaW4tcmlnaHQ6IDIlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzIHAsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzIHAge1xcbiAgbGluZS1oZWlnaHQ6IDEuMnJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBpZnJhbWUsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzIGlmcmFtZSB7XFxuICB3aWR0aDogMTUwcHg7XFxuICBoZWlnaHQ6IDEwMHB4O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IHVsIGxpLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSB7XFxuICBsaXN0LXN0eWxlLXR5cGU6IGNpcmNsZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSAuc2VlLW1vcmUtbGluaywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSAucmVsYXRpb25zaGlwLWxpbmssICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIHVsIGxpIC5zZWUtbW9yZS1saW5rLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAucmVsYXRpb25zaGlwLWxpbmsge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IHVsIGxpIC5zZWUtbW9yZS1saW5rLmRpc21pc3NlZCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSAucmVsYXRpb25zaGlwLWxpbmsuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAuc2VlLW1vcmUtbGluay5kaXNtaXNzZWQsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIHVsIGxpIC5yZWxhdGlvbnNoaXAtbGluay5kaXNtaXNzZWQge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIHtcXG4gIHdpZHRoOiAzNiU7XFxuICBwYWRkaW5nLXRvcDogMXJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIge1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyLmRpc21pc3NlZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgZm9udC1zaXplOiAxLjlyZW07XFxuICBtYXJnaW4tbGVmdDogMC41cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyBhLmhpZGRlbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIgLmNvbnRlbnQtcGFnZXMgYS5zZWxlY3RlZFBhZ2Uge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEuaGlkZGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxufVxcblxcbiNtZWRpYS1yZWNpZXZlciB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMCwgMTAsIDEwLCAwLjgpO1xcbiAgdG9wOiA3JTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiA5NSU7XFxuICB6LWluZGV4OiAxO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEge1xcbiAgbWFyZ2luLWxlZnQ6IDE0cmVtO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAzcmVtO1xcbiAgaGVpZ2h0OiA0NXJlbTtcXG4gIHdpZHRoOiA4MHJlbTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhIGlmcmFtZSwgI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhIGltZyB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgI3BsYXktYnV0dG9uLWNvbnRhaW5lciAjcGxheS1idXR0b24ge1xcbiAgaGVpZ2h0OiA2cmVtO1xcbiAgd2lkdGg6IDlyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDk5LCAxMDAsIDE3OSwgMC44KTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvcmRlci1yYWRpdXM6IDM1JTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIgI3BsYXktYnV0dG9uIGRpdiB7XFxuICBib3JkZXItbGVmdDogM3JlbSBzb2xpZCByZ2IoMTI1LCAxNTAsIDE2OCk7XFxuICBib3JkZXItdG9wOiAxLjdyZW0gc29saWQgdHJhbnNwYXJlbnQ7XFxuICBib3JkZXItYm90dG9tOiAxLjdyZW0gc29saWQgdHJhbnNwYXJlbnQ7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSAjcGxheS1idXR0b24tY29udGFpbmVyICNwbGF5LWJ1dHRvbjpob3ZlciB7XFxuICBvcGFjaXR5OiAwLjc7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYS5jZW50ZXItZGlzcGxheSB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBoZWlnaHQ6IDgyJTtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgcmlnaHQ6IDJyZW07XFxuICB0b3A6IDNyZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtbWVudSB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtbWVudSBhIHtcXG4gIGNvbG9yOiBhenVyZTtcXG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLW1lbnUgYS5hY3RpdmUge1xcbiAgZmlsdGVyOiBjb250cmFzdCg0OCUpO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIHtcXG4gIG1heC13aWR0aDogMzgwcHg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBtYXJnaW4tdG9wOiAxcmVtO1xcbiAgd2lkdGg6IDEwMCU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24gLm1lZGlhLXRodW1iIHtcXG4gIHdpZHRoOiA0NSU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24gLm1lZGlhLXRodW1iLnNlbGVjdGVkIHtcXG4gIGZpbHRlcjogY29udHJhc3QoNDglKTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS1pbmZvcm1hdGlvbiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIG1hcmdpbi1sZWZ0OiAxcmVtO1xcbiAgd2lkdGg6IDU1JTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiAubWVkaWEtaW5mb3JtYXRpb24gcCB7XFxuICBtYXJnaW46IDA7XFxuICBjb2xvcjogYmVpZ2U7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24gLm1lZGlhLWluZm9ybWF0aW9uIHA6bnRoLW9mLXR5cGUoMikge1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1wYWdpbmF0aW9uIHtcXG4gIG1hcmdpbi10b3A6IDEuNXJlbTtcXG4gIGNvbG9yOiBhbGljZWJsdWU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtcGFnaW5hdGlvbiBhIHtcXG4gIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgbWFyZ2luLWxlZnQ6IDFyZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtY2xvc2Uge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgY29sb3I6IHdoaXRlO1xcbiAgbGVmdDogMy41cmVtO1xcbiAgdG9wOiAzLjVyZW07XFxuICBmb250LXNpemU6IDMuNXJlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLm1lZGlhLWNhcmQ6aG92ZXIgaW1nLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBpbWcge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDUwJSk7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbi5tZWRpYS1jYXJkOmhvdmVyIGgzLCAubWVkaWEtY2FyZDpob3ZlciBwLCAubWVkaWEtY2FyZDpob3ZlciBidXR0b24sIC5wcm9wZXJ0eS1tZWRpYS1jYXJkOmhvdmVyIGgzLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBwLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBidXR0b24ge1xcbiAgZmlsdGVyOiBjb250cmFzdCg0MCUpO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubG9hZGVyIHtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB0b3A6IC05OTk5cHg7XFxuICB3aWR0aDogMDtcXG4gIGhlaWdodDogMDtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICB6LWluZGV4OiA5OTk5OTk7XFxufVxcblxcbi5sb2FkZXI6YWZ0ZXIsIC5sb2FkZXI6YmVmb3JlIHtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4ubG9hZGVyLmlzLWFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuODUpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiAwO1xcbn1cXG5cXG4ubG9hZGVyLmlzLWFjdGl2ZTphZnRlciwgLmxvYWRlci5pcy1hY3RpdmU6YmVmb3JlIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgcm90YXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzU5ZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyByb3RhdGlvbiB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDApO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGJsaW5rIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgfVxcbiAgdG8ge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG4ubG9hZGVyW2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IDUwJTtcXG4gIGNvbG9yOiBjdXJyZW50Q29sb3I7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZm9udC1zaXplOiAxNHB4O1xcbn1cXG5cXG4ubG9hZGVyW2RhdGEtdGV4dD1cXFwiXFxcIl06YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJMb2FkaW5nXFxcIjtcXG59XFxuXFxuLmxvYWRlcltkYXRhLXRleHRdOm5vdChbZGF0YS10ZXh0PVxcXCJcXFwiXSk6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IGF0dHIoZGF0YS10ZXh0KTtcXG59XFxuXFxuLmxvYWRlcltkYXRhLXRleHRdW2RhdGEtYmxpbmtdOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogYmxpbmsgMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBibGluayAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHRbZGF0YS10ZXh0XTpiZWZvcmUge1xcbiAgdG9wOiBjYWxjKDUwJSAtIDYzcHgpO1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHQ6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogNDhweDtcXG4gIGhlaWdodDogNDhweDtcXG4gIGJvcmRlcjogOHB4IHNvbGlkICNmZmY7XFxuICBib3JkZXItbGVmdC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB0b3A6IGNhbGMoNTAlIC0gMjRweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDI0cHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHJvdGF0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItZGVmYXVsdFtkYXRhLWhhbGZdOmFmdGVyIHtcXG4gIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxufVxcblxcbi5sb2FkZXItZGVmYXVsdFtkYXRhLWludmVyc2VdOmFmdGVyIHtcXG4gIGFuaW1hdGlvbi1kaXJlY3Rpb246IHJldmVyc2U7XFxufVxcblxcbi5sb2FkZXItZG91YmxlOmFmdGVyLCAubG9hZGVyLWRvdWJsZTpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBib3JkZXI6IDhweCBzb2xpZDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogcm90YXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG4ubG9hZGVyLWRvdWJsZTphZnRlciB7XFxuICB3aWR0aDogNDhweDtcXG4gIGhlaWdodDogNDhweDtcXG4gIGJvcmRlci1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1sZWZ0LWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIHRvcDogY2FsYyg1MCUgLSAyNHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMjRweCk7XFxufVxcblxcbi5sb2FkZXItZG91YmxlOmJlZm9yZSB7XFxuICB3aWR0aDogNjRweDtcXG4gIGhlaWdodDogNjRweDtcXG4gIGJvcmRlci1jb2xvcjogI2ViOTc0ZTtcXG4gIGJvcmRlci1yaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kdXJhdGlvbjogMnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kdXJhdGlvbjogMnM7XFxuICB0b3A6IGNhbGMoNTAlIC0gMzJweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDMycHgpO1xcbn1cXG5cXG4ubG9hZGVyLWJhcltkYXRhLXRleHRdOmJlZm9yZSB7XFxuICB0b3A6IGNhbGMoNTAlIC0gNDBweCk7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLmxvYWRlci1iYXI6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIHdpZHRoOiAyMDBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KC00NWRlZywgIzQxODNkNyAyNSUsICM1MmIzZDkgMCwgIzUyYjNkOSA1MCUsICM0MTgzZDcgMCwgIzQxODNkNyA3NSUsICM1MmIzZDkgMCwgIzUyYjNkOSk7XFxuICBiYWNrZ3JvdW5kLXNpemU6IDIwcHggMjBweDtcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgMTBweCAwIGhzbGEoMCwgMCUsIDEwMCUsIDAuMiksIDAgMCAwIDVweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICBhbmltYXRpb246IG1vdmVCYXIgMS41cyBsaW5lYXIgaW5maW5pdGUgcmV2ZXJzZTtcXG59XFxuXFxuLmxvYWRlci1iYXJbZGF0YS1yb3VuZGVkXTphZnRlciB7XFxuICBib3JkZXItcmFkaXVzOiAxNXB4O1xcbn1cXG5cXG4ubG9hZGVyLWJhcltkYXRhLWludmVyc2VdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRpcmVjdGlvbjogbm9ybWFsO1xcbiAgICAgICAgICBhbmltYXRpb24tZGlyZWN0aW9uOiBub3JtYWw7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMHB4IDIwcHg7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbW92ZUJhciB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMjBweCAyMHB4O1xcbiAgfVxcbn1cXG4ubG9hZGVyLWJhci1waW5nLXBvbmc6YmVmb3JlIHtcXG4gIHdpZHRoOiAyMDBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZzphZnRlciwgLmxvYWRlci1iYXItcGluZy1wb25nOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGhlaWdodDogMjBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogY2FsYyg1MCUgLSAxMHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbn1cXG5cXG4ubG9hZGVyLWJhci1waW5nLXBvbmc6YWZ0ZXIge1xcbiAgd2lkdGg6IDUwcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjE5O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjVzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nIDAuNXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuLmxvYWRlci1iYXItcGluZy1wb25nW2RhdGEtcm91bmRlZF06YmVmb3JlIHtcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZ1tkYXRhLXJvdW5kZWRdOmFmdGVyIHtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb24tbmFtZTogbW92ZUJhclBpbmdQb25nUm91bmRlZDtcXG4gICAgICAgICAgYW5pbWF0aW9uLW5hbWU6IG1vdmVCYXJQaW5nUG9uZ1JvdW5kZWQ7XFxufVxcblxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgLSAxMDBweCk7XFxuICB9XFxuICB0byB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgNTBweCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdSb3VuZGVkIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgLSAxMDBweCk7XFxuICB9XFxuICB0byB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgODBweCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nUm91bmRlZCB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDgwcHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY29ybmVycyB7XFxuICA2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICB9XFxuICAyNSUge1xcbiAgICB3aWR0aDogMTVweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgdG9wOiAwO1xcbiAgfVxcbiAgMzElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gIH1cXG4gIDU2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHRvcDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA4MSUge1xcbiAgICBoZWlnaHQ6IDYwcHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY29ybmVycyB7XFxuICA2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICB9XFxuICAyNSUge1xcbiAgICB3aWR0aDogMTVweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgdG9wOiAwO1xcbiAgfVxcbiAgMzElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgICBsZWZ0OiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gIH1cXG4gIDU2JSB7XFxuICAgIHdpZHRoOiA2MHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHRvcDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA4MSUge1xcbiAgICBoZWlnaHQ6IDYwcHg7XFxuICB9XFxufVxcbi5sb2FkZXItYm9yZGVyW2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIGNvbG9yOiAjZmZmO1xcbn1cXG5cXG4ubG9hZGVyLWJvcmRlcjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTVweDtcXG4gIGhlaWdodDogMTVweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29ybmVycyAzcyBlYXNlIGJvdGggaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29ybmVycyAzcyBlYXNlIGJvdGggaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItYmFsbDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogNTBweDtcXG4gIGhlaWdodDogNTBweDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAtMjVweCAwIDAgLTI1cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBraWNrQmFsbCAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1pbiBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGtpY2tCYWxsIDFzIGluZmluaXRlIGFsdGVybmF0ZSBlYXNlLWluIGJvdGg7XFxufVxcblxcbi5sb2FkZXItYmFsbFtkYXRhLXNoYWRvd106YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IGluc2V0IC01cHggLTVweCAxMHB4IDAgcmdiYSgwLCAwLCAwLCAwLjUpO1xcbn1cXG5cXG4ubG9hZGVyLWJhbGw6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMyk7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogNDVweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHRvcDogY2FsYyg1MCUgKyAxMHB4KTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogMCAwIDAgLTIyLjVweDtcXG4gIHotaW5kZXg6IDA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogc2hhZG93IDFzIGluZmluaXRlIGFsdGVybmF0ZSBlYXNlLW91dCBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IHNoYWRvdyAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1vdXQgYm90aDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIHNoYWRvdyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMCk7XFxuICB9XFxuICA5NSUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIHNoYWRvdyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMCk7XFxuICB9XFxuICA5NSUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNzUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMga2lja0JhbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTgwcHgpIHNjYWxlWCgwLjk1KTtcXG4gIH1cXG4gIDkwJSB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApIHNjYWxlWCgxKTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlIDUwJSAyMCUgMjAlO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGtpY2tCYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC04MHB4KSBzY2FsZVgoMC45NSk7XFxuICB9XFxuICA5MCUge1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKSBzY2FsZVgoMSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJSA1MCUgMjAlIDIwJTtcXG4gIH1cXG59XFxuLmxvYWRlci1zbWFydHBob25lOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEycHg7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAxMjBweDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGxlZnQ6IDUwJTtcXG4gIHRvcDogNTAlO1xcbiAgd2lkdGg6IDcwcHg7XFxuICBoZWlnaHQ6IDEzMHB4O1xcbiAgbWFyZ2luOiAtNjVweCAwIDAgLTM1cHg7XFxuICBib3JkZXI6IDVweCBzb2xpZCAjZmQwO1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgNXB4IDAgMCAjZmQwO1xcbiAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCA1MCUgOTAlLCByZ2JhKDAsIDAsIDAsIDAuNSkgNnB4LCB0cmFuc3BhcmVudCAwKSwgbGluZWFyLWdyYWRpZW50KDBkZWcsICNmZDAgMjJweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgwZGVnLCByZ2JhKDAsIDAsIDAsIDAuNSkgMjJweCwgcmdiYSgwLCAwLCAwLCAwLjUpKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBzaGFrZSAycyBjdWJpYy1iZXppZXIoMC4zNiwgMC4wNywgMC4xOSwgMC45NykgYm90aCBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBzaGFrZSAycyBjdWJpYy1iZXppZXIoMC4zNiwgMC4wNywgMC4xOSwgMC45NykgYm90aCBpbmZpbml0ZTtcXG59XFxuXFxuLmxvYWRlci1zbWFydHBob25lW2RhdGEtc2NyZWVuPVxcXCJcXFwiXTphZnRlciB7XFxuICBjb250ZW50OiBcXFwiTG9hZGluZ1xcXCI7XFxufVxcblxcbi5sb2FkZXItc21hcnRwaG9uZTpub3QoW2RhdGEtc2NyZWVuPVxcXCJcXFwiXSk6YWZ0ZXIge1xcbiAgY29udGVudDogYXR0cihkYXRhLXNjcmVlbik7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBzaGFrZSB7XFxuICA1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAxMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDM1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICA0MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBzaGFrZSB7XFxuICA1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAxMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDM1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICA0MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG59XFxuLmxvYWRlci1jbG9jazpiZWZvcmUge1xcbiAgd2lkdGg6IDEyMHB4O1xcbiAgaGVpZ2h0OiAxMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIG1hcmdpbjogLTYwcHggMCAwIC02MHB4O1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgdHJhbnNwYXJlbnQgNTAlLCAjZjVmNWY1IDApLCBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHRyYW5zcGFyZW50IDU1cHgsICMyZWNjNzEgMCwgIzJlY2M3MSA2NXB4LCB0cmFuc3BhcmVudCAwKSwgbGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2Y1ZjVmNSA1MCUsICNmNWY1ZjUgMCk7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDAgMCAxMHB4ICNmNWY1ZjUsIDAgMCAwIDVweCAjNTU1LCAwIDAgMCAxMHB4ICM3YjdiN2I7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogcm90YXRpb24gaW5maW5pdGUgMnMgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDJzIGxpbmVhcjtcXG59XFxuXFxuLmxvYWRlci1jbG9jazphZnRlciwgLmxvYWRlci1jbG9jazpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBsZWZ0OiA1MCU7XFxuICB0b3A6IDUwJTtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbi5sb2FkZXItY2xvY2s6YWZ0ZXIge1xcbiAgd2lkdGg6IDYwcHg7XFxuICBoZWlnaHQ6IDQwcHg7XFxuICBtYXJnaW46IC0yMHB4IDAgMCAtMTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDIwcHggMCAwIDIwcHg7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDE0cHggMjBweCwgIzI1YTI1YSAxMHB4LCB0cmFuc3BhcmVudCAwKSwgcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAxNHB4IDIwcHgsICMxYjc5NDMgMTRweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHRyYW5zcGFyZW50IDE1cHgsICMyZWNjNzEgMCwgIzJlY2M3MSAyNXB4LCB0cmFuc3BhcmVudCAwKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiBpbmZpbml0ZSAyNHMgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDI0cyBsaW5lYXI7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAxNXB4IGNlbnRlcjtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluOmFmdGVyLCAubG9hZGVyLWN1cnRhaW46YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdG9wOiA1MCU7XFxuICBtYXJnaW4tdG9wOiAtMzVweDtcXG4gIGZvbnQtc2l6ZTogNzBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGxpbmUtaGVpZ2h0OiAxLjI7XFxuICBjb250ZW50OiBcXFwiTG9hZGluZ1xcXCI7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbjpiZWZvcmUge1xcbiAgY29sb3I6ICM2NjY7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbjphZnRlciB7XFxuICBjb2xvcjogI2ZmZjtcXG4gIGhlaWdodDogMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtY3VydGFpbi10ZXh0XTpub3QoW2RhdGEtY3VydGFpbi10ZXh0PVxcXCJcXFwiXSk6YWZ0ZXIsIC5sb2FkZXItY3VydGFpbltkYXRhLWN1cnRhaW4tdGV4dF06bm90KFtkYXRhLWN1cnRhaW4tdGV4dD1cXFwiXFxcIl0pOmJlZm9yZSB7XFxuICBjb250ZW50OiBhdHRyKGRhdGEtY3VydGFpbi10ZXh0KTtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtYnJhemlsaWFuXTpiZWZvcmUge1xcbiAgY29sb3I6ICNmMWM0MGY7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWJyYXppbGlhbl06YWZ0ZXIge1xcbiAgY29sb3I6ICMyZWNjNzE7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWNvbG9yZnVsXTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1hc2tDb2xvcmZ1bCAycyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbWFza0NvbG9yZnVsIDJzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1jdXJ0YWluW2RhdGEtY29sb3JmdWxdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aCwgbWFza0NvbG9yZnVsLWZyb250IDJzIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjdXJ0YWluIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aCwgbWFza0NvbG9yZnVsLWZyb250IDJzIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGUgYm90aDtcXG4gIGNvbG9yOiAjMDAwO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbWFza0NvbG9yZnVsIHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMzNDk4ZGI7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2U3NGMzYztcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgbWFza0NvbG9yZnVsIHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMzNDk4ZGI7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2U3NGMzYztcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBtYXNrQ29sb3JmdWwtZnJvbnQge1xcbiAgMCUge1xcbiAgICBjb2xvcjogIzJlY2M3MTtcXG4gIH1cXG4gIDQ5LjUlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA1MC41JSB7XFxuICAgIGNvbG9yOiAjZjFjNDBmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtYXNrQ29sb3JmdWwtZnJvbnQge1xcbiAgMCUge1xcbiAgICBjb2xvcjogIzJlY2M3MTtcXG4gIH1cXG4gIDQ5LjUlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA1MC41JSB7XFxuICAgIGNvbG9yOiAjZjFjNDBmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGN1cnRhaW4ge1xcbiAgMCUge1xcbiAgICBoZWlnaHQ6IDA7XFxuICB9XFxuICB0byB7XFxuICAgIGhlaWdodDogODRweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBjdXJ0YWluIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBoZWlnaHQ6IDg0cHg7XFxuICB9XFxufVxcbi5sb2FkZXItbXVzaWM6YWZ0ZXIsIC5sb2FkZXItbXVzaWM6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgd2lkdGg6IDI0MHB4O1xcbiAgaGVpZ2h0OiAyNDBweDtcXG4gIHRvcDogNTAlO1xcbiAgbGVmdDogNTAlO1xcbiAgbWFyZ2luOiAtMTIwcHggMCAwIC0xMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxpbmUtaGVpZ2h0OiAyNDBweDtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiA0MHB4O1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICB0ZXh0LXNoYWRvdzogMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gIGxldHRlci1zcGFjaW5nOiAtMXB4O1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljOmFmdGVyIHtcXG4gIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICAgICAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1oZXktb2hdOmFmdGVyLCAubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogMCAwIDAgMTBweDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLWhleS1vaF06YmVmb3JlIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBjb2xvcjogIzAwMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgb2ggNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIG9oIDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTphZnRlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIGhleSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBoZXkgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1uby1jcnldOmFmdGVyLCAubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTpiZWZvcmUge1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDQ1ZGVnLCAjMDA5YjNhIDUwJSwgI2ZlZDEwMCA1MSUpO1xcbiAgYm94LXNoYWRvdzogMCAwIDAgMTBweCAjMDAwO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCBjcnkgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIGNyeSA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLW5vLWNyeV06YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIG5vIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIG5vIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtd2UtYXJlXTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCB0aGVXb3JsZCA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgdGhlV29ybGQgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSBhdCBjZW50ZXIsICM0ZWNkYzQgMCwgIzU1NjI3MCk7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS13ZS1hcmVdOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZUFyZSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZUFyZSA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChlbGxpcHNlIGF0IGNlbnRlciwgIzI2ZDBjZSAwLCAjMWEyOTgwKTtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXJvY2steW91XTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCByb2NrWW91IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCByb2NrWW91IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgYmFja2dyb3VuZDogIzQ0NDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXJvY2steW91XTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgd2VXaWxsIDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIHdlV2lsbCA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6ICM5NjI4MWI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBjb2luIHtcXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDM1OWRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgY29pbiB7XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY29pbkJhY2sge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxdHVybik7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGNvaW5CYWNrIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMXR1cm4pO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGhleSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJMZXQncyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiSGV5IVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgaGV5IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIkhleSFcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIkxldCdzIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG9oIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiR28hXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgb2gge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiT2ghXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJHbyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiT2ghXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG5vIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJub1xcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJOby4uLlxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbm8ge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiTm8uLi5cXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIm5vXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGNyeSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiY3J5IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY3J5IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIndvbWFuXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJjcnkhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndvbWFuXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHdlQXJlIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwid2UgYXJlXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgd2VBcmUge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2UgYXJlXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSBhcmVcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiV2UgYXJlXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHRoZVdvcmxkIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSB3b3JsZCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSBjaGlsZHJlbiFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgdGhlV29ybGQge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwidGhlIGNoaWxkcmVuIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgd29ybGQsXFxcIjtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIHdlV2lsbCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwicm9jayB5b3UhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIHdpbGwsXFxcIjtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyB3ZVdpbGwge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2Ugd2lsbCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInJvY2sgeW91IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyByb2NrWW91IHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIvCfpJhcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwid2Ugd2lsbFxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgcm9ja1lvdSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSB3aWxsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn6SYXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbn1cXG4ubG9hZGVyLXBva2ViYWxsOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiAxMDBweDtcXG4gIGhlaWdodDogMTAwcHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTUwcHggMCAwIC01MHB4O1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmVkIDQyJSwgIzAwMCAwLCAjMDAwIDU4JSwgI2ZmZiAwKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgei1pbmRleDogMTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlUG9rZWJhbGwgMXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLXBva2ViYWxsOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDI0cHg7XFxuICBoZWlnaHQ6IDI0cHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTEycHggMCAwIC0xMnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHotaW5kZXg6IDI7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoLCBmbGFzaFBva2ViYWxsIDAuNXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVQb2tlYmFsbCAxcyBsaW5lYXIgaW5maW5pdGUgYm90aCwgZmxhc2hQb2tlYmFsbCAwLjVzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gIGJvcmRlcjogMnB4IHNvbGlkICMwMDA7XFxuICBib3gtc2hhZG93OiAwIDAgMCA1cHggI2ZmZiwgMCAwIDAgMTBweCAjMDAwO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZVBva2ViYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApIHJvdGF0ZSgwKTtcXG4gIH1cXG4gIDE1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRleCgtMTBweCkgcm90YXRlKC01ZGVnKTtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMHB4KSByb3RhdGUoNWRlZyk7XFxuICB9XFxuICA0NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoMCkgcm90YXRlKDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1vdmVQb2tlYmFsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKSByb3RhdGUoMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoLTEwcHgpIHJvdGF0ZSgtNWRlZyk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTBweCkgcm90YXRlKDVkZWcpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGV4KDApIHJvdGF0ZSgwKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGZsYXNoUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmQwO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGZsYXNoUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmQwO1xcbiAgfVxcbn1cXG4ubG9hZGVyLWJvdW5jaW5nOmFmdGVyLCAubG9hZGVyLWJvdW5jaW5nOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHdpZHRoOiAyMHB4O1xcbiAgaGVpZ2h0OiAyMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDEwcHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAxMHB4KTtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjoga2ljayAwLjZzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWJvdW5jaW5nOmFmdGVyIHtcXG4gIG1hcmdpbi1sZWZ0OiAtMzBweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGtpY2sgMC42cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbi5sb2FkZXItYm91bmNpbmc6YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBraWNrIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBvcGFjaXR5OiAwLjM7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXJlbSk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMga2ljayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgb3BhY2l0eTogMC4zO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFyZW0pO1xcbiAgfVxcbn1cXG4uc2JsLWNpcmMtcmlwcGxlIHtcXG4gIGhlaWdodDogNDhweDtcXG4gIHdpZHRoOiA0OHB4O1xcbiAgY29sb3I6ICM0ODY1OWI7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICB0b3A6IDIwJTtcXG4gIGxlZnQ6IDQwJTtcXG59XFxuXFxuLnNibC1jaXJjLXJpcHBsZTo6YWZ0ZXIsIC5zYmwtY2lyYy1yaXBwbGU6OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGhlaWdodDogMDtcXG4gIHdpZHRoOiAwO1xcbiAgYm9yZGVyOiBpbmhlcml0O1xcbiAgYm9yZGVyOiA1cHggc29saWQ7XFxuICBib3JkZXItcmFkaXVzOiBpbmhlcml0O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgbGVmdDogNDAlO1xcbiAgdG9wOiA0MCU7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY2lyY2xlLXJpcHBsZSAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY2lyY2xlLXJpcHBsZSAxcyBsaW5lYXIgaW5maW5pdGU7XFxufVxcblxcbi5zYmwtY2lyYy1yaXBwbGU6OmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTAuNnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuNnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBjaXJjbGUtcmlwcGxlIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgICB3aWR0aDogMDtcXG4gICAgbGVmdDogMS42cmVtO1xcbiAgICB0b3A6IDEuNnJlbTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBsZWZ0OiAtMXJlbTtcXG4gICAgdG9wOiAtMXJlbTtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBjaXJjbGUtcmlwcGxlIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgICB3aWR0aDogMDtcXG4gICAgbGVmdDogMS42cmVtO1xcbiAgICB0b3A6IDEuNnJlbTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBsZWZ0OiAtMXJlbTtcXG4gICAgdG9wOiAtMXJlbTtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG59LyojIHNvdXJjZU1hcHBpbmdVUkw9c3R5bGUuY3NzLm1hcCAqL1wiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL2Nzcy9zdHlsZS5jc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9iYXNlL19jdXN0b21CYXNlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19mb290ZXIuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX29wZW5pbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3Byb3BlcnRpZXMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3NpbmdsZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fY29uc3RhbnQuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3NlYXJjaC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fbG9hZGVyLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19hbGwtbmV3cy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fc2hhZG93LWJveC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG93bmxvYWRzL2Nzcy1sb2FkZXIuY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG93bmxvYWRzL3NibC1jaXJjLXJpcHBsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUEsZ0JBQWdCO0FDbUJoQjtFQUNJLGtCQUFBO0VBQ0EsWUFBQTtFQUNBLFNBQUE7QURqQko7QUNHSTtFQVdKO0lBV1EsZ0JBQUE7RURyQk47QUFDRjtBQ0lJO0VBS0o7SUFjUSxnQkFBQTtFRG5CTjtBQUNGO0FDcUJJO0VBQ0ksZ0JBQUE7QURuQlI7O0FDdUJBO0VBQ0ksU0FBQTtFQUNBLG1CQUFBO0FEcEJKOztBQ3VCQTtFQUNJLFNBQUE7RUFDQSxtQkFBQTtFQUNBLGVBQUE7QURwQko7O0FDdUJBO0VBQ0ksaUJBQUE7RUFDQSxTQUFBO0FEcEJKOztBQ3VCQTtFQUNJLGlCQUFBO0VBQ0EsU0FBQTtBRHBCSjs7QUN1QkE7RUFDSSxxQkFBQTtFQUNBLGNBQUE7QURwQko7O0FDdUJBO0VBQ0ksZUFBQTtBRHBCSjs7QUNzQkE7RUFDSSxvQkFBQTtBRG5CSjs7QUNxQkE7RUFDSSxVQUFBO0FEbEJKOztBQ29CQTtFQUNJ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Vyw0QkFBQTtFWHM1RHQxVjtBQUNGO0FZdjVEQTtFQUNFLFlBQUE7RUFDQSxXQUFBO0VBQ0EsY0FBQTtFQUNBLGtCQUFBO0VBQ0Esa0JBQUE7RUFDQSxxQkFBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0FaeTVERjs7QVl2NURFO0VBQ0UsV0FBQTtFQUNBLFNBQUE7RUFDQSxRQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0Esc0JBQUE7RUFDQSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxRQUFBO0VBQ0EsbURBQUE7VUFBQSwyQ0FBQTtBWjA1REo7O0FZejVERTtFQUNFLDhCQUFBO1VBQUEsc0JBQUE7QVo0NURKOztBWTE1REE7RUFDRTtJQUNFLFNBQUE7SUFDQSxRQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7RVo2NURGO0VZMzVEQTtJQUNFLFlBQUE7SUFDQSxXQUFBO0lBQ0EsV0FBQTtJQUNBLFVBQUE7SUFDQSxVQUFBO0VaNjVERjtBQUNGOztBWTE2REE7RUFDRTtJQUNFLFNBQUE7SUFDQSxRQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7RVo2NURGO0VZMzVEQTtJQUNFLFlBQUE7SUFDQSxXQUFBO0lBQ0EsV0FBQTtJQUNBLFVBQUE7SUFDQSxVQUFBO0VaNjVERjtBQUNGLENBQUEsb0NBQUFcIixcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCBcIlwiKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vZG90cy5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2RvdHMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcblxuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG5cbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG5cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cblxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG5cbiAgY3NzICs9IG9iai5jc3M7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vQ29udGludWUgdG8gd29yayBvbiBtYWtpbmcgdGhpcyBtb3JlIGVmZmljaWVudCBhbmQgcmVhZGFibGVcclxuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiXHJcbmltcG9ydCBTaGFkb3dCb3ggZnJvbSAnLi9zaGFkb3dCb3gnO1xyXG5jbGFzcyBOZXdzIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgLy8gdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyk7XHJcbiAgICBpZihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxsLW5ld3MtY29udGFpbmVyJykpe1xyXG4gICAgICAgIHRoaXMucmV0dXJuSG9tZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXR1cm4taG9tZScpO1xyXG4gICAgICAgICAgICAgICAgIC8vTGF0ZXIsIGZpbmQgd2F5IHRvIG1ha2UgdGhpcyBub3QgY2F1c2UgZXJyb3JzIG9uIG90aGVyIHBhZ2VzXHJcbiAgICAgICAgdGhpcy5tYWluQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsbC1uZXdzLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIHRoaXMubmV3c1JlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW4tZGlzcGxheScpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdpbmF0aW9uLWhvbGRlcicpXHJcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBMaW5rcztcclxuICAgICAgICB0aGlzLnNlZU1vcmU7XHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc21pc3Mtc2VsZWN0aW9uJyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxUaXRsZSA9IFwiQWxsIE5ld3NcIjtcclxuICAgICAgICB0aGlzLnN0b3JlZFRpdGxlO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250ZW50ID0gW107XHJcbiAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4dGVybmFsQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENhbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm9yaWdpbjtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm1haW5IZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbi1oZWFkZXInKTtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXdzLXNlYXJjaFwiKVxyXG4gICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gJyc7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2VcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMudHlwaW5nVGltZXI7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFJlcG9ydDsgICAgICBcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Z1bGwtZGlzcGxheS1jb250YWluZXInKTsgICAgXHJcbiAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnJlc2V0QWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0LWFsbCcpO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG9nZ2xlLW9wdGlvbnMnKTtcclxuXHJcbiAgICAgICAgLy9BZnRlciBnZXQgZXZlcnl0aGluZyB3b3JraW5nLCBwdXQgdGhlIHNldHRpbmcgaW4gaGVyZSwgcmFyZXIgdGhhbiBqdXN0IGEgcmVmXHJcbiAgICAgICAgLy9udm0uIE5lZWQgdG8gZG8gaXQgbm93XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5yZW9yZGVyQnlEYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI29yZGVyLWJ5LWRhdGUnKTtcclxuICAgICAgICB0aGlzLnJlb3JkZXJCeUFscGhhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI29yZGVyLWJ5LWFscGhhJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZnVsbFdvcmRTd2l0Y2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZnVsbC13b3JkLW9ubHknKTtcclxuXHJcbiAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd29yZC1zdGFydC1vbmx5Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZVN3aXRjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXNlLXNlbnNpdGl2ZScpO1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVUaXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLXRpdGxlJyk7XHJcbiAgICAgICAgdGhpcy5pbmNsdWRlRGVzY3JpcHRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1kZXNjcmlwdGlvbicpO1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVQcm9wZXJ0eVVwZGF0ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1wcm9wZXJ0eS11cGRhdGVzJyk7XHJcbiAgICAgICAgdGhpcy5pbmNsdWRlR2VuZXJhbE5ld3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1nZW5lcmFsLW5ld3MnKTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnYWJsZVNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBkYXRlT3JkZXI6e1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnb3JkZXItYnktZGF0ZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdkZXNjJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWxwaGFPcmRlcjp7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdvcmRlci1ieS1hbHBoYScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdkZXNjJyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGluY2x1ZGVUaXRsZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS10aXRsZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5jbHVkZURlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdpbmNsdWRlLWRlc2NyaXB0aW9uJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1cGRhdGU6IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ2luY2x1ZGUtcHJvcGVydHktdXBkYXRlcycsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmV3czoge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS1nZW5lcmFsLW5ld3MnLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnaW5jbHVkZScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bGxXb3JkOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdmdWxsLXdvcmQtb25seScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdmdWxsLXdvcmQtb25seScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiBmYWxzZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3b3JkU3RhcnRPbmx5OiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICd3b3JkLXN0YXJ0LW9ubHknLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnd29yZC1zdGFydC1vbmx5JyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGlzQ2FzZVNlbnNpdGl2ZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnY2FzZS1zZW5zaXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnY2FzZS1zZW5zaXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGlzLmZpbHRlckJ5ZGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWx0ZXItYnktZGF0ZScpXHJcbiAgICAgICAgLy8gdGhpcy5pc0RhdGVGaWx0ZXJPbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGF0ZS1maWx0ZXJzJyk7XHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucyA9IHRoaXMuZGF0ZUZpbHRlcnMucXVlcnlTZWxlY3RvckFsbCgnc2VsZWN0Jyk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vcmFuZ2UgbWFrZXMgdGhlIHByZXZpb3VzIHR3byBudWxsLCBlZmZlY3RpdmVseSBjYW5jZWxpbmcgdGhleSBvdXQgYW5kIHNodXR0aW5nIG9mZiB0aGVpciBpZiBsb2dpY1xyXG4gICAgICAgIC8vYnV0dG9uIHdpbGwgbWFrZSBvcHRpb25zIGFwcGVhciBhbmQgbWFrZSBpc0ZpbHRlck9uID0gdHJ1ZSwgYnV0IGlmIG5vIG9wdGlvbiBpcyBzZWxlY3RlZCwgdGhleSBkaXNzYXBlYXIgYW5kIGZhbHNlIGlzIHJlc3RvcmVkIFxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlclNldFVwID0ge1xyXG4gICAgICAgICAgICBtb250aDogbnVsbCxcclxuICAgICAgICAgICAgeWVhcjogbnVsbCxcclxuICAgICAgICAgICAgLy8gcmFuZ2U6IHtcclxuICAgICAgICAgICAgLy8gICAgIHN0YXJ0OiBudWxsLFxyXG4gICAgICAgICAgICAvLyAgICAgZW5kOiBudWxsXHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMueWVhck9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnkteWVhcicpO1xyXG4gICAgICAgIHRoaXMubW9udGhPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2J5LW1vbnRoJyk7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxpc3QgPSB7fVxyXG4gICAgICAgIHRoaXMubW9udGhzID0gW107XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5ldmVudHModGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBldmVudHModGFyZ2V0KXtcclxuICAgICAgICBcclxuICAgICAgICAvLyBjb25zdCBkZWZhdWx0U3dpdGNoU2V0dGluZ3MgPSB7Li4udGhpcy50b2dnYWJsZVNldHRpbmdzLCBhbHBoYU9yZGVyOiB7Li4udGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXJ9fTtcclxuICAgICAgICBsZXQgZGVmYXVsdFN3aXRjaFNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MpKVxyXG5cclxuICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3B1bGF0ZURhdGVGaWx0ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRBbGwub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlVGV4dChkZWZhdWx0U3dpdGNoU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnRvZ2dhYmxlU2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRTd2l0Y2hTZXR0aW5ncykpO1xyXG4gICAgICAgICAgICB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3M7IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyLCB0YXJnZXQuZGF0ZU9yZGVyKVxyXG4gICAgICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhkZWZhdWx0U3dpdGNoU2V0dGluZ3MuaXNDYXNlU2Vuc2l0aXZlKVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5pbml0aWFsVGl0bGV9YDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLnZhbHVlID0gJydcclxuICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMudmFsdWUgPSAnJ1xyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHllYXIub3B0aW9uc1t5ZWFyLnNlbGVjdGVkSW5kZXhdLnZhbHVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2Rlc2MgZGF0ZSBub3Qgd29ya2luZ1xyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5RGF0ZS5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50b2dnYWJsZVNldHRpbmdzLmRhdGVPcmRlcilcclxuICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuaXNPbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRhcmdldC5hbHBoYU9yZGVyLmRpcmVjdGl2ZSA9ICdkZXNjJ1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5pc09uID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPT09ICdkZXNjJyl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZGF0ZU9yZGVyLmRpcmVjdGl2ZSA9ICdhc2MnXHJcbiAgICAgICAgICAgIH1lbHNlKFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICB9O1xyXG4vL2luaWF0ZSB0b2dnbGUgdGhyb3VnaCB0aGVzZSwgdXNpbmcgbGV0cyB0byBoYW5kbGUgYm90aCBjaGFuZ2VzIGJhc2VkIG9uIHRoZSAuZGlyZWN0aXZlIHZhbHVlLCBcclxuLy9hbmQgbWF5YmUgZXZlbiBzZXR0aW5nIGludGlhbCBoaWRpbmcgdGhpcyB3YXkgdG9vIFxyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5QWxwaGEub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuaXNPbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuZGlyZWN0aXZlID0gJ2Rlc2MnXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5pc09uID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID09PSAnZGVzYycpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID0gJ2FzYydcclxuICAgICAgICAgICAgfWVsc2UoXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVQcm9wZXJ0eVVwZGF0ZXMub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC51cGRhdGUuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudXBkYXRlLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudXBkYXRlLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmNsdWRlR2VuZXJhbE5ld3Mub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5uZXdzLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm5ld3MuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5uZXdzLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmZ1bGxXb3JkU3dpdGNoLm9uY2xpY2sgPSAoKT0+e1xyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZ1bGxXb3JkLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMud29yZFNlYXJjaFBvc2l0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1lbHNleyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZ1bGxXb3JkLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24uY2xhc3NMaXN0LmFkZCgnaW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHdvcmQgc3RhcnQgb25seSBpczogJHt0YXJnZXQud29yZFN0YXJ0T25seS5pc09ufWApXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmdWxsIHdvcmQgb25seSBpczogJHt0YXJnZXQuZnVsbFdvcmQuaXNPbn1gKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24ub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgd29yZCBzdGFydCBvbmx5IGlzOiAke3RhcmdldC53b3JkU3RhcnRPbmx5LmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZVN3aXRjaC5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBjYXNlIHNlbnNpdGl2ZSBpczogJHt0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVRpdGxlLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVEZXNjcmlwdGlvbi5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmluY2x1ZGVEZXNjcmlwdGlvbi5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5pbmNsdWRlUmVsYXRpb25zaGlwLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vICAgICBpZih0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyl7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyA9IGZhbHNlO1xyXG4gICAgICAgIC8vICAgICB9ZWxzZXtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuc2VhcmNoYWJsZUZpZWxkcy5yZWxhdGlvbnNoaXBzID0gdHJ1ZTtcclxuICAgICAgICAvLyAgICAgfSAgXHJcbiAgICAgICAgLy8gfTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5maWx0ZXJCeWRhdGUub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgLy8gICAgIHRoaXMuZGF0ZUZpbHRlcnMuY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuaXNEYXRlRmlsdGVyT24gPSB0cnVlO1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh0aGlzLmlzRGF0ZUZpbHRlck9uKVxyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucy5mb3JFYWNoKGUgPT57XHJcbiAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKG9wdGlvbik9PntcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50TW9udGggPSB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihlLmlkID09PSAnYnkteWVhcicpe1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnllYXJPcHRpb25zLnZhbHVlICE9PSAnJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMueWVhckxpc3RbdGhpcy55ZWFyT3B0aW9ucy52YWx1ZV0ubWFwKG1vbnRoPT4gYDxvcHRpb24gdmFsdWU9XCIke21vbnRofVwiPiR7bW9udGh9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLm1vbnRocy5tYXAobW9udGg9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7bW9udGh9XCI+JHttb250aH08L29wdGlvbj5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5tb250aE9wdGlvbnMucXVlcnlTZWxlY3Rvcihgb3B0aW9uW3ZhbHVlPScke2N1cnJlbnRNb250aH0nXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLnZhbHVlID0gY3VycmVudE1vbnRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZSA9ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBvcHRpb24udGFyZ2V0LmlkLnNsaWNlKDMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlRmlsdGVyU2V0VXBbdmFsdWVdID0gb3B0aW9uLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZGF0ZUZpbHRlclNldFVwKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoKSA9PiB0aGlzLnR5cGluZ0xvZ2ljKCkpXHJcblxyXG4gICAgICAgIHRoaXMuZGlzbWlzc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpKVxyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZVRleHQodGFyZ2V0KTtcclxuICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMuZm9yRWFjaChlPT57ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gdGhpcy50b2dnbGVUZXh0KHRhcmdldCkpfSlcclxuICAgIH1cclxuLy9BZGQgJ2lzT24nIHRvIGV4Y2x1ZGVzLCB3aXRoIGluY2x1ZGUgaGF2aW5nIGNsYXNzIG9mZiBhbmQgZXhjbHVkZSBoYXZpbmcgY2xhc3Mgb2YgKnZhbHVlP1xyXG4gICAgdG9nZ2xlVGV4dCh0YXJnZXQpe1xyXG4gICAgICAgIGxldCBmaWx0ZXJLZXlzID0gT2JqZWN0LmtleXModGFyZ2V0KVxyXG4gICAgICAgIGZpbHRlcktleXMuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYCMke3RhcmdldFtlXS5yZWZ9IHNwYW5gKS5mb3JFYWNoKGk9PmkuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpXHJcbiAgICAgICAgICAgIGlmKHRhcmdldFtlXS5pc09uKXtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RhcmdldFtlXS5yZWZ9IC4ke3RhcmdldFtlXS5kaXJlY3RpdmV9YCkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGFyZ2V0W2VdLnJlZn0gLm9mZmApLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICAvL1JlZG8gcGFnaW5hdGlvbiwgYnV0IHdpbGwgbmVlZCB0byBoYXZlIHNldHVwIHdvcmsgZm9yIGdldHRpbmcgcmlkIHRocm91Z2ggZWFjaCByZWxvYWRcclxuICAgIFxyXG4gICAgLy9jaGVjayBwYWdpbmF0aW9uIHRocm91Z2hvdXQgZWFjaCBhZGRcclxuXHJcbiAgICAvL2VzdGFibGlzaCBkZWZhdWx0IHNlYXJjaCBiZWhhdmlvci4gQXMgaW4sIGRvZXMgaXQgbG9vayBhdCB0aXRsZSwgYmlvLCBcclxuICAgIC8vYW5kIGNhcHRpb24gcGFydGlhbHMgYXQgdGhlIHN0YXJ0PyhpbiBpZiBzdGF0ZW1lbnRzIHVzZSBjb250YWlucyBvbiBzdHJpbmdzPylcclxuICAgIC8vaW4gZ2F0aGVyTmV3cygpIGhhdmUgaWYgc3RhdGVtZW50cyB0aGF0IHdvcmsgdGhyb3VnaCB0aGUgZGF0YSBhZnRlciBpdCdzIGdvdHRlbiwgYmVmb3JlIHRoZSBpbnNlcnRpb25zXHJcbiAgICAvL1doZW4gY2xpY2sgb24gbmV3cywgdXNlIGJpZ2dlciBwaWN0dXJlLiBBbHNvIHB1dCBpbiBkdW1teSwgXHJcbiAgICAvL3JlbGF0ZWQgc2l0ZXMgb24gdGhlIHJpZ2h0LCBhbmQgbWF5YmUgZXZlbiByZWxhdGVkIG1lbWJlcnMgYW5kIHByb3BlcnRpZXModGl0bGUgb3ZlciBhbmQgd2l0aCBsaW5rcylcclxuICAgIC8vQWxzbyBsaXN0IG90aGVyIG5ld3MgcmVsYXRlZCB0byBpdCwgbGlrZSBpZiBhbGwgYWJvdXQgc2FtZSBidWlsZGluZyBvciBtZW1iZXIoY2FuIHVzZSBjbW1vbiByZWxhdGlvbiBmb3IgdGhhdCBidXQgXHJcbiAgICAvL25lZWQgdG8gYWRkIGEgbmV3IGZpZWxkIGZvciB0eXBlcyBvZiByZWxhdGlvbnNoaXBzKVxyXG4gICAgLy9HaXZlIHRpdGxlcyB0byBvdGhlciBzZWN0aW9ucywgd2l0aCB0aGUgcmlnaHQgYmVpbmcgZGl2aWRlZCBpbnRvIHJlbGF0ZWQgbGlua3MgYW5kIHNlYXJjaCBtb2RpZmljYXRpb25zXHJcbiAgICAvL1JlbWVtYmVyIGZ1bmN0aW9uYWxpdHkgZm9yIG90aGVyIHBhcnRzIGxpbmtpbmcgdG8gaGVyZVxyXG4gICAgdHlwaW5nTG9naWMoKSB7XHJcbiAgICAgICAgLy9BdXRvbWF0aWNhbGx5IGRpc21pc3Mgc2luZ2xlIG9yIGhhdmUgdGhpcyBhbmQgb3RoZXIgYnV0dG9ucyBmcm96ZW4gYW5kL29yIGhpZGRlbiB1bnRpbCBkaXNtaXNzZWRcclxuICAgICAgICAvL0xlYW5pbmcgdG93YXJkcyB0aGUgbGF0dGVyLCBhcyBmYXIgbGVzcyBjb21wbGljYXRlZFxyXG4gICAgICAgIGlmICh0aGlzLm5ld3NTZWFyY2gudmFsdWUgIT09IHRoaXMucHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudHlwaW5nVGltZXIpXHJcbiAgICBcclxuICAgICAgICAgIGlmICh0aGlzLm5ld3NTZWFyY2gudmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzU3Bpbm5lclZpc2libGUpIHtcclxuICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9IHRoaXMubmV3c1NlYXJjaC52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke3RoaXMubmV3c0RlbGl2ZXJ5fWA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gMDtcclxuICAgICAgICAgICAgdGhpcy50eXBpbmdUaW1lciA9IHNldFRpbWVvdXQodGhpcy5nYXRoZXJOZXdzLmJpbmQodGhpcyksIDc1MCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgJHt0aGlzLmluaXRpYWxUaXRsZX1gO1xyXG4gICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5uZXdzU2VhcmNoLnZhbHVlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzeW5jIHBvcHVsYXRlRGF0ZUZpbHRlcnMoKXtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIC8vSXMgaXQgYmV0dGVyIGp1c3QgdG8gdXNlIHNlcGVyYXRlIHVybCByb3V0ZXM/IFxyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvYWxsLW5ld3M/bmV3cycpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBjb25zdCBzcGxpdERhdGVzID0gW107XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHllYXJzID0gW107XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0cy51cGRhdGVzQW5kTmV3cy5mb3JFYWNoKG5ld3M9PntcclxuICAgICAgICAgICAgICAgIGlmICghZGF0ZXMuaW5jbHVkZXMobmV3IERhdGUobmV3cy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLXVzJywge21vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJ30pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVzLnB1c2gobmV3IERhdGUobmV3cy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLXVzJywge21vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJ30pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZGF0ZXMpXHJcblxyXG4gICAgICAgICAgICBkYXRlcy5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgIHNwbGl0RGF0ZXMucHVzaChlLnNwbGl0KCcgJykpXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzcGxpdERhdGVzKVxyXG5cclxuICAgICAgICAgICAgc3BsaXREYXRlcy5mb3JFYWNoKGRhdGU9PntcclxuXHJcbiAgICAgICAgICAgICAgICBpZighdGhpcy5tb250aHMuaW5jbHVkZXMoZGF0ZVswXSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhzLnB1c2goZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIGlmKCF5ZWFycy5pbmNsdWRlcyhkYXRlWzFdKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8geWVhcnMucHVzaChkYXRlWzFdKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueWVhckxpc3RbZGF0ZVsxXV0gPSBbXTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zdCB5ZWFycyA9IE9iamVjdC5rZXlzKHRoaXMueWVhckxpc3QpXHJcblxyXG4gICAgICAgICAgICB5ZWFycy5mb3JFYWNoKHllYXI9PntcclxuICAgICAgICAgICAgICAgIHNwbGl0RGF0ZXMuZm9yRWFjaChkYXRlPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoeWVhciA9PT0gZGF0ZVsxXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueWVhckxpc3RbeWVhcl0ucHVzaChkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy55ZWFyTGlzdClcclxuXHJcbiAgICAgICAgICAgIGxldCBhbGxNb250aHMgPSBbJ0phbnVhcnknLCdGZWJydWFyeScsJ01hcmNoJywgJ0FwcmlsJywnTWF5JywnSnVuZScsJ0p1bHknLCdBdWd1c3QnLCdTZXB0ZW1iZXInLCdPY3RvYmVyJywnTm92ZW1iZXInLCdEZWNlbWJlciddO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb250aHMuc29ydChmdW5jdGlvbihhLGIpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFsbE1vbnRocy5pbmRleE9mKGEpID4gYWxsTW9udGhzLmluZGV4T2YoYik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB5ZWFycy5zb3J0KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Bbnk8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICR7eWVhcnMubWFwKHllYXI9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7eWVhcn1cIj4ke3llYXJ9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAke3RoaXMubW9udGhzLm1hcChtb250aD0+IGA8b3B0aW9uIHZhbHVlPVwiJHttb250aH1cIj4ke21vbnRofTwvb3B0aW9uPmApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICBgO1xyXG5cclxuICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgIGFzeW5jIGdhdGhlck5ld3MoKXtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy50b2dnYWJsZVNldHRpbmdzXHJcbiAgICAgICAgLy9QdXQgcmVzdWx0cyBpbiB2YXIgY29weSwganVzdCBsaWtlIGluIHRoZSBzaGFkb3dib3hcclxuICAgIFxyXG4gICAgICAgIC8vTWF5YmUsIHRvIHNvbHZlIGNlcnRhaW4gaXNzdWVzIG9mICd1bmRlZmluZWQnLCBhbGxvdyBwYWdpbmF0aW9uIGV2ZW4gd2hlbiBvbmx5IDEgcGFnZSwgYXMgSSB0aGluayBuZXh0IGFuZCBwcmV2IHdpbGwgYmUgaGlkZGVuIFxyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgLy9JcyBpdCBiZXR0ZXIganVzdCB0byB1c2Ugc2VwZXJhdGUgdXJsIHJvdXRlcz8gXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9hbGwtbmV3cz9uZXdzPScgKyB0aGlzLm5ld3NEZWxpdmVyeSk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTsgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXN1bHRzKVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAvL21heWJlIGFsbG93aW5nIGEgb25lIG9uIHRoZSBwYWdpbmF0aW9uIHdvdWxkIHNvbHZlIHRoZSBlcnJvcnNcclxuXHJcbiAgICAgICAgICAgIC8vRm9yIGZpZWxkIGV4Y2x1c2lvbiwgY291bGQgaGF2ZSBjb2RlIHByb2Nlc3NlZCB3aXRoIG1hdGNoZXMoKSBvciBpbmRleE9mIG9uIHRoZSBmaWVsZHMgdGhhdCBhcmVuJ3QgYmFubmVkXHJcbiAgICAgICAgICAgIC8vVGFrZSBvdXQgdGhvc2UgdGhhdCBwcm9kdWNlIGEgZmFsc2UgcmVzdWx0XHJcblxyXG4gICAgICAgICAgICBsZXQgYWxsTmV3cyA9IHJlc3VsdHMudXBkYXRlc0FuZE5ld3M7XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVsYXRlZFBvc3RzID0gcmVzdWx0cy5wcm9wZXJ0aWVzQW5kTWVtYmVycztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3N0UmVsYXRpb25zaGlwcyA9IFtdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYWxsTmV3cy5tYXAobmV3cz0+e1xyXG4gICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocG9zdD0+e1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGAke25ld3MudGl0bGV9OiAke3Bvc3QuSUR9YClcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IHJlbGF0ZWRQb3N0cy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHBvc3QuSUQgPT09IHJlbGF0ZWRQb3N0c1tpXS5pZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UmVsYXRpb25zaGlwcy5wdXNoKHJlbGF0ZWRQb3N0c1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhwb3N0UmVsYXRpb25zaGlwcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMgPSBwb3N0UmVsYXRpb25zaGlwcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBwb3N0UmVsYXRpb25zaGlwcyA9IFtdO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG4gPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuICAgICAgICAgICAgaWYobi5pbmRleE9mKCcjJykgPiAtMSl7XHJcbiAgICAgICAgICAgICAgICBuID0gbi5zcGxpdCgvWy8tXSsvKVxyXG4gICAgICAgICAgICAgICAgaWYobls0XS5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5bNV0uaW5kZXhPZignbmV3cycpID4gLTEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnNpbmdsZUNhbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV3c1NlYXJjaC52YWx1ZSA9IGAke25bNF19YDsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gYCR7bls0XX1gOyBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcmlnaW4gPSBuWzZdOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXBvcnQgPSBuWzRdLnNsaWNlKDEpOyBcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoJycsICcnLCBgLyR7blsyXX0tJHtuWzNdfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGhpc3RvcnkuZ28oLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXh0ZXJuYWxDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG5ld3NUeXBlcyA9IFsnbmV3cycsICd1cGRhdGUnXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBjb25zdCBuZXdzT3V0cHV0ID0gMjtcclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBuZXdzUGFnZSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgbmV3c1BhZ2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50U2hvd247XHJcblxyXG4gICAgICAgICAgICAvLyAvL2lmIHN5bWJvbCBlbnRlcmVkIGFzIG9ubHkgdGhpbmcsIGl0J2xsIG15IGxvZ2ljLCBzb21ldGltZXMuIFJlbWVkeSB0aGlzLlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoIXRoaXMuZnVsbERpc3BsYXkgfHwgdGhpcy5iYWNrZ3JvdW5kQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAvL0RvIHN0YXJ0IHZzIGFueXdoZXJlIGluIHRoZSB3b3JkXHJcbiAgICAgICAgICAgICAgICAvL1N0YXJ0IG9ubHkgaXMgc3RhbmRhcmQgYW5kIGF1dG8gdHJ1ZSB3aGVuIHdob2xlIHdvcmQgaXMgdHVybmVkIG9uKD8pIG9yIHNpbXBseSBidXJpZWQgaW4gcGFydGlhbCBpZlxyXG4gICAgICAgICAgICAgICAgLy9pdCBzaG91bGQgYXQgbGVhc3QgYmUgaW5hY2Vzc2libGUgb24gdGhlIGZyb250ZW5kIHdpdGggdmlzdWFsIGN1ZVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRG8gYSBtb3JlIHRob3JvdWdoIHRlc3Qgb2YgdGhvc2UgbGF0ZXIgYWZ0ZXIgcmVsIGFuZCAnZGlzbGF5LXF1YWxpdHknIGFydGljbGVzIGNyZWF0ZWQgXHJcblxyXG4gICAgICAgICAgICAgICAgLy9EbyBiYXNpYyBtb250aCBhbmQgeWVhciBhbmQgcmFuZ2UgcGlja2luZywgYmVmb3JlIGxvb2tpbmcgaW50byBwb3AtdXAgYW5kIGZpZ3VyaW5nIG91dCBob3cgdG8gZ2V0IGluZm8gZnJvbSB3aGF0IGlzIHNlbGVjdGVkIG9uIGl0XHJcbiAgICAgICAgICAgICAgICBsZXQgZnVsbExpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCB0aXRsZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCBkZXNjID0gW107XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVsID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5uZXdzRGVsaXZlcnkgIT09ICcnKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVkJylcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5uZXdzRGVsaXZlcnkuc3RhcnRzV2l0aCgnIycpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlcXVlc3RlZElkID0gdGhpcy5uZXdzRGVsaXZlcnkucmVwbGFjZSgnIycsICcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXNzb2NpYXRlZE5ld3MgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MuZm9yRWFjaChuZXdzID0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocj0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHIuaWQgPT09IHBhcnNlSW50KHJlcXVlc3RlZElkKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc29jaWF0ZWROZXdzLnB1c2gobmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSByLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhc3NvY2lhdGVkTmV3cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gYXNzb2NpYXRlZE5ld3M7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmV4dGVybmFsQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm9yaWdpbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXh0ZXJuYWxDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLm5ld3NTZWFyY2gudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmV0dXJuSG9tZS5ocmVmPWAke3NpdGVEYXRhLnJvb3RfdXJsfS8jJHt0aGlzLm9yaWdpbn1Db250YWluZXJgOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgU2hvd2luZyBSZXN1bHRzIGZvcjogJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3JlZFRpdGxlID0gYFNob3dpbmcgUmVzdWx0cyBmb3I6ICR7bmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlcyA9IGFsbE5ld3MuZmlsdGVyKChuZXdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdzLnRpdGxlLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpLmluY2x1ZGVzKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZighdGFyZ2V0LmZ1bGxXb3JkLmlzT24gJiYgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3M9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld3NTcGxpdCA9IG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGUgb2YgbmV3c1NwbGl0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlLnN0YXJ0c1dpdGgodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMucHVzaChuZXdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIG5ld3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiBudWxsOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMgPSBhbGxOZXdzLmZpbHRlcihuZXdzPT4gbmV3cy50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzID0gdGl0bGVzLmZpbHRlcihuZXdzPT4gbmV3cy50aXRsZS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5KSAhPT0gLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZURlc2NyaXB0aW9uLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MgPSBhbGxOZXdzLmZpbHRlcigobmV3cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3cy5mdWxsRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIikuaW5jbHVkZXModGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lmIGZpcmVkIScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZighdGFyZ2V0LmZ1bGxXb3JkLmlzT24gJiYgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3M9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdzU3BsaXQgPSBuZXdzLmZ1bGxEZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgZSBvZiBuZXdzU3BsaXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUuc3RhcnRzV2l0aCh0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MucHVzaChuZXdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjID0gYWxsTmV3cy5maWx0ZXIobmV3cz0+IG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MgPSBkZXNjLmZpbHRlcihuZXdzPT4gbmV3cy5mdWxsRGVzY3JpcHRpb24uaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeSkgIT09IC0xKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlYXJjaGVkTmV3cyA9IGZ1bGxMaXN0LmNvbmNhdCh0aXRsZXMsIGRlc2MsIHJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gW107IFxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaGVkTmV3cy5mb3JFYWNoKChuZXdzKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGxOZXdzLmluY2x1ZGVzKG5ld3MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vRGF0ZXMgYmVsb25nIHRvIGEgc2VwZXJhdGUgbG9naWMgdGhyZWFkLCBhbmQgYXMgc3VjaCBzaG91bGQgbm95dCBiZSBsaW5rZWQgdG8gdHlwaW5nLiBUaGV5IGFlIGNsb3NlciB0byB0aGUgc29ydHMgaW4gdGhhdCBcclxuICAgICAgICAgICAgICAgIC8vdGhleSBjYW4gYmUgYWZ0ZXIgdGhlIHR5cGluZywgYmVmb3JlLCBvciBldmVuIGJlIHVzZWQgd2l0aG91dCBpdFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvL0FmdGVyIEkgZmluaXNoIHRoZSBjb3JlIGxvZ2ljLCBhZGQgaW4gZnVuY3Rpb25hbGl0eSB0aGF0IGhhcyBhbnkgYXMgb3B0aW9uIGZvciAneWVhcicsIHdpdGggc2VsZWN0aW9uIG9mIHNwZWNpZmljIFxyXG4gICAgICAgICAgICAgICAgLy9saW1pdGluZyB0aGUgJ21vbnRoJyB2YWx1ZXMgYW5kIHNlbGVjdGluZyB0aGUgZWFybGllc3Qgb25lIGFzIHRoZSBkZWZhdWx0IGZpbHRlciBmb3IgJ21vbnRoJyBvciAnYW55J1xyXG4gICAgICAgICAgICAgICAgLy9GaWx0ZXIgYnkgZGF0ZSB3aWxsIGJlIGEgYm9vbGVhbiB3aXRoIGRyb3Bkb3duIGRlZmF1bHRzIG9mIGFueSBmb3IgYm90aFxyXG5cclxuICAgICAgICAgICAgICAgICBsZXQgZGF0ZUZpbHRlcnNTZXQgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGVGaWx0ZXJTZXRVcCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgY29uc29sZS5sb2coYGNvbnRlbnRMb2FkZWQgPSAke3RoaXMuY29udGVudExvYWRlZH1gKVxyXG5cclxuICAgICAgICAgICAgICAgICBmb3IobGV0IGZpbHRlciBvZiBkYXRlRmlsdGVyc1NldCl7XHJcbiAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZGF0ZUZpbHRlclNldFVwW2ZpbHRlcl0peyAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MgPSBhbGxOZXdzLmZpbHRlcigobmV3cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ldyBEYXRlKG5ld3MuZGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi11cycsIHttb250aDogJ2xvbmcnLCB5ZWFyOiAnbnVtZXJpYyd9KS5pbmNsdWRlcyh0aGlzLmRhdGVGaWx0ZXJTZXRVcFtmaWx0ZXJdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICB9XHJcbiAgIFxyXG4gICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5kYXRlT3JkZXIuZGlyZWN0aXZlID09PSAnYXNjJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3Muc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYS5kYXRlKSAtIG5ldyBEYXRlKGIuZGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGEuZGF0ZSkgLSBuZXcgRGF0ZShiLmRhdGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5hbHBoYU9yZGVyLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbE5ld3Muc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvY2FsZUNvbXBhcmUgZG9lcyBhIHN0cmluZyBjb21wYXJpc29uIHRoYXQgcmV0dXJucyAtMSwgMCwgb3IgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS50aXRsZS5sb2NhbGVDb21wYXJlKGIudGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXIuZGlyZWN0aXZlID09PSAnZGVzYycpeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5ld3NUeXBlcy5mb3JFYWNoKCh0eXBlKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldFt0eXBlXS5pc09uICE9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cyA9IGFsbE5ld3MuZmlsdGVyKG5ld3M9PiBuZXdzLnBvc3RUeXBlICE9PSB0eXBlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgaWYoYWxsTmV3cy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGFsbE5ld3MubGVuZ3RoIDw9IG5ld3NPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlcy5jb25jYXQoYWxsTmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoYWxsTmV3cy5sZW5ndGggPiBuZXdzT3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gbmV3c091dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IGFsbE5ld3Muc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhbGxOZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UgPSBhbGxOZXdzLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChuZXdzUGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihuZXdzUGFnZXMubGVuZ3RoKXsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFNob3duID0gbmV3c1BhZ2VzW3RoaXMuY3VycmVudFBhZ2VzXTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsaXZlck5ld3MoY29udGVudFNob3duKVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jb250ZW50TG9hZGVkICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c2ApKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QW5kUHJldmlvdXMoKTtcclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmKGNvbnRlbnRTaG93bi5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydFBhZ2luYXRpb24obmV3c1BhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TmV4dEFjdGl2YXRpb24oKTsgXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvL1RoaXMgbmVlZHMgdG8gY2hhbmdlIHRvXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMuZm9yRWFjaChvID0+IHtvLmNsYXNzTGlzdC5hZGQoJ2luYWN0aXZlJyk7fSk7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucy5mb3JFYWNoKGYgPT4ge2YuZGlzYWJsZWQgPSB0cnVlfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGVudCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgbmV3cyBvZiBhbGxOZXdzKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5jbGFzc0xpc3QuYWRkKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuY2xhc3NMaXN0LmFkZCgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc21pc3NCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zZXBlcmF0ZSB0aGUgaW5zZXJ0aW9ucyB0byBhIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Vc2UgaWYgdG8gdmFyeSBpZiBsb29rIGZvciBuZXdzIHdpdGggdGhhdCBvciBvbmVzIHdpdGggcmVsYXRpb25zaGlwIHRoYXQgaGFzIHRoYXRcclxuICAgICAgICAgICAgICAgICAgICAvL21ha2UgYXJyYXkgb2YgZWFjaCBuZXdzJ3MgcmVsYXRpb25zaGlwc1tnaXZlIHRoZSBmaXJzdCBwb3N0IDIgZm9yIHRlc3Rpbmcgb2YgaWYgY2hlY2tpbmcgYXJheSBwcm9wZXJseV1cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmZ1bGxEaXNwbGF5KXsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtuZXdzLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChyPT50aGlzLmNhbGxlZElkcy5wdXNoKHIuaWQpKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jYWxsZWRJZHMuaW5jbHVkZXMocGFyc2VJbnQodGhpcy5jdXJyZW50UmVwb3J0KSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGVudC5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7bmV3cy50aXRsZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmKHRoaXMuc2luZ2xlQ2FsbCl7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGl2ZXJOZXdzKHRoaXMuZnVsbERpc3BsYXlDb250ZW50LCB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZXh0ZXJuYWxDYWxsKVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5mdWxsRGlzcGxheSAmJiB0aGlzLmV4dGVybmFsQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7ICBcclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWxpdmVyTmV3cyhjb250ZW50U2hvd24sIGRlc3RpbmF0aW9uID0gdGhpcy5uZXdzUmVjaWV2ZXIpe1xyXG4gICAgICAgIGRlc3RpbmF0aW9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgJHtjb250ZW50U2hvd24ubGVuZ3RoID8gYDx1bD5gICA6ICdObyBhcnRpY2xlcyBtYXRjaCB5b3VyIGNyaXRlcmlhJ31cclxuICAgICAgICAgICAgJHshY29udGVudFNob3duLmxlbmd0aCA/IGA8YnV0dG9uIGlkPVwic2VhcmNoUmVzZXRcIj5QbGVhc2UgdHJ5IGEgZGlmZmVyZW50IHF1ZXJ5IG9yIGNoYW5nZSB5b3VyIGZpbHRlcnMuPC9idXR0b24+YCAgOiAnJ31cclxuICAgICAgICAgICAgICAgICR7Y29udGVudFNob3duLm1hcChyZXBvcnQgPT4gYFxyXG4gICAgICAgICAgICAgICAgPGxpPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzXCI+ICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGg0PiR7cmVwb3J0LnRpdGxlfTwvaDQ+YCA6ICcnfVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXBvcnQuY2FwdGlvbi5sZW5ndGggPj0gMSA/IHJlcG9ydC5jYXB0aW9uICsgJyAtICcgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cmVwb3J0LmRhdGV9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD4ke3JlcG9ydC5yZWxhdGlvbnNoaXBzLm1hcChyZWxhdGlvbnNoaXAgPT4gYDxzcGFuIGNsYXNzPVwibmFtZVwiPiR7cmVsYXRpb25zaGlwLnRpdGxlfTwvc3Bhbj4gICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGEgY2xhc3M9XCJyZWxhdGlvbnNoaXAtbGlua1wiIGRhdGEtcmVsYXRlZD1cIiR7cmVsYXRpb25zaGlwLmlkfVwiPihBc3NvY2lhdGVkIE5ld3MpPC9hPiBgIDogYDxhIGNsYXNzPVwicmVsYXRpb25zaGlwLWxpbmsgZGlzbWlzc2VkXCIgZGF0YS1yZWxhdGVkPVwiJHtyZWxhdGlvbnNoaXAuaWR9XCI+KEFzc29jaWF0ZWQgTmV3cyk8L2E+IGB9PGEgY2xhc3M9XCJzaW5nbGUtbGlua1wiIGhyZWY9XCIke3JlbGF0aW9uc2hpcC5wZXJtYWxpbmt9XCI+KFZpZXcgUHJvZmlsZSk8L2E+YCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtY2FyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBkYXRhLWlkPVwiJHtyZXBvcnQuaWR9XCIgZGF0YS1wb3N0PVwiJHtyZXBvcnQucG9zdFR5cGVQbHVyYWx9XCIgc3JjPVwiJHtyZXBvcnQuZ2FsbGVyeVswXS5zZWxlY3RJbWFnZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPHA+JHtyZXBvcnQuZGVzY3JpcHRpb259PC9wPmAgOiBgPHA+JHtyZXBvcnQuZnVsbERlc2NyaXB0aW9ufTwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkeyF0aGlzLmZ1bGxEaXNwbGF5ID8gYDxidXR0b24gaWQ9XCIke3JlcG9ydC5pZH1cIiBjbGFzcz1cInNlZS1tb3JlLWxpbmtcIj5TZWUgTW9yZTogJHtyZXBvcnQuaWR9IDwvYnV0dG9uPmAgOiBgPGJ1dHRvbiBpZD1cIiR7cmVwb3J0LmlkfVwiIGNsYXNzPVwic2VlLW1vcmUtbGluayBkaXNtaXNzZWRcIj5SZWFkIG1vcmU6ICR7cmVwb3J0LmlkfSA8L2J1dHRvbj5gfSBcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvbGk+IFxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICR7Y29udGVudFNob3duLmxlbmd0aCA/IGA8L3VsPmAgIDogJyd9XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZnVsbERpc3BsYXkpe1xyXG4gICAgICAgICAgICB0aGlzLnNlZU1vcmVGdW5jdGlvbmFsaXR5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyUmVsYXRlZE5ld3MoKTsgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBtZWRpYUxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVkaWEtY2FyZCBpbWcnKSBcclxuICAgICAgICAgICAgLy8gdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJykgICBcclxuICAgICAgICAgICAgLy8gdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpXHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubWVkaWFSZWNpZXZlciwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJykpIFxyXG4gICAgICAgICAgICAvLyB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1lZGlhQ29sdW1uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNvbHVtbicpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLm5ld2xvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7IFxyXG4gICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LW1lZGlhJyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24nKTtcclxuXHJcbiAgICAgICAgLy8gbWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAvLyAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IFNoYWRvd0JveC5wcm90b3R5cGUuc2hhZG93Qm94KG1lZGlhLCB0aGlzLm1lZGlhUmVjaWV2ZXIsIHRoaXMuaHRtbCwgXHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcywgJ2dhbGxlcnknLCB0aGlzLm1lZGlhQ29sdW1uLCB0aGlzLm5ld2xvYWQsIHRoaXMuZ2FsbGVyeVBvc2l0aW9uLFxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEsIHRoaXMubWVkaWFQYWdpbmF0aW9uXHJcbiAgICAgICAgLy8gICAgICAgICApKVxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgIC8vICBtZWRpYUxpbmsuZm9yRWFjaChtZWRpYT0+e1xyXG4gICAgICAgIC8vICAgICBtZWRpYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gU2hhZG93Qm94LnByb3RvdHlwZS5zaGFkb3dCb3gobWVkaWEpKVxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKCk7XHJcblxyXG4gICAgICAgIC8vIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKFxyXG4gICAgICAgIC8vICAgICB0aGlzLm1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIGltZycpLCBcclxuICAgICAgICAvLyAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyksICAgXHJcbiAgICAgICAgLy8gICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKSxcclxuICAgICAgICAvLyAgICAgdGhpcy5tZWRpYVJlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJyksIFxyXG4gICAgICAgIC8vICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZVxyXG4gICAgICAgIC8vICk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChvcHRpb249PntcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtvcHRpb24uc3R5bGUucG9pbnRlckV2ZW50cz1cIlwiOyB9LCA1MDApO1xyXG4gICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBnYXRoZXJSZWxhdGVkTmV3cygpe1xyXG5cclxuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcExpbmtzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJlbGF0aW9uc2hpcC1saW5rJyk7XHJcblxyXG4gICAgICAgIHRoaXMucmVsYXRpb25zaGlwTGlua3MuZm9yRWFjaChsaW5rPT57XHJcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBsaW5rSWQgPSBsaW5rLmRhdGFzZXQucmVsYXRlZCBcclxuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gbGluay5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJykuaW5uZXJUZXh0XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gbGlua0lkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gYCMke2xpbmtJZH1gO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5uZXdzU2VhcmNoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSBgIyR7bGlua0lkfWA7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVkVGl0bGUgPWBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpbnNlcnRQYWdpbmF0aW9uKG5ld3NQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQpe1xyXG4gICAgICAgIC8vYWRkIG1hbnVhbCBwYWdlIGVudHJ5IGJveFxyXG4gICAgICAgIC8vQWRkIGZhaWxzYWZlIGFnYWluc3QgaXQgYmVpbmcgYSBudW1iZXIgdG9vIGJpZyBvciBzbWFsbFxyXG4gICAgICAgIC8vTWF5YmUgZG8gZHJvcGRvd24gaW5zdGVhZD8gIFxyXG4gICAgICAgIC8vTWF5YmUganVzdCBkb24ndCBkbyBhdCBhbGw/XHJcblxyXG4gICAgICAgIC8vRG8gdGhlIG51bWJlciBsaW1pdCwgdGhvdWdoLCBvbmUgd2hlcmUgaGlkZSBhbmQgcmV2ZWFsIHdoZW4gYXQgY2VydGFpbiBwb2ludHNcclxuXHJcbiAgICAgICAgLy9SZW1lbWJlciB0byBhZGQgdGhlIGxvYWRlclxyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudC1wYWdlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiXCIgY2xhc3M9XCJjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c1wiPlByZXY8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiY29udGVudC1wYWdlXCIgZGF0YS1wYWdlPVwiJHtkYXRhQ291bnQrK31cIj4gJHtwYWdlQ291bnQgKz0gMX08L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuICAgICAgICAgICAgICAgICAgICA8YSBpZD1cIlwiIGNsYXNzPVwiY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fbmV4dCAke25ld3NQYWdlcy5sZW5ndGggPiAxID8gJycgOiAnaGlkZGVuJ31cIj5OZXh0PC9hPiBcclxuICAgICAgICAgICAgICAgIDwvZGl2PiBcclxuICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXMnKTsgICAgXHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpICBcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZUhvbGRlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlcyBhJylcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eSh0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucyk7XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWVNb3JlRnVuY3Rpb25hbGl0eSgpe1xyXG4gICAgICAgIC8vYWRkIHNwaW5uZXIgdG8gdGhpcywgYXMgbmVlZHMgdG8gY29uc29sdCBiYWNrZW5kXHJcbiAgICAgICAgdGhpcy5zZWVNb3JlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNlZS1tb3JlLWxpbmsnKVxyXG4gICAgICAgIHRoaXMuc2VlTW9yZS5mb3JFYWNoKGxpbms9PntcclxuICAgICAgICAgICAgbGluay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXBvcnQgPSBsaW5rLmlkOyAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5zaW5nbGVDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYGZ1bGwgZGlzcGxheSBpcyAke3RoaXMuZnVsbERpc3BsYXl9YClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGRpc21pc3NTZWxlY3Rpb24oKXtcclxuICAgICAgICBpZih0aGlzLm5ld3NEZWxpdmVyeSAhPT0gJycpe1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5zdG9yZWRUaXRsZX1gO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5pbml0aWFsVGl0bGV9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50b2dnbGVPcHRpb25zLmZvckVhY2gobyA9PiB7by5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO30pIFxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlck9wdGlvbnMuZm9yRWFjaChmID0+IHtmLmRpc2FibGVkID0gJyd9KVxyXG4gICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMuZGlzbWlzc0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdkaXNtaXNzZWQnKTsgIFxyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENhbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgLy8gdGhpcy5zaW5nbGVDYWxsID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2PidcclxuICAgICAgICAgICAgICAgIC8vdG9vIHNsb3c/P1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwiXCI7IH0sIDEwMDApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBjb250ZW50TmV4dEFjdGl2YXRpb24oKXtcclxuICAgICAgICBsZXQgYWxsbmV4dEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fbmV4dCcpO1xyXG5cclxuICAgICAgICBhbGxuZXh0QnV0dG9ucy5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSk9PntcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLmN1cnJlbnRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYWdlLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2goLy1ncm91cC8pKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cE5hbWUgPSBuYW1lLnNsaWNlKDAsIC02KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuc2VsZWN0ZWRQYWdlYCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFBhZ2UgPSB0aGlzLmN1cnJlbnRQYWdlcyArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBuZXh0UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc31cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgfTtcclxuXHJcbiAgICBjb250ZW50TmV4dEFuZFByZXZpb3VzKCl7XHJcbiAgIFxyXG4gICAgICAgIHRoaXMuY29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbicpOyAgICAgXHJcblxyXG4gICAgICAgIGxldCBwcmV2QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzYClcclxuICAgICAgICBsZXQgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LWRpcmVjdGlvbl9uZXh0YClcclxuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWxlY3RlZFBhZ2VgKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jdXJyZW50UGFnZXMgPiAwKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50UGFnZXMpXHJcbiAgICAgICAgICAgIHByZXZCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmKCFuZXh0QnV0dG9uLnByZXZpb3VzRWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZFBhZ2UnKSl7XHJcbiAgICAgICAgICAgIG5leHRCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzIC0gMTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBwcmV2UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2PidcclxuICAgICAgICAgICAgICAgIC8vdG9vIHNsb3c/P1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXN9XCJdYCk7XHJcbiAgICAgICAgICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE5ld3MiLCIvLyBTcGl0IG91dCBBcHRzIGluIG9yZGVyIG9mIG1vc3QgcmVjZW50XHJcblxyXG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCJcclxuXHJcbmNsYXNzIFBhZ2luYXRpb24ge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnRhcmdldGVkRWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XHJcbiAgICAgICAgdGhpcy5oZWFkZXJOYXYgPSB0aGlzLmhlYWRlci5xdWVyeVNlbGVjdG9yKCduYXYnKTtcclxuICAgICAgICB0aGlzLm9wZW5CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXNlYXJjaC10cmlnZ2VyXCIpO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwb3AtdXAtZGlzcGxheS1ib3gnKTtcclxuICAgICAgICB0aGlzLmltYWdlSG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ltYWdlLWhvbGRlcicpO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNYWduaWZ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Nsb3NlTWFnbmlmeScpO1xyXG4gICAgICAgIC8vIHRoaXMub3ZlcmFsbENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNvdmVyYWxsQ29udGFpbmVyJyk7XHJcbiAgICAgICAgLy8gRm9yIG5vdywgdGhpcyB3aWxsIGJlIGhvdyBJIHByZXZlbnQgZXJyb3JzIG9uIG90aGVyIHBhZ2VzIFxyXG4gICAgICAgIHRoaXMuZnJvbnRUZXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkJykgXHJcbiAgICAgICAgLy8gQ2FuIEkgc2V0dXAgdG8gbG9hZCBpbiBhbmQgUGFnaW5hdGUgZGVwZW5kaW5nIG9uIGlkZW50aXR5LCBzbyBhcyB0byBtYWtlIGFkYXB0YWJsZT8gWWVzISEhXHJcblxyXG4gICAgICAgIC8vV2lsbCB0YXJnZXQgYSBzaGFyZWQsIHNwZWNpZmljIGNsYXNzIHVzaW5nIHF1ZXJ5U2VsZWN0b3JBbGwgYW5kIHVzZSBhIGxvb3BcclxuXHJcbiAgICAgICAgLy9yZW1lbWJlciB0byB1c2UgdGhlIGFqYXggdXJsIHNldC11cCB0byBsaW5rIHRvIHRoZSBzZWFyY2ggaW5mb1xyXG4gICAgICAgIC8vQ29sb3IgdGhlIHNlbGVjdGVkL2N1cnJlbnQgcGFnZSBhbmQgcHV0IGEgbmV4dCBhbmQgcHJldiBidXR0b25zIHRoYXQgb25seSBhcHBlYXIgd2hlbiBhcHBsaWNhYmxlXHJcbiAgICAgICAgLy9NYWtlIHN1cmUgcGFnaW5hdGlvbiBpcyBvdXRzaWRlIG9mIGdlbmVyYXRlZCB0ZXh0P1xyXG5cclxuICAgICAgICAvLyBjb25zaWRlciB1c2luZyBzb21lIHNvcnQgb2YgbG9hZGluZyBpY29uIGFuZCBhbmltYXRpb24gd2hlbiBjbGlja2luZyBwYWdpbmF0aW9uLiBKdXN0IGZvciB1c2VyIHNhdGlzZmFjdGlvbiBvbiBjbGlja1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHRoaXMucGFnaW5hdGVkQ29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50Q29udGFpbmVyX3BhZ2luYXRlZCcpO1xyXG4gIFxyXG4gICAgICAgIGxldCBwcm9wZXJ0aWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Byb3BlcnRpZXNDb250YWluZXIgLmNvbnRlbnRCb3gnKTtcclxuICAgICAgICBsZXQgbWVtYmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZW1iZXJzQ29udGFpbmVyIC5jb250ZW50Qm94Jyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFnaW5hdGVkQ29udGVudCA9IFtwcm9wZXJ0aWVzLCBtZW1iZXJzXTtcclxuICAgICAgICB0aGlzLmdyb3VwTmFtZTtcclxuICAgICAgICAvLyBNYWtlIHdvcmsgZm9yIGFsbCBwYWdpbmF0ZSB0aHJvdWdoIGEgbG9vcD9cclxuICAgICAgICB0aGlzLnBvc3RQYWdlU2VsZWN0O1xyXG4gICAgICAgIHRoaXMucG9zdFBhZ2VPcHRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UHJvcGVydGllc1BhZ2UgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE1heWJlIHB1dCBhbGwgdGhpbmdzIGluIHRoaXMgb2JqZWN0IHdoZW4gZnVzZVxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0ge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiAwLFxyXG4gICAgICAgICAgICBtZW1iZXJzOiAwXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnREaXJlY3Rpb247XHJcblxyXG4gICAgICAgIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIC8vIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgLy9zcGlubmVyIGZhbHNlIGJlZm9yZSB0aGUgcHJldiBpcyB0cnVlXHJcblxyXG4gICAgICAgIC8vRG8gc21hbGxlciBvbmVzIGZvciBwYWdpbmF0ZSBhbmQgZm9yIHRoZSBmb3JtIHN1Ym1pdHMsIGFzIHdlbGwgYXMgc2VhcmNoIG9uIHRoZSBhbGwgbmV3cyBwYWdlIGFuZCBhbnkgb3RoZXIgcGFnaW5hdGlvbiBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICBpZih0aGlzLmZyb250VGVzdCl7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IG1haW5Mb2FkZXJUZXh0ID0gW1wiT25lIE1vbWVudCBQbGVhc2UuLi5cIiwgXCJQZXJmZWN0aW9uIHRha2VzIHRpbWVcIiwgXCJHcm9hbmluZyBvbmx5IG1ha2VzIHRoaXMgc2xvd2VyLi4uXCIsIFwiSSdtIHdhdGNoaW5nIHlvdS4uLiA6KVwiXHJcbiAgICAgICAgICAgIC8vICwgXCJDb21tZW5jaW5nIEhhY2sgOylcIiwgXCJPbmUgTW9tZW50LiBSZXRyaWV2aW5nIHlvdXIgU1NOXCIsIFwiU2hhdmluZyB5b3VyIGNhdC4uLlwiLCBcIllvdSBsaWtlIFNjYXJ5IE1vdmllcy4uLj8gPjopXCJdO1xyXG4gICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJhbmRvbSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1haW5Mb2FkZXJUZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJlc3VsdCA9IG1haW5Mb2FkZXJUZXh0W3JhbmRvbV07XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcy5wYWdlTG9hZGVyLnNldEF0dHJpYnV0ZSgnZGF0YS1jdXJ0YWluLXRleHQnLCBgJHtyZXN1bHR9YClcclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1sb2FkZXInKTtcclxuXHJcbiAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgY29udGVudEludGVyZmFjZSgpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZGlzcGxheVNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGlzcGxheVNxdWFyZXMnKTtcclxuICBcclxuICAgICAgICB0aGlzLmRpc3BsYXlJbWFnZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGlzcGxheUltYWdlcycpO1xyXG4gICAgICAgIHRoaXMubWFnbmlmeUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5mYS1zZWFyY2gtcGx1cycpO1xyXG5cclxuICAgICAgICB0aGlzLmRpc3BsYXlTcXVhcmVzLmZvckVhY2goZGlzcGxheVNxdWFyZSA9PiB7XHJcbiAgICAgICAgICBsZXQgbGluayA9IGRpc3BsYXlTcXVhcmUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcycpO1xyXG4gICAgICAgICAgbGV0IGltYWdlID0gZGlzcGxheVNxdWFyZS5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheUltYWdlcycpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBkaXNwbGF5U3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIGUgPT4ge1xyXG5cclxuICAgICAgICAgICAgICBsaW5rLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGltYWdlLmNsYXNzTGlzdC5hZGQoJ3BhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIGRpc3BsYXlTcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgZSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgIGxpbmsuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzX192aXNpYmxlJyk7XHJcbiAgICAgICAgICAgICAgaW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSgncGFnZUxpbmtzX192aXNpYmxlJyk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgICBcclxuICAgICAgdGhpcy5tYWduaWZ5QnV0dG9uLmZvckVhY2goYiA9PnsgXHJcbiAgICAgICAgICBiLm9uY2xpY2sgPSBlPT57XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSBlLnRhcmdldC5jbG9zZXN0KCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJykucHJldmlvdXNFbGVtZW50U2libGluZy5jbG9uZU5vZGUoKTtcclxuICAgICAgICAgICAgLy9QZXJoYXBzIGNhcnJ5IG92ZXIgYXNzb2NpYXRlZCBuZXdzLCBhcyB3ZWxsXHJcblxyXG4gICAgICAgICAgICAvL3RoaXMgaXMgbm90IG5lY2Vzc2FyeSBhcyBvbmUgZGlyZWN0bHkgYmVsb3cgZG9lcyBpdCBieSBhY2Nlc3NpbmcgdGhlIHBhcmVudCBhbmQgcXVlcnkgc2VsZWN0aW5nLCBidXQga2VlcGluZyB0aGlzIGFzIGNvdWxkIGJlIHVzZWZ1bCB0byBoYXZlIG9uIGhhbmRcclxuICAgICAgICAgICAgdGhpcy5maW5kU3BlY2lmaWVkUHJldmlvdXMoZS50YXJnZXQsICdtb3JlLWluZm8tbGluaycpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnRhcmdldGVkRWxlbWVudCA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MnKS5xdWVyeVNlbGVjdG9yKCcubW9yZS1pbmZvLWxpbmsnKS5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUJveC5pbnNlcnRCZWZvcmUodGhpcy50YXJnZXRlZEVsZW1lbnQsIHRoaXMuY2xvc2VNYWduaWZ5KTtcclxuICAgICAgIFxyXG4gICAgICAgICAgICAvLyB0aGlzLmRpc3BsYXlCb3gucHJlcGVuZChpbWFnZSk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VIb2xkZXIucHJlcGVuZChpbWFnZSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlCb3guc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgICAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICAgICAgZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5hZGQoJ2ZyZWV6ZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICB0aGlzLmNsb3NlTWFnbmlmeS5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheUJveC5xdWVyeVNlbGVjdG9yKCcubW9yZS1pbmZvLWxpbmsnKS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlCb3guc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLm9wZW5CdXR0b24uZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgIGUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LnJlbW92ZSgnZnJlZXplJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vY2hhbmdlIHRvIGJlIGZwciBlaXRoZXIgZGlyZWN0aW9uYWwgdG8gZ2V0IGxldCwgd2l0aCBpZiBzdGF0ZW1lbnRzXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucG9wLXVwLWRpcmVjdGlvbmFsJykuZm9yRWFjaChidXR0b249PntcclxuICAgICAgICBidXR0b24ub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgLy9NYWtlIG5leHQgYW5kIHByZXYgdW5jbGlja2FibGUgaWYgbm90aGluZyB0aGVyZSB0byBnbyB0b1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudEltYWdlID0gdGhpcy5kaXNwbGF5Qm94LnF1ZXJ5U2VsZWN0b3IoJ2ltZycpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldE5hbWUgPSBjdXJyZW50SW1hZ2UuZGF0YXNldC5uYW1lO1xyXG5cclxuICAgICAgICAgICAgbGV0IHR5cGUgPSBidXR0b24uaWQ7XHJcbiAgICAgICAgICAgIGxldCBuZXdJbWFnZUNvbnRhaW5lcjtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codHlwZSlcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5U3F1YXJlcy5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgIGlmKGUucXVlcnlTZWxlY3RvcihgLmRpc3BsYXlJbWFnZXNbZGF0YS1uYW1lPSR7dGFyZ2V0TmFtZX1dYCkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGUgPT09ICduZXh0LWltYWdlJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ltYWdlQ29udGFpbmVyID0gZS5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheUltYWdlcycpLmNsb3Nlc3QoJy5vdmVyYWxsLXNxdWFyZXMnKS5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ltYWdlQ29udGFpbmVyID0gZS5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheUltYWdlcycpLmNsb3Nlc3QoJy5vdmVyYWxsLXNxdWFyZXMnKS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZihuZXdJbWFnZUNvbnRhaW5lcil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdJbWFnZSA9IG5ld0ltYWdlQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5SW1hZ2VzJykuY2xvbmVOb2RlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdMaW5rID0gbmV3SW1hZ2VDb250YWluZXIucXVlcnlTZWxlY3RvcignLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAubW9yZS1pbmZvLWxpbmsnKS5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VIb2xkZXIucXVlcnlTZWxlY3RvcignaW1nJykucmVwbGFjZVdpdGgobmV3SW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlCb3gucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykucmVwbGFjZVdpdGgobmV3TGluayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZpbmRTcGVjaWZpZWRQcmV2aW91cyhzb3VyY2UsIGlkZW50aWZpZXIpe1xyXG4gICAgICAgIC8vIHRoaXMgd2lsbCBuZWVkIHRvIGJlIHR3ZWFrZWQgaGFuZGxlIG5vbi1uZXN0ZWQsIGFzIHdlbGwgYXMgb3RoZXIgbmVlZHNcclxuICAgICAgICBsZXQgbGluayA9IHNvdXJjZS5wYXJlbnRFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgd2hpbGUgKGxpbmspIHtcclxuICAgICAgICAgICAgaWYgKGxpbmsuY2xhc3NOYW1lLmluY2x1ZGVzKGlkZW50aWZpZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0ZWRFbGVtZW50ID0gbGluay5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRhcmdldGVkRWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsaW5rID0gbGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHBhZ2luYXRlKCl7XHJcbiAgICAgICAgLy9jcmVhdGUgbmV3IHNlYXJjaCBzZXQtdXAgZm9yIGp1c3QgdGhlIG1lbWJlciBwcm9wIHBhZ2luYXRpb24/IExpa2UsIGdvIG1ha2UgbmV3IGluYyBwYWdlXHJcbiAgICAgICAgLy9Vc2UgcG9zdC10eXBlICdpZicgdGhhdCBjaGVja3MgZm9yIHRoZSBpZD8gQWN0dWFsbHksIEkgY2FuIHVzZSB0aGUgcmVzdXRzIGFycmF5IGFzIGNhbiBwbHVyYWxpemVcclxuXHJcbiAgICAgICAgLy9zdGFydCBieSBpbnNlcnRpbmcgcmFuZG9tIHNoaXQgaW4gYm90aD9cclxuICAgICAgICAvL3NldC11cCB0aGlzIHVwIHRvIG5vdCByZXBsYWNlIGNvbnRlbnQsIGlmIGphdmFzY3JpcHQgdHVybmVkIG9mZiwgYWxvbmcgd2l0aCBpbnNlcnRpbmcgYSBidXR0b24gdG8gc2VlIGFsbFxyXG4gICAgICAgIC8vYW5kIG1ha2UgdGhhdCBzZWUgYWxsIHBhZ2VcclxuICAgICAgICAvL0kgdGhpbmsgSSdsbCBtYWtlIHRoZSBzZWUgYWxsIGJ1dHRvbiwgYnV0IHJlcGxhY2UgaXQncyBjb250ZW50cyB0aHJvdWdoIGhlcmUsIHNvIGlmIHRoaXMgZG9lc24ndCBydW4sIGl0J2xsIGJlIHRoZXJlXHJcbiAgICAgICAgLy9kaXNhYmxlIHNjcmlwdCBpbiBicm93c2VyIHRvIGNoZWNrL3dvcmsgb24gc3R1ZmZcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIC8vSXMgaXQgYmV0dGVyIGp1c3QgdG8gdXNlIHNlcGVyYXRlIHVybCByb3V0ZXM/IFxyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvY29udGVudD9wYWdlJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBjdXJyZW50TWVtYmVyc1Nob3duID0gdGhpcy5jdXJyZW50UGFnZXMubWVtYmVycztcclxuICAgICAgICAgICAgLy8gbGV0IGN1cnJlbnRQcm9wZXJ0aWVzU2hvd24gPSB0aGlzLmN1cnJlbnRQYWdlcy5wcm9wZXJ0aWVzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGFDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwb3N0T3V0cHV0O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh3aW5kb3cuaW5uZXJXaWR0aClcclxuICAgICAgICAgICAgaWYod2luZG93LmlubmVyV2lkdGggPj0gOTYwKXtcclxuICAgICAgICAgICAgICAgIHBvc3RPdXRwdXQgPSA4O1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHBvc3RPdXRwdXQgPSA2O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBwYWdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgbGV0IHBvc3RQYWdlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0c0tleXMgPSBPYmplY3Qua2V5cyhyZXN1bHRzKTtcclxuICAgICAgICAgICAgbGV0IG5hbWU7XHJcbiAgICAgICAgICAgIGxldCBwb3N0O1xyXG4gICAgICAgICAgICBsZXQgY29udGVudFNob3duO1xyXG4gICAgICAgICAgICBsZXQgcGFnaW5hdGlvbkxvY2F0aW9uO1xyXG4gXHJcbiAgICAgICAgICAgIC8vVXNlIGEgZm9yIGxvb3AgaGVyZT8gZm9yIHJlc3VsdCBvZiByZXN1bHRzP1xyXG4gICAgICAgICAgICAvLyBtYWtlIHRoaXMgaW50byBhbiBhcnJheSBhbmQgcHV0IGluIGlmIGEgbG9vcD9cclxuXHJcbiAgICAgICAgICAgIGxldCBjb250YWluZXJUeXBlID0gdGhpcy5wYWdpbmF0ZWRDb250ZW50O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lclR5cGVMb2NhdGlvbiA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZighdGhpcy5jb250ZW50TG9hZGVkKXtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgdHlwZSBvZiByZXN1bHRzS2V5cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zdCA9IHJlc3VsdHNbbmFtZV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5sZW5ndGggPD0gcG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IHBvc3RQYWdlcy5jb25jYXQocG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAocG9zdC5sZW5ndGggPiBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZW0gPSAxOyBpdGVtIDw9IHBvc3RPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZW1vdmVkID0gcG9zdC5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IHBvc3RQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwb3N0UGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCBuZWVkIHRvIG1hZGUgbW9yZSB2ZXJzYXRpbGUgaWYgZGVjaWRlIHRvIHVuaXZlcnNhbGl6ZSBwYWdpbmF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9zdFBhZ2VzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBwb3N0UGFnZXNbdGhpcy5jdXJyZW50UGFnZXNbdHlwZV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBvc3RQYWdlc1swXSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlTmFtZSA9IHR5cGU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJUeXBlW2NvbnRhaW5lclR5cGVMb2NhdGlvbl0uY2xhc3NMaXN0LmFkZCh0eXBlKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRDb250ZW50KGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXSwgY29udGVudFNob3duLCBwYWdlTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTG9jYXRpb24gPSBjb250YWluZXJUeXBlW2NvbnRhaW5lclR5cGVMb2NhdGlvbl0ucHJldmlvdXNFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcudGV4dEJveCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0UGFnaW5hdGlvbihwYWdpbmF0aW9uTG9jYXRpb24sIHBvc3RQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQsIHBhZ2VOYW1lKSAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJUeXBlTG9jYXRpb24rPSAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBwb3N0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcyA9IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBY3RpdmF0aW9uKCk7IFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vdGVtcCB1bnRpbCBjaGFuZ2Ugc2V0LXVwIHRvIG1ha2Ugc2VjdGlvbiBsb2FkZXIgd29ya1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlTG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpXHJcbiAgICAgICAgICAgICAgICBwb3N0ID0gcmVzdWx0c1t0aGlzLmdyb3VwTmFtZV1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCA8PSBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IHBvc3RQYWdlcy5jb25jYXQocG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocG9zdC5sZW5ndGggPiBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpdGVtID0gMTsgaXRlbSA8PSBwb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlID0gcG9zdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBwb3N0UGFnZXNbdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdXTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50Qm94LiR7dGhpcy5ncm91cE5hbWV9YClcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluc2VydENvbnRlbnQodGFyZ2V0LCBjb250ZW50U2hvd24sIHRoaXMuZ3JvdXBOYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QW5kUHJldmlvdXMoKTsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QWN0aXZhdGlvbigpOyBcclxuXHJcbiAgICAgICAgICAgICAgICAvL2NoYW5nZSB0byBhZGRpbmcgZmFkZS1jbGFzcywgYmVmb3JlIHJlbW92aW5nIGFjdGl2ZSwgc28gZ29lcyBhd2F5IHNtb290aGVyXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT50aGlzLnBhZ2VMb2FkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyksIDgxMCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PnRoaXMucGFnZUxvYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSwgODEwKTsgXHJcbiAgICAgXHJcbiAgICAgICAgICAgIC8vQ2FuIEkgbG9vcCB0aHJvdWdoIHRoZSBkaWZmIHJlc3VsdHMsIHVzaW5nIHZhcmlhYmxlKHMpIGJlZm9yZSB0aGUgaW5uZXJIdG1sIGFuZCB0aGUgbWFwLCBhcyB3ZWxsIGFzIHRoZSBwYWdlIGNvbnRhaW5lcj9cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEhvdyB0byBnZXQgcG9zdCBuYW1lLCB0aG91Z2g/IENhbiBJIGFwcGx5IGEgZm9yZWFjaCB0byB0aGVtIGFuZCBncmFiIHRoZSBwb3N0IHR5cGU/IENvdWxkIEkgaW5jbHVkZSBpbiByZXN0IHJvdXRlXHJcblxyXG4gICAgICAgICAgICAvL0hhdmUgbG9naWMgdGhhdCBvbmx5IGhhcyB0aGUgcHJvY2VzcyBmb3IgdGhlIHNlbGVjdGVkIHNlY3Rpb24gcnVuIGFnYWluLCBwZXJoYXBzIHZpYSBhIHZhcmlhYmxlIGluIHRoZSBjYWxsIGJlbG93LiBcclxuICAgICAgICAgICAgLy9pZS4gdGhpcy5wYWdpbmF0ZSgnbWVtYmVycycpXHJcbiAgICAgICAgICAgIC8vTWF5YmUgdGhlIHBhZ2luYXRpb24gY291bGQgYmUgc3BsaXQgdXAsIHdpdGggdGhlIGh0bWwgaW5zZXJ0aW9uIGJlaW5nIGEgc2VwZXJhdGVseSBjYWxsZWQgZnVuY3Rpb24gdGhhdCBpcyByZXBlYXRlZFxyXG4gICAgICAgICAgICAvL3Rocm91Z2ggYSBsb29wcyBjb25zaXN0aW5nIG9mIHZhcmlhYmxlcyBoZXJlLCBhbmQgY291bGQgc2ltcGx5IGJlIGNhbGxlZCBhZ2FpbiB3aXRoIGEgc3BlY2lmaWMgdmFyaWFibGUgIFxyXG4gICAgICAgICAgICAvL09yIHNpbXBseSBqdXN0IHNlcGVyYXRlIHRoaXMgYWxsIFxyXG5cclxuICAgICAgICAgICAgLy9zaW1wbHkgZGlzcGxheSBkaWZmZXJlbnQgdGhpbmdzLCBuZWVkIHR3byBkaWZmIGh0bWwgYmxvY2tzLCBidXQgZWFjaCBjYW4gY2FsbGVkIHVwb24gc2VwZXJhdGVseSwgYXMgZGlmZmVyZW50IGlubmVySHRtbCBibG9ja3NcclxuXHJcbiAgICAgICAgICAgIC8vQnV0IHRoZW4gYWdhaW4sIGEgdW5pZm9ybWVkIGRpc3BsYXllZCBjb3VsZCBiZSBhY2hpZXZlZCB3aXRoIHRlcm5hcnkgb3BlcmF0b3JzLCBjaGVja2luZyBmb3IgdGl0bGVfb3JfcG9zaXRpb25cclxuICAgICAgICAgICAgLy9BbmQgY2hlY2tpbmcgZm9yIHNvbWV0aGluZyB0aGF0IGNvdWxkIHJ1bGUgb3V0IHRoZSBtYWduaWZ5aW5nIGJ1dHRvbiBhbmQgdGhlIGxvY2F0aW9uIGxpbmtcclxuXHJcbiAgICAgICAgICAgIC8vQ2FuIEkgbW92ZSB0aGlzIEFuZCBqdXN0IGxvb3AgY2FsbCB0aGlzP1xyXG5cclxuICAgICAgICAgICAgLy9NYWtlIHdvcmsgYWdhaW4uIEFuZCB2ZXJzYXRpbGVcclxuICAgICAgICAgICAgLy9EbyBJIG5lZWQgdGhpcyBhbnltb3JlLCB0aG91Z2g/XHJcblxyXG4gICAgICAgICAgICAvLyBsZXQgYWN0aXZlUGFnaW5hdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBhZ2U9JyR7Y3VycmVudE1lbWJlcnNTaG93bn0nXWApO1xyXG4gICAgICAgICAgICAvLyBhY3RpdmVQYWdpbmF0aW9uLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfWNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29udGVudEludGVyZmFjZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGluc2VydENvbnRlbnQoZGVzdGluYXRpb24sIHR5cGUsIHBhZ2VOYW1lKXtcclxuICAgICAgICAgICAgLy9DaGFuZ2UgZGVzaXRpbmF0aW9uIHNldC11cCB0byBhY2NvbWFkYXRlIGxvYWRlclxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwYWdlTmFtZSlcclxuICAgICAgICAgICAgZGVzdGluYXRpb24uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgJHt0eXBlLm1hcChpdGVtID0+IGBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvdmVyYWxsLXNxdWFyZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheVNxdWFyZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImRpc3BsYXlJbWFnZXNcIiBkYXRhLW5hbWU9XCIke2l0ZW0udGl0bGUucmVwbGFjZUFsbCgnICcsICcnKX1cIiBzcmM9XCIke2l0ZW0uaXNDb21wbGV0ZWQgfHwgaXRlbS5wb3N0VHlwZSA9PT0gJ21lbWJlcicgPyBpdGVtLmltYWdlIDogaXRlbS5wcm9qZWN0ZWRJbWFnZX1cIiBhbHQ9XCIke2l0ZW0udGl0bGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwibW9yZS1pbmZvLWxpbmtcIiBocmVmPVwiJHtpdGVtLnBlcm1hbGlua31cIj5GaW5kIE91dCBNb3JlPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7c2l0ZURhdGEucm9vdF91cmx9L2FsbC1uZXdzLyMke2l0ZW0uaWR9LXJlbGF0ZWQtJHtpdGVtLnBvc3RUeXBlUGx1cmFsfVwiPkFzc29jaWF0ZWQgTmV3cz88L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3BhZ2VOYW1lID09PSAncHJvcGVydGllcycgPyAnPGJ1dHRvbj48aSBjbGFzcz1cImZhcyBmYS1zZWFyY2gtcGx1c1wiPjwvaT48L2J1dHRvbj4nOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpc3BsYXktdGV4dFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2l0ZW0udGl0bGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke2l0ZW0ucG9zaXRpb25PclJvbGUgIT09IHVuZGVmaW5lZCA/IGA8cD4ke2l0ZW0ucG9zaXRpb25PclJvbGV9PC9wPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj4gICBcclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICBpbnNlcnRQYWdpbmF0aW9uKGRlc3RpbmF0aW9uLCBwb3N0UGFnZXMsIGRhdGFDb3VudCwgcGFnZUNvdW50LCBwYWdlTmFtZSl7XHJcbiAgICAgICAgLy9QdXQgaW4gJ25leHQnIGFuZCAncHJldicgYnV0dG9uc1xyXG4gICAgICAgIC8vTWFrZSBudW1iZXJzIExhcmdlIGFuZCBjZW50ZXJlZCwgYW5kIHBlcmhhcHMgcHV0IGEgYm94IGFyb3VuZCB0aGVtLCBhbG9uZyB3aXRoIGZhbmN5IHN0eWxpbmcgYWxsIGFyb3VuZFxyXG4gICAgICAgIGRlc3RpbmF0aW9uLmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICBcImJlZm9yZWVuZFwiLFxyXG4gICAgICAgICAgICBgXHJcbiAgICAgICAgICAgICR7cG9zdFBhZ2VzLmxlbmd0aCA/ICc8ZGl2IGNsYXNzPVwiY29udGVudC1wYWdlc1wiPicgOiAnJ31cclxuICAgICAgICAgICAgICAgICR7cG9zdFBhZ2VzLmxlbmd0aCA+IDEgID8gYDxhIGlkPVwiJHtwYWdlTmFtZX0tcHJldlwiIGNsYXNzPVwiJHtwYWdlTmFtZX0tZ3JvdXAgJHtwYWdlTmFtZX0tZGlyZWN0aW9uIGNvbnRlbnQtZGlyZWN0aW9uIGNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzXCI+UHJldjwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICR7cG9zdFBhZ2VzLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICR7cG9zdFBhZ2VzLmxlbmd0aCA+IDEgPyBgPGEgY2xhc3M9XCJjb250ZW50LXBhZ2UgJHtwYWdlTmFtZX0tZ3JvdXBcIiBkYXRhLXBhZ2U9XCIke2RhdGFDb3VudCsrfVwiPiAke3BhZ2VDb3VudCArPSAxfTwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgIGApLmpvaW4oJycpfSAgXHJcbiAgICAgICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPiAxID8gYDxhIGlkPVwiJHtwYWdlTmFtZX0tbmV4dFwiIGNsYXNzPVwiJHtwYWdlTmFtZX0tZ3JvdXAgJHtwYWdlTmFtZX0tZGlyZWN0aW9uIGNvbnRlbnQtZGlyZWN0aW9uIGNvbnRlbnQtZGlyZWN0aW9uX25leHRcIj5OZXh0PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID8gJzwvZGl2PicgOiAnJ30gXHJcblxyXG4gICAgICAgIGApO1xyXG4gICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzJyk7ICAgIFxyXG4gICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykgIFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMubmV4dENvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fbmV4dCcpOyBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uLmZvckVhY2goZWw9PmVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpKVxyXG5cclxuICAgICAgICBsZXQgY29udGVudFBhZ2VPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtcGFnZScpO1xyXG5cclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KGNvbnRlbnRQYWdlT3B0aW9ucyk7XHJcbiAgICB9XHJcbi8vIHRoaXMgbmV3IHNldHVwIGNhdXNlcyBpc3N1ZXMgYWZ0ZXIgZGlyZWN0aW9uYWwgYnV0dG9ucyB1c2VkOiBzZWxlY3RlZFBhZ2UgXHJcbi8vbm90IGJlaW5nIGFkZGVkIHRvIGNsaWNrZWQgYW5kIGN1cnJlbnRQYWdlIG9uIGRpcmVjdGlvbmFsIGdldHMgZXJyb3JcclxuLy9MYXR0ZXIgbGlrZWx5IGNvbm5lY3RlZCB0byB0aGUgZm9ybWVyXHJcblxyXG4gICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICAvL0NvbWJpbmUgdGhlIHR3byBiZWxvd1xyXG4gICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkUGFnZS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKC8tZ3JvdXAvKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lID0gbmFtZS5zbGljZSgwLCAtNik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gPSBwYXJzZUludChzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKClcclxuXHJcbiAgICAgICAgICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChpID0+eyBcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKVxyXG4gICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2godGhpcy5ncm91cE5hbWUpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSkgIFxyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgLy8gICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT57XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAvLyAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgaS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCh0aGlzLmdyb3VwTmFtZSkpe1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIC8vICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgLy8gICAgICAgICB9KSAgXHJcbiAgICAgICAgLy8gICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAvLyAgICAgfSwgeyBvbmNlOiB0cnVlIH0pO1xyXG4gICAgICAgIC8vIH0pXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBjb250ZW50TmV4dEFjdGl2YXRpb24oKXtcclxuICAgICAgICBsZXQgYWxsbmV4dEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fbmV4dCcpO1xyXG5cclxuICAgICAgICBhbGxuZXh0QnV0dG9ucy5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSk9PntcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLmN1cnJlbnRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYWdlLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2goLy1ncm91cC8pKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cE5hbWUgPSBuYW1lLnNsaWNlKDAsIC02KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmdyb3VwTmFtZX0tZ3JvdXAuc2VsZWN0ZWRQYWdlYCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFBhZ2UgPSB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA9IG5leHRQYWdlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwiXCI7IH0sIDkyMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0ZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmdyb3VwTmFtZX0tZ3JvdXBbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV19XCJdYCk7XHJcbiAgICAgICAgICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnRlbnROZXh0QW5kUHJldmlvdXMoKXtcclxuICAgXHJcbiAgICAgICAgdGhpcy5jb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtZGlyZWN0aW9uJyk7ICAgICBcclxuXHJcbiAgICAgICAgbGV0IHByZXZCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0aGlzLmdyb3VwTmFtZX0tcHJldmApXHJcbiAgICAgICAgbGV0IG5leHRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0aGlzLmdyb3VwTmFtZX0tbmV4dGApXHJcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmdyb3VwTmFtZX0tZ3JvdXAuc2VsZWN0ZWRQYWdlYCk7XHJcblxyXG4gICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdID4gMCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRQYWdlcylcclxuICAgICAgICAgICAgICAgIHByZXZCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBwcmV2QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgaWYoIW5leHRCdXR0b24ucHJldmlvdXNFbGVtZW50U2libGluZy5jbGFzc0xpc3QuY29udGFpbnMoJ3NlbGVjdGVkUGFnZScpKXtcclxuICAgICAgICAgICAgICAgIG5leHRCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBuZXh0QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLnByZXZpb3VzQ29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAgKGkpID0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHByZXZQYWdlID0gdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdIC0gMTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdID0gcHJldlBhZ2U7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIlwiOyB9LCA5MjApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7dGhpcy5ncm91cE5hbWV9LWdyb3VwW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdfVwiXWApO1xyXG4gICAgICAgICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld0N1cnJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL2ZpeCByZXBlYXQgb2YgbmV4dEJ1dHRvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICAgICAgLy8gdGhpcy5uZXh0Q29udGVudERpcmVjdGlvbi5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgLy8gICAgIGVsLm9uY2xpY2sgPSAgKGkpID0+e1xyXG4gICAgICAgIC8vICAgICAgICAgbGV0IG5leHRQYWdlID0gdGhpcy5jdXJyZW50UGFnZXNbcGFnZU5hbWVdICsgMTtcclxuXHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmN1cnJlbnRQYWdlc1twYWdlTmFtZV0gPSBuZXh0UGFnZTtcclxuICAgICAgICAvLyAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5wYWdpbmF0ZSgpXHJcblxyXG4gICAgICAgIC8vICAgICAgICAgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3BhZ2VOYW1lfS1ncm91cFtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzW3BhZ2VOYW1lXX1cIl1gKTtcclxuICAgICAgICAvLyAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy8gfSlcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnaW5hdGlvbiIsImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIlxyXG5cclxuY2xhc3MgU2VhcmNoIHtcclxuICAgIC8vIDEuIGRlc2NyaWJlIGFuZCBjcmVhdGUvaW5pdGlhdGUgb3VyIG9iamVjdFxyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLmFkZFNlYXJjaEh0bWwoKTtcclxuICAgICAgICB0aGlzLmh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XHJcbiAgICAgICAgdGhpcy5oZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaGVhZGVyXCIpO1xyXG4gICAgICAgIHRoaXMucmVzdWx0c0RpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2VhcmNoLW92ZXJsYXlfX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgLy9JZiBvcGVuIGRpZiBvcGVuIGJ1dHRvbiBmb3IgbW9iaWxlIHZzIGRlc2t0b3BcclxuICAgICAgICB0aGlzLm9wZW5CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXNlYXJjaC10cmlnZ2VyXCIpO1xyXG4gICAgICAgIHRoaXMuY2xvc2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNlYXJjaC1vdmVybGF5X19jbG9zZVwiKTtcclxuICAgICAgICB0aGlzLnNlYXJjaE92ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNlYXJjaC1vdmVybGF5XCIpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoVGVybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gtdGVybScpO1xyXG4gICAgICAgIHRoaXMuaXNPdmVybGF5T3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucHJldmlvdXNWYWx1ZTtcclxuICAgICAgICB0aGlzLnR5cGluZ1RpbWVyO1xyXG4vL0dldCByaWQgb2YgdGhpcyBhbmQgdGhlIHBhZ2luYXRpb24gbG9naWMsIHJlc2V0aW5nIHRoZSBuZXdzIHJlbmRlcmluZ1xyXG4gICAgICAgIHRoaXMubmV3c1BhZ2VTZWxlY3Q7XHJcbiAgICAgICAgdGhpcy5uZXdzUGFnZU9wdGlvbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnROZXdzUGFnZSA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAyLiBldmVudHNcclxuICAgIGV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLm9wZW5CdXR0b24uZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuT3ZlcmxheSgpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuIFxyXG4gICAgICAgIHRoaXMuY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2VPdmVybGF5KCkpXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZSA9PiB0aGlzLmtleVByZXNzRGlzcGF0Y2hlcihlKSlcclxuICAgICAgICB0aGlzLnNlYXJjaFRlcm0uYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsICgpID0+IHRoaXMudHlwaW5nTG9naWMoKSlcclxuICAgIH1cclxuXHJcbiAgICAvLyAzLiBtZXRob2RzIChmdW5jdGlvbiwgYWN0aW9uLi4uKVxyXG4gICAgdHlwaW5nTG9naWMoKSB7XHJcbiAgICAgICAgaWYodGhpcy5zZWFyY2hUZXJtLnZhbHVlICE9PSB0aGlzLnByZXZpb3VzVmFsdWUpe1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50eXBpbmdUaW1lcik7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc2VhcmNoVGVybS52YWx1ZSl7XHJcbiAgICAgICAgICAgICAgICBpZighdGhpcy5pc1NwaW5uZXJWaXNpYmxlKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHNEaXYuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMudHlwaW5nVGltZXIgPSBzZXRUaW1lb3V0KHRoaXMuZ2V0UmVzdWx0cy5iaW5kKHRoaXMpLCA4MDApO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0c0Rpdi5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHJldmlvdXNWYWx1ZSA9IHRoaXMuc2VhcmNoVGVybS52YWx1ZTtcclxuICAgIH1cclxuLy9BZGQgY29sb3JpbmcgdG8gdGV4dCB0aGF0IG1hdGNoZXMgc2VhcmNoIHF1ZXJ5IGFuZmQgbWF5YmUgZG9uJ3Qgc2hvdyB0aXRsZSBhdCBhbGwgaWYgbm8gY29udGVudCg/KVxyXG4gICAgYXN5bmMgZ2V0UmVzdWx0cygpe1xyXG4gICAgICB0cnl7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL3NlYXJjaD90ZXJtPScgKyB0aGlzLnNlYXJjaFRlcm0udmFsdWUpOyBcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5jdXJyZW50TmV3c1BhZ2U7XHJcbiAgICAgICAgbGV0IHkgPSAwO1xyXG4gICAgICAgIGxldCBpdGVtO1xyXG4gICAgICAgIGNvbnN0IHBvc3RPdXRwdXQgPSAzO1xyXG4gICAgICAgIGNvbnN0IG5ld3MgPSByZXN1bHRzLnVwZGF0ZXNBbmROZXdzO1xyXG4gICAgICAgIGxldCBuZXdzUGFnZSA9IFtdO1xyXG4gICAgICAgIGxldCBuZXdzUGFnZXMgPSBbXTtcclxuICAgICAgICBsZXQgbmV3c1Nob3duO1xyXG4gICAgICAgIGxldCBwYWdlTGlzdE51bWJlciA9IDA7XHJcbiAgICAgICAgaWYobmV3cy5sZW5ndGgpe1xyXG4gICAgICAgICAgICBpZihuZXdzLmxlbmd0aCA8PSBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgIGxldCBwYWdlID0gbmV3c1BhZ2VzLmNvbmNhdChuZXdzKTtcclxuICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChuZXdzLmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGl0ZW0gPSAxOyBpdGVtIDw9IHBvc3RPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZW1vdmVkID0gbmV3cy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgaWYobmV3cy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlID0gbmV3cy5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gobmV3c1BhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKG5ld3NQYWdlcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICBuZXdzU2hvd24gPSBuZXdzUGFnZXNbeF07XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIG5ld3NTaG93biA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXN1bHRzRGl2LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uZS10aGlyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X19zZWN0aW9uLXRpdGxlXCI+UHJvcGVydGllczwvaDI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLnByb3BlcnRpZXMubGVuZ3RoID8gJzx1bCBjbGFzcz1cImxpbmstbGlzdCBtaW4tbGlzdFwiPicgOiBgPHA+Tm8gcHJvcGVydGllcyBtYXRjaCB0aGF0IHNlYXJjaC48L3A+YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLnByb3BlcnRpZXMubWFwKGl0ZW0gPT4gYDxsaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpc3BsYXlTcXVhcmVzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiZGlzcGxheUltYWdlc1wiIGRhdGEtbmFtZT1cIiR7aXRlbS50aXRsZS5yZXBsYWNlQWxsKCcgJywgJycpfVwiIHNyYz1cIiR7aXRlbS5pc0NvbXBsZXRlZCA/IGl0ZW0uaW1hZ2UgOiBpdGVtLnByb2plY3RlZEltYWdlfVwiIGFsdD1cIiR7aXRlbS50aXRsZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke2l0ZW0ucGVybWFsaW5rfVwiPiR7aXRlbS50aXRsZX08L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMucHJvcGVydGllcy5sZW5ndGggPyAnPC91bD4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbmUtdGhpcmRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheV9fc2VjdGlvbi10aXRsZVwiPk1lbWJlcnM8L2gyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5tZW1iZXJzLmxlbmd0aCA/ICc8dWwgY2xhc3M9XCJsaW5rLWxpc3QgbWluLWxpc3RcIj4nIDogYDxwPk5vIG1lbWJlcnMgbWF0Y2ggdGhhdCBzZWFyY2guPC9wPmB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5tZW1iZXJzLm1hcChpdGVtID0+IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPSR7aXRlbS5pbWFnZX1cIiBhbHQ9XCJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpdGVtLnRpdGxlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2l0ZW0ucG9zaXRpb25PclJvbGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke2l0ZW0ucGVybWFsaW5rfVwiPlJlYWQgTW9yZTwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMubWVtYmVycy5sZW5ndGggPyAnPC91bD4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvbmUtdGhpcmRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheV9fc2VjdGlvbi10aXRsZVwiPlVwZGF0ZXMgQW5kIE5ld3M8L2gyPlxyXG4gICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA/ICc8dWwgY2xhc3M9XCJsaW5rLWxpc3QgbWluLWxpc3RcIj4nIDogYDxwPk5vIG5ld3Mgb3IgdXBkYXRlcyBtYXRjaCB0aGF0IHNlYXJjaDwvcD4gIDxhIGhyZWY9XCIke3NpdGVEYXRhLnJvb3RfdXJsfS9jdXJyZW50XCI+R28gdG8gdmlld3MgYW5kIHVwZGF0ZSBzZWN0aW9uPC9hPmB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1Nob3duLm1hcChpdGVtID0+IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5ld3NcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxoND4ke2l0ZW0udGl0bGV9PC9oND5cclxuICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2l0ZW0uY2FwdGlvbi5sZW5ndGggPj0gMSA/IGl0ZW0uY2FwdGlvbiArICcgLSAnIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2l0ZW0uZGF0ZX0gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD4qcmVsYXRlZCB3aWxsIGdvIGhlcmU8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2l0ZW0uaW1hZ2UgIT09IG51bGwgPyBgPGltZyBzcmM9XCIke2l0ZW0uaW1hZ2V9XCIgYWx0PVwiXCI+YCA6IGA8ZGl2PiR7aXRlbS52aWRlb308L2Rpdj5gfVxyXG4gICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cInJlYWQtbW9yZVwiIGhyZWY9XCJhbGwtbmV3cy8jJHtpdGVtLmlkfVwiPlJlYWQgTW9yZS4uLjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID8gJzxkaXYgaWQ9XCJuZXdzLXBhZ2VzXCI+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPiAxID8gYDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJuZXdzLXBhZ2VcIiBkYXRhLXBhZ2U9XCIke3krK31cIj4gJHtwYWdlTGlzdE51bWJlciArPSAxfTwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX0gIFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID8gJzwvZGl2PicgOiAnJ30gIFxyXG4gICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA/ICc8L3VsPicgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgO1xyXG4gICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IGZhbHNlXHJcbiAgICAgICAgbGV0IGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wYWdlPScke3h9J11gKTtcclxuICAgICAgICBsaW5rLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdpcyBpdCBoYXBwZW5pbmcgYmVmb3JlIGNhdGNoPycpXHJcbiAgICAgIH1jYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGUpXHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coJ2lzIGl0IGhhcHBlbmluZyBhZnRlciBjYXRjaD8nKVxyXG4gICAgICAgICAgICB0aGlzLm5ld3NQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uZXdzLXBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubmV3c1BhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUudGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnROZXdzUGFnZSA9IHNlbGVjdGVkUGFnZS5kYXRhc2V0LnBhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzdWx0cygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpcyBpdCBoYXBwZW5pbmcgaW4gbmV3c1BhZ2VPcHRpb25zPycpXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIFxyXG4gICAgIH1cclxuXHJcbiAgICBrZXlQcmVzc0Rpc3BhdGNoZXIoZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XHJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PSA4MyAmJiAhdGhpcy5pc092ZXJsYXlPcGVuICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQudGFnTmFtZSAhPSBcIklOUFVUXCIgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC50YWdOYW1lICE9IFwiVEVYVEFSRUFcIikge1xyXG4gICAgICAgICAgICB0aGlzLm9wZW5PdmVybGF5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihlLmtleUNvZGUgPT09IDI3ICYmIHRoaXMuaXNPdmVybGF5T3Blbil7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VPdmVybGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9wZW5PdmVybGF5KCl7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hPdmVybGF5LmNsYXNzTGlzdC5hZGQoXCJzZWFyY2gtb3ZlcmxheS0tYWN0aXZlXCIpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICB0aGlzLnNlYXJjaFRlcm0udmFsdWUgPSAnJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpPT4gdGhpcy5zZWFyY2hUZXJtLmZvY3VzKCksIDMwMSk7XHJcbiAgICAgICAgdGhpcy5pc092ZXJsYXlPcGVuID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9ICAgXHJcbiAgICBcclxuICAgIGNsb3NlT3ZlcmxheSgpe1xyXG4gICAgICAgIHRoaXMuc2VhcmNoT3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKCdzZWFyY2gtb3ZlcmxheS0tYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy5oZWFkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5yZW1vdmUoJ2ZyZWV6ZScpO1xyXG4gICAgICAgIHRoaXMuaXNPdmVybGF5T3BlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFNlYXJjaEh0bWwoKXtcclxuICAgICAgICBkb2N1bWVudC5ib2R5Lmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgXCJiZWZvcmVlbmRcIixcclxuICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2VhcmNoLW92ZXJsYXlcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheV9fdG9wXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLXNlYXJjaCBzZWFyY2gtb3ZlcmxheV9faWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzZWFyY2gtdGVybVwiIHBsYWNlaG9sZGVyPVwiV2hhdCBhcmUgeW91IGxvb2tpbmcgZm9yP1wiIGlkPVwic2VhcmNoLXRlcm1cIiBhdXRvY29tcGxldGU9XCJmYWxzZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cImZhIGZhLXdpbmRvdy1jbG9zZSBzZWFyY2gtb3ZlcmxheV9fY2xvc2VcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cInNlYXJjaC1vdmVybGF5X19yZXN1bHRzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTZWFyY2giLCJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG4vL0NvbWJpbmUgd2l0aCBvdGhlciBwYWdpbmF0aW9uP1xyXG5cclxuY2xhc3MgU2hhZG93Qm94IHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbDtcclxuICAgICAgICB0aGlzLm1lZGlhTGluaztcclxuXHJcbiAgICAgICAgdGhpcy5tZWRpYVJlY2lldmVyO1xyXG4gICAgICAgIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbjtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50T3duZXJJZDsgXHJcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWVkaWE7XHJcbiAgICAgICAgdGhpcy5tZWRpYU1lbnU7XHJcbiAgICAgICAgdGhpcy5tZWRpYUNvbHVtbjtcclxuICAgICAgICB0aGlzLm1lZGlhVGh1bWI7XHJcbiAgICAgICAgdGhpcy5tZWRpYVBhZ2luYXRpb247XHJcblxyXG4gICAgICAgIHRoaXMudmlkZW9TcmM7XHJcbiAgICAgICAgdGhpcy5wbGF5QnV0dG9uO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbjtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhQ291bnQ7XHJcbiAgICAgICAgdGhpcy5wb3N0T3V0cHV0O1xyXG4gICAgICAgIHRoaXMucGFnZUNvdW50O1xyXG4gICAgICAgIHRoaXMucG9zdFBhZ2U7XHJcbiAgICAgICAgdGhpcy5wb3N0UGFnZXM7XHJcbiAgICAgICAgdGhpcy5jb250ZW50U2hvd247XHJcblxyXG4gICAgICAgIC8vUmVzZXQgd2hlbiBjaGFuZ2UgZmlsdGVyIGFuZCBkaXNtaXNzIGN1cnJlbnQgdmlkc1xyXG4gICAgICAgIHRoaXMuZ2FsbGVyeVBvc2l0aW9uOyBcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcztcclxuICAgICAgICB0aGlzLmN1cnJlbnRTZWxlY3Rpb247XHJcbiAgICAgICAgdGhpcy5wb3N0RmllbGQ7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWVkaWE7XHJcbiAgICAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLm5ld0xvYWQ7XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnRzKCl7XHJcbiAgICAgICAgdGhpcy5jb250ZW50U2hvd247XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG4gICAgICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcclxuICAgICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkID0gbnVsbDsgXHJcbiAgICAgICAgdGhpcy5tZWRpYUxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVkaWEtY2FyZCAqJyk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY3VycmVudC1tZWRpYScpO1xyXG4gICAgICAgIHRoaXMubWVkaWFNZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLW1lbnUnKTtcclxuICAgICAgICB0aGlzLm1lZGlhQ29sdW1uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNvbHVtbicpO1xyXG4gICAgICAgIHRoaXMubWVkaWFUaHVtYjtcclxuICAgICAgICB0aGlzLm1lZGlhUGFnaW5hdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1wYWdpbmF0aW9uJyk7XHJcbiAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb24gPSAwOyBcclxuICAgICAgICB0aGlzLnBvc3RGaWVsZCA9ICdnYWxsZXJ5JztcclxuICAgICAgICB0aGlzLmNsb3NlTWVkaWFCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY2xvc2UnKTtcclxuICAgICAgICB0aGlzLm5ld0xvYWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLm1lZGlhTGluay5mb3JFYWNoKG1lZGlhPT57XHJcbiAgICAgICAgICAgIG1lZGlhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PiB0aGlzLnNoYWRvd0JveChtZWRpYSkpXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZSA9PiB0aGlzLmtleVByZXNzRGlzcGF0Y2hlcihlKSlcclxuICAgICAgICB0aGlzLmNsb3NlTWVkaWFCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+dGhpcy5jbG9zZU1lZGlhUmVjaWV2ZXIoKSlcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgICAgICBzaGFkb3dCb3gobWVkaWEpe1xyXG4gICAgICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtcmVjaWV2ZXInKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFSZWNpZXZlci5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbiA9IHRydWU7IFxyXG4gICAgICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LmFkZCgnZnJlZXplJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcG9zdFR5cGUgPSBtZWRpYS5kYXRhc2V0LnBvc3Q7XHJcbiAgICAgICAgICAgIGxldCBkYXRhSWQgPSBwYXJzZUludChtZWRpYS5kYXRhc2V0LmlkKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHBvc3RUeXBlICE9PSAnbm9uZScpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRNZWRpYShwb3N0VHlwZSwgZGF0YUlkKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcklzb2xhdGVkTWVkaWEobWVkaWEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhc3luYyBnZXRNZWRpYShkYXRhVHlwZSwgZGF0YUlkKXtcclxuICAgICAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvbWVkaWE/cmVsYXRlZCcpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJlc3VsdHNbZGF0YVR5cGVdLmZvckVhY2goaXRlbT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHBvc3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0uZ2FsbGVyeSkpO1xyXG4gICAgICAgICAgICAgICAgaWYoaXRlbS5pZCA9PT0gZGF0YUlkKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzW2RhdGFUeXBlXSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaXRlbS5wb3N0VHlwZSA9PT0gJ3Byb3BlcnR5Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVkaWFNZW51LmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiZ2FsbGVyeVwiIGNsYXNzPVwiYWN0aXZlXCI+R2VuZXJhbDwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiaW50ZXJpb3JcIj5JbnRlcmlvcjwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiZmxvb3JQbGFuc1wiPkZsb29yIFBsYW5zPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJidWlsZGluZ1BsYW5zXCI+QnVpbGRpbmcgUGxhbnM8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZW51TGluayA9IHRoaXMubWVkaWFNZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVudUxpbmsuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdEZpZWxkID0gaS5jdXJyZW50VGFyZ2V0LmlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtW3RoaXMucG9zdEZpZWxkXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV3TG9hZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbE1lZGlhUG9wdWxhdGlvbihpdGVtLCBwb3N0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVudUxpbmsuZm9yRWFjaChjPT57Yy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTt9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIjBcIl1gKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiMFwiXWApLmNoaWxkcmVuWzBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgbGV0IGFsbE5ld3MgPSByZXN1bHRzWyd1cGRhdGVzJ10uY29uY2F0KHJlc3VsdHNbJ25ld3MnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBhbGxOZXdzLm1hcChyZXBvcnRzPT57XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICByZXBvcnRzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChwb3N0PT57XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgaWYocG9zdC5JRCA9PT0gaXRlbS5pZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIGl0ZW0uZ2FsbGVyeS5wdXNoKHJlcG9ydHMuZ2FsbGVyeSlcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBpZihkYXRhSWQgIT09ICB0aGlzLmN1cnJlbnRPd25lcklkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50T3duZXJJZCA9IGRhdGFJZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMubG9jYWxTdG9yYWdlID0gdGhpcy5jb250ZW50U2hvd247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbE1lZGlhUG9wdWxhdGlvbihpdGVtLCBwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgdGhpcy5hY2Nlc3NMb2NhbFN0b3JhZ2UoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3Qpe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gaWYgbW9yZSB0aGFuIG9uZSwgc2hvd1xyXG4gICAgICAgICAgICAvLyBpcyB0aGVyZSBhIG1vcmUgYWNjZXNzaWJsZS1mcmllbmRseSBodG1sIHRhZyBmb3IgZmlsdHJyIG1lbnVzP1xyXG4gICAgICAgICAgICAvL0hhdmUgZGVzYyB3aXRoICdyZWFkIG1vcmUnIHVuZGVyIGFjdGl2ZSB2aWQuIEV4ZXJwdCB1bmRlciBzZWxlY3Rpb24sIG9mIGV4aXN0cywgb3RoZXJ3aXNlIHRyaW1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZGF0YUNvdW50ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wb3N0T3V0cHV0ID0gMTtcclxuICAgICAgICAgICAgdGhpcy5wYWdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnBvc3RQYWdlID0gW107XHJcbiAgICAgICAgICAgIHRoaXMucG9zdFBhZ2VzID0gW107XHJcblxyXG4gIFxyXG4gICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCA8PSB0aGlzLnBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gdGhpcy5wb3N0UGFnZXMuY29uY2F0KHBvc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdFBhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocG9zdC5sZW5ndGggPiB0aGlzLnBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZW0gPSAxOyBpdGVtIDw9IHRoaXMucG9zdE91dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZW1vdmVkID0gcG9zdC5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gdGhpcy5wb3N0UGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdFBhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RQYWdlID0gcG9zdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdFBhZ2VzLnB1c2godGhpcy5wb3N0UGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLnBvc3RQYWdlcy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFNob3duID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnBvc3RQYWdlcykpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFNob3duID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbSlcclxuIFxyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRlTWVkaWFDb2x1bW4oaXRlbSwgdGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZXNdKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coaXRlbSlcclxuICAgICAgICAgICAgaWYodGhpcy5uZXdMb2FkID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmV3TG9hZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckN1cnJlbnRNZWRpYShpdGVtKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0UGFnaW5hdGlvbihpdGVtLCB0aGlzLmRhdGFDb3VudCwgdGhpcy5wYWdlQ291bnQpO1xyXG4gICAgICAgICAgICB9XHJcbiBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbmRlcklzb2xhdGVkTWVkaWEobWVkaWEpe1xyXG4gICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QucmVtb3ZlKCdhc3BlY3QtcmF0aW8nKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LmFkZCgnY2VudGVyLWRpc3BsYXknKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke21lZGlhLmRhdGFzZXQuZnVsbH1cIj5cclxuICAgICAgICAgICAgYDsgIFxyXG4gICBcclxuICAgICAgICAgICAgLy8gdGhpcy52aWRlb1NyYyA9IHRoaXMuY3VycmVudE1lZGlhLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLmRhdGFzZXQudmlkZW8ucmVwbGFjZSgnd2F0Y2g/dj0nLCAnZW1iZWQvJykgKyAnP2F1dG9wbGF5PTEnO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnBsYXlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGxheS1idXR0b24nKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnRoaXMucGxheVZpZGVvKHRoaXMudmlkZW9TcmMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbmRlckN1cnJlbnRNZWRpYShpdGVtKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmlubmVySFRNTCA9IGAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS52aWRlb1NvdXJjZSA/ICc8ZGl2IGlkPVwicGxheS1idXR0b24tY29udGFpbmVyXCI+PGJ1dHRvbiBpZD1cInBsYXktYnV0dG9uXCI+PGRpdj48L2Rpdj48L2J1dHRvbj48L2Rpdj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICA8aW1nIGRhdGEtdmlkZW89XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS52aWRlb1NvdXJjZX1cIiBzcmM9XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdW3RoaXMuZ2FsbGVyeVBvc2l0aW9uXS5pbWFnZX1cIj5cclxuICAgICAgICAgICAgYDsgIFxyXG5cclxuICAgICAgICAgICAgdGhpcy52aWRlb1NyYyA9IHRoaXMuY3VycmVudE1lZGlhLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLmRhdGFzZXQudmlkZW8ucmVwbGFjZSgnd2F0Y2g/dj0nLCAnZW1iZWQvJykgKyAnP2F1dG9wbGF5PTEnO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5wbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BsYXktYnV0dG9uJyk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLnBsYXlCdXR0b24pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCk9PnRoaXMucGxheVZpZGVvKHRoaXMudmlkZW9TcmMpKTtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5hZGQoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LnJlbW92ZSgnY2VudGVyLWRpc3BsYXknKTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QucmVtb3ZlKCdhc3BlY3QtcmF0aW8nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5hZGQoJ2NlbnRlci1kaXNwbGF5Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwb3B1bGF0ZU1lZGlhQ29sdW1uKGl0ZW0sIGNvbnRlbnQpe1xyXG4gICAgICAgICAgICB0aGlzLm1lZGlhQ29sdW1uLmlubmVySFRNTCA9IGBcclxuICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgJHtjb250ZW50Lm1hcChpID0+IGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtcG9zaXRpb249XCIke2l0ZW1bdGhpcy5wb3N0RmllbGRdLmZpbmRJbmRleChhPT57cmV0dXJuIGEuaWQgPT09IGkuaWR9KX1cIiAgY2xhc3M9XCJtZWRpYS1zZWxlY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cIm1lZGlhLXRodW1iXCIgc3JjPVwiJHtpLnNlbGVjdEltYWdlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtaW5mb3JtYXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aS50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2kuZGVzY3JpcHRpb259PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1lZGlhLXRodW1iJyk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iWzBdLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWxlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVkaWEtdGh1bWIuc2VsZWN0ZWQnKS5wYXJlbnROb2RlLmRhdGFzZXQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRTZWxlY3Rpb24pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFUaHVtYi5mb3JFYWNoKHRodW1iPT57XHJcbiAgICAgICAgICAgICAgICB0aHVtYi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVkaWFUaHVtYi5mb3JFYWNoKGM9PntjLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7fSlcclxuICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGUudGFyZ2V0KVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FsbGVyeVBvc2l0aW9uID0gZS50YXJnZXQucGFyZW50Tm9kZS5kYXRhc2V0LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWxlY3Rpb24gPSBlLnRhcmdldC5wYXJlbnROb2RlLmRhdGFzZXQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50U2VsZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vYWN0aXZhdGUgdGhlIHNlcGVyYXRlIGZ1bmN0aW9uIHRoYXQgZmlsbHMgdGhlIGN1cnJlbnRNZGlhIGNvbnRhaW5lclxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbnNlcnRQYWdpbmF0aW9uKGl0ZW0sIGRhdGFDb3VudCwgcGFnZUNvdW50KXtcclxuICAgICAgICAgICAgdGhpcy5tZWRpYVBhZ2luYXRpb24uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgJHt0aGlzLnBvc3RQYWdlcy5tYXAoKHBhZ2UpPT5gXHJcbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLnBvc3RQYWdlcy5sZW5ndGggPiAxID8gYDxhIGNsYXNzPVwiY29udGVudC1wYWdlXCIgZGF0YS1wYWdlPVwiJHtkYXRhQ291bnQrK31cIj4gJHtwYWdlQ291bnQgKz0gMX08L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuICAgICAgICAgICAgYDtcclxuXHJcbiAgICAgICAgICAgIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24gLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmZpcnN0UGFnZUJ1dHRvbilcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udGVudFBhZ2VPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21lZGlhLXBhZ2luYXRpb24gLmNvbnRlbnQtcGFnZScpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShpdGVtLCBjb250ZW50UGFnZU9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uZXdMb2FkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShpdGVtLCBjb250ZW50UGFnZU9wdGlvbnMpe1xyXG4gICAgICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLmN1cnJlbnRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFNlbGVjdGlvbilcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBwYXJzZUludChzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmluaXRpYWxNZWRpYVBvcHVsYXRpb24oaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZU1lZGlhQ29sdW1uKGl0ZW0sIHRoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VzXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57ICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgaWYoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke3RoaXMuY3VycmVudFNlbGVjdGlvbn1cIl1gKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHt0aGlzLmN1cnJlbnRTZWxlY3Rpb259XCJdYCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiJHt0aGlzLmN1cnJlbnRTZWxlY3Rpb259XCJdYCkuY2hpbGRyZW5bMF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KSAgICBcclxuXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgY2xvc2VNZWRpYVJlY2lldmVyKCl7XHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLm1lZGlhTWVudS5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lZGlhTWVudS5yZW1vdmVDaGlsZCh0aGlzLm1lZGlhTWVudS5maXJzdENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMubWVkaWFDb2x1bW4uZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZWRpYUNvbHVtbi5yZW1vdmVDaGlsZCh0aGlzLm1lZGlhQ29sdW1uLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5jdXJyZW50TWVkaWEuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEucmVtb3ZlQ2hpbGQodGhpcy5jdXJyZW50TWVkaWEuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFSZWNpZXZlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbiA9IGZhbHNlOyBcclxuICAgICAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5yZW1vdmUoJ2ZyZWV6ZScpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb24gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBvc3RGaWVsZCA9ICdnYWxsZXJ5JztcclxuXHJcbiAgICAgICAgICAgIHRoaXMubmV3TG9hZCA9IHRydWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGtleVByZXNzRGlzcGF0Y2hlcihlKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZS5rZXlDb2RlLCB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4pXHJcbiAgICAgICAgICAgIGlmKGUua2V5Q29kZSA9PT0gMjcgJiYgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNZWRpYVJlY2lldmVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXlWaWRlbyh2aWRlb1NyYyl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHZpZGVvU3JjKVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgPGlmcmFtZSBhbGxvd2Z1bGxzY3JlZW49XCJhbGxvd2Z1bGxzY3JlZW5cIiBzcmM9XCIke3ZpZGVvU3JjfVwiPjwvaWZyYW1lPlxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hhZG93Qm94OyIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcbmltcG9ydCBTaGFkb3dCb3ggZnJvbSAnLi9zaGFkb3dCb3gnO1xyXG4vL1RoZSBzaW1wbGljaXR5IG9mIHRoaXMgaXMgYSBjaGFuY2UgdG8gdHJ5IHRvIG1ha2UgbXkgcGFnaW5hdGlvbiBjb2RlIGFuZCBjb2RlIGluIGdlbmVyYWwgY2xlYW5lciBhbmQgbW9yZSBlZmZpY2llbnRcclxuY2xhc3MgUmVsYXRlZE5ld3N7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMubmV3c1JlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ld3MtcmVjaWV2ZXInKTtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFnaW5hdGlvbi1ob2xkZXInKTtcclxuICAgICAgICAvL2ludGVyZmVyZXMgd2l0aCBTQi4gRmlndXJlIG91dCBob3cgdG8gcHJldmVudCBvbiBwYWdlcyB3aGVyZSBpbnZhbGlkLlxyXG4gICAgICAgIC8vQWxzbyB3aXRoIGFsbC1uZXdzIGlmIG9ubHkgMSBwYWdlXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9zdElEID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5JbWFnZUFuZFN0YXRzIGltZycpLmRhdGFzZXQuaWQ7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IDA7XHJcbiAgICAgICAgdGhpcy5jb250ZW50U2hvd247XHJcbiAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICB0aGlzLmZldGNoUmVsYXRlZE5ld3MoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBmZXRjaFJlbGF0ZWROZXdzKCl7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvbWVkaWE/cmVsYXRlZCcpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgIGNvbnN0IGFsbE5ld3MgPSByZXN1bHRzLnVwZGF0ZXMuY29uY2F0KHJlc3VsdHMubmV3cyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0ZWROZXdzID0gW107IFxyXG4gICAgICAgICAgICBsZXQgbGltaXQgPSAxO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGFDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwYWdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAvL09yZ2FuaXplIHRoZSBuZXdzIHRoYXQncyB0aHJvd24gaW50byByZWxhdGVkTmV3cywgaW4gZGF0ZSBvcmRlclxyXG4gICAgICAgICAgICAvL0NvbnNpZGVyIHBlcmZvcm1pbmcgdGhlIGRhdGUgb3JkZXIgb24gYmFja2VuZCwgdGhvdWdoIGNvdWxkIGFubm95b25nLCBnaXZlbiBsZXNzIHBocCBleHBlcmllbmNlLCBidXQgY291bGQgYmUgYmVuZWZpY2lhbCB0byBwcm9ncmVzcyBvdmVyIGFsbCBcclxuICAgICAgICAgICAgaWYoIXRoaXMuY29udGVudExvYWRlZCl7XHJcbiAgICAgICAgICAgICAgICBhbGxOZXdzLmZvckVhY2gobmV3cyA9PntcclxuICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChyPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHIuSUQgPT09IHBhcnNlSW50KHRoaXMuY3VycmVudFBvc3RJRCkgJiYgbGltaXQgPD0gMil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW1pdCs9MVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRlZE5ld3MucHVzaChuZXdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgaWYocmVsYXRlZE5ld3MubGVuZ3RoKXsgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRTaG93biA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocmVsYXRlZE5ld3MpKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFNob3duID0gW107XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZVBhZ2luYXRpb25Ib2xkZXIoZGF0YUNvdW50LCBwYWdlQ291bnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlTmV3c1JlY2lldmVyKCk7XHJcblxyXG4gICBcclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwb3B1bGF0ZU5ld3NSZWNpZXZlcigpe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdKVxyXG4gICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgPGg0PiR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0udGl0bGV9PC9oND5cclxuICAgICAgICAgICAgPHA+JHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5jYXB0aW9uID8gYCR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uY2FwdGlvbn0gLWAgOiAnJ30gJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5kYXRlfTwvcD5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1lZGlhLWNhcmRcIj48aW1nIGRhdGEtcG9zdD1cIiR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0ucG9zdFR5cGVQbHVyYWx9XCIgZGF0YS1pZD1cIiR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uaWR9XCIgc3JjPVwiJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5nYWxsZXJ5WzBdLmltYWdlfVwiPjwvZGl2PlxyXG4gICAgICAgICAgICA8cD4ke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmZ1bGxEZXNjcmlwdGlvbn08L3A+XHJcbiAgICAgICAgYDtcclxuICBcclxuICAgICAgICBTaGFkb3dCb3gucHJvdG90eXBlLmV2ZW50cygpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFNoYWRvd0JveC5wcm90b3R5cGUubWVkaWFMaW5rKVxyXG4gICAgfVxyXG5cclxuICAgIHBvcHVsYXRlUGFnaW5hdGlvbkhvbGRlcihkYXRhQ291bnQsIHBhZ2VDb3VudCl7XHJcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uSG9sZGVyLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgJHt0aGlzLmNvbnRlbnRTaG93bi5sZW5ndGggPyAnPGRpdiBjbGFzcz1cImNvbnRlbnQtcGFnZXNcIj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLmxlbmd0aCA+IDEgPyBgPGEgY2xhc3M9XCJjb250ZW50LXBhZ2VcIiBkYXRhLXBhZ2U9XCIke2RhdGFDb3VudCsrfVwiPiAke3BhZ2VDb3VudCArPSAxfTwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX0gXHJcbiAgICAgICAgICAgICR7dGhpcy5jb250ZW50U2hvd24ubGVuZ3RoID8gJzwvZGl2PicgOiAnJ30gXHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuY29udGVudExvYWRlZCl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZmlyc3RQYWdlQnV0dG9uKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9ICAgICBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlJyk7XHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KCl7XHJcbiAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaFJlbGF0ZWROZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXHJcbiAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSkgIFxyXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZWxhdGVkTmV3cyAiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy9Mb29rIHVwIGhvdyB0byBidW5kbGUgc2NzcyBoZXJlIHVzaW5nIHdlYnBhY2sgYW5kIG1ha2UgdGhpcyBpbnRvIGFuIGltcG9ydCBmaWxlKEFsc28gdXNlIHNlcGVyYXRlIGZpbGUgZm9yIGdlbiBsb2dpYywgXHJcbi8vc28gY2FuIGNvbmRpdGlvbmFsIHRoaXMgZm9yIGZvcm1zKVxyXG5pbXBvcnQgJy4uL2Nzcy9zdHlsZS5jc3MnO1xyXG5pbXBvcnQgJy4uL2Nzcy9kb3RzLmNzcydcclxuXHJcbmltcG9ydCBTZWFyY2ggZnJvbSAnLi9tb2R1bGVzL3NlYXJjaCc7XHJcbmltcG9ydCBQYWdpbmF0aW9uIGZyb20gJy4vbW9kdWxlcy9wYWdpbmF0aW9uJztcclxuaW1wb3J0IE5ld3MgZnJvbSAnLi9tb2R1bGVzL2FsbC1uZXdzJztcclxuaW1wb3J0IFJlbGF0ZWROZXdzIGZyb20gJy4vbW9kdWxlcy9zaW5nbGVQb3N0JztcclxuaW1wb3J0IFNoYWRvd0JveCBmcm9tICcuL21vZHVsZXMvc2hhZG93Qm94JztcclxuXHJcbmNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcclxuY29uc3QgcGFnaW5hdGlvbiA9IG5ldyBQYWdpbmF0aW9uKCk7XHJcbmNvbnN0IG5ld3MgPSBuZXcgTmV3cygpO1xyXG5jb25zdCByZWxhdGVkTmV3cyA9IG5ldyBSZWxhdGVkTmV3cygpO1xyXG5jb25zdCBzaGFkb3dCb3ggPSBuZXcgU2hhZG93Qm94KCk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9