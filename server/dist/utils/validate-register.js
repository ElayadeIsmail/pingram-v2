"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
const validateRegister = (options) => {
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'length must be greater than 2',
            },
        ];
    }
    if (!emailIsValid(options.email)) {
        return [
            {
                field: 'email',
                message: 'Email must be valid',
            },
        ];
    }
    if (options.password.length < 6) {
        return [
            {
                field: 'password',
                message: 'length must be greater than 5',
            },
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validate-register.js.map