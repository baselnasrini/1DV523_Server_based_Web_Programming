# 1DV523 - Server based Web Programming

This repository contains the assignments' files of 1DV523 - Server based Web Programming Course at Linnaeus University.


## Assignment 1
In this assignment, the task is to write a web scraper that scrapes but also analyzes information on some web sites built especially for this assignment. The idea is that I was going to write a scraper/agent that is designed to solve a specific problem.

I will get the main page to proceed from which links to three different web sites. I don't have to care about how they work internally, just the HTML they are rendering and how to form your HTTP request to get the data you want for analyzing.

My starting point was http://vhost3.lnu.se:20080/weekend, which should also be the starting point in your scraping script, meaning that no more hardcoded URLs should be used in your code (except for the AJAX call in the cinema site). Your scraping script should also be able to handle the alternative server (see below).

### Goals of the assignment was:
- Get practical experience in building a web scraper.
- Get knowledge about HTTP and use it when building an application in Node.js.
- Analyze the traffic between the client and the server.
- Get practical knowledge of asynchronous programming in Node.js.
- Analyze and solve a problem with JavaScript code.
- Using Git to show progress in your work.

## Assignment 2
The application in Node.js will use Express as the application framework and Mongoose as the object modeling library. The application must have full CRUD functionality regarding snippets, whereby a user must be able to create, read, update and delete snippets.

Users must be able to register and login to the application after entering a username and a password. A user cannot register an already existing username because the username must be unique to the application. A logged in user must be able to log out of the application.

Anonymous users should only be able to view snippets. Authenticated users, in addition to view snippets, must also be able to create, edit and delete their snippets. No one but the authenticated user should be able to create, edit and delete their snippets. Because of this, the application must support some basic authentication and authorization. On the server-side you may only use plain session storage, using the express-session package, to implement authentication and authorization. You must not use any packages such as Passport, etc., to authenticate or authorize.

## Assignment 3
In this assignment, I wrote a web application where I have to include some real-time web technologies. I also published my application on a real (public) production server.

The idea behind the application is that I should be able to list issues from my GitHub repository for this examination assignment (e.g. https://github.com/1dvX23/xx222xx-examination-3). I will use this repository for my code but also test the application by creating issues (and comments) and include these in your application through the GitHub REST API and GitHub's webhooks.

### Assignment goals
The assignment aims to give the student practical and theoretical experience about developing real-time web applications through Web socket and webhooks. The student should also get practical experience on how to put the built web application into production in a secure way.
