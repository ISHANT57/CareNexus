# Database & Configuration
git add artifacts/api-server/prisma/schema.prisma
git commit -m "chore(db): update prisma schema for cascade deletions and tenant mappings"

git add pnpm-lock.yaml artifacts/web/package.json
git commit -m "chore(deps): update pnpm lockfile"

git add artifacts/api-server/src/app.ts
git commit -m "build(api): enhance api server app startup and middleware configuration"

# API Spec & Zod Generation
git add lib/api-spec/openapi.yaml
git commit -m "feat(api): update openapi spec for areas, clinics, and programs endpoints"

git add lib/api-zod/src/generated/api.ts lib/api-zod/src/generated/types/index.ts lib/api-zod/src/generated/types/listAreasParams.ts lib/api-zod/src/generated/types/listClinicsParams.ts lib/api-zod/src/generated/types/listProgramsParams.ts lib/api-zod/src/generated/types/listRolesParams.ts
git commit -m "chore(api-zod): auto-generate zod validation schemas for new endpoints"

git add lib/api-client-react/src/generated/api.schemas.ts lib/api-client-react/src/generated/api.ts
git commit -m "chore(api-client): regenerate react query hooks for modified endpoints"

# Backend API - Core Middlewares
git add artifacts/api-server/src/middlewares/rbac.ts
git commit -m "fix(rbac): implement robust role-based access control and scopes"

git add artifacts/api-server/src/routes/tenants.ts
git commit -m "fix(tenants): resolve global dashboard isolation bypass for super admin"

git add artifacts/api-server/src/middlewares/csrf.ts
git commit -m "feat(csrf): implement strict cross-site request forgery protection in api-server"

# Backend API - Resource Routes
git add artifacts/api-server/src/routes/patients.ts
git commit -m "fix(api): enhance patients route with tenant isolation and strict typing"

git add artifacts/api-server/src/routes/areas.ts
git commit -m "fix(api): update areas route with explicit tenant filtering"

git add artifacts/api-server/src/routes/clinics.ts
git commit -m "fix(api): stabilize clinics route for correct hierarchy mapping"

git add artifacts/api-server/src/routes/programs.ts
git commit -m "fix(api): optimize programs route to drop implicit hospital requirements"

git add artifacts/api-server/src/routes/programEnrollments.ts
git commit -m "fix(api): patch program enrollments route for strict isolation"

git add artifacts/api-server/src/routes/appointments.ts artifacts/api-server/src/routes/consultations.ts
git commit -m "fix(api): stabilize appointments and consultations endpoint validation"

git add artifacts/api-server/src/routes/communications.ts artifacts/api-server/src/routes/tasks.ts
git commit -m "fix(api): resolve data leakage in communications and tasks routes"

git add artifacts/api-server/src/routes/outcome-metrics.ts artifacts/api-server/src/routes/outcomes.ts artifacts/api-server/src/routes/riskScores.ts
git commit -m "fix(api): enhance outcome metrics and risk scores calculation isolation"

git add artifacts/api-server/src/routes/roles.ts artifacts/api-server/src/routes/users.ts artifacts/api-server/src/routes/assignments.ts
git commit -m "fix(api): stabilize roles, users, and assignments endpoints"

git add artifacts/api-server/src/routes/files.ts artifacts/api-server/src/routes/import.ts
git commit -m "refactor(api): centralize pagination and error handling in files and import routes"

git add artifacts/api-server/src/routes/reports.ts artifacts/api-server/src/routes/auditLogs.ts
git commit -m "feat(api): aggregate global statistics correctly in reports route"

# Frontend - Core UI Architecture & De-bloat
git add artifacts/web/src/components/ui/accordion.tsx artifacts/web/src/components/ui/alert.tsx artifacts/web/src/components/ui/aspect-ratio.tsx artifacts/web/src/components/ui/avatar.tsx artifacts/web/src/components/ui/breadcrumb.tsx artifacts/web/src/components/ui/button-group.tsx artifacts/web/src/components/ui/calendar.tsx artifacts/web/src/components/ui/carousel.tsx artifacts/web/src/components/ui/chart.tsx artifacts/web/src/components/ui/checkbox.tsx artifacts/web/src/components/ui/collapsible.tsx artifacts/web/src/components/ui/context-menu.tsx artifacts/web/src/components/ui/drawer.tsx artifacts/web/src/components/ui/empty.tsx artifacts/web/src/components/ui/field.tsx artifacts/web/src/components/ui/hover-card.tsx artifacts/web/src/components/ui/input-group.tsx artifacts/web/src/components/ui/input-otp.tsx artifacts/web/src/components/ui/item.tsx artifacts/web/src/components/ui/kbd.tsx artifacts/web/src/components/ui/menubar.tsx artifacts/web/src/components/ui/navigation-menu.tsx artifacts/web/src/components/ui/pagination.tsx artifacts/web/src/components/ui/progress.tsx artifacts/web/src/components/ui/radio-group.tsx artifacts/web/src/components/ui/resizable.tsx artifacts/web/src/components/ui/scroll-area.tsx artifacts/web/src/components/ui/separator.tsx artifacts/web/src/components/ui/sheet.tsx artifacts/web/src/components/ui/slider.tsx artifacts/web/src/components/ui/sonner.tsx artifacts/web/src/components/ui/spinner.tsx artifacts/web/src/components/ui/switch.tsx artifacts/web/src/components/ui/toggle-group.tsx artifacts/web/src/components/ui/toggle.tsx
git commit -m "chore(ui): remove redundant and unused shadcn UI components"

