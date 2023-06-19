# CiTopics 
Welcome to Citopics, the location-based forum !

## Run the Api  

Clone the project  

~~~bash  
  git clone https://github.com/CLASSEROOM-B1/forum-les-alcooliques-anonyme.git
~~~

Go to the project directory  

~~~bash  
  cd my-project
~~~

Go to the api directory  

~~~bash  
  cd Api
~~~

Duplicate the .env.example and fill it with your oauth (github & discord) credentials
~~~bash  
  cp .env.exemple .env
~~~

Run the server  

~~~bash  
go run server.go
~~~

---
## Run the client


Go to the Client directory  

~~~bash  
cd Client
~~~

- Put a google map api key in the env.js

Install dependencies

~~~bash  
npm install
~~~

Start the client

~~~bash  
npm start
~~~

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Team

[MazBazDev](https://github.com/MazBazDev)
[Manonbrz](https://github.com/manonbrz)
[Envel69](https://github.com/envel69)
