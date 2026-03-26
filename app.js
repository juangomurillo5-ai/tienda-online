// BASE DE DATOS LOCAL
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let historial = JSON.parse(localStorage.getItem("historial")) || [];

let usuarioActual = null;
let carrito = [];

// PRODUCTOS
const productos = [
  { id: 1, nombre: "iPhone", categoria: "celulares", precio: 3000 },
  { id: 2, nombre: "Samsung", categoria: "celulares", precio: 2000 },
  { id: 3, nombre: "Laptop HP", categoria: "laptops", precio: 2500 }
];

// REGISTRO
function registrar() {
  let user = regUser.value.trim();
  let pass = regPass.value.trim();

  if (!user || !pass) {
    alert("⚠️ Todos los campos son obligatorios");
    return;
  }

  if (usuarios.find(u => u.user === user)) {
    alert("⚠️ El usuario ya existe");
    return;
  }

  usuarios.push({ user, pass });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("✅ Usuario registrado correctamente");
}

// LOGIN
function login() {
  let user = logUser.value.trim();
  let pass = logPass.value.trim();

  let encontrado = usuarios.find(u => u.user === user && u.pass === pass);

  if (!encontrado) {
    alert("❌ Usuario o contraseña incorrectos");
    return;
  }

  usuarioActual = user;
  auth.style.display = "none";
  tienda.style.display = "block";

  mostrarProductos(productos);
  mostrarHistorial();
}

// MOSTRAR PRODUCTOS
function mostrarProductos(lista) {
  let contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  lista.forEach(p => {
    contenedor.innerHTML += `
      <div>
        <h3>${p.nombre}</h3>
        <p>$${p.precio}</p>
        <button onclick="agregar(${p.id})">Agregar</button>
      </div>
    `;
  });
}

// FILTRO
function filtrar(cat) {
  if (cat === "todos") return mostrarProductos(productos);

  let filtrados = productos.filter(p => p.categoria === cat);
  mostrarProductos(filtrados);
}

// AGREGAR
function agregar(id) {
  let producto = productos.find(p => p.id === id);
  carrito.push(producto);
  actualizarCarrito();
}

// ELIMINAR
function eliminar(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

// ACTUALIZAR CARRITO
function actualizarCarrito() {
  let lista = document.getElementById("carrito");
  lista.innerHTML = "";

  let total = 0;

  carrito.forEach((p, i) => {
    total += p.precio;

    lista.innerHTML += `
      <li>
        ${p.nombre} - $${p.precio}
        <button onclick="eliminar(${i})">❌</button>
      </li>
    `;
  });

  document.getElementById("total").innerText = total;
}

// PAGO
function pagar() {
  if (carrito.length === 0) {
    alert("⚠️ No puedes pagar sin productos");
    return;
  }

  let total = carrito.reduce((sum, p) => sum + p.precio, 0);

  let confirmacion = confirm(`¿Confirmar pago de $${total}?`);

  if (!confirmacion) return;

  historial.push({
    usuario: usuarioActual,
    total,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("historial", JSON.stringify(historial));

  alert("✅ Compra exitosa 🎉");

  carrito = [];
  actualizarCarrito();
  mostrarHistorial();
}

// HISTORIAL
function mostrarHistorial() {
  let lista = document.getElementById("historial");
  lista.innerHTML = "";

  historial
    .filter(h => h.usuario === usuarioActual)
    .forEach(h => {
      lista.innerHTML += `
        <li>💰 $${h.total} - ${h.fecha}</li>
      `;
    });
}