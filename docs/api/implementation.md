# Twaire API Implementation

This document provides details on the Twaire backend API.

## Authentication

### POST /api/user/login

Login a user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "username": "testuser",
    "publicName": "Test User",
    "profilePicture": "path/to/profile/picture.jpg"
  }
}
```

### POST /api/user/signup

Register a new user.

**Request Body:**

```json
{
  "username": "testuser",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Signup successful",
  "userId": "60d5f7a7e7b3c2a4e8b4a5a0"
}
```

### POST /api/user/logout

Logout the current user.

**Response:**

```json
{
  "message": "Logged out"
}
```

## Users

### GET /api/user/me

Get the profile of the currently logged-in user. Requires authentication.

**Response:**

```json
{
  "_id": "60d5f7a7e7b3c2a4e8b4a5a0",
  "username": "testuser",
  "publicName": "Test User",
  "verified": false,
  "subscribers": 10,
  "accountViews": 1000,
  "profilePicture": "path/to/profile/picture.jpg",
  "bio": "This is a bio.",
  "createdAt": "2021-06-25T12:00:00.000Z"
}
```

### PUT /api/user/profile

Update the profile of the currently logged-in user. Requires authentication.

**Request Body (form-data):**

- `publicName` (string, optional)
- `bio` (string, optional)
- `profilePicture` (file, optional)

**Response:**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "username": "testuser",
    "publicName": "New Public Name",
    "profilePicture": "path/to/new/profile/picture.jpg",
    "bio": "This is an updated bio."
  }
}
```

### GET /api/user/:id/videos

Get all videos uploaded by a user.

**Response:**

An array of video objects.

### GET /api/user/:username

Get the public profile of a user.

**Response:**

```json
{
  "_id": "60d5f7a7e7b3c2a4e8b4a5a0",
  "username": "testuser",
  "publicName": "Test User",
  "verified": false,
  "subscribers": 10,
  "accountViews": 1000,
  "profilePicture": "path/to/profile/picture.jpg",
  "bio": "This is a bio.",
  "createdAt": "2021-06-25T12:00:00.000Z"
}
```

### POST /api/user/:username/view

Increment the view count of a user's profile.

**Response:**

```json
{
  "username": "testuser",
  "publicName": "Test User",
  "verified": false,
  "subscribers": 10,
  "accountViews": 1001
}
```

### GET /api/user/:id/isSubscribed

Check if the current user is subscribed to another user. Requires authentication.

**Response:**

```json
{
  "subscribed": true
}
```

### POST /api/user/:id/subscribe

Subscribe or unsubscribe to a user. Requires authentication.

**Response:**

```json
{
  "subscribed": true
}
```

### DELETE /api/user/me

Delete the account of the currently logged-in user. Requires authentication.

**Response:**

```json
{
  "message": "Account deleted successfully"
}
```

## Videos

### GET /api/videos

Get a list of videos.

**Query Parameters:**

- `sort` (string, optional): `trending` or `latest`. Defaults to `latest`.
- `tag` (string, optional): Filter by tag.
- `uploader` (string, optional): Filter by uploader ID.

**Response:**

An array of video objects.

### POST /api/videos

Upload a new video. Requires authentication.

**Request Body (form-data):**

- `title` (string, required)
- `description` (string, optional)
- `tags` (string, optional): Comma-separated list of tags.
- `video` (file, required)
- `thumbnail` (file, optional)

**Response:**

The newly created video object.

### GET /api/videos/search

Search for videos.

**Query Parameters:**

- `q` (string, required): The search query.
- `sort` (string, optional): `date` or `views`.

**Response:**

An array of video objects.

### GET /api/videos/search/autocomplete

Get search autocomplete suggestions.

**Query Parameters:**

- `q` (string, required): The search query.

**Response:**

An array of strings.

### GET /api/videos/:id

Get a single video by ID.

**Response:**

The video object.

### POST /api/videos/:id/view

Increment the view count of a video.

**Response:**

The updated video object.

### GET /api/videos/:id/comments

Get all comments for a video.

**Response:**

An array of comment objects.

### POST /api/videos/:id/comments

Add a comment to a video. Requires authentication.

**Request Body:**

```json
{
  "text": "This is a comment."
}
```

**Response:**

The newly created comment object.

### POST /api/videos/:id/like

Like a video. Requires authentication.

**Response:**

```json
{
  "likes": 10,
  "dislikes": 2,
  "liked": true,
  "disliked": false
}
```

### POST /api/videos/:id/dislike

Dislike a video. Requires authentication.

**Response:**

```json
{
  "likes": 9,
  "dislikes": 3,
  "liked": false,
  "disliked": true
}
```

### GET /api/videos/:id/reactions

Get the like/dislike counts and user reaction status for a video.

**Response:**

```json
{
  "likes": 10,
  "dislikes": 2,
  "liked": true,
  "disliked": false
}
```

## Comments

### POST /api/comments/:id/replies

Add a reply to a comment. Requires authentication.

**Request Body:**

```json
{
  "text": "This is a reply."
}
```

**Response:**

The updated comment object with the new reply.

### POST /api/comments/:id/like

Like a comment. Requires authentication.

**Response:**

```json
{
  "likes": 5,
  "dislikes": 1
}
```

### POST /api/comments/:id/dislike

Dislike a comment. Requires authentication.

**Response:**

```json
{
  "likes": 4,
  "dislikes": 2
}
```

## Helper

### GET /api/helper/placeholder/:dimensions

Generate a placeholder image.

**URL Parameters:**

- `dimensions` (string, required): The dimensions of the image in the format `WIDTHxHEIGHT`.

**Query Parameters:**

- `text` (string, optional): The text to display on the image.
- `bgColor` (string, optional): The background color in hexadecimal.
- `textColor` (string, optional): The text color in hexadecimal.

**Response:**

A PNG image.