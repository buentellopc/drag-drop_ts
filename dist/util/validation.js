"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
function validate(validators) {
    let isValid = true;
    if (validators.required) {
        isValid = isValid && validators.value.toString().length !== 0;
    }
    if (validators.minLength != null && typeof validators.value === "string") {
        isValid = isValid && validators.value.length >= validators.minLength;
    }
    if (validators.maxLength != null && typeof validators.value === "string") {
        isValid = isValid && validators.value.length <= validators.maxLength;
    }
    if (validators.min != null && typeof validators.value === "number") {
        isValid = isValid && validators.value >= validators.min;
    }
    if (validators.max != null && typeof validators.value === "number") {
        isValid = isValid && validators.value <= validators.max;
    }
    console.log(isValid);
    return isValid;
}
exports.validate = validate;
//# sourceMappingURL=validation.js.map