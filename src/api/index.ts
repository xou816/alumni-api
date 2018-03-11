import * as express from "express";
import * as bodyParser from 'body-parser'; 
import router from "./router";

let app = express();
app.use(bodyParser.json());
app.use('/', router);
let port = process.env.PORT != null ? process.env.PORT : 3000;
app.listen(port, () => console.log(port));