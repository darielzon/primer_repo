const API = "https://primer-repo-nwmb.onrender.com/productos";

let productosGlobal = [];
let productoActual = null;

// ==========================
// CARGAR PRODUCTOS
// ==========================

async function cargarProductos() {

    try {

        const res = await fetch(API);

        productosGlobal = await res.json();

        cargarSugerencias();

    }
    catch(error){

        console.log(error);

        alert("Error al cargar productos");

    }

}
function mostrarResultados(productos) {

    const contenedor =
    document.getElementById("resultadosBusqueda");

    contenedor.innerHTML = "";

    productos.forEach(producto => {

        contenedor.innerHTML += `

            <div class="card-producto">

                <img
                    src="${producto.imagen || 'img/camara.png'}"
                    width="120">

                <h3>${producto.marca || 'Sin marca'}</h3>

                <p><b>Modelo:</b> ${producto.modelo || 'Sin modelo'}</p>

                <p><b>Categoría:</b> ${producto.categoria || 'Sin categoría'}</p>

                <p><b>Serie:</b> ${producto.numSerie || 'Sin serie'}</p>

                <p><b>Stock:</b> ${producto.stock}</p>

                <button
                    onclick="seleccionarProducto(${producto.idProducto})">

                    Seleccionar

                </button>

            </div>

        `;

    });

}

// ==========================
// CARGAR SUGERENCIAS
// ==========================

function cargarSugerencias(){

    const listaMarcas =
    document.getElementById("listaMarcas");

    const listaModelos =
    document.getElementById("listaModelos");

    if(!listaMarcas || !listaModelos) return;

    listaMarcas.innerHTML = "";
    listaModelos.innerHTML = "";

    const marcas =
    [...new Set(productosGlobal.map(p => p.marca))];

    const modelos =
    [...new Set(productosGlobal.map(p => p.modelo))];

    marcas.forEach(marca => {

        listaMarcas.innerHTML +=
        `<option value="${marca}">`;

    });

    modelos.forEach(modelo => {

        listaModelos.innerHTML +=
        `<option value="${modelo}">`;

    });

}
function normalizar(texto) {

    return (texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");


}

// ==========================
// BUSCAR PRODUCTO
// ==========================

function buscarProducto() {

    const marca = document.getElementById("searchMarca")
        .value
        .toLowerCase()
        .trim();

    const modelo = document.getElementById("searchModelo")
        .value
        .toLowerCase()
        .trim();

    const serie = document.getElementById("buscarSerie")
        .value
        .toLowerCase()
        .trim();
    
        const categoria = document.getElementById("searchCategoria")
    .value
    .toLowerCase()
    .trim();
    
    const caracteristicas = normalizar(
    document.getElementById("buscaCaracteristicas")
    .value);


    const productosFiltrados = productosGlobal.filter(p =>

        (!marca ||
        (p.marca || "").toLowerCase().includes(marca))

        &&

        (!modelo ||
        (p.modelo || "").toLowerCase().includes(modelo))

        &&

        (!serie ||
        (p.numSerie || "").toLowerCase().includes(serie))
        &&

(!categoria ||
(p.categoria || "").toLowerCase().includes(categoria))

(!caracteristicas ||
normalizar(p.caracteristicas).includes(caracteristicas))

    

    );
    
    

    if (productosFiltrados.length === 0) {

        alert("No se encontraron productos");

        document.getElementById(
            "resultadosBusqueda"
        ).innerHTML = "";

        return;
    }

    document.getElementById(
        "clienteNombre"
    ).value = "";

    document.getElementById(
        "cantidadVenta"
    ).value = 1;

    mostrarResultados(productosFiltrados);
}

function seleccionarProducto(id){

    const producto = productosGlobal.find(
        p => p.idProducto == id
    );

    if(!producto){
        return;
    }

     productoActual = producto;
    
    mostrarProducto(producto);

}
// ==========================
// MOSTRAR PRODUCTO
// ==========================

function mostrarProducto(producto){

    document.getElementById(
        "productoEncontrado"
    ).style.display = "block";

    document.getElementById(
        "productoMarca"
    ).textContent =
    producto.marca || "sin marca" ;

    document.getElementById(
        "productoModelo"
    ).textContent =
    producto.modelo || "sin modelo";

    document.getElementById(
        "productoSerie"
    ).textContent =
    producto.numSerie || "sin numero de serie ";

    document.getElementById("productoDescripcion").textContent =
    producto.descripcion || "-";

document.getElementById("productoCaracteristicas").textContent =
    producto.caracteristicas || "-";
    document.getElementById(
        "productoPrecio"
    ).textContent =
    producto.precio;

    document.getElementById(
        "productoStock"
    ).textContent =
    producto.stock;

    document.getElementById(
        "productoDescripcion"
    ).textContent =
    producto.descripcion || "-";

    document.getElementById(
        "productoCaracteristicas"
    ).textContent =
    producto.caracteristicas || "-";

document.getElementById(
    "productoImagen"
).src =
producto.imagen &&
producto.imagen !== "undefined"
? producto.imagen
: "img/camara.png";

    calcularTotal();

}

// ==========================
// CALCULAR TOTAL
// ==========================

function calcularTotal(){

    if(!productoActual) return;

    const cantidad = Number(

        document.getElementById(
            "cantidadVenta"
        ).value

    );

    const total =

        cantidad *
        productoActual.precio;

    document.getElementById(
        "totalVenta"
    ).value =

        "$" + total.toFixed(2);

}

// ==========================
// VENDER PRODUCTO
// ==========================

async function venderProducto(){

    if(!productoActual){

        alert(
            "Primero busca un producto"
        );

        return;

    }

    const cliente =

    document.getElementById(
        "clienteNombre"
    ).value;

    const cantidad = Number(

        document.getElementById(
            "cantidadVenta"
        ).value

    );

    if(cliente.trim() === ""){

        alert(
            "Ingresa el nombre del cliente"
        );

        return;

    }

    if(cantidad <= 0){

        alert(
            "Cantidad inválida"
        );

        return;

    }

    if(cantidad > productoActual.stock){

        alert(
            "No hay suficiente stock disponible"
        );

        return;

    }

    try{

        const res = await fetch(

            "https://primer-repo-nwmb.onrender.com/vender",

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    idProducto:
                    productoActual.idProducto,

                    cliente,

                    cantidad

                })

            }

        );

        const resultado =
        await res.json();

        if(!res.ok){

            alert(resultado.mensaje);

            return;

        }

        alert(

            "Venta realizada correctamente\n\n" +

            "Total: $" +

            resultado.total

        );

        await cargarProductos();

        buscarProducto();

        document.getElementById(
            "clienteNombre"
        ).value = "";

        document.getElementById(
            "cantidadVenta"
        ).value = 1;

        calcularTotal();

    }
    catch(error){

        console.log(error);

        alert(
            "Error al vender"
        );

    }

}

