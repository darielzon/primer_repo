function cerrarSesion(){
    window.location.href = "login.html";
}

let imagenRuta = "";

// =======================
// PREVIEW IMAGEN
// =======================

function previewImage(event){

    const file = event.target.files[0];

    if(!file){
        return;
    }

    const reader = new FileReader();

    reader.onload = function(){

        const output = document.getElementById('imagePreview');
        const text = document.getElementById('uploadText');
        const icon = document.querySelector('.icon-cam');

        output.src = reader.result;
        output.style.display = 'block';

        text.style.display = 'none';
        icon.style.display = 'none';
    };

    reader.readAsDataURL(file);

}

// =======================
// GUARDAR PRODUCTO
// =======================

async function simularGuardado(){

    const marca = document.getElementById('marca').value;
    const modelo = document.getElementById('modelo').value;
    const serial = document.getElementById('serial').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
    const descripcion = document.getElementById('descripcion').value;
    const caracteristicas = document.getElementById('caracteristicas').value;
    const categoria = document.getElementById('categoria').value;

    const archivo =
    document.getElementById('fileInput').files[0];

    // VALIDACIONES

    if(!marca || !modelo || !precio || !stock){

        alert("Completa todos los campos obligatorios.");
        return;

    }

    if(precio <= 0){

        alert("El precio debe ser mayor a 0.");
        return;

    }

    if(stock < 0){

        alert("El stock no puede ser negativo.");
        return;

    }

    try{

        // =======================
        // SUBIR IMAGEN
        // =======================

        if(archivo){

            const formData = new FormData();

            formData.append(
                "imagen",
                archivo
            );

            const respuestaImagen =
            await fetch(

                "https://primer-repo-nwmb.onrender.com/subirImagen",

                {

                    method: "POST",

                    body: formData

                }

            );

            const dataImagen =
            await respuestaImagen.json();
            console.log(dataImagen);
console.log("URL imagen:", dataImagen.ruta);


            imagenRuta =
            dataImagen.ruta;

        }

        // =======================
        // GUARDAR PRODUCTO
        // =======================

        const respuesta =
        await fetch(

            "https://primer-repo-nwmb.onrender.com/agregarProducto",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"

                },

                body: JSON.stringify({

                    marca,
                    modelo,

                    categoria,

                    numSerie: serial,

                    precio:
                    parseFloat(precio),

                    stock:
                    parseInt(stock),

                    descripcion,

                    caracteristicas,

                    imagen:
                    imagenRuta



                })

            }

        );

        const data =
        await respuesta.json();

        document
        .getElementById("msgExito")
        .style.display = "block";

        alert(data.mensaje);

        limpiarFormulario();

    }
    catch(error){

        console.log(error);

        alert(
            "Error al conectar con el servidor."
        );

    }

}

// =======================
// LIMPIAR FORMULARIO
// =======================

function limpiarFormulario(){

    document.getElementById('marca').value = "";
    document.getElementById('modelo').value = "";
    document.getElementById('serial').value = "";
    document.getElementById('precio').value = "";
    document.getElementById('stock').value = "";
    document.getElementById('descripcion').value = "";
    document.getElementById('caracteristicas').value = "";
    document.getElementById('categoria').value = "";
    document.getElementById('imagePreview').style.display = "none";

    document.getElementById('uploadText').style.display = "block";

    document.querySelector('.icon-cam').style.display = "block";

    document.getElementById('fileInput').value = "";

    imagenRuta = "";

}