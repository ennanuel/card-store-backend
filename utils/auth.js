const cryptoJS = require('crypto-js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const MAX_AGE = 259200;
const OVERLOOK_VALUES = ['middle', 'last', 'account_number', 'bank', 'phone', 'address', 'dob', 'confirm_password', '_id', 'notification', 'createdAt', 'updatedAt'];
const ACCEPTABLE_VALUES = ['username', 'first', 'middle', 'last', 'image', 'prevImage', 'email', 'password', 'profilePic', 'phone', 'address', 'dob', 'bank', 'account_number'];

function checkRegisterValues(values) {
    const valuesEntries = Object.entries(values);
    if (valuesEntries.length < 1) return { failed: true, message: "Please Input Values" };
    for (let [key, value] of valuesEntries) {
        if (OVERLOOK_VALUES.includes(key)) continue;
        if (!ACCEPTABLE_VALUES.includes(key)) return getFailMesssage(`${key.replace(/\W/g, ' ')} is not a valid field`, key);
        if (!value || value?.length < 1) return getFailMesssage(`${key} cannot be empty`, key);
    }
    const { password, confirm_password, dob } = values;
    const dateOfBirthCheck = checkDateOfBirth(dob);
    if (dateOfBirthCheck.failed) return dateOfBirthCheck;
    const passwordCheck = checkRegisterPassword(password, confirm_password);
    if (passwordCheck.failed) return passwordCheck;
    return { failed: false, message: '', field: '' };
}

function checkEditValues(values) {
    const valuesEntries = Object.entries(values);
    if (valuesEntries.length < 1) return { failed: true, message: "Please Input Values" };
    for (let [key, value] of valuesEntries) {
        if (OVERLOOK_VALUES.includes(key)) continue;
        if (!ACCEPTABLE_VALUES.includes(key)) return getFailMesssage(`${key.replace(/\W/g, ' ')} is not a valid field`, key);
        if (!value || value?.length < 1) return getFailMesssage(`${key} cannot be empty`, key);
    }
    return checkDateOfBirth(values.dob);
}

function checkLoginPassword(password, hashedPassword) {
    if (!password || password?.length < 1) return getFailMesssage('Password is empty', 'password');
    const unhashedPassword = unhashPassword(hashedPassword);
    return password === unhashedPassword;
}

function checkDateOfBirth(date) {
    if (!date) return { failed: false, message: '' };
    const dateOfBirth = new Date(date);
    const currentDate = new Date();
    const yearsPassed = currentDate.getFullYear() - dateOfBirth.getFullYear();
    if (yearsPassed < 16) return getFailMesssage('Please use a valid Date of Birth (Above sixteen years)', 'dob');
    return { failed: false, message: '' };
}

function checkRegisterPassword(password, confirm_password) {
    if (password !== confirm_password) return getFailMesssage('Passwords don\'t match', 'confirm_password');
    if (!/[a-z]/.test(password)) return getFailMesssage('Password must contain at least one lowercase letter', 'password');
    if (!/[A-Z]/.test(password)) return getFailMesssage('Password must contain at least one uppercase letter', 'password');
    if (!/\d/.test(password)) return getFailMesssage('Password must contain at least one number', 'password');
    if (!/\W/.test(password)) return getFailMesssage('Password must contain at least one special character', 'password');
    return { failed: false, message: '' }
}

function createToken({ _id, isAdmin }) {
    const token = jwt.sign({ id: _id, isAdmin }, process.env.JWT_SEC_KEY, { expiresIn: MAX_AGE });
    const options = { httpOnly: true, secure: true, sameSite: 'none', maxAge: MAX_AGE * 1000};
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
    unhashPassword,
    checkRegisterValues,
    checkEditValues,
    checkLoginPassword,
    createToken,
    MAX_AGE
}