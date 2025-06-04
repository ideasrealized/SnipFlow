# Prohibited Content and Behavior Guidelines

## Overview
This document outlines what content and behaviors are strictly prohibited by Apple's App Store Guidelines. Violating these rules will result in app rejection or removal.

## Content Restrictions

### Objectionable Content
- The app (including AI-generated output) must not contain or facilitate objectionable content
- **Prohibited:**
  - Hate speech
  - Defamatory or mean-spirited material targeting race, religion, gender, sexual orientation, etc.
  - Content that harasses, bullies, or intimidates individuals or groups

### Violence and Harm
- No realistic depictions of extreme violence or abuse toward people or animals
- No content that encourages violent or illegal acts
- Avoid features that could potentially facilitate physical harm
- **Example:** An AI shouldn't generate instructions for making weapons or engage in harassment

### Pornography and Sexually Explicit Material
- No pornographic or overtly sexual content is allowed
- The app should not generate or distribute explicit sexual material
- Even "NSFW" or erotic AI outputs are not permitted unless hidden behind strict filters and age restrictions
- **Note:** Even with restrictions, highly discouraged by Apple

### False or Misleading Functions
- Apps may not include false information or deceptive functionality
- **Prohibited Examples:**
  - Fake virus scanner
  - "AI that guarantees lottery wins"
  - Prank features that trick users (fake system alerts, etc.)
- Clearly label entertainment-only features as such
- **Important:** Saying "for entertainment" won't excuse a guideline violation

### Sensitive Current Events
- Avoid capitalizing on or profiting from recent sensitive events
- **Examples:** War, terrorist incidents, pandemics, etc.
- Any AI content related to such events must be handled with care
- Must not be in poor taste

### Illegal Activities
- The app must not promote the use of illegal drugs
- Cannot facilitate the purchase of controlled substances
- No content that encourages crime or reckless behavior
- No features should enable unlawful content creation
- **Examples:** AI that generates illegal advice or fraudulent material

## User-Generated Content (UGC) Compliance

### Moderation Requirements
If users can input content or share outputs (e.g., sharing AI-generated notes or media), you must moderate UGC:

- **Content filtering** for objectionable material
- **Mechanism to report** offensive content
- **Ability to block** abusive users
- Include in-app user reporting tools
- Have moderators (automated or human) to quickly remove violations

### UGC Restrictions
- Apps primarily used for pornographic or exploitative UGC will be rejected
- Ensure your AI's output and any user-shared content stay within acceptable bounds

## Technical and Behavioral Restrictions

### No Hidden or Undocumented Features
- Don't include any hidden Easter eggs, debug menus, or features that are not disclosed
- The app's functionality should be transparent to the user and to Apple
- All features must be declared in your review notes if they're not obvious
- Enabling new features or remote content after review (that weren't present during review) can lead to removal

### No Private APIs or Unauthorized Tech
- Use only public APIs and frameworks
- Apps that use unpublished Apple APIs will be rejected
- Don't attempt to download/execute unapproved code
- Don't break sandbox rules
- **Example:** Don't attempt to dynamically load new executable code from your server
- **Note:** Server-side processing is fine, but the app itself should not change its behavior in ways Apple hasn't reviewed

### Respect Intellectual Property
- Ensure all content in the app (including AI-generated media) does not infringe copyrights or trademarks
- Any third-party content (like sample documents, images, or text used in prompts) should be licensed or your own
- Do not use Apple's trademarks or UI elements inappropriately
- Misusing brands, or copying another app's design too closely, can cause rejection or legal issues

### No Spam or Duplicate Apps
- Your app should be unique and useful
- Do not simply clone an existing app or template without adding value
- Avoid spammy behavior like using irrelevant keywords
- Don't submit multiple similar apps
- Apple's guidelines require that each app offers a meaningful experience
- Must not be just a thin wrapper around a website or AI with no distinct value

## Compliance Checklist

### Content Review
- [ ] Review all possible AI outputs for prohibited content
- [ ] Implement content filtering systems
- [ ] Test moderation tools for user-generated content
- [ ] Verify no hidden or undocumented features exist

### Legal Compliance
- [ ] Ensure no intellectual property violations
- [ ] Verify all third-party content is properly licensed
- [ ] Check that app doesn't facilitate illegal activities
- [ ] Confirm no misleading or false functionality

### Technical Compliance
- [ ] Use only public APIs and frameworks
- [ ] Remove any debug or test features
- [ ] Ensure app functionality is transparent
- [ ] Verify no unauthorized code execution

## Risk Mitigation

### For AI-Powered Apps
- Implement robust content filtering for AI outputs
- Monitor and log problematic content generation
- Have clear policies for handling inappropriate user inputs
- Regularly update filtering systems based on new violations

### Documentation
- Clearly document all app features for reviewers
- Explain any complex AI functionality
- Provide examples of typical AI outputs
- Include content moderation policies in review notes

## Red Flags to Avoid
- Any content that could be considered hate speech
- AI outputs that could facilitate harm or illegal activity
- Hidden functionality not disclosed to Apple
- Use of private or unauthorized APIs
- Misleading app descriptions or functionality claims
- Inadequate content moderation for user-generated content 