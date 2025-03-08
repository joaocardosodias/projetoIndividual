class GameScene extends Phaser.Scene {
    init() {
        // Inicializa variáveis da cena
        this.tileWidth = 64; // Largura de cada bloco do chão
        this.tileHeight = 64; // Altura de cada bloco do chão
        this.score = 0; // Pontuação inicial do jogador
        this.birdSpeed = -350; // Velocidade horizontal dos pássaros
        this.birdDelay = 6000; // Intervalo de tempo para gerar novos pássaros
        this.plantDelay = 3000; // Intervalo de tempo para gerar novos cactos
        this.groundSpeed = -180; // Velocidade horizontal do chão
    }

    // Carrega os assets (imagens, sprites, sons)
    preload() {
        this.load.image("plant", "assets/obstaculo.png"); // Carrega a imagem do cacto
        this.load.image("background", "assets/background.png"); // Carrega o fundo do jogo
        this.load.atlas("dino", "assets/atlas/sprite.png", "assets/atlas/sprite.json"); // Carrega o atlas do dinossauro
        this.load.spritesheet("bird", "assets/bird.png", { frameWidth: 150, frameHeight: 108 }); // Carrega o spritesheet do pássaro
        this.load.audioSprite("sfx", "assets/fx_mixdown.json", ["assets/fx_mixdown.mp3", "assets/fx_mixdown.ogg"]); // Carrega os efeitos sonoros
    }

    // Cria os elementos do jogo
    create() {
        // Adiciona o fundo do jogo
        this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(-1);

        // Cria o dinossauro
        this.dino = this.physics.add.sprite(200, 343, "dino").setOrigin(0, 0).setScale(0.17, 0.25);
        this.dino.setSize(this.dino.width * 0.6, this.dino.height * 0.8, false).setOffset(100, 50); // Ajusta o tamanho da colisão do dinossauro
        this.dino.setGravityY(850); // Define a gravidade para o dinossauro

        // Cria o grupo de blocos do chão
        this.ground = this.physics.add.group();

        // Inicializa as animações
        this.animation();

        // Cria o texto da pontuação
        this.scoreText = this.add.text(600, 25, "SCORE:0", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            stroke: "gray",
            strokeThickness: 5
        });

        // Recupera a pontuação máxima salva no localStorage
        this.topScore = localStorage.getItem("topScore") == null ? 0 : localStorage.getItem("topScore");
        this.topScoreText = this.add.text(30, 25, "MAX: " + this.topScore, {
            fontSize: "28px",
            fontFamily: "Arial Black",
            stroke: "gray",
            strokeThickness: 5
        });

        // Inicia o sistema de pontuação
        this.handleScore();

        // Cria o chão inicial
        this.addBase(0);

        // Inicia a geração de pássaros e cactos
        this.spawnBird();
        this.spawnPlant();

        // Inicia a animação de idle do dinossauro
        this.dino.anims.play("idle");

        // Configura colisões
        this.physics.add.collider(this.dino, this.ground); // Colisão entre dinossauro e chão
        this.physics.add.collider(this.dino, this.birds, this.gameOver, null, this); // Colisão entre dinossauro e pássaros
        this.physics.add.collider(this.dino, this.plants, this.gameOver, null, this); // Colisão entre dinossauro e cactos
        this.physics.add.collider(this.plants, this.ground); // Colisão entre cactos e chão

        // Configura o teclado
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Função chamada quando o jogo termina
    gameOver() {
        console.log("Game Over");
        this.scene.pause(); // Pausa a cena atual
        this.sound.playAudioSprite("sfx", "shot"); // Toca o som de game over
        localStorage.setItem("topScore", Math.max(localStorage.getItem("topScore"), this.score)); // Salva a pontuação máxima
        this.scene.start("restart"); // Inicia a cena de reinício
    }

    // Função para gerar pássaros
    spawnBird() {
        this.birds = this.physics.add.group(); // Cria um grupo de pássaros
        this.time.addEvent({
            delay: this.birdDelay, // Intervalo de tempo
            loop: true, // Repete indefinidamente
            callbackScope: this,
            callback: () => {
                let val = Math.random();
                if (val > 0.5) {
                    this.generateBird(280); // Gera um pássaro na posição Y = 280
                } else {
                    this.generateBird(360); // Gera um pássaro na posição Y = 360
                }
            }
        });
    }

    // Função para criar um pássaro
    generateBird(y) {
        let bird = this.birds.create(Math.max(Math.random() * 900, 780), y, "bird"); // Cria o pássaro
        bird.setScale(0.4).setOrigin(0, 0); // Ajusta a escala e a origem
        bird.setVelocityX(Math.max(--this.birdSpeed, -400)); // Define a velocidade horizontal
        bird.setSize(bird.width * 0.4, bird.height * 0.4); // Ajusta o tamanho da colisão
        bird.anims.play("fly"); // Inicia a animação de voo

        // Destrói o pássaro após 4 segundos
        this.time.addEvent({
            delay: 4000,
            repeat: 0,
            callbackScope: this,
            callback: () => {
                bird.destroy();
            }
        });
    }

    // Função para gerar cactos
    spawnPlant() {
        this.plants = this.physics.add.group(); // Cria um grupo de cactos
        this.time.addEvent({
            delay: this.plantDelay, // Intervalo de tempo
            loop: true, // Repete indefinidamente
            callbackScope: this,
            callback: () => {
                let scale = Math.random();
                if (scale <= 0.4) {
                    scale = 0.6; // Define a escala para 0.6
                    this.generatePlant(scale); // Gera um cacto pequeno
                } else if (scale > 0.9) {
                    scale = 0.9; // Define a escala para 0.9
                    this.generatePlant(scale); // Gera um cacto grande
                } else {
                    this.generatePlant(scale); // Gera um cacto com escala aleatória
                }
            }
        });
    }

    // Função para criar um cacto
    generatePlant(scale) {
        let sWidth = this.sys.game.config.width; // Largura da tela
        let sHeight = this.sys.game.config.height; // Altura da tela
        let plantY = sHeight - this.tileHeight - 110; // Posição Y do cacto

        // Cria o primeiro cacto
        let p1 = this.plants.create(sWidth, plantY, "plant").setOrigin(0, 0).setScale(scale);
        p1.setVelocityX(Math.max(this.groundSpeed, -230)); // Define a velocidade horizontal
        p1.setGravityY(750); // Define a gravidade
        p1.setSize(p1.width * 0.5, p1.height, true).setOffset(10, 0); // Ajusta o tamanho da colisão

        // Destrói o cacto após 3.5 segundos
        this.time.addEvent({
            delay: 3500,
            repeat: 0,
            callbackScope: this,
            callback: () => {
                p1.destroy();
            }
        });

        // Se a escala for 0.6, cria um segundo cacto
        if (scale == 0.6) {
            let p2 = this.plants.create(sWidth + 10, plantY, "plant").setOrigin(0, 0).setScale(scale);
            p2.setVelocityX(Math.max(this.groundSpeed, -230));
            p2.setGravityY(750);
            p2.setSize(p2.width * 0.5, p2.height, true).setOffset(10, 0);
            this.time.addEvent({
                delay: 3500,
                repeat: 0,
                callbackScope: this,
                callback: () => {
                    p2.destroy();
                }
            });
        }
    }

    // Função para atualizar a pontuação
    handleScore() {
        this.time.addEvent({
            delay: 250, // Intervalo de tempo
            loop: true, // Repete indefinidamente
            callback: () => {
                this.score++; // Incrementa a pontuação
                this.scoreText.setText("SCORE: " + this.score); // Atualiza o texto da pontuação
                if (this.score % 100 == 0) {
                    this.sound.playAudioSprite("sfx", "ping"); // Toca um som a cada 100 pontos
                }
            },
            callbackScope: this
        });
    }

    // Função para criar as animações
    animation() {
        // Animação do pássaro
        this.anims.create({
            key: "fly",
            frames: this.anims.generateFrameNames('bird', { start: 0, end: 1 }),
            frameRate: 20,
            repeat: -1
        });

        // Animação de idle do dinossauro
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNames("dino", {
                start: 1,
                end: 10,
                prefix: "Idle_",
                zeroPad: 2,
                suffix: ".png",
            }),
            frameRate: 15,
            repeat: -1
        });

        // Animação de corrida do dinossauro
        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNames('dino', {
                start: 1, end: 8, zeroPad: 2,
                prefix: "Run_", suffix: ".png"
            }),
            frameRate: 15,
            repeat: -1
        });

        // Animação de pulo do dinossauro
        this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNames('dino', {
                start: 1, end: 12, zeroPad: 2, prefix: "Jump_", suffix: ".png"
            }),
            frameRate: 10,
        });
    }

    // Função chamada a cada frame
    update() {
        this.handleInput(); // Verifica a entrada do jogador
        this.updateGround(); // Atualiza o chão
    }

    // Função para tratar a entrada do jogador
    handleInput() {
        if (this.cursors.space.isDown && this.dino.body.touching.down) {
            this.dino.setVelocityY(-500); // Faz o dinossauro pular
            this.dino.anims.play("jump"); // Inicia a animação de pulo
            this.sound.playAudioSprite("sfx", "numkey"); // Toca o som de pulo
        } else if (this.dino.body.touching.down) {
            this.dino.anims.play("run", true); // Inicia a animação de corrida
        }
    }

    // Função para atualizar o chão
    updateGround() {
        let lastBlock = this.ground.getLast(true); // Pega o último bloco do chão
        let lastBlockX = lastBlock.x; // Posição X do último bloco
        let lastPoint = lastBlockX + this.tileWidth; // Ponto final do último bloco

        // Se o último bloco estiver fora da tela, adiciona um novo bloco
        if (lastPoint < this.sys.game.config.width) {
            this.addBase(lastPoint);
            this.ground.children.each((child) => {
                if (child.x < -this.tileWidth * 2) {
                    child.destroy(); // Destrói blocos que saíram da tela
                }
            });
        }
    }

    // Função para adicionar blocos ao chão
    addBase(x) {
        let tileNeeded = Math.ceil((this.sys.game.config.width - x) / this.tileWidth); // Calcula quantos blocos são necessários
        let y = this.sys.game.config.height - this.tileHeight; // Posição Y do chão
        for (let i = 0; i < tileNeeded; i++) {
            this.addTile(x - 10 + (i * this.tileWidth), y); // Adiciona cada bloco
        }
        this.ground.children.iterate((child) => {
            child.setVelocityX(Math.max(--this.groundSpeed, -230)); // Define a velocidade do chão
            child.setImmovable(true); // Torna o chão imóvel
        });
    }

    // Função para adicionar um bloco ao chão
    addTile(x, y) {
        this.ground.create(x, y, "tile").setOrigin(0, 0); // Cria um bloco na posição (x, y)
    }
}

