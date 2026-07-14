//creamos la estructura de datos user y algorithm
type User = {
    id: string
    name: string
    email: string
    password: string
    isAdmin: boolean
    isSubscribed: boolean
    registerDate: string
    likedPostIDs: string[]
}

type Algorithm = {
    id: string
    name: string
    category: string
    difficulty: string
}
//que sea array para poder agregar y eliminar
let users: User[] = []
let algorithms: Algorithm[] = []
let currentAdmin: User | null = null
let editingUser: User | null = null
let editingAlgorithm: Algorithm | null = null

const list = document.getElementById("list") as HTMLDivElement

//fetch de users y algoritmos
Promise.all([
    fetch("/users.json").then(res => res.json() as Promise<User[]>),
    fetch("/algorithms.json").then(res => res.json() as Promise<Algorithm[]>)
]).then(([u, a]) => {
    users = u
    algorithms = a
})

//boton de login
document.getElementById("loginBtn")!.addEventListener("click", () => {
    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value

    const user = users.find(
        u => u.email === email && u.password === password
    )

    if (!user || !user.isAdmin) {
        document.getElementById("restricted")!.style.display = "block"
        return
    }

    currentAdmin = user
    document.getElementById("login")!.style.display = "none"
    document.getElementById("adminPanel")!.style.display = "block"
})

//carga usuarios
function renderUsers() {
    list.innerHTML = "<h2>Usuarios</h2>"

    users.forEach(user => {
        const div = document.createElement("div")
        div.innerHTML = `
      <strong>${user.name}</strong> (${user.email})
      ${user.isAdmin ? "🛡️" : ""}
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Borrar</button>
    `

        const editBtn = div.querySelector(".edit-btn") as HTMLButtonElement
        const deleteBtn = div.querySelector(".delete-btn") as HTMLButtonElement

        if (editBtn) editBtn.onclick = () => editUser(user.id)
        if (deleteBtn) deleteBtn.onclick = () => deleteUser(user.id)
        list.appendChild(div)
    })
}

//borra usuarios
function deleteUser(id: string) {
    users = users.filter(u => u.id !== id)

    const request = {
        action: "DELETE_USER",
        adminId: currentAdmin!.id,
        targetUserId: id,
        date: new Date().toISOString()
    }

    console.log(request)
    renderUsers()
}

//carga algoritmos
function renderAlgorithms() {
    list.innerHTML = "<h2>Algoritmos</h2>"

    algorithms.forEach(algo => {
        const div = document.createElement("div")
        div.innerHTML = `
      <strong>${algo.name}</strong>
      (${algo.category} - ${algo.difficulty})
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Borrar</button>
    `

        const editBtn = div.querySelector(".edit-btn") as HTMLButtonElement
        const deleteBtn = div.querySelector(".delete-btn") as HTMLButtonElement

        if (editBtn) editBtn.onclick = () => editAlgorithm(algo.id)
        if (deleteBtn) deleteBtn.onclick = () => deleteAlgorithm(algo.id)
        list.appendChild(div)
    })
}

//borra algoritmos
function deleteAlgorithm(id: string) {
    algorithms = algorithms.filter(a => a.id !== id)

    const request = {
        action: "DELETE_ALGORITHM",
        adminId: currentAdmin!.id,
        targetAlgorithmId: id,
        date: new Date().toISOString()
    }

    console.log(request)
    renderAlgorithms()
}

document.getElementById("showUsers")!.onclick = renderUsers
document.getElementById("showContent")!.onclick = renderAlgorithms
document.getElementById("addUser")!.onclick = () => showUserForm()
document.getElementById("addAlgorithm")!.onclick = () => showAlgorithmForm()
document.getElementById("cancelUserForm")!.onclick = () => hideUserForm()
document.getElementById("cancelAlgorithmForm")!.onclick = () => hideAlgorithmForm()

