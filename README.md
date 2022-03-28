# nti_exam
This is the exam for the recruitment process and evaluation by NTi.

Follow the instructions below to do the set up of the app:
1) In this folder you'll find an .sql archive that is the backup of the database. The app uses MYSQL as a database engine. It is in database folder, also to setup the database go to keys.js file, there is the username and pwd.
2) To start the set up, in your terminal write *npm install*, it's the command to install every package located in package.json files. The app works with NodeJS so, be sure you have the engine in your pc.
3) The architecture of the app following the next folders:
| 
|___node_modules
|___src
|______lib
|__________auth
|__________handlebars
|__________helpers
|__________passport
|__________validator
|______public
|__________css
|__________img
|__________js
|__________vendor
|__________css
|______routes
|__________auth
|__________index
|______views
|__________controllers
|__________layouts
4) To start the app type in your terminal the next command:
npm run dev