const ITEM_CART = 'carrito';
const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/**
 * definición de conceptos
 * @typedef {object} concepto
 * @property {number} id
 * @property {string} Concepto
 * @property {string} nombre
 * @property {number} Ejercicio
 */

/**
 * definición vehiculo
 * @typedef {object} vehiculo
 * @property {string} serie
 * @property {concepto[]} conceptos
 */

/**
 * 
 * @typedef {object} diversos
 * @property {string} id
 * @property {string} serie
 * @property {object} vista
 * @property {string} vista.titulo
 * @property {string} vista.descripcion
 * @property {number} vista.importeTotal
 * @property {object[]} cuentas
 * @property {number} cuentas.cuenta
 * @property {number} cuentas.cantidad
 * @property {number} cuentas.importe
 * @property {number} cuentas.ejercicio
 * @property {object[]} objectFree
 */

/**
 * Parametros del carrito
 * @typedef {object} cart
 * @property {number} cart.cajero
 * @property {number} cart.caja
 * @property {number} cart.oficina
 * @property {object} cart.conceptos
 * @property {vehiculo[]} cart.conceptos.vehiculos
 * @property {diversos[]} cart.conceptos.otros
 */

/**
 * retorna toda la información del carrito
 * @returns {cart}
 */
const getDataCart = () => JSON.parse(localStorage.getItem(ITEM_CART));

/**
 * En caso de no existir el carrito se inicialara
 * si ya existe simplemente regresara la informaciÃ³n
 * que contiene en ese momento.
 * @param {object} cart -carrito
 * @param {number} cart.cajero -carrito
 * @param {number} cart.caja -carrito
 * @param {number} cart.oficina -carrito
 * 
 * @returns {object}
 */
function initCarrito(cart) {

  if (!getDataCart()) {
    console.log('No se encontro registro de carrito');
    let IdCaja = $('#IdCaja').val();
    let UsuCajero = $('#UsuCajero').val();
    let IdOficina = $('#IdOficina').val();
    localStorage.setItem(ITEM_CART, JSON.stringify({ IdCaja, UsuCajero, IdOficina }));
  }
  return getDataCart();
}

/**
 * 
 * @param {cart} cart 
 */
const setStorage = (cart) => localStorage.setItem(ITEM_CART, JSON.stringify(cart));

/**
 * 
 * @param {string} serie 
 * @param {object[]} concepts 
 * @returns {string|boolean}
 */
function addVehiculo(serie, concepts, info, placa, clase, Tplaca, Propietario) { //TODO: Revisar el uso de variable infoNew, por que parece no ser usada
  console.log('agregando vehiculo')
  let conceptNew;
  let infoNew;
  if (Array.isArray(concepts)) conceptNew = concepts;
  else if (typeof concepts === "object") conceptNew = [concepts];
  else return 'error el concepto no es objecto ni array';

  if (Array.isArray(info)) infoNew = info;
  else if (typeof info === "object") infoNew = [info];
  else return 'error el concepto no es objecto ni array';

  const currentCart = getDataCart();

  /**
      * @type {cart}
  */
  let newcarrito;
  if (!currentCart.conceptos) newcarrito = { ...currentCart, conceptos: { vehiculos: [{ serie, conceptos: [...conceptNew], InfoV: [...infoNew], placa, clase, Tplaca, Propietario }] } };

  else {
    const vehiculosOld = currentCart.conceptos.vehiculos;
    const index = currentCart.conceptos.vehiculos.findIndex(v => v.serie === serie);
    console.log('intentando agregar cuando existe', index)

    if (index != -1) {
      console.log('existe la serie en vehiculo')
      currentCart.conceptos.vehiculos.splice( index,1,{serie, conceptos:[...conceptNew], InfoV: [...infoNew], placa, clase, Tplaca, Propietario });
      newcarrito = currentCart;
    }
    else {
      currentCart.conceptos.vehiculos.push({ serie, conceptos: [...conceptNew], InfoV: [...infoNew], placa, clase, Tplaca, Propietario });
      newcarrito = currentCart;
      // newcarrito = { ...currentCart, conceptos: { ...currentCart.conceptos, vehiculos: [...vehiculosOld, { serie, conceptos: [...conceptNew], InfoV: [...infoNew], placa, clase, Tplaca, Propietario }], } };
      // console.log('entra en else= ', newcarrito);
    }
    console.log('carricuto nuevo', newcarrito);
  }
  setStorage(newcarrito);
  return true;
}

/**
 * Obtiene el ultimo año del vehiculo
 * si el vehiculo no tiene tenencia, retornara 0  
 * @param {string} serie 
 * @returns {number}
 */
function getLastYearVehiculo(serie) {
  const vehiculo = findSerie(serie);
  if (!vehiculo) return;

  const years = Array.from(vehiculo.conceptos, c => c.Concepto === 'TENENCIA' ? c.Ejercicio : 0);
  const lastYear = Math.max(...years);
  return lastYear;
}

