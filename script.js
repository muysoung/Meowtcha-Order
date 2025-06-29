// Constants
const EXCHANGE_RATE = 4100; // 1 USD = 4100 KHR

// Menu data
const MENU_ITEMS = [
    { name: "Meowtcha latte", price: 2.75 },
    { name: "Strawberry meowtcha latte", price: 3.00 },
    { name: "Kyoto fog", price: 2.75 },
    { name: "Strawberry kyoto fog", price: 3.00 },
    { name: "Mini crepe", price: 1.25 },
    { name: "Crepe", price: 1.75 },
    { name: "Meowtcha Combo", price: 3.50 },
    { name: "Kyoto Combo", price: 3.50 },
    { name: "Free gift", price: 0.00 }
];

// DOM elements
const menuItemsContainer = document.getElementById('menuItems');
const orderItemsContainer = document.getElementById('orderItems');
const totalAmountElement = document.getElementById('totalAmount');
const totalAmountKHRElement = document.getElementById('totalAmountKHR');
const cashierSelect = document.getElementById('cashier');
const cashRadio = document.getElementById('cash');
const onlineRadio = document.getElementById('online');
const usdRadio = document.getElementById('usd');
const khrRadio = document.getElementById('khr');
const amountGivenSection = document.getElementById('amountGivenSection');
const amountGivenInput = document.getElementById('amountGiven');
const currencySymbol = document.getElementById('currencySymbol');
const changeDisplay = document.getElementById('changeDisplay');
const changeAmountElement = document.getElementById('changeAmount');
const changeAmountKHRElement = document.getElementById('changeAmountKHR');
const completeOrderBtn = document.getElementById('completeOrder');
const newOrderBtn = document.getElementById('newOrder');
const receiptModal = document.getElementById('receiptModal');
const receiptDateTime = document.getElementById('receiptDateTime');
const receiptCashier = document.getElementById('receiptCashier');
const receiptItemsContainer = document.getElementById('receiptItems');
const receiptTotal = document.getElementById('receiptTotal');
const receiptPayment = document.getElementById('receiptPayment');
const receiptChange = document.getElementById('receiptChange');
const printReceiptBtn = document.getElementById('printReceipt');
const closeReceiptBtn = document.getElementById('closeReceipt');

// State
let currentOrder = [];
let totalUSD = 0;

// Initialize the application
function init() {
    renderMenuItems();
    setupEventListeners();
}

// Render menu items
function renderMenuItems() {
    menuItemsContainer.innerHTML = '';
    
    MENU_ITEMS.forEach(item => {
        const menuItemElement = document.createElement('div');
        menuItemElement.className = 'menu-item';
        menuItemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)}</p>
        `;
        menuItemElement.addEventListener('click', () => addToOrder(item));
        menuItemsContainer.appendChild(menuItemElement);
    });
}

// Add item to order
function addToOrder(item) {
    const existingItem = currentOrder.find(orderItem => orderItem.name === item.name);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        currentOrder.push({
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    updateOrderDisplay();
}

// Update order display
function updateOrderDisplay() {
    if (currentOrder.length === 0) {
        orderItemsContainer.innerHTML = '<p class="empty-order">No items added yet</p>';
        totalUSD = 0;
    } else {
        orderItemsContainer.innerHTML = '';
        
        currentOrder.forEach(item => {
            const orderItemElement = document.createElement('div');
            orderItemElement.className = 'order-item';
            orderItemElement.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <div class="order-item-controls">
                    <button class="decrease">-</button>
                    <button class="increase">+</button>
                    <button class="remove">×</button>
                </div>
            `;
            
            // Add event listeners to buttons
            const decreaseBtn = orderItemElement.querySelector('.decrease');
            const increaseBtn = orderItemElement.querySelector('.increase');
            const removeBtn = orderItemElement.querySelector('.remove');
            
            decreaseBtn.addEventListener('click', () => adjustQuantity(item, -1));
            increaseBtn.addEventListener('click', () => adjustQuantity(item, 1));
            removeBtn.addEventListener('click', () => removeItem(item));
            
            orderItemsContainer.appendChild(orderItemElement);
        });
        
        // Calculate total
        totalUSD = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // Update total display
    totalAmountElement.textContent = `$${totalUSD.toFixed(2)}`;
    totalAmountKHRElement.textContent = `៛${Math.round(totalUSD * EXCHANGE_RATE)}`;
    
    // Update change calculation
    calculateChange();
}

