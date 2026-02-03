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
    status: string
}

let users: User[] = []
let algorithms: Algorithm[] = []
let currentAdmin: User | null = null

const list = document.getElementById("list") as HTMLDivElement

Promise.all([
    fetch("/users.json").then(res => res.json() as Promise<User[]>),
    fetch("/algorithms.json").then(res => res.json() as Promise<Algorithm[]>)
]).then(([u, a]) => {
    users = u
    algorithms = a
})

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

function renderUsers() {
    list.innerHTML = "<h2>Usuarios</h2>"

    users.forEach(user => {
        const div = document.createElement("div")
        div.innerHTML = `
      <strong>${user.name}</strong> (${user.email})
      ${user.isAdmin ? "🛡️" : ""}
      <button>Borrar</button>
    `

        div.querySelector("button")!.onclick = () => deleteUser(user.id)
        list.appendChild(div)
    })
}

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

function renderAlgorithms() {
    list.innerHTML = "<h2>Algoritmos</h2>"

    algorithms.forEach(algo => {
        const div = document.createElement("div")
        div.innerHTML = `
      <strong>${algo.name}</strong>
      (${algo.category} - ${algo.difficulty})
      <button>Borrar</button>
    `

        div.querySelector("button")!.onclick = () => deleteAlgorithm(algo.id)
        list.appendChild(div)
    })
}

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


