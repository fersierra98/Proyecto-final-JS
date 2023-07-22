// Clase molde para los productos
class Producto {
    constructor(id, nombre, precio, categoria, imagen = false) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.imagen = imagen;
    }
}

// Esta clase simula una base de datos. Vamos a cargar todos los productos de nuestro e-commerce
class BaseDeDatos {
    constructor() {
        // Array de la base de datos
        this.productos = [];
    }

    async traerRegistros() {
        const response = await fetch("./productos.json");
        this.productos = await response.json();
        return this.productos;
    }

    registroPorId(id) {
        return this.productos.find((producto) => producto.id === id);
    }

    registrosPorNombre(palabra) {
        return this.productos.filter((producto) => producto.nombre.toLowerCase().includes(palabra));
    }

    registrosPorCategoria(categoria) {
        return this.productos.filter((producto) => producto.categoria == categoria);
    }
}

// Objeto de la base de datos
const bd = new BaseDeDatos();

// Elementos
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h1");
const botonComprar = document.querySelector("#botonComprar");
const botonesCategorias = document.querySelectorAll(".btnCategoria");

// Botones para filtrar productos por categoría
botonesCategorias.forEach((boton) => {
    boton.addEventListener("click", (event) => {
        event.preventDefault();
        quitarClase();
        boton.classList.add("seleccionado");
        const productosPorCategoria = bd.registrosPorCategoria(boton.innerText);
        cargarProductos(productosPorCategoria);
    });
});

const botonTodos = document.querySelector("#btnTodos");
botonTodos.addEventListener("click", (event) => {
    event.preventDefault();
    quitarClase();
    botonTodos.classList.add("seleccionado");
    cargarProductos(bd.productos);
});

// Funcion para eliminar la clase "seleccionado"
function quitarClase() {
    const botonSeleccionado = document.querySelector(".seleccionado");
    if (botonSeleccionado) {
        botonSeleccionado.classList.remove("seleccionado");
    }
}

// Llamamos a la función regular cargarProductos
bd.traerRegistros().then((productos) => cargarProductos(productos));

// Esta función muestra los registros de la base de datos en nuestro HTML
function cargarProductos(productos) {
    divProductos.innerHTML = "";
    for (const producto of productos) {
        divProductos.innerHTML += `
            <div class="producto">
            <h2>${producto.nombre}</h2>
            <p class="precio">$${producto.precio}</p>
            <div class="imagen">
                <img src="img/${producto.imagen}" />
            </div>
            <a href="#" class="btn btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
        </div>
    `;
    }

    // Botones agregar al carrito
    const botonesAgregar = document.querySelectorAll(".btnAgregar");
    for (const boton of botonesAgregar) {
        boton.addEventListener("click", (event) => {
            event.preventDefault();
            const id = Number(boton.dataset.id);
            const producto = bd.registroPorId(id);
            carrito.agregar(producto);
        });
    }
}

// Clase carrito
class Carrito {
    constructor() {
        const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
        this.carrito = carritoStorage || [];
        this.total = 0;
        this.totalProductos = 0;
        this.listar();
    }

    agregar(producto) {
        const productoEnCarrito = this.estaEnCarrito(producto);
        if (productoEnCarrito) {
            // Le sumamos la cantidad
            productoEnCarrito.cantidad++;
        } else {
            // Si no está, lo agrego al carrito
            this.carrito.push({ ...producto, cantidad: 1 });
        }
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar();

        // Toastify
        Toastify({
            text: `${producto.nombre} fue agregado al carrito`,
            position: "center",
            className: "info",
            gravity: "top",
            style: {
                background: "rgb(13, 143, 13)",
            },
        }).showToast();
    }

    // Verificamos si el producto está en el carrito
    estaEnCarrito({ id }) {
        return this.carrito.find((producto) => producto.id === id);
    }

    // Este método es el encargado de actualizar el HTML de nuestro carrito
    listar() {
        this.total = 0;
        this.totalProductos = 0;
        divCarrito.innerHTML = "";
        for (const producto of this.carrito) {
            divCarrito.innerHTML += `
        <div class="productoCarrito">
            <h2>${producto.nombre}</h2>
            <p>$${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <img src="img/${producto.imagen}" class="img-producto" width="50px">
            <a href="#" data-id="${producto.id}" class="btn btnQuitar">Quitar del carrito</a>
        </div>
    `;

            this.total += producto.precio * producto.cantidad;
            this.totalProductos += producto.cantidad;
        }

        if (this.totalProductos > 0) {
            botonComprar.classList.remove("oculto"); // Muestro el botón
        } else {
            botonComprar.classList.add("oculto"); // Oculto el botón
        }

        // Botones de quitar
        const botonesQuitar = document.querySelectorAll(".btnQuitar");
        for (const boton of botonesQuitar) {
            boton.onclick = (event) => {
                event.preventDefault();
                this.quitar(Number(boton.dataset.id));
            };
        }

        // Actualizamos variables carrito
        spanCantidadProductos.innerText = this.totalProductos;
        spanTotalCarrito.innerText = this.total;
    }

    // Método para quitar o restar productos del carrito
    quitar(id) {
        const indice = this.carrito.findIndex((producto) => producto.id === id);
        if (this.carrito[indice].cantidad > 1) {
            this.carrito[indice].cantidad--;
        } else {
            this.carrito.splice(indice, 1);
        }
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar();
    }

    // Método para vaciar el carrito
    vaciar() {
        this.carrito = [];
        localStorage.removeItem("carrito");
        this.listar();
    }
}

// Buscador de productos
inputBuscar.addEventListener("keyup", () => {
    const palabra = inputBuscar.value;
    const productosEncontrados = bd.registrosPorNombre(palabra.toLowerCase());
    cargarProductos(productosEncontrados);
});

// Toggle para ocultar/mostrar el carrito
botonCarrito.addEventListener("click", () => {
    document.querySelector("section").classList.toggle("ocultar");
});

// Mensaje de compra realizada con la librería Sweet Alert
botonComprar.addEventListener("click", (event) => {
    event.preventDefault();
    Swal.fire({
        title: "¡Gracias por elegirnos!",
        text: "Tu pedido está en proceso y será enviado a la brevedad posible",
        icon: "success",
        confirmButtonText: "Aceptar",
    });
    carrito.vaciar();
    document.querySelector("section").classList.add("ocultar");
});

// Objeto carrito
const carrito = new Carrito();