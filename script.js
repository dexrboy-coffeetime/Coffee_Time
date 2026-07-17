// =============================
// Coffee Shop Script
// =============================

let cart = [];

// =============================
// เพิ่มสินค้า
// =============================
function addCart(name, price, sweetID){

    let sweet = document.getElementById(sweetID).value;

    let found = cart.find(item =>
        item.name === name &&
        item.sweet === sweet
    );

    if(found){

        found.quantity++;

    }else{

        cart.push({
            name:name,
            price:price,
            sweet:sweet,
            quantity:1
        });

    }

    showCart();

}

// =============================
// แสดงตะกร้า
// =============================
function showCart(){

    let list=document.getElementById("cartList");

    list.innerHTML="";

    let total=0;
    let count=0;

    cart.forEach(function(item,index){

        let sum=item.price*item.quantity;

        total+=sum;

        count+=item.quantity;

        let li=document.createElement("li");

        li.innerHTML=`
        <b>${item.name}</b><br>
        🍬 ความหวาน ${item.sweet}%<br>
        🍽 จำนวน ${item.quantity} แก้ว<br>
        💸 ${sum} บาท<br><br>

        <button onclick="plus(${index})">➕</button>

        <button onclick="minus(${index})">➖</button>

        <hr>
        `;

        list.appendChild(li);

    });

    document.getElementById("total").innerHTML=total;

    document.getElementById("cartCount").innerHTML=count;

}

// =============================
// เพิ่มจำนวน
// =============================
function plus(index){

    cart[index].quantity++;

    showCart();

}

// =============================
// ลดจำนวน
// =============================
function minus(index){

    cart[index].quantity--;

    if(cart[index].quantity<=0){

        cart.splice(index,1);

    }

    showCart();

}

// =============================
// ลบสินค้า
// =============================
function removeCart(index){

    cart.splice(index,1);

    showCart();

}

// =============================
// เปิด / ปิด ตะกร้า
// =============================
function showCartBox(){

    let box=document.getElementById("cartBox");

    if(box.style.display=="block"){

        box.style.display="none";

    }else{

        box.style.display="block";

    }

}

// =============================
// ชำระเงิน
// =============================
function checkout(){

    if(cart.length == 0){
        alert("กรุณาเลือกสินค้าก่อน");
        return;
    }

    let total = 0;
    let order = "";

    cart.forEach(item=>{

        total += item.price * item.quantity;

        order +=
        item.name +
        " x" +
        item.quantity +
        " = " +
        (item.price * item.quantity) +
        " บาท\n";

    });

    function generateOrderNo(){

    let lastNumber = localStorage.getItem("lastOrderNumber");

    if(!lastNumber){
        lastNumber = 0;
    }

    lastNumber = Number(lastNumber) + 1;

    localStorage.setItem("lastOrderNumber", lastNumber);

    return "CF-" + lastNumber;

}

let orderNo = generateOrderNo();

let ok = confirm(
    "☕ Coffee Time ☕\n\n" +
    "📦 รายการสินค้า 📦\n\n" +
    order +
    "\n💸 ยอดรวม " + total + " บาท\n\n" +
    "📝 หมายเลขออเดอร์: " + orderNo +
    "\n\n🛎️ กรุณานำเลขออเดอร์นี้ไปชำระเงินที่เคาน์เตอร์\n\n" +
    "ยืนยันการสั่งซื้อ?"
);

    if(ok){

        fetch("http://192.168.1.115:3000/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orderNo: orderNo,
                items: cart,
                total: total
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);

            localStorage.setItem("lastOrder",orderNo);

            alert(
                "✅ รับออเดอร์เรียบร้อย\n\n" +
                "เลขออเดอร์: " + orderNo
            );

            cart = [];
            showCart();
        });

    }

}
// =============================
// ค้นหาเมนู
// =============================
function searchMenu(){

    let input=document.getElementById("search").value.toUpperCase();

    let cards=document.getElementsByClassName("card");

    for(let i=0;i<cards.length;i++){

        let title=cards[i].getElementsByTagName("h3")[0];

        if(title.innerHTML.toUpperCase().indexOf(input)>-1){

            cards[i].style.display="inline-block";

        }else{

            cards[i].style.display="none";

        }

    }

}
function addCart(name, price, sweetID = null, typeID = null){

    let sweet = "-";
    let type = "-";

    if(sweetID){
        sweet = document.getElementById(sweetID).value;
    }

    if(typeID){
        type = document.getElementById(typeID).value;
    }

    let found = cart.find(item =>
        item.name === name &&
        item.sweet === sweet &&
        item.type === type
    );

    if(found){
        found.quantity++;
    }else{
        cart.push({
            name:name,
            price:price,
            sweet:sweet,
            type:type,
            quantity:1
        });
    }

    showCart();
}
// =============================
// ล้างตะกร้าทั้งหมด
// =============================
function clearCart(){

    if(cart.length === 0){
        alert("ตะกร้าว่าง");
        return;
    }

    let ok = confirm("ต้องการลบสินค้าทั้งหมดออกจากตะกร้าหรือไม่?");

    if(ok){
        cart = [];
        showCart();
    }

}
function changeStatus(orderNo, status){

    fetch("http://192.168.1.115:3000/order/" + orderNo, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: status
        })
    })
    .then(res => res.json())
    .then(data => {
        loadOrders();
    });

}
async function checkStatus(){

    let orderNo = localStorage.getItem("lastOrder");

    if(!orderNo){
        return;
    }

    let res = await fetch("http://192.168.1.115:3000/order/" + orderNo);

    if(!res.ok){
        return;
    }

    let order = await res.json();

    document.getElementById("orderStatus").innerHTML =
        `
        เลขออเดอร์ : ${order.orderNo}<br>
        สถานะ : ${order.status}
        `;
}
checkStatus();

setInterval(checkStatus,1000);
async function changeStatus(orderNo,status){

    await fetch("http://192.168.1.115:3000/order/"+orderNo,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            status:status

        })

    });

    loadOrders();

}
async function checkStatus(){

    let orderNo = localStorage.getItem("lastOrder");

    if(!orderNo){
        return;
    }

    let res = await fetch("http://192.168.1.115:3000/order/" + orderNo);

    if(!res.ok){
        return;
    }

    let order = await res.json();

    document.getElementById("orderStatus").innerHTML = `
        <h3>เลขออเดอร์ : ${order.orderNo}</h3>
        <h2>สถานะ : ${order.status}</h2>
    `;
}

checkStatus();
setInterval(checkStatus,1000);