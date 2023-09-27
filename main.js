kaboom({
    width: 1280,
    height: 720,
    scale: 1.1
})

// plano de fundo
setBackground(Color.fromHex('#36A6E0'))

loadAssets()

scene('world', (worldState) => setWorld(worldState))
scene('battle', (worldState) => setBattle(worldState))

go('world')