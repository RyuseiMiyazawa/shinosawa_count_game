let total = 0;
let playerFirst = false;
let gameEnded = false;
let messageInProgress = false;

// BGMとSEの準備
let bgm = new Audio('sound/bgm.mp3');
bgm.loop = true;

let clickSound = new Audio('sound/クリック.mp3');
let decisionSound = new Audio('sound/決定ボタン.mp3');
let winSound = new Audio('sound/勝利.mp3');
let loseSound = new Audio('sound/敗北.mp3');

// 不要なリセットコードを削除
function resetGame() {
    location.reload();  // 画面をリロード
}

// じゃんけん処理
function janken(playerChoice) {
    if (gameEnded) return;

    disableJankenButtons();
    const choices = ['グー', 'チョキ', 'パー'];
    const aiChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';

    if (playerChoice === aiChoice) {
        result = jankenComments.draw;
        showText(result, 'shinosawa-message-janken', () => {
            enableJankenButtons(); // あいこの場合にボタンを再度有効にする
        });
        return;
    } else if (
        (playerChoice === 'グー' && aiChoice === 'チョキ') ||
        (playerChoice === 'チョキ' && aiChoice === 'パー') ||
        (playerChoice === 'パー' && aiChoice === 'グー')
    ) {
        result = jankenComments.jankenwin;
        playerFirst = true;
    } else {
        result = jankenComments.jankenlose;
        playerFirst = false;
    }

    showText(result, 'shinosawa-message-janken', () => {
        disableJankenButtons();
        setTimeout(startGame, 1500);
    });
}

// ゲーム開始
function startGame() {
    document.getElementById('janken-game').style.display = 'none';
    document.getElementById('counting-game').style.display = 'block';
    gameEnded = false;
    updateTurnMessage(playerFirst);
    document.getElementById('character-image').src = characterImages.normal;
    disableButtons(!playerFirst);
    bgm.play(); // BGMを再生

    if (!playerFirst) {
        setTimeout(aiTurn, 1500);
    }
}

// プレイヤーのターン
function playerTurn(number) {
    if (gameEnded || messageInProgress) return;

    disableButtons(true);
    document.getElementById("total").classList.add('green');
    for (let i = 1; i <= number; i++) {
        setTimeout(() => {
            total++;
            updateTotal();
            clickSound.play(); // クリック効果音を再生
            if (total >= 20) {
                gameEnded = true;
                showLargeText("Lose", 'message');
                showText(gameComments.lose, 'shinosawa-message');
                document.getElementById('retry').style.display = 'block';
                document.getElementById('tweet').style.display = 'block';
                bgm.pause(); // BGMを停止
                loseSound.play(); // 敗北効果音
                return;
            }
        }, i * 750);
    }
    setTimeout(() => {
        document.getElementById("total").classList.remove('green');
        if (!gameEnded) {
            updateTurnMessage(false);
            setTimeout(() => {
                aiTurn();
            }, 1000);
        }
    }, (number + 1) * 750);
}

// AIのターン
function aiTurn() {
    if (gameEnded) return;

    disableButtons(true);
    document.getElementById("total").classList.add('red');
    let aiChoice = getOptimalMove(total);

    showText(`じゃあ私は+${aiChoice}。`, 'shinosawa-message', () => {
        for (let i = 1; i <= aiChoice; i++) {
            setTimeout(() => {
                total++;
                updateTotal();
                clickSound.play(); // クリック効果音を再生
                if (total >= 20) {
                    gameEnded = true;
                    showLargeText("Win", 'message');
                    showText(gameComments.win, 'shinosawa-message');
                    document.getElementById('retry').style.display = 'block';
                    document.getElementById('tweet').style.display = 'block';
                    bgm.pause(); // BGMを停止
                    winSound.play(); // 勝利効果音
                    return;
                }
            }, i * 750);
        }
        setTimeout(() => {
            document.getElementById("total").classList.remove('red');
            if (!gameEnded) {
                showText(getComment(total), 'shinosawa-message', () => {
                    updateTurnMessage(true);
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

// ターンメッセージの更新
function updateTurnMessage(isPlayerTurn) {
    document.getElementById('message').textContent = isPlayerTurn
        ? 'プロデューサーの番です。1から3の数字を選んでください。'
        : '広の番です。';
    disableButtons(!isPlayerTurn);
    disableInvalidButtons();
}

// AIの最適な手の取得
function getOptimalMove(currentTotal) {
    if (currentTotal === 19) return 1; // 19のときは常に1を選ぶ
    let remainder = (currentTotal + 1) % 4;
    if (remainder === 0) {
        return Math.floor(Math.random() * 3) + 1; // ランダムに1から3を選ぶ
    } else if (remainder === 1) {
        return 3;
    } else if (remainder === 2) {
        return 2;
    } else if (remainder === 3) {
        return 1;
    }
}

// コメントの取得
function getComment(currentTotal) {
    return gameComments.normal[Math.floor(Math.random() * gameComments.normal.length)];
}

// 合計の更新
function updateTotal() {
    if (total > 20) total = 20;  // 合計が20を超えないようにする
    document.getElementById("total").textContent = `現在の合計: ${total}`;
}

// キャラクター画像の更新
function updateCharacterImage(total) {
    let imgSrc = characterImages.normal;
    if (total > 15) {
        imgSrc = characterImages.smug;
    } else if (total > 10) {
        imgSrc = characterImages.troubled;
    } else if (total > 5) {
        imgSrc = characterImages.shy;
    }
    document.getElementById('character-image').src = imgSrc;
}

// 無効なボタンの無効化
function disableInvalidButtons() {
    const btn1 = document.getElementById('btn1');
    const btn2 = document.getElementById('btn2');
    const btn3 = document.getElementById('btn3');

    btn1.classList.remove('disabled');
    btn2.classList.remove('disabled');
    btn3.classList.remove('disabled');

    if (total >= 18) {
        btn3.classList.add('disabled');
        if (total === 19) {
            btn2.classList.add('disabled');
        }
    }
}

// ボタンの有効/無効の切り替え
function disableButtons(disable) {
    const buttons = document.querySelectorAll('.btn:not(#retry):not(#tweet)');
    buttons.forEach(button => {
        if (disable) {
            button.disabled = true;
            button.classList.add('disabled');
        } else {
            setTimeout(() => {
                button.disabled = false;
                button.classList.remove('disabled');
                disableInvalidButtons();
            }, 500); // 0.5秒後にボタンを再度有効にする
        }
    });
}

// じゃんけんボタンの無効化
function disableJankenButtons() {
    document.getElementById('rock').disabled = true;
    document.getElementById('scissors').disabled = true;
    document.getElementById('paper').disabled = true;
}

// じゃんけんボタンの有効化
function enableJankenButtons() {
    document.getElementById('rock').disabled = false;
    document.getElementById('scissors').disabled = false;
    document.getElementById('paper').disabled = false;
}

// テキストの表示
function showText(text, elementId, callback) {
    const element = document.getElementById(elementId);
    let index = 0;
    element.textContent = ''; // 以前のテキストをクリア
    const interval = setInterval(() => {
        element.textContent += text[index];
        index++;
        if (index === text.length) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 50); // 1文字ずつ表示する間隔を調整
}

// 大きなテキストの表示
function showLargeText(text, elementId) {
    const element = document.getElementById(elementId);
    element.textContent = text;
    element.classList.add('large-text');
}

// 結果をツイート
function tweetResult() {
    const tweetText = `学マスの篠澤と算数バトル https://ryuseimiyazawa.github.io/shinosawa_count_game/`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
}
