// ==========================================================================
// 1. BASE DE DATOS INICIAL
// ==========================================================================
const productosOriginales = [
    { id: 1, nombre: "MacBook Pro M3", marca: "Apple", categoria: "laptops", precio: 12500000, stock: 5, img: "https://images.unsplash.com/photo-1517336714460-45732a970ad7?w=400", desc: "Chip M3 Max, 32GB RAM, Pantalla Liquid Retina XDR de 16 pulgadas." },
    { id: 2, nombre: "iPhone 15 Pro", marca: "Apple", categoria: "celulares", precio: 5800000, stock: 8, img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400", desc: "Diseño en titanio aeroespacial, Chip A17 Pro, Sistema de cámaras Pro de 48MP." },
    { id: 3, nombre: "Samsung S24 Ultra", marca: "Samsung", categoria: "celulares", precio: 5200000, stock: 10, img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400", desc: "Inteligencia Artificial integrada, S-Pen incluido, Pantalla Dynamic AMOLED 2X de 120Hz." },
    { id: 4, nombre: "Sony WH-1000XM5", marca: "Sony", categoria: "accesorios", precio: 1500000, stock: 15, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", desc: "La mejor cancelación de ruido del mercado, hasta 30 horas de autonomía y sonido Hi-Res." },
    { id: 5, nombre: "Asus ROG Zephyrus", marca: "Asus", categoria: "laptops", precio: 8500000, stock: 3, img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400", desc: "Tarjeta gráfica RTX 4070, Pantalla Nebula Display de 165Hz, Chasis ultra delgado de aluminio." },
    { id: 6, nombre: "Logitech G Pro X Superlight", marca: "Logitech", categoria: "accesorios", precio: 750000, stock: 20, img: "https://images.unsplash.com/photo-1527814732934-94a1e5d19599?w=400", desc: "Mouse inalámbrico para eSports, peso ultra ligero de 63 gramos." }
];

// ==========================================================================
// 2. ESTADOS Y PERSISTENCIA (LOCALSTORAGE)
// ==========================================================================
let inventario = JSON.parse(localStorage.getItem("pro_inventario")) || productosOriginales;
let carrito = JSON.parse(localStorage.getItem("pro_carrito")) || [];
let favoritos = JSON.parse(localStorage.getItem("pro_favoritos")) || [];
let historial = JSON.parse(localStorage.getItem("pro_historial")) || [];

// Base de datos de usuarios (con un admin por defecto)
let usuariosRegistrados = JSON.parse(localStorage.getItem("pro_db_usuarios")) || [
    { user: "admin", pass: "1234", rol: "admin" }
];
let usuarioActivo = JSON.parse(sessionStorage.getItem("pro_sesion")) || null;

// ==========================================================================
// 3. INICIALIZACIÓN (LO QUE SUCEDE AL ENTRAR A LA PÁGINA)
// ==========================================================================
window.onload = function() {
    actualizarInterfazUsuario();
    mostrarProductos(inventario); // Carga los productos inmediatamente
    actualizarCarritoUI();
    renderAdmin();
};

// ==========================================================================
// 4. FUNCIONES DE RENDERIZADO (MOSTRAR DATOS)
// ==========================================================================
function mostrarProductos(lista) {
    const contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = ""; // Limpiamos antes de dibujar
    
    if (lista.length === 0) {
        contenedor.innerHTML = "<h2 style='grid-column: 1/-1; text-align:center;'>No se encontraron productos.</h2>";
        return;
    }

    lista.forEach(producto => {
        // Revisamos si el producto actual está en el array de favoritos
        const claseFav = favoritos.includes(producto.id) ? "activo" : "";
        
        contenedor.innerHTML += `
            <div class="card" onclick="verDetalle(${producto.id})">
                <button class="btn-fav ${claseFav}" onclick="event.stopPropagation(); toggleFavorito(${producto.id})">❤</button>
                <img src="${producto.img}" alt="${producto.nombre}">
                <h4>${producto.nombre}</h4>
                <p style="color:#00cec9; font-weight:bold; font-size: 18px;">$${producto.precio.toLocaleString()}</p>
                <small style="display:block; margin-bottom: 10px;">Stock disponible: ${producto.stock}</small>
                <button class="btn-pagar-ahora" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">🛒 Agregar al Carrito</button>
            </div>
        `;
    });
}

function renderAdmin() {
    const cuerpoTabla = document.getElementById("cuerpo-tabla-admin");
    cuerpoTabla.innerHTML = "";
    
    inventario.forEach(producto => {
        cuerpoTabla.innerHTML += `
            <tr>
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>
                    <input type="number" value="${producto.stock}" style="width: 60px; padding: 5px;" onchange="cambiarStock(${producto.id}, this.value)">
                </td>
                <td>$${producto.precio.toLocaleString()}</td>
                <td>
                    <button onclick="eliminarDelInventario(${producto.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// ==========================================================================
// 5. BÚSQUEDA Y FILTROS
// ==========================================================================
function buscarProductos(texto) {
    const busqueda = texto.toLowerCase();
    const productosFiltrados = inventario.filter(producto => 
        producto.nombre.toLowerCase().includes(busqueda) || 
        producto.marca.toLowerCase().includes(busqueda) ||
        producto.desc.toLowerCase().includes(busqueda)
    );
    mostrarProductos(productosFiltrados);
}

function filtrarCategoria(categoria) {
    if (categoria === 'todos') {
        mostrarProductos(inventario);
    } else {
        const productosFiltrados = inventario.filter(producto => producto.categoria === categoria);
        mostrarProductos(productosFiltrados);
    }
}

// ==========================================================================
// 6. DETALLES DEL PRODUCTO (AQUÍ ESTÁ LA CORRECCIÓN DE LA X)
// ==========================================================================
function verDetalle(id) {
    const producto = inventario.find(p => p.id === id);
    const contenido = document.getElementById("contenido-detalle-producto");
    
    contenido.innerHTML = `
        <div style="text-align: center;">
            <img src="${producto.img}" style="width: 100%; max-height: 250px; object-fit: contain; border-radius: 10px;">
            <h2 style="margin: 10px 0;">${producto.nombre}</h2>
            <p style="color: #666; font-size: 14px;">Marca: ${producto.marca}</p>
            <p style="margin: 15px 0; text-align: justify;">${producto.desc}</p>
            <h3 style="color: #0984e3; font-size: 24px;">$${producto.precio.toLocaleString()}</h3>
            <button class="btn-pagar-ahora" onclick="agregarAlCarrito(${producto.id}); cerrarModalDetalle();">Añadir al Carrito</button>
        </div>
    `;
    
    document.getElementById("modalDetalle").style.display = "flex";
}

// FUNCIÓN REPARADA: Ahora sí cierra el modal correctamente.
function cerrarModalDetalle() {
    document.getElementById("modalDetalle").style.display = "none";
}

// ==========================================================================
// 7. LÓGICA DEL CARRITO DE COMPRAS
// ==========================================================================
function agregarAlCarrito(id) {
    const producto = inventario.find(p => p.id === id);
    
    if (producto.stock > 0) {
        producto.stock--; // Restamos del inventario general
        carrito.push({...producto}); // Clonamos el producto al carrito
        
        guardarDatosLocales();
        actualizarCarritoUI();
        mostrarProductos(inventario);
        renderAdmin();
        alert("Producto añadido al carrito.");
    } else {
        alert("Lo sentimos, este producto está agotado.");
    }
}

function quitarDelCarrito(index) {
    const productoEnCarrito = carrito[index];
    const productoEnInventario = inventario.find(p => p.id === productoEnCarrito.id);
    
    productoEnInventario.stock++; // Devolvemos el stock al inventario
    carrito.splice(index, 1); // Eliminamos del array del carrito
    
    guardarDatosLocales();
    actualizarCarritoUI();
    mostrarProductos(inventario);
    renderAdmin();
}

function actualizarCarritoUI() {
    const listaCarrito = document.getElementById("lista-carrito");
    const labelTotal = document.getElementById("precio-total");
    const contadorCarrito = document.getElementById("contadorCarrito");
    
    listaCarrito.innerHTML = "";
    let total = 0;
    
    carrito.forEach((producto, index) => {
        total += producto.precio;
        listaCarrito.innerHTML += `
            <li style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:5px;">
                <div>
                    <strong>${producto.nombre}</strong><br>
                    <small>$${producto.precio.toLocaleString()}</small>
                </div>
                <button onclick="quitarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:16px;">X</button>
            </li>
        `;
    });
    
    labelTotal.innerText = total.toLocaleString();
    contadorCarrito.innerText = `🛒 ${carrito.length}`;
}

// ==========================================================================
// 8. FAVORITOS Y PERFIL
// ==========================================================================
function toggleFavorito(id) {
    if (favoritos.includes(id)) {
        // Si ya es favorito, lo quitamos
        favoritos = favoritos.filter(favId => favId !== id);
    } else {
        // Si no es favorito, lo agregamos
        favoritos.push(id);
    }
    
    localStorage.setItem("pro_favoritos", JSON.stringify(favoritos));
    mostrarProductos(inventario); // Recargar tarjetas para actualizar el color del corazón
}

function verFavoritos() {
    const contenedorPerfil = document.getElementById("detalle-perfil-dinamico");
    const misProductosFavoritos = inventario.filter(producto => favoritos.includes(producto.id));
    
    if (misProductosFavoritos.length === 0) {
        contenedorPerfil.innerHTML = "<p style='padding:15px;'>Aún no tienes productos favoritos.</p>";
    } else {
        contenedorPerfil.innerHTML = "<h4 style='padding:0 15px;'>Mis Favoritos:</h4>" + misProductosFavoritos.map(producto => `
            <div style="padding: 15px; border-bottom: 1px solid #333; display: flex; align-items: center; gap: 10px;">
                <img src="${producto.img}" style="width: 50px; height: 50px; border-radius: 5px;">
                <div>
                    <strong>${producto.nombre}</strong><br>
                    <span style="color:#00cec9;">$${producto.precio.toLocaleString()}</span>
                </div>
            </div>
        `).join("");
    }
}

function verHistorial() {
    const contenedorPerfil = document.getElementById("detalle-perfil-dinamico");
    
    if (!usuarioActivo) {
        contenedorPerfil.innerHTML = "<p style='padding:15px;'>Debes iniciar sesión para ver tus compras.</p>";
        return;
    }
    
    // Filtramos el historial para que solo muestre las compras del usuario activo
    const misCompras = historial.filter(factura => factura.usuario === usuarioActivo.user);
    
    if (misCompras.length === 0) {
        contenedorPerfil.innerHTML = "<p style='padding:15px;'>Aún no has realizado ninguna compra.</p>";
    } else {
        contenedorPerfil.innerHTML = "<h4 style='padding:0 15px;'>Mis Compras:</h4>" + misCompras.map(factura => `
            <div style="background: #222; padding: 15px; border-radius: 8px; margin: 10px; border-left: 4px solid #00cec9;">
                <strong>Factura #${factura.idFactura}</strong><br>
                <small>Fecha: ${factura.fecha}</small><br>
                <span style="font-weight:bold; display:block; margin-top:5px;">Total pagado: $${factura.total}</span>
            </div>
        `).join("");
    }
}

// ==========================================================================
// 9. SISTEMA DE USUARIOS (REGISTRO Y LOGIN)
// ==========================================================================
function cambiarAuthTab(tipo) {
    const tabLog = document.getElementById("tabLogin");
    const tabReg = document.getElementById("tabRegistro");
    const formLog = document.getElementById("formLogin");
    const formReg = document.getElementById("formRegistro");

    if (tipo === 'login') {
        tabLog.classList.add("tab-active");
        tabReg.classList.remove("tab-active");
        formLog.style.display = "block";
        formReg.style.display = "none";
    } else {
        tabReg.classList.add("tab-active");
        tabLog.classList.remove("tab-active");
        formReg.style.display = "block";
        formLog.style.display = "none";
    }
}

function ejecutarRegistro() {
    const usuarioForm = document.getElementById("regUser").value;
    const emailForm = document.getElementById("regEmail").value;
    const passwordForm = document.getElementById("regPass").value;

    if (usuarioForm === "" || emailForm === "" || passwordForm === "") {
        alert("Por favor, llena todos los campos para registrarte.");
        return;
    }
    
    const usuarioExiste = usuariosRegistrados.find(u => u.user === usuarioForm);
    if (usuarioExiste) {
        alert("Este nombre de usuario ya está en uso. Intenta con otro.");
        return;
    }

    const nuevoUsuario = {
        user: usuarioForm,
        email: emailForm,
        pass: passwordForm,
        rol: "cliente" // Por defecto todos son clientes normales
    };

    usuariosRegistrados.push(nuevoUsuario);
    localStorage.setItem("pro_db_usuarios", JSON.stringify(usuariosRegistrados));
    
    alert("¡Cuenta creada exitosamente! Ahora inicia sesión.");
    cambiarAuthTab('login');
}

function ejecutarLogin() {
    const usuarioForm = document.getElementById("logUser").value;
    const passwordForm = document.getElementById("logPass").value;

    const usuarioEncontrado = usuariosRegistrados.find(u => u.user === usuarioForm && u.pass === passwordForm);

    if (usuarioEncontrado) {
        usuarioActivo = usuarioEncontrado;
        sessionStorage.setItem("pro_sesion", JSON.stringify(usuarioActivo));
        
        alert("Bienvenido al sistema, " + usuarioActivo.user);
        cerrarAuth();
        actualizarInterfazUsuario();
    } else {
        alert("Nombre de usuario o contraseña incorrectos.");
    }
}

function cerrarSesion() {
    sessionStorage.removeItem("pro_sesion");
    usuarioActivo = null;
    alert("Sesión cerrada correctamente.");
    location.reload(); // Recarga la página para limpiar los estados visuales
}

function actualizarInterfazUsuario() {
    const contenedorUserInfo = document.getElementById("userInfo");
    const botonAdmin = document.getElementById("btnAdmin");

    if (usuarioActivo) {
        contenedorUserInfo.innerText = "👤 " + usuarioActivo.user;
        if (usuarioActivo.rol === "admin") {
            botonAdmin.style.display = "inline-block";
        } else {
            botonAdmin.style.display = "none";
        }
    } else {
        contenedorUserInfo.innerText = "Invitado";
        botonAdmin.style.display = "none";
    }
}

// ==========================================================================
// 10. PROCESO DE PAGO (CHECKOUT SIMULADO)
// ==========================================================================
function mostrarCamposPago() {
    const metodoSeleccionado = document.getElementById("selectorPago").value;
    const contenedorFormulario = document.getElementById("formulario-dinamico-pago");
    
    if (metodoSeleccionado === "tarjeta") {
        contenedorFormulario.innerHTML = `
            <input type="text" placeholder="Número de Tarjeta (16 dígitos)" style="width:100%; padding:10px; margin:5px 0;">
            <div style="display:flex; gap:10px;">
                <input type="text" placeholder="MM/AA" style="width:50%; padding:10px; margin:5px 0;">
                <input type="text" placeholder="CVV" style="width:50%; padding:10px; margin:5px 0;">
            </div>
            <input type="text" placeholder="Nombre completo del titular" style="width:100%; padding:10px; margin:5px 0;">
        `;
    } else if (metodoSeleccionado === "pse") {
        contenedorFormulario.innerHTML = `
            <select style="width:100%; padding:10px; margin:5px 0;">
                <option>Bancolombia</option>
                <option>Davivienda</option>
                <option>Banco de Bogotá</option>
            </select>
            <input type="email" placeholder="Correo registrado en PSE" style="width:100%; padding:10px; margin:5px 0;">
        `;
    } else {
        contenedorFormulario.innerHTML = `
            <input type="number" placeholder="Número de Celular (Nequi/Daviplata)" style="width:100%; padding:10px; margin:5px 0;">
            <p style="font-size: 12px; color: #666;">Te enviaremos una notificación a tu celular para aprobar el pago.</p>
        `;
    }
}

function iniciarPago() {
    if (!usuarioActivo) {
        alert("Por favor, inicia sesión o regístrate para poder realizar la compra.");
        abrirAuth();
        return;
    }

    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de pagar.");
        return;
    }

    mostrarCamposPago();
    document.getElementById("modalPago").style.display = "flex";
    document.getElementById("paso-pago-1").style.display = "block";
    document.getElementById("paso-pago-2").style.display = "none";
    document.getElementById("paso-pago-3").style.display = "none";
}

function procesarPagoFinal() {
    document.getElementById("paso-pago-1").style.display = "none";
    document.getElementById("paso-pago-2").style.display = "block";

    // Simulamos la espera del banco (3 segundos)
    setTimeout(() => {
        document.getElementById("paso-pago-2").style.display = "none";
        document.getElementById("paso-pago-3").style.display = "block";

        // Registrar la factura en el historial general
        const nuevaFactura = {
            idFactura: Math.floor(Math.random() * 90000) + 10000,
            usuario: usuarioActivo.user,
            fecha: new Date().toLocaleDateString(),
            total: document.getElementById("precio-total").innerText,
            productosComprados: [...carrito]
        };

        historial.push(nuevaFactura);
        localStorage.setItem("pro_historial", JSON.stringify(historial));

        // Vaciar el carrito después de comprar
        carrito = [];
        guardarDatosLocales();
        actualizarCarritoUI();

    }, 3000);
}

// ==========================================================================
// 11. FUNCIONES AUXILIARES (NAVEGACIÓN, MODALES Y GUARDADO)
// ==========================================================================
function guardarDatosLocales() {
    localStorage.setItem("pro_inventario", JSON.stringify(inventario));
    localStorage.setItem("pro_carrito", JSON.stringify(carrito));
}

function mostrarSeccion(seccion) {
    document.getElementById("seccion-tienda").style.display = (seccion === 'tienda') ? 'block' : 'none';
    document.getElementById("seccion-admin").style.display = (seccion === 'admin') ? 'block' : 'none';
}

function cambiarStock(idProducto, nuevoValorStock) {
    const producto = inventario.find(p => p.id === idProducto);
    producto.stock = parseInt(nuevoValorStock);
    guardarDatosLocales();
    mostrarProductos(inventario);
}

function eliminarDelInventario(idProducto) {
    if (confirm("¿Estás seguro de eliminar este producto del inventario?")) {
        inventario = inventario.filter(p => p.id !== idProducto);
        guardarDatosLocales();
        renderAdmin();
        mostrarProductos(inventario);
    }
}

function toggleCarrito() { document.getElementById("carritoLateral").classList.toggle("activo"); }
function abrirPerfil() { document.getElementById("perfilLateral").classList.add("activo"); }
function cerrarPerfil() { document.getElementById("perfilLateral").classList.remove("activo"); }
function abrirAuth() { document.getElementById("modalAuth").style.display = "flex"; }
function cerrarAuth() { document.getElementById("modalAuth").style.display = "none"; }
function cerrarModalPago() { document.getElementById("modalPago").style.display = "none"; }