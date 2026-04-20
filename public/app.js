const API_BASE = '/api';
let token = localStorage.getItem('token');
let budget = Number(localStorage.getItem('budget') || 0);
let editingExpenseId = null;
const expenseFormPanel = document.getElementById('transactionFormPanel');
const expenseTableBody = document.getElementById('expenseTableBody');
const budgetValue = document.getElementById('budgetValue');
const monthlyExpenses = document.getElementById('monthlyExpenses');
const remainingBalance = document.getElementById('remainingBalance');
const editBudgetButton = document.getElementById('editBudgetButton');
const newTransactionButton = document.getElementById('newTransactionButton');
const cancelTransaction = document.getElementById('cancelTransaction');
const expenseForm = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const notification = document.getElementById('notification');

const categoryStyles = {
  Food: 'food',
  Bills: 'bills',
  Transport: 'transport',
  Entertainment: 'entertainment'
};

function showMessage(message, type = 'success') {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 4000);
}

function hideMessage() {
  notification.classList.add('hidden');
}

budgetValue.textContent = `₱${budget.toFixed(2)}`;

if (token) {
  showApp();
} else {
  showAuth();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    token = data.token;
    localStorage.setItem('token', token);
    showApp();
  } else {
    alert(data.msg || 'Login failed');
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();
  if (res.ok) {
    token = data.token;
    localStorage.setItem('token', token);
    showApp();
  } else {
    alert(data.msg || 'Registration failed');
  }
});

document.getElementById('showRegister').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('register').classList.remove('hidden');
});

document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('register').classList.add('hidden');
  document.getElementById('auth').classList.remove('hidden');
});

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  token = null;
  showAuth();
});

editBudgetButton.addEventListener('click', () => {
  const value = prompt('Enter your starting budget in ₱', budget || '0');
  if (value !== null) {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (!Number.isNaN(parsed) && parsed >= 0) {
      budget = parsed;
      localStorage.setItem('budget', budget);
      budgetValue.textContent = `₱${budget.toFixed(2)}`;
      loadExpenses();
    } else {
      alert('Please enter a valid number');
    }
  }
});

newTransactionButton.addEventListener('click', () => {
  editingExpenseId = null;
  expenseForm.reset();
  expenseFormPanel.classList.remove('hidden');
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

cancelTransaction.addEventListener('click', () => {
  editingExpenseId = null;
  expenseFormPanel.classList.add('hidden');
  expenseForm.reset();
});

document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;

  if (!description || Number.isNaN(amount) || amount < 0) {
    alert('Please enter a valid description and amount');
    return;
  }

  const method = editingExpenseId ? 'PUT' : 'POST';
  const url = editingExpenseId ? `${API_BASE}/expenses/${editingExpenseId}` : `${API_BASE}/expenses`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ description, amount, category })
  });

  const data = await res.json();
  if (res.ok) {
    editingExpenseId = null;
    expenseForm.reset();
    expenseFormPanel.classList.add('hidden');
    loadExpenses();
  } else {
    alert(data.msg || 'Unable to save transaction');
  }
});

function showApp() {
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('register').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  loadExpenses();
}

function showAuth() {
  document.getElementById('auth').classList.remove('hidden');
  document.getElementById('register').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
}

async function loadExpenses() {
  if (!token) return;

  const res = await fetch(`${API_BASE}/expenses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const expenses = await res.json();
  expenseTableBody.innerHTML = '';

  let total = 0;
  let monthly = 0;

  expenses.forEach((expense) => {
    total += expense.amount;
    monthly += expense.amount;

    const row = document.createElement('tr');
    const dateCell = document.createElement('td');
    const descCell = document.createElement('td');
    const categoryCell = document.createElement('td');
    const amountCell = document.createElement('td');
    const actionsCell = document.createElement('td');

    dateCell.textContent = new Date(expense.createdAt).toLocaleDateString('en-PH');
    descCell.textContent = expense.description;
    amountCell.textContent = `₱${expense.amount.toFixed(2)}`;

    const select = document.createElement('select');
    select.className = 'category-select';
    ['Food', 'Bills', 'Transport', 'Entertainment'].forEach((option) => {
      const el = document.createElement('option');
      el.value = option;
      el.textContent = option;
      if (option === expense.category) el.selected = true;
      select.appendChild(el);
    });
    select.addEventListener('change', async () => await updateCategory(expense._id, select.value, expense.description, expense.amount));

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'action-button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      editingExpenseId = expense._id;
      expenseFormPanel.classList.remove('hidden');
      descriptionInput.value = expense.description;
      amountInput.value = expense.amount;
      categoryInput.value = expense.category;
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'action-button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
      if (confirm('Delete this transaction?')) {
        const id = expense._id || expense.id;
        await deleteExpense(id);
      }
    });

    categoryCell.appendChild(select);
    actionsCell.append(editButton, deleteButton);

    row.append(dateCell, descCell, categoryCell, amountCell, actionsCell);
    expenseTableBody.appendChild(row);
  });

  const remaining = budget - total;
  monthlyExpenses.textContent = `₱${monthly.toFixed(2)}`;
  remainingBalance.textContent = `₱${remaining.toFixed(2)}`;
}

async function updateCategory(id, category, description, amount) {
  if (!id) {
    showMessage('Invalid transaction id for category update', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        description,
        amount,
        category
      })
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { msg: text };
    }

    if (res.ok) {
      showMessage('Category updated successfully', 'success');
      loadExpenses();
    } else {
      showMessage(data.msg || `Unable to update category (${res.status})`, 'error');
    }
  } catch (error) {
    console.error('Update category failed:', error);
    showMessage(`Network error: ${error.message}`, 'error');
  }
}

async function deleteExpense(id) {
  if (!id) {
    showMessage('Unable to delete transaction: invalid id', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { msg: text };
    }

    if (res.ok) {
      showMessage('Transaction deleted successfully', 'success');
      loadExpenses();
    } else {
      showMessage(data.msg || `Unable to delete transaction (${res.status})`, 'error');
    }
  } catch (error) {
    console.error('Delete transaction failed:', error);
    showMessage(`Network error: ${error.message}`, 'error');
  }
}