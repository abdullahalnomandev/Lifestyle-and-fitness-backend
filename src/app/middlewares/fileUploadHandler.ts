// import { Request, Response, NextFunction } from 'express';
// import fs from 'fs';
// import path from 'path';
// import multer, { FileFilterCallback } from 'multer';
// import AWS from 'aws-sdk';
// import { StatusCodes } from 'http-status-codes';
// import ApiError from '../../errors/ApiError';
// import config from '../../config';

// // Configure AWS S3
// const s3 = new AWS.S3({
//   accessKeyId: config.aws.access_key_id,
//   secretAccessKey: config.aws.secret_access_key,
//   region: config.aws.region,
// });

// // Upload file to S3 and remove local copy
// const uploadFileToS3 = async (filePath: string, key: string, mimeType: string) => {
//   const fileStream = fs.createReadStream(filePath);
//   const params = {
//     Bucket: config.aws.s3_bucket,
//     Key: key,
//     Body: fileStream,
//     ContentType: mimeType
//   };
//   const result = await s3.upload(params as any).promise();

//   // Delete local file
//   if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//   return result.Location;
// };

// // Main middleware factory
// const fileUploadHandler = () => {
//   // Multer storage
//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       const baseUploadDir = path.join(process.cwd(), 'uploads');
//       if (!fs.existsSync(baseUploadDir)) fs.mkdirSync(baseUploadDir);

//       let folder = '';
//       switch (file.fieldname) {
//         case 'image':
//         case 'cover_image':
//           folder = path.join(baseUploadDir, file.fieldname);
//           break;
//         case 'media':
//           folder = path.join(baseUploadDir, 'media');
//           break;
//         case 'doc':
//           folder = path.join(baseUploadDir, 'doc');
//           break;
//         default:
//           return cb(new ApiError(StatusCodes.BAD_REQUEST, 'File type not supported'), '');
//       }

//       if (!fs.existsSync(folder)) fs.mkdirSync(folder);
//       cb(null, folder);
//     },
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const name = file.originalname.replace(ext, '').toLowerCase().split(' ').join('-');
//       cb(null, `${name}-${Date.now()}${ext}`);
//     },
//   });

//   // File filter
//   const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//     if (['image', 'cover_image'].includes(file.fieldname)) {
//       if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) cb(null, true);
//       else cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only jpeg, jpg, png allowed'));
//     } else if (file.fieldname === 'media') {
//       if (['video/mp4', 'audio/mpeg'].includes(file.mimetype)) cb(null, true);
//       else cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only mp4, mp3 allowed'));
//     } else if (file.fieldname === 'doc') {
//       if (file.mimetype === 'application/pdf') cb(null, true);
//       else cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf allowed'));
//     } else {
//       cb(new ApiError(StatusCodes.BAD_REQUEST, 'Unsupported file type'));
//     }
//   };

//   const upload = multer({ storage, fileFilter }).fields([
//     { name: 'image', maxCount: 3 },
//     { name: 'cover_image', maxCount: 3 },
//     { name: 'media', maxCount: 3 },
//     { name: 'doc', maxCount: 3 },
//   ]);

//   // Return the actual middleware function
//   return async (req: Request, res: Response, next: NextFunction) => {
//     upload(req, res, async (err: any) => {
//       if (err) return next(err);

//       try {
//         if (!req.files) return next();

//         const uploadedFiles: Record<string, string[]> = {};

//         // @ts-ignore
//         for (const field in req.files) {
//           uploadedFiles[field] = [];
//           // @ts-ignore
//           for (const file of req.files[field]) {
//             const key = `${field}/${file.filename}`;
//             const url = await uploadFileToS3(file.path, key, file.mimetype);
//             uploadedFiles[field].push(url);
//           }
//         }
//         console.log({uploadedFiles});

//         req.body.uploadedFiles = uploadedFiles;
//         next();
//       } catch (error) {
//         next(error);
//       }
//     });
//   };
// };

// export default fileUploadHandler;


import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'cover_image':
          uploadDir = path.join(baseUploadDir, 'cover_image');
          break;
        case 'media':
          uploadDir = path.join(baseUploadDir, 'media');
          break;
        case 'doc':
          uploadDir = path.join(baseUploadDir, 'doc');
          break;
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
        console.log(fileName,fileExt);
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (file.fieldname === 'image' || file.fieldname === 'cover_image') {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg'  ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'image/gif'  ||
        file.mimetype === 'image/bmp' 
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            '  Only webp, gif, bmp, .jpeg, .png, .jpg file supported'
          )
        );
      }
    } else if (file.fieldname === 'media') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported'
          )
        );
      }
    } else if (file.fieldname === 'doc') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf supported'));
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported'));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
  }).fields([
    { name: 'image', maxCount: 3 },
    { name: 'cover_image', maxCount: 3 },
    { name: 'media', maxCount: 3 },
    { name: 'doc', maxCount: 3 },
  ]);
  return upload;
};

export default fileUploadHandler;
