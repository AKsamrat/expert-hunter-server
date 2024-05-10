const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const config = process.env;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nj7eiar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client
  .connect()
  .then(() => {
    // console.log('MongoDB Connected'.blue.bold);
  })
  .catch(err => {
    console.log(err.red);
  });
const corsConfig = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

//verify token

async function run() {
  try {
    //database collections are here
    const database = client.db('expertHunter');
    const jobsCollection = database.collection('jobs');
    const appliedCollection = database.collection('applied');

    //for myjobs data load-----------------------------------

    app.get('/myJobs/:email', async (req, res) => {
      const email = req.params.email;
      const query = { owner_email: email };
      console.log(query);
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    //Add job  data in database

    app.post('/addJob', async (req, res) => {
      const jobData = req.body;
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    });

    //for delete job item
    app.delete('/deleteJob/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

// Connection
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('YOUR server is live');
});
app.listen(PORT, () => {
  console.log(`App running in port:  ${PORT}`);
});
