let carrito = [];

// lo siguiente es para obtener los datos del carrito almacenados en localStorage
if (localStorage.getItem('carrito')) {
  carrito = JSON.parse(localStorage.getItem('carrito'));
}

let data = []; // Variable para almacenar los datos de los productos

const container = document.getElementById("container");
const carroElement = document.getElementById("carrito-body");

const getProductos = async () => {
  const response = await fetch("data.json");
  data = await response.json();

  for (let i = 0; i < data.length; i++) {
    // Recorremos con length (for.each servia tambien) para ir creando los productos y dar formato en el html
    let divProducto = document.createElement("div");
    let imagen = document.createElement("img");
    let nombre = document.createElement("h3");
    let precio = document.createElement("p");
    let boton = document.createElement("button");

    // Asigno los valores que correspondan a los elementos
    imagen.src = data[i][4];
    nombre.textContent = data[i][1];
    precio.textContent = "Precio: " + data[i][2];
    boton.textContent = "Añadir al carrito";
    boton.className = "btn-add-to-cart";

    // Agrego los elementos al div de los producto
    divProducto.appendChild(imagen);
    divProducto.appendChild(nombre);
    divProducto.appendChild(precio);
    divProducto.appendChild(boton);

    // Agrego los div de los producto al contenedor
    container.appendChild(divProducto);

    //evento para que sepa que hacer al clickar el boton
    boton.addEventListener(
      "click",
      (function (producto, index) {
        return function () {
          if (parseInt(data[index][3].split(": ")[1]) > 0) {
            let foundIndex = carrito.findIndex((item) => item[0] === producto[0]);
            if (foundIndex !== -1) {
              carrito[foundIndex][5] += 1;
            } else {
              carrito.push([...producto, 1]); // Agregar la cantidad al producto en el carrito
            }
            data[index][3] = "stock: " + (parseInt(data[index][3].split(": ")[1]) - 1);
            console.log("Producto añadido al carrito:", producto);
            Swal.fire("¡Producto agregado!", "¡Tu producto se agregó con éxito bell@!", "success");
            if (parseInt(data[index][3].split(": ")[1]) === 0) {
              Swal.fire("¡Sin stock!", "No hay más stock disponible de este producto.", "warning");
              boton.disabled = true; // esto es para deshabilitar el boton cuando no hay stock
            }
            mostrarCarrito();
            mostrarStock();

            // Para actualizar localStorage con los datos del carrito
            localStorage.setItem("carrito", JSON.stringify(carrito));
            localStorage.setItem("productos", JSON.stringify(data));
          } else {
            Swal.fire("Sin stock hermos@!", "No hay más stock disponible de este producto.", "warning");
            boton.disabled = true; // deshabilitamos boton aca tambien
          }
        };
      })(data[i], i)
    );
  }
};

getProductos();

function mostrarCarrito() {
  carroElement.innerHTML = "";

  carrito.forEach((producto) => {
    let [id, nombre, precio, stock, imagen, cantidad] = producto;

    let productoDiv = document.createElement("div");
    productoDiv.className = "producto";

    let productoImgDiv = document.createElement("div");
    productoImgDiv.className = "producto-img";

    let imagenElement = document.createElement("img");
    imagenElement.src = imagen;
    productoImgDiv.appendChild(imagenElement);

    let nombreElement = document.createElement("h3");
    nombreElement.textContent = nombre;
    productoDiv.appendChild(productoImgDiv);
    productoDiv.appendChild(nombreElement);

    let precioElement = document.createElement("p");
    precioElement.textContent = "Precio: " + parseInt(precio.split("$")[0]) * cantidad + "$";
    productoDiv.appendChild(precioElement);

    let cantidadElement = document.createElement("p");
    cantidadElement.textContent = "Cantidad: " + cantidad; // Mostrar la cantidad del producto en el carrito
    productoDiv.appendChild(cantidadElement);

    let buttonsDiv = document.createElement("div");
    buttonsDiv.className = "buttons-container";

    let incrementButton = document.createElement("button");
    incrementButton.textContent = "+";
    incrementButton.className = "btn-increment";
    incrementButton.addEventListener("click", function () {
      incrementarCantidad(id, stock);
    });
    buttonsDiv.appendChild(incrementButton);

    let decrementButton = document.createElement("button");
    decrementButton.textContent = "-";
    decrementButton.className = "btn-decrement";
    decrementButton.addEventListener("click", function () {
      decrementarCantidad(id, stock);
    });
    buttonsDiv.appendChild(decrementButton);

    productoDiv.appendChild(buttonsDiv);

    carroElement.appendChild(productoDiv);
  });

  // aplicamos el estilo aca
  carroElement.style.display = "flex";
  carroElement.style.flexWrap = "nowrap";
  carroElement.style.overflowX = "auto";
  carroElement.style.maxWidth = "100%";

  // llamamos al elemnto por su id 
  const totalPrecioElement = document.getElementById('total-price');

  // esto es para actualizar el texto del costo total
  totalPrecioElement.textContent = "El precio final es: " + calcularPrecioTotal() + "$";
}

