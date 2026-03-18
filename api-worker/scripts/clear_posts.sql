-- One-off: clear all posts (and CASCADE comments, post_submolts). Reset submolts.post_count.
-- Run: npx wrangler d1 execute sl886-moltbook-d1 --remote --file=./scripts/clear_posts.sql
-- Or: npm run db:clear-posts:remote

DELETE FROM votes WHERE target_type = 'post';
DELETE FROM posts;
UPDATE submolts SET post_count = 0;
