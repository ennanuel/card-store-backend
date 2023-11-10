const User = require('../models/User');
const { checkRegisterValues, checkLoginPassword, createToken } = require('../utils/auth');
const errorHandler = require('../utils/error');

async function register(req, res) { 
    try {
        const { body } = req;
        const { failed, message, field } = checkRegisterValues(body);
        if (failed) return res.status(401).json({ message, field });
        const { first, middle, last, ...otherValues } = body;
        const user = { names: { first, middle, last }, ...otherValues };
        const newUser = new User(user);
        await newUser.save();
        return res.status(200).json({ message: 'new account created' });
    } catch (err) {
        const error = errorHandler(err);
        return res.status(500).json(error);
    }
};

async function login(req, res) { 
    try {
        const { username, password } = req.body;
        const foundUser = await User.findOne({ $or: [{ username }, { email: username }] }, { password: 1, _id: 2, isAdmin: 3 });
        if (!foundUser) return res.status(403).json({ message: 'No user found' });
        const { password: hashedPassword } = foundUser;
        const correctPassword = checkLoginPassword(password, hashedPassword);
        if (!correctPassword) return res.status(403).json({ message: 'Incorrect Password' });
        const { token, options } = createToken(foundUser);
        res.cookie('userToken', token, options);
        return res.status(200).json({ message: 'login successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

async function logout(req, res) { };

async function authenticate(req, res) { 
    try {
        const { id } = req.user;
        const user = await User.findById(id, { _id: 1, names: 2, profilePic: 3, isAdmin: 4 });
        if (!user?._id) throw new Error('No user found'); 
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(403).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    authenticate
}