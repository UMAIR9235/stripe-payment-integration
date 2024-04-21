require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const stripe = require("stripe")(
  "sk_test_51P80CoSEe8zt4MjAY3xm6cbumFHSCqjeGb8uiyUKt0aUmT7pazCjHpkXt6ysUBDGl0rBTfGWkON90p4FJ24iEoMV006YFtIQB4"
);

const storeItems = new Map([
  [1, { priceInCents: 1000, name: "Learn React Today" }],
  [2, { priceInCents: 2000, name: "Learn CSS Today" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.SERVER_URL}/success.html`,
      cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    });
    console.log(session.url, "sessionurl");
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
