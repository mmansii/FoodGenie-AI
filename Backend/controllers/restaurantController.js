const ErrorHandler = require("../utils/errorHandler")
const catchAsync = require("../middlewares/catchAsyncErrors")
const APIFeatures = require("../utils/apiFeatures")
const Restaurant = require("../models/restaurant")


//get all restaurants
exports.getAllRestaurants = catchAsync(async(req,res,next)=>{
    const apiFeatures = new APIFeatures(Restaurant.find(), req.query).search().sort()

    const restaurants = await apiFeatures.query
    res.status(200).json({
        status:"Success",
        count:restaurants.length,
        restaurant:restaurants
    })
})

//get restaurants by its id
exports.getRestaurant = catchAsync(async(req,res,next)=>{
    const restaurant = await Restaurant.findById(req.params.storeId);

    if(!restaurant){
        return next(new ErrorHandler("No Restaurant found with the ID",404))
    }

    res.status(200).json({
        status:"Success",
        data: restaurant
    })
})


//update

exports.createRestaurant = catchAsync(async (req, res, next) => {
  console.log("Create Restaurant API called");
  console.log(req.body);;
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({
    status: "success",
    data: restaurant,
  });
});

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.storeId);

  if (!restaurant)
    return next(new ErrorHandler("No document found with that ID", 404));

  res.status(204).json({
    status: "success",
  });
});
