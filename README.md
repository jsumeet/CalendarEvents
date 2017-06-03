
A simple calendar syncing system that keeps a local cache of calendar events that sync to Google Calendar API.

Introduction:
a simple cache system that allows an endpoint that serves a list of calendar events from a logged in user's Google calendar while limiting the number of API hits to Google Calendar by holding a local cache of events.

### GET /calendar-events
* If the user is not logged in, then he/she is redirected to login page for Google Calendar to authorize user. After auth, redirected to /calendar-events endpoint
* Shows a list of upcoming calendar events with event data:
  * Event Date
  * Event Title
  * Event Description
  * List of Attendees (with attendance reponse)

#### GET Params
| Params  | Required | Description |
| ------- | -------- | ----------- |
| startDate | false  | ISO date format string. If present, bounds all events returned by the query to have a starting event datetime >= to value. (i.e. '2017-01-17T03:36:22.321Z') |
| endDate   | false  | ISO date format string. If present, bounds all events returned by the query to have a starting event datetime <= to value. (i.e. '2017-01-17T03:36:22.321Z') |



## Running the Project
1. Clone this repository
2. Install node.js and npm
3. CD into directory and run 'npm install'
4. Run 'npm run start'
5. Go to browser and navigate to http://localhost:3007/
