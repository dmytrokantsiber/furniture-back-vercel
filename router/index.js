const Router = require("express").Router;
const orderController = require("../controllers/order-controller");
const productController = require("../controllers/product-controller");
const userController = require("../controllers/user-controller");
const router = new Router();
const authMiddleware = require("../middlewares/auth-middleware");

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/test", (req, res) => {
  console.log("success test")
  res.send("test2");
});
router.get("/refresh", userController.refresh);
router.patch("/updateUserInfo", authMiddleware, userController.updateUserInfo);
router.get("/getAllUsers", authMiddleware, userController.getUsers);

router.post("/addProduct", productController.addItem);
router.get("/getAllProducts", productController.getAllProducts);

router.get("/getSingleProduct", productController.getSingleProduct);
// router.get("/updateFilters", productController.getAllFilters);
// router.get("/getFilteredProducts", productController.getFilteredProducts);
router.get("/getSearchByNameProducts", productController.getProductsByName);

router.get("/getOrdersByUser", authMiddleware, orderController.getOrdersByUser);
router.get("/getAllOrders", orderController.getAllOrders);
router.post("/addOrder", authMiddleware, orderController.addOrder);

router.get("/getSubcategories", productController.getSubcategories);

router.get("/getGoodies", productController.getGoodies);
module.exports = router;
