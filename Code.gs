/**
 * OFFGRID — backend Google Apps Script.
 * Crea un progetto Apps Script collegato al foglio e incolla questo file.
 * Deploy > New deployment > Web app. Segui README.md per autorizzazioni e sicurezza.
 */
const SHEET_ORDERS = 'Ordini';
const SHEET_MESSAGES = 'Messaggi';
const SHEET_PRODUCTS = 'Prodotti';

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'products') return json_({ok:true, products: readObjects_(SHEET_PRODUCTS)});
  return json_({ok:true, service:'OFFGRID catalog API'});
}
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    switch (body.action) {
      case 'order':
        appendObject_(SHEET_ORDERS, body.order || {});
        return json_({ok:true});
      case 'message':
        appendObject_(SHEET_MESSAGES, body.message || {});
        return json_({ok:true});
      case 'saveProduct':
        upsertProduct_(body.product || {});
        return json_({ok:true});
      case 'deleteProduct':
        deleteProduct_(String(body.id || ''));
        return json_({ok:true});
      case 'updateOrder':
        updateOrderStatus_(String(body.id || ''), String(body.status || 'Da confermare'));
        return json_({ok:true});
      default: return json_({ok:false,error:'Azione non riconosciuta'});
    }
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}
function spreadsheet_() {
  // Se lo script è collegato a un foglio, usa quello. In alternativa imposta SHEET_ID nelle proprietà script.
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Collega lo script a un Google Sheet o configura SHEET_ID.');
  return ss;
}
function sheet_(name) {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}
function appendObject_(name, obj) {
  const sh = sheet_(name);
  let headers = sh.getLastRow() ? sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0] : [];
  const keys = Object.keys(obj);
  if (!headers.length || !headers[0]) { headers = keys; sh.getRange(1,1,1,headers.length).setValues([headers]); }
  else {
    const missing = keys.filter(k => !headers.includes(k));
    if (missing.length) { sh.getRange(1,headers.length+1,1,missing.length).setValues([missing]); headers = headers.concat(missing); }
  }
  sh.appendRow(headers.map(k => typeof obj[k] === 'object' && obj[k] !== null ? JSON.stringify(obj[k]) : (obj[k] ?? '')));
}
function readObjects_(name) {
  const sh = sheet_(name);
  if (sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues(), headers = data.shift();
  return data.filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]]))).map(p=>{
    ['price','quantity'].forEach(k=>{if(p[k]!==''&&p[k]!=null)p[k]=Number(p[k])});
    if(typeof p.available==='string')p.available=p.available.toLowerCase()==='true';
    return p;
  });
}
function upsertProduct_(p) {
  if (!p.id || !p.title || !p.category) throw new Error('Dati prodotto incompleti.');
  const sh = sheet_(SHEET_PRODUCTS), rows = readObjects_(SHEET_PRODUCTS);
  const index = rows.findIndex(x=>String(x.id)===String(p.id));
  if (index >= 0) {
    const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
    sh.getRange(index+2,1,1,headers.length).setValues([headers.map(k=>typeof p[k]==='object'&&p[k]!==null?JSON.stringify(p[k]):(p[k]??''))]);
  } else appendObject_(SHEET_PRODUCTS,p);
}
function deleteProduct_(id) {
  const sh=sheet_(SHEET_PRODUCTS); if(sh.getLastRow()<2)return;
  const values=sh.getDataRange().getValues(), headers=values[0], col=headers.indexOf('id');
  if(col<0)return;
  for(let i=values.length-1;i>=1;i--)if(String(values[i][col])===id)sh.deleteRow(i+1);
}
function updateOrderStatus_(id,status) {
  const sh=sheet_(SHEET_ORDERS);if(sh.getLastRow()<2)return;
  const values=sh.getDataRange().getValues(),headers=values[0],idCol=headers.indexOf('id'),statusCol=headers.indexOf('status');
  if(idCol<0||statusCol<0)return;
  for(let i=1;i<values.length;i++)if(String(values[i][idCol])===id){sh.getRange(i+1,statusCol+1).setValue(status);return;}
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}