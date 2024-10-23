import { query } from './_generated/server';
import { v } from 'convex/values';

export const isUserAdmin = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), args.userId))
      .unique();

    if (!user) {
      return false;
    }

    return user.role === 'admin';
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), identity.subject))
      .unique();

    return user;
  },
});
