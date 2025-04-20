import Phaser from 'phaser';

export class HeadballScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private ai!: Phaser.Physics.Arcade.Sprite;
  private ball!: Phaser.Physics.Arcade.Sprite;
  private posts: Phaser.GameObjects.Rectangle[] = [];
  private ground!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private playerScore = 0;
  private aiScore = 0;
  private canJump = true;
  private goalCooldown = false;

  constructor() {
    super('HeadballScene');
  }

  preload() {
    this.load.image('stadium', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80');
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/mushroom2.png');
    this.load.image('ball', 'https://labs.phaser.io/assets/sprites/orb-blue.png');
  }

  create() {
    this.add.image(400, 300, 'stadium').setDisplaySize(800, 600);
    this.physics.world.setBounds(0, 0, 800, 600);

    this.createGround();
    this.createPlayers();
    this.createBall();
    this.setupControls();
    this.createGoals();
    this.createGoalZones();
    this.setupCollisions();
    this.createScoreText();
    this.debugZones(); // Now uncommented to visualize goal areas
  }

  update() {
    this.handlePlayerMovement();
    this.handleAI();
    
    // Simple goal detection based on position
    if (!this.goalCooldown) {
      if (this.ball.x < 90 && this.ball.y > 380 && this.ball.y < 590) {
        console.log("Left goal!");
        this.handleGoal('ai');
      }
      
      if (this.ball.x > 710 && this.ball.y > 380 && this.ball.y < 590) {
        console.log("Right goal!");
        this.handleGoal('player');
      }
    }
  }

  private createGround() {
    this.ground = this.add.rectangle(400, 590, 800, 20, 0x888888);
    this.physics.add.existing(this.ground, true);
  }

  private createPlayers() {
    this.player = this.physics.add.sprite(150, 300, 'player')
      .setBounce(0.2)
      .setCollideWorldBounds(true)
      .setGravityY(600);

    this.ai = this.physics.add.sprite(650, 300, 'player')
      .setTint(0xff0000)
      .setBounce(0.2)
      .setCollideWorldBounds(true)
      .setGravityY(600);
  }

  private createBall() {
    this.ball = this.physics.add.sprite(400, 200, 'ball')
      .setBounce(0.8)
      .setCollideWorldBounds(true)
      .setDrag(20, 0)
      .setCircle(16);
  }

  private setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  private createGoals() {
    // Left goal (AI scores)
    const leftPost = this.add.rectangle(30, 480, 10, 200, 0xffffff);
    const leftCrossbar = this.add.rectangle(60, 380, 70, 10, 0xffffff);
    
    // Right goal (Player scores)
    const rightPost = this.add.rectangle(770, 480, 10, 200, 0xffffff);
    const rightCrossbar = this.add.rectangle(740, 380, 70, 10, 0xffffff);

    [leftPost, leftCrossbar, rightPost, rightCrossbar].forEach(post => {
      this.physics.add.existing(post, true);
      this.posts.push(post);
    });
  }

  private createGoalZones() {
    // Left goal zone (AI scores)
    const leftZone = this.add.rectangle(60, 485, 60, 210, 0x00ff00, 0)
      .setOrigin(0.5)
      .setDepth(-1);

    // Right goal zone (Player scores)
    const rightZone = this.add.rectangle(740, 485, 60, 210, 0xff0000, 0)
      .setOrigin(0.5)
      .setDepth(-1);

    // Physics setup - use rectangles with physics bodies instead of zones
    this.physics.add.existing(leftZone, false);
    this.physics.add.existing(rightZone, false);
    
    // Important: Make sure these are non-static physics bodies
    (leftZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (leftZone.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    
    (rightZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (rightZone.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    
    // Goal detection - use overlap for collision detection
    this.physics.add.overlap(
      this.ball, 
      leftZone, 
      () => {
        console.log("Left goal detected via overlap!");
        this.handleGoal('ai');
      }, 
      undefined, 
      this
    );
    
    this.physics.add.overlap(
      this.ball, 
      rightZone, 
      () => {
        console.log("Right goal detected via overlap!");
        this.handleGoal('player');
      }, 
      undefined, 
      this
    );
  }

  private setupCollisions() {
    this.physics.add.collider(this.player, this.ground, () => {
      this.canJump = true;
    });
    
    this.physics.add.collider(this.ai, this.ground);
    this.physics.add.collider(this.ball, this.ground);
    this.physics.add.collider(this.player, this.ball, this.kickBall, undefined, this);
    this.physics.add.collider(this.ai, this.ball, this.kickBall, undefined, this);
    
    // Make posts solid
    this.posts.forEach(post => {
      this.physics.add.collider(this.ball, post);
    });
  }

  private handlePlayerMovement() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.canJump) {
      this.player.setVelocityY(-450);
      this.canJump = false;
    }
  }

  private handleAI() {
    const distance = this.ball.x - this.ai.x;
    this.ai.setVelocityX(Phaser.Math.Clamp(distance * 2, -160, 160));

    if (this.ball.y < this.ai.y - 100 && this.ai.body.touching.down) {
      this.ai.setVelocityY(-450);
    }
  }

  private kickBall(player: Phaser.Physics.Arcade.Sprite, ball: Phaser.Physics.Arcade.Sprite) {
    const angle = Phaser.Math.Angle.Between(player.x, player.y, ball.x, ball.y);
    const power = 400;
    ball.setVelocity(Math.cos(angle) * power, Math.sin(angle) * power);
  }

  private handleGoal(scorer: 'player' | 'ai') {
    if (this.goalCooldown) return;
    
    this.goalCooldown = true;
    this.time.delayedCall(1000, () => {
      this.goalCooldown = false;
    });

    // Direct scoring - no conditional needed
    if (scorer === 'player') {
      this.playerScore++;
    } else {
      this.aiScore++;
    }
    
    this.updateScoreText();

    // Reset positions
    this.ball.setPosition(400, 300).setVelocity(0, 0);
    this.player.setPosition(150, 300);
    this.ai.setPosition(650, 300);
  }

  private createScoreText() {
    this.scoreText = this.add.text(400, 30, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5);
    
    this.updateScoreText();
  }

  private updateScoreText() {
    this.scoreText.setText(`Player: ${this.playerScore} - AI: ${this.aiScore}`);
  }

  // Debug visualization (now enabled)
  private debugZones() {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xff00ff, 1);
    
    // Left zone
    graphics.strokeRect(30, 380, 60, 210);
    
    // Right zone
    graphics.strokeRect(710, 380, 60, 210);
  }
}