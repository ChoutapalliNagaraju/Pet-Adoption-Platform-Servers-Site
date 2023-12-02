const express = require('express');
const cors = require('cors');
const app=express();
//require jwt
const jwt =require('jsonwebtoken')
//cookie
const cookieParser=require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5007;

//middleware
app.use(cors({
  origin:[
    'http://localhost:5173'
  ],
  credentials:true,
  optionSuccessStatus: 200
}));
app.use(cookieParser());
app.use(express.json());





//const uri = "mongodb+srv://<username>:<password>@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wv2vf1c.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware for cookie parser
const logger=(req,res,next)=>{
  console.log('cookiee',req.method,req.url);
  next();
}
// const verifyToken=(req,res,next)=>{
//   const token=req?.cookies?.token;
//   console.log('middleware verify token:',token);
//   if(!token){
//     return res.status(401).send({message:'Unautharized Access'})
//   }
//   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded))
//   {
//     if(err){
//     return res.status(401).send({message:'Unautharized Access'})
//     req.user=decoded;
//     next();
//   }
// }
// }
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available 
  if (!token) {
      return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
      }
      req.user = decoded;
      next();
  })
}



async function run() {
    try {
     
    const PetCategoryCollection =client.db('PetAdoption').collection('PetCategory')
    const petsCollection=client.db('PetAdoption').collection('pets')
    const addAdoptCollection=client.db('PetAdoption').collection('addtoadopt')
    const addDonationCampCollection=client.db('PetAdoption').collection('adddonationcamp')
    const usersCollection=client.db('PetAdoption').collection('users')

//jwt login
app.post('/jwt',async(req,res)=>{
  const user=req.body;
  console.log('user for token',user);
  const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
  res.cookie('token',token,{
    httpOnly:true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  })
  .send({success:true});
 })

 //jwt logout
 app.post('/logout',async(req,res)=>{
  const user = req.body;
  // res.clearCookie('token',{maxAge:0,secure: process.env.NODE_ENV === 'production', 
  // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',})
  // send({success:true})
 res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true }).send({ success: true })
 })


    //home page a book category niyechi
    app.get('/PetCategory',async(req,res)=>{
      const cursor=PetCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

  app.get('/pets',async(req,res)=>{
    const cursor=petsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})
app.post('/pets',async(req,res)=>{
  const newPet=req.body;
  console.log(newPet); 

 const result=await petsCollection.insertOne(newPet);
 res.send(result)
 
})
// Add this endpoint to fetch a pet by ID
app.get('/pets/:id', async (req, res) => {
  const petId = req.params.id;

  try {
    const result = await petsCollection.findOne({ _id:new ObjectId(petId) });
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: 'Pet not found' });
    }
  } catch (error) {
    console.error('Error fetching pet data:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

app.get('/addtoadopt',async(req,res)=>{
 
  const cursor=addAdoptCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})
app.post('/addtoadopt',async(req,res)=>{
  const addtoadopt=req.body;
  console.log(addtoadopt); 

 const result=await addAdoptCollection.insertOne(addtoadopt);
 res.send(result)
 
})


// Backend API endpoint to fetch donation campaign details by ID
// app.get('/donationcampaigndetails/:id', async (req, res) => {
//   const id = req.params.id;

//   try {
//     const result = await addDonationCampCollection.findOne({ _id: new ObjectId(id) });

//     if (result) {
//       res.send(result);
//     } else {
//       res.status(404).send({ message: 'Donation campaign not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching donation campaign data:', error);
//     res.status(500).send({ message: 'Internal server error', error: error.message });
//   }
// });
app.get('/adddonationcamp/:id',async(req,res)=>{
  const id= req.params.id;
  const query ={_id: new ObjectId(id)}
 
  const result = await  addDonationCampCollection.findOne(query);
  res.send(result);
})
// app.get('/books',logger,verifyToken,async(req,res)=>{
//   console.log(req.query.email);
//   console.log('token owner info:',req.user);
//   if(req.user.email!==req.query.email){
//     return res.status(403).send({message:'forbidden'})
//   }
//   // let quary={};
//   // if(req.query?.email){
//   //   quary={email:req.query.email}
//   // }
//   // const cursor=booksCollection.find();
//   // const result = await cursor.toArray();
//   const result=await booksCollection.find().toArray()
//   res.send(result);
// })

// app.post('/books',async(req,res)=>{
//   const newBook=req.body;
//   console.log(newBook); 

//  const result=await booksCollection.insertOne(newBook);
//  res.send(result)
 
// })
// //get by category name
// app.get('/booksbycategory/:category_name',async(req,res)=>{
//   const category_name = req.params.category_name;
//   query={category_name: category_name }
//     const result = await booksCollection.find(query).toArray();
//   res.send(result);
// })

// get operation for update books
// app.get('/pets/:id', async (req, res) => {
//   const petId = req.params.id;

//   try {
//     console.log('Pet ID:', petId); // Add this line for debugging
//     const result = await petsCollection.findOne({ _id: new ObjectId(petId) });

//     if (result) {
//       res.send(result);
//     } else {
//       res.status(404).send({ message: 'Pet not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching pet data:', error);
//     res.status(500).send({ message: 'Internal server error' });
//   }
// });
app.post('/adddonationcamp',async(req,res)=>{
    const newdonationcamp=req.body;
    console.log(newdonationcamp); 
  
   const result=await addDonationCampCollection.insertOne(newdonationcamp);
   res.send(result)
   
  })
  app.get('/adddonationcamp',async(req,res)=>{
 
    const cursor=addDonationCampCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  })

app.put('/pets/:petId',async(req,res)=>{
  const id =req.params.petId;
  console.log(id);
  const filter={_id:new ObjectId(id)}
  const options={upsert:true};
  const updatedpet=req.body;
  const pet={
    $set:{
      name:updatedpet.name,
      image:updatedpet.image,
      category:updatedpet.category,
      age:updatedpet.age,
      location:updatedpet.location,
      
      shortdesp:updatedpet.shortdesp,
      longdesp:updatedpet.longdesp,
     
    }
  }
  console.log(pet);
  const result = await petsCollection.updateOne(filter,pet,options);
  res.send(result)
})

app.delete('/pets/:id', async(req,res)=>{
  const id =req.params.id;
  console.log(id);
  const query={_id:new ObjectId(id)}
  const result = await petsCollection.deleteOne(query);
  res.send(result);
})


app.patch('/pets/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Validate if id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ObjectId' });
    }

    // Find the pet by id and update adopt_req status
    const updatedPet = await petsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { adopted: true } },
      { returnDocument: 'after' } // Return the updated document
    );

    if (!updatedPet.value) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(updatedPet.value);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/users',async(req,res)=>{
  const newuser=req.body;
  
  const query={email:newuser.email}
  const existingUser=await usersCollection.findOne(query);
  if(existingUser){
    return res.send({message:'user already exists',insertedId:null})
  }
  console.log('server',newuser); 

 const result=await usersCollection.insertOne(newuser);
 res.send(result)
 
})
//get all users
app.get('/users',async(req,res)=>{
 
  const cursor=usersCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})