// Cena de título
class TitleScene extends Phaser.Scene {
    preload() {
        this.tileWidth = 64; // Largura de cada bloco do chão
        this.tileHeight = 64; // Altura de cada bloco do chão
        this.load.image("tile", "assets/tile.png"); // Carrega a imagem do bloco do chão
        this.load.image("background", "assets/background.png"); // Carrega o fundo do jogo
    }

    create() {
        // Adiciona o fundo do jogo
        this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(-1);

        // Texto de título
        const Title = this.add.text(400, 200, "INICIAR NOVO JOGO", {
            fontSize: "45px",
            fontFamily: "Arial Black",
            stroke: "gray",
            strokeThickness: 5
        });
        Title.setOrigin(0.5, 0.5); // Centraliza o texto

        // Texto de instrução
        const instructionText = this.add.text(400, 250, "PRESSIONE ''ESPACO'' PARA COMEÇAR", {
            fontSize: "22px",
            fontFamily: "Arial Black",
            stroke: "gray",
            strokeThickness: 5
        });
        instructionText.setOrigin(0.5, 0.5); // Centraliza o texto

        // Texto informando que apenas a tecla espaço é necessária
        const spaceInstruction = this.add.text(400, 300, "USE ''ESPAÇO'' PARA PULAR", {
            fontSize: "22px",
            fontFamily: "Arial Black",
            stroke: "gray",
            strokeThickness: 5
        });
        spaceInstruction.setOrigin(0.5, 0.5); // Centraliza o texto

        // Adiciona o chão
        this.ground = this.physics.add.group();
        this.addBase(0);

        // Inicia o jogo ao pressionar a tecla espaço
        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("game");
        });
    }

    // Função para adicionar blocos ao chão
    addBase(x) {
        let tileNeeded = Math.ceil((this.sys.game.config.width - x) / this.tileWidth); // Calcula quantos blocos são necessários
        let y = this.sys.game.config.height - this.tileHeight; // Posição Y do chão
        for (let i = 0; i < tileNeeded; i++) {
            this.addTile(x - 10 + (i * this.tileWidth), y); // Adiciona cada bloco
        }
    }

    // Função para adicionar um bloco ao chão
    addTile(x, y) {
        this.ground.create(x, y, "tile").setOrigin(0, 0); // Cria um bloco na posição (x, y)
    }
}

