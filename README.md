# Auth Project

This project is a beginner-friendly full-stack authentication app built with:

- `React + Vite` for the frontend
- `Express` for the backend
- `MongoDB + Mongoose` for the database
- `express-session + connect-mongo` for session-based authentication

The app lets a user:

- register a new account
- log in with an existing account
- stay logged in using a session
- open a protected dashboard
- log out and destroy the session

This README explains the whole project from a beginner's point of view. It focuses on the workflow, how the frontend and backend communicate, and especially what a session is and how it is implemented here.

**Project Purpose**

The main purpose of this project is to learn how a real authentication system works in a full-stack web app.

Instead of only creating forms, this project connects four important parts:

- the frontend where users type information
- the backend where requests are processed
- the database where users are stored
- the session system that remembers who is logged in

In simple words, the project flow looks like this:

1. The user uses the React frontend.
2. The frontend sends requests to the Express backend.
3. The backend reads or writes user data in MongoDB.
4. The backend creates a session when authentication succeeds.
5. The browser stores the session cookie.
6. Future requests use that cookie so the backend knows who the user is.

**Project Structure**

```text
auth-project/
├── README.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── config/
│   │   └── server.js
│   ├── models/
│   │   └── User.js
│   └── routes/
│       └── auth.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   ├── main.jsx
    │   ├── components/
    │   │   ├── AuthShell.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── auth-context.js
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── lib/
    │   │   └── api.js
    │   └── pages/
    │       ├── Dashboard.jsx
    │       ├── Login.jsx
    │       └── Register.jsx
    └── README.md
```

**Main Files and Their Responsibilities**

[backend/config/server.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/backend/config/server.js)

- starts the Express server
- connects the app to MongoDB
- enables CORS so the frontend can talk to the backend
- enables JSON parsing for incoming requests
- configures session handling
- mounts auth routes at `/api/auth`

[backend/models/User.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/backend/models/User.js)

- defines the MongoDB schema for a user
- validates username, email, and password
- hashes passwords before saving them
- compares plain passwords with hashed passwords during login

[backend/routes/auth.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/backend/routes/auth.js)

- contains the auth endpoints
- registration logic
- login logic
- logout logic
- session check logic

[frontend/src/context/AuthContext.jsx](/Users/thanhphatchau/Documents/School/thesis/auth-project/frontend/src/context/AuthContext.jsx)

- stores the current logged-in user in React state
- checks the session when the app starts
- provides `login`, `register`, and `logout` functions to the frontend

[frontend/src/components/ProtectedRoute.jsx](/Users/thanhphatchau/Documents/School/thesis/auth-project/frontend/src/components/ProtectedRoute.jsx)

- blocks access to protected pages
- redirects unauthenticated users to `/login`

[frontend/src/lib/api.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/frontend/src/lib/api.js)

- creates the Axios client
- connects the frontend to the backend API
- enables `withCredentials: true` so cookies are sent with requests

**What Authentication Means**

Authentication means proving who a user is.

In this project:

- a user registers with a username, email, and password
- the password is not stored directly
- the password is hashed before it is saved
- later, when the user logs in, the backend checks whether the entered password matches the stored hash

If the password is correct, the backend creates a session so the app remembers that the user is logged in.

**What a Session Is**

A session is a way for the server to remember a user between requests.

This matters because HTTP is stateless.

Stateless means:

- one request does not automatically remember the previous request
- the server does not automatically know that two requests came from the same person

So after login, the server needs a way to remember the user.

That is the job of a session.

Think of a session like this:

1. A user logs in successfully.
2. The server creates a session record.
3. The server stores the user's ID inside that session.
4. The browser receives a cookie with the session ID.
5. On later requests, the browser sends that cookie back.
6. The server reads the cookie, finds the session, and recognizes the user.

**Session and Cookie Are Not the Same**

These two concepts work together, but they are different.

`Session`

- stored on the server
- contains data such as `userId`
- in this project it is stored in MongoDB using `connect-mongo`

`Cookie`

- stored in the browser
- contains the session ID
- in this project the cookie is `connect.sid`
- it does not contain all user data

A simple analogy:

- the session is the locker
- the cookie is the locker key

**How Sessions Are Implemented in This Project**

Session configuration is in [backend/config/server.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/backend/config/server.js).

