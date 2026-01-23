let usersData = [];
let contentData = [];
let currentAdmin = null;

async function loadData() {
    try {
        //cargar usuarios
        const usersResponse = await fetch("./users.json");
        if (!usersResponse.ok) throw new Error("Error al cargar users.json");
        usersData = await usersResponse.json();

        // cargar algoritmos
        const contentResponse = await fetch("./algorithms.json");
        if (!contentResponse.ok) throw new Error("Error al cargar algorithms.json");
        contentData = await contentResponse.json();

        console.log("✅ Datos cargados exitosamente");
        console.log("Users:", usersData);
        console.log("Content:", contentData);
    } catch (error) {
        console.error("❌ Error cargando datos:", error);
    }
}
const loginForm = document.getElementById("loginForm");
const loginContainer = document.getElementById("loginContainer");
const adminPanel = document.getElementById("adminPanel");
const adminName = document.getElementById("adminName");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const user = usersData.find((u) => u.email === email && u.password === password);

    if (!user) {
        loginError.textContent = "❌ Email o contraseña incorrectos";
        loginError.style.display = "block";
        return;
    }

    if (!user.isAdmin) {
        loginError.textContent = "❌ Esta pantalla es de acceso exclusivo para administradores";
        loginError.style.display = "block";
        return;
    }

    currentAdmin = user;
    loginError.style.display = "none";
    loginContainer.style.display = "none";
    adminPanel.style.display = "block";
    adminName.textContent = `Welcome, ${user.name}`;
    logoutBtn.style.display = "block";

    renderUsers();
    renderContent();

    console.log("✅ Admin logged in:", currentAdmin);
});

logoutBtn.addEventListener("click", () => {
    currentAdmin = null;
    loginContainer.style.display = "flex";
    adminPanel.style.display = "none";
    logoutBtn.style.display = "none";
    loginForm.reset();
    loginError.style.display = "none";
    console.log("🚪 Admin logged out");
});

const adminNavBtns = document.querySelectorAll(".admin-nav-btn");
const adminSections = document.querySelectorAll(".admin-section");

adminNavBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const section = btn.dataset.section;

        adminNavBtns.forEach((b) => b.classList.remove("active"));
        adminSections.forEach((s) => s.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(section + "Section").classList.add("active");
    });
});

const usersList = document.getElementById("usersList");
const userModal = document.getElementById("userModal");
const userForm = document.getElementById("userForm");
const addUserBtn = document.getElementById("addUserBtn");
const closeUserModal = document.getElementById("closeUserModal");
const cancelUserBtn = document.getElementById("cancelUserBtn");
const userModalTitle = document.getElementById("userModalTitle");

let editingUserId = null;

function renderUsers() {
    usersList.innerHTML = "";

    usersData.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.isAdmin ? "admin" : "user"}">${user.isAdmin ? "Admin" : "User"}</span></td>
            <td>${user.isSubscribed ? "✅ Yes" : "❌ No"}</td>
            <td>${user.registerDate}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editUser('${user.id}')">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        `;
        usersList.appendChild(row);
    });
}

function editUser(userId) {
    const user = usersData.find((u) => u.id === userId);
    if (!user) return;

    editingUserId = userId;
    userModalTitle.textContent = "Edit User";

    document.getElementById("userName").value = user.name;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userPassword").value = "";
    document.getElementById("userIsAdmin").checked = user.isAdmin;
    document.getElementById("userIsSubscribed").checked = user.isSubscribed;

    userModal.style.display = "flex";
}

function deleteUser(userId) {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

    const request = {
        method: "DELETE",
        endpoint: "/api/users/" + userId,
        timestamp: new Date().toISOString(),
        admin: currentAdmin.email,
        userId: userId,
    };

    console.log("REQUEST LOG:", request);

    usersData = usersData.filter((u) => u.id !== userId);

    renderUsers();

    showSuccessMessage("Usuario eliminado exitosamente");
}