/**
 * busca un vehiculo por la serie
 * @param {string} serie 
 * @returns {vehiculo | undefined}
 */
function findSerie(serie) {
  if (typeof serie !== 'string') return;
  const cart = getDataCart();
  if (!cart.conceptos || !cart.conceptos.vehiculos) return;
  const vehiculo = cart.conceptos.vehiculos.find(e => e.serie === serie);
  return vehiculo;
}

function addConcept(concepts) {
  console.log(concepts)
  // validaciones
  let conceptNew;
  if (Array.isArray(concepts)) conceptNew = concepts;
  else if (typeof concepts === "object") conceptNew = [concepts];
  else return 'error el concepto no es objecto ni array';

  let carrito = getDataCart();
  /**
   * @type {cart}
   */
  let newcarrito;
  if (!carrito.conceptos) newcarrito = { ...carrito, conceptos: { otros: [...conceptNew] } };
  else {
    const conceptsOld = carrito.conceptos.otros;
    newcarrito = { ...carrito, conceptos: { otros: [...conceptsOld, ...conceptNew] } };
  }
  setStorage(newcarrito);
  return true;
}

/**
 * retorna la cantidad de conceptos en el carrito
 * @returns {number}
 */
function getNumConcepts() {
  const cart = getDataCart();
  if (!cart.conceptos) {
    return 0;
  }
  let suma = 0;
  if (cart.conceptos.vehiculos) {
    suma += cart.conceptos.vehiculos.length;
  }
  if (cart.conceptos.otros) {
    suma += cart.conceptos.otros.length;
  }
  return suma;
}

/**
 * Se agrega un nuevo elemento al carrito
 * acepta cualquier tipo de dato
 * @param {*} item 
 * @returns {object}
 */
function addItemCart(item, nameitem) {
  const cart = getDataCart();
  localStorage.setItem(ITEM_CART, JSON.stringify({ ...cart, [nameitem]: item }));
  return { ...cart, item };
}

/**
 * Elimina un item con el nombre proporcionado
 * @param {string} item nombre del item a eliminar
 */
function deleteItem(item) {
  const cart = getDataCart();
  if (!cart[item]) {
    console.log('Item no encontrado')
    return;
  }
  delete cart[item];

  setStorage(cart);
  console.log('Item eliminado')
}

function deleteConceptVehiculo(serie) {
  const cart = getDataCart();

  // buscando el elemento dentro de conecptos
  let index = -1;
  let indexOtros = -1;
  if (cart.conceptos.vehiculos) {
    index = cart.conceptos.vehiculos.findIndex(e => e.serie === serie);
    if (index != -1) {
      cart.conceptos.vehiculos.splice(index, 1);
    }
  }
  if (cart.conceptos.otros) {
    indexOtros = cart.conceptos.otros.findIndex(e => e.id === serie);
    if (indexOtros != -1) {
      cart.conceptos.otros.splice(indexOtros, 1);
    }
  }

  if (index == -1 && indexOtros == -1) {
    console.log('Elemento no existe en el carrito');
    return;
  }
  setStorage(cart);
  console.log('Elementos eliminados');
  return cart;
}
/**
 * 
 * @param {diversos} object 
 * @returns 
 */
function addDiversos(object) {
  let cart = getDataCart();

  if (!object.id) {
    console.log('Falta el dato id');
    return;
  }
  if (!cart.conceptos || !cart.conceptos.otros) cart = { ...cart, conceptos: { ...cart.conceptos, otros: [object] } }
  else cart.conceptos.otros.push(object);

  setStorage(cart);
}

function addObjeFree(id, object) {
  const cart = getDataCart();
  const index = cart.conceptos.otros.findIndex(e => e.id === id);
  if (index == -1) {
    console.log('No existe el idBuscado');
    return;
  }

  cart.conceptos.otros[index].objectFree.push(object);
  setStorage(cart);
}

/**
 * busca si una serie pertenece a publico
 * basado en las cuentas [13600, 13750, 13711]
 * y si es correspondiente al año en curso
 * @param {string} serie 
 * @returns {boolean}
 */
function findSeriePublic(serie) {
  const cuentas = [13600, 13750, 13711];
  const cart = getDataCart();
  
  if (!cart.conceptos || !cart.conceptos.otros) {
    console.log('No hay elementos donde buscar');
    return false;
  }
  // TODO: validar si pertenece al año actual
  const year = new Date().getFullYear();
  
  return cart.conceptos.otros.find((v) => v.serie === serie).cuentas.some(c => (cuentas.includes(c.cuenta) && c.ejercicio === `${year}`));
}

function cleanCart() {
  localStorage.removeItem(ITEM_CART);
}

