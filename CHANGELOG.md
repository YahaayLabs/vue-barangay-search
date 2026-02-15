# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-02-15

### Added
- Integrated official `gis.ph-sdk` for API requests.
- Added `apiKey` prop to `BarangaySearch` component.

### Changed
- Refactored `BarangaySearch.vue` to use `GisPh` client instead of raw `fetch`.
- Improved type safety by using SDK-provided types for `Barangay`.

### Removed
- Manual `fetch` implementation and logic for API request construction.