// ==========================
// CREAR TICKET
// ==========================

function crearTicket(){

    if(!productoActual){

        alert(
            "Primero busca un producto"
        );

        return;

    }

    const cliente =

    document.getElementById(
        "clienteNombre"
    ).value;

    const cantidad = Number(

        document.getElementById(
            "cantidadVenta"
        ).value

    );

    const total =

        cantidad *
        productoActual.precio;

    const ticket = `

================================
   soporte y garantias 💯 
================================

Cliente:
${cliente}

Marca:
${productoActual.marca}

Modelo:
${productoActual.modelo}

Serie:
${productoActual.numSerie}

Cantidad:
${cantidad}

Precio:
$${productoActual.precio}

TOTAL:
$${total}

Stock restante:
${productoActual.stock - cantidad}

Fecha:
${new Date().toLocaleString()}

================================
Gracias por su compra
================================

`;

    localStorage.setItem(
        "ticketActual",
        ticket
    );

    alert(
        "Ticket generado correctamente"
    );

}
async function generarPDF(){

    if(!productoActual){

        alert(
            "Primero busca un producto"
        );

        return;

    }

    const cliente =
    document.getElementById(
        "clienteNombre"
    ).value;

    const cantidad =
    Number(
        document.getElementById(
            "cantidadVenta"
        ).value
    );

    const total =
    cantidad *
    productoActual.precio;

    const { jsPDF } =
    window.jspdf;

    const pdf =
    new jsPDF();

    pdf.setFontSize(16);

    pdf.text(
        "WORLDCAM",
        80,
        20
    );

    pdf.setFontSize(12);

    pdf.text(
        `Fecha: ${
            new Date()
            .toLocaleString()
        }`,
        10,
        35
    );

    pdf.text(
        `Cliente: ${cliente}`,
        10,
        45
    );

    pdf.text(
        `Marca: ${productoActual.marca}`,
        10,
        60
    );

    pdf.text(
        `Modelo: ${productoActual.modelo}`,
        10,
        70
    );

    pdf.text(
        `Serie: ${productoActual.numSerie}`,
        10,
        80
    );

    pdf.text(
        `Cantidad: ${cantidad}`,
        10,
        90
    );

    pdf.text(
        `Precio Unitario: $${productoActual.precio}`,
        10,
        100
    );

    pdf.text(
        `TOTAL: $${total}`,
        10,
        110
    );

    pdf.text(
        "Gracias por su compra",
        10,
        140
    );

    pdf.text(
        "Garantia de 30 dias",
        10,
        150
    );

    pdf.save(
        `Ticket_${productoActual.modelo}.pdf`
    );

}

// ==========================
// IMPRIMIR TICKET
// ==========================

function imprimirTicket(){

    const ticket =
    localStorage.getItem(
        "ticketActual"
    );

    if(!ticket){

        alert(
            "Primero crea un ticket"
        );

        return;

    }

    const ventana =
    window.open(
        "",
        "_blank",
        "width=400,height=600"
    );

    ventana.document.write(`

        <html>

        <head>

            <title>Ticket</title>

            <style>

                body{
                    font-family: monospace;
                    padding: 20px;
                }

            </style>

        </head>

        <body>

            <pre>${ticket}</pre>

        </body>

        </html>

    `);

    ventana.document.close();

    ventana.print();

}

// ==========================
// CERRAR SESIÓN
// ==========================

function cerrarSesion(){

    localStorage.removeItem(
        "usuarioLogueado"
    );

    window.location.href =
    "login.html";

}

// ==========================
// EVENTOS
// ==========================

window.addEventListener(

    "DOMContentLoaded",

    () => {

        const cantidadInput =

        document.getElementById(
            "cantidadVenta"
        );

        if(cantidadInput){

            cantidadInput.addEventListener(

                "input",

                calcularTotal

            );

        }

    }

);

// ==========================
// INICIO
// ==========================

cargarProductos();