//make admin
app.patch('/users/admin/:id',async(req,res)=>{
 const id =req.params.id;
 const filter={_id:new ObjectId(id)};
 const updatedDoc={
  $set:{
    role:'Admin'
  }
 }
 
  const result = await usersCollection.updateOne(filter,updatedDoc);
  res.send(result);
})
//make adopted 
app.patch('/admin/adopted/:id',async(req,res)=>{
  const id =req.params.id;
  const filter={_id:new ObjectId(id)};
  const updatedDoc={
   $set:{
     adopted:true,
   }
  }
  
   const result = await petsCollection.updateOne(filter,updatedDoc);
   res.send(result);
 })
 app.patch('/admin/notadopted/:id',async(req,res)=>{
  const id =req.params.id;
  const filter={_id:new ObjectId(id)};
  const updatedDoc={
   $set:{
     adopted:false,
   }
  }
  
   const result = await petsCollection.updateOne(filter,updatedDoc);
   res.send(result);
 })

// //  add to borrowed books

// app.get('/addtoborrow',async(req,res)=>{
 
//   const cursor=addBorrowedCollection.find();
//   const result = await cursor.toArray();
//   res.send(result);
// })

// // remove book/return book
// app.post('/deleteborrow/:id', async(req,res)=>{
//   const id =req.params.id;
//   const bookId=req.body.bookId;
//   console.log(id);
//   console.log(req.body.bookId);
  
//   const query={_id:new ObjectId(id)}
//   const result = await addBorrowedCollection.deleteOne(query);

//   const result2= await booksCollection.updateOne(
//             {bookId:bookId},
//             { $inc: { quantity: +1 } }
//           );
//   res.send({result,result2});
// })


// //borrow and quantity reduce
// app.post('/addtoborrow', async (req, res) => {
//   const addtoborrow = req.body;
//   const bookname = req.body.name;
//   const userEmail = req.body.userEmail;
//   console.log(bookname, userEmail);

//   try {
//     // Check if the user has already borrowed the book
//     const output = await addBorrowedCollection.findOne({
//       name: bookname,
//       userEmail: userEmail,
//     });

//     if (!output)
//      {
//       const result = await addBorrowedCollection.insertOne(addtoborrow);

//       if (result.insertedId) {
//         const bookId = addtoborrow.bookId;
//         console.log('bookId', bookId);

//         // Decrease the quantity of the borrowed book by 1
//         const borrowedBook = await booksCollection.findOne({ bookId: bookId });

//         if (borrowedBook) {
//           const updatedQuantity = borrowedBook.quantity - 1;
//           console.log('updated quantity', updatedQuantity);

//           if (updatedQuantity >= 0) {
//             // Ensure quantity doesn't go below zero
//             await booksCollection.updateOne(
//               { bookId: bookId },
//               { $set: { quantity: updatedQuantity } }
//             );

//             return res.status(200).json({ message: 'Book Borrowed Successfully' });
//           } else {
//             return res.status(400).json({ error: 'Book is out of stock' });
//           }
//         } else {
//           return res.status(404).json({ error: 'Book not found' });
//         }
//       }

//       return res.status(500).json({ error: 'Failed to borrow the book' });
//     }

//     return res.status(400).json({ error: 'You have already borrowed that book' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
     
    }
  }
  run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('pet adoption is running in server')
})
app.listen(port,()=>{
    console.log(`pet adoptionis running on port : ${port}`);
})


