const modalEl = document.getElementById("modalLogin"),
  modal = new bootstrap.Modal(modalEl),
  nickIngreso = document.getElementById("nickIngreso"),
  mailIngreso = document.getElementById("mailIngreso"),
  passIngreso = document.getElementById("passIngreso"),
  checkRecordar = document.getElementById("recordarme"),
  btnLogin = document.getElementById("login"),
  nickUsuario = document.getElementById("nickUsuario"),
  btnLogout = document.getElementById("btnLogout"),
  contOculto = document.getElementById("logged"),
  contTarjetasD = document.getElementById("tarjetas"),
  ataquesContainer = document.getElementById("ataques-container"),
  btnAtacar = document.getElementById("btnAtacar"),
  toggles = document.querySelectorAll(".toggles");

function guardarUsuario(storage) {
  const data = {
    nickIngreso: nickIngreso.value.toUpperCase(),
    mailIngreso: mailIngreso.value,
    passIngreso: passIngreso.value,
  };
  storage.setItem("data", JSON.stringify(data));
}
function recuperarUsuario(storage) {
 return JSON.parse(storage.getItem("data"));
}
function elegirJugador(data) {
  nickUsuario.innerHTML = `GUERRERO ${data.nickIngreso}, ¿PREPARADO PARA PELEAR?`;
}

function borrarDatos() {
  localStorage.clear();
  sessionStorage.clear();
}
btnLogout.addEventListener("click", () => {
  borrarDatos();
  mostrarDioses(toggles, "d-none");
});

function mostrarDioses(array, clase) {
  array.forEach((element) => {
    element.classList.toggle(clase);
  });
}
const usarJson = async function () {
  let response = await fetch("./js/data.json");
  let dioses = await response.json();
  crearTarjetas(dioses);
};

function crearTarjetas(array) {
  contTarjetasD.innerHTML = "";

  array.forEach((element) => {
    let html = `<div class= "card cardDios" id="tarjeta${element.nombre}">
        <h3 class="card-header" id="nombreDios">${element.nombre}</h3>
        <img src="${element.img}" alt= "${element.nombre}"class="card-img-bottom" id="imagenDios">
        <div class="card-body">
           <p class="card-text" id="vidaDios">Vida: ${element.vida}</p>
           <p class="card-text" id="poderDios"> ${element.poder} </p>
           <p class="card-text" id="dañoDios">Daño: ${element.ataque}</p>
        </div>
    </div>`;
    contTarjetasD.innerHTML += html;
  });
}
btnLogin.addEventListener("click", (e) => {
  e.preventDefault();
  let regexMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!regexMail.test(mailIngreso.value) || passIngreso.value.length < 8 || nickIngreso.value.length < 2) {
    alert("Rellene todos los campos");
  } else {
    modal.hide();
    usarJson();
    mostrarDioses(toggles, "d-none");

    if (checkRecordar.checked) {
      guardarUsuario(localStorage);
      elegirJugador(recuperarUsuario(localStorage));
    } else {
      guardarUsuario(sessionStorage);
      elegirJugador(recuperarUsuario(sessionStorage));
    }
  }
});


const obtenerNumeroAleatorio = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const seleccionarDios = async (dioses) => {
  const nombreDioses = dioses.map((nombreD) => nombreD.nombre);

  const { value: numeroNombre } = await Swal.fire({
    title: "Escoge tu dios",
    input: "radio",
    inputOptions: nombreDioses,
    inputValidator: (value) => {
      if (!value) {
        return "Escoge, por favor!";
      }
    },
  });

  if (numeroNombre !== null && !isNaN(numeroNombre) && numeroNombre >= 0 && numeroNombre < dioses.length) {
    let vidaJugador = dioses[numeroNombre].vida; 
    let vidaEnemigo = obtenerNumeroAleatorio(100, 300); 
    let dañoJugador = dioses[numeroNombre].ataque;

    while (vidaEnemigo > 0 && vidaJugador > 0) {
      const { value: result } = await Swal.fire({
        html: `Vida del enemigo: ${vidaEnemigo}<br>Vida del jugador: ${vidaJugador}<br>Escoge una opción:`,
        showCancelButton: true,
        confirmButtonText: "Atacar",
        cancelButtonText: "Rendirse",
      });

      if (result) {
        vidaEnemigo -= dañoJugador;
        Swal.fire({
          html: `Has atacado al enemigo con ${dañoJugador} de daño. La vida del enemigo es ahora ${vidaEnemigo}`,
        });
      } else {
        Swal.fire({ html: `Te has rendido. ¡Vaya guerrero!` });
        break;
      }
      
      vidaEnemigo <= 0 ? Swal.fire({ html: `¡Has derrotado al enemigo!, Felicitaciones guerrero` }) : vidaJugador -= obtenerNumeroAleatorio(20, 50); 
      vidaJugador <= 0 && Swal.fire({ html: `¡Has sido derrotado!` });
        
      }
    }
  }
btnAtacar.addEventListener("click", async (e) => {
  e.preventDefault();
  const response = await fetch("./js/data.json");
  const dioses = await response.json();
  seleccionarDios(dioses);
});

