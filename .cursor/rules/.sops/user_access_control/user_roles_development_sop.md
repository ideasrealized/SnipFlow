# Standard Operating Procedure: User Roles & Permissions Development

This document outlines the standard procedure for creating, managing, and developing user roles and their associated granular permissions within the CatalystHQ application. It is based on the refactored roles system utilizing the `roles` and `user_roles` tables.

## 1. Core System Components

-   **`public.roles` Table:**
    -   `id` (UUID, PK): Unique identifier for the role.
    -   `name` (TEXT, Unique): Internal, machine-readable name (e.g., "SUPER_ADMIN", "CLIENT_PROJECT_MANAGER"). Used in code and for permission checks.
    -   `display_name` (TEXT): User-friendly name for UI display (e.g., "Super Admin", "Project Manager (Client)").
    -   `description` (TEXT): Optional description of the role's purpose.
    -   `permissions` (JSONB): An array of permission strings that this role grants. E.g., `["clients.read", "projects.create"]`.
    -   `role_type` (TEXT): Defines the scope of the role. Must be one of:
        -   `'GLOBAL'`: Applies platform-wide.
        -   `'CLIENT_CONTEXTUAL'`: Applies only within the context of a specific client.
    -   `created_at`, `updated_at`: Timestamps.

-   **`public.user_roles` Table:**
    -   `id` (UUID, PK): Unique identifier for the assignment.
    -   `user_id` (UUID, FK to `auth.users.id`): The user being assigned the role.
    -   `role_id` (UUID, FK to `public.roles.id`): The role being assigned.
    -   `client_id` (UUID, FK to `public.clients.id`, Nullable): The client context for the role assignment.
        -   If `NULL`, the role assignment is global (applies to `GLOBAL` type roles).
        -   If populated, the role assignment is specific to that client (applies to `CLIENT_CONTEXTUAL` type roles, or `GLOBAL` roles being assigned in a client context if design allows).
    -   `created_at`: Timestamp.
    -   **Unique Constraints:**
        -   `unique_global_user_role (user_id, role_id) WHERE client_id IS NULL`
        -   `unique_client_user_role (user_id, role_id, client_id) WHERE client_id IS NOT NULL`

-   **Key SQL Helper Functions:**
    -   `get_user_global_role_names(p_user_id UUID)`: Returns an array of `name`s for global roles assigned to a user.
    -   `check_user_has_permission(p_user_id UUID, p_permission TEXT, p_client_id UUID DEFAULT NULL)`: Checks if a user has a specific permission, either globally or within a client context.

## 2. Permission String Conventions

Permissions should follow a consistent naming convention to ensure clarity and maintainability.

-   **Format:** `resource.action` or `resource.sub_resource.action`.
-   **Examples:**
    -   `clients.create`
    -   `clients.read`
    -   `clients.update`
    -   `clients.delete`
    -   `projects.assign_user`
    -   `users.manage_global_roles` (a meta-permission for admin functions)
    -   `client.settings.update` (client-contextual setting)
    -   `platform.manage_billing` (global platform feature)
-   **Special Permissions:**
    -   `platform.*`: Wildcard permission granting all platform-level access (typically only for SUPER_ADMIN).
    -   `client.users.assign_role.[ROLE_NAME]`: Meta-permission to allow assigning a specific client-contextual role (e.g., `client.users.assign_role.CLIENT_PROJECT_MANAGER`).

## 3. Defining and Creating New Roles

### 3.1. Analysis & Design

1.  **Identify Need:** Determine the purpose of the new role and the level of access required.
2.  **Define Scope:** Is it a `GLOBAL` role or `CLIENT_CONTEXTUAL`?
3.  **List Permissions:** Enumerate all specific permission strings the role should grant. Refer to existing permissions and the convention.
4.  **Choose Names:**
    -   `name`: A concise, uppercase, underscore_separated string (e.g., `PROJECT_VIEWER`).
    -   `display_name`: A human-readable string for UIs (e.g., "Project Viewer").
    -   `description`: Clearly explain what users with this role can do.

### 3.2. Implementation Methods

**A. Seeding via SQL Migration (Preferred for Core/Static Roles):**

   - Create a new SQL migration file in `supabase/migrations/` (e.g., `YYYYMMDDHHMMSS_seed_new_custom_roles.sql`).
   - Insert the role definition into the `public.roles` table.
   - **Example:**
     ```sql
     INSERT INTO public.roles (name, display_name, description, permissions, role_type)
     VALUES 
       ('PROJECT_VIEWER', 'Project Viewer', 'Can view project details but cannot make changes.', '["projects.read", "clients.read_assigned_projects"]'::jsonb, 'GLOBAL'),
       ('CLIENT_DOC_APPROVER', 'Client Document Approver', 'Can approve documents uploaded for a specific client.', '["client.documents.approve"]'::jsonb, 'CLIENT_CONTEXTUAL');
     ```
   - Run `npx supabase db push` to apply the migration.
   - Regenerate Supabase types: `npx supabase gen types typescript --project-id your_project_id --schema public > src/types/supabase.ts`

