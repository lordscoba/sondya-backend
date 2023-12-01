import GroupMessageModel from "../models/groupMessage.model.js";
import GroupChatModel from "../models/groupchat.model.js";
import asyncHandler from "express-async-handler";
import UserModel from "../models/users.model.js";
import handleUpload from "./upload.js";

const wsUtil = {};

wsUtil.heartbeat = (ws) => {
  ws["isAlive"] = true;
};

wsUtil.rooms = {};

wsUtil.paramsExist = (data) => {
  try {
    if ("room_id" in data && "user_id" in data && "message" in data) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

wsUtil.roomExist = (room_id) => {
  // check for room is already exist or not
  if (room_id in wsUtil.rooms) {
    return true;
  } else {
    return false;
  }
};

wsUtil.userExistInRoom = (room_id, user_id) => {
  let status = false;
  const room = wsUtil.rooms[room_id];
  for (let i = 0; i < room.length; i++) {
    let user = room[i];
    for (const key in user) {
      if (user_id === key) {
        status = true;
        break;
      }
    }
  }
  return status;
};

// create room
wsUtil.createRoom = (data, ws) => {
  try {
    let { room_id, user_id } = data;
    wsUtil.rooms[room_id] = [];
    const user = {};
    user[user_id] = ws;

    wsUtil.rooms[room_id].push(user);
    ws["room_id"] = room_id;
    ws["user_id"] = user_id;
    return ws;
  } catch (error) {
    throw new Error("ws error: Could not create room");
  }
};

// get list of people in room
wsUtil.getOnlineUsers = (data, ws) => {
  try {
    const room = wsUtil.rooms[data?.room_id];
    if (!room) return [];

    const online = room.map((user) => Object.keys(user)[0]);
    ws.send(
      JSON.stringify({
        meta: "users_online",
        online,
      })
    );
  } catch (error) {
    console.log(error);
    throw new Error("ws error: Could not get users in room");
  }
};

// join room
wsUtil.joinRoom = (data, ws) => {
  try {
    var { room_id, user_id } = data;
    // check if room exist or not
    const roomExist = wsUtil.roomExist(room_id);
    if (!roomExist) {
      return wsUtil.createRoom(data, ws);
    }

    const inRoom = wsUtil.userExistInRoom(room_id, user_id);
    if (inRoom) {
      return;
    } else {
      const user = {};
      user[user_id] = ws;
      wsUtil.rooms[room_id].push(user);

      ws["room_id"] = room_id;
      ws["user_id"] = user_id;
      return ws;
    }
  } catch (error) {
    throw new Error("ws error: Could not join room");
  }
};

// send message
wsUtil.sendMessage = asyncHandler(async (data, ws) => {
  const { room_id, message, images, user_id } = data;
  try {
    const check = await GroupChatModel.findById(room_id);
    if (!check) {
      throw new Error("Id not found");
    }

    const userFromDb = await UserModel.findById(user_id);
    if (!userFromDb) {
      throw new Error("User not found");
    }

    if (!message && !images.length) {
      throw new Error("No message");
    }

    let imageUrl = [];
    if (images?.length > 0) {
      imageUrl = await wsUtil.uploadImages(images);
    }

    let groupMessage = await GroupMessageModel.create({
      group_id: room_id,
      message,
      sender_id: user_id,
      image: imageUrl,
    });

    if (!groupMessage) {
      throw new Error("could not send message");
    }

    wsUtil.joinRoom(data, ws);
    const room = wsUtil.rooms[room_id];
    for (let i = 0; i < room.length; i++) {
      let user = room[i];
      for (let key in user) {
        let wsClient = user[key];
        wsClient.send(
          JSON.stringify({
            ...groupMessage._doc,
            sender: userFromDb,
            likes: [],
          })
        );
      }
    }
  } catch (error) {
    console.log(error);
    ws.send(
      JSON.stringify({
        meta: "error_occured",
        error: error.message,
      })
    );
  }
});

// image upload
wsUtil.uploadImages = async (images) => {
  try {
    // upload images to cloudinary
    let multiplePicturePromise = images.map(async (image, index) => {
      const cldRes = await handleUpload(image.fileContent, index);
      return cldRes;
    });

    // get url of uploaded images
    const imageResponse = await Promise.all(multiplePicturePromise);
    const imageUrl = imageResponse.map((image) => {
      const url = image.secure_url;
      const public_id = image.public_id;
      const folder = image.folder;
      return { url, public_id, folder };
    });
    // end of uploaded images

    return imageUrl;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

wsUtil.leaveRoom = (data) => {
  try {
    const { room_id, user_id } = data;
    const roomExist = wsUtil.roomExist(room_id);
    if (!roomExist) return;

    // find the index of user
    const room = wsUtil.rooms[room_id];
    let index = null;
    for (let i = 0; i < room.length; i++) {
      let user = room[i];
      for (let key in user) {
        if (key === user_id) {
          index = i;
        }
      }
    }
    if (index != null) {
      // remove the user using the index
      wsUtil.rooms[room_id].splice(index, 1);
      console.log(wsUtil.rooms[room_id].length);
    }
  } catch (error) {
    throw new Error("ws error: could not leave room");
  }
};

export default wsUtil;