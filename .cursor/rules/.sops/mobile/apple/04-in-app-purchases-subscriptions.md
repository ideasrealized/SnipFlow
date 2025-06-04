# In-App Purchases and Subscription Requirements

## Overview
This document covers all requirements for implementing in-app purchases (IAP) and subscriptions in compliance with Apple's App Store Guidelines.

## Mandatory IAP System Usage

### Apple's IAP System Requirement
- All digital content, features, or subscription access in your app must use Apple's in-app purchase mechanism
- You cannot direct users to external purchasing or use alternate payment methods for in-app content
- **Exception:** Only if you qualify for specific exemptions like the "reader app" or external link entitlement (limited cases)
- For a typical productivity app, assume all upgrades use IAP

### Prohibited External Purchase Prompts
- Do not mention or link to outside payment in the app
- **Prohibited examples:**
  - "Subscribe cheaper on our website!"
  - Buttons that take users to a web purchase
- Apple forbids circumventing IAP from within the app
- Non-compliance will result in rejection

## Purchase Restoration

### Restore Purchases Function
- Implement a "Restore Purchases" function for non-consumable IAPs and subscriptions
- Users (and testers) should be able to restore their purchases on a new device or after reinstallation
- Apple expects any purchased content to persist (IAPs must not expire or be lost)
- A restore mechanism must be available and easily accessible

### Implementation Requirements
- Make restore function prominent in settings or purchase areas
- Test restore functionality thoroughly
- Ensure restored purchases work immediately
- Handle edge cases like network connectivity issues during restore

## Subscription Design Requirements

### Auto-Renewable Subscriptions
- If using subscriptions, they should be auto-renewable via StoreKit
- Must provide ongoing value to justify recurring payments
- Ensure your subscription lasts at least 7 days (no very short subscription periods)
- Must work across the user's iPhone and iPad seamlessly
- A subscriber on one device should unlock features on their other devices too

### Cross-Device Functionality
- Subscription benefits must sync across all user devices
- Implement proper account linking or iCloud sync
- Test subscription status across different devices
- Ensure immediate access after subscription purchase

## Value Proposition and Transparency

### Clear Value Communication
- Clearly explain what your subscription offers
- Before asking users to subscribe, the app (and App Store description) should spell out what they get
- **Include specifics:**
  - "Access to AI assistant features"
  - "X GB cloud storage"
  - Exact features unlocked
  - Cost and billing interval
- Vague or misleading subscription pitches can lead to rejection or user complaints

### Pricing Transparency
- Display pricing fetched from StoreKit for localization and accuracy
- Do not hard-code currency or price values that could go out of sync
- Avoid exorbitant pricing that could be seen as a scam
- Apps that charge unreasonably high fees for little value might get extra scrutiny

## User Experience Requirements

### No Forced Extra Actions
- Do not force users into unrelated tasks to unlock content they paid for
- Once a user purchases a feature or subscription, the app should not require them to:
  - Rate the app
  - Share on social media
  - Complete surveys
  - Perform other unrelated actions
- Users must get what they paid for with no strings attached (aside from login if required)

### No Subscription "Bait-and-Switch"
- If your app was previously a paid app or had certain free capabilities, do not suddenly lock existing features behind a subscription
- Grandfather existing users in or continue providing what they already had access to
- Apple discourages abruptly removing functionality from users who have previously paid for the app when moving to a subscription model

## Free Trial Implementation

### Official Trial System
- If you offer a free trial, use Apple's official trial system
- Example: An introductory 7-day free trial for a subscription
- Alternatively, offer a free tier that doesn't require purchase
- Make sure the trial duration and content limitations are clear
- Must be automatically handled by the subscription (Apple will auto-renew or end the subscription)

### Non-Renewing Free Trials
- If using a non-renewing free trial (for non-subscription IAP), Apple requires:
  - It must be a zero-cost IAP with a proper label (e.g., "14-day Trial")
  - Clearly state what happens after it expires
  - Proper implementation through StoreKit

