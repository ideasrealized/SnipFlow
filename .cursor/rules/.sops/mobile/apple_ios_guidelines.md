---
description: 
globs: 
alwaysApply: false
---
App Store Submission Checklist for an AI-Powered Productivity App

Before You Submit (Technical & Procedural Prep)

Use Latest Tools & SDKs: Build the app with the latest Xcode and iOS/iPadOS SDK (Apple requires current SDK; e.g., Xcode 15 with iOS 17, and soon iOS 18)
developer.apple.com

. This ensures compatibility and avoids rejection for using outdated frameworks.
Universal App Support: Verify the app runs smoothly on all iPhone and iPad screen sizes. Use Auto Layout/SwiftUI for adaptive UIs and test on various simulators/devices. New apps must support the full display of all modern iPhones and iPads (edge-to-edge, proper aspect ratios)
developer.apple.com
developer.apple.com

. Avoid simply “letterboxing” an iPhone UI on iPad – provide appropriate layouts and multitasking support on iPad.

App Completeness: Submit a final, fully functional build – no placeholder text or dummy content in the UI, and ensure all links/URLs in the app are live
developer.apple.com

. Remove any “coming soon” features or test labels. Apple will reject apps with obvious placeholders or incomplete features.

Thorough Testing: Test for crashes, bugs, and stability on devices. The app should not crash or hang during review – Apple will reject builds that crash or exhibit obvious technical issues
developer.apple.com
developer.apple.com

. Ensure smooth performance even when network connectivity is poor (gracefully handle offline mode or server errors for your AI features).

App Store Connect Setup: Fill out all required metadata in App Store Connect accurately. This includes the app name, description, category, keywords, support contact info, and screenshots for both iPhone and iPad displays. All metadata must reflect the app’s actual content and functionality
developer.apple.com

. Misleading descriptions or missing info can lead to rejection.
Provide a Privacy Policy URL: Because your app collects user info (even basic), provide a link to a Privacy Policy in App Store Connect. Apple requires every app to have a privacy policy link in its metadata, accessible to users
developer.apple.com

. The policy should clearly explain what data you collect and how it’s used. (See Data Privacy section below for details.)

App Version & Build: Double-check that the app’s version number and build number match what you’ve entered in App Store Connect. Increment the version if this is an update. Also verify the bundle identifier in the app matches the App Store Connect record – mismatches can prevent successful submission.

Developer Account and Certificates: Ensure your Apple Developer Program membership is active and you’ve used the correct App Store distribution certificate and provisioning profile to sign the app. An invalid code signature or expired certificate will cause rejection during upload.

Test In-App Purchases (Sandbox): If your app has in-app purchases or subscriptions, test them in the sandbox environment to make sure they work properly before submission. In-app purchase products should be set up in App Store Connect and “Ready to Submit” when you send the app for review

developer.apple.com

. If any IAP content is gated behind server conditions (e.g. content available at launch), include that info in the review notes.

App Preview & Screenshots: Prepare app screenshots (and optional preview videos) that accurately show the app in use

developer.apple.com

. You need separate screenshot sets for iPhone and iPad. Do not use concept art or empty UI in screenshots – Apple requires screenshots to reflect the actual app experience (no misleading images).

Review Your App’s Age Rating: Fill out the age rating questionnaire in App Store Connect carefully. Given the AI content generation, consider that unfiltered outputs could require a 17+ rating (see AI-Specific Rules below). Ensure the age rating reflects any mature content that could appear, to avoid Apple adjusting it or rejecting the app

developer.apple.com
.
Contact & Demo for Review: Update your contact info (email/phone) in your developer account so App Review can reach you if needed

developer.apple.com

. If your app requires login or special setup, provide a demo account (test username & password) or enable a fully featured demo mode for the reviewers

developer.apple.com

. Include this in the App Review notes field. If any external hardware or codes (QR codes, etc.) are needed to use the app, supply test credentials or sample data

developer.apple.com

. Also, ensure your backend servers are running and accessible during the review
developer.apple.com

 – Apple will test the live functionality.

Explain Non-Obvious Features: In the review notes, document any non-obvious functionality or special features. If some AI features require specific steps or have limited use in review mode, clarify that. Also list and describe any in-app purchases or subscriptions in the notes

