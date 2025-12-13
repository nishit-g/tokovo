/**
 * Twitter/X Showcase Episode
 * 
 * Demonstrates the Twitter app DSL features:
 * - Timeline with tweets
 * - Likes, retweets, quotes
 * - Media tweets (images, videos)
 * - Verified badges
 */

import { episode } from "../src";

export const twitterShowcase = episode("twitter-showcase", ep => {
    ep.config({
        fps: 30,
        title: "Twitter/X Timeline Showcase",
    });

    // =========================================================================
    // DEVICE: User's Phone with Twitter
    // =========================================================================
    ep.device("UserPhone", "iphone16", d => {
        d.owner("Alex");
        d.app("app_twitter");
        d.conversation("__twitter_timeline__", { name: "Timeline", type: "dm" });

        // =====================================================================
        // Beat 1: Timeline Loads with Tweets
        // =====================================================================
        d.beat("timeline-load", b => {
            // Tech influencer tweet with image
            const techTweet = b.tweetReceived(
                {
                    name: "Elon Musk",
                    handle: "elonmusk",
                    verified: "blue",
                    avatarUrl: "https://pbs.twimg.com/profile_images/1234.jpg"
                },
                "The future of AI is here. We're entering a new era of human-machine collaboration 🚀",
                {
                    replyCount: 5432,
                    retweetCount: 12800,
                    likeCount: 89000,
                    viewCount: 2400000,
                    media: [{ url: "https://picsum.photos/800/450", type: "image" }]
                }
            );
            b.wait("1s");

            // Another tweet
            b.tweetReceived(
                {
                    name: "Sam Altman",
                    handle: "sama",
                    verified: "blue"
                },
                "GPT-5 coming soon. It's going to be wild.",
                {
                    replyCount: 2100,
                    retweetCount: 8900,
                    likeCount: 45000,
                    viewCount: 890000,
                }
            );
            b.wait("1s");

            // User engages
            b.likeTweet(techTweet);
            b.wait("500ms");
        });

        // =====================================================================
        // Beat 2: User Posts a Tweet
        // =====================================================================
        d.beat("user-posts", b => {
            const myTweet = b.postTweet(
                "Just built a new app with @tokovo - the future of video generation is here! 🎬✨ #buildinpublic",
                {
                    author: { name: "Alex", handle: "alexdev", verified: "blue" }
                }
            );
            b.wait("2s");
        });

        // =====================================================================
        // Beat 3: More Engagement
        // =====================================================================
        d.beat("engagement", b => {
            // Sport tweet
            const sportTweet = b.tweetReceived(
                {
                    name: "ESPN",
                    handle: "espn",
                    verified: "gold"  // Organization verified
                },
                "BREAKING: Historic trade shakes up the league! Full details ⬇️",
                {
                    replyCount: 890,
                    retweetCount: 3200,
                    likeCount: 15000,
                    viewCount: 450000,
                }
            );
            b.wait("1s");

            // Retweet it
            b.retweetTweet(sportTweet);
            b.wait("500ms");

            // Quote tweet
            b.quoteTweet(sportTweet, "This is going to change everything! 🏀🔥");
            b.wait("2s");
        });

        // =====================================================================
        // Beat 4: Viral Thread
        // =====================================================================
        d.beat("viral-thread", b => {
            // Meme tweet with multiple images
            b.tweetReceived(
                {
                    name: "Internet Historian",
                    handle: "historyinmemes",
                    verified: "blue"
                },
                "The four horsemen of procrastination:",
                {
                    replyCount: 12500,
                    retweetCount: 45000,
                    likeCount: 234000,
                    viewCount: 5600000,
                    media: [
                        { url: "https://picsum.photos/400/400?1", type: "image" },
                        { url: "https://picsum.photos/400/400?2", type: "image" },
                        { url: "https://picsum.photos/400/400?3", type: "image" },
                        { url: "https://picsum.photos/400/400?4", type: "image" },
                    ]
                }
            );
            b.wait("3s");
        });
    });

    // =========================================================================
    // CAMERA
    // =========================================================================
    ep.camera(c => {
        c.at("0s").cut("UserPhone");
    });
});

export default twitterShowcase;
