# uptimeMonitor

This is a Node JS project.

This application allows users to enter URLs they want to be monitored, and receive alerts when those resources "go down" or "come back up".

Users have ability to sign-up sign-in and settings.

Included the functionality for sending the SMS alert.

API Specs:
1. The API listens on a PORT and accepts incoming HTTP requests for POST, GET, PUT, DELETE
2. The API allows a client to connect, create a new user, edit and delete that user.
3. The API allows user to "sign in" which gives them a token that they can use for subsequent authenticated requests.
4. Sign out and token invalidated.
5. Signed in user can create a check through which it can validate if the URL is up or down.
6. Edit or delete a check a user can create maximum 5 checks.
7. Perform the checks in the background at the appropriate times. If the status changes from "up" to "down" or vice versa we send an SMS alert.
8. Twilio for SMS
9. Using the file system instead of data store. Writing the json file in the file system.