// Cena de reinício
class RestartScene extends Phaser.Scene {
    preload() {
        this.tileWidth = 64; // Largura de cada bloco do chão
        this.tileHeight = 64; // Altura de cada bloco do chão
    }

    create() {
        // Texto de título
        const Title = this.add.text(400, 200, "REINICIAR O JOGO", {
            fontSize: "45px",
            fontFamily: "Arial Black",
            stroke: "gray",
            strokeThickness: 5
        });
        Title.setOrigin(0.5, 0.5); // Centraliza o texto

        // Texto de instrução
        const spaceText = this.add.text(400, 250, "PRESSIONE ''ESPAÇO'' PARA RECOMEÇAR", {
            fontSize: "22px",
            fontFamily: "Arial Black",
            stroke: "gray",
            strokeThickness: 5
        });
        spaceText.setOrigin(0.5, 0.5); // Centraliza o texto

        // Adiciona o chão
        this.ground = this.physics.add.group();
        this.addBase(0);

        // Reinicia o jogo ao pressionar a tecla espaço
        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("game");
        });
    }

    // Função para adicionar blocos ao chão
    addBase(x) {
        let tileNeeded = Math.ceil((this.sys.game.config.width - x) / this.tileWidth); // Calcula quantos blocos são necessários
        let y = this.sys.game.config.height - this.tileHeight; // Posição Y do chão
        for (let i = 0; i < tileNeeded; i++) {
            this.addTile(x - 10 + (i * this.tileWidth), y); // Adiciona cada bloco
        }
    }

    // Função para adicionar um bloco ao chão
    addTile(x, y) {
        this.ground.create(x, y, "tile").setOrigin(0, 0); // Cria um bloco na posição (x, y)
    }
}

// Configuração do Phaser
let config = {
    width: 800, // Largura da tela
    height: 500, // Altura da tela
    type: Phaser.AUTO, // Tipo de renderização (WebGL ou Canvas)
    physics: {
        default: "arcade", // Usa o sistema de física Arcade
        arcade: {
            gravity: { y: 0 }, // Define a gravidade (0 no eixo Y)
            debug: false // Desativa o modo de debug
        }
    }
};

// Inicializa o jogo
const game = new Phaser.Game(config);

// Adiciona as cenas ao jogo
game.scene.add("game", GameScene); // Cena do jogo
game.scene.add("title", TitleScene); // Cena de título
game.scene.add("restart", RestartScene); // Cena de reinício

// Inicia a cena de título
game.scene.start("title");