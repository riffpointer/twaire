# Twaire Backend

## Architecture
Twaire Backend is an Express-based REST API backed by MongoDB through Mongoose schemas and models. It is organized around route modules, schema definitions, middleware, and utility providers. File uploads are handled through dedicated storage providers, while session-based authentication is used for protected operations.

## Implemented Features
- [x] User signup
- [x] User login
- [x] User logout
- [x] Session persistence for authenticated users
- [x] Public profile retrieval by username
- [x] Profile view counting
- [x] Video upload
- [x] Video retrieval by id
- [x] Video listing and search
- [x] Video view tracking
- [x] Like videos
- [x] Dislike videos
- [x] Retrieve reaction status for a video
- [x] Add video comments
- [x] Add comment replies
- [x] Save private bookmarks with timestamps
- [x] Create playlists
- [x] Update playlists
- [x] Delete playlists
- [x] Add videos to playlists
- [x] Remove videos from playlists
- [x] Subscribe to channels
- [x] Unsubscribe from channels
- [x] Store a channel trailer reference on a user profile
- [x] Enforce public, unlisted, and private visibility states
- [x] Serve uploaded videos
- [x] Serve uploaded thumbnails
- [x] Serve profile pictures
- [x] Serve channel banners
- [x] Update profile metadata
- [x] Delete an account

## Planned Features
### Usability
- [ ] More descriptive 4xx responses for common validation failures
- [ ] Notification delivery for subscriptions and replies
- [ ] User-facing moderation flags for reported content
- [ ] Exportable account data summary for profile portability

### Reliability
- [ ] Rate limiting for authentication and content mutation endpoints
- [ ] Background processing for media validation and metadata extraction
- [ ] Consistent pagination metadata on list endpoints
- [ ] Standardized error response envelopes across all routes
- [ ] Health check endpoint for deployment monitoring

### Media
- [ ] Richer search ranking with indexed relevance scoring
- [ ] Better filename hygiene for uploaded media
- [ ] Optional draft state for unfinished video uploads
- [ ] Per-user content quotas for uploads and playlists
- [ ] Soft delete support for recoverable user content
- [ ] Media transcoding pipeline for standardized playback formats
- [ ] Upload-time file type and duration validation
- [ ] Storage cleanup for orphaned or unreferenced media files
- [ ] Automated thumbnail regeneration for missing or corrupt files
- [ ] Scheduled database and media backup jobs
- [ ] Backup integrity checks and restore verification

### Developer Experience
- [ ] Centralized audit logging for sensitive account actions
- [ ] Request validation middleware for common payloads
- [ ] Endpoint-level request timing for easier debugging
- [ ] Unified pagination and filter parameters across list endpoints
