// CONSTANTES
const API_URL = "https://fakestoreapi.com";

// VARIABLES GLOBALES
// Lista completa de productos obtenidos desde la API.
let productos = [];

// Lista de productos que se muestran actualmente.
let productosFiltrados = [];

// Carrito de compras.
// Si existe un carrito guardado en localStorage, lo recupera.
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Texto ingresado en el buscador.
let textoBusqueda = "";

// Categoría seleccionada.
let categoriaSeleccionada = "all";

// ELEMENTOS DEL DOM
const carritoAside = document.getElementById("carrito");
const btnCarrito = document.getElementById("btnCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const cantidadCarritoBadge = document.getElementById("cantidadCarrito"); // Para el número del header
const contenedorProductos = document.getElementById("contenedorProductos");
const mensajeProductos = document.getElementById("mensajeProductos");
const selectorCategorias = document.getElementById("categorias");
const buscador = document.getElementById("buscador");
const productosCarrito = document.getElementById("productosCarrito");
const precioTotal = document.getElementById("precioTotal");

// VERIFICACIÓN DE SESIÓN
// Verifica que exista una sesión iniciada. Si no existe un token almacenado, redirige nuevamente al login.
function verificarSesion() {

    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Debes iniciar sesión para acceder a la tienda.");
        window.location.replace("../LoginUser/index.html");
        return false;
    }
    return true;
}

// FUNCIONES DE LA API

async function cargarProductos() { // Obtiene todos los productos desde Fake Store API, guarda los productos en array local y los muestra

    try {
        mensajeProductos.textContent = "Cargando productos...";
        const respuesta = await fetch(`${API_URL}/products`);

        if (!respuesta.ok) {
            throw new Error("No fue posible cargar los productos.");
        }

        productos = await respuesta.json();
        productosFiltrados = [...productos];
        mensajeProductos.textContent = "";
        actualizarProductos();

    } catch (error) {

        console.error(error);

        mensajeProductos.textContent =
            "Hubo un error al cargar los productos.";
    }
}

async function cargarCategorias() { // Obtiene las categorias desde la API y las agrega al select 

    try {
        const respuesta = await fetch(`${API_URL}/products/categories`);

        if (!respuesta.ok) {
            throw new Error("No fue posible obtener las categorías.");
        }

        const categorias = await respuesta.json();

        selectorCategorias.innerHTML = "";

        // Opción para mostrar todas las categorías.
        const opcionTodas = document.createElement("option");

        opcionTodas.value = "all";
        opcionTodas.textContent = "Todas las categorías";

        selectorCategorias.appendChild(opcionTodas);

        // Agrega las categorías obtenidas.
        categorias.forEach(categoria => {

            const opcion = document.createElement("option");

            opcion.value = categoria;
            opcion.textContent = categoria;

            selectorCategorias.appendChild(opcion);
        });
    } catch (error) {
        console.error(error);
    }
}

// FILTROS

function actualizarProductos() {

    productosFiltrados = productos.filter(producto => {

        const coincideBusqueda =
            producto.title
                .toLowerCase()
                .includes(textoBusqueda.toLowerCase());

        const coincideCategoria =
            categoriaSeleccionada === "all" ||
            producto.category === categoriaSeleccionada;

        return coincideBusqueda && coincideCategoria;
    });
    renderizarProductos(productosFiltrados);
}

// RENDERIZADO

/**
 * Crea la tarjeta HTML correspondiente a un producto.*/
function crearTarjetaProducto(producto) {

    // Tarjeta principal
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("tarjeta-producto");

    // Imagen
    const imagen = document.createElement("img");
    imagen.src = producto.image;
    imagen.alt = producto.title;

    // Nombre
    const titulo = document.createElement("h3");
    titulo.textContent = producto.title;

    // Categoría
    const categoria = document.createElement("p");
    categoria.classList.add("categoria");
    categoria.textContent = producto.category;

    // Precio
    const precio = document.createElement("p");
    precio.classList.add("precio");
    precio.textContent = `$${producto.price.toFixed(2)}`;

    // Botón
    const boton = document.createElement("button");
    boton.textContent = "🛒 Agregar al carrito";

    // Evento para agregar el producto al carrito
    boton.addEventListener("click", () => {

        agregarAlCarrito(producto.id);

    });

    // Agrega todos los elementos a la tarjeta
    const info = document.createElement("div");
    info.classList.add("info");

    info.appendChild(categoria);
    info.appendChild(titulo);
    info.appendChild(precio);
    info.appendChild(boton);

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(info);

    return tarjeta;
}

/**
 * Muestra dinámicamente todos los productos.*/
