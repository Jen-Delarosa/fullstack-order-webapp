
const express = require("express");
const cookieParser = require("cookie-parser");
const database = require("./data.js");
const app = express();


app.set("views", "templates/")
app.set("view engine", "pug")
// `/css` URLS for resources/css
app.use("/css", express.static("resources/css"));
//`/images` URLS for resources/images 
app.use("/images", express.static("resources/images"));
//`/js` URLS for resources/js 
app.use("/js", express.static("resources/js"));

app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use(express.json());



// helper function to verify the form request
async function verify_form(body){
  // if the form is valid returns teh body back
  // if the form is not valid, returns {status: either 413 or 400, errors: list of errors}
  // let invalid = []
  let errors = [];
  let status2 = 201;
  const Products = ["Roses", "Blue Flowers", "Purple Flowers"]
  const Ship = ["Flat Rate", "Expedited", "Ground"]
  const product = body.Product
  const from_name = body.from_name
  const quantity = body.quantity
  const address = body.address
  const shipping = body.shipping
  if(address.length >=1024){
    // invalid.push({status:413, errors: })
    status2 = 413
    errors.push("Address length too long")

  }
  if(from_name.length >=64){
    status2 = 413 
    errors.push("buyer length")
  }
  if(address.length ==0){
    // invalid.push({status:413, errors: })
    status2 =400
    errors.push("address field empty")

  }
  if(from_name.length ==0){
    status2 = 400
    errors.push("buyer field empty")
  }
  if(quantity<=0){
    status2= 400
    errors.push("invalid quantity")
  }
  if(!Products.includes(product)){
    status2= 400
    errors.push("invalid product")
  }
  if(!Ship.includes(shipping)){
    status2= 400
    errors.push("invalid shipping method")
  }
  if(status2 == 201){
    const orders =  await database.getOrders("", "All Statuses");
    // console.log(orders.length)
    return {status : 201, order_id: orders.length +1 }
  }
  else{
    return {status : status2, "errors" : errors}
  }

}


app.get("/",  (req, res) => {
  res.status(200).render("about.pug")
});
app.get("/about", (req,res)=>{
  // get aboout page
  res.status(200).render("about.pug")
}
);
app.get("/admin/about", (req,res)=>{
  // get admin about page
  res.status(200).render("about.pug")
});

app.get("/admin/orders", async (req,res)=>{
  // update orders on load since order statuses change as  a minute and 30 seconds have passed
  await database.updateOrderStatuses();
  
  if(!req.query.query && !req.query.status){
    // loaded_orders = orders
    loaded_orders =  await database.getOrders("", "All Statuses");
    // console.log(loaded_orders);
    // the page is loaded, load all orders
    searched = {searched : req.query.query, status : req.query.status}
    res.status(200).render("orders.pug", {load_orders : loaded_orders, searched_for : searched})
  }
  else{
    loaded_orders =  await database.getOrders(req.query.query, req.query.status);
    // console.log(loaded_orders);
    // the page is loaded, load all orders
    searched = {searched : req.query.query, status : req.query.status}
    res.status(200).render("orders.pug", {load_orders : loaded_orders, searched_for : searched})
  
  }
 
  

});
app.get("/order", (req,res)=>{
  //  load order form
  if(req.cookies.customer_name){
    // if a cookie is set add name value to form
    cookies = {customer_name : req.cookies.customer_name}
    res.status(200).render("order.pug", cookies)
  }
  else{
    cookies = {customer_name : " "}
    res.status(200).render("order.pug", cookies)
  }
 
});

