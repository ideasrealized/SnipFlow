# Common Pitfalls and Rejection Triggers to Avoid

## Overview
This document outlines the most common reasons for App Store rejection and how to avoid them. Following these guidelines will help ensure a smooth approval process.

## Technical Issues

### Crashes or Slow Performance
- **Most straightforward rejection reason:** An app that crashes or has major bugs
- Double-check memory usage and handle edge cases
- Apple testers will try to break your app (e.g., input unusual data, go offline, etc.)
- Any crash will result in rejection
- Fix these and consider implementing graceful error messages for server timeouts or invalid inputs
- Rather than letting the app hang or crash, provide user-friendly error handling

### Performance Optimization
- Test app performance under various conditions
- Monitor memory usage and optimize where necessary
- Implement proper loading states and progress indicators
- Handle network timeouts gracefully
- Test with poor network connectivity

## App Completeness Issues

### Incomplete Features
- Do not submit a "beta" or half-built app to the App Store
- All primary features that you advertise must be fully implemented
- Apple will reject apps that feel like trials, demos, or betas
- Avoid any "coming soon" buttons or greyed-out features
- If you intend to test with users, use TestFlight
- The public App Store is only for production-ready apps

### Placeholders and Dummy Content
- Remove all placeholder text (e.g., "Lorem ipsum" or template text)
- Ensure any links (like support or privacy policy URLs) are live
- An app with obvious placeholders in UI or empty sections looks unprofessional
- Will be rejected under App Completeness guidelines
- Test all links and ensure they lead to appropriate content

## Metadata and Marketing Issues

### Improper Metadata or Marketing
- Be careful with your App Store listing
- Do not use irrelevant keywords (Apple may reject for keyword stuffing)
- Avoid referencing other popular apps improperly
- Don't use other company names or trademarks (e.g., "As good as Notion or Google Docs!")
- This can cause rejection for metadata issues
- Ensure your description isn't overly long or filled with unwarranted superlatives
- Keep it factual about features

### Keyword and Description Best Practices
- Use relevant keywords that accurately describe your app
- Focus on your app's unique features and benefits
- Avoid superlative claims that can't be substantiated
- Keep descriptions clear and concise
- Don't mention competitors by name

## Screenshots and Preview Issues

### Screenshot Requirements
- Upload correct screenshots for all required device sizes
- Missing screenshot for any device (or using the same small screenshot for iPad without proper resolution) can stall your submission
- Do not show any content in screenshots that you don't have rights to
- Don't show content that isn't actually in the app
- Misleading screenshots are a reason for rejection

### Screenshot Content Guidelines
- For example, if your AI can generate an image, show an example of it
- But don't show a famous character or something your app couldn't actually produce
- Screenshots must accurately represent the app experience
- Use actual app content, not concept art or mockups
- Ensure screenshots are high quality and properly sized

## Demo and Testing Issues

### Not Providing Demo Login
- If your app requires login and you didn't provide a test account, the reviewer may be blocked from accessing the app's content
- Will reject it for that reason
- Always provide a way for App Review to fully experience your app
- Provide demo credentials or enable a special test mode
- If using email-based OTP for login, consider a workaround for testers
- Like a universal code or skip option because they might not want to use personal emails

### Demo Account Best Practices
- Create dedicated test accounts with full feature access
- Ensure test accounts have sample data to demonstrate features
- Provide clear instructions for using demo accounts
- Test the demo accounts yourself before submission
- Include demo account info in App Review notes

## Backend and Server Issues

### Backend/Server Not Ready
- If your app depends on a server (which it does for AI processing), make sure the server is running and stable during the review period
- A common pitfall is deploying the app for review while the backend is still in testing or having downtime
- Reviewers will see the app as broken (e.g., AI responses not loading)
- Will reject it under the Performance guidelines
- Monitor server uptime during review period

### Server Reliability
- Ensure backend services are production-ready
- Have monitoring and alerting in place
- Plan for increased load during review
- Have rollback plans if issues arise
- Test all server endpoints thoroughly

## Review Process Issues

### Ignoring App Review Feedback
- If your app gets rejected and Apple provides feedback, take it seriously
- Address the issue fully before resubmitting
- Repeated rejections for the same issue can escalate to longer review times
- Or even a conversation with Apple
- There's also an App Review Board appeal process if you strongly believe a rejection is mistaken
- But use it wisely and only with a solid justification

### Responding to Rejections
- Read rejection feedback carefully
- Address all points mentioned in the rejection
- Don't just fix the obvious issue - look for related problems
- Provide detailed responses in review notes explaining your fixes
- Consider reaching out to App Review if feedback is unclear

## Technical Compliance Issues

### Private API or Unauthorized Frameworks
- Scanning your code for any use of private API calls (often accidental if using certain libraries) is wise
- Apple's automated checks will flag these
- Also remove any debug flags, test menus, or verbose logging that isn't necessary
- Sometimes internal test code can trigger a rejection if it references sandbox URLs or non-public functionality

