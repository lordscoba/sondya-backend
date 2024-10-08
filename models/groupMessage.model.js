import { Schema, model } from "mongoose";

const groupMessageSchema = Schema(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    group_id: {
      type: Schema.Types.ObjectId,
      ref: "groupChats",
    },
    message: {
      type: String,
    },
    type: {
      type: String,
      default: "text",
    },
    file_extension: {
      type: String,
    },
    file_size: {
      type: Number,
    },
    file_name: {
      type: String,
    },
    image: [
      {
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
        folder: {
          type: String,
        },
      },
    ],
    file: [
      {
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
        folder: {
          type: String,
        },
        filename: {
          type: String,
        },
        format: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const GroupMessage = model("groupMessage", groupMessageSchema);
export default GroupMessage;
