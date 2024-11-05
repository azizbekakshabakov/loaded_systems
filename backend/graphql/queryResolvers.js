import {redisClient} from "../modules/redisClient.js";
import {Car} from "../schemas/car.js";
import {authAnyRoleMiddlewareGraphQL} from "../middleware/auth.js";
import applyMiddleware from "./applyMiddlewareFunction.js";

const queryResolvers = {
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
};

export { queryResolvers };