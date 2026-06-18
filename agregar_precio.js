const API = "https://primer-repo-nwmb.onrender.com/productos";

let productosGlobal = [];
let idProductoActual = null;
let imagenNueva = "";
// ==========================
// CARGAR PRODUCTOS
// ==========================

async function cargarProductos() {

    try {

        const res = await fetch(API);

        const datos = await res.json();

        productosGlobal = datos;

        renderTabla(datos);

    }
    catch(error){

        console.log(error);

    }

}

// ==========================
// RENDER TABLA
// ==========================

function renderTabla(data) {

    const tbody = document.getElementById("tbodyProductos");

    tbody.innerHTML = "";

    data.forEach(p => {

        tbody.innerHTML += `
        <tr>

            <td>
                <img
class="img-tabla"
src="${
p.imagen
? p.imagen
: 'img/camara.png'
}"
            </td>

            <td>${p.marca}</td>

            <td>${p.modelo}</td>

            <td>${p.numSerie}</td>

            <td>$${p.precio}</td>

            <td>${p.stock}</td>

            <td>
<button
class="btn-editar"
onclick="abrirModal(${p.idProducto})">

✏ Editar

</button>

            </td>

        </tr>
        `;
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
// BUSCAR
// ==========================

function buscarProducto() {

    const marca =
    document.getElementById("searchMarca")
    .value
    .toLowerCase();

    const modelo =
    document.getElementById("searchModelo")
    .value
    .toLowerCase();

    const categoria =
    document.getElementById("searchCategoria")
    .value
    .toLowerCase();

    const serial =
    document.getElementById("searchSerial")
    .value
    .toLowerCase();

    const caracteristicas = normalizar(
    document.getElementById("searchCaracteristicas")
    .value);

    const filtrados = productosGlobal.filter(p =>

        (!marca ||
        p.marca?.toLowerCase().includes(marca))

        &&

        (!modelo ||
        p.modelo?.toLowerCase().includes(modelo))

        &&

        (!categoria ||
        p.categoria?.toLowerCase().includes(categoria))

        &&

        (!serial ||
        p.numSerie?.toLowerCase().includes(serial))

        &&

    (!caracteristicas ||
normalizar(p.caracteristicas).includes(caracteristicas))

    );

    renderTabla(filtrados);
};



// ==========================
// ABRIR MODAL
// ==========================

function abrirModal(id){
    

    const producto = productosGlobal.find(
        p => p.idProducto == id
    );

    if(!producto){

        alert("Producto no encontrado");
        return;

    }

    idProductoActual = id;
    imagenNueva = "";

    document.getElementById("modalMarca").value =
        producto.marca || "";

    document.getElementById("modalModelo").value =
        producto.modelo || "";
       
      document.getElementById("modalCategoria").value =
    producto.categoria || "";

    document.getElementById("modalSerial").value =
        producto.numSerie || "";

    document.getElementById("modalPrecio").value =
        producto.precio || 0;

    document.getElementById("modalStock").value =
        producto.stock || 0;

    document.getElementById("modalDescripcion").value =
        producto.descripcion || "";

    document.getElementById("modalCaracteristicas").value =
        producto.caracteristicas || "";

    document.getElementById("modalImagenInput").value =
        producto.imagen || "";

    document.getElementById("modalImagen").src =
producto.imagen
? producto.imagen
: "img/camara.png";

    document
        .getElementById("modalEditar")
        .classList
        .add("open");

}
// ==========================
// CERRAR MODAL
// ==========================

function cerrarModal(){

    document
    .getElementById("modalEditar")
    .classList
    .remove("open");

}

// ==========================
// ACTUALIZAR PREVIEW IMAGEN
// ==========================

document.addEventListener("input",(e)=>{

    if(e.target.id === "modalImagenInput"){

        document
        .getElementById("modalImagen")
        .src = e.target.value;

    }

});

// ==========================
// GUARDAR CAMBIOS
// ==========================

async function guardarDatos(){

    try{

        const datos = {

            marca:
            document.getElementById("modalMarca").value,

            modelo:
            document.getElementById("modalModelo").value,

    categoria: 
    document.getElementById("modalCategoria").value,
            numSerie:
            document.getElementById("modalSerial").value,

            precio:
            Number(
                document.getElementById("modalPrecio").value
            ),

            stock:
            Number(
                document.getElementById("modalStock").value
            ),

            descripcion:
            document.getElementById("modalDescripcion").value,

            caracteristicas:
            document.getElementById("modalCaracteristicas").value,

          imagen:
imagenNueva ||
document.getElementById("modalImagenInput").value

        };

        const res = await fetch(

            `${API}/${idProductoActual}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":"application/json"

                },

                body: JSON.stringify(datos)

            }

        );

        const resultado = await res.json();

        alert(resultado.mensaje);

        cerrarModal();

        cargarProductos();

    }
    catch(error){

        console.log(error);

    }

}

// ==========================
// ELIMINAR PRODUCTO
// ==========================

async function eliminarProducto(){

    const confirmar = confirm(

        "¿Deseas eliminar este producto?"

    );

    if(!confirmar){

        return;

    }

    try{

        const res = await fetch(

            `${API}/${idProductoActual}`,

            {

                method:"DELETE"

            }

        );

        const resultado = await res.json();

        alert(resultado.mensaje);

        cerrarModal();

        cargarProductos();

    }
    catch(error){

        console.log(error);

    }

}


// INICIO
// ==========================
// CAMBIAR IMAGEN
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const inputImagen =
    document.getElementById("modalFileImagen");

    if (!inputImagen) return;

    inputImagen.addEventListener("change", async (e) => {

        const archivo = e.target.files[0];

        if (!archivo) return;

        try {

            const formData = new FormData();

            formData.append(
                "imagen",
                archivo
            );

            const respuesta =
            await fetch(
                "https://primer-repo-nwmb.onrender.com/subirImagen",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data =
            await respuesta.json();

            imagenNueva = data.ruta;

            document
            .getElementById("modalImagenInput")
            .value = imagenNueva;

           document
.getElementById("modalImagen")
.src =
imagenNueva;
        }
        catch(error){

            console.log(error);

            alert(
                "Error al subir imagen"
            );

        }

    });

});
window.addEventListener("click", function(e) {

    const modal = document.getElementById("modalProducto");

    if (e.target === modal) {

        cerrarModalProducto();
    }

});


cargarProductos();