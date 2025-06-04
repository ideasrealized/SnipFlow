# Standard Operating Procedure: User Roles & Permissions Integration (Supabase & Vite)

## 1. Objective

This SOP outlines the standard steps for implementing the defined user roles, permissions, and management features within the CatalystHQ application. It covers backend setup using Supabase (including database schema, helper functions, and Row Level Security) and frontend integration using Vite/React (including user context management and permission-driven UI rendering).

## 2. Prerequisites & Key References

### Prerequisites:
-   Supabase project initialized and accessible.
-   Vite/React frontend project set up.
-   Supabase CLI installed and configured for the project.
-   Familiarity with CatalystHQ's existing codebase structure.

### Key Reference Documents:
-   **User Personas & Use Cases:** `docs/design/UserRolesPersonas.md`
-   **Granular Permissions Matrix:** `docs/design/GranularPermissionsMatrix.md`
-   **Supabase Data Model DDL:** `docs/design/SupabaseDataModel_UserRoles.md`
-   **Permissions Technology & Architecture Strategy:** `docs/design/PermissionsTechStrategy.md`
-   **Overall WBS Checklist:** `docs/plans/UserRolesAndPermissions/wbs_checklist.md`

## 3. Procedure

This procedure follows the implementation phases outlined in the WBS checklist.

### Phase 1: Supabase Backend Setup (Corresponds to WBS P1)

#### Step 1.1: Create Database Migrations for Schema

Generate Supabase migration files for all DDL changes defined in `docs/design/SupabaseDataModel_UserRoles.md`. Create separate, logically grouped migration files.

**General Migration Process:**
1.  Create a new migration file: `supabase migration new <descriptive_migration_name>` (e.g., `create_user_roles_enums`, `create_profiles_table`).
2.  Copy the relevant SQL DDL from `SupabaseDataModel_UserRoles.md` into the new migration file.
3.  For local development, apply migrations: `supabase db push` (if no conflicts and local schema is disposable) or apply individual migrations using a GUI or `psql`. For staging/production, use `supabase migration up` after linking the project.

**Specific Migrations to Create:**

1.  **ENUM Types:**
    *   Migration Name: `create_user_roles_enums`
    *   DDL: `CREATE TYPE public.global_user_role ...`, `CREATE TYPE public.team_member_status ...`
2.  **`profiles` Table:**
    *   Migration Name: `create_profiles_table`
    *   DDL: `CREATE TABLE public.profiles ...` (including trigger function `handle_updated_at` and trigger `on_profiles_updated`).
    *   **Note:** If a `profiles` or similar user table already exists, this migration will be an `ALTER TABLE` script. Review WBS 3.1.2.
3.  **`clients` Table Modifications:**
    *   Migration Name: `alter_clients_add_owner_auth_id`
    *   DDL: `ALTER TABLE public.clients ADD COLUMN owner_auth_user_id ...` (including idempotent trigger function/creation if needed).
4.  **`team_members` Table:**
    *   Migration Name: `create_team_members_table`
    *   DDL: `CREATE TABLE public.team_members ...` (including its `updated_at` trigger).
5.  **`client_defined_roles` Table:**
    *   Migration Name: `create_client_defined_roles_table`
    *   DDL: `CREATE TABLE public.client_defined_roles ...` (including its `updated_at` trigger).
6.  **`team_member_assigned_roles` Table:**
    *   Migration Name: `create_team_member_assigned_roles_table`
    *   DDL: `CREATE TABLE public.team_member_assigned_roles ...`

#### Step 1.2: Implement SQL Helper Functions

Create a new migration file for the SQL helper functions detailed in `docs/design/PermissionsTechStrategy.md` (Section 4.1.2).

*   Migration Name: `create_permissions_helper_functions`
*   Content: Include all functions like `public.get_user_global_role`, `public.is_team_member_of_client`, `public.user_has_client_permission`, etc.
*   **Critical:** Ensure functions that query across tables for permission aggregation (like `user_has_client_permission`) are created with `SECURITY DEFINER`. Other simpler functions can be `SECURITY INVOKER`.

