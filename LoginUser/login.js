// login.js
// Login contra Fake Store API + guardado de sesión en localStorage

const loginForm = document.getElementById('loginForm');
const mensajeLogin = document.getElementById('mensajeLogin');

// Si ya hay sesión activa, no mostrar el login de nuevo
if (localStorage.getItem('authToken')) {
    window.location.href = '../PaginaPrincipal/index.html';
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    mensajeLogin.textContent = 'Verificando datos...';

    if (!username || !password) {
        mensajeLogin.textContent = 'Completá usuario y contraseña.';
        return;
    }

    try {
        // 1. Login: pide el token
        const loginResponse = await fetch('https://fakestoreapi.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!loginResponse.ok) {
            mensajeLogin.textContent = 'Usuario o contraseña incorrectos.';
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;

        // 2. Trae los datos del usuario de prueba (id 1 = johnd)
        const userResponse = await fetch('https://fakestoreapi.com/users/1');

        if (!userResponse.ok) {
            throw new Error('No se pudieron obtener los datos del usuario.');
        }

        const usuario = await userResponse.json();

        // 3. Guarda la sesión en el navegador
        localStorage.setItem('authToken', token);
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));

        // 4. Redirige al catálogo
        mensajeLogin.style.color = 'green';
        mensajeLogin.textContent = 'Sesión iniciada. Redirigiendo...';
        setTimeout(() => {
            window.location.href = '../PaginaPrincipal/index.html';
        }, 600);

    } catch (error) {
        console.error(error);
        mensajeLogin.textContent = 'Error al conectar con el servidor.';
    }
});