// Adjust item quantity
function adjustQuantity(item, change) {
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeItem(item);
    } else {
        updateOrderDisplay();
    }
}

// Remove item from order
function removeItem(item) {
    currentOrder = currentOrder.filter(orderItem => orderItem.name !== item.name);
    updateOrderDisplay();
}

// Calculate change
function calculateChange() {
    if (!cashRadio.checked) {
        changeDisplay.style.display = 'none';
        return;
    }
    
    changeDisplay.style.display = 'block';
    
    const amountGiven = parseFloat(amountGivenInput.value) || 0;
    let changeUSD = 0;
    
    if (usdRadio.checked) {
        changeUSD = amountGiven - totalUSD;
    } else {
        changeUSD = (amountGiven / EXCHANGE_RATE) - totalUSD;
    }
    
    if (changeUSD < 0) {
        changeAmountElement.style.color = 'var(--error-color)';
        changeAmountKHRElement.style.color = 'var(--error-color)';
    } else {
        changeAmountElement.style.color = '';
        changeAmountKHRElement.style.color = '';
    }
    
    changeAmountElement.textContent = `$${Math.max(0, changeUSD).toFixed(2)}`;
    changeAmountKHRElement.textContent = `៛${Math.round(Math.max(0, changeUSD) * EXCHANGE_RATE)}`;
}

// Complete order
function completeOrder() {
    if (currentOrder.length === 0) {
        alert('Please add items to the order before completing.');
        return;
    }
    
    if (!cashierSelect.value) {
        alert('Please select a cashier before completing the order.');
        return;
    }
    
    if (cashRadio.checked) {
        const amountGiven = parseFloat(amountGivenInput.value) || 0;
        let enoughMoney = false;
        
        if (usdRadio.checked) {
            enoughMoney = amountGiven >= totalUSD;
        } else {
            enoughMoney = amountGiven >= totalUSD * EXCHANGE_RATE;
        }
        
        if (!enoughMoney) {
            alert('Amount given is less than the total. Please provide sufficient payment.');
            return;
        }
    }
    
    generateReceipt();
    receiptModal.style.display = 'flex';
}

// Generate receipt
function generateReceipt() {
    const now = new Date();
    receiptDateTime.textContent = now.toLocaleString();
    receiptCashier.textContent = cashierSelect.value;
    
    // Clear previous items
    receiptItemsContainer.innerHTML = '';
    
    // Add current items
    currentOrder.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'receipt-item';
        itemElement.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        receiptItemsContainer.appendChild(itemElement);
    });
    
    // Calculate payment details
    const paymentMethod = cashRadio.checked ? 'Cash' : 'Online';
    const billCurrency = usdRadio.checked ? 'USD' : 'KHR';
    
    let paymentAmount = '';
    if (cashRadio.checked) {
        const amountGiven = parseFloat(amountGivenInput.value) || 0;
        if (usdRadio.checked) {
            paymentAmount = `$${amountGiven.toFixed(2)} (Cash)`;
        } else {
            paymentAmount = `៛${amountGiven} (Cash)`;
        }
    } else {
        paymentAmount = 'Online Payment';
    }
    
    let changeText = '';
    if (cashRadio.checked) {
        const changeUSD = parseFloat(changeAmountElement.textContent.substring(1));
        const changeKHR = parseInt(changeAmountKHRElement.textContent.substring(1));
        changeText = `$${changeUSD.toFixed(2)} / ៛${changeKHR}`;
    } else {
        changeText = '$0.00 / ៛0';
    }
    
    // Set totals
    receiptTotal.textContent = `$${totalUSD.toFixed(2)} / ៛${Math.round(totalUSD * EXCHANGE_RATE)}`;
    receiptPayment.textContent = `${paymentMethod} (${billCurrency})`;
    receiptChange.textContent = changeText;
}

// Reset for new order
function newOrder() {
    currentOrder = [];
    totalUSD = 0;
    amountGivenInput.value = '';
    cashRadio.checked = true;
    usdRadio.checked = true;
    updateOrderDisplay();
    calculateChange();
}

