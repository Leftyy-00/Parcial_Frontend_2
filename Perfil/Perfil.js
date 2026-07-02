// Verificar que exista una sesión
const token = localStorage.getItem("authToken");
const usuario = JSON.parse(localStorage.getItem("usuarioActual"));

if (!token || !usuario) {
    window.location.href = "../Login/index.html";
}

// Elementos del HTML
const nombre = document.getElementById("Nombre");
const usuarioHTML = document.getElementById("usuario");
const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");
const cerrarSesion = document.getElementById("cerrarSesion");

// Mostrar la información
nombre.textContent = `${usuario.name.firstname} ${usuario.name.lastname}`;
usuarioHTML.textContent = usuario.username;
correo.textContent = usuario.email;
telefono.textContent = usuario.phone;

// Cerrar sesión
cerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuarioActual");
    window.location.href = "/Parcial_Frontend_2/LoginUser/index.html";
});