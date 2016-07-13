var xBrowserSync = xBrowserSync || {};
xBrowserSync.API = xBrowserSync.API || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.API.Recaptcha 
 * Description: Manages Google reCAPTCHA interactions.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.API.Recaptcha = function() {
    'use strict';
    
    var Q = require('q');
    var request = require('request');
    var restify = require('restify');
    var global = require('./global.js');
    var config = require('./config.js');
    
    var checkResponse = function(recaptchaResponse) {
        var deferred = Q.defer();
        var failedErr = new restify.InvalidArgumentError('reCAPTCHA failed.');

        request({
            uri: global.recaptcha.verificationApiUri,
            method: 'POST',
            form: {
                secret: config.recaptcha.secretKey,
                response: recaptchaResponse
            }}, 
            function (err, res, body) {
                if (!!err || res.statusCode !== 200) {
                    deferred.reject(failedErr);
                }

                var data = JSON.parse(body);

                if (!data.success) {
                    deferred.reject(failedErr);
                }

                deferred.resolve();
            })

        return deferred.promise; 
    };

    var isEnabled = function() {
        return config.recaptcha.enabled;
    };
    
    return {
        checkResponse: checkResponse,
        enabled: isEnabled
    };
};

module.exports = xBrowserSync.API.Recaptcha();