#### Step 1.3: Implement Initial Row Level Security (RLS) Policies

Enable RLS for all new tables and begin implementing policies as outlined in `docs/design/PermissionsTechStrategy.md` (Section 4.1.1).

1.  **Enable RLS:** For each table: `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`
2.  **Default Deny:** Consider adding a default deny policy initially if no other policies exist: `CREATE POLICY "Default Deny" ON public.<table_name> FOR ALL USING (FALSE);`
3.  **Implement Specific Policies:**
    *   Start with `public.profiles` (e.g., user can see/edit their own, admins can see all).
    *   Implement policies for `public.clients` (e.g., client owner can manage, team members via helper function).
    *   Gradually add policies for `team_members`, `client_defined_roles`, and other data tables, extensively using the helper functions created in Step 1.2.
    *   RLS policies can be added in new migration files or grouped logically.

#### Step 1.4: Seed Initial Data (Optional)

*   If necessary, seed data like default platform roles or system settings. This can be done via a migration script or manually for development. (WBS P1.2)

### Phase 2: Frontend Core Integration (Vite/React) (Corresponds to WBS P2)

#### Step 2.1: Enhance User Context/State Management

Implement or update a React Context (e.g., `UserSessionContext`) to manage user authentication state, profile information, and permissions as per `docs/design/PermissionsTechStrategy.md` (Section 4.2.1).

*   On login/session load, fetch the user's Supabase `auth.user()` and their corresponding `public.profiles` record.
*   Store `auth_user_id`, `profile_id`, `global_role`, `default_client_id`, etc., in the context.
*   Implement a mechanism to determine and store the `active_client_id` (e.g., from URL parameters).

#### Step 2.2: Fetch and Store Granular Permissions

When the `active_client_id` is established in the frontend context:
1.  Call the Supabase Edge Function `get_my_client_permissions` (to be developed in Phase 3) with the `active_client_id`.
2.  Store the returned array of permission strings in the `UserSessionContext`.
3.  This data should be refreshed if the `active_client_id` changes or if roles/permissions are modified.

#### Step 2.3: Implement Frontend Permission Checking Mechanisms

Develop the reusable components and hooks for checking permissions, as defined in `docs/design/PermissionsTechStrategy.md` (Section 4.2.2).

1.  **`useUserSession()` Hook:**
    *   Provides access to user profile, `global_role`, `activeClientId`, and the array of `permissions` for that client.
    *   Includes methods: `hasPermission(permissionKey: string): boolean` and `hasGlobalRole(roleOrRoles: GlobalUserRole | GlobalUserRole[]): boolean`.
2.  **`<RequirePermission permission="key">` Component/HOC:**
    *   Conditionally renders children based on `hasPermission()`.
3.  **`<RequireGlobalRole role={['ROLE_1', 'ROLE_2']}>` Component/HOC:**
    *   Conditionally renders children based on `hasGlobalRole()`.

### Phase 3: Supabase Edge Function Development (Corresponds to WBS P1.5, P5.1, P6.1)

Develop and deploy the Supabase Edge Functions identified in `docs/design/PermissionsTechStrategy.md` (Section 4.3.1).

**General Edge Function Development Process:**
1.  Use Supabase CLI: `supabase functions new <function_name>`.
2.  Implement the function logic in TypeScript.
3.  Test locally: `supabase functions serve`.
4.  Deploy: `supabase functions deploy <function_name>`.

**Edge Functions to Implement:**
1.  `get_my_client_permissions`
2.  `invite_team_member`
3.  `accept_team_invitation`
4.  `manage_client_defined_role` (and its sub-functions for create, update, delete if designed as separate or action-based).

### Phase 4: Role-Specific UI/UX Implementation (Corresponds to WBS P3-P8)