function deleteConcept(id) {
  const divTabla = document.getElementById('Contenidopago');
  divTabla.removeChild(document.getElementById(id));
}

/**
 * Removera completamente el elemento de la vista
 * al igual que eliminará el elemnto del localStorage
 * @param {string} id elemento a eliminar
 */
function removeElementCart(id) {
  const { conceptos: { vehiculos, otros } } = deleteConceptVehiculo(id);
  document.getElementById('main').removeChild(document.getElementById(id));
  // const { conceptos: { vehiculos } } = getDataCart();

  // Calculando el nuevo total
  let importetotal = 0;
  if (vehiculos) {
    for (const { conceptos } of vehiculos) {
      for (const { TotalPagar } of conceptos) {
        importetotal += TotalPagar;
      }
    }
  }
  if(otros){
    for (const { vista } of otros) {
      importetotal += vista.importeTotal;
    }
  }

  document.getElementById('TotalFinal').textContent = formatter.format(importetotal);
  updateNumCart();
}

function updateNumCart() {
  const element = document.getElementById('countCart');
  if (element != null) {
    element.textContent = getNumConcepts();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Invocamos cada 5 segundos ;)
  const milisegundos = .1 * 1000;
  setInterval(function () {
    // No esperamos la respuesta de la petición porque no nos importa
    updateNumCart()
  }, milisegundos);
});

/**
 * ========================================================================
 */

function createViewCart() {

  const main = document.getElementById('main');
  const { conceptos: { vehiculos, otros } } = getDataCart();

  let totalfinal = 0;
  if (vehiculos) {
    for (const concepto of vehiculos) {
      let importetotal = 0;
      let ejercicios = "";
      for (const conceptVehiculo of concepto.conceptos) {
        if (conceptVehiculo.Concepto == "TENENCIA") {
          ejercicios += `${conceptVehiculo.Ejercicio},`;
        }
        importetotal += conceptVehiculo.TotalPagar;
      }
      main.appendChild(createRow(concepto.serie, "TenenciaParticular", ejercicios, concepto.Propietario, "Serie:" + concepto.serie + ";Placa:" + concepto.placa, 1, formatter.format(importetotal)));
      totalfinal += importetotal;
    }
  }
  if (otros) {
    for (const { id, vista } of otros) {
      main.appendChild(createRow(id, vista.titulo, vista.descripcion, '', '', 1, formatter.format(vista.importeTotal)));
      totalfinal += vista.importeTotal;
    }
  }
  document.getElementById('TotalFinal').textContent = formatter.format(totalfinal);
}

/**
 * crea la fila con para la vista y con lo necesario para poder eliminar, actualmente
 * esta adaptado para vehiculos con su serie
 * @param {string} id identificador de la fila (actualmente serie vehiculo)
 * @param {number} cantidad elementos con el mismo concepto
 * @param {string} subData 
 * @param {string} dataExtra 
 * @param {string} dataExtra2
 * @param {number} cantidad
 * @param {number} importe
 * @param {number} importe total del importe
 * @returns {HTMLDivElement}
 */
const createRow = (id, concepto = '', subData = '', dataExtra = '', dataExtra2 = '', cantidad = 1, importe = 0) => {
  const rowPrincipal = document.createElement('div');
  rowPrincipal.className = 'row d-flex justify-content-center border-top';
  rowPrincipal.id = id;

  const nombreConcepto = nameConcept(concepto, subData, dataExtra, dataExtra2);
  const moreData = extraData(id, cantidad, importe);

  rowPrincipal.appendChild(nombreConcepto);
  rowPrincipal.appendChild(moreData);
  return rowPrincipal;
}
/**
 * 
 * @param {string} data1 concepto
 * @param {string} data2 dato extra del concepto
 * @returns {HTMLElement}
 */
const nameConcept = (data1 = 'data1', data2 = 'data2', data3 = 'data3', data4 = 'data4') => {
  const div = document.createElement('div');
  div.className = 'col-5';

  const divRow = document.createElement('div');
  divRow.className = 'row d-flex';


  // el que contendra el nombre y demas datos de tenencia
  const divContenedor = document.createElement('div');
  divContenedor.className = 'my-auto flex-column d-flex pad-left';

  let h6 = document.createElement('h6');
  h6.className = 'mob-text';
  h6.textContent = data1;

  let p = document.createElement('p');
  p.className = 'mob-text';
  p.textContent = data2;
  divContenedor.appendChild(h6);
  divContenedor.appendChild(p);
  divRow.appendChild(divContenedor);

  const divNombre = document.createElement('div');
  divNombre.className = 'ml-5 flex-column d-flex pad-left';

  h6 = document.createElement('h6');
  h6.className = 'mob-text prueba';
  h6.textContent = data3;

  p = document.createElement('p');
  p.className = 'mob-text prueba';
  p.textContent = data4;

  divNombre.appendChild(h6);
  divNombre.appendChild(p);

  divRow.appendChild(divNombre);
  div.appendChild(divRow);

  return div;
}

