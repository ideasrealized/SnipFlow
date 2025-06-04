---
description: 
globs: 
alwaysApply: false
---
# Secret Key Generation Best Practices

## Overview

This document outlines the standard procedures for generating, managing, and storing secret keys in the Agentopia project. Following these guidelines ensures consistency, security, and proper implementation across the codebase.

## Secret Key Types and Purposes

| Key Type | Purpose | Typical Length | Storage Location |
|----------|---------|----------------|------------------|
| API Keys | Authentication between services | 32+ bytes (64+ hex chars) | Environment variables, Supabase Vault |
| Auth Tokens | User/agent authentication | 32+ bytes (64+ hex chars) | Supabase Vault, Database (hashed) |
| Encryption Keys | Data encryption | 32 bytes (64 hex chars) | Supabase Vault |
| Session Tokens | Temporary user sessions | 16+ bytes (32+ hex chars) | Redis, Database (with expiry) |

## Generation Methods

### Node.js

```javascript
// For hex output (preferred for most API keys, secrets)
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
// Output: 64 character hex string

// For URL-safe base64
const urlSafeKey = crypto.randomBytes(32).toString('base64url');
```

### Command Line

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL (if available)
openssl rand -hex 32

# Using PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[System.BitConverter]::ToString($bytes).Replace('-', '').ToLower()
```

## Implementation Rules

1. **NEVER hardcode secret keys in source code**
   - Always use environment variables, configuration files, or secure vaults

2. **Use appropriate key length**
   - Minimum 16 bytes (32 hex chars) for less critical keys
   - Minimum 32 bytes (64 hex chars) for security-critical keys

3. **Use cryptographically secure random number generators**
   - Node.js: crypto.randomBytes()
   - Avoid Math.random() or other non-cryptographic generators

4. **Rotate keys periodically**
   - Implement key rotation strategies for long-lived systems
   - Design systems to support multiple valid keys during transition periods

5. **Log access to key generation**
   - Do not log the actual keys
   - Log when and by whom keys were generated/rotated

## Storage Guidelines

1. **Environment variables**
   - Primary method for application runtime
   - Store in .env file (ensure .env is in .gitignore)
   - Sample variables in env-sample.txt (without actual keys)

2. **Supabase Vault**
   - For long-term storage and API keys
   - Access pattern:
   ```javascript
   const { data, error } = await supabase
     .rpc('get_secret', { secret_id: secretId })
     .single();
   ```

3. **Database (when necessary)**
   - Store authentication tokens as hashed values when possible
   - Include creation timestamp and expiry
   - Associate with specific user/agent

## Examples

### Generating a new Internal API Secret

```javascript
// Generate the key
const internalApiSecret = require('crypto').randomBytes(32).toString('hex');
console.log(`New Internal API Secret: ${internalApiSecret}`);

// Store in Supabase Vault
const { data, error } = await supabase
  .rpc('create_secret', { 
    name: 'internal_api_secret', 
    value: internalApiSecret,
    description: 'Secret for internal API authentication' 
  });

// Update in .env file (manual step)
// INTERNAL_API_SECRET=your_generated_secret
```

### Verification Example

```javascript
// Middleware to verify internal API secret
const verifyInternalApiSecret = (req, res, next) => {
  const providedSecret = req.headers['x-internal-api-secret'];
  
  if (!providedSecret || providedSecret !== process.env.INTERNAL_API_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  next();
};
```

## Security Considerations

1. **Transport security**
   - Always transmit secrets over encrypted connections (HTTPS, SSH)
   - Never send secrets via email, chat, or other insecure channels

2. **Access restrictions**
   - Limit access to secret keys to necessary personnel only
   - Use role-based access control for vault access

3. **Monitoring and auditing**
   - Log access attempts to secret keys (successful and failed)
   - Regularly audit key usage and validity

