export default function autobind(_target, _methodName, descriptor) {
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
//# sourceMappingURL=autobind.js.map