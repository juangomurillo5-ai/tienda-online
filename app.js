// ==========================================================================
// 1. BASE DE DATOS INICIAL (CON TUS LINKS ACTUALIZADOS)
// ==========================================================================
const productosOriginales = [
    { id: 1, nombre: "MacBook Pro M3", marca: "Apple", categoria: "laptops", precio: 12500000, stock: 5, img: "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202310/macbook-pro-024011822-16x9_0.png?VersionId=CKXbmiOLkA_16ma0JbaKUxCWDp1WgA3t&size=690:388", desc: "Chip M3 Max, 32GB RAM, Pantalla Liquid Retina XDR de 16 pulgadas." },
    { id: 2, nombre: "iPhone 15 Pro", marca: "Apple", categoria: "celulares", precio: 5800000, stock: 8, img: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708", desc: "Diseño en titanio aeroespacial, Chip A17 Pro, Sistema de cámaras Pro de 48MP." },
    { id: 3, nombre: "Samsung S24 Ultra", marca: "Samsung", categoria: "celulares", precio: 5200000, stock: 10, img: "https://i.blogs.es/232600/captura-de-pantalla-2024-01-17-a-la-s-11.20.03/1200_800.png", desc: "Inteligencia Artificial integrada, S-Pen incluido, Pantalla Dynamic AMOLED 2X de 120Hz." },
    { id: 4, nombre: "Sony WH-1000XM5", marca: "Sony", categoria: "accesorios", precio: 1500000, stock: 15, img: "https://www.soundphilereview.com/wp-content/uploads/2022/11/Sony-WH1000XM5-review.jpg", desc: "La mejor cancelación de ruido del mercado, hasta 30 horas de autonomía y sonido Hi-Res." },
    { id: 5, nombre: "Asus ROG Zephyrus", marca: "Asus", categoria: "laptops", precio: 8500000, stock: 3, img: "https://www.muycomputer.com/wp-content/uploads/2023/02/ASUS-ROG-Zephyrus-M16-2023.jpg", desc: "Tarjeta gráfica RTX 4070, Pantalla Nebula Display de 165Hz, Chasis ultra delgado de aluminio." },
    { id: 6, nombre: "Logitech G Pro X Superlight", marca: "Logitech", categoria: "accesorios", precio: 750000, stock: 20, img: "https://resource.logitechg.com/w_692,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-superlight/pro-x-superlight-black-gallery-1.png?v=1", desc: "Mouse inalámbrico para eSports, peso ultra ligero de 63 gramos." }
];

// ==========================================================================
// 2. ESTADOS Y PERSISTENCIA (LOCALSTORAGE)
// ==========================================================================
let inventario = JSON.parse(localStorage.getItem("pro_inventario")) || productosOriginales;
let carrito = JSON.parse(localStorage.getItem("pro_carrito")) || [];
let favoritos = JSON.parse(localStorage.getItem("pro_favoritos")) || [];
let historial = JSON.parse(localStorage.getItem("pro_historial")) || [];

// Base de datos de usuarios
let usuariosRegistrados = JSON.parse(localStorage.getItem("pro_db_usuarios")) || [
    { user: "admin", email: "admin@tienda.com", pass: "123456", rol: "admin" }
];
let usuarioActivo = JSON.parse(sessionStorage.getItem("pro_sesion")) || null;

// ==========================================================================
// 3. INICIALIZACIÓN
// ==========================================================================
window.onload = function() {
    actualizarInterfazUsuario();
    mostrarProductos(inventario);
    actualizarCarritoUI();
    renderAdmin();
};

function restablecerImagenes() {
    if(confirm("¿Estás seguro de restablecer el inventario a su estado original? Esto actualizará las imágenes y el stock.")){
        inventario = [...productosOriginales];
        localStorage.setItem("pro_inventario", JSON.stringify(inventario));
        location.reload();
    }
}

// ==========================================================================
// 4. RENDERIZADO DE TIENDA Y ADMIN
// ==========================================================================
function mostrarProductos(lista) {
    const contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = "";
    
    if (lista.length === 0) {
        contenedor.innerHTML = "<h2 style='grid-column: 1/-1; text-align:center;'>No se encontraron productos.</h2>";
        return;
    }

    lista.forEach(producto => {
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
                    <input type="number" value="${producto.stock}" style="width: 60px; padding: 5px; color: black;" onchange="cambiarStock(${producto.id}, this.value)">
                </td>
                <td>$${producto.precio.toLocaleString()}</td>
                <td>
                    <button onclick="eliminarDelInventario(${producto.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function buscarProductos(texto) {
    const busqueda = texto.toLowerCase();
    const filtrados = inventario.filter(p => 
        p.nombre.toLowerCase().includes(busqueda) || p.marca.toLowerCase().includes(busqueda) || p.desc.toLowerCase().includes(busqueda)
    );
    mostrarProductos(filtrados);
}

function filtrarCategoria(categoria) {
    if (categoria === 'todos') mostrarProductos(inventario);
    else mostrarProductos(inventario.filter(p => p.categoria === categoria));
}

// ==========================================================================
// 5. DETALLES DEL PRODUCTO
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

function cerrarModalDetalle() { document.getElementById("modalDetalle").style.display = "none"; }

// ==========================================================================
// 6. LÓGICA DEL CARRITO
// ==========================================================================
function agregarAlCarrito(id) {
    const producto = inventario.find(p => p.id === id);
    if (producto.stock > 0) {
        producto.stock--;
        carrito.push({...producto});
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
    productoEnInventario.stock++;
    carrito.splice(index, 1);
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
                <div><strong>${producto.nombre}</strong><br><small>$${producto.precio.toLocaleString()}</small></div>
                <button onclick="quitarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:16px;">X</button>
            </li>
        `;
    });
    
    labelTotal.innerText = total.toLocaleString();
    contadorCarrito.innerText = `🛒 ${carrito.length}`;
}

// ==========================================================================
// 7. FAVORITOS Y PERFIL
// ==========================================================================
function toggleFavorito(id) {
    if (favoritos.includes(id)) favoritos = favoritos.filter(favId => favId !== id);
    else favoritos.push(id);
    localStorage.setItem("pro_favoritos", JSON.stringify(favoritos));
    mostrarProductos(inventario);
}

function verFavoritos() {
    const contenedorPerfil = document.getElementById("detalle-perfil-dinamico");
    const misProductosFavoritos = inventario.filter(producto => favoritos.includes(producto.id));
    
    if (misProductosFavoritos.length === 0) {
        contenedorPerfil.innerHTML = "<p style='padding:15px;'>Aún no tienes productos favoritos.</p>";
    } else {
        contenedorPerfil.innerHTML = "<h4 style='padding:0 15px;'>Mis Favoritos:</h4>" + misProductosFavoritos.map(producto => `
            <div style="padding: 15px; border-bottom: 1px solid #333; display: flex; align-items: center; gap: 10px;">
                <img src="${producto.img}" style="width: 50px; height: 50px; border-radius: 5px; background: white;">
                <div><strong>${producto.nombre}</strong><br><span style="color:#00cec9;">$${producto.precio.toLocaleString()}</span></div>
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
    
    const misCompras = historial.filter(factura => factura.usuario === usuarioActivo.user);
    if (misCompras.length === 0) {
        contenedorPerfil.innerHTML = "<p style='padding:15px;'>Aún no has realizado ninguna compra.</p>";
    } else {
        contenedorPerfil.innerHTML = "<h4 style='padding:0 15px;'>Mis Compras:</h4>" + misCompras.map(factura => `
            <div style="background: #222; padding: 15px; border-radius: 8px; margin: 10px; border-left: 4px solid #00cec9;">
                <strong>Orden #${factura.idFactura}</strong><br>
                <small>Fecha: ${factura.fecha}</small><br>
                <span style="font-weight:bold; display:block; margin-top:5px; margin-bottom:10px;">Total pagado: $${factura.total}</span>
                <button onclick="abrirFactura(${factura.idFactura})" style="background:#0984e3; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer; width:100%;">Ver Factura Detallada</button>
            </div>
        `).join("");
    }
}

// ==========================================================================
// 8. SISTEMA DE USUARIOS Y VALIDACIONES REALISTAS
// ==========================================================================
function cambiarAuthTab(tipo) {
    const tabLog = document.getElementById("tabLogin");
    const tabReg = document.getElementById("tabRegistro");
    const formLog = document.getElementById("formLogin");
    const formReg = document.getElementById("formRegistro");

    if (tipo === 'login') {
        tabLog.classList.add("tab-active"); tabReg.classList.remove("tab-active");
        formLog.style.display = "block"; formReg.style.display = "none";
    } else {
        tabReg.classList.add("tab-active"); tabLog.classList.remove("tab-active");
        formReg.style.display = "block"; formLog.style.display = "none";
    }
}

function validarEmail(email) {
    // Expresión regular para obligar a usar formato de dominio real (ej. algo@dominio.com)
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function ejecutarRegistro() {
    const u = document.getElementById("regUser").value.trim();
    const e = document.getElementById("regEmail").value.trim();
    const p = document.getElementById("regPass").value.trim();

    if (!u || !e || !p) return alert("Por favor, llena todos los campos.");
    if (u.length < 4) return alert("El nombre de usuario debe tener al menos 4 caracteres.");
    if (!validarEmail(e)) return alert("El correo electrónico no es válido. Asegúrate de incluir un '@' y un dominio real (.com, .net, etc).");
    if (p.length < 6) return alert("La contraseña debe tener al menos 6 caracteres por seguridad.");
    
    const usuarioExiste = usuariosRegistrados.find(user => user.user === u || user.email === e);
    if (usuarioExiste) return alert("Este nombre de usuario o correo ya está registrado.");

    usuariosRegistrados.push({ user: u, email: e, pass: p, rol: "cliente" });
    localStorage.setItem("pro_db_usuarios", JSON.stringify(usuariosRegistrados));
    
    alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
    cambiarAuthTab('login');
}

function ejecutarLogin() {
    const u = document.getElementById("logUser").value.trim();
    const p = document.getElementById("logPass").value.trim();

    const encontrado = usuariosRegistrados.find(user => user.user === u && user.pass === p);
    if (encontrado) {
        usuarioActivo = encontrado;
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
    location.reload(); 
}

function actualizarInterfazUsuario() {
    const contenedorUserInfo = document.getElementById("userInfo");
    const botonAdmin = document.getElementById("btnAdmin");

    if (usuarioActivo) {
        contenedorUserInfo.innerText = "👤 " + usuarioActivo.user;
        if (usuarioActivo.rol === "admin") botonAdmin.style.display = "inline-block";
        else botonAdmin.style.display = "none";
    } else {
        contenedorUserInfo.innerText = "Invitado";
        botonAdmin.style.display = "none";
    }
}

// ==========================================================================
// 9. PROCESO DE PAGO CON VALIDACIONES Y CLAVE DINÁMICA
// ==========================================================================
function mostrarCamposPago() {
    const metodo = document.getElementById("selectorPago").value;
    const cont = document.getElementById("formulario-dinamico-pago");
    
    if (metodo === "tarjeta") {
        cont.innerHTML = `
            <input type="text" id="pago-t-num" placeholder="Número de Tarjeta (16 dígitos exactos)" maxlength="16">
            <div style="display:flex; gap:10px;">
                <input type="text" id="pago-t-fecha" placeholder="MM/AA" maxlength="5">
                <input type="password" id="pago-t-cvv" placeholder="CVV (3 dígitos)" maxlength="3">
            </div>
            <input type="text" id="pago-t-nombre" placeholder="Nombre como aparece en la tarjeta">
        `;
    } else if (metodo === "pse") {
        cont.innerHTML = `
            <select id="pago-pse-banco">
                <option value="">Selecciona tu Banco...</option>
                <option value="bancolombia">Bancolombia</option>
                <option value="davivienda">Davivienda</option>
                <option value="bogota">Banco de Bogotá</option>
            </select>
            <input type="email" id="pago-pse-email" placeholder="Correo electrónico registrado en PSE">
        `;
    } else if (metodo === "nequi") {
        cont.innerHTML = `
            <input type="text" id="pago-n-cel" placeholder="Número de Celular (10 dígitos)" maxlength="10">
            <input type="password" id="pago-n-clave" placeholder="Clave Dinámica (6 dígitos numéricos)" maxlength="6" style="border: 1px solid #00b894; background: #e8f8f5;">
            <p style="font-size: 11px; color: #666; margin-top: 5px;">Abre tu App Nequi, ve a la tarjeta y genera la clave dinámica de 6 dígitos.</p>
        `;
    }
}

function iniciarPago() {
    if (!usuarioActivo) {
        alert("Por favor, inicia sesión o regístrate para poder realizar la compra.");
        abrirAuth();
        return;
    }
    if (carrito.length === 0) return alert("Tu carrito está vacío. Agrega productos antes de pagar.");

    mostrarCamposPago();
    document.getElementById("modalPago").style.display = "flex";
    document.getElementById("paso-pago-1").style.display = "block";
    document.getElementById("paso-pago-2").style.display = "none";
    document.getElementById("paso-pago-3").style.display = "none";
}

function procesarPagoFinal() {
    const metodo = document.getElementById("selectorPago").value;

    // ----- VALIDACIONES ANTES DE PAGAR -----
    if (metodo === "tarjeta") {
        const num = document.getElementById("pago-t-num").value;
        const fecha = document.getElementById("pago-t-fecha").value;
        const cvv = document.getElementById("pago-t-cvv").value;
        const nom = document.getElementById("pago-t-nombre").value;
        
        if (num.length !== 16 || isNaN(num)) return alert("El número de tarjeta debe tener exactamente 16 dígitos numéricos.");
        if (fecha.length < 4 || !fecha.includes("/")) return alert("La fecha debe tener formato MM/AA.");
        if (cvv.length !== 3 || isNaN(cvv)) return alert("El CVV debe tener exactamente 3 dígitos.");
        if (nom.length < 3) return alert("Ingresa el nombre completo del titular.");
    } 
    else if (metodo === "pse") {
        const banco = document.getElementById("pago-pse-banco").value;
        const email = document.getElementById("pago-pse-email").value;
        
        if (banco === "") return alert("Debes seleccionar un banco de la lista.");
        if (!validarEmail(email)) return alert("Ingresa un correo válido para el proceso PSE.");
    } 
    else if (metodo === "nequi") {
        const cel = document.getElementById("pago-n-cel").value;
        const clave = document.getElementById("pago-n-clave").value;
        
        if (cel.length !== 10 || isNaN(cel)) return alert("El número de celular de Nequi/Daviplata debe tener 10 dígitos numéricos.");
        if (clave.length !== 6 || isNaN(clave)) return alert("La Clave Dinámica es obligatoria y debe tener 6 dígitos numéricos. Revisa tu App.");
    }

    // Si pasa las validaciones, procedemos
    document.getElementById("paso-pago-1").style.display = "none";
    document.getElementById("paso-pago-2").style.display = "block";

    setTimeout(() => {
        document.getElementById("paso-pago-2").style.display = "none";
        document.getElementById("paso-pago-3").style.display = "block";

        const nuevaFactura = {
            idFactura: Math.floor(Math.random() * 900000) + 100000,
            usuario: usuarioActivo.user,
            emailUsuario: usuarioActivo.email,
            fecha: new Date().toLocaleString(),
            metodoPago: metodo.toUpperCase(),
            total: document.getElementById("precio-total").innerText,
            productosComprados: [...carrito]
        };

        historial.push(nuevaFactura);
        localStorage.setItem("pro_historial", JSON.stringify(historial));

        carrito = [];
        guardarDatosLocales();
        actualizarCarritoUI();

    }, 2500);
}

// ==========================================================================
// 10. VISOR DE FACTURAS
// ==========================================================================
function abrirFactura(idFactura) {
    const factura = historial.find(f => f.idFactura === idFactura);
    if (!factura) return;

    const contenido = document.getElementById("contenido-factura");
    
    // Generar la lista de items comprados para la factura
    let itemsHTML = factura.productosComprados.map(p => `
        <div style="display:flex; justify-content:space-between; border-bottom: 1px dashed #ccc; padding: 5px 0;">
            <span>1x ${p.nombre}</span>
            <span>$${p.precio.toLocaleString()}</span>
        </div>
    `).join("");

    contenido.innerHTML = `
        <div style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <h2>TECH STORE PRO</h2>
            <p style="margin:0;">NIT: 901.234.567-8</p>
            <p style="margin:0;">Bogotá, Colombia</p>
        </div>
        
        <p><strong>Factura de Venta Electrónica:</strong> #${factura.idFactura}</p>
        <p><strong>Fecha y Hora:</strong> ${factura.fecha}</p>
        <p><strong>Cliente:</strong> ${factura.usuario}</p>
        <p><strong>Correo:</strong> ${factura.emailUsuario}</p>
        <p><strong>Método de Pago:</strong> ${factura.metodoPago}</p>
        
        <div style="margin: 20px 0; border: 1px solid #000; padding: 10px;">
            <h4 style="margin-top:0;">Detalle de la compra:</h4>
            ${itemsHTML}
        </div>
        
        <div style="text-align: right; font-size: 18px;">
            <strong>TOTAL PAGADO: $${factura.total}</strong>
        </div>
        
        <div style="text-align:center; margin-top: 30px; font-size: 12px; color: #555;">
            <p>*** GRACIAS POR SU COMPRA ***</p>
            <p>Este documento es equivalente a una factura de venta oficial.</p>
        </div>
    `;

    document.getElementById("modalFactura").style.display = "flex";
}

function cerrarFactura() { document.getElementById("modalFactura").style.display = "none"; }

// ==========================================================================
// 11. FUNCIONES AUXILIARES 
// ==========================================================================
function guardarDatosLocales() {
    localStorage.setItem("pro_inventario", JSON.stringify(inventario));
    localStorage.setItem("pro_carrito", JSON.stringify(carrito));
}

function mostrarSeccion(seccion) {
    document.getElementById("seccion-tienda").style.display = (seccion === 'tienda') ? 'block' : 'none';
    document.getElementById("seccion-admin").style.display = (seccion === 'admin') ? 'block' : 'none';
}

function cambiarStock(idProducto, nuevoStock) {
    inventario.find(p => p.id === idProducto).stock = parseInt(nuevoStock);
    guardarDatosLocales();
    mostrarProductos(inventario);
}

function eliminarDelInventario(idProducto) {
    if (confirm("¿Eliminar este producto permanentemente del catálogo?")) {
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