//muestra usuarios del json
function showUserForm(user?: User) {
    const form = document.getElementById("userForm")!
    const title = document.getElementById("userFormTitle")!

    if (user) {
        editingUser = user
        title.textContent = "Edit User"
            ; (document.getElementById("userName") as HTMLInputElement).value = user.name
            ; (document.getElementById("userEmail") as HTMLInputElement).value = user.email
            ; (document.getElementById("userPassword") as HTMLInputElement).value = user.password
            ; (document.getElementById("userIsAdmin") as HTMLInputElement).checked = user.isAdmin
            ; (document.getElementById("userIsSubscribed") as HTMLInputElement).checked = user.isSubscribed
    } else {
        editingUser = null
        title.textContent = "Add User"
            ; (document.getElementById("userFormElement") as HTMLFormElement).reset()
    }

    form.classList.remove("hidden")
}

//oculta usuarios del json
function hideUserForm() {
    document.getElementById("userForm")!.classList.add("hidden")
    editingUser = null
}

//mostramos algortitmos
function showAlgorithmForm(algo?: Algorithm) {
    const form = document.getElementById("algorithmForm")!
    const title = document.getElementById("algorithmFormTitle")!

    if (algo) {
        editingAlgorithm = algo
        title.textContent = "Edit Algorithm"
            ; (document.getElementById("algorithmName") as HTMLInputElement).value = algo.name
            ; (document.getElementById("algorithmCategory") as HTMLInputElement).value = algo.category
            ; (document.getElementById("algorithmDifficulty") as HTMLSelectElement).value = algo.difficulty
    } else {
        editingAlgorithm = null
        title.textContent = "Add Algorithm"
            ; (document.getElementById("algorithmFormElement") as HTMLFormElement).reset()
    }

    form.classList.remove("hidden")
}

//ocultamos algoritmos
function hideAlgorithmForm() {
    document.getElementById("algorithmForm")!.classList.add("hidden")
    editingAlgorithm = null
}

function editUser(id: string) {
    const user = users.find(u => u.id === id)
    if (user) showUserForm(user)
}

function editAlgorithm(id: string) {
    const algo = algorithms.find(a => a.id === id)
    if (algo) showAlgorithmForm(algo)
}

//user form

(document.getElementById("userFormElement") as HTMLFormElement).addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (document.getElementById("userName") as HTMLInputElement).value;
    const email = (document.getElementById("userEmail") as HTMLInputElement).value;
    const password = (document.getElementById("userPassword") as HTMLInputElement).value;
    const isAdmin = (document.getElementById("userIsAdmin") as HTMLInputElement).checked;
    const isSubscribed = (document.getElementById("userIsSubscribed") as HTMLInputElement).checked;

    if (editingUser) {
        editingUser.name = name;
        editingUser.email = email;
        editingUser.password = password;
        editingUser.isAdmin = isAdmin;
        editingUser.isSubscribed = isSubscribed;

        console.log({
            action: "EDIT_USER",
            adminId: currentAdmin!.id,
            targetUserId: editingUser.id,
            date: new Date().toISOString()
        });
    } else {
        users.push({
            id: String(users.length + 1),
            name,
            email,
            password,
            isAdmin,
            isSubscribed,
            registerDate: new Date().toISOString(),
            likedPostIDs: []
        });

        console.log({
            action: "ADD_USER",
            adminId: currentAdmin!.id,
            date: new Date().toISOString()
        });
    }

    hideUserForm();
    renderUsers();
});

(document.getElementById("algorithmFormElement") as HTMLFormElement).addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (document.getElementById("algorithmName") as HTMLInputElement).value;
    const category = (document.getElementById("algorithmCategory") as HTMLInputElement).value;
    const difficulty = (document.getElementById("algorithmDifficulty") as HTMLSelectElement).value;

    if (editingAlgorithm) {
        editingAlgorithm.name = name;
        editingAlgorithm.category = category;
        editingAlgorithm.difficulty = difficulty;

        console.log({
            action: "EDIT_ALGORITHM",
            adminId: currentAdmin!.id,
            targetAlgorithmId: editingAlgorithm.id,
            date: new Date().toISOString()
        });
    } else {
        algorithms.push({
            id: String(algorithms.length + 1),
            name,
            category,
            difficulty
        });

        console.log({
            action: "ADD_ALGORITHM",
            adminId: currentAdmin!.id,
            date: new Date().toISOString()
        });
    }

    hideAlgorithmForm();
    renderAlgorithms();
});