developer.apple.com

, so reviewers know what to expect and how to activate them. Clear explanations can prevent misunderstandings during review.

What’s Not Allowed (App Store Guidelines on Prohibited Content/Behavior)

Objectionable Content: The app (including AI-generated output) must not contain or facilitate objectionable content. This includes no hate speech, defamatory or mean-spirited material targeting race, religion, gender, sexual orientation, etc.

developer.apple.com

. Absolutely no content that harasses, bullies, or intimidates individuals or groups.
Violence and Harm: No realistic depictions of extreme violence or abuse toward people or animals, and no content that encourages violent or illegal acts

developer.apple.com

. Avoid features that could potentially facilitate physical harm. (For example, an AI shouldn’t generate instructions for making weapons or engage in harassment.)

Pornography and Sexually Explicit Material: No pornographic or overtly sexual content is allowed

developer.apple.com

. This means the app should not generate or distribute explicit sexual material. Even “NSFW” or erotic AI outputs are not permitted unless hidden behind strict filters and age restrictions (and even then, highly discouraged by Apple).

False or Misleading Functions: Apps may not include false information or deceptive functionality. For instance, do not present your app as something it isn’t (e.g., a fake virus scanner or “AI that guarantees lottery wins”). Prank features that trick users (fake system alerts, etc.) are grounds for rejection

developer.apple.com

. Clearly label entertainment-only features as such – but note that saying “for entertainment” won’t excuse a guideline violation

developer.apple.com
.
Sensitive Current Events: Avoid capitalizing on or profiting from recent sensitive events (war, terrorist incidents, pandemics, etc.) with inappropriate content

developer.apple.com

. Any AI content related to such events must be handled with care and not in a way that’s in poor taste.
Illegal Activities: The app must not promote the use of illegal drugs, facilitate the purchase of controlled substances, or include content that encourages crime or reckless behavior. Likewise, no features should enable unlawful content creation (e.g., AI that generates illegal advice or fraudulent material).

User-Generated Content (UGC) Compliance: If users can input content or share outputs (e.g., sharing AI-generated notes or media), you must moderate UGC. Apps with user or AI-generated content must provide: content filtering for objectionable material, a mechanism to report offensive content, and the ability for you to block abusive users

developer.apple.com

. Include in-app user reporting tools and have moderators (automated or human) to quickly remove anything that violates guidelines. Apps primarily used for pornographic or exploitative UGC will be rejected
developer.apple.com

, so ensure your AI’s output and any user-shared content stay within acceptable bounds.
No Hidden or Undocumented Features: Don’t include any hidden Easter eggs, debug menus, or features that are not disclosed. The app’s functionality should be transparent to the user and to Apple. All features must be declared in your review notes if they’re not obvious

developer.apple.com

. Enabling new features or remote content after review (that weren’t present during review) can lead to removal.

No Private APIs or Unauthorized Tech: Use only public APIs and frameworks. Apps that use unpublished Apple APIs, attempt to download/execute unapproved code, or break sandbox rules will be rejected. For example, don’t attempt to dynamically load new executable code from your server – server-side processing is fine, but the app itself should not change its behavior in ways Apple hasn’t reviewed.

Respect Intellectual Property: Ensure all content in the app (including AI-generated media) does not infringe copyrights or trademarks. Any third-party content (like sample documents, images, or text used in prompts) should be licensed or your own. Do not use Apple’s trademarks or UI elements inappropriately either. Misusing brands, or copying another app’s design too closely, can cause rejection or legal issues.

No Spam or Duplicate Apps: Your app should be unique and useful – do not simply clone an existing app or template without adding value. Avoid spammy behavior like using irrelevant keywords, or submitting multiple similar apps. Apple’s guidelines require that each app offers a meaningful experience and isn’t just a thin wrapper around a website or AI with no distinct value.

AI-Specific Considerations and Guidelines

Content Filtering for AI Outputs: If your app generates chat responses, images, or videos via AI, implement robust content filtering. Apple will check that AI-generated content is appropriate for the app’s age rating. If you do not have sufficient filtering, Apple may require you to rate the app 17+

developer.apple.com
developer.apple.com

. For a broader audience, use filters to block or refuse disallowed content (hate speech, violence, sexual content, etc.) in AI outputs.

