document.addEventListener('DOMContentLoaded', function() {
    // 商品データ (実際にはデータベースやAPIから取得することを想定)
    const menuItems = {
        'lightRoast': { name: '浅煎り', price: 400 },
        'darkRoast': { name: '深煎り', price: 400 },
        'premium': { name: 'プレミアム', price: 500 },
        'decaf': { name: 'デカフェ', price: 400 },
        'iceCoffee': { name: 'アイス', price: 400 },
        'iceLatte': { name: 'アイスオレ', price: 450 },
        'lemonade': { name: 'レモネード', price: 300 },
        'appleJuice': { name: 'アップル', price: 300 },
        'icedTea': { name: 'アイスティ', price: 300 },
        'milk': { name: 'ミルク', price: 350 },
        'chocolate': { name: 'チョコ', price: 150 },
        'cookie': { name: 'クッキー', price: 150 },
        'madeleine': { name: 'マドレーヌ', price: 150 },
        'financier': { name: 'フィナンシェ', price: 150 },
        'dip': { name: 'ディップ', price: 200 },
        'dipx5': { name: 'ディップ ×5', price: 1000 },
        'sticker': { name: 'ステッカー', price: 100 }
    };

    // 注文データを保持する配列
    let orderItems = [];
    let totalAmount = 0;
    let totalCount = 0;
    let receivedAmount = 0;

    // DOM要素の取得
    const orderList = document.getElementById('orderList');
    const orderSummary = document.getElementById('orderSummary');
    const paymentBtn = document.getElementById('paymentBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const productButtons = document.querySelectorAll('.product-button'); // Changed to .product-button
    const paymentScreen = document.getElementById('paymentScreen');
    const paymentTotal = document.getElementById('paymentTotal');
    const receivedAmountDisplay = document.getElementById('receivedAmount');
    // const changeAmountDisplay = document.getElementById('changeAmount'); // This element is commented out in index-v3.html
    const numKeys = document.querySelectorAll('.num-key');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
    const completeBtn = document.getElementById('completeBtn');

    // 会計画面が最初から表示されないようにする
    paymentScreen.classList.add('hidden');

    // カテゴリーボタンのロジックはindex-v3.htmlに直接組み込まれているため、JavaScript側での切り替えは不要
    // product-category-buttonのdata-category属性はCSSスタイリングのみに使用

    // メニューアイテムのクリックイベント
    productButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            if (itemId && menuItems[itemId]) { // Ensure itemId exists and is in menuItems
                const item = menuItems[itemId];
                const itemName = item.name;
                const itemPrice = item.price;

                // 既存のアイテムかどうかチェック
                const existingItemIndex = orderItems.findIndex(orderItem => orderItem.name === itemName);

                if (existingItemIndex !== -1) {
                    // 既存のアイテムの場合は数量を増加
                    orderItems[existingItemIndex].quantity++;
                } else {
                    // 新しいアイテムの場合は注文リストに追加
                    orderItems.push({
                        name: itemName,
                        price: itemPrice,
                        quantity: 1
                    });
                }

                // 注文リストを更新
                updateOrderList();
            }
        });
    });

    // 注文リストの更新関数
    function updateOrderList() {
        // 注文リストをクリア
        orderList.innerHTML = '';

        // 合計金額と合計点数を初期化
        totalAmount = 0;
        totalCount = 0;

        // 各注文アイテムについて処理
        orderItems.forEach((item, index) => {
            // 注文アイテムの要素を作成
            const orderItemElement = document.createElement('div');
            orderItemElement.className = 'order-item';

            // 注文アイテム名
            const nameElement = document.createElement('div');
            nameElement.className = 'item-name'; // Changed from order-item-name to item-name
            nameElement.textContent = `${item.name}`;

            // 数量コントロール
            const quantityControl = document.createElement('div');
            quantityControl.className = 'item-quantity-control'; // Changed from quantity-control to item-quantity-control

            // マイナスボタン
            const minusBtn = document.createElement('button');
            minusBtn.className = 'quantity-button'; // Changed from quantity-btn to quantity-button
            minusBtn.textContent = '-';
            minusBtn.addEventListener('click', function() {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    // 数量が1の場合は削除
                    orderItems.splice(index, 1);
                }
                updateOrderList();
            });

            // 数量表示
            const quantityDisplay = document.createElement('div');
            quantityDisplay.className = 'quantity-display'; // Changed from quantity-input to quantity-display
            quantityDisplay.textContent = item.quantity;


            // プラスボタン
            const plusBtn = document.createElement('button');
            plusBtn.className = 'quantity-button'; // Changed from quantity-btn to quantity-button
            plusBtn.textContent = '+';
            plusBtn.addEventListener('click', function() {
                item.quantity++;
                updateOrderList();
            });

            // 数量コントロールに子要素を追加
            quantityControl.appendChild(minusBtn);
            quantityControl.appendChild(quantityDisplay); // Changed to quantityDisplay
            quantityControl.appendChild(plusBtn);

            // 注文アイテムに子要素を追加
            orderItemElement.appendChild(nameElement);
            orderItemElement.appendChild(quantityControl);

            // 注文リストに追加
            orderList.appendChild(orderItemElement);

            // 合計金額と点数を更新
            totalAmount += item.price * item.quantity;
            totalCount += item.quantity;
        });

        // 合計表示を更新
        orderSummary.textContent = `${totalCount}点 合計 ¥${totalAmount}`;
    }

    // 注文取り消しボタンのクリックイベント
    cancelOrderBtn.addEventListener('click', function() {
        orderItems = [];
        updateOrderList();
    });

    // 支払いボタンのクリックイベント
    paymentBtn.addEventListener('click', function() {
        if (orderItems.length === 0) {
            alert('注文アイテムがありません');
            return;
        }

        // 支払い画面を表示
        paymentScreen.classList.remove('hidden');
        paymentTotal.textContent = `合計 ¥${totalAmount}`;
        receivedAmount = 0; // Reset received amount when entering payment screen
        updatePaymentDisplay();
    });

    // 数字キーパッドのクリックイベント
    numKeys.forEach(key => {
        key.addEventListener('click', function() {
            const keyValue = this.textContent;

            if (keyValue === 'C') {
                // クリアキー
                receivedAmount = 0; // Set to 0, not floor(0)
            } else if (keyValue === '00') {
                // 00キー
                receivedAmount = receivedAmount * 100;
            } else {
                // 数字キー
                receivedAmount = receivedAmount * 10 + parseInt(keyValue);
            }

            updatePaymentDisplay();
        });
    });

    // 支払い表示の更新関数
    function updatePaymentDisplay() {
        receivedAmountDisplay.textContent = `¥${receivedAmount}`;
        const change = receivedAmount - totalAmount;
        // The changeAmountDisplay element is commented out in index-v3.html
        // If it were present, you would update it like this:
        // changeAmountDisplay.textContent = `¥${Math.max(0, change)}`;

        // お釣りがマイナスの場合はボタンを無効化
        if (change < 0) {
            completeBtn.disabled = true;
            completeBtn.style.opacity = 0.5;
        } else {
            completeBtn.disabled = false;
            completeBtn.style.opacity = 1;
        }
    }

    // 支払いキャンセルボタンのクリックイベント
    cancelPaymentBtn.addEventListener('click', function() {
        paymentScreen.classList.add('hidden');
    });

    // 会計完了ボタンのクリックイベント
    completeBtn.addEventListener('click', function() {
        if (receivedAmount < totalAmount) {
            alert('預り金額が不足しています');
            return;
        }

        // おつりを計算
        const changeAmount = receivedAmount - totalAmount;

        // スプレッドシートに送信する処理
        try {
            saveToSpreadsheet();

            // 注文をリセット
            orderItems = [];
            updateOrderList();

            // 支払い画面を閉じる
            paymentScreen.classList.add('hidden');

            // 完了メッセージを表示
            alert('支払いが完了しました。\nおつり：¥' + changeAmount);
        } catch (error) {
            alert('エラーが発生しました: ' + error.message);
        }
    });

    // スプレッドシートに送信する関数
    function saveToSpreadsheet() {
        fetch('https://script.google.com/macros/s/AKfycby4Q9CaF1tSf3HsdS2aHIZOIfTZBKLutsSJwtq2WD8ZiVAL-aZR3WFpWbBYh8Xgym6d/exec', {
                method: 'POST',
                mode: 'no-cors', // 'no-cors' for Google Apps Script to prevent CORS issues
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    items: orderItems,
                    totalAmount: totalAmount,
                    totalCount: totalCount,
                    receivedAmount: receivedAmount,
                    changeAmount: receivedAmount - totalAmount
                })
            })
            .then(response => console.log('注文データを送信しました'))
            .catch(error => console.error('エラー:', error));
    }
});