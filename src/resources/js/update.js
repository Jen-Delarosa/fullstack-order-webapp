// Begin by setting up update.js and writing a function to update the countdown once. 
// Then another piece of code to call this function every second.
let countdown = document.getElementById("countDown")
let timer = document.querySelector("#countDown span")

// get time of document loaded
let curTime = new Date();
// get time order was placed
let orderDate = document.getElementById("time").value;
let orderTime = new Date(orderDate)

ordered = (orderTime.getMinutes() * 60000) + (orderTime.getSeconds()* 1000)
// ordered = (parseInt(orderMin) * 60000)+ (parseInt(orderSec) * 1000)
// adding 1.5 minutes so this is the time we want the order to be shipped in 
ordered += 90000 
timeNow =  (curTime.getMinutes() * 60000) + (curTime.getSeconds() * 1000)

// placed orders will ship in 1:30 minutes 
let duration = ordered - timeNow;

// by default set up page load time as 1 minute and 30 seconds
let minutes = Math.floor(duration / 60000);
let seconds = duration - (minutes * 60000);
timer.innerHTML = `${minutes}m ${seconds / 1000}s`;




function decrementTimer() {
    // subtracts 1 second from the timer



    if (duration <= 0) {
        duration = 0;
        minutes = 0;
        seconds = 0;
        timer.innerHTML = `${minutes}m ${seconds}s`;
        document.getElementById("placed").style.display = "none";
        document.getElementById("changeStatus").innerText = "Shipped";
        // document.getElementById("Update").style.display = "none";
        // document.getElementById("countDown").style.display = "none";
        // document.getElementById("cancelOrder").style.display = "none";


    }
    if (duration > 0) {
        duration = duration - 1000;
        minutes = Math.floor(duration / 60000);
        seconds = Math.floor(duration % 60000) / 1000;
        timer.innerHTML = `${minutes}m ${seconds}s`;
        

    }


}
// when page is loaded add timer
document.addEventListener("DOMContentLoaded", function () {
    
    setInterval(decrementTimer, 1000);
    // had to add these in here otherwise timer wouldn't show
    // update button
    
    document.getElementById("Update").style.display = "block";
    // update shipping form
    document.getElementById("ShowUpdate").style.display = "none";
    // show when updat clicked
    function display() {
        document.getElementById("ShowUpdate").style.display = "block";
        document.getElementById("Update").style.display = "none";
    }
    // hide when cancel clicked
    function hide() {
        document.getElementById("ShowUpdate").style.display = "none";
        document.getElementById("Update").style.display = "block";

    }
    document.getElementById("Update").addEventListener("click", display);
    document.getElementById("cancel").addEventListener("click", hide);

});

// / Adding js for cancel order
// get cancel order form 

const cancel_button = document.forms["cancelOrder"];
cancel_button.addEventListener("submit", async (page)=>{
    page.preventDefault();
    // id_order = document.getElementById("OrderID").value;
    const response = await fetch("/api/cancel_order", {
    method: "DELETE",
    headers: {
        "Content-Type" : "application/json",
    },
    body: JSON.stringify({OrderID: parseInt(cancel_button.elements["OrderID"].value),
    }),
   
});
    // const data = await response.json();
    // console.log("This the data" + data);
    // if(data.status === "success"){
       // const data = await response.json();
    console.log(response)
    if(response.status == 204){
    document.getElementById("placed").style.display = "none";
    document.getElementById("changeStatus").innerText = "Cancelled";
    document.getElementById("message").innerText = "This order has been cancelled";
    }
    else{
        document.getElementById("message").textContent = "Failed to cancel order";
    }
        
    // }


});
    


