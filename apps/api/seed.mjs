import bcrypt from 'bcrypt';
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
if(!url||!key)throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) sont requis');
async function q(table,method='GET',body){const filter=method==='DELETE'?'?id=not.is.null':'';const r=await fetch(url+'/rest/v1/'+table+filter,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});if(!r.ok)throw new Error(await r.text());return r.status===204?[]:r.json();}
for(const table of ['orders','products','categories','users'])await q(table,'DELETE');
const hash=await bcrypt.hash('Admin123!',12),managerHash=await bcrypt.hash('Manager123!',12),staffHash=await bcrypt.hash('Staff123!',12);
const users=await q('users','POST',[{name:'Alice Admin',email:'admin@restaurant.fr',password_hash:hash,role:'ADMIN'},{name:'Marc Manager',email:'manager@restaurant.fr',password_hash:managerHash,role:'MANAGER'},{name:'Sam Staff',email:'staff@restaurant.fr',password_hash:staffHash,role:'STAFF'}]);
const cats=await q('categories','POST',[{name:'Burgers',description:'Nos recettes maison',display_order:1},{name:'Accompagnements',description:'Pour compléter le repas',display_order:2},{name:'Boissons',description:'Fraîches et désaltérantes',display_order:3}]);
const ps=await q('products','POST',[{name:'Classic Burger',description:'Steak, cheddar, salade',price:12.5,category_id:cats[0].id},{name:'Frites maison',description:null,price:4.5,category_id:cats[1].id},{name:'Citronnade',description:null,price:3.5,category_id:cats[2].id}]);
await q('orders','POST',[{number:'CMD-1001',lines:[{productId:ps[0].id,name:ps[0].name,unitPrice:12.5,quantity:2}],total:25,status:'PREPARING',created_by:users[0].id},{number:'CMD-1002',lines:[{productId:ps[1].id,name:ps[1].name,unitPrice:4.5,quantity:1}],total:4.5,status:'COMPLETED',created_by:users[0].id}]);
console.log('Seed Supabase terminé : admin@restaurant.fr / Admin123!');
