document.addEventListener('DOMContentLoaded', function() {
    const transactionsList = document.getElementById('transactionsList');
    const filterCashier = document.getElementById('filterCashier');
    const filterDate = document.getElementById('filterDate');
    
    // Load and display transactions
    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem('meowtchaTransactions')) || [];
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = '<p class="empty-transactions">No transactions found</p>';
            return;
        }
        
        renderTransactions(transactions);
    }
    
    // Render transactions with filters
    function renderTransactions(transactions) {
        const cashierFilter = filterCashier.value;
        const dateFilter = filterDate.value;
        
        let filteredTransactions = [...transactions];
        let totalAmount = 0;
        let transactionCount = 0;
        
        // Apply filters
        if (cashierFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(
                t => t.cashier === cashierFilter
            );
        }
        
        if (dateFilter) {
            const filterDateObj = new Date(dateFilter);
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionDate = new Date(t.dateTime).toDateString();
                return transactionDate === filterDateObj.toDateString();
            });
        }
        
        // Clear and rebuild list
        transactionsList.innerHTML = '';
        
        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = '<p class="empty-transactions">No matching transactions found</p>';
            return;
        }
        
        filteredTransactions.forEach(transaction => {
            totalAmount += transaction.totalUSD;
            transactionCount++;
            
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            
            let itemsList = '';
            transaction.items.forEach(item => {
                itemsList += `${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})<br>`;
            });
            
            const transactionDate = new Date(transaction.dateTime);
            const formattedDate = transactionDate.toLocaleString();
            
            transactionElement.innerHTML = `
                <div class="transaction-header">
                    <span>${formattedDate}</span>
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
        
        // Add summary
        const summaryElement = document.createElement('div');
        summaryElement.className = 'transaction-summary';
        summaryElement.innerHTML = `
            Showing ${transactionCount} transactions | 
            Total: $${totalAmount.toFixed(2)} | 
            Average: $${(totalAmount/transactionCount).toFixed(2)} per transaction
        `;
        transactionsList.prepend(summaryElement);
    }
    
    // Event listeners for filters
    filterCashier.addEventListener('change', () => {
        const transactions = JSON.parse(localStorage.getItem('meowtchaTransactions')) || [];
        renderTransactions(transactions);
    });
    
    filterDate.addEventListener('change', () => {
        const transactions = JSON.parse(localStorage.getItem('meowtchaTransactions')) || [];
        renderTransactions(transactions);
    });
    
    // Initial load
    loadTransactions();
});