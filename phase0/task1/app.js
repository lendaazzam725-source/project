async function loadUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    const users = await response.json();
    const cards = document.getElementById("cards");

    for (const user of users) {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";

      const card = document.createElement("div");
      card.className = "card h-100";

      const body = document.createElement("div");
      body.className = "card-body";

      const name = document.createElement("h2");
      name.className = "h5 card-title";
      name.textContent = user.name;

      const email = document.createElement("p");
      email.className = "card-text mb-1";
      email.textContent = user.email;

      const city = document.createElement("p");
      city.className = "card-text mb-1";
      city.textContent = user.address.city;

      const company = document.createElement("p");
      company.className = "card-text text-muted mb-0";
      company.textContent = user.company.name;

      body.append(name, email, city, company);
      card.append(body);
      col.append(card);
      cards.append(col);
    }
  } catch (err) {
    const alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.textContent = "Could not load users. " + err.message;
    document.getElementById("alerts").append(alert);
  } finally {
    document.getElementById("spinner").classList.add("d-none");
  }
}


loadUsers();