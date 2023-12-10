const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const userDto = require('../dto/user');
const UserDTO = require('../dto/user');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,25}$/;
const authController = {
    // User Register Method
    async register(req, res, next) {
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(20).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });
        const {error} = userRegisterSchema.validate(req.body);

        if (error) {
            return next(error);
        }
        const {username, name, email, password} = req.body;
        try {
            const emailInUse = await User.exists({email});
            const usernameInUse = await User.exists({username}); 

            if (emailInUse) {
                const error = {
                    status: 409,
                    message: "Email already registered, Use another email!"
                }
                return next(error);
            }

            if (usernameInUse) {
                const error = {
                    status: 409,
                    message: "USername not available, Choose another username!"
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const useToRegistered = new User({
            username,
            name,
            email,
            password: hashedPassword
        });
        const savedUser = await useToRegistered.save();
        const userDto = new UserDTO(savedUser);
        return res.status(201).json({user: userDto});
    },

    // User Login Method
    async login(req, res, next) {
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(20).required(),
            password: Joi.string().pattern(passwordPattern).required()
        });
        const {error} = userLoginSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const {username, password} = req.body;
        let userDetail;
        try {
            userDetail = await User.findOne({username: username});
            if (!userDetail) {
                const error = {
                    status: 401,
                    message: "Invalid username!"
                }
                return next(error);
            }

            const matchPasswords = await bcrypt.compare(password, userDetail.password);
            if (!matchPasswords) {
                const error = {
                    status: 401,
                    message: "Invalid password!"
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }
        const userDto = new UserDTO(userDetail);
        return res.status(200).json({user: userDto});
    }
}

module.exports = authController;