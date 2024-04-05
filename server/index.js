const PORT = 8000
const express = require('express')
const { MongoClient } = require('mongodb')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcrypt')
require('dotenv').config()

const uri = process.env.URI

// URI= mongodb+srv://aderemipelumi:m1pGRJ3fXYRTMFF2@cluster0.fq0mfz1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

const app = express()
app.use(cors())
app.use(express.json())




app.get('/perform-matching', async (req, res) => {
    const { userId, gender, minAge, maxAge } = req.query;
    const client = new MongoClient(uri)


    // Function to calculate distance between two points using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        const miles = distance * 0.621371; // Convert distance to miles
        return miles;
    };

    // Function to convert degrees to radians
    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };



    console.log('User ID:', userId);
    console.log('Gender:', gender);
    console.log('Min Age:', minAge);
    console.log('Max Age:', maxAge);


    try {
        await client.connect();
        let query = {}

        const database = client.db('app-data');
        const usersCollection = database.collection('users');

        // Check if gender interest is specified
        if (gender && gender !== 'everyone') {
            query.gender_identity = gender
        }

        // Filter users based on age range
        if (minAge && maxAge) {
            query.age = { $gte: parseInt(minAge), $lte: parseInt(maxAge) }
        }

        // Fetch userA from database
        const userAData = await usersCollection.findOne({ user_id: userId });
        const userA = {
            user_id: userAData.user_id,
            distance_preference: parseInt(userAData.distance_preference),
            motive_interest: userAData.motive_interest,
            latitude: userAData.latitude,
            longitude: userAData.longitude
        };

        // Fetch potential matches (userB) from gendered users
        const potentialMatches = await usersCollection.find(query).toArray();

        // Calculate distance between userA and each potential match (userB),
        // and rank potential matches based on distance and motive interest
        const rankedMatches = potentialMatches.map(userB => {
            const distance = calculateDistance(userA.latitude, userA.longitude, userB.latitude, userB.longitude);
            let rank = 0;

            // Check if userB has set their motive interest
            if (userB.motive_interest) {
                // Check if userB has the same motive interest as userA
                if ((userB.motive_interest === userA.motive_interest)&& userB.latitude) {
                    rank += 4; // Higher rank for same motive interest
                } else if((userB.motive_interest !== userA.motive_interest) && userB.latitude){
                    rank += 3; // Lower rank for different motive interest
                } else if ((userB.motive_interest === userA.motive_interest) && !userB.latitude){
                    rank +=2;
                }  else if ((userB.motive_interest !== userA.motive_interest) && !userB.latitude){
                    rank +=1;
                }
            }

            return {
                user: userB,
                rank: rank
            };
        });

        // Sort the ranked matches by rank in descending order
        rankedMatches.sort((a, b) => {
            // First, compare ranks
            if (b.rank !== a.rank) {
                return b.rank - a.rank; // Higher rank comes first
            } else {
                // If ranks are equal, compare distances
                const distanceA = calculateDistance(userA.latitude, userA.longitude, a.user.latitude, a.user.longitude);
                const distanceB = calculateDistance(userA.latitude, userA.longitude, b.user.latitude, b.user.longitude);
                // Lower distance comes first
                return distanceA - distanceB;
            }
        });
        // Extract user data from the ranked matches
        const matchedUsers = rankedMatches.map(match => match.user);

        // Return matched users
        // console.log()
        res.json(matchedUsers);

    } catch (error) {
        console.error('Error performing matching:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (client) {
            await client.close();
        }
    }
});



// Default
app.get('/', (req, res) => {
    res.json('Hello to my app')
})

// Sign up to the Database
app.post('/signup', async (req, res) => {
    const client = new MongoClient(uri)
    const { email, password } = req.body

    const generatedUserId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const existingUser = await users.findOne({ email })

        if (existingUser) {
            return res.status(409).send('User already exists. Please login')
        }

        const sanitizedEmail = email.toLowerCase()

        const data = {
            user_id: generatedUserId,
            email: sanitizedEmail,
            hashed_password: hashedPassword
        }

        const insertedUser = await users.insertOne(data)

        const token = jwt.sign(insertedUser, sanitizedEmail, {
            expiresIn: 60 * 24
        })
        res.status(201).json({ token, userId: generatedUserId })

    } catch (err) {
        console.log(err)
    } finally {
        await client.close()
    }
})

