import asyncHandler from "express-async-handler";
import TestimonialModel from "../../models/testimonials.model.js";
import responseHandle from "../../utils/handleResponse.js";

const testimonial = {};

testimonial.create = asyncHandler(async (req, res) => {
  const { user_id, name, title, content } = req.body;
  try {
    const contentTaken = await TestimonialModel.findOne({ content: content });
    if (contentTaken) {
      res.status(400);
      throw new Error("already created");
    }

    if (!user_id) {
      res.status(400);
      throw new Error("No user Id provided");
    }

    if (!name) {
      res.status(400);
      throw new Error("No name provided");
    }

    if (!content) {
      res.status(400);
      throw new Error("No content provided");
    }

    const newTestimony = await TestimonialModel.create({
      user_id: user_id,
      name: name,
      title: title,
      content: content,
    });

    if (!newTestimony) {
      res.status(500);
      throw new Error("could not create user");
    }

    responseHandle.successResponse(
      res,
      201,
      "testimony created successfully.",
      newTestimony
    );
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

export default testimonial;
