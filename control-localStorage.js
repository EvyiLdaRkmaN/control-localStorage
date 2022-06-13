const ITEM_CART = 'carrito';
const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const conceptTransportes = [47402, 25318, 25319, 25320, 25321, 25301, 25330, 25345, 25313, 25307, 25317];

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
    let IdUsuario = $('#IdUsuario').val();
    localStorage.setItem(ITEM_CART, JSON.stringify({ IdCaja, UsuCajero, IdOficina, IdUsuario }));
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
 * @param {concepto[] | object} concepts 
 * @returns {string|boolean}
 */
function addVehiculo(serie, concepts, info, placa, clase, Tplaca, Propietario, rfc) { 
  console.log('agregando vehiculo')
  /**
   * @type {concepto[]}
   */
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
  
  const findFolioTransportes = currentCart.conceptos?.otros?.find(value => value.folioTransportes !== undefined);

  console.log('exist folio transporte? ', findFolioTransportes);

  if (!currentCart.conceptos) newcarrito = { ...currentCart, conceptos: { vehiculos: [{ serie, conceptos: [...conceptNew], InfoV: [...infoNew], placa, clase, Tplaca, Propietario, rfc }] } };

  else {

    // validando si existen conceptos de transportes en el nuevo vehiculo que se quiere agregar
    // Si existe algun concepto de particular, genera error.
    if (findFolioTransportes) {
      const onlyTranpost = conceptNew.find(value => !conceptTransportes.includes(value.Concepto));
      if (onlyTranpost) return 'No puede haber conceptos de particular con publico';
    }
    
    if (!currentCart.conceptos.vehiculos) {
      newcarrito = {...currentCart, conceptos:{...currentCart.conceptos, vehiculos:[{serie, conceptos:[...conceptNew], InfoV: [...infoNew], placa, clase, Tplaca, Propietario, rfc }]}}
      setStorage(newcarrito);
      return true;
    }
    // buscando si existe el vehiculo
    const index = currentCart.conceptos.vehiculos.findIndex(v => v.serie === serie);
    if (index != -1) {
      currentCart.conceptos.vehiculos.splice( index,1,{serie, conceptos:[...conceptNew], InfoV: [...infoNew], placa, clase, Tplaca, Propietario, rfc });
      newcarrito = currentCart;
    }
    else {
      currentCart.conceptos.vehiculos.push({ serie, conceptos: [...conceptNew], InfoV: [...infoNew], placa, clase, Tplaca, Propietario, rfc });
      newcarrito = currentCart;
    }
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

/**
 * 
 * 1. **E01**: si existe orden de pago(`folioTrasnportes`), permitir agregar unicamente registros en
 * otros que contengan conceptos de transportes
 *    1. **E01-01**: si existen conceptos de transportes. No permitir agregar conceptos de particular
 * 2. Si existe orden de pago, no permitir agregar vehiculos de tenencia particular
 * 3. Si existe vehiculo: no permitir registro de conceptos de transportes(`conceptTransportes`)
 * 4. Propuesta: No permitir agregar fuentes de ingreso diferentes a transportes, solo si
 * si ya existe un conecto de transportes ya agregado o si esta(`folioTransportes`)
 * 5. 
 */
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

  
  if (!carrito.conceptos) {
    
    // validate E01
    const findFolioTransportes = carrito.conceptos.otros.find(value => value.folioTransportes !== undefined);

    if (findFolioTransportes) {
      // buscando E01-01
      const e0101 = carrito.conceptos.otros.find(value => value.cuentas.find(c => !conceptTransportes.includes(c.cuenta)) !== undefined); 
      if (e0101 !== undefined) {
        return "no se puede combinar conceptos de publico con transportes";
      }
    }

    newcarrito = { ...carrito, conceptos: { otros: [...conceptNew] } };
  }
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
  if(cart.conceptos.vehiculos){
    index = cart.conceptos.vehiculos.findIndex(e => e.serie === serie);
    if(index != -1){
        cart.conceptos.vehiculos.splice(index, 1);
    }
  }
  if(cart.conceptos.otros){
    indexOtros = cart.conceptos.otros.findIndex(e => e.id === serie);
    if(indexOtros != -1){
        cart.conceptos.otros.splice(indexOtros, 1);
    }
  }

  if (index == -1 && indexOtros == -1) {
    console.log('Elemento no existe en el carrito');
    return;
  }
  setStorage(cart);
  console.log('Elementos eliminados');
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
  return cart.conceptos.otros.find((v) => v.serie === serie).cuentas.some(c => cuentas.includes(c.cuenta));
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
  const { conceptos: { vehiculos } } = getDataCart();

  // Calculando el nuevo total
  let importetotal = 0;
  for (const { conceptos } of vehiculos) {
    for (const { TotalPagar } of conceptos) {
      importetotal += TotalPagar;
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

// document.addEventListener("DOMContentLoaded", function () {
//   // Invocamos cada 5 segundos ;)
//   const milisegundos = .1 * 1000;
//   setInterval(function () {
//     // No esperamos la respuesta de la petición porque no nos importa
//     updateNumCart()
//   }, milisegundos);
// });

function deleteConceptsCart() {
    const cart = getDataCart();
    if (!cart.conceptos) {
        console.log('No hay nada en el carrito');
        return;
    }
    delete cart.conceptos;
    console.log('estaus de nuevo carrito', cart);
    setStorage(cart);
    window.location.reload();
}

/**
 * ========================================================================
 */

function createViewCart() {

  const main = document.getElementById('main');
  const { conceptos: { vehiculos, otros } } = getDataCart();
  

  let totalfinal = 0;
  if(vehiculos){
      for (const concepto of vehiculos) {
        let importetotal = 0;
        let ejercicios = "";
        for (const conceptVehiculo of concepto.conceptos) {
          if (conceptVehiculo.Concepto == "TENENCIA") {
            ejercicios += `${conceptVehiculo.Ejercicio},`;
          }
          importetotal += conceptVehiculo.Subtotal;
        }
        main.appendChild(createRow(concepto.serie, "TenenciaParticular", ejercicios, concepto.Propietario, "Serie:" + concepto.serie + ";Placa:" + concepto.placa, 1, formatter.format(importetotal)));
        totalfinal += importetotal;
      }
  }
  if(otros){
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

  //divCol3.appendChild(i);
  divRow.appendChild(divCol3);

  divPrincipal.appendChild(divRow);


  return divPrincipal;
}

$("#GenerarPago").click(async function () {
    document.getElementById('Progreso').hidden = false;
    document.getElementById('Generar').hidden = true;
    let respons = "";
    let C58444 = false;
    let C58461 = false;
    const currentCart = getDataCart();
    console.log(currentCart.IdCaja);
//    let telefono = document.getElementById('telefono').value;
    let mensaje = "";
    
    if(currentCart.conceptos?.otros){
        for(const fuentes of currentCart.conceptos.otros){
            for(const fuente of fuentes.cuentas){
                if(fuente.cuenta == 58444){
                    C58444 = true;
                }else if(fuente.cuenta == 58461){
                    C58461 = true;
                }
            }
        }
        if(C58444 && C58461){
            mensaje = "Las fuentes de ingreso 58444 y 58461 no se pueden cobrar juntas.";
        }else if(C58444 && C58461 == false){
            if(currentCart.conceptos.otros.length == 1 && !currentCart.conceptos.vehiculos){
                //console.log("Pasa 1.");
            }else{
                mensaje = "Las fuentes de ingreso 58444 no se pueden cobrar con otros conceptos.";
            }
        }else if(C58461 && C58444 == false){
            if(currentCart.conceptos.otros.length == 1 && !currentCart.conceptos.vehiculos){
                //console.log("Pasa 2.");
            }else{
                mensaje = "Las fuentes de ingreso 58461 no se pueden cobrar con otros conceptos.";
            }
        }else{
            //console.log("Continua 2.");
        }
    }else{
        //console.log("Continua 3.")
    }
    
    
    if(currentCart.IdCaja == 0){
        mensaje = "Dede de tener una Caja asignada.";
        return false;
    }
    if(mensaje != ""){
        toastr.error(mensaje, "Información Importante!");
        document.getElementById('Progreso').hidden = true;
        document.getElementById('Generar').hidden = false;
        return false;
    }
    
  // caso de que existan datos Eduardo y Kike
  // paso 1 enviar datos de Enrique -> referencia
  // paso 2 enviar datos Eduardo con referencia
  // paso 3 unir datos eduardo con referenciaKIKE

  // Caso solo datos Eduardo
  // Genera referencia y listo

  // Caso kike
  // Genera su referencia propia.
  
    respons = await $.ajax({
        type: "POST",
        url: "HojaReferencia.php",
        dataType: 'JSON',
        data: { Cobros: currentCart}
    }).done(function (respuesta) {
        window.open("https://esefina.ingresos-guerrero.gob.mx/pasarela/?ref=" + respuesta + "&cart=true");
        document.getElementById('Progreso').hidden = true;
        document.getElementById('Generar').hidden = false;
        cleanCart();
        window.location.replace("https://esefina.ingresos-guerrero.gob.mx/menu.php");
    }).fail(function (jqXHR) {
        alert("Internal Server Error " + jqXHR.status)
        document.getElementById('Progreso').hidden = true;
        document.getElementById('Generar').hidden = false;
    });
    console.log(respons);
});


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
