# Tech-Forge Backend — API Reference

> **Base URL:** `http://localhost:5000`  
> **Content-Type:** `application/json` (unless noted as `form-data`)  
> **Auth:** Protected routes require `Authorization: Bearer <accessToken>` in the header.

---

## Quick Start Flow

```
1. POST /api/v1/auth/signup   → get accessToken
2. POST /api/v1/auth/signin   → get accessToken (if already registered)
3. Use accessToken as Bearer token in all 🔒 protected routes
```

---

## 🔐 Auth Routes

### 1. Sign Up
```
POST /api/v1/auth/signup
Auth: ❌ Public
```
**Body:**
```json
{
  "full_name": "Akash Jadhav",
  "email": "akash@example.com",
  "password": "secret123"
}
```
**Response `201`:**
```json
{
  "success": true,
  "message": "Signed up successfully",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### 2. Sign In
```
POST /api/v1/auth/signin
Auth: ❌ Public
```
**Body:**
```json
{
  "email": "akash@example.com",
  "password": "secret123"
}
```
**Response `200`:**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### 3. Reset Password
```
POST /api/v1/auth/resetPassword
Auth: ❌ Public
```
**Body:**
```json
{
  "email": "akash@example.com",
  "oldPassword": "secret123",
  "newPassword": "newpassword456"
}
```
**Response `200`:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 👤 User Routes

### 4. Get My Profile
```
GET /api/v1/users/me
Auth: 🔒 Bearer Token
```
**Body:** None

**Response `200`:**
```json
{
  "success": true,
  "message": "...",
  "data": {
    "userId": "uuid",
    "fullName": "Akash Jadhav",
    "email": "akash@example.com"
  }
}
```

---

### 5. Update My Profile
```
PUT /api/v1/users/me
Auth: 🔒 Bearer Token
```
**Body** (all fields optional — send at least one):
```json
{
  "fullName": "Akash J",
  "email": "newemail@example.com",
  "bio": "Software developer"
}
```
**Response `200`:** Updated user profile.

---

### 6. Upload Avatar (Profile Image)
```
PATCH /api/v1/users/me/avatar
Auth: 🔒 Bearer Token
Content-Type: multipart/form-data
```
**Body (form-data):**

| Key | Type | Value |
|-----|------|-------|
| `profile-image` | File | image file (jpg/png/webp/gif, max 2 MB) |

---

### 7. Delete My Account
```
DELETE /api/v1/users/me
Auth: 🔒 Bearer Token
```
**Body:** None  
**Response `200`:** Account permanently deleted.

---

### 8. Get Public User Profile
```
GET /api/v1/users/:id
Auth: 🔒 Bearer Token
```
**URL Param:** Replace `:id` with any user's UUID  
**Example:** `GET /api/v1/users/550e8400-e29b-41d4-a716-446655440000`  
**Body:** None

---

## 📝 Blog Routes

### 9. Create Blog
```
POST /api/v1/blog
Auth: 🔒 Bearer Token
```
**Body:**
```json
{
  "title": "My First Blog Post",
  "content": "This is the full content of the blog post.",
  "categoryId": "uuid-of-category",
  "coverImage": "https://example.com/image.jpg",
  "status": "Draft"
}
```
> `categoryId`, `coverImage`, `status` are optional.  
> `status` values: `"Draft"` | `"Published"` | `"Archived"` — defaults to `"Draft"`.

**Response `201`:**
```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "blogId": "uuid",
    "userId": "uuid",
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "content": "...",
    "status": "Draft",
    "viewCount": 0,
    "publishedAt": null,
    "createdAt": "2026-07-23T..."
  }
}
```

---

### 10. Get All Blogs (with filters)
```
GET /api/v1/blog
Auth: ❌ Public
```
**Query Params (all optional):**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `limit` | number | `10` | Results per page (default: 10) |
| `offset` | number | `0` | Pagination offset (default: 0) |
| `q` | string | `javascript` | Search in title & content |
| `categoryId` | uuid | `uuid-here` | Filter by category |
| `status` | string | `Published` | Filter by status |

**Example URLs:**
```
GET /api/v1/blog
GET /api/v1/blog?limit=10&offset=0&status=Published
GET /api/v1/blog?q=javascript&limit=5
GET /api/v1/blog?categoryId=550e8400-e29b-41d4-a716-446655440000
```

---

### 11. Search Blogs
```
GET /api/v1/blog/search
Auth: ❌ Public
```
**Query Params:**

| Param | Type | Example |
|-------|------|---------|
| `q` | string | `javascript` |
| `limit` | number | `5` |
| `offset` | number | `0` |

**Example:**
```
GET /api/v1/blog/search?q=javascript&limit=5
```

---

### 12. Get Blog by ID
```
GET /api/v1/blog/:id
Auth: ❌ Public
```
**URL Param:** Replace `:id` with the blog's UUID  
**Example:** `GET /api/v1/blog/550e8400-e29b-41d4-a716-446655440000`  
**Body:** None  

> Automatically increments the blog's `viewCount` on each call.

---

### 13. Update Blog
```
PUT /api/v1/blog/:id
Auth: 🔒 Bearer Token (must be blog owner)
```
**Body** (all fields optional — send at least one):
```json
{
  "title": "Updated Blog Title",
  "content": "Updated content here.",
  "categoryId": "uuid-of-category",
  "coverImage": "https://example.com/new-image.jpg",
  "status": "Draft"
}
```
> Send `"categoryId": null` or omit it to remove the category.

---

### 14. Publish Blog
```
PATCH /api/v1/blog/:id/publish
Auth: 🔒 Bearer Token (must be blog owner)
```
**Body:** None  
**Example:** `PATCH /api/v1/blog/550e8400-e29b-41d4-a716-446655440000/publish`

**Response `200`:**
```json
{
  "success": true,
  "message": "Blog published successfully",
  "data": { "status": "Published", "publishedAt": "2026-07-23T..." }
}
```

---

### 15. Delete Blog
```
DELETE /api/v1/blog/:id
Auth: 🔒 Bearer Token (must be blog owner)
```
**Body:** None  
**Response `200`:**
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

---

## ❤️ Like Routes

> All like routes are nested under `/api/v1/blog/:blogId/like`

### 16. Get Like Count
```
GET /api/v1/blog/:blogId/like
Auth: ❌ Public
```
**Body:** None  
**Example:** `GET /api/v1/blog/550e8400-e29b-41d4-a716-446655440000/like`

---

### 17. Like a Blog
```
POST /api/v1/blog/:blogId/like
Auth: 🔒 Bearer Token
```
**Body:** None

---

### 18. Unlike a Blog
```
DELETE /api/v1/blog/:blogId/like
Auth: 🔒 Bearer Token
```
**Body:** None

---

## 💬 Comment Routes

### 19. Get Comments by Blog
```
GET /api/v1/comments/:blogId
Auth: ❌ Public
```
**URL Param:** `:blogId` — UUID of the blog  
**Body:** None

---

### 20. Get Comments by User
```
GET /api/v1/comments/:userId
Auth: ❌ Public
```
**URL Param:** `:userId` — UUID of the user  
**Body:** None

---

### 21. Create Comment
```
POST /api/v1/comment
Auth: 🔒 Bearer Token
```
**Body:**
```json
{
  "blogId": "uuid-of-blog",
  "content": "Great post! Really helpful."
}
```

---

### 22. Update Comment
```
PUT /api/v1/comment/:id
Auth: 🔒 Bearer Token (must be comment owner)
```
**URL Param:** `:id` — UUID of the comment  
**Body:**
```json
{
  "content": "Updated comment text."
}
```

---

### 23. Delete Comment
```
DELETE /api/v1/comment/:id
Auth: 🔒 Bearer Token (must be comment owner)
```
**Body:** None

---

## ⚠️ Error Responses

All errors follow the same shape:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

**Validation errors (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / missing required field |
| `401` | Unauthorized — missing/invalid/expired token |
| `403` | Forbidden — you don't own this resource |
| `404` | Resource not found |
| `409` | Conflict — e.g. email already exists |
| `422` | Validation failed |
| `500` | Internal server error |

---

## 🧪 Recommended Postman Test Order

```
1.  POST   /api/v1/auth/signup          → save accessToken
2.  POST   /api/v1/auth/signin          → confirm sign-in works
3.  GET    /api/v1/users/me             → verify profile (🔒)
4.  POST   /api/v1/blog                 → create blog, save blogId (🔒)
5.  GET    /api/v1/blog                 → list all published blogs
6.  GET    /api/v1/blog/:id             → get blog detail
7.  GET    /api/v1/blog/search?q=...    → search blogs
8.  PUT    /api/v1/blog/:id             → update blog (🔒)
9.  PATCH  /api/v1/blog/:id/publish     → publish blog (🔒)
10. POST   /api/v1/blog/:blogId/like    → like the blog (🔒)
11. GET    /api/v1/blog/:blogId/like    → check like count
12. DELETE /api/v1/blog/:blogId/like    → unlike (🔒)
13. POST   /api/v1/comment              → add a comment (🔒)
14. PUT    /api/v1/comment/:id          → edit comment (🔒)
15. DELETE /api/v1/comment/:id          → delete comment (🔒)
16. DELETE /api/v1/blog/:id             → delete blog (🔒)
```
