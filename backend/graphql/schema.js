import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLFloat } from 'graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { Car } from '../schemas/car.js'; // Ensure the correct file extension
import { redisClient } from '../modules/redisClient.js'; // Ensure the correct file extension
import multer from 'multer'; // If you're using multer for file uploads
import path from 'path';
import fs from 'fs';

// ДЛЯ ЗАГРУЗКИ ФАЙЛА/КАРТИНОК
const uploadImage = async (upload) => {
    const { createReadStream, filename, mimetype } = await upload;
    const stream = createReadStream();
    const { ext } = path.parse(filename);
    const filePath = `uploads/${Date.now()}${ext}`;

    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);
        writeStream.on('finish', () => resolve({ filePath }));
        writeStream.on('error', reject);
    });
};

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
                let imagePath = null;

                // Handle the file upload if the image is provided
                if (args.image) {
                    const { filePath } = await uploadImage(args.image);
                    imagePath = filePath;
                }
                console.log('imagePath', imagePath);////////////////////////////////////////////////////

                // Create a new car document
                // const newCar = new Car({
                //     name: args.name,
                //     description: args.description,
                //     image: imagePath, // Store the image path in the database
                //     tariff: args.tariff
                // });
                // return await newCar.save();
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

export default new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