// Setup event listeners
function setupEventListeners() {
    // Payment method change
    cashRadio.addEventListener('change', () => {
        amountGivenSection.style.display = 'flex';
        calculateChange();
    });
    
    onlineRadio.addEventListener('change', () => {
        amountGivenSection.style.display = 'none';
        calculateChange();
    });
    
    // Bill currency change
    usdRadio.addEventListener('change', () => {
        currencySymbol.textContent = '$';
        calculateChange();
    });
    
    khrRadio.addEventListener('change', () => {
        currencySymbol.textContent = '៛';
        calculateChange();
    });
    
    // Amount given input
    amountGivenInput.addEventListener('input', calculateChange);
    
    // Buttons
    completeOrderBtn.addEventListener('click', completeOrder);
    newOrderBtn.addEventListener('click', newOrder);
    printReceiptBtn.addEventListener('click', () => window.print());
    closeReceiptBtn.addEventListener('click', () => {
        receiptModal.style.display = 'none';
        newOrder();
    });
    // Add to the existing DOM elements
const showTransactionsBtn = document.getElementById('showTransactions');
const clearTransactionsBtn = document.getElementById('clearTransactions');
const transactionsList = document.getElementById('transactionsList');

// Add to setupEventListeners()
showTransactionsBtn.addEventListener('click', loadTransactions);
clearTransactionsBtn.addEventListener('click', clearTransactions);

// Add these new functions
function saveTransaction() {
    const transactions = JSON.parse(localStorage.getItem('meowtchaTransactions')) || [];
    const now = new Date();
    
    const transaction = {
        id: Date.now(),
        dateTime: now.toLocaleString(),
        cashier: cashierSelect.value,
        items: [...currentOrder],
        totalUSD: totalUSD,
        paymentMethod: cashRadio.checked ? 'Cash' : 'Online',
        billCurrency: usdRadio.checked ? 'USD' : 'KHR',
        amountGiven: amountGivenInput.value || '0',
        changeUSD: parseFloat(changeAmountElement.textContent.substring(1)) || 0
    };
    
    transactions.unshift(transaction); // Add newest transaction first
    localStorage.setItem('meowtchaTransactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('meowtchaTransactions')) || [];
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-transactions">No transactions yet</p>';
        return;
    }
    
    transactionsList.innerHTML = '';
    
    transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        let itemsList = '';
        transaction.items.forEach(item => {
            itemsList += `${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})<br>`;
        });
        
        transactionElement.innerHTML = `
            <div class="transaction-header">
                <span>${transaction.dateTime}</span>
                <span>Cashier: ${transaction.cashier}</span>
            </div>
            <div class="transaction-items">${itemsList}</div>
            <div class="transaction-total">
                Total: $${transaction.totalUSD.toFixed(2)} | 
                ${transaction.paymentMethod} (${transaction.billCurrency})
            </div>
        `;
        
        transactionsList.appendChild(transactionElement);
    });
}

function clearTransactions() {
    if (confirm('Are you sure you want to clear all transaction history?')) {
        localStorage.removeItem('meowtchaTransactions');
        loadTransactions();
    }
}

// Update the completeOrder function to save transactions
function completeOrder() {
    if (currentOrder.length === 0) {
        alert('Please add items to the order before completing.');
        return;
    }
    
    if (!cashierSelect.value) {
        alert('Please select a cashier before completing the order.');
        return;
    }
    
    if (cashRadio.checked) {
        const amountGiven = parseFloat(amountGivenInput.value) || 0;
        let enoughMoney = false;
        
        if (usdRadio.checked) {
            enoughMoney = amountGiven >= totalUSD;
        } else {
            enoughMoney = amountGiven >= totalUSD * EXCHANGE_RATE;
        }
        
        if (!enoughMoney) {
            alert('Amount given is less than the total. Please provide sufficient payment.');
            return;
        }
    }
    
    saveTransaction();
    generateReceipt();
    receiptModal.style.display = 'flex';
}
function saveTransaction() {
    const transactions = JSON.parse(localStorage.getItem('meowtchaTransactions')) || [];
    const now = new Date();
    
    const transaction = {
        id: Date.now(),
        dateTime: now.toISOString(), // Store in ISO format for consistent parsing
        cashier: cashierSelect.value,
        items: [...currentOrder],
        totalUSD: totalUSD,
        paymentMethod: cashRadio.checked ? 'Cash' : 'Online',
        billCurrency: usdRadio.checked ? 'USD' : 'KHR',
        amountGiven: amountGivenInput.value || '0',
        changeUSD: parseFloat(changeAmountElement.textContent.substring(1)) || 0
    };
    
    transactions.unshift(transaction);
    localStorage.setItem('meowtchaTransactions', JSON.stringify(transactions));
}
}

// Initialize the app
init();