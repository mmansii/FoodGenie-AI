const Order = require("../models/order");
const FoodItem = require("../models/foodItem");
const Cart = require("../models/cartModel");
const { ObjectId } = require("mongodb");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const dotenv = require("dotenv");

//setting up config file
dotenv.config({ path: "./config/config.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a new order   =>  /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {


  // console.log("id", req.body);
  const { session_id } = req.body;

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["customer"],
  });
 
  const cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: "items.foodItem",
      select: "name price images",
    })
    .populate({
      path: "restaurant",
      select: "name",
    });
 
  
let deliveryInfo = {
  address: session.customer_details.address.line1,
  city: session.customer_details.address.city,
  phoneNo: session.customer_details.phone,
  postalCode: session.customer_details.address.postal_code,
  country: session.customer_details.address.country,
};

let orderItems = cart.items.map((item) => ({
  name: item.foodItem.name,
  quantity: item.quantity,
  image: item.foodItem.images[0].url,
  price: item.foodItem.price,
  fooditem: item.foodItem._id,
}));

let paymentInfo = {
  id: session.payment_intent,
  status: session.payment_status,
};



let order;

try {
  order = await Order.create({
    orderItems,
    deliveryInfo,
    paymentInfo,
    deliveryCharge: +session.shipping_cost.amount_subtotal / 100,
    itemsPrice: +session.amount_subtotal / 100,
    finalTotal: +session.amount_total / 100,
    user: req.user._id,
    restaurant: cart.restaurant._id,
    paidAt: Date.now(),
  });

 

} catch (err) {
  console.error("ORDER CREATE ERROR:");
  console.error(err);
  throw err;
}

await Cart.findOneAndDelete({ user: req.user._id });

res.status(200).json({
  success: true,
  order,
});
});

// Get single order   =>   /api/v1/orders/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("restaurant")
    .exec();

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get logged in user orders   =>   /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({
    user: req.user._id,
  })
    .populate("user", "name email")
    .populate("restaurant");


  res.status(200).json({
    success: true,
    orders,
  });
});

// Get all orders - ADMIN  =>   /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.finalTotal;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});
