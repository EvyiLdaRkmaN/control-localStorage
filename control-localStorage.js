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
  if (!currentCart.conceptos) newcarrito = { ...currentCart, conceptos: { vehiculos: [{ serie, conceptos: [...conceptNew] }] } };
  else {
    const vehiculosOld = currentCart.conceptos.vehiculos;
    newcarrito = { ...currentCart, conceptos: { vehiculos: [...vehiculosOld, { serie, conceptos: [...conceptNew] }] } };
  }
  setStorage(newcarrito);
  return true;
}

/**
 * busca un vehiculo por la serie
 * @param {string} serie 
 * @returns {object | undefined}
 */
function findSerie(serie) {
  if (typeof serie !== 'string') return;
  const cart = getDataCart();
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
  return cart.conceptos.vehiculos.length
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
  const index = cart.conceptos.vehiculos.findIndex(e => e.serie === serie);
  console.log('existe = ', index);
  if (index == -1) {
    console.log('La serie no existe en el carrito');
    return;
  }
  cart.conceptos.vehiculos.splice(index, 1);
  setStorage(cart);
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
 * Removera completamente el elemento de la vista
 * al igual que eliminará el elemnto del localStorage
 * @param {string} id elemento a eliminar
 */
function removeElementCart(id) {
  deleteConceptVehiculo(id);
  document.getElementById('main').removeChild(document.getElementById(id));
  updateNumCart();
}

let count = 0;
function addElementCartTest(e) {
  count++;
  // addVehiculo('test'+count,[{serie:'test'+count}]);
  localStorage.setItem('nuevo'+count,'data insert');
}

function updateNumCart() {
  const element = document.getElementById('countCart');
  element.textContent = getNumConcepts();
}

updateNumCart();

/**
 * ========================================================================
 */

function createViewCart() {
  const main = document.getElementById('main');
  const currentCart = getDataCart();
  let totalfinal = 0;
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  for (const concepto of currentCart.conceptos.vehiculos) {
    let importetotal = 0;
    let ejercicios = "";
    for (const conceptVehiculo of concepto.conceptos) {
      if (conceptVehiculo.Concepto == "TENENCIA") {
        ejercicios += `${conceptVehiculo.Ejercicio},`;
      }
      importetotal += conceptVehiculo.TotalPagar;
    }
    main.appendChild(createRow(concepto.serie,1, ejercicios, formatter.format(importetotal)));
    totalfinal += importetotal;
  }
  // document.getElementById('TotalFinal').textContent = formatter.format(totalfinal);
}

/**
 * crea la fila con para la vista y con lo necesario para poder eliminar, actualmente
 * esta adaptado para vehiculos con su serie
 * @param {string} id identificador de la fila (actualmente serie vehiculo)
 * @param {number} cantidad elementos con el mismo concepto
 * @param {*} ejercicios 
 * @param {number} importe total del importe
 * @returns {HTMLDivElement}
 */
const createRow = (id,cantidad = 1, ejercicios, importe) => {
  const rowPrincipal = document.createElement('div');
  rowPrincipal.className = 'row d-flex justify-content-center border-top';
  rowPrincipal.id = id;
  const nombreConcepto = nameConcept("TenenciaParticular", ejercicios);
  const moreData = dataExtra(id,cantidad, importe);
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

const dataExtra = (id, cantidad, importe = '0') => {
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
  i.onclick = ()=>removeElementCart(id);

  divCol3.appendChild(i);
  divRow.appendChild(divCol3);

  divPrincipal.appendChild(divRow);


  return divPrincipal;
}


// window.addEventListener('storage',(e)=>{
//   console.log('storage event =>', e);
// },false);

// window.onstorage = ()=>{
//   console.log('evento storage')
// }
