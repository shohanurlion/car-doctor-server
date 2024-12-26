const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://mohamilon-44ed4.web.app' ,'https://mohamilon-44ed4.firebaseapp.com/'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nu75c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const serviceCollection = client.db('carService').collection('services');
    const bookingCollection = client.db('carService').collection('booking');

        // auth related api
        app.post('/jwt',async (req, res) => {
          const user = req.body;
          console.log(user);
          const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET , {
            expiresIn: '1h'
        });
        res
        .cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
        })
        res.send({ success: true })
      })

    app.get('/services', async(req , res)=>{
        const cursor = serviceCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
    };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    app.get('/booking', async(req , res)=>{
      console.log(req.query.email);
      console.log('ttttt token', req.cookies.token)
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })
    app.post('/booking', async(req , res)=>{
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
      
    });

    app.patch('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const updateDoc = {
          $set: {
              status: updatedBooking.status
          },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
  });
    app.delete('/booking/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req , res)=>{
    res.send('Hello World'); // Correct
});

app.listen(port, ()=>{
    console.log(`Server is running ${port}`);
    
})