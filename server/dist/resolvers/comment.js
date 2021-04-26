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
exports.CommentResolver = void 0;
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middlewares/isAuth");
const models_1 = require("../models");
let CommentResolver = class CommentResolver {
    postComments(postId, { prisma }) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = (yield prisma.comment.findMany({
                where: {
                    postId,
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }));
            return comments;
        });
    }
    createComment(contents, postId, { prisma, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = (yield prisma.comment.create({
                data: {
                    contents,
                    postId,
                    userId: req.session.userId,
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
            }));
            return comment;
        });
    }
    deleteComment(commentId, { prisma, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
            });
            if ((comment === null || comment === void 0 ? void 0 : comment.userId) !== req.session.userId) {
                throw new Error('Not Authorized');
            }
            yield prisma.comment.delete({
                where: {
                    id: commentId,
                },
            });
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [models_1.Comment]),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('postId', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "postComments", null);
__decorate([
    type_graphql_1.Mutation(() => models_1.Comment, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('contents')),
    __param(1, type_graphql_1.Arg('postId', () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "createComment", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg('commentId', () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "deleteComment", null);
CommentResolver = __decorate([
    type_graphql_1.Resolver()
], CommentResolver);
exports.CommentResolver = CommentResolver;
//# sourceMappingURL=comment.js.map