Age Rating and AI: By default, consider setting a 17+ age rating if there’s any doubt about controlling the AI’s output. Apple has, in practice, asked developers to raise ratings to 17+ for apps using generative AI (e.g., ChatGPT integration) due to the risk of inappropriate content

macrumors.com
macrumors.com

. You can keep a lower age rating only if you are confident your content filters are effective enough to prevent all mature or offensive material.

User-Generated Input: Treat user prompts to the AI as you would any user-generated content. This means you should prevent or handle abusive inputs (e.g., if a user asks the AI to produce disallowed content, your app should refuse or filter that request). The combination of user input and AI output must not create a loophole to produce guideline-violating material.

Moderation System: Have a moderation system in place (automated or manual review) for any AI-generated images/videos to catch things like nudity, graphic violence, or illegal content. Apps that allow sharing of AI-generated media should especially have reporting and take-down mechanisms (per UGC rules)

developer.apple.com

. Log problematic outputs so you can improve filters or ban users if needed.

Quality and Accuracy Disclaimers: If the AI provides information or advice (e.g., answers to questions, content generation), consider a disclaimer in-app that AI content might be imperfect. While not strictly an Apple requirement, being transparent that “This answer is AI-generated and may be incorrect” can improve user understanding and potentially satisfy App Review if the AI could produce confusing or erroneous content. Avoid guaranteeing accuracy in marketing; Apple could view blatant false claims as misleading.

No Regulated Advice without Qualification: Ensure your AI does not give medical, legal, or financial advice that could be harmful or is presented as professional counsel. Apple may reject apps that offer such guidance without proper disclaimers or credentials. If your productivity app’s AI touches these areas (even inadvertently via user prompts), include warnings (e.g., “For informational purposes only”) and avoid any claim of professional certification.

Resource Usage: Since AI processing is mostly on the backend, make sure the app remains responsive. Long waits for AI responses should be communicated via a spinner or message. Apple will test the app – if queries consistently time out or the app feels broken due to slow AI servers, that could be a reason for rejection under performance guidelines. Optimize your backend and handle network errors gracefully (e.g., show an error message if the AI service is unreachable).

Privacy of AI Data: If user-provided data (text prompts, images, etc.) is sent to your servers or an AI API for processing, inform the user. For instance, in your privacy policy and possibly in-app, clarify that “user input may be processed on our servers to generate responses.” Ensure any sensitive data isn’t inadvertently logged or stored without consent. (See Data Privacy section for required consent for data collection.)
Third-Party AI Services: If using third-party AI APIs (OpenAI, etc.), ensure compliance with both their terms and Apple’s. Do not expose API keys or credentials in the app. Apple will reject the app if it finds hardcoded secrets or if the app’s use of an API violates that API’s usage policies (which could lead to unpredictable or nonfunctional behavior).

In-App Purchases and Subscription Requirements

Use Apple’s IAP System: All digital content, features, or subscription access in your app must use Apple’s in-app purchase mechanism

developer.apple.com

. You cannot direct users to external purchasing or use alternate payment methods for in-app content. (Exception: only if you qualify for specific exemptions like the “reader app” or external link entitlement, but those are limited cases

developer.apple.com

. For a typical productivity app, assume all upgrades use IAP.)
No External Purchase Prompts: Do not mention or link to outside payment in the app. For example, do not include text like “Subscribe cheaper on our website!” or buttons that take users to a web purchase – Apple forbids circumventing IAP from within the app

developer.apple.com

. Non-compliance will result in rejection.

Enable “Restore Purchases”: Implement a “Restore Purchases” function for non-consumable IAPs and subscriptions. Users (and testers) should be able to restore their purchases on a new device or after reinstallation. Apple expects any purchased content to persist (IAPs must not expire or be lost) and that a restore mechanism is available

developer.apple.com
.
Subscription Design: If using subscriptions, they should be auto-renewable via StoreKit and provide ongoing value. Ensure your subscription lasts at least 7 days (no very short sub periods) and works across the user’s iPhone and iPad seamlessly

developer.apple.com
developer.apple.com

