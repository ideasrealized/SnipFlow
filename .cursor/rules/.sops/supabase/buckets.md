# SOP: Creating Supabase Storage Buckets (Cloud)

This document outlines the standard procedure for creating storage buckets in a cloud-hosted Supabase project.

## Procedure: Creating the `client-logos` Bucket

**Objective:** To create a publicly accessible storage bucket named `client-logos` for storing client logo files.

**Prerequisites:**

*   Access to the Supabase project dashboard.
*   Appropriate permissions to create storage buckets.

**Steps:**

1.  **Navigate to Supabase Dashboard:**
    *   Log in to your Supabase account at [https://app.supabase.com](https://app.supabase.com).
    *   Select the appropriate project from your list of projects.

2.  **Access Storage Section:**
    *   In the project dashboard, locate the left-hand sidebar.
    *   Click on the "Storage" icon (it usually looks like a database cylinder or a stack of discs).

3.  **Initiate New Bucket Creation:**
    *   On the Storage page, you will see a list of existing buckets (if any).
    *   Click on the "+ New bucket" or "Create bucket" button (the exact wording might vary slightly).

4.  **Configure Bucket Details:**
    *   A dialog or form will appear for the new bucket's configuration.
    *   **Name:** Enter `client-logos`.
        *   *Note: Bucket names must be unique and follow AWS S3 naming conventions (e.g., no uppercase letters, no underscores, use hyphens for separation).*
    *   **Public bucket:** Toggle this option to **ON**. This makes files accessible via a public URL by default, though access can be further refined with RLS policies.
    *   **(Optional) Allowed MIME types:** You can specify allowed file types (e.g., `image/png`, `image/jpeg`). For logos, this is recommended.
    *   **(Optional) File size limit:** You can set a maximum file size for uploads.

5.  **Confirm Creation:**
    *   Once all details are entered correctly, click the "Create bucket", "Save", or "Confirm" button.

6.  **Verification:**
    *   The `client-logos` bucket should now appear in your list of storage buckets.

## Next Steps

*   Define and apply Row Level Security (RLS) policies to the `client-logos` bucket and its objects to control specific actions like uploads, updates, and deletes, even if the bucket is public for reads.

---_SOPS_DOCUMENT_END_--- 