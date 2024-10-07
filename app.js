// Check if transactions exist in local storage
const storedTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = storedTransactions || [];
let totalIncome = 0;
let totalExpense = 0;
let incomeVsExpenseChart;
let expenseCategoriesChart;

// Get DOM elements
const transactionsForm = document.getElementById('transaction');
const incomeAmount = document.getElementById('income');
const expenseAmount = document.getElementById('expenseAmount');
const transactionsList = document.getElementById('transactionList');
const transactionsTableBody = document.getElementById('transactionTableBody'); // Corrected to target the right element

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Function to update the budget overview
function updateBudgetOverview() {
    // Calculate total income and expenses
    totalIncome = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);

    totalExpense = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);

    // Update the DOM
    incomeAmount.textContent = `$${totalIncome.toFixed(2)}`;
    expenseAmount.textContent = `$${totalExpense.toFixed(2)}`;
}

// Function to add a transaction
function addTransaction(type, category, amount) {
    const transaction = {
        type,
        category,
        amount: parseFloat(amount),
        id: Date.now()
    };

    transactions.push(transaction);
    updateLocalStorage();
    updateBudgetOverview();
    displayTransactions();
    displayTransactionsInTable(); // Call to update the table
    renderIncomeVsExpenseChart(); // Call to update chart
    createExpenseCategoriesChart(); // Call to update expense categories chart
}

// Function to display the transactions in the history
function displayTransactions() {
    transactionsList.innerHTML = '';

    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${transaction.category} (${transaction.type})</span>
        <span>$${transaction.amount.toFixed(2)}</span>`;
        transactionsList.appendChild(li);
    });
}

// Function to create Income vs Expenses chart
function renderIncomeVsExpenseChart() {
    const ctx = document.getElementById('incomeVsExpenseChart').getContext('2d');

    // Destroy the chart if it already exists
    if (incomeVsExpenseChart) {
        incomeVsExpenseChart.destroy();
    }

    // Create a new chart
    incomeVsExpenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [totalIncome, totalExpense],
                backgroundColor: ['green', 'red'],
                hoverBackgroundColor: ['lightgreen', 'lightcoral']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `${tooltipItem.label}: $${tooltipItem.raw.toFixed(2)}`; // Use backticks
                        }
                    }
                }
            }
        }
    });
}

// Function to display the transactions in the table
function displayTransactionsInTable() {
    transactionsTableBody.innerHTML = ''; // Clear existing table rows

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.type}</td>
            <td>${transaction.category}</td>
            <td>$${transaction.amount.toFixed(2)}</td>
        `;
        transactionsTableBody.appendChild(row);
    });
}

// Function to create Expense Categories chart
function createExpenseCategoriesChart() {
    const ctx = document.getElementById('expenseCategoriesChart').getContext('2d');

    // Destroy the chart if it already exists
    if (expenseCategoriesChart) {
        expenseCategoriesChart.destroy();
    }

    // Group expenses by category
    const expenseCategories = {}; // Corrected typo
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (!expenseCategories[transaction.category]) {
                expenseCategories[transaction.category] = 0;
            }
            expenseCategories[transaction.category] += transaction.amount;
        }
    });

    const labels = Object.keys(expenseCategories);
    const data = Object.values(expenseCategories);

    // Create a new chart
    expenseCategoriesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
                hoverBackgroundColor: ['lightcoral', 'lightgoldenrodyellow', 'lightyellow', 'lightgreen', 'lightblue', 'lightpurple']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `${tooltipItem.label}: $${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Handle form submission
transactionsForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value.trim();
    const amount = document.getElementById('amount').value;

    // Input validation
    if (!category) {
        alert('Please enter a category.');
        return;
    }
    if (amount <= 0) {
        alert('Please enter a positive amount.');
        return;
    }

    addTransaction(type, category, amount);

    // Clear the Form
    transactionsForm.reset();
});

// Load transactions on page load
function loadTransactions() {
    displayTransactions();
    displayTransactionsInTable(); // Update table with loaded data
    updateBudgetOverview();
    renderIncomeVsExpenseChart(); // Update income vs expense chart
    createExpenseCategoriesChart(); // Update expense categories chart
}

// Execute loadTransactions when the window is loaded
window.onload = loadTransactions;

// Get the Clear All button
const clearAllButton = document.getElementById('clearAll');

// Function to clear all transactions
function clearAllTransactions() {
    transactions = [];
    updateLocalStorage();
    updateBudgetOverview();
    displayTransactions();
    displayTransactionsInTable(); // Reset table
    renderIncomeVsExpenseChart(); // Reset income vs expense chart
    createExpenseCategoriesChart(); // Reset expense categories chart
}

// Event listener for Clear All button
clearAllButton.addEventListener('click', function () {
    const confirmClear = confirm('Are you sure you want to clear all transactions?');
    if (confirmClear) {
        clearAllTransactions();
    }
});
