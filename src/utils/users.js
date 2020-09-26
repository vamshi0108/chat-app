const users = [];

const addUser = ({ id, userName, room }) => {
  userName = userName.trim().charAt(0).toUpperCase() + userName.trim().slice(1).toLowerCase();
  room = room.trim().toUpperCase();
  if (!userName || !room)
    return {
      error: "username or room required!",
    };
  //.find is better than filter here
  const isExistingUser = users.find((user) => user.userName === userName && user.room === room);

  if (isExistingUser)
    return {
      error: "username is in use",
    };

  const user = { id, userName, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id == id);
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id == id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = { addUser, getUser, removeUser, getUsersInRoom };