This phase involves building the actual user interfaces for different roles, leveraging the backend and frontend permission systems.

*   **Super Admin/Developer:** Implement admin dashboards, user management UIs, client account overview, etc. Protect these routes and features using `<RequireGlobalRole>`.
*   **Client:**
    *   Ensure existing client-facing UIs continue to work, now secured by RLS.
    *   Build UI for inviting team members (calling `invite_team_member` Edge Function).
    *   Build UI for managing client-defined roles (calling `manage_client_defined_role` Edge Functions) and assigning them to team members. Use `<RequirePermission>` for these actions.
*   **Team Member:**
    *   UI should dynamically adapt based on permissions fetched via `get_my_client_permissions` and checked with `<RequirePermission>` or `useUserSession().hasPermission()`.
    *   Handle UI for context switching if a user can be a team member of multiple clients.
*   **Support Representative:** Implement UIs for searching clients, viewing client data (read-only where appropriate), and performing support actions (with strict auditing).

### Phase 5: Comprehensive Testing (Corresponds to WBS P9)

Thoroughly test all aspects of the roles and permissions system.

1.  **Backend Testing:**
    *   Use SQL queries with `SET ROLE` or by authenticating as different test users (via Supabase client library in test scripts) to verify RLS policies.
    *   Test SQL helper functions directly with various inputs.
    *   Unit/integration test Supabase Edge Functions.
2.  **Frontend Testing:**
    *   Create test user accounts for each global role and various team member permission configurations.
    *   Manually verify UI elements appear/are disabled correctly.
    *   Write integration tests for permission-gated components and features.
    *   Perform end-to-end testing for key user flows (e.g., inviting a team member, assigning a role, accessing a restricted feature).
3.  **Security Review:**
    *   Review RLS policies for correctness and completeness (especially default deny and coverage of all operations).
    *   Review security of Edge Functions (input validation, authentication/authorization checks).

### Phase 6: Audit Logging Integration (Reference WBS IV)

If the Client Account Audit Logging feature is being developed:
1.  Ensure Supabase Edge Functions and any direct backend modifications that alter client data create entries in the `audit_log_entries` table.
2.  Implement UI components for viewing audit logs, respecting permissions defined in the `GranularPermissionsMatrix.md` (e.g., Clients see their own logs, Super Admins/Support Reps see logs for clients they access).

## 4. Maintenance & Updates

*   **Changes to Roles/Permissions:**
    1.  Update design documents (`GranularPermissionsMatrix.md`, `UserRolesPersonas.md`).
    2.  If data model changes: create new Supabase migrations.
    3.  If helper functions change: update/create new migration.
    4.  Update RLS policies accordingly (new/altered migration).
    5.  Update/Create new Edge Functions if API changes.
    6.  Update frontend permission keys, `UserSessionContext`, and UI components.
    7.  Update this SOP if the process changes.
*   **Dependency Updates:** Regularly update Supabase CLI, Supabase client libraries, and frontend dependencies, testing thoroughly after updates.

## 5. Troubleshooting

*   **RLS Issues:**
    *   Use `EXPLAIN` on queries to understand how RLS policies are being applied.
    *   Temporarily disable RLS on a table for debugging (with caution, only in dev).
    *   Test policies by running queries as specific users: `SET ROLE authenticated; SET request.jwt.claims = '{"sub":"user-uuid", "role":"authenticated"}'; SELECT ...`
*   **Edge Function Debugging:**
    *   Use `console.log` within functions; view logs via `supabase functions serve` (local) or Supabase Dashboard (deployed).
    *   Test functions with tools like Postman or `curl`.
*   **Frontend Context/Permission Issues:**
    *   Use React Developer Tools to inspect context values.
    *   Add logging within `useUserSession()` hook and permission components.
    *   Verify `active_client_id` is correctly set and `get_my_client_permissions` is being called and returning expected data.

---
This SOP provides a structured approach. Adapt details as necessary based on specific project conditions and evolving requirements. 