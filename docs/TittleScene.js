// TitleScene.js
class TitleScene extends Phaser.Scene {
    // Construtor da cena
    constructor() {
        super({ key: "TitleScene" }); // Define a chave da cena como "TitleScene"
    }

    // Método para carregar assets (imagens, sons, etc.)
    preload() {
        this.load.image("background", "assets/background.png"); // Carrega a imagem de fundo
    }

    // Método para criar os elementos da cena
    create() {
        // Adiciona a imagem de fundo na posição (0, 0)
        this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(-1);

        // Cria o texto de título
        const titleText = this.add.text(
            this.sys.game.config.width / 2, // Posição X: centro da tela
            this.sys.game.config.height / 2 - 50, // Posição Y: centro da tela, 50 pixels acima
            "BEM-VINDO AO JOGO!", // Texto exibido
            {
                fontSize: "45px", // Tamanho da fonte
                fontFamily: "Arial Black", // Fonte do texto
                fill: "#ffffff", // Cor do texto (branco)
                stroke: "#000000", // Cor da borda do texto (preto)
                strokeThickness: 5 // Espessura da borda
            }
        );
        titleText.setOrigin(0.5, 0.5); // Centraliza o texto no ponto (X, Y)

        // Cria o texto de instrução
        const instructionText = this.add.text(
            this.sys.game.config.width / 2, // Posição X: centro da tela
            this.sys.game.config.height / 2 + 50, // Posição Y: centro da tela, 50 pixels abaixo
            "APERTE ESPAÇO PARA JOGAR", // Texto exibido
            {
                fontSize: "28px", // Tamanho da fonte
                fontFamily: "Arial Black", // Fonte do texto
                fill: "#ffffff", // Cor do texto (branco)
                stroke: "#000000", // Cor da borda do texto (preto)
                strokeThickness: 5 // Espessura da borda
            }
        );
        instructionText.setOrigin(0.5, 0.5); // Centraliza o texto no ponto (X, Y)

        // Configura o evento de teclado para iniciar o jogo ao pressionar a tecla ESPAÇO
        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("GameScene"); // Inicia a cena do jogo ("GameScene")
        });
    }
}