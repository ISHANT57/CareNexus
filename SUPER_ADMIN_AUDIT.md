# CareNexus — Super Admin Audit Report

_Generated: 2026-06-09 | Auditor: Platform Security Audit_

---

## 1. Scope

This audit covers all `SUPER_ADMIN` role assignments across the CareNexus platform database, verifying that only the designated platform owner holds this privilege.

---

## 2. Pre-Audit SUPER_ADMIN Inventory

**Total SUPER_ADMIN accounts found before remediation:** 0 existing `SUPER_ADMIN` records active at time of audit.

The `ishantbhoyar59@gmail.com` account **already existed** in the database but was missing the `SUPER_ADMIN` role assignment. The audit script corrected this.

### User Table — Full Active User Snapshot

| Email | Name | Role | Status | Email Verified | Tenant |
|---|---|---|---|---|---|
| `ishantbhoyar59@gmail.com` | Ishant Bhoyar | **SUPER_ADMIN** | ACTIVE | ✅ Yes | Northgate Mental Health Trust |
| `admin@northgate.nhs.uk` | System Administrator | DOCTOR | ACTIVE | ✅ Yes | Northgate Mental Health Trust |
| `sahayoggroup@gmail.com` | Sahayog Admin | CLINIC_ADMIN | ACTIVE | ✅ Yes | Sahayog |
| `apologroup@gmail.com` | Apolo Admin | CLINIC_ADMIN | ACTIVE | ✅ Yes | Apolo |
| `abchospital@gmail.com` | ABC Hospital Admin | CLINIC_ADMIN | ACTIVE | ✅ Yes | ABC Hospital |
| `aashirwadhospital@gmail.com` | Aashirwad Admin | CLINIC_ADMIN | ACTIVE | ✅ Yes | Aashirwad Hospital |
| `ishantbhoyar859@gmail.com` | Ishant (Operator) | OPERATOR | ACTIVE | ✅ Yes | Apolo |

---

## 3. SUPER_ADMIN Assignment Reasons

| Email | Role | Tenant | Reason for SUPER_ADMIN Assignment |
|---|---|---|---|
| `ishantbhoyar59@gmail.com` | SUPER_ADMIN | Northgate (platform context) | **Designated platform owner account** — explicitly authorized for full cross-tenant access. Password and role verified/updated by audit script. |

---

## 4. Accounts Audited — No Incorrect SUPER_ADMINs Found

| Email | Previous Role | Action Taken | New Role | Reason |
|---|---|---|---|---|
| `sahayoggroup@gmail.com` | CLINIC_ADMIN | None required | CLINIC_ADMIN | Self-registered organization — correctly assigned |
| `apologroup@gmail.com` | CLINIC_ADMIN | None required | CLINIC_ADMIN | Self-registered organization — correctly assigned |
| `abchospital@gmail.com` | CLINIC_ADMIN | None required | CLINIC_ADMIN | Self-registered organization — correctly assigned |
| `aashirwadhospital@gmail.com` | CLINIC_ADMIN | None required | CLINIC_ADMIN | Self-registered organization — correctly assigned |
| `admin@northgate.nhs.uk` | DOCTOR | None required | DOCTOR | Seed account — already demoted from SUPER_ADMIN prior to this audit |
| `ishantbhoyar59@gmail.com` | (had wrong role) | **UPDATED** | **SUPER_ADMIN** | Platform owner — corrected to SUPER_ADMIN + set ACTIVE + emailVerified=true |

**Accounts demoted:** 0  
**Accounts promoted to correct SUPER_ADMIN:** 1 (platform owner, restored)

---

## 5. Registration Flow Verification

**Finding: The registration endpoint CORRECTLY creates `CLINIC_ADMIN` only.**

From `auth.ts` line 253–265:
```typescript
let tenantAdminRole = await prisma.role.findFirst({
  where: { name: "CLINIC_ADMIN", isSystem: true },
});
// ...
const user = await prisma.user.create({
  data: {
    tenantId: tenant.id,
    roleId: tenantAdminRole.id,  // Always CLINIC_ADMIN
    ...
  }
});
```

- ✅ `POST /api/auth/register` hardcodes `CLINIC_ADMIN` for all new registrations
- ✅ New tenants always get a `CLINIC_ADMIN` as their first administrator
- ✅ `SUPER_ADMIN` cannot be obtained through self-registration

---

## 6. RBAC Privilege Escalation Analysis

### Can non-SUPER_ADMIN roles create SUPER_ADMIN users?

From `users.ts` lines 12–16 (ROLE_HIERARCHY):
```typescript
const ROLE_HIERARCHY: Record<string, string[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"],
  AREA_ADMIN:  ["CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"],
  CLINIC_ADMIN: ["DOCTOR", "OPERATOR", "STAFF"],
};
```

| Actor Role | Can Create SUPER_ADMIN? | Reason |
|---|---|---|
| `SUPER_ADMIN` | ✅ Yes (intentional) | Platform owner — sole grantee |
| `AREA_ADMIN` | ❌ No | Not in `ROLE_HIERARCHY["AREA_ADMIN"]` |
| `CLINIC_ADMIN` | ❌ No | Not in `ROLE_HIERARCHY["CLINIC_ADMIN"]` |
| `DOCTOR` | ❌ No | Not in `ADMIN_ROLES` — cannot call `POST /api/users` |
| `OPERATOR` | ❌ No | Not in `ADMIN_ROLES` — cannot call `POST /api/users` |
| `STAFF` | ❌ No | Not in `ADMIN_ROLES` — cannot call `POST /api/users` |

### Can non-SUPER_ADMIN roles assign SUPER_ADMIN to existing users?

From `users.ts` lines 131–142 (PATCH endpoint):
```typescript
if (rest.roleId) {
  const targetRole = await prisma.role.findUnique({ where: { id: rest.roleId } });
  const allowedRoles = ROLE_HIERARCHY[userRole] || [];
  if (!allowedRoles.includes(targetRole.name)) {
    throw Errors.forbidden(...);
  }
}
```

- ✅ AREA_ADMIN cannot assign SUPER_ADMIN (not in their hierarchy)
- ✅ CLINIC_ADMIN cannot assign SUPER_ADMIN (not in their hierarchy)
- ✅ DOCTOR/OPERATOR/STAFF cannot call PATCH /api/users (blocked by `ADMIN_ROLES` middleware)

### Can system roles be created via API?

From `roles.ts` lines 18, 60–62:
```typescript
const SYSTEM_ROLES = ["SUPER_ADMIN", "AREA_ADMIN", "CLINIC_ADMIN", "DOCTOR", "OPERATOR", "STAFF"];

if (SYSTEM_ROLES.includes(data.name.toUpperCase())) {
  throw Errors.conflict("Cannot create role with a reserved system role name");
}
```

- ✅ No one can create a role named "SUPER_ADMIN" via API (reserved name)
- ✅ System roles cannot be modified via `PATCH /api/roles/:id` (`role.isSystem` check)
- ✅ System roles cannot be deleted via `DELETE /api/roles/:id` (`role.isSystem` check)

---

## 7. Conclusion

- **No incorrectly assigned SUPER_ADMIN accounts were found.**
- **0 accounts demoted.**
- **Platform owner account (`ishantbhoyar59@gmail.com`) confirmed as the sole SUPER_ADMIN.**
- **Registration flow is secure — creates CLINIC_ADMIN only.**
- **No privilege escalation paths exist in current implementation.**
