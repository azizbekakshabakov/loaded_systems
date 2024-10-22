import { Router } from 'express'; // Import Router as router
import multer from 'multer';

// СОЗДАТЬ ЭКЗЕМПЛЯР Router
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/add-image', upload.single('image'), async (req, res) => {
  try {
      const image = req.file ? req.file.path : null;

      res.status(201).json({ message: 'Картинка добавлена', image: image });
  } catch (error) {
      console.log('Кярьтинькя ни дабавлина');
      res.status(404).json({ message: 'Картинка ни дабавлина', error });
  }
});

// router.delete("/:id", authModMiddleware, async (req, res) => {
//     await Car.findByIdAndDelete(req.params.id);
//     res.status(200).send({ message: "Задача удалена" });
// });

export default router;