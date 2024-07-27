import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUsersByClerkId } from "./_utils";

export const create = mutation({
    args: {
        conversationId: v.id("conversations"),
        type: v.string(),
        content: v.array(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Unauthorized")
        }

        const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});


        if (!currentUser) {
            throw new ConvexError("User not found")
        }

        const membership = await ctx.db.query("conversationMembers").withIndex("by_memberId_conversationId", q => q.eq("memberId", currentUser._id).eq("conversationId", args.conversationId)).unique();

        if (!membership) {
            throw new ConvexError("You aren't a member of this conversation")
        }

        const message = await ctx.db.insert("messages", {
            senderId: currentUser._id,
            ...args
        })

        const membersToNotify = (await ctx.db.query("conversationMembers").withIndex("by_conversationId", q =>q.eq("conversationId", args.conversationId)).collect()).filter((member) => member.memberId !== currentUser._id);

        await Promise.all(membersToNotify.map(async member => {
            ctx.db.patch(member._id, {notification: false});
        }))

        await ctx.db.patch(args.conversationId, {lastMessageId: message})

        return message;
    }
})

export const generateUploadUrl = mutation({
    args: {
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Unauthorized")
        }

        const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});


        if (!currentUser) {
            throw new ConvexError("User not found")
        }

        return await ctx.storage.generateUploadUrl();
    }
})

export const saveStorageIds = mutation({
    args: {
        storageIds: v.array(
            v.object({
                storageId: v.string(),
            })
        )
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Unauthorized")
        }

        const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});


        if (!currentUser) {
            throw new ConvexError("User not found")
        }

        args.storageIds.map(({ storageId }) => {
            ctx.db.insert("images", {
                storageId: storageId,
                userId: currentUser._id
            })
        })
    }
})