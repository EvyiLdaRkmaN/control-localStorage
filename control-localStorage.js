const ITEM_CART = 'carrito';

/**
 * definición de conceptos
 * @typedef {object} concepto
 * @property {number} id
 * @property {string} descripcion
 * @property {string} nombre
 */

/**
 * Parametros del carrito
 * @typedef {object} cart
 * @property {number} cart.cajero
 * @property {number} cart.caja
 * @property {number} cart.oficina
 * @property {object} cart.conceptos
 * @property {object[]} cart.conceptos.vehiculos
 * @property {string} cart.conceptos.vehiculos[].serie
 * @property {concepto[]} cart.conceptos.vehiculos[].conceptos
 * @property {concepto[]} cart.conceptos.otros
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
function addVehiculo(serie, concepts) {
  let conceptNew;
  if (Array.isArray(concepts)) conceptNew = concepts;
  else if (typeof concepts === "object") conceptNew = [concepts];
  else return 'error el concepto no es objecto ni array';

  const currentCart = getDataCart();

  /**
   * @type {cart}
   */
  let newcarrito;
  if (!carrito.Conceptos) newcarrito = { ...currentCart, conceptos: { vehiculos: [{ serie, conceptos: [...conceptNew] }] } };
  else {
    const vehiculosOld = currentCart.conceptos.vehiculos;
    newcarrito = { ...carrito, conceptos: { vehiculos: [...vehiculosOld, { serie, conceptos: [...conceptNew] }] } };
  }
  setStorage(newcarrito);
  return true;
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
    const conceptsOld = carrito.conceptos;
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
  return cart.conceptos.lenght()
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
  if(!cart[item]){
    console.log('Item no encontrado')
    return;
  }
  delete cart[item];

  setStorage(cart);
  console.log('Item eliminado')
}

function deleteConceptVehiculo(serie) {
  const cart = getDataCart();
  const index = cart.conceptos.vehiculos.findIndex(e => e.serie === serie);
  console.log('existe = ',index);
  if (index == -1 ) {
    console.log('La serie no existe en el carrito');
    return;
  }
  cart.conceptos.vehiculos.splice(index, 1);  
  setStorage(newCart);
  console.log('Elementos eliminados');
}

function cleanCart() {
  localStorage.removeItem(ITEM_CART);
}

function deleteConcept(id) {
  const divTabla = document.getElementById('Contenidopago');
  divTabla.removeChild(document.getElementById(id));
}

/**
 * ========================================================================
 */

function createViewCart() {
  const main = document.getElementById('main');
  const currentCart = getDataCart();
  for (const concepto of currentCart.conceptos.vehiculos) {
    for (const conceptVehiculo of concepto.conceptos) {
      main.appendChild(createRow(conceptVehiculo.nombre, conceptVehiculo.id));
    }
  }
}

const createRow = (conceptName = 'tesConcept', id) => {
  const rowPrincipal = document.createElement('div');
  rowPrincipal.className = 'row d-flex justify-content-center border-top';
  rowPrincipal.id = conceptName;

  const nombreConcepto = nameConcept();
  const moreData = dataExtra(conceptName);

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
const nameConcept = (data1 = 'data1', data2 = 'data2') => {
  const div = document.createElement('div');
  div.className = 'col-5';

  const divRow = document.createElement('div');
  divRow.className = 'row d-flex';


  // el que contendra el nombre y demas datos de tenencia
  const divContenedor = document.createElement('div');
  divContenedor.className = 'my-auto flex-column d-flex pad-left';

  const h6 = document.createElement('h6');
  h6.className = 'mob-text';
  h6.textContent = data1;

  const p = document.createElement('p');
  p.className = 'mob-text';
  p.textContent = data2;

  divContenedor.appendChild(h6);
  divContenedor.appendChild(p);

  divRow.appendChild(divContenedor);
  div.appendChild(divRow);

  return div;
}

const dataExtra = (id) => {
  const data1 = '1', data2 = '1500';

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
  p.textContent = id;

  divContenedor1.appendChild(p);
  divCol.appendChild(divContenedor1);
  divRow.appendChild(divCol);

  const divCol2 = document.createElement('div');
  divCol2.className = 'col-4';

  const h6 = document.createElement('div');
  h6.className = 'mob-text';
  h6.textContent = data2;

  divCol2.appendChild(h6);
  divRow.appendChild(divCol2);


  const divCol3 = document.createElement('div');
  divCol3.className = 'col-4 text-center';

  const i = document.createElement('i');
  i.className = 'fas fa-trash';
  i.textContent = 'sin nada';
  i.textContent = 'eliminar'
  i.onclick = () => document.getElementById('main').removeChild(document.getElementById(id));

  divCol3.appendChild(i);
  divRow.appendChild(divCol3);

  divPrincipal.appendChild(divRow);


  return divPrincipal;
}

createViewCart();

