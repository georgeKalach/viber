/*
@author DB
@class response-handler
@desc ExpressJS middleware for response request handler for RESt API
*/
module.exports = function (req, res, next) {
    req.reqBody = req.body.reqData || {};
    req.reqHeaders = req.body.header || {};
    req.authorization_token = req.headers.authorization?req.headers.authorization.split(' ').pop():undefined;
    res.filterByPermission = function (resource,obj,mode) {
        for (var key in obj){
            if (typeof obj[key] !== 'object'){
                if (req.access_permissions[resource][key]&&!req.access_permissions[resource][key][mode]){
                    obj[key]=undefined;
                }
            }
        }
    }
    if (req.reqHeaders && req.reqHeaders.deviceInfo) {
        req.reqHeaders.deviceInfo.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }
    res.sendData = function (data) {
        var resData = {
            'header': this.req.body.header || {},
            'result': {
                'status': true,
                'message': 'Transaction completed successfully'
            },
            'responseData': data,
            'errors': null
        };
        res.status(200).send(resData);
    };
    res.errors = [];
    res.errorList = require('../messages/error-list.json');
    
    res.getErrorObj = function (code, field, customMessage,vals) {
        var error = {
            code: code || 'ERR000',
            message: customMessage || 'Unknown error',
            field: field || 'common'
        };
        if (!customMessage && this.errorList[code]) {
            error.message = (error.code == 'ERR001' ? error.field + ' ' : '') + this.errorList[code];
        }
        if (vals) {
            for (var key in vals) {
                if (typeof vals[key]!=undefined) {
                    error.message = error.message.replace(new RegExp('{' + key + '}', 'g'), vals[key]);
                }
            }
        }
        return error;
    };
    res.addErrorByCode = function (code, field, customMessage,vals) {
        res.errors.push(this.getErrorObj(code, field, customMessage,vals));
    };
    res.addErrorByObj = function (err) {
        res.errors.push(this.getErrorObj(err ? err.code : '', null, err ? err.errmsg || err.message : '',err.params));
    };
    res.addError = function (code, field, customMessage,vals) {
        res.errors.push(this.getErrorObj(code, field, customMessage,vals));
    };
    res.sendError = function (err,field,message) {
        if (typeof err == 'string') {
            res.addErrorByCode(err,field,message);
        } else if (err){
            res.addErrorByObj(err,field,message);
        }
        var resData = {
            'header': this.req.body.header,
            'result': {
                'status': false,
                'message': 'Transaction failed'
            },
            'responseData': null,
            'errors': res.errors
        };
        res.status(200).send(resData);
    };
    res.sendMessage = function (msgCode) {
        var msg = res.errorList[msgCode] || 'Define message';
        var resData = {
            'header': this.req.body.header || {},
            'result': {
                'status': true,
                'message': 'Transaction completed successfully'
            },
            'responseData': { message:msg },
            'errors': null
        };
        res.status(200).send(resData);
    };
    next();
}
