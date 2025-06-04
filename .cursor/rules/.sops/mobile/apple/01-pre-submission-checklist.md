# Pre-Submission Technical & Procedural Checklist

## Overview
This checklist covers all technical and procedural requirements that must be completed before submitting your AI-powered productivity app to the App Store.

## Technical Requirements

### Use Latest Tools & SDKs
- Build the app with the latest Xcode and iOS/iPadOS SDK
- Apple requires current SDK (e.g., Xcode 15 with iOS 17, and soon iOS 18)
- This ensures compatibility and avoids rejection for using outdated frameworks

### Universal App Support
- Verify the app runs smoothly on all iPhone and iPad screen sizes
- Use Auto Layout/SwiftUI for adaptive UIs
- Test on various simulators/devices
- New apps must support the full display of all modern iPhones and iPads (edge-to-edge, proper aspect ratios)
- Avoid simply "letterboxing" an iPhone UI on iPad
- Provide appropriate layouts and multitasking support on iPad

### App Completeness
- Submit a final, fully functional build
- No placeholder text or dummy content in the UI
- Ensure all links/URLs in the app are live
- Remove any "coming soon" features or test labels
- Apple will reject apps with obvious placeholders or incomplete features

### Thorough Testing
- Test for crashes, bugs, and stability on devices
- The app should not crash or hang during review
- Apple will reject builds that crash or exhibit obvious technical issues
- Ensure smooth performance even when network connectivity is poor
- Gracefully handle offline mode or server errors for your AI features

## App Store Connect Setup

### Metadata Requirements
- Fill out all required metadata in App Store Connect accurately
- Include: app name, description, category, keywords, support contact info
- Provide screenshots for both iPhone and iPad displays
- All metadata must reflect the app's actual content and functionality
- Misleading descriptions or missing info can lead to rejection

### Privacy Policy URL
- Provide a link to a Privacy Policy in App Store Connect
- Apple requires every app to have a privacy policy link in its metadata
- The policy should clearly explain what data you collect and how it's used
- Must be accessible to users

### Version & Build Management
- Double-check that the app's version number and build number match App Store Connect
- Increment the version if this is an update
- Verify the bundle identifier in the app matches the App Store Connect record
- Mismatches can prevent successful submission

### Developer Account and Certificates
- Ensure your Apple Developer Program membership is active
- Use the correct App Store distribution certificate and provisioning profile
- Sign the app properly
- Invalid code signature or expired certificate will cause rejection during upload

## In-App Purchases Testing

### Sandbox Testing
- Test all in-app purchases or subscriptions in the sandbox environment
- Ensure they work properly before submission
- In-app purchase products should be set up in App Store Connect and "Ready to Submit"
- If any IAP content is gated behind server conditions, include that info in the review notes

## App Preview & Screenshots

### Screenshot Requirements
- Prepare app screenshots that accurately show the app in use
- Optional preview videos are allowed
- You need separate screenshot sets for iPhone and iPad
- Do not use concept art or empty UI in screenshots
- Apple requires screenshots to reflect the actual app experience (no misleading images)

### Age Rating
- Fill out the age rating questionnaire in App Store Connect carefully
- Given the AI content generation, consider that unfiltered outputs could require a 17+ rating
- Ensure the age rating reflects any mature content that could appear
- Avoid Apple adjusting it or rejecting the app

## Review Preparation

### Contact & Demo Information
- Update your contact info (email/phone) in your developer account
- App Review can reach you if needed
- If your app requires login or special setup, provide a demo account (test username & password)
- Enable a fully featured demo mode for the reviewers
- Include this in the App Review notes field
- If any external hardware or codes (QR codes, etc.) are needed, supply test credentials or sample data
- Ensure your backend servers are running and accessible during the review
- Apple will test the live functionality

### Documentation for Reviewers
- In the review notes, document any non-obvious functionality or special features
- If some AI features require specific steps or have limited use in review mode, clarify that
- List and describe any in-app purchases or subscriptions in the notes
- Reviewers need to know what to expect and how to activate them
- Clear explanations can prevent misunderstandings during review

## Final Verification
- Run through this entire checklist one more time before submission
- Verify App Review Notes are complete with any needed info
- Confirm pricing/in-app purchases are correctly configured
- Ensure all guideline aspects relevant to your app have been addressed
- Taking time for this final pass can save days of back-and-forth if something was overlooked 