git add artifacts/web/src/components/ui/sidebar.tsx
git commit -m "chore(ui): delete legacy sidebar and navigation layout components"

git add artifacts/web/vite.config.local.ts artifacts/web/src/hooks/use-mobile.tsx
git commit -m "refactor(ui): clean up unused ui hooks and local vite config"

git add artifacts/web/src/index.css
git commit -m "style(frontend): modernize global CSS with enterprise aesthetics and glassmorphism"

git add artifacts/web/src/App.tsx artifacts/web/src/lib/utils.ts lib/api-client-react/src/custom-fetch.ts
git commit -m "refactor(frontend): streamline app layout, routing, and utils"

git add artifacts/web/src/components/ui/alert-dialog.tsx artifacts/web/src/components/ui/button.tsx artifacts/web/src/components/ui/command.tsx artifacts/web/src/components/ui/dialog.tsx artifacts/web/src/components/ui/input.tsx artifacts/web/src/components/ui/searchable-select.tsx
git commit -m "refactor(ui): update core UI components"

# Frontend - Layouts & Navigation
git add artifacts/web/src/components/layout/GlobalSearch.tsx
git commit -m "feat(layout): implement global search and navigation architecture"

git add artifacts/web/src/components/layout/Sidebar.tsx artifacts/web/src/components/layout/TenantSwitcher.tsx artifacts/web/src/components/layout/AppLayout.tsx
git commit -m "refactor(layout): rebuild enterprise sidebar and tenant switcher"

git add artifacts/web/src/hooks/use-url-filters.ts
git commit -m "feat(hooks): implement URL-based filters for table state management"

git add artifacts/web/src/hooks/use-area-clinic-cascade.ts
git commit -m "feat(hooks): stabilize area-clinic cascade selection hook"

# Frontend - Pages
git add artifacts/web/src/pages/dashboard.tsx
git commit -m "feat(dashboard): rebuild primary dashboard with enterprise analytics"

git add artifacts/web/src/pages/dashboard/GlobalDashboard.tsx
git commit -m "feat(dashboard): resolve global dashboard multi-tenant aggregation metrics"

git add artifacts/web/src/pages/patients.tsx
git commit -m "refactor(patients): stabilize patients list view and pagination"

git add artifacts/web/src/pages/patient-detail.tsx
git commit -m "feat(patients): completely rebuild patient detail page for enterprise ux"

git add artifacts/web/src/pages/patient-new.tsx
git commit -m "refactor(patients): enhance patient creation workflow"

git add artifacts/web/src/pages/clinics.tsx
git commit -m "refactor(clinics): modernize clinics management interface"

git add artifacts/web/src/pages/areas.tsx
git commit -m "refactor(areas): modernize areas management interface"

git add artifacts/web/src/pages/programs.tsx
git commit -m "refactor(programs): stabilize programs list and remove hardcoded fields"

git add artifacts/web/src/pages/users.tsx artifacts/web/src/pages/user-detail.tsx artifacts/web/src/pages/user-new.tsx artifacts/web/src/pages/roles.tsx
git commit -m "refactor(users): modernize user management and role assignment interfaces"

git add artifacts/web/src/pages/appointments.tsx
git commit -m "refactor(appointments): enhance appointments calendar and list views"

git add artifacts/web/src/pages/onboarding/
git commit -m "feat(onboarding): implement new tenant onboarding workflow"

git add artifacts/web/src/pages/tasks.tsx
git commit -m "feat(tasks): introduce dedicated tasks management view"

git add artifacts/web/src/pages/tenants/index.tsx
git commit -m "fix(tenants): update tenants page list logic"

# Documentation & Tests
git add FRONTEND_MODERNIZATION_REPORT.md TENANT_PAGE_BUG_REPORT.md UI_AUDIT_REPORT.md CHANGELOG.md RELEASE_NOTES.md
git commit -m "docs(reports): publish UI, Frontend, and Bug audit reports and release notes"

git add artifacts/api-server/test-api.ts artifacts/api-server/test-api-2.ts artifacts/api-server/test-hospitals-2.cjs artifacts/api-server/test-out.txt artifacts/audit.js artifacts/test-areas-api.js artifacts/test-counts.js artifacts/test-hospitals.js artifacts/test-tenants.js
git commit -m "test(api): add local debug and validation scripts"

git add create-commits.ps1
git commit -m "chore(scripts): generate release commit creation script"
