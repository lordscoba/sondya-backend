import asyncHandler from "express-async-handler";
import ServiceModel from "../../models/services.model.js";
import { processInput } from "../../utils/checkIfJsonOrString.js";
import { deleteUploads } from "../../utils/deleteupload.js";
import responseHandle from "../../utils/handleResponse.js";
import handleUpload from "../../utils/upload.js";

const SellerServices = {};

SellerServices.create = asyncHandler(async (req, res) => {
  // #swagger.tags = ['Seller Services']
  const {
    name,
    owner,
    // category,
    sub_category,
    brief_description,
    description,
    tags,
    service_status,
    currency,
    old_price,
    current_price,
    percentage_price_off,
    duration,

    location_description,
    phone_number,
    phone_number_backup,
    email,
    website_link,
    country,
    state,
    city,
    map_location_link,
  } = req.body;

  try {
    // start of upload images
    let imageUrl;

    if (req.files) {
      // upload images to cloudinary
      let files = req?.files;
      let multiplePicturePromise = files.map(async (picture, index) => {
        // eslint-disable-next-line no-undef
        const b64 = Buffer.from(picture.buffer).toString("base64");
        let dataURI = "data:" + picture.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI, index);
        return cldRes;
      });

      // get url of uploaded images
      const imageResponse = await Promise.all(multiplePicturePromise);

      imageUrl = imageResponse.map((image) => {
        const url = image.secure_url;
        const public_id = image.public_id;
        const folder = image.folder;
        return { url, public_id, folder };
      });
    }
    // end of uploaded images

    const newService = await ServiceModel.create({
      name: name,
      owner: processInput(owner),
      category: "service",
      sub_category: sub_category,
      brief_description: brief_description,
      description: description,
      tag: tags,
      service_status: service_status,
      currency: currency,
      old_price: old_price,
      current_price: current_price,
      percentage_price_off: percentage_price_off,
      duration: duration,

      location_description: location_description,
      phone_number: phone_number,
      phone_number_backup: phone_number_backup,
      email: email,
      website_link: website_link,
      country: country,
      state: state,
      city: city,
      map_location_link: map_location_link,
      image: imageUrl,
    });

    if (!newService) {
      res.status(500);
      throw new Error("could not create new services");
    }

    responseHandle.successResponse(
      res,
      201,
      "services created successfully.",
      newService
    );
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

SellerServices.update = asyncHandler(async (req, res) => {
  // #swagger.tags = ['Seller Services']
  const check = await ServiceModel.findById(req.params.id);

  const {
    name,
    // category,
    sub_category,
    brief_description,
    description,
    tags,
    service_status,
    currency,
    old_price,
    current_price,
    percentage_price_off,
    duration,

    location_description,
    phone_number,
    phone_number_backup,
    email,
    website_link,
    country,
    state,
    city,
    map_location_link,
    deleteImageId,
  } = req.body;

  try {
    if (!check) {
      res.status(404);
      throw new Error("Id not found");
    }

    // start of upload images
    let imageUrl = [];

    if (req.files) {
      // upload images to cloudinary
      let files = req?.files;
      let multiplePicturePromise = files.map(async (picture, index) => {
        // eslint-disable-next-line no-undef
        const b64 = Buffer.from(picture.buffer).toString("base64");
        let dataURI = "data:" + picture.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI, index);
        return cldRes;
      });

      // get url of uploaded images
      const imageResponse = await Promise.all(multiplePicturePromise);

      imageUrl = imageResponse.map((image) => {
        const url = image.secure_url;
        const public_id = image.public_id;
        const folder = image.folder;
        return { url, public_id, folder };
      });
    }
    // end of uploaded images

    //delete initialy uploaded images
    let deleteImageId1 = JSON.parse(deleteImageId);
    if (deleteImageId1 !== undefined && deleteImageId1.length > 0) {
      deleteUploads(deleteImageId1);
      deleteImageId1.forEach((id) => check.image.splice(id, 1));
    }

    imageUrl = [...imageUrl, ...check.image];
    //delete initialy uploaded images ends

    const updatedServices = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      {
        name: name,

        category: "service",
        sub_category: sub_category,
        brief_description: brief_description,
        description: description,
        tag: tags,
        service_status: service_status,
        currency: currency,
        old_price: old_price,
        current_price: current_price,
        percentage_price_off: percentage_price_off,
        duration: duration,

        location_description: location_description,
        phone_number: phone_number,
        phone_number_backup: phone_number_backup,
        email: email,
        website_link: website_link,
        country: country,
        state: state,
        city: city,
        map_location_link: map_location_link,
        image: imageUrl.length > 0 ? imageUrl : [],
      },
      {
        new: true,
      }
    );

    if (!updatedServices) {
      res.status(500);
      throw new Error("could not update services");
    } else {
      responseHandle.successResponse(
        res,
        200,
        "services updated successfully.",
        updatedServices
      );
    }
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

SellerServices.delete = asyncHandler(async (req, res) => {
  // #swagger.tags = ['Seller Services']
  const check = await ServiceModel.findById(req.params.id);

  try {
    if (!check) {
      res.status(404);
      throw new Error("Id not found");
    }
    const deleteServices = await ServiceModel.findByIdAndDelete(req.params.id);

    // delete previously uploaded images from cloudinary
    const initialImageArray = [];
    check.image.forEach((image) => {
      initialImageArray.push(image.public_id);
    });
    deleteUploads(initialImageArray);

    if (!deleteServices) {
      res.status(500);
      throw new Error("could not delete services");
    } else {
      responseHandle.successResponse(
        res,
        200,
        "services deleted successfully.",
        "services deleted"
      );
    }
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

SellerServices.getById = asyncHandler(async (req, res) => {
  // #swagger.tags = ['Seller Services']
  const serviceDetails = await ServiceModel.findById(req.params.id);

  try {
    if (!serviceDetails) {
      res.status(404);
      throw new Error("Id not found");
    } else {
      responseHandle.successResponse(
        res,
        200,
        "service details found successfully.",
        serviceDetails
      );
    }
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

SellerServices.getAll = asyncHandler(async (req, res) => {
  // #swagger.tags = ['Seller Services']
  const searchRegex = new RegExp(req.query.search, "i");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const getall = await ServiceModel.find({
    "owner.id": req.params.userId,
    $or: [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { sub_category: { $regex: searchRegex } },
      { tag: { $regex: searchRegex } },
      { brand: { $regex: searchRegex } },
      { model: { $regex: searchRegex } },
    ],
  })
    .skip((page - 1) * limit)
    .limit(limit);

  const count = await ServiceModel.countDocuments({
    "owner.id": req.params.userId,
    $or: [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { sub_category: { $regex: searchRegex } },
      { tag: { $regex: searchRegex } },
      { brand: { $regex: searchRegex } },
      { model: { $regex: searchRegex } },
    ],
  });

  try {
    if (!getall) {
      res.status(404);
      throw new Error("Id not found");
    } else {
      responseHandle.successResponse(res, 200, "services found successfully.", {
        services: getall,
        count,
      });
    }
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

export default SellerServices;
