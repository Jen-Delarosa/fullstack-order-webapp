const mysql = require("mysql2/promise");

var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "127.0.0.1", // this will work
 
});

async function addOrder(data) {
  let conn = await connPool.getConnection();

  // get number of orders in table to give corect order_id
  // let orders = await connPool.execute("SELECT COUNT(*) FROM Orders");
  // const order_id = data.id; //?? if i get to work else do const order_id = orders
  const product = data.Product;
  const status = "Placed";
  const cost = data.cost;
  const from_name = data.from_name;
  const quantity = data.quantity;
  const address = data.address;
  const shipping = data.shipping;
  const notes = "Customer requested " + shipping + " shipping";
  const order_date = data.order_date;
  let command = "INSERT INTO Orders (cost, from_name, product,"
    + " status, address, quantity, notes, shipping, order_date)" + 
    "VALUES (?,?,?,?,?,?,?,?,?) ;"; 
  let values = [cost, from_name, product, status,address, quantity, notes, shipping, order_date];
  let [retval] = await conn.execute(command, values);
  // console.log(retval);
  conn.release();
  return retval.insertId
  

}
//  addOrder({cost: 30,from_name: "John",  Product: "Roses", quantity: 2, address: "This is a valid address", shipping : "Expedited", order_date: new Date()});

async function getOrders(query, status) {
  let conn = await connPool.getConnection();
  // console.log(query);
  // console.log(status);
  // probably more complicated than this since status can be ALL 
  let command = "";
  let values = [];
  if(query == '' && status == "All Statuses"){
     command = "SELECT * FROM Orders;";
    //  values = [ status] /
  }
  else if(query =='' && status != "All Statuses"){
     command = "SELECT * FROM Orders WHERE status= ? ;";
     values = [ status];
  }
  else if(query !='' && status == "All Statuses"){
    command = "SELECT * FROM Orders WHERE from_name= ? ;";
    values = [query];
  }
  else{
    command = "SELECT * FROM Orders WHERE from_name= ? and status= ? ;";
    values = [query, status];
  }
  

  let retval = await conn.execute(command, values);
  conn.release();
  // console.log(retval[0]);

  return retval[0];

}
// getOrders("", "All Statuses");

async function updateOrder(id, shipping, address) {
  let conn = await connPool.getConnection();
  let notes = "updated shipping method"
  let command = "UPDATE Orders SET shipping= ?, address= ?, notes= ? WHERE order_id= ? ;";
  let values = [shipping, address, notes, id];
  let command2 = "INSERT INTO OrderHistories (order_id,"
    + " shipping, update_time)" + 
    "VALUES (?,?,?) ; "; 
  let curTime = new Date();
  let values2 = [id, shipping, curTime];
  let [retval] = await conn.execute(command, values);
  let [retval2] = await conn.execute(command2, values2);
  // console.log(retval[0]);
  // console.log(retval2[0])
  conn.release();
  return true;

}
// updateOrder(4, "Ground", "THIS IS A VERY NEW ADDRESS");

async function cancelOrder(id) {
  // simply cancels order by updating status to canceled??
  let conn = await connPool.getConnection();
  let command = "UPDATE Orders SET status = 'Cancelled' WHERE order_id = ?";
  let values = [id];

  let [retval] = await conn.execute(command, values);
  conn.release();
  // console.log(retval)
  return retval;

}
// cancelOrder(5);

async function getOrder(orderId) {
  let conn = await connPool.getConnection();
  
  let command = "SELECT * FROM Orders WHERE order_id = ? ;";
  let values = [orderId];

  let [retval] = await conn.execute(command, values);
  conn.release();
  // console.log(retval);
  return retval[0];

}
// getOrder(4);

async function updateOrderStatuses() {
  let conn = await connPool.getConnection();
 
  const curTime = new Date();
 
  const orders = await getOrders("", "All Statuses");
  let command = "";
  let values = [];
  for(let i=0 ; i < orders.length; i++){
    if(orders[i].status == "Placed"){
      const orderedTime = new Date(orders[i].order_date);
    
      const diference = curTime - orderedTime; 
      if(diference >= 90000){
      //  if a minute and a half or more has passed since order has been placed
        command = "UPDATE Orders SET status='Shipped' WHERE order_id = ?";
        values = [i + 1];
        let [retval] = await conn.execute(command, values);
        // console.log(retval[0])
      }
    }
  }
  conn.release();
  return; 
}
// updateOrderStatuses();
async function getOrderHistory(id) {
  let conn = await connPool.getConnection();
 
  let command = "SELECT * FROM OrderHistories WHERE order_id = ? ;";
  let values = [id];

  let [retval] = await conn.execute(command, values);
  conn.release();
  // console.log(retval)

  // console.log(retval[-5])
  return retval;

}
// getOrderHistory(5);

module.exports = {
  getOrder,
  addOrder,
  getOrders,
  updateOrderStatuses,
  updateOrder,
  cancelOrder,
  getOrderHistory,
};
