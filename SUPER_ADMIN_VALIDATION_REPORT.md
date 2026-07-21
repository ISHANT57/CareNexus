# SUPER_ADMIN_VALIDATION_REPORT.md — Super Admin Global Access Validation

This report certifies that the `SUPER_ADMIN` role has unrestricted cross-tenant and administrative access.

---

## 1. Super Admin Global Capabilities

The `SUPER_ADMIN` possesses a platform-wide overview, bypassing tenant scoping checks when in `"ALL"` mode, and selecting specific tenants using the combobox switcher.

| Module | Access Mode | Header Config | Database Scoping Bypass |
|---|---|---|---|
| **Tenants** | View & Create | `X-Tenant-Id: ALL` | Bypasses scoping, queries the full `tenants` table. |
| **Hospitals** | View & Manage | `X-Tenant-Id: ALL` | Full CRUD capabilities. |
| **Users** | View & Link | `X-Tenant-Id: ALL` | Lists all users, can link existing users to new tenants. |
| **Clinics** | View & Manage | `X-Tenant-Id: ALL` | Queries all clinics, moves clinics between areas. |
| **Programs** | View & Template | `X-Tenant-Id: ALL` | Full templates list across the platform. |
| **Dashboards** | View Platform Stats | `X-Tenant-Id: ALL` | Aggregates KPIs globally (active users, total areas). |
| **Activity Feed** | View Audit Logs | `X-Tenant-Id: ALL` | Fetches system-wide audit logs chronological feed. |

---

## 2. Platform Scoping Bypass Verification

1. **JWT tenantScope Bypass**:
   In `tenantScope.ts` middleware, if a user belongs to `SUPER_ADMIN`, they are permitted to send the `x-tenant-id` header with the value `ALL`. This resolves `req.tenantId` to `undefined`, which skips tenant filtering in database calls.
2. **Role Scope Wildcard**:
   In `roleScope.ts`, if the requesting role is `SUPER_ADMIN`, the middleware returns `{}` (empty object), letting the queries pull records globally without clinic or area restrictions.
3. **Audit logs feed**:
   Super Admins have unrestricted access to the global audit log collection, making all modifications traceable.
