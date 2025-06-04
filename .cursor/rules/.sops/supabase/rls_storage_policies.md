# SOP: RLS Policies for Supabase Storage Buckets (Cloud)

This document outlines the standard procedure for applying Row Level Security (RLS) policies to storage buckets in a cloud-hosted Supabase project, specifically for the `client-logos` bucket.

## Objective

To secure the `client-logos` storage bucket by defining who can read, upload, update, and delete logo files.

**Bucket:** `client-logos`

## Prerequisites

*   The `client-logos` storage bucket has been created in the Supabase project.
*   Access to the Supabase project dashboard, specifically the SQL Editor.
*   Appropriate permissions to create and alter policies.

## RLS Policies for `client-logos`

The following SQL statements define the RLS policies. They should be executed in the Supabase SQL Editor.

### 1. Public Read Access for Logos

This policy allows anyone to view/download files from the `client-logos` bucket. This is suitable for publicly displaying logos.

```sql
CREATE POLICY "Public Read Access for client-logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'client-logos');
```

### 2. Authenticated Users Can Upload Logos

This policy allows any authenticated user to upload new files to the `client-logos` bucket.

```sql
CREATE POLICY "Authenticated User Upload for client-logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-logos');
```
*   **Note:**  For more granular control, you might later refine this to allow uploads only to specific paths based on `client_id` or user roles.

### 3. Authenticated Users Can Update Logos

This policy allows any authenticated user to update existing files within the `client-logos` bucket.

```sql
CREATE POLICY "Authenticated User Update for client-logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-logos')
WITH CHECK (bucket_id = 'client-logos');
```
*   **Security Note:** This is a permissive policy. Ideally, users should only be able to update logos they "own" or are specifically authorized to manage. This typically involves checking `auth.uid()` against an `owner_id` column (which Supabase Storage can populate if configured) or a path naming convention. This policy can be refined later as your application's ownership model for logos becomes clearer.

### 4. Authenticated Users Can Delete Logos

This policy allows any authenticated user to delete files from the `client-logos` bucket.

```sql
CREATE POLICY "Authenticated User Delete for client-logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-logos');
```
*   **Security Note:** Similar to updates, this is permissive. Refine this policy later based on ownership or specific permissions.

## Procedure: Applying RLS Policies

1.  **Navigate to Supabase SQL Editor:**
    *   Log in to your Supabase project dashboard.
    *   In the left-hand sidebar, click on the "SQL Editor" icon (usually looks like `</>`).
    *   Click "+ New query".

2.  **Execute Policies:**
    *   Copy each `CREATE POLICY` SQL statement provided above, one at a time.
    *   Paste it into the SQL Editor.
    *   Click "RUN" (or Ctrl+Enter / Cmd+Enter).
    *   Verify that a success message is displayed for each policy creation.

3.  **Verify Policies (Optional but Recommended):**
    *   After creating the policies, you can view them in the Supabase Dashboard:
        *   Go to "Authentication" -> "Policies".
        *   Search for the table `objects` (you might need to select the `storage` schema).
        *   You should see the newly created policies listed for the `objects` table, targeting the `client-logos` bucket.

## Important Considerations

*   **Order of Policies:** RLS policies are permissive. If any policy grants access, the user will have access, provided no `DENY` policies (not used here) block it.
*   **Ownership and Granularity:** The provided policies for `INSERT`, `UPDATE`, and `DELETE` are broad (any authenticated user). As your application evolves, consider:
    *   Using file path conventions (e.g., `/client-logos/{client_id}/logo.png`) and writing RLS policies that check `auth.uid()` against a `clients` table where user-client relationships are stored.
    *   Leveraging the `owner` field that Supabase Storage can automatically populate on upload, and using `auth.uid() = owner` in your `USING` and `WITH CHECK` clauses for update/delete.
*   **Testing:** Thoroughly test file upload, download, update, and delete operations with different user states (anonymous, authenticated) to ensure policies work as expected.

---_SOPS_DOCUMENT_END_--- 