const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.odg1wqu.mongodb.net/`;



const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {

        // await client.connect();
        const postCollection = client.db('assignmentDb').collection('assignment');
        const userCollection = client.db('assignmentDb').collection('user');

        app.post('/save-user', async (req, res) => {

            const { displayName, email, uid, photoURL } = req.body;

            const exitUser = await userCollection.findOne({ email })
            if (!exitUser) {
                const result = await userCollection.insertOne({ displayName, email, uid, photoURL, badge: 'bronze', role: 'user' });
                res.send(result);
                console.log(result)
            }
            // console.log(req.body, 'req body')
        }
        );
        app.get('/dashboard/:uid', async (req, res) => {
            const uid = req.params.uid;
            const result = await userCollection.findOne({ uid });
            console.log(result, 'user detail')
            res.send(result);
        })
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({})

            const result = await cursor.toArray();

            res.send(result);
        })
        app.put('/user-role', async (req, res) => {
            console.log(req.body)
            const { _id } = req.body
            console.log('id', _id)
            const filter = { _id: new ObjectId(_id) }
            const options = { upsert: true };

            const submission = {
                $set: {
                    role: 'admin'

                }
            }

            const result = await userCollection.updateOne(filter, submission, options);
            res.send(result);
        })


        app.post('/post', async (req, res) => {
            const newPost = req.body;
            const result = await postCollection.insertOne(newPost);
            res.send(result);

        })


        app.put('/submission/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateSubmission = req.body;
            const submission = {
                $set: {
                    mark: updateSubmission.mark,
                    status: updateSubmission.status,

                }
            }

            const result = await submissionCollection.updateOne(filter, submission, options);
            res.send(result);
        })
        app.delete('/submission/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) }
            const result = await submissionCollection.deleteOne(query);

            res.send(result);
        })


        app.get('/posts', async (req, res) => {
            const value = req.query.status

            let cursor
            if (value) {
                cursor = postCollection.find({ status: 'pending' });
            } else {
                cursor = postCollection.find({})
            }
            const result = await cursor.toArray();

            res.send(result);
        })


        app.get('/post/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await postCollection.findOne(query);
            console.log(result, 'post detail')
            res.send(result);
        })


        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server of assignment 12')
})

app.listen(port, () => {
    console.log(`assignment Server is running on port: ${port}`)
})