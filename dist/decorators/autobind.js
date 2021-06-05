"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autobind = void 0;
function autobind(_target, _methodName, descriptor) {
    const originalMethod = descriptor.value;
    console.log(originalMethod);
    const adjustedDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjustedDescriptor;
}
exports.autobind = autobind;
//# sourceMappingURL=autobind.js.map