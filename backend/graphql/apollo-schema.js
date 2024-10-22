// import { json } from 'body-parser';
// import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import {Car} from '../schemas/car.js'; // Your Mongoose Car schema
import {authAnyRoleMiddlewareGraphQL, authModMiddlewareGraphQL, authUserMiddlewareGraphQL} from '../middleware/auth.js';
import {redisClient} from '../modules/redisClient.js';
import axios from 'axios';
import FormData from 'form-data';
import {User} from "../schemas/user.js";
import {Usercar} from "../schemas/usercar.js";

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

const applyMiddleware = (middleware, resolver) => {
    return middleware(resolver);
};

// Define resolvers
export const resolvers = {
    Query: {
        cars: async () => {
            const key = '__express__/cars';
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                console.log('Fetched from cache');
                return JSON.parse(cachedData);
            }

            const cars = await Car.find();
            await redisClient.set(key, JSON.stringify(cars), {
                EX: 10,
                NX: true
            });
            return cars;
        },
        car: async (_, { _id }) => {
            return await Car.findById(_id);
        },
        user: applyMiddleware(authAnyRoleMiddlewareGraphQL, async (root, args, context, info) => {
            return context['user'];
        })
    },
    Mutation: {
        createCar: applyMiddleware(authModMiddlewareGraphQL, async (_, { name, description, tariff, image }) => {
                const upload = await image;
                const { file } = upload;

                const { createReadStream, filename, mimetype, encoding } = file;

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
        updateCar: applyMiddleware(authModMiddlewareGraphQL, async (_, { _id, name, description, tariff }) => {
            return await Car.findByIdAndUpdate(_id, {name, description, tariff}, {new: true});
        }),
        deleteCar: applyMiddleware(authModMiddlewareGraphQL, async (_, { _id }) => {
            await Car.findByIdAndDelete(_id);
            return 'Car deleted';
        }),
        rent: applyMiddleware(authUserMiddlewareGraphQL, async (_, { carId }, context) => {
            const car = await Car.findOne({ _id: carId });
            const user = await User.findOne({_id: context['user']['_id']});

            if (car.enabled == false) {
                throw new Error('Auto is taken');
            }

            if (user.balance < car.tariff)
                throw new Error('Auto is too expensive');
            // for one day
            user.balance -= car.tariff;
            await user.save();

            car.enabled = false;
            await car.save();

            const newusercar = new Usercar({
                userId: context['user']['_id'],
                carId: car._id
            });
            await newusercar.save();

            return 'The entry created successfully';
        })
    },
};

export default {typeDefs, resolvers};