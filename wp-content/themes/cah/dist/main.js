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
___CSS_LOADER_EXPORT___.push([module.id, "@charset \"UTF-8\";\nhtml {\n  overflow-x: hidden;\n  height: 100%;\n  margin: 0;\n}\n@media (min-width: 767px) {\n  html {\n    font-size: 1.7vh;\n  }\n}\n@media (min-width: 1200px) {\n  html {\n    font-size: 1.85vh;\n  }\n}\nhtml.freeze {\n  overflow: hidden;\n}\n\nbody {\n  margin: 0;\n  color: antiquewhite;\n}\n\nh1 {\n  margin: 0;\n  margin-bottom: 3rem;\n  font-size: 4rem;\n}\n\nh2 {\n  font-size: 2.5rem;\n  margin: 0;\n}\n\nh3 {\n  font-size: 2.3rem;\n  margin: 0;\n}\n\na {\n  text-decoration: none;\n  color: inherit;\n}\n\na {\n  cursor: pointer;\n}\n\na.hidden, a.selectedPage {\n  pointer-events: none;\n}\n\na.hidden {\n  opacity: 0;\n}\n\na.selectedPage {\n  color: #e8aa77;\n  filter: saturate(120%);\n}\n\n*.hidden {\n  display: none;\n  pointer-events: none;\n}\n\ndiv, button {\n  box-sizing: border-box;\n}\n\nbutton {\n  border: none;\n  background: transparent;\n}\n\nli {\n  list-style-type: none;\n}\n\n#overallContainer {\n  position: relative;\n  top: 0;\n}\n#overallContainer.faded {\n  filter: opacity(40%);\n}\n\n.contentContainer {\n  height: initial;\n  width: 100%;\n  margin: 4% 0;\n  margin-bottom: 5%;\n  display: flex;\n  justify-content: center;\n}\n.contentContainer > div {\n  display: flex;\n  justify-content: center;\n  padding-top: 5.5rem;\n}\n@media (min-width: 767px) {\n  .contentContainer > div {\n    width: 95%;\n  }\n}\n@media (min-width: 1200px) {\n  .contentContainer > div {\n    width: 85%;\n  }\n}\n.contentContainer_paginated .textBox .content-pages {\n  text-align: center;\n}\n.contentContainer_paginated .textBox .content-pages a {\n  font-size: 1.75rem;\n}\n\n.titleAndTextBox, .contentBox {\n  position: relative;\n}\n\n.titleAndTextBox {\n  margin-right: 5%;\n}\n\n.titleBox, .textBox {\n  height: 50%;\n  width: 16rem;\n}\n\n.titleBox {\n  padding: 10%;\n}\n.titleBox > * {\n  height: 50%;\n  width: 100%;\n  margin: 0;\n}\n.titleBox > :nth-child(2) {\n  display: flex;\n}\n.titleBox > :nth-child(2) h2 {\n  align-self: flex-end;\n  padding-bottom: 15%;\n}\n\n.contentBox.properties, .contentBox.members {\n  display: grid;\n  row-gap: 0.35rem;\n}\n@media (min-width: 767px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(3, 33.3%);\n  }\n}\n@media (min-width: 1200px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(4, 25%);\n  }\n}\n\n.contentBox {\n  width: 100%;\n  height: 100%;\n}\n.contentBox.properties > div, .contentBox.members > div {\n  width: 14rem;\n}\n.contentBox.properties > div .displaySquares, .contentBox.members > div .displaySquares {\n  box-sizing: initial;\n  position: relative;\n  text-align: center;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.contentBox.properties > div .displaySquares .interaction-prompt, .contentBox.members > div .displaySquares .interaction-prompt {\n  text-align: center;\n  position: absolute;\n  background-color: rgba(20, 20, 20, 0.7);\n  padding: 0.2rem 0.2rem;\n  margin-top: 7.6rem;\n  border-radius: 30%;\n  font-size: 1.5rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares .interaction-prompt .click-prompt, .contentBox.members > div .displaySquares .interaction-prompt .click-prompt {\n    display: none;\n  }\n}\n.contentBox.properties > div .displaySquares .interaction-prompt .hover-prompt, .contentBox.members > div .displaySquares .interaction-prompt .hover-prompt {\n  display: none;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares .interaction-prompt .hover-prompt, .contentBox.members > div .displaySquares .interaction-prompt .hover-prompt {\n    display: block;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks, .contentBox.members > div .displaySquares-pageLinks {\n  position: absolute;\n  display: none;\n  flex-direction: column;\n  width: 100%;\n  text-align: center;\n}\n.contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n  color: rgb(238, 231, 210);\n  cursor: pointer;\n  font-size: 1.5rem;\n  margin-top: 0.7rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n    font-size: 1.3rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n  font-size: 2rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n    font-size: 1.4rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks *:hover, .contentBox.members > div .displaySquares-pageLinks *:hover {\n  transform: scale(110%);\n  filter: brightness(120%);\n}\n.contentBox.properties > div .displaySquares-pageLinks i, .contentBox.members > div .displaySquares-pageLinks i {\n  font-size: 1.4rem;\n}\n.contentBox.properties > div .displaySquares .displaySquares-pageLinks__visible, .contentBox.members > div .displaySquares .displaySquares-pageLinks__visible {\n  display: flex;\n}\n.contentBox.properties > div .displaySquares div p, .contentBox.properties > div .displaySquares div a, .contentBox.members > div .displaySquares div p, .contentBox.members > div .displaySquares div a {\n  margin: 2%;\n}\n.contentBox.properties > div .display-text, .contentBox.members > div .display-text {\n  margin-top: -0.3rem;\n  text-align: center;\n  font-size: 1.3rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.2rem;\n}\n.contentBox.properties > div .display-text p, .contentBox.members > div .display-text p {\n  margin: 0;\n}\n.contentBox.properties > div .display-text p:nth-of-type(2), .contentBox.members > div .display-text p:nth-of-type(2) {\n  font-weight: 700;\n}\n.contentBox .news {\n  margin: 0 1%;\n  padding-top: 5%;\n  height: auto;\n}\n.contentBox .news iframe {\n  width: 300px;\n  height: 200px;\n}\n\n#footerContainer {\n  background-color: rgba(39, 39, 39, 0.6);\n  margin: 0;\n  display: flex;\n  position: fixed;\n  bottom: 0;\n  width: 100%;\n  text-align: center;\n  justify-content: flex-end;\n  padding-right: 2rem;\n  color: ivory;\n}\n#footerContainer p {\n  margin: 1rem;\n}\n@media (min-width: 1200px) {\n  #footerContainer p {\n    margin: 0.65rem;\n  }\n}\n\n#openingContainer {\n  height: 99.5vh;\n  position: relative;\n  color: rgb(189, 189, 189);\n  display: flex;\n  justify-content: center;\n}\n#openingContainer h1 {\n  font-size: 5.2rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer h1 {\n    font-size: 6.5rem;\n  }\n}\n#openingContainer p {\n  font-size: 2.5rem;\n  font-weight: 600;\n}\n@media (min-width: 1200px) {\n  #openingContainer p {\n    font-size: 2.7rem;\n  }\n}\n#openingContainer #welcomeContainer div {\n  text-shadow: 1px 1px black;\n  width: 80%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer div {\n    width: 70%;\n  }\n}\n#openingContainer header {\n  display: grid;\n  grid-auto-flow: row;\n  grid-template-columns: 4% 25% 1fr;\n  background-color: rgba(70, 62, 55, 0.85);\n  box-shadow: 0.2rem 0.2rem 1rem 0.4rem inset rgba(49, 43, 39, 0.75);\n  width: 100%;\n  height: 5rem;\n  position: fixed;\n  top: 0;\n  z-index: 9999;\n  color: rgb(199, 187, 156);\n}\n#openingContainer header.hidden {\n  display: none;\n}\n#openingContainer header button {\n  font-size: 1.8rem;\n  width: 10rem;\n  cursor: pointer;\n}\n#openingContainer header button i {\n  display: inline;\n}\n#openingContainer header #logo-symbol, #openingContainer header #logo-text {\n  height: 4rem;\n}\n#openingContainer header #logo-symbol {\n  margin-top: 0.3rem;\n  padding-left: 0.5rem;\n}\n#openingContainer header #logo-text {\n  margin-top: 0.6rem;\n  padding-left: 0.2rem;\n}\n#openingContainer header img {\n  height: 100%;\n}\n#openingContainer header p, #openingContainer header nav {\n  margin: 0;\n}\n#openingContainer header nav {\n  margin-right: 2rem;\n}\n#openingContainer header nav ul {\n  margin: 0;\n  padding: 0;\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1.5rem;\n}\n#openingContainer header nav ul li a {\n  font-size: 1.8rem;\n  text-shadow: 1px 1px black;\n}\n#openingContainer #pageImage {\n  position: absolute;\n  top: 0;\n  height: 100%;\n  width: 100%;\n}\n#openingContainer #pageImage img {\n  height: 100%;\n  width: 100%;\n  filter: blur(0.6rem) grayscale(50%);\n}\n#openingContainer #welcomeContainer {\n  position: absolute;\n  text-align: center;\n  align-items: center;\n  margin-top: 1%;\n  display: flex;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer {\n    margin-top: 2%;\n  }\n}\n#openingContainer #welcomeContainer img {\n  height: 6rem;\n}\n\n.titleBox {\n  background: transparent;\n}\n.titleBox p {\n  font-size: 1.5rem;\n}\n\n.textBox {\n  padding-left: 0.5rem;\n}\n.textBox p {\n  font-size: 1.3rem;\n  color: white;\n}\n\n#propertiesContainer > div .titleBox, #membersContainer > div .titleBox {\n  border: 0.35rem solid rgb(199, 187, 156);\n}\n#propertiesContainer img, #membersContainer img {\n  width: 100%;\n  height: 100%;\n  margin-bottom: 1rem;\n}\n#propertiesContainer img.pageLinks__visible, #membersContainer img.pageLinks__visible {\n  filter: brightness(27%);\n}\n\n#allNewsContainer {\n  height: 51rem;\n}\n@media (min-width: 1200px) {\n  #allNewsContainer {\n    height: 52rem;\n  }\n}\n\n#contactContainer {\n  height: 55rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer {\n    height: 52rem;\n  }\n}\n\n#allNewsContainer, #contactContainer {\n  background-color: rgb(31, 27, 21);\n  color: white;\n}\n#allNewsContainer > div .titleBox, #contactContainer > div .titleBox {\n  border: 4px solid rgb(221, 221, 221);\n}\n#allNewsContainer > div .textBox p, #contactContainer > div .textBox p {\n  color: antiquewhite;\n}\n#allNewsContainer .contentBox, #contactContainer .contentBox {\n  display: flex;\n  font-size: 1.1rem;\n}\n#allNewsContainer .contentBox > div, #contactContainer .contentBox > div {\n  flex-basis: 50%;\n  height: 100%;\n}\n#allNewsContainer .contentBox > div > div, #contactContainer .contentBox > div > div {\n  overflow: auto;\n  height: 92%;\n}\n#allNewsContainer .contentBox .form-message, #contactContainer .contentBox .form-message {\n  height: auto;\n}\n#allNewsContainer .contentBox h3, #contactContainer .contentBox h3 {\n  text-align: center;\n  height: 8%;\n}\n#allNewsContainer .contentBox ul, #contactContainer .contentBox ul {\n  padding: 0;\n}\n#allNewsContainer .contentBox ul li, #contactContainer .contentBox ul li {\n  display: inline;\n}\n#allNewsContainer .contentBox .news, #contactContainer .contentBox .news {\n  border: 1px solid rgba(233, 233, 233, 0.3);\n}\n#allNewsContainer .contentBox .news::after, #contactContainer .contentBox .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#allNewsContainer .contentBox .news img, #contactContainer .contentBox .news img {\n  width: 13rem;\n  float: left;\n  margin-right: 2.5%;\n  cursor: pointer;\n}\n#allNewsContainer .contentBox .news p, #contactContainer .contentBox .news p {\n  line-height: 1.2rem;\n  font-size: 1.25rem;\n}\n#allNewsContainer .contentBox .news, #allNewsContainer .contentBox form, #contactContainer .contentBox .news, #contactContainer .contentBox form {\n  padding: 0 5%;\n}\n#allNewsContainer .contentBox form, #contactContainer .contentBox form {\n  display: grid;\n  -moz-column-gap: 1.2rem;\n       column-gap: 1.2rem;\n  grid-template-areas: \"contactName contactEmail\" \"contactPhone contactSubject\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"submit ...\";\n}\n#allNewsContainer .contentBox form #contact-name, #contactContainer .contentBox form #contact-name {\n  grid-area: contactName;\n}\n#allNewsContainer .contentBox form #contact-email, #contactContainer .contentBox form #contact-email {\n  grid-area: contactEmail;\n}\n#allNewsContainer .contentBox form #contact-phone, #contactContainer .contentBox form #contact-phone {\n  grid-area: contactPhone;\n}\n#allNewsContainer .contentBox form #contact-subject, #contactContainer .contentBox form #contact-subject {\n  grid-area: contactSubject;\n}\n#allNewsContainer .contentBox form #contact-message, #contactContainer .contentBox form #contact-message {\n  grid-area: contactMessage;\n}\n\n#contactContainer {\n  background: black;\n  color: white;\n}\n#contactContainer .contentBox {\n  -moz-column-gap: 3rem;\n       column-gap: 3rem;\n  width: 85%;\n  display: flex;\n  padding-bottom: 1rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox {\n    width: 70%;\n  }\n}\n#contactContainer .contentBox img {\n  filter: saturate(120%);\n  width: 45%;\n  margin-left: 2rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox img {\n    width: 50%;\n    margin-left: 0;\n  }\n}\n#contactContainer .contentBox label.error {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: rgb(120, 179, 158);\n}\n#contactContainer .contentBox form {\n  margin-top: 3rem;\n}\n#contactContainer .contentBox form > div {\n  margin: 5% 0;\n  margin-top: 0;\n}\n#contactContainer .contentBox form label {\n  font-size: 1.4rem;\n}\n#contactContainer .contentBox form [type=radio] {\n  width: 10%;\n  display: initial;\n}\n#contactContainer .contentBox form ul {\n  padding: 0;\n}\n#contactContainer .contentBox form input, #contactContainer .contentBox form select {\n  display: block;\n  margin-top: 2%;\n}\n#contactContainer .contentBox form input {\n  height: 1.5rem;\n}\n#contactContainer .contentBox form select {\n  height: 2rem;\n}\n#contactContainer .contentBox form textarea {\n  width: 100%;\n  height: 18rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox form textarea {\n    height: 20rem;\n  }\n}\n#contactContainer .contentBox form button {\n  grid-area: submit;\n  color: ivory;\n  font-size: 1.3rem;\n  text-align: left;\n}\n\n.dot-pulse {\n  top: 20%;\n  left: 35%;\n}\n\n#pop-up-display-box {\n  background-color: rgba(45, 41, 35, 0.8);\n  width: 94vw;\n  height: 87vh;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 8vh;\n  left: 3vw;\n  display: none;\n  row-gap: 1rem;\n  align-items: center;\n  flex-direction: column;\n  padding-top: 1rem;\n}\n#pop-up-display-box img {\n  width: 27rem;\n}\n#pop-up-display-box a, #pop-up-display-box button {\n  font-size: 2rem;\n}\n#pop-up-display-box button {\n  color: antiquewhite;\n  cursor: pointer;\n}\n#pop-up-display-box button:hover, #pop-up-display-box a:hover {\n  filter: brightness(72%);\n}\n#pop-up-display-box #content-holder {\n  display: flex;\n  justify-content: space-evenly;\n  position: relative;\n  width: 70%;\n}\n#pop-up-display-box #content-holder .pop-up-directional {\n  font-size: 2.5rem;\n}\n\n#news-media-display {\n  background-color: rgba(44, 52, 77, 0.8);\n  height: 88vh;\n  width: 94vw;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 7vh;\n  left: 3vw;\n  display: none;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n}\n\n#singleContainer {\n  height: 87%;\n  min-width: 60%;\n  top: 8.3%;\n  display: flex;\n  flex-wrap: wrap;\n  position: absolute;\n  z-index: 1;\n  padding: 1.5rem 1rem;\n  padding-bottom: 1rem;\n  background-color: rgba(37, 35, 34, 0.9);\n}\n#singleContainer h4 {\n  font-size: 1.6rem;\n}\n#singleContainer h3, #singleContainer h4, #singleContainer .related-link {\n  color: rgb(241, 218, 189);\n}\n#singleContainer #mainImageAndStats {\n  width: 21vw;\n  text-align: center;\n}\n#singleContainer #mainImageAndStats img {\n  height: 42%;\n}\n#singleContainer #mainImageAndStats ul {\n  padding-left: 20%;\n  font-size: 1.65rem;\n  text-align: left;\n  margin-top: 1rem;\n}\n#singleContainer #mainImageAndStats ul li {\n  margin-top: 0.6rem;\n  list-style-type: square;\n}\n#singleContainer #mainImageAndStats ul li a {\n  filter: brightness(115%);\n}\n#singleContainer #singleInfo {\n  width: 30vw;\n  display: grid;\n  grid-template-rows: 7% 1fr;\n  height: 100%;\n}\n#singleContainer #singleInfo p {\n  margin-top: 1.2rem;\n  font-size: 1.7rem;\n  height: 99%;\n}\n#singleContainer #singleInfo div {\n  overflow: auto;\n  padding: 0 1rem;\n}\n#singleContainer #singleInfo #mediaContainer {\n  height: auto;\n}\n#singleContainer #singleInfo #mediaContainer iframe {\n  width: 200px;\n  height: 200px;\n}\n#singleContainer #vidAndImgCol {\n  height: 100%;\n  width: 16vw;\n  overflow: auto;\n  overflow-x: hidden;\n  text-align: center;\n}\n#singleContainer #vidAndImgCol h3 {\n  font-size: 1.9rem;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col {\n  width: 26vw;\n  position: relative;\n  height: 100%;\n  overflow: auto;\n  padding: 0 1rem;\n  display: grid;\n  grid-template-rows: 10% 1fr 4%;\n}\n#singleContainer #updates-col h3 {\n  font-size: 2rem;\n}\n#singleContainer #updates-col h3 a {\n  font-size: 1.7rem;\n}\n#singleContainer #updates-col h3 a:hover {\n  color: white;\n}\n#singleContainer #updates-col #news-reciever {\n  overflow: auto;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col #news-reciever p {\n  font-size: 1.4rem;\n  padding-right: 1rem;\n}\n#singleContainer #updates-col #pagination-holder {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n  font-size: 1.8rem;\n  display: flex;\n  justify-content: center;\n}\n\nbody {\n  background-color: rgb(100, 92, 82);\n}\n\n.search-overlay {\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(72, 68, 62, 0.96);\n  visibility: hidden;\n  opacity: 0;\n  transform: scale(1.09);\n  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;\n  box-sizing: border-box;\n}\n.search-overlay .container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n.search-overlay p {\n  padding-top: 1rem;\n}\nbody.admin-bar .search-overlay {\n  top: 2rem;\n}\n.search-overlay__top {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n.search-overlay__icon {\n  margin-right: 0.75rem;\n  font-size: 2.5rem;\n  color: rgb(148, 121, 105);\n}\n.search-overlay--active {\n  visibility: visible;\n  opacity: 1;\n  transform: scale(1);\n}\n.search-overlay__section-title {\n  margin: 30px 0 1px 0;\n  font-weight: 400;\n  font-size: 2rem;\n  padding: 15px 0;\n  border-bottom: 1px solid #ccc;\n}\n.search-overlay__close {\n  font-size: 2.7rem;\n  cursor: pointer;\n  transition: all 0.3s;\n  background-color: rgb(58, 54, 54);\n  color: rgb(180, 171, 166);\n  line-height: 0.7;\n}\n.search-overlay__close:hover {\n  opacity: 1;\n}\n.search-overlay .one-half {\n  padding-bottom: 0;\n}\n\n.search-term {\n  width: 75%;\n  box-sizing: border-box;\n  border: none;\n  padding: 1rem 0;\n  margin: 0;\n  background-color: transparent;\n  font-size: 1rem;\n  font-weight: 300;\n  outline: none;\n  color: rgb(218, 201, 182);\n}\n\n.body-no-scroll {\n  overflow: hidden;\n}\n\n.container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n}\n\n@media (min-width: 960px) {\n  .search-term {\n    width: 80%;\n    font-size: 3rem;\n  }\n}\n@-webkit-keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.spinner-loader {\n  margin-top: 45px;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  border: 0.25rem solid rgba(0, 0, 0, 0.2);\n  border-top-color: black;\n  -webkit-animation: spin 1s infinite linear;\n  animation: spin 1s infinite linear;\n}\n\n.media-card button {\n  color: white;\n  cursor: pointer;\n  font-size: 2.1rem;\n}\n\nh1, h2, h3, h4 {\n  font-family: \"Libre Caslon Text\", serif;\n}\n\n.news p, .textBox p, #relationship-link, #single-link {\n  font-family: \"Libre Caslon Display\", serif;\n}\n\nh1 {\n  font-weight: 700;\n}\n\nh2 {\n  font-weight: 400;\n}\n\n.display-text, #welcomeContainer p, .titleBox p {\n  font-family: \"Cormorant SC\", serif;\n}\n\ninput, .read-more, .news li a, header li a, #realtimeFiltersAndSorting button, #search-filters button, #reset-all {\n  font-family: \"Lora\", serif;\n}\n\n.search-form {\n  position: fixed;\n  top: 50%;\n  color: white;\n}\n\n.content-loader {\n  background-color: transparent;\n  height: 50%;\n  position: absolute;\n}\n.content-loader .ball {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(47, 163, 56);\n  border-radius: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader[data-text]::before {\n  position: absolute;\n}\n.content-loader.loader.is-active::before {\n  position: absolute;\n  width: 50%;\n  left: 25%;\n  top: 39%;\n  font-size: 2.7rem;\n  color: rgb(195, 168, 126);\n  background-color: transparent;\n}\n.content-loader.loader-bar-ping-pong::after {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(101, 148, 187);\n  -webkit-animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader.is-active {\n  height: 97%;\n  z-index: 0;\n  background-color: rgba(51, 49, 56, 0.7490196078);\n  -webkit-animation: blink 1.8s linear infinite alternate;\n          animation: blink 1.8s linear infinite alternate;\n}\n\n@-webkit-keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@-webkit-keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n@keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n#all-news-container {\n  height: 85%;\n  top: 9%;\n  width: 95%;\n  left: 2.5%;\n  background-color: rgba(37, 35, 34, 0.75);\n  position: absolute;\n  display: flex;\n  color: aliceblue;\n}\n#all-news-container button {\n  color: antiquewhite;\n}\n#all-news-container #media-container, #all-news-container #filters-and-links-container, #all-news-container #selected-news-container {\n  position: relative;\n  height: 100%;\n}\n#all-news-container #filters-and-links-container {\n  border: 0.2rem solid rgba(212, 193, 130, 0.4);\n  border-left: none;\n  padding-left: 1.5rem;\n  display: grid;\n  grid-template-areas: \"realtimeFiltersAndSorting\" \"searchFilters\" \"resetAll\";\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting {\n  grid-area: realtimeFiltersAndSorting;\n  display: grid;\n  margin-top: 1.5rem;\n  grid-template-areas: \"headingRFS headingRFS\" \"orderBy toggleType\" \"filterDate filterDate\";\n  width: 100%;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button, #all-news-container #filters-and-links-container #realtime-filters-and-sorting label {\n  font-size: 1.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting h2 {\n  grid-area: headingRFS;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #order-by {\n  grid-area: orderBy;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #toggle-type {\n  grid-area: toggleType;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date {\n  grid-area: filterDate;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date div ul {\n  display: flex;\n  gap: 3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul {\n  padding-left: 0.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul li {\n  margin-top: 0.5rem;\n}\n#all-news-container #filters-and-links-container #search-filters {\n  grid-area: searchFilters;\n  display: grid;\n  grid-template-areas: \"headingSF headingSF headingSF\" \"newsSearch newsSearch newsSearch\" \"caseSensitive fullWordOnly wordStartOnly\" \"includeTitle includeDescription ...\";\n}\n#all-news-container #filters-and-links-container #search-filters h2 {\n  grid-area: headingSF;\n}\n#all-news-container #filters-and-links-container #search-filters button {\n  font-size: 1.2rem;\n  text-align: left;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container {\n  grid-area: newsSearch;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container #news-search {\n  font-size: 1.15rem;\n  height: 2.3rem;\n  width: 18rem;\n}\n#all-news-container #filters-and-links-container #search-filters #full-word-only {\n  grid-area: fullWordOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only {\n  grid-area: wordStartOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #case-sensitive {\n  grid-area: caseSensitive;\n}\n#all-news-container #filters-and-links-container #search-filters #include-title {\n  grid-area: includeTitle;\n}\n#all-news-container #filters-and-links-container #search-filters #include-description {\n  grid-area: includeDescription;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive, #all-news-container #filters-and-links-container #search-filters button.inactive {\n  pointer-events: none;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive span, #all-news-container #filters-and-links-container #search-filters button.inactive span {\n  color: red;\n}\n#all-news-container #filters-and-links-container button, #all-news-container #filters-and-links-container select, #all-news-container #filters-and-links-container label {\n  font-size: 1.1rem;\n}\n#all-news-container #filters-and-links-container #reset-all {\n  font-size: 1.4rem;\n  grid-area: resetAll;\n}\n#all-news-container #filters-and-links-container button {\n  cursor: pointer;\n}\n#all-news-container #filters-and-links-container h3 {\n  font-size: 1.7rem;\n}\n#all-news-container #filters-and-links-container h4 {\n  font-size: 1.5rem;\n  margin-bottom: 0.8rem;\n}\n#all-news-container #selected-news-container {\n  width: 66%;\n  display: grid;\n  grid-template-rows: 10% 84% 6%;\n  border: 0.2rem solid rgb(180, 174, 164);\n}\n#all-news-container #selected-news-container h2 {\n  width: 100%;\n  text-align: center;\n  font-size: 3rem;\n  margin-bottom: 1rem;\n  border-bottom: 0.3rem solid rgb(185, 158, 122);\n}\n#all-news-container #selected-news-container #dismiss-selection {\n  position: absolute;\n}\n#all-news-container #selected-news-container #dismiss-selection.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #selected-news-reciever {\n  margin-bottom: 0.5rem;\n  padding-right: 2rem;\n  overflow: auto;\n}\n#all-news-container #selected-news-container #full-display-container {\n  padding-left: 2rem;\n}\n#all-news-container #selected-news-container #main-display.dismissed, #all-news-container #selected-news-container #full-display-container.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #main-display .news, #all-news-container #selected-news-container #full-display-container .news {\n  font-size: 1.2rem;\n  padding-top: 0;\n}\n#all-news-container #selected-news-container #main-display .news::after, #all-news-container #selected-news-container #full-display-container .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#all-news-container #selected-news-container #main-display .news img, #all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news img, #all-news-container #selected-news-container #full-display-container .news iframe {\n  float: left;\n  margin-right: 2%;\n}\n#all-news-container #selected-news-container #main-display .news p, #all-news-container #selected-news-container #full-display-container .news p {\n  line-height: 1.2rem;\n}\n#all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news iframe {\n  width: 150px;\n  height: 100px;\n}\n#all-news-container #selected-news-container #main-display ul li, #all-news-container #selected-news-container #full-display-container ul li {\n  list-style-type: circle;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link, #all-news-container #selected-news-container #main-display ul li .relationship-link, #all-news-container #selected-news-container #full-display-container ul li .see-more-link, #all-news-container #selected-news-container #full-display-container ul li .relationship-link {\n  cursor: pointer;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link.dismissed, #all-news-container #selected-news-container #main-display ul li .relationship-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .see-more-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .relationship-link.dismissed {\n  display: none;\n}\n#all-news-container #filters-and-links-container {\n  width: 36%;\n  padding-top: 1rem;\n}\n#all-news-container #pagination-holder {\n  width: 100%;\n}\n#all-news-container #pagination-holder.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n#all-news-container #pagination-holder .content-pages a {\n  cursor: pointer;\n  font-size: 1.9rem;\n  margin-left: 0.5rem;\n}\n#all-news-container #pagination-holder .content-pages a.hidden, #all-news-container #pagination-holder .content-pages a.selectedPage {\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages a.hidden {\n  opacity: 0;\n}\n\n#media-reciever {\n  display: none;\n  position: fixed;\n  background-color: rgba(10, 10, 10, 0.8);\n  top: 7%;\n  width: 100%;\n  height: 95%;\n  z-index: 1;\n}\n#media-reciever #current-media {\n  margin-left: 14rem;\n  position: absolute;\n  top: 3rem;\n  height: 45rem;\n  width: 80rem;\n}\n#media-reciever #current-media iframe, #media-reciever #current-media img {\n  width: 100%;\n  height: 100%;\n}\n#media-reciever #current-media #play-button-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: absolute;\n  height: 100%;\n  width: 100%;\n}\n#media-reciever #current-media #play-button-container #play-button {\n  height: 6rem;\n  width: 9rem;\n  background-color: rgba(99, 100, 179, 0.8);\n  position: absolute;\n  border-radius: 35%;\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  transition: opacity 0.2s ease;\n}\n#media-reciever #current-media #play-button-container #play-button div {\n  border-left: 3rem solid rgb(125, 150, 168);\n  border-top: 1.7rem solid transparent;\n  border-bottom: 1.7rem solid transparent;\n}\n#media-reciever #current-media #play-button-container #play-button:hover {\n  opacity: 0.7;\n}\n#media-reciever #current-media.center-display {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface {\n  display: flex;\n  flex-direction: column;\n  position: absolute;\n  height: 82%;\n  overflow: auto;\n  right: 2rem;\n  top: 3rem;\n}\n#media-reciever #media-selection-interface #media-menu {\n  font-size: 1.2rem;\n  display: flex;\n}\n#media-reciever #media-selection-interface #media-menu a {\n  color: azure;\n  margin-left: 2rem;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-menu a.active {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column {\n  max-width: 380px;\n  display: flex;\n  flex-direction: column;\n  overflow: auto;\n}\n#media-reciever #media-selection-interface #media-column .media-selection {\n  display: flex;\n  margin-top: 1rem;\n  width: 100%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb {\n  width: 45%;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb.selected {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information {\n  display: flex;\n  flex-direction: column;\n  margin-left: 1rem;\n  width: 55%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p {\n  margin: 0;\n  color: beige;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p:nth-of-type(2) {\n  margin-top: 1rem;\n}\n#media-reciever #media-selection-interface #media-pagination {\n  margin-top: 1.5rem;\n  color: aliceblue;\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface #media-pagination a {\n  font-size: 1.2rem;\n  margin-left: 1rem;\n}\n#media-reciever #media-close {\n  position: absolute;\n  color: white;\n  left: 3.5rem;\n  top: 3.5rem;\n  font-size: 3.5rem;\n  cursor: pointer;\n}\n\n.media-card:hover img, .property-media-card:hover img {\n  filter: brightness(50%);\n  cursor: pointer;\n}\n.media-card:hover h3, .media-card:hover p, .media-card:hover button, .property-media-card:hover h3, .property-media-card:hover p, .property-media-card:hover button {\n  filter: contrast(40%);\n  cursor: pointer;\n}\n\n.loader {\n  color: #fff;\n  position: fixed;\n  box-sizing: border-box;\n  left: -9999px;\n  top: -9999px;\n  width: 0;\n  height: 0;\n  overflow: hidden;\n  z-index: 999999;\n}\n\n.loader:after, .loader:before {\n  box-sizing: border-box;\n  display: none;\n}\n\n.loader.is-active {\n  background-color: rgba(0, 0, 0, 0.85);\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.loader.is-active:after, .loader.is-active:before {\n  display: block;\n}\n\n@-webkit-keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n\n@keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.loader[data-text]:before {\n  position: fixed;\n  left: 0;\n  top: 50%;\n  color: currentColor;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  width: 100%;\n  font-size: 14px;\n}\n\n.loader[data-text=\"\"]:before {\n  content: \"Loading\";\n}\n\n.loader[data-text]:not([data-text=\"\"]):before {\n  content: attr(data-text);\n}\n\n.loader[data-text][data-blink]:before {\n  -webkit-animation: blink 1s linear infinite alternate;\n          animation: blink 1s linear infinite alternate;\n}\n\n.loader-default[data-text]:before {\n  top: calc(50% - 63px);\n}\n\n.loader-default:after {\n  content: \"\";\n  position: fixed;\n  width: 48px;\n  height: 48px;\n  border: 8px solid #fff;\n  border-left-color: transparent;\n  border-radius: 50%;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-default[data-half]:after {\n  border-right-color: transparent;\n}\n\n.loader-default[data-inverse]:after {\n  animation-direction: reverse;\n}\n\n.loader-double:after, .loader-double:before {\n  content: \"\";\n  position: fixed;\n  border-radius: 50%;\n  border: 8px solid;\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-double:after {\n  width: 48px;\n  height: 48px;\n  border-color: #fff;\n  border-left-color: transparent;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n}\n\n.loader-double:before {\n  width: 64px;\n  height: 64px;\n  border-color: #eb974e;\n  border-right-color: transparent;\n  -webkit-animation-duration: 2s;\n          animation-duration: 2s;\n  top: calc(50% - 32px);\n  left: calc(50% - 32px);\n}\n\n.loader-bar[data-text]:before {\n  top: calc(50% - 40px);\n  color: #fff;\n}\n\n.loader-bar:after {\n  content: \"\";\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  width: 200px;\n  height: 20px;\n  transform: translate(-50%, -50%);\n  background: linear-gradient(-45deg, #4183d7 25%, #52b3d9 0, #52b3d9 50%, #4183d7 0, #4183d7 75%, #52b3d9 0, #52b3d9);\n  background-size: 20px 20px;\n  box-shadow: inset 0 10px 0 hsla(0, 0%, 100%, 0.2), 0 0 0 5px rgba(0, 0, 0, 0.2);\n  animation: moveBar 1.5s linear infinite reverse;\n}\n\n.loader-bar[data-rounded]:after {\n  border-radius: 15px;\n}\n\n.loader-bar[data-inverse]:after {\n  -webkit-animation-direction: normal;\n          animation-direction: normal;\n}\n\n@-webkit-keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n\n@keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n.loader-bar-ping-pong:before {\n  width: 200px;\n  background-color: #000;\n}\n\n.loader-bar-ping-pong:after, .loader-bar-ping-pong:before {\n  content: \"\";\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 100px);\n}\n\n.loader-bar-ping-pong:after {\n  width: 50px;\n  background-color: #f19;\n  -webkit-animation: moveBarPingPong 0.5s linear infinite alternate;\n          animation: moveBarPingPong 0.5s linear infinite alternate;\n}\n\n.loader-bar-ping-pong[data-rounded]:before {\n  border-radius: 10px;\n}\n\n.loader-bar-ping-pong[data-rounded]:after {\n  border-radius: 50%;\n  width: 20px;\n  -webkit-animation-name: moveBarPingPongRounded;\n          animation-name: moveBarPingPongRounded;\n}\n\n@keyframes moveBarPingPong {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 50px);\n  }\n}\n@-webkit-keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@-webkit-keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n@keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n.loader-border[data-text]:before {\n  color: #fff;\n}\n\n.loader-border:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 15px;\n  height: 15px;\n  background-color: #ff0;\n  -webkit-animation: corners 3s ease both infinite;\n          animation: corners 3s ease both infinite;\n}\n\n.loader-ball:before {\n  content: \"\";\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 50%;\n  left: 50%;\n  margin: -25px 0 0 -25px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: kickBall 1s infinite alternate ease-in both;\n          animation: kickBall 1s infinite alternate ease-in both;\n}\n\n.loader-ball[data-shadow]:before {\n  box-shadow: inset -5px -5px 10px 0 rgba(0, 0, 0, 0.5);\n}\n\n.loader-ball:after {\n  content: \"\";\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.3);\n  border-radius: 50%;\n  width: 45px;\n  height: 20px;\n  top: calc(50% + 10px);\n  left: 50%;\n  margin: 0 0 0 -22.5px;\n  z-index: 0;\n  -webkit-animation: shadow 1s infinite alternate ease-out both;\n          animation: shadow 1s infinite alternate ease-out both;\n}\n\n@-webkit-keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n\n@keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n@-webkit-keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n@keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n.loader-smartphone:after {\n  content: \"\";\n  color: #fff;\n  font-size: 12px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  line-height: 120px;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  width: 70px;\n  height: 130px;\n  margin: -65px 0 0 -35px;\n  border: 5px solid #fd0;\n  border-radius: 10px;\n  box-shadow: inset 0 5px 0 0 #fd0;\n  background: radial-gradient(circle at 50% 90%, rgba(0, 0, 0, 0.5) 6px, transparent 0), linear-gradient(0deg, #fd0 22px, transparent 0), linear-gradient(0deg, rgba(0, 0, 0, 0.5) 22px, rgba(0, 0, 0, 0.5));\n  -webkit-animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n          animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n}\n\n.loader-smartphone[data-screen=\"\"]:after {\n  content: \"Loading\";\n}\n\n.loader-smartphone:not([data-screen=\"\"]):after {\n  content: attr(data-screen);\n}\n\n@-webkit-keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n\n@keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n.loader-clock:before {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  margin: -60px 0 0 -60px;\n  background: linear-gradient(180deg, transparent 50%, #f5f5f5 0), linear-gradient(90deg, transparent 55px, #2ecc71 0, #2ecc71 65px, transparent 0), linear-gradient(180deg, #f5f5f5 50%, #f5f5f5 0);\n  box-shadow: inset 0 0 0 10px #f5f5f5, 0 0 0 5px #555, 0 0 0 10px #7b7b7b;\n  -webkit-animation: rotation infinite 2s linear;\n          animation: rotation infinite 2s linear;\n}\n\n.loader-clock:after, .loader-clock:before {\n  content: \"\";\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  overflow: hidden;\n}\n\n.loader-clock:after {\n  width: 60px;\n  height: 40px;\n  margin: -20px 0 0 -15px;\n  border-radius: 20px 0 0 20px;\n  background: radial-gradient(circle at 14px 20px, #25a25a 10px, transparent 0), radial-gradient(circle at 14px 20px, #1b7943 14px, transparent 0), linear-gradient(180deg, transparent 15px, #2ecc71 0, #2ecc71 25px, transparent 0);\n  -webkit-animation: rotation infinite 24s linear;\n          animation: rotation infinite 24s linear;\n  transform-origin: 15px center;\n}\n\n.loader-curtain:after, .loader-curtain:before {\n  position: fixed;\n  width: 100%;\n  top: 50%;\n  margin-top: -35px;\n  font-size: 70px;\n  text-align: center;\n  font-family: Helvetica, Arial, sans-serif;\n  overflow: hidden;\n  line-height: 1.2;\n  content: \"Loading\";\n}\n\n.loader-curtain:before {\n  color: #666;\n}\n\n.loader-curtain:after {\n  color: #fff;\n  height: 0;\n  -webkit-animation: curtain 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both;\n}\n\n.loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):after, .loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):before {\n  content: attr(data-curtain-text);\n}\n\n.loader-curtain[data-brazilian]:before {\n  color: #f1c40f;\n}\n\n.loader-curtain[data-brazilian]:after {\n  color: #2ecc71;\n}\n\n.loader-curtain[data-colorful]:before {\n  -webkit-animation: maskColorful 2s linear infinite alternate both;\n          animation: maskColorful 2s linear infinite alternate both;\n}\n\n.loader-curtain[data-colorful]:after {\n  -webkit-animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n  color: #000;\n}\n\n@-webkit-keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n\n@keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n@-webkit-keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@-webkit-keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n@keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n.loader-music:after, .loader-music:before {\n  content: \"\";\n  position: fixed;\n  width: 240px;\n  height: 240px;\n  top: 50%;\n  left: 50%;\n  margin: -120px 0 0 -120px;\n  border-radius: 50%;\n  text-align: center;\n  line-height: 240px;\n  color: #fff;\n  font-size: 40px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);\n  letter-spacing: -1px;\n}\n\n.loader-music:after {\n  -webkit-backface-visibility: hidden;\n          backface-visibility: hidden;\n}\n\n.loader-music[data-hey-oh]:after, .loader-music[data-hey-oh]:before {\n  box-shadow: 0 0 0 10px;\n}\n\n.loader-music[data-hey-oh]:before {\n  background-color: #fff;\n  color: #000;\n  -webkit-animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-hey-oh]:after {\n  background-color: #000;\n  -webkit-animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n          animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after, .loader-music[data-no-cry]:before {\n  background: linear-gradient(45deg, #009b3a 50%, #fed100 51%);\n  box-shadow: 0 0 0 10px #000;\n}\n\n.loader-music[data-no-cry]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after {\n  -webkit-animation: coin 2.5s linear infinite, no 5s linear infinite both;\n          animation: coin 2.5s linear infinite, no 5s linear infinite both;\n}\n\n.loader-music[data-we-are]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n  background: radial-gradient(ellipse at center, #4ecdc4 0, #556270);\n}\n\n.loader-music[data-we-are]:after {\n  -webkit-animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n  background: radial-gradient(ellipse at center, #26d0ce 0, #1a2980);\n}\n\n.loader-music[data-rock-you]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n  background: #444;\n}\n\n.loader-music[data-rock-you]:after {\n  -webkit-animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n  background: #96281b;\n}\n\n@-webkit-keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n\n@keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n@-webkit-keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@-webkit-keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@-webkit-keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@-webkit-keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@-webkit-keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@-webkit-keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@-webkit-keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@-webkit-keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@-webkit-keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n@keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n.loader-pokeball:before {\n  content: \"\";\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  top: 50%;\n  left: 50%;\n  margin: -50px 0 0 -50px;\n  background: linear-gradient(180deg, red 42%, #000 0, #000 58%, #fff 0);\n  background-repeat: no-repeat;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: movePokeball 1s linear infinite both;\n          animation: movePokeball 1s linear infinite both;\n}\n\n.loader-pokeball:after {\n  content: \"\";\n  position: absolute;\n  width: 24px;\n  height: 24px;\n  top: 50%;\n  left: 50%;\n  margin: -12px 0 0 -12px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 2;\n  -webkit-animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n          animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n  border: 2px solid #000;\n  box-shadow: 0 0 0 5px #fff, 0 0 0 10px #000;\n}\n\n@-webkit-keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n\n@keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n@-webkit-keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n@keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n.loader-bouncing:after, .loader-bouncing:before {\n  content: \"\";\n  width: 20px;\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 10px);\n  border-radius: 50%;\n  background-color: #fff;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:after {\n  margin-left: -30px;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:before {\n  -webkit-animation-delay: 0.2s;\n          animation-delay: 0.2s;\n}\n\n@-webkit-keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n\n@keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n.sbl-circ-ripple {\n  height: 48px;\n  width: 48px;\n  color: #48659b;\n  border-radius: 50%;\n  position: relative;\n  display: inline-block;\n  top: 20%;\n  left: 40%;\n}\n\n.sbl-circ-ripple::after, .sbl-circ-ripple::before {\n  content: \"\";\n  height: 0;\n  width: 0;\n  border: inherit;\n  border: 5px solid;\n  border-radius: inherit;\n  position: absolute;\n  left: 40%;\n  top: 40%;\n  -webkit-animation: circle-ripple 1s linear infinite;\n          animation: circle-ripple 1s linear infinite;\n}\n\n.sbl-circ-ripple::before {\n  -webkit-animation-delay: -0.6s;\n          animation-delay: -0.6s;\n}\n\n@-webkit-keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}\n\n@keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}/*# sourceMappingURL=style.css.map */", "",{"version":3,"sources":["webpack://./css/style.css","webpack://./css/base/_customBase.scss","webpack://./css/base/_mixins.scss","webpack://./css/modules/_footer.scss","webpack://./css/modules/_opening.scss","webpack://./css/modules/_properties.scss","webpack://./css/modules/_single.scss","webpack://./css/modules/_constant.scss","webpack://./css/modules/_search.scss","webpack://./css/modules/_loader.scss","webpack://./css/modules/_all-news.scss","webpack://./css/modules/_shadow-box.scss","webpack://./css/downloads/css-loader.css","webpack://./css/downloads/sbl-circ-ripple.css"],"names":[],"mappings":"AAAA,gBAAgB;ACEhB;EACI,kBAAA;EACA,YAAA;EACA,SAAA;ADAJ;AEEI;EDLJ;IAWQ,gBAAA;EDJN;AACF;AEGI;EDXJ;IAcQ,iBAAA;EDFN;AACF;ACII;EACI,gBAAA;ADFR;;ACMA;EACI,SAAA;EACA,mBAAA;ADHJ;;ACMA;EACI,SAAA;EACA,mBAAA;EACA,eAAA;ADHJ;;ACMA;EACI,iBAAA;EACA,SAAA;ADHJ;;ACMA;EACI,iBAAA;EACA,SAAA;ADHJ;;ACMA;EACI,qBAAA;EACA,cAAA;ADHJ;;ACMA;EACI,eAAA;ADHJ;;ACKA;EACI,oBAAA;ADFJ;;ACIA;EACI,UAAA;ADDJ;;ACGA;EACI,cAAA;EACA,sBAAA;ADAJ;;ACGA;EACI,aAAA;EACA,oBAAA;ADAJ;;ACGA;EACI,sBAAA;ADAJ;;ACGA;EACI,YAAA;EACA,uBAAA;ADAJ;;ACGA;EACI,qBAAA;ADAJ;;ACIA;EACI,kBAAA;EACA,MAAA;ADDJ;ACII;EACI,oBAAA;ADFR;;ACOA;EAOI,eAAA;EAEA,WAAA;EACA,YAAA;EACA,iBAAA;EACA,aAAA;EACA,uBAAA;ADXJ;ACaI;EASI,aAAA;EACA,uBAAA;EAGA,mBAAA;ADrBR;AE9FI;EDsGA;IAEQ,UAAA;EDNV;AACF;AE7FI;EDgGA;IAKQ,UAAA;EDJV;AACF;ACeY;EACI,kBAAA;ADbhB;ACcgB;EACI,kBAAA;ADZpB;;ACmBA;EACI,kBAAA;ADhBJ;;ACmBA;EACI,gBAAA;ADhBJ;;ACmBA;EACI,WAAA;EACA,YAAA;ADhBJ;;ACmBA;EACI,YAAA;ADhBJ;ACiBI;EACI,WAAA;EACA,WAAA;EACA,SAAA;ADfR;ACiBI;EACI,aAAA;ADfR;ACgBQ;EACI,oBAAA;EACA,mBAAA;ADdZ;;ACmBA;EACI,aAAA;EAOA,gBAAA;ADtBJ;AEhJI;ED8JJ;IAGQ,uCAAA;EDbN;AACF;AE/II;EDwJJ;IAMQ,qCAAA;EDXN;AACF;;ACeA;EACI,WAAA;EACA,YAAA;ADZJ;ACkBI;EAEI,YAAA;ADjBR;ACmBQ;EACI,mBAAA;EACA,kBAAA;EAGA,kBAAA;EACA,aAAA;EACA,mBAAA;EACA,uBAAA;ADnBZ;ACoBY;EAEI,kBAAA;EACA,kBAAA;EAEA,uCAAA;EACA,sBAAA;EACA,kBAAA;EACA,kBAAA;EACA,iBAAA;ADpBhB;AE7KI;EDkMY;IAEQ,aAAA;EDnBtB;AACF;ACqBgB;EACI,aAAA;ADnBpB;AErLI;EDuMY;IAGQ,cAAA;EDjBtB;AACF;ACoBY;EACI,kBAAA;EACA,aAAA;EACA,sBAAA;EACA,WAAA;EACA,kBAAA;ADlBhB;ACoBgB;EACI,yBAAA;EACA,eAAA;EACA,iBAAA;EAIA,kBAAA;ADrBpB;AEvMI;EDqNY;IAKQ,iBAAA;EDftB;AACF;ACkBgB;EACI,eAAA;ADhBpB;AE/MI;ED8NY;IAGQ,iBAAA;EDdtB;AACF;ACgBgB;EACI,sBAAA;EACA,wBAAA;ADdpB;ACgBgB;EACI,iBAAA;ADdpB;ACiBY;EACI,aAAA;ADfhB;ACkBgB;EACI,UAAA;ADhBpB;ACoBQ;EACI,mBAAA;EACA,kBAAA;EACA,iBAAA;EACA,aAAA;EACA,sBAAA;EACA,WAAA;ADlBZ;ACmBY;EACI,SAAA;ADjBhB;ACmBY;EACI,gBAAA;ADjBhB;ACsBI;EACI,YAAA;EACA,eAAA;EACA,YAAA;ADpBR;ACsBQ;EACI,YAAA;EACA,aAAA;ADpBZ;;AGpQA;EACI,uCAAA;EACA,SAAA;EACA,aAAA;EACA,eAAA;EACA,SAAA;EACA,WAAA;EACA,kBAAA;EACA,yBAAA;EACA,mBAAA;EACA,YAAA;AHuQJ;AGtQI;EACI,YAAA;AHwQR;AExQI;ECDA;IAGQ,eAAA;EH0QV;AACF;;AIxRA;EACI,cAAA;EACA,kBAAA;EACA,yBAAA;EACA,aAAA;EACA,uBAAA;AJ2RJ;AI1RI;EACI,iBAAA;AJ4RR;AExRI;EELA;IAGQ,iBAAA;EJ8RV;AACF;AI5RI;EACI,iBAAA;EAIA,gBAAA;AJ2RR;AEjSI;EECA;IAGQ,iBAAA;EJiSV;AACF;AI7RQ;EAGI,0BAAA;EAEA,UAAA;AJ4RZ;AE1SI;EESI;IAOQ,UAAA;EJ8Rd;AACF;AI3RI;EACI,aAAA;EACA,mBAAA;EACA,iCAAA;EAMA,wCAAA;EACA,kEAAA;EACA,WAAA;EACA,YAAA;EACA,eAAA;EACA,MAAA;EACA,aAAA;EAEA,yBAAA;AJuRR;AItRQ;EACI,aAAA;AJwRZ;AItRQ;EACI,iBAAA;EACA,YAAA;EACA,eAAA;AJwRZ;AIvRY;EACE,eAAA;AJyRd;AIhRQ;EACI,YAAA;AJkRZ;AIhRQ;EAEI,kBAAA;EACA,oBAAA;AJiRZ;AI/QQ;EAEI,kBAAA;EACA,oBAAA;AJgRZ;AI9QQ;EACI,YAAA;AJgRZ;AI9QQ;EACI,SAAA;AJgRZ;AIzQQ;EAEI,kBAAA;AJ0QZ;AIzQY;EACI,SAAA;EACA,UAAA;EAEA,YAAA;EACA,aAAA;EACA,uBAAA;EACA,mBAAA;EACA,WAAA;AJ0QhB;AIvQoB;EACE,iBAAA;EACA,0BAAA;AJyQtB;AInQI;EACI,kBAAA;EACA,MAAA;EACA,YAAA;EACA,WAAA;AJqQR;AIpQQ;EACI,YAAA;EACA,WAAA;EACA,mCAAA;AJsQZ;AInQI;EACI,kBAAA;EACA,kBAAA;EACA,mBAAA;EACA,cAAA;EAIA,aAAA;EACA,uBAAA;EACA,WAAA;EACA,YAAA;AJkQR;AE7XI;EEgHA;IAMQ,cAAA;EJ2QV;AACF;AItQQ;EACI,YAAA;AJwQZ;;AKhZA;EACI,uBAAA;ALmZJ;AKlZI;EACI,iBAAA;ALoZR;;AKhZA;EACI,oBAAA;ALmZJ;AKlZI;EACI,iBAAA;EACA,YAAA;ALoZR;;AK9YQ;EACI,wCAAA;ALiZZ;AK9YI;EACI,WAAA;EACA,YAAA;EACA,mBAAA;ALgZR;AK9YI;EACI,uBAAA;ALgZR;;AK5YA;EACI,aAAA;AL+YJ;AEpaI;EGoBJ;IAGQ,aAAA;ELiZN;AACF;;AK9YA;EACI,aAAA;ALiZJ;AE7aI;EG2BJ;IAGQ,aAAA;ELmZN;AACF;;AKhZA;EACI,iCAAA;EACA,YAAA;ALmZJ;AKjZQ;EACI,oCAAA;ALmZZ;AKhZY;EACI,mBAAA;ALkZhB;AK9YI;EACI,aAAA;EACA,iBAAA;ALgZR;AK/YQ;EACI,eAAA;EACA,YAAA;ALiZZ;AK/YY;EACI,cAAA;EACA,WAAA;ALiZhB;AK9YQ;EACI,YAAA;ALgZZ;AK9YQ;EACI,kBAAA;EACA,UAAA;ALgZZ;AK9YQ;EACI,UAAA;ALgZZ;AK/YY;EACI,eAAA;ALiZhB;AK9YQ;EACI,0CAAA;ALgZZ;AK/YY;EACI,YAAA;EACA,cAAA;EACA,YAAA;EACA,WAAA;ALiZhB;AK/YY;EACI,YAAA;EACA,WAAA;EACA,kBAAA;EACA,eAAA;ALiZhB;AK/YY;EACI,mBAAA;EACA,kBAAA;ALiZhB;AK9YQ;EACI,aAAA;ALgZZ;AK9YQ;EACI,aAAA;EACA,uBAAA;OAAA,kBAAA;EACA,0RAAA;ALgZZ;AKrYY;EACI,sBAAA;ALuYhB;AKrYY;EACI,uBAAA;ALuYhB;AKrYY;EACI,uBAAA;ALuYhB;AKrYY;EACI,yBAAA;ALuYhB;AKrYY;EACI,yBAAA;ALuYhB;;AKjYA;EACI,iBAAA;EACA,YAAA;ALoYJ;AKnYI;EACI,qBAAA;OAAA,gBAAA;EAEA,UAAA;EAIA,aAAA;EACA,oBAAA;ALiYR;AE3gBI;EGkIA;IAKQ,UAAA;ELwYV;AACF;AK/XQ;EACI,sBAAA;EACA,UAAA;EACA,iBAAA;ALiYZ;AErhBI;EGiJI;IAKQ,UAAA;IAKA,cAAA;EL+Xd;AACF;AK7XQ;EACI,iBAAA;EACA,gBAAA;EACA,yBAAA;AL+XZ;AK7XQ;EACI,gBAAA;AL+XZ;AK5XY;EACI,YAAA;EACA,aAAA;AL8XhB;AK5XY;EACI,iBAAA;AL8XhB;AK5XY;EACI,UAAA;EACA,gBAAA;AL8XhB;AK5XY;EACI,UAAA;AL8XhB;AK5XY;EACI,cAAA;EACA,cAAA;AL8XhB;AK3XY;EACI,cAAA;AL6XhB;AK3XY;EACI,YAAA;AL6XhB;AK3XY;EACI,WAAA;EACA,aAAA;AL6XhB;AE/jBI;EGgMQ;IAIQ,aAAA;EL+XlB;AACF;AK7XY;EACI,iBAAA;EACA,YAAA;EACA,iBAAA;EACA,gBAAA;AL+XhB;;AKzXA;EACI,QAAA;EACA,SAAA;AL4XJ;;AKxXA;EACI,uCAAA;EACA,WAAA;EACA,YAAA;EACA,gBAAA;EACA,kBAAA;EACA,YAAA;EACA,eAAA;EACA,QAAA;EACA,SAAA;EACA,aAAA;EAEA,aAAA;EACA,mBAAA;EACA,sBAAA;EACA,iBAAA;AL0XJ;AKzXI;EACI,YAAA;AL2XR;AKxXI;EACI,eAAA;AL0XR;AKxXI;EACI,mBAAA;EAEA,eAAA;ALyXR;AKvXI;EACI,uBAAA;ALyXR;AKvXI;EACI,aAAA;EACA,6BAAA;EACA,kBAAA;EACA,UAAA;ALyXR;AKxXQ;EACI,iBAAA;AL0XZ;;AKrXA;EACI,uCAAA;EACA,YAAA;EACA,WAAA;EACA,gBAAA;EACA,kBAAA;EACA,YAAA;EACA,eAAA;EACA,QAAA;EACA,SAAA;EACA,aAAA;EACA,6BAAA;EACA,mBAAA;EACA,sBAAA;ALwXJ;;AMjpBA;EAEI,WAAA;EAEA,cAAA;EACA,SAAA;EAEA,aAAA;EAEA,eAAA;EACA,kBAAA;EACA,UAAA;EACA,oBAAA;EACA,oBAAA;EACA,uCAAA;ANgpBJ;AM/oBI;EACI,iBAAA;ANipBR;AM/oBI;EACI,yBAAA;ANipBR;AM/oBI;EACI,WAAA;EACA,kBAAA;ANipBR;AMhpBQ;EACI,WAAA;ANkpBZ;AMhpBQ;EACI,iBAAA;EACA,kBAAA;EACA,gBAAA;EACA,gBAAA;ANkpBZ;AMjpBY;EACI,kBAAA;EACA,uBAAA;ANmpBhB;AMlpBgB;EACI,wBAAA;ANopBpB;AM/oBI;EACI,WAAA;EAEA,aAAA;EACA,0BAAA;EACA,YAAA;ANgpBR;AM/oBQ;EACI,kBAAA;EACA,iBAAA;EACA,WAAA;ANipBZ;AM/oBQ;EACI,cAAA;EAEA,eAAA;ANgpBZ;AM9oBQ;EACI,YAAA;ANgpBZ;AM/oBY;EACI,YAAA;EACA,aAAA;ANipBhB;AM7oBI;EACI,YAAA;EACA,WAAA;EAIA,cAAA;EACA,kBAAA;EACA,kBAAA;AN4oBR;AM3oBQ;EACI,iBAAA;EACA,cAAA;AN6oBZ;AMzoBI;EACI,WAAA;EACA,kBAAA;EACA,YAAA;EACA,cAAA;EACA,eAAA;EACA,aAAA;EACA,8BAAA;AN2oBR;AM1oBQ;EACI,eAAA;AN4oBZ;AM3oBY;EACI,iBAAA;AN6oBhB;AM3oBY;EACI,YAAA;AN6oBhB;AM1oBQ;EACI,cAAA;EACA,cAAA;AN4oBZ;AM3oBY;EACI,iBAAA;EACA,mBAAA;AN6oBhB;AM1oBQ;EACI,kBAAA;EACA,SAAA;EACA,WAAA;EACA,iBAAA;EACA,aAAA;EACA,uBAAA;AN4oBZ;;AO7vBA;EACE,kCAAA;APgwBF;;AO7vBA;EACI,gBAAA;EACA,kBAAA;EACA,YAAA;EACA,eAAA;EACA,MAAA;EACA,OAAA;EACA,QAAA;EACA,SAAA;EACA,wCAAA;EACA,kBAAA;EACA,UAAA;EACA,sBAAA;EACA,yDAAA;EACA,sBAAA;APgwBJ;AO9vBI;EACE,iBAAA;EACA,cAAA;EACA,eAAA;EACA,kBAAA;EACA,aAAA;EACA,mBAAA;APgwBN;AO7vBI;EACE,iBAAA;AP+vBN;AO5vBI;EACE,SAAA;AP8vBN;AO3vBI;EACE,qCAAA;AP6vBN;AO1vBI;EACE,qBAAA;EACA,iBAAA;EAEF,yBAAA;AP2vBJ;AOrvBI;EACE,mBAAA;EACA,UAAA;EACA,mBAAA;APuvBN;AOpvBI;EACE,oBAAA;EACA,gBAAA;EAEA,eAAA;EACA,eAAA;EACA,6BAAA;APqvBN;AOlvBI;EAIE,iBAAA;EACA,eAAA;EACA,oBAAA;EACA,iCAAA;EAEA,yBAAA;EACA,gBAAA;APgvBN;AOruBI;EACE,UAAA;APuuBN;AOpuBI;EACE,iBAAA;APsuBN;;AOluBE;EACE,UAAA;EACA,sBAAA;EACA,YAAA;EACA,eAAA;EACA,SAAA;EACA,6BAAA;EACA,eAAA;EACA,gBAAA;EACA,aAAA;EAEA,yBAAA;APouBJ;;AO1tBE;EACE,gBAAA;AP6tBJ;;AO1tBE;EACE,iBAAA;EACA,cAAA;EACA,eAAA;EACA,kBAAA;AP6tBJ;;AOztBE;EACE;IACE,UAAA;IACA,eAAA;EP4tBJ;AACF;AOztBA;EACI;IAEE,uBAAA;EP2tBJ;EOztBE;IAEE,yBAAA;EP2tBJ;AACF;AOnuBA;EACI;IAEE,uBAAA;EP2tBJ;EOztBE;IAEE,yBAAA;EP2tBJ;AACF;AOxtBA;EACI,gBAAA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;EACA,wCAAA;EACA,uBAAA;EACA,0CAAA;EACA,kCAAA;AP0tBJ;;AOttBI;EACE,YAAA;EACA,eAAA;EACA,iBAAA;APytBN;;AOrtBE;EACE,uCAAA;APwtBJ;;AOrtBE;EACE,0CAAA;APwtBJ;;AOrtBE;EACE,gBAAA;APwtBJ;;AOrtBE;EACE,gBAAA;APwtBJ;;AOrtBE;EACE,kCAAA;APwtBJ;;AOrtBE;EACE,0BAAA;APwtBJ;;AQn5BA;EACI,eAAA;EACA,QAAA;EACA,YAAA;ARs5BJ;;ASrxBA;EACI,6BAAA;EACA,WAAA;EACA,kBAAA;ATwxBJ;ASvxBI;EACE,aAAA;EACA,cAAA;EACA,kCAAA;EACA,kBAAA;EACA,kBAAA;EACA,QAAA;EACA,kIAAA;UAAA,0HAAA;ATyxBN;ASvxBI;EACE,kBAAA;ATyxBN;ASvxBI;EACE,kBAAA;EACA,UAAA;EACA,SAAA;EACA,QAAA;EACA,iBAAA;EACA,yBAAA;EACA,6BAAA;ATyxBN;ASvxBI;EAEI,aAAA;EACA,cAAA;EACA,oCAAA;EACA,gIAAA;UAAA,wHAAA;ATwxBR;AStxBI;EACE,WAAA;EACA,UAAA;EACA,gDAAA;EACA,uDAAA;UAAA,+CAAA;ATwxBN;;ASpxBA;EACE;IAAG,YAAA;ETwxBH;ESvxBA;IAAI,aAAA;ET0xBJ;ESzxBA;IAAK,UAAA;ET4xBL;AACF;;AShyBA;EACE;IAAG,YAAA;ETwxBH;ESvxBA;IAAI,aAAA;ET0xBJ;ESzxBA;IAAK,UAAA;ET4xBL;AACF;AS1xBA;EACE;IACE,SAAA;ET4xBF;ES1xBA;IACE,SAAA;ET4xBF;AACF;ASlyBA;EACE;IACE,SAAA;ET4xBF;ES1xBA;IACE,SAAA;ET4xBF;AACF;AS1xBA;EACE;IACE,wCAAA;ET4xBF;ES1xBA;IACE,0CAAA;ET4xBF;ES1xBA;IACE,0CAAA;ET4xBF;AACF;ASryBA;EACE;IACE,wCAAA;ET4xBF;ES1xBA;IACE,0CAAA;ET4xBF;ES1xBA;IACE,0CAAA;ET4xBF;AACF;ASzxBA;EACE;IACE,SAAA;ET2xBF;ESzxBA;IACE,SAAA;ET2xBF;AACF;ASjyBA;EACE;IACE,SAAA;ET2xBF;ESzxBA;IACE,SAAA;ET2xBF;AACF;ASzxBA;EACE;IACE,kCAAA;ET2xBF;ESzxBA;IACE,kCAAA;ET2xBF;ESzxBA;IACE,mCAAA;ET2xBF;AACF;ASpyBA;EACE;IACE,kCAAA;ET2xBF;ESzxBA;IACE,kCAAA;ET2xBF;ESzxBA;IACE,mCAAA;ET2xBF;AACF;AUl/BA;EACI,WAAA;EACA,OAAA;EACA,UAAA;EACA,UAAA;EAEA,wCAAA;EACA,kBAAA;EACA,aAAA;EACA,gBAAA;AVm/BJ;AUl/BI;EACI,mBAAA;AVo/BR;AUl/BI;EAEI,kBAAA;EACA,YAAA;AVm/BR;AU5+BI;EACI,6CAAA;EACA,iBAAA;EACA,oBAAA;EACA,aAAA;EACA,2EACqB;AV6+B7B;AU1+BQ;EACI,oCAAA;EACA,aAAA;EACA,kBAAA;EACA,yFAAA;EAKA,WAAA;AVw+BZ;AUv+BY;EACI,iBAAA;AVy+BhB;AUv+BY;EACI,qBAAA;AVy+BhB;AUv+BY;EACI,kBAAA;AVy+BhB;AUv+BY;EACI,qBAAA;AVy+BhB;AUv+BY;EACI,qBAAA;AVy+BhB;AUv+BoB;EACI,aAAA;EACA,SAAA;AVy+BxB;AU19BY;EACI,oBAAA;AV49BhB;AU39BgB;EAEI,kBAAA;AV49BpB;AUr9BQ;EACI,wBAAA;EACA,aAAA;EACA,wKAAA;AVu9BZ;AUl9BY;EACI,oBAAA;AVo9BhB;AUl9BY;EACI,iBAAA;EACA,gBAAA;AVo9BhB;AUl9BY;EACI,qBAAA;AVo9BhB;AUn9BgB;EACI,kBAAA;EACA,cAAA;EACA,YAAA;AVq9BpB;AUj9BY;EACI,uBAAA;AVm9BhB;AUj9BY;EACI,wBAAA;AVm9BhB;AUj9BY;EACI,wBAAA;AVm9BhB;AUj9BY;EACI,uBAAA;AVm9BhB;AUj9BY;EACI,6BAAA;AVm9BhB;AU98BY;EACI,oBAAA;AVg9BhB;AU/8BgB;EACI,UAAA;AVi9BpB;AU78BQ;EACI,iBAAA;AV+8BZ;AU78BQ;EACI,iBAAA;EACA,mBAAA;AV+8BZ;AU78BQ;EACI,eAAA;AV+8BZ;AU78BQ;EACI,iBAAA;AV+8BZ;AU78BQ;EACI,iBAAA;EACA,qBAAA;AV+8BZ;AU58BI;EACI,UAAA;EACA,aAAA;EACA,8BAAA;EACA,uCAAA;AV88BR;AU78BQ;EACI,WAAA;EAEA,kBAAA;EACA,eAAA;EACA,mBAAA;EAGA,8CAAA;AV48BZ;AU18BQ;EACI,kBAAA;AV48BZ;AU38BY;EACI,aAAA;EACA,oBAAA;AV68BhB;AU18BQ;EACI,qBAAA;EACA,mBAAA;EACA,cAAA;AV48BZ;AU18BQ;EACI,kBAAA;AV48BZ;AUz8BY;EACI,aAAA;EACA,oBAAA;AV28BhB;AUz8BY;EACI,iBAAA;EACA,cAAA;AV28BhB;AU18BgB;EACI,YAAA;EACA,cAAA;EACA,YAAA;EACA,WAAA;AV48BpB;AU18BgB;EACI,WAAA;EACA,gBAAA;AV48BpB;AU18BgB;EACI,mBAAA;AV48BpB;AU18BgB;EACI,YAAA;EACA,aAAA;AV48BpB;AUx8BgB;EACI,uBAAA;AV08BpB;AUz8BoB;EACI,eAAA;AV28BxB;AUz8BoB;EACI,aAAA;AV28BxB;AUr8BI;EACI,UAAA;EACA,iBAAA;AVu8BR;AUr8BI;EAGI,WAAA;AVq8BR;AUn8BQ;EACI,aAAA;EACA,oBAAA;AVq8BZ;AUn8BQ;EACI,aAAA;EACA,mBAAA;EACA,uBAAA;AVq8BZ;AUn8BgB;EACI,eAAA;EACA,iBAAA;EACA,mBAAA;AVq8BpB;AUn8BgB;EACI,oBAAA;AVq8BpB;AUn8BgB;EACI,UAAA;AVq8BpB;;AWvrCA;EACI,aAAA;EAGA,eAAA;EACA,uCAAA;EACA,OAAA;EACA,WAAA;EACA,WAAA;EACA,UAAA;AXwrCJ;AWtrCI;EAGI,kBAAA;EACA,kBAAA;EACA,SAAA;EAMA,aAAA;EACA,YAAA;AXirCR;AWhrCQ;EACI,WAAA;EACA,YAAA;AXkrCZ;AWhrCQ;EACI,aAAA;EACA,uBAAA;EACA,mBAAA;EACA,kBAAA;EACA,YAAA;EACA,WAAA;AXkrCZ;AWjrCY;EACI,YAAA;EACA,WAAA;EACA,yCAAA;EACA,kBAAA;EACA,kBAAA;EACA,eAAA;EACA,aAAA;EACA,uBAAA;EACA,mBAAA;EACA,6BAAA;AXmrChB;AWlrCgB;EACI,0CAAA;EACA,oCAAA;EACA,uCAAA;AXorCpB;AWjrCY;EACI,YAAA;AXmrChB;AWzqCI;EACI,aAAA;EACA,uBAAA;EACA,mBAAA;AX2qCR;AWxqCI;EACI,aAAA;EACA,sBAAA;EACA,kBAAA;EACA,WAAA;EACA,cAAA;EACA,WAAA;EACA,SAAA;AX0qCR;AWzqCQ;EACI,iBAAA;EACA,aAAA;AX2qCZ;AW1qCY;EACI,YAAA;EACA,iBAAA;EACA,eAAA;AX4qChB;AW1qCY;EACI,qBAAA;EACA,oBAAA;AX4qChB;AWxqCQ;EACI,gBAAA;EACA,aAAA;EACA,sBAAA;EACA,cAAA;AX0qCZ;AWzqCY;EACI,aAAA;EACA,gBAAA;EACA,WAAA;AX2qChB;AW1qCgB;EACI,UAAA;EACA,eAAA;AX4qCpB;AW1qCgB;EACI,qBAAA;EACA,oBAAA;AX4qCpB;AW1qCgB;EACI,aAAA;EACA,sBAAA;EACA,iBAAA;EACA,UAAA;AX4qCpB;AW3qCoB;EACI,SAAA;EACA,YAAA;AX6qCxB;AW3qCoB;EACI,gBAAA;AX6qCxB;AWvqCQ;EACI,kBAAA;EACA,gBAAA;EACA,WAAA;EACA,aAAA;EACA,uBAAA;EACA,mBAAA;AXyqCZ;AWxqCY;EACI,iBAAA;EACA,iBAAA;AX0qChB;AWrqCI;EACI,kBAAA;EACA,YAAA;EACA,YAAA;EACA,WAAA;EACA,iBAAA;EACA,eAAA;AXuqCR;;AWlqCI;EACI,uBAAA;EACA,eAAA;AXqqCR;AWnqCI;EACI,qBAAA;EACA,eAAA;AXqqCR;;AYt0CA;EAAQ,WAAA;EAAW,eAAA;EAAe,sBAAA;EAAsB,aAAA;EAAa,YAAA;EAAY,QAAA;EAAQ,SAAA;EAAS,gBAAA;EAAgB,eAAA;AZk1ClH;;AYl1CiI;EAA6B,sBAAA;EAAsB,aAAA;AZu1CpL;;AYv1CiM;EAAkB,qCAAA;EAAiC,WAAA;EAAW,YAAA;EAAY,OAAA;EAAO,MAAA;AZ+1ClR;;AY/1CwR;EAAiD,cAAA;AZm2CzU;;AYn2CuV;EAAoB;IAAG,oBAAA;EZw2C5W;EYx2CgY;IAAG,yBAAA;EZ22CnY;AACF;;AY52CuV;EAAoB;IAAG,oBAAA;EZw2C5W;EYx2CgY;IAAG,yBAAA;EZ22CnY;AACF;AY52C+Z;EAAiB;IAAG,YAAA;EZg3Cjb;EYh3C4b;IAAG,UAAA;EZm3C/b;AACF;AYp3C4c;EAA0B,eAAA;EAAe,OAAA;EAAO,QAAA;EAAQ,mBAAA;EAAmB,yCAAA;EAAuC,kBAAA;EAAkB,WAAA;EAAW,eAAA;AZ83C3lB;;AY93C0mB;EAA6B,kBAAA;AZk4CvoB;;AYl4CypB;EAA8C,wBAAA;AZs4CvsB;;AYt4C+tB;EAAsC,qDAAA;UAAA,6CAAA;AZ04CrwB;;AY14CkzB;EAAkC,qBAAA;AZ84Cp1B;;AY94Cy2B;EAAsB,WAAA;EAAW,eAAA;EAAe,WAAA;EAAW,YAAA;EAAY,sBAAA;EAAsB,8BAAA;EAA8B,kBAAA;EAAkB,qBAAA;EAAqB,sBAAA;EAAsB,8CAAA;UAAA,sCAAA;AZ25CjiC;;AY35CukC;EAAiC,+BAAA;AZ+5CxmC;;AY/5CuoC;EAAoC,4BAAA;AZm6C3qC;;AYn6CusC;EAA2C,WAAA;EAAW,eAAA;EAAe,kBAAA;EAAkB,iBAAA;EAAiB,8CAAA;UAAA,sCAAA;AZ26C/yC;;AY36Cq1C;EAAqB,WAAA;EAAW,YAAA;EAAY,kBAAA;EAAkB,8BAAA;EAA8B,qBAAA;EAAqB,sBAAA;AZo7Ct8C;;AYp7C49C;EAAsB,WAAA;EAAW,YAAA;EAAY,qBAAA;EAAqB,+BAAA;EAA+B,8BAAA;UAAA,sBAAA;EAAsB,qBAAA;EAAqB,sBAAA;AZ87CxmD;;AY97C8nD;EAA8B,qBAAA;EAAqB,WAAA;AZm8CjrD;;AYn8C4rD;EAAkB,WAAA;EAAW,eAAA;EAAe,QAAA;EAAQ,SAAA;EAAS,YAAA;EAAY,YAAA;EAAY,gCAAA;EAA+B,oHAAA;EAA6G,0BAAA;EAA0B,+EAAA;EAAsE,+CAAA;AZi9C7/D;;AYj9C4iE;EAAgC,mBAAA;AZq9C5kE;;AYr9C+lE;EAAgC,mCAAA;UAAA,2BAAA;AZy9C/nE;;AYz9C0pE;EAAmB;IAAG,wBAAA;EZ89C9qE;EY99CssE;IAAG,8BAAA;EZi+CzsE;AACF;;AYl+C0pE;EAAmB;IAAG,wBAAA;EZ89C9qE;EY99CssE;IAAG,8BAAA;EZi+CzsE;AACF;AYl+C0uE;EAA6B,YAAA;EAAY,sBAAA;AZs+CnxE;;AYt+CyyE;EAAyD,WAAA;EAAW,YAAA;EAAY,kBAAA;EAAkB,qBAAA;EAAqB,uBAAA;AZ8+Ch6E;;AY9+Cu7E;EAA4B,WAAA;EAAW,sBAAA;EAAsB,iEAAA;UAAA,yDAAA;AZo/Cp/E;;AYp/C4iF;EAA2C,mBAAA;AZw/CvlF;;AYx/C0mF;EAA0C,kBAAA;EAAkB,WAAA;EAAW,8CAAA;UAAA,sCAAA;AZ8/CjrF;;AY9/CutF;EAA2B;IAAG,uBAAA;EZmgDnvF;EYngD0wF;IAAG,sBAAA;EZsgD7wF;AACF;AYvgDuyF;EAAkC;IAAG,uBAAA;EZ2gD10F;EY3gDi2F;IAAG,sBAAA;EZ8gDp2F;AACF;AY/gDuyF;EAAkC;IAAG,uBAAA;EZ2gD10F;EY3gDi2F;IAAG,sBAAA;EZ8gDp2F;AACF;AY/gD83F;EAAmB;IAAG,WAAA;IAAW,YAAA;EZohD75F;EYphDy6F;IAAI,WAAA;IAAW,YAAA;IAAY,uBAAA;IAAuB,MAAA;EZ0hD39F;EY1hDi+F;IAAI,YAAA;EZ6hDr+F;EY7hDi/F;IAAI,YAAA;IAAY,sBAAA;IAAsB,uBAAA;EZkiDvhG;EYliD8iG;IAAI,WAAA;EZqiDljG;EYriD6jG;IAAI,WAAA;IAAW,OAAA;IAAO,sBAAA;EZ0iDnlG;EY1iDymG;IAAI,YAAA;EZ6iD7mG;AACF;AY9iD83F;EAAmB;IAAG,WAAA;IAAW,YAAA;EZohD75F;EYphDy6F;IAAI,WAAA;IAAW,YAAA;IAAY,uBAAA;IAAuB,MAAA;EZ0hD39F;EY1hDi+F;IAAI,YAAA;EZ6hDr+F;EY7hDi/F;IAAI,YAAA;IAAY,sBAAA;IAAsB,uBAAA;EZkiDvhG;EYliD8iG;IAAI,WAAA;EZqiDljG;EYriD6jG;IAAI,WAAA;IAAW,OAAA;IAAO,sBAAA;EZ0iDnlG;EY1iDymG;IAAI,YAAA;EZ6iD7mG;AACF;AY9iD4nG;EAAiC,WAAA;AZijD7pG;;AYjjDwqG;EAAqB,WAAA;EAAW,kBAAA;EAAkB,MAAA;EAAM,OAAA;EAAO,WAAA;EAAW,YAAA;EAAY,sBAAA;EAAsB,gDAAA;UAAA,wCAAA;AZ4jDpxG;;AY5jD4zG;EAAoB,WAAA;EAAW,kBAAA;EAAkB,WAAA;EAAW,YAAA;EAAY,QAAA;EAAQ,SAAA;EAAS,uBAAA;EAAuB,sBAAA;EAAsB,kBAAA;EAAkB,UAAA;EAAU,8DAAA;UAAA,sDAAA;AZ0kD99G;;AY1kDohH;EAAiC,qDAAA;AZ8kDrjH;;AY9kDsmH;EAAmB,WAAA;EAAW,kBAAA;EAAkB,oCAAA;EAAgC,kBAAA;EAAkB,WAAA;EAAW,YAAA;EAAY,qBAAA;EAAqB,SAAA;EAAS,qBAAA;EAAqB,UAAA;EAAU,6DAAA;UAAA,qDAAA;AZ4lD5xH;;AY5lDi1H;EAAkB;IAAG,6BAAA;IAA6B,mBAAA;EZkmDj4H;EYlmDo5H;IAAI,6BAAA;IAA6B,mBAAA;EZsmDr7H;EYtmDw8H;IAAI,qCAAA;IAAiC,mBAAA;EZ0mD7+H;EY1mDggI;IAAG,qCAAA;IAAiC,mBAAA;EZ8mDpiI;AACF;;AY/mDi1H;EAAkB;IAAG,6BAAA;IAA6B,mBAAA;EZkmDj4H;EYlmDo5H;IAAI,6BAAA;IAA6B,mBAAA;EZsmDr7H;EYtmDw8H;IAAI,qCAAA;IAAiC,mBAAA;EZ0mD7+H;EY1mDggI;IAAG,qCAAA;IAAiC,mBAAA;EZ8mDpiI;AACF;AY/mD0jI;EAAoB;IAAG,yCAAA;EZmnD/kI;EYnnDunI;IAAI,kBAAA;EZsnD3nI;EYtnD6oI;IAAG,kCAAA;IAAkC,8BAAA;EZ0nDlrI;AACF;AY3nD0jI;EAAoB;IAAG,yCAAA;EZmnD/kI;EYnnDunI;IAAI,kBAAA;EZsnD3nI;EYtnD6oI;IAAG,kCAAA;IAAkC,8BAAA;EZ0nDlrI;AACF;AY3nDmtI;EAAyB,WAAA;EAAW,WAAA;EAAW,eAAA;EAAe,yCAAA;EAAuC,kBAAA;EAAkB,kBAAA;EAAkB,eAAA;EAAe,SAAA;EAAS,QAAA;EAAQ,WAAA;EAAW,aAAA;EAAa,uBAAA;EAAuB,sBAAA;EAAsB,mBAAA;EAAmB,gCAAA;EAAgC,0MAAA;EAAsL,8EAAA;UAAA,sEAAA;AZ8oD1qJ;;AY9oDyuJ;EAAyC,kBAAA;AZkpDlxJ;;AYlpDoyJ;EAA+C,0BAAA;AZspDn1J;;AYtpD62J;EAAiB;IAAG,kCAAA;EZ2pD/3J;EY3pD+5J;IAAI,iCAAA;EZ8pDn6J;EY9pDk8J;IAAI,kCAAA;EZiqDt8J;EYjqDs+J;IAAI,iCAAA;EZoqD1+J;EYpqDygK;IAAI,kCAAA;EZuqD7gK;EYvqD6iK;IAAI,iCAAA;EZ0qDjjK;EY1qDglK;IAAI,kCAAA;EZ6qDplK;EY7qDonK;IAAI,iCAAA;EZgrDxnK;EYhrDupK;IAAI,kCAAA;EZmrD3pK;EYnrD2rK;IAAI,iCAAA;EZsrD/rK;EYtrD8tK;IAAI,kCAAA;EZyrDluK;AACF;;AY1rD62J;EAAiB;IAAG,kCAAA;EZ2pD/3J;EY3pD+5J;IAAI,iCAAA;EZ8pDn6J;EY9pDk8J;IAAI,kCAAA;EZiqDt8J;EYjqDs+J;IAAI,iCAAA;EZoqD1+J;EYpqDygK;IAAI,kCAAA;EZuqD7gK;EYvqD6iK;IAAI,iCAAA;EZ0qDjjK;EY1qDglK;IAAI,kCAAA;EZ6qDplK;EY7qDonK;IAAI,iCAAA;EZgrDxnK;EYhrDupK;IAAI,kCAAA;EZmrD3pK;EYnrD2rK;IAAI,iCAAA;EZsrD/rK;EYtrD8tK;IAAI,kCAAA;EZyrDluK;AACF;AY1rDqwK;EAAqB,YAAA;EAAY,aAAA;EAAa,kBAAA;EAAkB,uBAAA;EAAuB,kMAAA;EAAwL,wEAAA;EAAsE,8CAAA;UAAA,sCAAA;AZmsD1lL;;AYnsDgoL;EAAyC,WAAA;EAAW,eAAA;EAAe,SAAA;EAAS,QAAA;EAAQ,gBAAA;AZ2sDptL;;AY3sDouL;EAAoB,WAAA;EAAW,YAAA;EAAY,uBAAA;EAAuB,4BAAA;EAA4B,mOAAA;EAAyN,+CAAA;UAAA,uCAAA;EAAuC,6BAAA;AZqtDlkM;;AYrtD+lM;EAA6C,eAAA;EAAe,WAAA;EAAW,QAAA;EAAQ,iBAAA;EAAiB,eAAA;EAAe,kBAAA;EAAkB,yCAAA;EAAuC,gBAAA;EAAgB,gBAAA;EAAgB,kBAAA;AZkuDvyM;;AYluDyzM;EAAuB,WAAA;AZsuDh1M;;AYtuD21M;EAAsB,WAAA;EAAW,SAAA;EAAS,4DAAA;UAAA,oDAAA;AZ4uDr4M;;AY5uDy7M;EAA2I,gCAAA;AZgvDpkN;;AYhvDomN;EAAuC,cAAA;AZovD3oN;;AYpvDypN;EAAsC,cAAA;AZwvD/rN;;AYxvD6sN;EAAsC,iEAAA;UAAA,yDAAA;AZ4vDnvN;;AY5vD4yN;EAAqC,qHAAA;UAAA,6GAAA;EAA4G,WAAA;AZiwD77N;;AYjwDw8N;EAAwB;IAAG,cAAA;EZswDj+N;EYtwD++N;IAAM,cAAA;EZywDr/N;EYzwDmgO;IAAM,cAAA;EZ4wDzgO;EY5wDuhO;IAAG,cAAA;EZ+wD1hO;AACF;;AYhxDw8N;EAAwB;IAAG,cAAA;EZswDj+N;EYtwD++N;IAAM,cAAA;EZywDr/N;EYzwDmgO;IAAM,cAAA;EZ4wDzgO;EY5wDuhO;IAAG,cAAA;EZ+wD1hO;AACF;AYhxD2iO;EAA8B;IAAG,cAAA;EZoxD1kO;EYpxDwlO;IAAM,cAAA;EZuxD9lO;EYvxD4mO;IAAM,cAAA;EZ0xDlnO;EY1xDgoO;IAAG,cAAA;EZ6xDnoO;AACF;AY9xD2iO;EAA8B;IAAG,cAAA;EZoxD1kO;EYpxDwlO;IAAM,cAAA;EZuxD9lO;EYvxD4mO;IAAM,cAAA;EZ0xDlnO;EY1xDgoO;IAAG,cAAA;EZ6xDnoO;AACF;AY9xDopO;EAAmB;IAAG,SAAA;EZkyDxqO;EYlyDirO;IAAG,YAAA;EZqyDprO;AACF;AYtyDopO;EAAmB;IAAG,SAAA;EZkyDxqO;EYlyDirO;IAAG,YAAA;EZqyDprO;AACF;AYtyDmsO;EAAyC,WAAA;EAAW,eAAA;EAAe,YAAA;EAAY,aAAA;EAAa,QAAA;EAAQ,SAAA;EAAS,yBAAA;EAAyB,kBAAA;EAAkB,kBAAA;EAAkB,kBAAA;EAAkB,WAAA;EAAW,eAAA;EAAe,yCAAA;EAAuC,yCAAA;EAAqC,oBAAA;AZuzDr+O;;AYvzDy/O;EAAoB,mCAAA;UAAA,2BAAA;AZ2zD7gP;;AY3zDwiP;EAAmE,sBAAA;AZ+zD3mP;;AY/zDioP;EAAkC,sBAAA;EAAsB,WAAA;EAAW,kFAAA;UAAA,0EAAA;AZq0DpsP;;AYr0D6wP;EAAiC,sBAAA;EAAsB,yEAAA;UAAA,iEAAA;AZ00Dp0P;;AY10Do4P;EAAmE,4DAAA;EAA0D,2BAAA;AZ+0DjgQ;;AY/0D4hQ;EAAkC,mFAAA;UAAA,2EAAA;AZm1D9jQ;;AYn1DwoQ;EAAiC,wEAAA;UAAA,gEAAA;AZu1DzqQ;;AYv1DwuQ;EAAkC,wFAAA;UAAA,gFAAA;EAA+E,kEAAA;AZ41Dz1Q;;AY51Dy5Q;EAAiC,2EAAA;UAAA,mEAAA;EAAkE,kEAAA;AZi2D5/Q;;AYj2D4jR;EAAoC,uFAAA;UAAA,+EAAA;EAA8E,gBAAA;AZs2D9qR;;AYt2D8rR;EAAmC,4EAAA;UAAA,oEAAA;EAAmE,mBAAA;AZ22DpyR;;AY32DuzR;EAAgB;IAAG,0BAAA;EZg3Dx0R;AACF;;AYj3DuzR;EAAgB;IAAG,0BAAA;EZg3Dx0R;AACF;AYj3Dq2R;EAAoB;IAAG,0BAAA;EZq3D13R;EYr3Do5R;IAAI,yBAAA;EZw3Dx5R;EYx3Di7R;IAAG,0BAAA;EZ23Dp7R;AACF;AY53Dq2R;EAAoB;IAAG,0BAAA;EZq3D13R;EYr3Do5R;IAAI,yBAAA;EZw3Dx5R;EYx3Di7R;IAAG,0BAAA;EZ23Dp7R;AACF;AY53Di9R;EAAe;IAAG,eAAA;EZg4Dj+R;EYh4Dg/R;IAAI,iBAAA;EZm4Dp/R;EYn4DqgS;IAAG,eAAA;EZs4DxgS;AACF;AYv4Di9R;EAAe;IAAG,eAAA;EZg4Dj+R;EYh4Dg/R;IAAI,iBAAA;EZm4Dp/R;EYn4DqgS;IAAG,eAAA;EZs4DxgS;AACF;AYv4D0hS;EAAc;IAAG,cAAA;EZ24DziS;EY34DujS;IAAI,cAAA;EZ84D3jS;EY94DykS;IAAG,cAAA;EZi5D5kS;AACF;AYl5D0hS;EAAc;IAAG,cAAA;EZ24DziS;EY34DujS;IAAI,cAAA;EZ84D3jS;EY94DykS;IAAG,cAAA;EZi5D5kS;AACF;AYl5D6lS;EAAc;IAAG,gBAAA;EZs5D5mS;EYt5D4nS;IAAI,aAAA;EZy5DhoS;EYz5D6oS;IAAG,gBAAA;EZ45DhpS;AACF;AY75D6lS;EAAc;IAAG,gBAAA;EZs5D5mS;EYt5D4nS;IAAI,aAAA;EZy5DhoS;EYz5D6oS;IAAG,gBAAA;EZ45DhpS;AACF;AY75DmqS;EAAe;IAAG,gBAAA;EZi6DnrS;EYj6DmsS;IAAI,eAAA;EZo6DvsS;EYp6DstS;IAAG,gBAAA;EZu6DztS;AACF;AYx6DmqS;EAAe;IAAG,gBAAA;EZi6DnrS;EYj6DmsS;IAAI,eAAA;EZo6DvsS;EYp6DstS;IAAG,gBAAA;EZu6DztS;AACF;AYx6D4uS;EAAiB;IAAG,iBAAA;EZ46D9vS;EY56D+wS;IAAI,iBAAA;EZ+6DnxS;EY/6DoyS;IAAG,iBAAA;EZk7DvyS;AACF;AYn7D4uS;EAAiB;IAAG,iBAAA;EZ46D9vS;EY56D+wS;IAAI,iBAAA;EZ+6DnxS;EY/6DoyS;IAAG,iBAAA;EZk7DvyS;AACF;AYn7D2zS;EAAoB;IAAG,qBAAA;EZu7Dh1S;EYv7Dq2S;IAAI,wBAAA;EZ07Dz2S;EY17Di4S;IAAG,qBAAA;EZ67Dp4S;AACF;AY97D2zS;EAAoB;IAAG,qBAAA;EZu7Dh1S;EYv7Dq2S;IAAI,wBAAA;EZ07Dz2S;EY17Di4S;IAAG,qBAAA;EZ67Dp4S;AACF;AY97D45S;EAAkB;IAAG,mBAAA;EZk8D/6S;EYl8Dk8S;IAAI,oBAAA;EZq8Dt8S;EYr8D09S;IAAG,mBAAA;EZw8D79S;AACF;AYz8D45S;EAAkB;IAAG,mBAAA;EZk8D/6S;EYl8Dk8S;IAAI,oBAAA;EZq8Dt8S;EYr8D09S;IAAG,mBAAA;EZw8D79S;AACF;AYz8Dm/S;EAAmB;IAAG,kBAAA;EZ68DvgT;EY78DyhT;IAAI,aAAA;EZg9D7hT;EYh9D8iT;IAAG,kBAAA;EZm9DjjT;AACF;AYp9Dm/S;EAAmB;IAAG,kBAAA;EZ68DvgT;EY78DyhT;IAAI,aAAA;EZg9D7hT;EYh9D8iT;IAAG,kBAAA;EZm9DjjT;AACF;AYp9DskT;EAAwB,WAAA;EAAW,kBAAA;EAAkB,YAAA;EAAY,aAAA;EAAa,QAAA;EAAQ,SAAA;EAAS,uBAAA;EAAuB,sEAAA;EAAkE,4BAAA;EAA4B,sBAAA;EAAsB,kBAAA;EAAkB,UAAA;EAAU,uDAAA;UAAA,+CAAA;AZm+D50T;;AYn+D23T;EAAuB,WAAA;EAAW,kBAAA;EAAkB,WAAA;EAAW,YAAA;EAAY,QAAA;EAAQ,SAAA;EAAS,uBAAA;EAAuB,sBAAA;EAAsB,kBAAA;EAAkB,UAAA;EAAU,8FAAA;UAAA,sFAAA;EAAoF,sBAAA;EAAsB,2CAAA;AZm/D1oU;;AYn/DorU;EAAwB;IAAG,kCAAA;EZw/D7sU;EYx/D+uU;IAAI,0CAAA;EZ2/DnvU;EY3/D6xU;IAAI,wCAAA;EZ8/DjyU;EY9/Dy0U;IAAI,kCAAA;EZigE70U;AACF;;AYlgEorU;EAAwB;IAAG,kCAAA;EZw/D7sU;EYx/D+uU;IAAI,0CAAA;EZ2/DnvU;EY3/D6xU;IAAI,wCAAA;EZ8/DjyU;EY9/Dy0U;IAAI,kCAAA;EZigE70U;AACF;AYlgEk3U;EAAyB;IAAG,sBAAA;EZsgE54U;EYtgEk6U;IAAG,sBAAA;EZygEr6U;AACF;AY1gEk3U;EAAyB;IAAG,sBAAA;EZsgE54U;EYtgEk6U;IAAG,sBAAA;EZygEr6U;AACF;AY1gE87U;EAA+C,WAAA;EAAW,WAAA;EAAW,YAAA;EAAY,kBAAA;EAAkB,qBAAA;EAAqB,sBAAA;EAAsB,kBAAA;EAAkB,sBAAA;EAAsB,+CAAA;UAAA,uCAAA;AZqhEpnV;;AYrhE0pV;EAAuB,kBAAA;EAAkB,+CAAA;UAAA,uCAAA;AZ0hEnsV;;AY1hEyuV;EAAwB,6BAAA;UAAA,qBAAA;AZ8hEjwV;;AY9hEqxV;EAAgB;IAAG,UAAA;IAAU,wBAAA;EZoiEhzV;EYpiEw0V;IAAG,YAAA;IAAW,4BAAA;EZwiEt1V;AACF;;AYziEqxV;EAAgB;IAAG,UAAA;IAAU,wBAAA;EZoiEhzV;EYpiEw0V;IAAG,YAAA;IAAW,4BAAA;EZwiEt1V;AACF;AaziEA;EACE,YAAA;EACA,WAAA;EACA,cAAA;EACA,kBAAA;EACA,kBAAA;EACA,qBAAA;EACA,QAAA;EACA,SAAA;Ab2iEF;;AaziEE;EACE,WAAA;EACA,SAAA;EACA,QAAA;EACA,eAAA;EACA,iBAAA;EACA,sBAAA;EACA,kBAAA;EACA,SAAA;EACA,QAAA;EACA,mDAAA;UAAA,2CAAA;Ab4iEJ;;Aa3iEE;EACE,8BAAA;UAAA,sBAAA;Ab8iEJ;;Aa5iEA;EACE;IACE,SAAA;IACA,QAAA;IACA,YAAA;IACA,WAAA;Eb+iEF;Ea7iEA;IACE,YAAA;IACA,WAAA;IACA,WAAA;IACA,UAAA;IACA,UAAA;Eb+iEF;AACF;;Aa5jEA;EACE;IACE,SAAA;IACA,QAAA;IACA,YAAA;IACA,WAAA;Eb+iEF;Ea7iEA;IACE,YAAA;IACA,WAAA;IACA,WAAA;IACA,UAAA;IACA,UAAA;Eb+iEF;AACF,CAAA,oCAAA","sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVcsVUFBVSxZQUFZLFdBQVcsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssTUFBTSxNQUFNLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsWUFBWSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE1BQU0sT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLFVBQVUsS0FBSyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxhQUFhLFlBQVksV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxVQUFVLEtBQUssTUFBTSxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxZQUFZLFlBQVksYUFBYSxZQUFZLFlBQVksVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxjQUFjLGNBQWMsZUFBZSxjQUFjLGNBQWMsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLGNBQWMsY0FBYyxlQUFlLGVBQWUsY0FBYyxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsVUFBVSxZQUFZLFlBQVksYUFBYSxhQUFhLGFBQWEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsV0FBVyxVQUFVLGNBQWMsY0FBYyxlQUFlLGNBQWMsY0FBYyxXQUFXLFFBQVEsUUFBUSxZQUFZLGFBQWEsV0FBVyxRQUFRLFFBQVEsVUFBVSxTQUFTLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsTUFBTSxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssWUFBWSxLQUFLLEtBQUssV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxTQUFTLFFBQVEsS0FBSyxVQUFVLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxZQUFZLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLE1BQU0sUUFBUSxLQUFLLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFlB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LE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxLQUFLLE1BQU0sVUFBVSxLQUFLLE1BQU0sV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsTUFBTSxNQUFNLE1BQU0sV0FBVyxLQUFLLEtBQUssTUFBTSxNQUFNLFdBQVcsS0FBSyxNQUFNLEtBQUssVUFBVSxVQUFVLEtBQUssTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sTUFBTSxVQUFVLE9BQU8sS0FBSyxPQUFPLFVBQVUsT0FBTyxNQUFNLE1BQU0sVUFBVSxPQUFPLEtBQUssTUFBTSxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsT0FBTyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssT0FBTyxVQUFVLE9BQU8sTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE9BQU8sV0FBVyxXQUFXLE1BQU0sT0FBTyxXQUFXLE1BQU0sTUFBTSxVQUFVLE1BQU0sT0FBTyxVQUFVLE9BQU8sTUFBTSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sS0FBSyxNQUFNLFdBQVcsV0FBVyxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxNQUFNLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsT0FBTyxNQUFNLFdBQVcsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sVUFBVSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLFdBQVcsT0FBTyxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFdBQVcsUUFBUSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLE1BQU0sT0FBTyxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sV0FBVyxVQUFVLFdBQVcsTUFBTSxPQUFPLE1BQU0sVUFBVSxVQUFVLE1BQU0sS0FBSyxNQUFNLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxVQUFVLE9BQU8sTUFBTSxVQUFVLFVBQVUsT0FBTyxPQUFPLE1BQU0sVUFBVSxPQUFPLEtBQUssTUFBTSxXQUFXLFVBQVUsV0FBVyxXQUFXLFFBQVEsTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxVQUFVLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sVUFBVSxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsUUFBUSxPQUFPLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFdBQVcsUUFBUSxPQUFPLFVBQVUsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxVQUFVLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsVUFBVSxVQUFVLFdBQVcsUUFBUSxPQUFPLEtBQUssVUFBVSxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxVQUFVLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sVUFBVSxVQUFVLFVBQVUsUUFBUSxPQUFPLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxNQUFNLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxXQUFXLFVBQVUsWUFBWSxRQUFRLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxVQUFVLFVBQVUsUUFBUSxPQUFPLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxPQUFPLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxRQUFRLFdBQVcsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxVQUFVLFFBQVEsT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsUUFBUSxPQUFPLFdBQVcsV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsUUFBUSxPQUFPLFdBQVcsVUFBVSxRQUFRLFFBQVEsVUFBVSxVQUFVLFVBQVUsVUFBVSxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFVBQVUsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFVBQVUsUUFBUSxRQUFRLFVBQVUsUUFBUSxPQUFPLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxPQUFPLFFBQVEsVUFBVSxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFVBQVUsU0FBUyxPQUFPLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLFVBQVUsUUFBUSxPQUFPLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sT0FBTyxXQUFXLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxVQUFVLFFBQVEsT0FBTyxXQUFXLFdBQVcsUUFBUSxPQUFPLFdBQVcsVUFBVSxXQUFXLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxVQUFVLFFBQVEsUUFBUSxVQUFVLFVBQVUsUUFBUSxRQUFRLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsVUFBVSxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxRQUFRLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFNBQVMsUUFBUSxZQUFZLFdBQVcsU0FBUyxRQUFRLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxTQUFTLFFBQVEsV0FBVyxTQUFTLFFBQVEsTUFBTSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsTUFBTSxRQUFRLE1BQU0sV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxNQUFNLFVBQVUsUUFBUSxRQUFRLFVBQVUsUUFBUSxLQUFLLFFBQVEsV0FBVyxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxVQUFVLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxZQUFZLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsV0FBVyxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksVUFBVSxTQUFTLFdBQVcsV0FBVyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxXQUFXLFdBQVcsVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxVQUFVLFNBQVMsU0FBUyxVQUFVLFVBQVUsV0FBVyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFdBQVcsWUFBWSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxVQUFVLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFVBQVUsU0FBUyxTQUFTLFVBQVUsVUFBVSxXQUFXLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsV0FBVyxZQUFZLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFVBQVUsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsU0FBUyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksV0FBVyxVQUFVLFNBQVMsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxXQUFXLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFdBQVcsV0FBVyxZQUFZLFlBQVksV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxNQUFNLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsTUFBTSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxXQUFXLFVBQVUsU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxNQUFNLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxLQUFLLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxLQUFLLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsS0FBSyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLEtBQUssV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxLQUFLLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsS0FBSyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxZQUFZLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFdBQVcsV0FBVyxZQUFZLFlBQVksVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxXQUFXLFVBQVUsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxNQUFNLFVBQVUsV0FBVyxTQUFTLFNBQVMsVUFBVSxXQUFXLFNBQVMsTUFBTSxTQUFTLE1BQU0sVUFBVSxXQUFXLFNBQVMsU0FBUyxVQUFVLFdBQVcsU0FBUyxLQUFLLE9BQU8sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsUUFBUSxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sS0FBSyxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxNQUFNLE9BQU8sS0FBSyxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsT0FBTyxpQ0FBaUM7QUFDaHY5RTtBQUNBLGlFQUFlLHVCQUF1QixFQUFDOzs7Ozs7Ozs7Ozs7QUNQMUI7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjs7QUFFakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxREFBcUQ7QUFDckQ7O0FBRUE7QUFDQSxnREFBZ0Q7QUFDaEQ7O0FBRUE7QUFDQSxxRkFBcUY7QUFDckY7O0FBRUE7O0FBRUE7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQSxLQUFLO0FBQ0wsS0FBSzs7O0FBR0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxzQkFBc0IsaUJBQWlCO0FBQ3ZDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUJBQXFCLHFCQUFxQjtBQUMxQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLHNGQUFzRixxQkFBcUI7QUFDM0c7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixpREFBaUQscUJBQXFCO0FBQ3RFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Ysc0RBQXNELHFCQUFxQjtBQUMzRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7O0FDckdhOztBQUViO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVEQUF1RCxjQUFjO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcEJBLE1BQStGO0FBQy9GLE1BQXFGO0FBQ3JGLE1BQTRGO0FBQzVGLE1BQStHO0FBQy9HLE1BQXdHO0FBQ3hHLE1BQXdHO0FBQ3hHLE1BQWtHO0FBQ2xHO0FBQ0E7O0FBRUE7O0FBRUEsNEJBQTRCLHFHQUFtQjtBQUMvQyx3QkFBd0Isa0hBQWE7O0FBRXJDLHVCQUF1Qix1R0FBYTtBQUNwQztBQUNBLGlCQUFpQiwrRkFBTTtBQUN2Qiw2QkFBNkIsc0dBQWtCOztBQUUvQyxhQUFhLDBHQUFHLENBQUMscUZBQU87Ozs7QUFJNEM7QUFDcEUsT0FBTyxpRUFBZSxxRkFBTyxJQUFJLDRGQUFjLEdBQUcsNEZBQWMsWUFBWSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6QjdFLE1BQStGO0FBQy9GLE1BQXFGO0FBQ3JGLE1BQTRGO0FBQzVGLE1BQStHO0FBQy9HLE1BQXdHO0FBQ3hHLE1BQXdHO0FBQ3hHLE1BQW1HO0FBQ25HO0FBQ0E7O0FBRUE7O0FBRUEsNEJBQTRCLHFHQUFtQjtBQUMvQyx3QkFBd0Isa0hBQWE7O0FBRXJDLHVCQUF1Qix1R0FBYTtBQUNwQztBQUNBLGlCQUFpQiwrRkFBTTtBQUN2Qiw2QkFBNkIsc0dBQWtCOztBQUUvQyxhQUFhLDBHQUFHLENBQUMsc0ZBQU87Ozs7QUFJNkM7QUFDckUsT0FBTyxpRUFBZSxzRkFBTyxJQUFJLDZGQUFjLEdBQUcsNkZBQWMsWUFBWSxFQUFDOzs7Ozs7Ozs7Ozs7QUMxQmhFOztBQUViOztBQUVBO0FBQ0E7O0FBRUEsa0JBQWtCLHdCQUF3QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixpQkFBaUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG9CQUFvQiw0QkFBNEI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEscUJBQXFCLDZCQUE2QjtBQUNsRDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDdkdhOztBQUViO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNEQUFzRDs7QUFFdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7QUN0Q2E7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDVmE7O0FBRWI7QUFDQTtBQUNBLGNBQWMsS0FBd0MsR0FBRyxzQkFBaUIsR0FBRyxDQUFJOztBQUVqRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7QUNYYTs7QUFFYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrREFBa0Q7QUFDbEQ7O0FBRUE7QUFDQSwwQ0FBMEM7QUFDMUM7O0FBRUE7O0FBRUE7QUFDQSxpRkFBaUY7QUFDakY7O0FBRUE7O0FBRUE7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7O0FBRUE7QUFDQSx5REFBeUQ7QUFDekQsSUFBSTs7QUFFSjs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7OztBQ3JFYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNmQTtBQUN5QjtBQUNXO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLHVDQUF1QztBQUNqRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxrQkFBa0I7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9GQUFvRixrQkFBa0I7QUFDdEc7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9GQUFvRixrQkFBa0I7QUFDdEc7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGlFQUFlOzs7Ozs7Ozs7Ozs7Ozs7OztBQzdnQ2Y7QUFDQTtBQUN5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9FQUFvRSxPQUFPO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFlOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3hPVztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxnREFBUztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQsOEJBQThCO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQyw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLDBDQUEwQyx5QkFBeUI7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsbUJBQW1CO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCLG1DQUFtQyx1REFBdUQsU0FBUyxpREFBaUQ7QUFDcEo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLDBDQUEwQyxtQ0FBbUMscUJBQXFCLEVBQUU7QUFDcEcsd0RBQXdELGNBQWM7QUFDdEU7QUFDQSxpQ0FBaUMsUUFBUTtBQUN6QyxpQ0FBaUMsY0FBYztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsZ0NBQWdDO0FBQ2hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEIsc0JBQXNCLGtFQUFrRSxZQUFZLEtBQUssZUFBZTtBQUN4SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxnRUFBZ0Usc0JBQXNCO0FBQ3RGLDhFQUE4RSxzQkFBc0I7QUFDcEcsa0VBQWtFLHNCQUFzQjtBQUN4RjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUUsU0FBUztBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFlLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlXRTtBQUNVO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxnREFBUztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsMENBQTBDO0FBQzVELGlCQUFpQixpREFBaUQsNkNBQTZDLFNBQVMsRUFBRSx5Q0FBeUM7QUFDbkssc0RBQXNELG1EQUFtRCxhQUFhLHVDQUF1QyxTQUFTLHFEQUFxRDtBQUMzTixpQkFBaUIsb0RBQW9EO0FBQ3JFO0FBQ0E7QUFDQSxRQUFRLG1FQUEwQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkLGtCQUFrQjtBQUNsQixzQkFBc0IscUVBQXFFLFlBQVksS0FBSyxlQUFlO0FBQzNIO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGlFQUFlLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDbkgxQjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDMEI7QUFDRjtBQUN4QjtBQUNzQztBQUNRO0FBQ1I7QUFDUztBQUNIO0FBQzVDO0FBQ0EsbUJBQW1CLHVEQUFNO0FBQ3pCLHVCQUF1QiwyREFBVTtBQUNqQyxpQkFBaUIseURBQUk7QUFDckIsd0JBQXdCLDJEQUFXO0FBQ25DLHNCQUFzQiwwREFBUyxHIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3ZhbGlkYXRvci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL2NhaC8uL2Nzcy9kb3RzLmNzcyIsIndlYnBhY2s6Ly9jYWgvLi9jc3Mvc3R5bGUuY3NzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vY3NzL2RvdHMuY3NzPzc2NDIiLCJ3ZWJwYWNrOi8vY2FoLy4vY3NzL3N0eWxlLmNzcz9kYTFmIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvYWxsLW5ld3MuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvcGFnaW5hdGlvbi5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9zZWFyY2guanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvc2hhZG93Qm94LmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3NpbmdsZVBvc3QuanMiLCJ3ZWJwYWNrOi8vY2FoL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NhaC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NhaC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2NhaC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NhaC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBjb25maWcudHJhbnNpdGlvbmFsICYmIGNvbmZpZy50cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbDtcblxuICBpZiAodHJhbnNpdGlvbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWxpZGF0b3IuYXNzZXJ0T3B0aW9ucyh0cmFuc2l0aW9uYWwsIHtcbiAgICAgIHNpbGVudEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgZm9yY2VkSlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBjbGFyaWZ5VGltZW91dEVycm9yOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpXG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBza2lwcGVkIGludGVyY2VwdG9yc1xuICB2YXIgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdmFyIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHRydWU7XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGlmICh0eXBlb2YgaW50ZXJjZXB0b3IucnVuV2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnRlcmNlcHRvci5ydW5XaGVuKGNvbmZpZykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9yLnN5bmNocm9ub3VzO1xuXG4gICAgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoIXN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycykge1xuICAgIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG5cbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjaGFpbiwgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4pO1xuICAgIGNoYWluID0gY2hhaW4uY29uY2F0KHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbik7XG5cbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG5cbiAgdmFyIG5ld0NvbmZpZyA9IGNvbmZpZztcbiAgd2hpbGUgKHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHZhciBvbkZ1bGZpbGxlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdmFyIG9uUmVqZWN0ZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHRyeSB7XG4gICAgICBuZXdDb25maWcgPSBvbkZ1bGZpbGxlZChuZXdDb25maWcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvblJlamVjdGVkKGVycm9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcHJvbWlzZSA9IGRpc3BhdGNoUmVxdWVzdChuZXdDb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cblxuICB3aGlsZSAocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4ocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCksIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgIGNvbmZpZyxcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgY29uZmlnLFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIHZhciBjb250ZXh0ID0gdGhpcyB8fCBkZWZhdWx0cztcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4uY2FsbChjb250ZXh0LCBkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9jb3JlL2VuaGFuY2VFcnJvcicpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVNhZmVseShyYXdWYWx1ZSwgcGFyc2VyLCBlbmNvZGVyKSB7XG4gIGlmICh1dGlscy5pc1N0cmluZyhyYXdWYWx1ZSkpIHtcbiAgICB0cnkge1xuICAgICAgKHBhcnNlciB8fCBKU09OLnBhcnNlKShyYXdWYWx1ZSk7XG4gICAgICByZXR1cm4gdXRpbHMudHJpbShyYXdWYWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubmFtZSAhPT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoZW5jb2RlciB8fCBKU09OLnN0cmluZ2lmeSkocmF3VmFsdWUpO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cbiAgdHJhbnNpdGlvbmFsOiB7XG4gICAgc2lsZW50SlNPTlBhcnNpbmc6IHRydWUsXG4gICAgZm9yY2VkSlNPTlBhcnNpbmc6IHRydWUsXG4gICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogZmFsc2VcbiAgfSxcblxuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpIHx8IChoZWFkZXJzICYmIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID09PSAnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHJldHVybiBzdHJpbmdpZnlTYWZlbHkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICB2YXIgdHJhbnNpdGlvbmFsID0gdGhpcy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBwa2cgPSByZXF1aXJlKCcuLy4uLy4uL3BhY2thZ2UuanNvbicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xudmFyIGN1cnJlbnRWZXJBcnIgPSBwa2cudmVyc2lvbi5zcGxpdCgnLicpO1xuXG4vKipcbiAqIENvbXBhcmUgcGFja2FnZSB2ZXJzaW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gdGhhblZlcnNpb25cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uLCB0aGFuVmVyc2lvbikge1xuICB2YXIgcGtnVmVyc2lvbkFyciA9IHRoYW5WZXJzaW9uID8gdGhhblZlcnNpb24uc3BsaXQoJy4nKSA6IGN1cnJlbnRWZXJBcnI7XG4gIHZhciBkZXN0VmVyID0gdmVyc2lvbi5zcGxpdCgnLicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGlmIChwa2dWZXJzaW9uQXJyW2ldID4gZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChwa2dWZXJzaW9uQXJyW2ldIDwgZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvclxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgdmFyIGlzRGVwcmVjYXRlZCA9IHZlcnNpb24gJiYgaXNPbGRlclZlcnNpb24odmVyc2lvbik7XG5cbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIHBrZy52ZXJzaW9uICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkIGluICcgKyB2ZXJzaW9uKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGVwcmVjYXRlZCAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNPbGRlclZlcnNpb246IGlzT2xkZXJWZXJzaW9uLFxuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJAY2hhcnNldCBcXFwiVVRGLThcXFwiO1xcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRWxhc3RpY1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWVsYXN0aWMge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1lbGFzdGljIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZWxhc3RpYyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcbi5kb3QtZWxhc3RpYzo6YmVmb3JlLCAuZG90LWVsYXN0aWM6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWVsYXN0aWM6OmJlZm9yZSB7XFxuICBsZWZ0OiAtOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZWxhc3RpYy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1lbGFzdGljLWJlZm9yZSAxcyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcbi5kb3QtZWxhc3RpYzo6YWZ0ZXIge1xcbiAgbGVmdDogOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZWxhc3RpYy1hZnRlciAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWVsYXN0aWMtYWZ0ZXIgMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWVsYXN0aWMtYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMC42Nyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWVsYXN0aWMtYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMC42Nyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZWxhc3RpYyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1lbGFzdGljIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZWxhc3RpYy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAwLjY3KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1lbGFzdGljLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgUHVsc2VcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1wdWxzZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAtNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1wdWxzZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcHVsc2UgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4yNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC4yNXM7XFxufVxcbi5kb3QtcHVsc2U6OmJlZm9yZSwgLmRvdC1wdWxzZTo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3QtcHVsc2U6OmJlZm9yZSB7XFxuICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXB1bHNlLWJlZm9yZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcHVsc2UtYmVmb3JlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDBzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDBzO1xcbn1cXG4uZG90LXB1bHNlOjphZnRlciB7XFxuICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1wdWxzZS1hZnRlciAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcHVsc2UtYWZ0ZXIgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC41cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXB1bHNlLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1wdWxzZS1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1wdWxzZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1wdWxzZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMnB4O1xcbiAgfVxcbiAgNjAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXB1bHNlLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LXB1bHNlLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIH1cXG4gIDMwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRmxhc2hpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1mbGFzaGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGxpbmVhciBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGxpbmVhciBhbHRlcm5hdGU7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC41cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbn1cXG4uZG90LWZsYXNoaW5nOjpiZWZvcmUsIC5kb3QtZmxhc2hpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWZsYXNoaW5nOjpiZWZvcmUge1xcbiAgbGVmdDogLTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDBzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDBzO1xcbn1cXG4uZG90LWZsYXNoaW5nOjphZnRlciB7XFxuICBsZWZ0OiA5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAxcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAxcztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mbGFzaGluZyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICB9XFxuICA1MCUsIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDY1LCA4OCwgOTUsIDAuMik7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWZsYXNoaW5nIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSwgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNjUsIDg4LCA5NSwgMC4yKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBDb2xsaXNpb25cXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1jb2xsaXNpb24ge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LWNvbGxpc2lvbjo6YmVmb3JlLCAuZG90LWNvbGxpc2lvbjo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtY29sbGlzaW9uOjpiZWZvcmUge1xcbiAgbGVmdDogLTU1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtY29sbGlzaW9uLWJlZm9yZSAycyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4uZG90LWNvbGxpc2lvbjo6YWZ0ZXIge1xcbiAgbGVmdDogNTVweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtY29sbGlzaW9uLWFmdGVyIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1hZnRlciAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDFzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDFzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1iZWZvcmUge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC05OXB4KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtY29sbGlzaW9uLWJlZm9yZSB7XFxuICAwJSwgNTAlLCA3NSUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTk5cHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1hZnRlciB7XFxuICAwJSwgNTAlLCA3NSUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoOTlweCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1hZnRlciB7XFxuICAwJSwgNTAlLCA3NSUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoOTlweCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgUmV2b2x1dGlvblxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXJldm9sdXRpb24ge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LXJldm9sdXRpb246OmJlZm9yZSwgLmRvdC1yZXZvbHV0aW9uOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuLmRvdC1yZXZvbHV0aW9uOjpiZWZvcmUge1xcbiAgbGVmdDogMDtcXG4gIHRvcDogLTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAyNy41cHggMTI2LjVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcmV2b2x1dGlvbiAxLjRzIGxpbmVhciBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtcmV2b2x1dGlvbiAxLjRzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuLmRvdC1yZXZvbHV0aW9uOjphZnRlciB7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiAtMTk4cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAyNy41cHggMjI1LjVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcmV2b2x1dGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXJldm9sdXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXJldm9sdXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgQ2Fyb3VzZWxcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1jYXJvdXNlbCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWNhcm91c2VsIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1jYXJvdXNlbCAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1jYXJvdXNlbCB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMXB4ICM0MTU4NWYsIDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZiwgOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWNhcm91c2VsIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5OTlweCAwIDAgMXB4ICM0MTU4NWYsIDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZiwgOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5OTlweCAwIDAgMXB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAxcHggIzQxNTg1ZiwgMTAwOThweCAwIDAgLTFweCAjNDE1ODVmLCA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBUeXBpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC10eXBpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC10eXBpbmcgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXR5cGluZyAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC10eXBpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTEwcHggMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IC0xMHB4IDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IC0xMHB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC10eXBpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTEwcHggMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IC0xMHB4IDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IC0xMHB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFdpbmRtaWxsXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtd2luZG1pbGwge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAtMTBweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIHRyYW5zZm9ybS1vcmlnaW46IDVweCAxNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC13aW5kbWlsbCAycyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXdpbmRtaWxsIDJzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuLmRvdC13aW5kbWlsbDo6YmVmb3JlLCAuZG90LXdpbmRtaWxsOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuLmRvdC13aW5kbWlsbDo6YmVmb3JlIHtcXG4gIGxlZnQ6IC04LjY2MjU0cHg7XFxuICB0b3A6IDE1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3Qtd2luZG1pbGw6OmFmdGVyIHtcXG4gIGxlZnQ6IDguNjYyNTRweDtcXG4gIHRvcDogMTVweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC13aW5kbWlsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooNzIwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCAwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtd2luZG1pbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDcyMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgQnJpY2tzXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtYnJpY2tzIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRvcDogMzAuNXB4O1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtYnJpY2tzIDJzIGluZmluaXRlIGVhc2U7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWJyaWNrcyAycyBpbmZpbml0ZSBlYXNlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWJyaWNrcyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDguMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAyNSUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDQxLjY2NyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA1OC4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDY2LjY2NiUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgOTEuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1icmlja3Mge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA0MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTguMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjYlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDkxLjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBGbG9hdGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWZsb2F0aW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmcgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMTUsIDAuNiwgMC45LCAwLjEpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbG9hdGluZyAzcyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4xNSwgMC42LCAwLjksIDAuMSk7XFxufVxcbi5kb3QtZmxvYXRpbmc6OmJlZm9yZSwgLmRvdC1mbG9hdGluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtZmxvYXRpbmc6OmJlZm9yZSB7XFxuICBsZWZ0OiAtMTJweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYmVmb3JlIDNzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbG9hdGluZy1iZWZvcmUgM3MgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XFxufVxcbi5kb3QtZmxvYXRpbmc6OmFmdGVyIHtcXG4gIGxlZnQ6IC0yNHB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbG9hdGluZy1hZnRlciAzcyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC40LCAwLCAxLCAxKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYWZ0ZXIgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMSwgMSk7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxvYXRpbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKC01MCUgLSAyNy41cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDEyNy41cHgpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1mbG9hdGluZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoLTUwJSAtIDI3LjVweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDEyNy41cHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgMTI3LjVweCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxvYXRpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBsZWZ0OiAtMTJweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1mbG9hdGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGxlZnQ6IC0xMnB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxvYXRpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBsZWZ0OiAtMjRweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZsb2F0aW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTI0cHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZpcmVcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1maXJlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAtMC44NXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuODVzO1xcbn1cXG4uZG90LWZpcmU6OmJlZm9yZSwgLmRvdC1maXJlOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1maXJlOjpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTEuODVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0xLjg1cztcXG59XFxuLmRvdC1maXJlOjphZnRlciB7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmlyZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAtMi44NXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogLTIuODVzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZpcmUge1xcbiAgMSUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtMzcuMTI1cHggMCAycHggIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWZpcmUge1xcbiAgMSUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMTQ4LjVweCAwIC01cHggIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtMzcuMTI1cHggMCAycHggIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgU3BpblxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXNwaW4ge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXNwaW4gMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXNwaW4gMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc3BpbiB7XFxuICAwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDEyLjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMzcuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA2Mi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDg3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1zcGluIHtcXG4gIDAlLCAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMTIuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAzNy41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDYyLjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODcuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRmFsbGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWZhbGxpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mYWxsaW5nIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmFsbGluZyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4xcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjFzO1xcbn1cXG4uZG90LWZhbGxpbmc6OmJlZm9yZSwgLmRvdC1mYWxsaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1mYWxsaW5nOjpiZWZvcmUge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mYWxsaW5nLWJlZm9yZSAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZhbGxpbmctYmVmb3JlIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcXG59XFxuLmRvdC1mYWxsaW5nOjphZnRlciB7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZhbGxpbmctYWZ0ZXIgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mYWxsaW5nLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmFsbGluZyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZmFsbGluZyB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1mYWxsaW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAtOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSwgNTAlLCA3NSUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZmFsbGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmFsbGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZmFsbGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggOTlweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBTdHJldGNoaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtc3RyZXRjaGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm06IHNjYWxlKDEuMjUsIDEuMjUpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zdHJldGNoaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmcgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1zdHJldGNoaW5nOjpiZWZvcmUsIC5kb3Qtc3RyZXRjaGluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3Qtc3RyZXRjaGluZzo6YmVmb3JlIHtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZy1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZy1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1zdHJldGNoaW5nOjphZnRlciB7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZy1hZnRlciAycyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMjUsIDEuMjUpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOCwgMC44KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMjUsIDEuMjUpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgsIDAuOCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTIwcHgpIHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0yMHB4KSBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgyMHB4KSBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBHYXRoZXJpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1nYXRoZXJpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG59XFxuLmRvdC1nYXRoZXJpbmc6OmJlZm9yZSwgLmRvdC1nYXRoZXJpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogLTUwcHg7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBvcGFjaXR5OiAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWdhdGhlcmluZyAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1nYXRoZXJpbmcgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1nYXRoZXJpbmc6OmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuNXM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZ2F0aGVyaW5nIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMzUlLCA2MCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNTBweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwMHB4KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZ2F0aGVyaW5nIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMzUlLCA2MCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNTBweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgb3BhY2l0eTogMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwMHB4KTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogR29vZXkgRWZmZWN0XFxuICogRG90IEhvdXJnbGFzc1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWhvdXJnbGFzcyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0b3A6IC05OXB4O1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG4gIHRyYW5zZm9ybS1vcmlnaW46IDI3LjVweCAxMjYuNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1ob3VyZ2xhc3MgMi40cyBpbmZpbml0ZSBlYXNlLWluLW91dDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzIDIuNHMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC42cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjZzO1xcbn1cXG4uZG90LWhvdXJnbGFzczo6YmVmb3JlLCAuZG90LWhvdXJnbGFzczo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAwO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3QtaG91cmdsYXNzOjpiZWZvcmUge1xcbiAgdG9wOiAxOThweDtcXG59XFxuLmRvdC1ob3VyZ2xhc3M6OmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzLWFmdGVyIDIuNHMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNjUsIDAuMDUsIDAuMzYsIDEpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1ob3VyZ2xhc3MtYWZ0ZXIgMi40cyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC42NSwgMC4wNSwgMC4zNiwgMSk7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtaG91cmdsYXNzIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTgwZGVnKTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1ob3VyZ2xhc3Mge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTgwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigxODBkZWcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtaG91cmdsYXNzLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE5OHB4KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1ob3VyZ2xhc3MtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTk4cHgpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE5OHB4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBPdmVydGFraW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtb3ZlcnRha2luZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBtYXJnaW46IC0xcHggMDtcXG4gIGJveC1zaGFkb3c6IDAgLTIwcHggMCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxufVxcbi5kb3Qtb3ZlcnRha2luZzo6YmVmb3JlLCAuZG90LW92ZXJ0YWtpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBjb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGJveC1zaGFkb3c6IDAgLTIwcHggMCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3Qtb3ZlcnRha2luZzo6YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAycyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAycyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjNzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuM3M7XFxufVxcbi5kb3Qtb3ZlcnRha2luZzo6YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1vdmVydGFraW5nIDEuNXMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMS41cyBpbmZpbml0ZSBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuOCwgMC4yKTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwLjZzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuNnM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtb3ZlcnRha2luZyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtb3ZlcnRha2luZyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogR29vZXkgRWZmZWN0XFxuICogRG90IFNodXR0bGVcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1zaHV0dGxlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OXB4O1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG59XFxuLmRvdC1zaHV0dGxlOjpiZWZvcmUsIC5kb3Qtc2h1dHRsZTo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBjb2xvcjogdHJhbnNwYXJlbnQ7XFxuICBmaWx0ZXI6IGJsdXIoMnB4KTtcXG59XFxuLmRvdC1zaHV0dGxlOjpiZWZvcmUge1xcbiAgbGVmdDogOTlweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc2h1dHRsZSAycyBpbmZpbml0ZSBlYXNlLW91dDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3Qtc2h1dHRsZSAycyBpbmZpbml0ZSBlYXNlLW91dDtcXG59XFxuLmRvdC1zaHV0dGxlOjphZnRlciB7XFxuICBsZWZ0OiAxOThweDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zaHV0dGxlIHtcXG4gIDAlLCA1MCUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI5N3B4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyOTdweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXNodXR0bGUge1xcbiAgMCUsIDUwJSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjk3cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI5N3B4KTtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogRW1vamlcXG4gKiBEb3QgQm91bmNpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1ib3VuY2luZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBmb250LXNpemU6IDEwcHg7XFxufVxcbi5kb3QtYm91bmNpbmc6OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwi4pq98J+PgPCfj5BcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1ib3VuY2luZyAxcyBpbmZpbml0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtYm91bmNpbmcgMXMgaW5maW5pdGU7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtYm91bmNpbmcge1xcbiAgMCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICAgICAgICAgICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1pbjtcXG4gIH1cXG4gIDM0JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAzNSUge1xcbiAgICB0b3A6IDIwcHg7XFxuICAgIC13ZWJraXQtYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1vdXQ7XFxuICAgICAgICAgICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1vdXQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS41LCAwLjUpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDkwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtYm91bmNpbmcge1xcbiAgMCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICAgICAgICAgICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1pbjtcXG4gIH1cXG4gIDM0JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAzNSUge1xcbiAgICB0b3A6IDIwcHg7XFxuICAgIC13ZWJraXQtYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1vdXQ7XFxuICAgICAgICAgICAgYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogZWFzZS1vdXQ7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS41LCAwLjUpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDkwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIEV4cGVyaW1lbnRhbDogRW1vamlcXG4gKiBEb3QgUm9sbGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXJvbGxpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgZm9udC1zaXplOiAxMHB4O1xcbn1cXG4uZG90LXJvbGxpbmc6OmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXJvbGxpbmcgM3MgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXJvbGxpbmcgM3MgaW5maW5pdGU7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtcm9sbGluZyB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDM0LjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDY2LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDY3LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXJvbGxpbmcge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAzNC4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA2Ny42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbn0vKiMgc291cmNlTWFwcGluZ1VSTD1kb3RzLmNzcy5tYXAgKi9cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9jc3MvZG90cy5jc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZWxhc3RpYy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fbWl4aW5zLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL192YXJpYWJsZXMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1wdWxzZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWZsYXNoaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtY29sbGlzaW9uLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtcmV2b2x1dGlvbi5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWNhcm91c2VsLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtdHlwaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtd2luZG1pbGwuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1icmlja3Muc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1mbG9hdGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWZpcmUuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1zcGluLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZmFsbGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXN0cmV0Y2hpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1nYXRoZXJpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1ob3VyZ2xhc3Muc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1vdmVydGFraW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtc2h1dHRsZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWJvdW5jaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtcm9sbGluZy5zY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBLGdCQUFnQjtBQ0FoQjs7OztFQUFBO0FBTUE7RUFDRSxrQkFBQTtFQ0lBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUZHVixpREFBQTtVQUFBLHlDQUFBO0FER0Y7QUNERTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBREVKO0FDQ0U7RUFDRSxXQUFBO0VDWEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRmtCUix3REFBQTtVQUFBLGdEQUFBO0FER0o7QUNBRTtFQUNFLFVFakJVO0VERlosV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRjBCUix1REFBQTtVQUFBLCtDQUFBO0FESUo7O0FDQUE7RUFDRTtJQUNFLHNCQUFBO0VER0Y7RUNBQTtJQUNFLHdCQUFBO0VERUY7RUND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QUFBLG1CQUFBO0FMcUtKO0FLbEtFO0VBQ0UsVUZuQlU7RURGWixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VFNEJSLHFEQUFBO1VBQUEsNkNBQUE7RUFDQSwyQkFBQTtVQUFBLG1CQUFBO0FMc0tKOztBS2xLQTtFQUNFO0lBQ0UseUJBQUE7RUxxS0Y7RUtsS0E7SUFFRSx1Q0FBQTtFTG1LRjtBQUNGOztBSzNLQTtFQUNFO0lBQ0UseUJBQUE7RUxxS0Y7RUtsS0E7SUFFRSx1Q0FBQTtFTG1LRjtBQUNGO0FNcE5BOzs7O0VBQUE7QUFNQTtFQUNFLGtCQUFBO0VKSUEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtBSHlOWjtBTXRORTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBTnVOSjtBTXBORTtFQUNFLFdBQUE7RUpURixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VHZ0JSLDJEQUFBO1VBQUEsbURBQUE7QU53Tko7QU1yTkU7RUFDRSxVSHhCUTtFRE9WLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUd3QlIsMERBQUE7VUFBQSxrREFBQTtFQUNBLDJCQUFBO1VBQUEsbUJBQUE7QU55Tko7O0FNck5BO0VBQ0U7SUFJRSx3QkFBQTtFTnFORjtFTWxOQTtJQUNFLDRCQUFBO0VOb05GO0FBQ0Y7O0FNOU5BO0VBQ0U7SUFJRSx3QkFBQTtFTnFORjtFTWxOQTtJQUNFLDRCQUFBO0VOb05GO0FBQ0Y7QU1qTkE7RUFDRTtJQUlFLHdCQUFBO0VOZ05GO0VNN01BO0lBQ0UsMkJBQUE7RU4rTUY7QUFDRjtBTXpOQTtFQUNFO0lBSUUsd0JBQUE7RU5nTkY7RU03TUE7SUFDRSwyQkFBQTtFTitNRjtBQUNGO0FPM1FBOzs7O0VBQUE7QUFNQTtFQUNFLGtCQUFBO0VMSUEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtBSGdSWjtBTzdRRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0FQOFFKO0FPM1FFO0VBQ0UsT0FBQTtFQUNBLFVBQUE7RUxURixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VJZ0JSLGdDQUFBO0VBQ0Esc0RBQUE7VUFBQSw4Q0FBQTtBUCtRSjtBTzVRRTtFQUNFLE9BQUE7RUFDQSxXQUFBO0VMbkJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUkwQlIsZ0NBQUE7RUFDQSxvREFBQTtVQUFBLDRDQUFBO0FQZ1JKOztBTzVRQTtFQUNFO0lBQ0UsNkNBQUE7RVArUUY7RU81UUE7SUFDRSwrQ0FBQTtFUDhRRjtBQUNGOztBT3JSQTtFQUNFO0lBQ0UsNkNBQUE7RVArUUY7RU81UUE7SUFDRSwrQ0FBQTtFUDhRRjtBQUNGO0FRNVRBOzs7O0VBQUE7QUFXQTtFQUNFLGtCQUFBO0VBQ0EsYUFQUztFTktULFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUtTViw2RUFDRTtFQUdGLG9EQUFBO1VBQUEsNENBQUE7QVJ1VEY7O0FRcFRBO0VBQ0U7SUFDRSxxRkFDRTtFUnNUSjtFUWpUQTtJQUNFLHFGQUNFO0VSa1RKO0VRN1NBO0lBQ0UscUZBQ0U7RVI4U0o7QUFDRjs7QVFoVUE7RUFDRTtJQUNFLHFGQUNFO0VSc1RKO0VRalRBO0lBQ0UscUZBQ0U7RVJrVEo7RVE3U0E7SUFDRSxxRkFDRTtFUjhTSjtBQUNGO0FTeFZBOzs7O0VBQUE7QUFXQTtFQUNFLGtCQUFBO0VBQ0EsYUFQUztFUEtULFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RU1TViw2RUFDRTtFQUdGLGtEQUFBO1VBQUEsMENBQUE7QVRtVkY7O0FTaFZBO0VBQ0U7SUFDRSw2RUFDRTtFVGtWSjtFUzdVQTtJQUNFLGlGQUNFO0VUOFVKO0VTelVBO0lBQ0UsNkVBQ0U7RVQwVUo7RVNyVUE7SUFDRSxpRkFDRTtFVHNVSjtFU2pVQTtJQUNFLDZFQUNFO0VUa1VKO0VTN1RBO0lBQ0UsaUZBQ0U7RVQ4VEo7RVN6VEE7SUFDRSw2RUFDRTtFVDBUSjtBQUNGOztBU3hXQTtFQUNFO0lBQ0UsNkVBQ0U7RVRrVko7RVM3VUE7SUFDRSxpRkFDRTtFVDhVSjtFU3pVQTtJQUNFLDZFQUNFO0VUMFVKO0VTclVBO0lBQ0UsaUZBQ0U7RVRzVUo7RVNqVUE7SUFDRSw2RUFDRTtFVGtVSjtFUzdUQTtJQUNFLGlGQUNFO0VUOFRKO0VTelRBO0lBQ0UsNkVBQ0U7RVQwVEo7QUFDRjtBVWhZQTs7OztFQUFBO0FBVUE7RUFDRSxrQkFBQTtFQUNBLFVBQUE7RVJEQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VPUVYsMEJBQUE7RUFDQSxrREFBQTtVQUFBLDBDQUFBO0FWK1hGO0FVN1hFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7QVY4WEo7QVUzWEU7RUFDRSxnQkFBQTtFQUNBLFNBQUE7RVJqQkYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtBSHNaWjtBVTdYRTtFQUNFLGVBQUE7RUFDQSxTQUFBO0VSeEJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUgrWlo7O0FVOVhBO0VBQ0U7SUFDRSw2Q0FBQTtFVmlZRjtFVTlYQTtJQUNFLCtDQUFBO0VWZ1lGO0FBQ0Y7O0FVdllBO0VBQ0U7SUFDRSw2Q0FBQTtFVmlZRjtFVTlYQTtJQUNFLCtDQUFBO0VWZ1lGO0FBQ0Y7QVdoYkE7Ozs7RUFBQTtBQWNBO0VBQ0Usa0JBQUE7RUFDQSxXQVRRO0VBVVIsYUFUUztFVEdULFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVFhVix1RkFDRTtFQUdGLDhDQUFBO1VBQUEsc0NBQUE7QVh3YUY7O0FXcmFBO0VBQ0U7SUFDRSx1RkFDRTtFWHVhSjtFV2xhQTtJQUNFLHdGQUNFO0VYbWFKO0VXOVpBO0lBQ0UsNEZBQ0U7RVgrWko7RVcxWkE7SUFDRSwyRkFDRTtFWDJaSjtFV3RaQTtJQUNFLHVGQUNFO0VYdVpKO0VXbFpBO0lBQ0Usd0ZBQ0U7RVhtWko7RVc5WUE7SUFDRSw0RkFDRTtFWCtZSjtFVzFZQTtJQUNFLDJGQUNFO0VYMllKO0VXdFlBO0lBQ0UsdUZBQ0U7RVh1WUo7RVdsWUE7SUFDRSx3RkFDRTtFWG1ZSjtFVzlYQTtJQUNFLDRGQUNFO0VYK1hKO0VXMVhBO0lBQ0UsMkZBQ0U7RVgyWEo7RVd0WEE7SUFDRSx1RkFDRTtFWHVYSjtBQUNGOztBVy9jQTtFQUNFO0lBQ0UsdUZBQ0U7RVh1YUo7RVdsYUE7SUFDRSx3RkFDRTtFWG1hSjtFVzlaQTtJQUNFLDRGQUNFO0VYK1pKO0VXMVpBO0lBQ0UsMkZBQ0U7RVgyWko7RVd0WkE7SUFDRSx1RkFDRTtFWHVaSjtFV2xaQTtJQUNFLHdGQUNFO0VYbVpKO0VXOVlBO0lBQ0UsNEZBQ0U7RVgrWUo7RVcxWUE7SUFDRSwyRkFDRTtFWDJZSjtFV3RZQTtJQUNFLHVGQUNFO0VYdVlKO0VXbFlBO0lBQ0Usd0ZBQ0U7RVhtWUo7RVc5WEE7SUFDRSw0RkFDRTtFWCtYSjtFVzFYQTtJQUNFLDJGQUNFO0VYMlhKO0VXdFhBO0lBQ0UsdUZBQ0U7RVh1WEo7QUFDRjtBWTNlQTs7OztFQUFBO0FBU0E7RUFDRSxrQkFBQTtFVkNBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVNNViw2RUFBQTtVQUFBLHFFQUFBO0FaMmVGO0FZemVFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0FaMGVKO0FZdmVFO0VBQ0UsV0FBQTtFVmRGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVNxQlIsOERBQUE7VUFBQSxzREFBQTtBWjJlSjtBWXhlRTtFQUNFLFdBQUE7RVZ0QkYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFUzZCUiw0RUFBQTtVQUFBLG9FQUFBO0FaNGVKOztBWXhlQTtFQUNFO0lBQ0UseUJBQUE7RVoyZUY7RVl4ZUE7SUFDRSx5QkFBQTtFWjBlRjtFWXZlQTtJQUNFLHlCQUFBO0VaeWVGO0FBQ0Y7O0FZcGZBO0VBQ0U7SUFDRSx5QkFBQTtFWjJlRjtFWXhlQTtJQUNFLHlCQUFBO0VaMGVGO0VZdmVBO0lBQ0UseUJBQUE7RVp5ZUY7QUFDRjtBWXRlQTtFQUNFO0lBQ0UsV0FBQTtFWndlRjtFWXJlQTtJQUNFLFdBQUE7RVp1ZUY7RVlwZUE7SUFDRSxXQUFBO0Vac2VGO0VZbmVBO0lBQ0UsV0FBQTtFWnFlRjtBQUNGO0FZcGZBO0VBQ0U7SUFDRSxXQUFBO0Vad2VGO0VZcmVBO0lBQ0UsV0FBQTtFWnVlRjtFWXBlQTtJQUNFLFdBQUE7RVpzZUY7RVluZUE7SUFDRSxXQUFBO0VacWVGO0FBQ0Y7QVlsZUE7RUFDRTtJQUNFLFlBQUE7RVpvZUY7RVlqZUE7SUFDRSxXQUFBO0VabWVGO0VZaGVBO0lBQ0UsWUFBQTtFWmtlRjtFWS9kQTtJQUNFLFlBQUE7RVppZUY7QUFDRjtBWWhmQTtFQUNFO0lBQ0UsWUFBQTtFWm9lRjtFWWplQTtJQUNFLFdBQUE7RVptZUY7RVloZUE7SUFDRSxZQUFBO0Vaa2VGO0VZL2RBO0lBQ0UsWUFBQTtFWmllRjtBQUNGO0FhempCQTs7OztFQUFBO0FBWUE7RUFDRSxrQkFBQTtFQUNBLGFBUlM7RVhLVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VVVVYseUNBQUE7RUFDQSxnREFBQTtVQUFBLHdDQUFBO0VBQ0EsK0JBQUE7VUFBQSx1QkFBQTtBYnNqQkY7QWFwakJFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0VYaEJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUg2a0JaO0FhcmpCRTtFQUNFLHlDQUFBO0VBQ0EsZ0RBQUE7VUFBQSx3Q0FBQTtFQUNBLCtCQUFBO1VBQUEsdUJBQUE7QWJ1akJKO0FhcGpCRTtFQUNFLHlDQUFBO0VBQ0EsZ0RBQUE7VUFBQSx3Q0FBQTtFQUNBLCtCQUFBO1VBQUEsdUJBQUE7QWJzakJKOztBYWxqQkE7RUFDRTtJQUNFLHlDQUFBO0VicWpCRjtFYWxqQkE7SUFDRSwwQ0FBQTtFYm9qQkY7RWFqakJBO0lBQ0UsMENBQUE7RWJtakJGO0FBQ0Y7O0FhOWpCQTtFQUNFO0lBQ0UseUNBQUE7RWJxakJGO0VhbGpCQTtJQUNFLDBDQUFBO0Vib2pCRjtFYWpqQkE7SUFDRSwwQ0FBQTtFYm1qQkY7QUFDRjtBYzNtQkE7Ozs7RUFBQTtBQW1CQTtFQUNFLGtCQUFBO0VaVEEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLDZCWVF3QjtFWlB4QixrQllPNkM7RUFFN0Msb1VBQ0U7RUFRRixnREFBQTtVQUFBLHdDQUFBO0FkeWxCRjs7QWN0bEJBO0VBQ0U7SUFFRSxtVkFDRTtFZHVsQko7RWM3a0JBO0lBQ0UsbVZBQ0U7RWQ4a0JKO0VjcGtCQTtJQUNFLG1WQUNFO0VkcWtCSjtFYzNqQkE7SUFDRSxtVkFDRTtFZDRqQko7RWNsakJBO0lBQ0UsbVZBQ0U7RWRtakJKO0VjemlCQTtJQUNFLG1WQUNFO0VkMGlCSjtFY2hpQkE7SUFDRSxtVkFDRTtFZGlpQko7RWN2aEJBO0lBQ0UsbVZBQ0U7RWR3aEJKO0FBQ0Y7O0Fjam5CQTtFQUNFO0lBRUUsbVZBQ0U7RWR1bEJKO0VjN2tCQTtJQUNFLG1WQUNFO0VkOGtCSjtFY3BrQkE7SUFDRSxtVkFDRTtFZHFrQko7RWMzakJBO0lBQ0UsbVZBQ0U7RWQ0akJKO0VjbGpCQTtJQUNFLG1WQUNFO0VkbWpCSjtFY3ppQkE7SUFDRSxtVkFDRTtFZDBpQko7RWNoaUJBO0lBQ0UsbVZBQ0U7RWRpaUJKO0VjdmhCQTtJQUNFLG1WQUNFO0Vkd2hCSjtBQUNGO0FlcnBCQTs7OztFQUFBO0FBd0JBO0VBQ0Usa0JBQUE7RUFDQSxhQXBCUztFYktULFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVlzQlYsZ0NBQUE7RUFDQSxpREFBQTtVQUFBLHlDQUFBO0VBQ0EsNkJBQUE7VUFBQSxxQkFBQTtBZnNvQkY7QWVwb0JFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0FmcW9CSjtBZWxvQkU7RWIvQkEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFWXFDUix3REFBQTtVQUFBLGdEQUFBO0VBQ0EsMkJBQUE7VUFBQSxtQkFBQTtBZnVvQko7QWVwb0JFO0VidENBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVk0Q1IsdURBQUE7VUFBQSwrQ0FBQTtFQUNBLDZCQUFBO1VBQUEscUJBQUE7QWZ5b0JKOztBZXJvQkE7RUFDRTtJQUNFLGdEQUFBO0Vmd29CRjtFZXJvQkE7SUFHRSxnQ0FBQTtFZnFvQkY7RWVsb0JBO0lBQ0UsK0NBQUE7RWZvb0JGO0FBQ0Y7O0FlanBCQTtFQUNFO0lBQ0UsZ0RBQUE7RWZ3b0JGO0Vlcm9CQTtJQUdFLGdDQUFBO0VmcW9CRjtFZWxvQkE7SUFDRSwrQ0FBQTtFZm9vQkY7QUFDRjtBZWpvQkE7RUFDRTtJQUNFLGdEQUFBO0VmbW9CRjtFZWhvQkE7SUFHRSxnQ0FBQTtFZmdvQkY7RWU3bkJBO0lBQ0UsK0NBQUE7RWYrbkJGO0FBQ0Y7QWU1b0JBO0VBQ0U7SUFDRSxnREFBQTtFZm1vQkY7RWVob0JBO0lBR0UsZ0NBQUE7RWZnb0JGO0VlN25CQTtJQUNFLCtDQUFBO0VmK25CRjtBQUNGO0FlNW5CQTtFQUNFO0lBQ0UsaURBQUE7RWY4bkJGO0VlM25CQTtJQUdFLGlDQUFBO0VmMm5CRjtFZXhuQkE7SUFDRSxnREFBQTtFZjBuQkY7QUFDRjtBZXZvQkE7RUFDRTtJQUNFLGlEQUFBO0VmOG5CRjtFZTNuQkE7SUFHRSxpQ0FBQTtFZjJuQkY7RWV4bkJBO0lBQ0UsZ0RBQUE7RWYwbkJGO0FBQ0Y7QWdCaHVCQTs7OztFQUFBO0FBU0E7RUFDRSxrQkFBQTtFZENBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RWFNViw0QkFBQTtFQUNBLHFEQUFBO1VBQUEsNkNBQUE7QWhCZ3VCRjtBZ0I5dEJFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0FoQit0Qko7QWdCNXRCRTtFZGRBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RWFvQlIsNERBQUE7VUFBQSxvREFBQTtBaEJpdUJKO0FnQjl0QkU7RWRwQkEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFYTBCUiwyREFBQTtVQUFBLG1EQUFBO0FoQm11Qko7O0FnQi90QkE7RUFDRTtJQUNFLDRCQUFBO0VoQmt1QkY7RWdCL3RCQTtJQUVFLDBCQUFBO0VoQmd1QkY7RWdCN3RCQTtJQUNFLDRCQUFBO0VoQit0QkY7QUFDRjs7QWdCM3VCQTtFQUNFO0lBQ0UsNEJBQUE7RWhCa3VCRjtFZ0IvdEJBO0lBRUUsMEJBQUE7RWhCZ3VCRjtFZ0I3dEJBO0lBQ0UsNEJBQUE7RWhCK3RCRjtBQUNGO0FnQjV0QkE7RUFDRTtJQUNFLHVDQUFBO0VoQjh0QkY7RWdCM3RCQTtJQUVFLHVDQUFBO0VoQjR0QkY7RWdCenRCQTtJQUNFLHVDQUFBO0VoQjJ0QkY7QUFDRjtBZ0J2dUJBO0VBQ0U7SUFDRSx1Q0FBQTtFaEI4dEJGO0VnQjN0QkE7SUFFRSx1Q0FBQTtFaEI0dEJGO0VnQnp0QkE7SUFDRSx1Q0FBQTtFaEIydEJGO0FBQ0Y7QWdCeHRCQTtFQUNFO0lBQ0UsdUNBQUE7RWhCMHRCRjtFZ0J2dEJBO0lBRUUsc0NBQUE7RWhCd3RCRjtFZ0JydEJBO0lBQ0UsdUNBQUE7RWhCdXRCRjtBQUNGO0FnQm51QkE7RUFDRTtJQUNFLHVDQUFBO0VoQjB0QkY7RWdCdnRCQTtJQUVFLHNDQUFBO0VoQnd0QkY7RWdCcnRCQTtJQUNFLHVDQUFBO0VoQnV0QkY7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RSxhQUFBO0lBQ0EsMENBQUE7RXRCcWlDRjtFc0JsaUNBO0lBQ0UsYUFBQTtJQUNBLDBDQUFBO0V0Qm9pQ0Y7RXNCamlDQTtJQUNFLGFBQUE7SUFDQSwyQ0FBQTtFdEJtaUNGO0VzQmhpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCa2lDRjtBQUNGOztBc0I5a0NBO0VBQ0U7SUFDRSxZQUFBO0lBQ0EsMENBQUE7RXRCMGlDRjtFc0J2aUNBO0lBQ0UsWUFBQTtJQUNBLDJDQUFBO0V0QnlpQ0Y7RXNCdGlDQTtJQUNFLFlBQUE7SUFDQSwwQ0FBQTtFdEJ3aUNGO0VzQnJpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCdWlDRjtFc0JwaUNBO0lBQ0UsYUFBQTtJQUNBLDJDQUFBO0V0QnNpQ0Y7RXNCbmlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJxaUNGO0VzQmxpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCb2lDRjtFc0JqaUNBO0lBQ0UsYUFBQTtJQUNBLDJDQUFBO0V0Qm1pQ0Y7RXNCaGlDQTtJQUNFLGFBQUE7SUFDQSwwQ0FBQTtFdEJraUNGO0FBQ0YsQ0FBQSxtQ0FBQVwiLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiQGNoYXJzZXQgXFxcIlVURi04XFxcIjtcXG5odG1sIHtcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIGhlaWdodDogMTAwJTtcXG4gIG1hcmdpbjogMDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDc2N3B4KSB7XFxuICBodG1sIHtcXG4gICAgZm9udC1zaXplOiAxLjd2aDtcXG4gIH1cXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgaHRtbCB7XFxuICAgIGZvbnQtc2l6ZTogMS44NXZoO1xcbiAgfVxcbn1cXG5odG1sLmZyZWV6ZSB7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG5ib2R5IHtcXG4gIG1hcmdpbjogMDtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxufVxcblxcbmgxIHtcXG4gIG1hcmdpbjogMDtcXG4gIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICBmb250LXNpemU6IDRyZW07XFxufVxcblxcbmgyIHtcXG4gIGZvbnQtc2l6ZTogMi41cmVtO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5cXG5oMyB7XFxuICBmb250LXNpemU6IDIuM3JlbTtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuYSB7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICBjb2xvcjogaW5oZXJpdDtcXG59XFxuXFxuYSB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbmEuaGlkZGVuLCBhLnNlbGVjdGVkUGFnZSB7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuXFxuYS5oaWRkZW4ge1xcbiAgb3BhY2l0eTogMDtcXG59XFxuXFxuYS5zZWxlY3RlZFBhZ2Uge1xcbiAgY29sb3I6ICNlOGFhNzc7XFxuICBmaWx0ZXI6IHNhdHVyYXRlKDEyMCUpO1xcbn1cXG5cXG4qLmhpZGRlbiB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcblxcbmRpdiwgYnV0dG9uIHtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcblxcbmJ1dHRvbiB7XFxuICBib3JkZXI6IG5vbmU7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG59XFxuXFxubGkge1xcbiAgbGlzdC1zdHlsZS10eXBlOiBub25lO1xcbn1cXG5cXG4jb3ZlcmFsbENvbnRhaW5lciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0b3A6IDA7XFxufVxcbiNvdmVyYWxsQ29udGFpbmVyLmZhZGVkIHtcXG4gIGZpbHRlcjogb3BhY2l0eSg0MCUpO1xcbn1cXG5cXG4uY29udGVudENvbnRhaW5lciB7XFxuICBoZWlnaHQ6IGluaXRpYWw7XFxuICB3aWR0aDogMTAwJTtcXG4gIG1hcmdpbjogNCUgMDtcXG4gIG1hcmdpbi1ib3R0b206IDUlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG4uY29udGVudENvbnRhaW5lciA+IGRpdiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBwYWRkaW5nLXRvcDogNS41cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogNzY3cHgpIHtcXG4gIC5jb250ZW50Q29udGFpbmVyID4gZGl2IHtcXG4gICAgd2lkdGg6IDk1JTtcXG4gIH1cXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRDb250YWluZXIgPiBkaXYge1xcbiAgICB3aWR0aDogODUlO1xcbiAgfVxcbn1cXG4uY29udGVudENvbnRhaW5lcl9wYWdpbmF0ZWQgLnRleHRCb3ggLmNvbnRlbnQtcGFnZXMge1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4uY29udGVudENvbnRhaW5lcl9wYWdpbmF0ZWQgLnRleHRCb3ggLmNvbnRlbnQtcGFnZXMgYSB7XFxuICBmb250LXNpemU6IDEuNzVyZW07XFxufVxcblxcbi50aXRsZUFuZFRleHRCb3gsIC5jb250ZW50Qm94IHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuLnRpdGxlQW5kVGV4dEJveCB7XFxuICBtYXJnaW4tcmlnaHQ6IDUlO1xcbn1cXG5cXG4udGl0bGVCb3gsIC50ZXh0Qm94IHtcXG4gIGhlaWdodDogNTAlO1xcbiAgd2lkdGg6IDE2cmVtO1xcbn1cXG5cXG4udGl0bGVCb3gge1xcbiAgcGFkZGluZzogMTAlO1xcbn1cXG4udGl0bGVCb3ggPiAqIHtcXG4gIGhlaWdodDogNTAlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBtYXJnaW46IDA7XFxufVxcbi50aXRsZUJveCA+IDpudGgtY2hpbGQoMikge1xcbiAgZGlzcGxheTogZmxleDtcXG59XFxuLnRpdGxlQm94ID4gOm50aC1jaGlsZCgyKSBoMiB7XFxuICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gIHBhZGRpbmctYm90dG9tOiAxNSU7XFxufVxcblxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIHJvdy1nYXA6IDAuMzVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiA3NjdweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcywgLmNvbnRlbnRCb3gubWVtYmVycyB7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsIDMzLjMlKTtcXG4gIH1cXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcywgLmNvbnRlbnRCb3gubWVtYmVycyB7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDQsIDI1JSk7XFxuICB9XFxufVxcblxcbi5jb250ZW50Qm94IHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IHtcXG4gIHdpZHRoOiAxNHJlbTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIHtcXG4gIGJveC1zaXppbmc6IGluaXRpYWw7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsIDIwLCAyMCwgMC43KTtcXG4gIHBhZGRpbmc6IDAuMnJlbSAwLjJyZW07XFxuICBtYXJnaW4tdG9wOiA3LjZyZW07XFxuICBib3JkZXItcmFkaXVzOiAzMCU7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmludGVyYWN0aW9uLXByb21wdCAuY2xpY2stcHJvbXB0LCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5jbGljay1wcm9tcHQge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5ob3Zlci1wcm9tcHQsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5pbnRlcmFjdGlvbi1wcm9tcHQgLmhvdmVyLXByb21wdCB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAuY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyAuaW50ZXJhY3Rpb24tcHJvbXB0IC5ob3Zlci1wcm9tcHQsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIC5pbnRlcmFjdGlvbi1wcm9tcHQgLmhvdmVyLXByb21wdCB7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgfVxcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgKiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICoge1xcbiAgY29sb3I6IHJnYigyMzgsIDIzMSwgMjEwKTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgbWFyZ2luLXRvcDogMC43cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAuY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgKiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICoge1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIC5mYS1zZWFyY2gtcGx1cywgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIC5mYS1zZWFyY2gtcGx1cyB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMge1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICo6aG92ZXIsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqOmhvdmVyIHtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMTEwJSk7XFxuICBmaWx0ZXI6IGJyaWdodG5lc3MoMTIwJSk7XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyBpLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgaSB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZSB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgcCwgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IGEsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIGRpdiBwLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgYSB7XFxuICBtYXJnaW46IDIlO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCB7XFxuICBtYXJnaW4tdG9wOiAtMC4zcmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1zaXplOiAxLjNyZW07XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGdhcDogMC4ycmVtO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQgcCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheS10ZXh0IHAge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQgcDpudGgtb2YtdHlwZSgyKSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheS10ZXh0IHA6bnRoLW9mLXR5cGUoMikge1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuLmNvbnRlbnRCb3ggLm5ld3Mge1xcbiAgbWFyZ2luOiAwIDElO1xcbiAgcGFkZGluZy10b3A6IDUlO1xcbiAgaGVpZ2h0OiBhdXRvO1xcbn1cXG4uY29udGVudEJveCAubmV3cyBpZnJhbWUge1xcbiAgd2lkdGg6IDMwMHB4O1xcbiAgaGVpZ2h0OiAyMDBweDtcXG59XFxuXFxuI2Zvb3RlckNvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDM5LCAzOSwgMzksIDAuNik7XFxuICBtYXJnaW46IDA7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm90dG9tOiAwO1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xcbiAgcGFkZGluZy1yaWdodDogMnJlbTtcXG4gIGNvbG9yOiBpdm9yeTtcXG59XFxuI2Zvb3RlckNvbnRhaW5lciBwIHtcXG4gIG1hcmdpbjogMXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2Zvb3RlckNvbnRhaW5lciBwIHtcXG4gICAgbWFyZ2luOiAwLjY1cmVtO1xcbiAgfVxcbn1cXG5cXG4jb3BlbmluZ0NvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDk5LjV2aDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGNvbG9yOiByZ2IoMTg5LCAxODksIDE4OSk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGgxIHtcXG4gIGZvbnQtc2l6ZTogNS4ycmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciBoMSB7XFxuICAgIGZvbnQtc2l6ZTogNi41cmVtO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBwIHtcXG4gIGZvbnQtc2l6ZTogMi41cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgcCB7XFxuICAgIGZvbnQtc2l6ZTogMi43cmVtO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciBkaXYge1xcbiAgdGV4dC1zaGFkb3c6IDFweCAxcHggYmxhY2s7XFxuICB3aWR0aDogODAlO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciBkaXYge1xcbiAgICB3aWR0aDogNzAlO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtYXV0by1mbG93OiByb3c7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDQlIDI1JSAxZnI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcwLCA2MiwgNTUsIDAuODUpO1xcbiAgYm94LXNoYWRvdzogMC4ycmVtIDAuMnJlbSAxcmVtIDAuNHJlbSBpbnNldCByZ2JhKDQ5LCA0MywgMzksIDAuNzUpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDVyZW07XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDA7XFxuICB6LWluZGV4OiA5OTk5O1xcbiAgY29sb3I6IHJnYigxOTksIDE4NywgMTU2KTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyLmhpZGRlbiB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgYnV0dG9uIHtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgd2lkdGg6IDEwcmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgYnV0dG9uIGkge1xcbiAgZGlzcGxheTogaW5saW5lO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tc3ltYm9sLCAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tdGV4dCB7XFxuICBoZWlnaHQ6IDRyZW07XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciAjbG9nby1zeW1ib2wge1xcbiAgbWFyZ2luLXRvcDogMC4zcmVtO1xcbiAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciAjbG9nby10ZXh0IHtcXG4gIG1hcmdpbi10b3A6IDAuNnJlbTtcXG4gIHBhZGRpbmctbGVmdDogMC4ycmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgaW1nIHtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHAsICNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHtcXG4gIG1hcmdpbi1yaWdodDogMnJlbTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCB7XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGdhcDogMS41cmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHVsIGxpIGEge1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICB0ZXh0LXNoYWRvdzogMXB4IDFweCBibGFjaztcXG59XFxuI29wZW5pbmdDb250YWluZXIgI3BhZ2VJbWFnZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgI3BhZ2VJbWFnZSBpbWcge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmaWx0ZXI6IGJsdXIoMC42cmVtKSBncmF5c2NhbGUoNTAlKTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIG1hcmdpbi10b3A6IDElO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIHtcXG4gICAgbWFyZ2luLXRvcDogMiU7XFxuICB9XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIGltZyB7XFxuICBoZWlnaHQ6IDZyZW07XFxufVxcblxcbi50aXRsZUJveCB7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG59XFxuLnRpdGxlQm94IHAge1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxufVxcblxcbi50ZXh0Qm94IHtcXG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbn1cXG4udGV4dEJveCBwIHtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG5cXG4jcHJvcGVydGllc0NvbnRhaW5lciA+IGRpdiAudGl0bGVCb3gsICNtZW1iZXJzQ29udGFpbmVyID4gZGl2IC50aXRsZUJveCB7XFxuICBib3JkZXI6IDAuMzVyZW0gc29saWQgcmdiKDE5OSwgMTg3LCAxNTYpO1xcbn1cXG4jcHJvcGVydGllc0NvbnRhaW5lciBpbWcsICNtZW1iZXJzQ29udGFpbmVyIGltZyB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiNwcm9wZXJ0aWVzQ29udGFpbmVyIGltZy5wYWdlTGlua3NfX3Zpc2libGUsICNtZW1iZXJzQ29udGFpbmVyIGltZy5wYWdlTGlua3NfX3Zpc2libGUge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDI3JSk7XFxufVxcblxcbiNhbGxOZXdzQ29udGFpbmVyIHtcXG4gIGhlaWdodDogNTFyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGxOZXdzQ29udGFpbmVyIHtcXG4gICAgaGVpZ2h0OiA1MnJlbTtcXG4gIH1cXG59XFxuXFxuI2NvbnRhY3RDb250YWluZXIge1xcbiAgaGVpZ2h0OiA1NXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2NvbnRhY3RDb250YWluZXIge1xcbiAgICBoZWlnaHQ6IDUycmVtO1xcbiAgfVxcbn1cXG5cXG4jYWxsTmV3c0NvbnRhaW5lciwgI2NvbnRhY3RDb250YWluZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDMxLCAyNywgMjEpO1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciA+IGRpdiAudGl0bGVCb3gsICNjb250YWN0Q29udGFpbmVyID4gZGl2IC50aXRsZUJveCB7XFxuICBib3JkZXI6IDRweCBzb2xpZCByZ2IoMjIxLCAyMjEsIDIyMSk7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyID4gZGl2IC50ZXh0Qm94IHAsICNjb250YWN0Q29udGFpbmVyID4gZGl2IC50ZXh0Qm94IHAge1xcbiAgY29sb3I6IGFudGlxdWV3aGl0ZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3gsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmb250LXNpemU6IDEuMXJlbTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggPiBkaXYsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94ID4gZGl2IHtcXG4gIGZsZXgtYmFzaXM6IDUwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggPiBkaXYgPiBkaXYsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94ID4gZGl2ID4gZGl2IHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgaGVpZ2h0OiA5MiU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IC5mb3JtLW1lc3NhZ2UsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5mb3JtLW1lc3NhZ2Uge1xcbiAgaGVpZ2h0OiBhdXRvO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBoMywgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggaDMge1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgaGVpZ2h0OiA4JTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggdWwsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHVsIHtcXG4gIHBhZGRpbmc6IDA7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IHVsIGxpLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB1bCBsaSB7XFxuICBkaXNwbGF5OiBpbmxpbmU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cyB7XFxuICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDIzMywgMjMzLCAyMzMsIDAuMyk7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzOjphZnRlciwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3M6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCIgXFxcIjtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgaGVpZ2h0OiAxcmVtO1xcbiAgY2xlYXI6IGJvdGg7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIGltZywgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgaW1nIHtcXG4gIHdpZHRoOiAxM3JlbTtcXG4gIGZsb2F0OiBsZWZ0O1xcbiAgbWFyZ2luLXJpZ2h0OiAyLjUlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBwLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBwIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjJyZW07XFxuICBmb250LXNpemU6IDEuMjVyZW07XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzLCAjYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBmb3JtLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cywgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB7XFxuICBwYWRkaW5nOiAwIDUlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBmb3JtLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICAtbW96LWNvbHVtbi1nYXA6IDEuMnJlbTtcXG4gICAgICAgY29sdW1uLWdhcDogMS4ycmVtO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImNvbnRhY3ROYW1lIGNvbnRhY3RFbWFpbFxcXCIgXFxcImNvbnRhY3RQaG9uZSBjb250YWN0U3ViamVjdFxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcInN1Ym1pdCAuLi5cXFwiO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LW5hbWUsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtbmFtZSB7XFxuICBncmlkLWFyZWE6IGNvbnRhY3ROYW1lO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LWVtYWlsLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LWVtYWlsIHtcXG4gIGdyaWQtYXJlYTogY29udGFjdEVtYWlsO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LXBob25lLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LXBob25lIHtcXG4gIGdyaWQtYXJlYTogY29udGFjdFBob25lO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LXN1YmplY3QsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3Qtc3ViamVjdCB7XFxuICBncmlkLWFyZWE6IGNvbnRhY3RTdWJqZWN0O1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCBmb3JtICNjb250YWN0LW1lc3NhZ2UsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtbWVzc2FnZSB7XFxuICBncmlkLWFyZWE6IGNvbnRhY3RNZXNzYWdlO1xcbn1cXG5cXG4jY29udGFjdENvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kOiBibGFjaztcXG4gIGNvbG9yOiB3aGl0ZTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3gge1xcbiAgLW1vei1jb2x1bW4tZ2FwOiAzcmVtO1xcbiAgICAgICBjb2x1bW4tZ2FwOiAzcmVtO1xcbiAgd2lkdGg6IDg1JTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3gge1xcbiAgICB3aWR0aDogNzAlO1xcbiAgfVxcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBpbWcge1xcbiAgZmlsdGVyOiBzYXR1cmF0ZSgxMjAlKTtcXG4gIHdpZHRoOiA0NSU7XFxuICBtYXJnaW4tbGVmdDogMnJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggaW1nIHtcXG4gICAgd2lkdGg6IDUwJTtcXG4gICAgbWFyZ2luLWxlZnQ6IDA7XFxuICB9XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGxhYmVsLmVycm9yIHtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGNvbG9yOiByZ2IoMTIwLCAxNzksIDE1OCk7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0ge1xcbiAgbWFyZ2luLXRvcDogM3JlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSA+IGRpdiB7XFxuICBtYXJnaW46IDUlIDA7XFxuICBtYXJnaW4tdG9wOiAwO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIGxhYmVsIHtcXG4gIGZvbnQtc2l6ZTogMS40cmVtO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIFt0eXBlPXJhZGlvXSB7XFxuICB3aWR0aDogMTAlO1xcbiAgZGlzcGxheTogaW5pdGlhbDtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB1bCB7XFxuICBwYWRkaW5nOiAwO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIGlucHV0LCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHNlbGVjdCB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIG1hcmdpbi10b3A6IDIlO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIGlucHV0IHtcXG4gIGhlaWdodDogMS41cmVtO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHNlbGVjdCB7XFxuICBoZWlnaHQ6IDJyZW07XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gdGV4dGFyZWEge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDE4cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHRleHRhcmVhIHtcXG4gICAgaGVpZ2h0OiAyMHJlbTtcXG4gIH1cXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSBidXR0b24ge1xcbiAgZ3JpZC1hcmVhOiBzdWJtaXQ7XFxuICBjb2xvcjogaXZvcnk7XFxuICBmb250LXNpemU6IDEuM3JlbTtcXG4gIHRleHQtYWxpZ246IGxlZnQ7XFxufVxcblxcbi5kb3QtcHVsc2Uge1xcbiAgdG9wOiAyMCU7XFxuICBsZWZ0OiAzNSU7XFxufVxcblxcbiNwb3AtdXAtZGlzcGxheS1ib3gge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg0NSwgNDEsIDM1LCAwLjgpO1xcbiAgd2lkdGg6IDk0dnc7XFxuICBoZWlnaHQ6IDg3dmg7XFxuICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgei1pbmRleDogMTEwO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA4dmg7XFxuICBsZWZ0OiAzdnc7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcm93LWdhcDogMXJlbTtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgcGFkZGluZy10b3A6IDFyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggaW1nIHtcXG4gIHdpZHRoOiAyN3JlbTtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCBhLCAjcG9wLXVwLWRpc3BsYXktYm94IGJ1dHRvbiB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uIHtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uOmhvdmVyLCAjcG9wLXVwLWRpc3BsYXktYm94IGE6aG92ZXIge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDcyJSk7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggI2NvbnRlbnQtaG9sZGVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWV2ZW5seTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA3MCU7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggI2NvbnRlbnQtaG9sZGVyIC5wb3AtdXAtZGlyZWN0aW9uYWwge1xcbiAgZm9udC1zaXplOiAyLjVyZW07XFxufVxcblxcbiNuZXdzLW1lZGlhLWRpc3BsYXkge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg0NCwgNTIsIDc3LCAwLjgpO1xcbiAgaGVpZ2h0OiA4OHZoO1xcbiAgd2lkdGg6IDk0dnc7XFxuICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgei1pbmRleDogMTEwO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA3dmg7XFxuICBsZWZ0OiAzdnc7XFxuICBkaXNwbGF5OiBub25lO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG59XFxuXFxuI3NpbmdsZUNvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDg3JTtcXG4gIG1pbi13aWR0aDogNjAlO1xcbiAgdG9wOiA4LjMlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtd3JhcDogd3JhcDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDE7XFxuICBwYWRkaW5nOiAxLjVyZW0gMXJlbTtcXG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzNywgMzUsIDM0LCAwLjkpO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyIGg0IHtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyIGgzLCAjc2luZ2xlQ29udGFpbmVyIGg0LCAjc2luZ2xlQ29udGFpbmVyIC5yZWxhdGVkLWxpbmsge1xcbiAgY29sb3I6IHJnYigyNDEsIDIxOCwgMTg5KTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMge1xcbiAgd2lkdGg6IDIxdnc7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIGltZyB7XFxuICBoZWlnaHQ6IDQyJTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgdWwge1xcbiAgcGFkZGluZy1sZWZ0OiAyMCU7XFxuICBmb250LXNpemU6IDEuNjVyZW07XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgdWwgbGkge1xcbiAgbWFyZ2luLXRvcDogMC42cmVtO1xcbiAgbGlzdC1zdHlsZS10eXBlOiBzcXVhcmU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHVsIGxpIGEge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDExNSUpO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIHtcXG4gIHdpZHRoOiAzMHZ3O1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogNyUgMWZyO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIHAge1xcbiAgbWFyZ2luLXRvcDogMS4ycmVtO1xcbiAgZm9udC1zaXplOiAxLjdyZW07XFxuICBoZWlnaHQ6IDk5JTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyBkaXYge1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBwYWRkaW5nOiAwIDFyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3NpbmdsZUluZm8gI21lZGlhQ29udGFpbmVyIHtcXG4gIGhlaWdodDogYXV0bztcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyAjbWVkaWFDb250YWluZXIgaWZyYW1lIHtcXG4gIHdpZHRoOiAyMDBweDtcXG4gIGhlaWdodDogMjAwcHg7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3ZpZEFuZEltZ0NvbCB7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTZ2dztcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN2aWRBbmRJbWdDb2wgaDMge1xcbiAgZm9udC1zaXplOiAxLjlyZW07XFxuICBtYXJnaW46IDFyZW0gMDtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wge1xcbiAgd2lkdGg6IDI2dnc7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIHBhZGRpbmc6IDAgMXJlbTtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLXJvd3M6IDEwJSAxZnIgNCU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIGgzIHtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgaDMgYSB7XFxuICBmb250LXNpemU6IDEuN3JlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgaDMgYTpob3ZlciB7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sICNuZXdzLXJlY2lldmVyIHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgbWFyZ2luOiAxcmVtIDA7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sICNuZXdzLXJlY2lldmVyIHAge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxuICBwYWRkaW5nLXJpZ2h0OiAxcmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCAjcGFnaW5hdGlvbi1ob2xkZXIge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiAwO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuYm9keSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTAwLCA5MiwgODIpO1xcbn1cXG5cXG4uc2VhcmNoLW92ZXJsYXkge1xcbiAgb3ZlcmZsb3cteTogYXV0bztcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIHotaW5kZXg6IDExMDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICByaWdodDogMDtcXG4gIGJvdHRvbTogMDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNzIsIDY4LCA2MiwgMC45Nik7XFxuICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICBvcGFjaXR5OiAwO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjA5KTtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4zcywgdHJhbnNmb3JtIDAuM3MsIHZpc2liaWxpdHkgMC4zcztcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcbi5zZWFyY2gtb3ZlcmxheSAuY29udGFpbmVyIHtcXG4gIG1heC13aWR0aDogMTMwMHB4O1xcbiAgbWFyZ2luOiAwIGF1dG87XFxuICBwYWRkaW5nOiAwIDE2cHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuLnNlYXJjaC1vdmVybGF5IHAge1xcbiAgcGFkZGluZy10b3A6IDFyZW07XFxufVxcbmJvZHkuYWRtaW4tYmFyIC5zZWFyY2gtb3ZlcmxheSB7XFxuICB0b3A6IDJyZW07XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9fdG9wIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xMik7XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9faWNvbiB7XFxuICBtYXJnaW4tcmlnaHQ6IDAuNzVyZW07XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG4gIGNvbG9yOiByZ2IoMTQ4LCAxMjEsIDEwNSk7XFxufVxcbi5zZWFyY2gtb3ZlcmxheS0tYWN0aXZlIHtcXG4gIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICBvcGFjaXR5OiAxO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG59XFxuLnNlYXJjaC1vdmVybGF5X19zZWN0aW9uLXRpdGxlIHtcXG4gIG1hcmdpbjogMzBweCAwIDFweCAwO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIHBhZGRpbmc6IDE1cHggMDtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjY2NjO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX2Nsb3NlIHtcXG4gIGZvbnQtc2l6ZTogMi43cmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3M7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNTgsIDU0LCA1NCk7XFxuICBjb2xvcjogcmdiKDE4MCwgMTcxLCAxNjYpO1xcbiAgbGluZS1oZWlnaHQ6IDAuNztcXG59XFxuLnNlYXJjaC1vdmVybGF5X19jbG9zZTpob3ZlciB7XFxuICBvcGFjaXR5OiAxO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXkgLm9uZS1oYWxmIHtcXG4gIHBhZGRpbmctYm90dG9tOiAwO1xcbn1cXG5cXG4uc2VhcmNoLXRlcm0ge1xcbiAgd2lkdGg6IDc1JTtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBib3JkZXI6IG5vbmU7XFxuICBwYWRkaW5nOiAxcmVtIDA7XFxuICBtYXJnaW46IDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGZvbnQtc2l6ZTogMXJlbTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgY29sb3I6IHJnYigyMTgsIDIwMSwgMTgyKTtcXG59XFxuXFxuLmJvZHktbm8tc2Nyb2xsIHtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbi5jb250YWluZXIge1xcbiAgbWF4LXdpZHRoOiAxMzAwcHg7XFxuICBtYXJnaW46IDAgYXV0bztcXG4gIHBhZGRpbmc6IDAgMTZweDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuQG1lZGlhIChtaW4td2lkdGg6IDk2MHB4KSB7XFxuICAuc2VhcmNoLXRlcm0ge1xcbiAgICB3aWR0aDogODAlO1xcbiAgICBmb250LXNpemU6IDNyZW07XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBzcGluIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBzcGluIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcXG4gIH1cXG59XFxuLnNwaW5uZXItbG9hZGVyIHtcXG4gIG1hcmdpbi10b3A6IDQ1cHg7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogMjRweDtcXG4gIGhlaWdodDogMjRweDtcXG4gIGJvcmRlcjogMC4yNXJlbSBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICBib3JkZXItdG9wLWNvbG9yOiBibGFjaztcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBzcGluIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gIGFuaW1hdGlvbjogc3BpbiAxcyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbi5tZWRpYS1jYXJkIGJ1dHRvbiB7XFxuICBjb2xvcjogd2hpdGU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBmb250LXNpemU6IDIuMXJlbTtcXG59XFxuXFxuaDEsIGgyLCBoMywgaDQge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJMaWJyZSBDYXNsb24gVGV4dFxcXCIsIHNlcmlmO1xcbn1cXG5cXG4ubmV3cyBwLCAudGV4dEJveCBwLCAjcmVsYXRpb25zaGlwLWxpbmssICNzaW5nbGUtbGluayB7XFxuICBmb250LWZhbWlseTogXFxcIkxpYnJlIENhc2xvbiBEaXNwbGF5XFxcIiwgc2VyaWY7XFxufVxcblxcbmgxIHtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcblxcbmgyIHtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxufVxcblxcbi5kaXNwbGF5LXRleHQsICN3ZWxjb21lQ29udGFpbmVyIHAsIC50aXRsZUJveCBwIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiQ29ybW9yYW50IFNDXFxcIiwgc2VyaWY7XFxufVxcblxcbmlucHV0LCAucmVhZC1tb3JlLCAubmV3cyBsaSBhLCBoZWFkZXIgbGkgYSwgI3JlYWx0aW1lRmlsdGVyc0FuZFNvcnRpbmcgYnV0dG9uLCAjc2VhcmNoLWZpbHRlcnMgYnV0dG9uLCAjcmVzZXQtYWxsIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTG9yYVxcXCIsIHNlcmlmO1xcbn1cXG5cXG4uc2VhcmNoLWZvcm0ge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA1MCU7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcblxcbi5jb250ZW50LWxvYWRlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGhlaWdodDogNTAlO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG4uY29udGVudC1sb2FkZXIgLmJhbGwge1xcbiAgd2lkdGg6IDEuMnJlbTtcXG4gIGhlaWdodDogMS4ycmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDQ3LCAxNjMsIDU2KTtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogNTAlO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZzIgMC43cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlLCBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0MiAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcyIDAuN3MgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSwgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdDIgMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcbi5jb250ZW50LWxvYWRlci5sb2FkZXJbZGF0YS10ZXh0XTo6YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuLmNvbnRlbnQtbG9hZGVyLmxvYWRlci5pcy1hY3RpdmU6OmJlZm9yZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogNTAlO1xcbiAgbGVmdDogMjUlO1xcbiAgdG9wOiAzOSU7XFxuICBmb250LXNpemU6IDIuN3JlbTtcXG4gIGNvbG9yOiByZ2IoMTk1LCAxNjgsIDEyNik7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG59XFxuLmNvbnRlbnQtbG9hZGVyLmxvYWRlci1iYXItcGluZy1wb25nOjphZnRlciB7XFxuICB3aWR0aDogMS4ycmVtO1xcbiAgaGVpZ2h0OiAxLjJyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTAxLCAxNDgsIDE4Nyk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nIDAuN3MgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSwgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdCAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcgMC43cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlLCBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0IDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG4uY29udGVudC1sb2FkZXIubG9hZGVyLmlzLWFjdGl2ZSB7XFxuICBoZWlnaHQ6IDk3JTtcXG4gIHotaW5kZXg6IDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDUxLCA0OSwgNTYsIDAuNzQ5MDE5NjA3OCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogYmxpbmsgMS44cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGJsaW5rIDEuOHMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGJsaW5rIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgb3BhY2l0eTogMC43NTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGJsaW5rIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgb3BhY2l0eTogMC43NTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogNDAlO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IDYwJTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1Bvbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiA0MCU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogNjAlO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdCB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNzIsIDY4LCA4MiwgMC43NSk7XFxuICB9XFxuICA1MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEwMiwgNzgsIDEyMiwgMC43NSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxNDksIDkzLCAxNjgsIDAuNzUpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcyLCA2OCwgODIsIDAuNzUpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMDIsIDc4LCAxMjIsIDAuNzUpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTQ5LCA5MywgMTY4LCAwLjc1KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZzIge1xcbiAgMCUge1xcbiAgICBsZWZ0OiA0MyU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogNjMlO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZzIge1xcbiAgMCUge1xcbiAgICBsZWZ0OiA0MyU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogNjMlO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdDIge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNDcsIDE2MywgNTYpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDg3LCAxNDMsIDU2KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTI2LCAxMzEsIDU4KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0MiB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig0NywgMTYzLCA1Nik7XFxuICB9XFxuICA1MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoODcsIDE0MywgNTYpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYigxMjYsIDEzMSwgNTgpO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyIHtcXG4gIGhlaWdodDogODUlO1xcbiAgdG9wOiA5JTtcXG4gIHdpZHRoOiA5NSU7XFxuICBsZWZ0OiAyLjUlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzNywgMzUsIDM0LCAwLjc1KTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBjb2xvcjogYWxpY2VibHVlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyIGJ1dHRvbiB7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNtZWRpYS1jb250YWluZXIsICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIge1xcbiAgYm9yZGVyOiAwLjJyZW0gc29saWQgcmdiYSgyMTIsIDE5MywgMTMwLCAwLjQpO1xcbiAgYm9yZGVyLWxlZnQ6IG5vbmU7XFxuICBwYWRkaW5nLWxlZnQ6IDEuNXJlbTtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwicmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZ1xcXCIgXFxcInNlYXJjaEZpbHRlcnNcXFwiIFxcXCJyZXNldEFsbFxcXCI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyB7XFxuICBncmlkLWFyZWE6IHJlYWx0aW1lRmlsdGVyc0FuZFNvcnRpbmc7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImhlYWRpbmdSRlMgaGVhZGluZ1JGU1xcXCIgXFxcIm9yZGVyQnkgdG9nZ2xlVHlwZVxcXCIgXFxcImZpbHRlckRhdGUgZmlsdGVyRGF0ZVxcXCI7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIGJ1dHRvbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIGxhYmVsIHtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgaDIge1xcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nUkZTO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI29yZGVyLWJ5IHtcXG4gIGdyaWQtYXJlYTogb3JkZXJCeTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nICN0b2dnbGUtdHlwZSB7XFxuICBncmlkLWFyZWE6IHRvZ2dsZVR5cGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyAjZmlsdGVyLWRhdGUge1xcbiAgZ3JpZC1hcmVhOiBmaWx0ZXJEYXRlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI2ZpbHRlci1kYXRlIGRpdiB1bCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZ2FwOiAzcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgdWwge1xcbiAgcGFkZGluZy1sZWZ0OiAwLjNyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyB1bCBsaSB7XFxuICBtYXJnaW4tdG9wOiAwLjVyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMge1xcbiAgZ3JpZC1hcmVhOiBzZWFyY2hGaWx0ZXJzO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJoZWFkaW5nU0YgaGVhZGluZ1NGIGhlYWRpbmdTRlxcXCIgXFxcIm5ld3NTZWFyY2ggbmV3c1NlYXJjaCBuZXdzU2VhcmNoXFxcIiBcXFwiY2FzZVNlbnNpdGl2ZSBmdWxsV29yZE9ubHkgd29yZFN0YXJ0T25seVxcXCIgXFxcImluY2x1ZGVUaXRsZSBpbmNsdWRlRGVzY3JpcHRpb24gLi4uXFxcIjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBoMiB7XFxuICBncmlkLWFyZWE6IGhlYWRpbmdTRjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBidXR0b24ge1xcbiAgZm9udC1zaXplOiAxLjJyZW07XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNuZXdzLXNlYXJjaC1jb250YWluZXIge1xcbiAgZ3JpZC1hcmVhOiBuZXdzU2VhcmNoO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNuZXdzLXNlYXJjaC1jb250YWluZXIgI25ld3Mtc2VhcmNoIHtcXG4gIGZvbnQtc2l6ZTogMS4xNXJlbTtcXG4gIGhlaWdodDogMi4zcmVtO1xcbiAgd2lkdGg6IDE4cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNmdWxsLXdvcmQtb25seSB7XFxuICBncmlkLWFyZWE6IGZ1bGxXb3JkT25seTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjd29yZC1zdGFydC1vbmx5IHtcXG4gIGdyaWQtYXJlYTogd29yZFN0YXJ0T25seTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjY2FzZS1zZW5zaXRpdmUge1xcbiAgZ3JpZC1hcmVhOiBjYXNlU2Vuc2l0aXZlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNpbmNsdWRlLXRpdGxlIHtcXG4gIGdyaWQtYXJlYTogaW5jbHVkZVRpdGxlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNpbmNsdWRlLWRlc2NyaXB0aW9uIHtcXG4gIGdyaWQtYXJlYTogaW5jbHVkZURlc2NyaXB0aW9uO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICN3b3JkLXN0YXJ0LW9ubHkuaW5hY3RpdmUsICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgYnV0dG9uLmluYWN0aXZlIHtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICN3b3JkLXN0YXJ0LW9ubHkuaW5hY3RpdmUgc3BhbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBidXR0b24uaW5hY3RpdmUgc3BhbiB7XFxuICBjb2xvcjogcmVkO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgYnV0dG9uLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgc2VsZWN0LCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgbGFiZWwge1xcbiAgZm9udC1zaXplOiAxLjFyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVzZXQtYWxsIHtcXG4gIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgZ3JpZC1hcmVhOiByZXNldEFsbDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGJ1dHRvbiB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBoMyB7XFxuICBmb250LXNpemU6IDEuN3JlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGg0IHtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgbWFyZ2luLWJvdHRvbTogMC44cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciB7XFxuICB3aWR0aDogNjYlO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogMTAlIDg0JSA2JTtcXG4gIGJvcmRlcjogMC4ycmVtIHNvbGlkIHJnYigxODAsIDE3NCwgMTY0KTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgaDIge1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXNpemU6IDNyZW07XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgYm9yZGVyLWJvdHRvbTogMC4zcmVtIHNvbGlkIHJnYigxODUsIDE1OCwgMTIyKTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Rpc21pc3Mtc2VsZWN0aW9uIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Rpc21pc3Mtc2VsZWN0aW9uLmRpc21pc3NlZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLXJlY2lldmVyIHtcXG4gIG1hcmdpbi1ib3R0b206IDAuNXJlbTtcXG4gIHBhZGRpbmctcmlnaHQ6IDJyZW07XFxuICBvdmVyZmxvdzogYXV0bztcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIge1xcbiAgcGFkZGluZy1sZWZ0OiAycmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5LmRpc21pc3NlZCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIuZGlzbWlzc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3Mge1xcbiAgZm9udC1zaXplOiAxLjJyZW07XFxuICBwYWRkaW5nLXRvcDogMDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3czo6YWZ0ZXIsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiIFxcXCI7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIGhlaWdodDogMXJlbTtcXG4gIGNsZWFyOiBib3RoO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzIGltZywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBpZnJhbWUsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzIGltZywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgaWZyYW1lIHtcXG4gIGZsb2F0OiBsZWZ0O1xcbiAgbWFyZ2luLXJpZ2h0OiAyJTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBwLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBwIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjJyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgaWZyYW1lLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBpZnJhbWUge1xcbiAgd2lkdGg6IDE1MHB4O1xcbiAgaGVpZ2h0OiAxMDBweDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkge1xcbiAgbGlzdC1zdHlsZS10eXBlOiBjaXJjbGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnNlZS1tb3JlLWxpbmssICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAuc2VlLW1vcmUtbGluaywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSAuc2VlLW1vcmUtbGluay5kaXNtaXNzZWQsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLmRpc21pc3NlZCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnNlZS1tb3JlLWxpbmsuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAucmVsYXRpb25zaGlwLWxpbmsuZGlzbWlzc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciB7XFxuICB3aWR0aDogMzYlO1xcbiAgcGFkZGluZy10b3A6IDFyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlci5kaXNtaXNzZWQge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyBhIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGZvbnQtc2l6ZTogMS45cmVtO1xcbiAgbWFyZ2luLWxlZnQ6IDAuNXJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIgLmNvbnRlbnQtcGFnZXMgYS5oaWRkZW4sICNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEuc2VsZWN0ZWRQYWdlIHtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyBhLmhpZGRlbiB7XFxuICBvcGFjaXR5OiAwO1xcbn1cXG5cXG4jbWVkaWEtcmVjaWV2ZXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTAsIDEwLCAxMCwgMC44KTtcXG4gIHRvcDogNyU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogOTUlO1xcbiAgei1pbmRleDogMTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhIHtcXG4gIG1hcmdpbi1sZWZ0OiAxNHJlbTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogM3JlbTtcXG4gIGhlaWdodDogNDVyZW07XFxuICB3aWR0aDogODByZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSBpZnJhbWUsICNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSBpbWcge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSAjcGxheS1idXR0b24tY29udGFpbmVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIgI3BsYXktYnV0dG9uIHtcXG4gIGhlaWdodDogNnJlbTtcXG4gIHdpZHRoOiA5cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg5OSwgMTAwLCAxNzksIDAuOCk7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3JkZXItcmFkaXVzOiAzNSU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGVhc2U7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSAjcGxheS1idXR0b24tY29udGFpbmVyICNwbGF5LWJ1dHRvbiBkaXYge1xcbiAgYm9yZGVyLWxlZnQ6IDNyZW0gc29saWQgcmdiKDEyNSwgMTUwLCAxNjgpO1xcbiAgYm9yZGVyLXRvcDogMS43cmVtIHNvbGlkIHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLWJvdHRvbTogMS43cmVtIHNvbGlkIHRyYW5zcGFyZW50O1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgI3BsYXktYnV0dG9uLWNvbnRhaW5lciAjcGxheS1idXR0b246aG92ZXIge1xcbiAgb3BhY2l0eTogMC43O1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEuY2VudGVyLWRpc3BsYXkge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgaGVpZ2h0OiA4MiU7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIHJpZ2h0OiAycmVtO1xcbiAgdG9wOiAzcmVtO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLW1lbnUge1xcbiAgZm9udC1zaXplOiAxLjJyZW07XFxuICBkaXNwbGF5OiBmbGV4O1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLW1lbnUgYSB7XFxuICBjb2xvcjogYXp1cmU7XFxuICBtYXJnaW4tbGVmdDogMnJlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1tZW51IGEuYWN0aXZlIHtcXG4gIGZpbHRlcjogY29udHJhc3QoNDglKTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiB7XFxuICBtYXgtd2lkdGg6IDM4MHB4O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBvdmVyZmxvdzogYXV0bztcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS10aHVtYiB7XFxuICB3aWR0aDogNDUlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS10aHVtYi5zZWxlY3RlZCB7XFxuICBmaWx0ZXI6IGNvbnRyYXN0KDQ4JSk7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiAubWVkaWEtaW5mb3JtYXRpb24ge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBtYXJnaW4tbGVmdDogMXJlbTtcXG4gIHdpZHRoOiA1NSU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24gLm1lZGlhLWluZm9ybWF0aW9uIHAge1xcbiAgbWFyZ2luOiAwO1xcbiAgY29sb3I6IGJlaWdlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS1pbmZvcm1hdGlvbiBwOm50aC1vZi10eXBlKDIpIHtcXG4gIG1hcmdpbi10b3A6IDFyZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtcGFnaW5hdGlvbiB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBjb2xvcjogYWxpY2VibHVlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLXBhZ2luYXRpb24gYSB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIG1hcmdpbi1sZWZ0OiAxcmVtO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLWNsb3NlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGxlZnQ6IDMuNXJlbTtcXG4gIHRvcDogMy41cmVtO1xcbiAgZm9udC1zaXplOiAzLjVyZW07XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbi5tZWRpYS1jYXJkOmhvdmVyIGltZywgLnByb3BlcnR5LW1lZGlhLWNhcmQ6aG92ZXIgaW1nIHtcXG4gIGZpbHRlcjogYnJpZ2h0bmVzcyg1MCUpO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4ubWVkaWEtY2FyZDpob3ZlciBoMywgLm1lZGlhLWNhcmQ6aG92ZXIgcCwgLm1lZGlhLWNhcmQ6aG92ZXIgYnV0dG9uLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBoMywgLnByb3BlcnR5LW1lZGlhLWNhcmQ6aG92ZXIgcCwgLnByb3BlcnR5LW1lZGlhLWNhcmQ6aG92ZXIgYnV0dG9uIHtcXG4gIGZpbHRlcjogY29udHJhc3QoNDAlKTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLmxvYWRlciB7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgdG9wOiAtOTk5OXB4O1xcbiAgd2lkdGg6IDA7XFxuICBoZWlnaHQ6IDA7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgei1pbmRleDogOTk5OTk5O1xcbn1cXG5cXG4ubG9hZGVyOmFmdGVyLCAubG9hZGVyOmJlZm9yZSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuXFxuLmxvYWRlci5pcy1hY3RpdmUge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjg1KTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgbGVmdDogMDtcXG4gIHRvcDogMDtcXG59XFxuXFxuLmxvYWRlci5pcy1hY3RpdmU6YWZ0ZXIsIC5sb2FkZXIuaXMtYWN0aXZlOmJlZm9yZSB7XFxuICBkaXNwbGF5OiBibG9jaztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIHJvdGF0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMCk7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM1OWRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgcm90YXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzU5ZGVnKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBibGluayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuLmxvYWRlcltkYXRhLXRleHRdOmJlZm9yZSB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiA1MCU7XFxuICBjb2xvcjogY3VycmVudENvbG9yO1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZvbnQtc2l6ZTogMTRweDtcXG59XFxuXFxuLmxvYWRlcltkYXRhLXRleHQ9XFxcIlxcXCJdOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiTG9hZGluZ1xcXCI7XFxufVxcblxcbi5sb2FkZXJbZGF0YS10ZXh0XTpub3QoW2RhdGEtdGV4dD1cXFwiXFxcIl0pOmJlZm9yZSB7XFxuICBjb250ZW50OiBhdHRyKGRhdGEtdGV4dCk7XFxufVxcblxcbi5sb2FkZXJbZGF0YS10ZXh0XVtkYXRhLWJsaW5rXTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGJsaW5rIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogYmxpbmsgMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuLmxvYWRlci1kZWZhdWx0W2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIHRvcDogY2FsYyg1MCUgLSA2M3B4KTtcXG59XFxuXFxuLmxvYWRlci1kZWZhdWx0OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgd2lkdGg6IDQ4cHg7XFxuICBoZWlnaHQ6IDQ4cHg7XFxuICBib3JkZXI6IDhweCBzb2xpZCAjZmZmO1xcbiAgYm9yZGVyLWxlZnQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDI0cHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAyNHB4KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogcm90YXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHRbZGF0YS1oYWxmXTphZnRlciB7XFxuICBib3JkZXItcmlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHRbZGF0YS1pbnZlcnNlXTphZnRlciB7XFxuICBhbmltYXRpb24tZGlyZWN0aW9uOiByZXZlcnNlO1xcbn1cXG5cXG4ubG9hZGVyLWRvdWJsZTphZnRlciwgLmxvYWRlci1kb3VibGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgYm9yZGVyOiA4cHggc29saWQ7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogcm90YXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuXFxuLmxvYWRlci1kb3VibGU6YWZ0ZXIge1xcbiAgd2lkdGg6IDQ4cHg7XFxuICBoZWlnaHQ6IDQ4cHg7XFxuICBib3JkZXItY29sb3I6ICNmZmY7XFxuICBib3JkZXItbGVmdC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICB0b3A6IGNhbGMoNTAlIC0gMjRweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDI0cHgpO1xcbn1cXG5cXG4ubG9hZGVyLWRvdWJsZTpiZWZvcmUge1xcbiAgd2lkdGg6IDY0cHg7XFxuICBoZWlnaHQ6IDY0cHg7XFxuICBib3JkZXItY29sb3I6ICNlYjk3NGU7XFxuICBib3JkZXItcmlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb246IDJzO1xcbiAgICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDJzO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDMycHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAzMnB4KTtcXG59XFxuXFxuLmxvYWRlci1iYXJbZGF0YS10ZXh0XTpiZWZvcmUge1xcbiAgdG9wOiBjYWxjKDUwJSAtIDQwcHgpO1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5sb2FkZXItYmFyOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICB3aWR0aDogMjAwcHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgtNDVkZWcsICM0MTgzZDcgMjUlLCAjNTJiM2Q5IDAsICM1MmIzZDkgNTAlLCAjNDE4M2Q3IDAsICM0MTgzZDcgNzUlLCAjNTJiM2Q5IDAsICM1MmIzZDkpO1xcbiAgYmFja2dyb3VuZC1zaXplOiAyMHB4IDIwcHg7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDEwcHggMCBoc2xhKDAsIDAlLCAxMDAlLCAwLjIpLCAwIDAgMCA1cHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgYW5pbWF0aW9uOiBtb3ZlQmFyIDEuNXMgbGluZWFyIGluZmluaXRlIHJldmVyc2U7XFxufVxcblxcbi5sb2FkZXItYmFyW2RhdGEtcm91bmRlZF06YWZ0ZXIge1xcbiAgYm9yZGVyLXJhZGl1czogMTVweDtcXG59XFxuXFxuLmxvYWRlci1iYXJbZGF0YS1pbnZlcnNlXTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kaXJlY3Rpb246IG5vcm1hbDtcXG4gICAgICAgICAgYW5pbWF0aW9uLWRpcmVjdGlvbjogbm9ybWFsO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhciB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMjBweCAyMHB4O1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1vdmVCYXIge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7XFxuICB9XFxuICB0byB7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDIwcHggMjBweDtcXG4gIH1cXG59XFxuLmxvYWRlci1iYXItcGluZy1wb25nOmJlZm9yZSB7XFxuICB3aWR0aDogMjAwcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbn1cXG5cXG4ubG9hZGVyLWJhci1waW5nLXBvbmc6YWZ0ZXIsIC5sb2FkZXItYmFyLXBpbmctcG9uZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IGNhbGMoNTAlIC0gMTBweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDEwMHB4KTtcXG59XFxuXFxuLmxvYWRlci1iYXItcGluZy1wb25nOmFmdGVyIHtcXG4gIHdpZHRoOiA1MHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YxOTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcgMC41cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjVzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZ1tkYXRhLXJvdW5kZWRdOmJlZm9yZSB7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbn1cXG5cXG4ubG9hZGVyLWJhci1waW5nLXBvbmdbZGF0YS1yb3VuZGVkXTphZnRlciB7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogMjBweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLW5hbWU6IG1vdmVCYXJQaW5nUG9uZ1JvdW5kZWQ7XFxuICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBtb3ZlQmFyUGluZ1BvbmdSb3VuZGVkO1xcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDUwcHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nUm91bmRlZCB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDgwcHgpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ1JvdW5kZWQge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSAtIDEwMHB4KTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyA4MHB4KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGNvcm5lcnMge1xcbiAgNiUge1xcbiAgICB3aWR0aDogNjBweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgbGVmdDogY2FsYygxMDAlIC0gMTVweCk7XFxuICAgIHRvcDogMDtcXG4gIH1cXG4gIDMxJSB7XFxuICAgIGhlaWdodDogNjBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgdG9wOiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgbGVmdDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA1NiUge1xcbiAgICB3aWR0aDogNjBweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBsZWZ0OiAwO1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgfVxcbiAgODElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGNvcm5lcnMge1xcbiAgNiUge1xcbiAgICB3aWR0aDogNjBweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgbGVmdDogY2FsYygxMDAlIC0gMTVweCk7XFxuICAgIHRvcDogMDtcXG4gIH1cXG4gIDMxJSB7XFxuICAgIGhlaWdodDogNjBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgdG9wOiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgbGVmdDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA1NiUge1xcbiAgICB3aWR0aDogNjBweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBsZWZ0OiAwO1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgfVxcbiAgODElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbn1cXG4ubG9hZGVyLWJvcmRlcltkYXRhLXRleHRdOmJlZm9yZSB7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLmxvYWRlci1ib3JkZXI6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAwO1xcbiAgd2lkdGg6IDE1cHg7XFxuICBoZWlnaHQ6IDE1cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvcm5lcnMgM3MgZWFzZSBib3RoIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvcm5lcnMgM3MgZWFzZSBib3RoIGluZmluaXRlO1xcbn1cXG5cXG4ubG9hZGVyLWJhbGw6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDUwcHg7XFxuICBoZWlnaHQ6IDUwcHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTI1cHggMCAwIC0yNXB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHotaW5kZXg6IDE7XFxuICAtd2Via2l0LWFuaW1hdGlvbjoga2lja0JhbGwgMXMgaW5maW5pdGUgYWx0ZXJuYXRlIGVhc2UtaW4gYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBraWNrQmFsbCAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1pbiBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLWJhbGxbZGF0YS1zaGFkb3ddOmJlZm9yZSB7XFxuICBib3gtc2hhZG93OiBpbnNldCAtNXB4IC01cHggMTBweCAwIHJnYmEoMCwgMCwgMCwgMC41KTtcXG59XFxuXFxuLmxvYWRlci1iYWxsOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjMpO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgd2lkdGg6IDQ1cHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICB0b3A6IGNhbGMoNTAlICsgMTBweCk7XFxuICBsZWZ0OiA1MCU7XFxuICBtYXJnaW46IDAgMCAwIC0yMi41cHg7XFxuICB6LWluZGV4OiAwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHNoYWRvdyAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1vdXQgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBzaGFkb3cgMXMgaW5maW5pdGUgYWx0ZXJuYXRlIGVhc2Utb3V0IGJvdGg7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBzaGFkb3cge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwKTtcXG4gIH1cXG4gIDQwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgOTUlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjc1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjc1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBzaGFkb3cge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwKTtcXG4gIH1cXG4gIDQwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgOTUlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjc1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjc1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGtpY2tCYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC04MHB4KSBzY2FsZVgoMC45NSk7XFxuICB9XFxuICA5MCUge1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKSBzY2FsZVgoMSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJSA1MCUgMjAlIDIwJTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBraWNrQmFsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtODBweCkgc2NhbGVYKDAuOTUpO1xcbiAgfVxcbiAgOTAlIHtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCkgc2NhbGVYKDEpO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCUgNTAlIDIwJSAyMCU7XFxuICB9XFxufVxcbi5sb2FkZXItc21hcnRwaG9uZTphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiAxMnB4O1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBsaW5lLWhlaWdodDogMTIwcHg7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBsZWZ0OiA1MCU7XFxuICB0b3A6IDUwJTtcXG4gIHdpZHRoOiA3MHB4O1xcbiAgaGVpZ2h0OiAxMzBweDtcXG4gIG1hcmdpbjogLTY1cHggMCAwIC0zNXB4O1xcbiAgYm9yZGVyOiA1cHggc29saWQgI2ZkMDtcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDVweCAwIDAgI2ZkMDtcXG4gIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgNTAlIDkwJSwgcmdiYSgwLCAwLCAwLCAwLjUpIDZweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgwZGVnLCAjZmQwIDIycHgsIHRyYW5zcGFyZW50IDApLCBsaW5lYXItZ3JhZGllbnQoMGRlZywgcmdiYSgwLCAwLCAwLCAwLjUpIDIycHgsIHJnYmEoMCwgMCwgMCwgMC41KSk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogc2hha2UgMnMgY3ViaWMtYmV6aWVyKDAuMzYsIDAuMDcsIDAuMTksIDAuOTcpIGJvdGggaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogc2hha2UgMnMgY3ViaWMtYmV6aWVyKDAuMzYsIDAuMDcsIDAuMTksIDAuOTcpIGJvdGggaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItc21hcnRwaG9uZVtkYXRhLXNjcmVlbj1cXFwiXFxcIl06YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIkxvYWRpbmdcXFwiO1xcbn1cXG5cXG4ubG9hZGVyLXNtYXJ0cGhvbmU6bm90KFtkYXRhLXNjcmVlbj1cXFwiXFxcIl0pOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IGF0dHIoZGF0YS1zY3JlZW4pO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgc2hha2Uge1xcbiAgNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDIwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAzNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDU1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgc2hha2Uge1xcbiAgNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDIwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAzNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDU1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxufVxcbi5sb2FkZXItY2xvY2s6YmVmb3JlIHtcXG4gIHdpZHRoOiAxMjBweDtcXG4gIGhlaWdodDogMTIwcHg7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBtYXJnaW46IC02MHB4IDAgMCAtNjBweDtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHRyYW5zcGFyZW50IDUwJSwgI2Y1ZjVmNSAwKSwgbGluZWFyLWdyYWRpZW50KDkwZGVnLCB0cmFuc3BhcmVudCA1NXB4LCAjMmVjYzcxIDAsICMyZWNjNzEgNjVweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmNWY1ZjUgNTAlLCAjZjVmNWY1IDApO1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMTBweCAjZjVmNWY1LCAwIDAgMCA1cHggIzU1NSwgMCAwIDAgMTBweCAjN2I3YjdiO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDJzIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiByb3RhdGlvbiBpbmZpbml0ZSAycyBsaW5lYXI7XFxufVxcblxcbi5sb2FkZXItY2xvY2s6YWZ0ZXIsIC5sb2FkZXItY2xvY2s6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgbGVmdDogNTAlO1xcbiAgdG9wOiA1MCU7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG4ubG9hZGVyLWNsb2NrOmFmdGVyIHtcXG4gIHdpZHRoOiA2MHB4O1xcbiAgaGVpZ2h0OiA0MHB4O1xcbiAgbWFyZ2luOiAtMjBweCAwIDAgLTE1cHg7XFxuICBib3JkZXItcmFkaXVzOiAyMHB4IDAgMCAyMHB4O1xcbiAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAxNHB4IDIwcHgsICMyNWEyNWEgMTBweCwgdHJhbnNwYXJlbnQgMCksIHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgMTRweCAyMHB4LCAjMWI3OTQzIDE0cHgsIHRyYW5zcGFyZW50IDApLCBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCB0cmFuc3BhcmVudCAxNXB4LCAjMmVjYzcxIDAsICMyZWNjNzEgMjVweCwgdHJhbnNwYXJlbnQgMCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogcm90YXRpb24gaW5maW5pdGUgMjRzIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiByb3RhdGlvbiBpbmZpbml0ZSAyNHMgbGluZWFyO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMTVweCBjZW50ZXI7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbjphZnRlciwgLmxvYWRlci1jdXJ0YWluOmJlZm9yZSB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogMTAwJTtcXG4gIHRvcDogNTAlO1xcbiAgbWFyZ2luLXRvcDogLTM1cHg7XFxuICBmb250LXNpemU6IDcwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBsaW5lLWhlaWdodDogMS4yO1xcbiAgY29udGVudDogXFxcIkxvYWRpbmdcXFwiO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW46YmVmb3JlIHtcXG4gIGNvbG9yOiAjNjY2O1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW46YWZ0ZXIge1xcbiAgY29sb3I6ICNmZmY7XFxuICBoZWlnaHQ6IDA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY3VydGFpbiAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY3VydGFpbiAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWN1cnRhaW4tdGV4dF06bm90KFtkYXRhLWN1cnRhaW4tdGV4dD1cXFwiXFxcIl0pOmFmdGVyLCAubG9hZGVyLWN1cnRhaW5bZGF0YS1jdXJ0YWluLXRleHRdOm5vdChbZGF0YS1jdXJ0YWluLXRleHQ9XFxcIlxcXCJdKTpiZWZvcmUge1xcbiAgY29udGVudDogYXR0cihkYXRhLWN1cnRhaW4tdGV4dCk7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWJyYXppbGlhbl06YmVmb3JlIHtcXG4gIGNvbG9yOiAjZjFjNDBmO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW5bZGF0YS1icmF6aWxpYW5dOmFmdGVyIHtcXG4gIGNvbG9yOiAjMmVjYzcxO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW5bZGF0YS1jb2xvcmZ1bF06YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtYXNrQ29sb3JmdWwgMnMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IG1hc2tDb2xvcmZ1bCAycyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWNvbG9yZnVsXTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY3VydGFpbiAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGgsIG1hc2tDb2xvcmZ1bC1mcm9udCAycyAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY3VydGFpbiAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGgsIG1hc2tDb2xvcmZ1bC1mcm9udCAycyAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICBjb2xvcjogIzAwMDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIG1hc2tDb2xvcmZ1bCB7XFxuICAwJSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNDkuNSUge1xcbiAgICBjb2xvcjogIzM0OThkYjtcXG4gIH1cXG4gIDUwLjUlIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbG9yOiAjZTc0YzNjO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1hc2tDb2xvcmZ1bCB7XFxuICAwJSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNDkuNSUge1xcbiAgICBjb2xvcjogIzM0OThkYjtcXG4gIH1cXG4gIDUwLjUlIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbG9yOiAjZTc0YzNjO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbWFza0NvbG9yZnVsLWZyb250IHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMmVjYzcxO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNmMWM0MGY7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbWFza0NvbG9yZnVsLWZyb250IHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMmVjYzcxO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNmMWM0MGY7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBjdXJ0YWluIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBoZWlnaHQ6IDg0cHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY3VydGFpbiB7XFxuICAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gIH1cXG4gIHRvIHtcXG4gICAgaGVpZ2h0OiA4NHB4O1xcbiAgfVxcbn1cXG4ubG9hZGVyLW11c2ljOmFmdGVyLCAubG9hZGVyLW11c2ljOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiAyNDBweDtcXG4gIGhlaWdodDogMjQwcHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTEyMHB4IDAgMCAtMTIwcHg7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBsaW5lLWhlaWdodDogMjQwcHg7XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogNDBweDtcXG4gIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xcbiAgdGV4dC1zaGFkb3c6IDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuNSk7XFxuICBsZXR0ZXItc3BhY2luZzogLTFweDtcXG59XFxuXFxuLmxvYWRlci1tdXNpYzphZnRlciB7XFxuICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgICAgICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTphZnRlciwgLmxvYWRlci1tdXNpY1tkYXRhLWhleS1vaF06YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IDAgMCAwIDEwcHg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1oZXktb2hdOmJlZm9yZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgY29sb3I6ICMwMDA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIG9oIDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCBvaCA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLWhleS1vaF06YWZ0ZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBoZXkgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgaGV5IDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTphZnRlciwgLmxvYWRlci1tdXNpY1tkYXRhLW5vLWNyeV06YmVmb3JlIHtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCg0NWRlZywgIzAwOWIzYSA1MCUsICNmZWQxMDAgNTElKTtcXG4gIGJveC1zaGFkb3c6IDAgMCAwIDEwcHggIzAwMDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLW5vLWNyeV06YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgY3J5IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCBjcnkgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1uby1jcnldOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBubyA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBubyA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXdlLWFyZV06YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgdGhlV29ybGQgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIHRoZVdvcmxkIDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGVsbGlwc2UgYXQgY2VudGVyLCAjNGVjZGM0IDAsICM1NTYyNzApO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtd2UtYXJlXTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgd2VBcmUgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgd2VBcmUgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSBhdCBjZW50ZXIsICMyNmQwY2UgMCwgIzFhMjk4MCk7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1yb2NrLXlvdV06YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgcm9ja1lvdSA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgcm9ja1lvdSA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6ICM0NDQ7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1yb2NrLXlvdV06YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIHdlV2lsbCA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZVdpbGwgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICBiYWNrZ3JvdW5kOiAjOTYyODFiO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY29pbiB7XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGNvaW4ge1xcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMzU5ZGVnKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGNvaW5CYWNrIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMXR1cm4pO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBjb2luQmFjayB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDF0dXJuKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBoZXkge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiSGV5IVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiTGV0J3MhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIkhleSFcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGhleSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJMZXQncyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiSGV5IVxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBvaCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJPaCFcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIkdvIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJPaCFcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG9oIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiR28hXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBubyB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJOby4uLlxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwibm9cXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiTm8uLi5cXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG5vIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJub1xcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJOby4uLlxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBjcnkge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwid29tYW5cXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcImNyeSFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwid29tYW5cXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGNyeSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiY3J5IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyB3ZUFyZSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSBhcmVcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIndlIGFyZVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSBhcmVcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHdlQXJlIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwid2UgYXJlXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyB0aGVXb3JsZCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgd29ybGQsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgY2hpbGRyZW4hXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcInRoZSB3b3JsZCxcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHRoZVdvcmxkIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSB3b3JsZCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSBjaGlsZHJlbiFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyB3ZVdpbGwge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2Ugd2lsbCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInJvY2sgeW91IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgd2VXaWxsIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIldlIHdpbGwsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJyb2NrIHlvdSFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiV2Ugd2lsbCxcXFwiO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgcm9ja1lvdSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSB3aWxsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn6SYXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHJvY2tZb3Uge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwid2Ugd2lsbFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+kmFxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSB3aWxsXFxcIjtcXG4gIH1cXG59XFxuLmxvYWRlci1wb2tlYmFsbDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogMTAwcHg7XFxuICBoZWlnaHQ6IDEwMHB4O1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICBtYXJnaW46IC01MHB4IDAgMCAtNTBweDtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJlZCA0MiUsICMwMDAgMCwgIzAwMCA1OCUsICNmZmYgMCk7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHotaW5kZXg6IDE7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVQb2tlYmFsbCAxcyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1wb2tlYmFsbDphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiAyNHB4O1xcbiAgaGVpZ2h0OiAyNHB4O1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICBtYXJnaW46IC0xMnB4IDAgMCAtMTJweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB6LWluZGV4OiAyO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVQb2tlYmFsbCAxcyBsaW5lYXIgaW5maW5pdGUgYm90aCwgZmxhc2hQb2tlYmFsbCAwLjVzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb3ZlUG9rZWJhbGwgMXMgbGluZWFyIGluZmluaXRlIGJvdGgsIGZsYXNoUG9rZWJhbGwgMC41cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICBib3JkZXI6IDJweCBzb2xpZCAjMDAwO1xcbiAgYm94LXNoYWRvdzogMCAwIDAgNXB4ICNmZmYsIDAgMCAwIDEwcHggIzAwMDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVQb2tlYmFsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKSByb3RhdGUoMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoLTEwcHgpIHJvdGF0ZSgtNWRlZyk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTBweCkgcm90YXRlKDVkZWcpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGV4KDApIHJvdGF0ZSgwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBtb3ZlUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCkgcm90YXRlKDApO1xcbiAgfVxcbiAgMTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGV4KC0xMHB4KSByb3RhdGUoLTVkZWcpO1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwcHgpIHJvdGF0ZSg1ZGVnKTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRleCgwKSByb3RhdGUoMCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBmbGFzaFBva2ViYWxsIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZkMDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBmbGFzaFBva2ViYWxsIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZkMDtcXG4gIH1cXG59XFxuLmxvYWRlci1ib3VuY2luZzphZnRlciwgLmxvYWRlci1ib3VuY2luZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogY2FsYyg1MCUgLSAxMHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMTBweCk7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGtpY2sgMC42cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjoga2ljayAwLjZzIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuLmxvYWRlci1ib3VuY2luZzphZnRlciB7XFxuICBtYXJnaW4tbGVmdDogLTMwcHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjoga2ljayAwLjZzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWJvdW5jaW5nOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4ycztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMga2ljayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgb3BhY2l0eTogMC4zO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFyZW0pO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGtpY2sge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICB0byB7XFxuICAgIG9wYWNpdHk6IDAuMztcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcmVtKTtcXG4gIH1cXG59XFxuLnNibC1jaXJjLXJpcHBsZSB7XFxuICBoZWlnaHQ6IDQ4cHg7XFxuICB3aWR0aDogNDhweDtcXG4gIGNvbG9yOiAjNDg2NTliO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgdG9wOiAyMCU7XFxuICBsZWZ0OiA0MCU7XFxufVxcblxcbi5zYmwtY2lyYy1yaXBwbGU6OmFmdGVyLCAuc2JsLWNpcmMtcmlwcGxlOjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBoZWlnaHQ6IDA7XFxuICB3aWR0aDogMDtcXG4gIGJvcmRlcjogaW5oZXJpdDtcXG4gIGJvcmRlcjogNXB4IHNvbGlkO1xcbiAgYm9yZGVyLXJhZGl1czogaW5oZXJpdDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGxlZnQ6IDQwJTtcXG4gIHRvcDogNDAlO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNpcmNsZS1yaXBwbGUgMXMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGNpcmNsZS1yaXBwbGUgMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG4uc2JsLWNpcmMtcmlwcGxlOjpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC0wLjZzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjZzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY2lyY2xlLXJpcHBsZSB7XFxuICAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gICAgd2lkdGg6IDA7XFxuICAgIGxlZnQ6IDEuNnJlbTtcXG4gICAgdG9wOiAxLjZyZW07XFxuICB9XFxuICAxMDAlIHtcXG4gICAgaGVpZ2h0OiA1cmVtO1xcbiAgICB3aWR0aDogNXJlbTtcXG4gICAgbGVmdDogLTFyZW07XFxuICAgIHRvcDogLTFyZW07XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgY2lyY2xlLXJpcHBsZSB7XFxuICAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gICAgd2lkdGg6IDA7XFxuICAgIGxlZnQ6IDEuNnJlbTtcXG4gICAgdG9wOiAxLjZyZW07XFxuICB9XFxuICAxMDAlIHtcXG4gICAgaGVpZ2h0OiA1cmVtO1xcbiAgICB3aWR0aDogNXJlbTtcXG4gICAgbGVmdDogLTFyZW07XFxuICAgIHRvcDogLTFyZW07XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufS8qIyBzb3VyY2VNYXBwaW5nVVJMPXN0eWxlLmNzcy5tYXAgKi9cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9jc3Mvc3R5bGUuY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvYmFzZS9fY3VzdG9tQmFzZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvYmFzZS9fbWl4aW5zLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19mb290ZXIuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX29wZW5pbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3Byb3BlcnRpZXMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3NpbmdsZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fY29uc3RhbnQuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3NlYXJjaC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fbG9hZGVyLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19hbGwtbmV3cy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fc2hhZG93LWJveC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG93bmxvYWRzL2Nzcy1sb2FkZXIuY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG93bmxvYWRzL3NibC1jaXJjLXJpcHBsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUEsZ0JBQWdCO0FDRWhCO0VBQ0ksa0JBQUE7RUFDQSxZQUFBO0VBQ0EsU0FBQTtBREFKO0FFRUk7RURMSjtJQVdRLGdCQUFBO0VESk47QUFDRjtBRUdJO0VEWEo7SUFjUSxpQkFBQTtFREZOO0FBQ0Y7QUNJSTtFQUNJLGdCQUFBO0FERlI7O0FDTUE7RUFDSSxTQUFBO0VBQ0EsbUJBQUE7QURISjs7QUNNQTtFQUNJLFNBQUE7RUFDQSxtQkFBQTtFQUNBLGVBQUE7QURISjs7QUNNQTtFQUNJLGlCQUFBO0VBQ0EsU0FBQTtBREhKOztBQ01BO0VBQ0ksaUJBQUE7RUFDQSxTQUFBO0FESEo7O0FDTUE7RUFDSSxxQkFBQTtFQUNBLGNBQUE7QURISjs7QUNNQTtFQUNJLGVBQUE7QURISjs7QUNLQTtFQUNJLG9CQUFBO0FERko7O0FD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QUFrQiwrQ0FBQTtVQUFBLHVDQUFBO0FaMGhFbnNWOztBWTFoRXl1VjtFQUF3Qiw2QkFBQTtVQUFBLHFCQUFBO0FaOGhFandWOztBWTloRXF4VjtFQUFnQjtJQUFHLFVBQUE7SUFBVSx3QkFBQTtFWm9pRWh6VjtFWXBpRXcwVjtJQUFHLFlBQUE7SUFBVyw0QkFBQTtFWndpRXQxVjtBQUNGOztBWXppRXF4VjtFQUFnQjtJQUFHLFVBQUE7SUFBVSx3QkFBQTtFWm9pRWh6VjtFWXBpRXcwVjtJQUFHLFlBQUE7SUFBVyw0QkFBQTtFWndpRXQxVjtBQUNGO0FhemlFQTtFQUNFLFlBQUE7RUFDQSxXQUFBO0VBQ0EsY0FBQTtFQUNBLGtCQUFBO0VBQ0Esa0JBQUE7RUFDQSxxQkFBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0FiMmlFRjs7QWF6aUVFO0VBQ0UsV0FBQTtFQUNBLFNBQUE7RUFDQSxRQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0Esc0JBQUE7RUFDQSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxRQUFBO0VBQ0EsbURBQUE7VUFBQSwyQ0FBQTtBYjRpRUo7O0FhM2lFRTtFQUNFLDhCQUFBO1VBQUEsc0JBQUE7QWI4aUVKOztBYTVpRUE7RUFDRTtJQUNFLFNBQUE7SUFDQSxRQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7RWIraUVGO0VhN2lFQTtJQUNFLFlBQUE7SUFDQSxXQUFBO0lBQ0EsV0FBQTtJQUNBLFVBQUE7SUFDQSxVQUFBO0ViK2lFRjtBQUNGOztBYTVqRUE7RUFDRTtJQUNFLFNBQUE7SUFDQSxRQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7RWIraUVGO0VhN2lFQTtJQUNFLFlBQUE7SUFDQSxXQUFBO0lBQ0EsV0FBQTtJQUNBLFVBQUE7SUFDQSxVQUFBO0ViK2lFRjtBQUNGLENBQUEsb0NBQUFcIixcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCBcIlwiKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vZG90cy5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2RvdHMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcblxuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG5cbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG5cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cblxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG5cbiAgY3NzICs9IG9iai5jc3M7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vQ29udGludWUgdG8gd29yayBvbiBtYWtpbmcgdGhpcyBtb3JlIGVmZmljaWVudCBhbmQgcmVhZGFibGVcclxuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiXHJcbmltcG9ydCBTaGFkb3dCb3ggZnJvbSAnLi9zaGFkb3dCb3gnO1xyXG5jbGFzcyBOZXdzIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgLy8gdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyk7XHJcbiAgICBpZihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxsLW5ld3MtY29udGFpbmVyJykpe1xyXG4gICAgICAgIHRoaXMucmV0dXJuSG9tZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXR1cm4taG9tZScpO1xyXG4gICAgICAgICAgICAgICAgIC8vTGF0ZXIsIGZpbmQgd2F5IHRvIG1ha2UgdGhpcyBub3QgY2F1c2UgZXJyb3JzIG9uIG90aGVyIHBhZ2VzXHJcbiAgICAgICAgdGhpcy5tYWluQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsbC1uZXdzLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIHRoaXMubmV3c1JlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW4tZGlzcGxheScpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdpbmF0aW9uLWhvbGRlcicpXHJcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBMaW5rcztcclxuICAgICAgICB0aGlzLnNlZU1vcmU7XHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc21pc3Mtc2VsZWN0aW9uJyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxUaXRsZSA9IFwiQWxsIE5ld3NcIjtcclxuICAgICAgICB0aGlzLnN0b3JlZFRpdGxlO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250ZW50ID0gW107XHJcbiAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4dGVybmFsQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENhbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm9yaWdpbjtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm1haW5IZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbi1oZWFkZXInKTtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXdzLXNlYXJjaFwiKVxyXG4gICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gJyc7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2VcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMudHlwaW5nVGltZXI7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFJlcG9ydDsgICAgICBcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Z1bGwtZGlzcGxheS1jb250YWluZXInKTsgICAgXHJcbiAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnJlc2V0QWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0LWFsbCcpO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG9nZ2xlLW9wdGlvbnMnKTtcclxuXHJcbiAgICAgICAgLy9BZnRlciBnZXQgZXZlcnl0aGluZyB3b3JraW5nLCBwdXQgdGhlIHNldHRpbmcgaW4gaGVyZSwgcmFyZXIgdGhhbiBqdXN0IGEgcmVmXHJcbiAgICAgICAgLy9udm0uIE5lZWQgdG8gZG8gaXQgbm93XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5yZW9yZGVyQnlEYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI29yZGVyLWJ5LWRhdGUnKTtcclxuICAgICAgICB0aGlzLnJlb3JkZXJCeUFscGhhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI29yZGVyLWJ5LWFscGhhJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZnVsbFdvcmRTd2l0Y2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZnVsbC13b3JkLW9ubHknKTtcclxuXHJcbiAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd29yZC1zdGFydC1vbmx5Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZVN3aXRjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXNlLXNlbnNpdGl2ZScpO1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVUaXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLXRpdGxlJyk7XHJcbiAgICAgICAgdGhpcy5pbmNsdWRlRGVzY3JpcHRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1kZXNjcmlwdGlvbicpO1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVQcm9wZXJ0eVVwZGF0ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1wcm9wZXJ0eS11cGRhdGVzJyk7XHJcbiAgICAgICAgdGhpcy5pbmNsdWRlR2VuZXJhbE5ld3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1nZW5lcmFsLW5ld3MnKTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnYWJsZVNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBkYXRlT3JkZXI6e1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnb3JkZXItYnktZGF0ZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdkZXNjJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWxwaGFPcmRlcjp7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdvcmRlci1ieS1hbHBoYScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdkZXNjJyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGluY2x1ZGVUaXRsZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS10aXRsZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5jbHVkZURlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdpbmNsdWRlLWRlc2NyaXB0aW9uJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1cGRhdGU6IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ2luY2x1ZGUtcHJvcGVydHktdXBkYXRlcycsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmV3czoge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS1nZW5lcmFsLW5ld3MnLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnaW5jbHVkZScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bGxXb3JkOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdmdWxsLXdvcmQtb25seScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdmdWxsLXdvcmQtb25seScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiBmYWxzZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3b3JkU3RhcnRPbmx5OiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICd3b3JkLXN0YXJ0LW9ubHknLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnd29yZC1zdGFydC1vbmx5JyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGlzQ2FzZVNlbnNpdGl2ZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnY2FzZS1zZW5zaXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnY2FzZS1zZW5zaXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGlzLmZpbHRlckJ5ZGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWx0ZXItYnktZGF0ZScpXHJcbiAgICAgICAgLy8gdGhpcy5pc0RhdGVGaWx0ZXJPbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGF0ZS1maWx0ZXJzJyk7XHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucyA9IHRoaXMuZGF0ZUZpbHRlcnMucXVlcnlTZWxlY3RvckFsbCgnc2VsZWN0Jyk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vcmFuZ2UgbWFrZXMgdGhlIHByZXZpb3VzIHR3byBudWxsLCBlZmZlY3RpdmVseSBjYW5jZWxpbmcgdGhleSBvdXQgYW5kIHNodXR0aW5nIG9mZiB0aGVpciBpZiBsb2dpY1xyXG4gICAgICAgIC8vYnV0dG9uIHdpbGwgbWFrZSBvcHRpb25zIGFwcGVhciBhbmQgbWFrZSBpc0ZpbHRlck9uID0gdHJ1ZSwgYnV0IGlmIG5vIG9wdGlvbiBpcyBzZWxlY3RlZCwgdGhleSBkaXNzYXBlYXIgYW5kIGZhbHNlIGlzIHJlc3RvcmVkIFxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlclNldFVwID0ge1xyXG4gICAgICAgICAgICBtb250aDogbnVsbCxcclxuICAgICAgICAgICAgeWVhcjogbnVsbCxcclxuICAgICAgICAgICAgLy8gcmFuZ2U6IHtcclxuICAgICAgICAgICAgLy8gICAgIHN0YXJ0OiBudWxsLFxyXG4gICAgICAgICAgICAvLyAgICAgZW5kOiBudWxsXHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMueWVhck9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnkteWVhcicpO1xyXG4gICAgICAgIHRoaXMubW9udGhPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2J5LW1vbnRoJyk7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxpc3QgPSB7fVxyXG4gICAgICAgIHRoaXMubW9udGhzID0gW107XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5ldmVudHModGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBldmVudHModGFyZ2V0KXtcclxuICAgICAgICBcclxuICAgICAgICAvLyBjb25zdCBkZWZhdWx0U3dpdGNoU2V0dGluZ3MgPSB7Li4udGhpcy50b2dnYWJsZVNldHRpbmdzLCBhbHBoYU9yZGVyOiB7Li4udGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXJ9fTtcclxuICAgICAgICBsZXQgZGVmYXVsdFN3aXRjaFNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MpKVxyXG5cclxuICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3B1bGF0ZURhdGVGaWx0ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRBbGwub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlVGV4dChkZWZhdWx0U3dpdGNoU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnRvZ2dhYmxlU2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRTd2l0Y2hTZXR0aW5ncykpO1xyXG4gICAgICAgICAgICB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3M7IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyLCB0YXJnZXQuZGF0ZU9yZGVyKVxyXG4gICAgICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhkZWZhdWx0U3dpdGNoU2V0dGluZ3MuaXNDYXNlU2Vuc2l0aXZlKVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5pbml0aWFsVGl0bGV9YDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLnZhbHVlID0gJydcclxuICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMudmFsdWUgPSAnJ1xyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHllYXIub3B0aW9uc1t5ZWFyLnNlbGVjdGVkSW5kZXhdLnZhbHVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2Rlc2MgZGF0ZSBub3Qgd29ya2luZ1xyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5RGF0ZS5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50b2dnYWJsZVNldHRpbmdzLmRhdGVPcmRlcilcclxuICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuaXNPbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRhcmdldC5hbHBoYU9yZGVyLmRpcmVjdGl2ZSA9ICdkZXNjJ1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5pc09uID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPT09ICdkZXNjJyl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZGF0ZU9yZGVyLmRpcmVjdGl2ZSA9ICdhc2MnXHJcbiAgICAgICAgICAgIH1lbHNlKFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICB9O1xyXG4vL2luaWF0ZSB0b2dnbGUgdGhyb3VnaCB0aGVzZSwgdXNpbmcgbGV0cyB0byBoYW5kbGUgYm90aCBjaGFuZ2VzIGJhc2VkIG9uIHRoZSAuZGlyZWN0aXZlIHZhbHVlLCBcclxuLy9hbmQgbWF5YmUgZXZlbiBzZXR0aW5nIGludGlhbCBoaWRpbmcgdGhpcyB3YXkgdG9vIFxyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5QWxwaGEub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuaXNPbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuZGlyZWN0aXZlID0gJ2Rlc2MnXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5pc09uID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID09PSAnZGVzYycpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID0gJ2FzYydcclxuICAgICAgICAgICAgfWVsc2UoXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVQcm9wZXJ0eVVwZGF0ZXMub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC51cGRhdGUuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudXBkYXRlLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudXBkYXRlLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmNsdWRlR2VuZXJhbE5ld3Mub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5uZXdzLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm5ld3MuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5uZXdzLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmZ1bGxXb3JkU3dpdGNoLm9uY2xpY2sgPSAoKT0+e1xyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZ1bGxXb3JkLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMud29yZFNlYXJjaFBvc2l0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1lbHNleyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZ1bGxXb3JkLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24uY2xhc3NMaXN0LmFkZCgnaW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHdvcmQgc3RhcnQgb25seSBpczogJHt0YXJnZXQud29yZFN0YXJ0T25seS5pc09ufWApXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmdWxsIHdvcmQgb25seSBpczogJHt0YXJnZXQuZnVsbFdvcmQuaXNPbn1gKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24ub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgd29yZCBzdGFydCBvbmx5IGlzOiAke3RhcmdldC53b3JkU3RhcnRPbmx5LmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZVN3aXRjaC5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBjYXNlIHNlbnNpdGl2ZSBpczogJHt0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVRpdGxlLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVEZXNjcmlwdGlvbi5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmluY2x1ZGVEZXNjcmlwdGlvbi5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5pbmNsdWRlUmVsYXRpb25zaGlwLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vICAgICBpZih0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyl7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyA9IGZhbHNlO1xyXG4gICAgICAgIC8vICAgICB9ZWxzZXtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuc2VhcmNoYWJsZUZpZWxkcy5yZWxhdGlvbnNoaXBzID0gdHJ1ZTtcclxuICAgICAgICAvLyAgICAgfSAgXHJcbiAgICAgICAgLy8gfTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5maWx0ZXJCeWRhdGUub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgLy8gICAgIHRoaXMuZGF0ZUZpbHRlcnMuY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuaXNEYXRlRmlsdGVyT24gPSB0cnVlO1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh0aGlzLmlzRGF0ZUZpbHRlck9uKVxyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucy5mb3JFYWNoKGUgPT57XHJcbiAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKG9wdGlvbik9PntcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50TW9udGggPSB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihlLmlkID09PSAnYnkteWVhcicpe1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnllYXJPcHRpb25zLnZhbHVlICE9PSAnJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMueWVhckxpc3RbdGhpcy55ZWFyT3B0aW9ucy52YWx1ZV0ubWFwKG1vbnRoPT4gYDxvcHRpb24gdmFsdWU9XCIke21vbnRofVwiPiR7bW9udGh9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLm1vbnRocy5tYXAobW9udGg9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7bW9udGh9XCI+JHttb250aH08L29wdGlvbj5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5tb250aE9wdGlvbnMucXVlcnlTZWxlY3Rvcihgb3B0aW9uW3ZhbHVlPScke2N1cnJlbnRNb250aH0nXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLnZhbHVlID0gY3VycmVudE1vbnRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZSA9ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBvcHRpb24udGFyZ2V0LmlkLnNsaWNlKDMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlRmlsdGVyU2V0VXBbdmFsdWVdID0gb3B0aW9uLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZGF0ZUZpbHRlclNldFVwKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoKSA9PiB0aGlzLnR5cGluZ0xvZ2ljKCkpXHJcblxyXG4gICAgICAgIHRoaXMuZGlzbWlzc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpKVxyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZVRleHQodGFyZ2V0KTtcclxuICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMuZm9yRWFjaChlPT57ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gdGhpcy50b2dnbGVUZXh0KHRhcmdldCkpfSlcclxuICAgIH1cclxuLy9BZGQgJ2lzT24nIHRvIGV4Y2x1ZGVzLCB3aXRoIGluY2x1ZGUgaGF2aW5nIGNsYXNzIG9mZiBhbmQgZXhjbHVkZSBoYXZpbmcgY2xhc3Mgb2YgKnZhbHVlP1xyXG4gICAgdG9nZ2xlVGV4dCh0YXJnZXQpe1xyXG4gICAgICAgIGxldCBmaWx0ZXJLZXlzID0gT2JqZWN0LmtleXModGFyZ2V0KVxyXG4gICAgICAgIGZpbHRlcktleXMuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYCMke3RhcmdldFtlXS5yZWZ9IHNwYW5gKS5mb3JFYWNoKGk9PmkuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpXHJcbiAgICAgICAgICAgIGlmKHRhcmdldFtlXS5pc09uKXtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RhcmdldFtlXS5yZWZ9IC4ke3RhcmdldFtlXS5kaXJlY3RpdmV9YCkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGFyZ2V0W2VdLnJlZn0gLm9mZmApLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICAvL1JlZG8gcGFnaW5hdGlvbiwgYnV0IHdpbGwgbmVlZCB0byBoYXZlIHNldHVwIHdvcmsgZm9yIGdldHRpbmcgcmlkIHRocm91Z2ggZWFjaCByZWxvYWRcclxuICAgIFxyXG4gICAgLy9jaGVjayBwYWdpbmF0aW9uIHRocm91Z2hvdXQgZWFjaCBhZGRcclxuXHJcbiAgICAvL2VzdGFibGlzaCBkZWZhdWx0IHNlYXJjaCBiZWhhdmlvci4gQXMgaW4sIGRvZXMgaXQgbG9vayBhdCB0aXRsZSwgYmlvLCBcclxuICAgIC8vYW5kIGNhcHRpb24gcGFydGlhbHMgYXQgdGhlIHN0YXJ0PyhpbiBpZiBzdGF0ZW1lbnRzIHVzZSBjb250YWlucyBvbiBzdHJpbmdzPylcclxuICAgIC8vaW4gZ2F0aGVyTmV3cygpIGhhdmUgaWYgc3RhdGVtZW50cyB0aGF0IHdvcmsgdGhyb3VnaCB0aGUgZGF0YSBhZnRlciBpdCdzIGdvdHRlbiwgYmVmb3JlIHRoZSBpbnNlcnRpb25zXHJcbiAgICAvL1doZW4gY2xpY2sgb24gbmV3cywgdXNlIGJpZ2dlciBwaWN0dXJlLiBBbHNvIHB1dCBpbiBkdW1teSwgXHJcbiAgICAvL3JlbGF0ZWQgc2l0ZXMgb24gdGhlIHJpZ2h0LCBhbmQgbWF5YmUgZXZlbiByZWxhdGVkIG1lbWJlcnMgYW5kIHByb3BlcnRpZXModGl0bGUgb3ZlciBhbmQgd2l0aCBsaW5rcylcclxuICAgIC8vQWxzbyBsaXN0IG90aGVyIG5ld3MgcmVsYXRlZCB0byBpdCwgbGlrZSBpZiBhbGwgYWJvdXQgc2FtZSBidWlsZGluZyBvciBtZW1iZXIoY2FuIHVzZSBjbW1vbiByZWxhdGlvbiBmb3IgdGhhdCBidXQgXHJcbiAgICAvL25lZWQgdG8gYWRkIGEgbmV3IGZpZWxkIGZvciB0eXBlcyBvZiByZWxhdGlvbnNoaXBzKVxyXG4gICAgLy9HaXZlIHRpdGxlcyB0byBvdGhlciBzZWN0aW9ucywgd2l0aCB0aGUgcmlnaHQgYmVpbmcgZGl2aWRlZCBpbnRvIHJlbGF0ZWQgbGlua3MgYW5kIHNlYXJjaCBtb2RpZmljYXRpb25zXHJcbiAgICAvL1JlbWVtYmVyIGZ1bmN0aW9uYWxpdHkgZm9yIG90aGVyIHBhcnRzIGxpbmtpbmcgdG8gaGVyZVxyXG4gICAgdHlwaW5nTG9naWMoKSB7XHJcbiAgICAgICAgLy9BdXRvbWF0aWNhbGx5IGRpc21pc3Mgc2luZ2xlIG9yIGhhdmUgdGhpcyBhbmQgb3RoZXIgYnV0dG9ucyBmcm96ZW4gYW5kL29yIGhpZGRlbiB1bnRpbCBkaXNtaXNzZWRcclxuICAgICAgICAvL0xlYW5pbmcgdG93YXJkcyB0aGUgbGF0dGVyLCBhcyBmYXIgbGVzcyBjb21wbGljYXRlZFxyXG4gICAgICAgIGlmICh0aGlzLm5ld3NTZWFyY2gudmFsdWUgIT09IHRoaXMucHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudHlwaW5nVGltZXIpXHJcbiAgICBcclxuICAgICAgICAgIGlmICh0aGlzLm5ld3NTZWFyY2gudmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzU3Bpbm5lclZpc2libGUpIHtcclxuICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9IHRoaXMubmV3c1NlYXJjaC52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke3RoaXMubmV3c0RlbGl2ZXJ5fWA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gMDtcclxuICAgICAgICAgICAgdGhpcy50eXBpbmdUaW1lciA9IHNldFRpbWVvdXQodGhpcy5nYXRoZXJOZXdzLmJpbmQodGhpcyksIDc1MCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgJHt0aGlzLmluaXRpYWxUaXRsZX1gO1xyXG4gICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5uZXdzU2VhcmNoLnZhbHVlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzeW5jIHBvcHVsYXRlRGF0ZUZpbHRlcnMoKXtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIC8vSXMgaXQgYmV0dGVyIGp1c3QgdG8gdXNlIHNlcGVyYXRlIHVybCByb3V0ZXM/IFxyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvYWxsLW5ld3M/bmV3cycpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBjb25zdCBzcGxpdERhdGVzID0gW107XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHllYXJzID0gW107XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0cy51cGRhdGVzQW5kTmV3cy5mb3JFYWNoKG5ld3M9PntcclxuICAgICAgICAgICAgICAgIGlmICghZGF0ZXMuaW5jbHVkZXMobmV3IERhdGUobmV3cy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLXVzJywge21vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJ30pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVzLnB1c2gobmV3IERhdGUobmV3cy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLXVzJywge21vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJ30pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZGF0ZXMpXHJcblxyXG4gICAgICAgICAgICBkYXRlcy5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgIHNwbGl0RGF0ZXMucHVzaChlLnNwbGl0KCcgJykpXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzcGxpdERhdGVzKVxyXG5cclxuICAgICAgICAgICAgc3BsaXREYXRlcy5mb3JFYWNoKGRhdGU9PntcclxuXHJcbiAgICAgICAgICAgICAgICBpZighdGhpcy5tb250aHMuaW5jbHVkZXMoZGF0ZVswXSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhzLnB1c2goZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIGlmKCF5ZWFycy5pbmNsdWRlcyhkYXRlWzFdKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8geWVhcnMucHVzaChkYXRlWzFdKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueWVhckxpc3RbZGF0ZVsxXV0gPSBbXTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zdCB5ZWFycyA9IE9iamVjdC5rZXlzKHRoaXMueWVhckxpc3QpXHJcblxyXG4gICAgICAgICAgICB5ZWFycy5mb3JFYWNoKHllYXI9PntcclxuICAgICAgICAgICAgICAgIHNwbGl0RGF0ZXMuZm9yRWFjaChkYXRlPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoeWVhciA9PT0gZGF0ZVsxXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueWVhckxpc3RbeWVhcl0ucHVzaChkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy55ZWFyTGlzdClcclxuXHJcbiAgICAgICAgICAgIGxldCBhbGxNb250aHMgPSBbJ0phbnVhcnknLCdGZWJydWFyeScsJ01hcmNoJywgJ0FwcmlsJywnTWF5JywnSnVuZScsJ0p1bHknLCdBdWd1c3QnLCdTZXB0ZW1iZXInLCdPY3RvYmVyJywnTm92ZW1iZXInLCdEZWNlbWJlciddO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb250aHMuc29ydChmdW5jdGlvbihhLGIpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFsbE1vbnRocy5pbmRleE9mKGEpID4gYWxsTW9udGhzLmluZGV4T2YoYik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB5ZWFycy5zb3J0KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Bbnk8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICR7eWVhcnMubWFwKHllYXI9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7eWVhcn1cIj4ke3llYXJ9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAke3RoaXMubW9udGhzLm1hcChtb250aD0+IGA8b3B0aW9uIHZhbHVlPVwiJHttb250aH1cIj4ke21vbnRofTwvb3B0aW9uPmApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICBgO1xyXG5cclxuICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgIGFzeW5jIGdhdGhlck5ld3MoKXtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy50b2dnYWJsZVNldHRpbmdzXHJcbiAgICAgICAgLy9QdXQgcmVzdWx0cyBpbiB2YXIgY29weSwganVzdCBsaWtlIGluIHRoZSBzaGFkb3dib3hcclxuICAgIFxyXG4gICAgICAgIC8vTWF5YmUsIHRvIHNvbHZlIGNlcnRhaW4gaXNzdWVzIG9mICd1bmRlZmluZWQnLCBhbGxvdyBwYWdpbmF0aW9uIGV2ZW4gd2hlbiBvbmx5IDEgcGFnZSwgYXMgSSB0aGluayBuZXh0IGFuZCBwcmV2IHdpbGwgYmUgaGlkZGVuIFxyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgLy9JcyBpdCBiZXR0ZXIganVzdCB0byB1c2Ugc2VwZXJhdGUgdXJsIHJvdXRlcz8gXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9hbGwtbmV3cz9uZXdzPScgKyB0aGlzLm5ld3NEZWxpdmVyeSk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTsgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXN1bHRzKVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAvL21heWJlIGFsbG93aW5nIGEgb25lIG9uIHRoZSBwYWdpbmF0aW9uIHdvdWxkIHNvbHZlIHRoZSBlcnJvcnNcclxuXHJcbiAgICAgICAgICAgIC8vRm9yIGZpZWxkIGV4Y2x1c2lvbiwgY291bGQgaGF2ZSBjb2RlIHByb2Nlc3NlZCB3aXRoIG1hdGNoZXMoKSBvciBpbmRleE9mIG9uIHRoZSBmaWVsZHMgdGhhdCBhcmVuJ3QgYmFubmVkXHJcbiAgICAgICAgICAgIC8vVGFrZSBvdXQgdGhvc2UgdGhhdCBwcm9kdWNlIGEgZmFsc2UgcmVzdWx0XHJcblxyXG4gICAgICAgICAgICBsZXQgYWxsTmV3cyA9IHJlc3VsdHMudXBkYXRlc0FuZE5ld3M7XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVsYXRlZFBvc3RzID0gcmVzdWx0cy5wcm9wZXJ0aWVzQW5kTWVtYmVycztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3N0UmVsYXRpb25zaGlwcyA9IFtdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYWxsTmV3cy5tYXAobmV3cz0+e1xyXG4gICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocG9zdD0+e1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGAke25ld3MudGl0bGV9OiAke3Bvc3QuSUR9YClcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IHJlbGF0ZWRQb3N0cy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHBvc3QuSUQgPT09IHJlbGF0ZWRQb3N0c1tpXS5pZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UmVsYXRpb25zaGlwcy5wdXNoKHJlbGF0ZWRQb3N0c1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhwb3N0UmVsYXRpb25zaGlwcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMgPSBwb3N0UmVsYXRpb25zaGlwcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBwb3N0UmVsYXRpb25zaGlwcyA9IFtdO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG4gPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuICAgICAgICAgICAgaWYobi5pbmRleE9mKCcjJykgPiAtMSl7XHJcbiAgICAgICAgICAgICAgICBuID0gbi5zcGxpdCgvWy8tXSsvKVxyXG4gICAgICAgICAgICAgICAgaWYobls0XS5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5bNV0uaW5kZXhPZignbmV3cycpID4gLTEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnNpbmdsZUNhbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV3c1NlYXJjaC52YWx1ZSA9IGAke25bNF19YDsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gYCR7bls0XX1gOyBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcmlnaW4gPSBuWzZdOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXBvcnQgPSBuWzRdLnNsaWNlKDEpOyBcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoJycsICcnLCBgLyR7blsyXX0tJHtuWzNdfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGhpc3RvcnkuZ28oLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXh0ZXJuYWxDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG5ld3NUeXBlcyA9IFsnbmV3cycsICd1cGRhdGUnXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBjb25zdCBuZXdzT3V0cHV0ID0gMjtcclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBuZXdzUGFnZSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgbmV3c1BhZ2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50U2hvd247XHJcblxyXG4gICAgICAgICAgICAvLyAvL2lmIHN5bWJvbCBlbnRlcmVkIGFzIG9ubHkgdGhpbmcsIGl0J2xsIG15IGxvZ2ljLCBzb21ldGltZXMuIFJlbWVkeSB0aGlzLlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoIXRoaXMuZnVsbERpc3BsYXkgfHwgdGhpcy5iYWNrZ3JvdW5kQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAvL0RvIHN0YXJ0IHZzIGFueXdoZXJlIGluIHRoZSB3b3JkXHJcbiAgICAgICAgICAgICAgICAvL1N0YXJ0IG9ubHkgaXMgc3RhbmRhcmQgYW5kIGF1dG8gdHJ1ZSB3aGVuIHdob2xlIHdvcmQgaXMgdHVybmVkIG9uKD8pIG9yIHNpbXBseSBidXJpZWQgaW4gcGFydGlhbCBpZlxyXG4gICAgICAgICAgICAgICAgLy9pdCBzaG91bGQgYXQgbGVhc3QgYmUgaW5hY2Vzc2libGUgb24gdGhlIGZyb250ZW5kIHdpdGggdmlzdWFsIGN1ZVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRG8gYSBtb3JlIHRob3JvdWdoIHRlc3Qgb2YgdGhvc2UgbGF0ZXIgYWZ0ZXIgcmVsIGFuZCAnZGlzbGF5LXF1YWxpdHknIGFydGljbGVzIGNyZWF0ZWQgXHJcblxyXG4gICAgICAgICAgICAgICAgLy9EbyBiYXNpYyBtb250aCBhbmQgeWVhciBhbmQgcmFuZ2UgcGlja2luZywgYmVmb3JlIGxvb2tpbmcgaW50byBwb3AtdXAgYW5kIGZpZ3VyaW5nIG91dCBob3cgdG8gZ2V0IGluZm8gZnJvbSB3aGF0IGlzIHNlbGVjdGVkIG9uIGl0XHJcbiAgICAgICAgICAgICAgICBsZXQgZnVsbExpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCB0aXRsZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCBkZXNjID0gW107XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVsID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5uZXdzRGVsaXZlcnkgIT09ICcnKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVkJylcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5uZXdzRGVsaXZlcnkuc3RhcnRzV2l0aCgnIycpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlcXVlc3RlZElkID0gdGhpcy5uZXdzRGVsaXZlcnkucmVwbGFjZSgnIycsICcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXNzb2NpYXRlZE5ld3MgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MuZm9yRWFjaChuZXdzID0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocj0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHIuaWQgPT09IHBhcnNlSW50KHJlcXVlc3RlZElkKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc29jaWF0ZWROZXdzLnB1c2gobmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSByLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhc3NvY2lhdGVkTmV3cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gYXNzb2NpYXRlZE5ld3M7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmV4dGVybmFsQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm9yaWdpbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXh0ZXJuYWxDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLm5ld3NTZWFyY2gudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmV0dXJuSG9tZS5ocmVmPWAke3NpdGVEYXRhLnJvb3RfdXJsfS8jJHt0aGlzLm9yaWdpbn1Db250YWluZXJgOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgU2hvd2luZyBSZXN1bHRzIGZvcjogJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3JlZFRpdGxlID0gYFNob3dpbmcgUmVzdWx0cyBmb3I6ICR7bmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlcyA9IGFsbE5ld3MuZmlsdGVyKChuZXdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdzLnRpdGxlLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpLmluY2x1ZGVzKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZighdGFyZ2V0LmZ1bGxXb3JkLmlzT24gJiYgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3M9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld3NTcGxpdCA9IG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGUgb2YgbmV3c1NwbGl0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlLnN0YXJ0c1dpdGgodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMucHVzaChuZXdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIG5ld3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiBudWxsOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMgPSBhbGxOZXdzLmZpbHRlcihuZXdzPT4gbmV3cy50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzID0gdGl0bGVzLmZpbHRlcihuZXdzPT4gbmV3cy50aXRsZS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5KSAhPT0gLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZURlc2NyaXB0aW9uLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MgPSBhbGxOZXdzLmZpbHRlcigobmV3cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3cy5mdWxsRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIikuaW5jbHVkZXModGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lmIGZpcmVkIScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZighdGFyZ2V0LmZ1bGxXb3JkLmlzT24gJiYgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3M9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdzU3BsaXQgPSBuZXdzLmZ1bGxEZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgZSBvZiBuZXdzU3BsaXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUuc3RhcnRzV2l0aCh0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MucHVzaChuZXdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjID0gYWxsTmV3cy5maWx0ZXIobmV3cz0+IG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MgPSBkZXNjLmZpbHRlcihuZXdzPT4gbmV3cy5mdWxsRGVzY3JpcHRpb24uaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeSkgIT09IC0xKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlYXJjaGVkTmV3cyA9IGZ1bGxMaXN0LmNvbmNhdCh0aXRsZXMsIGRlc2MsIHJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gW107IFxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaGVkTmV3cy5mb3JFYWNoKChuZXdzKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGxOZXdzLmluY2x1ZGVzKG5ld3MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vRGF0ZXMgYmVsb25nIHRvIGEgc2VwZXJhdGUgbG9naWMgdGhyZWFkLCBhbmQgYXMgc3VjaCBzaG91bGQgbm95dCBiZSBsaW5rZWQgdG8gdHlwaW5nLiBUaGV5IGFlIGNsb3NlciB0byB0aGUgc29ydHMgaW4gdGhhdCBcclxuICAgICAgICAgICAgICAgIC8vdGhleSBjYW4gYmUgYWZ0ZXIgdGhlIHR5cGluZywgYmVmb3JlLCBvciBldmVuIGJlIHVzZWQgd2l0aG91dCBpdFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvL0FmdGVyIEkgZmluaXNoIHRoZSBjb3JlIGxvZ2ljLCBhZGQgaW4gZnVuY3Rpb25hbGl0eSB0aGF0IGhhcyBhbnkgYXMgb3B0aW9uIGZvciAneWVhcicsIHdpdGggc2VsZWN0aW9uIG9mIHNwZWNpZmljIFxyXG4gICAgICAgICAgICAgICAgLy9saW1pdGluZyB0aGUgJ21vbnRoJyB2YWx1ZXMgYW5kIHNlbGVjdGluZyB0aGUgZWFybGllc3Qgb25lIGFzIHRoZSBkZWZhdWx0IGZpbHRlciBmb3IgJ21vbnRoJyBvciAnYW55J1xyXG4gICAgICAgICAgICAgICAgLy9GaWx0ZXIgYnkgZGF0ZSB3aWxsIGJlIGEgYm9vbGVhbiB3aXRoIGRyb3Bkb3duIGRlZmF1bHRzIG9mIGFueSBmb3IgYm90aFxyXG5cclxuICAgICAgICAgICAgICAgICBsZXQgZGF0ZUZpbHRlcnNTZXQgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGVGaWx0ZXJTZXRVcCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgY29uc29sZS5sb2coYGNvbnRlbnRMb2FkZWQgPSAke3RoaXMuY29udGVudExvYWRlZH1gKVxyXG5cclxuICAgICAgICAgICAgICAgICBmb3IobGV0IGZpbHRlciBvZiBkYXRlRmlsdGVyc1NldCl7XHJcbiAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZGF0ZUZpbHRlclNldFVwW2ZpbHRlcl0peyAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MgPSBhbGxOZXdzLmZpbHRlcigobmV3cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ldyBEYXRlKG5ld3MuZGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi11cycsIHttb250aDogJ2xvbmcnLCB5ZWFyOiAnbnVtZXJpYyd9KS5pbmNsdWRlcyh0aGlzLmRhdGVGaWx0ZXJTZXRVcFtmaWx0ZXJdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICB9XHJcbiAgIFxyXG4gICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5kYXRlT3JkZXIuZGlyZWN0aXZlID09PSAnYXNjJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3Muc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYS5kYXRlKSAtIG5ldyBEYXRlKGIuZGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGEuZGF0ZSkgLSBuZXcgRGF0ZShiLmRhdGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5hbHBoYU9yZGVyLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbE5ld3Muc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvY2FsZUNvbXBhcmUgZG9lcyBhIHN0cmluZyBjb21wYXJpc29uIHRoYXQgcmV0dXJucyAtMSwgMCwgb3IgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS50aXRsZS5sb2NhbGVDb21wYXJlKGIudGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXIuZGlyZWN0aXZlID09PSAnZGVzYycpeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5ld3NUeXBlcy5mb3JFYWNoKCh0eXBlKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldFt0eXBlXS5pc09uICE9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cyA9IGFsbE5ld3MuZmlsdGVyKG5ld3M9PiBuZXdzLnBvc3RUeXBlICE9PSB0eXBlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgaWYoYWxsTmV3cy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGFsbE5ld3MubGVuZ3RoIDw9IG5ld3NPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlcy5jb25jYXQoYWxsTmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoYWxsTmV3cy5sZW5ndGggPiBuZXdzT3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gbmV3c091dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IGFsbE5ld3Muc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhbGxOZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UgPSBhbGxOZXdzLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChuZXdzUGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihuZXdzUGFnZXMubGVuZ3RoKXsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFNob3duID0gbmV3c1BhZ2VzW3RoaXMuY3VycmVudFBhZ2VzXTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsaXZlck5ld3MoY29udGVudFNob3duKVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jb250ZW50TG9hZGVkICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c2ApKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QW5kUHJldmlvdXMoKTtcclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmKGNvbnRlbnRTaG93bi5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydFBhZ2luYXRpb24obmV3c1BhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TmV4dEFjdGl2YXRpb24oKTsgXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvL1RoaXMgbmVlZHMgdG8gY2hhbmdlIHRvXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMuZm9yRWFjaChvID0+IHtvLmNsYXNzTGlzdC5hZGQoJ2luYWN0aXZlJyk7fSk7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucy5mb3JFYWNoKGYgPT4ge2YuZGlzYWJsZWQgPSB0cnVlfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGVudCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgbmV3cyBvZiBhbGxOZXdzKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5jbGFzc0xpc3QuYWRkKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuY2xhc3NMaXN0LmFkZCgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc21pc3NCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zZXBlcmF0ZSB0aGUgaW5zZXJ0aW9ucyB0byBhIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Vc2UgaWYgdG8gdmFyeSBpZiBsb29rIGZvciBuZXdzIHdpdGggdGhhdCBvciBvbmVzIHdpdGggcmVsYXRpb25zaGlwIHRoYXQgaGFzIHRoYXRcclxuICAgICAgICAgICAgICAgICAgICAvL21ha2UgYXJyYXkgb2YgZWFjaCBuZXdzJ3MgcmVsYXRpb25zaGlwc1tnaXZlIHRoZSBmaXJzdCBwb3N0IDIgZm9yIHRlc3Rpbmcgb2YgaWYgY2hlY2tpbmcgYXJheSBwcm9wZXJseV1cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmZ1bGxEaXNwbGF5KXsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtuZXdzLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChyPT50aGlzLmNhbGxlZElkcy5wdXNoKHIuaWQpKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jYWxsZWRJZHMuaW5jbHVkZXMocGFyc2VJbnQodGhpcy5jdXJyZW50UmVwb3J0KSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGVudC5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7bmV3cy50aXRsZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmKHRoaXMuc2luZ2xlQ2FsbCl7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGl2ZXJOZXdzKHRoaXMuZnVsbERpc3BsYXlDb250ZW50LCB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZXh0ZXJuYWxDYWxsKVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5mdWxsRGlzcGxheSAmJiB0aGlzLmV4dGVybmFsQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7ICBcclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWxpdmVyTmV3cyhjb250ZW50U2hvd24sIGRlc3RpbmF0aW9uID0gdGhpcy5uZXdzUmVjaWV2ZXIpe1xyXG4gICAgICAgIGRlc3RpbmF0aW9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgJHtjb250ZW50U2hvd24ubGVuZ3RoID8gYDx1bD5gICA6ICdObyBhcnRpY2xlcyBtYXRjaCB5b3VyIGNyaXRlcmlhJ31cclxuICAgICAgICAgICAgJHshY29udGVudFNob3duLmxlbmd0aCA/IGA8YnV0dG9uIGlkPVwic2VhcmNoUmVzZXRcIj5QbGVhc2UgdHJ5IGEgZGlmZmVyZW50IHF1ZXJ5IG9yIGNoYW5nZSB5b3VyIGZpbHRlcnMuPC9idXR0b24+YCAgOiAnJ31cclxuICAgICAgICAgICAgICAgICR7Y29udGVudFNob3duLm1hcChyZXBvcnQgPT4gYFxyXG4gICAgICAgICAgICAgICAgPGxpPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzXCI+ICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGg0PiR7cmVwb3J0LnRpdGxlfTwvaDQ+YCA6ICcnfVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXBvcnQuY2FwdGlvbi5sZW5ndGggPj0gMSA/IHJlcG9ydC5jYXB0aW9uICsgJyAtICcgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cmVwb3J0LmRhdGV9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD4ke3JlcG9ydC5yZWxhdGlvbnNoaXBzLm1hcChyZWxhdGlvbnNoaXAgPT4gYDxzcGFuIGNsYXNzPVwibmFtZVwiPiR7cmVsYXRpb25zaGlwLnRpdGxlfTwvc3Bhbj4gICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGEgY2xhc3M9XCJyZWxhdGlvbnNoaXAtbGlua1wiIGRhdGEtcmVsYXRlZD1cIiR7cmVsYXRpb25zaGlwLmlkfVwiPihBc3NvY2lhdGVkIE5ld3MpPC9hPiBgIDogYDxhIGNsYXNzPVwicmVsYXRpb25zaGlwLWxpbmsgZGlzbWlzc2VkXCIgZGF0YS1yZWxhdGVkPVwiJHtyZWxhdGlvbnNoaXAuaWR9XCI+KEFzc29jaWF0ZWQgTmV3cyk8L2E+IGB9PGEgY2xhc3M9XCJzaW5nbGUtbGlua1wiIGhyZWY9XCIke3JlbGF0aW9uc2hpcC5wZXJtYWxpbmt9XCI+KFZpZXcgUHJvZmlsZSk8L2E+YCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtY2FyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBkYXRhLWlkPVwiJHtyZXBvcnQuaWR9XCIgZGF0YS1wb3N0PVwiJHtyZXBvcnQucG9zdFR5cGVQbHVyYWx9XCIgc3JjPVwiJHtyZXBvcnQuZ2FsbGVyeVswXS5zZWxlY3RJbWFnZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPHA+JHtyZXBvcnQuZGVzY3JpcHRpb259PC9wPmAgOiBgPHA+JHtyZXBvcnQuZnVsbERlc2NyaXB0aW9ufTwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkeyF0aGlzLmZ1bGxEaXNwbGF5ID8gYDxidXR0b24gaWQ9XCIke3JlcG9ydC5pZH1cIiBjbGFzcz1cInNlZS1tb3JlLWxpbmtcIj5TZWUgTW9yZTogJHtyZXBvcnQuaWR9IDwvYnV0dG9uPmAgOiBgPGJ1dHRvbiBpZD1cIiR7cmVwb3J0LmlkfVwiIGNsYXNzPVwic2VlLW1vcmUtbGluayBkaXNtaXNzZWRcIj5SZWFkIG1vcmU6ICR7cmVwb3J0LmlkfSA8L2J1dHRvbj5gfSBcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvbGk+IFxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICR7Y29udGVudFNob3duLmxlbmd0aCA/IGA8L3VsPmAgIDogJyd9XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZnVsbERpc3BsYXkpe1xyXG4gICAgICAgICAgICB0aGlzLnNlZU1vcmVGdW5jdGlvbmFsaXR5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyUmVsYXRlZE5ld3MoKTsgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBtZWRpYUxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVkaWEtY2FyZCBpbWcnKSBcclxuICAgICAgICAgICAgLy8gdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJykgICBcclxuICAgICAgICAgICAgLy8gdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpXHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubWVkaWFSZWNpZXZlciwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJykpIFxyXG4gICAgICAgICAgICAvLyB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1lZGlhQ29sdW1uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNvbHVtbicpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLm5ld2xvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7IFxyXG4gICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LW1lZGlhJyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24nKTtcclxuXHJcbiAgICAgICAgLy8gbWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAvLyAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IFNoYWRvd0JveC5wcm90b3R5cGUuc2hhZG93Qm94KG1lZGlhLCB0aGlzLm1lZGlhUmVjaWV2ZXIsIHRoaXMuaHRtbCwgXHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcywgJ2dhbGxlcnknLCB0aGlzLm1lZGlhQ29sdW1uLCB0aGlzLm5ld2xvYWQsIHRoaXMuZ2FsbGVyeVBvc2l0aW9uLFxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEsIHRoaXMubWVkaWFQYWdpbmF0aW9uXHJcbiAgICAgICAgLy8gICAgICAgICApKVxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgIC8vICBtZWRpYUxpbmsuZm9yRWFjaChtZWRpYT0+e1xyXG4gICAgICAgIC8vICAgICBtZWRpYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gU2hhZG93Qm94LnByb3RvdHlwZS5zaGFkb3dCb3gobWVkaWEpKVxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKCk7XHJcblxyXG4gICAgICAgIC8vIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKFxyXG4gICAgICAgIC8vICAgICB0aGlzLm1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIGltZycpLCBcclxuICAgICAgICAvLyAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyksICAgXHJcbiAgICAgICAgLy8gICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKSxcclxuICAgICAgICAvLyAgICAgdGhpcy5tZWRpYVJlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJyksIFxyXG4gICAgICAgIC8vICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZVxyXG4gICAgICAgIC8vICk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChvcHRpb249PntcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtvcHRpb24uc3R5bGUucG9pbnRlckV2ZW50cz1cIlwiOyB9LCA1MDApO1xyXG4gICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBnYXRoZXJSZWxhdGVkTmV3cygpe1xyXG5cclxuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcExpbmtzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJlbGF0aW9uc2hpcC1saW5rJyk7XHJcblxyXG4gICAgICAgIHRoaXMucmVsYXRpb25zaGlwTGlua3MuZm9yRWFjaChsaW5rPT57XHJcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBsaW5rSWQgPSBsaW5rLmRhdGFzZXQucmVsYXRlZCBcclxuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gbGluay5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJykuaW5uZXJUZXh0XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gbGlua0lkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gYCMke2xpbmtJZH1gO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5uZXdzU2VhcmNoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSBgIyR7bGlua0lkfWA7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVkVGl0bGUgPWBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpbnNlcnRQYWdpbmF0aW9uKG5ld3NQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQpe1xyXG4gICAgICAgIC8vYWRkIG1hbnVhbCBwYWdlIGVudHJ5IGJveFxyXG4gICAgICAgIC8vQWRkIGZhaWxzYWZlIGFnYWluc3QgaXQgYmVpbmcgYSBudW1iZXIgdG9vIGJpZyBvciBzbWFsbFxyXG4gICAgICAgIC8vTWF5YmUgZG8gZHJvcGRvd24gaW5zdGVhZD8gIFxyXG4gICAgICAgIC8vTWF5YmUganVzdCBkb24ndCBkbyBhdCBhbGw/XHJcblxyXG4gICAgICAgIC8vRG8gdGhlIG51bWJlciBsaW1pdCwgdGhvdWdoLCBvbmUgd2hlcmUgaGlkZSBhbmQgcmV2ZWFsIHdoZW4gYXQgY2VydGFpbiBwb2ludHNcclxuXHJcbiAgICAgICAgLy9SZW1lbWJlciB0byBhZGQgdGhlIGxvYWRlclxyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudC1wYWdlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiXCIgY2xhc3M9XCJjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c1wiPlByZXY8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiY29udGVudC1wYWdlXCIgZGF0YS1wYWdlPVwiJHtkYXRhQ291bnQrK31cIj4gJHtwYWdlQ291bnQgKz0gMX08L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuICAgICAgICAgICAgICAgICAgICA8YSBpZD1cIlwiIGNsYXNzPVwiY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fbmV4dCAke25ld3NQYWdlcy5sZW5ndGggPiAxID8gJycgOiAnaGlkZGVuJ31cIj5OZXh0PC9hPiBcclxuICAgICAgICAgICAgICAgIDwvZGl2PiBcclxuICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXMnKTsgICAgXHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpICBcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZUhvbGRlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlcyBhJylcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eSh0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucyk7XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWVNb3JlRnVuY3Rpb25hbGl0eSgpe1xyXG4gICAgICAgIC8vYWRkIHNwaW5uZXIgdG8gdGhpcywgYXMgbmVlZHMgdG8gY29uc29sdCBiYWNrZW5kXHJcbiAgICAgICAgdGhpcy5zZWVNb3JlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNlZS1tb3JlLWxpbmsnKVxyXG4gICAgICAgIHRoaXMuc2VlTW9yZS5mb3JFYWNoKGxpbms9PntcclxuICAgICAgICAgICAgbGluay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXBvcnQgPSBsaW5rLmlkOyAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5zaW5nbGVDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYGZ1bGwgZGlzcGxheSBpcyAke3RoaXMuZnVsbERpc3BsYXl9YClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGRpc21pc3NTZWxlY3Rpb24oKXtcclxuICAgICAgICBpZih0aGlzLm5ld3NEZWxpdmVyeSAhPT0gJycpe1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5zdG9yZWRUaXRsZX1gO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5pbml0aWFsVGl0bGV9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50b2dnbGVPcHRpb25zLmZvckVhY2gobyA9PiB7by5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO30pIFxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlck9wdGlvbnMuZm9yRWFjaChmID0+IHtmLmRpc2FibGVkID0gJyd9KVxyXG4gICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMuZGlzbWlzc0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdkaXNtaXNzZWQnKTsgIFxyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENhbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgLy8gdGhpcy5zaW5nbGVDYWxsID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2PidcclxuICAgICAgICAgICAgICAgIC8vdG9vIHNsb3c/P1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwiXCI7IH0sIDEwMDApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBjb250ZW50TmV4dEFjdGl2YXRpb24oKXtcclxuICAgICAgICBsZXQgYWxsbmV4dEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fbmV4dCcpO1xyXG5cclxuICAgICAgICBhbGxuZXh0QnV0dG9ucy5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSk9PntcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLmN1cnJlbnRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYWdlLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2goLy1ncm91cC8pKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cE5hbWUgPSBuYW1lLnNsaWNlKDAsIC02KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuc2VsZWN0ZWRQYWdlYCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFBhZ2UgPSB0aGlzLmN1cnJlbnRQYWdlcyArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBuZXh0UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc31cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgfTtcclxuXHJcbiAgICBjb250ZW50TmV4dEFuZFByZXZpb3VzKCl7XHJcbiAgIFxyXG4gICAgICAgIHRoaXMuY29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbicpOyAgICAgXHJcblxyXG4gICAgICAgIGxldCBwcmV2QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzYClcclxuICAgICAgICBsZXQgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LWRpcmVjdGlvbl9uZXh0YClcclxuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWxlY3RlZFBhZ2VgKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jdXJyZW50UGFnZXMgPiAwKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50UGFnZXMpXHJcbiAgICAgICAgICAgIHByZXZCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmKCFuZXh0QnV0dG9uLnByZXZpb3VzRWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZFBhZ2UnKSl7XHJcbiAgICAgICAgICAgIG5leHRCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzIC0gMTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBwcmV2UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2PidcclxuICAgICAgICAgICAgICAgIC8vdG9vIHNsb3c/P1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXN9XCJdYCk7XHJcbiAgICAgICAgICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE5ld3MiLCIvLyBTcGl0IG91dCBBcHRzIGluIG9yZGVyIG9mIG1vc3QgcmVjZW50XHJcblxyXG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCJcclxuXHJcbmNsYXNzIFBhZ2luYXRpb24ge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnRhcmdldGVkRWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XHJcbiAgICAgICAgdGhpcy5oZWFkZXJOYXYgPSB0aGlzLmhlYWRlci5xdWVyeVNlbGVjdG9yKCduYXYnKTtcclxuICAgICAgICB0aGlzLm9wZW5CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXNlYXJjaC10cmlnZ2VyXCIpO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwb3AtdXAtZGlzcGxheS1ib3gnKTtcclxuICAgICAgICB0aGlzLmltYWdlSG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ltYWdlLWhvbGRlcicpO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNYWduaWZ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Nsb3NlTWFnbmlmeScpO1xyXG4gICAgICAgIC8vIHRoaXMub3ZlcmFsbENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNvdmVyYWxsQ29udGFpbmVyJyk7XHJcbiAgICAgICAgLy8gRm9yIG5vdywgdGhpcyB3aWxsIGJlIGhvdyBJIHByZXZlbnQgZXJyb3JzIG9uIG90aGVyIHBhZ2VzIFxyXG4gICAgICAgIHRoaXMuZnJvbnRUZXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkJykgXHJcbiAgICAgICAgdGhpcy52dyA9IE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCAwLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKVxyXG4gICAgICAgIC8vIENhbiBJIHNldHVwIHRvIGxvYWQgaW4gYW5kIFBhZ2luYXRlIGRlcGVuZGluZyBvbiBpZGVudGl0eSwgc28gYXMgdG8gbWFrZSBhZGFwdGFibGU/IFllcyEhIVxyXG5cclxuICAgICAgICAvL1dpbGwgdGFyZ2V0IGEgc2hhcmVkLCBzcGVjaWZpYyBjbGFzcyB1c2luZyBxdWVyeVNlbGVjdG9yQWxsIGFuZCB1c2UgYSBsb29wXHJcblxyXG4gICAgICAgIC8vcmVtZW1iZXIgdG8gdXNlIHRoZSBhamF4IHVybCBzZXQtdXAgdG8gbGluayB0byB0aGUgc2VhcmNoIGluZm9cclxuICAgICAgICAvL0NvbG9yIHRoZSBzZWxlY3RlZC9jdXJyZW50IHBhZ2UgYW5kIHB1dCBhIG5leHQgYW5kIHByZXYgYnV0dG9ucyB0aGF0IG9ubHkgYXBwZWFyIHdoZW4gYXBwbGljYWJsZVxyXG4gICAgICAgIC8vTWFrZSBzdXJlIHBhZ2luYXRpb24gaXMgb3V0c2lkZSBvZiBnZW5lcmF0ZWQgdGV4dD9cclxuXHJcbiAgICAgICAgLy8gY29uc2lkZXIgdXNpbmcgc29tZSBzb3J0IG9mIGxvYWRpbmcgaWNvbiBhbmQgYW5pbWF0aW9uIHdoZW4gY2xpY2tpbmcgcGFnaW5hdGlvbi4gSnVzdCBmb3IgdXNlciBzYXRpc2ZhY3Rpb24gb24gY2xpY2tcclxuICAgICAgICBcclxuICAgICAgICAvLyB0aGlzLnBhZ2luYXRlZENvbnRhaW5lcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudENvbnRhaW5lcl9wYWdpbmF0ZWQnKTtcclxuICBcclxuICAgICAgICBsZXQgcHJvcGVydGllcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcm9wZXJ0aWVzQ29udGFpbmVyIC5jb250ZW50Qm94Jyk7XHJcbiAgICAgICAgbGV0IG1lbWJlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVtYmVyc0NvbnRhaW5lciAuY29udGVudEJveCcpO1xyXG5cclxuICAgICAgICB0aGlzLnBhZ2luYXRlZENvbnRlbnQgPSBbcHJvcGVydGllcywgbWVtYmVyc107XHJcbiAgICAgICAgdGhpcy5ncm91cE5hbWU7XHJcbiAgICAgICAgLy8gTWFrZSB3b3JrIGZvciBhbGwgcGFnaW5hdGUgdGhyb3VnaCBhIGxvb3A/XHJcbiAgICAgICAgdGhpcy5wb3N0UGFnZVNlbGVjdDtcclxuICAgICAgICB0aGlzLnBvc3RQYWdlT3B0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY3VycmVudFByb3BlcnRpZXNQYWdlID0gMDtcclxuICAgICAgICBcclxuICAgICAgICAvLyBNYXliZSBwdXQgYWxsIHRoaW5ncyBpbiB0aGlzIG9iamVjdCB3aGVuIGZ1c2VcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IHtcclxuICAgICAgICAgICAgcHJvcGVydGllczogMCxcclxuICAgICAgICAgICAgbWVtYmVyczogMFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50RGlyZWN0aW9uO1xyXG5cclxuICAgICAgICB0aGlzLnBhZ2VMb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFnZS1sb2FkZXInKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAvLyB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIC8vc3Bpbm5lciBmYWxzZSBiZWZvcmUgdGhlIHByZXYgaXMgdHJ1ZVxyXG5cclxuICAgICAgICAvL0RvIHNtYWxsZXIgb25lcyBmb3IgcGFnaW5hdGUgYW5kIGZvciB0aGUgZm9ybSBzdWJtaXRzLCBhcyB3ZWxsIGFzIHNlYXJjaCBvbiB0aGUgYWxsIG5ld3MgcGFnZSBhbmQgYW55IG90aGVyIHBhZ2luYXRpb24gXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIHRoaXMuZXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnRzKCl7XHJcbiAgICAgICAgaWYodGhpcy5mcm9udFRlc3Qpe1xyXG4gICAgICAgICAgICAvLyBjb25zdCBtYWluTG9hZGVyVGV4dCA9IFtcIk9uZSBNb21lbnQgUGxlYXNlLi4uXCIsIFwiUGVyZmVjdGlvbiB0YWtlcyB0aW1lXCIsIFwiR3JvYW5pbmcgb25seSBtYWtlcyB0aGlzIHNsb3dlci4uLlwiLCBcIkknbSB3YXRjaGluZyB5b3UuLi4gOilcIlxyXG4gICAgICAgICAgICAvLyAsIFwiQ29tbWVuY2luZyBIYWNrIDspXCIsIFwiT25lIE1vbWVudC4gUmV0cmlldmluZyB5b3VyIFNTTlwiLCBcIlNoYXZpbmcgeW91ciBjYXQuLi5cIiwgXCJZb3UgbGlrZSBTY2FyeSBNb3ZpZXMuLi4/ID46KVwiXTtcclxuICAgIFxyXG4gICAgICAgICAgICAvLyBjb25zdCByYW5kb20gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtYWluTG9hZGVyVGV4dC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAvLyBjb25zdCByZXN1bHQgPSBtYWluTG9hZGVyVGV4dFtyYW5kb21dO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnBhZ2VMb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGFnZS1sb2FkZXInKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMucGFnZUxvYWRlci5zZXRBdHRyaWJ1dGUoJ2RhdGEtY3VydGFpbi10ZXh0JywgYCR7cmVzdWx0fWApXHJcbiAgICBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtbG9hZGVyJyk7XHJcblxyXG4gICAgICAgICAgICAgdGhpcy5wYWdpbmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIGNvbnRlbnRJbnRlcmZhY2UoKXtcclxuICAgICAgICAvL0kgdGhpbmsgdGhhdCBJIG5lZWQgdG8gZGVsYXkgY2xpY2thYmlsaXR5IGZvciB0b3VjaCwgb3RoZXJ3aXNlIGNhbiBjbGljayB3aGVuIGJyaW5naW5nIHVwXHJcbiAgICAgICAgLy9BbHNvLCBwZXJoYXBzIEkgbmVlZCB0byBhZGQgYSBzeW1ib2wgdG8gaW5kaWNhdGUgdGhhdCB5b3UgY2FuIGJyaW5nIHVwIG9wdGlvbnMgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5U3F1YXJlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kaXNwbGF5U3F1YXJlcycpO1xyXG4gIFxyXG4gICAgICAgIHRoaXMuZGlzcGxheUltYWdlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kaXNwbGF5SW1hZ2VzJyk7XHJcbiAgICAgICAgdGhpcy5tYWduaWZ5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmZhLXNlYXJjaC1wbHVzJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlzcGxheVNxdWFyZXMuZm9yRWFjaChkaXNwbGF5U3F1YXJlID0+IHtcclxuICAgICAgICAgIGxldCBsaW5rID0gZGlzcGxheVNxdWFyZS5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJyk7XHJcbiAgICAgICAgICBsZXQgaW1hZ2UgPSBkaXNwbGF5U3F1YXJlLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5SW1hZ2VzJyk7XHJcbiAgICAgICAgICBsZXQgbWFnbmlmeUJ1dHRvbiA9IGRpc3BsYXlTcXVhcmUucXVlcnlTZWxlY3RvcignLmZhLXNlYXJjaC1wbHVzJylcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgZGlzcGxheVNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBlID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgbGluay5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NfX3Zpc2libGUnKTtcclxuICAgICAgICAgICAgICBpbWFnZS5jbGFzc0xpc3QuYWRkKCdwYWdlTGlua3NfX3Zpc2libGUnKTtcclxuICAgICAgICAgICAgICBsaW5rLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgaWYobWFnbmlmeUJ1dHRvbil7XHJcbiAgICAgICAgICAgICAgICBtYWduaWZ5QnV0dG9uLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XHJcbiAgICAgICAgICAgICAgICBsaW5rLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnJztcclxuICAgICAgICAgICAgICAgIGlmKG1hZ25pZnlCdXR0b24pe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hZ25pZnlCdXR0b24uc3R5bGUucG9pbnRlckV2ZW50cyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0sIDMwMCkgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICBkaXNwbGF5U3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGUgPT4ge1xyXG5cclxuICAgICAgICAgICAgICBsaW5rLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGltYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ3BhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgICAgXHJcbiAgICAgIHRoaXMubWFnbmlmeUJ1dHRvbi5mb3JFYWNoKGIgPT57IFxyXG4gICAgICAgICAgYi5vbmNsaWNrID0gZT0+e1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlID0gZS50YXJnZXQuY2xvc2VzdCgnLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcycpLnByZXZpb3VzRWxlbWVudFNpYmxpbmcuY2xvbmVOb2RlKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGltYWdlKVxyXG4gICAgICAgICAgICAvL1BlcmhhcHMgY2Fycnkgb3ZlciBhc3NvY2lhdGVkIG5ld3MsIGFzIHdlbGxcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcyBpcyBub3QgbmVjZXNzYXJ5IGFzIG9uZSBkaXJlY3RseSBiZWxvdyBkb2VzIGl0IGJ5IGFjY2Vzc2luZyB0aGUgcGFyZW50IGFuZCBxdWVyeSBzZWxlY3RpbmcsIGJ1dCBrZWVwaW5nIHRoaXMgYXMgY291bGQgYmUgdXNlZnVsIHRvIGhhdmUgb24gaGFuZFxyXG4gICAgICAgICAgICB0aGlzLmZpbmRTcGVjaWZpZWRQcmV2aW91cyhlLnRhcmdldCwgJ21vcmUtaW5mby1saW5rJyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMudGFyZ2V0ZWRFbGVtZW50ID0gZS50YXJnZXQuY2xvc2VzdCgnLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcycpLnF1ZXJ5U2VsZWN0b3IoJy5tb3JlLWluZm8tbGluaycpLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94Lmluc2VydEJlZm9yZSh0aGlzLnRhcmdldGVkRWxlbWVudCwgdGhpcy5jbG9zZU1hZ25pZnkpO1xyXG4gICAgICAgXHJcbiAgICAgICAgICAgIC8vIHRoaXMuZGlzcGxheUJveC5wcmVwZW5kKGltYWdlKTtcclxuICAgICAgICAgICAgdGhpcy5pbWFnZUhvbGRlci5wcmVwZW5kKGltYWdlKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheUJveC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgICAgICAgICB0aGlzLm9wZW5CdXR0b24uZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgICAgICBlLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LmFkZCgnZnJlZXplJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgIHRoaXMuY2xvc2VNYWduaWZ5Lm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIHRoaXMuaW1hZ2VIb2xkZXIucXVlcnlTZWxlY3RvcignaW1nJykucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnF1ZXJ5U2VsZWN0b3IoJy5tb3JlLWluZm8tbGluaycpLnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheUJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbi5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QucmVtb3ZlKCdmcmVlemUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy9jaGFuZ2UgdG8gYmUgZnByIGVpdGhlciBkaXJlY3Rpb25hbCB0byBnZXQgbGV0LCB3aXRoIGlmIHN0YXRlbWVudHNcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wb3AtdXAtZGlyZWN0aW9uYWwnKS5mb3JFYWNoKGJ1dHRvbj0+e1xyXG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAvL01ha2UgbmV4dCBhbmQgcHJldiB1bmNsaWNrYWJsZSBpZiBub3RoaW5nIHRoZXJlIHRvIGdvIHRvXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50SW1hZ2UgPSB0aGlzLmRpc3BsYXlCb3gucXVlcnlTZWxlY3RvcignaW1nJyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0TmFtZSA9IGN1cnJlbnRJbWFnZS5kYXRhc2V0Lm5hbWU7XHJcblxyXG4gICAgICAgICAgICBsZXQgdHlwZSA9IGJ1dHRvbi5pZDtcclxuICAgICAgICAgICAgbGV0IG5ld0ltYWdlQ29udGFpbmVyO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0eXBlKVxyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlTcXVhcmVzLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICAgICAgaWYoZS5xdWVyeVNlbGVjdG9yKGAuZGlzcGxheUltYWdlc1tkYXRhLW5hbWU9JHt0YXJnZXROYW1lfV1gKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodHlwZSA9PT0gJ25leHQtaW1hZ2UnKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SW1hZ2VDb250YWluZXIgPSBlLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5SW1hZ2VzJykuY2xvc2VzdCgnLm92ZXJhbGwtc3F1YXJlcycpLm5leHRFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SW1hZ2VDb250YWluZXIgPSBlLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5SW1hZ2VzJykuY2xvc2VzdCgnLm92ZXJhbGwtc3F1YXJlcycpLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5ld0ltYWdlQ29udGFpbmVyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0ltYWdlID0gbmV3SW1hZ2VDb250YWluZXIucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9uZU5vZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0xpbmsgPSBuZXdJbWFnZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIC5tb3JlLWluZm8tbGluaycpLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUhvbGRlci5xdWVyeVNlbGVjdG9yKCdpbWcnKS5yZXBsYWNlV2l0aChuZXdJbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheUJveC5xdWVyeVNlbGVjdG9yKCcubW9yZS1pbmZvLWxpbmsnKS5yZXBsYWNlV2l0aChuZXdMaW5rKTtcclxuICAgICAgICAgICAgICAgICAgICB9ICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICAgIFxyXG4gICAgZmluZFNwZWNpZmllZFByZXZpb3VzKHNvdXJjZSwgaWRlbnRpZmllcil7XHJcbiAgICAgICAgLy8gdGhpcyB3aWxsIG5lZWQgdG8gYmUgdHdlYWtlZCBoYW5kbGUgbm9uLW5lc3RlZCwgYXMgd2VsbCBhcyBvdGhlciBuZWVkc1xyXG4gICAgICAgIGxldCBsaW5rID0gc291cmNlLnBhcmVudEVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICB3aGlsZSAobGluaykge1xyXG4gICAgICAgICAgICBpZiAobGluay5jbGFzc05hbWUuaW5jbHVkZXMoaWRlbnRpZmllcikpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXRlZEVsZW1lbnQgPSBsaW5rLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMudGFyZ2V0ZWRFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxpbmsgPSBsaW5rLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcGFnaW5hdGUoKXtcclxuICAgICAgICAvL2NyZWF0ZSBuZXcgc2VhcmNoIHNldC11cCBmb3IganVzdCB0aGUgbWVtYmVyIHByb3AgcGFnaW5hdGlvbj8gTGlrZSwgZ28gbWFrZSBuZXcgaW5jIHBhZ2VcclxuICAgICAgICAvL1VzZSBwb3N0LXR5cGUgJ2lmJyB0aGF0IGNoZWNrcyBmb3IgdGhlIGlkPyBBY3R1YWxseSwgSSBjYW4gdXNlIHRoZSByZXN1dHMgYXJyYXkgYXMgY2FuIHBsdXJhbGl6ZVxyXG5cclxuICAgICAgICAvL3N0YXJ0IGJ5IGluc2VydGluZyByYW5kb20gc2hpdCBpbiBib3RoP1xyXG4gICAgICAgIC8vc2V0LXVwIHRoaXMgdXAgdG8gbm90IHJlcGxhY2UgY29udGVudCwgaWYgamF2YXNjcmlwdCB0dXJuZWQgb2ZmLCBhbG9uZyB3aXRoIGluc2VydGluZyBhIGJ1dHRvbiB0byBzZWUgYWxsXHJcbiAgICAgICAgLy9hbmQgbWFrZSB0aGF0IHNlZSBhbGwgcGFnZVxyXG4gICAgICAgIC8vSSB0aGluayBJJ2xsIG1ha2UgdGhlIHNlZSBhbGwgYnV0dG9uLCBidXQgcmVwbGFjZSBpdCdzIGNvbnRlbnRzIHRocm91Z2ggaGVyZSwgc28gaWYgdGhpcyBkb2Vzbid0IHJ1biwgaXQnbGwgYmUgdGhlcmVcclxuICAgICAgICAvL2Rpc2FibGUgc2NyaXB0IGluIGJyb3dzZXIgdG8gY2hlY2svd29yayBvbiBzdHVmZlxyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgLy9JcyBpdCBiZXR0ZXIganVzdCB0byB1c2Ugc2VwZXJhdGUgdXJsIHJvdXRlcz8gXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9jb250ZW50P3BhZ2UnKTsgXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuICAgICAgICAgICAgLy8gbGV0IGN1cnJlbnRNZW1iZXJzU2hvd24gPSB0aGlzLmN1cnJlbnRQYWdlcy5tZW1iZXJzO1xyXG4gICAgICAgICAgICAvLyBsZXQgY3VycmVudFByb3BlcnRpZXNTaG93biA9IHRoaXMuY3VycmVudFBhZ2VzLnByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YUNvdW50ID0gMDtcclxuICAgICAgICAgICAgbGV0IHBvc3RPdXRwdXQ7XHJcbiAgICAgICAgICAgIC8vIHdpbmRvdy5hbGVydCgnb24gdGFibGV0IScpXHJcbiAgICAgICAgICAgIC8vQ29uc2lkZXIgbG9jYWxpemVkIHJlbG9hZCBvbiBwYWdlIHJlc2l6ZVxyXG4gICAgICAgICAgICBpZih3aW5kb3cuaW5uZXJXaWR0aCA+PSAxMjAwKXtcclxuICAgICAgICAgICAgICAgIHBvc3RPdXRwdXQgPSA4O1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHBvc3RPdXRwdXQgPSA2O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBwYWdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgbGV0IHBvc3RQYWdlcyA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0c0tleXMgPSBPYmplY3Qua2V5cyhyZXN1bHRzKTtcclxuICAgICAgICAgICAgbGV0IG5hbWU7XHJcbiAgICAgICAgICAgIGxldCBwb3N0O1xyXG4gICAgICAgICAgICBsZXQgY29udGVudFNob3duO1xyXG4gICAgICAgICAgICBsZXQgcGFnaW5hdGlvbkxvY2F0aW9uO1xyXG4gXHJcbiAgICAgICAgICAgIC8vVXNlIGEgZm9yIGxvb3AgaGVyZT8gZm9yIHJlc3VsdCBvZiByZXN1bHRzP1xyXG4gICAgICAgICAgICAvLyBtYWtlIHRoaXMgaW50byBhbiBhcnJheSBhbmQgcHV0IGluIGlmIGEgbG9vcD9cclxuXHJcbiAgICAgICAgICAgIGxldCBjb250YWluZXJUeXBlID0gdGhpcy5wYWdpbmF0ZWRDb250ZW50O1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lclR5cGVMb2NhdGlvbiA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZighdGhpcy5jb250ZW50TG9hZGVkKXtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgdHlwZSBvZiByZXN1bHRzS2V5cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zdCA9IHJlc3VsdHNbbmFtZV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5sZW5ndGggPD0gcG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IHBvc3RQYWdlcy5jb25jYXQocG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAocG9zdC5sZW5ndGggPiBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZW0gPSAxOyBpdGVtIDw9IHBvc3RPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZW1vdmVkID0gcG9zdC5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IHBvc3RQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwb3N0UGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCBuZWVkIHRvIG1hZGUgbW9yZSB2ZXJzYXRpbGUgaWYgZGVjaWRlIHRvIHVuaXZlcnNhbGl6ZSBwYWdpbmF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9zdFBhZ2VzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBwb3N0UGFnZXNbdGhpcy5jdXJyZW50UGFnZXNbdHlwZV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBvc3RQYWdlc1swXSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlTmFtZSA9IHR5cGU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJUeXBlW2NvbnRhaW5lclR5cGVMb2NhdGlvbl0uY2xhc3NMaXN0LmFkZCh0eXBlKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRDb250ZW50KGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXSwgY29udGVudFNob3duLCBwYWdlTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uTG9jYXRpb24gPSBjb250YWluZXJUeXBlW2NvbnRhaW5lclR5cGVMb2NhdGlvbl0ucHJldmlvdXNFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcudGV4dEJveCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0UGFnaW5hdGlvbihwYWdpbmF0aW9uTG9jYXRpb24sIHBvc3RQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQsIHBhZ2VOYW1lKSAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJUeXBlTG9jYXRpb24rPSAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBwb3N0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcyA9IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBY3RpdmF0aW9uKCk7IFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vdGVtcCB1bnRpbCBjaGFuZ2Ugc2V0LXVwIHRvIG1ha2Ugc2VjdGlvbiBsb2FkZXIgd29ya1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlTG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpXHJcbiAgICAgICAgICAgICAgICBwb3N0ID0gcmVzdWx0c1t0aGlzLmdyb3VwTmFtZV1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCA8PSBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IHBvc3RQYWdlcy5jb25jYXQocG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocG9zdC5sZW5ndGggPiBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpdGVtID0gMTsgaXRlbSA8PSBwb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlID0gcG9zdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250ZW50U2hvd24gPSBwb3N0UGFnZXNbdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdXTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50Qm94LiR7dGhpcy5ncm91cE5hbWV9YClcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluc2VydENvbnRlbnQodGFyZ2V0LCBjb250ZW50U2hvd24sIHRoaXMuZ3JvdXBOYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QW5kUHJldmlvdXMoKTsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QWN0aXZhdGlvbigpOyBcclxuXHJcbiAgICAgICAgICAgICAgICAvL2NoYW5nZSB0byBhZGRpbmcgZmFkZS1jbGFzcywgYmVmb3JlIHJlbW92aW5nIGFjdGl2ZSwgc28gZ29lcyBhd2F5IHNtb290aGVyXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT50aGlzLnBhZ2VMb2FkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyksIDgxMCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PnRoaXMucGFnZUxvYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSwgODEwKTsgXHJcbiAgICAgXHJcbiAgICAgICAgICAgIC8vQ2FuIEkgbG9vcCB0aHJvdWdoIHRoZSBkaWZmIHJlc3VsdHMsIHVzaW5nIHZhcmlhYmxlKHMpIGJlZm9yZSB0aGUgaW5uZXJIdG1sIGFuZCB0aGUgbWFwLCBhcyB3ZWxsIGFzIHRoZSBwYWdlIGNvbnRhaW5lcj9cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEhvdyB0byBnZXQgcG9zdCBuYW1lLCB0aG91Z2g/IENhbiBJIGFwcGx5IGEgZm9yZWFjaCB0byB0aGVtIGFuZCBncmFiIHRoZSBwb3N0IHR5cGU/IENvdWxkIEkgaW5jbHVkZSBpbiByZXN0IHJvdXRlXHJcblxyXG4gICAgICAgICAgICAvL0hhdmUgbG9naWMgdGhhdCBvbmx5IGhhcyB0aGUgcHJvY2VzcyBmb3IgdGhlIHNlbGVjdGVkIHNlY3Rpb24gcnVuIGFnYWluLCBwZXJoYXBzIHZpYSBhIHZhcmlhYmxlIGluIHRoZSBjYWxsIGJlbG93LiBcclxuICAgICAgICAgICAgLy9pZS4gdGhpcy5wYWdpbmF0ZSgnbWVtYmVycycpXHJcbiAgICAgICAgICAgIC8vTWF5YmUgdGhlIHBhZ2luYXRpb24gY291bGQgYmUgc3BsaXQgdXAsIHdpdGggdGhlIGh0bWwgaW5zZXJ0aW9uIGJlaW5nIGEgc2VwZXJhdGVseSBjYWxsZWQgZnVuY3Rpb24gdGhhdCBpcyByZXBlYXRlZFxyXG4gICAgICAgICAgICAvL3Rocm91Z2ggYSBsb29wcyBjb25zaXN0aW5nIG9mIHZhcmlhYmxlcyBoZXJlLCBhbmQgY291bGQgc2ltcGx5IGJlIGNhbGxlZCBhZ2FpbiB3aXRoIGEgc3BlY2lmaWMgdmFyaWFibGUgIFxyXG4gICAgICAgICAgICAvL09yIHNpbXBseSBqdXN0IHNlcGVyYXRlIHRoaXMgYWxsIFxyXG5cclxuICAgICAgICAgICAgLy9zaW1wbHkgZGlzcGxheSBkaWZmZXJlbnQgdGhpbmdzLCBuZWVkIHR3byBkaWZmIGh0bWwgYmxvY2tzLCBidXQgZWFjaCBjYW4gY2FsbGVkIHVwb24gc2VwZXJhdGVseSwgYXMgZGlmZmVyZW50IGlubmVySHRtbCBibG9ja3NcclxuXHJcbiAgICAgICAgICAgIC8vQnV0IHRoZW4gYWdhaW4sIGEgdW5pZm9ybWVkIGRpc3BsYXllZCBjb3VsZCBiZSBhY2hpZXZlZCB3aXRoIHRlcm5hcnkgb3BlcmF0b3JzLCBjaGVja2luZyBmb3IgdGl0bGVfb3JfcG9zaXRpb25cclxuICAgICAgICAgICAgLy9BbmQgY2hlY2tpbmcgZm9yIHNvbWV0aGluZyB0aGF0IGNvdWxkIHJ1bGUgb3V0IHRoZSBtYWduaWZ5aW5nIGJ1dHRvbiBhbmQgdGhlIGxvY2F0aW9uIGxpbmtcclxuXHJcbiAgICAgICAgICAgIC8vQ2FuIEkgbW92ZSB0aGlzIEFuZCBqdXN0IGxvb3AgY2FsbCB0aGlzP1xyXG5cclxuICAgICAgICAgICAgLy9NYWtlIHdvcmsgYWdhaW4uIEFuZCB2ZXJzYXRpbGVcclxuICAgICAgICAgICAgLy9EbyBJIG5lZWQgdGhpcyBhbnltb3JlLCB0aG91Z2g/XHJcblxyXG4gICAgICAgICAgICAvLyBsZXQgYWN0aXZlUGFnaW5hdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBhZ2U9JyR7Y3VycmVudE1lbWJlcnNTaG93bn0nXWApO1xyXG4gICAgICAgICAgICAvLyBhY3RpdmVQYWdpbmF0aW9uLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfWNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuY29udGVudEludGVyZmFjZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGluc2VydENvbnRlbnQoZGVzdGluYXRpb24sIHR5cGUsIHBhZ2VOYW1lKXtcclxuICAgICAgICAgICAgLy9DaGFuZ2UgZGVzaXRpbmF0aW9uIHNldC11cCB0byBhY2NvbWFkYXRlIGxvYWRlclxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwYWdlTmFtZSlcclxuICAgICAgICAgICAgLy9yZXBsYWNlIHdvcmQgaW50ZXJhY3Rpb24gcHJvbXB0cywgd2l0aCBjdXN0b20sIGRyYXduIHN5bWJvbHNcclxuICAgICAgICAgICAgZGVzdGluYXRpb24uaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgJHt0eXBlLm1hcChpdGVtID0+IGBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvdmVyYWxsLXNxdWFyZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheVNxdWFyZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbnRlcmFjdGlvbi1wcm9tcHRcIj48c3BhbiBjbGFzcz1cImNsaWNrLXByb21wdFwiPlRvdWNoPC9zcGFuPjxzcGFuIGNsYXNzPVwiaG92ZXItcHJvbXB0XCI+SG92ZXI8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMudncgPj0gMTIwMCA/IGA8aW1nIGNsYXNzPVwiZGlzcGxheUltYWdlc1wiIGRhdGEtbmFtZT1cIiR7aXRlbS50aXRsZS5yZXBsYWNlQWxsKCcgJywgJycpfVwiIHNyYz1cIiR7aXRlbS5pc0NvbXBsZXRlZCB8fCBpdGVtLnBvc3RUeXBlID09PSAnbWVtYmVyJyA/IGl0ZW0uaW1hZ2UgOiBpdGVtLnByb2plY3RlZEltYWdlfVwiIGFsdD1cIiR7aXRlbS50aXRsZX1cIj5gOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLnZ3IDwgMTIwMCA/IGA8aW1nIGNsYXNzPVwiZGlzcGxheUltYWdlc1wiIGRhdGEtbmFtZT1cIiR7aXRlbS50aXRsZS5yZXBsYWNlQWxsKCcgJywgJycpfVwiIHNyYz1cIiR7aXRlbS5pc0NvbXBsZXRlZCB8fCBpdGVtLnBvc3RUeXBlID09PSAnbWVtYmVyJyA/IGl0ZW0uaW1hZ2VNZWRpdW0gOiBpdGVtLnByb2plY3RlZEltYWdlTWVkaXVtfVwiIGFsdD1cIiR7aXRlbS50aXRsZX1cIj5gOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJtb3JlLWluZm8tbGlua1wiIGhyZWY9XCIke2l0ZW0ucGVybWFsaW5rfVwiPkZpbmQgT3V0IE1vcmU8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtzaXRlRGF0YS5yb290X3VybH0vYWxsLW5ld3MvIyR7aXRlbS5pZH0tcmVsYXRlZC0ke2l0ZW0ucG9zdFR5cGVQbHVyYWx9XCI+QXNzb2NpYXRlZCBOZXdzPzwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cGFnZU5hbWUgPT09ICdwcm9wZXJ0aWVzJyA/ICc8YnV0dG9uPjxpIGNsYXNzPVwiZmFzIGZhLXNlYXJjaC1wbHVzXCI+PC9pPjwvYnV0dG9uPic6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheS10ZXh0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5wb3NpdGlvbk9yUm9sZSAhPT0gdW5kZWZpbmVkID8gYDxwPiR7aXRlbS5wb3NpdGlvbk9yUm9sZX08L3A+YCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiBcclxuICAgICAgICAgICAgICAgIDwvZGl2PiAgIFxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIGluc2VydFBhZ2luYXRpb24oZGVzdGluYXRpb24sIHBvc3RQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQsIHBhZ2VOYW1lKXtcclxuICAgICAgICAvL1B1dCBpbiAnbmV4dCcgYW5kICdwcmV2JyBidXR0b25zXHJcbiAgICAgICAgLy9NYWtlIG51bWJlcnMgTGFyZ2UgYW5kIGNlbnRlcmVkLCBhbmQgcGVyaGFwcyBwdXQgYSBib3ggYXJvdW5kIHRoZW0sIGFsb25nIHdpdGggZmFuY3kgc3R5bGluZyBhbGwgYXJvdW5kXHJcbiAgICAgICAgZGVzdGluYXRpb24uaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgIFwiYmVmb3JlZW5kXCIsXHJcbiAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID8gJzxkaXYgY2xhc3M9XCJjb250ZW50LXBhZ2VzXCI+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID4gMSAgPyBgPGEgaWQ9XCIke3BhZ2VOYW1lfS1wcmV2XCIgY2xhc3M9XCIke3BhZ2VOYW1lfS1ncm91cCAke3BhZ2VOYW1lfS1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXNcIj5QcmV2PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgJHtwb3N0UGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID4gMSA/IGA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZSAke3BhZ2VOYW1lfS1ncm91cFwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuICAgICAgICAgICAgICAgICR7cG9zdFBhZ2VzLmxlbmd0aCA+IDEgPyBgPGEgaWQ9XCIke3BhZ2VOYW1lfS1uZXh0XCIgY2xhc3M9XCIke3BhZ2VOYW1lfS1ncm91cCAke3BhZ2VOYW1lfS1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fbmV4dFwiPk5leHQ8L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPyAnPC9kaXY+JyA6ICcnfSBcclxuXHJcbiAgICAgICAgYCk7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXMnKTsgICAgXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSAgXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXh0Q29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7IFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24uZm9yRWFjaChlbD0+ZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJykpXHJcblxyXG4gICAgICAgIGxldCBjb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlJyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoY29udGVudFBhZ2VPcHRpb25zKTtcclxuICAgIH1cclxuLy8gdGhpcyBuZXcgc2V0dXAgY2F1c2VzIGlzc3VlcyBhZnRlciBkaXJlY3Rpb25hbCBidXR0b25zIHVzZWQ6IHNlbGVjdGVkUGFnZSBcclxuLy9ub3QgYmVpbmcgYWRkZWQgdG8gY2xpY2tlZCBhbmQgY3VycmVudFBhZ2Ugb24gZGlyZWN0aW9uYWwgZ2V0cyBlcnJvclxyXG4vL0xhdHRlciBsaWtlbHkgY29ubmVjdGVkIHRvIHRoZSBmb3JtZXJcclxuXHJcbiAgICBwYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShjb250ZW50UGFnZU9wdGlvbnMpe1xyXG4gICAgICAgIC8vQ29tYmluZSB0aGUgdHdvIGJlbG93XHJcbiAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLmN1cnJlbnRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYWdlLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2goLy1ncm91cC8pKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cE5hbWUgPSBuYW1lLnNsaWNlKDAsIC02KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA9IHBhcnNlSW50KHNlbGVjdGVkUGFnZS5kYXRhc2V0LnBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXHJcbiAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCh0aGlzLmdyb3VwTmFtZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAvLyAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PntcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIC8vICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coaSlcclxuICAgICAgICAvLyAgICAgICAgICAgICBpLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKHRoaXMuZ3JvdXBOYW1lKSl7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgfSlcclxuICAgICAgICAvLyAgICAgICAgIH0pICBcclxuICAgICAgICAvLyAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgIC8vICAgICB9LCB7IG9uY2U6IHRydWUgfSk7XHJcbiAgICAgICAgLy8gfSlcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIGNvbnRlbnROZXh0QWN0aXZhdGlvbigpe1xyXG4gICAgICAgIGxldCBhbGxuZXh0QnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7XHJcblxyXG4gICAgICAgIGFsbG5leHRCdXR0b25zLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhZ2UuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCgvLWdyb3VwLykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTmFtZSA9IG5hbWUuc2xpY2UoMCwgLTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cC5zZWxlY3RlZFBhZ2VgKTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBuZXh0UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdID0gbmV4dFBhZ2U7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe2VsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgOTIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cFtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXX1cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBcclxuICAgIH07XHJcblxyXG4gICAgY29udGVudE5leHRBbmRQcmV2aW91cygpe1xyXG4gICBcclxuICAgICAgICB0aGlzLmNvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb24nKTsgICAgIFxyXG5cclxuICAgICAgICBsZXQgcHJldkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RoaXMuZ3JvdXBOYW1lfS1wcmV2YClcclxuICAgICAgICBsZXQgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RoaXMuZ3JvdXBOYW1lfS1uZXh0YClcclxuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cC5zZWxlY3RlZFBhZ2VgKTtcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBpZih0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gPiAwKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFBhZ2VzKVxyXG4gICAgICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHByZXZCdXR0b24uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMubmV4dENvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBpZighbmV4dEJ1dHRvbi5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC5jb250YWlucygnc2VsZWN0ZWRQYWdlJykpe1xyXG4gICAgICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIG5leHRCdXR0b24uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgZWwub25jbGljayA9ICAoaSkgPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJldlBhZ2UgPSB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gLSAxO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gPSBwcmV2UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwiXCI7IH0sIDkyMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0ZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmdyb3VwTmFtZX0tZ3JvdXBbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV19XCJdYCk7XHJcbiAgICAgICAgICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vZml4IHJlcGVhdCBvZiBuZXh0QnV0dG9uIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICAvLyB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAvLyAgICAgZWwub25jbGljayA9ICAoaSkgPT57XHJcbiAgICAgICAgLy8gICAgICAgICBsZXQgbmV4dFBhZ2UgPSB0aGlzLmN1cnJlbnRQYWdlc1twYWdlTmFtZV0gKyAxO1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzW3BhZ2VOYW1lXSA9IG5leHRQYWdlO1xyXG4gICAgICAgIC8vICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuXHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnBhZ2luYXRlKClcclxuXHJcbiAgICAgICAgLy8gICAgICAgICBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7cGFnZU5hbWV9LWdyb3VwW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXNbcGFnZU5hbWVdfVwiXWApO1xyXG4gICAgICAgIC8vICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKG5ld0N1cnJlbnQpXHJcbiAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAvLyB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYWdpbmF0aW9uIiwiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiXHJcblxyXG5jbGFzcyBTZWFyY2gge1xyXG4gICAgLy8gMS4gZGVzY3JpYmUgYW5kIGNyZWF0ZS9pbml0aWF0ZSBvdXIgb2JqZWN0XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMuYWRkU2VhcmNoSHRtbCgpO1xyXG4gICAgICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcclxuICAgICAgICB0aGlzLmhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZWFyY2gtb3ZlcmxheV9fcmVzdWx0c1wiKTtcclxuICAgICAgICAvL0lmIG9wZW4gZGlmIG9wZW4gYnV0dG9uIGZvciBtb2JpbGUgdnMgZGVza3RvcFxyXG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtc2VhcmNoLXRyaWdnZXJcIik7XHJcbiAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2VhcmNoLW92ZXJsYXlfX2Nsb3NlXCIpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoT3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2VhcmNoLW92ZXJsYXlcIik7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaC10ZXJtJyk7XHJcbiAgICAgICAgdGhpcy5pc092ZXJsYXlPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlO1xyXG4gICAgICAgIHRoaXMudHlwaW5nVGltZXI7XHJcbi8vR2V0IHJpZCBvZiB0aGlzIGFuZCB0aGUgcGFnaW5hdGlvbiBsb2dpYywgcmVzZXRpbmcgdGhlIG5ld3MgcmVuZGVyaW5nXHJcbiAgICAgICAgdGhpcy5uZXdzUGFnZVNlbGVjdDtcclxuICAgICAgICB0aGlzLm5ld3NQYWdlT3B0aW9uO1xyXG4gICAgICAgIHRoaXMuY3VycmVudE5ld3NQYWdlID0gMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDIuIGV2ZW50c1xyXG4gICAgZXZlbnRzKCkge1xyXG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbi5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5PdmVybGF5KClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gXHJcbiAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZU92ZXJsYXkoKSlcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHRoaXMua2V5UHJlc3NEaXNwYXRjaGVyKGUpKVxyXG4gICAgICAgIHRoaXMuc2VhcmNoVGVybS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgKCkgPT4gdGhpcy50eXBpbmdMb2dpYygpKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIDMuIG1ldGhvZHMgKGZ1bmN0aW9uLCBhY3Rpb24uLi4pXHJcbiAgICB0eXBpbmdMb2dpYygpIHtcclxuICAgICAgICBpZih0aGlzLnNlYXJjaFRlcm0udmFsdWUgIT09IHRoaXMucHJldmlvdXNWYWx1ZSl7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnR5cGluZ1RpbWVyKTtcclxuICAgICAgICAgICAgaWYodGhpcy5zZWFyY2hUZXJtLnZhbHVlKXtcclxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmlzU3Bpbm5lclZpc2libGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0c0Rpdi5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy50eXBpbmdUaW1lciA9IHNldFRpbWVvdXQodGhpcy5nZXRSZXN1bHRzLmJpbmQodGhpcyksIDgwMCk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzRGl2LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5zZWFyY2hUZXJtLnZhbHVlO1xyXG4gICAgfVxyXG4vL0FkZCBjb2xvcmluZyB0byB0ZXh0IHRoYXQgbWF0Y2hlcyBzZWFyY2ggcXVlcnkgYW5mZCBtYXliZSBkb24ndCBzaG93IHRpdGxlIGF0IGFsbCBpZiBubyBjb250ZW50KD8pXHJcbiAgICBhc3luYyBnZXRSZXN1bHRzKCl7XHJcbiAgICAgIHRyeXtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvc2VhcmNoP3Rlcm09JyArIHRoaXMuc2VhcmNoVGVybS52YWx1ZSk7IFxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLmN1cnJlbnROZXdzUGFnZTtcclxuICAgICAgICBsZXQgeSA9IDA7XHJcbiAgICAgICAgbGV0IGl0ZW07XHJcbiAgICAgICAgY29uc3QgcG9zdE91dHB1dCA9IDM7XHJcbiAgICAgICAgY29uc3QgbmV3cyA9IHJlc3VsdHMudXBkYXRlc0FuZE5ld3M7XHJcbiAgICAgICAgbGV0IG5ld3NQYWdlID0gW107XHJcbiAgICAgICAgbGV0IG5ld3NQYWdlcyA9IFtdO1xyXG4gICAgICAgIGxldCBuZXdzU2hvd247XHJcbiAgICAgICAgbGV0IHBhZ2VMaXN0TnVtYmVyID0gMDtcclxuICAgICAgICBpZihuZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIGlmKG5ld3MubGVuZ3RoIDw9IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZXMuY29uY2F0KG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKG5ld3MubGVuZ3RoID4gcG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBmb3IoaXRlbSA9IDE7IGl0ZW0gPD0gcG9zdE91dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBuZXdzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gbmV3c1BhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICBpZihuZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UgPSBuZXdzLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChuZXdzUGFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYobmV3c1BhZ2VzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIG5ld3NTaG93biA9IG5ld3NQYWdlc1t4XTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgbmV3c1Nob3duID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlc3VsdHNEaXYuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25lLXRoaXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGVcIj5Qcm9wZXJ0aWVzPC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMucHJvcGVydGllcy5sZW5ndGggPyAnPHVsIGNsYXNzPVwibGluay1saXN0IG1pbi1saXN0XCI+JyA6IGA8cD5ObyBwcm9wZXJ0aWVzIG1hdGNoIHRoYXQgc2VhcmNoLjwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMucHJvcGVydGllcy5tYXAoaXRlbSA9PiBgPGxpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheVNxdWFyZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJkaXNwbGF5SW1hZ2VzXCIgZGF0YS1uYW1lPVwiJHtpdGVtLnRpdGxlLnJlcGxhY2VBbGwoJyAnLCAnJyl9XCIgc3JjPVwiJHtpdGVtLmlzQ29tcGxldGVkID8gaXRlbS5pbWFnZSA6IGl0ZW0ucHJvamVjdGVkSW1hZ2V9XCIgYWx0PVwiJHtpdGVtLnRpdGxlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7aXRlbS5wZXJtYWxpbmt9XCI+JHtpdGVtLnRpdGxlfTwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPmApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5wcm9wZXJ0aWVzLmxlbmd0aCA/ICc8L3VsPicgOiAnJ31cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uZS10aGlyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X19zZWN0aW9uLXRpdGxlXCI+TWVtYmVyczwvaDI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLm1lbWJlcnMubGVuZ3RoID8gJzx1bCBjbGFzcz1cImxpbmstbGlzdCBtaW4tbGlzdFwiPicgOiBgPHA+Tm8gbWVtYmVycyBtYXRjaCB0aGF0IHNlYXJjaC48L3A+YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLm1lbWJlcnMubWFwKGl0ZW0gPT4gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9JHtpdGVtLmltYWdlfVwiIGFsdD1cIlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2l0ZW0udGl0bGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS5wb3NpdGlvbk9yUm9sZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7aXRlbS5wZXJtYWxpbmt9XCI+UmVhZCBNb3JlPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5tZW1iZXJzLmxlbmd0aCA/ICc8L3VsPicgOiAnJ31cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uZS10aGlyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X19zZWN0aW9uLXRpdGxlXCI+VXBkYXRlcyBBbmQgTmV3czwvaDI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID8gJzx1bCBjbGFzcz1cImxpbmstbGlzdCBtaW4tbGlzdFwiPicgOiBgPHA+Tm8gbmV3cyBvciB1cGRhdGVzIG1hdGNoIHRoYXQgc2VhcmNoPC9wPiAgPGEgaHJlZj1cIiR7c2l0ZURhdGEucm9vdF91cmx9L2N1cnJlbnRcIj5HbyB0byB2aWV3cyBhbmQgdXBkYXRlIHNlY3Rpb248L2E+YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzU2hvd24ubWFwKGl0ZW0gPT4gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmV3c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGg0PiR7aXRlbS50aXRsZX08L2g0PlxyXG4gICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5jYXB0aW9uLmxlbmd0aCA+PSAxID8gaXRlbS5jYXB0aW9uICsgJyAtICcgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5kYXRlfSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPipyZWxhdGVkIHdpbGwgZ28gaGVyZTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5pbWFnZSAhPT0gbnVsbCA/IGA8aW1nIHNyYz1cIiR7aXRlbS5pbWFnZX1cIiBhbHQ9XCJcIj5gIDogYDxkaXY+JHtpdGVtLnZpZGVvfTwvZGl2PmB9XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwicmVhZC1tb3JlXCIgaHJlZj1cImFsbC1uZXdzLyMke2l0ZW0uaWR9XCI+UmVhZCBNb3JlLi4uPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPGRpdiBpZD1cIm5ld3MtcGFnZXNcIj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA+IDEgPyBgPGEgaHJlZj1cIiNcIiBjbGFzcz1cIm5ld3MtcGFnZVwiIGRhdGEtcGFnZT1cIiR7eSsrfVwiPiAke3BhZ2VMaXN0TnVtYmVyICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPC9kaXY+JyA6ICcnfSAgXHJcbiAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID8gJzwvdWw+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGA7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2VcclxuICAgICAgICBsZXQgbGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBhZ2U9JyR7eH0nXWApO1xyXG4gICAgICAgIGxpbmsuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2lzIGl0IGhhcHBlbmluZyBiZWZvcmUgY2F0Y2g/JylcclxuICAgICAgfWNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSlcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZygnaXMgaXQgaGFwcGVuaW5nIGFmdGVyIGNhdGNoPycpXHJcbiAgICAgICAgICAgIHRoaXMubmV3c1BhZ2VPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ld3MtcGFnZScpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uZXdzUGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE5ld3NQYWdlID0gc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRSZXN1bHRzKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lzIGl0IGhhcHBlbmluZyBpbiBuZXdzUGFnZU9wdGlvbnM/JylcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgXHJcbiAgICAgfVxyXG5cclxuICAgIGtleVByZXNzRGlzcGF0Y2hlcihlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coZS5rZXlDb2RlKTtcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09IDgzICYmICF0aGlzLmlzT3ZlcmxheU9wZW4gJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC50YWdOYW1lICE9IFwiSU5QVVRcIiAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUgIT0gXCJURVhUQVJFQVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3Blbk92ZXJsYXkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGUua2V5Q29kZSA9PT0gMjcgJiYgdGhpcy5pc092ZXJsYXlPcGVuKXtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZU92ZXJsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbk92ZXJsYXkoKXtcclxuICAgICAgICB0aGlzLnNlYXJjaE92ZXJsYXkuY2xhc3NMaXN0LmFkZChcInNlYXJjaC1vdmVybGF5LS1hY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5oZWFkZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5hZGQoJ2ZyZWV6ZScpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoVGVybS52YWx1ZSA9ICcnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiB0aGlzLnNlYXJjaFRlcm0uZm9jdXMoKSwgMzAxKTtcclxuICAgICAgICB0aGlzLmlzT3ZlcmxheU9wZW4gPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gICBcclxuICAgIFxyXG4gICAgY2xvc2VPdmVybGF5KCl7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hPdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ3NlYXJjaC1vdmVybGF5LS1hY3RpdmUnKTtcclxuICAgICAgICB0aGlzLmhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LnJlbW92ZSgnZnJlZXplJyk7XHJcbiAgICAgICAgdGhpcy5pc092ZXJsYXlPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkU2VhcmNoSHRtbCgpe1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICBcImJlZm9yZWVuZFwiLFxyXG4gICAgICAgICAgICBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X190b3BcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtc2VhcmNoIHNlYXJjaC1vdmVybGF5X19pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNlYXJjaC10ZXJtXCIgcGxhY2Vob2xkZXI9XCJXaGF0IGFyZSB5b3UgbG9va2luZyBmb3I/XCIgaWQ9XCJzZWFyY2gtdGVybVwiIGF1dG9jb21wbGV0ZT1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtd2luZG93LWNsb3NlIHNlYXJjaC1vdmVybGF5X19jbG9zZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwic2VhcmNoLW92ZXJsYXlfX3Jlc3VsdHNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNlYXJjaCIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcbi8vQ29tYmluZSB3aXRoIG90aGVyIHBhZ2luYXRpb24/XHJcblxyXG5jbGFzcyBTaGFkb3dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sO1xyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rO1xyXG5cclxuICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXI7XHJcbiAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkOyBcclxuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYTtcclxuICAgICAgICB0aGlzLm1lZGlhTWVudTtcclxuICAgICAgICB0aGlzLm1lZGlhQ29sdW1uO1xyXG4gICAgICAgIHRoaXMubWVkaWFUaHVtYjtcclxuICAgICAgICB0aGlzLm1lZGlhUGFnaW5hdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy52aWRlb1NyYztcclxuICAgICAgICB0aGlzLnBsYXlCdXR0b247XHJcbiAgICAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGFDb3VudDtcclxuICAgICAgICB0aGlzLnBvc3RPdXRwdXQ7XHJcbiAgICAgICAgdGhpcy5wYWdlQ291bnQ7XHJcbiAgICAgICAgdGhpcy5wb3N0UGFnZTtcclxuICAgICAgICB0aGlzLnBvc3RQYWdlcztcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuXHJcbiAgICAgICAgLy9SZXNldCB3aGVuIGNoYW5nZSBmaWx0ZXIgYW5kIGRpc21pc3MgY3VycmVudCB2aWRzXHJcbiAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb247IFxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbjtcclxuICAgICAgICB0aGlzLnBvc3RGaWVsZDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYTtcclxuICAgICAgICB0aGlzLmNsb3NlTWVkaWFCdXR0b247XHJcblxyXG4gICAgICAgIHRoaXMubmV3TG9hZDtcclxuXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudE93bmVySWQgPSBudWxsOyBcclxuICAgICAgICB0aGlzLm1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIConKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LW1lZGlhJyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYU1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtbWVudScpO1xyXG4gICAgICAgIHRoaXMubWVkaWFDb2x1bW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY29sdW1uJyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYVRodW1iO1xyXG4gICAgICAgIHRoaXMubWVkaWFQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24nKTtcclxuICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7IFxyXG4gICAgICAgIHRoaXMucG9zdEZpZWxkID0gJ2dhbGxlcnknO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jbG9zZScpO1xyXG4gICAgICAgIHRoaXMubmV3TG9hZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHRoaXMuc2hhZG93Qm94KG1lZGlhKSlcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHRoaXMua2V5UHJlc3NEaXNwYXRjaGVyKGUpKVxyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT50aGlzLmNsb3NlTWVkaWFSZWNpZXZlcigpKVxyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgICAgIHNoYWRvd0JveChtZWRpYSl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tZWRpYVJlY2lldmVyLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBwb3N0VHlwZSA9IG1lZGlhLmRhdGFzZXQucG9zdDtcclxuICAgICAgICAgICAgbGV0IGRhdGFJZCA9IHBhcnNlSW50KG1lZGlhLmRhdGFzZXQuaWQpO1xyXG5cclxuICAgICAgICAgICAgaWYocG9zdFR5cGUgIT09ICdub25lJyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldE1lZGlhKHBvc3RUeXBlLCBkYXRhSWQpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySXNvbGF0ZWRNZWRpYShtZWRpYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIGdldE1lZGlhKGRhdGFUeXBlLCBkYXRhSWQpe1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9tZWRpYT9yZWxhdGVkJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmVzdWx0c1tkYXRhVHlwZV0uZm9yRWFjaChpdGVtPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbS5nYWxsZXJ5KSk7XHJcbiAgICAgICAgICAgICAgICBpZihpdGVtLmlkID09PSBkYXRhSWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHNbZGF0YVR5cGVdKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihpdGVtLnBvc3RUeXBlID09PSAncHJvcGVydHknKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYU1lbnUuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJnYWxsZXJ5XCIgY2xhc3M9XCJhY3RpdmVcIj5HZW5lcmFsPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJpbnRlcmlvclwiPkludGVyaW9yPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJmbG9vclBsYW5zXCI+Rmxvb3IgUGxhbnM8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImJ1aWxkaW5nUGxhbnNcIj5CdWlsZGluZyBQbGFuczwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lbnVMaW5rID0gdGhpcy5tZWRpYU1lbnUucXVlcnlTZWxlY3RvckFsbCgnYScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51TGluay5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0RmllbGQgPSBpLmN1cnJlbnRUYXJnZXQuaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW1bdGhpcy5wb3N0RmllbGRdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3QpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51TGluay5mb3JFYWNoKGM9PntjLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO30pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiMFwiXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIwXCJdYCkuY2hpbGRyZW5bMF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBsZXQgYWxsTmV3cyA9IHJlc3VsdHNbJ3VwZGF0ZXMnXS5jb25jYXQocmVzdWx0c1snbmV3cyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFsbE5ld3MubWFwKHJlcG9ydHM9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHJlcG9ydHMucmVsYXRpb25zaGlwcy5mb3JFYWNoKHBvc3Q9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBpZihwb3N0LklEID09PSBpdGVtLmlkKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgaXRlbS5nYWxsZXJ5LnB1c2gocmVwb3J0cy5nYWxsZXJ5KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmKGRhdGFJZCAhPT0gIHRoaXMuY3VycmVudE93bmVySWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkID0gZGF0YUlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5sb2NhbFN0b3JhZ2UgPSB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0aGlzLmFjY2Vzc0xvY2FsU3RvcmFnZShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluaXRpYWxNZWRpYVBvcHVsYXRpb24oaXRlbSwgcG9zdCl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBpZiBtb3JlIHRoYW4gb25lLCBzaG93XHJcbiAgICAgICAgICAgIC8vIGlzIHRoZXJlIGEgbW9yZSBhY2Nlc3NpYmxlLWZyaWVuZGx5IGh0bWwgdGFnIGZvciBmaWx0cnIgbWVudXM/XHJcbiAgICAgICAgICAgIC8vSGF2ZSBkZXNjIHdpdGggJ3JlYWQgbW9yZScgdW5kZXIgYWN0aXZlIHZpZC4gRXhlcnB0IHVuZGVyIHNlbGVjdGlvbiwgb2YgZXhpc3RzLCBvdGhlcndpc2UgdHJpbVxyXG5cclxuICAgICAgICAgICAgdGhpcy5kYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnBvc3RPdXRwdXQgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMgPSBbXTtcclxuXHJcbiAgXHJcbiAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoIDw9IHRoaXMucG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBvc3RQYWdlcy5jb25jYXQocG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHRoaXMucG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gdGhpcy5wb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBvc3RQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaCh0aGlzLnBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucG9zdFBhZ2VzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucG9zdFBhZ2VzKSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtKVxyXG4gXHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVNZWRpYUNvbHVtbihpdGVtLCB0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlc10pO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpdGVtKVxyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdMb2FkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKGl0ZW0sIHRoaXMuZGF0YUNvdW50LCB0aGlzLnBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgIH1cclxuIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVySXNvbGF0ZWRNZWRpYShtZWRpYSl7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5yZW1vdmUoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QuYWRkKCdjZW50ZXItZGlzcGxheScpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7bWVkaWEuZGF0YXNldC5mdWxsfVwiPlxyXG4gICAgICAgICAgICBgOyAgXHJcbiAgIFxyXG4gICAgICAgICAgICAvLyB0aGlzLnZpZGVvU3JjID0gdGhpcy5jdXJyZW50TWVkaWEucXVlcnlTZWxlY3RvcignaW1nJykuZGF0YXNldC52aWRlby5yZXBsYWNlKCd3YXRjaD92PScsICdlbWJlZC8nKSArICc/YXV0b3BsYXk9MSc7XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGxheUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbGF5LWJ1dHRvbicpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+dGhpcy5wbGF5VmlkZW8odGhpcy52aWRlb1NyYykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuaW5uZXJIVE1MID0gYCAgICAgICBcclxuICAgICAgICAgICAgICAgICR7aXRlbVt0aGlzLnBvc3RGaWVsZF1bdGhpcy5nYWxsZXJ5UG9zaXRpb25dLnZpZGVvU291cmNlID8gJzxkaXYgaWQ9XCJwbGF5LWJ1dHRvbi1jb250YWluZXJcIj48YnV0dG9uIGlkPVwicGxheS1idXR0b25cIj48ZGl2PjwvZGl2PjwvYnV0dG9uPjwvZGl2PicgOiAnJ31cclxuICAgICAgICAgICAgICAgIDxpbWcgZGF0YS12aWRlbz1cIiR7aXRlbVt0aGlzLnBvc3RGaWVsZF1bdGhpcy5nYWxsZXJ5UG9zaXRpb25dLnZpZGVvU291cmNlfVwiIHNyYz1cIiR7aXRlbVt0aGlzLnBvc3RGaWVsZF1bdGhpcy5nYWxsZXJ5UG9zaXRpb25dLmltYWdlfVwiPlxyXG4gICAgICAgICAgICBgOyAgXHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZGVvU3JjID0gdGhpcy5jdXJyZW50TWVkaWEucXVlcnlTZWxlY3RvcignaW1nJykuZGF0YXNldC52aWRlby5yZXBsYWNlKCd3YXRjaD92PScsICdlbWJlZC8nKSArICc/YXV0b3BsYXk9MSc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBsYXlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGxheS1idXR0b24nKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucGxheUJ1dHRvbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+dGhpcy5wbGF5VmlkZW8odGhpcy52aWRlb1NyYykpO1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LmFkZCgnYXNwZWN0LXJhdGlvJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QucmVtb3ZlKCdjZW50ZXItZGlzcGxheScpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5yZW1vdmUoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LmFkZCgnY2VudGVyLWRpc3BsYXknKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBvcHVsYXRlTWVkaWFDb2x1bW4oaXRlbSwgY29udGVudCl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFDb2x1bW4uaW5uZXJIVE1MID0gYFxyXG4gICAgICBcclxuICAgICAgICAgICAgICAgICAgICAke2NvbnRlbnQubWFwKGkgPT4gYFxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1wb3NpdGlvbj1cIiR7aXRlbVt0aGlzLnBvc3RGaWVsZF0uZmluZEluZGV4KGE9PntyZXR1cm4gYS5pZCA9PT0gaS5pZH0pfVwiICBjbGFzcz1cIm1lZGlhLXNlbGVjdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwibWVkaWEtdGh1bWJcIiBzcmM9XCIke2kuc2VsZWN0SW1hZ2V9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYS1pbmZvcm1hdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpLnRpdGxlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aS5kZXNjcmlwdGlvbn08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVkaWEtdGh1bWInKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMubmV3TG9hZCA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWJbMF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZWRpYS10aHVtYi5zZWxlY3RlZCcpLnBhcmVudE5vZGUuZGF0YXNldC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFNlbGVjdGlvbilcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iLmZvckVhY2godGh1bWI9PntcclxuICAgICAgICAgICAgICAgIHRodW1iLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iLmZvckVhY2goYz0+e2MuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKTt9KVxyXG4gICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZS50YXJnZXQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb24gPSBlLnRhcmdldC5wYXJlbnROb2RlLmRhdGFzZXQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJDdXJyZW50TWVkaWEoaXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbiA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRTZWxlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgLy9hY3RpdmF0ZSB0aGUgc2VwZXJhdGUgZnVuY3Rpb24gdGhhdCBmaWxscyB0aGUgY3VycmVudE1kaWEgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluc2VydFBhZ2luYXRpb24oaXRlbSwgZGF0YUNvdW50LCBwYWdlQ291bnQpe1xyXG4gICAgICAgICAgICB0aGlzLm1lZGlhUGFnaW5hdGlvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAke3RoaXMucG9zdFBhZ2VzLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICAgICAke3RoaXMucG9zdFBhZ2VzLmxlbmd0aCA+IDEgPyBgPGEgY2xhc3M9XCJjb250ZW50LXBhZ2VcIiBkYXRhLXBhZ2U9XCIke2RhdGFDb3VudCsrfVwiPiAke3BhZ2VDb3VudCArPSAxfTwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX0gIFxyXG4gICAgICAgICAgICBgO1xyXG5cclxuICAgICAgICAgICAgaWYoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJykpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtcGFnaW5hdGlvbiAuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZmlyc3RQYWdlQnV0dG9uKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBjb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjbWVkaWEtcGFnaW5hdGlvbiAuY29udGVudC1wYWdlJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KGl0ZW0sIGNvbnRlbnRQYWdlT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld0xvYWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KGl0ZW0sIGNvbnRlbnRQYWdlT3B0aW9ucyl7XHJcbiAgICAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50U2VsZWN0aW9uKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IHBhcnNlSW50KHNlbGVjdGVkUGFnZS5kYXRhc2V0LnBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuaW5pdGlhbE1lZGlhUG9wdWxhdGlvbihpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlTWVkaWFDb2x1bW4oaXRlbSwgdGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZXNdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pICBcclxuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7dGhpcy5jdXJyZW50U2VsZWN0aW9ufVwiXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke3RoaXMuY3VycmVudFNlbGVjdGlvbn1cIl1gKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke3RoaXMuY3VycmVudFNlbGVjdGlvbn1cIl1gKS5jaGlsZHJlblswXS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pICAgIFxyXG5cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBjbG9zZU1lZGlhUmVjaWV2ZXIoKXtcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMubWVkaWFNZW51LmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVkaWFNZW51LnJlbW92ZUNoaWxkKHRoaXMubWVkaWFNZW51LmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5tZWRpYUNvbHVtbi5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lZGlhQ29sdW1uLnJlbW92ZUNoaWxkKHRoaXMubWVkaWFDb2x1bW4uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLmN1cnJlbnRNZWRpYS5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRNZWRpYS5maXJzdENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5tZWRpYVJlY2lldmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gZmFsc2U7IFxyXG4gICAgICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LnJlbW92ZSgnZnJlZXplJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucG9zdEZpZWxkID0gJ2dhbGxlcnknO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uZXdMb2FkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAga2V5UHJlc3NEaXNwYXRjaGVyKGUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlLmtleUNvZGUsIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbilcclxuICAgICAgICAgICAgaWYoZS5rZXlDb2RlID09PSAyNyAmJiB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1lZGlhUmVjaWV2ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheVZpZGVvKHZpZGVvU3JjKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codmlkZW9TcmMpXHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8aWZyYW1lIGFsbG93ZnVsbHNjcmVlbj1cImFsbG93ZnVsbHNjcmVlblwiIHNyYz1cIiR7dmlkZW9TcmN9XCI+PC9pZnJhbWU+XHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGFkb3dCb3g7IiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcclxuaW1wb3J0IFNoYWRvd0JveCBmcm9tICcuL3NoYWRvd0JveCc7XHJcbi8vVGhlIHNpbXBsaWNpdHkgb2YgdGhpcyBpcyBhIGNoYW5jZSB0byB0cnkgdG8gbWFrZSBteSBwYWdpbmF0aW9uIGNvZGUgYW5kIGNvZGUgaW4gZ2VuZXJhbCBjbGVhbmVyIGFuZCBtb3JlIGVmZmljaWVudFxyXG5jbGFzcyBSZWxhdGVkTmV3c3tcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3cy1yZWNpZXZlcicpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdpbmF0aW9uLWhvbGRlcicpO1xyXG4gICAgICAgIC8vaW50ZXJmZXJlcyB3aXRoIFNCLiBGaWd1cmUgb3V0IGhvdyB0byBwcmV2ZW50IG9uIHBhZ2VzIHdoZXJlIGludmFsaWQuXHJcbiAgICAgICAgLy9BbHNvIHdpdGggYWxsLW5ld3MgaWYgb25seSAxIHBhZ2VcclxuICAgICAgICB0aGlzLmN1cnJlbnRQb3N0SUQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkltYWdlQW5kU3RhdHMgaW1nJykuZGF0YXNldC5pZDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucztcclxuICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50cygpe1xyXG4gICAgICAgIHRoaXMuZmV0Y2hSZWxhdGVkTmV3cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGZldGNoUmVsYXRlZE5ld3MoKXtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9tZWRpYT9yZWxhdGVkJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgY29uc3QgYWxsTmV3cyA9IHJlc3VsdHMudXBkYXRlcy5jb25jYXQocmVzdWx0cy5uZXdzKTtcclxuICAgICAgICAgICAgY29uc3QgcmVsYXRlZE5ld3MgPSBbXTsgXHJcbiAgICAgICAgICAgIGxldCBsaW1pdCA9IDE7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YUNvdW50ID0gMDtcclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIC8vT3JnYW5pemUgdGhlIG5ld3MgdGhhdCdzIHRocm93biBpbnRvIHJlbGF0ZWROZXdzLCBpbiBkYXRlIG9yZGVyXHJcbiAgICAgICAgICAgIC8vQ29uc2lkZXIgcGVyZm9ybWluZyB0aGUgZGF0ZSBvcmRlciBvbiBiYWNrZW5kLCB0aG91Z2ggY291bGQgYW5ub3lvbmcsIGdpdmVuIGxlc3MgcGhwIGV4cGVyaWVuY2UsIGJ1dCBjb3VsZCBiZSBiZW5lZmljaWFsIHRvIHByb2dyZXNzIG92ZXIgYWxsIFxyXG4gICAgICAgICAgICBpZighdGhpcy5jb250ZW50TG9hZGVkKXtcclxuICAgICAgICAgICAgICAgIGFsbE5ld3MuZm9yRWFjaChuZXdzID0+e1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3MucmVsYXRpb25zaGlwcy5mb3JFYWNoKHI9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoci5JRCA9PT0gcGFyc2VJbnQodGhpcy5jdXJyZW50UG9zdElEKSAmJiBsaW1pdCA8PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0Kz0xXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGVkTmV3cy5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBpZihyZWxhdGVkTmV3cy5sZW5ndGgpeyAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFNob3duID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxhdGVkTmV3cykpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlUGFnaW5hdGlvbkhvbGRlcihkYXRhQ291bnQsIHBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVOZXdzUmVjaWV2ZXIoKTtcclxuXHJcbiAgIFxyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvcHVsYXRlTmV3c1JlY2lldmVyKCl7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0pXHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8aDQ+JHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS50aXRsZX08L2g0PlxyXG4gICAgICAgICAgICA8cD4ke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmNhcHRpb24gPyBgJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5jYXB0aW9ufSAtYCA6ICcnfSAke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmRhdGV9PC9wPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtY2FyZFwiPjxpbWcgZGF0YS1wb3N0PVwiJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5wb3N0VHlwZVBsdXJhbH1cIiBkYXRhLWlkPVwiJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5pZH1cIiBzcmM9XCIke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmdhbGxlcnlbMF0uaW1hZ2V9XCI+PC9kaXY+XHJcbiAgICAgICAgICAgIDxwPiR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uZnVsbERlc2NyaXB0aW9ufTwvcD5cclxuICAgICAgICBgO1xyXG4gIFxyXG4gICAgICAgIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKCk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coU2hhZG93Qm94LnByb3RvdHlwZS5tZWRpYUxpbmspXHJcbiAgICB9XHJcblxyXG4gICAgcG9wdWxhdGVQYWdpbmF0aW9uSG9sZGVyKGRhdGFDb3VudCwgcGFnZUNvdW50KXtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLmxlbmd0aCA/ICc8ZGl2IGNsYXNzPVwiY29udGVudC1wYWdlc1wiPicgOiAnJ31cclxuICAgICAgICAgICAgICAgICR7dGhpcy5jb250ZW50U2hvd24ubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5jb250ZW50U2hvd24ubGVuZ3RoID4gMSA/IGA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZVwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSBcclxuICAgICAgICAgICAgJHt0aGlzLmNvbnRlbnRTaG93bi5sZW5ndGggPyAnPC9kaXY+JyA6ICcnfSBcclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG5cclxuICAgICAgICBpZighdGhpcy5jb250ZW50TG9hZGVkKXtcclxuICAgICAgICAgICAgaWYodGhpcy5maXJzdFBhZ2VCdXR0b24pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH0gICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LXBhZ2UnKTtcclxuICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoKXtcclxuICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYXJzZUludChzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZldGNoUmVsYXRlZE5ld3MoKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSlcclxuICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlbGF0ZWROZXdzICIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvL0xvb2sgdXAgaG93IHRvIGJ1bmRsZSBzY3NzIGhlcmUgdXNpbmcgd2VicGFjayBhbmQgbWFrZSB0aGlzIGludG8gYW4gaW1wb3J0IGZpbGUoQWxzbyB1c2Ugc2VwZXJhdGUgZmlsZSBmb3IgZ2VuIGxvZ2ljLCBcclxuLy9zbyBjYW4gY29uZGl0aW9uYWwgdGhpcyBmb3IgZm9ybXMpXHJcbmltcG9ydCAnLi4vY3NzL3N0eWxlLmNzcyc7XHJcbmltcG9ydCAnLi4vY3NzL2RvdHMuY3NzJ1xyXG5cclxuaW1wb3J0IFNlYXJjaCBmcm9tICcuL21vZHVsZXMvc2VhcmNoJztcclxuaW1wb3J0IFBhZ2luYXRpb24gZnJvbSAnLi9tb2R1bGVzL3BhZ2luYXRpb24nO1xyXG5pbXBvcnQgTmV3cyBmcm9tICcuL21vZHVsZXMvYWxsLW5ld3MnO1xyXG5pbXBvcnQgUmVsYXRlZE5ld3MgZnJvbSAnLi9tb2R1bGVzL3NpbmdsZVBvc3QnO1xyXG5pbXBvcnQgU2hhZG93Qm94IGZyb20gJy4vbW9kdWxlcy9zaGFkb3dCb3gnO1xyXG5cclxuY29uc3Qgc2VhcmNoID0gbmV3IFNlYXJjaCgpO1xyXG5jb25zdCBwYWdpbmF0aW9uID0gbmV3IFBhZ2luYXRpb24oKTtcclxuY29uc3QgbmV3cyA9IG5ldyBOZXdzKCk7XHJcbmNvbnN0IHJlbGF0ZWROZXdzID0gbmV3IFJlbGF0ZWROZXdzKCk7XHJcbmNvbnN0IHNoYWRvd0JveCA9IG5ldyBTaGFkb3dCb3goKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=