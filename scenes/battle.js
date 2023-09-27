function setBattle(worldState) {
    //adicionando o background de batalha
    add([
        sprite('battle-background'),
        scale(1.3),
        pos(0,0)
    ])

    // adicionando o monstro no cenario de batalha
    const enemyMon = add([
        sprite(worldState.enemyName + '-mon'),
        scale(5),
        pos(1300,100),
        opacity(1), 
        {
            fainted: false
        }
    ])
    enemyMon.flipX = true

    // interpolação
    tween(
        enemyMon.pos.x, 
        1000, 
        0.3, 
        (val) => enemyMon.pos.x = val,
        easings.easeInSine
    )

    // adicionando o monstro do Player ao cenario de batalha
    const playerMon = add([
        sprite('mushroom-mon'),
        scale(8),
        pos(-100, 300),
        opacity(1),
        {
            fainted: false
        }
    ])

    tween(
        playerMon.pos.x, 
        300, 
        0.3, 
        (val) => playerMon.pos.x = val, 
        easings.easeInSine
    )

    // 'caixa de saúde' do monstro do Player
    const playerMonHealthBox = add([
        rect(400, 100),
        outline(4),
        pos(1000, 400) 
    ])
 
    playerMonHealthBox.add([
         text('MUSHROOM', {size: 32}),
         color(10,10,10),
         pos(10, 10)
    ])
 
    playerMonHealthBox.add([
         rect(370, 10),
         color(200,200,200),
         pos(15, 50)
    ])
 
    const playerMonHealthBar = playerMonHealthBox.add([
         rect(370, 10),
         color(0,200,0),
         pos(15, 50)
    ])
 
    tween(playerMonHealthBox.pos.x, 850, 0.3, (val) => playerMonHealthBox.pos.x = val, easings.easeInSine)
 
    // 'caixa de saúde' do monstro inimigo
    const enemyMonHealthBox = add([
        rect(400, 100),
        outline(4),
        pos(-100, 50) 
    ])

    enemyMonHealthBox.add([
        text(worldState.enemyName.toUpperCase(), {size: 32}),
        color(10,10,10),
        pos(10, 10)
    ])

    enemyMonHealthBox.add([
        rect(370, 10),
        color(200,200,200),
        pos(15, 50)
    ])

    const enemyMonHealthBar = enemyMonHealthBox.add([
        rect(370, 10),
        color(0,200,0),
        pos(15, 50)
    ])

    tween(enemyMonHealthBox.pos.x, 100, 0.3, (val) => enemyMonHealthBox.pos.x = val, easings.easeInSine)

    // criando caixa de dialogo da batalha
    const box = add([
        rect(1300, 300),
        outline(4),
        pos(-2, 530)
    ])

    const content = box.add([
        text('MUSHROOM is ready to battle!', { size: 42}),
        color(10,10,10),
        pos(20,20)
    ])

    // funcao de reducao de saúde
    function reduceHealth(healthBar, damageDealt) {
        tween(
            healthBar.width,
            healthBar.width - damageDealt,
            0.5,
            (val) => healthBar.width = val,
            easings.easeInSine
        )
    }

    // funcao para fazer o monstro piscar a cada vez que ele é atacado
    function makeMonFlash(mon) {
        tween(
            mon.opacity,
            0,
            0.3,
            (val) => {
                mon.opacity = val
                if (mon.opacity === 0) {
                    mon.opacity = 1
                }
            },
            easings.easeInBounce
        )
    }

    // construindo o combate
    let phase = 'player-selection'
    onKeyPress('space', () => {
        if (playerMon.fainted || enemyMon.fainted) return

        // turno e ataque do Player
        if (phase === 'player-selection') {
            content.text = '> Tackle'
            phase = 'player-turn'
            return
        }

        // turno de ataque do inimigo
        if (phase === 'enemy-turn') {
            content.text = worldState.enemyName.toUpperCase() + ' attacks!'
            // decidindo o dano aleatoriamente
            const damageDealt = Math.random() * 230

            // detecção de saúde critica
            if (damageDealt > 150) {
                content.text = "It's a critical hit!"
            }

            reduceHealth(playerMonHealthBar, damageDealt)
            makeMonFlash(playerMon)

            phase = 'player-selection'
            return
        }

        // turno e ataque do Player
        if (phase === 'player-turn') {
            // decidindo o dano aleatoriamente
            const damageDealt = Math.random() * 230

            // detecção de saúde critica
            if (damageDealt > 150) {
                content.text = "It's a critical hit!"
            } else {
                content.text = 'MUSHROOM used tackle.'
            }

            reduceHealth(enemyMonHealthBar, damageDealt)
            makeMonFlash(enemyMon)

            phase = 'enemy-turn'
        }
    })

    // colorindo a barra de saúde de acordo com seu nível de preenchimento
    function colorizeHealthBar(healthBar) {
        // a largura da barra de saúde representa a saúde
        // quando no meio -> amarelo
        if (healthBar.width < 200) {
            healthBar.use(color(250, 150, 0))
        }
        // quando quase esgotada -> vermelho
        if (healthBar.width < 100) {
            healthBar.use(color(200, 0, 0))
        }

    }

    // transição da barra de saúde com interpolação
    function makeMonDrop(mon) {
        tween(
            mon.pos.y,
            800,
            0.5,
            (val) => mon.pos.y = val,
            easings.easeInSine
        )
    }

    onUpdate(() => {
        // usando a barra de saúde colorida
        colorizeHealthBar(playerMonHealthBar)
        colorizeHealthBar(enemyMonHealthBar)

        // se o tamanho da barra de saúde do inimigo for menor que 0 e o inimigo não estiver desmaiado -> atualiza o texto para indicar que o monstro desmaiou
        if (enemyMonHealthBar.width < 0 && !enemyMon.fainted) {
            makeMonDrop(enemyMon)
            content.text = worldState.enemyName.toUpperCase() + ' fainted!'
            enemyMon.fainted = true
            setTimeout(() => {
                content.text = 'MUSHROOM won the battle!'
            }, 1000)
            // após 2 segundos, retorna ao mundo -> dessa vez com um estado mundial definido 
            setTimeout(() => {
                worldState.faintedMons.push(worldState.enemyName)
                go('world', worldState)
            }, 2000)
        }

        // se o tamanho da barra de saúde do monstro do Player for menor que 0 e o Player não estiver desmaiado -> atualiza o texto para indicar que o Player desmaiou
        if (playerMonHealthBar.width < 0 && !playerMon.fainted) {
            makeMonDrop(playerMon)
            content.text = 'MUSHROOM fainted!'
            playerMon.fainted = true
            setTimeout(() => {
                content.text = 'You rush to get MUSHROOM healed!'
            }, 1000)
            // após 2 segundos, retorna ao mundo -> dessa vez com um estado mundial inicial
            setTimeout(() => {
                worldState.playerPos = vec2(500,700)
                go('world', worldState)
            }, 2000)
        }
    })
}