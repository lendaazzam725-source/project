

const API_URL = "http://localhost:3000/api/expenses";

let expenses = [];
let editModal;

async function loadExpenses() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }
    expenses = await response.json();
    renderSummary();
    renderTable();
  } catch (err) {
    const alerts = document.getElementById("alerts");
    alerts.innerHTML =
      '<div class="alert alert-danger">Could not load expenses. ' + err.message + "</div>";
  } finally {
    document.getElementById("spinner").classList.add("d-none");
  }
}

function renderSummary() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;
  const highest = expenses.reduce(
    (max, e) => (e.amount > max ? e.amount : max),
    0
  );

  document.getElementById("sum-total").textContent = total.toFixed(2);
  document.getElementById("sum-count").textContent = count;
  document.getElementById("sum-top").textContent = highest.toFixed(2);
}

function getCategoryColor(category) {
  const colors = {
    Food: "bg-success",
    Transport: "bg-primary",
    Bills: "bg-danger",
    Entertainment: "bg-warning text-dark",
    Other: "bg-secondary",
  };
  return colors[category] || "bg-secondary";
}

function renderTable() {
  const tbody = document.getElementById("expenses-table");
  tbody.innerHTML = "";

  const selectedCategory = document.getElementById("filter-category").value;
  const filtered = selectedCategory
    ? expenses.filter((e) => e.category === selectedCategory)
    : expenses;

  for (const e of filtered) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" + e.title + "</td>" +
      "<td>" + e.amount.toFixed(2) + "</td>" +
      '<td><span class="badge ' + getCategoryColor(e.category) + '">' + e.category + "</span></td>" +
      "<td>" + e.date + "</td>" +
      '<td>' +
      '<button class="btn btn-sm btn-outline-secondary edit-btn" data-id="' + e.id + '">Edit</button> ' +
      '<button class="btn btn-sm btn-outline-danger delete-btn" data-id="' + e.id + '">Delete</button>' +
      '</td>';
    tbody.appendChild(row);
  }
}



function clearFieldError(fieldId) {
  document.getElementById(fieldId).classList.remove("is-invalid");
}

function showFieldError(fieldId) {
  document.getElementById(fieldId).classList.add("is-invalid");
}

function validateAddForm() {
  const title = document.getElementById("title").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  ["title", "amount", "category", "date"].forEach(clearFieldError);

  let isValid = true;

  if (!title) {
    showFieldError("title");
    isValid = false;
  }
  if (isNaN(amount) || amount <= 0) {
    showFieldError("amount");
    isValid = false;
  }
  if (!category) {
    showFieldError("category");
    isValid = false;
  }
  if (!date) {
    showFieldError("date");
    isValid = false;
  }

  return isValid;
}

async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;

  try {
    const response = await fetch(API_URL + "/" + id, { method: "DELETE" });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Could not delete expense.");
    }
    await loadExpenses();
  } catch (err) {
    const alerts = document.getElementById("alerts");
    alerts.innerHTML =
      '<div class="alert alert-danger">' + err.message + "</div>";
  }
}

function openEditModal(id) {
  const expense = expenses.find((e) => e.id == id);
  if (!expense) return;

  document.getElementById("edit-id").value = expense.id;
  document.getElementById("edit-title").value = expense.title;
  document.getElementById("edit-amount").value = expense.amount;
  document.getElementById("edit-category").value = expense.category;

  
  const parts = expense.date.split("-");
  document.getElementById("edit-date").value = parts[2] + "-" + parts[1] + "-" + parts[0];

  editModal.show();
}

async function updateExpense(id, data) {
  try {
    const response = await fetch(API_URL + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Could not update expense.");
    }

    editModal.hide();
    await loadExpenses();
  } catch (err) {
    const alerts = document.getElementById("alerts");
    alerts.innerHTML =
      '<div class="alert alert-danger">' + err.message + "</div>";
  }
}

document.getElementById("expenses-table").addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    deleteExpense(e.target.dataset.id);
  }
  if (e.target.classList.contains("edit-btn")) {
    openEditModal(e.target.dataset.id);
  }
});

document.getElementById("edit-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const updatedExpense = {
    title: document.getElementById("edit-title").value,
    amount: parseFloat(document.getElementById("edit-amount").value),
    category: document.getElementById("edit-category").value,
    date: document.getElementById("edit-date").value,
  };

  updateExpense(id, updatedExpense);
});

document.getElementById("add-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!validateAddForm()) {
    return;
  }

  const newExpense = {
    title: document.getElementById("title").value.trim(),
    amount: parseFloat(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpense),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Could not add expense.");
    }

    document.getElementById("add-form").reset();
    ["title", "amount", "category", "date"].forEach(clearFieldError);
    await loadExpenses();
  } catch (err) {
    const alerts = document.getElementById("alerts");
    alerts.innerHTML =
      '<div class="alert alert-danger">' + err.message + "</div>";
  }
});

document.getElementById("filter-category").addEventListener("change", renderTable);

document.addEventListener("DOMContentLoaded", function () {
  editModal = new bootstrap.Modal(document.getElementById("edit-modal"));
});

loadExpenses();