Important code:

```js
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: false,
    },
  })
);
```

What these options mean:

`secret`

- signs the session cookie
- helps protect the cookie from tampering

`resave: false`

- do not save the session again if nothing changed

`saveUninitialized: false`

- do not create a session until it is actually needed

`store: MongoStore.create(...)`

- stores sessions in MongoDB
- this is better than only storing them in memory for a real app

`cookie.maxAge`

- how long the cookie stays valid
- here it is 24 hours

`cookie.httpOnly`

- browser JavaScript cannot read the cookie
- improves security

`cookie.secure`

- `false` in local development because HTTPS is not used
- should usually be `true` in production with HTTPS

**How the Backend Uses Sessions**

After successful registration, the backend does this in [backend/routes/auth.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/backend/routes/auth.js):

```js
req.session.userId = newUser._id;
await req.session.save();
```

After successful login, it does this:

```js
req.session.userId = user._id;
await req.session.save();
```

This means:

- the server saves the user's MongoDB ID in the session
- the browser receives the session cookie
- future requests can prove the user is already authenticated

When the user logs out:

```js
req.session.destroy(...)
res.clearCookie("connect.sid")
```

This removes the session and clears the browser cookie.

**How the Frontend Works With Sessions**

The frontend does not directly manage session IDs by hand.

Instead, [frontend/src/lib/api.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/frontend/src/lib/api.js) enables:

```js
withCredentials: true
```

This tells the browser to include cookies when sending requests to the backend.

Without `withCredentials: true`:

- the session cookie would not be sent
- the backend would not know who the user is
- protected routes would fail even after successful login

**Complete Workflow of the App**

Here is the full workflow from opening the app to logging out.

**Step 1: The app starts**

The frontend begins in [frontend/src/main.jsx](/Users/thanhphatchau/Documents/School/thesis/auth-project/frontend/src/main.jsx), which renders [frontend/src/App.jsx](/Users/thanhphatchau/Documents/School/thesis/auth-project/frontend/src/App.jsx).

`App.jsx` defines routes for:

- `/login`
- `/register`
- `/dashboard`

The app is wrapped in `AuthProvider`, so all pages can access auth state.

**Step 2: The frontend checks if a session already exists**

When the app first loads, [frontend/src/context/AuthContext.jsx](/Users/thanhphatchau/Documents/School/thesis/auth-project/frontend/src/context/AuthContext.jsx) calls:

```js
authClient.get("/me")
```

This sends a request to:

- `GET /api/auth/me`

Possible outcomes:

- if a valid session exists, backend returns the user
- if no session exists, backend returns `401`

This is why `401 Not authenticated` on `/me` is normal before login.

**Step 3: The user registers**

On the register page:

- the user enters username, email, and password
- the frontend sends `POST /api/auth/register`

Backend flow:

1. validate the input
2. normalize values
3. check whether the email already exists
4. check whether the username already exists
5. create a new user
6. hash the password before saving
7. save the user in MongoDB
8. create a session and store `userId`
9. send safe user data back to the frontend

Frontend flow after success:

1. save returned user data in React state
2. redirect to `/dashboard`

**Step 4: The user logs in**

On the login page:

- the user enters email and password
- the frontend sends `POST /api/auth/login`

Backend flow:

1. validate the input
2. find the user by email
3. compare the plain password against the stored hashed password
4. create a session
5. return user data

Frontend flow:

1. save user data in React state
2. redirect to `/dashboard`

**Step 5: ProtectedRoute protects the dashboard**

[frontend/src/components/ProtectedRoute.jsx](/Users/thanhphatchau/Documents/School/thesis/auth-project/frontend/src/components/ProtectedRoute.jsx) decides whether the user can see the dashboard.

It does three things:

- shows a loading state while auth is still being checked
- redirects to `/login` if no user exists
- renders the page if the user is authenticated

**Step 6: The user refreshes the page**

When the browser refreshes:

- React state is reset
- but the browser still has the session cookie
- the frontend calls `/me` again
- the backend reads the session cookie
- the backend finds the session in MongoDB
- the backend returns the current user
- the frontend restores the user in state

This is why the user stays logged in after a refresh.

**Step 7: The user logs out**

The frontend sends:

- `POST /api/auth/logout`

