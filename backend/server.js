const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');

const { conectarDB, sql } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());


// ==========================
// CONFIGURAR MULTER
// ==========================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, 'uploads/');

    },

    filename: (req, file, cb) => {

        const nombreUnico =
            Date.now() +
            '-' +
            file.originalname;

        cb(null, nombreUnico);

    }

});

const upload = multer({
    storage
});


// ==========================
// PERMITIR VER IMÁGENES
// ==========================

app.use('/uploads', express.static('uploads'));


// ==========================
// CONECTAR BASE DE DATOS
// ==========================

conectarDB();


// ==========================
// RUTA PRINCIPAL
// ==========================

app.get('/', (req, res) => {

    res.send('Servidor funcionando 🚀');

});


// ==========================
// SUBIR IMAGEN
// ==========================

app.post(
    '/subirImagen',
    upload.single('imagen'),
    (req, res) => {

        try {

            res.json({

                ruta:
                `uploads/${req.file.filename}`

            });

        }
        catch (error) {

            console.log(error);

            res.status(500).json({

                mensaje:
                'Error al subir imagen'

            });

        }

    }
);


// ==========================
// OBTENER PRODUCTOS
// ==========================

app.get('/productos', async (req, res) => {

    try {

        const resultado = await sql.query(`

            SELECT *
            FROM Productos
            ORDER BY idProducto DESC

        `);

        res.json(resultado.recordset);

    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje:
            'Error al consultar productos'

        });

    }

});


// ==========================
// AGREGAR PRODUCTO
// ==========================

app.post('/agregarProducto', async (req, res) => {

    try {

        const {

            marca,
            modelo,
            numSerie,
            precio,
            stock,
            descripcion,
            caracteristicas,
            imagen

        } = req.body;

        await sql.query`

            INSERT INTO Productos
            (

                marca,
                modelo,
                numSerie,
                precio,
                stock,
                descripcion,
                caracteristicas,
                imagen

            )

            VALUES
            (

                ${marca},
                ${modelo},
                ${numSerie},
                ${precio},
                ${stock},
                ${descripcion},
                ${caracteristicas},
                ${imagen}

            )

        `;

        res.json({

            mensaje:
            'Producto agregado correctamente'

        });

    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje:
            'Error al agregar producto'

        });

    }

});


// ==========================
// EDITAR PRODUCTO
// ==========================

app.put('/productos/:id', async (req, res) => {

    try {

        const id = req.params.id;

        const {

            marca,
            modelo,
            numSerie,
            precio,
            stock,
            descripcion,
            caracteristicas,
            imagen

        } = req.body;

        await sql.query`

            UPDATE Productos

            SET

                marca = ${marca},
                modelo = ${modelo},
                numSerie = ${numSerie},
                precio = ${precio},
                stock = ${stock},
                descripcion = ${descripcion},
                caracteristicas = ${caracteristicas},
                imagen = ${imagen}

            WHERE idProducto = ${id}

        `;

        res.json({

            mensaje:
            'Producto actualizado correctamente'

        });

    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje:
            'Error al actualizar producto'

        });

    }

});


// ==========================
// ELIMINAR PRODUCTO
// ==========================

app.delete('/productos/:id', async (req, res) => {

    try {

        const id = req.params.id;

        await sql.query`

            DELETE FROM Productos

            WHERE idProducto = ${id}

        `;

        res.json({

            mensaje:
            'Producto eliminado correctamente'

        });

    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje:
            'Error al eliminar producto'

        });

    }

});
app.post('/login', async (req, res) => {

    try {

        const {

            usuario,
            password

        } = req.body;

        const resultado = await sql.query`

            SELECT *
            FROM Usuarios
            WHERE usuario = ${usuario}

        `;

        if(resultado.recordset.length === 0){

            return res.status(401).json({

                mensaje: 'Usuario incorrecto'

            });

        }

        const usuarioDB =
        resultado.recordset[0];

        const coincide =
        await bcrypt.compare(

            password,
            usuarioDB.passwordHash

        );

        if(!coincide){

            return res.status(401).json({

                mensaje: 'Contraseña incorrecta'

            });

        }

        res.json({

            mensaje: 'Login correcto',

            nombre:
            usuarioDB.nombreCompleto

        });

    }
    catch(error){

        console.log(error);

        res.status(500).json({

            mensaje: 'Error del servidor'

        });

    }

});

// ==========================
// VENDER PRODUCTO
// ==========================

app.post('/vender', async (req, res) => {

    try {

        const {

            idProducto,
            cliente,
            cantidad

        } = req.body;

        const producto = await sql.query`

            SELECT *
            FROM Productos
            WHERE idProducto = ${idProducto}

        `;

        if(producto.recordset.length === 0){

            return res.status(404).json({

                mensaje: 'Producto no encontrado'

            });

        }

        const p = producto.recordset[0];

        if(cantidad > p.stock){

            return res.status(400).json({

                mensaje: 'No hay suficiente stock'

            });

        }

        const nuevoStock =
        p.stock - cantidad;

        const total =
        p.precio * cantidad;

        await sql.query`

            UPDATE Productos

            SET stock = ${nuevoStock}

            WHERE idProducto = ${idProducto}

        `;

        await sql.query`

            INSERT INTO Ventas(

                idProducto,
                cliente,
                cantidad,
                precioUnitario,
                total

            )

            VALUES(

                ${idProducto},
                ${cliente},
                ${cantidad},
                ${p.precio},
                ${total}

            )

        `;

        res.json({

            mensaje: 'Venta realizada',

            total

        });

    }
    catch(error){

        console.log(error);

        res.status(500).json({

            mensaje: 'Error al realizar venta'

        });

    }

});


// LEVANTAR SERVIDOR


app.listen(3000, () => {

    console.log('Servidor corriendo en puerto 3000');

});