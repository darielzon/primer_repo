const bcrypt = require('bcrypt');

async function generar() {

    const hash = await bcrypt.hash(
        '546254',
        10
    );

    console.log(hash);

}

generar();