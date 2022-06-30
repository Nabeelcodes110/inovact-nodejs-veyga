function cleanUserdoc(userDoc) {
  const temp = new Date(userDoc.graduation_year);

  if (!Number.isNaN(temp)) userDoc.graduation_year = temp.getFullYear();

  const connection_status = userDoc.connections.length ? userDoc.connections[0].status : 'not connected';

  return {
    ...userDoc,
    user_interests: userDoc.user_interests.map((user_interest) => {
      return {
        id: user_interest.area_of_interest.id,
        interest: user_interest.area_of_interest.interest,
      };
    }),
    connection_status,
  };
}

module.exports = cleanUserdoc;
