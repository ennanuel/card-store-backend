const cryptoJS = require('crypto-js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const MAX_AGE = 3 * 24 * 60 * 60;
const OVERLOOK_VALUES = ['middle', 'last', 'account_number', 'bank', 'phone', 'address', 'dob'];
const ACCEPTABLE_VALUES = ['username', 'first', 'middle', 'last', 'image', 'prevImage', 'email', 'password', 'isAdmin', 'profilePic', 'phone', 'address', 'dob', 'bank', 'account_number'];

function checkRegisterValues(values) {
    const valuesEntries = Object.entries(values);
    if (valuesEntries.length < 1) return { failed: true, message: "Please Input Values" };
    for (let [key, value] of valuesEntries) {
        if (OVERLOOK_VALUES.includes(value)) continue;
        if (!ACCEPTABLE_VALUES.includes) return getFailMesssage(`${key} is not a valid field`, key);
        if (!value || value?.length < 1) return getFailMesssage(`${key} cannot be empty`, key);
    }
    const { confirm_password, password } = values;
    const passwordCheck = checkRegisterPassword(password, confirm_password);
    if (passwordCheck.failed) return { passwordCheck };
    return { failed: false, message: '', field: '' };
}

function checkLoginPassword(password, hashedPassword) {
    if (!password || password?.length < 1) return getFailMesssage('Password is empty', 'password');
    const unhashedPassword = unhashPassword(hashedPassword);
    return password === unhashedPassword;
}

function checkRegisterPassword(password, confirm_password) {
    if (password !== confirm_password) return getFailMesssage('Passwords don\'t match', 'password');
    if (!/[a-z]/.test(password)) return getFailMesssage('Password must contain at least one lowercase letter', 'password');
    if (!/[A-Z]/.test(password)) return getFailMesssage('Password must contain at least one uppercase letter', 'password');
    if (!/\d/.test(password)) return getFailMesssage('Password must contain at least one number', 'password');
    if (!/\W/.test(password)) return getFailMesssage('Password must contain at least one special character', 'password');
    return { failed: false, message: '' }
}

function createToken({ _id, isAdmin }) {
    const token = jwt.sign({ id: _id, isAdmin }, process.env.JWT_SEC_KEY, { expiresIn: MAX_AGE });
    const options = { httpOnly: true, secure: false, maxAge: MAX_AGE * 1000};
    return { token, options };
}

function hashPassword(password) {
    const hashedPassword = cryptoJS.AES.encrypt(password, process.env.CJS_PASS).toString();
    return hashedPassword;
}

function unhashPassword(hashedPassword) {
    const decryptedPassword = cryptoJS.AES.decrypt(hashedPassword, process.env.CJS_PASS);
    const unhashedPassword = decryptedPassword.toString(cryptoJS.enc.Utf8);
    return unhashedPassword;
}

function getFailMesssage(message, field) {
    return { failed: true, message, field };
}

module.exports = { 
    hashPassword,
    checkRegisterValues,
    checkLoginPassword,
    createToken
}