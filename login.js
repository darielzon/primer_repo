async function entrar(){

    const usuario =
    document.getElementById("usuario").value;

    const password =
    document.getElementById("password").value;

    try{

        const res = await fetch(

            "http://localhost:3000/login",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body: JSON.stringify({

                    usuario,
                    password

                })

            }

        );

        const data =
        await res.json();

        if(res.ok){

            localStorage.setItem(

                "usuarioLogueado",
                "true"

            );

            window.location.href =
            "dashboard.html";

        }
        else{

            alert(data.mensaje);

        }

    }
    catch(error){

        console.log(error);

        alert("Error de conexión");

    }

}