**B. Dynamic Role Creation via UI (Future Enhancement - Requires Admin UI):**

   - If an admin interface for role management (e.g., enhancing `RolesManagementPage.tsx`) is built, it would interact with the `roles` table (CRUD operations).
   - This UI would need to be protected by a high-level permission (e.g., `platform.manage_roles`).

## 4. Assigning Roles to Users

-   **Global Roles:**
    -   Assigned via the "Team Management" page (`src/pages/admin/UserManagementPage.tsx`).
    -   When a global role is assigned here, an entry is made in `user_roles` with the `user_id`, the `role_id` of the selected global role, and `client_id` set to `NULL`.

-   **Client-Contextual Roles:**
    -   Assigned within the context of a specific client, typically via the "Client Users" tab (`src/components/clientDetails/tabs/ClientUsersTabContent.tsx`).
    -   When a role is assigned here, an entry is made in `user_roles` with the `user_id`, the `role_id` of the selected client-contextual (or applicable global) role, and the relevant `client_id`.

## 5. Checking Permissions & Enforcing Access Control

**A. Backend (RLS Policies & SQL Functions):**

   - **RLS Policies:** Secure data access at the database level. Policies should leverage the `check_user_has_permission()` function.
     - **Example RLS (Conceptual):**
       ```sql
       CREATE POLICY "Allow read access to projects based on permission" ON public.projects
       FOR SELECT USING (
         auth.uid() IS NOT NULL AND
         check_user_has_permission(auth.uid(), 'projects.read', projects.client_id) -- Assumes projects has client_id
       );
       ```
   - **SQL Helper `check_user_has_permission`:** This is the primary function for permission checks. It aggregates permissions from all roles assigned to the user (both global and relevant client-contextual if `p_client_id` is provided).

**B. Frontend (React):**

   - **`AuthContext.tsx` (`useAuth()`):**
     -   `currentUser.globalRoleNames`: Array of internal names of the user's GLOBAL roles.
     -   `clientPermissions`: Array of permission strings for the currently active client context (derived by `get-my-client-permissions` Edge Function).
   - **`RequireGlobalRole` Component:** Restricts access to components/pages based on the user possessing one of the specified global role names.
   - **`RequirePermission` Component (Conceptual - to be built if needed):** Would restrict access based on the user having a specific permission string from `clientPermissions` or via a direct check.
   - **Conditional Rendering:** Manually check `globalRoleNames` or `clientPermissions` in component logic to show/hide UI elements or enable/disable functionality.
     ```tsx
     const { currentUser, clientPermissions } = useAuth();
     // ...
     {clientPermissions?.includes('projects.create') && <Button>Create Project</Button>}
     ```

## 6. Implementing Granular Access

1.  **Define Specific Permissions:** For each granular action (e.g., viewing a specific field, approving a document, deleting a minor entity), define a unique permission string (e.g., `module.sub_module.action_specific_details`).
2.  **Assign to Roles:** Add these granular permission strings to the `permissions` JSONB array of the relevant `roles` in the database (either via migration or admin UI).
3.  **Enforce in Code:**
    -   **Backend:** Use `check_user_has_permission()` in RLS policies or within SQL functions/Edge Functions before performing sensitive operations or returning restricted data.
    -   **Frontend:** Use `clientPermissions` (from `useAuth`) to conditionally render UI elements or enable/disable actions related to these granular permissions.

## 7. Updating Roles and Permissions

-   **Modifying `roles.permissions`:**
    -   Update the JSONB array in the `roles` table for a specific role.
    -   This change immediately affects all users currently assigned that role.
    -   **Method:** SQL migration (for widespread, permanent changes) or via an admin UI (for dynamic adjustments).
-   **Adding/Removing Roles from Users:** Handled by the UIs mentioned in Section 4, or directly in `user_roles` table by an administrator for exceptional cases.

## 8. Best Practices

-   **Principle of Least Privilege:** Grant only the permissions necessary for a role to perform its intended functions.
-   **Clear Naming:** Use consistent and descriptive names for roles and permission strings.
-   **Role Review:** Periodically review existing roles and their permissions to ensure they are still appropriate and to remove obsolete ones.
-   **Avoid Role Proliferation:** Try to reuse existing roles or modify their permissions before creating many slightly different new roles. Consider if a new set of permissions truly warrants a new role definition.
-   **Test Thoroughly:** After creating or modifying roles/permissions, test all affected user flows and access scenarios.
-   **Type Safety:** Always regenerate Supabase types (`npx supabase gen types ...`) after any database schema changes (including new roles if they imply new permission strings that code might specifically check for, though typically permissions are checked dynamically).
-   **Documentation:** Keep this SOP and any related documentation (e.g., a list of all defined permission strings and their meanings) up-to-date.

This SOP provides a framework. Specific implementation details for UI components like `RequirePermission` or advanced admin UIs for role creation would be developed as needed. 