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
___CSS_LOADER_EXPORT___.push([module.id, "@charset \"UTF-8\";\nhtml {\n  overflow-x: hidden;\n  height: 100%;\n  margin: 0;\n}\n@media (min-width: 767px) {\n  html {\n    font-size: 1.7vh;\n  }\n}\n@media (min-width: 1200px) {\n  html {\n    font-size: 1.85vh;\n  }\n}\nhtml.freeze {\n  overflow: hidden;\n}\n\nbody {\n  margin: 0;\n  color: antiquewhite;\n}\n\nh1 {\n  margin: 0;\n  margin-bottom: 3rem;\n  font-size: 4rem;\n}\n\nh2 {\n  font-size: 2.5rem;\n  margin: 0;\n}\n\nh3 {\n  font-size: 2.3rem;\n  margin: 0;\n}\n\na {\n  text-decoration: none;\n  color: inherit;\n}\n\na {\n  cursor: pointer;\n}\n\na.hidden, a.selectedPage {\n  pointer-events: none;\n}\n\na.hidden {\n  opacity: 0;\n}\n\na.selectedPage {\n  color: #e8aa77;\n  filter: saturate(120%);\n}\n\n*.hidden {\n  display: none;\n  pointer-events: none;\n}\n\ndiv, button {\n  box-sizing: border-box;\n}\n\nbutton {\n  border: none;\n  background: transparent;\n}\n\nli {\n  list-style-type: none;\n}\n\n#overallContainer {\n  position: relative;\n  top: 0;\n}\n#overallContainer.faded {\n  filter: opacity(40%);\n}\n\n.contentContainer {\n  height: initial;\n  width: 100%;\n  margin: 4% 0;\n  margin-bottom: 5%;\n  display: flex;\n  justify-content: center;\n}\n.contentContainer > div {\n  display: flex;\n  justify-content: center;\n  padding-top: 5.5rem;\n}\n@media (min-width: 767px) {\n  .contentContainer > div {\n    width: 95%;\n  }\n}\n@media (min-width: 1200px) {\n  .contentContainer > div {\n    width: 85%;\n  }\n}\n.contentContainer_paginated .textBox .content-pages {\n  text-align: center;\n}\n.contentContainer_paginated .textBox .content-pages a {\n  font-size: 1.75rem;\n}\n\n.titleAndTextBox, .contentBox {\n  position: relative;\n}\n\n.titleAndTextBox {\n  margin-right: 5%;\n}\n\n.titleBox, .textBox {\n  height: 50%;\n  width: 16rem;\n}\n\n.titleBox {\n  padding: 10%;\n}\n.titleBox > * {\n  height: 50%;\n  width: 100%;\n  margin: 0;\n}\n.titleBox > :nth-child(2) {\n  display: flex;\n}\n.titleBox > :nth-child(2) h2 {\n  align-self: flex-end;\n  padding-bottom: 15%;\n}\n\n.contentBox.properties, .contentBox.members {\n  display: grid;\n  row-gap: 0.35rem;\n}\n@media (min-width: 767px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(3, 33.3%);\n  }\n}\n@media (min-width: 1200px) {\n  .contentBox.properties, .contentBox.members {\n    grid-template-columns: repeat(4, 25%);\n  }\n}\n\n.contentBox {\n  width: 100%;\n  height: 100%;\n}\n.contentBox.properties > div, .contentBox.members > div {\n  width: 14rem;\n}\n.contentBox.properties > div .displaySquares, .contentBox.members > div .displaySquares {\n  box-sizing: initial;\n  position: relative;\n  text-align: center;\n  display: flex;\n  align-items: center;\n}\n.contentBox.properties > div .displaySquares-pageLinks, .contentBox.members > div .displaySquares-pageLinks {\n  position: absolute;\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  text-align: center;\n  opacity: 0;\n}\n.contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n  color: rgb(238, 231, 210);\n  cursor: pointer;\n  font-size: 1.5rem;\n  margin-top: 0.7rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks *, .contentBox.members > div .displaySquares-pageLinks * {\n    font-size: 1.3rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n  font-size: 2rem;\n}\n@media (min-width: 1200px) {\n  .contentBox.properties > div .displaySquares-pageLinks .fa-search-plus, .contentBox.members > div .displaySquares-pageLinks .fa-search-plus {\n    font-size: 1.4rem;\n  }\n}\n.contentBox.properties > div .displaySquares-pageLinks *:hover, .contentBox.members > div .displaySquares-pageLinks *:hover {\n  transform: scale(110%);\n  filter: brightness(120%);\n}\n.contentBox.properties > div .displaySquares-pageLinks i, .contentBox.members > div .displaySquares-pageLinks i {\n  font-size: 1.4rem;\n}\n.contentBox.properties > div .displaySquares .displaySquares-pageLinks__visible, .contentBox.members > div .displaySquares .displaySquares-pageLinks__visible {\n  opacity: 1;\n}\n.contentBox.properties > div .displaySquares div p, .contentBox.properties > div .displaySquares div a, .contentBox.members > div .displaySquares div p, .contentBox.members > div .displaySquares div a {\n  margin: 2%;\n}\n.contentBox.properties > div .display-text, .contentBox.members > div .display-text {\n  margin-top: -0.3rem;\n  text-align: center;\n  font-size: 1.3rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.2rem;\n}\n.contentBox.properties > div .display-text p, .contentBox.members > div .display-text p {\n  margin: 0;\n}\n.contentBox.properties > div .display-text p:nth-of-type(2), .contentBox.members > div .display-text p:nth-of-type(2) {\n  font-weight: 700;\n}\n.contentBox .news {\n  margin: 0 1%;\n  padding-top: 5%;\n  height: auto;\n}\n.contentBox .news iframe {\n  width: 300px;\n  height: 200px;\n}\n\n#footerContainer {\n  background-color: rgba(39, 39, 39, 0.6);\n  margin: 0;\n  display: flex;\n  position: fixed;\n  bottom: 0;\n  width: 100%;\n  text-align: center;\n  justify-content: flex-end;\n  padding-right: 2rem;\n  color: ivory;\n}\n#footerContainer p {\n  margin: 1rem;\n}\n@media (min-width: 1200px) {\n  #footerContainer p {\n    margin: 0.65rem;\n  }\n}\n\n#openingContainer {\n  height: 99.5vh;\n  position: relative;\n  color: rgb(189, 189, 189);\n  display: flex;\n  justify-content: center;\n}\n#openingContainer h1 {\n  font-size: 5.2rem;\n}\n@media (min-width: 1200px) {\n  #openingContainer h1 {\n    font-size: 6.5rem;\n  }\n}\n#openingContainer p {\n  font-size: 2.5rem;\n  font-weight: 600;\n}\n@media (min-width: 1200px) {\n  #openingContainer p {\n    font-size: 2.7rem;\n  }\n}\n#openingContainer #welcomeContainer div {\n  text-shadow: 1px 1px black;\n  width: 80%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer div {\n    width: 70%;\n  }\n}\n#openingContainer header {\n  display: grid;\n  grid-auto-flow: row;\n  grid-template-columns: 4% 25% 1fr;\n  background-color: rgba(70, 62, 55, 0.85);\n  box-shadow: 0.2rem 0.2rem 1rem 0.4rem inset rgba(49, 43, 39, 0.75);\n  width: 100%;\n  height: 5rem;\n  position: fixed;\n  top: 0;\n  z-index: 9999;\n  color: rgb(199, 187, 156);\n}\n#openingContainer header.hidden {\n  display: none;\n}\n#openingContainer header button {\n  font-size: 1.8rem;\n  width: 10rem;\n  cursor: pointer;\n}\n#openingContainer header button i {\n  display: inline;\n}\n#openingContainer header #logo-symbol, #openingContainer header #logo-text {\n  height: 4rem;\n}\n#openingContainer header #logo-symbol {\n  margin-top: 0.3rem;\n  padding-left: 0.5rem;\n}\n#openingContainer header #logo-text {\n  margin-top: 0.6rem;\n  padding-left: 0.2rem;\n}\n#openingContainer header img {\n  height: 100%;\n}\n#openingContainer header p, #openingContainer header nav {\n  margin: 0;\n}\n#openingContainer header nav {\n  margin-right: 2rem;\n}\n#openingContainer header nav ul {\n  margin: 0;\n  padding: 0;\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1.5rem;\n}\n#openingContainer header nav ul li a {\n  font-size: 1.8rem;\n  text-shadow: 1px 1px black;\n}\n#openingContainer #pageImage {\n  position: absolute;\n  top: 0;\n  height: 100%;\n  width: 100%;\n}\n#openingContainer #pageImage img {\n  height: 100%;\n  width: 100%;\n  filter: blur(0.6rem) grayscale(50%);\n}\n#openingContainer #welcomeContainer {\n  position: absolute;\n  text-align: center;\n  align-items: center;\n  margin-top: 1%;\n  display: flex;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n}\n@media (min-width: 1200px) {\n  #openingContainer #welcomeContainer {\n    margin-top: 2%;\n  }\n}\n#openingContainer #welcomeContainer img {\n  height: 6rem;\n}\n\n.titleBox {\n  background: transparent;\n}\n.titleBox p {\n  font-size: 1.5rem;\n}\n\n.textBox {\n  padding-left: 0.5rem;\n}\n.textBox p {\n  font-size: 1.3rem;\n  color: white;\n}\n\n#propertiesContainer > div .titleBox, #membersContainer > div .titleBox {\n  border: 0.35rem solid rgb(199, 187, 156);\n}\n#propertiesContainer img, #membersContainer img {\n  width: 100%;\n  height: 100%;\n  margin-bottom: 1rem;\n}\n#propertiesContainer img.pageLinks__visible, #membersContainer img.pageLinks__visible {\n  filter: brightness(27%);\n}\n\n@media (min-width: 1200px) {\n  #allNewsContainer {\n    height: 52rem;\n  }\n}\n\n#contactContainer {\n  height: 58.5rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer {\n    height: 52rem;\n  }\n}\n\n#allNewsContainer, #contactContainer {\n  background-color: rgb(31, 27, 21);\n  color: white;\n}\n#allNewsContainer > div .titleBox, #contactContainer > div .titleBox {\n  border: 4px solid rgb(221, 221, 221);\n}\n#allNewsContainer > div .textBox p, #contactContainer > div .textBox p {\n  color: antiquewhite;\n}\n#allNewsContainer .contentBox, #contactContainer .contentBox {\n  display: flex;\n  font-size: 1.1rem;\n}\n#allNewsContainer .contentBox > div, #contactContainer .contentBox > div {\n  flex-basis: 50%;\n  height: 100%;\n}\n#allNewsContainer .contentBox > div > div, #contactContainer .contentBox > div > div {\n  overflow: auto;\n  height: 92%;\n}\n#allNewsContainer .contentBox .form-message, #contactContainer .contentBox .form-message {\n  height: auto;\n}\n#allNewsContainer .contentBox h3, #contactContainer .contentBox h3 {\n  text-align: center;\n  height: 8%;\n}\n#allNewsContainer .contentBox ul, #contactContainer .contentBox ul {\n  padding: 0;\n}\n#allNewsContainer .contentBox ul li, #contactContainer .contentBox ul li {\n  display: inline;\n}\n#allNewsContainer .contentBox .news, #contactContainer .contentBox .news {\n  border: 1px solid rgba(233, 233, 233, 0.3);\n}\n#allNewsContainer .contentBox .news::after, #contactContainer .contentBox .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#allNewsContainer .contentBox .news img, #contactContainer .contentBox .news img {\n  width: 13rem;\n  float: left;\n  margin-right: 2.5%;\n  cursor: pointer;\n}\n#allNewsContainer .contentBox .news p, #contactContainer .contentBox .news p {\n  line-height: 1.2rem;\n  font-size: 1.25rem;\n}\n#allNewsContainer .contentBox .news, #allNewsContainer .contentBox form, #contactContainer .contentBox .news, #contactContainer .contentBox form {\n  padding: 0 5%;\n}\n#allNewsContainer .contentBox form, #contactContainer .contentBox form {\n  display: grid;\n  -moz-column-gap: 1.2rem;\n       column-gap: 1.2rem;\n  grid-template-areas: \"contactName contactEmail\" \"contactPhone contactSubject\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"contactMessage contactMessage\" \"submit ...\";\n}\n#allNewsContainer .contentBox form #contact-name, #contactContainer .contentBox form #contact-name {\n  grid-area: contactName;\n}\n#allNewsContainer .contentBox form #contact-email, #contactContainer .contentBox form #contact-email {\n  grid-area: contactEmail;\n}\n#allNewsContainer .contentBox form #contact-phone, #contactContainer .contentBox form #contact-phone {\n  grid-area: contactPhone;\n}\n#allNewsContainer .contentBox form #contact-subject, #contactContainer .contentBox form #contact-subject {\n  grid-area: contactSubject;\n}\n#allNewsContainer .contentBox form #contact-message, #contactContainer .contentBox form #contact-message {\n  grid-area: contactMessage;\n}\n\n#contactContainer {\n  background: black;\n  color: white;\n}\n#contactContainer .contentBox {\n  -moz-column-gap: 3rem;\n       column-gap: 3rem;\n  width: 85%;\n  display: flex;\n  padding-bottom: 1rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox {\n    width: 70%;\n  }\n}\n#contactContainer .contentBox img {\n  filter: saturate(120%);\n  width: 45%;\n  margin-left: 2rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox img {\n    width: 50%;\n    margin-left: 0;\n  }\n}\n#contactContainer .contentBox label.error {\n  font-size: 1.5rem;\n  font-weight: 700;\n  color: rgb(120, 179, 158);\n}\n#contactContainer .contentBox form {\n  margin-top: 3rem;\n}\n#contactContainer .contentBox form > div {\n  margin: 5% 0;\n  margin-top: 0;\n}\n#contactContainer .contentBox form label {\n  font-size: 1.4rem;\n}\n#contactContainer .contentBox form [type=radio] {\n  width: 10%;\n  display: initial;\n}\n#contactContainer .contentBox form ul {\n  padding: 0;\n}\n#contactContainer .contentBox form input, #contactContainer .contentBox form select {\n  display: block;\n  margin-top: 2%;\n}\n#contactContainer .contentBox form input {\n  height: 1.5rem;\n}\n#contactContainer .contentBox form select {\n  height: 2rem;\n}\n#contactContainer .contentBox form textarea {\n  width: 100%;\n  height: 15rem;\n}\n@media (min-width: 1200px) {\n  #contactContainer .contentBox form textarea {\n    height: 20rem;\n  }\n}\n#contactContainer .contentBox form button {\n  grid-area: submit;\n  color: ivory;\n  font-size: 1.3rem;\n  text-align: left;\n}\n\n.dot-pulse {\n  top: 20%;\n  left: 35%;\n}\n\n#pop-up-display-box {\n  background-color: rgba(45, 41, 35, 0.8);\n  width: 94vw;\n  height: 87vh;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 8vh;\n  left: 3vw;\n  display: none;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n  padding-top: 1rem;\n}\n#pop-up-display-box img {\n  width: 500px;\n}\n#pop-up-display-box a, #pop-up-display-box button {\n  font-size: 2rem;\n}\n#pop-up-display-box button {\n  color: antiquewhite;\n  cursor: pointer;\n}\n#pop-up-display-box button:hover, #pop-up-display-box a:hover {\n  filter: brightness(72%);\n}\n#pop-up-display-box #content-holder {\n  display: flex;\n  justify-content: space-evenly;\n  position: relative;\n  width: 70%;\n}\n#pop-up-display-box #content-holder .pop-up-directional {\n  font-size: 2.5rem;\n}\n\n#news-media-display {\n  background-color: rgba(44, 52, 77, 0.8);\n  height: 88vh;\n  width: 94vw;\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 7vh;\n  left: 3vw;\n  display: none;\n  justify-content: space-around;\n  align-items: center;\n  flex-direction: column;\n}\n\n#singleContainer {\n  height: 87%;\n  min-width: 60%;\n  top: 8.3%;\n  display: flex;\n  flex-wrap: wrap;\n  position: absolute;\n  z-index: 1;\n  padding: 1.5rem 1rem;\n  padding-bottom: 1rem;\n  background-color: rgba(37, 35, 34, 0.9);\n}\n#singleContainer h4 {\n  font-size: 1.6rem;\n}\n#singleContainer h3, #singleContainer h4, #singleContainer .related-link {\n  color: rgb(241, 218, 189);\n}\n#singleContainer #mainImageAndStats {\n  width: 21vw;\n  text-align: center;\n}\n#singleContainer #mainImageAndStats img {\n  height: 42%;\n}\n#singleContainer #mainImageAndStats ul {\n  padding-left: 20%;\n  font-size: 1.65rem;\n  text-align: left;\n  margin-top: 1rem;\n}\n#singleContainer #mainImageAndStats ul li {\n  margin-top: 0.6rem;\n  list-style-type: square;\n}\n#singleContainer #mainImageAndStats ul li a {\n  filter: brightness(115%);\n}\n#singleContainer #singleInfo {\n  width: 30vw;\n  display: grid;\n  grid-template-rows: 7% 1fr;\n  height: 100%;\n}\n#singleContainer #singleInfo p {\n  margin-top: 1.2rem;\n  font-size: 1.7rem;\n  height: 99%;\n}\n#singleContainer #singleInfo div {\n  overflow: auto;\n  padding: 0 1rem;\n}\n#singleContainer #singleInfo #mediaContainer {\n  height: auto;\n}\n#singleContainer #singleInfo #mediaContainer iframe {\n  width: 200px;\n  height: 200px;\n}\n#singleContainer #vidAndImgCol {\n  height: 100%;\n  width: 16vw;\n  overflow: auto;\n  overflow-x: hidden;\n  text-align: center;\n}\n#singleContainer #vidAndImgCol h3 {\n  font-size: 1.9rem;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col {\n  width: 26vw;\n  position: relative;\n  height: 100%;\n  overflow: auto;\n  padding: 0 1rem;\n  display: grid;\n  grid-template-rows: 10% 1fr 4%;\n}\n#singleContainer #updates-col h3 {\n  font-size: 2rem;\n}\n#singleContainer #updates-col h3 a {\n  font-size: 1.7rem;\n}\n#singleContainer #updates-col h3 a:hover {\n  color: white;\n}\n#singleContainer #updates-col #news-reciever {\n  overflow: auto;\n  margin: 1rem 0;\n}\n#singleContainer #updates-col #news-reciever p {\n  font-size: 1.4rem;\n  padding-right: 1rem;\n}\n#singleContainer #updates-col #pagination-holder {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n  font-size: 1.8rem;\n  display: flex;\n  justify-content: center;\n}\n\nbody {\n  background-color: rgb(100, 92, 82);\n}\n\n.search-overlay {\n  overflow-y: auto;\n  overflow-x: hidden;\n  z-index: 110;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(72, 68, 62, 0.96);\n  visibility: hidden;\n  opacity: 0;\n  transform: scale(1.09);\n  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;\n  box-sizing: border-box;\n}\n.search-overlay .container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n.search-overlay p {\n  padding-top: 1rem;\n}\nbody.admin-bar .search-overlay {\n  top: 2rem;\n}\n.search-overlay__top {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n.search-overlay__icon {\n  margin-right: 0.75rem;\n  font-size: 2.5rem;\n  color: rgb(148, 121, 105);\n}\n.search-overlay--active {\n  visibility: visible;\n  opacity: 1;\n  transform: scale(1);\n}\n.search-overlay__section-title {\n  margin: 30px 0 1px 0;\n  font-weight: 400;\n  font-size: 2rem;\n  padding: 15px 0;\n  border-bottom: 1px solid #ccc;\n}\n.search-overlay__close {\n  font-size: 2.7rem;\n  cursor: pointer;\n  transition: all 0.3s;\n  background-color: rgb(58, 54, 54);\n  color: rgb(180, 171, 166);\n  line-height: 0.7;\n}\n.search-overlay__close:hover {\n  opacity: 1;\n}\n.search-overlay .one-half {\n  padding-bottom: 0;\n}\n\n.search-term {\n  width: 75%;\n  box-sizing: border-box;\n  border: none;\n  padding: 1rem 0;\n  margin: 0;\n  background-color: transparent;\n  font-size: 1rem;\n  font-weight: 300;\n  outline: none;\n  color: rgb(218, 201, 182);\n}\n\n.body-no-scroll {\n  overflow: hidden;\n}\n\n.container {\n  max-width: 1300px;\n  margin: 0 auto;\n  padding: 0 16px;\n  position: relative;\n}\n\n@media (min-width: 960px) {\n  .search-term {\n    width: 80%;\n    font-size: 3rem;\n  }\n}\n@-webkit-keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.spinner-loader {\n  margin-top: 45px;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  border: 0.25rem solid rgba(0, 0, 0, 0.2);\n  border-top-color: black;\n  -webkit-animation: spin 1s infinite linear;\n  animation: spin 1s infinite linear;\n}\n\n.media-card button {\n  color: white;\n  cursor: pointer;\n  font-size: 2.1rem;\n}\n\nh1, h2, h3, h4 {\n  font-family: \"Libre Caslon Text\", serif;\n}\n\n.news p, .textBox p, #relationship-link, #single-link {\n  font-family: \"Libre Caslon Display\", serif;\n}\n\nh1 {\n  font-weight: 700;\n}\n\nh2 {\n  font-weight: 400;\n}\n\n.display-text, #welcomeContainer p, .titleBox p {\n  font-family: \"Cormorant SC\", serif;\n}\n\ninput, .read-more, .news li a, header li a, #realtimeFiltersAndSorting button, #search-filters button, #reset-all {\n  font-family: \"Lora\", serif;\n}\n\n.search-form {\n  position: fixed;\n  top: 50%;\n  color: white;\n}\n\n.content-loader {\n  background-color: transparent;\n  height: 50%;\n  position: absolute;\n}\n.content-loader .ball {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(47, 163, 56);\n  border-radius: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong2 0.7s linear infinite alternate, moveBarPingPongColorShift2 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader[data-text]::before {\n  position: absolute;\n}\n.content-loader.loader.is-active::before {\n  position: absolute;\n  width: 50%;\n  left: 25%;\n  top: 39%;\n  font-size: 2.7rem;\n  color: rgb(195, 168, 126);\n  background-color: transparent;\n}\n.content-loader.loader-bar-ping-pong::after {\n  width: 1.2rem;\n  height: 1.2rem;\n  background-color: rgb(101, 148, 187);\n  -webkit-animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n          animation: moveBarPingPong 0.7s linear infinite alternate, moveBarPingPongColorShift 0.8s ease-in-out infinite alternate;\n}\n.content-loader.loader.is-active {\n  height: 97%;\n  z-index: 0;\n  background-color: rgba(51, 49, 56, 0.7490196078);\n  -webkit-animation: blink 1.8s linear infinite alternate;\n          animation: blink 1.8s linear infinite alternate;\n}\n\n@-webkit-keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  50% {\n    opacity: 0.75;\n  }\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@keyframes moveBarPingPong {\n  0% {\n    left: 40%;\n  }\n  100% {\n    left: 60%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@keyframes moveBarPingPongColorShift {\n  0% {\n    background-color: rgba(72, 68, 82, 0.75);\n  }\n  50% {\n    background-color: rgba(102, 78, 122, 0.75);\n  }\n  100% {\n    background-color: rgba(149, 93, 168, 0.75);\n  }\n}\n@-webkit-keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@keyframes moveBarPingPong2 {\n  0% {\n    left: 43%;\n  }\n  100% {\n    left: 63%;\n  }\n}\n@-webkit-keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n@keyframes moveBarPingPongColorShift2 {\n  0% {\n    background-color: rgb(47, 163, 56);\n  }\n  50% {\n    background-color: rgb(87, 143, 56);\n  }\n  100% {\n    background-color: rgb(126, 131, 58);\n  }\n}\n#all-news-container {\n  height: 85%;\n  top: 9%;\n  width: 95%;\n  left: 2.5%;\n  background-color: rgba(37, 35, 34, 0.75);\n  position: absolute;\n  display: flex;\n  color: aliceblue;\n}\n#all-news-container button {\n  color: antiquewhite;\n}\n#all-news-container #media-container, #all-news-container #filters-and-links-container, #all-news-container #selected-news-container {\n  position: relative;\n  height: 100%;\n}\n#all-news-container #filters-and-links-container {\n  border: 0.2rem solid rgba(212, 193, 130, 0.4);\n  border-left: none;\n  padding-left: 1.5rem;\n  display: grid;\n  grid-template-areas: \"realtimeFiltersAndSorting\" \"searchFilters\" \"resetAll\";\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting {\n  grid-area: realtimeFiltersAndSorting;\n  display: grid;\n  margin-top: 1.5rem;\n  grid-template-areas: \"headingRFS headingRFS\" \"orderBy toggleType\" \"filterDate filterDate\";\n  width: 100%;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting button, #all-news-container #filters-and-links-container #realtime-filters-and-sorting label {\n  font-size: 1.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting h2 {\n  grid-area: headingRFS;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #order-by {\n  grid-area: orderBy;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #toggle-type {\n  grid-area: toggleType;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date {\n  grid-area: filterDate;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting #filter-date div ul {\n  display: flex;\n  gap: 3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul {\n  padding-left: 0.3rem;\n}\n#all-news-container #filters-and-links-container #realtime-filters-and-sorting ul li {\n  margin-top: 0.5rem;\n}\n#all-news-container #filters-and-links-container #search-filters {\n  grid-area: searchFilters;\n  display: grid;\n  grid-template-areas: \"headingSF headingSF headingSF\" \"newsSearch newsSearch newsSearch\" \"caseSensitive fullWordOnly wordStartOnly\" \"includeTitle includeDescription ...\";\n}\n#all-news-container #filters-and-links-container #search-filters h2 {\n  grid-area: headingSF;\n}\n#all-news-container #filters-and-links-container #search-filters button {\n  font-size: 1.2rem;\n  text-align: left;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container {\n  grid-area: newsSearch;\n}\n#all-news-container #filters-and-links-container #search-filters #news-search-container #news-search {\n  font-size: 1.15rem;\n  height: 2.3rem;\n  width: 18rem;\n}\n#all-news-container #filters-and-links-container #search-filters #full-word-only {\n  grid-area: fullWordOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only {\n  grid-area: wordStartOnly;\n}\n#all-news-container #filters-and-links-container #search-filters #case-sensitive {\n  grid-area: caseSensitive;\n}\n#all-news-container #filters-and-links-container #search-filters #include-title {\n  grid-area: includeTitle;\n}\n#all-news-container #filters-and-links-container #search-filters #include-description {\n  grid-area: includeDescription;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive, #all-news-container #filters-and-links-container #search-filters button.inactive {\n  pointer-events: none;\n}\n#all-news-container #filters-and-links-container #search-filters #word-start-only.inactive span, #all-news-container #filters-and-links-container #search-filters button.inactive span {\n  color: red;\n}\n#all-news-container #filters-and-links-container button, #all-news-container #filters-and-links-container select, #all-news-container #filters-and-links-container label {\n  font-size: 1.1rem;\n}\n#all-news-container #filters-and-links-container #reset-all {\n  font-size: 1.4rem;\n  grid-area: resetAll;\n}\n#all-news-container #filters-and-links-container button {\n  cursor: pointer;\n}\n#all-news-container #filters-and-links-container h3 {\n  font-size: 1.7rem;\n}\n#all-news-container #filters-and-links-container h4 {\n  font-size: 1.5rem;\n  margin-bottom: 0.8rem;\n}\n#all-news-container #selected-news-container {\n  width: 66%;\n  display: grid;\n  grid-template-rows: 10% 84% 6%;\n  border: 0.2rem solid rgb(180, 174, 164);\n}\n#all-news-container #selected-news-container h2 {\n  width: 100%;\n  text-align: center;\n  font-size: 3rem;\n  margin-bottom: 1rem;\n  border-bottom: 0.3rem solid rgb(185, 158, 122);\n}\n#all-news-container #selected-news-container #dismiss-selection {\n  position: absolute;\n}\n#all-news-container #selected-news-container #dismiss-selection.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #selected-news-reciever {\n  margin-bottom: 0.5rem;\n  padding-right: 2rem;\n  overflow: auto;\n}\n#all-news-container #selected-news-container #full-display-container {\n  padding-left: 2rem;\n}\n#all-news-container #selected-news-container #main-display.dismissed, #all-news-container #selected-news-container #full-display-container.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #selected-news-container #main-display .news, #all-news-container #selected-news-container #full-display-container .news {\n  font-size: 1.2rem;\n  padding-top: 0;\n}\n#all-news-container #selected-news-container #main-display .news::after, #all-news-container #selected-news-container #full-display-container .news::after {\n  content: \" \";\n  display: block;\n  height: 1rem;\n  clear: both;\n}\n#all-news-container #selected-news-container #main-display .news img, #all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news img, #all-news-container #selected-news-container #full-display-container .news iframe {\n  float: left;\n  margin-right: 2%;\n}\n#all-news-container #selected-news-container #main-display .news p, #all-news-container #selected-news-container #full-display-container .news p {\n  line-height: 1.2rem;\n}\n#all-news-container #selected-news-container #main-display .news iframe, #all-news-container #selected-news-container #full-display-container .news iframe {\n  width: 150px;\n  height: 100px;\n}\n#all-news-container #selected-news-container #main-display ul li, #all-news-container #selected-news-container #full-display-container ul li {\n  list-style-type: circle;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link, #all-news-container #selected-news-container #main-display ul li .relationship-link, #all-news-container #selected-news-container #full-display-container ul li .see-more-link, #all-news-container #selected-news-container #full-display-container ul li .relationship-link {\n  cursor: pointer;\n}\n#all-news-container #selected-news-container #main-display ul li .see-more-link.dismissed, #all-news-container #selected-news-container #main-display ul li .relationship-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .see-more-link.dismissed, #all-news-container #selected-news-container #full-display-container ul li .relationship-link.dismissed {\n  display: none;\n}\n#all-news-container #filters-and-links-container {\n  width: 36%;\n  padding-top: 1rem;\n}\n#all-news-container #pagination-holder {\n  width: 100%;\n}\n#all-news-container #pagination-holder.dismissed {\n  display: none;\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n#all-news-container #pagination-holder .content-pages a {\n  cursor: pointer;\n  font-size: 1.9rem;\n  margin-left: 0.5rem;\n}\n#all-news-container #pagination-holder .content-pages a.hidden, #all-news-container #pagination-holder .content-pages a.selectedPage {\n  pointer-events: none;\n}\n#all-news-container #pagination-holder .content-pages a.hidden {\n  opacity: 0;\n}\n\n#media-reciever {\n  display: none;\n  position: fixed;\n  background-color: rgba(10, 10, 10, 0.8);\n  top: 7%;\n  width: 100%;\n  height: 95%;\n  z-index: 1;\n}\n#media-reciever #current-media {\n  margin-left: 14rem;\n  position: absolute;\n  top: 3rem;\n  height: 45rem;\n  width: 80rem;\n}\n#media-reciever #current-media iframe, #media-reciever #current-media img {\n  width: 100%;\n  height: 100%;\n}\n#media-reciever #current-media #play-button-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: absolute;\n  height: 100%;\n  width: 100%;\n}\n#media-reciever #current-media #play-button-container #play-button {\n  height: 6rem;\n  width: 9rem;\n  background-color: rgba(99, 100, 179, 0.8);\n  position: absolute;\n  border-radius: 35%;\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  transition: opacity 0.2s ease;\n}\n#media-reciever #current-media #play-button-container #play-button div {\n  border-left: 3rem solid rgb(125, 150, 168);\n  border-top: 1.7rem solid transparent;\n  border-bottom: 1.7rem solid transparent;\n}\n#media-reciever #current-media #play-button-container #play-button:hover {\n  opacity: 0.7;\n}\n#media-reciever #current-media.center-display {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface {\n  display: flex;\n  flex-direction: column;\n  position: absolute;\n  height: 82%;\n  overflow: auto;\n  right: 2rem;\n  top: 3rem;\n}\n#media-reciever #media-selection-interface #media-menu {\n  font-size: 1.2rem;\n  display: flex;\n}\n#media-reciever #media-selection-interface #media-menu a {\n  color: azure;\n  margin-left: 2rem;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-menu a.active {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column {\n  max-width: 380px;\n  display: flex;\n  flex-direction: column;\n  overflow: auto;\n}\n#media-reciever #media-selection-interface #media-column .media-selection {\n  display: flex;\n  margin-top: 1rem;\n  width: 100%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb {\n  width: 45%;\n  cursor: pointer;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-thumb.selected {\n  filter: contrast(48%);\n  pointer-events: none;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information {\n  display: flex;\n  flex-direction: column;\n  margin-left: 1rem;\n  width: 55%;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p {\n  margin: 0;\n  color: beige;\n}\n#media-reciever #media-selection-interface #media-column .media-selection .media-information p:nth-of-type(2) {\n  margin-top: 1rem;\n}\n#media-reciever #media-selection-interface #media-pagination {\n  margin-top: 1.5rem;\n  color: aliceblue;\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n#media-reciever #media-selection-interface #media-pagination a {\n  font-size: 1.2rem;\n  margin-left: 1rem;\n}\n#media-reciever #media-close {\n  position: absolute;\n  color: white;\n  left: 3.5rem;\n  top: 3.5rem;\n  font-size: 3.5rem;\n  cursor: pointer;\n}\n\n.media-card:hover img, .property-media-card:hover img {\n  filter: brightness(50%);\n  cursor: pointer;\n}\n.media-card:hover h3, .media-card:hover p, .media-card:hover button, .property-media-card:hover h3, .property-media-card:hover p, .property-media-card:hover button {\n  filter: contrast(40%);\n  cursor: pointer;\n}\n\n.loader {\n  color: #fff;\n  position: fixed;\n  box-sizing: border-box;\n  left: -9999px;\n  top: -9999px;\n  width: 0;\n  height: 0;\n  overflow: hidden;\n  z-index: 999999;\n}\n\n.loader:after, .loader:before {\n  box-sizing: border-box;\n  display: none;\n}\n\n.loader.is-active {\n  background-color: rgba(0, 0, 0, 0.85);\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.loader.is-active:after, .loader.is-active:before {\n  display: block;\n}\n\n@-webkit-keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n\n@keyframes rotation {\n  0% {\n    transform: rotate(0);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n@keyframes blink {\n  0% {\n    opacity: 0.5;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.loader[data-text]:before {\n  position: fixed;\n  left: 0;\n  top: 50%;\n  color: currentColor;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  width: 100%;\n  font-size: 14px;\n}\n\n.loader[data-text=\"\"]:before {\n  content: \"Loading\";\n}\n\n.loader[data-text]:not([data-text=\"\"]):before {\n  content: attr(data-text);\n}\n\n.loader[data-text][data-blink]:before {\n  -webkit-animation: blink 1s linear infinite alternate;\n          animation: blink 1s linear infinite alternate;\n}\n\n.loader-default[data-text]:before {\n  top: calc(50% - 63px);\n}\n\n.loader-default:after {\n  content: \"\";\n  position: fixed;\n  width: 48px;\n  height: 48px;\n  border: 8px solid #fff;\n  border-left-color: transparent;\n  border-radius: 50%;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-default[data-half]:after {\n  border-right-color: transparent;\n}\n\n.loader-default[data-inverse]:after {\n  animation-direction: reverse;\n}\n\n.loader-double:after, .loader-double:before {\n  content: \"\";\n  position: fixed;\n  border-radius: 50%;\n  border: 8px solid;\n  -webkit-animation: rotation 1s linear infinite;\n          animation: rotation 1s linear infinite;\n}\n\n.loader-double:after {\n  width: 48px;\n  height: 48px;\n  border-color: #fff;\n  border-left-color: transparent;\n  top: calc(50% - 24px);\n  left: calc(50% - 24px);\n}\n\n.loader-double:before {\n  width: 64px;\n  height: 64px;\n  border-color: #eb974e;\n  border-right-color: transparent;\n  -webkit-animation-duration: 2s;\n          animation-duration: 2s;\n  top: calc(50% - 32px);\n  left: calc(50% - 32px);\n}\n\n.loader-bar[data-text]:before {\n  top: calc(50% - 40px);\n  color: #fff;\n}\n\n.loader-bar:after {\n  content: \"\";\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  width: 200px;\n  height: 20px;\n  transform: translate(-50%, -50%);\n  background: linear-gradient(-45deg, #4183d7 25%, #52b3d9 0, #52b3d9 50%, #4183d7 0, #4183d7 75%, #52b3d9 0, #52b3d9);\n  background-size: 20px 20px;\n  box-shadow: inset 0 10px 0 hsla(0, 0%, 100%, 0.2), 0 0 0 5px rgba(0, 0, 0, 0.2);\n  animation: moveBar 1.5s linear infinite reverse;\n}\n\n.loader-bar[data-rounded]:after {\n  border-radius: 15px;\n}\n\n.loader-bar[data-inverse]:after {\n  -webkit-animation-direction: normal;\n          animation-direction: normal;\n}\n\n@-webkit-keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n\n@keyframes moveBar {\n  0% {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 20px 20px;\n  }\n}\n.loader-bar-ping-pong:before {\n  width: 200px;\n  background-color: #000;\n}\n\n.loader-bar-ping-pong:after, .loader-bar-ping-pong:before {\n  content: \"\";\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 100px);\n}\n\n.loader-bar-ping-pong:after {\n  width: 50px;\n  background-color: #f19;\n  -webkit-animation: moveBarPingPong 0.5s linear infinite alternate;\n          animation: moveBarPingPong 0.5s linear infinite alternate;\n}\n\n.loader-bar-ping-pong[data-rounded]:before {\n  border-radius: 10px;\n}\n\n.loader-bar-ping-pong[data-rounded]:after {\n  border-radius: 50%;\n  width: 20px;\n  -webkit-animation-name: moveBarPingPongRounded;\n          animation-name: moveBarPingPongRounded;\n}\n\n@keyframes moveBarPingPong {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 50px);\n  }\n}\n@-webkit-keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@keyframes moveBarPingPongRounded {\n  0% {\n    left: calc(50% - 100px);\n  }\n  to {\n    left: calc(50% + 80px);\n  }\n}\n@-webkit-keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n@keyframes corners {\n  6% {\n    width: 60px;\n    height: 15px;\n  }\n  25% {\n    width: 15px;\n    height: 15px;\n    left: calc(100% - 15px);\n    top: 0;\n  }\n  31% {\n    height: 60px;\n  }\n  50% {\n    height: 15px;\n    top: calc(100% - 15px);\n    left: calc(100% - 15px);\n  }\n  56% {\n    width: 60px;\n  }\n  75% {\n    width: 15px;\n    left: 0;\n    top: calc(100% - 15px);\n  }\n  81% {\n    height: 60px;\n  }\n}\n.loader-border[data-text]:before {\n  color: #fff;\n}\n\n.loader-border:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 15px;\n  height: 15px;\n  background-color: #ff0;\n  -webkit-animation: corners 3s ease both infinite;\n          animation: corners 3s ease both infinite;\n}\n\n.loader-ball:before {\n  content: \"\";\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 50%;\n  left: 50%;\n  margin: -25px 0 0 -25px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: kickBall 1s infinite alternate ease-in both;\n          animation: kickBall 1s infinite alternate ease-in both;\n}\n\n.loader-ball[data-shadow]:before {\n  box-shadow: inset -5px -5px 10px 0 rgba(0, 0, 0, 0.5);\n}\n\n.loader-ball:after {\n  content: \"\";\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.3);\n  border-radius: 50%;\n  width: 45px;\n  height: 20px;\n  top: calc(50% + 10px);\n  left: 50%;\n  margin: 0 0 0 -22.5px;\n  z-index: 0;\n  -webkit-animation: shadow 1s infinite alternate ease-out both;\n          animation: shadow 1s infinite alternate ease-out both;\n}\n\n@-webkit-keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n\n@keyframes shadow {\n  0% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  40% {\n    background-color: transparent;\n    transform: scale(0);\n  }\n  95% {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n  to {\n    background-color: rgba(0, 0, 0, 0.75);\n    transform: scale(1);\n  }\n}\n@-webkit-keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n@keyframes kickBall {\n  0% {\n    transform: translateY(-80px) scaleX(0.95);\n  }\n  90% {\n    border-radius: 50%;\n  }\n  to {\n    transform: translateY(0) scaleX(1);\n    border-radius: 50% 50% 20% 20%;\n  }\n}\n.loader-smartphone:after {\n  content: \"\";\n  color: #fff;\n  font-size: 12px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-align: center;\n  line-height: 120px;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  width: 70px;\n  height: 130px;\n  margin: -65px 0 0 -35px;\n  border: 5px solid #fd0;\n  border-radius: 10px;\n  box-shadow: inset 0 5px 0 0 #fd0;\n  background: radial-gradient(circle at 50% 90%, rgba(0, 0, 0, 0.5) 6px, transparent 0), linear-gradient(0deg, #fd0 22px, transparent 0), linear-gradient(0deg, rgba(0, 0, 0, 0.5) 22px, rgba(0, 0, 0, 0.5));\n  -webkit-animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n          animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both infinite;\n}\n\n.loader-smartphone[data-screen=\"\"]:after {\n  content: \"Loading\";\n}\n\n.loader-smartphone:not([data-screen=\"\"]):after {\n  content: attr(data-screen);\n}\n\n@-webkit-keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n\n@keyframes shake {\n  5% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  10% {\n    transform: translate3d(1px, 0, 0);\n  }\n  15% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  20% {\n    transform: translate3d(1px, 0, 0);\n  }\n  25% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  30% {\n    transform: translate3d(1px, 0, 0);\n  }\n  35% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  40% {\n    transform: translate3d(1px, 0, 0);\n  }\n  45% {\n    transform: translate3d(-1px, 0, 0);\n  }\n  50% {\n    transform: translate3d(1px, 0, 0);\n  }\n  55% {\n    transform: translate3d(-1px, 0, 0);\n  }\n}\n.loader-clock:before {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  margin: -60px 0 0 -60px;\n  background: linear-gradient(180deg, transparent 50%, #f5f5f5 0), linear-gradient(90deg, transparent 55px, #2ecc71 0, #2ecc71 65px, transparent 0), linear-gradient(180deg, #f5f5f5 50%, #f5f5f5 0);\n  box-shadow: inset 0 0 0 10px #f5f5f5, 0 0 0 5px #555, 0 0 0 10px #7b7b7b;\n  -webkit-animation: rotation infinite 2s linear;\n          animation: rotation infinite 2s linear;\n}\n\n.loader-clock:after, .loader-clock:before {\n  content: \"\";\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  overflow: hidden;\n}\n\n.loader-clock:after {\n  width: 60px;\n  height: 40px;\n  margin: -20px 0 0 -15px;\n  border-radius: 20px 0 0 20px;\n  background: radial-gradient(circle at 14px 20px, #25a25a 10px, transparent 0), radial-gradient(circle at 14px 20px, #1b7943 14px, transparent 0), linear-gradient(180deg, transparent 15px, #2ecc71 0, #2ecc71 25px, transparent 0);\n  -webkit-animation: rotation infinite 24s linear;\n          animation: rotation infinite 24s linear;\n  transform-origin: 15px center;\n}\n\n.loader-curtain:after, .loader-curtain:before {\n  position: fixed;\n  width: 100%;\n  top: 50%;\n  margin-top: -35px;\n  font-size: 70px;\n  text-align: center;\n  font-family: Helvetica, Arial, sans-serif;\n  overflow: hidden;\n  line-height: 1.2;\n  content: \"Loading\";\n}\n\n.loader-curtain:before {\n  color: #666;\n}\n\n.loader-curtain:after {\n  color: #fff;\n  height: 0;\n  -webkit-animation: curtain 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both;\n}\n\n.loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):after, .loader-curtain[data-curtain-text]:not([data-curtain-text=\"\"]):before {\n  content: attr(data-curtain-text);\n}\n\n.loader-curtain[data-brazilian]:before {\n  color: #f1c40f;\n}\n\n.loader-curtain[data-brazilian]:after {\n  color: #2ecc71;\n}\n\n.loader-curtain[data-colorful]:before {\n  -webkit-animation: maskColorful 2s linear infinite alternate both;\n          animation: maskColorful 2s linear infinite alternate both;\n}\n\n.loader-curtain[data-colorful]:after {\n  -webkit-animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n          animation: curtain 1s linear infinite alternate both, maskColorful-front 2s 1s linear infinite alternate both;\n  color: #000;\n}\n\n@-webkit-keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n\n@keyframes maskColorful {\n  0% {\n    color: #3498db;\n  }\n  49.5% {\n    color: #3498db;\n  }\n  50.5% {\n    color: #e74c3c;\n  }\n  to {\n    color: #e74c3c;\n  }\n}\n@-webkit-keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@keyframes maskColorful-front {\n  0% {\n    color: #2ecc71;\n  }\n  49.5% {\n    color: #2ecc71;\n  }\n  50.5% {\n    color: #f1c40f;\n  }\n  to {\n    color: #f1c40f;\n  }\n}\n@-webkit-keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n@keyframes curtain {\n  0% {\n    height: 0;\n  }\n  to {\n    height: 84px;\n  }\n}\n.loader-music:after, .loader-music:before {\n  content: \"\";\n  position: fixed;\n  width: 240px;\n  height: 240px;\n  top: 50%;\n  left: 50%;\n  margin: -120px 0 0 -120px;\n  border-radius: 50%;\n  text-align: center;\n  line-height: 240px;\n  color: #fff;\n  font-size: 40px;\n  font-family: Helvetica, Arial, sans-serif;\n  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);\n  letter-spacing: -1px;\n}\n\n.loader-music:after {\n  -webkit-backface-visibility: hidden;\n          backface-visibility: hidden;\n}\n\n.loader-music[data-hey-oh]:after, .loader-music[data-hey-oh]:before {\n  box-shadow: 0 0 0 10px;\n}\n\n.loader-music[data-hey-oh]:before {\n  background-color: #fff;\n  color: #000;\n  -webkit-animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, oh 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-hey-oh]:after {\n  background-color: #000;\n  -webkit-animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n          animation: coin 2.5s linear infinite, hey 5s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after, .loader-music[data-no-cry]:before {\n  background: linear-gradient(45deg, #009b3a 50%, #fed100 51%);\n  box-shadow: 0 0 0 10px #000;\n}\n\n.loader-music[data-no-cry]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, cry 5s 1.25s linear infinite both;\n}\n\n.loader-music[data-no-cry]:after {\n  -webkit-animation: coin 2.5s linear infinite, no 5s linear infinite both;\n          animation: coin 2.5s linear infinite, no 5s linear infinite both;\n}\n\n.loader-music[data-we-are]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, theWorld 5s 1.25s linear infinite both;\n  background: radial-gradient(ellipse at center, #4ecdc4 0, #556270);\n}\n\n.loader-music[data-we-are]:after {\n  -webkit-animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weAre 5s linear infinite both;\n  background: radial-gradient(ellipse at center, #26d0ce 0, #1a2980);\n}\n\n.loader-music[data-rock-you]:before {\n  -webkit-animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n          animation: coinBack 2.5s linear infinite, rockYou 5s 1.25s linear infinite both;\n  background: #444;\n}\n\n.loader-music[data-rock-you]:after {\n  -webkit-animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n          animation: coin 2.5s linear infinite, weWill 5s linear infinite both;\n  background: #96281b;\n}\n\n@-webkit-keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n\n@keyframes coin {\n  to {\n    transform: rotateY(359deg);\n  }\n}\n@-webkit-keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@keyframes coinBack {\n  0% {\n    transform: rotateY(180deg);\n  }\n  50% {\n    transform: rotateY(1turn);\n  }\n  to {\n    transform: rotateY(180deg);\n  }\n}\n@-webkit-keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@keyframes hey {\n  0% {\n    content: \"Hey!\";\n  }\n  50% {\n    content: \"Let's!\";\n  }\n  to {\n    content: \"Hey!\";\n  }\n}\n@-webkit-keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@keyframes oh {\n  0% {\n    content: \"Oh!\";\n  }\n  50% {\n    content: \"Go!\";\n  }\n  to {\n    content: \"Oh!\";\n  }\n}\n@-webkit-keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@keyframes no {\n  0% {\n    content: \"No...\";\n  }\n  50% {\n    content: \"no\";\n  }\n  to {\n    content: \"No...\";\n  }\n}\n@-webkit-keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@keyframes cry {\n  0% {\n    content: \"woman\";\n  }\n  50% {\n    content: \"cry!\";\n  }\n  to {\n    content: \"woman\";\n  }\n}\n@-webkit-keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@keyframes weAre {\n  0% {\n    content: \"We are\";\n  }\n  50% {\n    content: \"we are\";\n  }\n  to {\n    content: \"We are\";\n  }\n}\n@-webkit-keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@keyframes theWorld {\n  0% {\n    content: \"the world,\";\n  }\n  50% {\n    content: \"the children!\";\n  }\n  to {\n    content: \"the world,\";\n  }\n}\n@-webkit-keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@keyframes weWill {\n  0% {\n    content: \"We will,\";\n  }\n  50% {\n    content: \"rock you!\";\n  }\n  to {\n    content: \"We will,\";\n  }\n}\n@-webkit-keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n@keyframes rockYou {\n  0% {\n    content: \"we will\";\n  }\n  50% {\n    content: \"🤘\";\n  }\n  to {\n    content: \"we will\";\n  }\n}\n.loader-pokeball:before {\n  content: \"\";\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  top: 50%;\n  left: 50%;\n  margin: -50px 0 0 -50px;\n  background: linear-gradient(180deg, red 42%, #000 0, #000 58%, #fff 0);\n  background-repeat: no-repeat;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 1;\n  -webkit-animation: movePokeball 1s linear infinite both;\n          animation: movePokeball 1s linear infinite both;\n}\n\n.loader-pokeball:after {\n  content: \"\";\n  position: absolute;\n  width: 24px;\n  height: 24px;\n  top: 50%;\n  left: 50%;\n  margin: -12px 0 0 -12px;\n  background-color: #fff;\n  border-radius: 50%;\n  z-index: 2;\n  -webkit-animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n          animation: movePokeball 1s linear infinite both, flashPokeball 0.5s infinite alternate;\n  border: 2px solid #000;\n  box-shadow: 0 0 0 5px #fff, 0 0 0 10px #000;\n}\n\n@-webkit-keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n\n@keyframes movePokeball {\n  0% {\n    transform: translateX(0) rotate(0);\n  }\n  15% {\n    transform: translatex(-10px) rotate(-5deg);\n  }\n  30% {\n    transform: translateX(10px) rotate(5deg);\n  }\n  45% {\n    transform: translatex(0) rotate(0);\n  }\n}\n@-webkit-keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n@keyframes flashPokeball {\n  0% {\n    background-color: #fff;\n  }\n  to {\n    background-color: #fd0;\n  }\n}\n.loader-bouncing:after, .loader-bouncing:before {\n  content: \"\";\n  width: 20px;\n  height: 20px;\n  position: absolute;\n  top: calc(50% - 10px);\n  left: calc(50% - 10px);\n  border-radius: 50%;\n  background-color: #fff;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:after {\n  margin-left: -30px;\n  -webkit-animation: kick 0.6s infinite alternate;\n          animation: kick 0.6s infinite alternate;\n}\n\n.loader-bouncing:before {\n  -webkit-animation-delay: 0.2s;\n          animation-delay: 0.2s;\n}\n\n@-webkit-keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n\n@keyframes kick {\n  0% {\n    opacity: 1;\n    transform: translateY(0);\n  }\n  to {\n    opacity: 0.3;\n    transform: translateY(-1rem);\n  }\n}\n.sbl-circ-ripple {\n  height: 48px;\n  width: 48px;\n  color: #48659b;\n  border-radius: 50%;\n  position: relative;\n  display: inline-block;\n  top: 20%;\n  left: 40%;\n}\n\n.sbl-circ-ripple::after, .sbl-circ-ripple::before {\n  content: \"\";\n  height: 0;\n  width: 0;\n  border: inherit;\n  border: 5px solid;\n  border-radius: inherit;\n  position: absolute;\n  left: 40%;\n  top: 40%;\n  -webkit-animation: circle-ripple 1s linear infinite;\n          animation: circle-ripple 1s linear infinite;\n}\n\n.sbl-circ-ripple::before {\n  -webkit-animation-delay: -0.6s;\n          animation-delay: -0.6s;\n}\n\n@-webkit-keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}\n\n@keyframes circle-ripple {\n  0% {\n    height: 0;\n    width: 0;\n    left: 1.6rem;\n    top: 1.6rem;\n  }\n  100% {\n    height: 5rem;\n    width: 5rem;\n    left: -1rem;\n    top: -1rem;\n    opacity: 0;\n  }\n}/*# sourceMappingURL=style.css.map */", "",{"version":3,"sources":["webpack://./css/style.css","webpack://./css/base/_customBase.scss","webpack://./css/base/_mixins.scss","webpack://./css/modules/_footer.scss","webpack://./css/modules/_opening.scss","webpack://./css/modules/_properties.scss","webpack://./css/modules/_single.scss","webpack://./css/modules/_constant.scss","webpack://./css/modules/_search.scss","webpack://./css/modules/_loader.scss","webpack://./css/modules/_all-news.scss","webpack://./css/modules/_shadow-box.scss","webpack://./css/downloads/css-loader.css","webpack://./css/downloads/sbl-circ-ripple.css"],"names":[],"mappings":"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","sourceRoot":""}]);
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
        //I think that I need to delay clickability for touch, otherwise can click when bringing up
        //Also, perhaps I need to add a symbol to indicate that you can bring up options 
        
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVcsVUFBVSxZQUFZLFdBQVcsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssTUFBTSxNQUFNLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsWUFBWSxXQUFXLE1BQU0sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLE9BQU8sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsT0FBTyxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxLQUFLLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsTUFBTSxNQUFNLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxPQUFPLE1BQU0sS0FBSyxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxXQUFXLE1BQU0sTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sS0FBSyxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLEtBQUssTUFBTSxLQUFLLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxLQUFLLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE1BQU0sT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLFVBQVUsS0FBSyxNQUFNLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxhQUFhLFlBQVksV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxVQUFVLEtBQUssTUFBTSxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFlBQVksV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxNQUFNLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxZQUFZLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxZQUFZLFlBQVksYUFBYSxZQUFZLFlBQVksVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxVQUFVLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFFBQVEsS0FBSyxZQUFZLEtBQUssS0FBSyxXQUFXLFVBQVUsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxjQUFjLGNBQWMsZUFBZSxjQUFjLGNBQWMsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsV0FBVyxXQUFXLFNBQVMsUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxNQUFNLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsS0FBSyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsWUFBWSxZQUFZLGFBQWEsYUFBYSxhQUFhLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLFFBQVEsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLGNBQWMsY0FBYyxlQUFlLGVBQWUsY0FBYyxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsU0FBUyxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFlBQVksS0FBSyxLQUFLLFdBQVcsVUFBVSxZQUFZLFlBQVksYUFBYSxhQUFhLGFBQWEsVUFBVSxXQUFXLFFBQVEsUUFBUSxVQUFVLFdBQVcsV0FBVyxVQUFVLGNBQWMsY0FBYyxlQUFlLGNBQWMsY0FBYyxXQUFXLFFBQVEsUUFBUSxZQUFZLGFBQWEsV0FBVyxRQUFRLFFBQVEsVUFBVSxTQUFTLFFBQVEsS0FBSyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsTUFBTSxRQUFRLEtBQUssV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLEtBQUssWUFBWSxLQUFLLEtBQUssV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxTQUFTLFFBQVEsS0FBSyxVQUFVLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsV0FBVyxZQUFZLFdBQVcsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLFFBQVEsVUFBVSxRQUFRLE1BQU0sUUFBUSxLQUFLLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxXQUFXLFlB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LE1BQU0sV0FBVyxLQUFLLEtBQUssTUFBTSxNQUFNLFdBQVcsS0FBSyxNQUFNLEtBQUssVUFBVSxVQUFVLEtBQUssTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sTUFBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLE9BQU8sVUFBVSxNQUFNLE1BQU0sTUFBTSxXQUFXLE1BQU0sS0FBSyxNQUFNLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE9BQU8sVUFBVSxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsT0FBTyxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLEtBQUssTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLEtBQUssV0FBVyxNQUFNLEtBQUssTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsV0FBVyxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxVQUFVLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sV0FBVyxVQUFVLE9BQU8sTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sTUFBTSxVQUFVLE1BQU0sTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsTUFBTSxNQUFNLFdBQVcsT0FBTyxNQUFNLFVBQVUsV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE1BQU0sTUFBTSxVQUFVLFVBQVUsT0FBTyxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sVUFBVSxNQUFNLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLFdBQVcsVUFBVSxPQUFPLE1BQU0sV0FBVyxXQUFXLE9BQU8sTUFBTSxVQUFVLE1BQU0sTUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLE1BQU0sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxXQUFXLFFBQVEsTUFBTSxXQUFXLFVBQVUsTUFBTSxNQUFNLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxXQUFXLE1BQU0sTUFBTSxNQUFNLFVBQVUsVUFBVSxNQUFNLEtBQUssTUFBTSxXQUFXLFdBQVcsV0FBVyxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sTUFBTSxVQUFVLFdBQVcsT0FBTyxNQUFNLFVBQVUsT0FBTyxNQUFNLFVBQVUsVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxPQUFPLE1BQU0sVUFBVSxVQUFVLE9BQU8sT0FBTyxNQUFNLFVBQVUsT0FBTyxLQUFLLE1BQU0sV0FBVyxVQUFVLFdBQVcsV0FBVyxRQUFRLE1BQU0sVUFBVSxVQUFVLE9BQU8sTUFBTSxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFVBQVUsTUFBTSxNQUFNLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxNQUFNLE1BQU0sVUFBVSxXQUFXLFdBQVcsVUFBVSxNQUFNLE1BQU0sV0FBVyxPQUFPLE1BQU0sV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxPQUFPLFVBQVUsVUFBVSxXQUFXLFVBQVUsT0FBTyxPQUFPLFdBQVcsV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFdBQVcsUUFBUSxPQUFPLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFdBQVcsT0FBTyxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLFFBQVEsT0FBTyxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsVUFBVSxXQUFXLFFBQVEsT0FBTyxLQUFLLFVBQVUsVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sVUFBVSxVQUFVLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFdBQVcsUUFBUSxPQUFPLFVBQVUsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sTUFBTSxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFVBQVUsT0FBTyxPQUFPLFVBQVUsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE9BQU8sT0FBTyxVQUFVLE9BQU8sS0FBSyxPQUFPLEtBQUssVUFBVSxPQUFPLE9BQU8sVUFBVSxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxPQUFPLFdBQVcsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSyxPQUFPLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsV0FBVyxVQUFVLFlBQVksUUFBUSxPQUFPLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxPQUFPLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFFBQVEsUUFBUSxXQUFXLFVBQVUsVUFBVSxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLE9BQU8sV0FBVyxRQUFRLFFBQVEsVUFBVSxRQUFRLE9BQU8sV0FBVyxPQUFPLE9BQU8sV0FBVyxXQUFXLE9BQU8sT0FBTyxVQUFVLE9BQU8sT0FBTyxXQUFXLE9BQU8sT0FBTyxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxVQUFVLFVBQVUsUUFBUSxRQUFRLFVBQVUsV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFFBQVEsUUFBUSxVQUFVLFFBQVEsT0FBTyxVQUFVLFdBQVcsT0FBTyxPQUFPLFVBQVUsT0FBTyxPQUFPLFVBQVUsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsT0FBTyxRQUFRLFVBQVUsV0FBVyxXQUFXLFFBQVEsUUFBUSxXQUFXLFFBQVEsUUFBUSxVQUFVLFNBQVMsT0FBTyxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLE9BQU8sT0FBTyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsT0FBTyxPQUFPLFVBQVUsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxXQUFXLFFBQVEsT0FBTyxVQUFVLFFBQVEsT0FBTyxVQUFVLFdBQVcsV0FBVyxPQUFPLE9BQU8sVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxRQUFRLE9BQU8sV0FBVyxXQUFXLFFBQVEsT0FBTyxXQUFXLFVBQVUsV0FBVyxVQUFVLE9BQU8sT0FBTyxVQUFVLFdBQVcsVUFBVSxRQUFRLFFBQVEsVUFBVSxVQUFVLFFBQVEsUUFBUSxXQUFXLFdBQVcsUUFBUSxRQUFRLFVBQVUsV0FBVyxXQUFXLFVBQVUsUUFBUSxRQUFRLFVBQVUsVUFBVSxRQUFRLFFBQVEsV0FBVyxRQUFRLE9BQU8sV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsT0FBTyxPQUFPLFdBQVcsV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsUUFBUSxPQUFPLFdBQVcsVUFBVSxPQUFPLE9BQU8sV0FBVyxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxTQUFTLFFBQVEsWUFBWSxXQUFXLFNBQVMsUUFBUSxZQUFZLFdBQVcsVUFBVSxVQUFVLFVBQVUsU0FBUyxRQUFRLFdBQVcsU0FBUyxRQUFRLE1BQU0sV0FBVyxRQUFRLFFBQVEsV0FBVyxRQUFRLE1BQU0sUUFBUSxNQUFNLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxLQUFLLFFBQVEsTUFBTSxVQUFVLFFBQVEsUUFBUSxVQUFVLFFBQVEsS0FBSyxRQUFRLFdBQVcsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsVUFBVSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsWUFBWSxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLFdBQVcsV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFVBQVUsU0FBUyxXQUFXLFdBQVcsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsVUFBVSxTQUFTLFNBQVMsVUFBVSxVQUFVLFdBQVcsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxXQUFXLFlBQVksU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsVUFBVSxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxVQUFVLFNBQVMsU0FBUyxVQUFVLFVBQVUsV0FBVyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFdBQVcsWUFBWSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxVQUFVLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFNBQVMsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFdBQVcsVUFBVSxTQUFTLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFdBQVcsV0FBVyxXQUFXLFVBQVUsU0FBUyxZQUFZLFVBQVUsU0FBUyxXQUFXLFdBQVcsWUFBWSxZQUFZLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsTUFBTSxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFlBQVksU0FBUyxTQUFTLFdBQVcsWUFBWSxTQUFTLFNBQVMsV0FBVyxZQUFZLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFlBQVksU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLFlBQVksVUFBVSxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxTQUFTLFdBQVcsVUFBVSxXQUFXLFlBQVksWUFBWSxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsV0FBVyxVQUFVLFNBQVMsV0FBVyxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFdBQVcsV0FBVyxVQUFVLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsTUFBTSxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsTUFBTSxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLE1BQU0sVUFBVSxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxNQUFNLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksWUFBWSxXQUFXLFVBQVUsV0FBVyxZQUFZLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxVQUFVLFNBQVMsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsWUFBWSxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFVBQVUsU0FBUyxZQUFZLFdBQVcsVUFBVSxTQUFTLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxZQUFZLFdBQVcsWUFBWSxVQUFVLFNBQVMsWUFBWSxXQUFXLFlBQVksVUFBVSxTQUFTLFlBQVksV0FBVyxZQUFZLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLEtBQUssVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLEtBQUssU0FBUyxLQUFLLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFVBQVUsU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxVQUFVLFNBQVMsS0FBSyxTQUFTLEtBQUssV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxLQUFLLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsS0FBSyxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLEtBQUssV0FBVyxTQUFTLFNBQVMsVUFBVSxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFVBQVUsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFLLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxVQUFVLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLFdBQVcsV0FBVyxXQUFXLFVBQVUsVUFBVSxVQUFVLFdBQVcsWUFBWSxZQUFZLFlBQVksWUFBWSxXQUFXLFdBQVcsV0FBVyxVQUFVLFNBQVMsV0FBVyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxZQUFZLFlBQVksV0FBVyxXQUFXLFdBQVcsWUFBWSxZQUFZLFVBQVUsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxNQUFNLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsU0FBUyxXQUFXLFNBQVMsS0FBSyxTQUFTLE1BQU0sV0FBVyxTQUFTLFNBQVMsV0FBVyxTQUFTLEtBQUssU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLFdBQVcsU0FBUyxLQUFL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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7OztVQ25IMUI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQzBCO0FBQ0Y7QUFDeEI7QUFDc0M7QUFDUTtBQUNSO0FBQ1M7QUFDSDtBQUM1QztBQUNBLG1CQUFtQix1REFBTTtBQUN6Qix1QkFBdUIsMkRBQVU7QUFDakMsaUJBQWlCLHlEQUFJO0FBQ3JCLHdCQUF3QiwyREFBVztBQUNuQyxzQkFBc0IsMERBQVMsRyIsInNvdXJjZXMiOlsid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9jYWgvLi9jc3MvZG90cy5jc3MiLCJ3ZWJwYWNrOi8vY2FoLy4vY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2NhaC8uL2Nzcy9kb3RzLmNzcz83NjQyIiwid2VicGFjazovL2NhaC8uL2Nzcy9zdHlsZS5jc3M/ZGExZiIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9jYWgvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vY2FoLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2NhaC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL2FsbC1uZXdzLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3BhZ2luYXRpb24uanMiLCJ3ZWJwYWNrOi8vY2FoLy4vc3JjL21vZHVsZXMvc2VhcmNoLmpzIiwid2VicGFjazovL2NhaC8uL3NyYy9tb2R1bGVzL3NoYWRvd0JveC5qcyIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvbW9kdWxlcy9zaW5nbGVQb3N0LmpzIiwid2VicGFjazovL2NhaC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vY2FoL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jYWgvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jYWgvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgY29uZmlnLnRyYW5zaXRpb25hbCAmJiBjb25maWcudHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWw7XG5cbiAgaWYgKHRyYW5zaXRpb25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsaWRhdG9yLmFzc2VydE9wdGlvbnModHJhbnNpdGlvbmFsLCB7XG4gICAgICBzaWxlbnRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKSxcbiAgICAgIGZvcmNlZEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKVxuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8vIGZpbHRlciBvdXQgc2tpcHBlZCBpbnRlcmNlcHRvcnNcbiAgdmFyIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHZhciBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSB0cnVlO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBpZiAodHlwZW9mIGludGVyY2VwdG9yLnJ1bldoZW4gPT09ICdmdW5jdGlvbicgJiYgaW50ZXJjZXB0b3IucnVuV2hlbihjb25maWcpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyAmJiBpbnRlcmNlcHRvci5zeW5jaHJvbm91cztcblxuICAgIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHByb21pc2U7XG5cbiAgaWYgKCFzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMpIHtcbiAgICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoY2hhaW4sIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluKTtcbiAgICBjaGFpbiA9IGNoYWluLmNvbmNhdChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4pO1xuXG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuXG4gIHZhciBuZXdDb25maWcgPSBjb25maWc7XG4gIHdoaWxlIChyZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICB2YXIgb25GdWxmaWxsZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHZhciBvblJlamVjdGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB0cnkge1xuICAgICAgbmV3Q29uZmlnID0gb25GdWxmaWxsZWQobmV3Q29uZmlnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgb25SZWplY3RlZChlcnJvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIHByb21pc2UgPSBkaXNwYXRjaFJlcXVlc3QobmV3Q29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG5cbiAgd2hpbGUgKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpLCByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCwgb3B0aW9ucykge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZCxcbiAgICBzeW5jaHJvbm91czogb3B0aW9ucyA/IG9wdGlvbnMuc3luY2hyb25vdXMgOiBmYWxzZSxcbiAgICBydW5XaGVuOiBvcHRpb25zID8gb3B0aW9ucy5ydW5XaGVuIDogbnVsbFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsO1xuICAgIHZhciBzaWxlbnRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuc2lsZW50SlNPTlBhcnNpbmc7XG4gICAgdmFyIGZvcmNlZEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5mb3JjZWRKU09OUGFyc2luZztcbiAgICB2YXIgc3RyaWN0SlNPTlBhcnNpbmcgPSAhc2lsZW50SlNPTlBhcnNpbmcgJiYgdGhpcy5yZXNwb25zZVR5cGUgPT09ICdqc29uJztcblxuICAgIGlmIChzdHJpY3RKU09OUGFyc2luZyB8fCAoZm9yY2VkSlNPTlBhcnNpbmcgJiYgdXRpbHMuaXNTdHJpbmcoZGF0YSkgJiYgZGF0YS5sZW5ndGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKHN0cmljdEpTT05QYXJzaW5nKSB7XG4gICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICAgICAgdGhyb3cgZW5oYW5jZUVycm9yKGUsIHRoaXMsICdFX0pTT05fUEFSU0UnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGtnID0gcmVxdWlyZSgnLi8uLi8uLi9wYWNrYWdlLmpzb24nKTtcblxudmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblsnb2JqZWN0JywgJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ3N0cmluZycsICdzeW1ib2wnXS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGkpIHtcbiAgdmFsaWRhdG9yc1t0eXBlXSA9IGZ1bmN0aW9uIHZhbGlkYXRvcih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09IHR5cGUgfHwgJ2EnICsgKGkgPCAxID8gJ24gJyA6ICcgJykgKyB0eXBlO1xuICB9O1xufSk7XG5cbnZhciBkZXByZWNhdGVkV2FybmluZ3MgPSB7fTtcbnZhciBjdXJyZW50VmVyQXJyID0gcGtnLnZlcnNpb24uc3BsaXQoJy4nKTtcblxuLyoqXG4gKiBDb21wYXJlIHBhY2thZ2UgdmVyc2lvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IHRoYW5WZXJzaW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNPbGRlclZlcnNpb24odmVyc2lvbiwgdGhhblZlcnNpb24pIHtcbiAgdmFyIHBrZ1ZlcnNpb25BcnIgPSB0aGFuVmVyc2lvbiA/IHRoYW5WZXJzaW9uLnNwbGl0KCcuJykgOiBjdXJyZW50VmVyQXJyO1xuICB2YXIgZGVzdFZlciA9IHZlcnNpb24uc3BsaXQoJy4nKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICBpZiAocGtnVmVyc2lvbkFycltpXSA+IGRlc3RWZXJbaV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAocGtnVmVyc2lvbkFycltpXSA8IGRlc3RWZXJbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7c3RyaW5nP30gdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIHZhciBpc0RlcHJlY2F0ZWQgPSB2ZXJzaW9uICYmIGlzT2xkZXJWZXJzaW9uKHZlcnNpb24pO1xuXG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBwa2cudmVyc2lvbiArICddIFRyYW5zaXRpb25hbCBvcHRpb24gXFwnJyArIG9wdCArICdcXCcnICsgZGVzYyArIChtZXNzYWdlID8gJy4gJyArIG1lc3NhZ2UgOiAnJyk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdCwgb3B0cykge1xuICAgIGlmICh2YWxpZGF0b3IgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0TWVzc2FnZShvcHQsICcgaGFzIGJlZW4gcmVtb3ZlZCBpbiAnICsgdmVyc2lvbikpO1xuICAgIH1cblxuICAgIGlmIChpc0RlcHJlY2F0ZWQgJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzT2xkZXJWZXJzaW9uOiBpc09sZGVyVmVyc2lvbixcbiAgYXNzZXJ0T3B0aW9uczogYXNzZXJ0T3B0aW9ucyxcbiAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnRyaW0gPyBzdHIudHJpbSgpIDogc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiQGNoYXJzZXQgXFxcIlVURi04XFxcIjtcXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEVsYXN0aWNcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1lbGFzdGljIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZWxhc3RpYyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWVsYXN0aWMgMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG4uZG90LWVsYXN0aWM6OmJlZm9yZSwgLmRvdC1lbGFzdGljOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1lbGFzdGljOjpiZWZvcmUge1xcbiAgbGVmdDogLTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWVsYXN0aWMtYmVmb3JlIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZWxhc3RpYy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG4uZG90LWVsYXN0aWM6OmFmdGVyIHtcXG4gIGxlZnQ6IDk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWVsYXN0aWMtYWZ0ZXIgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1lbGFzdGljLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1lbGFzdGljLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1lbGFzdGljLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDAuNjcpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWVsYXN0aWMge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZWxhc3RpYyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxLjUpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWVsYXN0aWMtYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMC42Nyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEuNSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAxKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZWxhc3RpYy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLCAwLjY3KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMS41KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFB1bHNlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtcHVsc2Uge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcHVsc2UgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuMjVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IDAuMjVzO1xcbn1cXG4uZG90LXB1bHNlOjpiZWZvcmUsIC5kb3QtcHVsc2U6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LXB1bHNlOjpiZWZvcmUge1xcbiAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1wdWxzZS1iZWZvcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlLWJlZm9yZSAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcXG59XFxuLmRvdC1wdWxzZTo6YWZ0ZXIge1xcbiAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtcHVsc2UtYWZ0ZXIgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXB1bHNlLWFmdGVyIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC41cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1wdWxzZS1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtcHVsc2UtYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAtNXB4O1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC01cHg7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtcHVsc2Uge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtcHVsc2Uge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDJweDtcXG4gIH1cXG4gIDYwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgLTVweDtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1wdWxzZS1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1wdWxzZS1hZnRlciB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIC01cHg7XFxuICB9XFxuICAzMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAycHg7XFxuICB9XFxuICA2MCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtNXB4O1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZsYXNoaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZmxhc2hpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBsaW5lYXIgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBsaW5lYXIgYWx0ZXJuYXRlO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC41cztcXG59XFxuLmRvdC1mbGFzaGluZzo6YmVmb3JlLCAuZG90LWZsYXNoaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG59XFxuLmRvdC1mbGFzaGluZzo6YmVmb3JlIHtcXG4gIGxlZnQ6IC05OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsYXNoaW5nIDFzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAwcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwcztcXG59XFxuLmRvdC1mbGFzaGluZzo6YWZ0ZXIge1xcbiAgbGVmdDogOTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxhc2hpbmcgMXMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mbGFzaGluZyAxcyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMXM7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmxhc2hpbmcge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlLCAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg2NSwgODgsIDk1LCAwLjIpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1mbGFzaGluZyB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICB9XFxuICA1MCUsIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDY1LCA4OCwgOTUsIDAuMik7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgQ29sbGlzaW9uXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtY29sbGlzaW9uIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1jb2xsaXNpb246OmJlZm9yZSwgLmRvdC1jb2xsaXNpb246OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWNvbGxpc2lvbjo6YmVmb3JlIHtcXG4gIGxlZnQ6IC01NXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1jb2xsaXNpb24tYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1iZWZvcmUgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuLmRvdC1jb2xsaXNpb246OmFmdGVyIHtcXG4gIGxlZnQ6IDU1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWNvbGxpc2lvbi1hZnRlciAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1jb2xsaXNpb24tYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLWRlbGF5OiAxcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAxcztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYmVmb3JlIHtcXG4gIDAlLCA1MCUsIDc1JSwgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtOTlweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWNvbGxpc2lvbi1iZWZvcmUge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC05OXB4KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYWZ0ZXIge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDk5cHgpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1jb2xsaXNpb24tYWZ0ZXIge1xcbiAgMCUsIDUwJSwgNzUlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDk5cHgpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFJldm9sdXRpb25cXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1yZXZvbHV0aW9uIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG59XFxuLmRvdC1yZXZvbHV0aW9uOjpiZWZvcmUsIC5kb3QtcmV2b2x1dGlvbjo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5kb3QtcmV2b2x1dGlvbjo6YmVmb3JlIHtcXG4gIGxlZnQ6IDA7XFxuICB0b3A6IC05OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMjcuNXB4IDEyNi41cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMS40cyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMS40cyBsaW5lYXIgaW5maW5pdGU7XFxufVxcbi5kb3QtcmV2b2x1dGlvbjo6YWZ0ZXIge1xcbiAgbGVmdDogMDtcXG4gIHRvcDogLTE5OHB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMjcuNXB4IDIyNS41cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXJldm9sdXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1yZXZvbHV0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1yZXZvbHV0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1yZXZvbHV0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IENhcm91c2VsXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtY2Fyb3VzZWwge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgbGVmdDogLTk5OTlweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1jYXJvdXNlbCAxLjVzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtY2Fyb3VzZWwgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtY2Fyb3VzZWwge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZiwgOTk5OXB4IDAgMCAxcHggIzQxNTg1ZiwgMTAwOThweCAwIDAgLTFweCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwOThweCAwIDAgLTFweCAjNDE1ODVmLCA5OTAwcHggMCAwIC0xcHggIzQxNTg1ZiwgOTk5OXB4IDAgMCAxcHggIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1jYXJvdXNlbCB7XFxuICAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDAgMCAtMXB4ICM0MTU4NWYsIDk5MDBweCAwIDAgLTFweCAjNDE1ODVmLCA5OTk5cHggMCAwIDFweCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5OTlweCAwIDAgMXB4ICM0MTU4NWYsIDEwMDk4cHggMCAwIC0xcHggIzQxNTg1ZiwgOTkwMHB4IDAgMCAtMXB4ICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgVHlwaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtdHlwaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtdHlwaW5nIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC10eXBpbmcgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtdHlwaW5nIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC0xMHB4IDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAtMTBweCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAtMTBweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtdHlwaW5nIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAwIDAgMCAjNDE1ODVmLCAxMDA5OHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxNi42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC0xMHB4IDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWYsIDk5OTlweCAtMTBweCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmLCA5OTk5cHggMCAwIDAgIzQxNTg1ZiwgMTAwOThweCAtMTBweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggMCAwIDAgIzQxNTg1ZiwgOTk5OXB4IDAgMCAwICM0MTU4NWYsIDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBXaW5kbWlsbFxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXdpbmRtaWxsIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHRvcDogLTEwcHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiA1cHggMTVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtd2luZG1pbGwgMnMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC13aW5kbWlsbCAycyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcbi5kb3Qtd2luZG1pbGw6OmJlZm9yZSwgLmRvdC13aW5kbWlsbDo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxufVxcbi5kb3Qtd2luZG1pbGw6OmJlZm9yZSB7XFxuICBsZWZ0OiAtOC42NjI1NHB4O1xcbiAgdG9wOiAxNXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbn1cXG4uZG90LXdpbmRtaWxsOjphZnRlciB7XFxuICBsZWZ0OiA4LjY2MjU0cHg7XFxuICB0b3A6IDE1cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtd2luZG1pbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDcyMGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LXdpbmRtaWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWig3MjBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEJyaWNrc1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LWJyaWNrcyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0b3A6IDMwLjVweDtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWJyaWNrcyAycyBpbmZpbml0ZSBlYXNlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1icmlja3MgMnMgaW5maW5pdGUgZWFzZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1icmlja3Mge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA0MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNTguMzMzJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA2Ni42NjYlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDgzLjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDkxLjY2NyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtYnJpY2tzIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgOC4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAzMy4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogMTAwMjkuNXB4IDAgMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNDEuNjY3JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAxMDAyOS41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IC02MXB4IDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDU4LjMzMyUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IC02MXB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgNjYuNjY2JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDEwMDI5LjVweCAwIDAgMCAjNDE1ODVmLCAxMDAyOS41cHggLTYxcHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA5MS42NjclIHtcXG4gICAgYm94LXNoYWRvdzogOTk2OC41cHggLTYxcHggMCAwICM0MTU4NWYsIDk5NjguNXB4IDAgMCAwICM0MTU4NWYsIDEwMDI5LjVweCAtNjFweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTY4LjVweCAtNjFweCAwIDAgIzQxNTg1ZiwgOTk2OC41cHggMCAwIDAgIzQxNTg1ZiwgMTAwMjkuNXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgRmxvYXRpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1mbG9hdGluZyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsb2F0aW5nIDNzIGluZmluaXRlIGN1YmljLWJlemllcigwLjE1LCAwLjYsIDAuOSwgMC4xKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmcgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMTUsIDAuNiwgMC45LCAwLjEpO1xcbn1cXG4uZG90LWZsb2F0aW5nOjpiZWZvcmUsIC5kb3QtZmxvYXRpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LWZsb2F0aW5nOjpiZWZvcmUge1xcbiAgbGVmdDogLTEycHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZsb2F0aW5nLWJlZm9yZSAzcyBpbmZpbml0ZSBlYXNlLWluLW91dDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYmVmb3JlIDNzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbn1cXG4uZG90LWZsb2F0aW5nOjphZnRlciB7XFxuICBsZWZ0OiAtMjRweDtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmxvYXRpbmctYWZ0ZXIgM3MgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMSwgMSk7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZsb2F0aW5nLWFmdGVyIDNzIGluZmluaXRlIGN1YmljLWJlemllcigwLjQsIDAsIDEsIDEpO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogY2FsYygtNTAlIC0gMjcuNXB4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlICsgMTI3LjVweCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtZmxvYXRpbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKC01MCUgLSAyNy41cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyAxMjcuNXB4KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDEyNy41cHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nLWJlZm9yZSB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTEycHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBsZWZ0OiAtNTBweDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtZmxvYXRpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTUwcHg7XFxuICB9XFxuICA1MCUge1xcbiAgICBsZWZ0OiAtMTJweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC01MHB4O1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZsb2F0aW5nLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgbGVmdDogLTI0cHg7XFxuICB9XFxuICA3NSUge1xcbiAgICBsZWZ0OiAtMTAwcHg7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGRvdC1mbG9hdGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGxlZnQ6IC0yNHB4O1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgbGVmdDogLTEwMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IC0xMDBweDtcXG4gIH1cXG59XFxuLyoqXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqIERvdCBGaXJlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZmlyZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTAuODVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjg1cztcXG59XFxuLmRvdC1maXJlOjpiZWZvcmUsIC5kb3QtZmlyZTo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxufVxcbi5kb3QtZmlyZTo6YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IDk5OTlweCAxNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1maXJlIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC0xLjg1cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMS44NXM7XFxufVxcbi5kb3QtZmlyZTo6YWZ0ZXIge1xcbiAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZpcmUgMS41cyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLTIuODVzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0yLjg1cztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1maXJlIHtcXG4gIDElIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTM3LjEyNXB4IDAgMnB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC0xNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1maXJlIHtcXG4gIDElIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDE0OC41cHggMCAtNXB4ICM0MTU4NWY7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTM3LjEyNXB4IDAgMnB4ICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IC0xNDguNXB4IDAgLTVweCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IFNwaW5cXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1zcGluIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIDAgcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zcGluIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zcGluIDEuNXMgaW5maW5pdGUgbGluZWFyO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXNwaW4ge1xcbiAgMCUsIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMTE4LjhweCAwIDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAxMi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDAgMTE4LjhweCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDM3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgLTExOC44cHggMCAwIDAgIzQxNTg1ZiwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgNjIuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA3NSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgMCAjNDE1ODVmLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWY7XFxuICB9XFxuICA4Ny41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtc3BpbiB7XFxuICAwJSwgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAxMTguOHB4IDAgMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKTtcXG4gIH1cXG4gIDEyLjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDExOC44cHggMCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZiwgMCAxMTguOHB4IDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMzcuNSUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA1MCUge1xcbiAgICBib3gtc2hhZG93OiAwIC0xMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMTE4LjhweCAwIDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCA4NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAwIDExOC44cHggMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmLCAtMTE4LjhweCAwIDAgMCAjNDE1ODVmLCAtODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICA2Mi41JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDAgLTExOC44cHggMCAwICM0MTU4NWYsIDg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAxMTguOHB4IDAgMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIDAgMTE4LjhweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCA4NC4wMDQzMTE2cHggMCAtNXB4IHJnYmEoNjUsIDg4LCA5NSwgMCksIC0xMTguOHB4IDAgMCAwICM0MTU4NWYsIC04NC4wMDQzMTE2cHggLTg0LjAwNDMxMTZweCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDg3LjUlIHtcXG4gICAgYm94LXNoYWRvdzogMCAtMTE4LjhweCAwIDAgIzQxNTg1ZiwgODQuMDA0MzExNnB4IC04NC4wMDQzMTE2cHggMCAwICM0MTU4NWYsIDExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgMCAxMTguOHB4IDAgLTVweCByZ2JhKDY1LCA4OCwgOTUsIDApLCAtODQuMDA0MzExNnB4IDg0LjAwNDMxMTZweCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTExOC44cHggMCAwIC01cHggcmdiYSg2NSwgODgsIDk1LCAwKSwgLTg0LjAwNDMxMTZweCAtODQuMDA0MzExNnB4IDAgMCAjNDE1ODVmO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRG90IEZhbGxpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1mYWxsaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGxlZnQ6IC05OTk5cHg7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICBib3gtc2hhZG93OiA5OTk5cHggMCAwIDAgIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmFsbGluZyAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWZhbGxpbmcgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuMXM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC4xcztcXG59XFxuLmRvdC1mYWxsaW5nOjpiZWZvcmUsIC5kb3QtZmFsbGluZzo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxufVxcbi5kb3QtZmFsbGluZzo6YmVmb3JlIHtcXG4gIHdpZHRoOiA1NXB4O1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMzNweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM0MTU4NWY7XFxuICBjb2xvcjogIzQxNTg1ZjtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtZmFsbGluZy1iZWZvcmUgMXMgaW5maW5pdGUgbGluZWFyO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1mYWxsaW5nLWJlZm9yZSAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMHM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMHM7XFxufVxcbi5kb3QtZmFsbGluZzo6YWZ0ZXIge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1mYWxsaW5nLWFmdGVyIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZmFsbGluZy1hZnRlciAxcyBpbmZpbml0ZSBsaW5lYXI7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4ycztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZhbGxpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmcge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTk5cHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTk5OXB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3QtZmFsbGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiA5OTAwcHggLTk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxuICAyNSUsIDUwJSwgNzUlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDAgMCAwICM0MTU4NWY7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgYm94LXNoYWRvdzogOTkwMHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCAwIDAgMCAjNDE1ODVmO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJveC1zaGFkb3c6IDk5MDBweCA5OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWZhbGxpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LWZhbGxpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IC05OXB4IDAgMCByZ2JhKDY1LCA4OCwgOTUsIDApO1xcbiAgfVxcbiAgMjUlLCA1MCUsIDc1JSB7XFxuICAgIGJveC1zaGFkb3c6IDEwMDk4cHggMCAwIDAgIzQxNTg1ZjtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBib3gtc2hhZG93OiAxMDA5OHB4IDk5cHggMCAwIHJnYmEoNjUsIDg4LCA5NSwgMCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBEb3QgU3RyZXRjaGluZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LXN0cmV0Y2hpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtc3RyZXRjaGluZyAycyBpbmZpbml0ZSBlYXNlLWluO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1zdHJldGNoaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3Qtc3RyZXRjaGluZzo6YmVmb3JlLCAuZG90LXN0cmV0Y2hpbmc6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbn1cXG4uZG90LXN0cmV0Y2hpbmc6OmJlZm9yZSB7XFxuICB3aWR0aDogNTVweDtcXG4gIGhlaWdodDogNTVweDtcXG4gIGJvcmRlci1yYWRpdXM6IDMzcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDE1ODVmO1xcbiAgY29sb3I6ICM0MTU4NWY7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYmVmb3JlIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3Qtc3RyZXRjaGluZzo6YWZ0ZXIge1xcbiAgd2lkdGg6IDU1cHg7XFxuICBoZWlnaHQ6IDU1cHg7XFxuICBib3JkZXItcmFkaXVzOiAzM3B4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQxNTg1ZjtcXG4gIGNvbG9yOiAjNDE1ODVmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1zdHJldGNoaW5nLWFmdGVyIDJzIGluZmluaXRlIGVhc2UtaW47XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXN0cmV0Y2hpbmctYWZ0ZXIgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGRvdC1zdHJldGNoaW5nIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgsIDAuOCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjI1LCAxLjI1KTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC44LCAwLjgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4yNSwgMS4yNSk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1iZWZvcmUge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0yMHB4KSBzY2FsZSgxLCAxKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmctYmVmb3JlIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbiAgNTAlLCA2MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXN0cmV0Y2hpbmctYWZ0ZXIge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwKSBzY2FsZSgwLjcsIDAuNyk7XFxuICB9XFxuICA1MCUsIDYwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDIwcHgpIHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3Qtc3RyZXRjaGluZy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDApIHNjYWxlKDAuNywgMC43KTtcXG4gIH1cXG4gIDUwJSwgNjAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMjBweCkgc2NhbGUoMSwgMSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCkgc2NhbGUoMC43LCAwLjcpO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBHb29leSBFZmZlY3RcXG4gKiBEb3QgR2F0aGVyaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtZ2F0aGVyaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3QtZ2F0aGVyaW5nOjpiZWZvcmUsIC5kb3QtZ2F0aGVyaW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IC01MHB4O1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgb3BhY2l0eTogMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1nYXRoZXJpbmcgMnMgaW5maW5pdGUgZWFzZS1pbjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtZ2F0aGVyaW5nIDJzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbi5kb3QtZ2F0aGVyaW5nOjphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC41cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjVzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWdhdGhlcmluZyB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDM1JSwgNjAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDUwcHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMDBweCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWdhdGhlcmluZyB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcXG4gIH1cXG4gIDM1JSwgNjAlIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDUwcHgpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIG9wYWNpdHk6IDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMDBweCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBIb3VyZ2xhc3NcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1ob3VyZ2xhc3Mge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAtOTlweDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxuICB0cmFuc2Zvcm0tb3JpZ2luOiAyNy41cHggMTI2LjVweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzIDIuNHMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWhvdXJnbGFzcyAyLjRzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IDAuNnM7XFxuICAgICAgICAgIGFuaW1hdGlvbi1kZWxheTogMC42cztcXG59XFxuLmRvdC1ob3VyZ2xhc3M6OmJlZm9yZSwgLmRvdC1ob3VyZ2xhc3M6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LWhvdXJnbGFzczo6YmVmb3JlIHtcXG4gIHRvcDogMTk4cHg7XFxufVxcbi5kb3QtaG91cmdsYXNzOjphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LWhvdXJnbGFzcy1hZnRlciAyLjRzIGluZmluaXRlIGN1YmljLWJlemllcigwLjY1LCAwLjA1LCAwLjM2LCAxKTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBkb3QtaG91cmdsYXNzLWFmdGVyIDIuNHMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuNjUsIDAuMDUsIDAuMzYsIDEpO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWhvdXJnbGFzcyB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigxODBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMzYwZGVnKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBkb3QtaG91cmdsYXNzIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMTgwZGVnKTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWigzNjBkZWcpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWhvdXJnbGFzcy1hZnRlciB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTk4cHgpO1xcbiAgfVxcbiAgNzUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBkb3QtaG91cmdsYXNzLWFmdGVyIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE5OHB4KTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxOThweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcbn1cXG4vKipcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICogRXhwZXJpbWVudGFsOiBHb29leSBFZmZlY3RcXG4gKiBEb3QgT3ZlcnRha2luZ1xcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKi9cXG4uZG90LW92ZXJ0YWtpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgbWFyZ2luOiAtMXB4IDA7XFxuICBib3gtc2hhZG93OiAwIC0yMHB4IDAgMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1vdmVydGFraW5nIDJzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1vdmVydGFraW5nIDJzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmJlZm9yZSwgLmRvdC1vdmVydGFraW5nOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICB3aWR0aDogMTJweDtcXG4gIGhlaWdodDogMTJweDtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgY29sb3I6IGhzbCgwZGVnLCAxMDAlLCAwJSk7XFxuICBib3gtc2hhZG93OiAwIC0yMHB4IDAgMDtcXG4gIGZpbHRlcjogYmx1cigycHgpO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LW92ZXJ0YWtpbmcgMnMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4zcztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjNzO1xcbn1cXG4uZG90LW92ZXJ0YWtpbmc6OmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3Qtb3ZlcnRha2luZyAxLjVzIGluZmluaXRlIGN1YmljLWJlemllcigwLjIsIDAuNiwgMC44LCAwLjIpO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1vdmVydGFraW5nIDEuNXMgaW5maW5pdGUgY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjgsIDAuMik7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC42cztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjZzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LW92ZXJ0YWtpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LW92ZXJ0YWtpbmcge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVaKDM2MGRlZyk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEdvb2V5IEVmZmVjdFxcbiAqIERvdCBTaHV0dGxlXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3Qtc2h1dHRsZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBsZWZ0OiAtOTlweDtcXG4gIHdpZHRoOiAxMnB4O1xcbiAgaGVpZ2h0OiAxMnB4O1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogaHNsKDBkZWcsIDEwMCUsIDAlKTtcXG4gIGNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIG1hcmdpbjogLTFweCAwO1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YmVmb3JlLCAuZG90LXNodXR0bGU6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgd2lkdGg6IDEycHg7XFxuICBoZWlnaHQ6IDEycHg7XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBoc2woMGRlZywgMTAwJSwgMCUpO1xcbiAgY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgZmlsdGVyOiBibHVyKDJweCk7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YmVmb3JlIHtcXG4gIGxlZnQ6IDk5cHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogZG90LXNodXR0bGUgMnMgaW5maW5pdGUgZWFzZS1vdXQ7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LXNodXR0bGUgMnMgaW5maW5pdGUgZWFzZS1vdXQ7XFxufVxcbi5kb3Qtc2h1dHRsZTo6YWZ0ZXIge1xcbiAgbGVmdDogMTk4cHg7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBkb3Qtc2h1dHRsZSB7XFxuICAwJSwgNTAlLCAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yOTdweCk7XFxuICB9XFxuICA3NSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjk3cHgpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1zaHV0dGxlIHtcXG4gIDAlLCA1MCUsIDEwMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7XFxuICB9XFxuICAyNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI5N3B4KTtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyOTdweCk7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEVtb2ppXFxuICogRG90IEJvdW5jaW5nXFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxcbiAqL1xcbi5kb3QtYm91bmNpbmcge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiA1NXB4O1xcbiAgZm9udC1zaXplOiAxMHB4O1xcbn1cXG4uZG90LWJvdW5jaW5nOjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIuKavfCfj4Dwn4+QXFxcIjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBkb3QtYm91bmNpbmcgMXMgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogZG90LWJvdW5jaW5nIDFzIGluZmluaXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LWJvdW5jaW5nIHtcXG4gIDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gICAgLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLWluO1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICB9XFxuICAzNCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMzUlIHtcXG4gICAgdG9wOiAyMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuNSwgMC41KTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA5MCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgZG90LWJvdW5jaW5nIHtcXG4gIDAlIHtcXG4gICAgdG9wOiAtMjBweDtcXG4gICAgLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLWluO1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW47XFxuICB9XFxuICAzNCUge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEsIDEpO1xcbiAgfVxcbiAgMzUlIHtcXG4gICAgdG9wOiAyMHB4O1xcbiAgICAtd2Via2l0LWFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICAgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2Utb3V0O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuNSwgMC41KTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XFxuICB9XFxuICA5MCUge1xcbiAgICB0b3A6IC0yMHB4O1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIHRvcDogLTIwcHg7XFxuICB9XFxufVxcbi8qKlxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG4gKiBFeHBlcmltZW50YWw6IEVtb2ppXFxuICogRG90IFJvbGxpbmdcXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XFxuICovXFxuLmRvdC1yb2xsaW5nIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogNTVweDtcXG4gIGZvbnQtc2l6ZTogMTBweDtcXG59XFxuLmRvdC1yb2xsaW5nOjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGRvdC1yb2xsaW5nIDNzIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGRvdC1yb2xsaW5nIDNzIGluZmluaXRlO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgZG90LXJvbGxpbmcge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMTYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMzMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLimr1cXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICAzNC4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PgFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgyNXB4KSByb3RhdGVaKDcyMGRlZyk7XFxuICB9XFxuICA2Ni42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA2Ny42NjclIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTI1cHgpIHJvdGF0ZVooMGRlZyk7XFxuICB9XFxuICA4My4zMzMlIHtcXG4gICAgY29udGVudDogXFxcIvCfj5BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGRvdC1yb2xsaW5nIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIuKavVxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG4gIDE2LjY2NyUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDMzLjMzMyUge1xcbiAgICBjb250ZW50OiBcXFwi4pq9XFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgMzQuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIvCfj4BcXFwiO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjVweCkgcm90YXRlWig3MjBkZWcpO1xcbiAgfVxcbiAgNjYuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+AXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgNjcuNjY3JSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0yNXB4KSByb3RhdGVaKDBkZWcpO1xcbiAgfVxcbiAgODMuMzMzJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn4+QXFxcIjtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDI1cHgpIHJvdGF0ZVooNzIwZGVnKTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+PkFxcXCI7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMjVweCkgcm90YXRlWigwZGVnKTtcXG4gIH1cXG59LyojIHNvdXJjZU1hcHBpbmdVUkw9ZG90cy5jc3MubWFwICovXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vY3NzL2RvdHMuY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWVsYXN0aWMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX21peGlucy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fdmFyaWFibGVzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtcHVsc2Uuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1mbGFzaGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWNvbGxpc2lvbi5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXJldm9sdXRpb24uc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1jYXJvdXNlbC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXR5cGluZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXdpbmRtaWxsLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtYnJpY2tzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZmxvYXRpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1maXJlLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtc3Bpbi5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LWZhbGxpbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1zdHJldGNoaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtZ2F0aGVyaW5nLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3QtaG91cmdsYXNzLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9kb3QtbG9hZGVyL19kb3Qtb3ZlcnRha2luZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXNodXR0bGUuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL2RvdC1sb2FkZXIvX2RvdC1ib3VuY2luZy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG90LWxvYWRlci9fZG90LXJvbGxpbmcuc2Nzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSxnQkFBZ0I7QUNBaEI7Ozs7RUFBQTtBQU1BO0VBQ0Usa0JBQUE7RUNJQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VGR1YsaURBQUE7VUFBQSx5Q0FBQTtBREdGO0FDREU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QURFSjtBQ0NFO0VBQ0UsV0FBQTtFQ1hGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUZrQlIsd0RBQUE7VUFBQSxnREFBQTtBREdKO0FDQUU7RUFDRSxVRWpCVTtFREZaLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUYwQlIsdURBQUE7VUFBQSwrQ0FBQTtBRElKOztBQ0FBO0VBQ0U7SUFDRSxzQkFBQTtFREdGO0VDQUE7SUFDRSx3QkFBQTtFREVGO0VDQ0E7SUFDRSx5QkFBQTtFRENGO0VDRUE7SUFDRSxzQkFBQTtFREFGO0VDR0E7SUFDRSxzQkFBQTtFRERGO0FBQ0Y7O0FDbEJBO0VBQ0U7SUFDRSxzQkFBQTtFREdGO0VDQUE7SUFDRSx3QkFBQTtFREVGO0VDQ0E7SUFDRSx5QkFBQTtFRENGO0VDRUE7SUFDRSxzQkFBQTtFREFGO0VDR0E7SUFDRSxzQkFBQTtFRERGO0FBQ0Y7QUNJQTtFQUNFO0lBQ0Usc0JBQUE7RURGRjtFQ0tBO0lBQ0Usc0JBQUE7RURIRjtFQ01BO0lBQ0Usd0JBQUE7RURKRjtFQ09BO0lBQ0Usc0JBQUE7RURMRjtFQ1FBO0lBQ0Usc0JBQUE7RURORjtBQUNGO0FDYkE7RUFDRTtJQUNFLHNCQUFBO0VERkY7RUNLQTtJQUNFLHNCQUFBO0VESEY7RUNNQTtJQUNFLHdCQUFBO0VESkY7RUNPQTtJQUNFLHNCQUFBO0VETEY7RUNRQTtJQUNFLHNCQUFBO0VETkY7QUFDRjtBQ1NBO0VBQ0U7SUFDRSxzQkFBQTtFRFBGO0VDVUE7SUFDRSxzQkFBQTtFRFJGO0VDV0E7SUFDRSx5QkFBQTtFRFRGO0VDWUE7SUFDRSx3QkFBQTtFRFZGO0VDYUE7SUFDRSxzQkFBQTtFRFhGO0FBQ0Y7QUNSQTtFQUNFO0lBQ0Usc0JBQUE7RURQRjtFQ1VBO0lBQ0Usc0JBQUE7RURSRjtFQ1dBO0lBQ0UseUJBQUE7RURURjtFQ1lBO0lBQ0Usd0JBQUE7RURWRjtFQ2FBO0lBQ0Usc0JBQUE7RURYRjtBQUNGO0FJMUZBOzs7O0VBQUE7QUFXQTtFQUNFLGtCQUFBO0VBQ0EsYUFQUztFRktULFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RUNTViwyQkFBQTtFQUNBLGlEQUFBO1VBQUEseUNBQUE7RUFDQSw4QkFBQTtVQUFBLHNCQUFBO0FKd0ZGO0FJdEZFO0VBRUUsV0FBQTtFQUNBLHFCQUFBO0VBQ0Esa0JBQUE7RUFDQSxNQUFBO0VGZkYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtBSDhHWjtBSXZGRTtFQUNFLDJCQUFBO0VBQ0Esd0RBQUE7VUFBQSxnREFBQTtFQUNBLDJCQUFBO1VBQUEsbUJBQUE7QUp5Rko7QUl0RkU7RUFDRSw0QkFBQTtFQUNBLHVEQUFBO1VBQUEsK0NBQUE7RUFDQSw2QkFBQTtVQUFBLHFCQUFBO0FKd0ZKOztBSXBGQTtFQUNFO0lBQ0UsMkJBQUE7RUp1RkY7RUlwRkE7SUFDRSwwQkFBQTtFSnNGRjtFSW5GQTtJQUVFLDJCQUFBO0VKb0ZGO0FBQ0Y7O0FJaEdBO0VBQ0U7SUFDRSwyQkFBQTtFSnVGRjtFSXBGQTtJQUNFLDBCQUFBO0VKc0ZGO0VJbkZBO0lBRUUsMkJBQUE7RUpvRkY7QUFDRjtBSWpGQTtFQUNFO0lBQ0UsMkJBQUE7RUptRkY7RUloRkE7SUFDRSwwQkFBQTtFSmtGRjtFSS9FQTtJQUVFLDJCQUFBO0VKZ0ZGO0FBQ0Y7QUk1RkE7RUFDRTtJQUNFLDJCQUFBO0VKbUZGO0VJaEZBO0lBQ0UsMEJBQUE7RUprRkY7RUkvRUE7SUFFRSwyQkFBQTtFSmdGRjtBQUNGO0FJN0VBO0VBQ0U7SUFDRSw0QkFBQTtFSitFRjtFSTVFQTtJQUNFLDJCQUFBO0VKOEVGO0VJM0VBO0lBRUUsNEJBQUE7RUo0RUY7QUFDRjtBSXhGQTtFQUNFO0lBQ0UsNEJBQUE7RUorRUY7RUk1RUE7SUFDRSwyQkFBQTtFSjhFRjtFSTNFQTtJQUVFLDRCQUFBO0VKNEVGO0FBQ0Y7QUtsS0E7Ozs7RUFBQTtBQU1BO0VBQ0Usa0JBQUE7RUhJQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VFR1YsNERBQUE7VUFBQSxvREFBQTtFQUNBLDZCQUFBO1VBQUEscUJBQUE7QUxxS0Y7QUtuS0U7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QUxvS0o7QUtqS0U7RUFDRSxXQUFBO0VIWkYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRW1CUixxREFBQTtVQUFBLDZDQUFBO0VBQ0EsMkJBQUE7VUFBQSxtQkFBQTtBTHFLSjtBS2xLRTtFQUNFLFVGbkJVO0VERlosV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFRTRCUixxREFBQTtVQUFBLDZDQUFBO0VBQ0EsMkJBQUE7VUFBQSxtQkFBQTtBTHNLSjs7QUtsS0E7RUFDRTtJQUNFLHlCQUFBO0VMcUtGO0VLbEtBO0lBRUUsdUNBQUE7RUxtS0Y7QUFDRjs7QUszS0E7RUFDRTtJQUNFLHlCQUFBO0VMcUtGO0VLbEtBO0lBRUUsdUNBQUE7RUxtS0Y7QUFDRjtBTXBOQTs7OztFQUFBO0FBTUE7RUFDRSxrQkFBQTtFSklBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUh5Tlo7QU10TkU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLE1BQUE7QU51Tko7QU1wTkU7RUFDRSxXQUFBO0VKVEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFR2dCUiwyREFBQTtVQUFBLG1EQUFBO0FOd05KO0FNck5FO0VBQ0UsVUh4QlE7RURPVixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VHd0JSLDBEQUFBO1VBQUEsa0RBQUE7RUFDQSwyQkFBQTtVQUFBLG1CQUFBO0FOeU5KOztBTXJOQTtFQUNFO0lBSUUsd0JBQUE7RU5xTkY7RU1sTkE7SUFDRSw0QkFBQTtFTm9ORjtBQUNGOztBTTlOQTtFQUNFO0lBSUUsd0JBQUE7RU5xTkY7RU1sTkE7SUFDRSw0QkFBQTtFTm9ORjtBQUNGO0FNak5BO0VBQ0U7SUFJRSx3QkFBQTtFTmdORjtFTTdNQTtJQUNFLDJCQUFBO0VOK01GO0FBQ0Y7QU16TkE7RUFDRTtJQUlFLHdCQUFBO0VOZ05GO0VNN01BO0lBQ0UsMkJBQUE7RU4rTUY7QUFDRjtBTzNRQTs7OztFQUFBO0FBTUE7RUFDRSxrQkFBQTtFTElBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUhnUlo7QU83UUU7RUFFRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtBUDhRSjtBTzNRRTtFQUNFLE9BQUE7RUFDQSxVQUFBO0VMVEYsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFSWdCUixnQ0FBQTtFQUNBLHNEQUFBO1VBQUEsOENBQUE7QVArUUo7QU81UUU7RUFDRSxPQUFBO0VBQ0EsV0FBQTtFTG5CRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VJMEJSLGdDQUFBO0VBQ0Esb0RBQUE7VUFBQSw0Q0FBQTtBUGdSSjs7QU81UUE7RUFDRTtJQUNFLDZDQUFBO0VQK1FGO0VPNVFBO0lBQ0UsK0NBQUE7RVA4UUY7QUFDRjs7QU9yUkE7RUFDRTtJQUNFLDZDQUFBO0VQK1FGO0VPNVFBO0lBQ0UsK0NBQUE7RVA4UUY7QUFDRjtBUTVUQTs7OztFQUFBO0FBV0E7RUFDRSxrQkFBQTtFQUNBLGFBUFM7RU5LVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VLU1YsNkVBQ0U7RUFHRixvREFBQTtVQUFBLDRDQUFBO0FSdVRGOztBUXBUQTtFQUNFO0lBQ0UscUZBQ0U7RVJzVEo7RVFqVEE7SUFDRSxxRkFDRTtFUmtUSjtFUTdTQTtJQUNFLHFGQUNFO0VSOFNKO0FBQ0Y7O0FRaFVBO0VBQ0U7SUFDRSxxRkFDRTtFUnNUSjtFUWpUQTtJQUNFLHFGQUNFO0VSa1RKO0VRN1NBO0lBQ0UscUZBQ0U7RVI4U0o7QUFDRjtBU3hWQTs7OztFQUFBO0FBV0E7RUFDRSxrQkFBQTtFQUNBLGFBUFM7RVBLVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VNU1YsNkVBQ0U7RUFHRixrREFBQTtVQUFBLDBDQUFBO0FUbVZGOztBU2hWQTtFQUNFO0lBQ0UsNkVBQ0U7RVRrVko7RVM3VUE7SUFDRSxpRkFDRTtFVDhVSjtFU3pVQTtJQUNFLDZFQUNFO0VUMFVKO0VTclVBO0lBQ0UsaUZBQ0U7RVRzVUo7RVNqVUE7SUFDRSw2RUFDRTtFVGtVSjtFUzdUQTtJQUNFLGlGQUNFO0VUOFRKO0VTelRBO0lBQ0UsNkVBQ0U7RVQwVEo7QUFDRjs7QVN4V0E7RUFDRTtJQUNFLDZFQUNFO0VUa1ZKO0VTN1VBO0lBQ0UsaUZBQ0U7RVQ4VUo7RVN6VUE7SUFDRSw2RUFDRTtFVDBVSjtFU3JVQTtJQUNFLGlGQUNFO0VUc1VKO0VTalVBO0lBQ0UsNkVBQ0U7RVRrVUo7RVM3VEE7SUFDRSxpRkFDRTtFVDhUSjtFU3pUQTtJQUNFLDZFQUNFO0VUMFRKO0FBQ0Y7QVVoWUE7Ozs7RUFBQTtBQVVBO0VBQ0Usa0JBQUE7RUFDQSxVQUFBO0VSREEsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFT1FWLDBCQUFBO0VBQ0Esa0RBQUE7VUFBQSwwQ0FBQTtBVitYRjtBVTdYRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0FWOFhKO0FVM1hFO0VBQ0UsZ0JBQUE7RUFDQSxTQUFBO0VSakJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7QUhzWlo7QVU3WEU7RUFDRSxlQUFBO0VBQ0EsU0FBQTtFUnhCRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0FIK1paOztBVTlYQTtFQUNFO0lBQ0UsNkNBQUE7RVZpWUY7RVU5WEE7SUFDRSwrQ0FBQTtFVmdZRjtBQUNGOztBVXZZQTtFQUNFO0lBQ0UsNkNBQUE7RVZpWUY7RVU5WEE7SUFDRSwrQ0FBQTtFVmdZRjtBQUNGO0FXaGJBOzs7O0VBQUE7QUFjQTtFQUNFLGtCQUFBO0VBQ0EsV0FUUTtFQVVSLGFBVFM7RVRHVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VRYVYsdUZBQ0U7RUFHRiw4Q0FBQTtVQUFBLHNDQUFBO0FYd2FGOztBV3JhQTtFQUNFO0lBQ0UsdUZBQ0U7RVh1YUo7RVdsYUE7SUFDRSx3RkFDRTtFWG1hSjtFVzlaQTtJQUNFLDRGQUNFO0VYK1pKO0VXMVpBO0lBQ0UsMkZBQ0U7RVgyWko7RVd0WkE7SUFDRSx1RkFDRTtFWHVaSjtFV2xaQTtJQUNFLHdGQUNFO0VYbVpKO0VXOVlBO0lBQ0UsNEZBQ0U7RVgrWUo7RVcxWUE7SUFDRSwyRkFDRTtFWDJZSjtFV3RZQTtJQUNFLHVGQUNFO0VYdVlKO0VXbFlBO0lBQ0Usd0ZBQ0U7RVhtWUo7RVc5WEE7SUFDRSw0RkFDRTtFWCtYSjtFVzFYQTtJQUNFLDJGQUNFO0VYMlhKO0VXdFhBO0lBQ0UsdUZBQ0U7RVh1WEo7QUFDRjs7QVcvY0E7RUFDRTtJQUNFLHVGQUNFO0VYdWFKO0VXbGFBO0lBQ0Usd0ZBQ0U7RVhtYUo7RVc5WkE7SUFDRSw0RkFDRTtFWCtaSjtFVzFaQTtJQUNFLDJGQUNFO0VYMlpKO0VXdFpBO0lBQ0UsdUZBQ0U7RVh1Wko7RVdsWkE7SUFDRSx3RkFDRTtFWG1aSjtFVzlZQTtJQUNFLDRGQUNFO0VYK1lKO0VXMVlBO0lBQ0UsMkZBQ0U7RVgyWUo7RVd0WUE7SUFDRSx1RkFDRTtFWHVZSjtFV2xZQTtJQUNFLHdGQUNFO0VYbVlKO0VXOVhBO0lBQ0UsNEZBQ0U7RVgrWEo7RVcxWEE7SUFDRSwyRkFDRTtFWDJYSjtFV3RYQTtJQUNFLHVGQUNFO0VYdVhKO0FBQ0Y7QVkzZUE7Ozs7RUFBQTtBQVNBO0VBQ0Usa0JBQUE7RVZDQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VTTVYsNkVBQUE7VUFBQSxxRUFBQTtBWjJlRjtBWXplRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBWjBlSjtBWXZlRTtFQUNFLFdBQUE7RVZkRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VTcUJSLDhEQUFBO1VBQUEsc0RBQUE7QVoyZUo7QVl4ZUU7RUFDRSxXQUFBO0VWdEJGLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVM2QlIsNEVBQUE7VUFBQSxvRUFBQTtBWjRlSjs7QVl4ZUE7RUFDRTtJQUNFLHlCQUFBO0VaMmVGO0VZeGVBO0lBQ0UseUJBQUE7RVowZUY7RVl2ZUE7SUFDRSx5QkFBQTtFWnllRjtBQUNGOztBWXBmQTtFQUNFO0lBQ0UseUJBQUE7RVoyZUY7RVl4ZUE7SUFDRSx5QkFBQTtFWjBlRjtFWXZlQTtJQUNFLHlCQUFBO0VaeWVGO0FBQ0Y7QVl0ZUE7RUFDRTtJQUNFLFdBQUE7RVp3ZUY7RVlyZUE7SUFDRSxXQUFBO0VadWVGO0VZcGVBO0lBQ0UsV0FBQTtFWnNlRjtFWW5lQTtJQUNFLFdBQUE7RVpxZUY7QUFDRjtBWXBmQTtFQUNFO0lBQ0UsV0FBQTtFWndlRjtFWXJlQTtJQUNFLFdBQUE7RVp1ZUY7RVlwZUE7SUFDRSxXQUFBO0Vac2VGO0VZbmVBO0lBQ0UsV0FBQTtFWnFlRjtBQUNGO0FZbGVBO0VBQ0U7SUFDRSxZQUFBO0Vab2VGO0VZamVBO0lBQ0UsV0FBQTtFWm1lRjtFWWhlQTtJQUNFLFlBQUE7RVprZUY7RVkvZEE7SUFDRSxZQUFBO0VaaWVGO0FBQ0Y7QVloZkE7RUFDRTtJQUNFLFlBQUE7RVpvZUY7RVlqZUE7SUFDRSxXQUFBO0VabWVGO0VZaGVBO0lBQ0UsWUFBQTtFWmtlRjtFWS9kQTtJQUNFLFlBQUE7RVppZUY7QUFDRjtBYXpqQkE7Ozs7RUFBQTtBQVlBO0VBQ0Usa0JBQUE7RUFDQSxhQVJTO0VYS1QsV0NQVTtFRFFWLFlDUFc7RURRWCxtQkNQVztFRFFYLHlCQ05VO0VET1YsY0NQVTtFVVVWLHlDQUFBO0VBQ0EsZ0RBQUE7VUFBQSx3Q0FBQTtFQUNBLCtCQUFBO1VBQUEsdUJBQUE7QWJzakJGO0FhcGpCRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtFWGhCRixXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0FINmtCWjtBYXJqQkU7RUFDRSx5Q0FBQTtFQUNBLGdEQUFBO1VBQUEsd0NBQUE7RUFDQSwrQkFBQTtVQUFBLHVCQUFBO0FidWpCSjtBYXBqQkU7RUFDRSx5Q0FBQTtFQUNBLGdEQUFBO1VBQUEsd0NBQUE7RUFDQSwrQkFBQTtVQUFBLHVCQUFBO0Fic2pCSjs7QWFsakJBO0VBQ0U7SUFDRSx5Q0FBQTtFYnFqQkY7RWFsakJBO0lBQ0UsMENBQUE7RWJvakJGO0VhampCQTtJQUNFLDBDQUFBO0VibWpCRjtBQUNGOztBYTlqQkE7RUFDRTtJQUNFLHlDQUFBO0VicWpCRjtFYWxqQkE7SUFDRSwwQ0FBQTtFYm9qQkY7RWFqakJBO0lBQ0UsMENBQUE7RWJtakJGO0FBQ0Y7QWMzbUJBOzs7O0VBQUE7QUFtQkE7RUFDRSxrQkFBQTtFWlRBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCw2QllRd0I7RVpQeEIsa0JZTzZDO0VBRTdDLG9VQUNFO0VBUUYsZ0RBQUE7VUFBQSx3Q0FBQTtBZHlsQkY7O0FjdGxCQTtFQUNFO0lBRUUsbVZBQ0U7RWR1bEJKO0VjN2tCQTtJQUNFLG1WQUNFO0VkOGtCSjtFY3BrQkE7SUFDRSxtVkFDRTtFZHFrQko7RWMzakJBO0lBQ0UsbVZBQ0U7RWQ0akJKO0VjbGpCQTtJQUNFLG1WQUNFO0VkbWpCSjtFY3ppQkE7SUFDRSxtVkFDRTtFZDBpQko7RWNoaUJBO0lBQ0UsbVZBQ0U7RWRpaUJKO0VjdmhCQTtJQUNFLG1WQUNFO0Vkd2hCSjtBQUNGOztBY2puQkE7RUFDRTtJQUVFLG1WQUNFO0VkdWxCSjtFYzdrQkE7SUFDRSxtVkFDRTtFZDhrQko7RWNwa0JBO0lBQ0UsbVZBQ0U7RWRxa0JKO0VjM2pCQTtJQUNFLG1WQUNFO0VkNGpCSjtFY2xqQkE7SUFDRSxtVkFDRTtFZG1qQko7RWN6aUJBO0lBQ0UsbVZBQ0U7RWQwaUJKO0VjaGlCQTtJQUNFLG1WQUNFO0VkaWlCSjtFY3ZoQkE7SUFDRSxtVkFDRTtFZHdoQko7QUFDRjtBZXJwQkE7Ozs7RUFBQTtBQXdCQTtFQUNFLGtCQUFBO0VBQ0EsYUFwQlM7RWJLVCxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VZc0JWLGdDQUFBO0VBQ0EsaURBQUE7VUFBQSx5Q0FBQTtFQUNBLDZCQUFBO1VBQUEscUJBQUE7QWZzb0JGO0FlcG9CRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBZnFvQko7QWVsb0JFO0ViL0JBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RVlxQ1Isd0RBQUE7VUFBQSxnREFBQTtFQUNBLDJCQUFBO1VBQUEsbUJBQUE7QWZ1b0JKO0FlcG9CRTtFYnRDQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VZNENSLHVEQUFBO1VBQUEsK0NBQUE7RUFDQSw2QkFBQTtVQUFBLHFCQUFBO0FmeW9CSjs7QWVyb0JBO0VBQ0U7SUFDRSxnREFBQTtFZndvQkY7RWVyb0JBO0lBR0UsZ0NBQUE7RWZxb0JGO0VlbG9CQTtJQUNFLCtDQUFBO0Vmb29CRjtBQUNGOztBZWpwQkE7RUFDRTtJQUNFLGdEQUFBO0Vmd29CRjtFZXJvQkE7SUFHRSxnQ0FBQTtFZnFvQkY7RWVsb0JBO0lBQ0UsK0NBQUE7RWZvb0JGO0FBQ0Y7QWVqb0JBO0VBQ0U7SUFDRSxnREFBQTtFZm1vQkY7RWVob0JBO0lBR0UsZ0NBQUE7RWZnb0JGO0VlN25CQTtJQUNFLCtDQUFBO0VmK25CRjtBQUNGO0FlNW9CQTtFQUNFO0lBQ0UsZ0RBQUE7RWZtb0JGO0VlaG9CQTtJQUdFLGdDQUFBO0VmZ29CRjtFZTduQkE7SUFDRSwrQ0FBQTtFZituQkY7QUFDRjtBZTVuQkE7RUFDRTtJQUNFLGlEQUFBO0VmOG5CRjtFZTNuQkE7SUFHRSxpQ0FBQTtFZjJuQkY7RWV4bkJBO0lBQ0UsZ0RBQUE7RWYwbkJGO0FBQ0Y7QWV2b0JBO0VBQ0U7SUFDRSxpREFBQTtFZjhuQkY7RWUzbkJBO0lBR0UsaUNBQUE7RWYybkJGO0VleG5CQTtJQUNFLGdEQUFBO0VmMG5CRjtBQUNGO0FnQmh1QkE7Ozs7RUFBQTtBQVNBO0VBQ0Usa0JBQUE7RWRDQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0VhTVYsNEJBQUE7RUFDQSxxREFBQTtVQUFBLDZDQUFBO0FoQmd1QkY7QWdCOXRCRTtFQUVFLFdBQUE7RUFDQSxxQkFBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtBaEIrdEJKO0FnQjV0QkU7RWRkQSxXQ1BVO0VEUVYsWUNQVztFRFFYLG1CQ1BXO0VEUVgseUJDTlU7RURPVixjQ1BVO0Vhb0JSLDREQUFBO1VBQUEsb0RBQUE7QWhCaXVCSjtBZ0I5dEJFO0VkcEJBLFdDUFU7RURRVixZQ1BXO0VEUVgsbUJDUFc7RURRWCx5QkNOVTtFRE9WLGNDUFU7RWEwQlIsMkRBQUE7VUFBQSxtREFBQTtBaEJtdUJKOztBZ0IvdEJBO0VBQ0U7SUFDRSw0QkFBQTtFaEJrdUJGO0VnQi90QkE7SUFFRSwwQkFBQTtFaEJndUJGO0VnQjd0QkE7SUFDRSw0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Q0FBQTtFdEJtaUNGO0VzQmhpQ0E7SUFDRSxhQUFBO0lBQ0EsMENBQUE7RXRCa2lDRjtBQUNGLENBQUEsbUNBQUFcIixcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBjaGFyc2V0IFxcXCJVVEYtOFxcXCI7XFxuaHRtbCB7XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBtYXJnaW46IDA7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiA3NjdweCkge1xcbiAgaHRtbCB7XFxuICAgIGZvbnQtc2l6ZTogMS43dmg7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIGh0bWwge1xcbiAgICBmb250LXNpemU6IDEuODV2aDtcXG4gIH1cXG59XFxuaHRtbC5mcmVlemUge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuYm9keSB7XFxuICBtYXJnaW46IDA7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG5cXG5oMSB7XFxuICBtYXJnaW46IDA7XFxuICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgZm9udC1zaXplOiA0cmVtO1xcbn1cXG5cXG5oMiB7XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuaDMge1xcbiAgZm9udC1zaXplOiAyLjNyZW07XFxuICBtYXJnaW46IDA7XFxufVxcblxcbmEge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6IGluaGVyaXQ7XFxufVxcblxcbmEge1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG5hLmhpZGRlbiwgYS5zZWxlY3RlZFBhZ2Uge1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcblxcbmEuaGlkZGVuIHtcXG4gIG9wYWNpdHk6IDA7XFxufVxcblxcbmEuc2VsZWN0ZWRQYWdlIHtcXG4gIGNvbG9yOiAjZThhYTc3O1xcbiAgZmlsdGVyOiBzYXR1cmF0ZSgxMjAlKTtcXG59XFxuXFxuKi5oaWRkZW4ge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG5cXG5kaXYsIGJ1dHRvbiB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG5idXR0b24ge1xcbiAgYm9yZGVyOiBub25lO1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcblxcbmxpIHtcXG4gIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcXG59XFxuXFxuI292ZXJhbGxDb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdG9wOiAwO1xcbn1cXG4jb3ZlcmFsbENvbnRhaW5lci5mYWRlZCB7XFxuICBmaWx0ZXI6IG9wYWNpdHkoNDAlKTtcXG59XFxuXFxuLmNvbnRlbnRDb250YWluZXIge1xcbiAgaGVpZ2h0OiBpbml0aWFsO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBtYXJnaW46IDQlIDA7XFxuICBtYXJnaW4tYm90dG9tOiA1JTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRDb250YWluZXIgPiBkaXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgcGFkZGluZy10b3A6IDUuNXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDc2N3B4KSB7XFxuICAuY29udGVudENvbnRhaW5lciA+IGRpdiB7XFxuICAgIHdpZHRoOiA5NSU7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Q29udGFpbmVyID4gZGl2IHtcXG4gICAgd2lkdGg6IDg1JTtcXG4gIH1cXG59XFxuLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkIC50ZXh0Qm94IC5jb250ZW50LXBhZ2VzIHtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkIC50ZXh0Qm94IC5jb250ZW50LXBhZ2VzIGEge1xcbiAgZm9udC1zaXplOiAxLjc1cmVtO1xcbn1cXG5cXG4udGl0bGVBbmRUZXh0Qm94LCAuY29udGVudEJveCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbi50aXRsZUFuZFRleHRCb3gge1xcbiAgbWFyZ2luLXJpZ2h0OiA1JTtcXG59XFxuXFxuLnRpdGxlQm94LCAudGV4dEJveCB7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHdpZHRoOiAxNnJlbTtcXG59XFxuXFxuLnRpdGxlQm94IHtcXG4gIHBhZGRpbmc6IDEwJTtcXG59XFxuLnRpdGxlQm94ID4gKiB7XFxuICBoZWlnaHQ6IDUwJTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4udGl0bGVCb3ggPiA6bnRoLWNoaWxkKDIpIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxufVxcbi50aXRsZUJveCA+IDpudGgtY2hpbGQoMikgaDIge1xcbiAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICBwYWRkaW5nLWJvdHRvbTogMTUlO1xcbn1cXG5cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzLCAuY29udGVudEJveC5tZW1iZXJzIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICByb3ctZ2FwOiAwLjM1cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogNzY3cHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAzMy4zJSk7XFxuICB9XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMsIC5jb250ZW50Qm94Lm1lbWJlcnMge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg0LCAyNSUpO1xcbiAgfVxcbn1cXG5cXG4uY29udGVudEJveCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiB7XFxuICB3aWR0aDogMTRyZW07XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyB7XFxuICBib3gtc2l6aW5nOiBpbml0aWFsO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcywgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBvcGFjaXR5OiAwO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgKiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICoge1xcbiAgY29sb3I6IHJnYigyMzgsIDIzMSwgMjEwKTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgbWFyZ2luLXRvcDogMC43cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAuY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgKiwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICoge1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIC5mYS1zZWFyY2gtcGx1cywgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzIC5mYS1zZWFyY2gtcGx1cyB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gIC5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAuZmEtc2VhcmNoLXBsdXMge1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gIH1cXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzICo6aG92ZXIsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyAqOmhvdmVyIHtcXG4gIHRyYW5zZm9ybTogc2NhbGUoMTEwJSk7XFxuICBmaWx0ZXI6IGJyaWdodG5lc3MoMTIwJSk7XFxufVxcbi5jb250ZW50Qm94LnByb3BlcnRpZXMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcyBpLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgaSB7XFxuICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZSB7XFxuICBvcGFjaXR5OiAxO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgcCwgLmNvbnRlbnRCb3gucHJvcGVydGllcyA+IGRpdiAuZGlzcGxheVNxdWFyZXMgZGl2IGEsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXlTcXVhcmVzIGRpdiBwLCAuY29udGVudEJveC5tZW1iZXJzID4gZGl2IC5kaXNwbGF5U3F1YXJlcyBkaXYgYSB7XFxuICBtYXJnaW46IDIlO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQsIC5jb250ZW50Qm94Lm1lbWJlcnMgPiBkaXYgLmRpc3BsYXktdGV4dCB7XFxuICBtYXJnaW4tdG9wOiAtMC4zcmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1zaXplOiAxLjNyZW07XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGdhcDogMC4ycmVtO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQgcCwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheS10ZXh0IHAge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4uY29udGVudEJveC5wcm9wZXJ0aWVzID4gZGl2IC5kaXNwbGF5LXRleHQgcDpudGgtb2YtdHlwZSgyKSwgLmNvbnRlbnRCb3gubWVtYmVycyA+IGRpdiAuZGlzcGxheS10ZXh0IHA6bnRoLW9mLXR5cGUoMikge1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuLmNvbnRlbnRCb3ggLm5ld3Mge1xcbiAgbWFyZ2luOiAwIDElO1xcbiAgcGFkZGluZy10b3A6IDUlO1xcbiAgaGVpZ2h0OiBhdXRvO1xcbn1cXG4uY29udGVudEJveCAubmV3cyBpZnJhbWUge1xcbiAgd2lkdGg6IDMwMHB4O1xcbiAgaGVpZ2h0OiAyMDBweDtcXG59XFxuXFxuI2Zvb3RlckNvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDM5LCAzOSwgMzksIDAuNik7XFxuICBtYXJnaW46IDA7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm90dG9tOiAwO1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xcbiAgcGFkZGluZy1yaWdodDogMnJlbTtcXG4gIGNvbG9yOiBpdm9yeTtcXG59XFxuI2Zvb3RlckNvbnRhaW5lciBwIHtcXG4gIG1hcmdpbjogMXJlbTtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI2Zvb3RlckNvbnRhaW5lciBwIHtcXG4gICAgbWFyZ2luOiAwLjY1cmVtO1xcbiAgfVxcbn1cXG5cXG4jb3BlbmluZ0NvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDk5LjV2aDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGNvbG9yOiByZ2IoMTg5LCAxODksIDE4OSk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGgxIHtcXG4gIGZvbnQtc2l6ZTogNS4ycmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciBoMSB7XFxuICAgIGZvbnQtc2l6ZTogNi41cmVtO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBwIHtcXG4gIGZvbnQtc2l6ZTogMi41cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXG59XFxuQG1lZGlhIChtaW4td2lkdGg6IDEyMDBweCkge1xcbiAgI29wZW5pbmdDb250YWluZXIgcCB7XFxuICAgIGZvbnQtc2l6ZTogMi43cmVtO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciBkaXYge1xcbiAgdGV4dC1zaGFkb3c6IDFweCAxcHggYmxhY2s7XFxuICB3aWR0aDogODAlO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjb3BlbmluZ0NvbnRhaW5lciAjd2VsY29tZUNvbnRhaW5lciBkaXYge1xcbiAgICB3aWR0aDogNzAlO1xcbiAgfVxcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtYXV0by1mbG93OiByb3c7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDQlIDI1JSAxZnI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcwLCA2MiwgNTUsIDAuODUpO1xcbiAgYm94LXNoYWRvdzogMC4ycmVtIDAuMnJlbSAxcmVtIDAuNHJlbSBpbnNldCByZ2JhKDQ5LCA0MywgMzksIDAuNzUpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDVyZW07XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDA7XFxuICB6LWluZGV4OiA5OTk5O1xcbiAgY29sb3I6IHJnYigxOTksIDE4NywgMTU2KTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyLmhpZGRlbiB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgYnV0dG9uIHtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgd2lkdGg6IDEwcmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgYnV0dG9uIGkge1xcbiAgZGlzcGxheTogaW5saW5lO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tc3ltYm9sLCAjb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgI2xvZ28tdGV4dCB7XFxuICBoZWlnaHQ6IDRyZW07XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciAjbG9nby1zeW1ib2wge1xcbiAgbWFyZ2luLXRvcDogMC4zcmVtO1xcbiAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciAjbG9nby10ZXh0IHtcXG4gIG1hcmdpbi10b3A6IDAuNnJlbTtcXG4gIHBhZGRpbmctbGVmdDogMC4ycmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgaW1nIHtcXG4gIGhlaWdodDogMTAwJTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIHAsICNvcGVuaW5nQ29udGFpbmVyIGhlYWRlciBuYXYge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHtcXG4gIG1hcmdpbi1yaWdodDogMnJlbTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgaGVhZGVyIG5hdiB1bCB7XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGdhcDogMS41cmVtO1xcbn1cXG4jb3BlbmluZ0NvbnRhaW5lciBoZWFkZXIgbmF2IHVsIGxpIGEge1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICB0ZXh0LXNoYWRvdzogMXB4IDFweCBibGFjaztcXG59XFxuI29wZW5pbmdDb250YWluZXIgI3BhZ2VJbWFnZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgI3BhZ2VJbWFnZSBpbWcge1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmaWx0ZXI6IGJsdXIoMC42cmVtKSBncmF5c2NhbGUoNTAlKTtcXG59XFxuI29wZW5pbmdDb250YWluZXIgI3dlbGNvbWVDb250YWluZXIge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIG1hcmdpbi10b3A6IDElO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIHtcXG4gICAgbWFyZ2luLXRvcDogMiU7XFxuICB9XFxufVxcbiNvcGVuaW5nQ29udGFpbmVyICN3ZWxjb21lQ29udGFpbmVyIGltZyB7XFxuICBoZWlnaHQ6IDZyZW07XFxufVxcblxcbi50aXRsZUJveCB7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG59XFxuLnRpdGxlQm94IHAge1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxufVxcblxcbi50ZXh0Qm94IHtcXG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbn1cXG4udGV4dEJveCBwIHtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG5cXG4jcHJvcGVydGllc0NvbnRhaW5lciA+IGRpdiAudGl0bGVCb3gsICNtZW1iZXJzQ29udGFpbmVyID4gZGl2IC50aXRsZUJveCB7XFxuICBib3JkZXI6IDAuMzVyZW0gc29saWQgcmdiKDE5OSwgMTg3LCAxNTYpO1xcbn1cXG4jcHJvcGVydGllc0NvbnRhaW5lciBpbWcsICNtZW1iZXJzQ29udGFpbmVyIGltZyB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiNwcm9wZXJ0aWVzQ29udGFpbmVyIGltZy5wYWdlTGlua3NfX3Zpc2libGUsICNtZW1iZXJzQ29udGFpbmVyIGltZy5wYWdlTGlua3NfX3Zpc2libGUge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDI3JSk7XFxufVxcblxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNhbGxOZXdzQ29udGFpbmVyIHtcXG4gICAgaGVpZ2h0OiA1MnJlbTtcXG4gIH1cXG59XFxuXFxuI2NvbnRhY3RDb250YWluZXIge1xcbiAgaGVpZ2h0OiA1OC41cmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjY29udGFjdENvbnRhaW5lciB7XFxuICAgIGhlaWdodDogNTJyZW07XFxuICB9XFxufVxcblxcbiNhbGxOZXdzQ29udGFpbmVyLCAjY29udGFjdENvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzEsIDI3LCAyMSk7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyID4gZGl2IC50aXRsZUJveCwgI2NvbnRhY3RDb250YWluZXIgPiBkaXYgLnRpdGxlQm94IHtcXG4gIGJvcmRlcjogNHB4IHNvbGlkIHJnYigyMjEsIDIyMSwgMjIxKTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgPiBkaXYgLnRleHRCb3ggcCwgI2NvbnRhY3RDb250YWluZXIgPiBkaXYgLnRleHRCb3ggcCB7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3gge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZvbnQtc2l6ZTogMS4xcmVtO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggPiBkaXYge1xcbiAgZmxleC1iYXNpczogNTAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCA+IGRpdiA+IGRpdiwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggPiBkaXYgPiBkaXYge1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBoZWlnaHQ6IDkyJTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLmZvcm0tbWVzc2FnZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggLmZvcm0tbWVzc2FnZSB7XFxuICBoZWlnaHQ6IGF1dG87XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGgzLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBoMyB7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBoZWlnaHQ6IDglO1xcbn1cXG4jYWxsTmV3c0NvbnRhaW5lciAuY29udGVudEJveCB1bCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggdWwge1xcbiAgcGFkZGluZzogMDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggdWwgbGksICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IHVsIGxpIHtcXG4gIGRpc3BsYXk6IGlubGluZTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIHtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjMzLCAyMzMsIDIzMywgMC4zKTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3M6OmFmdGVyLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3czo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIiBcXFwiO1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBoZWlnaHQ6IDFyZW07XFxuICBjbGVhcjogYm90aDtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MgaW1nLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCAubmV3cyBpbWcge1xcbiAgd2lkdGg6IDEzcmVtO1xcbiAgZmxvYXQ6IGxlZnQ7XFxuICBtYXJnaW4tcmlnaHQ6IDIuNSU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIHAsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzIHAge1xcbiAgbGluZS1oZWlnaHQ6IDEuMnJlbTtcXG4gIGZvbnQtc2l6ZTogMS4yNXJlbTtcXG59XFxuI2FsbE5ld3NDb250YWluZXIgLmNvbnRlbnRCb3ggLm5ld3MsICNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0sICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IC5uZXdzLCAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHtcXG4gIHBhZGRpbmc6IDAgNSU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0sICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0ge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIC1tb3otY29sdW1uLWdhcDogMS4ycmVtO1xcbiAgICAgICBjb2x1bW4tZ2FwOiAxLjJyZW07XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwiY29udGFjdE5hbWUgY29udGFjdEVtYWlsXFxcIiBcXFwiY29udGFjdFBob25lIGNvbnRhY3RTdWJqZWN0XFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwiY29udGFjdE1lc3NhZ2UgY29udGFjdE1lc3NhZ2VcXFwiIFxcXCJjb250YWN0TWVzc2FnZSBjb250YWN0TWVzc2FnZVxcXCIgXFxcImNvbnRhY3RNZXNzYWdlIGNvbnRhY3RNZXNzYWdlXFxcIiBcXFwic3VibWl0IC4uLlxcXCI7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtbmFtZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1uYW1lIHtcXG4gIGdyaWQtYXJlYTogY29udGFjdE5hbWU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtZW1haWwsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtZW1haWwge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0RW1haWw7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtcGhvbmUsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtcGhvbmUge1xcbiAgZ3JpZC1hcmVhOiBjb250YWN0UGhvbmU7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3Qtc3ViamVjdCwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1zdWJqZWN0IHtcXG4gIGdyaWQtYXJlYTogY29udGFjdFN1YmplY3Q7XFxufVxcbiNhbGxOZXdzQ29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gI2NvbnRhY3QtbWVzc2FnZSwgI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSAjY29udGFjdC1tZXNzYWdlIHtcXG4gIGdyaWQtYXJlYTogY29udGFjdE1lc3NhZ2U7XFxufVxcblxcbiNjb250YWN0Q29udGFpbmVyIHtcXG4gIGJhY2tncm91bmQ6IGJsYWNrO1xcbiAgY29sb3I6IHdoaXRlO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB7XFxuICAtbW96LWNvbHVtbi1nYXA6IDNyZW07XFxuICAgICAgIGNvbHVtbi1nYXA6IDNyZW07XFxuICB3aWR0aDogODUlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCB7XFxuICAgIHdpZHRoOiA3MCU7XFxuICB9XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGltZyB7XFxuICBmaWx0ZXI6IHNhdHVyYXRlKDEyMCUpO1xcbiAgd2lkdGg6IDQ1JTtcXG4gIG1hcmdpbi1sZWZ0OiAycmVtO1xcbn1cXG5AbWVkaWEgKG1pbi13aWR0aDogMTIwMHB4KSB7XFxuICAjY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBpbWcge1xcbiAgICB3aWR0aDogNTAlO1xcbiAgICBtYXJnaW4tbGVmdDogMDtcXG4gIH1cXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggbGFiZWwuZXJyb3Ige1xcbiAgZm9udC1zaXplOiAxLjVyZW07XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgY29sb3I6IHJnYigxMjAsIDE3OSwgMTU4KTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB7XFxuICBtYXJnaW4tdG9wOiAzcmVtO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtID4gZGl2IHtcXG4gIG1hcmdpbjogNSUgMDtcXG4gIG1hcmdpbi10b3A6IDA7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gbGFiZWwge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gW3R5cGU9cmFkaW9dIHtcXG4gIHdpZHRoOiAxMCU7XFxuICBkaXNwbGF5OiBpbml0aWFsO1xcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIHVsIHtcXG4gIHBhZGRpbmc6IDA7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gaW5wdXQsICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gc2VsZWN0IHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgbWFyZ2luLXRvcDogMiU7XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gaW5wdXQge1xcbiAgaGVpZ2h0OiAxLjVyZW07XFxufVxcbiNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gc2VsZWN0IHtcXG4gIGhlaWdodDogMnJlbTtcXG59XFxuI2NvbnRhY3RDb250YWluZXIgLmNvbnRlbnRCb3ggZm9ybSB0ZXh0YXJlYSB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTVyZW07XFxufVxcbkBtZWRpYSAobWluLXdpZHRoOiAxMjAwcHgpIHtcXG4gICNjb250YWN0Q29udGFpbmVyIC5jb250ZW50Qm94IGZvcm0gdGV4dGFyZWEge1xcbiAgICBoZWlnaHQ6IDIwcmVtO1xcbiAgfVxcbn1cXG4jY29udGFjdENvbnRhaW5lciAuY29udGVudEJveCBmb3JtIGJ1dHRvbiB7XFxuICBncmlkLWFyZWE6IHN1Ym1pdDtcXG4gIGNvbG9yOiBpdm9yeTtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG59XFxuXFxuLmRvdC1wdWxzZSB7XFxuICB0b3A6IDIwJTtcXG4gIGxlZnQ6IDM1JTtcXG59XFxuXFxuI3BvcC11cC1kaXNwbGF5LWJveCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDQ1LCA0MSwgMzUsIDAuOCk7XFxuICB3aWR0aDogOTR2dztcXG4gIGhlaWdodDogODd2aDtcXG4gIG92ZXJmbG93LXk6IGF1dG87XFxuICBvdmVyZmxvdy14OiBoaWRkZW47XFxuICB6LWluZGV4OiAxMTA7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB0b3A6IDh2aDtcXG4gIGxlZnQ6IDN2dztcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgcGFkZGluZy10b3A6IDFyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggaW1nIHtcXG4gIHdpZHRoOiA1MDBweDtcXG59XFxuI3BvcC11cC1kaXNwbGF5LWJveCBhLCAjcG9wLXVwLWRpc3BsYXktYm94IGJ1dHRvbiB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uIHtcXG4gIGNvbG9yOiBhbnRpcXVld2hpdGU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggYnV0dG9uOmhvdmVyLCAjcG9wLXVwLWRpc3BsYXktYm94IGE6aG92ZXIge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDcyJSk7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggI2NvbnRlbnQtaG9sZGVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWV2ZW5seTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiA3MCU7XFxufVxcbiNwb3AtdXAtZGlzcGxheS1ib3ggI2NvbnRlbnQtaG9sZGVyIC5wb3AtdXAtZGlyZWN0aW9uYWwge1xcbiAgZm9udC1zaXplOiAyLjVyZW07XFxufVxcblxcbiNuZXdzLW1lZGlhLWRpc3BsYXkge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg0NCwgNTIsIDc3LCAwLjgpO1xcbiAgaGVpZ2h0OiA4OHZoO1xcbiAgd2lkdGg6IDk0dnc7XFxuICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgei1pbmRleDogMTEwO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA3dmg7XFxuICBsZWZ0OiAzdnc7XFxuICBkaXNwbGF5OiBub25lO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG59XFxuXFxuI3NpbmdsZUNvbnRhaW5lciB7XFxuICBoZWlnaHQ6IDg3JTtcXG4gIG1pbi13aWR0aDogNjAlO1xcbiAgdG9wOiA4LjMlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtd3JhcDogd3JhcDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDE7XFxuICBwYWRkaW5nOiAxLjVyZW0gMXJlbTtcXG4gIHBhZGRpbmctYm90dG9tOiAxcmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzNywgMzUsIDM0LCAwLjkpO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyIGg0IHtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyIGgzLCAjc2luZ2xlQ29udGFpbmVyIGg0LCAjc2luZ2xlQ29udGFpbmVyIC5yZWxhdGVkLWxpbmsge1xcbiAgY29sb3I6IHJnYigyNDEsIDIxOCwgMTg5KTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMge1xcbiAgd2lkdGg6IDIxdnc7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIGltZyB7XFxuICBoZWlnaHQ6IDQyJTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgdWwge1xcbiAgcGFkZGluZy1sZWZ0OiAyMCU7XFxuICBmb250LXNpemU6IDEuNjVyZW07XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjbWFpbkltYWdlQW5kU3RhdHMgdWwgbGkge1xcbiAgbWFyZ2luLXRvcDogMC42cmVtO1xcbiAgbGlzdC1zdHlsZS10eXBlOiBzcXVhcmU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI21haW5JbWFnZUFuZFN0YXRzIHVsIGxpIGEge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDExNSUpO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIHtcXG4gIHdpZHRoOiAzMHZ3O1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogNyUgMWZyO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICNzaW5nbGVJbmZvIHAge1xcbiAgbWFyZ2luLXRvcDogMS4ycmVtO1xcbiAgZm9udC1zaXplOiAxLjdyZW07XFxuICBoZWlnaHQ6IDk5JTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyBkaXYge1xcbiAgb3ZlcmZsb3c6IGF1dG87XFxuICBwYWRkaW5nOiAwIDFyZW07XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3NpbmdsZUluZm8gI21lZGlhQ29udGFpbmVyIHtcXG4gIGhlaWdodDogYXV0bztcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjc2luZ2xlSW5mbyAjbWVkaWFDb250YWluZXIgaWZyYW1lIHtcXG4gIHdpZHRoOiAyMDBweDtcXG4gIGhlaWdodDogMjAwcHg7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3ZpZEFuZEltZ0NvbCB7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTZ2dztcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN2aWRBbmRJbWdDb2wgaDMge1xcbiAgZm9udC1zaXplOiAxLjlyZW07XFxuICBtYXJnaW46IDFyZW0gMDtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wge1xcbiAgd2lkdGg6IDI2dnc7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIHBhZGRpbmc6IDAgMXJlbTtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLXJvd3M6IDEwJSAxZnIgNCU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sIGgzIHtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgaDMgYSB7XFxuICBmb250LXNpemU6IDEuN3JlbTtcXG59XFxuI3NpbmdsZUNvbnRhaW5lciAjdXBkYXRlcy1jb2wgaDMgYTpob3ZlciB7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sICNuZXdzLXJlY2lldmVyIHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbiAgbWFyZ2luOiAxcmVtIDA7XFxufVxcbiNzaW5nbGVDb250YWluZXIgI3VwZGF0ZXMtY29sICNuZXdzLXJlY2lldmVyIHAge1xcbiAgZm9udC1zaXplOiAxLjRyZW07XFxuICBwYWRkaW5nLXJpZ2h0OiAxcmVtO1xcbn1cXG4jc2luZ2xlQ29udGFpbmVyICN1cGRhdGVzLWNvbCAjcGFnaW5hdGlvbi1ob2xkZXIge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiAwO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuYm9keSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTAwLCA5MiwgODIpO1xcbn1cXG5cXG4uc2VhcmNoLW92ZXJsYXkge1xcbiAgb3ZlcmZsb3cteTogYXV0bztcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIHotaW5kZXg6IDExMDtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHRvcDogMDtcXG4gIGxlZnQ6IDA7XFxuICByaWdodDogMDtcXG4gIGJvdHRvbTogMDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNzIsIDY4LCA2MiwgMC45Nik7XFxuICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICBvcGFjaXR5OiAwO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjA5KTtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4zcywgdHJhbnNmb3JtIDAuM3MsIHZpc2liaWxpdHkgMC4zcztcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcbi5zZWFyY2gtb3ZlcmxheSAuY29udGFpbmVyIHtcXG4gIG1heC13aWR0aDogMTMwMHB4O1xcbiAgbWFyZ2luOiAwIGF1dG87XFxuICBwYWRkaW5nOiAwIDE2cHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuLnNlYXJjaC1vdmVybGF5IHAge1xcbiAgcGFkZGluZy10b3A6IDFyZW07XFxufVxcbmJvZHkuYWRtaW4tYmFyIC5zZWFyY2gtb3ZlcmxheSB7XFxuICB0b3A6IDJyZW07XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9fdG9wIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xMik7XFxufVxcbi5zZWFyY2gtb3ZlcmxheV9faWNvbiB7XFxuICBtYXJnaW4tcmlnaHQ6IDAuNzVyZW07XFxuICBmb250LXNpemU6IDIuNXJlbTtcXG4gIGNvbG9yOiByZ2IoMTQ4LCAxMjEsIDEwNSk7XFxufVxcbi5zZWFyY2gtb3ZlcmxheS0tYWN0aXZlIHtcXG4gIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICBvcGFjaXR5OiAxO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG59XFxuLnNlYXJjaC1vdmVybGF5X19zZWN0aW9uLXRpdGxlIHtcXG4gIG1hcmdpbjogMzBweCAwIDFweCAwO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIHBhZGRpbmc6IDE1cHggMDtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjY2NjO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXlfX2Nsb3NlIHtcXG4gIGZvbnQtc2l6ZTogMi43cmVtO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3M7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNTgsIDU0LCA1NCk7XFxuICBjb2xvcjogcmdiKDE4MCwgMTcxLCAxNjYpO1xcbiAgbGluZS1oZWlnaHQ6IDAuNztcXG59XFxuLnNlYXJjaC1vdmVybGF5X19jbG9zZTpob3ZlciB7XFxuICBvcGFjaXR5OiAxO1xcbn1cXG4uc2VhcmNoLW92ZXJsYXkgLm9uZS1oYWxmIHtcXG4gIHBhZGRpbmctYm90dG9tOiAwO1xcbn1cXG5cXG4uc2VhcmNoLXRlcm0ge1xcbiAgd2lkdGg6IDc1JTtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBib3JkZXI6IG5vbmU7XFxuICBwYWRkaW5nOiAxcmVtIDA7XFxuICBtYXJnaW46IDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGZvbnQtc2l6ZTogMXJlbTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgY29sb3I6IHJnYigyMTgsIDIwMSwgMTgyKTtcXG59XFxuXFxuLmJvZHktbm8tc2Nyb2xsIHtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcblxcbi5jb250YWluZXIge1xcbiAgbWF4LXdpZHRoOiAxMzAwcHg7XFxuICBtYXJnaW46IDAgYXV0bztcXG4gIHBhZGRpbmc6IDAgMTZweDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuQG1lZGlhIChtaW4td2lkdGg6IDk2MHB4KSB7XFxuICAuc2VhcmNoLXRlcm0ge1xcbiAgICB3aWR0aDogODAlO1xcbiAgICBmb250LXNpemU6IDNyZW07XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBzcGluIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBzcGluIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcXG4gIH1cXG59XFxuLnNwaW5uZXItbG9hZGVyIHtcXG4gIG1hcmdpbi10b3A6IDQ1cHg7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogMjRweDtcXG4gIGhlaWdodDogMjRweDtcXG4gIGJvcmRlcjogMC4yNXJlbSBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICBib3JkZXItdG9wLWNvbG9yOiBibGFjaztcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBzcGluIDFzIGluZmluaXRlIGxpbmVhcjtcXG4gIGFuaW1hdGlvbjogc3BpbiAxcyBpbmZpbml0ZSBsaW5lYXI7XFxufVxcblxcbi5tZWRpYS1jYXJkIGJ1dHRvbiB7XFxuICBjb2xvcjogd2hpdGU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBmb250LXNpemU6IDIuMXJlbTtcXG59XFxuXFxuaDEsIGgyLCBoMywgaDQge1xcbiAgZm9udC1mYW1pbHk6IFxcXCJMaWJyZSBDYXNsb24gVGV4dFxcXCIsIHNlcmlmO1xcbn1cXG5cXG4ubmV3cyBwLCAudGV4dEJveCBwLCAjcmVsYXRpb25zaGlwLWxpbmssICNzaW5nbGUtbGluayB7XFxuICBmb250LWZhbWlseTogXFxcIkxpYnJlIENhc2xvbiBEaXNwbGF5XFxcIiwgc2VyaWY7XFxufVxcblxcbmgxIHtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcblxcbmgyIHtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxufVxcblxcbi5kaXNwbGF5LXRleHQsICN3ZWxjb21lQ29udGFpbmVyIHAsIC50aXRsZUJveCBwIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiQ29ybW9yYW50IFNDXFxcIiwgc2VyaWY7XFxufVxcblxcbmlucHV0LCAucmVhZC1tb3JlLCAubmV3cyBsaSBhLCBoZWFkZXIgbGkgYSwgI3JlYWx0aW1lRmlsdGVyc0FuZFNvcnRpbmcgYnV0dG9uLCAjc2VhcmNoLWZpbHRlcnMgYnV0dG9uLCAjcmVzZXQtYWxsIHtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiTG9yYVxcXCIsIHNlcmlmO1xcbn1cXG5cXG4uc2VhcmNoLWZvcm0ge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA1MCU7XFxuICBjb2xvcjogd2hpdGU7XFxufVxcblxcbi5jb250ZW50LWxvYWRlciB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gIGhlaWdodDogNTAlO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbn1cXG4uY29udGVudC1sb2FkZXIgLmJhbGwge1xcbiAgd2lkdGg6IDEuMnJlbTtcXG4gIGhlaWdodDogMS4ycmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDQ3LCAxNjMsIDU2KTtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogNTAlO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZzIgMC43cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlLCBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0MiAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcyIDAuN3MgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSwgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdDIgMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcbi5jb250ZW50LWxvYWRlci5sb2FkZXJbZGF0YS10ZXh0XTo6YmVmb3JlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuLmNvbnRlbnQtbG9hZGVyLmxvYWRlci5pcy1hY3RpdmU6OmJlZm9yZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogNTAlO1xcbiAgbGVmdDogMjUlO1xcbiAgdG9wOiAzOSU7XFxuICBmb250LXNpemU6IDIuN3JlbTtcXG4gIGNvbG9yOiByZ2IoMTk1LCAxNjgsIDEyNik7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG59XFxuLmNvbnRlbnQtbG9hZGVyLmxvYWRlci1iYXItcGluZy1wb25nOjphZnRlciB7XFxuICB3aWR0aDogMS4ycmVtO1xcbiAgaGVpZ2h0OiAxLjJyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTAxLCAxNDgsIDE4Nyk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZUJhclBpbmdQb25nIDAuN3MgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSwgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdCAwLjhzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcgMC43cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlLCBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0IDAuOHMgZWFzZS1pbi1vdXQgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG4uY29udGVudC1sb2FkZXIubG9hZGVyLmlzLWFjdGl2ZSB7XFxuICBoZWlnaHQ6IDk3JTtcXG4gIHotaW5kZXg6IDA7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDUxLCA0OSwgNTYsIDAuNzQ5MDE5NjA3OCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogYmxpbmsgMS44cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGJsaW5rIDEuOHMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIGJsaW5rIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgb3BhY2l0eTogMC43NTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGJsaW5rIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgb3BhY2l0eTogMC43NTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nIHtcXG4gIDAlIHtcXG4gICAgbGVmdDogNDAlO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGxlZnQ6IDYwJTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1Bvbmcge1xcbiAgMCUge1xcbiAgICBsZWZ0OiA0MCU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogNjAlO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdCB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNzIsIDY4LCA4MiwgMC43NSk7XFxuICB9XFxuICA1MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEwMiwgNzgsIDEyMiwgMC43NSk7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxNDksIDkzLCAxNjgsIDAuNzUpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ0NvbG9yU2hpZnQge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDcyLCA2OCwgODIsIDAuNzUpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMDIsIDc4LCAxMjIsIDAuNzUpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTQ5LCA5MywgMTY4LCAwLjc1KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZzIge1xcbiAgMCUge1xcbiAgICBsZWZ0OiA0MyU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogNjMlO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZzIge1xcbiAgMCUge1xcbiAgICBsZWZ0OiA0MyU7XFxuICB9XFxuICAxMDAlIHtcXG4gICAgbGVmdDogNjMlO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nQ29sb3JTaGlmdDIge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoNDcsIDE2MywgNTYpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDg3LCAxNDMsIDU2KTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTI2LCAxMzEsIDU4KTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBtb3ZlQmFyUGluZ1BvbmdDb2xvclNoaWZ0MiB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig0NywgMTYzLCA1Nik7XFxuICB9XFxuICA1MCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoODcsIDE0MywgNTYpO1xcbiAgfVxcbiAgMTAwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYigxMjYsIDEzMSwgNTgpO1xcbiAgfVxcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyIHtcXG4gIGhlaWdodDogODUlO1xcbiAgdG9wOiA5JTtcXG4gIHdpZHRoOiA5NSU7XFxuICBsZWZ0OiAyLjUlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzNywgMzUsIDM0LCAwLjc1KTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBjb2xvcjogYWxpY2VibHVlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyIGJ1dHRvbiB7XFxuICBjb2xvcjogYW50aXF1ZXdoaXRlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNtZWRpYS1jb250YWluZXIsICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIge1xcbiAgYm9yZGVyOiAwLjJyZW0gc29saWQgcmdiYSgyMTIsIDE5MywgMTMwLCAwLjQpO1xcbiAgYm9yZGVyLWxlZnQ6IG5vbmU7XFxuICBwYWRkaW5nLWxlZnQ6IDEuNXJlbTtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwicmVhbHRpbWVGaWx0ZXJzQW5kU29ydGluZ1xcXCIgXFxcInNlYXJjaEZpbHRlcnNcXFwiIFxcXCJyZXNldEFsbFxcXCI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyB7XFxuICBncmlkLWFyZWE6IHJlYWx0aW1lRmlsdGVyc0FuZFNvcnRpbmc7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgZ3JpZC10ZW1wbGF0ZS1hcmVhczogXFxcImhlYWRpbmdSRlMgaGVhZGluZ1JGU1xcXCIgXFxcIm9yZGVyQnkgdG9nZ2xlVHlwZVxcXCIgXFxcImZpbHRlckRhdGUgZmlsdGVyRGF0ZVxcXCI7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIGJ1dHRvbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nIGxhYmVsIHtcXG4gIGZvbnQtc2l6ZTogMS4zcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgaDIge1xcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nUkZTO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI29yZGVyLWJ5IHtcXG4gIGdyaWQtYXJlYTogb3JkZXJCeTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNyZWFsdGltZS1maWx0ZXJzLWFuZC1zb3J0aW5nICN0b2dnbGUtdHlwZSB7XFxuICBncmlkLWFyZWE6IHRvZ2dsZVR5cGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyAjZmlsdGVyLWRhdGUge1xcbiAgZ3JpZC1hcmVhOiBmaWx0ZXJEYXRlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgI2ZpbHRlci1kYXRlIGRpdiB1bCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZ2FwOiAzcmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3JlYWx0aW1lLWZpbHRlcnMtYW5kLXNvcnRpbmcgdWwge1xcbiAgcGFkZGluZy1sZWZ0OiAwLjNyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVhbHRpbWUtZmlsdGVycy1hbmQtc29ydGluZyB1bCBsaSB7XFxuICBtYXJnaW4tdG9wOiAwLjVyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMge1xcbiAgZ3JpZC1hcmVhOiBzZWFyY2hGaWx0ZXJzO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtYXJlYXM6IFxcXCJoZWFkaW5nU0YgaGVhZGluZ1NGIGhlYWRpbmdTRlxcXCIgXFxcIm5ld3NTZWFyY2ggbmV3c1NlYXJjaCBuZXdzU2VhcmNoXFxcIiBcXFwiY2FzZVNlbnNpdGl2ZSBmdWxsV29yZE9ubHkgd29yZFN0YXJ0T25seVxcXCIgXFxcImluY2x1ZGVUaXRsZSBpbmNsdWRlRGVzY3JpcHRpb24gLi4uXFxcIjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBoMiB7XFxuICBncmlkLWFyZWE6IGhlYWRpbmdTRjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBidXR0b24ge1xcbiAgZm9udC1zaXplOiAxLjJyZW07XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNuZXdzLXNlYXJjaC1jb250YWluZXIge1xcbiAgZ3JpZC1hcmVhOiBuZXdzU2VhcmNoO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNuZXdzLXNlYXJjaC1jb250YWluZXIgI25ld3Mtc2VhcmNoIHtcXG4gIGZvbnQtc2l6ZTogMS4xNXJlbTtcXG4gIGhlaWdodDogMi4zcmVtO1xcbiAgd2lkdGg6IDE4cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNmdWxsLXdvcmQtb25seSB7XFxuICBncmlkLWFyZWE6IGZ1bGxXb3JkT25seTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjd29yZC1zdGFydC1vbmx5IHtcXG4gIGdyaWQtYXJlYTogd29yZFN0YXJ0T25seTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyAjY2FzZS1zZW5zaXRpdmUge1xcbiAgZ3JpZC1hcmVhOiBjYXNlU2Vuc2l0aXZlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNpbmNsdWRlLXRpdGxlIHtcXG4gIGdyaWQtYXJlYTogaW5jbHVkZVRpdGxlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICNpbmNsdWRlLWRlc2NyaXB0aW9uIHtcXG4gIGdyaWQtYXJlYTogaW5jbHVkZURlc2NyaXB0aW9uO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICN3b3JkLXN0YXJ0LW9ubHkuaW5hY3RpdmUsICNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjc2VhcmNoLWZpbHRlcnMgYnV0dG9uLmluYWN0aXZlIHtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgI3NlYXJjaC1maWx0ZXJzICN3b3JkLXN0YXJ0LW9ubHkuaW5hY3RpdmUgc3BhbiwgI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyICNzZWFyY2gtZmlsdGVycyBidXR0b24uaW5hY3RpdmUgc3BhbiB7XFxuICBjb2xvcjogcmVkO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgYnV0dG9uLCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgc2VsZWN0LCAjYWxsLW5ld3MtY29udGFpbmVyICNmaWx0ZXJzLWFuZC1saW5rcy1jb250YWluZXIgbGFiZWwge1xcbiAgZm9udC1zaXplOiAxLjFyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciAjcmVzZXQtYWxsIHtcXG4gIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgZ3JpZC1hcmVhOiByZXNldEFsbDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGJ1dHRvbiB7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciBoMyB7XFxuICBmb250LXNpemU6IDEuN3JlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjZmlsdGVycy1hbmQtbGlua3MtY29udGFpbmVyIGg0IHtcXG4gIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgbWFyZ2luLWJvdHRvbTogMC44cmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciB7XFxuICB3aWR0aDogNjYlO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogMTAlIDg0JSA2JTtcXG4gIGJvcmRlcjogMC4ycmVtIHNvbGlkIHJnYigxODAsIDE3NCwgMTY0KTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgaDIge1xcbiAgd2lkdGg6IDEwMCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LXNpemU6IDNyZW07XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgYm9yZGVyLWJvdHRvbTogMC4zcmVtIHNvbGlkIHJnYigxODUsIDE1OCwgMTIyKTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Rpc21pc3Mtc2VsZWN0aW9uIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Rpc21pc3Mtc2VsZWN0aW9uLmRpc21pc3NlZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLXJlY2lldmVyIHtcXG4gIG1hcmdpbi1ib3R0b206IDAuNXJlbTtcXG4gIHBhZGRpbmctcmlnaHQ6IDJyZW07XFxuICBvdmVyZmxvdzogYXV0bztcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIge1xcbiAgcGFkZGluZy1sZWZ0OiAycmVtO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5LmRpc21pc3NlZCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIuZGlzbWlzc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3Mge1xcbiAgZm9udC1zaXplOiAxLjJyZW07XFxuICBwYWRkaW5nLXRvcDogMDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3czo6YWZ0ZXIsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzOjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiIFxcXCI7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIGhlaWdodDogMXJlbTtcXG4gIGNsZWFyOiBib3RoO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjbWFpbi1kaXNwbGF5IC5uZXdzIGltZywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBpZnJhbWUsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNmdWxsLWRpc3BsYXktY29udGFpbmVyIC5uZXdzIGltZywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgLm5ld3MgaWZyYW1lIHtcXG4gIGZsb2F0OiBsZWZ0O1xcbiAgbWFyZ2luLXJpZ2h0OiAyJTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSAubmV3cyBwLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBwIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjJyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgLm5ld3MgaWZyYW1lLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciAubmV3cyBpZnJhbWUge1xcbiAgd2lkdGg6IDE1MHB4O1xcbiAgaGVpZ2h0OiAxMDBweDtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkge1xcbiAgbGlzdC1zdHlsZS10eXBlOiBjaXJjbGU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnNlZS1tb3JlLWxpbmssICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAuc2VlLW1vcmUtbGluaywgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI21haW4tZGlzcGxheSB1bCBsaSAuc2VlLW1vcmUtbGluay5kaXNtaXNzZWQsICNhbGwtbmV3cy1jb250YWluZXIgI3NlbGVjdGVkLW5ld3MtY29udGFpbmVyICNtYWluLWRpc3BsYXkgdWwgbGkgLnJlbGF0aW9uc2hpcC1saW5rLmRpc21pc3NlZCwgI2FsbC1uZXdzLWNvbnRhaW5lciAjc2VsZWN0ZWQtbmV3cy1jb250YWluZXIgI2Z1bGwtZGlzcGxheS1jb250YWluZXIgdWwgbGkgLnNlZS1tb3JlLWxpbmsuZGlzbWlzc2VkLCAjYWxsLW5ld3MtY29udGFpbmVyICNzZWxlY3RlZC1uZXdzLWNvbnRhaW5lciAjZnVsbC1kaXNwbGF5LWNvbnRhaW5lciB1bCBsaSAucmVsYXRpb25zaGlwLWxpbmsuZGlzbWlzc2VkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI2ZpbHRlcnMtYW5kLWxpbmtzLWNvbnRhaW5lciB7XFxuICB3aWR0aDogMzYlO1xcbiAgcGFkZGluZy10b3A6IDFyZW07XFxufVxcbiNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlci5kaXNtaXNzZWQge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyBhIHtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGZvbnQtc2l6ZTogMS45cmVtO1xcbiAgbWFyZ2luLWxlZnQ6IDAuNXJlbTtcXG59XFxuI2FsbC1uZXdzLWNvbnRhaW5lciAjcGFnaW5hdGlvbi1ob2xkZXIgLmNvbnRlbnQtcGFnZXMgYS5oaWRkZW4sICNhbGwtbmV3cy1jb250YWluZXIgI3BhZ2luYXRpb24taG9sZGVyIC5jb250ZW50LXBhZ2VzIGEuc2VsZWN0ZWRQYWdlIHtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jYWxsLW5ld3MtY29udGFpbmVyICNwYWdpbmF0aW9uLWhvbGRlciAuY29udGVudC1wYWdlcyBhLmhpZGRlbiB7XFxuICBvcGFjaXR5OiAwO1xcbn1cXG5cXG4jbWVkaWEtcmVjaWV2ZXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTAsIDEwLCAxMCwgMC44KTtcXG4gIHRvcDogNyU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogOTUlO1xcbiAgei1pbmRleDogMTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhIHtcXG4gIG1hcmdpbi1sZWZ0OiAxNHJlbTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogM3JlbTtcXG4gIGhlaWdodDogNDVyZW07XFxuICB3aWR0aDogODByZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSBpZnJhbWUsICNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSBpbWcge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSAjcGxheS1idXR0b24tY29udGFpbmVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNjdXJyZW50LW1lZGlhICNwbGF5LWJ1dHRvbi1jb250YWluZXIgI3BsYXktYnV0dG9uIHtcXG4gIGhlaWdodDogNnJlbTtcXG4gIHdpZHRoOiA5cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg5OSwgMTAwLCAxNzksIDAuOCk7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3JkZXItcmFkaXVzOiAzNSU7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGVhc2U7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjY3VycmVudC1tZWRpYSAjcGxheS1idXR0b24tY29udGFpbmVyICNwbGF5LWJ1dHRvbiBkaXYge1xcbiAgYm9yZGVyLWxlZnQ6IDNyZW0gc29saWQgcmdiKDEyNSwgMTUwLCAxNjgpO1xcbiAgYm9yZGVyLXRvcDogMS43cmVtIHNvbGlkIHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLWJvdHRvbTogMS43cmVtIHNvbGlkIHRyYW5zcGFyZW50O1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEgI3BsYXktYnV0dG9uLWNvbnRhaW5lciAjcGxheS1idXR0b246aG92ZXIge1xcbiAgb3BhY2l0eTogMC43O1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI2N1cnJlbnQtbWVkaWEuY2VudGVyLWRpc3BsYXkge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgaGVpZ2h0OiA4MiU7XFxuICBvdmVyZmxvdzogYXV0bztcXG4gIHJpZ2h0OiAycmVtO1xcbiAgdG9wOiAzcmVtO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLW1lbnUge1xcbiAgZm9udC1zaXplOiAxLjJyZW07XFxuICBkaXNwbGF5OiBmbGV4O1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLW1lbnUgYSB7XFxuICBjb2xvcjogYXp1cmU7XFxuICBtYXJnaW4tbGVmdDogMnJlbTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1tZW51IGEuYWN0aXZlIHtcXG4gIGZpbHRlcjogY29udHJhc3QoNDglKTtcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiB7XFxuICBtYXgtd2lkdGg6IDM4MHB4O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBvdmVyZmxvdzogYXV0bztcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG4gIHdpZHRoOiAxMDAlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS10aHVtYiB7XFxuICB3aWR0aDogNDUlO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS10aHVtYi5zZWxlY3RlZCB7XFxuICBmaWx0ZXI6IGNvbnRyYXN0KDQ4JSk7XFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuI21lZGlhLXJlY2lldmVyICNtZWRpYS1zZWxlY3Rpb24taW50ZXJmYWNlICNtZWRpYS1jb2x1bW4gLm1lZGlhLXNlbGVjdGlvbiAubWVkaWEtaW5mb3JtYXRpb24ge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBtYXJnaW4tbGVmdDogMXJlbTtcXG4gIHdpZHRoOiA1NSU7XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtY29sdW1uIC5tZWRpYS1zZWxlY3Rpb24gLm1lZGlhLWluZm9ybWF0aW9uIHAge1xcbiAgbWFyZ2luOiAwO1xcbiAgY29sb3I6IGJlaWdlO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLWNvbHVtbiAubWVkaWEtc2VsZWN0aW9uIC5tZWRpYS1pbmZvcm1hdGlvbiBwOm50aC1vZi10eXBlKDIpIHtcXG4gIG1hcmdpbi10b3A6IDFyZW07XFxufVxcbiNtZWRpYS1yZWNpZXZlciAjbWVkaWEtc2VsZWN0aW9uLWludGVyZmFjZSAjbWVkaWEtcGFnaW5hdGlvbiB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBjb2xvcjogYWxpY2VibHVlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLXNlbGVjdGlvbi1pbnRlcmZhY2UgI21lZGlhLXBhZ2luYXRpb24gYSB7XFxuICBmb250LXNpemU6IDEuMnJlbTtcXG4gIG1hcmdpbi1sZWZ0OiAxcmVtO1xcbn1cXG4jbWVkaWEtcmVjaWV2ZXIgI21lZGlhLWNsb3NlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGxlZnQ6IDMuNXJlbTtcXG4gIHRvcDogMy41cmVtO1xcbiAgZm9udC1zaXplOiAzLjVyZW07XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcblxcbi5tZWRpYS1jYXJkOmhvdmVyIGltZywgLnByb3BlcnR5LW1lZGlhLWNhcmQ6aG92ZXIgaW1nIHtcXG4gIGZpbHRlcjogYnJpZ2h0bmVzcyg1MCUpO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4ubWVkaWEtY2FyZDpob3ZlciBoMywgLm1lZGlhLWNhcmQ6aG92ZXIgcCwgLm1lZGlhLWNhcmQ6aG92ZXIgYnV0dG9uLCAucHJvcGVydHktbWVkaWEtY2FyZDpob3ZlciBoMywgLnByb3BlcnR5LW1lZGlhLWNhcmQ6aG92ZXIgcCwgLnByb3BlcnR5LW1lZGlhLWNhcmQ6aG92ZXIgYnV0dG9uIHtcXG4gIGZpbHRlcjogY29udHJhc3QoNDAlKTtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLmxvYWRlciB7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBsZWZ0OiAtOTk5OXB4O1xcbiAgdG9wOiAtOTk5OXB4O1xcbiAgd2lkdGg6IDA7XFxuICBoZWlnaHQ6IDA7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgei1pbmRleDogOTk5OTk5O1xcbn1cXG5cXG4ubG9hZGVyOmFmdGVyLCAubG9hZGVyOmJlZm9yZSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuXFxuLmxvYWRlci5pcy1hY3RpdmUge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjg1KTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgbGVmdDogMDtcXG4gIHRvcDogMDtcXG59XFxuXFxuLmxvYWRlci5pcy1hY3RpdmU6YWZ0ZXIsIC5sb2FkZXIuaXMtYWN0aXZlOmJlZm9yZSB7XFxuICBkaXNwbGF5OiBibG9jaztcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIHJvdGF0aW9uIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMCk7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM1OWRlZyk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgcm90YXRpb24ge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzU5ZGVnKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBibGluayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgb3BhY2l0eTogMTtcXG4gIH1cXG59XFxuLmxvYWRlcltkYXRhLXRleHRdOmJlZm9yZSB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBsZWZ0OiAwO1xcbiAgdG9wOiA1MCU7XFxuICBjb2xvcjogY3VycmVudENvbG9yO1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB3aWR0aDogMTAwJTtcXG4gIGZvbnQtc2l6ZTogMTRweDtcXG59XFxuXFxuLmxvYWRlcltkYXRhLXRleHQ9XFxcIlxcXCJdOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiTG9hZGluZ1xcXCI7XFxufVxcblxcbi5sb2FkZXJbZGF0YS10ZXh0XTpub3QoW2RhdGEtdGV4dD1cXFwiXFxcIl0pOmJlZm9yZSB7XFxuICBjb250ZW50OiBhdHRyKGRhdGEtdGV4dCk7XFxufVxcblxcbi5sb2FkZXJbZGF0YS10ZXh0XVtkYXRhLWJsaW5rXTpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGJsaW5rIDFzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogYmxpbmsgMXMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuLmxvYWRlci1kZWZhdWx0W2RhdGEtdGV4dF06YmVmb3JlIHtcXG4gIHRvcDogY2FsYyg1MCUgLSA2M3B4KTtcXG59XFxuXFxuLmxvYWRlci1kZWZhdWx0OmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgd2lkdGg6IDQ4cHg7XFxuICBoZWlnaHQ6IDQ4cHg7XFxuICBib3JkZXI6IDhweCBzb2xpZCAjZmZmO1xcbiAgYm9yZGVyLWxlZnQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDI0cHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAyNHB4KTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiByb3RhdGlvbiAxcyBsaW5lYXIgaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogcm90YXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHRbZGF0YS1oYWxmXTphZnRlciB7XFxuICBib3JkZXItcmlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xcbn1cXG5cXG4ubG9hZGVyLWRlZmF1bHRbZGF0YS1pbnZlcnNlXTphZnRlciB7XFxuICBhbmltYXRpb24tZGlyZWN0aW9uOiByZXZlcnNlO1xcbn1cXG5cXG4ubG9hZGVyLWRvdWJsZTphZnRlciwgLmxvYWRlci1kb3VibGU6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgYm9yZGVyOiA4cHggc29saWQ7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogcm90YXRpb24gMXMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IHJvdGF0aW9uIDFzIGxpbmVhciBpbmZpbml0ZTtcXG59XFxuXFxuLmxvYWRlci1kb3VibGU6YWZ0ZXIge1xcbiAgd2lkdGg6IDQ4cHg7XFxuICBoZWlnaHQ6IDQ4cHg7XFxuICBib3JkZXItY29sb3I6ICNmZmY7XFxuICBib3JkZXItbGVmdC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICB0b3A6IGNhbGMoNTAlIC0gMjRweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDI0cHgpO1xcbn1cXG5cXG4ubG9hZGVyLWRvdWJsZTpiZWZvcmUge1xcbiAgd2lkdGg6IDY0cHg7XFxuICBoZWlnaHQ6IDY0cHg7XFxuICBib3JkZXItY29sb3I6ICNlYjk3NGU7XFxuICBib3JkZXItcmlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb246IDJzO1xcbiAgICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDJzO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDMycHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAzMnB4KTtcXG59XFxuXFxuLmxvYWRlci1iYXJbZGF0YS10ZXh0XTpiZWZvcmUge1xcbiAgdG9wOiBjYWxjKDUwJSAtIDQwcHgpO1xcbiAgY29sb3I6ICNmZmY7XFxufVxcblxcbi5sb2FkZXItYmFyOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICB3aWR0aDogMjAwcHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgtNDVkZWcsICM0MTgzZDcgMjUlLCAjNTJiM2Q5IDAsICM1MmIzZDkgNTAlLCAjNDE4M2Q3IDAsICM0MTgzZDcgNzUlLCAjNTJiM2Q5IDAsICM1MmIzZDkpO1xcbiAgYmFja2dyb3VuZC1zaXplOiAyMHB4IDIwcHg7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDEwcHggMCBoc2xhKDAsIDAlLCAxMDAlLCAwLjIpLCAwIDAgMCA1cHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgYW5pbWF0aW9uOiBtb3ZlQmFyIDEuNXMgbGluZWFyIGluZmluaXRlIHJldmVyc2U7XFxufVxcblxcbi5sb2FkZXItYmFyW2RhdGEtcm91bmRlZF06YWZ0ZXIge1xcbiAgYm9yZGVyLXJhZGl1czogMTVweDtcXG59XFxuXFxuLmxvYWRlci1iYXJbZGF0YS1pbnZlcnNlXTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kaXJlY3Rpb246IG5vcm1hbDtcXG4gICAgICAgICAgYW5pbWF0aW9uLWRpcmVjdGlvbjogbm9ybWFsO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhciB7XFxuICAwJSB7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMjBweCAyMHB4O1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1vdmVCYXIge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7XFxuICB9XFxuICB0byB7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDIwcHggMjBweDtcXG4gIH1cXG59XFxuLmxvYWRlci1iYXItcGluZy1wb25nOmJlZm9yZSB7XFxuICB3aWR0aDogMjAwcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbn1cXG5cXG4ubG9hZGVyLWJhci1waW5nLXBvbmc6YWZ0ZXIsIC5sb2FkZXItYmFyLXBpbmctcG9uZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IGNhbGMoNTAlIC0gMTBweCk7XFxuICBsZWZ0OiBjYWxjKDUwJSAtIDEwMHB4KTtcXG59XFxuXFxuLmxvYWRlci1iYXItcGluZy1wb25nOmFmdGVyIHtcXG4gIHdpZHRoOiA1MHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YxOTtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtb3ZlQmFyUGluZ1BvbmcgMC41cyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVCYXJQaW5nUG9uZyAwLjVzIGxpbmVhciBpbmZpbml0ZSBhbHRlcm5hdGU7XFxufVxcblxcbi5sb2FkZXItYmFyLXBpbmctcG9uZ1tkYXRhLXJvdW5kZWRdOmJlZm9yZSB7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbn1cXG5cXG4ubG9hZGVyLWJhci1waW5nLXBvbmdbZGF0YS1yb3VuZGVkXTphZnRlciB7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogMjBweDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uLW5hbWU6IG1vdmVCYXJQaW5nUG9uZ1JvdW5kZWQ7XFxuICAgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBtb3ZlQmFyUGluZ1BvbmdSb3VuZGVkO1xcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZyB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDUwcHgpO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbW92ZUJhclBpbmdQb25nUm91bmRlZCB7XFxuICAwJSB7XFxuICAgIGxlZnQ6IGNhbGMoNTAlIC0gMTAwcHgpO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSArIDgwcHgpO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG1vdmVCYXJQaW5nUG9uZ1JvdW5kZWQge1xcbiAgMCUge1xcbiAgICBsZWZ0OiBjYWxjKDUwJSAtIDEwMHB4KTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgbGVmdDogY2FsYyg1MCUgKyA4MHB4KTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGNvcm5lcnMge1xcbiAgNiUge1xcbiAgICB3aWR0aDogNjBweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgbGVmdDogY2FsYygxMDAlIC0gMTVweCk7XFxuICAgIHRvcDogMDtcXG4gIH1cXG4gIDMxJSB7XFxuICAgIGhlaWdodDogNjBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgdG9wOiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgbGVmdDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA1NiUge1xcbiAgICB3aWR0aDogNjBweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBsZWZ0OiAwO1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgfVxcbiAgODElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGNvcm5lcnMge1xcbiAgNiUge1xcbiAgICB3aWR0aDogNjBweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgfVxcbiAgMjUlIHtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgbGVmdDogY2FsYygxMDAlIC0gMTVweCk7XFxuICAgIHRvcDogMDtcXG4gIH1cXG4gIDMxJSB7XFxuICAgIGhlaWdodDogNjBweDtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgdG9wOiBjYWxjKDEwMCUgLSAxNXB4KTtcXG4gICAgbGVmdDogY2FsYygxMDAlIC0gMTVweCk7XFxuICB9XFxuICA1NiUge1xcbiAgICB3aWR0aDogNjBweDtcXG4gIH1cXG4gIDc1JSB7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBsZWZ0OiAwO1xcbiAgICB0b3A6IGNhbGMoMTAwJSAtIDE1cHgpO1xcbiAgfVxcbiAgODElIHtcXG4gICAgaGVpZ2h0OiA2MHB4O1xcbiAgfVxcbn1cXG4ubG9hZGVyLWJvcmRlcltkYXRhLXRleHRdOmJlZm9yZSB7XFxuICBjb2xvcjogI2ZmZjtcXG59XFxuXFxuLmxvYWRlci1ib3JkZXI6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAwO1xcbiAgd2lkdGg6IDE1cHg7XFxuICBoZWlnaHQ6IDE1cHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvcm5lcnMgM3MgZWFzZSBib3RoIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvcm5lcnMgM3MgZWFzZSBib3RoIGluZmluaXRlO1xcbn1cXG5cXG4ubG9hZGVyLWJhbGw6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgd2lkdGg6IDUwcHg7XFxuICBoZWlnaHQ6IDUwcHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTI1cHggMCAwIC0yNXB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHotaW5kZXg6IDE7XFxuICAtd2Via2l0LWFuaW1hdGlvbjoga2lja0JhbGwgMXMgaW5maW5pdGUgYWx0ZXJuYXRlIGVhc2UtaW4gYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBraWNrQmFsbCAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1pbiBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLWJhbGxbZGF0YS1zaGFkb3ddOmJlZm9yZSB7XFxuICBib3gtc2hhZG93OiBpbnNldCAtNXB4IC01cHggMTBweCAwIHJnYmEoMCwgMCwgMCwgMC41KTtcXG59XFxuXFxuLmxvYWRlci1iYWxsOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjMpO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgd2lkdGg6IDQ1cHg7XFxuICBoZWlnaHQ6IDIwcHg7XFxuICB0b3A6IGNhbGMoNTAlICsgMTBweCk7XFxuICBsZWZ0OiA1MCU7XFxuICBtYXJnaW46IDAgMCAwIC0yMi41cHg7XFxuICB6LWluZGV4OiAwO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHNoYWRvdyAxcyBpbmZpbml0ZSBhbHRlcm5hdGUgZWFzZS1vdXQgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBzaGFkb3cgMXMgaW5maW5pdGUgYWx0ZXJuYXRlIGVhc2Utb3V0IGJvdGg7XFxufVxcblxcbkAtd2Via2l0LWtleWZyYW1lcyBzaGFkb3cge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwKTtcXG4gIH1cXG4gIDQwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgOTUlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjc1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjc1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBzaGFkb3cge1xcbiAgMCUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwKTtcXG4gIH1cXG4gIDQwJSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgfVxcbiAgOTUlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjc1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjc1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGtpY2tCYWxsIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC04MHB4KSBzY2FsZVgoMC45NSk7XFxuICB9XFxuICA5MCUge1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB9XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKSBzY2FsZVgoMSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJSA1MCUgMjAlIDIwJTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBraWNrQmFsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtODBweCkgc2NhbGVYKDAuOTUpO1xcbiAgfVxcbiAgOTAlIHtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCkgc2NhbGVYKDEpO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCUgNTAlIDIwJSAyMCU7XFxuICB9XFxufVxcbi5sb2FkZXItc21hcnRwaG9uZTphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiAxMnB4O1xcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBsaW5lLWhlaWdodDogMTIwcHg7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBsZWZ0OiA1MCU7XFxuICB0b3A6IDUwJTtcXG4gIHdpZHRoOiA3MHB4O1xcbiAgaGVpZ2h0OiAxMzBweDtcXG4gIG1hcmdpbjogLTY1cHggMCAwIC0zNXB4O1xcbiAgYm9yZGVyOiA1cHggc29saWQgI2ZkMDtcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDVweCAwIDAgI2ZkMDtcXG4gIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgNTAlIDkwJSwgcmdiYSgwLCAwLCAwLCAwLjUpIDZweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgwZGVnLCAjZmQwIDIycHgsIHRyYW5zcGFyZW50IDApLCBsaW5lYXItZ3JhZGllbnQoMGRlZywgcmdiYSgwLCAwLCAwLCAwLjUpIDIycHgsIHJnYmEoMCwgMCwgMCwgMC41KSk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogc2hha2UgMnMgY3ViaWMtYmV6aWVyKDAuMzYsIDAuMDcsIDAuMTksIDAuOTcpIGJvdGggaW5maW5pdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjogc2hha2UgMnMgY3ViaWMtYmV6aWVyKDAuMzYsIDAuMDcsIDAuMTksIDAuOTcpIGJvdGggaW5maW5pdGU7XFxufVxcblxcbi5sb2FkZXItc21hcnRwaG9uZVtkYXRhLXNjcmVlbj1cXFwiXFxcIl06YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIkxvYWRpbmdcXFwiO1xcbn1cXG5cXG4ubG9hZGVyLXNtYXJ0cGhvbmU6bm90KFtkYXRhLXNjcmVlbj1cXFwiXFxcIl0pOmFmdGVyIHtcXG4gIGNvbnRlbnQ6IGF0dHIoZGF0YS1zY3JlZW4pO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgc2hha2Uge1xcbiAgNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDIwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAzNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDU1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgc2hha2Uge1xcbiAgNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgMTAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgMTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDIwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDI1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKDFweCwgMCwgMCk7XFxuICB9XFxuICAzNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApO1xcbiAgfVxcbiAgNDAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgxcHgsIDAsIDApO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgtMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoMXB4LCAwLCAwKTtcXG4gIH1cXG4gIDU1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlM2QoLTFweCwgMCwgMCk7XFxuICB9XFxufVxcbi5sb2FkZXItY2xvY2s6YmVmb3JlIHtcXG4gIHdpZHRoOiAxMjBweDtcXG4gIGhlaWdodDogMTIwcHg7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBtYXJnaW46IC02MHB4IDAgMCAtNjBweDtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHRyYW5zcGFyZW50IDUwJSwgI2Y1ZjVmNSAwKSwgbGluZWFyLWdyYWRpZW50KDkwZGVnLCB0cmFuc3BhcmVudCA1NXB4LCAjMmVjYzcxIDAsICMyZWNjNzEgNjVweCwgdHJhbnNwYXJlbnQgMCksIGxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmNWY1ZjUgNTAlLCAjZjVmNWY1IDApO1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMTBweCAjZjVmNWY1LCAwIDAgMCA1cHggIzU1NSwgMCAwIDAgMTBweCAjN2I3YjdiO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IHJvdGF0aW9uIGluZmluaXRlIDJzIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiByb3RhdGlvbiBpbmZpbml0ZSAycyBsaW5lYXI7XFxufVxcblxcbi5sb2FkZXItY2xvY2s6YWZ0ZXIsIC5sb2FkZXItY2xvY2s6YmVmb3JlIHtcXG4gIGNvbnRlbnQ6IFxcXCJcXFwiO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgbGVmdDogNTAlO1xcbiAgdG9wOiA1MCU7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG4ubG9hZGVyLWNsb2NrOmFmdGVyIHtcXG4gIHdpZHRoOiA2MHB4O1xcbiAgaGVpZ2h0OiA0MHB4O1xcbiAgbWFyZ2luOiAtMjBweCAwIDAgLTE1cHg7XFxuICBib3JkZXItcmFkaXVzOiAyMHB4IDAgMCAyMHB4O1xcbiAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCAxNHB4IDIwcHgsICMyNWEyNWEgMTBweCwgdHJhbnNwYXJlbnQgMCksIHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgMTRweCAyMHB4LCAjMWI3OTQzIDE0cHgsIHRyYW5zcGFyZW50IDApLCBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCB0cmFuc3BhcmVudCAxNXB4LCAjMmVjYzcxIDAsICMyZWNjNzEgMjVweCwgdHJhbnNwYXJlbnQgMCk7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogcm90YXRpb24gaW5maW5pdGUgMjRzIGxpbmVhcjtcXG4gICAgICAgICAgYW5pbWF0aW9uOiByb3RhdGlvbiBpbmZpbml0ZSAyNHMgbGluZWFyO1xcbiAgdHJhbnNmb3JtLW9yaWdpbjogMTVweCBjZW50ZXI7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbjphZnRlciwgLmxvYWRlci1jdXJ0YWluOmJlZm9yZSB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICB3aWR0aDogMTAwJTtcXG4gIHRvcDogNTAlO1xcbiAgbWFyZ2luLXRvcDogLTM1cHg7XFxuICBmb250LXNpemU6IDcwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LWZhbWlseTogSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBsaW5lLWhlaWdodDogMS4yO1xcbiAgY29udGVudDogXFxcIkxvYWRpbmdcXFwiO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW46YmVmb3JlIHtcXG4gIGNvbG9yOiAjNjY2O1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW46YWZ0ZXIge1xcbiAgY29sb3I6ICNmZmY7XFxuICBoZWlnaHQ6IDA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY3VydGFpbiAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY3VydGFpbiAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWN1cnRhaW4tdGV4dF06bm90KFtkYXRhLWN1cnRhaW4tdGV4dD1cXFwiXFxcIl0pOmFmdGVyLCAubG9hZGVyLWN1cnRhaW5bZGF0YS1jdXJ0YWluLXRleHRdOm5vdChbZGF0YS1jdXJ0YWluLXRleHQ9XFxcIlxcXCJdKTpiZWZvcmUge1xcbiAgY29udGVudDogYXR0cihkYXRhLWN1cnRhaW4tdGV4dCk7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWJyYXppbGlhbl06YmVmb3JlIHtcXG4gIGNvbG9yOiAjZjFjNDBmO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW5bZGF0YS1icmF6aWxpYW5dOmFmdGVyIHtcXG4gIGNvbG9yOiAjMmVjYzcxO1xcbn1cXG5cXG4ubG9hZGVyLWN1cnRhaW5bZGF0YS1jb2xvcmZ1bF06YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBtYXNrQ29sb3JmdWwgMnMgbGluZWFyIGluZmluaXRlIGFsdGVybmF0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IG1hc2tDb2xvcmZ1bCAycyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItY3VydGFpbltkYXRhLWNvbG9yZnVsXTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY3VydGFpbiAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGgsIG1hc2tDb2xvcmZ1bC1mcm9udCAycyAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY3VydGFpbiAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGgsIG1hc2tDb2xvcmZ1bC1mcm9udCAycyAxcyBsaW5lYXIgaW5maW5pdGUgYWx0ZXJuYXRlIGJvdGg7XFxuICBjb2xvcjogIzAwMDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIG1hc2tDb2xvcmZ1bCB7XFxuICAwJSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNDkuNSUge1xcbiAgICBjb2xvcjogIzM0OThkYjtcXG4gIH1cXG4gIDUwLjUlIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbG9yOiAjZTc0YzNjO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIG1hc2tDb2xvcmZ1bCB7XFxuICAwJSB7XFxuICAgIGNvbG9yOiAjMzQ5OGRiO1xcbiAgfVxcbiAgNDkuNSUge1xcbiAgICBjb2xvcjogIzM0OThkYjtcXG4gIH1cXG4gIDUwLjUlIHtcXG4gICAgY29sb3I6ICNlNzRjM2M7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbG9yOiAjZTc0YzNjO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgbWFza0NvbG9yZnVsLWZyb250IHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMmVjYzcxO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNmMWM0MGY7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgbWFza0NvbG9yZnVsLWZyb250IHtcXG4gIDAlIHtcXG4gICAgY29sb3I6ICMyZWNjNzE7XFxuICB9XFxuICA0OS41JSB7XFxuICAgIGNvbG9yOiAjMmVjYzcxO1xcbiAgfVxcbiAgNTAuNSUge1xcbiAgICBjb2xvcjogI2YxYzQwZjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29sb3I6ICNmMWM0MGY7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBjdXJ0YWluIHtcXG4gIDAlIHtcXG4gICAgaGVpZ2h0OiAwO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBoZWlnaHQ6IDg0cHg7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgY3VydGFpbiB7XFxuICAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gIH1cXG4gIHRvIHtcXG4gICAgaGVpZ2h0OiA4NHB4O1xcbiAgfVxcbn1cXG4ubG9hZGVyLW11c2ljOmFmdGVyLCAubG9hZGVyLW11c2ljOmJlZm9yZSB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIHdpZHRoOiAyNDBweDtcXG4gIGhlaWdodDogMjQwcHg7XFxuICB0b3A6IDUwJTtcXG4gIGxlZnQ6IDUwJTtcXG4gIG1hcmdpbjogLTEyMHB4IDAgMCAtMTIwcHg7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBsaW5lLWhlaWdodDogMjQwcHg7XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogNDBweDtcXG4gIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xcbiAgdGV4dC1zaGFkb3c6IDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuNSk7XFxuICBsZXR0ZXItc3BhY2luZzogLTFweDtcXG59XFxuXFxuLmxvYWRlci1tdXNpYzphZnRlciB7XFxuICAtd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgICAgICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtaGV5LW9oXTphZnRlciwgLmxvYWRlci1tdXNpY1tkYXRhLWhleS1vaF06YmVmb3JlIHtcXG4gIGJveC1zaGFkb3c6IDAgMCAwIDEwcHg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1oZXktb2hdOmJlZm9yZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgY29sb3I6ICMwMDA7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIG9oIDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCBvaCA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLWhleS1vaF06YWZ0ZXIge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBoZXkgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgaGV5IDVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtbm8tY3J5XTphZnRlciwgLmxvYWRlci1tdXNpY1tkYXRhLW5vLWNyeV06YmVmb3JlIHtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCg0NWRlZywgIzAwOWIzYSA1MCUsICNmZWQxMDAgNTElKTtcXG4gIGJveC1zaGFkb3c6IDAgMCAwIDEwcHggIzAwMDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLW5vLWNyeV06YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgY3J5IDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IGNvaW5CYWNrIDIuNXMgbGluZWFyIGluZmluaXRlLCBjcnkgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1uby1jcnldOmFmdGVyIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBubyA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCBubyA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1tdXNpY1tkYXRhLXdlLWFyZV06YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgdGhlV29ybGQgNXMgMS4yNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbkJhY2sgMi41cyBsaW5lYXIgaW5maW5pdGUsIHRoZVdvcmxkIDVzIDEuMjVzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgYmFja2dyb3VuZDogcmFkaWFsLWdyYWRpZW50KGVsbGlwc2UgYXQgY2VudGVyLCAjNGVjZGM0IDAsICM1NTYyNzApO1xcbn1cXG5cXG4ubG9hZGVyLW11c2ljW2RhdGEtd2UtYXJlXTphZnRlciB7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgd2VBcmUgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICAgICAgICAgIGFuaW1hdGlvbjogY29pbiAyLjVzIGxpbmVhciBpbmZpbml0ZSwgd2VBcmUgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICBiYWNrZ3JvdW5kOiByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSBhdCBjZW50ZXIsICMyNmQwY2UgMCwgIzFhMjk4MCk7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1yb2NrLXlvdV06YmVmb3JlIHtcXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgcm9ja1lvdSA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luQmFjayAyLjVzIGxpbmVhciBpbmZpbml0ZSwgcm9ja1lvdSA1cyAxLjI1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gIGJhY2tncm91bmQ6ICM0NDQ7XFxufVxcblxcbi5sb2FkZXItbXVzaWNbZGF0YS1yb2NrLXlvdV06YWZ0ZXIge1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNvaW4gMi41cyBsaW5lYXIgaW5maW5pdGUsIHdlV2lsbCA1cyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBjb2luIDIuNXMgbGluZWFyIGluZmluaXRlLCB3ZVdpbGwgNXMgbGluZWFyIGluZmluaXRlIGJvdGg7XFxuICBiYWNrZ3JvdW5kOiAjOTYyODFiO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY29pbiB7XFxuICB0byB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgzNTlkZWcpO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGNvaW4ge1xcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMzU5ZGVnKTtcXG4gIH1cXG59XFxuQC13ZWJraXQta2V5ZnJhbWVzIGNvaW5CYWNrIHtcXG4gIDAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7XFxuICB9XFxuICA1MCUge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMXR1cm4pO1xcbiAgfVxcbiAgdG8ge1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBjb2luQmFjayB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDF0dXJuKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBoZXkge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiSGV5IVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiTGV0J3MhXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIkhleSFcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGhleSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJIZXkhXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJMZXQncyFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiSGV5IVxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBvaCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJPaCFcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIkdvIVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJPaCFcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG9oIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiR28hXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIk9oIVxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBubyB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJOby4uLlxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwibm9cXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiTm8uLi5cXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIG5vIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIk5vLi4uXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJub1xcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJOby4uLlxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBjcnkge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwid29tYW5cXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcImNyeSFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwid29tYW5cXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIGNyeSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwiY3J5IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3b21hblxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyB3ZUFyZSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSBhcmVcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcIndlIGFyZVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSBhcmVcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHdlQXJlIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwid2UgYXJlXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIldlIGFyZVxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyB0aGVXb3JsZCB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgd29ybGQsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ0aGUgY2hpbGRyZW4hXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcInRoZSB3b3JsZCxcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHRoZVdvcmxkIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSB3b3JsZCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInRoZSBjaGlsZHJlbiFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwidGhlIHdvcmxkLFxcXCI7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyB3ZVdpbGwge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwiV2Ugd2lsbCxcXFwiO1xcbiAgfVxcbiAgNTAlIHtcXG4gICAgY29udGVudDogXFxcInJvY2sgeW91IVxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJXZSB3aWxsLFxcXCI7XFxuICB9XFxufVxcbkBrZXlmcmFtZXMgd2VXaWxsIHtcXG4gIDAlIHtcXG4gICAgY29udGVudDogXFxcIldlIHdpbGwsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJyb2NrIHlvdSFcXFwiO1xcbiAgfVxcbiAgdG8ge1xcbiAgICBjb250ZW50OiBcXFwiV2Ugd2lsbCxcXFwiO1xcbiAgfVxcbn1cXG5ALXdlYmtpdC1rZXlmcmFtZXMgcm9ja1lvdSB7XFxuICAwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSB3aWxsXFxcIjtcXG4gIH1cXG4gIDUwJSB7XFxuICAgIGNvbnRlbnQ6IFxcXCLwn6SYXFxcIjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgY29udGVudDogXFxcIndlIHdpbGxcXFwiO1xcbiAgfVxcbn1cXG5Aa2V5ZnJhbWVzIHJvY2tZb3Uge1xcbiAgMCUge1xcbiAgICBjb250ZW50OiBcXFwid2Ugd2lsbFxcXCI7XFxuICB9XFxuICA1MCUge1xcbiAgICBjb250ZW50OiBcXFwi8J+kmFxcXCI7XFxuICB9XFxuICB0byB7XFxuICAgIGNvbnRlbnQ6IFxcXCJ3ZSB3aWxsXFxcIjtcXG4gIH1cXG59XFxuLmxvYWRlci1wb2tlYmFsbDpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB3aWR0aDogMTAwcHg7XFxuICBoZWlnaHQ6IDEwMHB4O1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICBtYXJnaW46IC01MHB4IDAgMCAtNTBweDtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJlZCA0MiUsICMwMDAgMCwgIzAwMCA1OCUsICNmZmYgMCk7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gIHotaW5kZXg6IDE7XFxuICAtd2Via2l0LWFuaW1hdGlvbjogbW92ZVBva2ViYWxsIDFzIGxpbmVhciBpbmZpbml0ZSBib3RoO1xcbiAgICAgICAgICBhbmltYXRpb246IG1vdmVQb2tlYmFsbCAxcyBsaW5lYXIgaW5maW5pdGUgYm90aDtcXG59XFxuXFxuLmxvYWRlci1wb2tlYmFsbDphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHdpZHRoOiAyNHB4O1xcbiAgaGVpZ2h0OiAyNHB4O1xcbiAgdG9wOiA1MCU7XFxuICBsZWZ0OiA1MCU7XFxuICBtYXJnaW46IC0xMnB4IDAgMCAtMTJweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB6LWluZGV4OiAyO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IG1vdmVQb2tlYmFsbCAxcyBsaW5lYXIgaW5maW5pdGUgYm90aCwgZmxhc2hQb2tlYmFsbCAwLjVzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb3ZlUG9rZWJhbGwgMXMgbGluZWFyIGluZmluaXRlIGJvdGgsIGZsYXNoUG9rZWJhbGwgMC41cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICBib3JkZXI6IDJweCBzb2xpZCAjMDAwO1xcbiAgYm94LXNoYWRvdzogMCAwIDAgNXB4ICNmZmYsIDAgMCAwIDEwcHggIzAwMDtcXG59XFxuXFxuQC13ZWJraXQta2V5ZnJhbWVzIG1vdmVQb2tlYmFsbCB7XFxuICAwJSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKSByb3RhdGUoMCk7XFxuICB9XFxuICAxNSUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZXgoLTEwcHgpIHJvdGF0ZSgtNWRlZyk7XFxuICB9XFxuICAzMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTBweCkgcm90YXRlKDVkZWcpO1xcbiAgfVxcbiAgNDUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGV4KDApIHJvdGF0ZSgwKTtcXG4gIH1cXG59XFxuXFxuQGtleWZyYW1lcyBtb3ZlUG9rZWJhbGwge1xcbiAgMCUge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCkgcm90YXRlKDApO1xcbiAgfVxcbiAgMTUlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGV4KC0xMHB4KSByb3RhdGUoLTVkZWcpO1xcbiAgfVxcbiAgMzAlIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwcHgpIHJvdGF0ZSg1ZGVnKTtcXG4gIH1cXG4gIDQ1JSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRleCgwKSByb3RhdGUoMCk7XFxuICB9XFxufVxcbkAtd2Via2l0LWtleWZyYW1lcyBmbGFzaFBva2ViYWxsIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZkMDtcXG4gIH1cXG59XFxuQGtleWZyYW1lcyBmbGFzaFBva2ViYWxsIHtcXG4gIDAlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIH1cXG4gIHRvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZkMDtcXG4gIH1cXG59XFxuLmxvYWRlci1ib3VuY2luZzphZnRlciwgLmxvYWRlci1ib3VuY2luZzpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICB3aWR0aDogMjBweDtcXG4gIGhlaWdodDogMjBweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogY2FsYyg1MCUgLSAxMHB4KTtcXG4gIGxlZnQ6IGNhbGMoNTAlIC0gMTBweCk7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGtpY2sgMC42cyBpbmZpbml0ZSBhbHRlcm5hdGU7XFxuICAgICAgICAgIGFuaW1hdGlvbjoga2ljayAwLjZzIGluZmluaXRlIGFsdGVybmF0ZTtcXG59XFxuXFxuLmxvYWRlci1ib3VuY2luZzphZnRlciB7XFxuICBtYXJnaW4tbGVmdDogLTMwcHg7XFxuICAtd2Via2l0LWFuaW1hdGlvbjoga2ljayAwLjZzIGluZmluaXRlIGFsdGVybmF0ZTtcXG4gICAgICAgICAgYW5pbWF0aW9uOiBraWNrIDAuNnMgaW5maW5pdGUgYWx0ZXJuYXRlO1xcbn1cXG5cXG4ubG9hZGVyLWJvdW5jaW5nOmJlZm9yZSB7XFxuICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogMC4ycztcXG4gICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAwLjJzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMga2ljayB7XFxuICAwJSB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIH1cXG4gIHRvIHtcXG4gICAgb3BhY2l0eTogMC4zO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFyZW0pO1xcbiAgfVxcbn1cXG5cXG5Aa2V5ZnJhbWVzIGtpY2sge1xcbiAgMCUge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB9XFxuICB0byB7XFxuICAgIG9wYWNpdHk6IDAuMztcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcmVtKTtcXG4gIH1cXG59XFxuLnNibC1jaXJjLXJpcHBsZSB7XFxuICBoZWlnaHQ6IDQ4cHg7XFxuICB3aWR0aDogNDhweDtcXG4gIGNvbG9yOiAjNDg2NTliO1xcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgdG9wOiAyMCU7XFxuICBsZWZ0OiA0MCU7XFxufVxcblxcbi5zYmwtY2lyYy1yaXBwbGU6OmFmdGVyLCAuc2JsLWNpcmMtcmlwcGxlOjpiZWZvcmUge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICBoZWlnaHQ6IDA7XFxuICB3aWR0aDogMDtcXG4gIGJvcmRlcjogaW5oZXJpdDtcXG4gIGJvcmRlcjogNXB4IHNvbGlkO1xcbiAgYm9yZGVyLXJhZGl1czogaW5oZXJpdDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGxlZnQ6IDQwJTtcXG4gIHRvcDogNDAlO1xcbiAgLXdlYmtpdC1hbmltYXRpb246IGNpcmNsZS1yaXBwbGUgMXMgbGluZWFyIGluZmluaXRlO1xcbiAgICAgICAgICBhbmltYXRpb246IGNpcmNsZS1yaXBwbGUgMXMgbGluZWFyIGluZmluaXRlO1xcbn1cXG5cXG4uc2JsLWNpcmMtcmlwcGxlOjpiZWZvcmUge1xcbiAgLXdlYmtpdC1hbmltYXRpb24tZGVsYXk6IC0wLjZzO1xcbiAgICAgICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjZzO1xcbn1cXG5cXG5ALXdlYmtpdC1rZXlmcmFtZXMgY2lyY2xlLXJpcHBsZSB7XFxuICAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gICAgd2lkdGg6IDA7XFxuICAgIGxlZnQ6IDEuNnJlbTtcXG4gICAgdG9wOiAxLjZyZW07XFxuICB9XFxuICAxMDAlIHtcXG4gICAgaGVpZ2h0OiA1cmVtO1xcbiAgICB3aWR0aDogNXJlbTtcXG4gICAgbGVmdDogLTFyZW07XFxuICAgIHRvcDogLTFyZW07XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufVxcblxcbkBrZXlmcmFtZXMgY2lyY2xlLXJpcHBsZSB7XFxuICAwJSB7XFxuICAgIGhlaWdodDogMDtcXG4gICAgd2lkdGg6IDA7XFxuICAgIGxlZnQ6IDEuNnJlbTtcXG4gICAgdG9wOiAxLjZyZW07XFxuICB9XFxuICAxMDAlIHtcXG4gICAgaGVpZ2h0OiA1cmVtO1xcbiAgICB3aWR0aDogNXJlbTtcXG4gICAgbGVmdDogLTFyZW07XFxuICAgIHRvcDogLTFyZW07XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxufS8qIyBzb3VyY2VNYXBwaW5nVVJMPXN0eWxlLmNzcy5tYXAgKi9cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9jc3Mvc3R5bGUuY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvYmFzZS9fY3VzdG9tQmFzZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvYmFzZS9fbWl4aW5zLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19mb290ZXIuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX29wZW5pbmcuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3Byb3BlcnRpZXMuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3NpbmdsZS5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fY29uc3RhbnQuc2Nzc1wiLFwid2VicGFjazovLy4vY3NzL21vZHVsZXMvX3NlYXJjaC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fbG9hZGVyLnNjc3NcIixcIndlYnBhY2s6Ly8uL2Nzcy9tb2R1bGVzL19hbGwtbmV3cy5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvbW9kdWxlcy9fc2hhZG93LWJveC5zY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG93bmxvYWRzL2Nzcy1sb2FkZXIuY3NzXCIsXCJ3ZWJwYWNrOi8vLi9jc3MvZG93bmxvYWRzL3NibC1jaXJjLXJpcHBsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwi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QUNBLFVBQUE7SUFDQSxVQUFBO0Vic2hFRjtBQUNGLENBQUEsb0NBQUFcIixcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCBcIlwiKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vZG90cy5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2RvdHMuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcblxuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG5cbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG5cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cblxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG5cbiAgY3NzICs9IG9iai5jc3M7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vQ29udGludWUgdG8gd29yayBvbiBtYWtpbmcgdGhpcyBtb3JlIGVmZmljaWVudCBhbmQgcmVhZGFibGVcclxuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiXHJcbmltcG9ydCBTaGFkb3dCb3ggZnJvbSAnLi9zaGFkb3dCb3gnO1xyXG5jbGFzcyBOZXdzIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgLy8gdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyk7XHJcbiAgICBpZihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxsLW5ld3MtY29udGFpbmVyJykpe1xyXG4gICAgICAgIHRoaXMucmV0dXJuSG9tZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXR1cm4taG9tZScpO1xyXG4gICAgICAgICAgICAgICAgIC8vTGF0ZXIsIGZpbmQgd2F5IHRvIG1ha2UgdGhpcyBub3QgY2F1c2UgZXJyb3JzIG9uIG90aGVyIHBhZ2VzXHJcbiAgICAgICAgdGhpcy5tYWluQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsbC1uZXdzLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIHRoaXMubmV3c1JlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW4tZGlzcGxheScpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdpbmF0aW9uLWhvbGRlcicpXHJcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBMaW5rcztcclxuICAgICAgICB0aGlzLnNlZU1vcmU7XHJcbiAgICAgICAgdGhpcy5kaXNtaXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc21pc3Mtc2VsZWN0aW9uJyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxUaXRsZSA9IFwiQWxsIE5ld3NcIjtcclxuICAgICAgICB0aGlzLnN0b3JlZFRpdGxlO1xyXG4gICAgICAgIHRoaXMuZnVsbERpc3BsYXlDb250ZW50ID0gW107XHJcbiAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4dGVybmFsQ2FsbCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENhbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm9yaWdpbjtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSAwO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLm1haW5IZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbi1oZWFkZXInKTtcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuZXdzLXNlYXJjaFwiKVxyXG4gICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gJyc7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2VcclxuICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMudHlwaW5nVGltZXI7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFJlcG9ydDsgICAgICBcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Z1bGwtZGlzcGxheS1jb250YWluZXInKTsgICAgXHJcbiAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnJlc2V0QWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0LWFsbCcpO1xyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG9nZ2xlLW9wdGlvbnMnKTtcclxuXHJcbiAgICAgICAgLy9BZnRlciBnZXQgZXZlcnl0aGluZyB3b3JraW5nLCBwdXQgdGhlIHNldHRpbmcgaW4gaGVyZSwgcmFyZXIgdGhhbiBqdXN0IGEgcmVmXHJcbiAgICAgICAgLy9udm0uIE5lZWQgdG8gZG8gaXQgbm93XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5yZW9yZGVyQnlEYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI29yZGVyLWJ5LWRhdGUnKTtcclxuICAgICAgICB0aGlzLnJlb3JkZXJCeUFscGhhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI29yZGVyLWJ5LWFscGhhJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZnVsbFdvcmRTd2l0Y2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZnVsbC13b3JkLW9ubHknKTtcclxuXHJcbiAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd29yZC1zdGFydC1vbmx5Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZVN3aXRjaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXNlLXNlbnNpdGl2ZScpO1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVUaXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbmNsdWRlLXRpdGxlJyk7XHJcbiAgICAgICAgdGhpcy5pbmNsdWRlRGVzY3JpcHRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1kZXNjcmlwdGlvbicpO1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVQcm9wZXJ0eVVwZGF0ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1wcm9wZXJ0eS11cGRhdGVzJyk7XHJcbiAgICAgICAgdGhpcy5pbmNsdWRlR2VuZXJhbE5ld3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jbHVkZS1nZW5lcmFsLW5ld3MnKTtcclxuXHJcbiAgICAgICAgdGhpcy50b2dnYWJsZVNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBkYXRlT3JkZXI6e1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnb3JkZXItYnktZGF0ZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdkZXNjJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWxwaGFPcmRlcjp7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdvcmRlci1ieS1hbHBoYScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdkZXNjJyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGluY2x1ZGVUaXRsZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS10aXRsZScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5jbHVkZURlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdpbmNsdWRlLWRlc2NyaXB0aW9uJyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZTogJ2luY2x1ZGUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1cGRhdGU6IHtcclxuICAgICAgICAgICAgICAgIHJlZjogJ2luY2x1ZGUtcHJvcGVydHktdXBkYXRlcycsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdpbmNsdWRlJyxcclxuICAgICAgICAgICAgICAgIGlzT246IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbmV3czoge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnaW5jbHVkZS1nZW5lcmFsLW5ld3MnLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnaW5jbHVkZScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bGxXb3JkOiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICdmdWxsLXdvcmQtb25seScsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmU6ICdmdWxsLXdvcmQtb25seScsXHJcbiAgICAgICAgICAgICAgICBpc09uOiBmYWxzZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3b3JkU3RhcnRPbmx5OiB7XHJcbiAgICAgICAgICAgICAgICByZWY6ICd3b3JkLXN0YXJ0LW9ubHknLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnd29yZC1zdGFydC1vbmx5JyxcclxuICAgICAgICAgICAgICAgIGlzT246IGZhbHNlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGlzQ2FzZVNlbnNpdGl2ZToge1xyXG4gICAgICAgICAgICAgICAgcmVmOiAnY2FzZS1zZW5zaXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlOiAnY2FzZS1zZW5zaXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgaXNPbjogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGlzLmZpbHRlckJ5ZGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWx0ZXItYnktZGF0ZScpXHJcbiAgICAgICAgLy8gdGhpcy5pc0RhdGVGaWx0ZXJPbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGF0ZS1maWx0ZXJzJyk7XHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucyA9IHRoaXMuZGF0ZUZpbHRlcnMucXVlcnlTZWxlY3RvckFsbCgnc2VsZWN0Jyk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vcmFuZ2UgbWFrZXMgdGhlIHByZXZpb3VzIHR3byBudWxsLCBlZmZlY3RpdmVseSBjYW5jZWxpbmcgdGhleSBvdXQgYW5kIHNodXR0aW5nIG9mZiB0aGVpciBpZiBsb2dpY1xyXG4gICAgICAgIC8vYnV0dG9uIHdpbGwgbWFrZSBvcHRpb25zIGFwcGVhciBhbmQgbWFrZSBpc0ZpbHRlck9uID0gdHJ1ZSwgYnV0IGlmIG5vIG9wdGlvbiBpcyBzZWxlY3RlZCwgdGhleSBkaXNzYXBlYXIgYW5kIGZhbHNlIGlzIHJlc3RvcmVkIFxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlclNldFVwID0ge1xyXG4gICAgICAgICAgICBtb250aDogbnVsbCxcclxuICAgICAgICAgICAgeWVhcjogbnVsbCxcclxuICAgICAgICAgICAgLy8gcmFuZ2U6IHtcclxuICAgICAgICAgICAgLy8gICAgIHN0YXJ0OiBudWxsLFxyXG4gICAgICAgICAgICAvLyAgICAgZW5kOiBudWxsXHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMueWVhck9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnkteWVhcicpO1xyXG4gICAgICAgIHRoaXMubW9udGhPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2J5LW1vbnRoJyk7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueWVhckxpc3QgPSB7fVxyXG4gICAgICAgIHRoaXMubW9udGhzID0gW107XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5ldmVudHModGFyZ2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBldmVudHModGFyZ2V0KXtcclxuICAgICAgICBcclxuICAgICAgICAvLyBjb25zdCBkZWZhdWx0U3dpdGNoU2V0dGluZ3MgPSB7Li4udGhpcy50b2dnYWJsZVNldHRpbmdzLCBhbHBoYU9yZGVyOiB7Li4udGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXJ9fTtcclxuICAgICAgICBsZXQgZGVmYXVsdFN3aXRjaFNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MpKVxyXG5cclxuICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3B1bGF0ZURhdGVGaWx0ZXJzKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRBbGwub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlVGV4dChkZWZhdWx0U3dpdGNoU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnRvZ2dhYmxlU2V0dGluZ3MgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRTd2l0Y2hTZXR0aW5ncykpO1xyXG4gICAgICAgICAgICB0YXJnZXQgPSB0aGlzLnRvZ2dhYmxlU2V0dGluZ3M7IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyLCB0YXJnZXQuZGF0ZU9yZGVyKVxyXG4gICAgICAgICAgICB0aGlzLndvcmRTZWFyY2hQb3NpdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhkZWZhdWx0U3dpdGNoU2V0dGluZ3MuaXNDYXNlU2Vuc2l0aXZlKVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5pbml0aWFsVGl0bGV9YDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLnZhbHVlID0gJydcclxuICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMudmFsdWUgPSAnJ1xyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHllYXIub3B0aW9uc1t5ZWFyLnNlbGVjdGVkSW5kZXhdLnZhbHVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2Rlc2MgZGF0ZSBub3Qgd29ya2luZ1xyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5RGF0ZS5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50b2dnYWJsZVNldHRpbmdzLmRhdGVPcmRlcilcclxuICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuaXNPbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRhcmdldC5hbHBoYU9yZGVyLmRpcmVjdGl2ZSA9ICdkZXNjJ1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5pc09uID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPT09ICdkZXNjJyl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZGF0ZU9yZGVyLmRpcmVjdGl2ZSA9ICdhc2MnXHJcbiAgICAgICAgICAgIH1lbHNlKFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmRhdGVPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICB9O1xyXG4vL2luaWF0ZSB0b2dnbGUgdGhyb3VnaCB0aGVzZSwgdXNpbmcgbGV0cyB0byBoYW5kbGUgYm90aCBjaGFuZ2VzIGJhc2VkIG9uIHRoZSAuZGlyZWN0aXZlIHZhbHVlLCBcclxuLy9hbmQgbWF5YmUgZXZlbiBzZXR0aW5nIGludGlhbCBoaWRpbmcgdGhpcyB3YXkgdG9vIFxyXG4gICAgICAgIHRoaXMucmVvcmRlckJ5QWxwaGEub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuaXNPbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRhcmdldC5kYXRlT3JkZXIuZGlyZWN0aXZlID0gJ2Rlc2MnXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5pc09uID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID09PSAnZGVzYycpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmFscGhhT3JkZXIuZGlyZWN0aXZlID0gJ2FzYydcclxuICAgICAgICAgICAgfWVsc2UoXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWxwaGFPcmRlci5kaXJlY3RpdmUgPSAnZGVzYydcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVQcm9wZXJ0eVVwZGF0ZXMub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC51cGRhdGUuaXNPbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudXBkYXRlLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQudXBkYXRlLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmNsdWRlR2VuZXJhbE5ld3Mub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC5uZXdzLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm5ld3MuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5uZXdzLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmZ1bGxXb3JkU3dpdGNoLm9uY2xpY2sgPSAoKT0+e1xyXG5cclxuICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZ1bGxXb3JkLmlzT24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMud29yZFNlYXJjaFBvc2l0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1lbHNleyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZ1bGxXb3JkLmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24uY2xhc3NMaXN0LmFkZCgnaW5hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHdvcmQgc3RhcnQgb25seSBpczogJHt0YXJnZXQud29yZFN0YXJ0T25seS5pc09ufWApXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmdWxsIHdvcmQgb25seSBpczogJHt0YXJnZXQuZnVsbFdvcmQuaXNPbn1gKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy53b3JkU2VhcmNoUG9zaXRpb24ub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgICAgIGlmKHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC53b3JkU3RhcnRPbmx5LmlzT24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgd29yZCBzdGFydCBvbmx5IGlzOiAke3RhcmdldC53b3JkU3RhcnRPbmx5LmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FzZVNlbnNpdGl2ZVN3aXRjaC5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmlzQ2FzZVNlbnNpdGl2ZS5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBjYXNlIHNlbnNpdGl2ZSBpczogJHt0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT259YClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5jbHVkZVRpdGxlLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmluY2x1ZGVUaXRsZS5pc09uID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmluY2x1ZGVEZXNjcmlwdGlvbi5vbmNsaWNrID0gKCk9PntcclxuICAgICAgICAgICAgaWYodGFyZ2V0LmluY2x1ZGVEZXNjcmlwdGlvbi5pc09uKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbmNsdWRlRGVzY3JpcHRpb24uaXNPbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5pbmNsdWRlUmVsYXRpb25zaGlwLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vICAgICBpZih0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyl7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnNlYXJjaGFibGVGaWVsZHMucmVsYXRpb25zaGlwcyA9IGZhbHNlO1xyXG4gICAgICAgIC8vICAgICB9ZWxzZXtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuc2VhcmNoYWJsZUZpZWxkcy5yZWxhdGlvbnNoaXBzID0gdHJ1ZTtcclxuICAgICAgICAvLyAgICAgfSAgXHJcbiAgICAgICAgLy8gfTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5maWx0ZXJCeWRhdGUub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgLy8gICAgIHRoaXMuZGF0ZUZpbHRlcnMuY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuaXNEYXRlRmlsdGVyT24gPSB0cnVlO1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh0aGlzLmlzRGF0ZUZpbHRlck9uKVxyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucy5mb3JFYWNoKGUgPT57XHJcbiAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKG9wdGlvbik9PntcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50TW9udGggPSB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihlLmlkID09PSAnYnkteWVhcicpe1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnllYXJPcHRpb25zLnZhbHVlICE9PSAnJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMueWVhckxpc3RbdGhpcy55ZWFyT3B0aW9ucy52YWx1ZV0ubWFwKG1vbnRoPT4gYDxvcHRpb24gdmFsdWU9XCIke21vbnRofVwiPiR7bW9udGh9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLm1vbnRocy5tYXAobW9udGg9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7bW9udGh9XCI+JHttb250aH08L29wdGlvbj5gKS5qb2luKCcnKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5tb250aE9wdGlvbnMucXVlcnlTZWxlY3Rvcihgb3B0aW9uW3ZhbHVlPScke2N1cnJlbnRNb250aH0nXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhPcHRpb25zLnZhbHVlID0gY3VycmVudE1vbnRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb250aE9wdGlvbnMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy52YWx1ZSA9ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBvcHRpb24udGFyZ2V0LmlkLnNsaWNlKDMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlRmlsdGVyU2V0VXBbdmFsdWVdID0gb3B0aW9uLnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZGF0ZUZpbHRlclNldFVwKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXdzU2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoKSA9PiB0aGlzLnR5cGluZ0xvZ2ljKCkpXHJcblxyXG4gICAgICAgIHRoaXMuZGlzbWlzc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpKVxyXG5cclxuICAgICAgICB0aGlzLnRvZ2dsZVRleHQodGFyZ2V0KTtcclxuICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMuZm9yRWFjaChlPT57ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gdGhpcy50b2dnbGVUZXh0KHRhcmdldCkpfSlcclxuICAgIH1cclxuLy9BZGQgJ2lzT24nIHRvIGV4Y2x1ZGVzLCB3aXRoIGluY2x1ZGUgaGF2aW5nIGNsYXNzIG9mZiBhbmQgZXhjbHVkZSBoYXZpbmcgY2xhc3Mgb2YgKnZhbHVlP1xyXG4gICAgdG9nZ2xlVGV4dCh0YXJnZXQpe1xyXG4gICAgICAgIGxldCBmaWx0ZXJLZXlzID0gT2JqZWN0LmtleXModGFyZ2V0KVxyXG4gICAgICAgIGZpbHRlcktleXMuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYCMke3RhcmdldFtlXS5yZWZ9IHNwYW5gKS5mb3JFYWNoKGk9PmkuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpXHJcbiAgICAgICAgICAgIGlmKHRhcmdldFtlXS5pc09uKXtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RhcmdldFtlXS5yZWZ9IC4ke3RhcmdldFtlXS5kaXJlY3RpdmV9YCkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGFyZ2V0W2VdLnJlZn0gLm9mZmApLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICAvL1JlZG8gcGFnaW5hdGlvbiwgYnV0IHdpbGwgbmVlZCB0byBoYXZlIHNldHVwIHdvcmsgZm9yIGdldHRpbmcgcmlkIHRocm91Z2ggZWFjaCByZWxvYWRcclxuICAgIFxyXG4gICAgLy9jaGVjayBwYWdpbmF0aW9uIHRocm91Z2hvdXQgZWFjaCBhZGRcclxuXHJcbiAgICAvL2VzdGFibGlzaCBkZWZhdWx0IHNlYXJjaCBiZWhhdmlvci4gQXMgaW4sIGRvZXMgaXQgbG9vayBhdCB0aXRsZSwgYmlvLCBcclxuICAgIC8vYW5kIGNhcHRpb24gcGFydGlhbHMgYXQgdGhlIHN0YXJ0PyhpbiBpZiBzdGF0ZW1lbnRzIHVzZSBjb250YWlucyBvbiBzdHJpbmdzPylcclxuICAgIC8vaW4gZ2F0aGVyTmV3cygpIGhhdmUgaWYgc3RhdGVtZW50cyB0aGF0IHdvcmsgdGhyb3VnaCB0aGUgZGF0YSBhZnRlciBpdCdzIGdvdHRlbiwgYmVmb3JlIHRoZSBpbnNlcnRpb25zXHJcbiAgICAvL1doZW4gY2xpY2sgb24gbmV3cywgdXNlIGJpZ2dlciBwaWN0dXJlLiBBbHNvIHB1dCBpbiBkdW1teSwgXHJcbiAgICAvL3JlbGF0ZWQgc2l0ZXMgb24gdGhlIHJpZ2h0LCBhbmQgbWF5YmUgZXZlbiByZWxhdGVkIG1lbWJlcnMgYW5kIHByb3BlcnRpZXModGl0bGUgb3ZlciBhbmQgd2l0aCBsaW5rcylcclxuICAgIC8vQWxzbyBsaXN0IG90aGVyIG5ld3MgcmVsYXRlZCB0byBpdCwgbGlrZSBpZiBhbGwgYWJvdXQgc2FtZSBidWlsZGluZyBvciBtZW1iZXIoY2FuIHVzZSBjbW1vbiByZWxhdGlvbiBmb3IgdGhhdCBidXQgXHJcbiAgICAvL25lZWQgdG8gYWRkIGEgbmV3IGZpZWxkIGZvciB0eXBlcyBvZiByZWxhdGlvbnNoaXBzKVxyXG4gICAgLy9HaXZlIHRpdGxlcyB0byBvdGhlciBzZWN0aW9ucywgd2l0aCB0aGUgcmlnaHQgYmVpbmcgZGl2aWRlZCBpbnRvIHJlbGF0ZWQgbGlua3MgYW5kIHNlYXJjaCBtb2RpZmljYXRpb25zXHJcbiAgICAvL1JlbWVtYmVyIGZ1bmN0aW9uYWxpdHkgZm9yIG90aGVyIHBhcnRzIGxpbmtpbmcgdG8gaGVyZVxyXG4gICAgdHlwaW5nTG9naWMoKSB7XHJcbiAgICAgICAgLy9BdXRvbWF0aWNhbGx5IGRpc21pc3Mgc2luZ2xlIG9yIGhhdmUgdGhpcyBhbmQgb3RoZXIgYnV0dG9ucyBmcm96ZW4gYW5kL29yIGhpZGRlbiB1bnRpbCBkaXNtaXNzZWRcclxuICAgICAgICAvL0xlYW5pbmcgdG93YXJkcyB0aGUgbGF0dGVyLCBhcyBmYXIgbGVzcyBjb21wbGljYXRlZFxyXG4gICAgICAgIGlmICh0aGlzLm5ld3NTZWFyY2gudmFsdWUgIT09IHRoaXMucHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzbWlzc1NlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudHlwaW5nVGltZXIpXHJcbiAgICBcclxuICAgICAgICAgIGlmICh0aGlzLm5ld3NTZWFyY2gudmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzU3Bpbm5lclZpc2libGUpIHtcclxuICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9IHRoaXMubmV3c1NlYXJjaC52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke3RoaXMubmV3c0RlbGl2ZXJ5fWA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gMDtcclxuICAgICAgICAgICAgdGhpcy50eXBpbmdUaW1lciA9IHNldFRpbWVvdXQodGhpcy5nYXRoZXJOZXdzLmJpbmQodGhpcyksIDc1MCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm5ld3NEZWxpdmVyeSA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgJHt0aGlzLmluaXRpYWxUaXRsZX1gO1xyXG4gICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5uZXdzU2VhcmNoLnZhbHVlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzeW5jIHBvcHVsYXRlRGF0ZUZpbHRlcnMoKXtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIC8vSXMgaXQgYmV0dGVyIGp1c3QgdG8gdXNlIHNlcGVyYXRlIHVybCByb3V0ZXM/IFxyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvYWxsLW5ld3M/bmV3cycpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkYXRlcyA9IFtdO1xyXG4gICAgICAgICAgICBjb25zdCBzcGxpdERhdGVzID0gW107XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHllYXJzID0gW107XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0cy51cGRhdGVzQW5kTmV3cy5mb3JFYWNoKG5ld3M9PntcclxuICAgICAgICAgICAgICAgIGlmICghZGF0ZXMuaW5jbHVkZXMobmV3IERhdGUobmV3cy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLXVzJywge21vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJ30pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVzLnB1c2gobmV3IERhdGUobmV3cy5kYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLXVzJywge21vbnRoOiAnbG9uZycsIHllYXI6ICdudW1lcmljJ30pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZGF0ZXMpXHJcblxyXG4gICAgICAgICAgICBkYXRlcy5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgIHNwbGl0RGF0ZXMucHVzaChlLnNwbGl0KCcgJykpXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzcGxpdERhdGVzKVxyXG5cclxuICAgICAgICAgICAgc3BsaXREYXRlcy5mb3JFYWNoKGRhdGU9PntcclxuXHJcbiAgICAgICAgICAgICAgICBpZighdGhpcy5tb250aHMuaW5jbHVkZXMoZGF0ZVswXSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9udGhzLnB1c2goZGF0ZVswXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIGlmKCF5ZWFycy5pbmNsdWRlcyhkYXRlWzFdKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8geWVhcnMucHVzaChkYXRlWzFdKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueWVhckxpc3RbZGF0ZVsxXV0gPSBbXTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zdCB5ZWFycyA9IE9iamVjdC5rZXlzKHRoaXMueWVhckxpc3QpXHJcblxyXG4gICAgICAgICAgICB5ZWFycy5mb3JFYWNoKHllYXI9PntcclxuICAgICAgICAgICAgICAgIHNwbGl0RGF0ZXMuZm9yRWFjaChkYXRlPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoeWVhciA9PT0gZGF0ZVsxXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueWVhckxpc3RbeWVhcl0ucHVzaChkYXRlWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy55ZWFyTGlzdClcclxuXHJcbiAgICAgICAgICAgIGxldCBhbGxNb250aHMgPSBbJ0phbnVhcnknLCdGZWJydWFyeScsJ01hcmNoJywgJ0FwcmlsJywnTWF5JywnSnVuZScsJ0p1bHknLCdBdWd1c3QnLCdTZXB0ZW1iZXInLCdPY3RvYmVyJywnTm92ZW1iZXInLCdEZWNlbWJlciddO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb250aHMuc29ydChmdW5jdGlvbihhLGIpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFsbE1vbnRocy5pbmRleE9mKGEpID4gYWxsTW9udGhzLmluZGV4T2YoYik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB5ZWFycy5zb3J0KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnllYXJPcHRpb25zLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Bbnk8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICR7eWVhcnMubWFwKHllYXI9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7eWVhcn1cIj4ke3llYXJ9PC9vcHRpb24+YCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vbnRoT3B0aW9ucy5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+QW55PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAke3RoaXMubW9udGhzLm1hcChtb250aD0+IGA8b3B0aW9uIHZhbHVlPVwiJHttb250aH1cIj4ke21vbnRofTwvb3B0aW9uPmApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICBgO1xyXG5cclxuICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgIGFzeW5jIGdhdGhlck5ld3MoKXtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy50b2dnYWJsZVNldHRpbmdzXHJcbiAgICAgICAgLy9QdXQgcmVzdWx0cyBpbiB2YXIgY29weSwganVzdCBsaWtlIGluIHRoZSBzaGFkb3dib3hcclxuICAgIFxyXG4gICAgICAgIC8vTWF5YmUsIHRvIHNvbHZlIGNlcnRhaW4gaXNzdWVzIG9mICd1bmRlZmluZWQnLCBhbGxvdyBwYWdpbmF0aW9uIGV2ZW4gd2hlbiBvbmx5IDEgcGFnZSwgYXMgSSB0aGluayBuZXh0IGFuZCBwcmV2IHdpbGwgYmUgaGlkZGVuIFxyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgLy9JcyBpdCBiZXR0ZXIganVzdCB0byB1c2Ugc2VwZXJhdGUgdXJsIHJvdXRlcz8gXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9hbGwtbmV3cz9uZXdzPScgKyB0aGlzLm5ld3NEZWxpdmVyeSk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTsgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXN1bHRzKVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAvL21heWJlIGFsbG93aW5nIGEgb25lIG9uIHRoZSBwYWdpbmF0aW9uIHdvdWxkIHNvbHZlIHRoZSBlcnJvcnNcclxuXHJcbiAgICAgICAgICAgIC8vRm9yIGZpZWxkIGV4Y2x1c2lvbiwgY291bGQgaGF2ZSBjb2RlIHByb2Nlc3NlZCB3aXRoIG1hdGNoZXMoKSBvciBpbmRleE9mIG9uIHRoZSBmaWVsZHMgdGhhdCBhcmVuJ3QgYmFubmVkXHJcbiAgICAgICAgICAgIC8vVGFrZSBvdXQgdGhvc2UgdGhhdCBwcm9kdWNlIGEgZmFsc2UgcmVzdWx0XHJcblxyXG4gICAgICAgICAgICBsZXQgYWxsTmV3cyA9IHJlc3VsdHMudXBkYXRlc0FuZE5ld3M7XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVsYXRlZFBvc3RzID0gcmVzdWx0cy5wcm9wZXJ0aWVzQW5kTWVtYmVycztcclxuXHJcbiAgICAgICAgICAgIGxldCBwb3N0UmVsYXRpb25zaGlwcyA9IFtdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYWxsTmV3cy5tYXAobmV3cz0+e1xyXG4gICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocG9zdD0+e1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGAke25ld3MudGl0bGV9OiAke3Bvc3QuSUR9YClcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IHJlbGF0ZWRQb3N0cy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHBvc3QuSUQgPT09IHJlbGF0ZWRQb3N0c1tpXS5pZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UmVsYXRpb25zaGlwcy5wdXNoKHJlbGF0ZWRQb3N0c1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhwb3N0UmVsYXRpb25zaGlwcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMgPSBwb3N0UmVsYXRpb25zaGlwcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBwb3N0UmVsYXRpb25zaGlwcyA9IFtdO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IG4gPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuICAgICAgICAgICAgaWYobi5pbmRleE9mKCcjJykgPiAtMSl7XHJcbiAgICAgICAgICAgICAgICBuID0gbi5zcGxpdCgvWy8tXSsvKVxyXG4gICAgICAgICAgICAgICAgaWYobls0XS5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5bNV0uaW5kZXhPZignbmV3cycpID4gLTEpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnNpbmdsZUNhbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV3c1NlYXJjaC52YWx1ZSA9IGAke25bNF19YDsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV3c0RlbGl2ZXJ5ID0gYCR7bls0XX1gOyBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcmlnaW4gPSBuWzZdOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXBvcnQgPSBuWzRdLnNsaWNlKDEpOyBcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoJycsICcnLCBgLyR7blsyXX0tJHtuWzNdfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGhpc3RvcnkuZ28oLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXh0ZXJuYWxDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG5ld3NUeXBlcyA9IFsnbmV3cycsICd1cGRhdGUnXTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBjb25zdCBuZXdzT3V0cHV0ID0gMjtcclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBuZXdzUGFnZSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgbmV3c1BhZ2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50U2hvd247XHJcblxyXG4gICAgICAgICAgICAvLyAvL2lmIHN5bWJvbCBlbnRlcmVkIGFzIG9ubHkgdGhpbmcsIGl0J2xsIG15IGxvZ2ljLCBzb21ldGltZXMuIFJlbWVkeSB0aGlzLlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoIXRoaXMuZnVsbERpc3BsYXkgfHwgdGhpcy5iYWNrZ3JvdW5kQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAvL0RvIHN0YXJ0IHZzIGFueXdoZXJlIGluIHRoZSB3b3JkXHJcbiAgICAgICAgICAgICAgICAvL1N0YXJ0IG9ubHkgaXMgc3RhbmRhcmQgYW5kIGF1dG8gdHJ1ZSB3aGVuIHdob2xlIHdvcmQgaXMgdHVybmVkIG9uKD8pIG9yIHNpbXBseSBidXJpZWQgaW4gcGFydGlhbCBpZlxyXG4gICAgICAgICAgICAgICAgLy9pdCBzaG91bGQgYXQgbGVhc3QgYmUgaW5hY2Vzc2libGUgb24gdGhlIGZyb250ZW5kIHdpdGggdmlzdWFsIGN1ZVxyXG5cclxuICAgICAgICAgICAgICAgIC8vRG8gYSBtb3JlIHRob3JvdWdoIHRlc3Qgb2YgdGhvc2UgbGF0ZXIgYWZ0ZXIgcmVsIGFuZCAnZGlzbGF5LXF1YWxpdHknIGFydGljbGVzIGNyZWF0ZWQgXHJcblxyXG4gICAgICAgICAgICAgICAgLy9EbyBiYXNpYyBtb250aCBhbmQgeWVhciBhbmQgcmFuZ2UgcGlja2luZywgYmVmb3JlIGxvb2tpbmcgaW50byBwb3AtdXAgYW5kIGZpZ3VyaW5nIG91dCBob3cgdG8gZ2V0IGluZm8gZnJvbSB3aGF0IGlzIHNlbGVjdGVkIG9uIGl0XHJcbiAgICAgICAgICAgICAgICBsZXQgZnVsbExpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCB0aXRsZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGxldCBkZXNjID0gW107XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVsID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5uZXdzRGVsaXZlcnkgIT09ICcnKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVkJylcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5uZXdzRGVsaXZlcnkuc3RhcnRzV2l0aCgnIycpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlcXVlc3RlZElkID0gdGhpcy5uZXdzRGVsaXZlcnkucmVwbGFjZSgnIycsICcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXNzb2NpYXRlZE5ld3MgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MuZm9yRWFjaChuZXdzID0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3cy5yZWxhdGlvbnNoaXBzLmZvckVhY2gocj0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHIuaWQgPT09IHBhcnNlSW50KHJlcXVlc3RlZElkKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc29jaWF0ZWROZXdzLnB1c2gobmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSByLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhc3NvY2lhdGVkTmV3cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gYXNzb2NpYXRlZE5ld3M7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmV4dGVybmFsQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm9yaWdpbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXh0ZXJuYWxDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzVmFsdWUgPSB0aGlzLm5ld3NTZWFyY2gudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmV0dXJuSG9tZS5ocmVmPWAke3NpdGVEYXRhLnJvb3RfdXJsfS8jJHt0aGlzLm9yaWdpbn1Db250YWluZXJgOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFpbkhlYWRlci5pbm5lckhUTUwgPSBgU2hvd2luZyBSZXN1bHRzIGZvcjogJHtuYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3JlZFRpdGxlID0gYFNob3dpbmcgUmVzdWx0cyBmb3I6ICR7bmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZVRpdGxlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlcyA9IGFsbE5ld3MuZmlsdGVyKChuZXdzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdzLnRpdGxlLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpLmluY2x1ZGVzKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZighdGFyZ2V0LmZ1bGxXb3JkLmlzT24gJiYgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3M9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5LnRvTG93ZXJDYXNlKCkpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld3NTcGxpdCA9IG5ld3MudGl0bGUudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGUgb2YgbmV3c1NwbGl0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlLnN0YXJ0c1dpdGgodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMucHVzaChuZXdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIG5ld3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiBudWxsOyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZXMgPSBhbGxOZXdzLmZpbHRlcihuZXdzPT4gbmV3cy50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldC5pc0Nhc2VTZW5zaXRpdmUuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVzID0gdGl0bGVzLmZpbHRlcihuZXdzPT4gbmV3cy50aXRsZS5pbmRleE9mKHRoaXMubmV3c0RlbGl2ZXJ5KSAhPT0gLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaW5jbHVkZURlc2NyaXB0aW9uLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGFyZ2V0LmZ1bGxXb3JkLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MgPSBhbGxOZXdzLmZpbHRlcigobmV3cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3cy5mdWxsRGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIikuaW5jbHVkZXModGhpcy5uZXdzRGVsaXZlcnkudG9Mb3dlckNhc2UoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXdzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lmIGZpcmVkIScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZSBpZighdGFyZ2V0LmZ1bGxXb3JkLmlzT24gJiYgdGFyZ2V0LndvcmRTdGFydE9ubHkuaXNPbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5mb3JFYWNoKG5ld3M9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdzU3BsaXQgPSBuZXdzLmZ1bGxEZXNjcmlwdGlvbi50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgZSBvZiBuZXdzU3BsaXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUuc3RhcnRzV2l0aCh0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MucHVzaChuZXdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjID0gYWxsTmV3cy5maWx0ZXIobmV3cz0+IG5ld3MuZnVsbERlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeS50b0xvd2VyQ2FzZSgpKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0YXJnZXQuaXNDYXNlU2Vuc2l0aXZlLmlzT24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2MgPSBkZXNjLmZpbHRlcihuZXdzPT4gbmV3cy5mdWxsRGVzY3JpcHRpb24uaW5kZXhPZih0aGlzLm5ld3NEZWxpdmVyeSkgIT09IC0xKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlYXJjaGVkTmV3cyA9IGZ1bGxMaXN0LmNvbmNhdCh0aXRsZXMsIGRlc2MsIHJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzID0gW107IFxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaGVkTmV3cy5mb3JFYWNoKChuZXdzKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGxOZXdzLmluY2x1ZGVzKG5ld3MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vRGF0ZXMgYmVsb25nIHRvIGEgc2VwZXJhdGUgbG9naWMgdGhyZWFkLCBhbmQgYXMgc3VjaCBzaG91bGQgbm95dCBiZSBsaW5rZWQgdG8gdHlwaW5nLiBUaGV5IGFlIGNsb3NlciB0byB0aGUgc29ydHMgaW4gdGhhdCBcclxuICAgICAgICAgICAgICAgIC8vdGhleSBjYW4gYmUgYWZ0ZXIgdGhlIHR5cGluZywgYmVmb3JlLCBvciBldmVuIGJlIHVzZWQgd2l0aG91dCBpdFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvL0FmdGVyIEkgZmluaXNoIHRoZSBjb3JlIGxvZ2ljLCBhZGQgaW4gZnVuY3Rpb25hbGl0eSB0aGF0IGhhcyBhbnkgYXMgb3B0aW9uIGZvciAneWVhcicsIHdpdGggc2VsZWN0aW9uIG9mIHNwZWNpZmljIFxyXG4gICAgICAgICAgICAgICAgLy9saW1pdGluZyB0aGUgJ21vbnRoJyB2YWx1ZXMgYW5kIHNlbGVjdGluZyB0aGUgZWFybGllc3Qgb25lIGFzIHRoZSBkZWZhdWx0IGZpbHRlciBmb3IgJ21vbnRoJyBvciAnYW55J1xyXG4gICAgICAgICAgICAgICAgLy9GaWx0ZXIgYnkgZGF0ZSB3aWxsIGJlIGEgYm9vbGVhbiB3aXRoIGRyb3Bkb3duIGRlZmF1bHRzIG9mIGFueSBmb3IgYm90aFxyXG5cclxuICAgICAgICAgICAgICAgICBsZXQgZGF0ZUZpbHRlcnNTZXQgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGVGaWx0ZXJTZXRVcCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgY29uc29sZS5sb2coYGNvbnRlbnRMb2FkZWQgPSAke3RoaXMuY29udGVudExvYWRlZH1gKVxyXG5cclxuICAgICAgICAgICAgICAgICBmb3IobGV0IGZpbHRlciBvZiBkYXRlRmlsdGVyc1NldCl7XHJcbiAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuZGF0ZUZpbHRlclNldFVwW2ZpbHRlcl0peyAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3MgPSBhbGxOZXdzLmZpbHRlcigobmV3cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ldyBEYXRlKG5ld3MuZGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi11cycsIHttb250aDogJ2xvbmcnLCB5ZWFyOiAnbnVtZXJpYyd9KS5pbmNsdWRlcyh0aGlzLmRhdGVGaWx0ZXJTZXRVcFtmaWx0ZXJdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICB9XHJcbiAgIFxyXG4gICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRvZ2dhYmxlU2V0dGluZ3MuZGF0ZU9yZGVyLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5kYXRlT3JkZXIuZGlyZWN0aXZlID09PSAnYXNjJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbE5ld3Muc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYS5kYXRlKSAtIG5ldyBEYXRlKGIuZGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxOZXdzLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGEuZGF0ZSkgLSBuZXcgRGF0ZShiLmRhdGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudG9nZ2FibGVTZXR0aW5ncy5hbHBoYU9yZGVyLmlzT24gPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbE5ld3Muc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvY2FsZUNvbXBhcmUgZG9lcyBhIHN0cmluZyBjb21wYXJpc29uIHRoYXQgcmV0dXJucyAtMSwgMCwgb3IgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS50aXRsZS5sb2NhbGVDb21wYXJlKGIudGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy50b2dnYWJsZVNldHRpbmdzLmFscGhhT3JkZXIuZGlyZWN0aXZlID09PSAnZGVzYycpeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cy5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5ld3NUeXBlcy5mb3JFYWNoKCh0eXBlKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHRhcmdldFt0eXBlXS5pc09uICE9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsTmV3cyA9IGFsbE5ld3MuZmlsdGVyKG5ld3M9PiBuZXdzLnBvc3RUeXBlICE9PSB0eXBlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgaWYoYWxsTmV3cy5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGFsbE5ld3MubGVuZ3RoIDw9IG5ld3NPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFnZSA9IG5ld3NQYWdlcy5jb25jYXQoYWxsTmV3cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoYWxsTmV3cy5sZW5ndGggPiBuZXdzT3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gbmV3c091dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IGFsbE5ld3Muc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZS5wdXNoKHJlbW92ZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhbGxOZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UgPSBhbGxOZXdzLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChuZXdzUGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihuZXdzUGFnZXMubGVuZ3RoKXsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFNob3duID0gbmV3c1BhZ2VzW3RoaXMuY3VycmVudFBhZ2VzXTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsaXZlck5ld3MoY29udGVudFNob3duKVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jb250ZW50TG9hZGVkICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c2ApKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnROZXh0QW5kUHJldmlvdXMoKTtcclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmKGNvbnRlbnRTaG93bi5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydFBhZ2luYXRpb24obmV3c1BhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TmV4dEFjdGl2YXRpb24oKTsgXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAvL1RoaXMgbmVlZHMgdG8gY2hhbmdlIHRvXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZU9wdGlvbnMuZm9yRWFjaChvID0+IHtvLmNsYXNzTGlzdC5hZGQoJ2luYWN0aXZlJyk7fSk7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlRmlsdGVyT3B0aW9ucy5mb3JFYWNoKGYgPT4ge2YuZGlzYWJsZWQgPSB0cnVlfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGVudCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsZWRJZHMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgbmV3cyBvZiBhbGxOZXdzKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5jbGFzc0xpc3QuYWRkKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuY2xhc3NMaXN0LmFkZCgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc21pc3NCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZGlzbWlzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zZXBlcmF0ZSB0aGUgaW5zZXJ0aW9ucyB0byBhIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy9Vc2UgaWYgdG8gdmFyeSBpZiBsb29rIGZvciBuZXdzIHdpdGggdGhhdCBvciBvbmVzIHdpdGggcmVsYXRpb25zaGlwIHRoYXQgaGFzIHRoYXRcclxuICAgICAgICAgICAgICAgICAgICAvL21ha2UgYXJyYXkgb2YgZWFjaCBuZXdzJ3MgcmVsYXRpb25zaGlwc1tnaXZlIHRoZSBmaXJzdCBwb3N0IDIgZm9yIHRlc3Rpbmcgb2YgaWYgY2hlY2tpbmcgYXJheSBwcm9wZXJseV1cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmZ1bGxEaXNwbGF5KXsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtuZXdzLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdzLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChyPT50aGlzLmNhbGxlZElkcy5wdXNoKHIuaWQpKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jYWxsZWRJZHMuaW5jbHVkZXMocGFyc2VJbnQodGhpcy5jdXJyZW50UmVwb3J0KSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGVudC5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7bmV3cy50aXRsZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxlZElkcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmKHRoaXMuc2luZ2xlQ2FsbCl7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGl2ZXJOZXdzKHRoaXMuZnVsbERpc3BsYXlDb250ZW50LCB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZXh0ZXJuYWxDYWxsKVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5mdWxsRGlzcGxheSAmJiB0aGlzLmV4dGVybmFsQ2FsbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ2FsbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsRGlzcGxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7ICBcclxuICAgICAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWxpdmVyTmV3cyhjb250ZW50U2hvd24sIGRlc3RpbmF0aW9uID0gdGhpcy5uZXdzUmVjaWV2ZXIpe1xyXG4gICAgICAgIGRlc3RpbmF0aW9uLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgICAgJHtjb250ZW50U2hvd24ubGVuZ3RoID8gYDx1bD5gICA6ICdObyBhcnRpY2xlcyBtYXRjaCB5b3VyIGNyaXRlcmlhJ31cclxuICAgICAgICAgICAgJHshY29udGVudFNob3duLmxlbmd0aCA/IGA8YnV0dG9uIGlkPVwic2VhcmNoUmVzZXRcIj5QbGVhc2UgdHJ5IGEgZGlmZmVyZW50IHF1ZXJ5IG9yIGNoYW5nZSB5b3VyIGZpbHRlcnMuPC9idXR0b24+YCAgOiAnJ31cclxuICAgICAgICAgICAgICAgICR7Y29udGVudFNob3duLm1hcChyZXBvcnQgPT4gYFxyXG4gICAgICAgICAgICAgICAgPGxpPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZXdzXCI+ICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGg0PiR7cmVwb3J0LnRpdGxlfTwvaDQ+YCA6ICcnfVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXBvcnQuY2FwdGlvbi5sZW5ndGggPj0gMSA/IHJlcG9ydC5jYXB0aW9uICsgJyAtICcgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cmVwb3J0LmRhdGV9IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD4ke3JlcG9ydC5yZWxhdGlvbnNoaXBzLm1hcChyZWxhdGlvbnNoaXAgPT4gYDxzcGFuIGNsYXNzPVwibmFtZVwiPiR7cmVsYXRpb25zaGlwLnRpdGxlfTwvc3Bhbj4gICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPGEgY2xhc3M9XCJyZWxhdGlvbnNoaXAtbGlua1wiIGRhdGEtcmVsYXRlZD1cIiR7cmVsYXRpb25zaGlwLmlkfVwiPihBc3NvY2lhdGVkIE5ld3MpPC9hPiBgIDogYDxhIGNsYXNzPVwicmVsYXRpb25zaGlwLWxpbmsgZGlzbWlzc2VkXCIgZGF0YS1yZWxhdGVkPVwiJHtyZWxhdGlvbnNoaXAuaWR9XCI+KEFzc29jaWF0ZWQgTmV3cyk8L2E+IGB9PGEgY2xhc3M9XCJzaW5nbGUtbGlua1wiIGhyZWY9XCIke3JlbGF0aW9uc2hpcC5wZXJtYWxpbmt9XCI+KFZpZXcgUHJvZmlsZSk8L2E+YCl9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtY2FyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBkYXRhLWlkPVwiJHtyZXBvcnQuaWR9XCIgZGF0YS1wb3N0PVwiJHtyZXBvcnQucG9zdFR5cGVQbHVyYWx9XCIgc3JjPVwiJHtyZXBvcnQuZ2FsbGVyeVswXS5zZWxlY3RJbWFnZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7IXRoaXMuZnVsbERpc3BsYXkgPyBgPHA+JHtyZXBvcnQuZGVzY3JpcHRpb259PC9wPmAgOiBgPHA+JHtyZXBvcnQuZnVsbERlc2NyaXB0aW9ufTwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkeyF0aGlzLmZ1bGxEaXNwbGF5ID8gYDxidXR0b24gaWQ9XCIke3JlcG9ydC5pZH1cIiBjbGFzcz1cInNlZS1tb3JlLWxpbmtcIj5TZWUgTW9yZTogJHtyZXBvcnQuaWR9IDwvYnV0dG9uPmAgOiBgPGJ1dHRvbiBpZD1cIiR7cmVwb3J0LmlkfVwiIGNsYXNzPVwic2VlLW1vcmUtbGluayBkaXNtaXNzZWRcIj5SZWFkIG1vcmU6ICR7cmVwb3J0LmlkfSA8L2J1dHRvbj5gfSBcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvbGk+IFxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgICR7Y29udGVudFNob3duLmxlbmd0aCA/IGA8L3VsPmAgIDogJyd9XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZnVsbERpc3BsYXkpe1xyXG4gICAgICAgICAgICB0aGlzLnNlZU1vcmVGdW5jdGlvbmFsaXR5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2F0aGVyUmVsYXRlZE5ld3MoKTsgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBtZWRpYUxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVkaWEtY2FyZCBpbWcnKSBcclxuICAgICAgICAgICAgLy8gdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJykgICBcclxuICAgICAgICAgICAgLy8gdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpXHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubWVkaWFSZWNpZXZlciwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJykpIFxyXG4gICAgICAgICAgICAvLyB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZVxyXG4gICAgICAgICAgICAvLyB0aGlzLm1lZGlhQ29sdW1uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNvbHVtbicpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLm5ld2xvYWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7IFxyXG4gICAgICAgICAgICAvLyB0aGlzLmN1cnJlbnRNZWRpYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LW1lZGlhJyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubWVkaWFQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24nKTtcclxuXHJcbiAgICAgICAgLy8gbWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAvLyAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IFNoYWRvd0JveC5wcm90b3R5cGUuc2hhZG93Qm94KG1lZGlhLCB0aGlzLm1lZGlhUmVjaWV2ZXIsIHRoaXMuaHRtbCwgXHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcywgJ2dhbGxlcnknLCB0aGlzLm1lZGlhQ29sdW1uLCB0aGlzLm5ld2xvYWQsIHRoaXMuZ2FsbGVyeVBvc2l0aW9uLFxyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEsIHRoaXMubWVkaWFQYWdpbmF0aW9uXHJcbiAgICAgICAgLy8gICAgICAgICApKVxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgIC8vICBtZWRpYUxpbmsuZm9yRWFjaChtZWRpYT0+e1xyXG4gICAgICAgIC8vICAgICBtZWRpYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4gU2hhZG93Qm94LnByb3RvdHlwZS5zaGFkb3dCb3gobWVkaWEpKVxyXG4gICAgICAgIC8vIH0pXHJcblxyXG4gICAgICAgIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKCk7XHJcblxyXG4gICAgICAgIC8vIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKFxyXG4gICAgICAgIC8vICAgICB0aGlzLm1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIGltZycpLCBcclxuICAgICAgICAvLyAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLWNsb3NlJyksICAgXHJcbiAgICAgICAgLy8gICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKSxcclxuICAgICAgICAvLyAgICAgdGhpcy5tZWRpYVJlY2lldmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXJlY2lldmVyJyksIFxyXG4gICAgICAgIC8vICAgICB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4gPSBmYWxzZVxyXG4gICAgICAgIC8vICk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChvcHRpb249PntcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtvcHRpb24uc3R5bGUucG9pbnRlckV2ZW50cz1cIlwiOyB9LCA1MDApO1xyXG4gICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBnYXRoZXJSZWxhdGVkTmV3cygpe1xyXG5cclxuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcExpbmtzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJlbGF0aW9uc2hpcC1saW5rJyk7XHJcblxyXG4gICAgICAgIHRoaXMucmVsYXRpb25zaGlwTGlua3MuZm9yRWFjaChsaW5rPT57XHJcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBsaW5rSWQgPSBsaW5rLmRhdGFzZXQucmVsYXRlZCBcclxuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gbGluay5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJykuaW5uZXJUZXh0XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVwb3J0ID0gbGlua0lkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzU2VhcmNoLnZhbHVlID0gYCMke2xpbmtJZH1gO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5uZXdzU2VhcmNoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzRGVsaXZlcnkgPSBgIyR7bGlua0lkfWA7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYWluSGVhZGVyLmlubmVySFRNTCA9IGBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmVkVGl0bGUgPWBTaG93aW5nIFJlc3VsdHMgZm9yOiAke25hbWV9YDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpbnNlcnRQYWdpbmF0aW9uKG5ld3NQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQpe1xyXG4gICAgICAgIC8vYWRkIG1hbnVhbCBwYWdlIGVudHJ5IGJveFxyXG4gICAgICAgIC8vQWRkIGZhaWxzYWZlIGFnYWluc3QgaXQgYmVpbmcgYSBudW1iZXIgdG9vIGJpZyBvciBzbWFsbFxyXG4gICAgICAgIC8vTWF5YmUgZG8gZHJvcGRvd24gaW5zdGVhZD8gIFxyXG4gICAgICAgIC8vTWF5YmUganVzdCBkb24ndCBkbyBhdCBhbGw/XHJcblxyXG4gICAgICAgIC8vRG8gdGhlIG51bWJlciBsaW1pdCwgdGhvdWdoLCBvbmUgd2hlcmUgaGlkZSBhbmQgcmV2ZWFsIHdoZW4gYXQgY2VydGFpbiBwb2ludHNcclxuXHJcbiAgICAgICAgLy9SZW1lbWJlciB0byBhZGQgdGhlIGxvYWRlclxyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudC1wYWdlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiXCIgY2xhc3M9XCJjb250ZW50LWRpcmVjdGlvbiBjb250ZW50LWRpcmVjdGlvbl9wcmV2aW91c1wiPlByZXY8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwiY29udGVudC1wYWdlXCIgZGF0YS1wYWdlPVwiJHtkYXRhQ291bnQrK31cIj4gJHtwYWdlQ291bnQgKz0gMX08L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuICAgICAgICAgICAgICAgICAgICA8YSBpZD1cIlwiIGNsYXNzPVwiY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fbmV4dCAke25ld3NQYWdlcy5sZW5ndGggPiAxID8gJycgOiAnaGlkZGVuJ31cIj5OZXh0PC9hPiBcclxuICAgICAgICAgICAgICAgIDwvZGl2PiBcclxuICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXMnKTsgICAgXHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpICBcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtZGlyZWN0aW9uX25leHQnKTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZUhvbGRlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlcyBhJylcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eSh0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucyk7XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWVNb3JlRnVuY3Rpb25hbGl0eSgpe1xyXG4gICAgICAgIC8vYWRkIHNwaW5uZXIgdG8gdGhpcywgYXMgbmVlZHMgdG8gY29uc29sdCBiYWNrZW5kXHJcbiAgICAgICAgdGhpcy5zZWVNb3JlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNlZS1tb3JlLWxpbmsnKVxyXG4gICAgICAgIHRoaXMuc2VlTW9yZS5mb3JFYWNoKGxpbms9PntcclxuICAgICAgICAgICAgbGluay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXBvcnQgPSBsaW5rLmlkOyAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuZnVsbERpc3BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5zaW5nbGVDYWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYGZ1bGwgZGlzcGxheSBpcyAke3RoaXMuZnVsbERpc3BsYXl9YClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGRpc21pc3NTZWxlY3Rpb24oKXtcclxuICAgICAgICBpZih0aGlzLm5ld3NEZWxpdmVyeSAhPT0gJycpe1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5zdG9yZWRUaXRsZX1gO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLm1haW5IZWFkZXIuaW5uZXJIVE1MID0gYCR7dGhpcy5pbml0aWFsVGl0bGV9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50b2dnbGVPcHRpb25zLmZvckVhY2gobyA9PiB7by5jbGFzc0xpc3QucmVtb3ZlKCdpbmFjdGl2ZScpO30pIFxyXG4gICAgICAgIHRoaXMuZGF0ZUZpbHRlck9wdGlvbnMuZm9yRWFjaChmID0+IHtmLmRpc2FibGVkID0gJyd9KVxyXG4gICAgICAgIHRoaXMubmV3c1JlY2lldmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlci5jbGFzc0xpc3QucmVtb3ZlKCdkaXNtaXNzZWQnKTtcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Rpc21pc3NlZCcpO1xyXG4gICAgICAgIHRoaXMuZGlzbWlzc0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdkaXNtaXNzZWQnKTsgIFxyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENhbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmZ1bGxEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgLy8gdGhpcy5zaW5nbGVDYWxsID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoY29udGVudFBhZ2VPcHRpb25zKXtcclxuICAgICAgICBjb250ZW50UGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2PidcclxuICAgICAgICAgICAgICAgIC8vdG9vIHNsb3c/P1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwiXCI7IH0sIDEwMDApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gcGFyc2VJbnQoc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdhdGhlck5ld3MoKVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgICAgICAgICAgICAgIGkuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBjb250ZW50TmV4dEFjdGl2YXRpb24oKXtcclxuICAgICAgICBsZXQgYWxsbmV4dEJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fbmV4dCcpO1xyXG5cclxuICAgICAgICBhbGxuZXh0QnV0dG9ucy5mb3JFYWNoKGVsPT57XHJcbiAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZSk9PntcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLmN1cnJlbnRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYWdlLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2goLy1ncm91cC8pKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cE5hbWUgPSBuYW1lLnNsaWNlKDAsIC02KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuc2VsZWN0ZWRQYWdlYCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFBhZ2UgPSB0aGlzLmN1cnJlbnRQYWdlcyArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBuZXh0UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5ld3NSZWNpZXZlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLy90b28gc2xvdz8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYXRoZXJOZXdzKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc31cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgfTtcclxuXHJcbiAgICBjb250ZW50TmV4dEFuZFByZXZpb3VzKCl7XHJcbiAgIFxyXG4gICAgICAgIHRoaXMuY29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbicpOyAgICAgXHJcblxyXG4gICAgICAgIGxldCBwcmV2QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnQtZGlyZWN0aW9uX3ByZXZpb3VzYClcclxuICAgICAgICBsZXQgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb250ZW50LWRpcmVjdGlvbl9uZXh0YClcclxuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWxlY3RlZFBhZ2VgKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5jdXJyZW50UGFnZXMgPiAwKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50UGFnZXMpXHJcbiAgICAgICAgICAgIHByZXZCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmKCFuZXh0QnV0dG9uLnByZXZpb3VzRWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LmNvbnRhaW5zKCdzZWxlY3RlZFBhZ2UnKSl7XHJcbiAgICAgICAgICAgIG5leHRCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gIChpKSA9PntcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzIC0gMTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXMgPSBwcmV2UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyLWxvYWRlclwiPjwvZGl2PidcclxuICAgICAgICAgICAgICAgIC8vdG9vIHNsb3c/P1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZ2F0aGVyTmV3cygpXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXN9XCJdYCk7XHJcbiAgICAgICAgICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE5ld3MiLCIvLyBTcGl0IG91dCBBcHRzIGluIG9yZGVyIG9mIG1vc3QgcmVjZW50XHJcblxyXG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCJcclxuXHJcbmNsYXNzIFBhZ2luYXRpb24ge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLnRhcmdldGVkRWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XHJcbiAgICAgICAgdGhpcy5oZWFkZXJOYXYgPSB0aGlzLmhlYWRlci5xdWVyeVNlbGVjdG9yKCduYXYnKTtcclxuICAgICAgICB0aGlzLm9wZW5CdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXNlYXJjaC10cmlnZ2VyXCIpO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwb3AtdXAtZGlzcGxheS1ib3gnKTtcclxuICAgICAgICB0aGlzLmltYWdlSG9sZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ltYWdlLWhvbGRlcicpO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNYWduaWZ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Nsb3NlTWFnbmlmeScpO1xyXG4gICAgICAgIC8vIHRoaXMub3ZlcmFsbENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNvdmVyYWxsQ29udGFpbmVyJyk7XHJcbiAgICAgICAgLy8gRm9yIG5vdywgdGhpcyB3aWxsIGJlIGhvdyBJIHByZXZlbnQgZXJyb3JzIG9uIG90aGVyIHBhZ2VzIFxyXG4gICAgICAgIHRoaXMuZnJvbnRUZXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnRDb250YWluZXJfcGFnaW5hdGVkJykgXHJcbiAgICAgICAgLy8gQ2FuIEkgc2V0dXAgdG8gbG9hZCBpbiBhbmQgUGFnaW5hdGUgZGVwZW5kaW5nIG9uIGlkZW50aXR5LCBzbyBhcyB0byBtYWtlIGFkYXB0YWJsZT8gWWVzISEhXHJcblxyXG4gICAgICAgIC8vV2lsbCB0YXJnZXQgYSBzaGFyZWQsIHNwZWNpZmljIGNsYXNzIHVzaW5nIHF1ZXJ5U2VsZWN0b3JBbGwgYW5kIHVzZSBhIGxvb3BcclxuXHJcbiAgICAgICAgLy9yZW1lbWJlciB0byB1c2UgdGhlIGFqYXggdXJsIHNldC11cCB0byBsaW5rIHRvIHRoZSBzZWFyY2ggaW5mb1xyXG4gICAgICAgIC8vQ29sb3IgdGhlIHNlbGVjdGVkL2N1cnJlbnQgcGFnZSBhbmQgcHV0IGEgbmV4dCBhbmQgcHJldiBidXR0b25zIHRoYXQgb25seSBhcHBlYXIgd2hlbiBhcHBsaWNhYmxlXHJcbiAgICAgICAgLy9NYWtlIHN1cmUgcGFnaW5hdGlvbiBpcyBvdXRzaWRlIG9mIGdlbmVyYXRlZCB0ZXh0P1xyXG5cclxuICAgICAgICAvLyBjb25zaWRlciB1c2luZyBzb21lIHNvcnQgb2YgbG9hZGluZyBpY29uIGFuZCBhbmltYXRpb24gd2hlbiBjbGlja2luZyBwYWdpbmF0aW9uLiBKdXN0IGZvciB1c2VyIHNhdGlzZmFjdGlvbiBvbiBjbGlja1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHRoaXMucGFnaW5hdGVkQ29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50Q29udGFpbmVyX3BhZ2luYXRlZCcpO1xyXG4gIFxyXG4gICAgICAgIGxldCBwcm9wZXJ0aWVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Byb3BlcnRpZXNDb250YWluZXIgLmNvbnRlbnRCb3gnKTtcclxuICAgICAgICBsZXQgbWVtYmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZW1iZXJzQ29udGFpbmVyIC5jb250ZW50Qm94Jyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFnaW5hdGVkQ29udGVudCA9IFtwcm9wZXJ0aWVzLCBtZW1iZXJzXTtcclxuICAgICAgICB0aGlzLmdyb3VwTmFtZTtcclxuICAgICAgICAvLyBNYWtlIHdvcmsgZm9yIGFsbCBwYWdpbmF0ZSB0aHJvdWdoIGEgbG9vcD9cclxuICAgICAgICB0aGlzLnBvc3RQYWdlU2VsZWN0O1xyXG4gICAgICAgIHRoaXMucG9zdFBhZ2VPcHRpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jdXJyZW50UHJvcGVydGllc1BhZ2UgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE1heWJlIHB1dCBhbGwgdGhpbmdzIGluIHRoaXMgb2JqZWN0IHdoZW4gZnVzZVxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0ge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiAwLFxyXG4gICAgICAgICAgICBtZW1iZXJzOiAwXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnREaXJlY3Rpb247XHJcblxyXG4gICAgICAgIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIC8vIHRoaXMuaXNTcGlubmVyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgLy9zcGlubmVyIGZhbHNlIGJlZm9yZSB0aGUgcHJldiBpcyB0cnVlXHJcblxyXG4gICAgICAgIC8vRG8gc21hbGxlciBvbmVzIGZvciBwYWdpbmF0ZSBhbmQgZm9yIHRoZSBmb3JtIHN1Ym1pdHMsIGFzIHdlbGwgYXMgc2VhcmNoIG9uIHRoZSBhbGwgbmV3cyBwYWdlIGFuZCBhbnkgb3RoZXIgcGFnaW5hdGlvbiBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICBpZih0aGlzLmZyb250VGVzdCl7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IG1haW5Mb2FkZXJUZXh0ID0gW1wiT25lIE1vbWVudCBQbGVhc2UuLi5cIiwgXCJQZXJmZWN0aW9uIHRha2VzIHRpbWVcIiwgXCJHcm9hbmluZyBvbmx5IG1ha2VzIHRoaXMgc2xvd2VyLi4uXCIsIFwiSSdtIHdhdGNoaW5nIHlvdS4uLiA6KVwiXHJcbiAgICAgICAgICAgIC8vICwgXCJDb21tZW5jaW5nIEhhY2sgOylcIiwgXCJPbmUgTW9tZW50LiBSZXRyaWV2aW5nIHlvdXIgU1NOXCIsIFwiU2hhdmluZyB5b3VyIGNhdC4uLlwiLCBcIllvdSBsaWtlIFNjYXJ5IE1vdmllcy4uLj8gPjopXCJdO1xyXG4gICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJhbmRvbSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1haW5Mb2FkZXJUZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHJlc3VsdCA9IG1haW5Mb2FkZXJUZXh0W3JhbmRvbV07XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGFnZUxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdlLWxvYWRlcicpO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcy5wYWdlTG9hZGVyLnNldEF0dHJpYnV0ZSgnZGF0YS1jdXJ0YWluLXRleHQnLCBgJHtyZXN1bHR9YClcclxuICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC1sb2FkZXInKTtcclxuXHJcbiAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgY29udGVudEludGVyZmFjZSgpe1xyXG4gICAgICAgIC8vSSB0aGluayB0aGF0IEkgbmVlZCB0byBkZWxheSBjbGlja2FiaWxpdHkgZm9yIHRvdWNoLCBvdGhlcndpc2UgY2FuIGNsaWNrIHdoZW4gYnJpbmdpbmcgdXBcclxuICAgICAgICAvL0Fsc28sIHBlcmhhcHMgSSBuZWVkIHRvIGFkZCBhIHN5bWJvbCB0byBpbmRpY2F0ZSB0aGF0IHlvdSBjYW4gYnJpbmcgdXAgb3B0aW9ucyBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRpc3BsYXlTcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc3BsYXlTcXVhcmVzJyk7XHJcbiAgXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5SW1hZ2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc3BsYXlJbWFnZXMnKTtcclxuICAgICAgICB0aGlzLm1hZ25pZnlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZmEtc2VhcmNoLXBsdXMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5U3F1YXJlcy5mb3JFYWNoKGRpc3BsYXlTcXVhcmUgPT4ge1xyXG4gICAgICAgICAgbGV0IGxpbmsgPSBkaXNwbGF5U3F1YXJlLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MnKTtcclxuICAgICAgICAgIGxldCBpbWFnZSA9IGRpc3BsYXlTcXVhcmUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgZGlzcGxheVNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBlID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgbGluay5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5U3F1YXJlcy1wYWdlTGlua3NfX3Zpc2libGUnKTtcclxuICAgICAgICAgICAgICBpbWFnZS5jbGFzc0xpc3QuYWRkKCdwYWdlTGlua3NfX3Zpc2libGUnKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICBkaXNwbGF5U3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGUgPT4ge1xyXG5cclxuICAgICAgICAgICAgICBsaW5rLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgIGltYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ3BhZ2VMaW5rc19fdmlzaWJsZScpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgICAgXHJcbiAgICAgIHRoaXMubWFnbmlmeUJ1dHRvbi5mb3JFYWNoKGIgPT57IFxyXG4gICAgICAgICAgYi5vbmNsaWNrID0gZT0+e1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlID0gZS50YXJnZXQuY2xvc2VzdCgnLmRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rcycpLnByZXZpb3VzRWxlbWVudFNpYmxpbmcuY2xvbmVOb2RlKCk7XHJcbiAgICAgICAgICAgIC8vUGVyaGFwcyBjYXJyeSBvdmVyIGFzc29jaWF0ZWQgbmV3cywgYXMgd2VsbFxyXG5cclxuICAgICAgICAgICAgLy90aGlzIGlzIG5vdCBuZWNlc3NhcnkgYXMgb25lIGRpcmVjdGx5IGJlbG93IGRvZXMgaXQgYnkgYWNjZXNzaW5nIHRoZSBwYXJlbnQgYW5kIHF1ZXJ5IHNlbGVjdGluZywgYnV0IGtlZXBpbmcgdGhpcyBhcyBjb3VsZCBiZSB1c2VmdWwgdG8gaGF2ZSBvbiBoYW5kXHJcbiAgICAgICAgICAgIHRoaXMuZmluZFNwZWNpZmllZFByZXZpb3VzKGUudGFyZ2V0LCAnbW9yZS1pbmZvLWxpbmsnKTtcclxuICAgICAgICAgICAgLy8gdGhpcy50YXJnZXRlZEVsZW1lbnQgPSBlLnRhcmdldC5jbG9zZXN0KCcuZGlzcGxheVNxdWFyZXMtcGFnZUxpbmtzJykucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlCb3guaW5zZXJ0QmVmb3JlKHRoaXMudGFyZ2V0ZWRFbGVtZW50LCB0aGlzLmNsb3NlTWFnbmlmeSk7XHJcbiAgICAgICBcclxuICAgICAgICAgICAgLy8gdGhpcy5kaXNwbGF5Qm94LnByZXBlbmQoaW1hZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnByZXBlbmQoaW1hZ2UpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICAgICAgICAgIHRoaXMub3BlbkJ1dHRvbi5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgIGUuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgdGhpcy5jbG9zZU1hZ25pZnkub25jbGljayA9ICgpPT57XHJcbiAgICAgICAgdGhpcy5pbWFnZUhvbGRlci5xdWVyeVNlbGVjdG9yKCdpbWcnKS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXlCb3gucXVlcnlTZWxlY3RvcignLm1vcmUtaW5mby1saW5rJykucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmZvckVhY2goZT0+e1xyXG4gICAgICAgICAgICBlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5yZW1vdmUoJ2ZyZWV6ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL2NoYW5nZSB0byBiZSBmcHIgZWl0aGVyIGRpcmVjdGlvbmFsIHRvIGdldCBsZXQsIHdpdGggaWYgc3RhdGVtZW50c1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBvcC11cC1kaXJlY3Rpb25hbCcpLmZvckVhY2goYnV0dG9uPT57XHJcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKT0+e1xyXG4gICAgICAgIC8vTWFrZSBuZXh0IGFuZCBwcmV2IHVuY2xpY2thYmxlIGlmIG5vdGhpbmcgdGhlcmUgdG8gZ28gdG9cclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRJbWFnZSA9IHRoaXMuZGlzcGxheUJveC5xdWVyeVNlbGVjdG9yKCdpbWcnKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0YXJnZXROYW1lID0gY3VycmVudEltYWdlLmRhdGFzZXQubmFtZTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0eXBlID0gYnV0dG9uLmlkO1xyXG4gICAgICAgICAgICBsZXQgbmV3SW1hZ2VDb250YWluZXI7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHR5cGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVNxdWFyZXMuZm9yRWFjaChlPT57XHJcbiAgICAgICAgICAgICAgICBpZihlLnF1ZXJ5U2VsZWN0b3IoYC5kaXNwbGF5SW1hZ2VzW2RhdGEtbmFtZT0ke3RhcmdldE5hbWV9XWApKXtcclxuICAgICAgICAgICAgICAgICAgICBpZih0eXBlID09PSAnbmV4dC1pbWFnZScpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUNvbnRhaW5lciA9IGUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9zZXN0KCcub3ZlcmFsbC1zcXVhcmVzJykubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJbWFnZUNvbnRhaW5lciA9IGUucXVlcnlTZWxlY3RvcignLmRpc3BsYXlJbWFnZXMnKS5jbG9zZXN0KCcub3ZlcmFsbC1zcXVhcmVzJykucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmV3SW1hZ2VDb250YWluZXIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3SW1hZ2UgPSBuZXdJbWFnZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheUltYWdlcycpLmNsb25lTm9kZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3TGluayA9IG5ld0ltYWdlQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5U3F1YXJlcy1wYWdlTGlua3MgLm1vcmUtaW5mby1saW5rJykuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlSG9sZGVyLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLnJlcGxhY2VXaXRoKG5ld0ltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5Qm94LnF1ZXJ5U2VsZWN0b3IoJy5tb3JlLWluZm8tbGluaycpLnJlcGxhY2VXaXRoKG5ld0xpbmspO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmaW5kU3BlY2lmaWVkUHJldmlvdXMoc291cmNlLCBpZGVudGlmaWVyKXtcclxuICAgICAgICAvLyB0aGlzIHdpbGwgbmVlZCB0byBiZSB0d2Vha2VkIGhhbmRsZSBub24tbmVzdGVkLCBhcyB3ZWxsIGFzIG90aGVyIG5lZWRzXHJcbiAgICAgICAgbGV0IGxpbmsgPSBzb3VyY2UucGFyZW50RWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgIHdoaWxlIChsaW5rKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5rLmNsYXNzTmFtZS5pbmNsdWRlcyhpZGVudGlmaWVyKSkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldGVkRWxlbWVudCA9IGxpbmsuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy50YXJnZXRlZEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluayA9IGxpbmsucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgfSBcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBwYWdpbmF0ZSgpe1xyXG4gICAgICAgIC8vY3JlYXRlIG5ldyBzZWFyY2ggc2V0LXVwIGZvciBqdXN0IHRoZSBtZW1iZXIgcHJvcCBwYWdpbmF0aW9uPyBMaWtlLCBnbyBtYWtlIG5ldyBpbmMgcGFnZVxyXG4gICAgICAgIC8vVXNlIHBvc3QtdHlwZSAnaWYnIHRoYXQgY2hlY2tzIGZvciB0aGUgaWQ/IEFjdHVhbGx5LCBJIGNhbiB1c2UgdGhlIHJlc3V0cyBhcnJheSBhcyBjYW4gcGx1cmFsaXplXHJcblxyXG4gICAgICAgIC8vc3RhcnQgYnkgaW5zZXJ0aW5nIHJhbmRvbSBzaGl0IGluIGJvdGg/XHJcbiAgICAgICAgLy9zZXQtdXAgdGhpcyB1cCB0byBub3QgcmVwbGFjZSBjb250ZW50LCBpZiBqYXZhc2NyaXB0IHR1cm5lZCBvZmYsIGFsb25nIHdpdGggaW5zZXJ0aW5nIGEgYnV0dG9uIHRvIHNlZSBhbGxcclxuICAgICAgICAvL2FuZCBtYWtlIHRoYXQgc2VlIGFsbCBwYWdlXHJcbiAgICAgICAgLy9JIHRoaW5rIEknbGwgbWFrZSB0aGUgc2VlIGFsbCBidXR0b24sIGJ1dCByZXBsYWNlIGl0J3MgY29udGVudHMgdGhyb3VnaCBoZXJlLCBzbyBpZiB0aGlzIGRvZXNuJ3QgcnVuLCBpdCdsbCBiZSB0aGVyZVxyXG4gICAgICAgIC8vZGlzYWJsZSBzY3JpcHQgaW4gYnJvd3NlciB0byBjaGVjay93b3JrIG9uIHN0dWZmXHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICAvL0lzIGl0IGJldHRlciBqdXN0IHRvIHVzZSBzZXBlcmF0ZSB1cmwgcm91dGVzPyBcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoc2l0ZURhdGEucm9vdF91cmwgKyAnL3dwLWpzb24vY2FoL3YxL2NvbnRlbnQ/cGFnZScpOyBcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3BvbnNlLmRhdGE7XHJcblxyXG4gICAgICAgICAgICAvLyBsZXQgY3VycmVudE1lbWJlcnNTaG93biA9IHRoaXMuY3VycmVudFBhZ2VzLm1lbWJlcnM7XHJcbiAgICAgICAgICAgIC8vIGxldCBjdXJyZW50UHJvcGVydGllc1Nob3duID0gdGhpcy5jdXJyZW50UGFnZXMucHJvcGVydGllcztcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgcG9zdE91dHB1dDtcclxuICAgICAgICAgICAgLy8gd2luZG93LmFsZXJ0KCdvbiB0YWJsZXQhJylcclxuICAgICAgICAgICAgLy9Db25zaWRlciBsb2NhbGl6ZWQgcmVsb2FkIG9uIHBhZ2UgcmVzaXplXHJcbiAgICAgICAgICAgIGlmKHdpbmRvdy5pbm5lcldpZHRoID49IDEyMDApe1xyXG4gICAgICAgICAgICAgICAgcG9zdE91dHB1dCA9IDg7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgcG9zdE91dHB1dCA9IDY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGxldCBwb3N0UGFnZSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgcG9zdFBhZ2VzID0gW107XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRzS2V5cyA9IE9iamVjdC5rZXlzKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZTtcclxuICAgICAgICAgICAgbGV0IHBvc3Q7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50U2hvd247XHJcbiAgICAgICAgICAgIGxldCBwYWdpbmF0aW9uTG9jYXRpb247XHJcbiBcclxuICAgICAgICAgICAgLy9Vc2UgYSBmb3IgbG9vcCBoZXJlPyBmb3IgcmVzdWx0IG9mIHJlc3VsdHM/XHJcbiAgICAgICAgICAgIC8vIG1ha2UgdGhpcyBpbnRvIGFuIGFycmF5IGFuZCBwdXQgaW4gaWYgYSBsb29wP1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lclR5cGUgPSB0aGlzLnBhZ2luYXRlZENvbnRlbnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyVHlwZUxvY2F0aW9uID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNvbnRlbnRMb2FkZWQpe1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCB0eXBlIG9mIHJlc3VsdHNLZXlzKXtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdHlwZTtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0ID0gcmVzdWx0c1tuYW1lXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYocG9zdC5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCA8PSBwb3N0T3V0cHV0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gcG9zdE91dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZSA9IHBvc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyB3aWxsIG5lZWQgdG8gbWFkZSBtb3JlIHZlcnNhdGlsZSBpZiBkZWNpZGUgdG8gdW5pdmVyc2FsaXplIHBhZ2luYXRpb25cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0UGFnZXMubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IHBvc3RQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc1t0eXBlXV07XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocG9zdFBhZ2VzWzBdKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2VOYW1lID0gdHlwZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXS5jbGFzc0xpc3QuYWRkKHR5cGUpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydENvbnRlbnQoY29udGFpbmVyVHlwZVtjb250YWluZXJUeXBlTG9jYXRpb25dLCBjb250ZW50U2hvd24sIHBhZ2VOYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Mb2NhdGlvbiA9IGNvbnRhaW5lclR5cGVbY29udGFpbmVyVHlwZUxvY2F0aW9uXS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy50ZXh0Qm94JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKHBhZ2luYXRpb25Mb2NhdGlvbiwgcG9zdFBhZ2VzLCBkYXRhQ291bnQsIHBhZ2VDb3VudCwgcGFnZU5hbWUpICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclR5cGVMb2NhdGlvbis9IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBvc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzID0gW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50TmV4dEFjdGl2YXRpb24oKTsgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgLy90ZW1wIHVudGlsIGNoYW5nZSBzZXQtdXAgdG8gbWFrZSBzZWN0aW9uIGxvYWRlciB3b3JrXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VMb2FkZXIuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJylcclxuICAgICAgICAgICAgICAgIHBvc3QgPSByZXN1bHRzW3RoaXMuZ3JvdXBOYW1lXVxyXG5cclxuICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoIDw9IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gcG9zdFBhZ2VzLmNvbmNhdChwb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGl0ZW0gPSAxOyBpdGVtIDw9IHBvc3RPdXRwdXQ7IGl0ZW0rKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IHBvc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBwb3N0UGFnZS5zcGxpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhZ2VzLnB1c2gocG9zdFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRTaG93biA9IHBvc3RQYWdlc1t0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV1dO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbnRlbnRCb3guJHt0aGlzLmdyb3VwTmFtZX1gKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0Q29udGVudCh0YXJnZXQsIGNvbnRlbnRTaG93biwgdGhpcy5ncm91cE5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBbmRQcmV2aW91cygpOyBcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudE5leHRBY3RpdmF0aW9uKCk7IFxyXG5cclxuICAgICAgICAgICAgICAgIC8vY2hhbmdlIHRvIGFkZGluZyBmYWRlLWNsYXNzLCBiZWZvcmUgcmVtb3ZpbmcgYWN0aXZlLCBzbyBnb2VzIGF3YXkgc21vb3RoZXJcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PnRoaXMucGFnZUxvYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSwgODEwKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+dGhpcy5wYWdlTG9hZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpLCA4MTApOyBcclxuICAgICBcclxuICAgICAgICAgICAgLy9DYW4gSSBsb29wIHRocm91Z2ggdGhlIGRpZmYgcmVzdWx0cywgdXNpbmcgdmFyaWFibGUocykgYmVmb3JlIHRoZSBpbm5lckh0bWwgYW5kIHRoZSBtYXAsIGFzIHdlbGwgYXMgdGhlIHBhZ2UgY29udGFpbmVyP1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gSG93IHRvIGdldCBwb3N0IG5hbWUsIHRob3VnaD8gQ2FuIEkgYXBwbHkgYSBmb3JlYWNoIHRvIHRoZW0gYW5kIGdyYWIgdGhlIHBvc3QgdHlwZT8gQ291bGQgSSBpbmNsdWRlIGluIHJlc3Qgcm91dGVcclxuXHJcbiAgICAgICAgICAgIC8vSGF2ZSBsb2dpYyB0aGF0IG9ubHkgaGFzIHRoZSBwcm9jZXNzIGZvciB0aGUgc2VsZWN0ZWQgc2VjdGlvbiBydW4gYWdhaW4sIHBlcmhhcHMgdmlhIGEgdmFyaWFibGUgaW4gdGhlIGNhbGwgYmVsb3cuIFxyXG4gICAgICAgICAgICAvL2llLiB0aGlzLnBhZ2luYXRlKCdtZW1iZXJzJylcclxuICAgICAgICAgICAgLy9NYXliZSB0aGUgcGFnaW5hdGlvbiBjb3VsZCBiZSBzcGxpdCB1cCwgd2l0aCB0aGUgaHRtbCBpbnNlcnRpb24gYmVpbmcgYSBzZXBlcmF0ZWx5IGNhbGxlZCBmdW5jdGlvbiB0aGF0IGlzIHJlcGVhdGVkXHJcbiAgICAgICAgICAgIC8vdGhyb3VnaCBhIGxvb3BzIGNvbnNpc3Rpbmcgb2YgdmFyaWFibGVzIGhlcmUsIGFuZCBjb3VsZCBzaW1wbHkgYmUgY2FsbGVkIGFnYWluIHdpdGggYSBzcGVjaWZpYyB2YXJpYWJsZSAgXHJcbiAgICAgICAgICAgIC8vT3Igc2ltcGx5IGp1c3Qgc2VwZXJhdGUgdGhpcyBhbGwgXHJcblxyXG4gICAgICAgICAgICAvL3NpbXBseSBkaXNwbGF5IGRpZmZlcmVudCB0aGluZ3MsIG5lZWQgdHdvIGRpZmYgaHRtbCBibG9ja3MsIGJ1dCBlYWNoIGNhbiBjYWxsZWQgdXBvbiBzZXBlcmF0ZWx5LCBhcyBkaWZmZXJlbnQgaW5uZXJIdG1sIGJsb2Nrc1xyXG5cclxuICAgICAgICAgICAgLy9CdXQgdGhlbiBhZ2FpbiwgYSB1bmlmb3JtZWQgZGlzcGxheWVkIGNvdWxkIGJlIGFjaGlldmVkIHdpdGggdGVybmFyeSBvcGVyYXRvcnMsIGNoZWNraW5nIGZvciB0aXRsZV9vcl9wb3NpdGlvblxyXG4gICAgICAgICAgICAvL0FuZCBjaGVja2luZyBmb3Igc29tZXRoaW5nIHRoYXQgY291bGQgcnVsZSBvdXQgdGhlIG1hZ25pZnlpbmcgYnV0dG9uIGFuZCB0aGUgbG9jYXRpb24gbGlua1xyXG5cclxuICAgICAgICAgICAgLy9DYW4gSSBtb3ZlIHRoaXMgQW5kIGp1c3QgbG9vcCBjYWxsIHRoaXM/XHJcblxyXG4gICAgICAgICAgICAvL01ha2Ugd29yayBhZ2Fpbi4gQW5kIHZlcnNhdGlsZVxyXG4gICAgICAgICAgICAvL0RvIEkgbmVlZCB0aGlzIGFueW1vcmUsIHRob3VnaD9cclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBhY3RpdmVQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcGFnZT0nJHtjdXJyZW50TWVtYmVyc1Nob3dufSddYCk7XHJcbiAgICAgICAgICAgIC8vIGFjdGl2ZVBhZ2luYXRpb24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICBcclxuICAgICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5jb250ZW50SW50ZXJmYWNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5zZXJ0Q29udGVudChkZXN0aW5hdGlvbiwgdHlwZSwgcGFnZU5hbWUpe1xyXG4gICAgICAgICAgICAvL0NoYW5nZSBkZXNpdGluYXRpb24gc2V0LXVwIHRvIGFjY29tYWRhdGUgbG9hZGVyXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBhZ2VOYW1lKVxyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAke3R5cGUubWFwKGl0ZW0gPT4gYFxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm92ZXJhbGwtc3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5U3F1YXJlc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiZGlzcGxheUltYWdlc1wiIGRhdGEtbmFtZT1cIiR7aXRlbS50aXRsZS5yZXBsYWNlQWxsKCcgJywgJycpfVwiIHNyYz1cIiR7aXRlbS5pc0NvbXBsZXRlZCB8fCBpdGVtLnBvc3RUeXBlID09PSAnbWVtYmVyJyA/IGl0ZW0uaW1hZ2UgOiBpdGVtLnByb2plY3RlZEltYWdlfVwiIGFsdD1cIiR7aXRlbS50aXRsZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpc3BsYXlTcXVhcmVzLXBhZ2VMaW5rc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJtb3JlLWluZm8tbGlua1wiIGhyZWY9XCIke2l0ZW0ucGVybWFsaW5rfVwiPkZpbmQgT3V0IE1vcmU8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiJHtzaXRlRGF0YS5yb290X3VybH0vYWxsLW5ld3MvIyR7aXRlbS5pZH0tcmVsYXRlZC0ke2l0ZW0ucG9zdFR5cGVQbHVyYWx9XCI+QXNzb2NpYXRlZCBOZXdzPzwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7cGFnZU5hbWUgPT09ICdwcm9wZXJ0aWVzJyA/ICc8YnV0dG9uPjxpIGNsYXNzPVwiZmFzIGZhLXNlYXJjaC1wbHVzXCI+PC9pPjwvYnV0dG9uPic6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheS10ZXh0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5wb3NpdGlvbk9yUm9sZSAhPT0gdW5kZWZpbmVkID8gYDxwPiR7aXRlbS5wb3NpdGlvbk9yUm9sZX08L3A+YCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiBcclxuICAgICAgICAgICAgICAgIDwvZGl2PiAgIFxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIGluc2VydFBhZ2luYXRpb24oZGVzdGluYXRpb24sIHBvc3RQYWdlcywgZGF0YUNvdW50LCBwYWdlQ291bnQsIHBhZ2VOYW1lKXtcclxuICAgICAgICAvL1B1dCBpbiAnbmV4dCcgYW5kICdwcmV2JyBidXR0b25zXHJcbiAgICAgICAgLy9NYWtlIG51bWJlcnMgTGFyZ2UgYW5kIGNlbnRlcmVkLCBhbmQgcGVyaGFwcyBwdXQgYSBib3ggYXJvdW5kIHRoZW0sIGFsb25nIHdpdGggZmFuY3kgc3R5bGluZyBhbGwgYXJvdW5kXHJcbiAgICAgICAgZGVzdGluYXRpb24uaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgIFwiYmVmb3JlZW5kXCIsXHJcbiAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID8gJzxkaXYgY2xhc3M9XCJjb250ZW50LXBhZ2VzXCI+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID4gMSAgPyBgPGEgaWQ9XCIke3BhZ2VOYW1lfS1wcmV2XCIgY2xhc3M9XCIke3BhZ2VOYW1lfS1ncm91cCAke3BhZ2VOYW1lfS1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXNcIj5QcmV2PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgJHtwb3N0UGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgJHtwb3N0UGFnZXMubGVuZ3RoID4gMSA/IGA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZSAke3BhZ2VOYW1lfS1ncm91cFwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgYCkuam9pbignJyl9ICBcclxuICAgICAgICAgICAgICAgICR7cG9zdFBhZ2VzLmxlbmd0aCA+IDEgPyBgPGEgaWQ9XCIke3BhZ2VOYW1lfS1uZXh0XCIgY2xhc3M9XCIke3BhZ2VOYW1lfS1ncm91cCAke3BhZ2VOYW1lfS1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb24gY29udGVudC1kaXJlY3Rpb25fbmV4dFwiPk5leHQ8L2E+YCA6ICcnfVxyXG4gICAgICAgICAgICAke3Bvc3RQYWdlcy5sZW5ndGggPyAnPC9kaXY+JyA6ICcnfSBcclxuXHJcbiAgICAgICAgYCk7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb25fcHJldmlvdXMnKTsgICAgXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSAgXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5uZXh0Q29udGVudERpcmVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7IFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZmlyc3RQYWdlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24uZm9yRWFjaChlbD0+ZWwuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJykpXHJcblxyXG4gICAgICAgIGxldCBjb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1wYWdlJyk7XHJcblxyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoY29udGVudFBhZ2VPcHRpb25zKTtcclxuICAgIH1cclxuLy8gdGhpcyBuZXcgc2V0dXAgY2F1c2VzIGlzc3VlcyBhZnRlciBkaXJlY3Rpb25hbCBidXR0b25zIHVzZWQ6IHNlbGVjdGVkUGFnZSBcclxuLy9ub3QgYmVpbmcgYWRkZWQgdG8gY2xpY2tlZCBhbmQgY3VycmVudFBhZ2Ugb24gZGlyZWN0aW9uYWwgZ2V0cyBlcnJvclxyXG4vL0xhdHRlciBsaWtlbHkgY29ubmVjdGVkIHRvIHRoZSBmb3JtZXJcclxuXHJcbiAgICBwYWdpbmF0aW9uRnVuY3Rpb25hbGl0eShjb250ZW50UGFnZU9wdGlvbnMpe1xyXG4gICAgICAgIC8vQ29tYmluZSB0aGUgdHdvIGJlbG93XHJcbiAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgICBlbC5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZFBhZ2UgPSBlLmN1cnJlbnRUYXJnZXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYWdlLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG5hbWUubWF0Y2goLy1ncm91cC8pKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cE5hbWUgPSBuYW1lLnNsaWNlKDAsIC02KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSA9IHBhcnNlSW50KHNlbGVjdGVkUGFnZS5kYXRhc2V0LnBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdGUoKVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGkgPT57IFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXHJcbiAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QuZm9yRWFjaCgobmFtZSk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCh0aGlzLmdyb3VwTmFtZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAvLyAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PntcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIC8vICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coaSlcclxuICAgICAgICAvLyAgICAgICAgICAgICBpLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpZihuYW1lLm1hdGNoKHRoaXMuZ3JvdXBOYW1lKSl7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgfSlcclxuICAgICAgICAvLyAgICAgICAgIH0pICBcclxuICAgICAgICAvLyAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgIC8vICAgICB9LCB7IG9uY2U6IHRydWUgfSk7XHJcbiAgICAgICAgLy8gfSlcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIGNvbnRlbnROZXh0QWN0aXZhdGlvbigpe1xyXG4gICAgICAgIGxldCBhbGxuZXh0QnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LWRpcmVjdGlvbl9uZXh0Jyk7XHJcblxyXG4gICAgICAgIGFsbG5leHRCdXR0b25zLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhZ2UuY2xhc3NMaXN0LmZvckVhY2goKG5hbWUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmFtZS5tYXRjaCgvLWdyb3VwLykpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTmFtZSA9IG5hbWUuc2xpY2UoMCwgLTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cC5zZWxlY3RlZFBhZ2VgKTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAgIGxldCBuZXh0UGFnZSA9IHRoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZXNbdGhpcy5ncm91cE5hbWVdID0gbmV4dFBhZ2U7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe2VsLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJcIjsgfSwgOTIwKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRlKClcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3Q3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cFtkYXRhLXBhZ2U9XCIke3RoaXMuY3VycmVudFBhZ2VzW3RoaXMuZ3JvdXBOYW1lXX1cIl1gKTtcclxuICAgICAgICAgICAgICAgIG5ld0N1cnJlbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdDdXJyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBcclxuICAgIH07XHJcblxyXG4gICAgY29udGVudE5leHRBbmRQcmV2aW91cygpe1xyXG4gICBcclxuICAgICAgICB0aGlzLmNvbnRlbnREaXJlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29udGVudC1kaXJlY3Rpb24nKTsgICAgIFxyXG5cclxuICAgICAgICBsZXQgcHJldkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RoaXMuZ3JvdXBOYW1lfS1wcmV2YClcclxuICAgICAgICBsZXQgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RoaXMuZ3JvdXBOYW1lfS1uZXh0YClcclxuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMuZ3JvdXBOYW1lfS1ncm91cC5zZWxlY3RlZFBhZ2VgKTtcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBpZih0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gPiAwKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFBhZ2VzKVxyXG4gICAgICAgICAgICAgICAgcHJldkJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHByZXZCdXR0b24uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMubmV4dENvbnRlbnREaXJlY3Rpb24uZm9yRWFjaChlbD0+e1xyXG4gICAgICAgICAgICBpZighbmV4dEJ1dHRvbi5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC5jb250YWlucygnc2VsZWN0ZWRQYWdlJykpe1xyXG4gICAgICAgICAgICAgICAgbmV4dEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIG5leHRCdXR0b24uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMucHJldmlvdXNDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAgICAgZWwub25jbGljayA9ICAoaSkgPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJldlBhZ2UgPSB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gLSAxO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV0gPSBwcmV2UGFnZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWRQYWdlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUucG9pbnRlckV2ZW50cz1cIm5vbmVcIjtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtlbC5zdHlsZS5wb2ludGVyRXZlbnRzPVwiXCI7IH0sIDkyMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0ZSgpXHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5ld0N1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmdyb3VwTmFtZX0tZ3JvdXBbZGF0YS1wYWdlPVwiJHt0aGlzLmN1cnJlbnRQYWdlc1t0aGlzLmdyb3VwTmFtZV19XCJdYCk7XHJcbiAgICAgICAgICAgICAgICBuZXdDdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3Q3VycmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vZml4IHJlcGVhdCBvZiBuZXh0QnV0dG9uIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICAvLyB0aGlzLm5leHRDb250ZW50RGlyZWN0aW9uLmZvckVhY2goZWw9PntcclxuICAgICAgICAvLyAgICAgZWwub25jbGljayA9ICAoaSkgPT57XHJcbiAgICAgICAgLy8gICAgICAgICBsZXQgbmV4dFBhZ2UgPSB0aGlzLmN1cnJlbnRQYWdlc1twYWdlTmFtZV0gKyAxO1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzW3BhZ2VOYW1lXSA9IG5leHRQYWdlO1xyXG4gICAgICAgIC8vICAgICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZFBhZ2UnKTtcclxuXHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnBhZ2luYXRlKClcclxuXHJcbiAgICAgICAgLy8gICAgICAgICBuZXdDdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7cGFnZU5hbWV9LWdyb3VwW2RhdGEtcGFnZT1cIiR7dGhpcy5jdXJyZW50UGFnZXNbcGFnZU5hbWVdfVwiXWApO1xyXG4gICAgICAgIC8vICAgICAgICAgbmV3Q3VycmVudC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKG5ld0N1cnJlbnQpXHJcbiAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAvLyB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYWdpbmF0aW9uIiwiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiXHJcblxyXG5jbGFzcyBTZWFyY2gge1xyXG4gICAgLy8gMS4gZGVzY3JpYmUgYW5kIGNyZWF0ZS9pbml0aWF0ZSBvdXIgb2JqZWN0XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHRoaXMuYWRkU2VhcmNoSHRtbCgpO1xyXG4gICAgICAgIHRoaXMuaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcclxuICAgICAgICB0aGlzLmhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoZWFkZXJcIik7XHJcbiAgICAgICAgdGhpcy5yZXN1bHRzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZWFyY2gtb3ZlcmxheV9fcmVzdWx0c1wiKTtcclxuICAgICAgICAvL0lmIG9wZW4gZGlmIG9wZW4gYnV0dG9uIGZvciBtb2JpbGUgdnMgZGVza3RvcFxyXG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtc2VhcmNoLXRyaWdnZXJcIik7XHJcbiAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2VhcmNoLW92ZXJsYXlfX2Nsb3NlXCIpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoT3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2VhcmNoLW92ZXJsYXlcIik7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlYXJjaC10ZXJtJyk7XHJcbiAgICAgICAgdGhpcy5pc092ZXJsYXlPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlO1xyXG4gICAgICAgIHRoaXMudHlwaW5nVGltZXI7XHJcbi8vR2V0IHJpZCBvZiB0aGlzIGFuZCB0aGUgcGFnaW5hdGlvbiBsb2dpYywgcmVzZXRpbmcgdGhlIG5ld3MgcmVuZGVyaW5nXHJcbiAgICAgICAgdGhpcy5uZXdzUGFnZVNlbGVjdDtcclxuICAgICAgICB0aGlzLm5ld3NQYWdlT3B0aW9uO1xyXG4gICAgICAgIHRoaXMuY3VycmVudE5ld3NQYWdlID0gMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDIuIGV2ZW50c1xyXG4gICAgZXZlbnRzKCkge1xyXG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbi5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5PdmVybGF5KClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gXHJcbiAgICAgICAgdGhpcy5jbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZU92ZXJsYXkoKSlcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHRoaXMua2V5UHJlc3NEaXNwYXRjaGVyKGUpKVxyXG4gICAgICAgIHRoaXMuc2VhcmNoVGVybS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgKCkgPT4gdGhpcy50eXBpbmdMb2dpYygpKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIDMuIG1ldGhvZHMgKGZ1bmN0aW9uLCBhY3Rpb24uLi4pXHJcbiAgICB0eXBpbmdMb2dpYygpIHtcclxuICAgICAgICBpZih0aGlzLnNlYXJjaFRlcm0udmFsdWUgIT09IHRoaXMucHJldmlvdXNWYWx1ZSl7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnR5cGluZ1RpbWVyKTtcclxuICAgICAgICAgICAgaWYodGhpcy5zZWFyY2hUZXJtLnZhbHVlKXtcclxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmlzU3Bpbm5lclZpc2libGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0c0Rpdi5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXItbG9hZGVyXCI+PC9kaXY+JztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5lclZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy50eXBpbmdUaW1lciA9IHNldFRpbWVvdXQodGhpcy5nZXRSZXN1bHRzLmJpbmQodGhpcyksIDgwMCk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzRGl2LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c1ZhbHVlID0gdGhpcy5zZWFyY2hUZXJtLnZhbHVlO1xyXG4gICAgfVxyXG4vL0FkZCBjb2xvcmluZyB0byB0ZXh0IHRoYXQgbWF0Y2hlcyBzZWFyY2ggcXVlcnkgYW5mZCBtYXliZSBkb24ndCBzaG93IHRpdGxlIGF0IGFsbCBpZiBubyBjb250ZW50KD8pXHJcbiAgICBhc3luYyBnZXRSZXN1bHRzKCl7XHJcbiAgICAgIHRyeXtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChzaXRlRGF0YS5yb290X3VybCArICcvd3AtanNvbi9jYWgvdjEvc2VhcmNoP3Rlcm09JyArIHRoaXMuc2VhcmNoVGVybS52YWx1ZSk7IFxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuXHJcbiAgICAgICAgbGV0IHggPSB0aGlzLmN1cnJlbnROZXdzUGFnZTtcclxuICAgICAgICBsZXQgeSA9IDA7XHJcbiAgICAgICAgbGV0IGl0ZW07XHJcbiAgICAgICAgY29uc3QgcG9zdE91dHB1dCA9IDM7XHJcbiAgICAgICAgY29uc3QgbmV3cyA9IHJlc3VsdHMudXBkYXRlc0FuZE5ld3M7XHJcbiAgICAgICAgbGV0IG5ld3NQYWdlID0gW107XHJcbiAgICAgICAgbGV0IG5ld3NQYWdlcyA9IFtdO1xyXG4gICAgICAgIGxldCBuZXdzU2hvd247XHJcbiAgICAgICAgbGV0IHBhZ2VMaXN0TnVtYmVyID0gMDtcclxuICAgICAgICBpZihuZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIGlmKG5ld3MubGVuZ3RoIDw9IHBvc3RPdXRwdXQpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSBuZXdzUGFnZXMuY29uY2F0KG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgbmV3c1BhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKG5ld3MubGVuZ3RoID4gcG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBmb3IoaXRlbSA9IDE7IGl0ZW0gPD0gcG9zdE91dHB1dDsgaXRlbSsrKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBuZXdzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYWdlID0gbmV3c1BhZ2Uuc3BsaWNlKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3NQYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICBpZihuZXdzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3c1BhZ2UgPSBuZXdzLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdzUGFnZXMucHVzaChuZXdzUGFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYobmV3c1BhZ2VzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIG5ld3NTaG93biA9IG5ld3NQYWdlc1t4XTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgbmV3c1Nob3duID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlc3VsdHNEaXYuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicm93XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwib25lLXRoaXJkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwic2VhcmNoLW92ZXJsYXlfX3NlY3Rpb24tdGl0bGVcIj5Qcm9wZXJ0aWVzPC9oMj5cclxuICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMucHJvcGVydGllcy5sZW5ndGggPyAnPHVsIGNsYXNzPVwibGluay1saXN0IG1pbi1saXN0XCI+JyA6IGA8cD5ObyBwcm9wZXJ0aWVzIG1hdGNoIHRoYXQgc2VhcmNoLjwvcD5gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc3VsdHMucHJvcGVydGllcy5tYXAoaXRlbSA9PiBgPGxpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheVNxdWFyZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJkaXNwbGF5SW1hZ2VzXCIgZGF0YS1uYW1lPVwiJHtpdGVtLnRpdGxlLnJlcGxhY2VBbGwoJyAnLCAnJyl9XCIgc3JjPVwiJHtpdGVtLmlzQ29tcGxldGVkID8gaXRlbS5pbWFnZSA6IGl0ZW0ucHJvamVjdGVkSW1hZ2V9XCIgYWx0PVwiJHtpdGVtLnRpdGxlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7aXRlbS5wZXJtYWxpbmt9XCI+JHtpdGVtLnRpdGxlfTwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+ICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPmApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5wcm9wZXJ0aWVzLmxlbmd0aCA/ICc8L3VsPicgOiAnJ31cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uZS10aGlyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X19zZWN0aW9uLXRpdGxlXCI+TWVtYmVyczwvaDI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLm1lbWJlcnMubGVuZ3RoID8gJzx1bCBjbGFzcz1cImxpbmstbGlzdCBtaW4tbGlzdFwiPicgOiBgPHA+Tm8gbWVtYmVycyBtYXRjaCB0aGF0IHNlYXJjaC48L3A+YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXN1bHRzLm1lbWJlcnMubWFwKGl0ZW0gPT4gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9JHtpdGVtLmltYWdlfVwiIGFsdD1cIlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD4ke2l0ZW0udGl0bGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS5wb3NpdGlvbk9yUm9sZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiR7aXRlbS5wZXJtYWxpbmt9XCI+UmVhZCBNb3JlPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfVxyXG4gICAgICAgICAgICAgICAgICAgICR7cmVzdWx0cy5tZW1iZXJzLmxlbmd0aCA/ICc8L3VsPicgOiAnJ31cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9uZS10aGlyZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X19zZWN0aW9uLXRpdGxlXCI+VXBkYXRlcyBBbmQgTmV3czwvaDI+XHJcbiAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID8gJzx1bCBjbGFzcz1cImxpbmstbGlzdCBtaW4tbGlzdFwiPicgOiBgPHA+Tm8gbmV3cyBvciB1cGRhdGVzIG1hdGNoIHRoYXQgc2VhcmNoPC9wPiAgPGEgaHJlZj1cIiR7c2l0ZURhdGEucm9vdF91cmx9L2N1cnJlbnRcIj5HbyB0byB2aWV3cyBhbmQgdXBkYXRlIHNlY3Rpb248L2E+YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzU2hvd24ubWFwKGl0ZW0gPT4gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmV3c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGg0PiR7aXRlbS50aXRsZX08L2g0PlxyXG4gICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5jYXB0aW9uLmxlbmd0aCA+PSAxID8gaXRlbS5jYXB0aW9uICsgJyAtICcgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5kYXRlfSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPipyZWxhdGVkIHdpbGwgZ28gaGVyZTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7aXRlbS5pbWFnZSAhPT0gbnVsbCA/IGA8aW1nIHNyYz1cIiR7aXRlbS5pbWFnZX1cIiBhbHQ9XCJcIj5gIDogYDxkaXY+JHtpdGVtLnZpZGVvfTwvZGl2PmB9XHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwicmVhZC1tb3JlXCIgaHJlZj1cImFsbC1uZXdzLyMke2l0ZW0uaWR9XCI+UmVhZCBNb3JlLi4uPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPGRpdiBpZD1cIm5ld3MtcGFnZXNcIj4nIDogJyd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7bmV3c1BhZ2VzLmxlbmd0aCA+IDEgPyBgPGEgaHJlZj1cIiNcIiBjbGFzcz1cIm5ld3MtcGFnZVwiIGRhdGEtcGFnZT1cIiR7eSsrfVwiPiAke3BhZ2VMaXN0TnVtYmVyICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke25ld3NQYWdlcy5sZW5ndGggPyAnPC9kaXY+JyA6ICcnfSAgXHJcbiAgICAgICAgICAgICAgICAgICAgJHtuZXdzUGFnZXMubGVuZ3RoID8gJzwvdWw+JyA6ICcnfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGA7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uZXJWaXNpYmxlID0gZmFsc2VcclxuICAgICAgICBsZXQgbGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBhZ2U9JyR7eH0nXWApO1xyXG4gICAgICAgIGxpbmsuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2lzIGl0IGhhcHBlbmluZyBiZWZvcmUgY2F0Y2g/JylcclxuICAgICAgfWNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSlcclxuICAgICAgfVxyXG4gICAgICBjb25zb2xlLmxvZygnaXMgaXQgaGFwcGVuaW5nIGFmdGVyIGNhdGNoPycpXHJcbiAgICAgICAgICAgIHRoaXMubmV3c1BhZ2VPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5ld3MtcGFnZScpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uZXdzUGFnZU9wdGlvbnMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudE5ld3NQYWdlID0gc2VsZWN0ZWRQYWdlLmRhdGFzZXQucGFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRSZXN1bHRzKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2lzIGl0IGhhcHBlbmluZyBpbiBuZXdzUGFnZU9wdGlvbnM/JylcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgXHJcbiAgICAgfVxyXG5cclxuICAgIGtleVByZXNzRGlzcGF0Y2hlcihlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coZS5rZXlDb2RlKTtcclxuICAgICAgICBpZiAoZS5rZXlDb2RlID09IDgzICYmICF0aGlzLmlzT3ZlcmxheU9wZW4gJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC50YWdOYW1lICE9IFwiSU5QVVRcIiAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUgIT0gXCJURVhUQVJFQVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3Blbk92ZXJsYXkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGUua2V5Q29kZSA9PT0gMjcgJiYgdGhpcy5pc092ZXJsYXlPcGVuKXtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZU92ZXJsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbk92ZXJsYXkoKXtcclxuICAgICAgICB0aGlzLnNlYXJjaE92ZXJsYXkuY2xhc3NMaXN0LmFkZChcInNlYXJjaC1vdmVybGF5LS1hY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5oZWFkZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgdGhpcy5odG1sLmNsYXNzTGlzdC5hZGQoJ2ZyZWV6ZScpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoVGVybS52YWx1ZSA9ICcnO1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PiB0aGlzLnNlYXJjaFRlcm0uZm9jdXMoKSwgMzAxKTtcclxuICAgICAgICB0aGlzLmlzT3ZlcmxheU9wZW4gPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gICBcclxuICAgIFxyXG4gICAgY2xvc2VPdmVybGF5KCl7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hPdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ3NlYXJjaC1vdmVybGF5LS1hY3RpdmUnKTtcclxuICAgICAgICB0aGlzLmhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LnJlbW92ZSgnZnJlZXplJyk7XHJcbiAgICAgICAgdGhpcy5pc092ZXJsYXlPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkU2VhcmNoSHRtbCgpe1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICBcImJlZm9yZWVuZFwiLFxyXG4gICAgICAgICAgICBgXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZWFyY2gtb3ZlcmxheVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaC1vdmVybGF5X190b3BcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtc2VhcmNoIHNlYXJjaC1vdmVybGF5X19pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNlYXJjaC10ZXJtXCIgcGxhY2Vob2xkZXI9XCJXaGF0IGFyZSB5b3UgbG9va2luZyBmb3I/XCIgaWQ9XCJzZWFyY2gtdGVybVwiIGF1dG9jb21wbGV0ZT1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtd2luZG93LWNsb3NlIHNlYXJjaC1vdmVybGF5X19jbG9zZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwic2VhcmNoLW92ZXJsYXlfX3Jlc3VsdHNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgYFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNlYXJjaCIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcbi8vQ29tYmluZSB3aXRoIG90aGVyIHBhZ2luYXRpb24/XHJcblxyXG5jbGFzcyBTaGFkb3dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sO1xyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rO1xyXG5cclxuICAgICAgICB0aGlzLm1lZGlhUmVjaWV2ZXI7XHJcbiAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkOyBcclxuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYTtcclxuICAgICAgICB0aGlzLm1lZGlhTWVudTtcclxuICAgICAgICB0aGlzLm1lZGlhQ29sdW1uO1xyXG4gICAgICAgIHRoaXMubWVkaWFUaHVtYjtcclxuICAgICAgICB0aGlzLm1lZGlhUGFnaW5hdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy52aWRlb1NyYztcclxuICAgICAgICB0aGlzLnBsYXlCdXR0b247XHJcbiAgICAgICAgdGhpcy5jbG9zZU1lZGlhQnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGFDb3VudDtcclxuICAgICAgICB0aGlzLnBvc3RPdXRwdXQ7XHJcbiAgICAgICAgdGhpcy5wYWdlQ291bnQ7XHJcbiAgICAgICAgdGhpcy5wb3N0UGFnZTtcclxuICAgICAgICB0aGlzLnBvc3RQYWdlcztcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuXHJcbiAgICAgICAgLy9SZXNldCB3aGVuIGNoYW5nZSBmaWx0ZXIgYW5kIGRpc21pc3MgY3VycmVudCB2aWRzXHJcbiAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb247IFxyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2VzO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbjtcclxuICAgICAgICB0aGlzLnBvc3RGaWVsZDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYTtcclxuICAgICAgICB0aGlzLmNsb3NlTWVkaWFCdXR0b247XHJcblxyXG4gICAgICAgIHRoaXMubmV3TG9hZDtcclxuXHJcbiAgICAgICAgdGhpcy5ldmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBldmVudHMoKXtcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgdGhpcy5odG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xyXG4gICAgICAgIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudE93bmVySWQgPSBudWxsOyBcclxuICAgICAgICB0aGlzLm1lZGlhTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZWRpYS1jYXJkIConKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LW1lZGlhJyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYU1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtbWVudScpO1xyXG4gICAgICAgIHRoaXMubWVkaWFDb2x1bW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtY29sdW1uJyk7XHJcbiAgICAgICAgdGhpcy5tZWRpYVRodW1iO1xyXG4gICAgICAgIHRoaXMubWVkaWFQYWdpbmF0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lZGlhLXBhZ2luYXRpb24nKTtcclxuICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7IFxyXG4gICAgICAgIHRoaXMucG9zdEZpZWxkID0gJ2dhbGxlcnknO1xyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1jbG9zZScpO1xyXG4gICAgICAgIHRoaXMubmV3TG9hZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMubWVkaWFMaW5rLmZvckVhY2gobWVkaWE9PntcclxuICAgICAgICAgICAgbWVkaWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+IHRoaXMuc2hhZG93Qm94KG1lZGlhKSlcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHRoaXMua2V5UHJlc3NEaXNwYXRjaGVyKGUpKVxyXG4gICAgICAgIHRoaXMuY2xvc2VNZWRpYUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT50aGlzLmNsb3NlTWVkaWFSZWNpZXZlcigpKVxyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgICAgIHNoYWRvd0JveChtZWRpYSl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFSZWNpZXZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZWRpYS1yZWNpZXZlcicpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tZWRpYVJlY2lldmVyLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gdHJ1ZTsgXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbC5jbGFzc0xpc3QuYWRkKCdmcmVlemUnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBwb3N0VHlwZSA9IG1lZGlhLmRhdGFzZXQucG9zdDtcclxuICAgICAgICAgICAgbGV0IGRhdGFJZCA9IHBhcnNlSW50KG1lZGlhLmRhdGFzZXQuaWQpO1xyXG5cclxuICAgICAgICAgICAgaWYocG9zdFR5cGUgIT09ICdub25lJyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldE1lZGlhKHBvc3RUeXBlLCBkYXRhSWQpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySXNvbGF0ZWRNZWRpYShtZWRpYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFzeW5jIGdldE1lZGlhKGRhdGFUeXBlLCBkYXRhSWQpe1xyXG4gICAgICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9tZWRpYT9yZWxhdGVkJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmVzdWx0c1tkYXRhVHlwZV0uZm9yRWFjaChpdGVtPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbS5nYWxsZXJ5KSk7XHJcbiAgICAgICAgICAgICAgICBpZihpdGVtLmlkID09PSBkYXRhSWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHNbZGF0YVR5cGVdKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihpdGVtLnBvc3RUeXBlID09PSAncHJvcGVydHknKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYU1lbnUuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJnYWxsZXJ5XCIgY2xhc3M9XCJhY3RpdmVcIj5HZW5lcmFsPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJpbnRlcmlvclwiPkludGVyaW9yPC9hPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJmbG9vclBsYW5zXCI+Rmxvb3IgUGxhbnM8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImJ1aWxkaW5nUGxhbnNcIj5CdWlsZGluZyBQbGFuczwvYT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lbnVMaW5rID0gdGhpcy5tZWRpYU1lbnUucXVlcnlTZWxlY3RvckFsbCgnYScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51TGluay5mb3JFYWNoKGU9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0RmllbGQgPSBpLmN1cnJlbnRUYXJnZXQuaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW1bdGhpcy5wb3N0RmllbGRdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdMb2FkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3QpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51TGluay5mb3JFYWNoKGM9PntjLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO30pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBvc2l0aW9uPVwiMFwiXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIwXCJdYCkuY2hpbGRyZW5bMF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBsZXQgYWxsTmV3cyA9IHJlc3VsdHNbJ3VwZGF0ZXMnXS5jb25jYXQocmVzdWx0c1snbmV3cyddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFsbE5ld3MubWFwKHJlcG9ydHM9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHJlcG9ydHMucmVsYXRpb25zaGlwcy5mb3JFYWNoKHBvc3Q9PntcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBpZihwb3N0LklEID09PSBpdGVtLmlkKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgaXRlbS5nYWxsZXJ5LnB1c2gocmVwb3J0cy5nYWxsZXJ5KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmKGRhdGFJZCAhPT0gIHRoaXMuY3VycmVudE93bmVySWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRPd25lcklkID0gZGF0YUlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5sb2NhbFN0b3JhZ2UgPSB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsTWVkaWFQb3B1bGF0aW9uKGl0ZW0sIHBvc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB0aGlzLmFjY2Vzc0xvY2FsU3RvcmFnZShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgfWNhdGNoKGUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluaXRpYWxNZWRpYVBvcHVsYXRpb24oaXRlbSwgcG9zdCl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBpZiBtb3JlIHRoYW4gb25lLCBzaG93XHJcbiAgICAgICAgICAgIC8vIGlzIHRoZXJlIGEgbW9yZSBhY2Nlc3NpYmxlLWZyaWVuZGx5IGh0bWwgdGFnIGZvciBmaWx0cnIgbWVudXM/XHJcbiAgICAgICAgICAgIC8vSGF2ZSBkZXNjIHdpdGggJ3JlYWQgbW9yZScgdW5kZXIgYWN0aXZlIHZpZC4gRXhlcnB0IHVuZGVyIHNlbGVjdGlvbiwgb2YgZXhpc3RzLCBvdGhlcndpc2UgdHJpbVxyXG5cclxuICAgICAgICAgICAgdGhpcy5kYXRhQ291bnQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnBvc3RPdXRwdXQgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMgPSBbXTtcclxuXHJcbiAgXHJcbiAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIGlmKHBvc3QubGVuZ3RoIDw9IHRoaXMucG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBvc3RQYWdlcy5jb25jYXQocG9zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwb3N0Lmxlbmd0aCA+IHRoaXMucG9zdE91dHB1dCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaXRlbSA9IDE7IGl0ZW0gPD0gdGhpcy5wb3N0T3V0cHV0OyBpdGVtKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBwb3N0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3RQYWdlLnB1c2gocmVtb3ZlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhZ2UgPSB0aGlzLnBvc3RQYWdlLnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaChwYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihwb3N0Lmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdFBhZ2UgPSBwb3N0LnNwbGljZSgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3N0UGFnZXMucHVzaCh0aGlzLnBvc3RQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucG9zdFBhZ2VzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucG9zdFBhZ2VzKSk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtKVxyXG4gXHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVNZWRpYUNvbHVtbihpdGVtLCB0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlc10pO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpdGVtKVxyXG4gICAgICAgICAgICBpZih0aGlzLm5ld0xvYWQgPT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5uZXdMb2FkKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRQYWdpbmF0aW9uKGl0ZW0sIHRoaXMuZGF0YUNvdW50LCB0aGlzLnBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgIH1cclxuIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVySXNvbGF0ZWRNZWRpYShtZWRpYSl7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5yZW1vdmUoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QuYWRkKCdjZW50ZXItZGlzcGxheScpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7bWVkaWEuZGF0YXNldC5mdWxsfVwiPlxyXG4gICAgICAgICAgICBgOyAgXHJcbiAgIFxyXG4gICAgICAgICAgICAvLyB0aGlzLnZpZGVvU3JjID0gdGhpcy5jdXJyZW50TWVkaWEucXVlcnlTZWxlY3RvcignaW1nJykuZGF0YXNldC52aWRlby5yZXBsYWNlKCd3YXRjaD92PScsICdlbWJlZC8nKSArICc/YXV0b3BsYXk9MSc7XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGxheUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbGF5LWJ1dHRvbicpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+dGhpcy5wbGF5VmlkZW8odGhpcy52aWRlb1NyYykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVuZGVyQ3VycmVudE1lZGlhKGl0ZW0pe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuaW5uZXJIVE1MID0gYCAgICAgICBcclxuICAgICAgICAgICAgICAgICR7aXRlbVt0aGlzLnBvc3RGaWVsZF1bdGhpcy5nYWxsZXJ5UG9zaXRpb25dLnZpZGVvU291cmNlID8gJzxkaXYgaWQ9XCJwbGF5LWJ1dHRvbi1jb250YWluZXJcIj48YnV0dG9uIGlkPVwicGxheS1idXR0b25cIj48ZGl2PjwvZGl2PjwvYnV0dG9uPjwvZGl2PicgOiAnJ31cclxuICAgICAgICAgICAgICAgIDxpbWcgZGF0YS12aWRlbz1cIiR7aXRlbVt0aGlzLnBvc3RGaWVsZF1bdGhpcy5nYWxsZXJ5UG9zaXRpb25dLnZpZGVvU291cmNlfVwiIHNyYz1cIiR7aXRlbVt0aGlzLnBvc3RGaWVsZF1bdGhpcy5nYWxsZXJ5UG9zaXRpb25dLmltYWdlfVwiPlxyXG4gICAgICAgICAgICBgOyAgXHJcblxyXG4gICAgICAgICAgICB0aGlzLnZpZGVvU3JjID0gdGhpcy5jdXJyZW50TWVkaWEucXVlcnlTZWxlY3RvcignaW1nJykuZGF0YXNldC52aWRlby5yZXBsYWNlKCd3YXRjaD92PScsICdlbWJlZC8nKSArICc/YXV0b3BsYXk9MSc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBsYXlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGxheS1idXR0b24nKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMucGxheUJ1dHRvbil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKT0+dGhpcy5wbGF5VmlkZW8odGhpcy52aWRlb1NyYykpO1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LmFkZCgnYXNwZWN0LXJhdGlvJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5jbGFzc0xpc3QucmVtb3ZlKCdjZW50ZXItZGlzcGxheScpO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudE1lZGlhLmNsYXNzTGlzdC5yZW1vdmUoJ2FzcGVjdC1yYXRpbycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TWVkaWEuY2xhc3NMaXN0LmFkZCgnY2VudGVyLWRpc3BsYXknKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBvcHVsYXRlTWVkaWFDb2x1bW4oaXRlbSwgY29udGVudCl7XHJcbiAgICAgICAgICAgIHRoaXMubWVkaWFDb2x1bW4uaW5uZXJIVE1MID0gYFxyXG4gICAgICBcclxuICAgICAgICAgICAgICAgICAgICAke2NvbnRlbnQubWFwKGkgPT4gYFxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1wb3NpdGlvbj1cIiR7aXRlbVt0aGlzLnBvc3RGaWVsZF0uZmluZEluZGV4KGE9PntyZXR1cm4gYS5pZCA9PT0gaS5pZH0pfVwiICBjbGFzcz1cIm1lZGlhLXNlbGVjdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwibWVkaWEtdGh1bWJcIiBzcmM9XCIke2kuc2VsZWN0SW1hZ2V9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtZWRpYS1pbmZvcm1hdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+JHtpLnRpdGxlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPiR7aS5kZXNjcmlwdGlvbn08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYCkuam9pbignJyl9XHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWVkaWEtdGh1bWInKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMubmV3TG9hZCA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lZGlhVGh1bWJbMF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZWRpYS10aHVtYi5zZWxlY3RlZCcpLnBhcmVudE5vZGUuZGF0YXNldC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFNlbGVjdGlvbilcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iLmZvckVhY2godGh1bWI9PntcclxuICAgICAgICAgICAgICAgIHRodW1iLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZWRpYVRodW1iLmZvckVhY2goYz0+e2MuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKTt9KVxyXG4gICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZS50YXJnZXQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYWxsZXJ5UG9zaXRpb24gPSBlLnRhcmdldC5wYXJlbnROb2RlLmRhdGFzZXQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJDdXJyZW50TWVkaWEoaXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbiA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRTZWxlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgLy9hY3RpdmF0ZSB0aGUgc2VwZXJhdGUgZnVuY3Rpb24gdGhhdCBmaWxscyB0aGUgY3VycmVudE1kaWEgY29udGFpbmVyXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluc2VydFBhZ2luYXRpb24oaXRlbSwgZGF0YUNvdW50LCBwYWdlQ291bnQpe1xyXG4gICAgICAgICAgICB0aGlzLm1lZGlhUGFnaW5hdGlvbi5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICAke3RoaXMucG9zdFBhZ2VzLm1hcCgocGFnZSk9PmBcclxuICAgICAgICAgICAgICAgICAgICAke3RoaXMucG9zdFBhZ2VzLmxlbmd0aCA+IDEgPyBgPGEgY2xhc3M9XCJjb250ZW50LXBhZ2VcIiBkYXRhLXBhZ2U9XCIke2RhdGFDb3VudCsrfVwiPiAke3BhZ2VDb3VudCArPSAxfTwvYT5gIDogJyd9XHJcbiAgICAgICAgICAgICAgICBgKS5qb2luKCcnKX0gIFxyXG4gICAgICAgICAgICBgO1xyXG5cclxuICAgICAgICAgICAgaWYoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtcGFnZVtkYXRhLXBhZ2U9XCIwXCJdJykpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWVkaWEtcGFnaW5hdGlvbiAuY29udGVudC1wYWdlW2RhdGEtcGFnZT1cIjBcIl0nKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZmlyc3RQYWdlQnV0dG9uKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBjb250ZW50UGFnZU9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjbWVkaWEtcGFnaW5hdGlvbiAuY29udGVudC1wYWdlJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KGl0ZW0sIGNvbnRlbnRQYWdlT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5ld0xvYWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhZ2luYXRpb25GdW5jdGlvbmFsaXR5KGl0ZW0sIGNvbnRlbnRQYWdlT3B0aW9ucyl7XHJcbiAgICAgICAgICAgIGNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGFnZSA9IGUuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50U2VsZWN0aW9uKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlcyA9IHBhcnNlSW50KHNlbGVjdGVkUGFnZS5kYXRhc2V0LnBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuaW5pdGlhbE1lZGlhUG9wdWxhdGlvbihpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlTWVkaWFDb2x1bW4oaXRlbSwgdGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZXNdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pICBcclxuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wb3NpdGlvbj1cIiR7dGhpcy5jdXJyZW50U2VsZWN0aW9ufVwiXWApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke3RoaXMuY3VycmVudFNlbGVjdGlvbn1cIl1gKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcG9zaXRpb249XCIke3RoaXMuY3VycmVudFNlbGVjdGlvbn1cIl1gKS5jaGlsZHJlblswXS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pICAgIFxyXG5cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBjbG9zZU1lZGlhUmVjaWV2ZXIoKXtcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMubWVkaWFNZW51LmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVkaWFNZW51LnJlbW92ZUNoaWxkKHRoaXMubWVkaWFNZW51LmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5tZWRpYUNvbHVtbi5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lZGlhQ29sdW1uLnJlbW92ZUNoaWxkKHRoaXMubWVkaWFDb2x1bW4uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLmN1cnJlbnRNZWRpYS5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5yZW1vdmVDaGlsZCh0aGlzLmN1cnJlbnRNZWRpYS5maXJzdENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5tZWRpYVJlY2lldmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgICAgdGhpcy5pc01lZGlhUmVjaWV2ZXJPcGVuID0gZmFsc2U7IFxyXG4gICAgICAgICAgICB0aGlzLmh0bWwuY2xhc3NMaXN0LnJlbW92ZSgnZnJlZXplJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdhbGxlcnlQb3NpdGlvbiA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2VzID0gMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucG9zdEZpZWxkID0gJ2dhbGxlcnknO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uZXdMb2FkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAga2V5UHJlc3NEaXNwYXRjaGVyKGUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlLmtleUNvZGUsIHRoaXMuaXNNZWRpYVJlY2lldmVyT3BlbilcclxuICAgICAgICAgICAgaWYoZS5rZXlDb2RlID09PSAyNyAmJiB0aGlzLmlzTWVkaWFSZWNpZXZlck9wZW4pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1lZGlhUmVjaWV2ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheVZpZGVvKHZpZGVvU3JjKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codmlkZW9TcmMpXHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNZWRpYS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICAgICA8aWZyYW1lIGFsbG93ZnVsbHNjcmVlbj1cImFsbG93ZnVsbHNjcmVlblwiIHNyYz1cIiR7dmlkZW9TcmN9XCI+PC9pZnJhbWU+XHJcbiAgICAgICAgICAgIGA7XHJcbiAgICAgICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGFkb3dCb3g7IiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcclxuaW1wb3J0IFNoYWRvd0JveCBmcm9tICcuL3NoYWRvd0JveCc7XHJcbi8vVGhlIHNpbXBsaWNpdHkgb2YgdGhpcyBpcyBhIGNoYW5jZSB0byB0cnkgdG8gbWFrZSBteSBwYWdpbmF0aW9uIGNvZGUgYW5kIGNvZGUgaW4gZ2VuZXJhbCBjbGVhbmVyIGFuZCBtb3JlIGVmZmljaWVudFxyXG5jbGFzcyBSZWxhdGVkTmV3c3tcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3cy1yZWNpZXZlcicpO1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkhvbGRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwYWdpbmF0aW9uLWhvbGRlcicpO1xyXG4gICAgICAgIC8vaW50ZXJmZXJlcyB3aXRoIFNCLiBGaWd1cmUgb3V0IGhvdyB0byBwcmV2ZW50IG9uIHBhZ2VzIHdoZXJlIGludmFsaWQuXHJcbiAgICAgICAgLy9BbHNvIHdpdGggYWxsLW5ld3MgaWYgb25seSAxIHBhZ2VcclxuICAgICAgICB0aGlzLmN1cnJlbnRQb3N0SUQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkltYWdlQW5kU3RhdHMgaW1nJykuZGF0YXNldC5pZDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcclxuICAgICAgICB0aGlzLmNvbnRlbnRTaG93bjtcclxuICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucztcclxuICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50cygpe1xyXG4gICAgICAgIHRoaXMuZmV0Y2hSZWxhdGVkTmV3cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGZldGNoUmVsYXRlZE5ld3MoKXtcclxuICAgICAgICB0cnl7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHNpdGVEYXRhLnJvb3RfdXJsICsgJy93cC1qc29uL2NhaC92MS9tZWRpYT9yZWxhdGVkJyk7IFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgY29uc3QgYWxsTmV3cyA9IHJlc3VsdHMudXBkYXRlcy5jb25jYXQocmVzdWx0cy5uZXdzKTtcclxuICAgICAgICAgICAgY29uc3QgcmVsYXRlZE5ld3MgPSBbXTsgXHJcbiAgICAgICAgICAgIGxldCBsaW1pdCA9IDE7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YUNvdW50ID0gMDtcclxuICAgICAgICAgICAgbGV0IHBhZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIC8vT3JnYW5pemUgdGhlIG5ld3MgdGhhdCdzIHRocm93biBpbnRvIHJlbGF0ZWROZXdzLCBpbiBkYXRlIG9yZGVyXHJcbiAgICAgICAgICAgIC8vQ29uc2lkZXIgcGVyZm9ybWluZyB0aGUgZGF0ZSBvcmRlciBvbiBiYWNrZW5kLCB0aG91Z2ggY291bGQgYW5ub3lvbmcsIGdpdmVuIGxlc3MgcGhwIGV4cGVyaWVuY2UsIGJ1dCBjb3VsZCBiZSBiZW5lZmljaWFsIHRvIHByb2dyZXNzIG92ZXIgYWxsIFxyXG4gICAgICAgICAgICBpZighdGhpcy5jb250ZW50TG9hZGVkKXtcclxuICAgICAgICAgICAgICAgIGFsbE5ld3MuZm9yRWFjaChuZXdzID0+e1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld3MucmVsYXRpb25zaGlwcy5mb3JFYWNoKHI9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoci5JRCA9PT0gcGFyc2VJbnQodGhpcy5jdXJyZW50UG9zdElEKSAmJiBsaW1pdCA8PSAyKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0Kz0xXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGVkTmV3cy5wdXNoKG5ld3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICBpZihyZWxhdGVkTmV3cy5sZW5ndGgpeyAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFNob3duID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxhdGVkTmV3cykpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50U2hvd24gPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlUGFnaW5hdGlvbkhvbGRlcihkYXRhQ291bnQsIHBhZ2VDb3VudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVOZXdzUmVjaWV2ZXIoKTtcclxuXHJcbiAgIFxyXG4gICAgICAgIH1jYXRjaChlKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvcHVsYXRlTmV3c1JlY2lldmVyKCl7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0pXHJcbiAgICAgICAgdGhpcy5uZXdzUmVjaWV2ZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8aDQ+JHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS50aXRsZX08L2g0PlxyXG4gICAgICAgICAgICA8cD4ke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmNhcHRpb24gPyBgJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5jYXB0aW9ufSAtYCA6ICcnfSAke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmRhdGV9PC9wPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWVkaWEtY2FyZFwiPjxpbWcgZGF0YS1wb3N0PVwiJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5wb3N0VHlwZVBsdXJhbH1cIiBkYXRhLWlkPVwiJHt0aGlzLmNvbnRlbnRTaG93blt0aGlzLmN1cnJlbnRQYWdlXS5pZH1cIiBzcmM9XCIke3RoaXMuY29udGVudFNob3duW3RoaXMuY3VycmVudFBhZ2VdLmdhbGxlcnlbMF0uaW1hZ2V9XCI+PC9kaXY+XHJcbiAgICAgICAgICAgIDxwPiR7dGhpcy5jb250ZW50U2hvd25bdGhpcy5jdXJyZW50UGFnZV0uZnVsbERlc2NyaXB0aW9ufTwvcD5cclxuICAgICAgICBgO1xyXG4gIFxyXG4gICAgICAgIFNoYWRvd0JveC5wcm90b3R5cGUuZXZlbnRzKCk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coU2hhZG93Qm94LnByb3RvdHlwZS5tZWRpYUxpbmspXHJcbiAgICB9XHJcblxyXG4gICAgcG9wdWxhdGVQYWdpbmF0aW9uSG9sZGVyKGRhdGFDb3VudCwgcGFnZUNvdW50KXtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb25Ib2xkZXIuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAke3RoaXMuY29udGVudFNob3duLmxlbmd0aCA/ICc8ZGl2IGNsYXNzPVwiY29udGVudC1wYWdlc1wiPicgOiAnJ31cclxuICAgICAgICAgICAgICAgICR7dGhpcy5jb250ZW50U2hvd24ubWFwKChwYWdlKT0+YFxyXG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5jb250ZW50U2hvd24ubGVuZ3RoID4gMSA/IGA8YSBjbGFzcz1cImNvbnRlbnQtcGFnZVwiIGRhdGEtcGFnZT1cIiR7ZGF0YUNvdW50Kyt9XCI+ICR7cGFnZUNvdW50ICs9IDF9PC9hPmAgOiAnJ31cclxuICAgICAgICAgICAgICAgIGApLmpvaW4oJycpfSBcclxuICAgICAgICAgICAgJHt0aGlzLmNvbnRlbnRTaG93bi5sZW5ndGggPyAnPC9kaXY+JyA6ICcnfSBcclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICB0aGlzLmZpcnN0UGFnZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50LXBhZ2VbZGF0YS1wYWdlPVwiMFwiXScpO1xyXG5cclxuICAgICAgICBpZighdGhpcy5jb250ZW50TG9hZGVkKXtcclxuICAgICAgICAgICAgaWYodGhpcy5maXJzdFBhZ2VCdXR0b24pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFBhZ2VCdXR0b24uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWRQYWdlJyk7XHJcbiAgICAgICAgICAgIH0gICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb250ZW50LXBhZ2UnKTtcclxuICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uRnVuY3Rpb25hbGl0eSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcGFnaW5hdGlvbkZ1bmN0aW9uYWxpdHkoKXtcclxuICAgICAgICB0aGlzLmNvbnRlbnRQYWdlT3B0aW9ucy5mb3JFYWNoKGVsID0+IHtcclxuICAgICAgICAgICAgZWwub25jbGljayA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRQYWdlID0gZS5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYXJzZUludChzZWxlY3RlZFBhZ2UuZGF0YXNldC5wYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZldGNoUmVsYXRlZE5ld3MoKVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFBhZ2VPcHRpb25zLmZvckVhY2goaSA9PnsgXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSlcclxuICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5mb3JFYWNoKChuYW1lKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkUGFnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KSAgXHJcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZFBhZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlbGF0ZWROZXdzICIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvL0xvb2sgdXAgaG93IHRvIGJ1bmRsZSBzY3NzIGhlcmUgdXNpbmcgd2VicGFjayBhbmQgbWFrZSB0aGlzIGludG8gYW4gaW1wb3J0IGZpbGUoQWxzbyB1c2Ugc2VwZXJhdGUgZmlsZSBmb3IgZ2VuIGxvZ2ljLCBcclxuLy9zbyBjYW4gY29uZGl0aW9uYWwgdGhpcyBmb3IgZm9ybXMpXHJcbmltcG9ydCAnLi4vY3NzL3N0eWxlLmNzcyc7XHJcbmltcG9ydCAnLi4vY3NzL2RvdHMuY3NzJ1xyXG5cclxuaW1wb3J0IFNlYXJjaCBmcm9tICcuL21vZHVsZXMvc2VhcmNoJztcclxuaW1wb3J0IFBhZ2luYXRpb24gZnJvbSAnLi9tb2R1bGVzL3BhZ2luYXRpb24nO1xyXG5pbXBvcnQgTmV3cyBmcm9tICcuL21vZHVsZXMvYWxsLW5ld3MnO1xyXG5pbXBvcnQgUmVsYXRlZE5ld3MgZnJvbSAnLi9tb2R1bGVzL3NpbmdsZVBvc3QnO1xyXG5pbXBvcnQgU2hhZG93Qm94IGZyb20gJy4vbW9kdWxlcy9zaGFkb3dCb3gnO1xyXG5cclxuY29uc3Qgc2VhcmNoID0gbmV3IFNlYXJjaCgpO1xyXG5jb25zdCBwYWdpbmF0aW9uID0gbmV3IFBhZ2luYXRpb24oKTtcclxuY29uc3QgbmV3cyA9IG5ldyBOZXdzKCk7XHJcbmNvbnN0IHJlbGF0ZWROZXdzID0gbmV3IFJlbGF0ZWROZXdzKCk7XHJcbmNvbnN0IHNoYWRvd0JveCA9IG5ldyBTaGFkb3dCb3goKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=