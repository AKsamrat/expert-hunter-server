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

    //all jobs load
    app.get('/allJobs', async (req, res) => {
      const search = req.query.search;
      let query = {
        job_title: { $regex: search, $options: 'i' },
      };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

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
    //for update jobs
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      // console.log(result);

      res.send(result);
    });

    app.put('/updateJob/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const jobData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...jobData,
        },
      };
      const result = await jobsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    //apply job
    app.post('/applyJob', async (req, res) => {
      const jobData = req.body;
      const query = {
        applicant_email: jobData.applicant_email,
        jobId: jobData.jobId,
      };

      const alreadyapplied = await appliedCollection.findOne(query);

      console.log(alreadyapplied);
      if (alreadyapplied) {
        return res.status(400).send('You have already apply on this job');
      }
      const result = await appliedCollection.insertOne(jobData);
      res.send(result);
    });

    app.get('/appliedJobs/:email', async (req, res) => {
      const email = req.params.email;
      const filter = req.query.filter;
      let query = { applicant_email: email };
      if (filter) query.category = filter;
      console.log(query);
      const result = await appliedCollection.find(query).toArray();
      res.send(result);
    });
    // app.get('/appliedJobs', async (req, res) => {
    //   const filter = req.query.filter;

    //   if (filter) query.category = filter;
    //   console.log(query);
    //   const result = await appliedCollection.find(query).toArray();
    //   res.send(result);
    // });
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
