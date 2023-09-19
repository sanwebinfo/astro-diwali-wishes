const express = require('express');
const {
    registerFont,
    createCanvas,
    loadImage
} = require('canvas');
const cors = require('cors');
const apicache = require("apicache");
const fetch = require("node-fetch");
const slugify = require('slugify');

const app = express();
const port = 4001;
const cache = apicache.middleware
app.disable("x-powered-by");

// CORS
var allowedOrigins = ['http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:8000/',
    'http://localhost:5173',
];
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

function limit (string = '', limit = 0) {  
    return string.substring(0, limit)
  }

function isValidHttpUrl(string) {
    try {
      const newUrl = new URL(string);
      return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (err) {
      return false;
    }
}

app.listen(port, function() {
    console.log('listening on port ' + port);
});

registerFont('./fonts/mukta-malar-v12-latin-700.ttf', {
    family: 'Mukta Malar'
})

app.get('/', cache('1 hour'), function(req, res) {
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Strict-Transport-Security', 'max-age=63072000');
    res.json('Images API');
});


app.get('/dw/:dw', cache('1 hour'), (req, res) => {
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Strict-Transport-Security', 'max-age=63072000');

    // Define the canvas
    const width = 1080 // width of the image
    const height = 1080 // height of the image
    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    // Define the font style
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = '#341f97'
    context.font = "32px 'Mukta Malar' bold";

    const username = req.query.name || "Generating";
    const firstletter = username.charAt(0).toUpperCase() + username.slice(1)
    const greeting = limit(firstletter, 33)
    const firstname = slugify(greeting, {
        replacement: ' ',
        remove: /[*+~.()'"!:@]/g,
        lower: false,
        strict: false
    });

    if (firstname == 0 || firstname == "") {
        loadImage('./images/diwali.png').then(image => {

            // Draw the background
            context.drawImage(image, 0, 0, 1080, 1080);

            // Draw the text
            context.fillText("Your Name", 536, 259);

            // Convert the Canvas to a buffer
            const buffer = canvas.toBuffer('image/png')

            // Set and send the response as a PNG
            res.set({
                'Content-Type': 'image/png'
            });
            res.send(buffer)
        })
    } else {
        loadImage('./images/diwali.png').then(image => {

            // Draw the background
            context.drawImage(image, 0, 0, 1080, 1080);

            // Draw the text
            context.fillText(firstname.replace(/[-]/g, ' ', ) || 'Hello World', 536, 259);

            // Convert the Canvas to a buffer
            const buffer = canvas.toBuffer('image/png')

            // Set and send the response as a PNG
            res.set({
                'Content-Type': 'image/png'
            });
            res.send(buffer)
        })
    }
});

app.get("/dl/:file", cache('1 hour'), async (req, res) => {

    res.header("X-Frame-Options", "DENY");
    res.header("X-XSS-Protection", "1; mode=block");
    res.header("X-Content-Type-Options", "nosniff");
    res.header("Strict-Transport-Security", "max-age=63072000");

    const url = req.query.url;
    const imageURL = url;
    const random_id = Math.floor(1000 + Math.random() * 9000);
    const basename = "image-dl-" + random_id;
  
    if (isValidHttpUrl(url) == true) {
      const response = await fetch(imageURL);
      const contentType = response.headers.get("Content-Type");
      if (contentType == "image/png") {
        res.writeHead(200, {
          "Content-Disposition": `attachment; filename="${basename}.png"`,
          "content-type": "image/png",
        });
        return response.body.pipe(res);
      } else {
        res.status(200).json({
          error: 1,
          message: "Not a vaid image type",
        });
      }
    } else {
      res.status(200).json({
        error: 1,
        message: "image URL Not Found",
      });
    }
});

app.use('/', function(req, res) {
    res.status(404).json({
        error: 1,
        message: 'Page Not Found'
    });
});

app.use((err, req, res, next) => {
    if (!err) return next();
    return res.status(403).json({
        error: 1,
        message: 'Page Not Found'
    });
});