. A subscriber on one device should unlock features on their other devices too.
Clear Value Proposition: Clearly explain what your subscription offers. Before asking users to subscribe, the app (and App Store description) should spell out what they get (e.g. “access to AI assistant features, x GB cloud storage, etc.”) and the cost and interval

developer.apple.com

. Vague or misleading subscription pitches can lead to rejection or user complaints.
No Forcing Extra Actions: Do not force users into unrelated tasks to unlock content they paid for. For example, once a user purchases a feature or subscription, the app should not require them to perform additional steps like rating the app or sharing on social media to access what they paid for

developer.apple.com

. Users must get what they paid for with no strings attached (aside from login if required).
Free Trial Compliance: If you offer a free trial, use Apple’s official trial system (e.g. an introductory 7-day free trial for a subscription) or a free tier that doesn’t require purchase. Make sure the trial duration and content limitations are clear, and automatically handled by the subscription (Apple will auto-renew or end the sub). If using a non-renewing free trial (for non-subscription IAP), Apple requires it to be a zero-cost IAP with a proper label (e.g., “14-day Trial”) and that you clearly state what happens after it expires

developer.apple.com
developer.apple.com
.
Test Subscription Flows: Test upgrade, downgrade, and cancellation flows for subscriptions. Ensure that if a user cancels or the sub expires, the app correctly restricts content. Likewise, if they resubscribe or the subscription is renewed, content access is restored without issues. Apple may verify that subscribing and unsubscribing behaves correctly (e.g., no multiple overlapping subscriptions for the same content)
developer.apple.com
.
Pricing and Tiering: Set your IAP prices according to Apple’s price tiers in App Store Connect. The app should display pricing fetched from StoreKit, so it’s localized and accurate. Do not hard-code currency or price values that could go out of sync with App Store prices. Also, avoid exorbitant pricing that could be seen as a scam – apps that charge unreasonably high fees for little value might get extra scrutiny
developer.apple.com
.
Disclosure in Metadata: In your App Store description and screenshots, disclose if certain features require in-app purchase. For example, if the AI image generation is a paid feature, mention “Requires Pro upgrade” in the description or screenshot captions. Apple’s guidelines mandate that apps clearly indicate which content or features require additional purchases
developer.apple.com
.
No Subscription “Bait-and-Switch”: If your app was previously a paid app or had certain free capabilities, do not suddenly lock existing features behind a subscription for users who already had the app. Grandfather them in or continue providing what they already had access to

developer.apple.com

. Apple discourages abruptly removing functionality from users who have previously paid for the app when moving to a subscription model.

App Store Review Notes for IAP: If any in-app purchases are not easily accessible to the reviewer (for example, if they’re behind an account wall or depend on server conditions), explain in the review notes how to test them

developer.apple.com

. You might include a promo code or a demo subscription if appropriate. Without this, reviewers might think the IAP isn’t working or available and could reject the app.

Consumables and Credits: If your app uses consumable credits (e.g., tokens for AI queries), ensure that purchasing those uses IAP and that they don’t expire unfairly

developer.apple.com

. Also, make sure the app properly handles edge cases like out-of-credit states and prompts the user to purchase more through IAP, not through any external means.

Data Privacy and User Consent Requirements

Privacy Policy Requirement: You must have a privacy policy and provide a link to it in the App Store listing and within the app itself

developer.apple.com

. The policy should clearly state what user data the app collects (e.g. name, email, usage data), how it’s collected, and how it’s used

developer.apple.com

. Also disclose any third-party services or SDKs that handle user data (analytics, AI APIs, etc.), and confirm those partners provide equal data protection

developer.apple.com

. Include information on data retention and how users can request deletion

developer.apple.com

 (important now that account deletion is required).
App Privacy “Nutrition Label”: In App Store Connect, fill out the Privacy Questionnaire accurately. Declare all data types your app collects (e.g. contact info, usage data, identifiers, etc.) and their purposes (analytics, app functionality, etc.)

developer.apple.com
developer.apple.com

. If you use third-party code (for example, an analytics SDK or an AI backend) that collects data, you must report that as well

developer.apple.com

. The App Store will display a summary of your data practices on your app page, and Apple will reject the app if these disclosures are found to be incomplete or misleading.

