# YouTube Clone

**A full‑stack YouTube-like web application built as a professional-grade project by Rohit.**

---

## Short summary 

A full‑stack YouTube clone with a reusable, scalable backend (Express + MongoDB + Cloudinary) and a Next.js frontend. Backend is complete & deployed; frontend is in active development (more than 50% complete).

---

## Demo (Deployed)

* **Frontend (Vercel):** [https://you-tube-clone-ten-gamma.vercel.app/](https://you-tube-clone-ten-gamma.vercel.app/)
* **Backend (Render):** [https://project-youtube-backend-1.onrender.com](https://project-youtube-backend-1.onrender.com)

> Note: Frontend is under active development — many core features are implemented and backend is production ready.

---

## Key features

* User authentication using **NextAuth (Credentials strategy with JWT)**
* Upload videos & thumbnails using **Cloudinary**
* Secure auth with **JWT** and **bcrypt** for password hashing
* Reusable, scalable backend architecture (Express + Mongoose)
* Complex queries implemented with **Mongoose aggregate pipelines (v2)**
* File uploads handled via **multer**
* Clean code style with **Prettier**
* Cross origin support using **cors**

---

## Tech stack

### Backend

* Node.js + **Express**
* **MongoDB** (with **Mongoose** + aggregate pipelines v2)
* **Cloudinary** for media storage
* **multer** for handling uploads
* **bcrypt**, **jsonwebtoken (JWT)** for auth
* **cors**, **prettier**

*Deployed on Render:* `https://project-youtube-backend-1.onrender.com`

*Backend GitHub repository:* [https://github.com/RohitPanwar46/Project-youtube-backend](https://github.com/RohitPanwar46/Project-youtube-backend)

### Frontend

* **Next.js** (React)
* **NextAuth** (Credentials + JWT)
* **Tailwind CSS** for styling
* **react-easy-crop**, **react-icons**

*Deployed on Vercel:* `https://you-tube-clone-ten-gamma.vercel.app/`

---

## Backend routes

Backend is mounted under `/api/v1/*` — below are the main route groups and some concrete endpoints (see controllers for full behavior):

**Base prefix:** `https://project-youtube-backend-1.onrender.com/api/v1`

* **Users** (`/users`)

  * `POST /users/register` — register user (multipart: avatar, coverImage)
  * `POST /users/login` — login (returns JWT)
  * `POST /users/logout` — logout (protected)
  * `POST /users/refresh-token` — refresh access token
  * `POST /users/change-password` — change current password (protected)
  * `GET  /users/get-user` — get current user (protected)
  * `PATCH /users/update-details` — update account details (protected)
  * `PATCH /users/avatar` — update avatar (upload, protected)
  * `PATCH /users/cover-image` — update cover image (upload, protected)
  * `GET /users/c/:username` — get user/channel profile (protected)
  * `GET /users/history` — get watch history (protected)

* **Videos** (`/videos`)

  * (Video routes are available under `/api/v1/videos` — upload, list, single video, etc. Check `routes/video.routes.js` and controllers for full endpoints.)

* **Likes** (`/likes`)

  * `GET /likes/count/:videoId` — get video likes count
  * `POST /likes/toggle/v/:videoId` — toggle video like (protected)
  * `POST /likes/toggle/c/:commentId` — toggle comment like (protected)
  * `POST /likes/toggle/t/:tweetId` — toggle tweet like (protected)
  * `GET /likes/videos` — get liked videos (protected)

* **Tweets** (`/tweets`) — social micro-post style data (protected)

  * `POST /tweets` — create tweet
  * `GET /tweets/user/:userId` — get user tweets
  * `PATCH /tweets/:tweetId` — update tweet
  * `DELETE /tweets/:tweetId` — delete tweet

* **Comments** (`/comments`)

  * `GET /comments/:videoId` — get all comments for a video
  * `POST /comments/:videoId` — add comment (protected)
  * `DELETE /comments/c/:commentId` — delete comment (protected)
  * `PATCH /comments/c/:commentId` — update comment (protected)

* **Subscriptions** (`/subscriptions`)

  * `GET /subscriptions/c/:channelId` — get channel subscribers
  * `POST /subscriptions/c/:channelId` — toggle subscription (protected)
  * `GET /subscriptions/u/:subscriberId` — get user's subscribed channels (protected)

* **Playlists** (`/playlists`) (protected)

  * `POST /playlists` — create playlist
  * `GET /playlists/:playlistId` — get playlist by id
  * `PATCH /playlists/:playlistId` — update playlist
  * `DELETE /playlists/:playlistId` — delete playlist
  * `PATCH /playlists/add/:videoId/:playlistId` — add video to playlist
  * `PATCH /playlists/remove/:videoId/:playlistId` — remove video from playlist
  * `GET /playlists/user/playlist` — get user's playlists

* **Dashboard** (`/dashboard`) (protected)

  * `GET /dashboard/stats` — get channel stats
  * `GET /dashboard/videos` — get channel videos

* **Healthcheck** (`/healthcheck`)

  * `GET /healthcheck/` — service health check

> All protected routes require a valid access token — middleware `verifyJwt` is applied for those routes in the router files.

---

## Frontend routes (Next.js app)

Below are the important frontend pages/routes as reflected in your `app/` folder (Next.js App Router):

* `/` — Home (app/page.js)
* `/login` — Login page (app/login/page.js)
* `/register` — Register page (app/register/page.js)
* `/upload` — Upload video page (app/upload/page.js)
* `/player/[videoId]` — Video player / watch page (app/player/\[videoId]/page.js)
* `/channel/[channelId]` — Channel page (app/\[channelId]/page.js inside subscriptions folder shown)
* `/playlists` — Playlists (app/playlists/\*)
* `/search/[title]` — Search results page (app/search/\[title]/page.js)
* `/subscriptions` — Subscriptions list (app/subscriptions/page.js)
* `/history` — Watch history (app/history/page.js)
* `/forgot-password` — Forgot password flow
* `/change-password` — Change password flow
* `/api/auth/[...nextauth]` — NextAuth API route (app/api/auth/\[...nextauth]/route.js)

> The `app/lib` folder contains helpers (`api.js`, `authOptions.js`, `getCroppedImg.js`) used across the frontend.

---

## Environment variables (exact names)

Make sure these are present in your deployment / local `.env` files.

### Backend env vars (use in Render / local `.env`)

```
PORT
CLOUDINARY_API_SECRET
MONGODB_URI
CORS_ORIGIN
ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRY
REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

> Note: You provided `CLOUDINARY_API_SECRET` twice; keep only one entry with the correct value. Also ensure `MONGODB_URI` name matches what your app reads (app.js used `process.env.MONGO_URI` in earlier README — verify your code and use consistent names).

### Frontend env vars (`.env.local` for Next.js)

```
NEXT_PUBLIC_BACKEND_URI   # e.g. https://project-youtube-backend-1.onrender.com
NEXTAUTH_SECRET
NEXTAUTH_URL             # e.g. https://you-tube-clone-ten-gamma.vercel.app
```

---

## Local setup (quick)

**Backend**

```bash
cd backend
npm install
# create .env (use the env names above)
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
# create .env.local (use the frontend env names above)
npm run dev
```

---

## Notes & tips

* Double-check env var names inside your code — for example your `app.js` may reference `process.env.CORS_ORIGIN` and other names; keep `.env` keys consistent.
* For NextAuth in production, `NEXTAUTH_URL` and `NEXTAUTH_SECRET` must be set. For Credentials strategy make sure JWT secrets are synced between frontend and backend if you verify tokens server-side.
* Use Postman (or Insomnia) with the `Authorization: Bearer <token>` header to test protected endpoints.

---

## Contact

**Author:** Rohit

* Backend repository: [https://github.com/RohitPanwar46/Project-youtube-backend](https://github.com/RohitPanwar46/Project-youtube-backend)
* Project backend (deployed): [https://project-youtube-backend-1.onrender.com](https://project-youtube-backend-1.onrender.com)
* Frontend demo: [https://you-tube-clone-ten-gamma.vercel.app/](https://you-tube-clone-ten-gamma.vercel.app/)
* Email: [freelancerrohit46@gmail.com](mailto:freelancerrohit46@gmail.com)
* Email (alternate): [rkmali845@gmail.com](mailto:rkmali845@gmail.com)
* LinkedIn: [https://www.linkedin.com/in/rohit-panwar-094b4133a](https://www.linkedin.com/in/rohit-panwar-094b4133a)