app.get("/tracking/:id", async (req,res)=>{
  orderNum = parseInt(req.params.id)
  
  
  // check if id is a number, id is not negative, and id is not a float since parse int removed .0 
  if(Number.isInteger(orderNum) && orderNum >= 0  && String(orderNum) == req.params.id ){
   
    let this_order = await database.getOrder(orderNum);
   
    res.status(200).render("tracking_page.pug", this_order)
  }
  
  else{
    // if not a valid trackin number load 404 page
    
    res.status(404).render("404.pug")
  }


});
// new route GET /api/order/:id/history/
app.get("/api/order/:id/history/", async (req, res)=>{
  // get last 5 orders historeis for the id speicified
  let orderNum = parseInt(req.params.id);
  if(Number.isInteger(orderNum) && orderNum >= 0  && String(orderNum) == req.params.id ){
   
    let history = await database.getOrderHistory(orderNum);
    // console.log(history);
    const last_five =[]
    for ( let i = history.length -1 ; i > history.length - 6; i --){
      // console.log(history[i])
      last_five.push(history[i]);
    }
   
    // res.status(200).render("order_history.pug", {changes : last_five})
     res.status(200).json({status: "success", changes : last_five})
  }
  else{
    res.status(400).json({status: "error", errors : "Found no history for this order"})
  }
  


})
app.post("/api/order", async(req,res)=>{
    // if req.body exists asign to body else empty string
    let body = req.body || ""
    if(Object.keys(body).length == 0){// || body.length == undefined ){
      res.status(400).json({status: "error", errors: "invalid content type"})
    }
    if(!req.headers["content-type"].includes("application/json") || body == " "){
       res.status(400).json({status: "error", errors: "invalid content type"})
    }
    // console.log(body);
    let result = await verify_form(body)
    // console.log(result)
    
    let costs = 0
    if(result.status == 201){
      if(String(body.Product) =="Roses"){
        costs = 25 * parseInt(body.quantity)
      }
      if(String(body.Product) =="Blue Flowers"){
        costs = 30 * parseInt(body.quantity)
      }
      if(String(body.Product) =="Purple Flowers"){
        costs = 30 * parseInt(body.quantity)
      }
      // cost : cost, 
      // const orders = await database.getOrders('', "All Statuses");
      let newOrder = {
        cost: costs,
        from_name : body.from_name, 
        Product : body.Product,
        status : "Placed",
        address : body.address,
        quantity : body.quantity,
        notes : "Customer reuqested" +  String(body.shipping),
        shipping : body.shipping,
        order_date : new Date(),
      }
      let order_id = await database.addOrder(newOrder)
      // console.log(order_id)
      if(body.remember_me == true){
        // setting cookie for customer name, expires after a minute
        res.cookie("customer_name", String(body.from_name),{maxAge: 60000}).status(201).json({status: "success", order_id: order_id})
      }
      else{
        // if customer doesn't want to be remebered dont set cookie
        res.status(201).json({status: "success", order_id: order_id})
      }
      
    }
    else{
      // return list of errors 
      // console.log(result.status)
      res.status(result.status).json({status: "error", errors: result.errors})
    }
  
    // body is the body of the api order reuqest and contains all fields from the form
    // res.render("order.pug")
  });
  app.post("/update_shipping", async (req,res)=>{
   
    let body = req.body
    // console.log(req.body);
    let updated = await database.updateOrder(body.updateShip, body.shipping, body.address);
    if(updated == true){
      // load trakcing page with order num to display update in fo success message
      let order = await database.getOrder(body.updateShip);
      res.render("tracking_page.pug", order )
    }
    else{
      // if update failed load fail page
      res.render("order_fail.pug")
    }
  });
  app.delete("/api/cancel_order", async (req,res)=>{
    // canceling order 
    found = false
  
    let changed = await database.cancelOrder(req.body.OrderID);
    if(changed.changedRows == 1){
      found = true
      res.status(204).json({"status":"success"})
      
    }
    if(found == false){
      // if order was not found 
      res.status(404).json("order cannot be found")
    }
    // res.status(404).json("order cannot be found")
  });
app.use((req,res)=>{
  // if no path matches the ones above default to 404
  res.status(404).render("404.pug")
});



app.listen(4131, () => {
  console.log("http://localhost:4131/ is ready.");
});
