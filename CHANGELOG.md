# CareNexus Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Release Candidate

### Features
- **api:** update openapi spec for areas, clinics, and programs endpoints
- **csrf:** implement strict cross-site request forgery protection in api-server
- **api:** aggregate global statistics correctly in reports route
- **layout:** implement global search and navigation architecture
- **hooks:** implement URL-based filters for table state management
- **hooks:** stabilize area-clinic cascade selection hook
- **dashboard:** rebuild primary dashboard with enterprise analytics
- **dashboard:** resolve global dashboard multi-tenant aggregation metrics
- **patients:** completely rebuild patient detail page for enterprise ux
- **onboarding:** implement new tenant onboarding workflow
- **tasks:** introduce dedicated tasks management view

### Bug Fixes
- **rbac:** implement robust role-based access control and scopes
- **tenants:** resolve global dashboard isolation bypass for super admin
- **api:** enhance patients route with tenant isolation and strict typing
- **api:** update areas route with explicit tenant filtering
- **api:** stabilize clinics route for correct hierarchy mapping
- **api:** optimize programs route to drop implicit hospital requirements
- **api:** patch program enrollments route for strict isolation
- **api:** stabilize appointments and consultations endpoint validation
- **api:** resolve data leakage in communications and tasks routes
- **api:** enhance outcome metrics and risk scores calculation isolation
- **api:** stabilize roles, users, and assignments endpoints
- **tenants:** update tenants page list logic to correctly display all tenants

### Refactoring
- **api:** centralize pagination and error handling in files and import routes
- **ui:** clean up unused ui hooks and local vite config
- **frontend:** streamline app layout, routing, and utils
- **ui:** update core UI components (buttons, dialogs, inputs, selects)
- **layout:** rebuild enterprise sidebar and tenant switcher
- **patients:** stabilize patients list view and pagination
- **patients:** enhance patient creation workflow
- **clinics:** modernize clinics management interface
- **areas:** modernize areas management interface
- **programs:** stabilize programs list and remove hardcoded fields
- **users:** modernize user management and role assignment interfaces
- **appointments:** enhance appointments calendar and list views

### Styling & UI
- **frontend:** modernize global CSS with enterprise aesthetics and glassmorphism

### Chores
- **db:** update prisma schema for cascade deletions and tenant mappings
- **deps:** update pnpm lockfile
- **api-zod:** auto-generate zod validation schemas for new endpoints
- **api-client:** regenerate react query hooks for modified endpoints
- **ui:** remove redundant and unused shadcn UI components
- **ui:** delete legacy sidebar and navigation layout components

### Documentation
- **reports:** publish UI, Frontend, and Bug audit reports

### Tests
- **api:** add debug scripts for api endpoints and hospital counts
