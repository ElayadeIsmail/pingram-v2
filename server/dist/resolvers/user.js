"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = exports.FollowResponse = exports.ProfileResponse = exports.ProfileUser = exports.UserCount = exports.UserResponse = exports.FieldError = void 0;
const argon2 = __importStar(require("argon2"));
const type_graphql_1 = require("type-graphql");
const uuid_1 = require("uuid");
const constants_1 = require("../constants");
const isAuth_1 = require("../middlewares/isAuth");
const models_1 = require("../models");
const sendEmail_1 = require("../utils/sendEmail");
const user_types_1 = require("../utils/user-types");
const validate_register_1 = require("../utils/validate-register");
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
exports.FieldError = FieldError;
let ProfileInput = class ProfileInput {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], ProfileInput.prototype, "bio", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], ProfileInput.prototype, "avatar", void 0);
ProfileInput = __decorate([
    type_graphql_1.InputType()
], ProfileInput);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => models_1.User, { nullable: true }),
    __metadata("design:type", models_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
exports.UserResponse = UserResponse;
let UserCount = class UserCount {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], UserCount.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], UserCount.prototype, "follower_followers_followerIdTousers", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], UserCount.prototype, "follower_followers_leaderIdTousers", void 0);
UserCount = __decorate([
    type_graphql_1.ObjectType()
], UserCount);
exports.UserCount = UserCount;
let ProfileUser = class ProfileUser extends models_1.User {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", UserCount)
], ProfileUser.prototype, "_count", void 0);
ProfileUser = __decorate([
    type_graphql_1.ObjectType()
], ProfileUser);
exports.ProfileUser = ProfileUser;
let ProfileResponse = class ProfileResponse {
};
__decorate([
    type_graphql_1.Field(() => ProfileUser, { nullable: true }),
    __metadata("design:type", ProfileUser)
], ProfileResponse.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    __metadata("design:type", Boolean)
], ProfileResponse.prototype, "isCurrentUserProfile", void 0);
ProfileResponse = __decorate([
    type_graphql_1.ObjectType()
], ProfileResponse);
exports.ProfileResponse = ProfileResponse;
let FollowResponse = class FollowResponse {
};
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], FollowResponse.prototype, "status", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    __metadata("design:type", Boolean)
], FollowResponse.prototype, "follow", void 0);
FollowResponse = __decorate([
    type_graphql_1.ObjectType()
], FollowResponse);
exports.FollowResponse = FollowResponse;
let UserResolver = class UserResolver {
    login(email, password, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return { errors: [{ field: 'email', message: 'Invalid Credentials' }] };
            }
            const isPasswordMatch = yield argon2.verify(user.password, password);
            if (!isPasswordMatch) {
                return { errors: [{ field: 'email', message: 'Invalid Credentials' }] };
            }
            req.session.userId = user.id;
            return { user };
        });
    }
    register(options, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = validate_register_1.validateRegister(options);
            if (errors) {
                return { errors };
            }
            const hashedPassword = yield argon2.hash(options.password);
            let user;
            try {
                user = yield prisma.user.create({
                    data: {
                        username: options.username,
                        email: options.email,
                        password: hashedPassword,
                    },
                });
            }
            catch (err) {
                if (err.code === 'P2002') {
                    return {
                        errors: [
                            {
                                field: err.meta.target[0],
                                message: `${err.meta.target[0]} already taken`,
                            },
                        ],
                    };
                }
                console.log('message:', err);
            }
            req.session.userId = user === null || user === void 0 ? void 0 : user.id;
            return { user };
        });
    }
    updateProfile(options, { req, prisma }) {
        return prisma.user.update({
            where: {
                id: req.session.userId,
            },
            data: Object.assign({}, options),
        });
    }
    handleFollow(leaderId, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (leaderId === req.session.userId) {
                return false;
            }
            const alreadyFollow = yield prisma.follower.findUnique({
                where: {
                    follower_leaderId_followerId_key: {
                        followerId: req.session.userId,
                        leaderId,
                    },
                },
            });
            if (alreadyFollow) {
                yield prisma.follower.delete({
                    where: {
                        follower_leaderId_followerId_key: {
                            followerId: req.session.userId,
                            leaderId,
                        },
                    },
                });
                return true;
            }
            yield prisma.follower.create({
                data: {
                    followerId: req.session.userId,
                    leaderId,
                },
            });
            return true;
        });
    }
    me({ req, prisma }) {
        if (!req.session.userId) {
            return null;
        }
        return prisma.user.findUnique({
            where: {
                id: req.session.userId,
            },
        });
    }
    searchUsers(searchTerm, limit, { prisma }) {
        let take = limit || 5;
        return prisma.user.findMany({
            where: {
                username: {
                    contains: searchTerm,
                },
            },
            take,
            select: {
                id: true,
                username: true,
                avatar: true,
            },
        });
    }
    profile(id, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = (yield prisma.user.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    bio: true,
                    createdAt: true,
                    follower_followers_leaderIdTousers: {
                        where: {
                            followerId: req.session.userId,
                            leaderId: id,
                        },
                    },
                    _count: {
                        select: {
                            posts: true,
                            follower_followers_followerIdTousers: true,
                            follower_followers_leaderIdTousers: true,
                        },
                    },
                },
            }));
            return { user, isCurrentUserProfile: id === req.session.userId };
        });
    }
    forgotPassword(email, { redis, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: {
                    email,
                },
            });
            if (!user) {
                return true;
            }
            const token = uuid_1.v4();
            yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3);
            yield sendEmail_1.sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`);
            return true;
        });
    }
    changePassword(newPassword, token, { prisma, redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword.length < 6) {
                return {
                    errors: [
                        {
                            field: 'newPassword',
                            message: 'length must be greater than 5',
                        },
                    ],
                };
            }
            const key = constants_1.FORGET_PASSWORD_PREFIX + token;
            const userId = yield redis.get(key);
            if (!userId) {
                return {
                    errors: [
                        {
                            field: 'token',
                            message: 'Token has expired',
                        },
                    ],
                };
            }
            const userIdNum = parseInt(userId);
            const user = yield prisma.user.findUnique({
                where: {
                    id: userIdNum,
                },
            });
            if (!user) {
                return {
                    errors: [
                        {
                            field: 'token',
                            message: 'User has no longer Exist',
                        },
                    ],
                };
            }
            yield prisma.user.update({
                where: {
                    id: userIdNum,
                },
                data: {
                    password: yield argon2.hash(newPassword),
                },
            });
            yield redis.del(key);
            req.session.userId = user.id;
            return { user };
        });
    }
    deleteAccount({ req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.session.userId;
            const userPosts = yield prisma.post.findMany({
                where: {
                    userId,
                },
                select: {
                    id: true,
                },
            });
            const deletePostsComments = prisma.comment.deleteMany({
                where: {
                    postId: {
                        in: userPosts.map((post) => post.id),
                    },
                },
            });
            const deleteUserData = prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    comments: {
                        deleteMany: {
                            OR: [
                                {
                                    userId,
                                },
                                {
                                    postId: {
                                        in: userPosts.map((post) => post.id),
                                    },
                                },
                            ],
                        },
                    },
                    follower_followers_followerIdTousers: { deleteMany: {} },
                    follower_followers_leaderIdTousers: { deleteMany: {} },
                    likes: { deleteMany: {} },
                    posts: { deleteMany: {} },
                },
            });
            const deleteUser = prisma.user.delete({
                where: {
                    id: userId,
                },
            });
            yield prisma.$transaction([
                deletePostsComments,
                deleteUserData,
                deleteUser,
            ]);
            return true;
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                res.clearCookie(constants_1.COOKIE_NAME);
                if (err) {
                    console.log('logout Err:', err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('email')),
    __param(1, type_graphql_1.Arg('password')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('options')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_types_1.RegisterInputs, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => models_1.User),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('options')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProfileInput, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "updateProfile", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('leaderId', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "handleFollow", null);
__decorate([
    type_graphql_1.Query(() => models_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Query(() => [models_1.User], { nullable: true }),
    __param(0, type_graphql_1.Arg('searchTerm')),
    __param(1, type_graphql_1.Arg('limit', () => type_graphql_1.Int, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "searchUsers", null);
__decorate([
    type_graphql_1.Query(() => ProfileResponse),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "profile", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg('email')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('newPassword')),
    __param(1, type_graphql_1.Arg('token')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteAccount", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map