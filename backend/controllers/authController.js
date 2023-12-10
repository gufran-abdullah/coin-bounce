const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const UserDTO = require('../dto/user');
const JWTService = require('../services/JWTService');
const RefreshToken = require('../models/token');

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
        let accessToken;
        let refreshToken;
        let savedUser;
        try{
            const useToRegistered = new User({
                username,
                name,
                email,
                password: hashedPassword
            });
            savedUser = await useToRegistered.save();
            accessToken = JWTService.signAccessToken({_id: savedUser._id}, '30m');
            refreshToken = JWTService.signRefreshToken({_id: savedUser._id}, '60m');
        } catch (error) {
            return next(error);
        }
        await JWTService.storeRefreshToken(refreshToken, savedUser._id);
        res.cookie('accessToken', accessToken, {
            maxAge: 1000*60*60*24,
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000*60*60*24,
            httpOnly: true
        });
        const userDto = new UserDTO(savedUser);
        return res.status(201).json({user: userDto, auth: true});
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
        const accessToken = JWTService.signAccessToken({_id: userDetail._id}, '30m');
        const refreshToken = JWTService.signRefreshToken({_id: userDetail._id}, '60m');
        try{
            await RefreshToken.updateOne(
                {
                    _id: userDetail._id
                },
                {
                    token: refreshToken
                },
                {
                    upsert: true
                }
            );
        } catch (error) {
            return next(error);
        }
        res.cookie('accessToken', accessToken, {
            maxAge: 1000*60*60*24,
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000*60*60*24,
            httpOnly: true
        });
        const userDto = new UserDTO(userDetail);
        return res.status(200).json({user: userDto, auth: true});
    },

    //  User Logout Method
    async logout(req, res, next) {
        const {refreshToken} = req.cookies;
        try {
            await RefreshToken.deleteOne({token: refreshToken});
        } catch (error) {
            return next(error);
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({user: null, auth: false});
    },

    // User Refresh Method
    async refresh(req, res, next) {
         const originalRefreshToken = req.cookies.refreshToken;
         let id;
         try {
            id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
         } catch (e) {
            const error = {
                status: 401,
                message: 'Unauthorized'
            }
            return next(error);
         }
        
         try {
            const match = await RefreshToken.findOne({_id: id, token: originalRefreshToken});
            if (!match) {
                const error = {
                    status: 401,
                    message: 'Unauthorized'
                }
                return next(error);
            }
         } catch (error) {
            return next(error);
         }

         try {
            const accessToken = JWTService.signAccessToken({_id: id}, '30min');
            const refreshToken = JWTService.signRefreshToken({_id: id}, '60m');
            await RefreshToken.updateOne({_id:id}, {token:refreshToken});
            res.cookie('accessToken', accessToken, {
                maxAge: 1000*60*60*24,
                httpOnly: true
            });
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000*60*60*24,
                httpOnly: true
            });
         } catch (error) {
            return next(error);
         }
         const user = await User.findOne({_id: id});
         const userDto = new UserDTO(user);
         return res.status(200).json({user: userDto, auth: true});
    }
}

module.exports = authController;