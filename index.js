const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());


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
        const postCollection = client.db('forumsDb').collection('posts');
        const userCollection = client.db('forumsDb').collection('user');
        const commentCollection = client.db('forumsDb').collection('comments');

        app.get('/comments', async (req, res) => {

            const cursor = await commentCollection.find({})
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/comment', async (req, res) => {

            const { postId, text } = req.body;
            const result = await commentCollection.insertOne({ postId, text, createdAt: new Date() });
            res.send(result);
        }
        );

        app.get('/comments/:postId', async (req, res) => {
            const postId = req.params.postId

            const cursor = await commentCollection.find({ postId })
            const result = await cursor.toArray();

            res.send(result)
        })

        app.post('/save-user', async (req, res) => {

            const { displayName, email, uid, photoURL } = req.body;

            const exitUser = await userCollection.findOne({ email })
            if (!exitUser) {
                const result = await userCollection.insertOne({ displayName, email, uid, photoURL, badge: 'bronze', role: 'user', createdAt: new Date() });
                res.send(result);

            }
            // console.log(req.body, 'req body')
        }
        );
        app.get('/dashboard/:uid', async (req, res) => {
            const uid = req.params.uid;
            const result = await userCollection.findOne({ uid });

            res.send(result);
        })
        app.get('/users', async (req, res) => {
            const cursor = await userCollection.find({})

            const result = await cursor.toArray();

            res.send(result);
        })
        app.put('/user-role', async (req, res) => {

            const { _id } = req.body

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
            const info = { ...newPost, createdAt: new Date() }
            const result = await postCollection.insertOne(info);
            res.send(result);

        })
        app.put('/vote-post/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const { email, type } = req.body;

            const post = await postCollection.findOne(filter)

            if (type == 'up') {
                const submission = {
                    $set: {
                        UpVote: post.UpVote + 1,


                    }
                }

                const result = await postCollection.updateOne(filter, submission, options);
                res.send(result);
            }
            if (type == 'down') {
                const submission = {
                    $set: {
                        DownVote: post.DownVote + 1,


                    }
                }

                const result = await postCollection.updateOne(filter, submission, options);
                res.send(result);
            }


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
            const keyword = req.query.keyword

            let cursor
            if (keyword) {
                cursor = await postCollection.find({ tag: keyword.toLowerCase() });
            } else {

                cursor = await postCollection.find({}).sort({
                    createdAt: -1
                })
            }
            const result = await cursor.toArray();

            res.send(result);
        })


        app.get('/posts/:email', async (req, res) => {
            const email = req.params.email;
            // const query = { _id: new ObjectId(id) }
            const cursor = await postCollection.find({ email });
            const result = await cursor.toArray();

            res.send(result);
        })
        app.get('/post/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await postCollection.findOne(query);

            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
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