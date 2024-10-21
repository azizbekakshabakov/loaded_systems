import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
// import { json } from 'body-parser';
import express from 'express';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
// import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { Car } from '../schemas/car.js'; // Your Mongoose Car schema
import { authModMiddleware, authModMiddlewareGraphQL } from '../middleware/auth.js';
import { redisClient } from '../modules/redisClient.js';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

// Define GraphQL schema
export const typeDefs = `#graphql
type Car {
    _id: ID!
    name: String!
    description: String!
    image: String!
    tariff: Float!
    enabled: Boolean
}

#type 

type Query {
    cars: [Car!]!
    car(_id: ID!): Car
}

type Mutation {
    createCar(name: String!, description: String!, tariff: Float!, image: Upload!): Car
    updateCar(_id: ID!, name: String, description: String, tariff: Float): Car
    deleteCar(_id: ID!): String
}

scalar Upload
`;

const applyMiddleware = (middleware, resolver) => {
    return middleware(resolver);
};

// Define resolvers
export const resolvers = {
    Query: {
        cars: applyMiddleware(authModMiddlewareGraphQL, async () => {
                const key = '__express__/cars';
                const cachedData = await redisClient.get(key);
                if (cachedData) {
                    console.log('Fetched from cache');
                    return JSON.parse(cachedData);
                }

                const cars = await Car.find();
                await redisClient.set(key, JSON.stringify(cars), 'EX', 3600);
                return cars;
            }
        ),
        car: async (_, { _id }) => {
            return await Car.findById(_id);
        },
    },
    Mutation: {
        createCar: applyMiddleware(authModMiddlewareGraphQL, async (_, { name, description, tariff, image }) => {
                const upload = await image;
                const { file } = upload;

                const { createReadStream, filename, mimetype, encoding } = file;
                console.log('azik', file);

                // Создать form data из файла/картинки
                const formData = new FormData();
                const stream = createReadStream();
                formData.append('image', stream, {
                    filename: filename,
                    contentType: mimetype
                });

                // Отпр файл на другой сервис
                const result = await axios.post('http://localhost:3001/add-image', formData, {
                    headers: formData.getHeaders(),
                });
                const imageUrl = result.data.image;

                // Save car
                const newCar = new Car({
                    name,
                    description,
                    image: imageUrl,
                    tariff,
                });

                await newCar.save();
                return newCar;
            }
        ),
        updateCar: async (_, { _id, name, description, tariff }) => {
            const car = await Car.findByIdAndUpdate(_id, { name, description, tariff }, { new: true });
            return car;
        },
        deleteCar: async (_, { _id }) => {
            await Car.findByIdAndDelete(_id);
            return 'Car deleted';
        },
    },
};

export default {typeDefs, resolvers};