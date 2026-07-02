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

// ESTADO DE LOS FILTROS

// Texto ingresado en el buscador.
let textoBusqueda = "";

// Categoría seleccionada.
let categoriaSeleccionada = "all";

// ELEMENTOS DEL DOM

// Contenedor donde se mostrarán las tarjetas.
const contenedorProductos = document.getElementById("contenedorProductos");

// Mensaje de carga o error.
const mensajeProductos = document.getElementById("mensajeProductos");

// Selector de categorías.
const selectorCategorias = document.getElementById("categorias");

// Buscador.
const buscador = document.getElementById("buscador");

// Contenedor del carrito.
const productosCarrito = document.getElementById("productosCarrito");

// Precio total.
const precioTotal = document.getElementById("precioTotal");

// VERIFICACIÓN DE SESIÓN

/**
 * Verifica que exista una sesión iniciada.
 * Si no existe un token almacenado,
 * redirige nuevamente al login.
 */
function verificarSesion() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión para acceder a la tienda.");
        window.location.href = "../LoginUser/index.html";
    }

}

// FUNCIONES DE LA API

async function cargarProductos() {

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
            "Ocurrió un error al cargar los productos.";
    }
}

async function cargarCategorias() {

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
 * Crea la tarjeta HTML correspondiente a un producto.
 *
 * @param {Object} producto
 * @returns {HTMLElement}
 */
function crearTarjetaProducto(producto) {

    // Tarjeta principal.
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("tarjeta-producto");

    // Imagen.
    const imagen = document.createElement("img");
    imagen.src = producto.image;
    imagen.alt = producto.title;

    // Nombre.
    const titulo = document.createElement("h3");
    titulo.textContent = producto.title;

    // Categoría.
    const categoria = document.createElement("p");
    categoria.classList.add("categoria");
    categoria.textContent = producto.category;

    // Precio.
    const precio = document.createElement("p");
    precio.classList.add("precio");
    precio.textContent = `$${producto.price.toFixed(2)}`;

    // Botón.
    const boton = document.createElement("button");
    boton.textContent = "🛒 Agregar al carrito";

    // Evento para agregar el producto al carrito.
    boton.addEventListener("click", () => {

        agregarAlCarrito(producto.id);

    });

    // Agrega todos los elementos a la tarjeta.
    tarjeta.appendChild(imagen);
    tarjeta.appendChild(titulo);
    tarjeta.appendChild(categoria);
    tarjeta.appendChild(precio);
    tarjeta.appendChild(boton);

    return tarjeta;

}

/**
 * Muestra dinámicamente todos los productos.
 *
 * @param {Array} listaProductos
 */
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

// =====================================================
// CARRITO
// =====================================================

/**
 * Agrega un producto al carrito.
 *
 * Si el producto ya existe,
 * aumenta su cantidad.
 *
 * @param {number} idProducto
 */
function agregarAlCarrito(idProducto) {

    // Busca el producto completo.
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

/**
 * Guarda el carrito en localStorage.
 */
function guardarCarrito() {

    localStorage.setItem("carrito", JSON.stringify(carrito));

}

/**
 * Calcula el total del carrito.
 */
function calcularTotal() {

    const total = carrito.reduce((acumulador, producto) => {

        return acumulador + (producto.price * producto.cantidad);

    }, 0);

    precioTotal.textContent = `$${total.toFixed(2)}`;

}

/**
 * Renderiza todos los productos del carrito.
 */
function renderizarCarrito() {

    productosCarrito.innerHTML = "";

    // Carrito vacío.
    if (carrito.length === 0) {

        productosCarrito.innerHTML = `
            <p class="carrito-vacio">
                Tu carrito está vacío.
            </p>
        `;

        precioTotal.textContent = "$0.00";

        return;

    }

    carrito.forEach(producto => {

        // Tarjeta del carrito.
        const tarjeta = document.createElement("article");

        tarjeta.classList.add("item-carrito");

        // Imagen.
        const imagen = document.createElement("img");

        imagen.src = producto.image;
        imagen.alt = producto.title;

        // Información.
        const informacion = document.createElement("div");

        informacion.classList.add("info-carrito");

        const titulo = document.createElement("h4");
        titulo.textContent = producto.title;

        const cantidad = document.createElement("p");
        cantidad.textContent =
            `Cantidad: ${producto.cantidad}`;

        const precio = document.createElement("p");
        precio.textContent =
            `Precio: $${producto.price.toFixed(2)}`;

        const subtotal = document.createElement("p");
        subtotal.textContent =
            `Subtotal: $${(producto.price * producto.cantidad).toFixed(2)}`;

        informacion.appendChild(titulo);
        informacion.appendChild(cantidad);
        informacion.appendChild(precio);
        informacion.appendChild(subtotal);

        tarjeta.appendChild(imagen);
        tarjeta.appendChild(informacion);

        productosCarrito.appendChild(tarjeta);

    });

    calcularTotal();

}

// =====================================================
// EVENTOS
// =====================================================

/**
 * Configura todos los eventos de la aplicación.
 */
function configurarEventos() {

    // Buscador.
    buscador.addEventListener("input", (event) => {

        textoBusqueda = event.target.value;

        actualizarProductos();

    });

    // Categorías.
    selectorCategorias.addEventListener("change", (event) => {

        categoriaSeleccionada = event.target.value;

        actualizarProductos();

    });

}

// =====================================================
// INICIALIZACIÓN
// =====================================================

/**
 * Punto de entrada de la aplicación.
 */
function iniciarAplicacion() {

    // Comprueba que exista una sesión.
    verificarSesion();

    // Obtiene los productos.
    cargarProductos();

    // Obtiene las categorías.
    cargarCategorias();

    // Configura todos los eventos.
    configurarEventos();

    // Recupera el carrito almacenado.
    renderizarCarrito();

}

// Espera a que cargue completamente el HTML.
document.addEventListener("DOMContentLoaded", iniciarAplicacion);