function mostrarStock() {
  let productosElement = document.getElementById("container").querySelectorAll(".producto");

  productosElement.forEach((productoElement, index) => {
    let stockElement = productoElement.querySelector("p:nth-child(3)");
    stockElement.textContent = "Stock: " + data[index][3].split(": ")[1];
  });
}

function incrementarCantidad(id, stock) {
  let foundIndex = carrito.findIndex(item => item[0] === id);
  if (foundIndex !== -1) {
    if (parseInt(data[foundIndex][3].split(": ")[1]) > 0) {
      if (carrito[foundIndex][5] < parseInt(data[foundIndex][3].split(": ")[1])) {
        carrito[foundIndex][5] += 1;
        data[foundIndex][3] = "stock: " + (parseInt(data[foundIndex][3].split(": ")[1]) - 1);
        mostrarCarrito();
        mostrarStock();
        Swal.fire("¡Producto agregado!", "¡Tu producto se agregó con éxito bell@!", "success");
        localStorage.setItem('carrito', JSON.stringify(carrito));
        localStorage.setItem('productos', JSON.stringify(data));
      } else {
        Swal.fire("¡Sin stock!", "No hay más stock disponible de este producto.", "warning");
      }
      const totalPrecioElement = document.getElementById('total-price');
      totalPrecioElement.textContent = "El precio final es: " + calcularPrecioTotal() + "$";
    } else {
      Swal.fire("¡Sin stock!", "No hay más stock disponible de este producto.", "warning");
    }
  }
}

//aca el otro boton para restar producto desde el carrito y si 1 solo elimina el producto
function decrementarCantidad(id, stock) {
  let foundIndex = carrito.findIndex(item => item[0] === id);
  if (foundIndex !== -1) {
    if (carrito[foundIndex][5] > 1) {
      carrito[foundIndex][5] -= 1;
      data[foundIndex][3] = "stock: " + (parseInt(data[foundIndex][3].split(": ")[1]) + 1);
    } else {
      carrito.splice(foundIndex, 1);
    }
    mostrarCarrito();
    mostrarStock();
    Swal.fire("Producto eliminado!", "Lo devolvimos al stock por vos bombon! 😉", "info");
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('productos', JSON.stringify(data));
    const totalPrecioElement = document.getElementById('total-price');
    totalPrecioElement.textContent = "El precio final es: " + calcularPrecioTotal() + "$";
  }
}

//funcion para calcular el precio total
function calcularPrecioTotal() {
  let total = 0;
  carrito.forEach((producto) => {
    let [id, nombre, precio, stock, imagen, cantidad] = producto;
    total += parseInt(precio.split("$")[0]) * cantidad;
  });
  return total;
}

const btnVerCarrito = document.getElementById('btnVerCarrito');
const carro = document.getElementById('carro');

// Agregué un evento de clic al botón "Ver Carrito" para visualizarlo obvio jaja
btnVerCarrito.addEventListener('click', () => {
  // con esto cambiamos la visibilidad del carrito si queremos verlo o no
  if (carro.style.display === 'none') {
    carro.style.display = 'block';
  } else {
    carro.style.display = 'none';
  }
});

// referenciamos al boton confirmar comprar por medio del ID
const btnConfirmarCompra = document.getElementById('btnConfirmarCompra');

// otro evento de clic al botón "Confirmar la compra con sus respectivos mensajes"
btnConfirmarCompra.addEventListener('click', () => {
  //esto para limpiar el carrito y el localStorage
  carrito = [];
  localStorage.removeItem('carrito');
  localStorage.removeItem('productos');

  Swal.fire("Felicidades mi rey/reina!", "Espero que crees los looks mas alocados y hermosos!", "success");

  // para actualizar el carrito y el stock en la página
  mostrarCarrito();
  mostrarStock();
});

// Obtenemos la referencia al botón "Limpiar carrito" con el ID otra vez
const btnLimpiarCarrito = document.getElementById('btnLimpiarCarrito');

btnLimpiarCarrito.addEventListener('click', () => {
  carrito = [];
  localStorage.removeItem('carrito');
  localStorage.removeItem('productos');

  Swal.fire("Se borraron...", "Pobres productos... pero se borraron con exito!", "info");

  mostrarCarrito();
  mostrarStock();
});

// Mostrar el carrito y el stock en la página al cargar
mostrarCarrito();
mostrarStock();
