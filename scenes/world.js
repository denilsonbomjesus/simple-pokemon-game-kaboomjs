function setWorld(worldState) {
    function makeTile(type) {
        return [
            sprite('tile'),
            {type}
        ]
    }

    // mapa- camada 1
    const map = [
        addLevel([
            '                 ',
            ' cdddddddddddde  ',
            ' 30000000000002  ',
            ' 30000000000002  ',
            ' 30000000000002  ',
            ' 30030000008889  ',
            ' 30030000024445  ',
            ' 300a8888897777  ',
            ' 30064444457777  ',
            ' 30000000000000  ',
            ' 30000000021111  ',
            ' 3000000002      ',
            ' 1111111111      ',
            '      b          ',
            '     b      b    ',
            ' b             b '
        ], {
            tileWidth: 16,
            tileHeight: 16,
            tiles: {
                '0': () => makeTile('grass-m'),
                '1': () => makeTile('grass-water'),
                '2': () => makeTile('grass-r'),
                '3': () => makeTile('grass-l'),
                '4': () => makeTile('ground-m'),
                '5': () => makeTile('ground-r'),
                '6': () => makeTile('ground-l'),
                '7': () => makeTile('sand-1'),
                '8': () => makeTile('grass-mb'),
                '9': () => makeTile('grass-br'),
                'a': () => makeTile('grass-bl'),
                'b': () => makeTile('rock-water'),
                'c': () => makeTile('grass-tl'),
                'd': () => makeTile('grass-tm'),
                'e': () => makeTile('grass-tr')
            }
        }),

        // elementos do mapa - camada 2
        addLevel([
            '      12       ',
            '      34       ',
            ' 000    00  12 ',
            ' 00   00    34 ',
            ' 0    0        ',
            '      0  0     ',
            '           5   ',
            '           6   ',
            '     5         ',
            '     6   0     ',
            '               ',
            '               ',
            '               '
        ], {
            tileWidth: 16,
            tileHeight: 16,
            tiles: {
                '0': () => makeTile(),
                '1': () => makeTile('bigtree-pt1'),
                '2': () => makeTile('bigtree-pt2'),
                '3': () => makeTile('bigtree-pt3'),
                '4': () => makeTile('bigtree-pt4'),
                '5': () => makeTile('tree-t'),
                '6': () => makeTile('tree-b'),
            }
        }),

        // colisões - camada 3
        // pressione F1 para ver as hitboxes
        addLevel([
            ' 00000000000000 ',
            '0     11       0',
            '0           11 0',
            '0           11 0',
            '0              0',
            '0   2          0',
            '0   2      3333 ',
            '0   2      0   0',
            '0   3333333    0',
            '0    0         0',
            '0          0000 ',
            '0          0    ',
            ' 0000000000     ',
            '                '
        ], {
            tileWidth: 16,
            tileHeight: 16,
            tiles: {
                '0': () => [
                    area({shape: new Rect(vec2(0), 16, 16)}),
                    body({isStatic: true})
                ],
                '1': () => [
                    area({
                        shape: new Rect(vec2(0), 8, 8),
                        offset: vec2(4, 4)
                    }),
                    body({isStatic: true})
                ],
                '2': () => [
                    area({shape: new Rect(vec2(0), 2, 16)}),
                    body({isStatic: true})
                ],
                '3': () => [
                    area({
                    shape: new Rect(vec2(0), 16, 20),
                    // deslocamento
                    offset: vec2(0, -4)
                    }),
                    body({isStatic: true})
                ]
            }
        })
    ]

    // loop que itera o mapa
    for (const layer of map) {
        //layer.use - dimensionar os blocos para serem 4 vezes maiores que o tamanho deles
        layer.use(scale(4))

        //para cada bloco na camada, vai verificar se existe aquele tipo de bloco
        for (const tile of layer.children) {
            if (tile.type) {
                tile.play(tile.type)
            }
        }
    }

    // construindo os monstros 
    add([sprite('mini-mons'), area(), body({isStatic: true}), pos(100,700), scale(4), 'cat'])

    const spiderMon = add([sprite('mini-mons'), area(), body({isStatic: true}), pos(400,300), scale(4), 'spider'])
    spiderMon.play('spider')
    spiderMon.flipX = true

    const centipedeMon = add([sprite('mini-mons'), area(), body({isStatic: true}), pos(100,100), scale(4), 'centipede'])
    centipedeMon.play('centipede')

    const grassMon = add([sprite('mini-mons'), area(), body({isStatic: true}), pos(900, 570), scale(4), 'grass'])
    grassMon.play('grass')

    // criando NPCs
    add([ sprite('npc'), scale(4), pos(600,700), area(), body({isStatic: true}), 'npc'])

    // criando o Player
    const player = add([
        sprite('player-down'),
        pos(500,700),
        scale(4),
        area(),
        body(),
        {
            currentSprite: 'player-down',
            speed: 300,
            isInDialogue: false
        },
    ])

    // camera que segue o player
    let tick = 0
    onUpdate(() => {
        camPos(player.pos)
        tick++
        // o player está pressionando a tecla para baixo ou para cima
        if ((isKeyDown('down') || isKeyDown('up')) 
        // garante que player possa se movimentar da maneira correta
        && tick % 20 === 0
        //  se o player não estiver em dialogo, pode se mover
        && !player.isInDialogue) {
            // pega o corte contrario para dar o efeito de movimento
            player.flipX = !player.flipX
        }
    })

    // movimento do player
    // funcao (fornecida pelo kaboom) que muda o sprite para onde queremos andar - se o sprite atual não for igual ao nome do sprite que queremos usar, a funcao altera o sprite
    function setSprite(player, spriteName) {
        if (player.currentSprite !== spriteName) {
            player.use(sprite(spriteName))
            player.currentSprite = spriteName
        }
    }

    // para o moviemto - onKeyDown (captura a tecla que foi clicada)
    onKeyDown('down', () => {
        if (player.isInDialogue) return
        setSprite(player, 'player-down')
        player.move(0, player.speed)
    })

    onKeyDown('up', () => {
        if (player.isInDialogue) return
        setSprite(player, 'player-up')
        player.move(0, -player.speed)
    })

    onKeyDown('left', () => {
        if (player.isInDialogue) return
        player.flipX = false
        if (player.curAnim() !== 'walk') {
            setSprite(player, 'player-side')
            player.play('walk')
        }
        player.move(-player.speed, 0)

    })

    onKeyDown('right', () => {
        if (player.isInDialogue) return
        player.flipX = true
        if (player.curAnim() !== 'walk') {
            setSprite(player, 'player-side')
            player.play('walk')
        }
        player.move(player.speed, 0)
    })

    onKeyRelease('left', () => {
        player.stop()
    })

    onKeyRelease('right', () => {
        player.stop()
    })

    // se jogado pela primeira vez, o estado do mundo não é definido - então vamos cria-lo para atribuir a posição do player
    // especifica a posição do player, para quando ele for batalhar e voltar ao mapa, ele comece no mesmo lugar de onde saiu
    if (!worldState) {
        worldState = {
            playerPos : player.pos,
            faintedMons: []
        }
    }

    player.pos = vec2(worldState.playerPos)
    for (const faintedMon of worldState.faintedMons) {
        destroy(get(faintedMon)[0])
    }
}