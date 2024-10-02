const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLFloat } = require('graphql');
const { Car } = require('../schemas/car');
const { redisClient } = require('../modules/redisClient');
const multer = require('multer');

// Define the CarType
const CarType = new GraphQLObjectType({
    name: 'Car',
    fields: {
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        image: { type: GraphQLString },
        tariff: { type: GraphQLFloat }
    }
});

// Queries
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        cars: {
            type: new GraphQLList(CarType),
            async resolve(parent, args) {
                let key = '__express__all_cars';
                let cachedData = await redisClient.get(key);
                if (cachedData) {
                    console.log('Returning from cache');
                    return JSON.parse(cachedData).data;
                } else {
                    const cars = await Car.find();
                    await redisClient.set(key, JSON.stringify({ data: cars }), 'EX', 3600);
                    return cars;
                }
            }
        },
        car: {
            type: CarType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                return await Car.findById(args.id);
            }
        }
    }
});

// Mutations
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createCar: {
            type: CarType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                tariff: { type: new GraphQLNonNull(GraphQLFloat) },
                image: { type: GraphQLUpload }
            },
            async resolve(parent, args) {
                const newCar = new Car({
                    name: args.name,
                    description: args.description,
                    image: args.image,
                    tariff: args.tariff
                });
                return await newCar.save();
            }
        },
        updateCar: {
            type: CarType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                tariff: { type: GraphQLFloat },
                image: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const updatedCar = await Car.findByIdAndUpdate(args.id, {
                    name: args.name,
                    description: args.description,
                    tariff: args.tariff,
                    image: args.image
                }, { new: true });
                return updatedCar;
            }
        },
        deleteCar: {
            type: CarType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parent, args) {
                return await Car.findByIdAndDelete(args.id);
            }
        }
    }
});

// Export the schema
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
