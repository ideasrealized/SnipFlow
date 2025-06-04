---
description: 
globs: 
alwaysApply: false
---
# Netlify Deployment Guide for Agent Tool Infrastructure

This guide will help you configure the Agent Tool Infrastructure to work with your Netlify-deployed Agentopia application.

## 1. Netlify Environment Variables

In your Netlify dashboard, add the following environment variables:

```bash
# DigitalOcean API Configuration
DO_API_TOKEN=your_do_api_token_here

# Droplet Configuration Defaults
DO_DEFAULT_REGION=nyc3
DO_DEFAULT_SIZE=s-1vcpu-1gb
DO_DEFAULT_IMAGE=ubuntu-22-04-x64
DO_BACKUP_ENABLED=false
DO_MONITORING=true

# DTMA Configuration
DTMA_GIT_REPO_URL=https://github.com/maverick-software/dtma-agent.git
DTMA_GIT_BRANCH=main

# Agentopia API Configuration
AGENTOPIA_API_URL=https://your-netlify-app.netlify.app/functions/v1
INTERNAL_API_SECRET=your_random_secret_here

# Supabase Configuration 
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 2. Update Agent Environment Service

The agent environment service needs to be updated to work with Netlify's function URLs:

1. In `src/services/agent_environment_service/manager.ts`:
   - Ensure the `createUserDataScript` function points to your Netlify URL
   - Update the `apiUrl` variable to the format: `https://your-netlify-app.netlify.app/functions/v1`

2. For offline testing, use the offline mode scripts which avoid the need for a public API URL.

## 3. Configure the DTMA Agent

In your `dtma-agent` repository (GitHub):

1. Update `src/agentopia_api_client.ts` to handle Netlify function URLs:
   - Modify the path handling to work with Netlify's URL structure
   - Add the appropriate authentication headers
   - Use absolute URLs for API endpoints

## 4. Testing with Offline Mode

For local development and testing:

1. Use the offline deployment script:
   ```bash
   node scripts/offline-deployment-test.js
   ```

2. This script:
   - Creates a real DigitalOcean droplet 
   - Sets up DTMA in offline mode (no API calls required)
   - Logs information about would-be API calls
   - Lets you verify the deployment process works correctly

3. To clean up:
   ```bash
   node scripts/deprovision-offline-droplet.js
   ```

## 5. Production Deployment

For production use with Netlify:

1. Set up Supabase functions to handle droplet communication
2. Configure Netlify redirects for function calls 
3. Generate a secure INTERNAL_API_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Set up database tables for agent droplet tracking:
   ```sql
   -- Make sure this table exists in your Supabase database
   CREATE TABLE IF NOT EXISTS agent_droplets (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
     do_droplet_id TEXT NOT NULL,
     name TEXT,
     ip_address TEXT,
     status TEXT NOT NULL,
     region_slug TEXT NOT NULL,
     size_slug TEXT NOT NULL,
     image_slug TEXT NOT NULL,
     tags TEXT[],
     dtma_auth_token TEXT,
     dtma_last_known_version TEXT,
     dtma_last_reported_status TEXT,
     error_message TEXT,
     configuration JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## 6. Security Considerations

1. DTMA auth tokens should be securely generated and stored
2. All API communication should use HTTPS
3. Consider implementing rate limiting for API endpoints
4. Implement proper error handling for network failures

## 7. Troubleshooting

If you encounter issues with the Netlify deployment:

1. Check Netlify function logs for errors
2. Verify environment variables are set correctly
3. Use offline mode for initial testing
4. SSH into droplets to check logs: `/var/log/dtma-bootstrap.log`
5. Check DTMA service status: `sudo systemctl status dtma` 