The backend:

- destroys the session
- clears the session cookie

After that, the user is no longer authenticated.

**Password Security**

This project does not store plain-text passwords.

In [backend/models/User.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/backend/models/User.js), the password is hashed with `bcrypt` before saving.

That means:

- if someone reads the database, they do not see the real password
- during login, the app compares the entered password with the hash

This is a basic but very important security practice.

**API Endpoints**

`POST /api/auth/register`

- creates a new user
- creates a session
- returns user data

`POST /api/auth/login`

- verifies credentials
- creates a session
- returns user data

`POST /api/auth/logout`

- destroys the current session
- clears the cookie

`GET /api/auth/me`

- checks whether the user is authenticated
- returns current user data if a valid session exists

`GET /api/auth/register`

- returns `405 Method Not Allowed`
- explains that registration must use `POST`

`GET /api/auth/login`

- returns `405 Method Not Allowed`
- explains that login must use `POST`

**Database Model**

The user schema in [backend/models/User.js](/Users/thanhphatchau/Documents/School/thesis/auth-project/backend/models/User.js) contains:

- `username`
- `email`
- `password`
- timestamps

Validation rules:

- username is required
- username must be at least 3 characters
- username must be unique
- email is required
- email must be unique
- password is required
- password must be at least 6 characters

**How to Run the Project**

**Requirements**

- Node.js installed
- MongoDB installed locally, or a valid MongoDB connection string

**Backend**

Go to the backend folder:

```bash
cd /Users/thanhphatchau/Documents/School/thesis/auth-project/backend
```

Install packages:

```bash
npm install
```

Check [backend/.env](/Users/thanhphatchau/Documents/School/thesis/auth-project/backend/.env):

```env
MONGO_URI=mongodb://localhost:27017/auth_db
SESSION_SECRET=replace_this_with_a_very_long_random_string_abc123xyz
PORT=5001
```

Start the backend:

```bash
npm run dev
```

Expected output:

```bash
MongoDB connected
Server running on http://localhost:5001
```

**Frontend**

Open another terminal:

```bash
cd /Users/thanhphatchau/Documents/School/thesis/auth-project/frontend
```

Install packages:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the app:

- [http://localhost:5173](http://localhost:5173)

**Beginner Testing Guide**

Recommended manual test order:

1. start the backend
2. start the frontend
3. open `/register`
4. create a new account
5. confirm redirect to `/dashboard`
6. refresh the page
7. confirm the user is still logged in
8. log out
9. try opening `/dashboard`
10. confirm redirect to `/login`
11. log in again

**Common Errors and Meanings**

`401 Unauthorized` on `/api/auth/me`

- usually normal before login
- means there is no valid session yet

`Cannot GET /api/auth/register`

- usually means someone opened the API URL directly in the browser
- the frontend page should be `/register`
- the API endpoint should be called with `POST`

`409 Email already in use`

- another user already has that email

`409 Username already taken`

- another user already has that username

`500 Server error during registration`

- something failed in the backend register flow
- check the backend terminal log

Frontend shows `Failed to load resource`

- backend may not be running
- wrong port may be used
- MongoDB may not be available

**Why This Project Uses Sessions**

This project uses session-based authentication because it is easier for beginners to understand in a traditional full-stack app.

Sessions are useful here because:

- the backend controls the authentication state
- logout is simple
- the server can invalidate sessions directly
- it demonstrates how cookie-based login works in a real web app

JWT is another popular authentication style, but it follows a different design.

**Key Things to Learn From This Project**

This project helps you understand:

- how the frontend and backend communicate
- how authentication requests are sent
- how MongoDB stores users
- why passwords must be hashed
- what a session is
- how cookies and sessions work together
- how protected routes work in React
- how login state survives a page refresh

**Final Summary**

This project demonstrates a complete session-based authentication workflow:

1. the user enters credentials in React
2. the frontend sends the request to Express
3. Express validates the request
4. MongoDB stores or retrieves the user
5. Express creates a session
6. the browser stores the session cookie
7. later requests send that cookie again
8. the backend uses the session to identify the user
9. the frontend restores auth state through `/me`
10. protected pages become available only to authenticated users

If you clearly understand that workflow, you understand the core idea of session-based authentication in a real full-stack application.