function renderizarProductos(listaProductos) {

    // Limpia el contenedor.
    contenedorProductos.innerHTML = "";

    // Si no hay productos...
    if (listaProductos.length === 0) {
        mensajeProductos.textContent =
            "No se encontraron productos.";

        return;
    }

    // Oculta cualquier mensaje.
    mensajeProductos.textContent = "";

    // Recorre la lista de productos.
    listaProductos.forEach(producto => {
        const tarjeta = crearTarjetaProducto(producto);
        contenedorProductos.appendChild(tarjeta);
    });
}

// CARRITO

/**
 * Agrega un producto al carrito.
 * Si el producto ya existe, aumenta su cantidad.*/
function agregarAlCarrito(idProducto) {

    // Busca el producto completo
    const producto = productos.find(producto => producto.id === idProducto);

    if (!producto) {
        return;
    }

    // Busca si ya está agregado.
    const productoExistente = carrito.find(item => item.id === idProducto);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            title: producto.title,
            price: producto.price,
            image: producto.image,
            cantidad: 1
        });
    }
    guardarCarrito();
    renderizarCarrito();
}

// Guarda el carrito en localStorage.
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Calcula el total del carrito.
function calcularTotal() {
    const total = carrito.reduce((acumulador, producto) => {
        return acumulador + (producto.price * producto.cantidad);
    }, 0);
    precioTotal.textContent = `$${total.toFixed(2)}`;
}

// Renderiza todos los productos del carrito.
function renderizarCarrito() {
    productosCarrito.innerHTML = "";

    // Carrito vacío
    if (carrito.length === 0) {
        productosCarrito.innerHTML = `
            <p class="carrito-vacio">
                Tu carrito está vacío.
            </p>
        `;

        precioTotal.textContent = "$0.00";
        // Actualiza el número del carrito a 0.
        actualizarBadgeCarrito();
        return;
    }

    carrito.forEach(producto => {

        const tarjeta = document.createElement("article");
        tarjeta.classList.add("item-carrito");

        tarjeta.innerHTML = `
            <img src="${producto.image}" alt="${producto.title}">
            <div class="info-carrito">
                <h4>${producto.title}</h4>
                <p>Precio: $${producto.price.toFixed(2)}</p>
                <p>Subtotal: $${(producto.price * producto.cantidad).toFixed(2)}</p>

                <div class="controles-cantidad">
                    <button class="btn-menos" data-id="${producto.id}">-</button>
                    <span>${producto.cantidad}</span>
                    <button class="btn-mas" data-id="${producto.id}">+</button>
                </div>

                <button class="btn-eliminar" data-id="${producto.id}">
                    🗑️ Eliminar
                </button>
            </div>
        `;

        tarjeta.querySelector(".btn-menos").addEventListener("click", () => {
            cambiarCantidad(producto.id, -1);
        });

        tarjeta.querySelector(".btn-mas").addEventListener("click", () => {
            cambiarCantidad(producto.id, 1);
        });

        tarjeta.querySelector(".btn-eliminar").addEventListener("click", () => {
            eliminarDelCarrito(producto.id);
        });

        productosCarrito.appendChild(tarjeta);
    });

    actualizarBadgeCarrito();
    calcularTotal();
}

// EVENTOS

// Configura todos los eventos de la aplicación
function configurarEventos() {

    buscador.addEventListener("input", (event) => {
        textoBusqueda = event.target.value;
        actualizarProductos();
    });

    selectorCategorias.addEventListener("change", (event) => {
        categoriaSeleccionada = event.target.value;
        actualizarProductos();
    });

    // Abrir carrito
    btnCarrito.addEventListener("click", () => {
        carritoAside.classList.add("activo");
    });

    // Cerrar carrito
    cerrarCarrito.addEventListener("click", () => {
        carritoAside.classList.remove("activo");
    });
}

// Espera a que cargue completamente el HTML.
document.addEventListener("DOMContentLoaded", iniciarAplicacion);

// Cambia la cantidad de un producto en el carrito (Suma o Resta)
function cambiarCantidad(idProducto, cambio) {
    const item = carrito.find(item => item.id === idProducto);
    if (!item) return;

    item.cantidad += cambio;

    // Si la cantidad llega a 0, lo eliminamos automáticamente
    if (item.cantidad <= 0) {
        eliminarDelCarrito(idProducto);
    } else {
        guardarCarrito();
        renderizarCarrito();
    }
}

// Elimina un producto por completo del carrito
function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.id !== idProducto);
    guardarCarrito();
    renderizarCarrito();
}

// Actualiza el número identificador en el botón del Header
function actualizarBadgeCarrito() {
    const totalCantidad = carrito.reduce((acum, item) => acum + item.cantidad, 0);
    cantidadCarritoBadge.textContent = totalCantidad;
}

// INICIALIZACIÓN

function iniciarAplicacion() {
    // Comprueba que exista una sesión.
    if(!verificarSesion()) {
        return;
    }

    cargarProductos();
    cargarCategorias();
    configurarEventos();
    renderizarCarrito();
}