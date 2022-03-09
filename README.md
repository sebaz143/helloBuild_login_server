# Features

- This nodejs application is a backend API to serve a login frontend developed in React JS. The git repository of the frontend is [front_end](https://github.com/sebaz143/helloBuild_app_fron "front_end") .
- It is developed with express framework. It has 5 endpoint:
1. post -> /user/signup to register new users.
2. post -> /user/login to login into the software.
3. get -> /user/likes/:email return all the liked repositories of a user.
4. put -> /user/likes update de likes array on the user document.
5. get -> /oauth/github github callback for OAuth.

- The application has a MongoDB database in [https://cloud.mongodb.com/](https://cloud.mongodb.com/) to save the user's data.

# Installation

1. clone the repo.

2. Go to helloBuild_login_server

`cd helloBuild_login_server`

3. install node packages:

`npm install`

4. Install nodemon to run the server:

`npm install nodemon --save`

5. create a .env file under login_server folder with this content:

```markdown
MONGODB_URI=mongodb+srv://sebasarboleda:fyn9p7a4vXUp9nd@cluster0.tp0w7.mongodb.net/helloBuild?retryWrites=true&w=majority
```
6. run the server:

`nodemon server.js`