function showSuccessMessage(message) {
    const section = document.getElementById("usersSection");
    const messageDiv = document.createElement("div");
    messageDiv.className = "success-message";
    messageDiv.textContent = "✅ " + message;

    section.insertBefore(messageDiv, section.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function showContentSuccessMessage(message) {
    const section = document.getElementById("contentSection");
    const messageDiv = document.createElement("div");
    messageDiv.className = "success-message";
    messageDiv.textContent = "✅ " + message;

    section.insertBefore(messageDiv, section.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

addUserBtn.addEventListener("click", () => {
    editingUserId = null;
    userModalTitle.textContent = "Add New User";
    userForm.reset();
    document.getElementById("userIsSubscribed").checked = true;
    userModal.style.display = "flex";
});

closeUserModal.addEventListener("click", () => {
    userModal.style.display = "none";
});

cancelUserBtn.addEventListener("click", () => {
    userModal.style.display = "none";
});

userForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const password = document.getElementById("userPassword").value;
    const isAdmin = document.getElementById("userIsAdmin").checked;
    const isSubscribed = document.getElementById("userIsSubscribed").checked;

    if (editingUserId) {
        //editar user
        const user = usersData.find((u) => u.id === editingUserId);
        if (user) {
            //request
            const request = {
                method: "PUT",
                endpoint: "/api/users/" + editingUserId,
                timestamp: new Date().toISOString(),
                admin: currentAdmin.email,
                changes: {
                    name: name !== user.name ? { old: user.name, new: name } : undefined,
                    email: email !== user.email ? { old: user.email, new: email } : undefined,
                    isAdmin: isAdmin !== user.isAdmin ? { old: user.isAdmin, new: isAdmin } : undefined,
                    isSubscribed: isSubscribed !== user.isSubscribed ? { old: user.isSubscribed, new: isSubscribed } : undefined,
                },
            };

            console.log(" REQUEST LOG:", request);

            //actualiza usuario
            if (password) user.password = password;
            user.name = name;
            user.email = email;
            user.isAdmin = isAdmin;
            user.isSubscribed = isSubscribed;

            renderUsers();
            showSuccessMessage("Usuario actualizado exitosamente");
        }
    } else {
        //nuevo usuario
        const newUser = {
            id: "user-" + Date.now(),
            name: name,
            email: email,
            password: password,
            isAdmin: isAdmin,
            isSubscribed: isSubscribed,
            registerDate: new Date().toISOString().split("T")[0],
            likedPostIDs: [],
        };

        //request
        const request = {
            method: "POST",
            endpoint: "/api/users",
            timestamp: new Date().toISOString(),
            admin: currentAdmin.email,
            data: newUser,
        };

        console.log("REQUEST LOG:", request);

        usersData.push(newUser);
        renderUsers();
        showSuccessMessage("Usuario creado exitosamente");
    }

    userModal.style.display = "none";
    userForm.reset();
});

//para cerrar el modal
userModal.addEventListener("click", (e) => {
    if (e.target === userModal) {
        userModal.style.display = "none";
    }
});

const contentList = document.getElementById("contentList");
const contentModal = document.getElementById("contentModal");
const contentForm = document.getElementById("contentForm");
const addContentBtn = document.getElementById("addContentBtn");
const closeContentModal = document.getElementById("closeContentModal");
const cancelContentBtn = document.getElementById("cancelContentBtn");
const contentModalTitle = document.getElementById("contentModalTitle");

let editingContentId = null;

function renderContent() {
    contentList.innerHTML = "";

    contentData.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.difficulty}</td>
            <td><span class="status-badge status-${item.status}">${item.status}</span></td>
            <td>${item.visualizable ? "✅ Yes" : "❌ No"}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editContent('${item.id}')">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteContent('${item.id}')">Delete</button>
            </td>
        `;
        contentList.appendChild(row);
    });
}

function editContent(contentId) {
    const content = contentData.find((c) => c.id === contentId);
    if (!content) return;

    editingContentId = contentId;
    contentModalTitle.textContent = "Edit Algorithm";

    document.getElementById("contentName").value = content.name;
    document.getElementById("contentCategory").value = content.category;
    document.getElementById("contentDescription").value = content.description;
    document.getElementById("contentDifficulty").value = content.difficulty;
    document.getElementById("contentStatus").value = content.status;
    document.getElementById("contentVisualizable").checked = content.visualizable;

    contentModal.style.display = "flex";
}

function deleteContent(contentId) {
    if (!confirm("¿Estás seguro de que deseas eliminar este algoritmo?")) return;

    const request = {
        method: "DELETE",
        endpoint: "/api/content/" + contentId,
        timestamp: new Date().toISOString(),
        admin: currentAdmin.email,
        contentId: contentId,
    };

    console.log("📤 REQUEST LOG:", request);

    contentData = contentData.filter((c) => c.id !== contentId);

    renderContent();

    showContentSuccessMessage("Algoritmo eliminado exitosamente");
}

addContentBtn.addEventListener("click", () => {
    editingContentId = null;
    contentModalTitle.textContent = "Add New Algorithm";
    contentForm.reset();
    contentModal.style.display = "flex";
});

closeContentModal.addEventListener("click", () => {
    contentModal.style.display = "none";
});

cancelContentBtn.addEventListener("click", () => {
    contentModal.style.display = "none";
});

contentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contentName").value;
    const category = document.getElementById("contentCategory").value;
    const description = document.getElementById("contentDescription").value;
    const difficulty = document.getElementById("contentDifficulty").value;
    const status = document.getElementById("contentStatus").value;
    const visualizable = document.getElementById("contentVisualizable").checked;

    if (editingContentId) {
        //editar content
        const content = contentData.find((c) => c.id === editingContentId);
        if (content) {
            //request
            const request = {
                method: "PUT",
                endpoint: "/api/content/" + editingContentId,
                timestamp: new Date().toISOString(),
                admin: currentAdmin.email,
                changes: {
                    name: name !== content.name ? { old: content.name, new: name } : undefined,
                    category: category !== content.category ? { old: content.category, new: category } : undefined,
                    description: description !== content.description ? { old: content.description, new: description } : undefined,
                    difficulty: difficulty !== content.difficulty ? { old: content.difficulty, new: difficulty } : undefined,
                    status: status !== content.status ? { old: content.status, new: status } : undefined,
                    visualizable: visualizable !== content.visualizable ? { old: content.visualizable, new: visualizable } : undefined,
                },
            };

            console.log("REQUEST LOG:", request);

            //actualizar content
            content.name = name;
            content.category = category;
            content.description = description;
            content.difficulty = difficulty;
            content.status = status;
            content.visualizable = visualizable;

            renderContent();
            showContentSuccessMessage("Algoritmo actualizado exitosamente");
        }
    } else {
        const newContent = {
            id: "algo-" + Date.now(),
            name: name,
            category: category,
            description: description,
            difficulty: difficulty,
            paradigm: [],
            timeComplexity: {
                best: "O(n)",
                average: "O(n)",
                worst: "O(n)",
            },
            spaceComplexity: "O(1)",
            stable: false,
            inPlace: true,
            prerequisites: [],
            visualizable: visualizable,
            status: status,
        };

        //request
        const request = {
            method: "POST",
            endpoint: "/api/content",
            timestamp: new Date().toISOString(),
            admin: currentAdmin.email,
            data: newContent,
        };

        console.log("REQUEST LOG:", request);

        contentData.push(newContent);
        renderContent();
        showContentSuccessMessage("Algoritmo creado exitosamente");
    }

    contentModal.style.display = "none";
    contentForm.reset();
});

//cerrar modal
contentModal.addEventListener("click", (e) => {
    if (e.target === contentModal) {
        contentModal.style.display = "none";
    }
});

loadData();
