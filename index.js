const http = require("http");
const express = require("express");
const es6Renderer = require("express-es6-template-engine");
const coffee = require("./coffee.json");
const product = require("./products.json");
const app = express();
const server = http.createServer(app);

const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
app.engine("html", es6Renderer);
app.set("views", "templates");
app.set("view engine", "html");

app.get("/", (req, res) => {
	const orders = coffee.length;
	let cost = coffee.reduce((accum, curr) => {
		return (accum += curr.cost);
	}, 0);
	cost = parseFloat(cost.toFixed(2));
	res.render("index", {
		partials: {
			head: "/partials/header",
			foot: "/partials/footer",
		},
		locals: {
			orders,
			cost,
		},
	});
});

app.get("/order", (req, res) => {
	let newObj = {};

	coffee.reduce((obj, item) => {
		if (!obj[item.order]) {
			obj[item.order] = 0;
		}
		obj[item.order] += item.cost;
		return newObj;
	}, newObj);

	const keys = Object.keys(newObj);
	const keyLinks = keys
		.map((k) => {
			return `<li><a href="/order/${k}" target="_blank">${k} - ${parseFloat(
				newObj[k].toFixed(2)
			)}</a></li>`;
		})
		.join("");
	res.render("orders", {
		partials: {
			head: "/partials/header",
			foot: "partials/footer",
		},
		locals: {
			keyLinks,
		},
	});
});

app.get("/order/:kind", (req, res) => {
	const { kind } = req.params;
	const allOrders = coffee
		.filter((o) => o.order === kind)
		.map((e) => {
			return `<li>$${parseFloat(e.cost).toFixed(2)}</li>`;
		})
		.join("");

	res.render(`one-order`, {
		partials: {
			head: "/partials/header",
			foot: "/partials/footer",
		},
		locals: {
			order: kind,
			allOrders,
		},
	});
});

app.get("/products", (req, res) => {
	const allProducts = product
		.map((p) => {
			return `
        <div class="border border-primary d-flex flex-column">
        <h3 class="p-2">${p.name}</h3>  
        <p class="p-2">${p.price}</p>
        </div>
        `;
		})
		.join("");
	res.render("products", {
		partials: {
			head: "/partials/header",
			foot: "/partials/footer",
		},
		locals: {
			allProducts,
		},
	});
});

app.get("/products/sales", (req, res) => {
	const saleItems = product
		.filter((s) => s.price < s.originalPrice)
		.map((item) => {
			return `
        <div class="border border-primary d-flex flex-column">
        <h3 class="p-2">${item.name}</h3>
        <p class="p-2">SALES PRICE : ${item.price}</p>
        </div>`;
		})
		.join("");

	res.render(`sales`, {
		partials: {
			head: "/partials/header",
			foot: "/partials/footer",
		},
		locals: {
			saleItems,
		},
	});
});

app.get("*", (req, res) => {
	res.status(404).send(`<h1>PAGE NOT FOUND</h1>`);
});

server.listen(port, hostname);
