document.addEventListener('DOMContentLoaded', () => {
    const orderItemsContainer = document.getElementById('order-items');
    const totalItemsSpan = document.getElementById('total-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const productButtons = document.querySelectorAll('.product-button');
    const cancelButton = document.getElementById('cancel-order');
    const goToCheckoutButton = document.getElementById('go-to-checkout');

    const checkoutOverlay = document.getElementById('checkout-overlay');
    const modalTotalAmountSpan = document.getElementById('modal-total-amount');
    const tenderedAmountInput = document.getElementById('tendered-amount');
    const keypad = document.getElementById('keypad');
    const changeAmountSpan = document.getElementById('change-amount');
    const cancelCheckoutButton = document.getElementById('cancel-checkout');
    const confirmCheckoutButton = document.getElementById('confirm-checkout');

    let currentOrder = []; // { id: 'lightRoast', name: '浅煎り', price: 200, quantity: 1 } の形式で保存
    const products = {
        // コーヒー
        lightRoast: { name: '浅煎り', price: 200 },
        darkRoast: { name: '深煎り', price: 220 },
        premium: { name: 'プレミアム', price: 300 },
        decaf: { name: 'デカフェ', price: 250 },
        ice: { name: 'アイス', price: 50 },
        iceLatte: { name: 'アイスオレ', price: 280 },
        // ソフトドリンク
        lemonade: { name: 'レモネード', price: 180 },
        appleJuice: { name: 'アップル', price: 150 },
        icedTea: { name: 'アイスティ', price: 170 },
        milk: { name: 'ミルク', price: 120 },
        // フード
        chocolate: { name: 'チョコレート', price: 100 },
        cookie: { name: 'クッキー', price: 80 },
        madeleine: { name: 'マドレーヌ', price: 130 },
        financier: { name: 'フィナンシェ', price: 150 },
        // その他
        dip: { name: 'ディップ', price: 30 },
        dipx5: { name: 'ディップ ×5', price: 120 },
        sticker: { name: 'ステッカー', price: 50 },
    };

    // 注文リストをレンダリングする関数
    function renderOrderList() {
        orderItemsContainer.innerHTML = ''; // 一度クリア
        let totalItems = 0;
        let totalAmount = 0;

        currentOrder.forEach(item => {
            const product = products[item.id];
            if (!product) return; // 商品が存在しない場合はスキップ

            const orderItemDiv = document.createElement('div');
            orderItemDiv.classList.add('order-item');
            orderItemDiv.innerHTML = `
                <span class="item-name">${product.name}</span>
                <div class="item-quantity-control">
                    <button class="quantity-button decrease" data-item-id="${item.id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-button increase" data-item-id="${item.id}">+</button>
                </div>
            `;
            orderItemsContainer.appendChild(orderItemDiv);

            totalItems += item.quantity;
            totalAmount += product.price * item.quantity;
        });

        totalItemsSpan.textContent = totalItems;
        totalAmountSpan.textContent = `￥${totalAmount}`;
        modalTotalAmountSpan.textContent = totalAmount; // 支払いモーダルにも反映
        calculateChange(); // お釣りの再計算
    }

    // 商品追加・数量変更のハンドラ
    productButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.dataset.itemId;
            const product = products[itemId];

            if (product) {
                const existingItemIndex = currentOrder.findIndex(item => item.id === itemId);
                if (existingItemIndex > -1) {
                    currentOrder[existingItemIndex].quantity++;
                } else {
                    currentOrder.push({ id: itemId, quantity: 1 });
                }
                renderOrderList();
            }
        });
    });

    // 注文リスト内の数量変更ボタンのハンドラ（イベント委譲）
    orderItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('quantity-button')) {
            const itemId = target.dataset.itemId;
            const existingItemIndex = currentOrder.findIndex(item => item.id === itemId);

            if (existingItemIndex > -1) {
                if (target.classList.contains('increase')) {
                    currentOrder[existingItemIndex].quantity++;
                } else if (target.classList.contains('decrease')) {
                    currentOrder[existingItemIndex].quantity--;
                    if (currentOrder[existingItemIndex].quantity <= 0) {
                        currentOrder.splice(existingItemIndex, 1); // 0以下になったら削除
                    }
                }
                renderOrderList();
            }
        }
    });

    // 「取り消し」ボタン
    cancelButton.addEventListener('click', () => {
        currentOrder = []; // 注文をクリア
        renderOrderList();
        alert('注文が取り消されました。');
    });

    // 「支払いへ」ボタン
    goToCheckoutButton.addEventListener('click', () => {
        if (currentOrder.length === 0) {
            alert('注文がありません。');
            return;
        }
        tenderedAmountInput.value = ''; // 預かり金額をクリア
        calculateChange(); // お釣りを初期化
        checkoutOverlay.classList.add('active'); // ポップアップ表示
    });

    // 支払いモーダル内のキーパッド
    keypad.addEventListener('click', (event) => {
        const key = event.target.dataset.key;
        let currentValue = tenderedAmountInput.value;

        if (key === 'clear') {
            tenderedAmountInput.value = '';
        } else if (key) {
            // 数字のみ追加
            if (currentValue.length < 9) { // 桁数制限
                tenderedAmountInput.value += key;
            }
        }
        calculateChange();
    });

    // お釣りの計算
    function calculateChange() {
        const total = parseFloat(modalTotalAmountSpan.textContent) || 0;
        const tendered = parseFloat(tenderedAmountInput.value) || 0;
        const change = tendered - total;
        changeAmountSpan.textContent = change >= 0 ? `￥${change}` : `￥0`; // お釣りがマイナスの場合は0を表示
        confirmCheckoutButton.disabled = (change < 0 || tendered === 0); // お釣りがマイナスまたは預かり金額が0の場合は会計ボタンを無効化
    }

    // 預かり金額入力欄の値変更を監視
    tenderedAmountInput.addEventListener('input', calculateChange);


    // 支払いモーダル「取り消し」ボタン
    cancelCheckoutButton.addEventListener('click', () => {
        checkoutOverlay.classList.remove('active'); // ポップアップを非表示
    });

    // 支払いモーダル「会計する」ボタン
    confirmCheckoutButton.addEventListener('click', () => {
        const total = parseFloat(modalTotalAmountSpan.textContent) || 0;
        const tendered = parseFloat(tenderedAmountInput.value) || 0;
        const change = tendered - total;

        if (change < 0) {
            alert('金額が不足しています。');
            return;
        }

        alert(`会計が完了しました！\n合計: ￥${total}\n預かり: ￥${tendered}\nお釣り: ￥${change}`);
        currentOrder = []; // 注文をクリア
        renderOrderList();
        checkoutOverlay.classList.remove('active'); // ポップアップを非表示
    });

    // 初期表示
    renderOrderList();
});