let total = 0;
let playerFirst = false;
let gameEnded = false;
let messageInProgress = false;

function janken(playerChoice) {
    const choices = ['グー', 'チョキ', 'パー'];
    const aiChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';

    if (playerChoice === aiChoice) {
        result = jankenComments.draw;
        showText(result, 'shinosawa-message-janken', () => {
            setTimeout(() => enableJankenButtons(), 500);
        });
        return;
    } else if (
        (playerChoice === 'グー' && aiChoice === 'チョキ') ||
        (playerChoice === 'チョキ' && aiChoice === 'パー') ||
        (playerChoice === 'パー' && aiChoice === 'グー')
    ) {
        result = jankenComments.win;
        playerFirst = true;
    } else {
        result = jankenComments.lose;
        playerFirst = false;
    }

    showText(result, 'shinosawa-message-janken', () => {
        showText(`私の手: ${aiChoice}`, 'shinosawa-message-janken');
        disableJankenButtons();
        setTimeout(startGame, 1500);
    });
}

function startGame() {
    document.getElementById('janken-game').style.display = 'none';
    document.getElementById('counting-game').style.display = 'block';
    gameEnded = false;
    document.getElementById('message').textContent = playerFirst
        ? 'プロデューサーの番です。1から3の数字を選んでください。'
        : '広の番です。';
    document.getElementById('character-image').src = characterImages.normal;
    disableButtons(!playerFirst);

    if (!playerFirst) {
        setTimeout(aiTurn, 1500);
    }
}

function playerTurn(number) {
    if (gameEnded || messageInProgress) return;
    disableButtons(true);
    document.getElementById("total").classList.add('green');
    for (let i = 1; i <= number; i++) {
        setTimeout(() => {
            total++;
            if (total >= 20) {
                gameEnded = true;
                if (playerFirst) {
                    showText("Win", 'message');
                    showText(gameComments.win, 'shinosawa-message');
                } else {
                    showText("Lose", 'message');
                    showText(gameComments.lose, 'shinosawa-message');
                }
                document.getElementById('retry').style.display = 'block';
                return;
            }
            updateTotal();
        }, i * 750);
    }
    setTimeout(() => {
        document.getElementById("total").classList.remove('green');
        if (!gameEnded) {
            setTimeout(() => {
                aiTurn();
            }, 1000);
        }
    }, (number + 1) * 750);
}

function aiTurn() {
    if (gameEnded) return;
    disableButtons(true);
    document.getElementById("total").classList.add('red');
    let aiChoice = getOptimalMove(total);

    showText(`じゃあ私は+${aiChoice}。`, 'shinosawa-message', () => {
        for (let i = 1; i <= aiChoice; i++) {
            setTimeout(() => {
                total++;
                if (total >= 20) {
                    gameEnded = true;
                    showText("Win", 'message');
                    showText(gameComments.lose, 'shinosawa-message');
                    document.getElementById('retry').style.display = 'block';
                    return;
                }
                updateTotal();
            }, i * 750);
        }
        setTimeout(() => {
            document.getElementById("total").classList.remove('red');
            if (!gameEnded) {
                showText(getComment(total), 'shinosawa-message', () => {
                    document.getElementById('message').textContent = "プロデューサーの番です。1から3の数字を選んでください。";
                    updateCharacterImage(total);
                    if (!gameEnded) {
                        disableButtons(false);
                    }
                    disableInvalidButtons();
                });
            }
        }, (aiChoice + 1) * 750);
    });
}

function getOptimalMove(currentTotal) {
    let remainder = currentTotal % 4;
    if (remainder === 0) {
        return 3;
    } else if (remainder === 1) {
        return 2;
    } else if (remainder === 2) {
        return 1;
    } else if (remainder === 3) {
        return 1;
    }
}

function getComment(currentTotal) {
    return gameComments.normal[Math.floor(Math.random() * gameComments.normal.length)];
}

function updateTotal() {
    document.getElementById("total").textContent = `現在の合計: ${total}`;
}

function updateCharacterImage(total) {
    let imgSrc = characterImages.normal;
    if (total > 15) {
        imgSrc = characterImages.smug;
    } else if (total > 10) {
        imgSrc = characterImages.troubled;
    }
    document.getElementById('character-image').src = imgSrc;
}

function disableInvalidButtons() {
    const btn1 = document.getElementById('btn1');
    const btn2 = document.getElementById('btn2');
    const btn3 = document.getElementById('btn3');

    btn1.classList.remove('disabled');
    btn2.classList.remove('disabled');
    btn3.classList.remove('disabled');

    if (total >= 17) {
        if (total === 18) {
            btn3.classList.add('disabled');
        } else if (total === 19) {
            btn2.classList.add('disabled');
            btn3.classList.add('disabled');
        }
    }
}

function resetGame() {
    total = 0;
    gameEnded = false;
    document.getElementById('janken-game').style.display = 'block';
    document.getElementById('counting-game').style.display = 'none';
    document.getElementById('janken-message').textContent = 'じゃんけんで勝った方が先攻ね。';
    document.querySelector('.buttons').innerHTML = `
        <button id="rock" class="btn" onclick="janken('グー')">👊</button>
        <button id="scissors" class="btn" onclick="janken('チョキ')">✌️</button>
        <button id="paper" class="btn" onclick="janken('パー')">✋</button>
    `;
    document.getElementById('shinosawa-message-janken').textContent = '';
    document.getElementById('total').textContent = '現在の合計: 0';
    document.getElementById('comment').textContent = '';
    document.getElementById('retry').style.display = 'none';
    document.getElementById('character-image').src = characterImages.normal;
    document.getElementById('character-image-janken').src = characterImages.normal;
    enableJankenButtons();
}

function showText(text, elementId, callback) {
    const element = document.getElementById(elementId);
    element.textContent = text;
    if (callback) callback();
}

function disableButtons(disable) {
    document.getElementById('btn1').disabled = disable;
    document.getElementById('btn2').disabled = disable;
    document.getElementById('btn3').disabled = disable;
}

function disableJankenButtons() {
    document.getElementById('rock').disabled = true;
    document.getElementById('scissors').disabled = true;
    document.getElementById('paper').disabled = true;
}

function enableJankenButtons() {
    document.getElementById('rock').disabled = false;
    document.getElementById('scissors').disabled = false;
    document.getElementById('paper').disabled = false;
}