User Consent for Data Collection: If your app collects personal data or any user content, obtain explicit user consent. For instance, if the app asks for the user’s name, email, or accesses their content to feed into AI, present a clear opt-in or an account creation form that explains why the info is needed. Do not collect personal data silently. Per guidelines, even “anonymous” usage data should have user consent or a clear privacy notice

developer.apple.com

. If you rely on a lawful basis like GDPR “legitimate interest” for data collection, ensure full compliance with those laws

developer.apple.com
.
Permissions (Camera, Mic, etc.): For any system permissions (camera, microphone, photos, contacts, etc.), include NSUsageDescription keys in your Info.plist with a clear message explaining why the app needs access

developer.apple.com

. The permission prompt shown to the user should make sense (e.g., “Allow access to Camera to scan documents for your AI assistant”). Apple will reject your app outright if a required usage description is missing or if the reason is too vague. Only request access when needed and only to data that’s relevant to the app’s core functionality (data minimization)

developer.apple.com
.
No Mandatory Personal Info for Basic Use: Don’t force the user to sign up or provide personal information unless it’s essential for the app to function. Apple’s rules say if your app’s core features don’t require an account, let users use it without one

developer.apple.com

. For a productivity app, if some basic functionality can work offline or without login, allow guest usage. You can prompt users to sign up for cloud sync or AI personalization, but it shouldn’t block all usage if not absolutely necessary.

Account Creation & Deletion: If your app offers account signup (storing user info on your service), you must offer an in-app way to delete the account

developer.apple.com

. This is now a strict App Store requirement. Provide a clear account deletion option in the app’s settings/profile section. It should fully delete user data or at least initiate a process to do so, and the option should be easy to find without needing to contact support. Test this feature because App Review might look for it if your app has login.

Sign in with Apple (if applicable): If you support third-party login options (e.g., Google, Facebook login), Apple requires that you also offer “Sign in with Apple” as an equivalent option for users

developer.apple.com

 (Apple’s rule: any app with social/third-party logins must include their SSO). This provides a privacy-friendly login choice. Ensure Sign in with Apple is properly implemented if needed, and that it’s available wherever other login methods appear.

Data Security: Secure any personal data in transit and at rest. Use HTTPS for all network calls (which is required by App Transport Security unless you have exceptions). Do not log sensitive info or send it to analytics. If you store user data on the device, consider using iOS secure storage (Keychain or Data Protection) especially for sensitive items. While Apple’s review might not fully verify encryption, it’s part of being compliant and trustworthy (and you must declare if you use encryption when uploading the app due to export rules).

App Tracking Transparency (ATT): If your app collects data that will be used to track users across other apps/websites (for example, if you have an advertising SDK or you build profiles on users), you must implement the ATT prompt to get user permission

developer.apple.com

. Even if you just use the IDFA for ad tracking, the user must opt-in. If you’re not doing any cross-app tracking (many productivity apps won’t), then ensure you don’t include any ad SDKs that do, or if you do, turn off tracking or still present the prompt. Not complying with ATT can lead to App Store rejection or removal.

User Data Usage Clarity: Be transparent in-app when using user data. For instance, if you collect the user’s notes or voice to feed the AI for analysis, consider a brief onboarding screen or settings toggle that informs them “Your input will be sent to our servers for AI processing.” Gaining user trust and explicit acknowledgment here can also satisfy regulators. And if at any point you use data in a new way, you’d need to ask permission again.

Children’s Data: If your app is not intended for kids under 13, ensure you haven’t selected the Kids category. But even outside it, if you accidentally collect data from minors, you must comply with COPPA and similar laws. Generally, since this is a productivity app likely not for young children, just ensure your age rating and marketing are appropriate. If you did target kids, there are much stricter rules (no behavioral advertising, etc.)

developer.apple.com

, but presumably not applicable here.

Common Pitfalls and Rejection Triggers to Avoid

Crashes or Slow Performance: The most straightforward rejection reason is an app that crashes or has major bugs. Double-check memory usage and handle edge cases. Apple testers will try to break your app (e.g., input unusual data, go offline, etc.). Any crash will result in rejection, so fix these and consider implementing graceful error messages for server timeouts or invalid inputs rather than letting the app hang or crash
developer.apple.com
.
Incomplete Features: Do not submit a “beta” or half-built app to the App Store. All primary features that you advertise must be fully implemented. Apple will reject apps that feel like trials, demos, or betas
developer.apple.com

