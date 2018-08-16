/**
 * Created by Nefast on 31/07/2017.
 */
document.getElementById('spaceInvader').appendChild(document.createElement('canvas'));

(function (canva) {
    canva.gameplay = {
      begin : true,
      start : false,
      pause : false,
      ended : false,
      currentLevel : 1,
      level : 30,
      maxLevel : 10,
      targetNumber : 30,
      targetBigNumber : 0,
      targetBossNumber : 0,
      targetSpeed : 1,
      shootSpeed : 5,
      win : false,
      state_wl : '',
    };

    canva.player = {
      playerLife : 3,
      playerCooldown : true,
      playerSpeed : 15,
      playerPosSizeX : 60,
      playerPosSizeY : 60,
      playerPosX : 0,
      playerPosY : 0,
      playerShootRepeat : 1,
    };

    canva.shoots = [];
    canva.enemies = [];
    /* Initialisation des variables */
    canva.isRunning = false;
    canva.isStart = false;
    canva.context = canva.getContext('2d');
    canva.speed = 10;
    canva.line = 5;

    /* Taille du canva */
    canva.playerImg = [];
    canva.width = window.innerWidth;
    canva.height = window.innerHeight;

    /* Set variable canva control */
    canva.left = false;
    canva.right = false;
    canva.up = false;
    canva.down = false;
    canva.shoot = false;
    canva.objects = {
        rect : [],
        circle : []
    };

    /** Shoot function **/

    canva.generateShootMovement = function() {
      var shoot;
      for(var i = 0; i < canva.shoots.length; i++){
        shoot = canva.shoots[i];
        if (shoot.shooter == 'player'){
          if (shoot.shootPosY - canva.gameplay.shootSpeed >= 0 && shoot.shootPosY - canva.gameplay.shootSpeed <= canva.height){
            shoot.shootPosY -= canva.gameplay.shootSpeed;
          }else {
            shoot.shootDestroy = true;
          }
        }
        if (shoot.shooter == 'target'){

          if (shoot.shootPosY + canva.gameplay.shootSpeed > 0 && shoot.shootPosY + canva.gameplay.shootSpeed < canva.height){
            shoot.shootPosY += canva.gameplay.shootSpeed;
          }else {
            shoot.shootDestroy = true;
          }
        }

      }
    }

    canva.generateShoot = function() {
      var shoot;
      for(var i = 0; i < canva.shoots.length; i++){
        shoot = canva.shoots[i];
        if (!shoot.shootDestroy){
          if (canva.touchMeOrNot(shoot)){
            (canva.player.playerLife > 0 ) ? canva.player.playerLife-- : '';
          }
          canva.context.fillStyle = shoot.shootSizeColor;
          canva.context.fillRect(shoot.shootPosX, shoot.shootPosY, shoot.shootSizeX, shoot.shootSizeY);
        }
      }
    }

    /** Enemies Function **/

    canva.initEnemies = function () {

      var targetByLine, poX, poY;
      canva.enemies = [];
      for(var i = 0; i < canva.gameplay.targetNumber; i++){
        targetByLine = parseInt((canva.width - 30) / 80, 10);
        poX = ((i % targetByLine) * 80) + 15;
        poY = -1 * ((parseInt(i / targetByLine, 10) - 1) * 80) ;

        canva.enemies.push({
          targetinitPosX : poX,
          targetinitPosY : poY,
          targetPosX : poX,
          targetPosY : poY,
          targetDestroy : false,
          targetSizeX : 60,
          targetSizeY : 52,
          targetDirection : 1,
          targetSpeedY : 1,
          targetSpeedX : 10,
          explosion : true,
          explosionTime : 10,
        })
      }
    };

    canva.generateEnemies = function () {

      var targetByLine, poX, poY, enemi, shoot;

      for(var i = 0; i < canva.enemies.length; i++){
        enemi = canva.enemies[i];

        if (!enemi.targetDestroy){
          for(var x = 0; x < canva.shoots.length; x++){
            shoot = canva.shoots[x];
            if (!shoot.shootDestroy)
              canva.touchTargetOrNot(shoot, enemi);
          }
        }

        if (!enemi.targetDestroy){
          canva.context.drawImage(document.getElementById('monster'), enemi.targetPosX, enemi.targetPosY);
        }else if (enemi.explosionTime > 0) {
          enemi.explosionTime--;
          canva.context.drawImage(document.getElementById('boomMonster'), enemi.targetPosX, enemi.targetPosY);
        }
      }
    };

    canva.generateEnemiesMovement = function() {
      canva.gameplay.win = true;

      var moveX
      for(var i = 0; i < canva.enemies.length; i++){
        enemi = canva.enemies[i];
        if (!enemi.targetDestroy){
          canva.gameplay.win = false;
          moveX = enemi.targetSpeedX
          enemi.targetPosY += moveX / (canva.gameplay.level - (canva.gameplay.currentLevel)) ;
          if (enemi.targetPosX > enemi.targetinitPosX + 10 || enemi.targetPosX > canva.width - enemi.targetSizeX){
            enemi.targetDirection = -1;
          }
          if (enemi.targetPosX < enemi.targetinitPosX - 10 || enemi.targetPosX < 0){
            enemi.targetDirection = 1;
          }

          enemi.targetPosX += (moveX - 8) * enemi.targetDirection;

          if ((Math.floor((Math.random() * 300) + 1) % (298 - canva.gameplay.currentLevel)) === 0 && enemi.targetPosX >= 10 && enemi.targetPosY >= 10 ){
            canva.shoots.push(
              {
                shootPosX : enemi.targetPosX + (enemi.targetSizeX / 2),
                shootPosY : enemi.targetPosY + enemi.targetSizeY + 5,
                shootSizeX : 5,
                shootSizeY : 20,
                shootSizeColor : '#e74c3c',
                shooter : 'target',
                shootTouch : false,
                shootDestroy : false,
              }
            );
          }

          if (enemi.targetPosY >= canva.height - canva.player.playerPosSizeY - 40){
            canva.player.playerLife = 0;
          }
        }
      }

      if (canva.gameplay.win){
        canva.gameplay.state_wl = 'win';
        canva.youWin();
      }
    }

    /** Player function **/

    canva.initPlayer = function () {
      canva.player.playerPosX = canva.width / 2 - canva.player.playerPosSizeX;
      canva.player.playerPosY = canva.height - canva.player.playerPosSizeY - 10;
    }

    canva.generatePlayer = function () {
      if (canva.player.playerLife > 0){
        canva.context.drawImage(document.getElementById('ship'), canva.player.playerPosX, canva.player.playerPosY);
      }else {
        if (!canva.gameplay.ended){
          canva.player.playerPosY -= 30;
        }
        canva.gameplay.ended = true;
        canva.context.drawImage(document.getElementById('boomMe'), canva.player.playerPosX, canva.player.playerPosY);
      }
    };

    canva.generatePlayerMovement = function() {
      if (!canva.gameplay.ended){
        if (canva.right){
          canva.player.playerPosX += (canva.player.playerPosX + canva.player.playerSpeed < canva.width - canva.player.playerPosSizeX) ? canva.player.playerSpeed : 0;
        }
        if (canva.left){
          canva.player.playerPosX -= (canva.player.playerPosX - canva.player.playerSpeed > 0) ? canva.player.playerSpeed : 0;
        }

        if (canva.shoot && canva.player.playerCooldown){
          canva.player.playerCooldown = false;
          canva.shoots.push(
            {
              shootPosX : canva.player.playerPosX + (canva.player.playerPosSizeX / 2),
              shootPosY : canva.player.playerPosY - 25,
              shootSizeX : 5,
              shootSizeY : 20,
              shootSizeColor : '#27ae60',
              shooter : 'player',
              shootTouch : false,
              shootDestroy : false,
            }
          );
        }
      }
    }


    /** Game function **/

    canva.run = function () {
      document.getElementById('spaceInvader').className = "onPlay";
      canva.showStat();
      canva.generateEnemies();
      canva.generatePlayer();
      canva.generateShoot();
      canva.generateEnemiesMovement();
      canva.generatePlayerMovement();
      canva.generateShootMovement();
    };

    canva.touchMeOrNot = function(shoot) {
      if (shoot.shooter === 'target'){
        if (canva.player.playerPosX < shoot.shootPosX
        && canva.player.playerPosX + canva.player.playerPosSizeX > shoot.shootPosX
        && canva.player.playerPosY < shoot.shootPosY
        && canva.player.playerPosY + canva.player.playerPosSizeY > shoot.shootPosY){
          shoot.shootDestroy = true;
          return true
        }
      }
      return false
    }

    canva.touchTargetOrNot = function(shoot, target) {
      if (shoot.shooter === 'player'){
        if (target.targetPosX < shoot.shootPosX
        && (target.targetPosX + target.targetSizeX) > shoot.shootPosX
        && (target.targetPosY < shoot.shootPosY)
        && (target.targetPosY + target.targetSizeY) > shoot.shootPosY){
          shoot.shootDestroy = true;
          target.targetDestroy = true;
          return true
        }
      }
      return false
    }

    canva.start = function () {
        canva.isStart = true;
        canva.gameplay.ended = false;
        canva.gameplay.begin = false
        canva.gameplay.start = true;
        canva.gameplay.state_wl = '';
    };

    canva.newStart = function () {
        canva.isStart = true;
        canva.gameplay.ended = false;
        canva.gameplay.begin = false
        canva.gameplay.start = true;
        if (canva.gameplay.state_wl == ''){
          canva.player.playerLife = 3;
        }
        canva.gameplay.state_wl = '';

    };

    canva.init = function () {
        canva.isStart = true;
        canva.initPlayer();
        canva.initEnemies();
        canva.generatePlayer();
        canva.generateEnemies();
    };

    canva.showStat = function() {
      canva.context.font = "30px Arial white";
      canva.context.fillStyle = "#f39c12";
      canva.context.fillText("Vie : " + (canva.player.playerLife) ,30, canva.height - 80);
      canva.context.fillText("Level : " + (canva.gameplay.currentLevel) ,30, canva.height - 40);
    }

    canva.animateContext = function () {
        canva.context.clearRect(0, 0, canva.width, canva.height);
        if (!canva.isStart){
            canva.init();
        }
        if (canva.gameplay.start){
          canva.run();
        }
        if (canva.gameplay.begin){
          canva.onStart();
        }
        if (canva.gameplay.ended){
          if (canva.gameplay.state_wl == 'win'){
            canva.youWin();
          }
          if (canva.gameplay.state_wl == 'loose'){
            canva.youLoose();
          }
        }

        requestAnimationFrame(canva.animateContext);
    };
    requestAnimationFrame(canva.animateContext);

    /** Game command **/

    document.body.addEventListener("keydown", function (e) {
      if (e.keyCode === 39 ){
          canva.right = true;
      }
      if (e.keyCode === 37 ){
          canva.left = true;
      }
      if (e.keyCode === 32 ){
        if (canva.gameplay.start){
          canva.shoot = true;
        }else if (canva.gameplay.ended){
          if (canva.gameplay.state_wl == 'win')
            canva.nextLevel();
          else
            canva.newStart();
          canva.start();
        }else{
          canva.start();
        }
      }
    });

    document.body.addEventListener("keyup", function (e) {
        if (e.keyCode === 39 ){
            canva.right = false;
        }
        if (e.keyCode === 37 ){
            canva.left = false;
        }
        if (e.keyCode === 32 ){
            canva.shoot = false
        }
    });

    canva.youWin = function(){
      canva.gameplay.ended = true;
      canva.gameplay.start = false;
      document.getElementById('spaceInvader').className = "win";
      canva.context.font = "30px Arial white";
      canva.context.fillStyle = "#f39c12";
      canva.context.fillText("Bravo. Desormais vous êtes un héros" ,30, canva.height / 2);
      canva.context.fillText("Appuyer sur espace pour passez au niveau suivant" ,30, canva.height / 2 + 40);
    }

    canva.nextLevel = function(){
      canva.gameplay.currentLevel += 1;
      canva.gameplay.targetNumber += (canva.gameplay.currentLevel * 5);
      //canva.gameplay.targetBigNumber += 1;
      //canva.gameplay.targetBossNumber += parseInt(canva.gameplay.currentLevel / 5, 10);
      canva.player.playerLife = 3;
      canva.enemies = [];
      canva.shoots = [];
      canva.init();
    }

    canva.newStart = function () {
      canva.player.playerLife = 3;
      canva.enemies = [];
      canva.shoots = [];
      canva.init();
    };

    canva.youLoose = function(){
      canva.gameplay.ended = true;
      canva.gameplay.start = false;
      document.getElementById('spaceInvader').className = "loose";
      canva.context.font = "30px Arial white";
      canva.context.fillStyle = "#f39c12";
      canva.context.fillText("Ooooh mon dieu mais qu'allons nous devenir pauvre de nous... S'il vous plait retenter votre chance." ,30, canva.height / 2);
      canva.context.fillText("Appuyer sur espace pour relancer le jeu" ,30, canva.height / 2 + 40);
    }

    canva.onStart = function(){
      document.getElementById('spaceInvader').className = "";
      canva.context.font = "30px Arial white";
      canva.context.fillStyle = "#f39c12";
      canva.context.fillText("Bienvenue dans space invader. Appuyer sur espace pour lancer le jeu" ,30, canva.height / 2);
    }

    /** Clean and other **/

    setInterval(function () {
      // Cooldown et autre chause a faire toute les 600ms
        canva.player.playerCooldown = true;
    }, 300);

    setInterval(function () {
      if (canva.player.playerLife == 0){
        canva.gameplay.ended = true;
        canva.gameplay.start = false;
        canva.gameplay.state_wl = 'loose';
      }
    }, 3000);

})(document.querySelector('canvas'));
