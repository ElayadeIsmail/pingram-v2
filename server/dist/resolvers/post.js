"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.PostResolver = exports.PaginatedPosts = exports.PostResponse = exports.PostCount = void 0;
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middlewares/isAuth");
const models_1 = require("../models");
let PostInput = class PostInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "url", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PostInput.prototype, "caption", void 0);
PostInput = __decorate([
    type_graphql_1.InputType()
], PostInput);
let PostCount = class PostCount {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], PostCount.prototype, "likes", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], PostCount.prototype, "comments", void 0);
PostCount = __decorate([
    type_graphql_1.ObjectType()
], PostCount);
exports.PostCount = PostCount;
let PostResponse = class PostResponse extends models_1.Post {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", PostCount)
], PostResponse.prototype, "_count", void 0);
PostResponse = __decorate([
    type_graphql_1.ObjectType()
], PostResponse);
exports.PostResponse = PostResponse;
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    type_graphql_1.Field(() => [PostResponse]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    type_graphql_1.ObjectType()
], PaginatedPosts);
exports.PaginatedPosts = PaginatedPosts;
let PostResolver = class PostResolver {
    createPost(inputs, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield prisma.post.create({
                data: Object.assign(Object.assign({}, inputs), { userId: req.session.userId }),
                include: {
                    likes: {
                        where: {
                            userId: req.session.userId,
                        },
                        select: {
                            createdAt: true,
                            postId: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                        },
                    },
                },
            });
            return post;
        });
    }
    post(id, { prisma }) {
        return prisma.post.findUnique({
            where: {
                id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
        });
    }
    posts(limit, userId, cursor, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(limit, 48);
            const limitPlusOne = realLimit + 1;
            if (!cursor) {
                if (userId) {
                    const posts = (yield prisma.post.findMany({
                        take: limitPlusOne,
                        where: {
                            userId,
                        },
                        include: {
                            likes: {
                                where: {
                                    userId: req.session.userId,
                                },
                                select: {
                                    createdAt: true,
                                    postId: true,
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                            _count: {
                                select: {
                                    comments: true,
                                    likes: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    }));
                    return {
                        posts: posts.slice(0, realLimit),
                        hasMore: posts.length === limitPlusOne,
                    };
                }
                else {
                    const posts = (yield prisma.post.findMany({
                        take: limitPlusOne,
                        include: {
                            likes: {
                                where: {
                                    userId: req.session.userId,
                                },
                                select: {
                                    createdAt: true,
                                    postId: true,
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                            _count: {
                                select: {
                                    comments: true,
                                    likes: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    }));
                    return {
                        posts: posts.slice(0, realLimit),
                        hasMore: posts.length === limitPlusOne,
                    };
                }
            }
            else {
                if (userId) {
                    const posts = (yield prisma.post.findMany({
                        take: limitPlusOne,
                        skip: 1,
                        where: {
                            userId,
                        },
                        cursor: {
                            createdAt: cursor,
                        },
                        include: {
                            likes: {
                                where: {
                                    userId: req.session.userId,
                                },
                                select: {
                                    createdAt: true,
                                    postId: true,
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                            _count: {
                                select: {
                                    comments: true,
                                    likes: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    }));
                    return {
                        posts: posts.slice(0, realLimit),
                        hasMore: posts.length === limitPlusOne,
                    };
                }
                else {
                    const posts = (yield prisma.post.findMany({
                        take: limitPlusOne,
                        skip: 1,
                        cursor: {
                            createdAt: cursor,
                        },
                        include: {
                            likes: {
                                where: {
                                    userId: req.session.userId,
                                },
                                select: {
                                    createdAt: true,
                                    postId: true,
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                            _count: {
                                select: {
                                    comments: true,
                                    likes: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    }));
                    return {
                        posts: posts.slice(0, realLimit),
                        hasMore: posts.length === limitPlusOne,
                    };
                }
            }
        });
    }
    handleLike(postId, commentId, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const alreadyLiked = yield prisma.like.findFirst({
                where: {
                    postId,
                    userId: req.session.userId,
                    commentId,
                },
            });
            if (alreadyLiked) {
                yield prisma.like.delete({
                    where: {
                        id: alreadyLiked.id,
                    },
                });
                return true;
            }
            yield prisma.like.create({
                data: {
                    userId: req.session.userId,
                    commentId,
                    postId,
                },
            });
            return true;
        });
    }
    updatePost(id, url, caption, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield prisma.post.findUnique({
                where: {
                    id,
                },
            });
            if ((post === null || post === void 0 ? void 0 : post.userId) !== req.session.userId) {
                throw new Error('Not Authorized');
            }
            return prisma.post.update({
                where: { id },
                data: {
                    url,
                    caption,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
            });
        });
    }
    deletePost(id, { req, prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield prisma.post.findUnique({
                where: {
                    id,
                },
            });
            if ((post === null || post === void 0 ? void 0 : post.userId) !== req.session.userId) {
                throw new Error('Not Authorized');
            }
            const deletePostData = prisma.post.update({
                where: {
                    id,
                },
                data: {
                    comments: {
                        deleteMany: {},
                    },
                    likes: {
                        deleteMany: {},
                    },
                },
            });
            const deletePost = prisma.post.delete({
                where: {
                    id,
                },
            });
            yield prisma.$transaction([deletePostData, deletePost]);
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => PostResponse),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('inputs')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Query(() => PostResponse, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "post", null);
__decorate([
    type_graphql_1.Query(() => PaginatedPosts),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('limit', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('userId', () => type_graphql_1.Int, { nullable: true })),
    __param(2, type_graphql_1.Arg('cursor', () => String, { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('postId', () => type_graphql_1.Int, { nullable: true })),
    __param(1, type_graphql_1.Arg('commentId', () => type_graphql_1.Int, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "handleLike", null);
__decorate([
    type_graphql_1.Mutation(() => models_1.Post, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg('url')),
    __param(2, type_graphql_1.Arg('caption', { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    type_graphql_1.Resolver()
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map