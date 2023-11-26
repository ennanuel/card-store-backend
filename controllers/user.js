const Player = require("../models/Player");
const User = require('../models/User');
const { deleteImage, prepareDeleteImages } = require("../utils/file");

async function updateUserInfo(req, res) {
    try {
        const { user_id } = req.params;
        const { profilePic, prevProfilePic, isDemo, isAdmin, notification, password, first, middle, last, ...user } = req.body;
        if (!profilePic) user.profilePic = prevProfilePic;
        else await deleteImage(`profile/${prevProfilePic}`);
        user.profilePic = profilePic;
        user.names = { first, middle, last };
        const updatedUser = await User.findByIdAndUpdate(user_id, { $set: user });
        if (!updatedUser) throw new Error('User could not be updated');
        return res.status(200).json({ message: 'User Updated' })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

async function getUserInfo(req, res) {
    try {
        const { user_id } = req.params;
        const user = await User.findById(user_id, 'names username dob bank profilePic account_number phone email');
        if (!user) throw new Error('No user found');
        return res.status(200).json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

async function getAllUsers(req, res) {
    const { page = 0, limit = 5 } = req.query;
    const skip = page * limit;
    try {
        const users = await User.find({}, { password: 0 })
            .sort({ 'names.first': -1 })
            .skip(skip)
            .limit(limit);
        const totalUsers = await User.count();
        const pages = Math.ceil(totalUsers / limit);
        return res.status(200).json({ users, page, pages });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}; 

async function deleteUser(req, res) {
    try {
        const { user_id } = req.params;
        const deletedUser = await User.findByIdAndDelete(user_id, { profilePic: 1 });
        if (!deletedUser) throw new Error('User could not be deleted');
        const deletedCards = await Player.findAndDelete({ owner: user_id }, { image: 1 });
        const deleteProfilePic = deleteImage(`profile/${deletedUser._doc.profilePic}`);
        const imagesToDelete = deletedCards.map(prepareDeleteImages);
        await Promise.all([...imagesToDelete, deleteProfilePic]);
        return res.status(200).json({ message: 'User has been deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    updateUserInfo,
    getUserInfo,
    getAllUsers,
    deleteUser
}