. Avoid any “coming soon” buttons or greyed-out features. If you intend to test with users, use TestFlight; the public App Store is only for production-ready apps
developer.apple.com
.
Placeholders and Dummy Content: As noted, remove all placeholder text (e.g., “Lorem ipsum” or template text) and ensure any links (like support or privacy policy URLs) are live. An app with obvious placeholders in UI or empty sections looks unprofessional and will be rejected under App Completeness
developer.apple.com
.
Improper Metadata or Marketing: Be careful with your App Store listing. Do not use irrelevant keywords (Apple may reject for keyword stuffing or referencing other popular apps improperly). Avoid using other company names or trademarks (e.g. “As good as Notion or Google Docs!”) in your description or keywords – this can cause rejection for metadata issues. Ensure your description isn’t overly long or filled with unwarranted superlatives; keep it factual about features.

Screenshots and Preview Issues: Upload correct screenshots for all required device sizes. Missing screenshot for any device (or using the same small screenshot for iPad without proper resolution) can stall your submission. Also, do not show any content in screenshots that you don’t have rights to or that isn’t actually in the app – misleading screenshots are a reason for rejection

developer.apple.com

. For example, if your AI can generate an image, show an example of it, but don’t show a famous character or something your app couldn’t actually produce.

Not Providing Demo Login: If your app requires login and you didn’t provide a test account, the reviewer may be blocked from accessing the app’s content and will reject it for that reason

developer.apple.com

. Always provide a way for App Review to fully experience your app (demo credentials or enable a special test mode). If using email-based OTP for login, consider a workaround for testers (like a universal code or skip option) because they might not want to use personal emails.

Backend/Server Not Ready: If your app depends on a server (which it does for AI processing), make sure the server is running and stable during the review period

developer.apple.com

. A common pitfall is deploying the app for review while the backend is still in testing or having downtime – reviewers will see the app as broken (e.g., AI responses not loading) and will reject it under the Performance guidelines.

Ignoring App Review Feedback: If your app gets rejected and Apple provides feedback, take it seriously and address the issue fully before resubmitting. Repeated rejections for the same issue can escalate to longer review times or even a conversation with Apple. There’s also an App Review Board appeal process if you strongly believe a rejection is mistaken, but use it wisely and only with a solid justification
macrumors.com
.
Private API or Unauthorized Frameworks: Scanning your code for any use of private API calls (often accidental if using certain libraries) is wise. Apple’s automated checks will flag these. Also remove any debug flags, test menus, or verbose logging that isn’t necessary – sometimes internal test code can trigger a rejection if it, for example, references sandbox URLs or non-public functionality.

Background Processes: Ensure your app doesn’t abuse background permissions. For instance, an app should not keep running in the background playing silent audio or doing background tasks just to keep alive (unless it’s justified, like a music app or VOIP). Apple can reject apps that unnecessarily drain battery or violate background execution rules.

Spam and Multiple App Submissions: Don’t submit multiple similar apps or variants – if you have a single app that can cover multiple use cases, do that instead of reskinning it. Apple may reject your app if they suspect it’s one of many templated apps or if it appears to duplicate another app you’ve submitted (this falls under spam guidelines).

Compliance with All Guidelines: Remember that Apple’s App Store Review Guidelines cover Safety, Performance, Business, Design, and Legal aspects

developer.apple.com

. Make sure you’ve skimmed relevant sections (e.g., the Design guidelines for iOS to ensure your UI isn’t completely non-standard in a bad way). Common design pitfalls include using Apple UI elements incorrectly or violating interface conventions, but as a productivity app, focus on a clean, user-friendly design that meets Apple’s basic expectations.

Final Pre-Submission Check: Before hitting “Submit for Review,” run through this checklist one more time. Verify that your App Review Notes are filled with any needed info (demo account, features explanation), your pricing/in-app purchases are correctly configured and attached to this version, and that you’ve addressed every guideline aspect relevant to your app (content checks, privacy compliance, etc.). Taking the time to do this final pass can save days of back-and-forth if something was overlooked.


By following this comprehensive checklist and Apple’s official guidelines, you’ll maximize your app’s chances of a smooth approval. Good luck with your submission!