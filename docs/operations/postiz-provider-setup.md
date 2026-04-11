# Postiz Provider Setup

This is the exact provider checklist for the current Tokovo Postiz deployment.

Base domain:

- `https://postiz.tokovo.io`

Shared public URLs:

- Terms: `https://www.tokovo.io/legal/terms`
- Privacy: `https://www.tokovo.io/legal/privacy`
- Public media base: `https://pub-ebe62de89ead459baa6826cd2fb2dbbc.r2.dev`

## Current Postiz env state

Already configured:

- `MAIN_URL=https://postiz.tokovo.io`
- `FRONTEND_URL=https://postiz.tokovo.io`
- `NEXT_PUBLIC_BACKEND_URL=https://postiz.tokovo.io/api`
- `STORAGE_PROVIDER=cloudflare`
- `CLOUDFLARE_BUCKETNAME=tokovo`
- `CLOUDFLARE_BUCKET_URL=https://pub-ebe62de89ead459baa6826cd2fb2dbbc.r2.dev`

Still missing:

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `TIKTOK_CLIENT_ID`
- `TIKTOK_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `X_API_KEY`
- `X_API_SECRET`
- `THREADS_APP_ID`
- `THREADS_APP_SECRET`

Use:

- [`scripts/postiz/set-railway-provider-env.mjs`](/Users/nishit.gupta/personal/tokovo/scripts/postiz/set-railway-provider-env.mjs)

to push provider keys into Railway from a local `.env` file.

Example:

```bash
pnpm postiz:set-railway-providers /absolute/path/to/.env
```

## YouTube

Redirect URI:

- `https://postiz.tokovo.io/integrations/social/youtube`

Google setup:

- Create OAuth client as `Web application`
- Add yourself as a test user
- Enable:
  - `YouTube Data API v3`
  - `YouTube Analytics API`
  - `YouTube Reporting API`

Postiz env:

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`

Notes:

- Brand accounts require the app to be `External`
- In Google Workspace, the app may need to be trusted

## Facebook

Redirect URI:

- `https://postiz.tokovo.io/integrations/social/facebook`

Meta setup:

- Create app type `Other`
- Select `Business`
- Set up `Login for Business`
- Request advanced permissions:
  - `pages_show_list`
  - `business_management`
  - `pages_manage_posts`
  - `pages_manage_engagement`
  - `pages_read_engagement`
  - `read_insights`
- Set app mode to `Live` before production posting

Postiz env:

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`

## Instagram

Facebook Business redirect URI:

- `https://postiz.tokovo.io/integrations/social/instagram`

Standalone redirect URI:

- `https://postiz.tokovo.io/integrations/social/instagram-standalone`

Recommended setup:

- Use the same Meta app as Facebook
- Use the Facebook Business path unless you specifically need standalone

Business scopes:

- `instagram_basic`
- `pages_show_list`
- `pages_read_engagement`
- `business_management`
- `instagram_content_publish`
- `instagram_manage_comments`
- `instagram_manage_insights`

Business env:

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`

Standalone env:

- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`

## TikTok

Redirect URI:

- `https://postiz.tokovo.io/integrations/social/tiktok`

TikTok setup:

- Platform: `Web`
- Add products:
  - `Login Kit`
  - `Content Posting API`
- Enable `Direct Post`
- Add scopes:
  - `user.info.basic`
  - `user.info.profile`
  - `video.create`
  - `video.publish`
  - `video.upload`
- Terms URL must be public HTTPS
- Privacy URL must be public HTTPS
- Verified site should include the media domain

Postiz env:

- `TIKTOK_CLIENT_ID`
- `TIKTOK_CLIENT_SECRET`

Critical note:

- TikTok pulls media by URL, so public R2 was required and is now configured

## LinkedIn Profile

Redirect URI:

- `https://postiz.tokovo.io/integrations/social/linkedin`

LinkedIn setup:

- Create app
- Add required products
- Request `Advertising API` access, or token refresh may fail later

Postiz env:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

## LinkedIn Page

Redirect URI:

- `https://postiz.tokovo.io/integrations/social/linkedin-page`

LinkedIn setup:

- Verify the app
- Add required products:
  - `Share on LinkedIn`
  - `Advertising API`
  - `Sign in with LinkedIn using OpenID connect`
- Request `Advertising API` access

Postiz env:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

## X

Redirect URI:

- `https://postiz.tokovo.io/integrations/social/x`

X setup:

- App permission: `Read and Write`
- App type: `Native App`

Do not use:

- `Web App, Automated App or Bot`

Postiz env:

- `X_API_KEY`
- `X_API_SECRET`

## Threads

Threads uses the Meta family, but Postiz expects separate env names:

- `THREADS_APP_ID`
- `THREADS_APP_SECRET`

Redirect URI should be the Postiz Threads route once you configure that provider in Postiz.

## Recommended hardening after first login

After the first admin is created and you no longer need open signup:

- set `DISABLE_REGISTRATION=true`

Do this only after the initial Postiz admin exists because Postiz disables signup when this is turned on.

## Recommended next improvements

- Configure Resend or SMTP so self-hosted user flows have email delivery
- Move public media from raw `r2.dev` to a branded media domain like `media.tokovo.io`
- Pin the Postiz image version instead of leaving it on `latest`
