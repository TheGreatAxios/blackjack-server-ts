# BlackJack
This project aims to build a multiplayer blackjack game that allows for classic player vs dealer
action. This project will showcase client-server architecture through the use of Web Sockets.
# Features
**Ability to join a table with a user name**

  a. Issues with muliplayer ability has occured while the two users can still call the server there
  are still some complications with the server side that don't allow the game to be played with two
  
**Buttons**

  a. Betting, the user after joins a table they have the option to place a bet in various amounts. Each user
  starts with 1000 coins.
  
  b. "Ready Up", once the player presses Ready Up a request is sent to the server and the client reciveves the cards
  for the dealer and the user.
  
  c. "Hit", if the user is not satisfied with the total of their cards they can hit the Hit button which sends a request
  to the server for another card. This action can be repeated X amount of times until busts.
  
  d. "Stay", once the player is satisfied with the total of their cards they can hit Stay whichs sends a request to the server.
  that request then sends the dealers cards and displays the sums of both the dealer and the user cards. The amount of coins the user 
  has is also updated based on whether they won or lost.
  
# Demo
https://drive.google.com/file/d/1gT_WWBg1J81xhuiAi3Z8VjfuYOIZoL6g/view?usp=sharing

# Team Members
Noah B and Sawyer C