// Log in to the Database
app.post('/login', async (req, res) => {
    const client = new MongoClient(uri)
    const { email, password } = req.body

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const user = await users.findOne({ email })

        const correctPassword = await bcrypt.compare(password, user.hashed_password)

        if (user && correctPassword) {
            const token = jwt.sign(user, email, {
                expiresIn: 60 * 24
            })

            // Check if user has completed onboarding
            const redirectTo = user.user_name ? '/dashboard' : '/onboarding'

            res.status(201).json({ token, userId: user.user_id, redirectTo })
        }

        res.status(400).json('Invalid Credentials')

    } catch (err) {
        console.log(err)
    } finally {
        await client.close()
    }
})


// Forgot Password - Reset Password
app.post('/forgot-password', async (req, res) => {
    const client = new MongoClient(uri)
    const { email, newPassword, confirmPassword } = req.body

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        // Check if newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' })
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update the user's password in the database
        const query = { email }
        const updateDocument = {
            $set: {
                hashed_password: hashedPassword
            },
        }

        const result = await users.updateOne(query, updateDocument)

        if (result.modifiedCount === 0) {
            // If no user with the provided email was found
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json({ message: 'Password updated successfully' })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error' })
    } finally {
        await client.close()
    }
})



// Get individual user
app.get('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const userId = req.query.userId

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id: userId }
        const user = await users.findOne(query)
        res.send(user)

    } finally {
        await client.close()
    }
})

// Update User with a match
app.put('/addmatch', async (req, res) => {
    const client = new MongoClient(uri)
    const { userId, matchedUserId } = req.body

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id: userId }
        const updateDocument = {
            $push: { matches: { user_id: matchedUserId } }
        }
        const user = await users.updateOne(query, updateDocument)
        res.send(user)
    } finally {
        await client.close()
    }
})

// Get all Users by userIds in the Database
app.get('/users', async (req, res) => {
    const client = new MongoClient(uri)
    const userIds = JSON.parse(req.query.userIds)

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const pipeline =
            [
                {
                    '$match': {
                        'user_id': {
                            '$in': userIds
                        }
                    }
                }
            ]

        const foundUsers = await users.aggregate(pipeline).toArray()

        res.json(foundUsers)

    } finally {
        await client.close()
    }
})

// Update a User in the Database
app.put('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const formData = req.body.formData

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const query = { user_id: formData.user_id }

        // Validate username
        const usernameRegex = /^[a-zA-Z0-9_.\-]{4,15}$/;
        if (!usernameRegex.test(formData.user_name)) {
            return res.status(400).json({ error: 'Username must be between 4 and 15 characters long and may only contain letters, numbers, underscores (_), dashes (-), and periods (.)' });
        }

        // Calculate age from date of birth
        const birthDate = new Date(`${formData.dob_year}-${formData.dob_month}-${formData.dob_day}`);
        const today = new Date();
        const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

        // Calculate age range
        const minAge = parseInt(formData.min_age);
        const maxAge = parseInt(formData.max_age);
        const ageRange = maxAge - minAge;

        const updateDocument = {
            $set: {
                first_name: formData.first_name,
                last_name: formData.last_name,
                user_name: formData.user_name,
                dob_day: formData.dob_day,
                dob_month: formData.dob_month,
                dob_year: formData.dob_year,
                age: age,
                min_age: formData.min_age,
                max_age: formData.max_age,
                age_range: ageRange,
                show_gender: formData.show_gender,
                gender_identity: formData.gender_identity,
                gender_interest: formData.gender_interest,
                motive_interest: formData.motive_interest,
                interests: formData.interests,
                url: formData.url,
                about: formData.about,
                matches: formData.matches,
                occupation: formData.occupation,
                zip_code: formData.zip_code,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                longitude: formData.longitude,
                latitude: formData.latitude,
                distance_preference: formData.distance_preference,
            },
        }

        const insertedUser = await users.updateOne(query, updateDocument)

        res.json(insertedUser)

    } finally {
        await client.close()
    }
})

// Get Messages by from_userId and to_userId
app.get('/messages', async (req, res) => {
    const { userId, correspondingUserId } = req.query
    const client = new MongoClient(uri)

    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')

        const query = {
            from_userId: userId, to_userId: correspondingUserId
        }
        const foundMessages = await messages.find(query).toArray()
        res.send(foundMessages)
    } finally {
        await client.close()
    }
})

// Add a Message to our Database
app.post('/message', async (req, res) => {
    const client = new MongoClient(uri)
    const message = req.body.message

    try {
        await client.connect()
        const database = client.db('app-data')
        const messages = database.collection('messages')

        const insertedMessage = await messages.insertOne(message)
        res.send(insertedMessage)
    } finally {
        await client.close()
    }
})


app.listen(PORT, () => console.log('server running on PORT ' + PORT))
