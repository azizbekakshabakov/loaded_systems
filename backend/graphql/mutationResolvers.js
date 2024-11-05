import {authModMiddlewareGraphQL, authUserMiddlewareGraphQL} from "../middleware/auth.js";
import FormData from "form-data";
import axios from "axios";
import {Car} from "../schemas/car.js";
import {User} from "../schemas/user.js";
import {Usercar} from "../schemas/usercar.js";
import applyMiddleware from "./applyMiddlewareFunction.js";

const mutationResolvers = {
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
            const imageServiceHost = process.env.IMAGE_SERVICE || 'localhost';
            const result = await axios.post(`http://${imageServiceHost}:3001/add-image`, formData, {
                headers: formData.getHeaders(),
            });
            const imageUrl = result.data.image;
            //rabbitmq

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
};

export {mutationResolvers};