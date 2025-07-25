# ☕ ExpressOh

**ExpressOh** is a full-stack e-commerce platform for specialty coffee beans, developed as a capstone project to demonstrate end-to-end application design and development. The platform was build to offer customers a seamless experience for browsing and purchasing curated roasts through a clean, responsive interface. Also, the administrators can efficiently manage inventory, product details, images, and access key sales analytics through a streamlined dashboard.

---

## 📋 Table of Contents

1. [Overview](#-overview)  
2. [Key Features](#-key-features)  
3. [Project Flow](#-project-flow)  
4. [Tech Stack](#-tech-stack)  
5. [Database Design](#-database-design)  
6. [Accomplishments](#-accomplishments)  
7. [Snapshots](#-snapshots)  
8. [License](#-license)

---

## 🧩 Overview

ExpressOh provides:

- A seamless shopping experience for coffee lovers  
- A robust admin panel for managing products, orders, and flavors  
- Secure login for both users and admins  
- Analytics tools for business insights

---

## 🌟 Features

### 🛠 Admin Features

- **Admin Dashboard**  
  Full CRUD functionality for managing products, flavors, and images in one place.

- **Flavor Management**  
  Dynamic dropdowns let you add or remove flavors on the fly—no reload required.

- **Image Uploads**  
  Upload and associate product images using `multipart/form-data` with backend processing.

- **Sales Chart**  
  Interactive monthly orders line chart powered by `chart.js`.

### 🔐 Security

- JWT-based login/logout
- Role-based access control for admin and users

### 🛍 Customer Experience

- **Responsive UI**  
  Built with Bootstrap and React for smooth, cross-device performance

- **Cart Counter Badge**  
  Real-time cart updates for an intuitive shopping experience

- **Smooth Checkout Flow**  
  Add-to-cart, quantity updates, and secure order submission without page reloads

### ♿ Accessibility

- Tooltips for better guidance
- Focus states for keyboard navigation
- Semantic HTML markup for screen reader support


---

## 🔄 Project Flow

A step-by-step development journey from design to deployment:

1. 🎨 **Mock-up in Figma**  
   Designed UI/UX wireframes to plan out structure and flow.

2. 🧱 **Static Pages with HTML5, Bootstrap, CSS/JS**  
   Built initial layouts and transitions with responsive design.

3. 💻 **Front-End Repository**  
   Developed core pages like About, Shop, and Home in React.

4. 🧩 **Dynamic Card Layouts**  
   Populated product cards using `localStorage` for testing.

5. ⚙️ **Back-End with Spring Boot**  
   Created POJOs, `UserController`, `UserService`, and login/register logic.

6. 🔐 **Mock Authentication for User/Admin**  
   Built basic role-based login forms and view permissions.

7. 🗄️ **MySQL Integration**  
   Linked Spring Boot backend with MySQL database using JPA/Hibernate.

8. 🔗 **Full Stack Connection**  
   Connected front-end and backend using RESTful APIs and Axios.

---

## 🧰 Tech Stack

| Layer       | Technologies                                                                 |
|-------------|------------------------------------------------------------------------------|
| **Front End** | HTML5 · CSS3 · JavaScript · React · Bootstrap · Ionicons · SweetAlert2 · chart.js |
| **Back End**  | Java 17 · Spring Boot · Spring Security (JWT) · Hibernate (JPA)              |
| **Database**  | MySQL 8+                                                                    |
| **Dev Tools** | VS Code · IntelliJ IDEA · MySQL Workbench · Postman                         |

---

## 📊 Database Design

Below is the Entity-Relationship Diagram (ERD) that guided backend development and MySQL integration:

<img width="672" height="452" alt="ERD" src="https://github.com/user-attachments/assets/8be38df0-333d-4c43-b1b2-7d40a7ab23f9" />


> The ERD illustrates user-product relationships, order flows, and admin controls using normalized tables.

---

## 🏆 Accomplishments

- 🌐 **Built a full-stack solution end-to-end**  
- 📈 **Gained hands-on SDLC experience**  
- 🤝 **Used Git & project boards for collaboration**  
- ✅ **Learned importance of testing & validation**  
- 🧩 **Compared language roles:**
  - JavaScript for UI & mock APIs  
  - Java (Spring Boot) for backend logic
- 🗄️ **Improved SQL proficiency via MySQL queries**  
- 🔗 **Built and consumed REST APIs**  
- 🚀 **Used frameworks to accelerate development:**  
  - Spring Boot (dependency injection, MVC)  
  - React (modular components)  
  - Bootstrap (responsive UI)

---

## 🖼️ Snapshots
https://github.com/user-attachments/assets/4301566a-8a96-44ee-b937-9f076d71e602

**Mobile Ver:**

https://github.com/user-attachments/assets/0e99c244-15e8-4a16-9f2b-c060c289b1d5

---

## 📄 License

This project is licensed under the **MIT License**.  
 © FSD06 Team 1 - ExpressOh!

---

