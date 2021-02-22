import "./config.js";
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import expressSession from "express-session";
import OktaMiddlewarePKG from "@okta/oidc-middleware";
import bodyParser from "body-parser";
import cors from "cors";

const {ExpressOIDC} = OktaMiddlewarePKG;

// routes
import apiRouter from "./routes/api.js";

var app = express();
const __dirname = path.resolve();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "REPORT"]
}));

// express session
app.use(expressSession({
  secret: process.env.APP_SECRET,
  resave: true,
  saveUninitialized: false,
}));

// okta middleware auth
const oidc = new ExpressOIDC({
  appBaseUrl: process.env.HOST_URL,
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  redirect_uri: `${process.env.HOST_URL}/okta/login`,
  scope: "openid profile",
  routes: {
    loginCallback: {
      path: "/okta/login"
    }
  }
});

app.use(oidc.router);

// todo: figure out static file server or let this server host the client
app.use(express.static(path.join(__dirname, 'public')));

// middleware authentication stuff
app.use((req, res, next) => {

  // for development - speed things up & stop hitting okta every time the server restarts
  if (process.env.SKIP_AUTH) {
    req.userContext = {
      userInfo: {
        preferred_username: "noauthuser",
        app_role: "admin" // change this as needed, admin or user
      }
    };
    return next();
  }

  if (!req.userContext) {
    return res.redirect("/login");
  }

  next();
});

app.use("/api", apiRouter);

// catch 404 and forward to error handler - may end up serving client spa
app.use("/*", (req, res, next) => {
  // client consideration
  // res.sendFile(path.join(__dirname, "public", "index.html"));
  res.status(404).send(`Invalid request "${req.originalUrl}"`);
});


export default app;
