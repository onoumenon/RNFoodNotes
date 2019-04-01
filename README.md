# FOODNOTES

## A personal footnotes-taking React Native app for food places

> Foodnotes is created to log all the food places I have tried or want to try.

### Features:

- ✅ - indicates Done
- 🔲 - indicates Doing (or so I'd like to think)
- 🛠 - indicates To-Do
- 💭 - indicates Future Features
- ❔ - indicates needs Research

##### Loading/ App

- ✅ Splash Screen
- ✅ Authentication Loading (fetch token from storage and redirect if exist)
- 🛠 Loading spinner on slow fetch calls (Login/Register, Fetch Map Markers, Fetch Food Places)
- 🛠 Verify Token before redirect
- 🛠 Redux/ Hoist State for better state control

##### User Authentication (If token is found in AsyncStorage, skip to App)

- ✅ Register (linked to backend)
- ✅ Log In (linked to backend)
- ✅ Error Messages on Error (eg: username exists)
- 🛠 Password hidden on typing
- 🛠 Password Match field ❔ (Joi schema)

##### HomeScreen

- ✅ Responsive Map (user can zoom or pan, and can change pin location)
- ✅ Map Style
- ✅ Search Implementation (By Name, Notes and Location)
- 🛠 Get Timezone by device/ user settings
- 🛠 Different colors for open/ close markers
- 🛠 Show OP/CL times for marker
- 🛠 Use GeoSpatial Query to calculate distance
- 💭 Cluster Markers when density reaches a certain threshold
- 💭 If there are alot of markers, render only by view

##### LinksScreen

- ✅ Display Places that are nearby
- ✅ Search (by name, notes, location)
- ✅ CRUD operations (create, edit, delete)
- 🛠 Using FlatList ❔ (RN component) to render all places as an option
- 💭 Use ImagePicker ❔ (RN component) instead of URLs

##### SettingsScreen

- ✅ User sign out
- 🛠 Basic User Info (username, avatar)
- 🛠 Change Password
- 🛠 Delete Account
- 🛠 User Settings (default of show Open/ Open + Close, language, country)
- 💭 Color Theme

##### Backend

- ✅ Implement GeoJson in Seed Data
- ✅ Get Place (By Name, Notes, Get Only One, Location, Opening Hours, All)
- ✅ Post Place (No Name Dups, save geocoords with res from OpenCage API)
- ✅ Put Place by ID (Patch Implementation)
- ✅ Delete Place by ID
- ✅ Create User
- ✅ Sign In
- ✅ Verify Token
- 🔲 use VerifyToken on certain routes
- 🛠 Change User Model, link to Places
- 🛠 Delete User

##### Tests

- ✅ Get Place (By Name, Notes, All)
- ✅ Post Place (No Name Dups)
- ✅ Put Place by ID (Patch Implementation)
- ✅ Delete Place by ID
- ✅ Verify Token
- 🔲 All the other implementations of GET Place
- 🛠 Ensure Geocoords is saved in POST Place
- 🛠 Create User
- 🛠 Sign In
- 🛠 TDD future features

##### CI

- 🛠 Implement Circles CI or Travis
