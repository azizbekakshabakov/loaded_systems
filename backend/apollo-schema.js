import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
// import { json } from 'body-parser';
import express from 'express';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
// import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { Car } from './schemas/car.js'; // Your Mongoose Car schema
import { authModMiddleware } from './middleware/auth.js';
import { redisClient } from './modules/redisClient.js';
import multer from 'multer';
import axios from 'axios';

// Define GraphQL schema
const typeDefs = `#graphql
type Car {
    id: ID!
    name: String!
    description: String!
    image: String!
    tariff: String!
}

type Query {
    cars: [Car!]!
    car(id: ID!): Car
}

type Mutation {
    createCar(name: String!, description: String!, tariff: String!, image: Upload!): Car
    updateCar(id: ID!, name: String, description: String, tariff: String): Car
    deleteCar(id: ID!): String
}

scalar Upload
`;

// Define resolvers
const resolvers = {
    Query: {
        cars: async () => {
            const key = '__express__/cars';
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                console.log('Fetched from cache');
                return JSON.parse(cachedData);
            }

            const cars = await Car.find();
            await redisClient.set(key, JSON.stringify(cars), 'EX', 3600);
            return cars;
        },
        car: async (_, { id }) => {
            return await Car.findById(id);
        },
    },
    Mutation: {
        createCar: async (_, { name, description, tariff, image }) => {
            const { createReadStream, filename } = await image;

            // Create FormData for the image
            const formData = new FormData();
            const stream = createReadStream();
            formData.append('image', stream, filename);

            console.log("Azizchik", image);

            // Send the image to another server
            // const result = await axios.post('http://localhost:3001/add-image', formData, {
            //     headers: formData.getHeaders(),
            // });
            // const imageUrl = result.data.image;

            // Save the car data
            const newCar = new Car({
                name,
                description,
                image: 'imageUrl',
                tariff,
            });

            // await newCar.save();
            return newCar;
        },
        updateCar: async (_, { id, name, description, tariff }) => {
            const car = await Car.findByIdAndUpdate(id, { name, description, tariff }, { new: true });
            return car;
        },
        deleteCar: async (_, { id }) => {
            await Car.findByIdAndDelete(id);
            return 'Car deleted';
        },
    },
};

const startServer = async () => {
    const app = express();

    // Apollo Server setup
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();

    // Express middlewares
    app.use(graphqlUploadExpress());
    // app.use(authModMiddleware); // Apply your authentication middleware
    app.use('/graphql', expressMiddleware(server, {
        context: async ({ req }) => ({ req }), // Provide context if needed
    }));

    // Start the Express app
    app.listen({ port: 4000 }, () => {
        console.log(`🚀 Server ready at http://localhost:4000/graphql`);
    });
};

startServer();
