// import { json } from 'body-parser';
// import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import {Car} from '../schemas/car.js'; // Your Mongoose Car schema
import {authAnyRoleMiddlewareGraphQL, authModMiddlewareGraphQL, authUserMiddlewareGraphQL} from '../middleware/auth.js';
import {redisClient} from '../modules/redisClient.js';
import axios from 'axios';
import FormData from 'form-data';
import {User} from "../schemas/user.js";
import {Usercar} from "../schemas/usercar.js";
import {queryResolvers} from "./queryResolvers.js";
import {mutationResolvers} from "./mutationResolvers.js";

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

# for balance etc.
type User {
    _id: ID!
    email: String!
    role: String!
    balance: Float!
}

type Query {
    cars: [Car!]!
    car(_id: ID!): Car
    user: User
}

type Mutation {
    createCar(name: String!, description: String!, tariff: Float!, image: Upload!): Car
    updateCar(_id: ID!, name: String!, description: String!, tariff: Float!): Car
    deleteCar(_id: ID!): String
    rent(carId: ID!): String
}

scalar Upload
`;

// Резолверы
export const resolvers = {
    Query: queryResolvers,
    Mutation: mutationResolvers
};

export default {typeDefs, resolvers};