const extraData = (id, cantidad, importe = '0') => {
  const divPrincipal = document.createElement('div');
  divPrincipal.className = 'my-auto col-7';

  const divRow = document.createElement('div');
  divRow.className = 'row text-right';

  const divCol = document.createElement('div');
  divCol.className = 'col-4';


  // el que contendra el nombre y demas datos de tenencia
  const divContenedor1 = document.createElement('div');
  divContenedor1.className = 'row d-flex justify-content-end px-3';

  const p = document.createElement('p');
  p.className = 'mb-0';
  p.id = 'cnt1';
  p.textContent = cantidad;

  divContenedor1.appendChild(p);
  divCol.appendChild(divContenedor1);
  divRow.appendChild(divCol);

  const divCol2 = document.createElement('div');
  divCol2.className = 'col-4';

  const h6 = document.createElement('div');
  h6.className = 'mob-text';
  h6.textContent = importe;
  divCol2.appendChild(h6);
  divRow.appendChild(divCol2);


  const divCol3 = document.createElement('div');
  divCol3.className = 'col-4 text-center';

  const i = document.createElement('i');
  i.className = 'fas fa-trash';
  i.textContent = 'sin nada';
  i.textContent = 'eliminar'
  console.log('id =>', id);
  i.onclick = () => removeElementCart(id);

  divCol3.appendChild(i);
  divRow.appendChild(divCol3);

  divPrincipal.appendChild(divRow);


  return divPrincipal;
}

// $("#GenerarPago").click(async function () {
//   document.getElementById('Progreso').hidden = false;
//   document.getElementById('Generar').hidden = true;
//   let respons = "";
//   const currentCart = getDataCart();
//   // caso de que existan datos Eduardo y Kike
//   // paso 1 enviar datos de Enrique -> referencia
//   // paso 2 enviar datos Eduardo con referencia
//   // paso 3 unir datos eduardo con referenciaKIKE

//   // Caso solo datos Eduardo
//   // Genera referencia y listo

//   // Caso kike
//   // Genera su referencia propia.


//   for (const concepto of currentCart.conceptos.vehiculos) {
//     const serie = concepto.serie;
//     const placa = concepto.placa;
//     const Tplaca = concepto.Tplaca;
//     const clase = concepto.clase;
//     const conceptos = JSON.stringify(concepto.conceptos);
//     const infov = JSON.stringify(concepto.InfoV);
//     respons = await $.ajax({
//       type: "POST",
//       url: "HojaReferencia.php",
//       dataType: 'JSON',
//       data: { serie: serie, placa: placa, clase: clase, Tplaca: Tplaca, InformacionV: conceptos, InfoCV: infov }
//       //            data: {Datos: currentCart}
//     }).done(function (respuesta) {
//       window.open("https://esefina.ingresos-guerrero.gob.mx/pasarela/?ref=" + respuesta + "&cart=true");
//       document.getElementById('Progreso').hidden = true;
//       document.getElementById('Generar').hidden = false;
//       cleanCart();
//       window.location.replace("https://esefina.ingresos-guerrero.gob.mx/menu.php");
//     }).fail(function (jqXHR) {
//       alert("Internal Server Error " + jqXHR.status)
//       document.getElementById('Progreso').hidden = true;
//       document.getElementById('Generar').hidden = false;
//     });
//   }
//   console.log(respons);
// });


/**
  ========================================================================
  Enrique functions
**/

function buscaLocalStorage(parOpcion, parValor) {

  if (typeof parValor !== 'string') return;
  const cart = getDataCart();

  let vehiculo = false;

  // ver para cunado este vacio otros
  if (!cart.hasOwnProperty('conceptos')) return false;
  if (!cart.conceptos.hasOwnProperty('otros')) return false;

  let ultimo = cart.conceptos.otros.length - 1;

  switch (parOpcion) {
    case "Placa":
      for (i = ultimo; i > -1; i--) {
        if (!cart.conceptos.otros[i].objectFree.hasOwnProperty('PlacaActualVehiculo')) continue;
        if (cart.conceptos.otros[i].objectFree.PlacaActualVehiculo === parValor) {
          return cart.conceptos.otros[i].objectFree;
        }
      }
      break;
    case "NoDeSerie":
      for (i = ultimo; i > -1; i--) {
        if (!cart.conceptos.otros[i].objectFree.hasOwnProperty('NumeroSerieVehiculo')) continue;
        if (cart.conceptos.otros[i].objectFree.NumeroSerieVehiculo === parValor) {
          return cart.conceptos.otros[i].objectFree;
        }
      }
      break;
  }
  return vehiculo;
}
