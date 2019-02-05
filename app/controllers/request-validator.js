/*
@author DB
@class request-validator
@desc ExpressJS middleware for validating RESt API request
*/
module.exports = function (req, res, next) {
    req.validate=function (requiredFields, reqData, alternate) {
        var TRA=function (a,b) {
            return b;
        };
        var _this = this;
        var reqData = reqData || _this.body.reqData || {};
        var isValid = true;
        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i];
            var requiredType = field.type.toString().trim().toUpperCase();
            var value = null;
            if (reqData[field.field] == null) {
                value = '';
            } else {
                value = reqData[field.field];
            }
            var actualType = (typeof reqData[field.field]).toString().toUpperCase();
            field.isRequired=field.isRequiredIf&&typeof field.isRequiredIf=='function'?field.isRequiredIf(value):field.isRequired;
            if (field.isRequired && (actualType == 'UNDEFINED' || value.toString().trim() == '')) {
                if (field.alternate) {
                    isValid = _this.validate(Array.isArray(field.alternate) ? field.alternate : [field.alternate], null, field);
                } else {
                    res.addError('ERR001', alternate ? field.field + ' or ' + alternate.field : field.field);
                    isValid = false;
                }
            }
            if (field.min && value.toString().trim().length < field.min && actualType != 'UNDEFINED') {
                res.addError('ERR002', field.field, 'Value is too small, required length is {val}', {
                    val: field.min
                });
                isValid = false;
            }
            if (field.max && value.toString().trim().length > field.max && actualType != 'UNDEFINED') {
                res.addError('ERR003', field.field, 'Value is to large, required maximum length is {val}', {
                    val: field.max
                });
                isValid = false;
            }
            switch (requiredType) {
                case "CUSTOM":
                    var err={};
                    if(!field.validate(value,err)){
                        res.addError(err.code, field.field, err.message, err.params);
                        isValid = false;
                    }
                    break;
                case "AMOUNT":
                    if (isNaN(value) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    if(!isNaN(value)){
                        var valParts=value.toString().split('.');
                        if(valParts.length>1){
                            if(valParts[1].length>2){
                                res.addError('ERR005', field.field, "Amount is not accepted", {
                                    type: requiredType.toLowerCase()
                                });
                                isValid = false;
                            }
                        }
                    }
                    break;
                case "NUMBER":
                    if (isNaN(value) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    break;
                case "STRING":
                    if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of  {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    break;
                case "PASSWORD":
                    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
                    if (!re.test(value) && actualType != 'UNDEFINED') {
                        //if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Password must have minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    break;
                case "EMAIL":
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (!re.test(value) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of  {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    break;
                case "MOBILE":
                    value=value || '';
                    var p=value.toString().split('-');
                    if (!(p.length==2 && value.indexOf('-')>=1 && value.indexOf('-')<=(value.length-2)) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of  {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    break;
                case "DATE":
                case "DATETIME":
                    if (value && isNaN(new Date(Number(value)).getTime())) {
                        res.addError('ERR004', field.field, "Field must be type of  {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    break;
                case "ENUM":
                    if (field.isRequired && field.enumValues && field.enumValues.indexOf(value) < 0) {
                        res.addError('ERR004', field.field, "Value of field must be in {val}", {
                            val: field.enumValues.join(', ')
                        });
                        isValid = false;
                    }
                    break;
                case "FREEOBJECT":
                    if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of {val}", {
                            val: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                case "OBJECT":
                    if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of  {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    } else {
                        if (!_this.validate(field.items, value))
                            isValid = false;
                    }
                    break;
                case "OBJECTARRAY":
                    actualType=actualType+(Array.isArray(value)?'ARRAY':'');
                    if (actualType != requiredType && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    } else {
                        if (!_this.validate(field.items, value[0]) && value && value.length){
                            res.addError('ERR004', field.field, "Field must be type of {type}", {
                                type: requiredType.toLowerCase()
                            });
                            isValid = false;
                        }

                    }
                    break;
                case "ARRAY":
                    if (!Array.isArray(value) && actualType != 'UNDEFINED') {
                        res.addError('ERR004', field.field, "Field must be type of {type}", {
                            type: requiredType.toLowerCase()
                        });
                        isValid = false;
                    }
                    break;
            }
        }
        return isValid;
    };
    next();
}
