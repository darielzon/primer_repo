const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');

const { conectarDB, pool } = require('./db');

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

       const resultado = await pool.query(`

SELECT

    idproducto AS "idProducto",
    marca,
    modelo,
    numserie AS "numSerie",
    precio,
    stock,
    descripcion,
    caracteristicas,
    imagen,
    fecharegistro AS "fechaRegistro"

FROM Productos

ORDER BY idproducto DESC

`);
        res.json(resultado.rows);

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

        await pool.query(

            `

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

                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8

            )

            `,

            [

                marca,
                modelo,
                numSerie,
                precio,
                stock,
                descripcion,
                caracteristicas,
                imagen

            ]

        );

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

        await pool.query(

            `

            UPDATE Productos

            SET

                marca = $1,
                modelo = $2,
                numSerie = $3,
                precio = $4,
                stock = $5,
                descripcion = $6,
                caracteristicas = $7,
                imagen = $8

            WHERE idProducto = $9

            `,

            [

                marca,
                modelo,
                numSerie,
                precio,
                stock,
                descripcion,
                caracteristicas,
                imagen,
                id

            ]

        );

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

        await pool.query(

            `

            DELETE FROM Productos

            WHERE idProducto = $1

            `,

            [id]

        );

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
// ==========================
// LOGIN
// ==========================

app.post('/login', async (req, res) => {

    try {

        const {
            usuario,
            password
        } = req.body;

        const resultado = await pool.query(

            `
            SELECT *
            FROM Usuarios
            WHERE usuario = $1
            `,

            [usuario]

        );

        if(resultado.rows.length === 0){

            return res.status(401).json({

                mensaje: 'Usuario incorrecto'

            });

        }

        const usuarioDB =
        resultado.rows[0];

        const coincide =
        await bcrypt.compare(

            password,
            usuarioDB.passwordhash

        );

        if(!coincide){

            return res.status(401).json({

                mensaje: 'Contraseña incorrecta'

            });

        }

        res.json({

            mensaje: 'Login correcto',

            nombre:
            usuarioDB.nombrecompleto

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

        const producto = await pool.query(

            `
            SELECT *
            FROM productos
            WHERE idproducto = $1
            `,
            [idProducto]

        );

        if (producto.rows.length === 0) {

            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });

        }

        const p = producto.rows[0];

        if (cantidad > p.stock) {

            return res.status(400).json({
                mensaje: 'No hay suficiente stock'
            });

        }

        const nuevoStock =
            p.stock - cantidad;

        const total =
            Number(p.precio) * cantidad;

        await pool.query(

            `
            UPDATE productos
            SET stock = $1
            WHERE idproducto = $2
            `,
            [
                nuevoStock,
                idProducto
            ]

        );

        await pool.query(

            `
            INSERT INTO ventas
            (
                idproducto,
                cliente,
                cantidad,
                preciounitario,
                total
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5
            )
            `,
            [
                idProducto,
                cliente,
                cantidad,
                p.precio,
                total
            ]

        );

        res.json({

            mensaje: 'Venta realizada',

            total

        });

    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            mensaje: 'Error al realizar venta'

        });

    }

});


// LEVANTAR SERVIDOR


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});