import request from 'request'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { ObjectId } from 'mongodb'
import db from './database.js'

var app = express()
app.use(cors())
app.use(bodyParser.json())

const API_KEY = 'daS+g8yIafw9gUC5L1ddqg==Rf47FTeXSE5mpwWB'
const port = '8081'
const host = 'localhost'

// USERS

/*
 * Users should be created with the following JSON format:
 *   {
 *     email: ...,
 *     password: ...,
 *     workouts: [],
 *   }
 *
 *   email and password are both strings, while the workouts array will hold strings which are the ids of the workout.
 *   These ids can be extracted when the workout is created, then added to this array.
 */
app.post('/createUser', async (req, res) => {
    let collection = db.collection('users')
    let newUser = req.body
    let result = await collection.insertOne(newUser)
    res.send(result).status(204)
})

/*
 * TODO: Login validation — given email, is password correct?
 * Return entire user object (including password, we're lazy), frontend saves this
 */
app.get('/login', async (req, res) => {
    let collection = db.collection('users')
    const queryForEmail = {
        email: req.query.email,
    }

    let result = await collection.findOne(queryForEmail)

    if (result.password != req.query.password) {
        res.status(400)
        res.send({ message: 'Wrong password' })
    } else {
        res.status(200)
        res.send(result)
    }
})

/*
 * When updating the workouts of a user, make sure to provide the existing array and append anything new
 */
app.put('/updateUser/:email', async (req, res) => {
    let collection = db.collection('users')
    const query = {
        email: req.params.email,
    }

    const newUser = {
        $set: req.body,
    }
    let result = collection.updateOne(query, newUser, null)
    // db.users.updateOne({email:"123"}, {$set: {"password": "diego"}})
    res.send(result).status(200)
})

// Why do we need this?
// app.get('/getUsers', async (_, res) => {
//     const query = {}
//     const results = await db
//         .collection('users')
//         .find(query)
//         .limit(100)
//         .toArray()
//     console.log(results)
//     res.status(200)
//     res.send(results)
// })

// Replace with login (validate password, etc)
// And maybe don't send password back
// app.get('/getUser/', async (req, res) => {
//   const e = req.query.email
//   const p = req.query.password
//   const query = {
//     email: e,
//     password: p
//   }
//   const results = await db.collection('users').findOne(query)
//   console.log('results: ', results)
//   if (!results) res.send('not found').status(404)
//   else res.send(results).status(200)
// })

// IMO out of scope
// app.delete('/deleteUser', async (req, res) => {
//     const collection = db.collection('users')
//     let result = await collection.deleteOne(req.body)
//     res.send(result).status(200)
// })

// WORKOUTS
// app.get('/getWorkouts', async (_, res) => {
//     console.log('Node connected successfully to GET MongoDB')
//     const query = {}
//     const results = await db
//         .collection('workouts')
//         .find(query)
//         .limit(100)
//         .toArray()
//     res.status(200)
//     res.send(results)
// })

// app.post('/createWorkout', async (req, res) => {
//     let collection = db.collection('workouts')
//     // params = JSON.parse(req.body)
//     let newWorkout = req.body
//     let result = await collection.insertOne(newWorkout)
//     res.send(result).status(204)
// })

/*
 * This utilizes the specific _id of the workout generated by MongoDB
 *
 */

// app.get('/getWorkouts/:id', async (req, res) => {
//     const workoutsId = req.params.id
//     console.log('Workout to find :', workoutsId)

//     const o_id = new ObjectId(workoutsId)
//     const query = {
//         _id: o_id,
//     }
//     console.log('HERE IS THE QUERY', query)
//     const results = await db.collection('workouts').findOne(query)
//     console.log('Results :', results)
//     if (!results) res.send('Not Found').status(404)
//     else res.send(results).status(200)
// })

// app.put('/updateWorkout/:id', async (req, res) => {
//     let collection = db.collection('workouts')

//     const query = {
//         _id: req.params.id,
//     }

//     const newWorkout = {
//         $set: req.body,
//     }
//     let result = collection.updateOne(query, newWorkout, null)
//     res.send(result).status(200)
// })

// Similar to what you would expect from most REST APIs, this api endpoint will accept query parameters this way: "/getExercises?muscle=glutes"
app.get('/getExercises', async (req, res) => {
    const { muscle = '', type = '', name = '' } = req.query

    const URL = `https://api.api-ninjas.com/v1/exercises?type=${type}&muscle=${muscle}&name=${name}`

    request
        .get(
            {
                url: URL,
                headers: {
                    'X-Api-Key': API_KEY,
                },
            },
            function (error, response, body) {
                if (error) return console.error('Request failed:', error)
                else if (response.statusCode != 200)
                    return console.error(
                        'Error:',
                        response.statusCode,
                        body.toString('utf8')
                    )
            }
        )
        .pipe(res)
})

app.listen(port, () => {
    console.log('App listening at http://%s:%s', host, port)
})