### Code Review Checklist
- Remove all debug code and test features
- Ensure only public APIs are used
- Remove verbose logging that isn't necessary
- Check third-party libraries for compliance
- Remove any development-only features

### Background Processes
- Ensure your app doesn't abuse background permissions
- An app should not keep running in the background playing silent audio or doing background tasks just to keep alive
- Unless it's justified, like a music app or VOIP
- Apple can reject apps that unnecessarily drain battery or violate background execution rules

## Spam and Duplicate Content

### Spam and Multiple App Submissions
- Don't submit multiple similar apps or variants
- If you have a single app that can cover multiple use cases, do that instead of reskinning it
- Apple may reject your app if they suspect it's one of many templated apps
- Or if it appears to duplicate another app you've submitted
- This falls under spam guidelines

### App Uniqueness
- Ensure your app provides unique value
- Don't simply clone existing apps
- Add meaningful features and improvements
- Focus on what makes your app different
- Avoid template-based apps without significant customization

## Design and User Interface Issues

### Compliance with All Guidelines
- Remember that Apple's App Store Review Guidelines cover Safety, Performance, Business, Design, and Legal aspects
- Make sure you've skimmed relevant sections (e.g., the Design guidelines for iOS)
- Ensure your UI isn't completely non-standard in a bad way
- Common design pitfalls include using Apple UI elements incorrectly or violating interface conventions
- As a productivity app, focus on a clean, user-friendly design that meets Apple's basic expectations

### Design Best Practices
- Follow iOS Human Interface Guidelines
- Use standard UI elements appropriately
- Ensure good accessibility support
- Test on various device sizes
- Maintain consistency throughout the app

## Pre-Submission Final Check

### Final Pre-Submission Check
- Before hitting "Submit for Review," run through this checklist one more time
- Verify that your App Review Notes are filled with any needed info (demo account, features explanation)
- Your pricing/in-app purchases are correctly configured and attached to this version
- You've addressed every guideline aspect relevant to your app (content checks, privacy compliance, etc.)
- Taking the time to do this final pass can save days of back-and-forth if something was overlooked

## Comprehensive Avoidance Checklist

### Technical Quality
- [ ] App tested thoroughly for crashes and bugs
- [ ] Performance optimized for various conditions
- [ ] All features fully implemented and functional
- [ ] No placeholder content or broken links
- [ ] Backend services stable and monitored

### Metadata and Marketing
- [ ] App Store description accurate and compliant
- [ ] Keywords relevant and not spammy
- [ ] No trademark violations or competitor references
- [ ] Screenshots accurate and high quality
- [ ] All required screenshot sizes provided

### Review Preparation
- [ ] Demo accounts created and tested
- [ ] App Review notes complete and detailed
- [ ] All features accessible to reviewers
- [ ] Server infrastructure ready for review period
- [ ] Contact information up to date

### Technical Compliance
- [ ] Only public APIs used
- [ ] No debug code or test features in production build
- [ ] Background processes appropriate and justified
- [ ] Code scanned for private API usage
- [ ] Third-party libraries compliant

### Design and User Experience
- [ ] UI follows iOS Human Interface Guidelines
- [ ] App provides unique value
- [ ] No duplicate or spam-like content
- [ ] Accessibility features implemented
- [ ] Consistent design throughout app

### Legal and Policy Compliance
- [ ] All App Store Guidelines reviewed and followed
- [ ] Privacy policy complete and accessible
- [ ] Data collection properly disclosed
- [ ] Content filtering appropriate for age rating
- [ ] In-app purchases properly implemented

## Red Flags That Guarantee Rejection

### Immediate Rejection Triggers
- App crashes during basic usage
- Obvious placeholder content or broken links
- Missing required metadata or screenshots
- Use of private APIs or unauthorized frameworks
- Misleading app descriptions or functionality
- Inadequate content filtering for AI outputs
- Missing demo accounts for login-required apps
- Server downtime during review period

### Policy Violations
- Prohibited content (hate speech, violence, etc.)
- Circumventing in-app purchase requirements
- Inadequate privacy policy or data disclosures
- Missing required features (account deletion, etc.)
- Trademark or copyright violations
- Spam or duplicate app submissions

## Recovery Strategies

### If Your App Gets Rejected
1. **Read the rejection carefully** - Understand exactly what needs to be fixed
2. **Address all issues** - Don't just fix the obvious problem
3. **Test thoroughly** - Ensure your fixes work properly
4. **Update review notes** - Explain what you've changed
5. **Consider broader implications** - Look for related issues that might cause future rejections

### Appeal Process
- Only appeal if you genuinely believe the rejection was in error
- Provide clear, factual arguments
- Include supporting documentation
- Be respectful and professional
- Have a strong case before appealing

By following these guidelines and avoiding these common pitfalls, you'll significantly increase your chances of a smooth App Store approval process. 