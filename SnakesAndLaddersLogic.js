var game = new function(){
	var gameSelf = this;
	var START = 0;
	var VICTORY = 100;
	var players = [];
	var playerTurn;
	var snakesAndLadders = [new SnakeOrLadder( 1,38), new SnakeOrLadder( 4,14), new SnakeOrLadder( 9,31), new SnakeOrLadder(17,7 ), new SnakeOrLadder(21,42), new SnakeOrLadder(28,84), 
							new SnakeOrLadder(51,67), new SnakeOrLadder(54,34), new SnakeOrLadder(62,19), new SnakeOrLadder(64,60), new SnakeOrLadder(71,91), new SnakeOrLadder(80,100), 
							new SnakeOrLadder(87,24), new SnakeOrLadder(93,73), new SnakeOrLadder(95,75), new SnakeOrLadder(98,79)];
	var dice = $("#dice");						
	
	gameSelf.defaultSetup = function(){
		players = [];
		gameSelf.addPlayer();
		gameSelf.addPlayer();
		playerTurn = Math.floor(Math.random()*players.length);
		InvokeCB(currentPlayerChangedCallback, game.getPlayerTurn());
		InvokeCB(gameStateChangedCallback, false);
	}
	
	gameSelf.newGame = function(){
		for(var i = 0; i < players.length; i++){
			players[i].resetPosition();
		}
		InvokeCB(gameStateChangedCallback, false);
		playerTurn = Math.floor(Math.random()*players.length);
		InvokeCB(currentPlayerChangedCallback, game.getPlayerTurn());
	}
	
	gameSelf.getPlayers = function(){
		return players;
	}

	gameSelf.getPlayerTurn = function(){
		return players[ playerTurn ];
	}
	
	gameSelf.addPlayer = function(){
		var aPlayer = new Player("Player" + players.length);
		players.push(aPlayer)
		InvokeCB(playerAddedCallback,aPlayer);
	}
	
	gameSelf.getPlayersNames = function(){
		var i = 0;
		var result = new Array(players.length);
		for (i=0;i<players.length;i++){
			result[i] = players[i].name;
		}
		return result;
	}

	function updateTurn(){
		playerTurn = ++playerTurn % players.length;
		InvokeCB(currentPlayerChangedCallback, game.getPlayerTurn());
	}

	gameSelf.nextTurn = function(){
		if (!game.isGameOver()){
			game.getPlayerTurn().move(snakesAndLadders);
			//한번더 위치일때 턴을 변경 안하게 할 수 있음.
			// if(game.getPlayerTurn().getPosition() == position){
				
			// }
			updateTurn();
		}
	}

	gameSelf.isGameOver = function(){
		var result = false;
		for(var i = 0; i < players.length; i++){
			if (players[i].getPosition() >= VICTORY) {
				result = true;
			}
		}
		if (result == true) {
			InvokeCB(gameStateChangedCallback, true);
		}
		return result;
	}
	
	var playerAddedCallback = new Array();
	var currentPlayerChangedCallback = new Array();
	var gameStateChangedCallback = new Array();
	
	gameSelf.playerAdded = function(cb){
		playerAddedCallback.push(cb);
	}
	
	gameSelf.currentPlayerChanged = function(cb){
		currentPlayerChangedCallback.push(cb)
	}
	
	gameSelf.gameStateChanged = function(cb){
		gameStateChangedCallback.push(cb);
	}
	
	function InvokeCB(cb, arg)
	{
	   for(var i=0;i<cb.length;i++)
	   {
		  if (cb[i]){cb[i](arg);}
	   }
	}

	/**
	* Player represents a player in the game.
	*/
	function Player(name){
		var playerSelf = this;
		var name = name;
		var position = START;
		
		playerSelf.getPosition = function(){
			return position;
		}
		
		playerSelf.resetPosition = function(){
			position = START;
			InvokeCB(positionChangedCallback,position);
		}
		
		playerSelf.setName = function(newName){
			playerSelf.name = newName;
			InvokeCB(nameChangedCallback,newName);
		}
		
		playerSelf.getName = function(){
			return name;
		}
		
		function rollDice(){
			$(".wrap").append("<div id='dice_mask'></div>");//add mask
			dice.attr("class","dice");//After clearing the last points animation
			dice.css('cursor','default');
			var num = Math.floor(Math.random()*6+1);//random num 1-6
			dice.animate({left: '+2px'}, 100,function(){
				dice.addClass("dice_t");
			}).delay(200).animate({top:'-2px'},100,function(){
				dice.removeClass("dice_t").addClass("dice_s");
			}).delay(200).animate({opacity: 'show'},600,function(){
				dice.removeClass("dice_s").addClass("dice_e");
			}).delay(100).animate({left:'-2px',top:'2px'},100,function(){
				dice.removeClass("dice_e").addClass("dice_"+num);
				$("#result").html("Your throwing points are<span>"+num+"</span>");
				dice.css('cursor','pointer');
				$("#dice_mask").remove();//remove mask
			});
			//var idx = num-1;
			InvokeCB(diceRolledCallback, num);
			return num;
		}
		
		
		var positionChangedCallback = new Array();
		var nameChangedCallback = new Array();
		var diceRolledCallback = new Array();
		
		playerSelf.positionChanged = function(cb){
			positionChangedCallback.push(cb);
		}
		playerSelf.nameChanged = function(cb){
			nameChangedCallback.push(cb);
		}
		
		playerSelf.diceRolled = function(cb){
			diceRolledCallback.push(cb);
		}
		
		function InvokeCB(cb, arg)
		{
			console.log("cb",cb);
		   for(var i=0;i<cb.length;i++)
		   {
			  if (cb[i]){cb[i](arg);}
		   }
		}
		
		playerSelf.move = function(snakesAndLadders){
			position = rollDice() + position;
			InvokeCB(positionChangedCallback,position);
			for (var i = 0; i < snakesAndLadders.length; i++){
				if (position == snakesAndLadders[i].getHead()){
					position = snakesAndLadders[i].getTail();
					InvokeCB(positionChangedCallback,position);
				}
			}
		}
	}
	
	/**
	* SnakeOrLadder represents a snake or ladder object. 
	* To create a snake the head value must be greater then the tail value.
	* To create a ladder the head value must be great then the tail value. 
	*/
	function SnakeOrLadder(head, tail){
		var snakeOrLadderSelf = this;
		var head = Math.abs(head);
		var tail = Math.abs(tail);
		
		snakeOrLadderSelf.getHead = function() {
			return head;
		}
		
		snakeOrLadderSelf.getTail = function() {
			return tail;
		}
	}
	
	gameSelf.gameState = function(){
		alert(players[0].getName() + " Position = " + players[0].getPosition() + "\n" + players[1].getName() + " Position = " + players[1].getPosition() );
	}
	
	gameSelf.testVictory = function() {
		while (!game.isGameOver()){
			game.nextTurn();
		}
		alert("Game Over player " + game.getPlayerTurn().getName() + " is the victor.");
	}
}();
