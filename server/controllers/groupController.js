const Group = require("../models/groupModel");
const Messages = require("../models/messageModel");

// Create a new group
module.exports.createGroup = async (req, res, next) => {
  try {
    const { name, users } = req.body;
    const newGroup = await Group.create({ name, users });

    if (newGroup) return res.json({ msg: "Group created successfully.", group: newGroup });
    else return res.json({ msg: "Failed to create group." });
  } catch (ex) {
    next(ex);
  }
};

// Get messages for a specific group
module.exports.getGroupMessages = async (req, res, next) => {
  try {
    const { groupId,from } = req.body;

    const group = await Group.findById(groupId).populate("messages");
  
    if (group) {
      const projectedMessages = group.messages.map((msg) => {
        return {
          fromSelf: msg.sender.toString() === from,
          from: msg.users[0].toString(),
          message: msg.message.text,
        };
      });
      return res.json(projectedMessages);
    } else {
      return res.json({ msg: "Group not found." });
    }
  } catch (ex) {
    next(ex);
  }
};

// Add a message to a group
module.exports.addGroupMessage = async (req, res, next) => {
  try {
    const { groupId, from, message } = req.body;
    const newMessage = await Messages.create({
      message: { text: message },
      users: [from],
      sender: from,
    });

    if (newMessage) {
      const group = await Group.findById(groupId);
      if (group) {
        group.messages.push(newMessage._id);
        await group.save();
        return res.json({ msg: "Message added to the group." });
      } else {
        return res.json({ msg: "Group not found." });
      }
    } else {
      return res.json({ msg: "Failed to add message." });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.find();
    return res.json(groups);
  } catch (ex) {
    next(ex);
  }
}