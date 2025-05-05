const isRoot = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
const pathPrefix = isRoot ? "folder/" : "";

const navbarHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-#17153B">
    <div class="container">
      <a class="navbar-brand logo " href="${pathPrefix}about.html">
        <i>Find your <span class="pro">Pro</span></i>
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="${isRoot ? 'index.html' : '../index.html'}">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="${pathPrefix}services.html">Services</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="${pathPrefix}contact.html">Support</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="${pathPrefix}about.html">About</a>
          </li>
          <li class="nav-item btn-primary">
            <a class="nav-link" id="authTrigger" href="#">SignIn/SignUp</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Popup Modal -->
  <div id="authModal" class="modal">
    <div class="modal-content">
      <h2>Continue as</h2>
      <button class="modal-btn" onclick="redirectToSelection('customer')">Customer</button>
      <button class="modal-btn" onclick="redirectToSelection('provider')">Service Provider</button>
      <span class="close" onclick="closeModal()">&times;</span>
    </div>
  </div>

  <style>
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
    }
    .modal-content {
      font-family:'Times New Roman', Times;
      background: white;
      padding: 30px;
      margin: 15% auto;
      text-align: center;
      width: 300px;
      border-radius: 10px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .modal-btn {
      margin: 10px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border: none;
      background: #007bff;
      color: white;
      border-radius: 5px;
    }
    .modal-btn:hover {
      background: #0056b3;
    }
    .close {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 20px;
      cursor: pointer;
    }
  </style>
`;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("navbar").innerHTML = navbarHTML;

  // Highlight active page
  let currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    let linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

  // Modal functionality
  const modal = document.getElementById("authModal");
  const authTrigger = document.getElementById("authTrigger");

  if (authTrigger) {
    authTrigger.addEventListener("click", function (e) {
      e.preventDefault();
      modal.style.display = "block";
    });
  }

  window.closeModal = function () {
    modal.style.display = "none";
  };

  window.redirectToSelection = function (userType) {
    localStorage.setItem("userType", userType);
    if (userType === "customer") {
      window.location.href = pathPrefix + "customer-login.html";
    } else if (userType === "provider") {
      window.location.href = pathPrefix + "provider-login.html";
    }
  };
});