## Testing and Quality Assurance

### Subscription Flow Testing
- Test upgrade, downgrade, and cancellation flows for subscriptions
- Ensure that if a user cancels or the subscription expires, the app correctly restricts content
- If they resubscribe or the subscription is renewed, content access is restored without issues
- Apple may verify that subscribing and unsubscribing behaves correctly
- Prevent multiple overlapping subscriptions for the same content

### Edge Case Testing
- Test subscription status during network outages
- Verify behavior when subscription expires
- Test family sharing if applicable
- Ensure proper handling of subscription changes
- Test restore purchases in various scenarios

## Consumables and Credits

### Consumable IAP Implementation
- If your app uses consumable credits (e.g., tokens for AI queries), ensure purchasing uses IAP
- Credits should not expire unfairly
- Make sure the app properly handles edge cases like out-of-credit states
- Prompt the user to purchase more through IAP, not through any external means

### Credit Management
- Clearly display current credit balance
- Provide clear information about credit usage
- Implement fair expiration policies if any
- Allow users to track their credit history

## App Store Metadata and Disclosure

### Disclosure in App Store Listing
- In your App Store description and screenshots, disclose if certain features require in-app purchase
- Example: If AI image generation is a paid feature, mention "Requires Pro upgrade"
- Apple's guidelines mandate that apps clearly indicate which content or features require additional purchases
- Use screenshot captions to clarify premium features

### App Store Connect Configuration
- Set your IAP prices according to Apple's price tiers in App Store Connect
- Ensure all IAP products are properly configured and "Ready to Submit"
- Test IAP products in sandbox environment before submission
- Verify IAP metadata is complete and accurate

## Review Notes and Testing

### App Store Review Notes for IAP
- If any in-app purchases are not easily accessible to the reviewer, explain in the review notes how to test them
- Examples of when this is needed:
  - IAPs behind an account wall
  - IAPs that depend on server conditions
  - IAPs that require specific user actions to unlock
- You might include a promo code or a demo subscription if appropriate
- Without this, reviewers might think the IAP isn't working and could reject the app

### Demo Accounts and Testing
- Provide test accounts that have access to premium features
- Include instructions for testing subscription flows
- Ensure backend systems are stable during review period
- Test all IAP functionality in sandbox before submission

## Implementation Checklist

### Basic IAP Setup
- [ ] All digital content uses Apple's IAP system
- [ ] No external purchase links or mentions in the app
- [ ] Restore Purchases function implemented and tested
- [ ] IAP products configured in App Store Connect

### Subscription-Specific
- [ ] Auto-renewable subscriptions implemented via StoreKit
- [ ] Cross-device subscription sync working
- [ ] Subscription duration meets minimum requirements (7+ days)
- [ ] Clear value proposition communicated to users

### User Experience
- [ ] No forced actions required after purchase
- [ ] Clear pricing and feature information displayed
- [ ] Free trial properly implemented if offered
- [ ] Grandfathering policy for existing users if applicable

### Testing and Quality
- [ ] All subscription flows tested (subscribe, cancel, restore)
- [ ] Edge cases handled (network issues, expiration, etc.)
- [ ] Consumable credits system tested if applicable
- [ ] Demo accounts prepared for App Review

### Metadata and Disclosure
- [ ] Premium features disclosed in App Store description
- [ ] Screenshots clearly indicate paid features
- [ ] Review notes include IAP testing instructions
- [ ] All IAP metadata complete and accurate

## Common Pitfalls to Avoid

### Technical Issues
- Hard-coding prices instead of using StoreKit
- Not implementing restore purchases functionality
- Subscription benefits not syncing across devices
- Poor handling of subscription state changes

### Policy Violations
- Mentioning external payment options
- Forcing unrelated actions after purchase
- Misleading subscription descriptions
- Removing previously free features without grandfathering

### User Experience Problems
- Unclear value proposition for subscriptions
- Difficult-to-find restore purchases option
- Poor communication of what's included in purchases
- Unfair credit expiration policies 