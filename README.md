# Chatzilla

Chatzilla is a realtime messaging app with a bit of oldschool chatroom flair that pairs a React client with a Rails API. 

**Hosted at**: https://chatzilla-front-end.onrender.com/

## Key Features
- **Authentication** – Sign‑up, sign‑in, and sign‑out handled by Devise; CSRF tokens are fetched automatically.
- **Room Creation** - Users can create chatrooms based on their interests, which other users can join.
- **Realtime Messaging** - Users can send messages within rooms they have joined, and messages are delivered instantly via ActionCable.
- **Presence Tracking and Toggling** - Online status is stored in Redis and broadcast to all users. Users can toggle between displaying themselves as online/offline by clicking a button.
- **Content Moderation via Neutrino** - Usernames, room names and descriptions, and message content are all checked through the Neutrino API and inappropriate submissions are rejected.
- **Responsive UI** – Off‑canvas navigation panel lists rooms and users and provides a “Create Room” modal. Bootstrap and custom styles ensure mobile friendliness.
- **Account Deletion** - Users can freely delete their account and any messages they've sent by clicking on their user page (however, note that this will *not* delete any rooms they've created).

## Tech Stack
- **Frontend** - React + Bootstrap
- **Backend** - Rails, PostgreSQL, Redis, ActionCable, Devise
- **Utilities** - HTTParty, MSW (tests), ESLint/Prettier, Neutrino (content moderation)
- **Testing** - Vitest, Rspect, Cypress (work in progress)

## Project Structure

```text
.
├── messenger_api/        # Rails API backend
├── src/                  # React client source
│   ├── components/       # Reusable UI pieces (forms, nav panel, auth widgets)
│   ├── guard_components/ # Route guards for auth states
│   ├── layouts/          # Page layouts (auth flow vs. main app)
│   ├── pages/            # Routed views (Home, Room, User, SignIn/SignUp)
│   └── services/         # ActionCable consumer helper
├── cypress/              # Cypress end‑to‑end tests (still a work in progress)
└── public/               # Static assets
```
## Future Improvements
- Approval requirement for joining private rooms
- Ability to edit room names and descriptions after creation
- Ability to edit usernames
- Allow sign-in via Google, Facebook, etc.
- Incorporation of images (for user avatars and messages); will require expanding content moderation

## Screenshots
<img width="1248" height="615" alt="Screenshot 2025-08-13 at 11 04 16 AM" src="https://github.com/user-attachments/assets/e9f62302-e2a8-4935-befd-35156d553032" />
<img width="1261" height="612" alt="Screenshot 2025-08-13 at 11 05 29 AM" src="https://github.com/user-attachments/assets/aaf3639f-2d10-4b49-805a-2b6d710ddaa9" />
<img width="1253" height="619" alt="Screenshot 2025-08-13 at 11 06 15 AM" src="https://github.com/user-attachments/assets/7f66a281-d9e9-4482-94b0-56aa1d3a663f" />

## License
No license file is currently present. Treat this as all rights reserved unless a license is added. If you plan to fork/distribute, please open an issue to discuss.
