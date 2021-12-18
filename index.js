const express  = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv').config();
const objectId = require('mongodb').ObjectId;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jrudo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
   try{
        await client.connect();
        const database = client.db("PrimRose");
        const allProductCollection = database.collection("All_Product");
        const allUser = database.collection("All_User");
        const allOrders = database.collection("All_Orderrs");
        const allReview = database.collection("All_Reviews");
        
      
        

        //Get Request

        app.get("/",async(req,res) => {
            res.send("Well Come");
        });

        app.get("/all-products", async(req,res) => {
            let {limit} = req.query;
            limit = parseInt(limit);
            let result;
            if(limit) {
                result = await allProductCollection.find({}).limit(limit).toArray();
                res.status(200).send(result);
            }
            else {
                result = await allProductCollection.find({}).toArray();
                res.status(200).send(result);
            }
        });

        app.get('/single-product',async(req,res) => {
            const {productId} = req.query;                             
            const result = await allProductCollection.findOne({_id: objectId(productId)});                 
            res.send(result);
        });

        app.get('/chack-isAdmin', async(req, res) => {
            const {email} = req.query;
            const user = await allUser.findOne({email: email});
            let isAdmin = false;
            if(user?.role === 'admin') {
                isAdmin = true;
            }
            res.status(200).json({isAdmin});
        })

        app.get('/all-orders', async (req, res) =>{
            const {userEmail} = req.query;
            let result;
            if(userEmail) {
                result = await allOrders.find({userEmail: userEmail}).toArray();
            }
            else {
                result = await allOrders.find({}).toArray();
            } 
            res.send(result);
        })


        app.get('/all-reviews', async (req, res) => {
            const {userEmail} = req.query;
            let result;
            if(userEmail) {
                result = await allReview.find({userEmail: userEmail}).toArray();
                res.send(result);
            } 
            else {
                result = await allReview.find({}).toArray();
                res.send(result);
            }
        })

        // Post Request

        app.post('/add-new-product', async(req,res) => {
            const product = req.body;
            const result = await allProductCollection.insertOne(product);
            res.send(result);
        })

        app.post('/add-new-user', async(req,res) => {
            const data = req.body;            
            await allUser.insertOne(data);
            res.end();
        })

        app.post('/add-new-order', async(req,res) => {
            const data = req.body;
            const result = await allOrders.insertOne(data);
            res.send(result);
        })

        app.post('/add-new-review', async(req,res) => {
            const reviewData = req.body;
            const result = await allReview.insertOne(reviewData);
            res.send(result);
        })

        //Update Request

        app.patch('/update-product-info', async(req,res) => {
            const {productId} = req.query;                     
            const data = req.body;
            
            const filter = {_id: objectId(productId)};
            const updateDoc = {
               $set:{
                    productName: data.productName,
                    productImage: data.productImage,
                    productDetails: data.productDetails,
                    mainPrice: data.mainPrice,
                    offerPrice: data.offerPrice,
                    productQuantity: data.productQuantity,
               }
            }

            const result = await allProductCollection.updateOne(filter,updateDoc);
            res.status(200).json(result);
        });

        app.patch('/create-new-admin', async (req, res) => {
            const {email} = req.body;
            
            const filter = {email: email};          
            const updateDoc = {
                $set:{
                    role: 'admin',
                }
            };
            const result = await allUser.updateOne(filter,updateDoc);            
            res.status(201).json(result);           
        })

        app.patch('/update-product-status',async (req, res) => {
            const {orderId} = req.query;
            const data = req.body;            
            const filter = {_id: objectId(orderId)};
            const updateDoc = {
                $set:{
                    orderStatus: data.newOrderStatus,
                }
            }

            const result = await allOrders.updateOne(filter,updateDoc);
            res.send(result);            
        })

        //Delete Request

        app.delete('/delete-single-product',async(req,res) => {
            const {productId} = req.query;
            const result = await allProductCollection.deleteOne({_id: objectId(productId)});
            res.send(result);
        })
   }
   catch(error) {
       console.log(error.message);
   }
   finally{
       //await client.close();
   }
}

run();


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server is running at port ${port}`);
});