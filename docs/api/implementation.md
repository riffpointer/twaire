# Twaire API Implementation

This document summarizes the public backend routes exposed by Twaire.

## Base Paths

- `/api/users`
- `/api/videos`
- `/api/comments`
- `/api/playlists`
- `/api/helper`

## Users

### `POST /api/users/signup`
Creates a new account.

- Body: `username`, `email`, `password`
- Returns: created user id

### `POST /api/users/login`
Authenticates a user and starts a session.

- Body: `email`, `password`
- Returns: user profile and account switch token

### `POST /api/users/logout`
Ends the current session.

- Optional body: `switchToken`
- Returns: confirmation message

### `GET /api/users/me`
Returns the authenticated user profile.

- Auth: required

### `POST /api/users/me/account-switch-token`
Generates a new account switch token for the authenticated user.

- Auth: required

### `POST /api/users/switch-account`
Restores a saved session using a valid switch token.

- Body: `userId`, `switchToken`

### `GET /api/users/check-username`
Checks whether a username is available.

- Query: `username`

### `PUT /api/users/profile`
Updates profile metadata and uploads profile media.

- Auth: required
- Form data: `publicName`, `bio`, `links`, `profilePicture`, `banner`

### `GET /api/users/:username`
Returns the public profile for a channel.

### `POST /api/users/:username/view`
Increments the channel view counter.

### `GET /api/users/:id/videos`
Returns videos uploaded by a user.

### `GET /api/users/:id/subscriptions`
Returns the user’s subscriptions.

### `GET /api/users/:id/isSubscribed`
Checks whether the current user is subscribed to the target user.

- Auth: required

### `POST /api/users/:id/subscribe`
Toggles a subscription to the target user.

- Auth: required

### `GET /api/users/me/bookmarks`
Returns the authenticated user’s saved bookmarks grouped by video.

- Auth: required

### `GET /api/users/me/analytics/views`
Returns per-day channel view analytics.

- Auth: required

### `DELETE /api/users/me/delete/profile_picture`
Removes the current profile picture.

- Auth: required

### `DELETE /api/users/me/delete/banner`
Removes the current channel banner.

- Auth: required

### `DELETE /api/users/me`
Deletes the current account and related data.

- Auth: required

## Videos

### `GET /api/videos`
Returns videos with optional filtering and sorting.

- Query: `sort`, `tag`, `uploader`

### `POST /api/videos`
Uploads a new video.

- Auth: required
- Form data: `title`, `description`, `tags`, `category`, `visibility`, `video`, `thumbnail`

### `GET /api/videos/search`
Searches videos by title, description, or tags.

- Query: `q`, `sort`

### `GET /api/videos/search/autocomplete`
Returns autocomplete suggestions for the search bar.

- Query: `q`

### `GET /api/videos/category/:category`
Returns public videos for a category.

### `GET /api/videos/:id`
Returns a single video.

### `POST /api/videos/:id/view`
Increments the video view count and returns the video payload.

### `GET /api/videos/:id/comments`
Returns all comments for a video.

### `POST /api/videos/:id/comments`
Adds a comment to a video.

- Auth: required
- Body: `text`

### `POST /api/videos/:id/like`
Toggles a like on a video.

- Auth: required

### `POST /api/videos/:id/dislike`
Toggles a dislike on a video.

- Auth: required

### `GET /api/videos/:id/reactions`
Returns video like and dislike counts plus the current user state.

### `GET /api/videos/:id/bookmarks`
Returns the current user’s bookmarks for a video.

- Auth: required

### `POST /api/videos/:id/bookmarks`
Creates or updates a bookmark for a video timestamp.

- Auth: required
- Body: `timestampSeconds`, `note`

### `DELETE /api/videos/:id/bookmarks/:bookmarkId`
Deletes a bookmark.

- Auth: required

### `GET /api/videos/subscriptions/feed`
Returns public videos from subscribed channels.

- Auth: required
- Query: `sort`

## Comments

### `POST /api/comments/:id/replies`
Adds a reply to a comment.

- Auth: required
- Body: `text`

### `PUT /api/comments/:id`
Edits a comment owned by the current user.

- Auth: required
- Body: `text`

### `DELETE /api/comments/:id`
Deletes a comment owned by the current user.

- Auth: required

### `PUT /api/comments/:id/replies/:replyId`
Edits a reply owned by the current user.

- Auth: required
- Body: `text`

### `DELETE /api/comments/:id/replies/:replyId`
Deletes a reply owned by the current user.

- Auth: required

### `POST /api/comments/:id/like`
Toggles a like on a comment or reply.

- Auth: required

### `POST /api/comments/:id/dislike`
Toggles a dislike on a comment or reply.

- Auth: required

### `POST /api/comments/:id/pin`
Pins a comment to the associated video.

- Auth: required

## Playlists

### `GET /api/playlists/user/:username`
Returns playlists for a channel.

### `GET /api/playlists/:id`
Returns a single playlist.

### `POST /api/playlists`
Creates a playlist.

- Auth: required
- Body: `name`, `visibility`, `description`

### `PUT /api/playlists/:id`
Updates playlist metadata.

- Auth: required

### `POST /api/playlists/:id/thumbnail`
Uploads or replaces a playlist thumbnail.

- Auth: required
- Form data: `thumbnail`

### `DELETE /api/playlists/:id/thumbnail`
Removes a playlist thumbnail.

- Auth: required

### `POST /api/playlists/:id/videos`
Adds a video to a playlist.

- Auth: required
- Body: `videoId`

### `DELETE /api/playlists/:id/videos/:videoId`
Removes a video from a playlist.

- Auth: required

### `PATCH /api/playlists/:id/reorder`
Reorders videos within a playlist.

- Auth: required
- Body: `videoIds`

### `DELETE /api/playlists/:id`
Deletes a playlist.

- Auth: required

## Helper

### `GET /api/helper/placeholder/:dimensions`
Returns a generated placeholder image.

- Query: `text`, `bgColor`, `textColor`
- Path format: `WIDTHxHEIGHT`

## Media Paths

- `/data/uploads/:filename`
- `/data/thumbnails/:filename`
- `/data/banners/:filename`
- `/data/profile_pictures/:filename`
- `/data/playlist_thumbnails/:filename`
